"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import { DEFAULT_SUPPLY_HEX } from "@/lib/constants";
import { naturalSortByCode } from "@/lib/utils/natural-sort";
import {
  threadSchema,
  beadSchema,
  specialtyItemSchema,
  supplyBrandSchema,
  projectThreadSchema,
  projectBeadSchema,
  projectSpecialtySchema,
  updateQuantitySchema,
  createAndAddThreadSchema,
  createAndAddBeadSchema,
  createAndAddSpecialtySchema,
} from "@/lib/validations/supply";
import type {
  BeadInput,
  CreateAndAddBeadInput,
  CreateAndAddSpecialtyInput,
  CreateAndAddThreadInput,
  ProjectBeadInput,
  ProjectSpecialtyInput,
  ProjectThreadInput,
  SpecialtyItemInput,
  SupplyBrandInput,
  ThreadInput,
  UpdateQuantityInput,
} from "@/lib/validations/supply";
import { firstValidationMessage, isDuplicateKeyError } from "@/lib/utils/action-errors";
import type { SkeinLine } from "@/types/supply";

/**
 * Resolve a brandId for inline supply creation. When the client sends
 * "default" (no brand picker in the dialog), upsert a "Custom" brand
 * of the appropriate supply type so there is always a valid FK target.
 */
async function resolveDefaultBrandId(
  brandId: string,
  supplyType: "THREAD" | "BEAD" | "SPECIALTY",
  db: Prisma.TransactionClient = prisma,
): Promise<string> {
  if (brandId !== "default") return brandId;

  // Use distinct brand names per supply type so each type gets its own
  // "Custom" brand record with the correct supplyType field.
  const brandName = `Custom (${supplyType.charAt(0) + supplyType.slice(1).toLowerCase()})`;
  const brand = await db.supplyBrand.upsert({
    where: { name: brandName },
    create: { name: brandName, supplyType },
    update: {},
  });
  return brand.id;
}

const THREAD_LINE_FIELDS = {
  id: true,
  skeinLengthMm: true,
  strandStructure: true,
  cutLengthInches: true,
} as const;

type ResolvedThreadLine =
  | { line: Prisma.ThreadLineGetPayload<{ select: typeof THREAD_LINE_FIELDS }> }
  | { refusal: string };

/**
 * The line a new or re-branded thread is filed on. A brand's only line is the answer; a brand
 * with none gets its one blank line, length, strand structure and cut unknown. A brand with several
 * (Kreinik) is refused, never guessed: which line a thread belongs to changes its skein count,
 * and no form can ask yet.
 */
async function resolveThreadLine(
  tx: Prisma.TransactionClient,
  brandId: string,
): Promise<ResolvedThreadLine> {
  const lines = await tx.threadLine.findMany({
    where: { brandId },
    select: { ...THREAD_LINE_FIELDS, brand: { select: { name: true } } },
    take: 2,
  });
  if (lines.length > 1) {
    return {
      refusal: `${lines[0].brand.name} has several thread lines, and picking one arrives with the brand form — this thread can't be added yet.`,
    };
  }
  if (lines.length === 1) {
    const { brand: _brand, ...line } = lines[0];
    return { line };
  }
  // An upsert on the blank-name key, so two threads filed at once on a brand with no line meet
  // on one line instead of the second failing on the unique index.
  const line = await tx.threadLine.upsert({
    where: { brandId_name: { brandId, name: "" } },
    create: {
      brandId,
      name: "",
      skeinLengthMm: null,
      strandStructure: null,
      cutLengthInches: null,
    },
    update: {},
    select: THREAD_LINE_FIELDS,
  });
  return { line };
}

const sameSkeinLine = (a: SkeinLine, b: SkeinLine) =>
  a.skeinLengthMm === b.skeinLengthMm &&
  a.strandStructure === b.strandStructure &&
  a.cutLengthInches === b.cutLengthInches;

export async function createThread(formData: ThreadInput) {
  await requireAuth();

  try {
    const validated = threadSchema.parse(formData);
    const created = await prisma.$transaction(async (tx) => {
      const brandId = await resolveDefaultBrandId(validated.brandId, "THREAD", tx);
      const resolved = await resolveThreadLine(tx, brandId);
      if ("refusal" in resolved) return resolved;
      const thread = await tx.thread.create({
        data: { ...validated, brandId, lineId: resolved.line.id },
      });
      return { thread: { ...thread, line: resolved.line } };
    });
    if ("refusal" in created) return { success: false as const, error: created.refusal };
    revalidatePath("/supplies");
    revalidateTag("stats", { expire: 0 });
    return { success: true as const, thread: created.thread };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false as const, error: firstValidationMessage(error) };
    }
    if (isDuplicateKeyError(error)) {
      return {
        success: false as const,
        error: "A thread with that code already exists for this brand",
      };
    }
    console.error("createThread error:", error);
    return { success: false as const, error: "Failed to create thread" };
  }
}

export async function updateThread(id: string, formData: ThreadInput) {
  await requireAuth();

  try {
    const validated = threadSchema.parse(formData);
    const updated = await prisma.$transaction(async (tx) => {
      const current = await tx.thread.findUnique({
        where: { id },
        select: {
          brandId: true,
          line: { select: { skeinLengthMm: true, strandStructure: true, cutLengthInches: true } },
        },
      });
      // A line belongs to one brand, so a thread changing brand must change line with it
      if (current && current.brandId !== validated.brandId) {
        const resolved = await resolveThreadLine(tx, validated.brandId);
        if ("refusal" in resolved) return resolved;
        const thread = await tx.thread.update({
          where: { id },
          data: { ...validated, lineId: resolved.line.id },
        });
        // A calculated need was worked out from the old line's length, structure and cut, so on a line
        // that differs the calculator can no longer stand behind it: it becomes unknown, and
        // re-entering the stitch count works it out from the new line. A need typed by hand, or
        // one with no stitch count behind it, was never the calculator's and stays.
        if (!sameSkeinLine(current.line, resolved.line)) {
          await tx.projectThread.updateMany({
            where: { threadId: id, stitchCount: { gt: 0 }, isNeedOverridden: false },
            data: { quantityRequired: null },
          });
          return { thread, needsChanged: true };
        }
        return { thread, needsChanged: false };
      }
      const thread = await tx.thread.update({ where: { id }, data: validated });
      return { thread, needsChanged: false };
    });
    if ("refusal" in updated) return { success: false as const, error: updated.refusal };
    revalidatePath("/supplies");
    if (updated.needsChanged) {
      // The needs that just became unknown show on project pages and the shopping list
      revalidatePath("/charts");
      revalidatePath("/shopping");
    }
    revalidateTag("stats", { expire: 0 });
    return { success: true as const, thread: updated.thread };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false as const, error: firstValidationMessage(error) };
    }
    if (isDuplicateKeyError(error)) {
      return {
        success: false as const,
        error: "A thread with that code already exists for this brand",
      };
    }
    console.error("updateThread error:", error);
    return { success: false as const, error: "Failed to update thread" };
  }
}

export async function deleteThread(id: string) {
  await requireAuth();

  try {
    await prisma.thread.delete({ where: { id } });
    revalidatePath("/supplies");
    revalidateTag("stats", { expire: 0 });
    return { success: true as const };
  } catch (error) {
    console.error("deleteThread error:", error);
    return { success: false as const, error: "Failed to delete thread" };
  }
}

export async function getThreads(brandId?: string, colorFamily?: string, search?: string) {
  await requireAuth();

  const where: Record<string, unknown> = {};
  if (brandId) where.brandId = brandId;
  if (colorFamily) where.colorFamily = colorFamily;
  if (search) {
    where.OR = [
      { colorCode: { contains: search, mode: "insensitive" } },
      { colorName: { contains: search, mode: "insensitive" } },
    ];
  }

  const threads = await prisma.thread.findMany({
    where,
    include: { brand: true, line: true },
  });
  return threads.sort((a, b) => naturalSortByCode(a.colorCode, b.colorCode));
}

export async function createBead(formData: BeadInput) {
  await requireAuth();

  try {
    const validated = beadSchema.parse(formData);
    const resolvedBrandId = await resolveDefaultBrandId(validated.brandId, "BEAD");
    const bead = await prisma.bead.create({
      data: { ...validated, brandId: resolvedBrandId },
    });
    revalidatePath("/supplies");
    revalidateTag("stats", { expire: 0 });
    return { success: true as const, bead };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false as const, error: firstValidationMessage(error) };
    }
    if (isDuplicateKeyError(error)) {
      return {
        success: false as const,
        error: "A bead with that code already exists for this brand",
      };
    }
    console.error("createBead error:", error);
    return { success: false as const, error: "Failed to create bead" };
  }
}

export async function updateBead(id: string, formData: BeadInput) {
  await requireAuth();

  try {
    const validated = beadSchema.parse(formData);
    const bead = await prisma.bead.update({
      where: { id },
      data: validated,
    });
    revalidatePath("/supplies");
    revalidateTag("stats", { expire: 0 });
    return { success: true as const, bead };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false as const, error: firstValidationMessage(error) };
    }
    if (isDuplicateKeyError(error)) {
      return {
        success: false as const,
        error: "A bead with that code already exists for this brand",
      };
    }
    console.error("updateBead error:", error);
    return { success: false as const, error: "Failed to update bead" };
  }
}

export async function deleteBead(id: string) {
  await requireAuth();

  try {
    await prisma.bead.delete({ where: { id } });
    revalidatePath("/supplies");
    revalidateTag("stats", { expire: 0 });
    return { success: true as const };
  } catch (error) {
    console.error("deleteBead error:", error);
    return { success: false as const, error: "Failed to delete bead" };
  }
}

export async function getBeads(search?: string) {
  await requireAuth();

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { productCode: { contains: search, mode: "insensitive" } },
      { colorName: { contains: search, mode: "insensitive" } },
    ];
  }

  return prisma.bead.findMany({
    where,
    include: { brand: true },
    orderBy: { productCode: "asc" },
  });
}

export async function createSpecialtyItem(formData: SpecialtyItemInput) {
  await requireAuth();

  try {
    const validated = specialtyItemSchema.parse(formData);
    const resolvedBrandId = await resolveDefaultBrandId(validated.brandId, "SPECIALTY");
    const specialtyItem = await prisma.specialtyItem.create({
      data: { ...validated, brandId: resolvedBrandId },
    });
    revalidatePath("/supplies");
    revalidateTag("stats", { expire: 0 });
    return { success: true as const, specialtyItem };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false as const, error: firstValidationMessage(error) };
    }
    if (isDuplicateKeyError(error)) {
      return {
        success: false as const,
        error: "A specialty item with that code already exists for this brand",
      };
    }
    console.error("createSpecialtyItem error:", error);
    return {
      success: false as const,
      error: "Failed to create specialty item",
    };
  }
}

export async function updateSpecialtyItem(id: string, formData: SpecialtyItemInput) {
  await requireAuth();

  try {
    const validated = specialtyItemSchema.parse(formData);
    const specialtyItem = await prisma.specialtyItem.update({
      where: { id },
      data: validated,
    });
    revalidatePath("/supplies");
    revalidateTag("stats", { expire: 0 });
    return { success: true as const, specialtyItem };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false as const, error: firstValidationMessage(error) };
    }
    if (isDuplicateKeyError(error)) {
      return {
        success: false as const,
        error: "A specialty item with that code already exists for this brand",
      };
    }
    console.error("updateSpecialtyItem error:", error);
    return {
      success: false as const,
      error: "Failed to update specialty item",
    };
  }
}

export async function deleteSpecialtyItem(id: string) {
  await requireAuth();

  try {
    await prisma.specialtyItem.delete({ where: { id } });
    revalidatePath("/supplies");
    revalidateTag("stats", { expire: 0 });
    return { success: true as const };
  } catch (error) {
    console.error("deleteSpecialtyItem error:", error);
    return {
      success: false as const,
      error: "Failed to delete specialty item",
    };
  }
}

export async function getSpecialtyItems(search?: string) {
  await requireAuth();

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { productCode: { contains: search, mode: "insensitive" } },
      { colorName: { contains: search, mode: "insensitive" } },
    ];
  }

  return prisma.specialtyItem.findMany({
    where,
    include: { brand: true },
    orderBy: { productCode: "asc" },
  });
}

export async function createSupplyBrand(formData: SupplyBrandInput) {
  await requireAuth();

  try {
    const validated = supplyBrandSchema.parse(formData);
    const brand = await prisma.supplyBrand.create({
      data:
        validated.supplyType === "THREAD"
          ? {
              ...validated,
              threadLines: {
                create: { skeinLengthMm: null, strandStructure: null, cutLengthInches: null },
              },
            }
          : validated,
    });
    revalidatePath("/supplies");
    revalidatePath("/supplies/brands");
    revalidateTag("stats", { expire: 0 });
    return { success: true as const, brand };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false as const, error: firstValidationMessage(error) };
    }
    if (isDuplicateKeyError(error)) {
      return {
        success: false as const,
        error: "A brand with that name already exists",
      };
    }
    console.error("createSupplyBrand error:", error);
    return { success: false as const, error: "Failed to create brand" };
  }
}

export async function updateSupplyBrand(id: string, formData: SupplyBrandInput) {
  await requireAuth();

  try {
    const validated = supplyBrandSchema.parse(formData);
    const brand = await prisma.supplyBrand.update({
      where: { id },
      data: validated,
    });
    revalidatePath("/supplies");
    revalidatePath("/supplies/brands");
    revalidateTag("stats", { expire: 0 });
    return { success: true as const, brand };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false as const, error: firstValidationMessage(error) };
    }
    if (isDuplicateKeyError(error)) {
      return {
        success: false as const,
        error: "A brand with that name already exists",
      };
    }
    console.error("updateSupplyBrand error:", error);
    return { success: false as const, error: "Failed to update brand" };
  }
}

export async function deleteSupplyBrand(id: string) {
  await requireAuth();

  try {
    await prisma.supplyBrand.delete({ where: { id } });
    revalidatePath("/supplies");
    revalidatePath("/supplies/brands");
    revalidateTag("stats", { expire: 0 });
    return { success: true as const };
  } catch (error) {
    console.error("deleteSupplyBrand error:", error);
    return { success: false as const, error: "Failed to delete brand" };
  }
}

export async function getSupplyBrands() {
  await requireAuth();

  return prisma.supplyBrand.findMany({
    include: {
      _count: { select: { threads: true, beads: true, specialtyItems: true } },
    },
    orderBy: { name: "asc" },
  });
}

export async function addThreadToProject(formData: ProjectThreadInput) {
  const user = await requireAuth();

  try {
    const validated = projectThreadSchema.parse(formData);

    // Verify project ownership
    const project = await prisma.project.findUnique({
      where: { id: validated.projectId },
      select: { userId: true },
    });
    if (!project || project.userId !== user.id) {
      return { success: false as const, error: "Project not found" };
    }

    const record = await prisma.projectThread.create({ data: validated });
    revalidatePath("/charts");
    revalidatePath("/shopping");
    revalidateTag("stats", { expire: 0 });
    return { success: true as const, record };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false as const, error: firstValidationMessage(error) };
    }
    if (isDuplicateKeyError(error)) {
      return {
        success: false as const,
        error: "This thread is already linked to this project",
      };
    }
    console.error("addThreadToProject error:", error);
    return {
      success: false as const,
      error: "Failed to add thread to project",
    };
  }
}

export async function addBeadToProject(formData: ProjectBeadInput) {
  const user = await requireAuth();

  try {
    const validated = projectBeadSchema.parse(formData);

    // Verify project ownership
    const project = await prisma.project.findUnique({
      where: { id: validated.projectId },
      select: { userId: true },
    });
    if (!project || project.userId !== user.id) {
      return { success: false as const, error: "Project not found" };
    }

    const record = await prisma.projectBead.create({ data: validated });
    revalidatePath("/charts");
    revalidatePath("/shopping");
    revalidateTag("stats", { expire: 0 });
    return { success: true as const, record };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false as const, error: firstValidationMessage(error) };
    }
    if (isDuplicateKeyError(error)) {
      return {
        success: false as const,
        error: "This bead is already linked to this project",
      };
    }
    console.error("addBeadToProject error:", error);
    return {
      success: false as const,
      error: "Failed to add bead to project",
    };
  }
}

export async function addSpecialtyToProject(formData: ProjectSpecialtyInput) {
  const user = await requireAuth();

  try {
    const validated = projectSpecialtySchema.parse(formData);

    // Verify project ownership
    const project = await prisma.project.findUnique({
      where: { id: validated.projectId },
      select: { userId: true },
    });
    if (!project || project.userId !== user.id) {
      return { success: false as const, error: "Project not found" };
    }

    const record = await prisma.projectSpecialty.create({ data: validated });
    revalidatePath("/charts");
    revalidatePath("/shopping");
    revalidateTag("stats", { expire: 0 });
    return { success: true as const, record };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false as const, error: firstValidationMessage(error) };
    }
    if (isDuplicateKeyError(error)) {
      return {
        success: false as const,
        error: "This item is already linked to this project",
      };
    }
    console.error("addSpecialtyToProject error:", error);
    return {
      success: false as const,
      error: "Failed to add specialty item to project",
    };
  }
}

export async function updateProjectSupplyQuantity(
  id: string,
  type: "thread" | "bead" | "specialty",
  formData: UpdateQuantityInput,
) {
  const user = await requireAuth();

  try {
    // Each write below names its fields: a spread hides a thread-only field from the type check
    const { quantityRequired, quantityAcquired, stitchCount, isNeedOverridden } =
      updateQuantitySchema.parse(formData);

    // Verify ownership before updating
    if (type === "thread") {
      const record = await prisma.projectThread.findUnique({
        where: { id },
        select: { project: { select: { userId: true } } },
      });
      if (!record || record.project.userId !== user.id) {
        return { success: false as const, error: "Supply not found" };
      }
      await prisma.projectThread.update({
        where: { id },
        data: { quantityRequired, quantityAcquired, stitchCount, isNeedOverridden },
      });
    } else {
      // A bead or specialty item has no line to be unknown about: its need is always a number
      if (quantityRequired === null) {
        return {
          success: false as const,
          error: "Only a thread's need can be unknown — enter how many you need.",
        };
      }
      if (stitchCount !== undefined || isNeedOverridden !== undefined) {
        return {
          success: false as const,
          error: "Only a thread line has a stitch count or a typed need.",
        };
      }
      if (type === "bead") {
        const record = await prisma.projectBead.findUnique({
          where: { id },
          select: { project: { select: { userId: true } } },
        });
        if (!record || record.project.userId !== user.id) {
          return { success: false as const, error: "Supply not found" };
        }
        await prisma.projectBead.update({
          where: { id },
          data: { quantityRequired, quantityAcquired },
        });
      } else {
        const record = await prisma.projectSpecialty.findUnique({
          where: { id },
          select: { project: { select: { userId: true } } },
        });
        if (!record || record.project.userId !== user.id) {
          return { success: false as const, error: "Supply not found" };
        }
        await prisma.projectSpecialty.update({
          where: { id },
          data: { quantityRequired, quantityAcquired },
        });
      }
    }

    revalidatePath("/charts");
    revalidatePath("/shopping");
    revalidateTag("stats", { expire: 0 });
    return { success: true as const };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false as const, error: firstValidationMessage(error) };
    }
    console.error("updateProjectSupplyQuantity error:", error);
    return {
      success: false as const,
      error: "Failed to update supply quantity",
    };
  }
}

export async function removeProjectThread(id: string) {
  const user = await requireAuth();

  try {
    const record = await prisma.projectThread.findUnique({
      where: { id },
      select: { project: { select: { userId: true } } },
    });
    if (!record || record.project.userId !== user.id) {
      return { success: false as const, error: "Supply not found" };
    }

    await prisma.projectThread.delete({ where: { id } });
    revalidatePath("/charts");
    revalidatePath("/shopping");
    revalidateTag("stats", { expire: 0 });
    return { success: true as const };
  } catch (error) {
    console.error("removeProjectThread error:", error);
    return {
      success: false as const,
      error: "Failed to remove thread from project",
    };
  }
}

export async function removeProjectBead(id: string) {
  const user = await requireAuth();

  try {
    const record = await prisma.projectBead.findUnique({
      where: { id },
      select: { project: { select: { userId: true } } },
    });
    if (!record || record.project.userId !== user.id) {
      return { success: false as const, error: "Supply not found" };
    }

    await prisma.projectBead.delete({ where: { id } });
    revalidatePath("/charts");
    revalidatePath("/shopping");
    revalidateTag("stats", { expire: 0 });
    return { success: true as const };
  } catch (error) {
    console.error("removeProjectBead error:", error);
    return {
      success: false as const,
      error: "Failed to remove bead from project",
    };
  }
}

export async function removeProjectSpecialty(id: string) {
  const user = await requireAuth();

  try {
    const record = await prisma.projectSpecialty.findUnique({
      where: { id },
      select: { project: { select: { userId: true } } },
    });
    if (!record || record.project.userId !== user.id) {
      return { success: false as const, error: "Supply not found" };
    }

    await prisma.projectSpecialty.delete({ where: { id } });
    revalidatePath("/charts");
    revalidatePath("/shopping");
    revalidateTag("stats", { expire: 0 });
    return { success: true as const };
  } catch (error) {
    console.error("removeProjectSpecialty error:", error);
    return {
      success: false as const,
      error: "Failed to remove specialty item from project",
    };
  }
}

export async function getProjectSupplies(projectId: string) {
  const user = await requireAuth();

  // Verify project ownership
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { userId: true },
  });
  if (!project || project.userId !== user.id) {
    return { threads: [], beads: [], specialty: [] };
  }

  const [threads, beads, specialty] = await Promise.all([
    prisma.projectThread.findMany({
      where: { projectId },
      include: { thread: { include: { brand: true, line: true } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.projectBead.findMany({
      where: { projectId },
      include: { bead: { include: { brand: true } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.projectSpecialty.findMany({
      where: { projectId },
      include: { specialtyItem: { include: { brand: true } } },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  return { threads, beads, specialty };
}

export async function createAndAddThread(formData: CreateAndAddThreadInput) {
  const user = await requireAuth();

  try {
    const validated = createAndAddThreadSchema.parse(formData);

    // Verify project ownership
    const project = await prisma.project.findUnique({
      where: { id: validated.projectId },
      select: { userId: true },
    });
    if (!project || project.userId !== user.id) {
      return { success: false as const, error: "Project not found" };
    }

    const result = await prisma.$transaction(async (tx) => {
      const brandId = await resolveDefaultBrandId(validated.brandId, "THREAD", tx);
      const resolved = await resolveThreadLine(tx, brandId);
      if ("refusal" in resolved) return resolved;
      const thread = await tx.thread.create({
        data: {
          colorCode: validated.colorCode || "CUSTOM",
          colorName: validated.name,
          hexColor: validated.hexColor,
          brandId,
          lineId: resolved.line.id,
          colorFamily: validated.colorFamily,
        },
        include: { brand: true },
      });
      // No stitch count yet, so the need starts at 1 on every line, known or not
      const link = await tx.projectThread.create({
        data: {
          projectId: validated.projectId,
          threadId: thread.id,
          stitchCount: 0,
          quantityRequired: 1,
          quantityAcquired: 0,
        },
      });
      return { record: { thread: { ...thread, line: resolved.line }, link } };
    });
    if ("refusal" in result) return { success: false as const, error: result.refusal };

    revalidatePath("/charts");
    revalidatePath("/shopping");
    revalidateTag("stats", { expire: 0 });
    return { success: true as const, record: result.record };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false as const, error: firstValidationMessage(error) };
    }
    console.error("createAndAddThread error:", error);
    return { success: false as const, error: "Failed to create and add thread" };
  }
}

export async function createAndAddBead(formData: CreateAndAddBeadInput) {
  const user = await requireAuth();

  try {
    const validated = createAndAddBeadSchema.parse(formData);

    // Verify project ownership
    const project = await prisma.project.findUnique({
      where: { id: validated.projectId },
      select: { userId: true },
    });
    if (!project || project.userId !== user.id) {
      return { success: false as const, error: "Project not found" };
    }

    const resolvedBrandId = await resolveDefaultBrandId(validated.brandId, "BEAD");

    const result = await prisma.$transaction(async (tx) => {
      const bead = await tx.bead.create({
        data: {
          productCode: validated.code || "CUSTOM",
          colorName: validated.name,
          hexColor: DEFAULT_SUPPLY_HEX,
          brandId: resolvedBrandId,
          colorFamily: validated.colorFamily,
        },
        include: { brand: true },
      });
      const link = await tx.projectBead.create({
        data: {
          projectId: validated.projectId,
          beadId: bead.id,
          quantityRequired: 1,
          quantityAcquired: 0,
        },
      });
      return { bead, link };
    });

    revalidatePath("/charts");
    revalidatePath("/shopping");
    revalidateTag("stats", { expire: 0 });
    return { success: true as const, record: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false as const, error: firstValidationMessage(error) };
    }
    console.error("createAndAddBead error:", error);
    return { success: false as const, error: "Failed to create and add bead" };
  }
}

export async function createAndAddSpecialty(formData: CreateAndAddSpecialtyInput) {
  const user = await requireAuth();

  try {
    const validated = createAndAddSpecialtySchema.parse(formData);

    // Verify project ownership
    const project = await prisma.project.findUnique({
      where: { id: validated.projectId },
      select: { userId: true },
    });
    if (!project || project.userId !== user.id) {
      return { success: false as const, error: "Project not found" };
    }

    const resolvedBrandId = await resolveDefaultBrandId(validated.brandId, "SPECIALTY");

    const result = await prisma.$transaction(async (tx) => {
      const item = await tx.specialtyItem.create({
        data: {
          productCode: validated.code || "CUSTOM",
          colorName: validated.name,
          hexColor: DEFAULT_SUPPLY_HEX,
          brandId: resolvedBrandId,
        },
        include: { brand: true },
      });
      const link = await tx.projectSpecialty.create({
        data: {
          projectId: validated.projectId,
          specialtyItemId: item.id,
          quantityRequired: 1,
          quantityAcquired: 0,
        },
      });
      return { item, link };
    });

    revalidatePath("/charts");
    revalidatePath("/shopping");
    revalidateTag("stats", { expire: 0 });
    return { success: true as const, record: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false as const, error: firstValidationMessage(error) };
    }
    console.error("createAndAddSpecialty error:", error);
    return { success: false as const, error: "Failed to create and add specialty item" };
  }
}

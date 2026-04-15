"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";
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
} from "@/lib/validations/supply";

// ─── Helper ──────────────────────────────────────────────────────────────────

function isP2002(error: unknown): boolean {
  return (
    error !== null &&
    typeof error === "object" &&
    "code" in error &&
    (error as { code: string }).code === "P2002"
  );
}

// ─── Thread CRUD ─────────────────────────────────────────────────────────────

export async function createThread(formData: unknown) {
  await requireAuth();

  try {
    const validated = threadSchema.parse(formData);
    const thread = await prisma.thread.create({ data: validated });
    revalidatePath("/supplies");
    return { success: true as const, thread };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false as const, error: error.errors[0].message };
    }
    if (isP2002(error)) {
      return {
        success: false as const,
        error: "A thread with that code already exists for this brand",
      };
    }
    console.error("createThread error:", error);
    return { success: false as const, error: "Failed to create thread" };
  }
}

export async function updateThread(id: string, formData: unknown) {
  await requireAuth();

  try {
    const validated = threadSchema.parse(formData);
    const thread = await prisma.thread.update({
      where: { id },
      data: validated,
    });
    revalidatePath("/supplies");
    return { success: true as const, thread };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false as const, error: error.errors[0].message };
    }
    if (isP2002(error)) {
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
    include: { brand: true },
  });
  return threads.sort((a, b) => naturalSortByCode(a.colorCode, b.colorCode));
}

// ─── Bead CRUD ───────────────────────────────────────────────────────────────

export async function createBead(formData: unknown) {
  await requireAuth();

  try {
    const validated = beadSchema.parse(formData);
    const bead = await prisma.bead.create({ data: validated });
    revalidatePath("/supplies");
    return { success: true as const, bead };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false as const, error: error.errors[0].message };
    }
    if (isP2002(error)) {
      return {
        success: false as const,
        error: "A bead with that code already exists for this brand",
      };
    }
    console.error("createBead error:", error);
    return { success: false as const, error: "Failed to create bead" };
  }
}

export async function updateBead(id: string, formData: unknown) {
  await requireAuth();

  try {
    const validated = beadSchema.parse(formData);
    const bead = await prisma.bead.update({
      where: { id },
      data: validated,
    });
    revalidatePath("/supplies");
    return { success: true as const, bead };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false as const, error: error.errors[0].message };
    }
    if (isP2002(error)) {
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

// ─── Specialty Item CRUD ─────────────────────────────────────────────────────

export async function createSpecialtyItem(formData: unknown) {
  await requireAuth();

  try {
    const validated = specialtyItemSchema.parse(formData);
    const specialtyItem = await prisma.specialtyItem.create({
      data: validated,
    });
    revalidatePath("/supplies");
    return { success: true as const, specialtyItem };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false as const, error: error.errors[0].message };
    }
    if (isP2002(error)) {
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

export async function updateSpecialtyItem(id: string, formData: unknown) {
  await requireAuth();

  try {
    const validated = specialtyItemSchema.parse(formData);
    const specialtyItem = await prisma.specialtyItem.update({
      where: { id },
      data: validated,
    });
    revalidatePath("/supplies");
    return { success: true as const, specialtyItem };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false as const, error: error.errors[0].message };
    }
    if (isP2002(error)) {
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

// ─── Supply Brand CRUD ───────────────────────────────────────────────────────

export async function createSupplyBrand(formData: unknown) {
  await requireAuth();

  try {
    const validated = supplyBrandSchema.parse(formData);
    const brand = await prisma.supplyBrand.create({ data: validated });
    revalidatePath("/supplies");
    revalidatePath("/supplies/brands");
    return { success: true as const, brand };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false as const, error: error.errors[0].message };
    }
    if (isP2002(error)) {
      return {
        success: false as const,
        error: "A brand with that name already exists",
      };
    }
    console.error("createSupplyBrand error:", error);
    return { success: false as const, error: "Failed to create brand" };
  }
}

export async function updateSupplyBrand(id: string, formData: unknown) {
  await requireAuth();

  try {
    const validated = supplyBrandSchema.parse(formData);
    const brand = await prisma.supplyBrand.update({
      where: { id },
      data: validated,
    });
    revalidatePath("/supplies");
    revalidatePath("/supplies/brands");
    return { success: true as const, brand };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false as const, error: error.errors[0].message };
    }
    if (isP2002(error)) {
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

// ─── Junction Operations ─────────────────────────────────────────────────────

export async function addThreadToProject(formData: unknown) {
  await requireAuth();

  try {
    const validated = projectThreadSchema.parse(formData);
    const record = await prisma.projectThread.create({ data: validated });
    revalidatePath(`/charts/${validated.projectId}`);
    revalidatePath("/shopping");
    return { success: true as const, record };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false as const, error: error.errors[0].message };
    }
    if (isP2002(error)) {
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

export async function addBeadToProject(formData: unknown) {
  await requireAuth();

  try {
    const validated = projectBeadSchema.parse(formData);
    const record = await prisma.projectBead.create({ data: validated });
    revalidatePath(`/charts/${validated.projectId}`);
    revalidatePath("/shopping");
    return { success: true as const, record };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false as const, error: error.errors[0].message };
    }
    if (isP2002(error)) {
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

export async function addSpecialtyToProject(formData: unknown) {
  await requireAuth();

  try {
    const validated = projectSpecialtySchema.parse(formData);
    const record = await prisma.projectSpecialty.create({ data: validated });
    revalidatePath(`/charts/${validated.projectId}`);
    revalidatePath("/shopping");
    return { success: true as const, record };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false as const, error: error.errors[0].message };
    }
    if (isP2002(error)) {
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
  formData: unknown,
) {
  await requireAuth();

  try {
    const validated = updateQuantitySchema.parse(formData);

    if (type === "thread") {
      await prisma.projectThread.update({
        where: { id },
        data: validated,
      });
    } else if (type === "bead") {
      await prisma.projectBead.update({
        where: { id },
        data: validated,
      });
    } else {
      await prisma.projectSpecialty.update({
        where: { id },
        data: validated,
      });
    }

    revalidatePath("/shopping");
    return { success: true as const };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false as const, error: error.errors[0].message };
    }
    console.error("updateProjectSupplyQuantity error:", error);
    return {
      success: false as const,
      error: "Failed to update supply quantity",
    };
  }
}

export async function removeProjectThread(id: string) {
  await requireAuth();

  try {
    await prisma.projectThread.delete({ where: { id } });
    revalidatePath("/shopping");
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
  await requireAuth();

  try {
    await prisma.projectBead.delete({ where: { id } });
    revalidatePath("/shopping");
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
  await requireAuth();

  try {
    await prisma.projectSpecialty.delete({ where: { id } });
    revalidatePath("/shopping");
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
  await requireAuth();

  const [threads, beads, specialty] = await Promise.all([
    prisma.projectThread.findMany({
      where: { projectId },
      include: { thread: { include: { brand: true } } },
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

export async function createAndAddThread(formData: unknown) {
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
      const thread = await tx.thread.create({
        data: {
          colorCode: validated.colorCode || "CUSTOM",
          colorName: validated.name,
          hexColor: validated.hexColor,
          brandId: validated.brandId,
          colorFamily: validated.colorFamily,
        },
      });
      const link = await tx.projectThread.create({
        data: {
          projectId: validated.projectId,
          threadId: thread.id,
          stitchCount: 0,
          quantityRequired: 1,
          quantityAcquired: 0,
        },
      });
      return { thread, link };
    });

    revalidatePath("/charts");
    revalidatePath("/shopping");
    return { success: true as const, record: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false as const, error: error.errors[0].message };
    }
    console.error("createAndAddThread error:", error);
    return { success: false as const, error: "Failed to create and add thread" };
  }
}

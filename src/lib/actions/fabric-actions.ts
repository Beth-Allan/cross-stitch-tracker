"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { requireAuth } from "@/lib/auth-guard";
import { reworkCalculatedNeeds } from "@/lib/actions/thread-need-rework";
import { prisma } from "@/lib/db";
import { firstValidationMessage, isDuplicateKeyError } from "@/lib/utils/action-errors";
import { fabricBrandSchema, fabricSchema } from "@/lib/validations/fabric";
import type { FabricBrandInput, FabricInput } from "@/lib/validations/fabric";

export async function createFabricBrand(formData: FabricBrandInput) {
  await requireAuth();

  try {
    const validated = fabricBrandSchema.parse(formData);
    const brand = await prisma.fabricBrand.create({ data: validated });
    revalidatePath("/fabric");
    return { success: true as const, brand };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false as const, error: firstValidationMessage(error) };
    }
    if (isDuplicateKeyError(error)) {
      return { success: false as const, error: "A brand with that name already exists." };
    }
    console.error("createFabricBrand error:", error);
    return { success: false as const, error: "Failed to create brand" };
  }
}

export async function updateFabricBrand(id: string, formData: FabricBrandInput) {
  await requireAuth();

  try {
    const validated = fabricBrandSchema.parse(formData);
    const brand = await prisma.fabricBrand.update({
      where: { id },
      data: validated,
    });
    revalidatePath("/fabric");
    return { success: true as const, brand };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false as const, error: firstValidationMessage(error) };
    }
    if (isDuplicateKeyError(error)) {
      return { success: false as const, error: "A brand with that name already exists." };
    }
    console.error("updateFabricBrand error:", error);
    return { success: false as const, error: "Failed to update brand" };
  }
}

export async function deleteFabricBrand(id: string) {
  await requireAuth();

  try {
    await prisma.fabricBrand.delete({ where: { id } });
    revalidatePath("/fabric");
    return { success: true as const };
  } catch (error) {
    console.error("deleteFabricBrand error:", error);
    return { success: false as const, error: "Failed to delete brand" };
  }
}

export async function getFabricBrands() {
  await requireAuth();

  return await prisma.fabricBrand.findMany({
    include: { _count: { select: { fabrics: true } } },
    orderBy: { name: "asc" },
  });
}

// Fabric has no direct userId — ownership is inferred through linkedProject.userId.
// Unlinked fabrics (linkedProjectId=null) are accessible to all authenticated users.
// Mutations verify ownership of both the fabric's existing link and any incoming linkedProjectId.
// Note: chart-actions.ts also performs fabric ownership checks when linking/unlinking in transactions.

export async function createFabric(formData: FabricInput) {
  const user = await requireAuth();

  try {
    const validated = fabricSchema.parse(formData);
    const { linkedProjectId } = validated;

    let linkedChartId: string | null = null;
    if (linkedProjectId) {
      const project = await prisma.project.findUnique({
        where: { id: linkedProjectId },
        select: { userId: true, chartId: true },
      });
      if (!project || project.userId !== user.id) {
        return { success: false as const, error: "Project not found" };
      }
      linkedChartId = project.chartId;
    }

    const fabric = await prisma.$transaction(async (tx) => {
      const created = await tx.fabric.create({ data: validated });
      if (linkedProjectId) await reworkCalculatedNeeds(tx, linkedProjectId);
      return created;
    });
    revalidatePath("/fabric");
    if (linkedChartId) {
      revalidatePath("/charts");
      revalidatePath(`/charts/${linkedChartId}`);
      revalidateTag("stats", { expire: 0 });
    }
    revalidatePath("/shopping");
    return { success: true as const, fabric };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false as const, error: firstValidationMessage(error) };
    }
    if (isDuplicateKeyError(error)) {
      return {
        success: false as const,
        error: "This project already has fabric linked. Edit the existing fabric instead.",
      };
    }
    console.error("createFabric error:", error);
    return { success: false as const, error: "Failed to create fabric" };
  }
}

export async function updateFabric(id: string, formData: FabricInput) {
  const user = await requireAuth();

  try {
    const existing = await prisma.fabric.findUnique({
      where: { id },
      select: {
        count: true,
        linkedProjectId: true,
        linkedProject: { select: { userId: true, chartId: true } },
      },
    });
    if (existing?.linkedProject && existing.linkedProject.userId !== user.id) {
      return { success: false as const, error: "Fabric not found" };
    }

    const validated = fabricSchema.parse(formData);

    let incomingChartId: string | null = null;
    if (validated.linkedProjectId) {
      const project = await prisma.project.findUnique({
        where: { id: validated.linkedProjectId },
        select: { userId: true, chartId: true },
      });
      if (!project || project.userId !== user.id) {
        return { success: false as const, error: "Project not found" };
      }
      incomingChartId = project.chartId;
    }

    // A project this fabric leaves goes back to the default count, so it is reworked too
    const needsCanMove =
      existing?.linkedProjectId !== validated.linkedProjectId ||
      existing?.count !== validated.count;
    const projectIds = needsCanMove
      ? new Set([existing?.linkedProjectId, validated.linkedProjectId].filter((id) => id != null))
      : new Set<string>();

    const fabric = await prisma.$transaction(async (tx) => {
      const updated = await tx.fabric.update({
        where: { id },
        data: validated,
      });
      for (const projectId of projectIds) {
        await reworkCalculatedNeeds(tx, projectId);
      }
      return updated;
    });
    revalidatePath("/fabric");
    revalidatePath(`/fabric/${id}`);
    for (const chartId of new Set([existing?.linkedProject?.chartId, incomingChartId])) {
      if (chartId) revalidatePath(`/charts/${chartId}`);
    }
    if (projectIds.size > 0) {
      revalidatePath("/charts");
      revalidateTag("stats", { expire: 0 });
    }
    revalidatePath("/shopping");
    return { success: true as const, fabric };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false as const, error: firstValidationMessage(error) };
    }
    if (isDuplicateKeyError(error)) {
      return {
        success: false as const,
        error: "This project already has fabric linked. Edit the existing fabric instead.",
      };
    }
    console.error("updateFabric error:", error);
    return { success: false as const, error: "Failed to update fabric" };
  }
}

export async function deleteFabric(id: string) {
  const user = await requireAuth();

  try {
    const existing = await prisma.fabric.findUnique({
      where: { id },
      select: {
        linkedProjectId: true,
        linkedProject: { select: { userId: true, chartId: true } },
      },
    });
    if (existing?.linkedProject && existing.linkedProject.userId !== user.id) {
      return { success: false as const, error: "Fabric not found" };
    }

    await prisma.$transaction(async (tx) => {
      await tx.fabric.delete({ where: { id } });
      if (existing?.linkedProjectId) await reworkCalculatedNeeds(tx, existing.linkedProjectId);
    });
    revalidatePath("/fabric");
    if (existing?.linkedProject) {
      revalidatePath("/charts");
      revalidatePath(`/charts/${existing.linkedProject.chartId}`);
      revalidateTag("stats", { expire: 0 });
    }
    revalidatePath("/shopping");
    return { success: true as const };
  } catch (error) {
    console.error("deleteFabric error:", error);
    return { success: false as const, error: "Failed to delete fabric" };
  }
}

export async function getFabric(id: string) {
  const user = await requireAuth();

  const fabric = await prisma.fabric.findUnique({
    where: { id },
    include: {
      brand: true,
      linkedProject: {
        include: {
          chart: { select: { id: true, name: true, stitchesWide: true, stitchesHigh: true } },
        },
      },
    },
  });

  if (fabric?.linkedProject && fabric.linkedProject.userId !== user.id) {
    return null;
  }

  return fabric;
}

export async function getUnassignedFabrics(currentProjectId?: string) {
  const user = await requireAuth();

  return await prisma.fabric.findMany({
    where: {
      OR: [
        { linkedProjectId: null },
        ...(currentProjectId ? [{ linkedProjectId: currentProjectId }] : []),
      ],
      NOT: {
        linkedProject: { userId: { not: user.id } },
      },
    },
    include: { brand: true },
    orderBy: { name: "asc" },
  });
}

export async function getFabrics() {
  const user = await requireAuth();

  return await prisma.fabric.findMany({
    where: {
      OR: [{ linkedProjectId: null }, { linkedProject: { userId: user.id } }],
    },
    include: {
      brand: true,
      linkedProject: { include: { chart: { select: { name: true } } } },
    },
    orderBy: { name: "asc" },
  });
}

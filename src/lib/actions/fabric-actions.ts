"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";
import { fabricBrandSchema, fabricSchema } from "@/lib/validations/fabric";

// ─── Fabric Brand CRUD ──────────────────────────────────────────────────────

export async function createFabricBrand(formData: unknown) {
  await requireAuth();

  try {
    const validated = fabricBrandSchema.parse(formData);
    const brand = await prisma.fabricBrand.create({ data: validated });
    revalidatePath("/fabric");
    return { success: true as const, brand };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false as const, error: error.errors[0].message };
    }
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      return { success: false as const, error: "A brand with that name already exists." };
    }
    console.error("createFabricBrand error:", error);
    return { success: false as const, error: "Failed to create brand" };
  }
}

export async function updateFabricBrand(id: string, formData: unknown) {
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
      return { success: false as const, error: error.errors[0].message };
    }
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
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

// ─── Fabric CRUD ────────────────────────────────────────────────────────────
// Fabric has no direct userId — ownership is inferred through linkedProject.userId.
// Unlinked fabrics (linkedProjectId=null) are accessible to all authenticated users.
// Mutations on linked fabrics verify the linked project belongs to the current user.
// Note: chart-actions.ts also performs fabric ownership checks when linking/unlinking in transactions.

export async function createFabric(formData: unknown) {
  const user = await requireAuth();

  try {
    const validated = fabricSchema.parse(formData);

    if (validated.linkedProjectId) {
      const project = await prisma.project.findUnique({
        where: { id: validated.linkedProjectId },
        select: { userId: true },
      });
      if (!project || project.userId !== user.id) {
        return { success: false as const, error: "Project not found" };
      }
    }

    const fabric = await prisma.fabric.create({ data: validated });
    revalidatePath("/fabric");
    if (validated.linkedProjectId) {
      revalidatePath(`/charts/${validated.linkedProjectId}`);
    }
    revalidatePath("/shopping");
    return { success: true as const, fabric };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false as const, error: error.errors[0].message };
    }
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      return {
        success: false as const,
        error: "This project already has fabric linked. Edit the existing fabric instead.",
      };
    }
    console.error("createFabric error:", error);
    return { success: false as const, error: "Failed to create fabric" };
  }
}

export async function updateFabric(id: string, formData: unknown) {
  const user = await requireAuth();

  try {
    const existing = await prisma.fabric.findUnique({
      where: { id },
      select: { linkedProject: { select: { userId: true } } },
    });
    if (existing?.linkedProject && existing.linkedProject.userId !== user.id) {
      return { success: false as const, error: "Fabric not found" };
    }

    const validated = fabricSchema.parse(formData);
    const fabric = await prisma.fabric.update({
      where: { id },
      data: validated,
    });
    revalidatePath("/fabric");
    revalidatePath(`/fabric/${id}`);
    if (validated.linkedProjectId) {
      revalidatePath(`/charts/${validated.linkedProjectId}`);
    }
    revalidatePath("/shopping");
    return { success: true as const, fabric };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false as const, error: error.errors[0].message };
    }
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
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
      select: { linkedProject: { select: { userId: true } } },
    });
    if (existing?.linkedProject && existing.linkedProject.userId !== user.id) {
      return { success: false as const, error: "Fabric not found" };
    }

    await prisma.fabric.delete({ where: { id } });
    revalidatePath("/fabric");
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

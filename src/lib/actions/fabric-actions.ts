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

  try {
    return await prisma.fabricBrand.findMany({
      include: { _count: { select: { fabrics: true } } },
      orderBy: { name: "asc" },
    });
  } catch (error) {
    console.error("getFabricBrands error:", error);
    return [];
  }
}

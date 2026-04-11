"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";
import { storageLocationSchema } from "@/lib/validations/storage";
import type { StorageLocationWithStats, StorageLocationDetail } from "@/types/storage";

export async function createStorageLocation(formData: unknown) {
  const user = await requireAuth();

  try {
    const validated = storageLocationSchema.parse(formData);
    const location = await prisma.storageLocation.create({
      data: { ...validated, userId: user.id },
    });
    revalidatePath("/storage");
    return { success: true as const, location };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false as const, error: error.errors[0].message };
    }
    console.error("createStorageLocation error:", error);
    return { success: false as const, error: "Failed to create storage location" };
  }
}

export async function updateStorageLocation(id: string, formData: unknown) {
  await requireAuth();

  try {
    const validated = storageLocationSchema.parse(formData);
    const location = await prisma.storageLocation.update({
      where: { id },
      data: validated,
    });
    revalidatePath("/storage");
    revalidatePath(`/storage/${id}`);
    return { success: true as const, location };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false as const, error: error.errors[0].message };
    }
    console.error("updateStorageLocation error:", error);
    return { success: false as const, error: "Failed to update storage location" };
  }
}

export async function deleteStorageLocation(id: string) {
  await requireAuth();

  try {
    await prisma.$transaction([
      prisma.project.updateMany({
        where: { storageLocationId: id },
        data: { storageLocationId: null },
      }),
      prisma.storageLocation.delete({ where: { id } }),
    ]);

    revalidatePath("/storage");
    revalidatePath("/charts");
    return { success: true as const };
  } catch (error) {
    console.error("deleteStorageLocation error:", error);
    return { success: false as const, error: "Failed to delete storage location" };
  }
}

export async function getStorageLocationsWithStats(): Promise<StorageLocationWithStats[]> {
  await requireAuth();

  try {
    const locations = await prisma.storageLocation.findMany({
      include: { _count: { select: { projects: true } } },
      orderBy: { name: "asc" },
    });
    return locations.map((l) => ({
      id: l.id,
      name: l.name,
      description: l.description,
      _count: l._count,
    }));
  } catch (error) {
    console.error("getStorageLocationsWithStats error:", error);
    return [];
  }
}

export async function getStorageLocationDetail(
  id: string,
): Promise<StorageLocationDetail | null> {
  await requireAuth();

  try {
    const location = await prisma.storageLocation.findUnique({
      where: { id },
      include: {
        projects: {
          select: {
            id: true,
            status: true,
            chart: {
              select: { id: true, name: true, coverThumbnailUrl: true },
            },
            fabric: {
              select: { name: true, count: true, type: true },
            },
          },
        },
      },
    });

    if (!location) return null;

    return {
      id: location.id,
      name: location.name,
      description: location.description,
      projects: location.projects.map((p) => ({
        id: p.id,
        status: p.status,
        chart: p.chart,
        fabric: p.fabric,
      })),
    };
  } catch (error) {
    console.error("getStorageLocationDetail error:", error);
    return null;
  }
}

"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";
import { stitchingAppSchema } from "@/lib/validations/storage";
import type { StitchingAppWithStats, StitchingAppDetail } from "@/types/storage";

export async function createStitchingApp(formData: unknown) {
  const user = await requireAuth();

  try {
    const validated = stitchingAppSchema.parse(formData);
    const app = await prisma.stitchingApp.create({
      data: { ...validated, userId: user.id },
    });
    revalidatePath("/apps");
    return { success: true as const, app };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false as const, error: error.errors[0].message };
    }
    console.error("createStitchingApp error:", error);
    return { success: false as const, error: "Failed to create stitching app" };
  }
}

export async function updateStitchingApp(id: string, formData: unknown) {
  const user = await requireAuth();

  try {
    const validated = stitchingAppSchema.parse(formData);
    const app = await prisma.stitchingApp.update({
      where: { id, userId: user.id },
      data: validated,
    });
    revalidatePath("/apps");
    revalidatePath(`/apps/${id}`);
    return { success: true as const, app };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false as const, error: error.errors[0].message };
    }
    console.error("updateStitchingApp error:", error);
    return { success: false as const, error: "Failed to update stitching app" };
  }
}

export async function deleteStitchingApp(id: string) {
  const user = await requireAuth();

  try {
    const existing = await prisma.stitchingApp.findUnique({
      where: { id },
      select: { userId: true },
    });
    if (!existing || existing.userId !== user.id) {
      return { success: false as const, error: "App not found" };
    }

    await prisma.$transaction([
      prisma.project.updateMany({
        where: { stitchingAppId: id },
        data: { stitchingAppId: null },
      }),
      prisma.stitchingApp.delete({ where: { id } }),
    ]);

    revalidatePath("/apps");
    revalidatePath("/charts");
    return { success: true as const };
  } catch (error) {
    console.error("deleteStitchingApp error:", error);
    return { success: false as const, error: "Failed to delete stitching app" };
  }
}

export async function getStitchingAppsWithStats(): Promise<StitchingAppWithStats[]> {
  const user = await requireAuth();

  const apps = await prisma.stitchingApp.findMany({
    where: { userId: user.id },
    include: { _count: { select: { projects: true } } },
    orderBy: { name: "asc" },
  });
  return apps.map((a) => ({
    id: a.id,
    name: a.name,
    description: a.description,
    _count: a._count,
  }));
}

export async function getStitchingAppDetail(id: string): Promise<StitchingAppDetail | null> {
  const user = await requireAuth();

  const app = await prisma.stitchingApp.findUnique({
    where: { id, userId: user.id },
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

  if (!app) return null;

  return {
    id: app.id,
    name: app.name,
    description: app.description,
    projects: app.projects.map((p) => ({
      id: p.id,
      status: p.status,
      chart: p.chart,
      fabric: p.fabric,
    })),
  };
}

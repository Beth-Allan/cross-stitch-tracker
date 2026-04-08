"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";
import { designerSchema } from "@/lib/validations/chart";
import type { DesignerWithStats, DesignerDetail } from "@/types/designer";

export async function createDesigner(formData: unknown) {
  await requireAuth();

  try {
    const validated = designerSchema.parse(formData);
    const designer = await prisma.designer.create({ data: validated });
    revalidatePath("/designers");
    return { success: true as const, designer };
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
      return { success: false as const, error: "A designer with that name already exists" };
    }
    console.error("createDesigner error:", error);
    return { success: false as const, error: "Failed to create designer" };
  }
}

export async function updateDesigner(id: string, formData: unknown) {
  await requireAuth();

  try {
    const validated = designerSchema.parse(formData);
    const designer = await prisma.designer.update({
      where: { id },
      data: validated,
    });
    revalidatePath("/designers");
    revalidatePath(`/designers/${id}`);
    return { success: true as const, designer };
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
      return { success: false as const, error: "A designer with that name already exists" };
    }
    console.error("updateDesigner error:", error);
    return { success: false as const, error: "Failed to update designer" };
  }
}

export async function deleteDesigner(id: string) {
  await requireAuth();

  try {
    const designer = await prisma.designer.findUnique({
      where: { id },
      include: { _count: { select: { charts: true } } },
    });
    if (!designer) {
      return { success: false as const, error: "Designer not found" };
    }

    await prisma.$transaction([
      prisma.chart.updateMany({
        where: { designerId: id },
        data: { designerId: null },
      }),
      prisma.designer.delete({ where: { id } }),
    ]);

    revalidatePath("/designers");
    revalidatePath("/charts");
    return { success: true as const };
  } catch (error) {
    console.error("deleteDesigner error:", error);
    return { success: false as const, error: "Failed to delete designer" };
  }
}

export async function getDesigner(id: string): Promise<DesignerDetail | null> {
  await requireAuth();

  try {
    const designer = await prisma.designer.findUnique({
      where: { id },
      include: {
        charts: {
          select: {
            id: true,
            name: true,
            coverThumbnailUrl: true,
            stitchCount: true,
            stitchesWide: true,
            stitchesHigh: true,
            project: { select: { status: true, stitchesCompleted: true } },
            genres: { select: { name: true } },
          },
        },
      },
    });

    if (!designer) return null;

    const charts = designer.charts.map((c) => ({
      id: c.id,
      name: c.name,
      coverThumbnailUrl: c.coverThumbnailUrl,
      stitchCount: c.stitchCount,
      stitchesWide: c.stitchesWide,
      stitchesHigh: c.stitchesHigh,
      status: c.project?.status ?? null,
      stitchesCompleted: c.project?.stitchesCompleted ?? 0,
      genres: c.genres,
    }));

    // Compute stats
    const chartCount = charts.length;

    // "Started" means has a project and status is not UNSTARTED, KITTING, or KITTED
    const NOT_STARTED_STATUSES = new Set(["UNSTARTED", "KITTING", "KITTED"]);
    const projectsStarted = charts.filter(
      (c) => c.status !== null && !NOT_STARTED_STATUSES.has(c.status),
    ).length;

    const FINISHED_STATUSES = new Set(["FINISHED", "FFO"]);
    const projectsFinished = charts.filter(
      (c) => c.status !== null && FINISHED_STATUSES.has(c.status),
    ).length;

    // Top genre: most frequent genre name across all charts
    const genreCounts = new Map<string, number>();
    for (const chart of charts) {
      for (const genre of chart.genres) {
        genreCounts.set(genre.name, (genreCounts.get(genre.name) ?? 0) + 1);
      }
    }
    let topGenre: string | null = null;
    let maxCount = 0;
    for (const [name, count] of genreCounts) {
      if (count > maxCount) {
        maxCount = count;
        topGenre = name;
      }
    }

    return {
      id: designer.id,
      name: designer.name,
      website: designer.website,
      notes: designer.notes,
      chartCount,
      projectsStarted,
      projectsFinished,
      topGenre,
      charts,
    };
  } catch (error) {
    console.error("getDesigner error:", error);
    return null;
  }
}

export async function getDesignersWithStats(): Promise<DesignerWithStats[]> {
  await requireAuth();

  try {
    const designers = await prisma.designer.findMany({
      include: { _count: { select: { charts: true } } },
      orderBy: { name: "asc" },
    });
    return designers.map((d) => ({
      id: d.id,
      name: d.name,
      website: d.website,
      notes: d.notes,
      chartCount: d._count.charts,
    }));
  } catch (error) {
    console.error("getDesignersWithStats error:", error);
    return [];
  }
}

export async function getDesigners() {
  await requireAuth();

  try {
    return await prisma.designer.findMany({ orderBy: { name: "asc" } });
  } catch (error) {
    console.error("getDesigners error:", error);
    return [];
  }
}

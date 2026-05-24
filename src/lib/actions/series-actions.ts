"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";
import { seriesSchema } from "@/lib/validations/series";
import { computeSeriesProgress } from "@/lib/utils/series-progress";
import type { SeriesWithStats } from "@/types/series";

export async function createSeries(formData: unknown) {
  await requireAuth();

  try {
    const validated = seriesSchema.parse(formData);
    const series = await prisma.series.create({ data: validated });
    revalidatePath("/series");
    return { success: true as const, series };
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
      return { success: false as const, error: "A series with that name already exists" };
    }
    console.error("createSeries error:", error instanceof Error ? error.message : String(error));
    return { success: false as const, error: "Failed to create series" };
  }
}

export async function updateSeries(id: string, formData: unknown) {
  await requireAuth();

  try {
    const validated = seriesSchema.parse(formData);
    const series = await prisma.series.update({
      where: { id },
      data: validated,
    });
    revalidatePath("/series");
    revalidatePath(`/series/${id}`);
    return { success: true as const, series };
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
      return { success: false as const, error: "A series with that name already exists" };
    }
    console.error("updateSeries error:", error instanceof Error ? error.message : String(error));
    return { success: false as const, error: "Failed to update series" };
  }
}

export async function deleteSeries(id: string) {
  await requireAuth();

  try {
    const series = await prisma.series.findUnique({ where: { id } });
    if (!series) {
      return { success: false as const, error: "Series not found" };
    }

    await prisma.$transaction([
      prisma.chart.updateMany({
        where: { seriesId: id },
        data: { seriesId: null },
      }),
      prisma.series.delete({ where: { id } }),
    ]);

    revalidatePath("/series");
    revalidatePath("/charts");
    return { success: true as const };
  } catch (error) {
    console.error("deleteSeries error:", error instanceof Error ? error.message : String(error));
    return { success: false as const, error: "Failed to delete series" };
  }
}

export async function getSeriesWithStats(): Promise<SeriesWithStats[]> {
  await requireAuth();

  const seriesList = await prisma.series.findMany({
    include: {
      charts: {
        select: {
          project: { select: { status: true } },
        },
      },
      designer: { select: { name: true } },
    },
    orderBy: { name: "asc" },
  });

  return seriesList.map((s) => ({
    id: s.id,
    name: s.name,
    totalCount: s.totalCount,
    designerId: s.designerId,
    designerName: s.designer?.name ?? null,
    notes: s.notes,
    progress: computeSeriesProgress(s.charts, s.totalCount),
  }));
}

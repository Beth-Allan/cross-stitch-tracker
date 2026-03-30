"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";
import { chartFormSchema } from "@/lib/validations/chart";
import { PROJECT_STATUSES } from "@/lib/utils/status";

export async function createChart(formData: unknown) {
  const user = await requireAuth();

  try {
    const validated = chartFormSchema.parse(formData);
    const { chart, project } = validated;

    // Auto-calculate stitch count from dimensions when not provided directly
    let effectiveStitchCount = chart.stitchCount;
    let effectiveApproximate = chart.stitchCountApproximate;
    if (effectiveStitchCount === 0 && chart.stitchesWide > 0 && chart.stitchesHigh > 0) {
      effectiveStitchCount = chart.stitchesWide * chart.stitchesHigh;
      effectiveApproximate = true;
    }

    const created = await prisma.chart.create({
      data: {
        name: chart.name,
        designerId: chart.designerId,
        coverImageUrl: chart.coverImageUrl,
        coverThumbnailUrl: chart.coverThumbnailUrl,
        digitalWorkingCopyUrl: chart.digitalFileUrl,
        stitchCount: effectiveStitchCount,
        stitchCountApproximate: effectiveApproximate,
        stitchesWide: chart.stitchesWide,
        stitchesHigh: chart.stitchesHigh,
        genres: {
          connect: chart.genreIds.map((id) => ({ id })),
        },
        isPaperChart: chart.isPaperChart,
        isFormalKit: chart.isFormalKit,
        isSAL: chart.isSAL,
        kitColorCount: chart.kitColorCount,
        notes: chart.notes,
        project: {
          create: {
            userId: user.id,
            status: project.status,
            fabricId: project.fabricId,
            projectBin: project.projectBin,
            ipadApp: project.ipadApp,
            needsOnionSkinning: project.needsOnionSkinning,
            startDate: project.startDate ? new Date(project.startDate) : null,
            finishDate: project.finishDate ? new Date(project.finishDate) : null,
            ffoDate: project.ffoDate ? new Date(project.ffoDate) : null,
            wantToStartNext: project.wantToStartNext,
            preferredStartSeason: project.preferredStartSeason,
            startingStitches: project.startingStitches,
          },
        },
      },
      include: { project: true, designer: true, genres: true },
    });

    revalidatePath("/charts");
    return { success: true as const, chartId: created.id };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false as const, error: error.errors[0].message };
    }
    console.error("createChart error:", error);
    return { success: false as const, error: "Failed to create chart" };
  }
}

export async function updateChart(chartId: string, formData: unknown) {
  const user = await requireAuth();

  try {
    // Verify ownership
    const existing = await prisma.chart.findUnique({
      where: { id: chartId },
      select: { project: { select: { userId: true } } },
    });
    if (!existing?.project || existing.project.userId !== user.id) {
      return { success: false as const, error: "Chart not found" };
    }

    const validated = chartFormSchema.parse(formData);
    const { chart, project } = validated;

    let effectiveStitchCount = chart.stitchCount;
    let effectiveApproximate = chart.stitchCountApproximate;
    if (effectiveStitchCount === 0 && chart.stitchesWide > 0 && chart.stitchesHigh > 0) {
      effectiveStitchCount = chart.stitchesWide * chart.stitchesHigh;
      effectiveApproximate = true;
    }

    await prisma.chart.update({
      where: { id: chartId },
      data: {
        name: chart.name,
        designerId: chart.designerId,
        coverImageUrl: chart.coverImageUrl,
        coverThumbnailUrl: chart.coverThumbnailUrl,
        digitalWorkingCopyUrl: chart.digitalFileUrl,
        stitchCount: effectiveStitchCount,
        stitchCountApproximate: effectiveApproximate,
        stitchesWide: chart.stitchesWide,
        stitchesHigh: chart.stitchesHigh,
        genres: {
          set: chart.genreIds.map((id) => ({ id })),
        },
        isPaperChart: chart.isPaperChart,
        isFormalKit: chart.isFormalKit,
        isSAL: chart.isSAL,
        kitColorCount: chart.kitColorCount,
        notes: chart.notes,
        project: {
          update: {
            status: project.status,
            fabricId: project.fabricId,
            projectBin: project.projectBin,
            ipadApp: project.ipadApp,
            needsOnionSkinning: project.needsOnionSkinning,
            startDate: project.startDate ? new Date(project.startDate) : null,
            finishDate: project.finishDate ? new Date(project.finishDate) : null,
            ffoDate: project.ffoDate ? new Date(project.ffoDate) : null,
            wantToStartNext: project.wantToStartNext,
            preferredStartSeason: project.preferredStartSeason,
            startingStitches: project.startingStitches,
          },
        },
      },
      include: { project: true, designer: true, genres: true },
    });

    revalidatePath("/charts");
    revalidatePath(`/charts/${chartId}`);
    return { success: true as const };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false as const, error: error.errors[0].message };
    }
    console.error("updateChart error:", error);
    return { success: false as const, error: "Failed to update chart" };
  }
}

export async function deleteChart(chartId: string) {
  const user = await requireAuth();

  try {
    // Verify ownership
    const existing = await prisma.chart.findUnique({
      where: { id: chartId },
      select: { project: { select: { userId: true } } },
    });
    if (!existing?.project || existing.project.userId !== user.id) {
      return { success: false as const, error: "Chart not found" };
    }

    await prisma.chart.delete({ where: { id: chartId } });
    revalidatePath("/charts");
    return { success: true as const };
  } catch (error) {
    console.error("deleteChart error:", error);
    return { success: false as const, error: "Failed to delete chart" };
  }
}

export async function updateChartStatus(chartId: string, status: string) {
  const user = await requireAuth();

  try {
    const validatedStatus = z.enum(PROJECT_STATUSES as [string, ...string[]]).parse(status);

    // Scope update to owned projects only
    const project = await prisma.project.findUnique({
      where: { chartId },
      select: { userId: true },
    });
    if (!project || project.userId !== user.id) {
      return { success: false as const, error: "Chart not found" };
    }

    await prisma.project.update({
      where: { chartId },
      data: { status: validatedStatus as (typeof PROJECT_STATUSES)[number] },
    });

    revalidatePath(`/charts/${chartId}`);
    return { success: true as const };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false as const, error: "Invalid status value" };
    }
    console.error("updateChartStatus error:", error);
    return {
      success: false as const,
      error: "Failed to update chart status",
    };
  }
}

export async function getChart(chartId: string) {
  const user = await requireAuth();

  try {
    const chart = await prisma.chart.findUnique({
      where: { id: chartId },
      include: { project: true, designer: true, genres: true },
    });
    // Only return charts owned by the current user
    if (chart && chart.project && chart.project.userId !== user.id) {
      return null;
    }
    return chart;
  } catch (error) {
    console.error("getChart error:", error);
    return null;
  }
}

export async function getCharts() {
  const user = await requireAuth();

  try {
    return await prisma.chart.findMany({
      where: { project: { userId: user.id } },
      include: { project: true, designer: true, genres: true },
      orderBy: { dateAdded: "desc" },
    });
  } catch (error) {
    console.error("getCharts error:", error);
    return [];
  }
}

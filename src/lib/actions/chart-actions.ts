"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";
import { generateThumbnail } from "@/lib/actions/upload-actions";
import { chartFormSchema } from "@/lib/validations/chart";
import { updateProjectSettingsSchema } from "@/lib/validations/supply";
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

    const created = await prisma.$transaction(async (tx) => {
      const result = await tx.chart.create({
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
              storageLocationId: project.storageLocationId,
              stitchingAppId: project.stitchingAppId,
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

      // Link fabric to the new project if provided
      if (project.fabricId && result.project) {
        // Verify the fabric belongs to this user (unlinked or linked to their project)
        const targetFabric = await tx.fabric.findUnique({
          where: { id: project.fabricId },
          select: { linkedProject: { select: { userId: true } } },
        });
        if (targetFabric?.linkedProject && targetFabric.linkedProject.userId !== user.id) {
          throw new Error("Fabric not found");
        }
        await tx.fabric.update({
          where: { id: project.fabricId },
          data: { linkedProjectId: result.project.id },
        });
      }

      return result;
    });

    // Generate thumbnail if a cover image was uploaded
    let thumbnailWarning: string | undefined;
    if (chart.coverImageUrl) {
      try {
        await generateThumbnail(created.id, chart.coverImageUrl);
      } catch (err) {
        console.error("Thumbnail generation failed (chart saved without thumbnail):", err);
        thumbnailWarning = "Thumbnail could not be generated";
      }
    }

    revalidatePath("/charts");
    revalidatePath("/fabric");
    return { success: true as const, chartId: created.id, warning: thumbnailWarning };
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
    // Verify ownership and fetch current cover image + project id for change detection
    const existing = await prisma.chart.findUnique({
      where: { id: chartId },
      select: { coverImageUrl: true, project: { select: { id: true, userId: true } } },
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

    const existingProjectId = existing.project.id;

    await prisma.$transaction(async (tx) => {
      await tx.chart.update({
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
              storageLocationId: project.storageLocationId,
              stitchingAppId: project.stitchingAppId,
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

      // Handle fabric link/unlink
      const currentFabric = await tx.fabric.findUnique({
        where: { linkedProjectId: existingProjectId },
      });

      // Unlink old fabric if changed
      if (currentFabric && currentFabric.id !== project.fabricId) {
        await tx.fabric.update({
          where: { id: currentFabric.id },
          data: { linkedProjectId: null },
        });
      }

      // Link new fabric if provided and different from current
      if (project.fabricId && project.fabricId !== currentFabric?.id) {
        // Verify the fabric belongs to this user (unlinked or linked to their project)
        const targetFabric = await tx.fabric.findUnique({
          where: { id: project.fabricId },
          select: { linkedProject: { select: { userId: true } } },
        });
        if (targetFabric?.linkedProject && targetFabric.linkedProject.userId !== user.id) {
          throw new Error("Fabric not found");
        }
        await tx.fabric.update({
          where: { id: project.fabricId },
          data: { linkedProjectId: existingProjectId },
        });
      }
    });

    // Generate thumbnail if cover image changed
    let thumbnailWarning: string | undefined;
    if (chart.coverImageUrl && chart.coverImageUrl !== existing.coverImageUrl) {
      try {
        await generateThumbnail(chartId, chart.coverImageUrl);
      } catch (err) {
        console.error("Thumbnail generation failed (chart saved without thumbnail):", err);
        thumbnailWarning = "Thumbnail could not be generated";
      }
    }

    revalidatePath("/charts");
    revalidatePath(`/charts/${chartId}`);
    revalidatePath("/fabric");
    return { success: true as const, warning: thumbnailWarning };
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

  const chart = await prisma.chart.findUnique({
    where: { id: chartId },
    include: {
      project: {
        include: {
          storageLocation: { select: { id: true, name: true } },
          stitchingApp: { select: { id: true, name: true } },
          fabric: { include: { brand: true } },
        },
      },
      designer: true,
      genres: true,
    },
  });
  // Only return charts owned by the current user
  if (!chart || !chart.project || chart.project.userId !== user.id) {
    return null;
  }
  return chart;
}

export async function getCharts() {
  const user = await requireAuth();

  return await prisma.chart.findMany({
    where: { project: { userId: user.id } },
    include: {
      project: {
        include: {
          storageLocation: { select: { id: true, name: true } },
          stitchingApp: { select: { id: true, name: true } },
          fabric: { include: { brand: true } },
        },
      },
      designer: true,
      genres: true,
    },
    orderBy: { dateAdded: "desc" },
  });
}

export async function getChartsForGallery() {
  const user = await requireAuth();

  return await prisma.chart.findMany({
    where: { project: { userId: user.id } },
    include: {
      project: {
        select: {
          id: true,
          status: true,
          stitchesCompleted: true,
          startDate: true,
          finishDate: true,
          ffoDate: true,
          fabric: { select: { id: true } },
          projectThreads: {
            select: { quantityRequired: true, quantityAcquired: true },
          },
          projectBeads: {
            select: { quantityRequired: true, quantityAcquired: true },
          },
          projectSpecialty: {
            select: { quantityRequired: true, quantityAcquired: true },
          },
        },
      },
      designer: true,
      genres: true,
    },
    orderBy: { dateAdded: "desc" },
  });
}

export async function updateProjectSettings(chartId: string, formData: unknown) {
  const user = await requireAuth();

  try {
    const validated = updateProjectSettingsSchema.parse(formData);

    const project = await prisma.project.findUnique({
      where: { chartId },
      select: { userId: true },
    });
    if (!project || project.userId !== user.id) {
      return { success: false as const, error: "Project not found" };
    }

    await prisma.project.update({
      where: { chartId },
      data: validated,
    });

    revalidatePath(`/charts/${chartId}`);
    return { success: true as const };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false as const, error: error.errors[0].message };
    }
    console.error("updateProjectSettings error:", error);
    return { success: false as const, error: "Failed to update project settings" };
  }
}

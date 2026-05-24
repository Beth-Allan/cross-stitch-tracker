"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import type { Prisma } from "@/generated/prisma/client";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";
import { deleteFile, generateThumbnail } from "@/lib/actions/upload-actions";
import { chartFormSchema, batchSupplySchema } from "@/lib/validations/chart";
import type { ChartFormInput } from "@/lib/validations/chart";
import { updateProjectSettingsSchema } from "@/lib/validations/supply";
import { PROJECT_STATUSES } from "@/lib/utils/status";

// ─── Shared Helpers ──────────────────────────────────────────────────────────

/**
 * Create a chart + project inside an existing transaction, then link fabric
 * if provided. Shared by createChart and createChartWithSupplies to avoid
 * duplicating ~60 lines of creation + ownership logic.
 */
async function createChartAndProject(
  tx: Prisma.TransactionClient,
  validated: ChartFormInput,
  userId: string,
) {
  const { chart, project } = validated;

  // Auto-calculate stitch count from dimensions when not provided directly
  let effectiveStitchCount = chart.stitchCount;
  let effectiveApproximate = chart.stitchCountApproximate;
  if (effectiveStitchCount === 0 && chart.stitchesWide > 0 && chart.stitchesHigh > 0) {
    effectiveStitchCount = chart.stitchesWide * chart.stitchesHigh;
    effectiveApproximate = true;
  }

  const result = await tx.chart.create({
    data: {
      name: chart.name,
      designerId: chart.designerId,
      coverImageUrl: chart.coverImageUrl,
      coverThumbnailUrl: chart.coverThumbnailUrl,
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
          userId,
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

  // Create ChartFile records for uploaded files
  if (chart.fileKeys && chart.fileKeys.length > 0) {
    await tx.chartFile.createMany({
      data: chart.fileKeys.map((f) => ({
        chartId: result.id,
        url: f.key,
        filename: f.filename,
        mimeType: f.mimeType,
        fileSize: f.fileSize,
      })),
    });
  }

  // Link fabric to the new project if provided
  if (project.fabricId && result.project) {
    // Verify the fabric exists and belongs to this user (unlinked or linked to their project)
    const targetFabric = await tx.fabric.findUnique({
      where: { id: project.fabricId },
      select: { linkedProject: { select: { userId: true } } },
    });
    if (
      !targetFabric ||
      (targetFabric.linkedProject && targetFabric.linkedProject.userId !== userId)
    ) {
      throw new Error("Fabric not found");
    }
    await tx.fabric.update({
      where: { id: project.fabricId },
      data: { linkedProjectId: result.project.id },
    });
  }

  return result;
}

/** Generate cover thumbnail outside the transaction. Returns warning if it fails. */
async function handleThumbnail(
  chartId: string,
  coverImageUrl: string | null,
): Promise<string | undefined> {
  if (!coverImageUrl) return undefined;
  try {
    await generateThumbnail(chartId, coverImageUrl);
    return undefined;
  } catch (err) {
    console.error("Thumbnail generation failed (chart saved without thumbnail):", err);
    return "Thumbnail could not be generated";
  }
}

// ─── Exported Actions ────────────────────────────────────────────────────────

export async function createChart(formData: unknown) {
  const user = await requireAuth();

  try {
    const validated = chartFormSchema.parse(formData);

    const created = await prisma.$transaction(async (tx) => {
      return createChartAndProject(tx, validated, user.id);
    });

    const thumbnailWarning = await handleThumbnail(created.id, validated.chart.coverImageUrl);

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

/**
 * Creates a chart with project and batch supply records in a single $transaction.
 *
 * Combines chart+project creation (via shared helper) with bulk supply junction
 * inserts across all three tables: ProjectThread, ProjectBead, ProjectSpecialty.
 * Nothing is persisted until this atomic $transaction succeeds.
 */
export async function createChartWithSupplies(formData: unknown, supplyPayload: unknown) {
  const user = await requireAuth();

  try {
    const validated = chartFormSchema.parse(formData);
    const supplies = batchSupplySchema.parse(supplyPayload);

    const created = await prisma.$transaction(async (tx) => {
      const result = await createChartAndProject(tx, validated, user.id);

      // Batch insert supply junction records
      if (!result.project) {
        throw new Error("Project creation failed");
      }
      const projectId = result.project.id;

      if (supplies.threads.length > 0) {
        await tx.projectThread.createMany({
          data: supplies.threads.map((t) => ({
            projectId,
            threadId: t.supplyId,
            stitchCount: t.stitchCount,
            quantityRequired: t.need,
            quantityAcquired: 0,
            isNeedOverridden: t.isNeedOverridden,
          })),
          skipDuplicates: true,
        });
      }

      if (supplies.beads.length > 0) {
        await tx.projectBead.createMany({
          data: supplies.beads.map((b) => ({
            projectId,
            beadId: b.supplyId,
            quantityRequired: b.need,
            quantityAcquired: 0,
          })),
          skipDuplicates: true,
        });
      }

      if (supplies.specialty.length > 0) {
        await tx.projectSpecialty.createMany({
          data: supplies.specialty.map((s) => ({
            projectId,
            specialtyItemId: s.supplyId,
            quantityRequired: s.need,
            quantityAcquired: 0,
          })),
          skipDuplicates: true,
        });
      }

      return result;
    });

    const thumbnailWarning = await handleThumbnail(created.id, validated.chart.coverImageUrl);

    revalidatePath("/charts");
    revalidatePath("/fabric");
    return { success: true as const, chartId: created.id, warning: thumbnailWarning };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false as const, error: error.errors[0].message };
    }
    console.error("createChartWithSupplies error:", error);
    return { success: false as const, error: "Failed to create chart" };
  }
}

export async function updateChart(chartId: string, formData: unknown) {
  const user = await requireAuth();

  try {
    // Verify ownership and fetch current cover data for change detection and R2 cleanup
    const existing = await prisma.chart.findUnique({
      where: { id: chartId },
      select: {
        coverImageUrl: true,
        coverThumbnailUrl: true,
        project: { select: { id: true, userId: true } },
      },
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
        // Verify the fabric exists and belongs to this user (unlinked or linked to their project)
        const targetFabric = await tx.fabric.findUnique({
          where: { id: project.fabricId },
          select: { linkedProject: { select: { userId: true } } },
        });
        if (
          !targetFabric ||
          (targetFabric.linkedProject && targetFabric.linkedProject.userId !== user.id)
        ) {
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
      if (existing.coverImageUrl) {
        await deleteFile(existing.coverImageUrl).catch((err) =>
          console.warn("[R2] old cover cleanup failed:", existing.coverImageUrl, err),
        );
      }
      if (existing.coverThumbnailUrl) {
        await deleteFile(existing.coverThumbnailUrl).catch((err) =>
          console.warn("[R2] old thumbnail cleanup failed:", existing.coverThumbnailUrl, err),
        );
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
    revalidateTag("stats", { expire: 0 });
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
      files: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          url: true,
          filename: true,
          mimeType: true,
          fileSize: true,
          label: true,
          notes: true,
          createdAt: true,
        },
      },
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
      _count: { select: { files: true } },
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

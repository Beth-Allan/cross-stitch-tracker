"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireAuth } from "@/lib/auth-guard";
import { optimizeCoverImage } from "@/lib/actions/cover-optimization";
import { prisma } from "@/lib/db";
import { discardStoredObjects } from "@/lib/r2";
import { coverNeedsOptimizing } from "@/lib/utils/cover-keys";
import { keyOwnerSchema } from "@/lib/validations/upload";

/**
 * The one-off conversion of the covers already in the library.
 *
 * Cover optimization arrived forward-only: a cover shrinks when it is uploaded or
 * replaced, so every cover saved before that is still the full-size original the
 * phone produced. Converting them cannot happen in one request — hundreds of
 * charts, each a download, two `sharp` encodes and three R2 calls — so the work is
 * split the only way that needs no job table: **one chart per call**, with the
 * work list derived from the rows themselves. Closing the page stops the run, and
 * starting it again picks up exactly what is left, because "what is left" is a
 * question about the data and never about remembered progress.
 */

const CHART_NOT_FOUND = "Chart not found";

/**
 * The charts whose cover has not been through the optimizer, oldest name first.
 * Names come back with the ids so a failure can be reported as a chart Beth
 * recognises rather than as an id.
 */
export async function getCoversNeedingOptimization(): Promise<
  { success: true; charts: { id: string; name: string }[] } | { success: false; error: string }
> {
  const user = await requireAuth();

  try {
    const charts = await prisma.chart.findMany({
      where: { project: { userId: user.id }, coverImageUrl: { not: null } },
      select: { id: true, name: true, coverImageUrl: true, coverThumbnailUrl: true },
      orderBy: { name: "asc" },
    });

    return {
      success: true as const,
      charts: charts
        .filter((chart) => coverNeedsOptimizing(chart))
        .map(({ id, name }) => ({ id, name })),
    };
  } catch (error) {
    console.error("getCoversNeedingOptimization error:", error);
    return { success: false as const, error: "Could not check which cover photos need shrinking" };
  }
}

/**
 * Converts one chart's cover: the row is pointed at the derivatives first, and
 * only then do the objects it has stopped naming go. A cover whose object is
 * missing from storage leaves the row exactly as it was and comes back as an
 * error for the caller to report — a chart with a broken picture is Beth's to see,
 * never something to blank on her behalf.
 */
export async function optimizeExistingCover(
  chartId: string,
): Promise<{ success: true; status: "converted" | "skipped" } | { success: false; error: string }> {
  const user = await requireAuth();

  // The id becomes the owner segment of both derivative keys, so it is held to the
  // same grammar every other key segment is.
  if (!keyOwnerSchema.safeParse(chartId).success) {
    return { success: false as const, error: CHART_NOT_FOUND };
  }

  try {
    const chart = await prisma.chart.findUnique({
      where: { id: chartId },
      select: {
        id: true,
        coverImageUrl: true,
        coverThumbnailUrl: true,
        project: { select: { userId: true } },
      },
    });
    if (!chart || chart.project?.userId !== user.id) {
      return { success: false as const, error: CHART_NOT_FOUND };
    }
    if (!chart.coverImageUrl) {
      return { success: false as const, error: "This chart has no cover photo" };
    }
    if (!coverNeedsOptimizing(chart)) {
      return { success: true as const, status: "skipped" as const };
    }

    const previousKeys = [chart.coverImageUrl, chart.coverThumbnailUrl];
    const optimized = await optimizeCoverImage(chart.id, chart.coverImageUrl);
    if (!optimized.ok) {
      return { success: false as const, error: optimized.reason };
    }

    const stillNamed = new Set(
      [optimized.coverKey, optimized.thumbnailKey].filter((key): key is string => Boolean(key)),
    );
    await discardStoredObjects(
      previousKeys.map((key) => (key && !stillNamed.has(key) ? key : null)),
      `chart ${chart.id} superseded cover`,
    );

    revalidatePath("/charts");
    revalidatePath(`/charts/${chart.id}`);
    revalidateTag("stats", { expire: 0 });

    return { success: true as const, status: "converted" as const };
  } catch (error) {
    console.error("optimizeExistingCover error:", error);
    return { success: false as const, error: "Could not shrink this cover photo" };
  }
}

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

const CHART_NOT_FOUND = "it could not be found any more";

/**
 * What Beth is told when a chart is left alone, keyed by what the pipeline
 * reported. She is the only reader of this list, so it says why in her words —
 * anything unrecognised falls back rather than leaking an internal message into
 * the one place the run promises her a chart she knows.
 */
const PLAIN_REASONS: Record<string, string> = {
  "Original image not found in storage": "its photo is no longer in storage",
  "Image is too large to process": "its photo is too big to shrink",
  "That file is not a PNG, JPEG or WebP image": "its photo is not a picture this app can read",
  "Invalid storage key": "its photo is filed in a way this app does not recognise",
};

const UNRECOGNISED_REASON = "its photo could not be shrunk this time";

/**
 * The superseded keys this chart may actually delete. A row naming a *different*
 * chart's cover is possible in data written before the save path started
 * refusing it, and `coverNeedsOptimizing` deliberately puts such a row in the
 * work list — so without this the conversion would repoint chart-1 and then
 * delete chart-2's live picture. Same check the save path makes, same reason.
 */
async function unclaimedByAnyOtherChart(keys: string[], chartId: string): Promise<string[]> {
  if (keys.length === 0) return [];

  const claimants = await prisma.chart.findMany({
    where: {
      NOT: { id: chartId },
      OR: [{ coverImageUrl: { in: keys } }, { coverThumbnailUrl: { in: keys } }],
    },
    select: { coverImageUrl: true, coverThumbnailUrl: true },
  });
  const claimed = new Set(
    claimants.flatMap((chart) => [chart.coverImageUrl, chart.coverThumbnailUrl]),
  );
  return keys.filter((key) => !claimed.has(key));
}

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
      return { success: false as const, error: "it has no cover photo" };
    }
    if (!coverNeedsOptimizing(chart)) {
      return { success: true as const, status: "skipped" as const };
    }

    const previousKeys = [chart.coverImageUrl, chart.coverThumbnailUrl];
    const optimized = await optimizeCoverImage(chart.id, chart.coverImageUrl);
    if (!optimized.ok) {
      return {
        success: false as const,
        error: PLAIN_REASONS[optimized.reason] ?? UNRECOGNISED_REASON,
      };
    }

    const stillNamed = new Set(
      [optimized.coverKey, optimized.thumbnailKey].filter((key): key is string => Boolean(key)),
    );
    const superseded = previousKeys.filter(
      (key): key is string => key !== null && !stillNamed.has(key),
    );
    await discardStoredObjects(
      await unclaimedByAnyOtherChart(superseded, chart.id),
      `chart ${chart.id} superseded cover`,
    );

    revalidatePath("/charts");
    revalidatePath(`/charts/${chart.id}`);
    revalidateTag("stats", { expire: 0 });

    return { success: true as const, status: "converted" as const };
  } catch (error) {
    console.error("optimizeExistingCover error:", error);
    return { success: false as const, error: UNRECOGNISED_REASON };
  }
}

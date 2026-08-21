/**
 * The cover-image pipeline step shared by the save path and the one-off backfill
 * of the covers already in the library.
 *
 * Deliberately **not** a `"use server"` module: every export of one of those is a
 * callable POST endpoint, and `optimizeCoverImage` re-points a chart's row at keys
 * it was handed. It belongs to its callers, which resolve the chart from an
 * ownership-checked row first, and to nobody else.
 */
import { processAndStoreImage } from "@/lib/actions/upload-actions";
import { prisma } from "@/lib/db";
import { discardStoredObjects } from "@/lib/r2";

export const COVER_WARNING = "Cover photo saved, but a smaller copy could not be made";

export type CoverOptimizationOutcome =
  | { ok: true; coverKey: string; thumbnailKey: string | null }
  | { ok: false; reason: string };

/**
 * Puts a cover through the same pipeline session photos use — a 1200px WebP plus
 * a 400px thumbnail — and points the chart at both. On failure the row is left
 * naming exactly what it named before, so the caller's old keys are still live.
 *
 * `processAndStoreImage` signals failure by *returning*, not by throwing, so a
 * caller that only wrapped it in `try` would read every failure as a success and
 * go on to delete the objects the chart is still displaying.
 */
export async function optimizeCoverImage(
  chartId: string,
  rawKey: string,
): Promise<CoverOptimizationOutcome> {
  let result;
  try {
    result = await processAndStoreImage(chartId, rawKey, "covers");
  } catch (err) {
    console.error("Cover optimization failed (chart kept the raw upload):", err);
    return { ok: false, reason: "Failed to process image" };
  }

  if (!result.success) {
    console.error("Cover optimization failed (chart kept the raw upload):", result.error);
    return { ok: false, reason: result.error };
  }

  // The row names the derivatives before anything is deleted — the ordering that
  // keeps a chart from ever pointing at an object that is already gone.
  try {
    await prisma.chart.update({
      where: { id: chartId },
      data: { coverImageUrl: result.optimizedKey, coverThumbnailUrl: result.thumbnailKey },
    });
  } catch (err) {
    // On the save path the chart itself is already committed by now, so this
    // cannot fail the save — the caller would have the user save a second copy of
    // a chart that exists.
    console.error("Cover optimization could not be recorded (chart kept the raw upload):", err);
    // These two are named here and nowhere else. Dropping them now is the only
    // chance anything ever has to name them again.
    await discardStoredObjects(
      [result.optimizedKey, result.thumbnailKey],
      `chart ${chartId} unrecorded cover`,
    );
    return { ok: false, reason: "Failed to process image" };
  }

  return { ok: true, coverKey: result.optimizedKey, thumbnailKey: result.thumbnailKey };
}

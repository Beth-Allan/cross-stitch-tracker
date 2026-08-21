import { parseStorageKey } from "@/lib/validations/upload";

/**
 * Whether a chart's row still names a cover the optimizer has not been through.
 *
 * The test is the row, never the key's spelling. `processAndStoreImage` is the
 * only thing that writes a cover under the chart's own id — everything the form
 * uploads lands on `covers/unsaved/…`, because `CoverImageUpload` is never handed
 * a chart id — and it always writes the pair, so "both keys are in this chart's
 * namespace" is exactly the set it produced. Matching on `opt-` instead would call
 * any upload that happened to be named that way finished.
 *
 * A key this app's grammar does not recognise answers `true`, so the conversion
 * reports it rather than quietly skipping it.
 */
export function coverNeedsOptimizing(chart: {
  id: string;
  coverImageUrl: string | null;
  coverThumbnailUrl: string | null;
}): boolean {
  if (!chart.coverImageUrl) return false;
  const cover = parseStorageKey(chart.coverImageUrl);
  const thumbnail = parseStorageKey(chart.coverThumbnailUrl);
  return !(cover?.owner === chart.id && thumbnail?.owner === chart.id);
}

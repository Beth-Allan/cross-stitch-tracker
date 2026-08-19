/**
 * Stitching progress as a whole-number percentage for display.
 *
 * Clamped to 0–100 on purpose: logging past a project's total stitch count is
 * allowed (Beth's ruling, 2026-08-17 — a chart's own total is often the figure
 * that is wrong), but a progress display that reads 137% is a bug, not
 * information. Every surface that shows "% complete" goes through here so the
 * same project cannot read 100% on one screen and 137% on another.
 *
 * @param stitchesCompleted stitches logged against the project
 * @param totalStitches the chart's total stitch count (its effective count where
 *   one is derived from dimensions); 0 or less means "unknown", which shows 0%
 */
export function calculateProgressPercent(stitchesCompleted: number, totalStitches: number): number {
  if (totalStitches <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((stitchesCompleted / totalStitches) * 100)));
}

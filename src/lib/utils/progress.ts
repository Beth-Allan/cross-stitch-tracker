/**
 * Stitching progress as a whole-number percentage for display.
 *
 * Clamped to 0–100 on purpose: logging past a project's total stitch count is
 * allowed (Beth's ruling, 2026-08-17 — a chart's own total is often the figure
 * that is wrong), but a progress display that reads 137% is a bug, not
 * information. Every surface that shows "% complete" goes through here so the
 * same project cannot read 100% on one screen and 137% on another.
 *
 * **The denominator is the caller's, and callers do not all agree today.** The gallery
 * card, the chart hero and the designer/genre/series rows pass `getEffectiveStitchCount`
 * (which derives `wide × high` when `stitchCount` is 0); the dashboards, the session
 * picker and the completion estimates pass the raw `chart.stitchCount`. For a chart with
 * no stitch count but known dimensions those two disagree — a maintenance-ledger row
 * (2026-08-19) tracks picking one. This helper guarantees the arithmetic, not that two
 * screens were handed the same total.
 *
 * @param stitchesCompleted stitches logged against the project
 * @param totalStitches the total this caller measures against; 0 or less means
 *   "unknown", which shows 0%
 */
export function calculateProgressPercent(stitchesCompleted: number, totalStitches: number): number {
  if (totalStitches <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((stitchesCompleted / totalStitches) * 100)));
}

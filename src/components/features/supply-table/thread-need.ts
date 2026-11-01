import { calculateSkeins } from "@/lib/utils/skein-calculator";
import type { SkeinLine } from "@/types/supply";
import type { CalcParams, SupplyRow } from "./types";

/** Only what the calculator reads, so a row carries no more of the line than it needs. */
export function skeinLineOf(line: SkeinLine): SkeinLine {
  return { skeinLengthMm: line.skeinLengthMm, strandStructure: line.strandStructure };
}

/**
 * The need a thread row's stitch count works out to, or `null` when the thread's line has no
 * known length or strand structure (THR-011) — which is never clamped to 1, because a guessed
 * figure would read as a real one.
 *
 * A stitch count of 0 gives 1 on every line: that need was never worked out from a length, so
 * it starts at 1 for her to type. A figure that does come out (even 0, with no fabric count) is
 * held at 1, the least any supply needs.
 */
export function threadNeed(
  stitchCount: number,
  calcParams: CalcParams,
  line: SkeinLine | null,
): number | null {
  if (stitchCount <= 0) return 1;
  if (!line) return null;
  const skeins = calculateSkeins({ stitchCount, ...calcParams, line });
  return skeins === null ? null : Math.max(1, skeins);
}

/**
 * The figure "back to calculated" would give a row, or `null` when it has none to give: only a
 * thread marked as typed, with a stitch count, on a line the calculator can read. A typed need
 * is never swapped for Unknown, nor for the 1 a line with no stitch count starts at.
 */
export function calculatedNeedFor(row: SupplyRow, calcParams: CalcParams): number | null {
  if (row.type !== "THREAD" || !row.isNeedOverridden || row.stitchCount <= 0) return null;
  return threadNeed(row.stitchCount, calcParams, row.line);
}

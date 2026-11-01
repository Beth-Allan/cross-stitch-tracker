/**
 * Skein calculator for cross-stitch projects.
 *
 * Formula (CITED: mismatch.co.uk/cross.htm, thread-bare.com/tools — THR-006):
 *   stitches_per_skein = cuts * (usable inches per cut / (6/count)) * (working lengths per cut)
 *   where count = effectiveCount = fabricCount / overCount
 *
 * A stitch takes ≈ 6/count inches of thread. Six-strand floss (THR-008, THR-009) yields
 * 6/strands working lengths per cut, so the 6s cancel:
 *   stitches_per_skein = usableInches * effectiveCount / strands
 * A line used whole (THR-010, THR-013) yields ONE working length per cut, so its strand term
 * is 6 — the same as floss stitched with all six strands, never the project's strand count:
 *   stitches_per_skein = usableInches * effectiveCount / 6
 *
 * Inverted: skeins = stitches * strandTerm / (effectiveCount * usableInches) * wasteFactor
 *
 * usableInches comes from the thread's own line: its skein length in whole cuts of the length
 * Beth cuts from it, each about 3 inches short after tie-off (THR-016) — an 8 m DMC or Anchor
 * skein gives 13 24-inch cuts, 273 inches. These replace the cited source's 18-inch cut.
 * A line with no recorded length, strand structure or cut has no figure (THR-011, Q-009): the need
 * is unknown, never one worked out from a default.
 *
 * - effectiveCount = fabricCount / overCount (over 2 for evenweave/linen)
 * - wasteFactor covers movement between areas and mistakes (user-configurable)
 */

import type { SkeinLine, StrandCount } from "@/types/supply";

const TENTH_MM_PER_INCH = 254;
/** THR-016: what each length of floss or Kreinik loses, the two she has described. */
const INCHES_LOST_PER_CUT = 3;
const SIX_STRANDS = 6;

/**
 * Usable inches in one skein of the given length: whole cuts of the given length, never a
 * proportional share. Integer arithmetic, so a length that is an exact number of cuts stays exact.
 */
export function usableInchesPerSkein(skeinLengthMm: number, cutLengthInches: number): number {
  if (cutLengthInches <= INCHES_LOST_PER_CUT) return 0;
  const cuts = Math.floor((skeinLengthMm * 10) / (cutLengthInches * TENTH_MM_PER_INCH));
  return cuts * (cutLengthInches - INCHES_LOST_PER_CUT);
}

/**
 * Skeins (or spools) of one thread a project needs, or `null` when its line's length, strand
 * structure or cut is unknown — which every caller must show as unknown and count as still to buy.
 */
export function calculateSkeins(params: {
  stitchCount: number;
  strandCount: StrandCount;
  fabricCount: number; // stitches per inch (e.g., 14, 16, 18)
  overCount: 1 | 2;
  wastePercent: number; // 0-50, default 20
  line: SkeinLine;
}): number | null {
  const { stitchCount, strandCount, fabricCount, overCount, wastePercent, line } = params;
  if (
    line.skeinLengthMm === null ||
    line.strandStructure === null ||
    line.cutLengthInches === null
  ) {
    return null;
  }

  const usableInches = usableInchesPerSkein(line.skeinLengthMm, line.cutLengthInches);
  // Negated so that a field missing at runtime, which comes out as NaN, reads unknown as well
  if (!(usableInches > 0)) return null;
  if (stitchCount <= 0 || fabricCount <= 0 || strandCount <= 0) return 0;

  const strandTerm = line.strandStructure === "USED_WHOLE" ? SIX_STRANDS : strandCount;
  const effectiveCount = fabricCount / overCount;
  const wasteFactor = 1 + wastePercent / 100;
  const rawSkeins = (stitchCount * strandTerm * wasteFactor) / (effectiveCount * usableInches);
  return Math.ceil(rawSkeins);
}

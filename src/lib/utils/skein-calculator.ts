/**
 * Skein calculator for cross-stitch projects.
 *
 * Formula (CITED: mismatch.co.uk/cross.htm, thread-bare.com/tools — THR-006):
 *   stitches_per_skein = cuts * (15 / (6/count)) * (working lengths per cut)
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
 * usableInches comes from the thread's own line: its skein length in whole 18-inch cuts, each
 * ~15 inches after tie-off (THR-006) — an 8 m DMC or Anchor skein gives 17 cuts, 255 inches.
 * A line with no recorded length or strand structure has no figure (THR-011): the need is
 * unknown, never one worked out from a default length.
 *
 * - effectiveCount = fabricCount / overCount (over 2 for evenweave/linen)
 * - wasteFactor covers movement between areas and mistakes (user-configurable)
 */

import type { SkeinLine, StrandCount } from "@/types/supply";

/** THR-006: the cited source's cut, 18 inches, in tenths of a millimetre (25.4 mm per inch). */
const CUT_LENGTH_TENTH_MM = 18 * 254;
const USABLE_INCHES_PER_CUT = 15;
const SIX_STRANDS = 6;

/**
 * Usable inches in one skein of the given length: whole 18-inch cuts, never a proportional
 * share. Integer arithmetic, so 5 yd (4572 mm) is exactly ten cuts.
 */
export function usableInchesPerSkein(skeinLengthMm: number): number {
  const cuts = Math.floor((skeinLengthMm * 10) / CUT_LENGTH_TENTH_MM);
  return cuts * USABLE_INCHES_PER_CUT;
}

/**
 * Skeins (or spools) of one thread a project needs, or `null` when its line's length or strand
 * structure is unknown — which every caller must show as unknown and count as still to buy.
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
  if (line.skeinLengthMm === null || line.strandStructure === null) return null;

  const usableInches = usableInchesPerSkein(line.skeinLengthMm);
  if (usableInches <= 0) return null;
  if (stitchCount <= 0 || fabricCount <= 0 || strandCount <= 0) return 0;

  const strandTerm = line.strandStructure === "USED_WHOLE" ? SIX_STRANDS : strandCount;
  const effectiveCount = fabricCount / overCount;
  const wasteFactor = 1 + wastePercent / 100;
  const rawSkeins = (stitchCount * strandTerm * wasteFactor) / (effectiveCount * usableInches);
  return Math.ceil(rawSkeins);
}

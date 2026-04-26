/**
 * Skein calculator for cross-stitch projects.
 *
 * Formula (CITED: mismatch.co.uk/cross.htm, thread-bare.com/tools):
 *   stitches_per_skein = 17 * (15 / (6/count)) * (6/strands)
 *
 * The two 6's (geometric thread path ≈ 6/count inches per stitch, and
 * 6 strands per DMC skein yielding 6/strands working lengths per cut)
 * cancel, simplifying to: stitches_per_skein = 255 * effectiveCount / strands
 *
 * Inverted: skeins = stitches * strands / (effectiveCount * 255) * wasteFactor
 *
 * Constants:
 * - 8m DMC skein → 17 usable segments of 18", each ~15" after tie-off = 255"
 * - effectiveCount = fabricCount / overCount (over 2 for evenweave/linen)
 * - wasteFactor covers movement between areas and mistakes (user-configurable)
 */

const USABLE_INCHES_PER_SKEIN = 255; // 17 segments * 15 inches usable

export function calculateSkeins(params: {
  stitchCount: number;
  strandCount: number; // default 2, range 1-6
  fabricCount: number; // stitches per inch (e.g., 14, 16, 18)
  overCount: 1 | 2; // over 1 or over 2
  wastePercent: number; // 0-50, default 20
}): number {
  const { stitchCount, strandCount, fabricCount, overCount, wastePercent } = params;
  if (stitchCount <= 0 || fabricCount <= 0) return 0;

  const effectiveCount = fabricCount / overCount;
  const wasteFactor = 1 + wastePercent / 100;
  const rawSkeins =
    (stitchCount * strandCount * wasteFactor) / (effectiveCount * USABLE_INCHES_PER_SKEIN);
  return Math.ceil(rawSkeins);
}

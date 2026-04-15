/**
 * Skein calculator for cross-stitch projects.
 *
 * Formula derivation (CITED: thread-bare.com/tools, mismatch.co.uk/cross.htm):
 * 1. Each full cross stitch on fabric of count C (stitches/inch) uses
 *    approximately (6/C) inches of single-strand floss (Pythagorean theorem
 *    on the diagonal of 1/C inch square, doubled for full X).
 * 2. With S strands, each stitch uses S * (6/C) inches.
 * 3. For "over 2" stitching (common on evenweave/linen), each stitch spans
 *    2 fabric threads, so effective count = fabricCount / 2.
 *    For "over 1", effective count = fabricCount.
 * 4. A standard DMC skein = 8.7 yards = 313.2 inches.
 * 5. With 15% tie-off waste per 18" segment: ~17 usable segments per skein,
 *    each ~15" usable = 255 usable inches.
 * 6. Apply waste factor (default 20%) for movement between areas, mistakes.
 *
 * Simplified: skeins = ceil(stitches * strands * 6 / effectiveCount / 255 * (1 + waste))
 */

const USABLE_INCHES_PER_SKEIN = 255; // 17 segments * 15 inches usable
const INCHES_PER_STITCH_UNIT = 6; // ~6/count inches per single-strand stitch

export function calculateSkeins(params: {
  stitchCount: number;
  strandCount: number; // default 2, range 1-6
  fabricCount: number; // stitches per inch (e.g., 14, 16, 18)
  overCount: 1 | 2; // over 1 or over 2
  wastePercent: number; // 0-50, default 20
}): number {
  const { stitchCount, strandCount, fabricCount, overCount, wastePercent } = params;
  if (stitchCount <= 0) return 0;

  const effectiveCount = fabricCount / overCount;
  const threadPerStitch = (strandCount * INCHES_PER_STITCH_UNIT) / effectiveCount;
  const wasteFactor = 1 + wastePercent / 100;
  const rawSkeins = (stitchCount * threadPerStitch * wasteFactor) / USABLE_INCHES_PER_SKEIN;
  return Math.ceil(rawSkeins);
}

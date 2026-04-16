/**
 * Skein calculator for cross-stitch projects.
 *
 * Formula derivation (CITED: thread-bare.com/tools, mismatch.co.uk/cross.htm):
 * 1. Each full cross stitch on fabric of count C (stitches/inch) uses
 *    approximately (INCHES_PER_STITCH_UNIT / C) inches of single-strand floss.
 * 2. With S strands, each stitch uses S * (INCHES_PER_STITCH_UNIT / C) inches.
 * 3. For "over 2" stitching (common on evenweave/linen), each stitch spans
 *    2 fabric threads, so effective count = fabricCount / 2.
 *    For "over 1", effective count = fabricCount.
 * 4. A standard DMC skein = 8.7 yards = 313.2 inches.
 * 5. With 15% tie-off waste per 18" segment: ~17 usable segments per skein,
 *    each ~15" usable = 255 usable inches.
 * 6. Apply waste factor (default 20%) for movement between areas, mistakes.
 *
 * The constant 1.3 is derived empirically from cross-stitch community calculators:
 * on 14ct over 1, a single strand uses ~0.093 inches per stitch (1.3/14).
 * This accounts for the actual thread path through fabric holes (shorter than
 * the full diagonal traversal that a theoretical Pythagorean model predicts).
 *
 * Validation against community standard rule of thumb:
 * - 14ct over 1, 2 strands: ~1 skein per 1000 stitches
 * - 14ct over 2, 2 strands: ~2 skeins per 1000 stitches
 *
 * Simplified: skeins = ceil(stitches * strands * 1.3 / effectiveCount / 255 * (1 + waste))
 */

const USABLE_INCHES_PER_SKEIN = 255; // 17 segments * 15 inches usable
const INCHES_PER_STITCH_UNIT = 1.3; // empirical constant for thread path through fabric

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
  const threadPerStitch = (strandCount * INCHES_PER_STITCH_UNIT) / effectiveCount;
  const wasteFactor = 1 + wastePercent / 100;
  const rawSkeins = (stitchCount * threadPerStitch * wasteFactor) / USABLE_INCHES_PER_SKEIN;
  return Math.ceil(rawSkeins);
}

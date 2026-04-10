/**
 * Fabric size calculator for cross-stitch projects.
 *
 * Formula: (stitches / fabricCount) + 6 inches
 * The 6 inches provides a 3-inch margin on each side (per design spec D-20).
 */

const MARGIN_INCHES = 6;

export function calculateRequiredFabricSize(
  stitchesWide: number,
  stitchesHigh: number,
  fabricCount: number,
): { requiredWidthInches: number; requiredHeightInches: number } {
  return {
    requiredWidthInches: Math.round((stitchesWide / fabricCount + MARGIN_INCHES) * 100) / 100,
    requiredHeightInches: Math.round((stitchesHigh / fabricCount + MARGIN_INCHES) * 100) / 100,
  };
}

export function doesFabricFit(
  fabric: { shortestEdgeInches: number; longestEdgeInches: number },
  required: { requiredWidthInches: number; requiredHeightInches: number },
): boolean {
  const fitsNormal =
    fabric.shortestEdgeInches >= required.requiredWidthInches &&
    fabric.longestEdgeInches >= required.requiredHeightInches;
  const fitsRotated =
    fabric.longestEdgeInches >= required.requiredWidthInches &&
    fabric.shortestEdgeInches >= required.requiredHeightInches;
  return fitsNormal || fitsRotated;
}

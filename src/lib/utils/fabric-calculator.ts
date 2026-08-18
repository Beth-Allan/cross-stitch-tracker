/**
 * Fabric size calculator for cross-stitch projects — the single implementation.
 *
 * Formula (FAB-005): (stitches / effectiveCount) + 6 inches, a 3-inch margin on each side
 * (attributed to design spec D-20; the value itself is open question Q-005), where
 * effectiveCount = fabricCount / overCount (FAB-004) — stitching over two threads makes each
 * stitch span two of them, so 28ct linen worked over two sizes exactly like 14ct.
 *
 * `overCount` is the project's own setting and is always passed in: there is no default here,
 * because a silent default of 1 is exactly the shape of the bug this module used to carry.
 *
 * The requirement is returned **exact and unrounded**: it is a minimum, and a rounded-down
 * minimum silently accepts fabric that is too small. Rounding is a display decision and
 * belongs at the point of display.
 */

export const FABRIC_MARGIN_INCHES = 6;

/** Stitches per inch as actually worked: the fabric's count divided by the project's over-count. */
export function calculateEffectiveCount(fabricCount: number, overCount: 1 | 2): number {
  return fabricCount / overCount;
}

/** Exact fabric inches needed along one dimension, margin included. */
export function calculateRequiredFabricEdge(
  stitches: number,
  fabricCount: number,
  overCount: 1 | 2,
): number {
  return stitches / calculateEffectiveCount(fabricCount, overCount) + FABRIC_MARGIN_INCHES;
}

export function calculateRequiredFabricSize(
  stitchesWide: number,
  stitchesHigh: number,
  fabricCount: number,
  overCount: 1 | 2,
): { requiredWidthInches: number; requiredHeightInches: number } {
  return {
    requiredWidthInches: calculateRequiredFabricEdge(stitchesWide, fabricCount, overCount),
    requiredHeightInches: calculateRequiredFabricEdge(stitchesHigh, fabricCount, overCount),
  };
}

/**
 * Formats a requirement for display, rounded **up** to a tenth of an inch.
 *
 * A requirement is a minimum, so it is rounded away from zero: rounding to nearest would print
 * a number smaller than the one `doesFabricFit` enforces, and Beth would be told to buy a size
 * the app then rejects.
 */
export function formatRequiredInches(inches: number): string {
  return (Math.ceil(inches * 10) / 10).toFixed(1);
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

/**
 * How a stash piece stands against a project: FAB-007's three states.
 *
 * There are exactly three, not an N-way comparison — over two always needs more fabric than
 * over one, so "fits at over two but not at over one" cannot happen.
 */
export type FabricFitState = "fits" | "fits-over-one-only" | "too-small";

/**
 * Judges a stash piece against a project's requirement at the project's own over-count, and —
 * when it misses — says whether it would have fitted at over one.
 *
 * `"fits-over-one-only"` is a **qualifier, not a match** (FAB-007): the piece does not fit the
 * project as Beth has said she will stitch it, and nothing keyed to the project's real
 * over-count may count it as fitting. It exists because a project may not have a settled
 * over-count yet, so hiding the piece would assume a decision she has not made.
 */
export function classifyFabricFit(
  fabric: { shortestEdgeInches: number; longestEdgeInches: number },
  stitchesWide: number,
  stitchesHigh: number,
  fabricCount: number,
  overCount: 1 | 2,
): FabricFitState {
  const fitsAtProjectOverCount = doesFabricFit(
    fabric,
    calculateRequiredFabricSize(stitchesWide, stitchesHigh, fabricCount, overCount),
  );
  if (fitsAtProjectOverCount) return "fits";

  // Over one is already the smallest requirement, so an over-one project has no third state.
  if (overCount === 1) return "too-small";

  return doesFabricFit(
    fabric,
    calculateRequiredFabricSize(stitchesWide, stitchesHigh, fabricCount, 1),
  )
    ? "fits-over-one-only"
    : "too-small";
}

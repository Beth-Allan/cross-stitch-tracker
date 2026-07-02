export type OptionalFocalPoint =
  | { focalPointX: number; focalPointY: number }
  | { focalPointX: null; focalPointY: null };

/**
 * Maps raw Prisma focal point fields (independent nullable Ints) into a
 * validated both-or-neither union. Mismatched or missing inputs normalize
 * to the both-null variant.
 */
export function mapFocalPoint(
  x: number | null | undefined,
  y: number | null | undefined,
): OptionalFocalPoint {
  if (x != null && y != null) {
    return { focalPointX: x, focalPointY: y };
  }
  return { focalPointX: null, focalPointY: null };
}

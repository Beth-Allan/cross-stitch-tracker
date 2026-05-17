import type { CSSProperties } from "react";

/**
 * Converts stored focal point (0-1 normalized) to CSS object-position value.
 * Returns undefined when no focal point is set (browser defaults to 50% 50%).
 */
export function getObjectPositionStyle(
  focalPointX: number | null | undefined,
  focalPointY: number | null | undefined,
): CSSProperties | undefined {
  if (focalPointX == null || focalPointY == null) return undefined;
  return { objectPosition: `${focalPointX * 100}% ${focalPointY * 100}%` };
}

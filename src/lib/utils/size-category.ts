export type SizeCategory = "Mini" | "Small" | "Medium" | "Large" | "BAP";

export function calculateSizeCategory(stitchCount: number): SizeCategory {
  if (stitchCount >= 50_000) return "BAP";
  if (stitchCount >= 25_000) return "Large";
  if (stitchCount >= 5_000) return "Medium";
  if (stitchCount >= 1_000) return "Small";
  return "Mini";
}

export function getEffectiveStitchCount(
  stitchCount: number,
  stitchesWide: number,
  stitchesHigh: number,
): { count: number; approximate: boolean } {
  if (stitchCount > 0) return { count: stitchCount, approximate: false };
  if (stitchesWide > 0 && stitchesHigh > 0)
    return { count: stitchesWide * stitchesHigh, approximate: true };
  return { count: 0, approximate: false };
}

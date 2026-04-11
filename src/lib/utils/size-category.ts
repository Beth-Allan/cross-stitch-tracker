export type SizeCategory = "Mini" | "Small" | "Medium" | "Large" | "BAP";

export const SIZE_COLORS: Record<SizeCategory, { bg: string; text: string }> = {
  Mini: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-300" },
  Small: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-300" },
  Medium: { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-300" },
  Large: {
    bg: "bg-orange-100 dark:bg-orange-900/30",
    text: "text-orange-700 dark:text-orange-300",
  },
  BAP: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-300" },
};

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

import { calculateSizeCategory, getEffectiveStitchCount } from "@/lib/utils/size-category";
import type { SizeCategory } from "@/lib/utils/size-category";

const SIZE_COLORS: Record<SizeCategory, { bg: string; text: string }> = {
  Mini: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-300" },
  Small: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-300" },
  Medium: { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-300" },
  Large: {
    bg: "bg-orange-100 dark:bg-orange-900/30",
    text: "text-orange-700 dark:text-orange-300",
  },
  BAP: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-300" },
};

interface SizeBadgeProps {
  stitchCount: number;
  stitchesWide?: number;
  stitchesHigh?: number;
}

export function SizeBadge({ stitchCount, stitchesWide = 0, stitchesHigh = 0 }: SizeBadgeProps) {
  const { count } = getEffectiveStitchCount(stitchCount, stitchesWide, stitchesHigh);

  if (count === 0) return null;

  const category = calculateSizeCategory(count);
  const colors = SIZE_COLORS[category];

  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase ${colors.bg} ${colors.text}`}
    >
      {category}
    </span>
  );
}

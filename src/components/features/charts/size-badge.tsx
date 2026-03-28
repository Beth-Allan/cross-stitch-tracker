import {
  calculateSizeCategory,
  getEffectiveStitchCount,
} from "@/lib/utils/size-category";

interface SizeBadgeProps {
  stitchCount: number;
  stitchesWide?: number;
  stitchesHigh?: number;
}

export function SizeBadge({
  stitchCount,
  stitchesWide = 0,
  stitchesHigh = 0,
}: SizeBadgeProps) {
  const { count } = getEffectiveStitchCount(
    stitchCount,
    stitchesWide,
    stitchesHigh,
  );

  if (count === 0) return null;

  const category = calculateSizeCategory(count);

  return (
    <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
      {category}
    </span>
  );
}

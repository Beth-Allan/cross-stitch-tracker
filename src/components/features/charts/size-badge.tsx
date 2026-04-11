import { calculateSizeCategory, getEffectiveStitchCount, SIZE_COLORS } from "@/lib/utils/size-category";

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

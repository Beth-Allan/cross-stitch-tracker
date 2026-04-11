"use client";

import { Input } from "@/components/ui/input";
import { FormField } from "./form-field";
import { calculateSizeCategory, getEffectiveStitchCount, SIZE_COLORS } from "@/lib/utils/size-category";

interface StitchCountFieldsProps {
  stitchesWide: number;
  stitchesHigh: number;
  stitchCount: number;
  onWidthChange: (value: string) => void;
  onHeightChange: (value: string) => void;
  onCountChange: (value: string) => void;
  errors?: {
    stitchesWide?: string;
    stitchesHigh?: string;
    stitchCount?: string;
  };
}

export function StitchCountFields({
  stitchesWide,
  stitchesHigh,
  stitchCount,
  onWidthChange,
  onHeightChange,
  onCountChange,
  errors,
}: StitchCountFieldsProps) {
  const { count: effectiveCount, approximate: isAutoCalculated } = getEffectiveStitchCount(
    stitchCount,
    stitchesWide,
    stitchesHigh,
  );
  const sizeCategory = effectiveCount > 0 ? calculateSizeCategory(effectiveCount) : null;

  const hint = isAutoCalculated
    ? `Auto-calculated from ${stitchesWide.toLocaleString()} × ${stitchesHigh.toLocaleString()}. Clear to enter an exact count.`
    : "Leave empty to auto-calculate from dimensions";

  return (
    <div className="space-y-4">
      <FormField label="Dimensions (stitches)" htmlFor="stitches-wide" error={errors?.stitchesWide}>
        <div className="flex items-center gap-2">
          <Input
            id="stitches-wide"
            type="number"
            min={0}
            value={stitchesWide || ""}
            onChange={(e) => onWidthChange(e.target.value)}
            placeholder="Width"
            className="flex-1"
          />
          <span className="text-muted-foreground shrink-0 px-2 text-sm">w ×</span>
          <Input
            id="stitches-high"
            type="number"
            min={0}
            value={stitchesHigh || ""}
            onChange={(e) => onHeightChange(e.target.value)}
            placeholder="Height"
            className="flex-1"
          />
          <span className="text-muted-foreground shrink-0 px-2 text-sm">h</span>
        </div>
      </FormField>

      <FormField
        label="Total Stitch Count"
        htmlFor="stitch-count"
        hint={hint}
        error={errors?.stitchCount}
      >
        <Input
          id="stitch-count"
          type="number"
          min={0}
          value={stitchCount || ""}
          onChange={(e) => onCountChange(e.target.value)}
          placeholder={isAutoCalculated ? effectiveCount.toLocaleString() : "0"}
        />
        {effectiveCount > 0 && sizeCategory && (
          <div className="mt-2 flex items-center gap-2">
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${SIZE_COLORS[sizeCategory].bg} ${SIZE_COLORS[sizeCategory].text}`}
            >
              {sizeCategory}
            </span>
            {isAutoCalculated && (
              <span className="bg-secondary/10 text-secondary rounded-full px-2 py-0.5 text-[10px] font-medium">
                Auto-calculated
              </span>
            )}
          </div>
        )}
      </FormField>
    </div>
  );
}

"use client";

import { Input } from "@/components/ui/input";
import { FormField } from "./form-field";
import {
  calculateSizeCategory,
  getEffectiveStitchCount,
  SIZE_COLORS,
} from "@/lib/utils/size-category";

interface StitchCountFieldsProps {
  stitchesWide: number;
  stitchesHigh: number;
  stitchCount: number;
  onWidthChange: (value: string) => void;
  onHeightChange: (value: string) => void;
  onCountChange: (value: string) => void;
  /** null when the supply-total query failed -- 0 means the project genuinely has no supplies */
  supplyStitchTotal?: number | null;
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
  supplyStitchTotal,
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
      <FormField
        label="Dimensions (stitches)"
        htmlFor="stitches-wide"
        required
        error={errors?.stitchesWide}
      >
        <div className="flex items-center gap-2">
          <Input
            id="stitches-wide"
            type="number"
            min={0}
            value={stitchesWide || ""}
            onChange={(e) => onWidthChange(e.target.value)}
            placeholder="Width"
            className="flex-1"
            aria-describedby={errors?.stitchesWide ? "stitches-wide-error" : undefined}
          />
          <span className="text-muted-foreground shrink-0 px-1 text-sm">×</span>
          <Input
            id="stitches-high"
            type="number"
            min={0}
            value={stitchesHigh || ""}
            onChange={(e) => onHeightChange(e.target.value)}
            placeholder="Height"
            aria-label="Height (stitches)"
            className="flex-1"
          />
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
          aria-describedby={
            [
              errors?.stitchCount && "stitch-count-error",
              "stitch-count-hint",
              (supplyStitchTotal === null || (supplyStitchTotal ?? 0) > 0) &&
                "stitch-count-supply-hint",
            ]
              .filter(Boolean)
              .join(" ") || undefined
          }
        />
        {effectiveCount > 0 && sizeCategory && (
          <div className="mt-2 flex items-center gap-2">
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-bold uppercase ${SIZE_COLORS[sizeCategory].bg} ${SIZE_COLORS[sizeCategory].text}`}
            >
              {sizeCategory}
            </span>
            {isAutoCalculated && (
              <span className="bg-secondary/10 text-secondary rounded-full px-2 py-0.5 text-xs font-medium">
                Auto-calculated
              </span>
            )}
          </div>
        )}
        {supplyStitchTotal === null && (
          <p id="stitch-count-supply-hint" className="text-muted-foreground mt-1.5 text-xs">
            Supply total couldn&apos;t load. Try refreshing the page.
          </p>
        )}
        {supplyStitchTotal != null && supplyStitchTotal > 0 && (
          <p id="stitch-count-supply-hint" className="text-muted-foreground mt-1.5 text-xs">
            Supply total: {supplyStitchTotal.toLocaleString()} stitches
          </p>
        )}
      </FormField>
    </div>
  );
}

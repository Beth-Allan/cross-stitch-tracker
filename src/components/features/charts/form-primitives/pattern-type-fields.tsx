"use client";

import { useId } from "react";
import { Input } from "@/components/ui/input";
import { FormField } from "./form-field";
import { StyledCheckbox } from "./styled-checkbox";

interface PatternTypeFieldsProps {
  isPaperChart: boolean;
  isFormalKit: boolean;
  isSAL: boolean;
  kitColorCount: number | null;
  onFormatChange: (isPaper: boolean) => void;
  onFormalKitChange: (checked: boolean) => void;
  onSALChange: (checked: boolean) => void;
  onKitColorCountChange: (value: string) => void;
  errors?: { kitColorCount?: string };
}

export function PatternTypeFields({
  isPaperChart,
  isFormalKit,
  isSAL,
  kitColorCount,
  onFormatChange,
  onFormalKitChange,
  onSALChange,
  onKitColorCountChange,
  errors,
}: PatternTypeFieldsProps) {
  const groupId = useId();

  return (
    <div className="space-y-3">
      <fieldset>
        <legend className="sr-only">Chart Format</legend>
        <div className="flex gap-4">
          <label className="text-foreground flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="radio"
              name={groupId}
              checked={!isPaperChart}
              onChange={() => onFormatChange(false)}
              className="accent-primary"
            />
            Digital Chart
          </label>
          <label className="text-foreground flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="radio"
              name={groupId}
              checked={isPaperChart}
              onChange={() => onFormatChange(true)}
              className="accent-primary"
            />
            Paper Chart
          </label>
        </div>
      </fieldset>

      <div className="space-y-2">
        <StyledCheckbox
          checked={isFormalKit}
          onChange={(checked) => {
            onFormalKitChange(checked);
            if (!checked) onKitColorCountChange("");
          }}
          label="Formal Kit"
        />
        {isFormalKit && (
          <div className="ml-6">
            <FormField label="Kit Colours" htmlFor="kit-color-count" error={errors?.kitColorCount}>
              <Input
                id="kit-color-count"
                type="number"
                min={1}
                value={kitColorCount ?? ""}
                onChange={(e) => onKitColorCountChange(e.target.value)}
                placeholder="Number of colours"
                className="max-w-[200px]"
              />
            </FormField>
          </div>
        )}
      </div>

      <StyledCheckbox checked={isSAL} onChange={onSALChange} label="SAL (Stitch-Along)" />
    </div>
  );
}

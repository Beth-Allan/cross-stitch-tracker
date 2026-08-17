"use client";

import { useCallback } from "react";
import { SearchableSelect } from "./searchable-select";
import { EditableNumber } from "@/components/features/charts/editable-number";
import type { CalcParams, FabricOption } from "@/components/features/supply-table/types";
import { isStrandCount } from "@/types/supply";

interface CalculatorCardProps {
  calcParams: CalcParams;
  onCalcParamsChange: (params: CalcParams) => void;
  fabricId: string | null;
  onFabricChange: (fabricId: string | null, fabricCount?: number) => void;
  /** null when the fabric query failed -- [] means there is genuinely no unassigned fabric */
  fabricOptions: FabricOption[] | null;
}

export function CalculatorCard({
  calcParams,
  onCalcParamsChange,
  fabricId,
  onFabricChange,
  fabricOptions,
}: CalculatorCardProps) {
  const handleFabricSelect = useCallback(
    (value: string | null) => {
      const fabric = fabricOptions?.find((f) => f.value === value);
      // Parent's onFabricChange handles both fabricId and fabricCount update
      onFabricChange(value, fabric?.count);
    },
    [fabricOptions, onFabricChange],
  );

  const handleOverChange = useCallback(
    (over: 1 | 2) => {
      onCalcParamsChange({ ...calcParams, overCount: over });
    },
    [calcParams, onCalcParamsChange],
  );

  const handleStrandsChange = useCallback(
    (value: number) => {
      if (isStrandCount(value)) {
        onCalcParamsChange({ ...calcParams, strandCount: value });
      }
    },
    [calcParams, onCalcParamsChange],
  );

  const handleWasteChange = useCallback(
    (value: number) => {
      onCalcParamsChange({ ...calcParams, wastePercent: value });
    },
    [calcParams, onCalcParamsChange],
  );

  const handleFabricCountChange = useCallback(
    (value: number) => {
      onCalcParamsChange({ ...calcParams, fabricCount: value });
    },
    [calcParams, onCalcParamsChange],
  );

  return (
    <div
      role="group"
      aria-label="Skein calculator settings"
      className="border-border bg-card rounded-lg border p-4"
    >
      <h3 className="text-foreground mb-3 text-sm font-semibold">Skein Calculator</h3>

      <div className="mb-3">
        <SearchableSelect
          options={(fabricOptions ?? []).map((f) => ({
            value: f.value,
            label: f.label,
          }))}
          value={fabricId}
          onChange={handleFabricSelect}
          placeholder={fabricOptions === null ? "Couldn't load your fabric" : "Select fabric..."}
          emptyMessage={
            fabricOptions === null
              ? "Couldn't load your fabric. Try refreshing the page."
              : undefined
          }
        />
      </div>

      <div className="flex flex-wrap gap-x-6 gap-y-3">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
            STRANDS
          </span>
          <EditableNumber
            value={calcParams.strandCount}
            onSave={handleStrandsChange}
            ariaLabel="Strand count"
            min={1}
            max={6}
            className="text-foreground text-sm font-medium"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
            OVER
          </span>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => handleOverChange(1)}
              aria-pressed={calcParams.overCount === 1}
              aria-label="Stitch over 1 thread"
              className={`min-h-8 min-w-8 rounded px-2 py-1 text-sm font-medium transition-colors ${
                calcParams.overCount === 1
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground hover:bg-accent"
              }`}
            >
              1
            </button>
            <button
              type="button"
              onClick={() => handleOverChange(2)}
              aria-pressed={calcParams.overCount === 2}
              aria-label="Stitch over 2 threads"
              className={`min-h-8 min-w-8 rounded px-2 py-1 text-sm font-medium transition-colors ${
                calcParams.overCount === 2
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground hover:bg-accent"
              }`}
            >
              2
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
            COUNT
          </span>
          <EditableNumber
            value={calcParams.fabricCount}
            onSave={handleFabricCountChange}
            ariaLabel="Fabric count"
            min={1}
            max={40}
            className="text-foreground text-sm font-medium"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
            WASTE
          </span>
          <EditableNumber
            value={calcParams.wastePercent}
            onSave={handleWasteChange}
            ariaLabel="Waste percentage"
            min={0}
            max={50}
            formatDisplay={(v) => `${v}%`}
            className="text-foreground text-sm font-medium"
          />
        </div>
      </div>
    </div>
  );
}

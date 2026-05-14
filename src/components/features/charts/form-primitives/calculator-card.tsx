"use client";

import { useCallback } from "react";
import { SearchableSelect } from "./searchable-select";
import { EditableNumber } from "@/components/features/charts/editable-number";
import type { CalcParams } from "@/components/features/supply-table/types";

interface FabricOption {
  value: string;
  label: string;
  count: number;
}

interface CalculatorCardProps {
  calcParams: CalcParams;
  onCalcParamsChange: (params: CalcParams) => void;
  fabricId: string | null;
  onFabricChange: (fabricId: string | null, fabricCount?: number) => void;
  fabricOptions: FabricOption[];
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
      const fabric = fabricOptions.find((f) => f.value === value);
      onFabricChange(value, fabric?.count);
      // Auto-fill fabricCount when fabric is selected (D-10)
      if (fabric?.count) {
        onCalcParamsChange({ ...calcParams, fabricCount: fabric.count });
      }
    },
    [fabricOptions, onFabricChange, onCalcParamsChange, calcParams],
  );

  const handleOverChange = useCallback(
    (over: 1 | 2) => {
      onCalcParamsChange({ ...calcParams, overCount: over });
    },
    [calcParams, onCalcParamsChange],
  );

  const handleStrandsChange = useCallback(
    (value: number) => {
      onCalcParamsChange({ ...calcParams, strandCount: value });
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
      className="rounded-lg border border-border bg-card p-4"
    >
      <h3 className="text-foreground mb-3 text-sm font-semibold">
        Skein Calculator
      </h3>

      {/* Fabric row */}
      <div className="mb-3">
        <SearchableSelect
          options={fabricOptions.map((f) => ({
            value: f.value,
            label: f.label,
          }))}
          value={fabricId}
          onChange={handleFabricSelect}
          placeholder="Select fabric..."
        />
      </div>

      {/* Controls row */}
      <div className="flex flex-wrap gap-x-6 gap-y-3">
        {/* Strands */}
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-[11px] font-semibold uppercase tracking-wider">
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

        {/* Over */}
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-[11px] font-semibold uppercase tracking-wider">
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

        {/* Fabric Count */}
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-[11px] font-semibold uppercase tracking-wider">
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

        {/* Waste */}
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-[11px] font-semibold uppercase tracking-wider">
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

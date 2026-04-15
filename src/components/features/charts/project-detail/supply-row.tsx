"use client";

import { useState, useCallback, useTransition } from "react";
import { Calculator, Trash2, Check, AlertTriangle, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { EditableNumber } from "@/components/features/charts/editable-number";
import { calculateSkeins } from "@/lib/utils/skein-calculator";
import { updateProjectSupplyQuantity } from "@/lib/actions/supply-actions";
import type { CalculatorSettings, SupplyRowData } from "./types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function needsBorder(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.85;
}

const numberFormatter = new Intl.NumberFormat();

// ─── Types ────────────────────────────────────────────────────────────────────

interface SupplyRowProps {
  data: SupplyRowData;
  settings: CalculatorSettings;
  onRemove: (id: string) => void;
  onStitchCountChange?: (id: string, newCount: number) => void;
}

// ─── Unit Labels ──────────────────────────────────────────────────────────────

function getUnitLabel(type: SupplyRowData["type"]): string {
  switch (type) {
    case "thread":
      return "skeins";
    case "bead":
      return "packages";
    case "specialty":
      return "qty";
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SupplyRow({ data, settings, onRemove, onStitchCountChange }: SupplyRowProps) {
  const [isPending, startTransition] = useTransition();
  const [localData, setLocalData] = useState(data);

  // Recalculate when props change
  const currentData = isPending ? localData : data;

  const isThread = data.type === "thread";
  const showStitchCalculation = isThread;

  // Calculate skeins from current settings
  const calculatedNeed =
    showStitchCalculation && currentData.stitchCount > 0
      ? calculateSkeins({
          stitchCount: currentData.stitchCount,
          strandCount: settings.strandCount,
          fabricCount: settings.fabricCount,
          overCount: settings.overCount,
          wastePercent: settings.wastePercent,
        })
      : undefined;

  const showCalcIndicator =
    showStitchCalculation && currentData.stitchCount > 0 && !currentData.isNeedOverridden;

  const showOverrideWarning =
    showStitchCalculation &&
    currentData.isNeedOverridden &&
    calculatedNeed !== undefined &&
    calculatedNeed !== currentData.quantityRequired;

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleStitchCountSave = useCallback(
    (newCount: number) => {
      const newCalcNeed = calculateSkeins({
        stitchCount: newCount,
        strandCount: settings.strandCount,
        fabricCount: settings.fabricCount,
        overCount: settings.overCount,
        wastePercent: settings.wastePercent,
      });

      if (currentData.isNeedOverridden) {
        // Keep the manual override, just update stitch count
        const optimistic = { ...currentData, stitchCount: newCount };
        setLocalData(optimistic);
        startTransition(async () => {
          try {
            const result = await updateProjectSupplyQuantity(data.id, data.type, {
              stitchCount: newCount,
            });
            if (!result.success) {
              setLocalData(data);
              toast.error("Couldn't save supply changes. Please try again.");
            }
          } catch {
            setLocalData(data);
            toast.error("Couldn't save supply changes. Please try again.");
          }
        });
      } else {
        // Auto-update Need to calculated value
        const optimistic = {
          ...currentData,
          stitchCount: newCount,
          quantityRequired: newCalcNeed,
          isNeedOverridden: false,
        };
        setLocalData(optimistic);
        startTransition(async () => {
          try {
            const result = await updateProjectSupplyQuantity(data.id, data.type, {
              stitchCount: newCount,
              quantityRequired: newCalcNeed,
              isNeedOverridden: false,
            });
            if (!result.success) {
              setLocalData(data);
              toast.error("Couldn't save supply changes. Please try again.");
            }
          } catch {
            setLocalData(data);
            toast.error("Couldn't save supply changes. Please try again.");
          }
        });
      }

      onStitchCountChange?.(data.id, newCount);
    },
    [currentData, data, settings, onStitchCountChange],
  );

  const handleNeedSave = useCallback(
    (newNeed: number) => {
      const optimistic = {
        ...currentData,
        quantityRequired: newNeed,
        isNeedOverridden: true,
      };
      setLocalData(optimistic);
      startTransition(async () => {
        try {
          const result = await updateProjectSupplyQuantity(data.id, data.type, {
            quantityRequired: newNeed,
            isNeedOverridden: true,
          });
          if (!result.success) {
            setLocalData(data);
            toast.error("Couldn't save supply changes. Please try again.");
          }
        } catch {
          setLocalData(data);
          toast.error("Couldn't save supply changes. Please try again.");
        }
      });
    },
    [currentData, data],
  );

  const handleHaveSave = useCallback(
    (newHave: number) => {
      const optimistic = { ...currentData, quantityAcquired: newHave };
      setLocalData(optimistic);
      startTransition(async () => {
        try {
          const result = await updateProjectSupplyQuantity(data.id, data.type, {
            quantityAcquired: newHave,
          });
          if (!result.success) {
            setLocalData(data);
            toast.error("Couldn't save supply changes. Please try again.");
          }
        } catch {
          setLocalData(data);
          toast.error("Couldn't save supply changes. Please try again.");
        }
      });
    },
    [currentData, data],
  );

  const handleAcceptCalc = useCallback(() => {
    if (calculatedNeed === undefined) return;
    const optimistic = {
      ...currentData,
      quantityRequired: calculatedNeed,
      isNeedOverridden: false,
    };
    setLocalData(optimistic);
    startTransition(async () => {
      try {
        const result = await updateProjectSupplyQuantity(data.id, data.type, {
          quantityRequired: calculatedNeed,
          isNeedOverridden: false,
        });
        if (!result.success) {
          setLocalData(data);
          toast.error("Couldn't save supply changes. Please try again.");
        }
      } catch {
        setLocalData(data);
        toast.error("Couldn't save supply changes. Please try again.");
      }
    });
  }, [calculatedNeed, currentData, data]);

  // ─── Fulfillment Status ───────────────────────────────────────────────────

  const isFulfilled = currentData.quantityAcquired >= currentData.quantityRequired;
  const isPartial = currentData.quantityAcquired > 0 && !isFulfilled;

  // ─── Color Swatch ─────────────────────────────────────────────────────────

  const hexColor = currentData.hexColor ?? "#808080";
  const isLightColor = needsBorder(hexColor);

  return (
    <div className="group border-border flex flex-col gap-1 border-b py-3 last:border-b-0">
      {/* Line 1: Identity + actions */}
      <div className="flex items-center gap-2">
        {/* Color swatch */}
        <div
          className={`h-5 w-5 shrink-0 rounded-sm ${isLightColor ? "border-border border" : ""}`}
          style={{ backgroundColor: hexColor }}
          aria-hidden="true"
        />

        {/* Code + Name */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm">
            <span className="font-mono font-semibold">
              {currentData.brandName} {currentData.code}
            </span>
            <span className="text-muted-foreground"> — {currentData.name}</span>
          </p>
        </div>

        {/* Trash icon */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger
              onClick={() => onRemove(data.id)}
              className="flex min-h-11 min-w-11 shrink-0 items-center justify-center opacity-40 transition-opacity group-hover:opacity-100 focus:opacity-100"
              aria-label={`Remove ${currentData.name}`}
            >
              <Trash2 className="text-muted-foreground hover:text-destructive size-4 transition-colors" />
            </TooltipTrigger>
            <TooltipContent>Remove {currentData.name}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Line 2: Numbers */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pl-7 text-sm">
        {/* Stitch count + calculated skeins (threads only) */}
        {showStitchCalculation && (
          <div className="text-muted-foreground flex items-center gap-1.5">
            <EditableNumber
              value={currentData.stitchCount}
              onSave={handleStitchCountSave}
              ariaLabel={`Stitch count for ${currentData.brandName} ${currentData.code}`}
              className="text-foreground"
              formatDisplay={(v) => numberFormatter.format(v)}
            />
            <span className="text-xs">stitches</span>
            {currentData.stitchCount > 0 && calculatedNeed !== undefined && (
              <>
                <ArrowRight className="size-3" />
                <span className="font-mono tabular-nums">{calculatedNeed}</span>
                <span className="text-xs">{getUnitLabel(data.type)}</span>
              </>
            )}
          </div>
        )}

        {/* Divider */}
        {showStitchCalculation && currentData.stitchCount > 0 && (
          <span className="text-border hidden md:inline">|</span>
        )}

        {/* Need */}
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground text-xs">Need:</span>
          <EditableNumber
            value={currentData.quantityRequired}
            onSave={handleNeedSave}
            ariaLabel={`Quantity needed for ${currentData.brandName} ${currentData.code}`}
            className="text-foreground font-medium"
            min={1}
          />
          {/* Auto-calc indicator */}
          {showCalcIndicator && (
            <span aria-label="Auto-calculated">
              <Calculator className="text-muted-foreground size-3" />
            </span>
          )}
        </div>

        {/* Override warning */}
        {showOverrideWarning && calculatedNeed !== undefined && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger
                onClick={handleAcceptCalc}
                className="text-warning cursor-pointer text-xs hover:underline"
              >
                Calc: {calculatedNeed}
              </TooltipTrigger>
              <TooltipContent>
                Recalculated value is {calculatedNeed} skeins. Click to accept.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {/* Divider */}
        <span className="text-border hidden md:inline">|</span>

        {/* Have */}
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground text-xs">Have:</span>
          <EditableNumber
            value={currentData.quantityAcquired}
            onSave={handleHaveSave}
            ariaLabel={`Quantity acquired for ${currentData.brandName} ${currentData.code}`}
            className={`font-medium ${isFulfilled ? "text-success" : "text-foreground"}`}
          />
        </div>

        {/* Fulfillment icon */}
        <div className="shrink-0">
          {isFulfilled && <Check className="text-success size-4" aria-label="All acquired" />}
          {isPartial && (
            <AlertTriangle
              className="text-warning size-4"
              aria-label={`${currentData.quantityAcquired} of ${currentData.quantityRequired} acquired`}
            />
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { ArrowRight, RotateCcw, Sparkles, Trash2 } from "lucide-react";
import { ColorSwatch } from "@/components/features/supplies/color-swatch";
import { EditableNumber } from "./editable-number";
import { StatusDonut } from "./status-donut";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import type { SupplyRow, SupplyType } from "./types";

const UNIT_LABELS: Record<SupplyType, string> = {
  THREAD: "sk",
  BEAD: "pkg",
  SPECIALTY: "item",
};

interface SupplyTableDataRowProps {
  row: SupplyRow;
  onUpdateQuantity: (
    type: SupplyType,
    junctionId: string,
    field: "stitchCount" | "need" | "have",
    value: number,
  ) => void | Promise<boolean>;
  onDelete: (type: SupplyType, junctionId: string) => void;
  isNew?: boolean;
  /** What "back to calculated" would give this row; null when it has nothing to give. */
  calculatedNeed?: number | null;
  onBackToCalculated?: (junctionId: string, need: number) => void;
}

export function SupplyTableDataRow({
  row,
  onUpdateQuantity,
  onDelete,
  isNew,
  calculatedNeed,
  onBackToCalculated,
}: SupplyTableDataRowProps) {
  const showStitches = row.type === "THREAD" || row.type === "BEAD";
  const showAutoCalc = row.type === "THREAD" && !row.isNeedOverridden;
  // An unknown need is worked out by re-entering the stitch count, even the same number
  const stitchReentryRecalculates = row.need === null;

  return (
    <tr className={`group ${isNew ? "animate-slide-in" : ""}`}>
      <td className="border-muted border-b px-3 py-[5px]">
        <div className="flex items-center gap-2">
          <ColorSwatch hexColor={row.hexColor} size="sm" />
          {row.brandName && (
            <span className="text-muted-foreground text-xs whitespace-nowrap">{row.brandName}</span>
          )}
          <span className="font-mono text-xs font-semibold whitespace-nowrap">{row.code}</span>
          <span className="text-muted-foreground truncate text-xs">{row.name}</span>
        </div>
      </td>

      <td className="border-muted border-b px-3 py-[5px] [font-variant-numeric:tabular-nums]">
        {row.type === "THREAD" && (
          <EditableNumber
            value={row.stitchCount}
            onSave={(v) => onUpdateQuantity(row.type, row.id, "stitchCount", v)}
            ariaLabel={`Stitches for ${row.code}`}
            saveUnchanged={stitchReentryRecalculates}
          />
        )}
        {row.type === "BEAD" && (
          <EditableNumber
            value={row.stitchCount}
            onSave={(v) => onUpdateQuantity(row.type, row.id, "stitchCount", v)}
            ariaLabel={`Bead count for ${row.code}`}
          />
        )}
        {row.type === "SPECIALTY" && <span className="text-muted-foreground">--</span>}
      </td>

      <td className="border-muted w-6 border-b py-[5px]">
        {showStitches && (
          <ArrowRight className="text-muted-foreground h-3 w-3" data-testid="arrow-icon" />
        )}
      </td>

      <td className="border-muted border-b px-3 py-[5px] [font-variant-numeric:tabular-nums]">
        <div className="flex items-center gap-1">
          <EditableNumber
            value={row.need}
            onSave={(v) => onUpdateQuantity(row.type, row.id, "need", v)}
            ariaLabel={`Need for ${row.code}`}
            min={1}
          />
          <span className="text-muted-foreground text-xs">{UNIT_LABELS[row.type]}</span>
          {showAutoCalc && (
            <Sparkles className="text-primary inline h-3 w-3" data-testid="auto-calc-indicator" />
          )}
          {calculatedNeed != null && onBackToCalculated && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger
                  type="button"
                  onClick={() => onBackToCalculated(row.id, calculatedNeed)}
                  className="text-muted-foreground hover:text-primary hover:bg-primary/5 rounded p-0.5 transition-colors"
                  aria-label={`Back to calculated for ${row.code}`}
                >
                  <RotateCcw className="h-3 w-3" />
                </TooltipTrigger>
                <TooltipContent>
                  Back to calculated: {calculatedNeed} {UNIT_LABELS[row.type]}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </td>

      <td className="border-muted border-b px-3 py-[5px] [font-variant-numeric:tabular-nums]">
        <EditableNumber
          value={row.have}
          onSave={(v) => onUpdateQuantity(row.type, row.id, "have", v)}
          ariaLabel={`Have for ${row.code}`}
        />
      </td>

      <td className="border-muted border-b px-3 py-[5px]">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <span>
                <StatusDonut have={row.have} need={row.need} />
              </span>
            </TooltipTrigger>
            <TooltipContent>
              {row.have} of {row.need ?? "Unknown"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </td>

      <td className="border-muted w-8 border-b py-[5px]">
        <button
          onClick={() => onDelete(row.type, row.id)}
          className="hover:text-destructive hover:bg-destructive/8 rounded p-0.5 opacity-0 transition-all group-hover:opacity-100 focus:opacity-100"
          aria-label={`Remove ${row.code}`}
        >
          <Trash2 className="text-muted-foreground h-3.5 w-3.5" />
        </button>
      </td>
    </tr>
  );
}

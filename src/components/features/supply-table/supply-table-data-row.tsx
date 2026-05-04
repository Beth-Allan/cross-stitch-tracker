"use client";

import { ArrowRight, Sparkles, Trash2 } from "lucide-react";
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
  ) => void;
  onDelete: (type: SupplyType, junctionId: string) => void;
  isNew?: boolean;
}

export function SupplyTableDataRow({
  row,
  onUpdateQuantity,
  onDelete,
  isNew,
}: SupplyTableDataRowProps) {
  const showStitches = row.type === "THREAD" || row.type === "BEAD";
  const showAutoCalc = row.type === "THREAD" && !row.isNeedOverridden;

  return (
    <tr className={`group ${isNew ? "animate-slide-in" : ""}`}>
      {/* Column 1 - Colour (44%) */}
      <td className="border-muted border-b px-3 py-[5px]">
        <div className="flex items-center gap-2">
          <ColorSwatch hexColor={row.hexColor} size="sm" />
          <span className="font-mono text-xs font-semibold whitespace-nowrap">{row.code}</span>
          <span className="text-muted-foreground truncate text-xs">{row.name}</span>
        </div>
      </td>

      {/* Column 2 - Stitches/Qty (14%) */}
      <td className="border-muted border-b px-3 py-[5px] [font-variant-numeric:tabular-nums]">
        {row.type === "THREAD" && (
          <EditableNumber
            value={row.stitchCount}
            onSave={(v) => onUpdateQuantity(row.type, row.id, "stitchCount", v)}
            ariaLabel={`Stitches for ${row.code}`}
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

      {/* Column 3 - Arrow (24px fixed) */}
      <td className="border-muted w-6 border-b py-[5px]">
        {showStitches && (
          <ArrowRight className="text-muted-foreground h-3 w-3" data-testid="arrow-icon" />
        )}
      </td>

      {/* Column 4 - Need (13%) */}
      <td className="border-muted border-b px-3 py-[5px] [font-variant-numeric:tabular-nums]">
        <div className="flex items-center gap-1">
          <EditableNumber
            value={row.need}
            onSave={(v) => onUpdateQuantity(row.type, row.id, "need", v)}
            ariaLabel={`Need for ${row.code}`}
          />
          <span className="text-muted-foreground text-xs">{UNIT_LABELS[row.type]}</span>
          {showAutoCalc && (
            <Sparkles className="text-primary inline h-3 w-3" data-testid="auto-calc-indicator" />
          )}
        </div>
      </td>

      {/* Column 5 - Have (10%) */}
      <td className="border-muted border-b px-3 py-[5px] [font-variant-numeric:tabular-nums]">
        <EditableNumber
          value={row.have}
          onSave={(v) => onUpdateQuantity(row.type, row.id, "have", v)}
          ariaLabel={`Have for ${row.code}`}
        />
      </td>

      {/* Column 6 - Status (6%) */}
      <td className="border-muted border-b px-3 py-[5px]">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <span>
                <StatusDonut have={row.have} need={row.need} />
              </span>
            </TooltipTrigger>
            <TooltipContent>
              {row.have} of {row.need}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </td>

      {/* Column 7 - Delete (32px fixed) */}
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

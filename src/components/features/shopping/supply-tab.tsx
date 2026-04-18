"use client";

import { ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { ColorSwatch } from "@/components/features/supplies/color-swatch";
import { QuantityControl } from "./quantity-control";
import type { ShoppingSupplyNeed } from "@/types/dashboard";

interface SupplyTabProps {
  supplies: ShoppingSupplyNeed[];
  type: "thread" | "bead" | "specialty";
  onUpdateAcquired: (
    type: "thread" | "bead" | "specialty",
    junctionId: string,
    quantity: number,
  ) => void;
  isPending: boolean;
}

interface AggregatedSupply {
  supplyId: string;
  brandName: string;
  code: string;
  colorName: string;
  hexColor: string | null;
  unit: string;
  totalRequired: number;
  totalAcquired: number;
  items: ShoppingSupplyNeed[];
}

function aggregateSupplies(supplies: ShoppingSupplyNeed[]): AggregatedSupply[] {
  const map = new Map<string, AggregatedSupply>();

  for (const supply of supplies) {
    const existing = map.get(supply.supplyId);
    if (existing) {
      existing.totalRequired += supply.quantityRequired;
      existing.totalAcquired += supply.quantityAcquired;
      existing.items.push(supply);
    } else {
      map.set(supply.supplyId, {
        supplyId: supply.supplyId,
        brandName: supply.brandName,
        code: supply.code,
        colorName: supply.colorName,
        hexColor: supply.hexColor,
        unit: supply.unit,
        totalRequired: supply.quantityRequired,
        totalAcquired: supply.quantityAcquired,
        items: [supply],
      });
    }
  }

  return Array.from(map.values());
}

const typeLabels: Record<string, string> = {
  thread: "thread",
  bead: "bead",
  specialty: "specialty",
};

export function SupplyTab({ supplies, type, onUpdateAcquired, isPending }: SupplyTabProps) {
  const label = typeLabels[type] ?? type;

  if (supplies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <ShoppingBag className="text-muted-foreground/40 mb-3 h-8 w-8" />
        <p className="text-muted-foreground text-sm">
          Select projects on the Projects tab to see {label} needs
        </p>
      </div>
    );
  }

  const aggregated = aggregateSupplies(supplies);
  const unfulfilled = aggregated.filter((s) => s.totalAcquired < s.totalRequired);
  const fulfilled = aggregated.filter((s) => s.totalAcquired >= s.totalRequired);

  if (unfulfilled.length === 0 && fulfilled.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground text-sm">No {label} needs for selected projects</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {unfulfilled.map((supply) => (
        <SupplyRow
          key={supply.supplyId}
          supply={supply}
          type={type}
          onUpdateAcquired={onUpdateAcquired}
          isPending={isPending}
        />
      ))}
      {fulfilled.map((supply) => (
        <SupplyRow
          key={supply.supplyId}
          supply={supply}
          type={type}
          onUpdateAcquired={onUpdateAcquired}
          isPending={isPending}
        />
      ))}
    </div>
  );
}

function SupplyRow({
  supply,
  type,
  onUpdateAcquired,
  isPending,
}: {
  supply: AggregatedSupply;
  type: "thread" | "bead" | "specialty";
  onUpdateAcquired: (
    type: "thread" | "bead" | "specialty",
    junctionId: string,
    quantity: number,
  ) => void;
  isPending: boolean;
}) {
  const isFulfilled = supply.totalAcquired >= supply.totalRequired;

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border p-3",
        isFulfilled
          ? "border-emerald-200 bg-emerald-50/30 dark:border-emerald-800 dark:bg-emerald-950/20"
          : "border-border bg-card",
      )}
    >
      {supply.hexColor && <ColorSwatch hexColor={supply.hexColor} size="sm" />}
      <div className="min-w-0 flex-1">
        <span className="text-foreground text-sm font-semibold">
          {supply.brandName} {supply.code}
        </span>
        <p className="text-muted-foreground mt-0.5 text-xs">
          {supply.colorName}
          {supply.items.length > 1 && (
            <span>
              {" \u00B7 "}
              {supply.items.map((i) => i.projectName).join(", ")}
            </span>
          )}
          {supply.items.length === 1 && (
            <span>
              {" \u00B7 "}
              {supply.items[0].projectName}
            </span>
          )}
        </p>
      </div>
      <QuantityControl
        acquired={supply.totalAcquired}
        required={supply.totalRequired}
        isPending={isPending}
        onChange={(newValue) => {
          // For single-item supplies, update directly
          // For multi-item, update the first junction proportionally
          if (supply.items.length === 1) {
            onUpdateAcquired(type, supply.items[0].junctionId, newValue);
          } else {
            // Distribute change to first item
            const diff = newValue - supply.totalAcquired;
            const firstItem = supply.items[0];
            const newItemValue = Math.max(
              0,
              Math.min(firstItem.quantityRequired, firstItem.quantityAcquired + diff),
            );
            onUpdateAcquired(type, firstItem.junctionId, newItemValue);
          }
        }}
      />
    </div>
  );
}

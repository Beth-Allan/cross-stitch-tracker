"use client";

import { useState } from "react";
import { Check, CheckSquare, ShoppingBag, Square, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ColorSwatch } from "@/components/features/supplies/color-swatch";
import type { ShoppingSupplyNeed, ShoppingFabricNeed } from "@/types/dashboard";

interface ShoppingListTabProps {
  threads: ShoppingSupplyNeed[];
  beads: ShoppingSupplyNeed[];
  specialty: ShoppingSupplyNeed[];
  fabrics: ShoppingFabricNeed[];
}

interface ListItem {
  key: string;
  type: "thread" | "bead" | "specialty" | "fabric";
  label: string;
  detail: string;
  quantity: string;
  hexColor: string | null;
}

function buildListItems(
  threads: ShoppingSupplyNeed[],
  beads: ShoppingSupplyNeed[],
  specialty: ShoppingSupplyNeed[],
  fabrics: ShoppingFabricNeed[],
): ListItem[] {
  const items: ListItem[] = [];

  for (const t of threads) {
    if (t.quantityAcquired >= t.quantityRequired) continue;
    const remaining = t.quantityRequired - t.quantityAcquired;
    items.push({
      key: `thread-${t.junctionId}`,
      type: "thread",
      label: `${t.brandName} ${t.code} ${t.colorName}`,
      detail: t.projectName,
      quantity: `${remaining} ${t.unit}`,
      hexColor: t.hexColor,
    });
  }

  for (const b of beads) {
    if (b.quantityAcquired >= b.quantityRequired) continue;
    const remaining = b.quantityRequired - b.quantityAcquired;
    items.push({
      key: `bead-${b.junctionId}`,
      type: "bead",
      label: `${b.brandName} ${b.code} ${b.colorName}`,
      detail: b.projectName,
      quantity: `${remaining} ${b.unit}`,
      hexColor: b.hexColor,
    });
  }

  for (const s of specialty) {
    if (s.quantityAcquired >= s.quantityRequired) continue;
    const remaining = s.quantityRequired - s.quantityAcquired;
    items.push({
      key: `specialty-${s.junctionId}`,
      type: "specialty",
      label: `${s.brandName} ${s.code} ${s.colorName}`,
      detail: s.projectName,
      quantity: `${remaining} ${s.unit}`,
      hexColor: s.hexColor,
    });
  }

  for (const f of fabrics) {
    if (f.hasFabric) continue;
    items.push({
      key: `fabric-${f.projectId}`,
      type: "fabric",
      label: `Fabric for ${f.projectName}`,
      detail: `${f.stitchesWide} x ${f.stitchesHigh} stitches`,
      quantity: "1 piece",
      hexColor: null,
    });
  }

  return items;
}

const groupLabels: Record<string, string> = {
  thread: "Threads",
  bead: "Beads",
  specialty: "Specialty Items",
  fabric: "Fabric",
};

export function ShoppingListTab({
  threads,
  beads,
  specialty,
  fabrics,
}: ShoppingListTabProps) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const hasAnySupplies =
    threads.length > 0 ||
    beads.length > 0 ||
    specialty.length > 0 ||
    fabrics.length > 0;

  if (!hasAnySupplies) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <ShoppingBag className="h-8 w-8 text-muted-foreground/40 mb-3" />
        <p className="text-sm text-muted-foreground">
          Select projects on the Projects tab to build your shopping list
        </p>
      </div>
    );
  }

  const items = buildListItems(threads, beads, specialty, fabrics);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Check className="h-8 w-8 text-emerald-500 mb-3" />
        <p className="text-sm text-muted-foreground">
          All supplies acquired for selected projects!
        </p>
      </div>
    );
  }

  // Group by type
  const grouped = new Map<string, ListItem[]>();
  for (const item of items) {
    const group = grouped.get(item.type) ?? [];
    group.push(item);
    grouped.set(item.type, group);
  }

  const checkedCount = items.filter((i) => checkedItems.has(i.key)).length;

  function toggleCheck(key: string) {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function clearChecked() {
    setCheckedItems(new Set());
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-muted-foreground">
          {items.length} item{items.length !== 1 ? "s" : ""} to buy
          {checkedCount > 0 && (
            <span className="text-emerald-600">
              {" \u00B7 "}
              {checkedCount} checked off
            </span>
          )}
        </p>
        {checkedCount > 0 && (
          <button
            type="button"
            onClick={clearChecked}
            className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            <Trash2 className="h-3 w-3" />
            Clear checked
          </button>
        )}
      </div>

      {/* Grouped list */}
      <div className="flex flex-col gap-6">
        {Array.from(grouped.entries()).map(([type, groupItems]) => (
          <div key={type}>
            <h3 className="font-heading text-base font-semibold text-foreground mb-2.5">
              {groupLabels[type] ?? type}
              <span className="text-muted-foreground text-sm font-normal ml-2">
                ({groupItems.length})
              </span>
            </h3>
            <div className="flex flex-col gap-0.5">
              {groupItems.map((item) => {
                const isChecked = checkedItems.has(item.key);
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => toggleCheck(item.key)}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg border p-3 w-full text-left transition-colors",
                      isChecked
                        ? "border-emerald-300 bg-emerald-50"
                        : "border-border bg-card hover:bg-muted/50",
                    )}
                  >
                    <span
                      className={cn(
                        "shrink-0",
                        isChecked
                          ? "text-emerald-500"
                          : "text-stone-300",
                      )}
                    >
                      {isChecked ? (
                        <CheckSquare className="h-5 w-5" />
                      ) : (
                        <Square className="h-5 w-5" />
                      )}
                    </span>

                    {item.hexColor && (
                      <ColorSwatch hexColor={item.hexColor} size="sm" />
                    )}

                    <div className="flex-1 min-w-0">
                      <span
                        className={cn(
                          "text-sm font-medium",
                          isChecked
                            ? "line-through text-muted-foreground"
                            : "text-foreground",
                        )}
                      >
                        {item.label}
                      </span>
                      {item.detail && (
                        <span
                          className={cn(
                            "text-xs",
                            isChecked
                              ? "text-muted-foreground/60"
                              : "text-muted-foreground",
                          )}
                        >
                          {" \u2014 "}
                          {item.detail}
                        </span>
                      )}
                    </div>

                    <span
                      className={cn(
                        "text-xs font-medium font-mono tabular-nums whitespace-nowrap",
                        isChecked
                          ? "text-muted-foreground/60"
                          : "text-muted-foreground",
                      )}
                    >
                      {item.quantity}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

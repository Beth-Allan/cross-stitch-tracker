"use client";

import { useEffect, useState } from "react";
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

/**
 * A need of `null` (D-34) is still to buy and has no figure, so it is listed as "Unknown" — the
 * null check comes first in every loop because JS calls `acquired >= null` true (D-40 ④).
 */
function buildListItems(
  threads: ShoppingSupplyNeed[],
  beads: ShoppingSupplyNeed[],
  specialty: ShoppingSupplyNeed[],
  fabrics: ShoppingFabricNeed[],
): ListItem[] {
  const items: ListItem[] = [];

  for (const t of threads) {
    if (t.quantityRequired !== null && t.quantityAcquired >= t.quantityRequired) continue;
    items.push({
      key: `thread-${t.junctionId}`,
      type: "thread",
      label: `${t.brandName} ${t.code} ${t.colorName}`,
      detail: t.projectName,
      quantity:
        t.quantityRequired === null
          ? "Unknown"
          : `${t.quantityRequired - t.quantityAcquired} ${t.unit}`,
      hexColor: t.hexColor,
    });
  }

  for (const b of beads) {
    if (b.quantityRequired !== null && b.quantityAcquired >= b.quantityRequired) continue;
    items.push({
      key: `bead-${b.junctionId}`,
      type: "bead",
      label: `${b.brandName} ${b.code} ${b.colorName}`,
      detail: b.projectName,
      quantity:
        b.quantityRequired === null
          ? "Unknown"
          : `${b.quantityRequired - b.quantityAcquired} ${b.unit}`,
      hexColor: b.hexColor,
    });
  }

  for (const s of specialty) {
    if (s.quantityRequired !== null && s.quantityAcquired >= s.quantityRequired) continue;
    items.push({
      key: `specialty-${s.junctionId}`,
      type: "specialty",
      label: `${s.brandName} ${s.code} ${s.colorName}`,
      detail: s.projectName,
      quantity:
        s.quantityRequired === null
          ? "Unknown"
          : `${s.quantityRequired - s.quantityAcquired} ${s.unit}`,
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

export function ShoppingListTab({ threads, beads, specialty, fabrics }: ShoppingListTabProps) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("shopping-list-checked");
      if (stored) {
        const parsed = JSON.parse(stored) as string[];
        if (Array.isArray(parsed)) {
          setCheckedItems(new Set(parsed));
        }
      }
    } catch {
      // localStorage may be unavailable (private browsing, SSR)
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem("shopping-list-checked", JSON.stringify(Array.from(checkedItems)));
    } catch {
      // localStorage may be unavailable (private browsing, SSR)
    }
  }, [checkedItems, hydrated]);

  const hasAnySupplies =
    threads.length > 0 || beads.length > 0 || specialty.length > 0 || fabrics.length > 0;

  if (!hasAnySupplies) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <ShoppingBag className="text-muted-foreground/40 mb-3 h-8 w-8" />
        <p className="text-muted-foreground text-sm">
          Select projects on the Projects tab to build your shopping list
        </p>
      </div>
    );
  }

  const items = buildListItems(threads, beads, specialty, fabrics);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Check className="text-progress mb-3 h-8 w-8" />
        <p className="text-muted-foreground text-sm">
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
      <div className="mb-5 flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          {items.length} item{items.length !== 1 ? "s" : ""} to buy
          {checkedCount > 0 && (
            <span className="text-progress-foreground">
              {" \u00B7 "}
              {checkedCount} checked off
            </span>
          )}
        </p>
        {checkedCount > 0 && (
          <button
            type="button"
            onClick={clearChecked}
            className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs font-medium transition-colors"
          >
            <Trash2 className="h-3 w-3" />
            Clear checked
          </button>
        )}
      </div>

      <div className="flex flex-col gap-6">
        {Array.from(grouped.entries()).map(([type, groupItems]) => (
          <div key={type}>
            <h3 className="font-heading text-foreground mb-2.5 text-base font-semibold">
              {groupLabels[type] ?? type}
              <span className="text-muted-foreground ml-2 text-sm font-normal">
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
                    aria-pressed={isChecked}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-lg border p-3 text-left transition-colors",
                      isChecked
                        ? "border-selected-border bg-selected"
                        : "border-border bg-card hover:bg-muted/50",
                    )}
                  >
                    <span
                      className={cn(
                        "shrink-0",
                        isChecked ? "text-progress" : "text-muted-foreground/40",
                      )}
                    >
                      {isChecked ? (
                        <CheckSquare className="h-5 w-5" />
                      ) : (
                        <Square className="h-5 w-5" />
                      )}
                    </span>

                    {item.hexColor && <ColorSwatch hexColor={item.hexColor} size="sm" />}

                    <div className="min-w-0 flex-1">
                      <span
                        className={cn(
                          "text-sm font-medium",
                          isChecked ? "text-muted-foreground line-through" : "text-foreground",
                        )}
                      >
                        {item.label}
                      </span>
                      {item.detail && (
                        <span
                          className={cn(
                            "text-xs",
                            isChecked ? "text-muted-foreground/60" : "text-muted-foreground",
                          )}
                        >
                          {" \u2014 "}
                          {item.detail}
                        </span>
                      )}
                    </div>

                    <span
                      className={cn(
                        "font-mono text-xs font-medium whitespace-nowrap tabular-nums",
                        isChecked ? "text-muted-foreground/60" : "text-muted-foreground",
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

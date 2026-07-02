"use client";

import { useDeferredValue } from "react";
import { Search, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { ColorSwatch } from "@/components/features/supplies/color-swatch";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchInput } from "./search-input";
import { QuantityControl } from "./quantity-control";
import type { ShoppingSupplyNeed, ShoppingFabricNeed } from "@/types/dashboard";
import type { OnUpdateAcquired } from "@/types/shopping";

interface SupplyOverviewProps {
  threads: ShoppingSupplyNeed[];
  beads: ShoppingSupplyNeed[];
  specialty: ShoppingSupplyNeed[];
  fabrics: ShoppingFabricNeed[];
  onUpdateAcquired: OnUpdateAcquired;
  pendingIds: Set<string>;
  failedIds: Set<string>;
  supplySearchQuery: string;
  onSupplySearchChange: (value: string) => void;
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
  items: [ShoppingSupplyNeed, ...ShoppingSupplyNeed[]];
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

function filterAggregatedSupplies(
  aggregated: AggregatedSupply[],
  searchTerm: string,
): AggregatedSupply[] {
  if (!searchTerm) return aggregated;
  const lower = searchTerm.toLowerCase();
  return aggregated.filter(
    (s) =>
      s.brandName.toLowerCase().includes(lower) ||
      s.code.toLowerCase().includes(lower) ||
      s.colorName.toLowerCase().includes(lower),
  );
}

export function SupplyOverview({
  threads,
  beads,
  specialty,
  fabrics,
  onUpdateAcquired,
  pendingIds,
  failedIds,
  supplySearchQuery,
  onSupplySearchChange,
}: SupplyOverviewProps) {
  const deferredSearch = useDeferredValue(supplySearchQuery);

  const hasAny =
    threads.length > 0 || beads.length > 0 || specialty.length > 0 || fabrics.length > 0;

  if (!hasAny) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <ShoppingBag className="text-muted-foreground/40 mb-3 h-8 w-8" />
        <p className="text-muted-foreground text-sm">Select projects to see supply needs</p>
      </div>
    );
  }

  const aggregatedThreads = aggregateSupplies(threads);
  const aggregatedBeads = aggregateSupplies(beads);
  const aggregatedSpecialty = aggregateSupplies(specialty);

  const filteredAggThreads = filterAggregatedSupplies(aggregatedThreads, deferredSearch);
  const filteredAggBeads = filterAggregatedSupplies(aggregatedBeads, deferredSearch);
  const filteredAggSpecialty = filterAggregatedSupplies(aggregatedSpecialty, deferredSearch);

  const isSupplySearchActive = deferredSearch.length > 0;
  const hasFilteredResults =
    filteredAggThreads.length > 0 ||
    filteredAggBeads.length > 0 ||
    filteredAggSpecialty.length > 0 ||
    (!isSupplySearchActive && fabrics.length > 0);

  return (
    <div className="flex flex-col gap-8">
      <SearchInput
        value={supplySearchQuery}
        onChange={onSupplySearchChange}
        placeholder="Search supplies..."
        ariaLabel="Search supplies"
      />

      {!hasFilteredResults && isSupplySearchActive ? (
        <EmptyState
          icon={Search}
          title="No supplies match your search"
          description="Try a different brand, code, or color name"
        />
      ) : (
        <>
          {filteredAggThreads.length > 0 && (
            <SupplySection
              label="Threads"
              aggregated={filteredAggThreads}
              type="thread"
              onUpdateAcquired={onUpdateAcquired}
              pendingIds={pendingIds}
              failedIds={failedIds}
            />
          )}
          {filteredAggBeads.length > 0 && (
            <SupplySection
              label="Beads"
              aggregated={filteredAggBeads}
              type="bead"
              onUpdateAcquired={onUpdateAcquired}
              pendingIds={pendingIds}
              failedIds={failedIds}
            />
          )}
          {filteredAggSpecialty.length > 0 && (
            <SupplySection
              label="Specialty"
              aggregated={filteredAggSpecialty}
              type="specialty"
              onUpdateAcquired={onUpdateAcquired}
              pendingIds={pendingIds}
              failedIds={failedIds}
            />
          )}
          {fabrics.length > 0 && !isSupplySearchActive && <FabricSection fabrics={fabrics} />}
        </>
      )}
    </div>
  );
}

function SupplySection({
  label,
  aggregated,
  type,
  onUpdateAcquired,
  pendingIds,
  failedIds,
}: {
  label: string;
  aggregated: AggregatedSupply[];
  type: "thread" | "bead" | "specialty";
  onUpdateAcquired: OnUpdateAcquired;
  pendingIds: Set<string>;
  failedIds: Set<string>;
}) {
  const unfulfilled = aggregated.filter((s) => s.totalAcquired < s.totalRequired);
  const fulfilled = aggregated.filter((s) => s.totalAcquired >= s.totalRequired);

  return (
    <div>
      <h3 className="font-heading text-foreground mb-2 text-base font-semibold">
        {label}
        <span className="text-muted-foreground ml-2 text-sm font-normal">
          ({aggregated.length} type{aggregated.length !== 1 ? "s" : ""}
          {unfulfilled.length > 0 && `, ${unfulfilled.length} still needed`})
        </span>
      </h3>
      <div className="flex flex-col gap-1">
        {unfulfilled.map((supply) => (
          <AggregatedSupplyRow
            key={supply.supplyId}
            supply={supply}
            type={type}
            onUpdateAcquired={onUpdateAcquired}
            pendingIds={pendingIds}
            failedIds={failedIds}
          />
        ))}
        {fulfilled.map((supply) => (
          <AggregatedSupplyRow
            key={supply.supplyId}
            supply={supply}
            type={type}
            onUpdateAcquired={onUpdateAcquired}
            pendingIds={pendingIds}
            failedIds={failedIds}
          />
        ))}
      </div>
    </div>
  );
}

function AggregatedSupplyRow({
  supply,
  type,
  onUpdateAcquired,
  pendingIds,
  failedIds,
}: {
  supply: AggregatedSupply;
  type: "thread" | "bead" | "specialty";
  onUpdateAcquired: OnUpdateAcquired;
  pendingIds: Set<string>;
  failedIds: Set<string>;
}) {
  const isFulfilled = supply.totalAcquired >= supply.totalRequired;
  const projectNames = supply.items.map((i) => i.projectName).join(", ");

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border p-3",
        isFulfilled ? "border-selected-border bg-selected" : "border-border bg-card",
      )}
    >
      {supply.hexColor && <ColorSwatch hexColor={supply.hexColor} size="sm" />}
      <div className="min-w-0 flex-1">
        <span className="text-foreground text-sm font-semibold">
          {supply.brandName} {supply.code}
        </span>
        <p className="text-muted-foreground mt-0.5 text-xs">
          {supply.colorName} · {projectNames}
        </p>
      </div>
      <QuantityControl
        acquired={supply.totalAcquired}
        required={supply.totalRequired}
        isPending={supply.items.some((i) => pendingIds.has(i.junctionId))}
        hasError={supply.items.some((i) => failedIds.has(i.junctionId))}
        onChange={(newValue) => {
          if (supply.items.length === 1) {
            onUpdateAcquired(type, supply.items[0].junctionId, newValue);
          } else {
            let remaining = newValue - supply.totalAcquired;
            if (remaining > 0) {
              for (const item of supply.items) {
                if (remaining <= 0) break;
                const capacity = item.quantityRequired - item.quantityAcquired;
                if (capacity <= 0) continue;
                const allocated = Math.min(capacity, remaining);
                onUpdateAcquired(type, item.junctionId, item.quantityAcquired + allocated);
                remaining -= allocated;
              }
            } else if (remaining < 0) {
              let toRemove = -remaining;
              for (const item of supply.items) {
                if (toRemove <= 0) break;
                if (item.quantityAcquired <= 0) continue;
                const allocated = Math.min(item.quantityAcquired, toRemove);
                onUpdateAcquired(type, item.junctionId, item.quantityAcquired - allocated);
                toRemove -= allocated;
              }
            }
          }
        }}
      />
    </div>
  );
}

function FabricSection({ fabrics }: { fabrics: ShoppingFabricNeed[] }) {
  return (
    <div>
      <h3 className="font-heading text-foreground mb-2 text-base font-semibold">
        Fabric
        <span className="text-muted-foreground ml-2 text-sm font-normal">
          ({fabrics.length} need{fabrics.length === 1 ? "s" : ""} fabric)
        </span>
      </h3>
      <div className="flex flex-col gap-1">
        {fabrics.map((fabric) => (
          <div
            key={fabric.projectId}
            className="border-border bg-card flex items-center gap-3 rounded-lg border p-4"
          >
            <div className="min-w-0 flex-1">
              <span className="text-foreground text-sm font-semibold">{fabric.projectName}</span>
              <p className="text-muted-foreground mt-1 text-xs">
                {fabric.stitchesWide} × {fabric.stitchesHigh} stitches
              </p>
              <p className="text-warning mt-1 text-xs">Needs fabric</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

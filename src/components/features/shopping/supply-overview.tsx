"use client";

import { Check, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { ColorSwatch } from "@/components/features/supplies/color-swatch";
import { QuantityControl } from "./quantity-control";
import type { ShoppingSupplyNeed, ShoppingFabricNeed } from "@/types/dashboard";

interface SupplyOverviewProps {
  threads: ShoppingSupplyNeed[];
  beads: ShoppingSupplyNeed[];
  specialty: ShoppingSupplyNeed[];
  fabrics: ShoppingFabricNeed[];
  onUpdateAcquired: (
    type: "thread" | "bead" | "specialty",
    junctionId: string,
    quantity: number,
  ) => void;
  isPending: boolean;
  failedIds: Set<string>;
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

export function SupplyOverview({
  threads,
  beads,
  specialty,
  fabrics,
  onUpdateAcquired,
  isPending,
  failedIds,
}: SupplyOverviewProps) {
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

  return (
    <div className="flex flex-col gap-8">
      {aggregatedThreads.length > 0 && (
        <SupplySection
          label="Threads"
          aggregated={aggregatedThreads}
          type="thread"
          onUpdateAcquired={onUpdateAcquired}
          isPending={isPending}
          failedIds={failedIds}
        />
      )}
      {aggregatedBeads.length > 0 && (
        <SupplySection
          label="Beads"
          aggregated={aggregatedBeads}
          type="bead"
          onUpdateAcquired={onUpdateAcquired}
          isPending={isPending}
          failedIds={failedIds}
        />
      )}
      {aggregatedSpecialty.length > 0 && (
        <SupplySection
          label="Specialty"
          aggregated={aggregatedSpecialty}
          type="specialty"
          onUpdateAcquired={onUpdateAcquired}
          isPending={isPending}
          failedIds={failedIds}
        />
      )}
      {fabrics.length > 0 && <FabricSection fabrics={fabrics} />}
    </div>
  );
}

/* ─── SupplySection ─────��────────────────────────────────── */

function SupplySection({
  label,
  aggregated,
  type,
  onUpdateAcquired,
  isPending,
  failedIds,
}: {
  label: string;
  aggregated: AggregatedSupply[];
  type: "thread" | "bead" | "specialty";
  onUpdateAcquired: (
    type: "thread" | "bead" | "specialty",
    junctionId: string,
    quantity: number,
  ) => void;
  isPending: boolean;
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
            isPending={isPending}
            failedIds={failedIds}
          />
        ))}
        {fulfilled.map((supply) => (
          <AggregatedSupplyRow
            key={supply.supplyId}
            supply={supply}
            type={type}
            onUpdateAcquired={onUpdateAcquired}
            isPending={isPending}
            failedIds={failedIds}
          />
        ))}
      </div>
    </div>
  );
}

/* ─── AggregatedSupplyRow ────────────────────────────────── */

function AggregatedSupplyRow({
  supply,
  type,
  onUpdateAcquired,
  isPending,
  failedIds,
}: {
  supply: AggregatedSupply;
  type: "thread" | "bead" | "specialty";
  onUpdateAcquired: (
    type: "thread" | "bead" | "specialty",
    junctionId: string,
    quantity: number,
  ) => void;
  isPending: boolean;
  failedIds: Set<string>;
}) {
  const isFulfilled = supply.totalAcquired >= supply.totalRequired;
  const projectNames = supply.items.map((i) => i.projectName).join(", ");

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
          {supply.colorName} · {projectNames}
        </p>
      </div>
      <QuantityControl
        acquired={supply.totalAcquired}
        required={supply.totalRequired}
        isPending={isPending}
        hasError={supply.items.some((i) => failedIds.has(i.junctionId))}
        onChange={(newValue) => {
          if (supply.items.length === 1) {
            onUpdateAcquired(type, supply.items[0].junctionId, newValue);
          } else {
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

/* ─── FabricSection ��─────────────────────────────────────── */

function FabricSection({ fabrics }: { fabrics: ShoppingFabricNeed[] }) {
  return (
    <div>
      <h3 className="font-heading text-foreground mb-2 text-base font-semibold">
        Fabric
        <span className="text-muted-foreground ml-2 text-sm font-normal">
          ({fabrics.filter((f) => !f.hasFabric).length} of {fabrics.length} need
          {fabrics.length === 1 ? "s" : ""} fabric)
        </span>
      </h3>
      <div className="flex flex-col gap-1">
        {fabrics.map((fabric) => (
          <div
            key={fabric.projectId}
            className={cn(
              "flex items-center gap-3 rounded-lg border p-4",
              fabric.hasFabric
                ? "border-emerald-200 bg-emerald-50/30 dark:border-emerald-800 dark:bg-emerald-950/20"
                : "border-border bg-card",
            )}
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-foreground text-sm font-semibold">{fabric.projectName}</span>
                {fabric.hasFabric && (
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                    <Check className="h-3 w-3" />
                    Has fabric
                  </span>
                )}
              </div>
              <p className="text-muted-foreground mt-1 text-xs">
                {fabric.stitchesWide} × {fabric.stitchesHigh} stitches
                {fabric.fabricName && ` · ${fabric.fabricName}`}
              </p>
              {!fabric.hasFabric && <p className="mt-1 text-xs text-amber-600">Needs fabric</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

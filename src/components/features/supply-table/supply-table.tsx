"use client";

import { useState, useCallback, useTransition, useMemo, useEffect, useRef } from "react";
import { CircleDot, Gem, Sparkles, Package } from "lucide-react";
import { toast } from "sonner";
import { SupplyTableAddRow } from "./supply-table-add-row";
import { SupplyTableDataRow } from "./supply-table-data-row";
import { SupplyTableSectionDivider } from "./supply-table-section-divider";
import { SupplyTableFooter } from "./supply-table-footer";
import { EmptyState } from "@/components/ui/empty-state";
import type { SupplyTableProps, SupplyType } from "./types";
import { DEFAULT_CALC_PARAMS } from "./types";

interface SupplyTableInternalProps extends SupplyTableProps {
  isLoading?: boolean;
}

const HEADER_CLASS =
  "text-left px-3 py-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.04em] border-b-2 border-border whitespace-nowrap bg-card";

/**
 * Root SupplyTable component composing all sub-components into the complete
 * unified supply table. Consumers (project detail page, supply takeover flow)
 * import this as their single entry point.
 *
 * Renders grouped sections (Thread/Beads/Specialty) with:
 * - Persistent add row with autocomplete search
 * - Data rows with inline editing
 * - Section dividers with count badges
 * - Footer with running totals
 * - Empty state when no supplies exist
 * - Loading skeleton state
 */
export function SupplyTable({
  threads,
  beads,
  specialty,
  adapter,
  calcParams,
  existingSupplyIds,
  isLoading,
}: SupplyTableInternalProps) {
  const [newRowIds, setNewRowIds] = useState<Set<string>>(new Set());
  const [, startTransition] = useTransition();

  const mergedCalcParams = useMemo(() => ({ ...DEFAULT_CALC_PARAMS, ...calcParams }), [calcParams]);

  // Track previous calcParams to detect actual changes (skip initial mount)
  const prevCalcParamsRef = useRef<string | null>(null);

  // Keep adapter's calcParams in sync
  useEffect(() => {
    if (
      "setCalcParams" in adapter &&
      typeof (adapter as Record<string, unknown>).setCalcParams === "function"
    ) {
      (
        adapter as Record<string, unknown> & { setCalcParams: (p: typeof mergedCalcParams) => void }
      ).setCalcParams(mergedCalcParams);
    }
  }, [adapter, mergedCalcParams]);

  // Keep adapter's rows in sync (for ServerActionAdapter's isNeedOverridden lookup)
  const allRows = useMemo(() => [...threads, ...beads, ...specialty], [threads, beads, specialty]);
  useEffect(() => {
    if (
      "setRows" in adapter &&
      typeof (adapter as Record<string, unknown>).setRows === "function"
    ) {
      (adapter as Record<string, unknown> & { setRows: (r: typeof allRows) => void }).setRows(
        allRows,
      );
    }
  }, [adapter, allRows]);

  // Bulk recalculation when calcParams change (not on initial mount)
  useEffect(() => {
    const key = JSON.stringify(mergedCalcParams);
    if (prevCalcParamsRef.current === null) {
      // Initial mount — just record, don't recalculate
      prevCalcParamsRef.current = key;
      return;
    }
    if (prevCalcParamsRef.current === key) return;
    prevCalcParamsRef.current = key;

    // Recalculate all non-overridden thread rows with stitchCount > 0
    for (const row of threads) {
      if (!row.isNeedOverridden && row.stitchCount > 0) {
        adapter.updateQuantity("THREAD", row.id, "stitchCount", row.stitchCount);
      }
    }
  }, [mergedCalcParams, threads, adapter]);

  // Derive existing supply IDs from all sections for add-row disabled items
  const existingIds = useMemo(() => {
    if (existingSupplyIds) return existingSupplyIds;
    const ids = new Set<string>();
    for (const row of threads) ids.add(row.supplyId);
    for (const row of beads) ids.add(row.supplyId);
    for (const row of specialty) ids.add(row.supplyId);
    return ids;
  }, [existingSupplyIds, threads, beads, specialty]);

  const totalCount = threads.length + beads.length + specialty.length;

  const handleRowAdded = useCallback((newId?: string) => {
    if (newId) {
      setNewRowIds((prev) => new Set(prev).add(newId));
      setTimeout(() => {
        setNewRowIds((prev) => {
          const next = new Set(prev);
          next.delete(newId);
          return next;
        });
      }, 250); // 200ms animation + 50ms buffer
    }
  }, []);

  const handleUpdateQuantity = useCallback(
    async (
      type: SupplyType,
      junctionId: string,
      field: "stitchCount" | "need" | "have",
      value: number,
    ) => {
      startTransition(async () => {
        try {
          const result = await adapter.updateQuantity(type, junctionId, field, value);
          if (!result.success) {
            toast.error(result.error ?? "Couldn't update value. Try again.");
          }
        } catch (error) {
          console.error("Update supply quantity failed:", error);
          toast.error("Couldn't update value. Try again.");
        }
      });
    },
    [adapter],
  );

  const handleDelete = useCallback(
    async (type: SupplyType, junctionId: string) => {
      startTransition(async () => {
        try {
          const result = await adapter.remove(type, junctionId);
          if (!result.success) {
            toast.error(result.error ?? "Couldn't remove supply. Try again.");
          }
        } catch (error) {
          console.error("Remove supply failed:", error);
          toast.error("Couldn't remove supply. Try again.");
        }
      });
    },
    [adapter],
  );

  const totalSkeinsNeeded = threads.reduce((sum, t) => sum + t.need, 0);
  const totalItemsNeeded = [...threads, ...beads, ...specialty].reduce((sum, s) => sum + s.need, 0);

  return (
    <div className="border-border bg-card overflow-hidden rounded-lg border">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm" style={{ tableLayout: "fixed" }}>
          <thead>
            <tr className="bg-card">
              <th scope="col" style={{ width: "41%" }} className={HEADER_CLASS}>
                Colour
              </th>
              <th scope="col" style={{ width: "14%" }} className={HEADER_CLASS}>
                Stitches
              </th>
              <th scope="col" style={{ width: "24px" }} className={HEADER_CLASS} />
              <th scope="col" style={{ width: "16%" }} className={HEADER_CLASS}>
                Need
              </th>
              <th scope="col" style={{ width: "10%" }} className={HEADER_CLASS}>
                Have
              </th>
              <th scope="col" style={{ width: "6%" }} className={HEADER_CLASS}>
                Status
              </th>
              <th scope="col" style={{ width: "32px" }} className={HEADER_CLASS} />
            </tr>
          </thead>
          <tbody>
            <SupplyTableAddRow
              adapter={adapter}
              calcParams={mergedCalcParams}
              existingSupplyIds={existingIds}
              onRowAdded={handleRowAdded}
            />

            {/* Thread section */}
            <SupplyTableSectionDivider icon={CircleDot} label="Thread" count={threads.length} />
            {threads.map((row) => (
              <SupplyTableDataRow
                key={row.id}
                row={row}
                onUpdateQuantity={handleUpdateQuantity}
                onDelete={handleDelete}
                isNew={newRowIds.has(row.id)}
              />
            ))}

            {/* Beads section */}
            <SupplyTableSectionDivider icon={Gem} label="Beads" count={beads.length} />
            {beads.map((row) => (
              <SupplyTableDataRow
                key={row.id}
                row={row}
                onUpdateQuantity={handleUpdateQuantity}
                onDelete={handleDelete}
                isNew={newRowIds.has(row.id)}
              />
            ))}

            {/* Specialty section */}
            <SupplyTableSectionDivider icon={Sparkles} label="Specialty" count={specialty.length} />
            {specialty.map((row) => (
              <SupplyTableDataRow
                key={row.id}
                row={row}
                onUpdateQuantity={handleUpdateQuantity}
                onDelete={handleDelete}
                isNew={newRowIds.has(row.id)}
              />
            ))}

            {/* Empty state */}
            {totalCount === 0 && !isLoading && (
              <tr>
                <td colSpan={7}>
                  <EmptyState
                    icon={Package}
                    title="No supplies added yet"
                    description="Start typing a supply code above to add your first colour."
                  />
                </td>
              </tr>
            )}

            {/* Loading skeleton */}
            {isLoading && (
              <>
                {[1, 2, 3].map((i) => (
                  <tr key={`skeleton-${i}`}>
                    <td className="border-muted border-b px-3 py-[5px]">
                      <div className="flex items-center gap-2">
                        <div className="animate-skeleton-pulse bg-muted h-4 w-4 rounded" />
                        <div className="animate-skeleton-pulse bg-muted h-3 w-12 rounded" />
                        <div className="animate-skeleton-pulse bg-muted h-3 w-20 rounded" />
                      </div>
                    </td>
                    <td className="border-muted border-b px-3 py-[5px]">
                      <div className="animate-skeleton-pulse bg-muted h-3 w-8 rounded" />
                    </td>
                    <td className="border-muted w-6 border-b py-[5px]" />
                    <td className="border-muted border-b px-3 py-[5px]">
                      <div className="animate-skeleton-pulse bg-muted h-3 w-8 rounded" />
                    </td>
                    <td className="border-muted border-b px-3 py-[5px]">
                      <div className="animate-skeleton-pulse bg-muted h-3 w-6 rounded" />
                    </td>
                    <td className="border-muted border-b px-3 py-[5px]">
                      <div className="animate-skeleton-pulse bg-muted h-4 w-4 rounded-full" />
                    </td>
                    <td className="border-muted w-8 border-b py-[5px]" />
                  </tr>
                ))}
              </>
            )}
          </tbody>
        </table>
      </div>
      <SupplyTableFooter
        threadCount={threads.length}
        beadCount={beads.length}
        specialtyCount={specialty.length}
        totalSkeinsNeeded={totalSkeinsNeeded}
        totalItemsNeeded={totalItemsNeeded}
      />
    </div>
  );
}

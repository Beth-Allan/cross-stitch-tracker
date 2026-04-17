"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Check, AlertTriangle, Package, ChevronDown, ChevronRight, Info } from "lucide-react";
import { toast } from "sonner";
import type { FabricRequirementRow } from "@/types/session";
import { assignFabricToProject } from "@/lib/actions/pattern-dive-actions";

// ─── Helpers ────────────────────────────────────────────────────────────────

const MARGIN_PER_SIDE = 3; // inches
const MARGIN_TOTAL = MARGIN_PER_SIDE * 2;

const FABRIC_COUNTS = [14, 16, 18, 20, 22, 25, 28] as const;

function calcFabricSize(stitches: number, count: number): number {
  return stitches / count + MARGIN_TOTAL;
}

function fabricFits(row: FabricRequirementRow): boolean {
  if (!row.assignedFabric || !row.requiredWidth || !row.requiredHeight) return false;
  const { shortestEdgeInches, longestEdgeInches } = row.assignedFabric;
  // Check if fabric is large enough in both dimensions (can rotate)
  const fitsOption1 =
    shortestEdgeInches >= row.requiredWidth && longestEdgeInches >= row.requiredHeight;
  const fitsOption2 =
    longestEdgeInches >= row.requiredWidth && shortestEdgeInches >= row.requiredHeight;
  return fitsOption1 || fitsOption2;
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function StatusIcon({ row }: { row: FabricRequirementRow }) {
  if (row.assignedFabric) {
    if (fabricFits(row)) {
      return (
        <Check
          data-testid={`status-icon-${row.chartId}`}
          className="h-5 w-5 shrink-0 text-emerald-500"
          strokeWidth={2}
        />
      );
    }
    return (
      <AlertTriangle
        data-testid={`status-icon-${row.chartId}`}
        className="h-5 w-5 shrink-0 text-amber-500"
        strokeWidth={2}
      />
    );
  }
  return (
    <Package
      data-testid={`status-icon-${row.chartId}`}
      className="h-5 w-5 shrink-0 text-stone-400"
      strokeWidth={1.5}
    />
  );
}

function SizeReferenceTable({
  stitchesWide,
  stitchesHigh,
}: {
  stitchesWide: number;
  stitchesHigh: number;
}) {
  return (
    <div className="mt-3 overflow-x-auto">
      <table className="w-full min-w-[500px] text-sm">
        <thead>
          <tr className="border-border border-b">
            <th className="text-muted-foreground pb-2 text-left text-xs font-semibold tracking-wider uppercase">
              Count
            </th>
            <th className="text-muted-foreground pb-2 text-right text-xs font-semibold tracking-wider uppercase">
              Design Size
            </th>
            <th className="text-muted-foreground pb-2 text-right text-xs font-semibold tracking-wider uppercase">
              With Margins
            </th>
          </tr>
        </thead>
        <tbody>
          {FABRIC_COUNTS.map((ct) => {
            const designW = stitchesWide / ct;
            const designH = stitchesHigh / ct;
            const totalW = designW + MARGIN_TOTAL;
            const totalH = designH + MARGIN_TOTAL;
            return (
              <tr key={ct} className="border-border/30 border-b last:border-0">
                <td className="text-foreground py-2 font-medium">{ct} count</td>
                <td className="text-muted-foreground py-2 text-right tabular-nums">
                  {designW.toFixed(1)}&quot; x {designH.toFixed(1)}&quot;
                </td>
                <td className="py-2 text-right font-medium text-emerald-700 tabular-nums">
                  {totalW.toFixed(1)}&quot; x {totalH.toFixed(1)}&quot;
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

type FabricFilter = "needs" | "all";

interface FabricRequirementsTabProps {
  rows: FabricRequirementRow[];
  imageUrls: Record<string, string>;
}

export function FabricRequirementsTab({ rows, imageUrls }: FabricRequirementsTabProps) {
  const [filter, setFilter] = useState<FabricFilter>("needs");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showSizeRef, setShowSizeRef] = useState<Set<string>>(new Set());
  const [assignedPairs, setAssignedPairs] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  const filtered = filter === "needs" ? rows.filter((r) => !r.assignedFabric) : rows;

  function toggleSizeRef(chartId: string) {
    setShowSizeRef((prev) => {
      const next = new Set(prev);
      if (next.has(chartId)) {
        next.delete(chartId);
      } else {
        next.add(chartId);
      }
      return next;
    });
  }

  function handleAssign(fabricId: string, chartId: string) {
    startTransition(async () => {
      try {
        const result = await assignFabricToProject(fabricId, chartId);
        if (result.success) {
          setAssignedPairs((prev) => new Set(prev).add(`${fabricId}-${chartId}`));
        } else {
          toast.error("Could not assign fabric. Please try again.");
        }
      } catch {
        toast.error("Something went wrong. Please try again.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Info banner */}
      <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" strokeWidth={2} />
        <div>
          <p className="text-sm text-emerald-800">
            All sizes include <strong>3&quot; margins</strong> on each side for framing allowance.
          </p>
          <p className="mt-1 text-xs text-emerald-600">
            Formula: (stitch count / fabric count) + 6&quot; per dimension
          </p>
        </div>
      </div>

      {/* Filter toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {(["needs", "all"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`cursor-pointer rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                filter === f
                  ? "bg-emerald-100 text-emerald-700"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {f === "needs" ? "Needs Fabric" : "All Projects"}
            </button>
          ))}
        </div>
        <p className="text-muted-foreground text-sm">
          {filtered.length} project{filtered.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Project cards or empty state */}
      {filtered.length === 0 ? (
        <div className="text-muted-foreground py-12 text-center text-sm">
          All projects have fabric assigned. Nice work!
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((row) => {
            const isExpanded = expandedId === row.chartId;
            const sizeRefOpen = showSizeRef.has(row.chartId);

            return (
              <div
                key={row.chartId}
                className="border-border bg-card overflow-hidden rounded-xl border"
              >
                {/* Header row */}
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : row.chartId)}
                  className="hover:bg-muted/50 flex w-full cursor-pointer items-center gap-4 p-4 transition-colors"
                >
                  <StatusIcon row={row} />

                  <div className="min-w-0 flex-1 text-left">
                    <p className="font-heading text-foreground truncate text-sm font-semibold">
                      {row.chartName}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {row.stitchesWide} x {row.stitchesHigh} stitches
                    </p>
                  </div>

                  {/* Quick size preview at common counts */}
                  <div className="hidden shrink-0 gap-4 md:flex">
                    {([14, 18, 25] as const).map((ct) => {
                      const w = calcFabricSize(row.stitchesWide, ct);
                      const h = calcFabricSize(row.stitchesHigh, ct);
                      return (
                        <div key={ct} className="min-w-[70px] text-center">
                          <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                            {ct}ct
                          </span>
                          <p className="text-foreground text-xs tabular-nums">
                            {w.toFixed(1)}&quot; x {h.toFixed(1)}&quot;
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Fabric assignment status */}
                  <div className="hidden shrink-0 sm:block">
                    {row.assignedFabric ? (
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          fabricFits(row)
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {fabricFits(row) ? "Fabric fits" : "Fabric too small"}
                      </span>
                    ) : (
                      <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs">
                        Needs fabric
                      </span>
                    )}
                  </div>

                  <ChevronDown
                    className={`text-muted-foreground h-4 w-4 shrink-0 transition-transform duration-200 ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                    strokeWidth={1.5}
                  />
                </button>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="border-border border-t p-5">
                    {/* Matching fabrics */}
                    {row.matchingFabrics.length > 0 ? (
                      <div>
                        <h4 className="text-muted-foreground mb-3 text-xs font-semibold tracking-wider uppercase">
                          Fabrics That Fit
                        </h4>
                        <div className="flex flex-col gap-2">
                          {row.matchingFabrics.map((fabric) => {
                            const isAssigned = assignedPairs.has(`${fabric.id}-${row.chartId}`);
                            const fits = fabric.fitsWidth && fabric.fitsHeight;

                            return (
                              <div
                                key={fabric.id}
                                className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
                                  isAssigned
                                    ? "border-emerald-300 bg-emerald-50/50"
                                    : "border-border bg-muted/30"
                                }`}
                              >
                                {fits ? (
                                  <Check
                                    className="h-4 w-4 shrink-0 text-emerald-500"
                                    strokeWidth={2}
                                  />
                                ) : (
                                  <AlertTriangle
                                    className="h-4 w-4 shrink-0 text-amber-500"
                                    strokeWidth={2}
                                  />
                                )}

                                <div className="min-w-0 flex-1">
                                  <p className="text-foreground truncate text-sm font-medium">
                                    {fabric.name}
                                  </p>
                                  <p className="text-muted-foreground text-xs">
                                    {fabric.brandName} &middot; {fabric.count}ct &middot;{" "}
                                    {fabric.shortestEdgeInches}&quot; x {fabric.longestEdgeInches}
                                    &quot;
                                  </p>
                                </div>

                                {isAssigned ? (
                                  <span className="shrink-0 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                                    Assigned
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    disabled={isPending}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAssign(fabric.id, row.chartId);
                                    }}
                                    className="shrink-0 cursor-pointer rounded-full border border-emerald-300 px-3 py-1 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-50 disabled:opacity-50"
                                  >
                                    Assign
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-muted text-muted-foreground flex items-center gap-2 rounded-lg p-3 text-sm">
                        <Package className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                        <span>
                          No fabrics in your stash fit this project. Check the size reference below
                          to know what to buy.
                        </span>
                      </div>
                    )}

                    {/* Size Reference (collapsible) */}
                    <div className="mt-4">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSizeRef(row.chartId);
                        }}
                        className="text-muted-foreground hover:text-foreground flex cursor-pointer items-center gap-2 text-xs transition-colors"
                      >
                        <ChevronRight
                          className={`h-3.5 w-3.5 transition-transform duration-200 ${
                            sizeRefOpen ? "rotate-90" : ""
                          }`}
                          strokeWidth={1.5}
                        />
                        <span className="font-semibold tracking-wider uppercase">
                          Size Reference — All Counts
                        </span>
                      </button>

                      {sizeRefOpen && (
                        <SizeReferenceTable
                          stitchesWide={row.stitchesWide}
                          stitchesHigh={row.stitchesHigh}
                        />
                      )}
                    </div>

                    {/* Link to project */}
                    <Link
                      href={`/charts/${row.chartId}`}
                      className="mt-4 inline-block text-sm text-emerald-700 underline decoration-emerald-300 underline-offset-2 transition-colors hover:text-emerald-800"
                    >
                      View project details &rarr;
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

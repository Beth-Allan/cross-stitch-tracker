"use client";

import Link from "next/link";
import { format, parseISO } from "date-fns";
import type { DailyBreakdownEntry } from "@/types/stats";

interface MonthlyDrillDownProps {
  entries: DailyBreakdownEntry[];
  isExpanded: boolean;
  isLoading: boolean;
  monthLabel: string;
  year: number;
  totalStitches: number;
}

export function MonthlyDrillDown({
  entries,
  isExpanded,
  isLoading,
  monthLabel,
  year,
  totalStitches,
}: MonthlyDrillDownProps) {
  return (
    <div
      className="grid transition-all duration-300"
      style={{ gridTemplateRows: isExpanded ? "1fr" : "0fr" }}
    >
      <div className="overflow-hidden">
        {isExpanded && (
          <div className="bg-card border-border mt-2 rounded-lg border p-4">
            {isLoading ? (
              <div className="flex h-20 items-center justify-center">
                <span className="text-muted-foreground text-sm">Loading...</span>
              </div>
            ) : entries.length === 0 ? (
              <div className="flex h-20 items-center justify-center">
                <span className="text-muted-foreground text-sm">No sessions this month</span>
              </div>
            ) : (
              <>
                <div className="flex items-baseline justify-between">
                  <h4 className="font-heading text-sm font-semibold">
                    {monthLabel} {year}
                  </h4>
                  <span className="text-muted-foreground text-xs">
                    {totalStitches.toLocaleString()} stitches
                  </span>
                </div>
                <div className="mt-2 max-h-60 space-y-1 overflow-y-auto">
                  {entries.map((entry, index) => (
                    <div
                      key={`${entry.date}-${entry.projectId}-${index}`}
                      className="flex items-center justify-between py-1"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground text-xs tabular-nums">
                          {format(parseISO(entry.date), "EEE, MMM d")}
                        </span>
                        <Link
                          href={`/charts/${entry.chartId}`}
                          className="text-foreground decoration-muted-foreground/50 hover:decoration-foreground text-sm underline"
                        >
                          {entry.projectName}
                        </Link>
                      </div>
                      <span className="font-mono text-sm tabular-nums">
                        {entry.stitchCount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

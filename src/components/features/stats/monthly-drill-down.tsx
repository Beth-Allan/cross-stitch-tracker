"use client";

import Link from "next/link";
import { format, parseISO } from "date-fns";
import type { DailyBreakdownEntry } from "@/types/stats";

interface MonthlyDrillDownProps {
  entries: DailyBreakdownEntry[];
  isExpanded: boolean;
  monthLabel: string;
  year: number;
  totalStitches: number;
}

export function MonthlyDrillDown({
  entries,
  isExpanded,
  monthLabel,
  year,
  totalStitches,
}: MonthlyDrillDownProps) {
  if (entries.length === 0 && isExpanded) {
    return null;
  }

  return (
    <div
      className="grid transition-all duration-300"
      style={{ gridTemplateRows: isExpanded ? "1fr" : "0fr" }}
    >
      <div className="overflow-hidden">
        <div className="bg-card mt-2 rounded-lg border border-border p-4">
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
                    href={`/projects/${entry.projectId}`}
                    className="text-foreground text-sm underline decoration-muted-foreground/50 hover:decoration-foreground"
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
        </div>
      </div>
    </div>
  );
}

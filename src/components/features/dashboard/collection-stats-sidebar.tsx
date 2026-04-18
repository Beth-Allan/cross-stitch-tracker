"use client";

import { useState } from "react";
import {
  BarChart3,
  Target,
  Pause,
  Package,
  Trophy,
  ChevronDown,
} from "lucide-react";
import type { CollectionStats } from "@/types/dashboard";
import { Card } from "@/components/ui/card";

interface CollectionStatsSidebarProps {
  stats: CollectionStats;
}

const STAT_ROWS = [
  { key: "totalProjects", label: "Total Projects", icon: BarChart3, color: "text-muted-foreground" },
  { key: "totalWIP", label: "In Progress", icon: Target, color: "text-sky-600 dark:text-sky-400" },
  { key: "totalOnHold", label: "On Hold", icon: Pause, color: "text-orange-600 dark:text-orange-400" },
  { key: "totalUnstarted", label: "Unstarted", icon: Package, color: "text-muted-foreground" },
  { key: "totalFinished", label: "Finished", icon: Trophy, color: "text-violet-600 dark:text-violet-400" },
] as const;

/**
 * Collection statistics sidebar. Desktop: always expanded vertical list.
 * Mobile: collapsible with horizontal chip layout when expanded.
 */
export function CollectionStatsSidebar({ stats }: CollectionStatsSidebarProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="gap-0 p-4">
      {/* Mobile: collapsible header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between md:hidden"
        type="button"
      >
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-foreground">
          Collection Stats
        </h3>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      {/* Desktop: always-visible heading */}
      <h3 className="mb-4 text-[11px] font-bold uppercase tracking-wider text-foreground max-md:hidden">
        Collection Stats
      </h3>

      {/* Desktop stat rows */}
      <div className="flex flex-col gap-3.5 max-md:hidden">
        {STAT_ROWS.map((row) => (
          <div key={row.key} className="flex items-center gap-2.5">
            <row.icon className={`h-4 w-4 shrink-0 ${row.color}`} strokeWidth={1.5} />
            <span className="flex-1 text-sm text-muted-foreground">
              {row.label}
            </span>
            <span className="font-mono text-sm font-bold tabular-nums text-foreground">
              {stats[row.key]}
            </span>
          </div>
        ))}

        {/* Divider */}
        <div className="my-1 h-px bg-border" />

        {/* Total Stitches */}
        <div className="flex flex-col gap-0.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Total Stitches
          </span>
          <span className="font-mono text-lg font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
            {stats.totalStitchesCompleted.toLocaleString()}
          </span>
        </div>

        {/* Most Recent Finish */}
        <div className="my-1 h-px bg-border" />
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Most Recent Finish
          </span>
          <span className="truncate text-sm font-medium text-foreground">
            {stats.mostRecentFinish?.name ?? "\u2014"}
          </span>
        </div>

        {/* Largest Project */}
        <div className="my-1 h-px bg-border" />
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Largest Project
          </span>
          <span className="truncate text-sm font-medium text-foreground">
            {stats.largestProject?.name ?? "\u2014"}
          </span>
          {stats.largestProject && (
            <span className="text-[11px] text-muted-foreground">
              {stats.largestProject.stitchCount.toLocaleString()} stitches
            </span>
          )}
        </div>
      </div>

      {/* Mobile: horizontal compact stat chips */}
      {expanded && (
        <div className="mt-3 flex flex-wrap gap-2 md:hidden">
          {STAT_ROWS.map((row) => (
            <div
              key={row.key}
              className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-sm"
            >
              <row.icon className={`h-3.5 w-3.5 ${row.color}`} strokeWidth={1.5} />
              <span className="text-muted-foreground">{row.label}:</span>
              <span className="font-mono font-bold tabular-nums text-foreground">
                {stats[row.key]}
              </span>
            </div>
          ))}
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-sm dark:bg-emerald-950/30">
            <span className="text-emerald-600 dark:text-emerald-400">Stitches:</span>
            <span className="font-mono font-bold tabular-nums text-emerald-700 dark:text-emerald-300">
              {stats.totalStitchesCompleted.toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}

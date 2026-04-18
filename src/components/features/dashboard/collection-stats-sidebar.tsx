"use client";

import { useState } from "react";
import { BarChart3, Target, Pause, Package, Trophy, ChevronDown } from "lucide-react";
import type { CollectionStats } from "@/types/dashboard";
import { Card } from "@/components/ui/card";

interface CollectionStatsSidebarProps {
  stats: CollectionStats;
}

const STAT_ROWS = [
  {
    key: "totalProjects",
    label: "Total Projects",
    icon: BarChart3,
    color: "text-muted-foreground",
  },
  { key: "totalWIP", label: "In Progress", icon: Target, color: "text-sky-600 dark:text-sky-400" },
  {
    key: "totalOnHold",
    label: "On Hold",
    icon: Pause,
    color: "text-orange-600 dark:text-orange-400",
  },
  { key: "totalUnstarted", label: "Unstarted", icon: Package, color: "text-muted-foreground" },
  {
    key: "totalFinished",
    label: "Finished",
    icon: Trophy,
    color: "text-violet-600 dark:text-violet-400",
  },
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
        aria-expanded={expanded}
      >
        <h3 className="text-foreground text-[11px] font-bold tracking-wider uppercase">
          Collection Stats
        </h3>
        <ChevronDown
          className={`text-muted-foreground h-4 w-4 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      {/* Desktop: always-visible heading */}
      <h3 className="text-foreground mb-4 hidden text-[11px] font-bold tracking-wider uppercase md:block">
        Collection Stats
      </h3>

      {/* Desktop stat rows */}
      <div className="hidden flex-col gap-3.5 md:flex">
        {STAT_ROWS.map((row) => (
          <div key={row.key} className="flex items-center gap-2.5">
            <row.icon className={`h-4 w-4 shrink-0 ${row.color}`} strokeWidth={1.5} />
            <span className="text-muted-foreground flex-1 text-sm">{row.label}</span>
            <span className="text-foreground font-mono text-sm font-bold tabular-nums">
              {stats[row.key]}
            </span>
          </div>
        ))}

        {/* Divider */}
        <div className="bg-border my-1 h-px" />

        {/* Total Stitches */}
        <div className="flex flex-col gap-0.5">
          <span className="text-muted-foreground text-[11px] font-bold tracking-wider uppercase">
            Total Stitches
          </span>
          <span className="font-mono text-lg font-bold text-emerald-600 tabular-nums dark:text-emerald-400">
            {stats.totalStitchesCompleted.toLocaleString()}
          </span>
        </div>

        {/* Most Recent Finish */}
        <div className="bg-border my-1 h-px" />
        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground text-[11px] font-bold tracking-wider uppercase">
            Most Recent Finish
          </span>
          <span className="text-foreground truncate text-sm font-medium">
            {stats.mostRecentFinish?.name ?? "\u2014"}
          </span>
        </div>

        {/* Largest Project */}
        <div className="bg-border my-1 h-px" />
        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground text-[11px] font-bold tracking-wider uppercase">
            Largest Project
          </span>
          <span className="text-foreground truncate text-sm font-medium">
            {stats.largestProject?.name ?? "\u2014"}
          </span>
          {stats.largestProject && (
            <span className="text-muted-foreground text-[11px]">
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
              className="bg-muted inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm"
            >
              <row.icon className={`h-3.5 w-3.5 ${row.color}`} strokeWidth={1.5} />
              <span className="text-muted-foreground">{row.label}:</span>
              <span className="text-foreground font-mono font-bold tabular-nums">
                {stats[row.key]}
              </span>
            </div>
          ))}
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-sm dark:bg-emerald-950/30">
            <span className="text-emerald-600 dark:text-emerald-400">Stitches:</span>
            <span className="font-mono font-bold text-emerald-700 tabular-nums dark:text-emerald-300">
              {stats.totalStitchesCompleted.toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}

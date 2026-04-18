"use client";

import { useState, useMemo } from "react";
import { ChevronDown, ArrowUpDown, HelpCircle } from "lucide-react";
import type { ProgressBucket, BucketProject, ProgressBucketId } from "@/types/dashboard";
import { BucketProjectRow } from "./bucket-project-row";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

// ─── Sort logic ─────────────────────────────────────────────────────────────

type ProgressSortOption =
  | "closestToDone"
  | "furthestFromDone"
  | "mostStitchingDays"
  | "fewestStitchingDays"
  | "recentlyStitched";

const SORT_OPTIONS: { value: ProgressSortOption; label: string }[] = [
  { value: "closestToDone", label: "Closest to Done" },
  { value: "furthestFromDone", label: "Furthest from Done" },
  { value: "mostStitchingDays", label: "Most Stitching Days" },
  { value: "fewestStitchingDays", label: "Fewest Stitching Days" },
  { value: "recentlyStitched", label: "Recently Stitched" },
];

function sortBucketProjects(projects: BucketProject[], sort: ProgressSortOption): BucketProject[] {
  return [...projects].sort((a, b) => {
    switch (sort) {
      case "closestToDone":
        return b.progressPercent - a.progressPercent;
      case "furthestFromDone":
        return a.progressPercent - b.progressPercent;
      case "mostStitchingDays":
        return b.stitchingDays - a.stitchingDays;
      case "fewestStitchingDays":
        return a.stitchingDays - b.stitchingDays;
      case "recentlyStitched": {
        if (!a.lastSessionDate && !b.lastSessionDate) return 0;
        if (!a.lastSessionDate) return 1;
        if (!b.lastSessionDate) return -1;
        return new Date(b.lastSessionDate).getTime() - new Date(a.lastSessionDate).getTime();
      }
    }
  });
}

// ─── Bucket accent colors ───────────────────────────────────────────────────

const BUCKET_ACCENTS: Record<ProgressBucketId, { bar: string; bg: string; dot: string }> = {
  unstarted: {
    bar: "bg-stone-300 dark:bg-stone-600",
    bg: "bg-stone-50 dark:bg-stone-800/50",
    dot: "bg-stone-300",
  },
  "0-25": {
    bar: "bg-amber-400 dark:bg-amber-500",
    bg: "bg-amber-50/50 dark:bg-amber-950/20",
    dot: "bg-amber-400",
  },
  "25-50": {
    bar: "bg-emerald-400 dark:bg-emerald-500",
    bg: "bg-emerald-50/50 dark:bg-emerald-950/20",
    dot: "bg-emerald-400",
  },
  "50-75": {
    bar: "bg-sky-400 dark:bg-sky-500",
    bg: "bg-sky-50/50 dark:bg-sky-950/20",
    dot: "bg-sky-400",
  },
  "75-100": {
    bar: "bg-violet-400 dark:bg-violet-500",
    bg: "bg-violet-50/50 dark:bg-violet-950/20",
    dot: "bg-violet-400",
  },
};

// ─── Constants ──────────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 10;

// ─── Component ──────────────────────────────────────────────────────────────

interface ProgressBreakdownTabProps {
  buckets: ProgressBucket[];
  imageUrls: Record<string, string>;
}

export function ProgressBreakdownTab({ buckets, imageUrls }: ProgressBreakdownTabProps) {
  const [expandedBuckets, setExpandedBuckets] = useState<Set<ProgressBucketId>>(new Set());
  const [sort, setSort] = useState<ProgressSortOption>("closestToDone");
  const [visibleCounts, setVisibleCounts] = useState<Record<string, number>>({});

  const totalProjects = buckets.reduce((sum, b) => sum + b.count, 0);

  const sortedBuckets = useMemo(() => {
    return buckets.map((bucket) => ({
      ...bucket,
      projects: sortBucketProjects(bucket.projects, sort),
    }));
  }, [buckets, sort]);

  function toggleBucket(id: ProgressBucketId) {
    setExpandedBuckets((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function showMore(bucketId: string) {
    setVisibleCounts((prev) => ({
      ...prev,
      [bucketId]: (prev[bucketId] ?? ITEMS_PER_PAGE) + ITEMS_PER_PAGE,
    }));
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Sort bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <p className="text-muted-foreground text-sm">
            {totalProjects} project{totalProjects !== 1 ? "s" : ""} across{" "}
            {buckets.filter((b) => b.count > 0).length} stages
          </p>
          <Tooltip>
            <TooltipTrigger
              className="text-muted-foreground/50 hover:text-muted-foreground transition-colors"
              aria-label="About progress breakdown"
            >
              <HelpCircle className="h-3.5 w-3.5" />
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-[220px]">
              Projects grouped by stitch completion %. Tap a bucket to see which projects fall in
              each range.
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="flex items-center gap-2">
          <ArrowUpDown className="text-muted-foreground h-4 w-4" strokeWidth={1.5} />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as ProgressSortOption)}
            className="border-border bg-card text-foreground cursor-pointer rounded-lg border px-3 py-1.5 text-sm"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stacked bar chart */}
      <div className="border-border bg-card overflow-hidden rounded-xl border p-5">
        <div className="bg-muted flex h-6 overflow-hidden rounded-full">
          {buckets.map((bucket) => {
            if (bucket.count === 0) return null;
            const pct = (bucket.count / totalProjects) * 100;
            const accent = BUCKET_ACCENTS[bucket.id];
            return (
              <div
                key={bucket.id}
                className={`${accent.bar} flex items-center justify-center transition-all duration-300`}
                style={{
                  width: `${Math.max(pct, 3)}%`,
                  minWidth: pct > 0 ? "24px" : 0,
                }}
                title={`${bucket.label}: ${bucket.count} projects`}
              >
                {pct >= 8 && (
                  <span className="font-mono text-[10px] font-bold text-white tabular-nums">
                    {bucket.count}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-3 flex flex-wrap gap-3">
          {buckets.map((bucket) => {
            const accent = BUCKET_ACCENTS[bucket.id];
            return (
              <div key={bucket.id} className="flex items-center gap-1.5">
                <div className={`h-2.5 w-2.5 rounded-full ${accent.dot}`} />
                <span className="text-muted-foreground text-[11px]">
                  {bucket.label} ({bucket.count})
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bucket accordion sections */}
      {sortedBuckets.map((bucket) => {
        const isExpanded = expandedBuckets.has(bucket.id);
        const accent = BUCKET_ACCENTS[bucket.id];
        const visibleCount = visibleCounts[bucket.id] ?? ITEMS_PER_PAGE;
        const visible = bucket.projects.slice(0, visibleCount);
        const hasMore = bucket.projects.length > visibleCount;

        return (
          <div key={bucket.id} className="border-border overflow-hidden rounded-xl border">
            {/* Bucket header */}
            <button
              type="button"
              onClick={() => toggleBucket(bucket.id)}
              aria-expanded={isExpanded}
              className={`hover:bg-muted/50 flex w-full cursor-pointer items-center gap-3 px-5 py-3.5 transition-colors ${accent.bg}`}
            >
              <ChevronDown
                className={`text-muted-foreground h-4 w-4 shrink-0 transition-transform duration-200 ${
                  isExpanded ? "" : "-rotate-90"
                }`}
                strokeWidth={1.5}
              />
              <span className="font-heading flex-1 text-left text-sm font-bold">
                {bucket.label}
              </span>
              <span className="text-muted-foreground text-xs">{bucket.range}</span>
              <span className="min-w-[28px] text-right font-mono text-sm font-bold tabular-nums">
                {bucket.count}
              </span>
            </button>

            {/* Expanded content */}
            {isExpanded && (
              <div className="bg-card">
                {bucket.projects.length === 0 ? (
                  <div className="text-muted-foreground py-10 text-center text-sm">
                    No projects in this range yet
                  </div>
                ) : (
                  <>
                    {visible.map((project) => {
                      const thumbnailUrl = project.coverThumbnailUrl
                        ? (imageUrls[project.coverThumbnailUrl] ?? null)
                        : null;
                      return (
                        <BucketProjectRow
                          key={project.projectId}
                          project={project}
                          imageUrl={thumbnailUrl}
                          bucketId={bucket.id}
                        />
                      );
                    })}
                    {hasMore && (
                      <div className="py-3 text-center">
                        <button
                          type="button"
                          onClick={() => showMore(bucket.id)}
                          className="cursor-pointer rounded-lg px-4 py-2 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-50 hover:text-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-300"
                        >
                          Show more ({bucket.projects.length - visibleCount} remaining)
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

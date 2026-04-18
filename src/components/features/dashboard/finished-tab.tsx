"use client";

import { useState, useMemo } from "react";
import { ArrowUpDown, Search } from "lucide-react";
import type { FinishedProjectData } from "@/types/dashboard";
import { FinishedProjectCard } from "./finished-project-card";

// ─── Sort logic ─────────────────────────────────────────────────────────────

type FinishedSortOption = "finishDate" | "startToFinish" | "stitchCount" | "stitchingDays";

const SORT_OPTIONS: { value: FinishedSortOption; label: string }[] = [
  { value: "finishDate", label: "Finish Date" },
  { value: "startToFinish", label: "Duration" },
  { value: "stitchCount", label: "Stitch Count" },
  { value: "stitchingDays", label: "Stitching Days" },
];

function sortFinishedProjects(
  projects: FinishedProjectData[],
  sort: FinishedSortOption,
): FinishedProjectData[] {
  return [...projects].sort((a, b) => {
    switch (sort) {
      case "finishDate": {
        if (!a.finishDate && !b.finishDate) return 0;
        if (!a.finishDate) return 1;
        if (!b.finishDate) return -1;
        return new Date(b.finishDate).getTime() - new Date(a.finishDate).getTime();
      }
      case "startToFinish": {
        if (a.startToFinishDays == null && b.startToFinishDays == null) return 0;
        if (a.startToFinishDays == null) return 1;
        if (b.startToFinishDays == null) return -1;
        return b.startToFinishDays - a.startToFinishDays;
      }
      case "stitchCount":
        return b.totalStitches - a.totalStitches;
      case "stitchingDays":
        return b.stitchingDays - a.stitchingDays;
    }
  });
}

// ─── Constants ──────────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 10;

// ─── Component ──────────────────────────────────────────────────────────────

interface FinishedTabProps {
  projects: FinishedProjectData[];
  imageUrls: Record<string, string>;
}

export function FinishedTab({ projects, imageUrls }: FinishedTabProps) {
  const [sort, setSort] = useState<FinishedSortOption>("finishDate");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  const filtered = useMemo(() => {
    if (!search) return projects;
    const q = search.toLowerCase();
    return projects.filter(
      (p) =>
        p.projectName.toLowerCase().includes(q) ||
        (p.designerName && p.designerName.toLowerCase().includes(q)),
    );
  }, [projects, search]);

  const sorted = useMemo(() => sortFinishedProjects(filtered, sort), [filtered, sort]);

  const visible = sorted.slice(0, visibleCount);
  const hasMore = sorted.length > visibleCount;

  // Aggregate stats (from full list, not filtered)
  const totalStitches = projects.reduce((sum, p) => sum + p.totalStitches, 0);
  const durationsWithValue = projects.filter((p) => p.startToFinishDays != null);
  const avgDuration =
    durationsWithValue.length > 0
      ? Math.round(
          durationsWithValue.reduce((sum, p) => sum + p.startToFinishDays!, 0) /
            durationsWithValue.length,
        )
      : 0;
  const avgDailyStitches =
    projects.length > 0
      ? Math.round(projects.reduce((sum, p) => sum + p.avgDailyStitches, 0) / projects.length)
      : 0;

  return (
    <div className="flex flex-col gap-5">
      {/* Aggregate stat cards */}
      {projects.length > 0 && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-3">
          <AggregateCard label="Projects Finished" value={String(projects.length)} />
          <AggregateCard label="Total Stitches" value={totalStitches.toLocaleString()} />
          <AggregateCard label="Avg Duration" value={`${avgDuration} days`} />
          <AggregateCard label="Avg Daily Stitches" value={avgDailyStitches.toLocaleString()} />
        </div>
      )}

      {/* Search + sort */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative max-w-[320px] min-w-[200px] flex-1">
          <Search
            className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
            strokeWidth={1.5}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setVisibleCount(ITEMS_PER_PAGE);
            }}
            placeholder="Search finished projects..."
            className="border-border bg-card text-foreground placeholder:text-muted-foreground w-full rounded-lg border py-1.5 pr-3 pl-9 text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <ArrowUpDown className="text-muted-foreground h-4 w-4" strokeWidth={1.5} />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as FinishedSortOption)}
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

      {/* Project list or empty state */}
      {filtered.length === 0 ? (
        <div className="text-muted-foreground py-16 text-center text-sm">
          {search
            ? "No finished projects match your search."
            : "No finished projects yet. Your first finish is going to feel amazing!"}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {visible.map((project) => {
            const thumbnailUrl = project.coverThumbnailUrl
              ? (imageUrls[project.coverThumbnailUrl] ?? null)
              : null;
            return (
              <FinishedProjectCard
                key={project.projectId}
                project={project}
                imageUrl={thumbnailUrl}
                isExpanded={expandedId === project.projectId}
                onToggle={() =>
                  setExpandedId(expandedId === project.projectId ? null : project.projectId)
                }
              />
            );
          })}
          {hasMore && (
            <div className="py-2 text-center">
              <button
                type="button"
                onClick={() => setVisibleCount((v) => v + ITEMS_PER_PAGE)}
                className="cursor-pointer rounded-lg px-4 py-2 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-50 hover:text-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-300"
              >
                Show more ({sorted.length - visibleCount} remaining)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Aggregate stat card ────────────────────────────────────────────────────

function AggregateCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-3 dark:border-emerald-900/30 dark:bg-emerald-950/20">
      <p className="text-muted-foreground mb-1 text-[11px] font-bold tracking-wider uppercase">
        {label}
      </p>
      <p className="font-mono text-lg font-bold tabular-nums">{value}</p>
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Star, ArrowUpDown, Scissors } from "lucide-react";
import type { WhatsNextProject } from "@/types/session";
import type { ProjectStatus } from "@/generated/prisma/client";
import { StatusBadge } from "@/components/features/charts/status-badge";
import { STATUS_GRADIENT_CLASSES } from "@/components/features/gallery/gallery-utils";

// ─── Status gradient placeholders ───────────────────────────────────────────

function CoverPlaceholder({ status }: { status: ProjectStatus }) {
  return (
    <div
      className={`flex h-full w-full items-center justify-center ${STATUS_GRADIENT_CLASSES[status] ?? STATUS_GRADIENT_CLASSES.UNSTARTED}`}
    >
      <Scissors className="h-5 w-5 text-stone-400/25" strokeWidth={1} />
    </div>
  );
}

// ─── Sort logic ─────────────────────────────────────────────────────────────

type WhatsNextSort = "kitting" | "oldest" | "newest" | "largest" | "smallest";

const SORT_OPTIONS: { value: WhatsNextSort; label: string }[] = [
  { value: "kitting", label: "Kitting Readiness" },
  { value: "oldest", label: "Oldest First" },
  { value: "newest", label: "Newest First" },
  { value: "largest", label: "Largest First" },
  { value: "smallest", label: "Smallest First" },
];

function sortProjects(projects: WhatsNextProject[], sort: WhatsNextSort): WhatsNextProject[] {
  const sorted = [...projects];
  switch (sort) {
    case "kitting":
      // Default server ranking: wantToStartNext, then kitting% desc, then dateAdded asc
      sorted.sort((a, b) => {
        if (a.wantToStartNext !== b.wantToStartNext) return a.wantToStartNext ? -1 : 1;
        if (a.kittingPercent !== b.kittingPercent) return b.kittingPercent - a.kittingPercent;
        return a.dateAdded.getTime() - b.dateAdded.getTime();
      });
      break;
    case "oldest":
      sorted.sort((a, b) => a.dateAdded.getTime() - b.dateAdded.getTime());
      break;
    case "newest":
      sorted.sort((a, b) => b.dateAdded.getTime() - a.dateAdded.getTime());
      break;
    case "largest":
      sorted.sort((a, b) => b.totalStitches - a.totalStitches);
      break;
    case "smallest":
      sorted.sort((a, b) => a.totalStitches - b.totalStitches);
      break;
  }
  return sorted;
}

// ─── Component ──────────────────────────────────────────────────────────────

interface WhatsNextTabProps {
  projects: WhatsNextProject[];
  imageUrls: Record<string, string>;
}

export function WhatsNextTab({ projects, imageUrls }: WhatsNextTabProps) {
  const [sort, setSort] = useState<WhatsNextSort>("kitting");
  const sorted = useMemo(() => sortProjects(projects, sort), [projects, sort]);

  if (projects.length === 0) {
    return (
      <div className="text-muted-foreground py-12 text-center text-sm">
        No projects queued up. Flag a project as &quot;Start Next&quot; or start kitting to see it
        here.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Sort bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-muted-foreground text-sm">
          {projects.length} project{projects.length !== 1 ? "s" : ""} ready or getting ready to
          stitch
        </p>
        <div className="flex items-center gap-2">
          <ArrowUpDown className="text-muted-foreground h-4 w-4" strokeWidth={1.5} />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as WhatsNextSort)}
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

      {/* Project cards */}
      <div className="flex flex-col gap-3">
        {sorted.map((project) => {
          const thumbnailUrl = project.coverThumbnailUrl
            ? imageUrls[project.coverThumbnailUrl]
            : null;

          return (
            <Link
              key={project.chartId}
              href={`/charts/${project.chartId}`}
              className="group border-border bg-card flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-all duration-200 hover:border-emerald-200 hover:shadow-sm dark:hover:border-emerald-800"
            >
              {/* Priority / star indicator */}
              <div className="w-8 shrink-0 text-center">
                {project.wantToStartNext ? (
                  <Star
                    data-testid={`star-icon-${project.chartId}`}
                    className="inline h-4 w-4 text-amber-500"
                    fill="currentColor"
                    strokeWidth={0}
                  />
                ) : (
                  <span className="text-muted-foreground/40 text-lg">&mdash;</span>
                )}
              </div>

              {/* Cover thumbnail */}
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg">
                {thumbnailUrl ? (
                  <img
                    src={thumbnailUrl}
                    alt={project.chartName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <CoverPlaceholder status={project.status} />
                )}
              </div>

              {/* Info */}
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <p className="font-heading text-foreground truncate text-sm font-semibold transition-colors group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                  {project.chartName}
                </p>
                <p className="text-muted-foreground truncate text-xs">{project.designerName}</p>
                <p className="text-muted-foreground/70 text-xs">
                  {project.totalStitches.toLocaleString()} stitches
                </p>
              </div>

              {/* Kitting progress — compact badge on mobile, full bar on desktop */}
              <div className="shrink-0 md:hidden">
                <span
                  className={`inline-block rounded-full px-2 py-0.5 font-mono text-xs font-medium tabular-nums ${
                    project.kittingPercent === 100
                      ? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
                      : "bg-amber-400/10 text-amber-600 dark:bg-amber-400/20 dark:text-amber-400"
                  }`}
                >
                  {project.kittingPercent}%
                </span>
              </div>
              <div className="hidden w-[120px] shrink-0 md:block">
                <div className="flex items-center gap-2">
                  <div className="bg-muted h-1.5 flex-1 overflow-hidden rounded-full">
                    <div
                      data-testid={`kitting-bar-${project.chartId}`}
                      className={`h-full rounded-full ${
                        project.kittingPercent === 100 ? "bg-emerald-500" : "bg-amber-400"
                      }`}
                      style={{ width: `${project.kittingPercent}%` }}
                    />
                  </div>
                  <span className="text-muted-foreground font-mono text-xs font-medium tabular-nums">
                    {project.kittingPercent}%
                  </span>
                </div>
                <p className="text-muted-foreground/70 mt-0.5 text-xs">
                  {project.kittingPercent === 100 ? "Fully kitted" : "Kitting"}
                </p>
              </div>

              {/* Status badge */}
              <div className="hidden shrink-0 sm:block">
                <StatusBadge status={project.status} />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

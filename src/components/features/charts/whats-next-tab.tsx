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

      {/* Project cards — gallery-style vertical cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((project) => {
          const thumbnailUrl = project.coverThumbnailUrl
            ? imageUrls[project.coverThumbnailUrl]
            : null;

          const kittingLabel =
            project.kittingPercent === 100
              ? "Fully kitted"
              : project.kittingPercent === 0
                ? "Not kitted"
                : "Kitting";

          return (
            <div
              key={project.chartId}
              className="border-border bg-card group overflow-hidden rounded-lg border transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <Link href={`/charts/${project.chartId}`} className="block" tabIndex={-1} aria-hidden="true">
                <div className="relative aspect-[4/3] overflow-hidden">
                  {thumbnailUrl ? (
                    <img
                      src={thumbnailUrl}
                      alt={project.chartName}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      loading="lazy"
                    />
                  ) : (
                    <CoverPlaceholder status={project.status} />
                  )}

                  {/* Star badge for wantToStartNext */}
                  {project.wantToStartNext && (
                    <div className="absolute top-3 left-3">
                      <Star
                        data-testid={`star-icon-${project.chartId}`}
                        className="h-5 w-5 text-amber-500 drop-shadow-sm"
                        fill="currentColor"
                        strokeWidth={0}
                      />
                    </div>
                  )}

                  {/* Status badge */}
                  <div className="absolute top-3 right-3">
                    <StatusBadge status={project.status} />
                  </div>
                </div>
              </Link>

              <div className="flex flex-col gap-1.5 p-4">
                <Link
                  href={`/charts/${project.chartId}`}
                  className="font-heading text-foreground group-hover:text-primary text-sm font-semibold leading-snug transition-colors"
                >
                  {project.chartName}
                </Link>
                {project.designerName && (
                  <p className="text-muted-foreground text-xs">{project.designerName}</p>
                )}
                <p className="text-muted-foreground/70 text-xs">
                  {project.totalStitches.toLocaleString()} stitches
                </p>

                {/* Kitting progress bar */}
                <div className="mt-1 flex items-center gap-2">
                  <div className="bg-muted h-1.5 flex-1 overflow-hidden rounded-full">
                    <div
                      data-testid={`kitting-bar-${project.chartId}`}
                      className={`h-full rounded-full ${
                        project.kittingPercent === 100 ? "bg-progress" : "bg-amber-400"
                      }`}
                      style={{ width: `${project.kittingPercent}%` }}
                    />
                  </div>
                  <span className="text-muted-foreground font-mono text-xs tabular-nums">
                    {project.kittingPercent}%
                  </span>
                </div>
                <p className="text-muted-foreground/70 text-xs">{kittingLabel}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

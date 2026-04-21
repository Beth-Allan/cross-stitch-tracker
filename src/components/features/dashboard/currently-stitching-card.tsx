"use client";

import Link from "next/link";
import { Clock, Calendar } from "lucide-react";
import type { CurrentlyStitchingProject } from "@/types/dashboard";
import { CoverPlaceholder } from "@/components/features/gallery/cover-placeholder";
import { StatusBadge } from "@/components/features/charts/status-badge";

interface CurrentlyStitchingCardProps {
  project: CurrentlyStitchingProject;
  imageUrl: string | null;
}

function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function formatDaysAgo(date: Date): string {
  const days = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

/**
 * Compact 280px WIP card for the Currently Stitching scrollable row.
 * Shows cover image with progress overlay, project name, designer, and stats.
 */
export function CurrentlyStitchingCard({ project, imageUrl }: CurrentlyStitchingCardProps) {
  const tracksTime = project.totalTimeMinutes > 0;

  return (
    <Link
      href={`/charts/${project.chartId}`}
      className="group border-border block w-[280px] flex-shrink-0 overflow-hidden rounded-xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
      style={{ scrollSnapAlign: "start" }}
    >
      {/* Cover area */}
      <div className="relative h-40 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={project.projectName}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <CoverPlaceholder status={project.status} />
        )}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/30 to-transparent" />

        {/* Progress overlay at bottom */}
        <div className="absolute right-3 bottom-3 left-3">
          <div className="flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/30 backdrop-blur-sm">
              <div
                className="h-full rounded-full bg-emerald-400"
                style={{ width: `${project.progressPercent}%` }}
              />
            </div>
            <span className="font-mono text-xs font-bold text-white tabular-nums drop-shadow-sm">
              {project.progressPercent}%
            </span>
          </div>
        </div>
      </div>

      {/* Card body */}
      <div className="bg-card flex flex-col gap-1.5 p-3.5">
        <p className="font-heading text-foreground line-clamp-1 text-sm leading-snug font-semibold transition-colors group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
          {project.projectName}
        </p>
        <p className="text-muted-foreground truncate text-xs">{project.designerName}</p>
        <p className="text-muted-foreground text-[11px]">
          {project.stitchesCompleted.toLocaleString()} / {project.totalStitches.toLocaleString()}{" "}
          stitches
        </p>
        <div className="text-muted-foreground/70 flex flex-wrap items-center gap-3 text-[11px]">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" strokeWidth={1.5} />
            {tracksTime
              ? formatTime(project.totalTimeMinutes)
              : `${project.stitchingDays} stitching days`}
          </span>
          {project.lastSessionDate && (
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3 w-3" strokeWidth={1.5} />
              {formatDaysAgo(project.lastSessionDate)}
            </span>
          )}
        </div>
        <div className="mt-0.5">
          <StatusBadge status={project.status} />
        </div>
      </div>
    </Link>
  );
}

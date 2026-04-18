"use client";

import { ChevronDown } from "lucide-react";
import Link from "next/link";
import type { FinishedProjectData } from "@/types/dashboard";
import { CoverPlaceholder } from "@/components/features/gallery/cover-placeholder";
import { buttonVariants } from "@/components/ui/button-variants";

interface FinishedProjectCardProps {
  project: FinishedProjectData;
  imageUrl: string | null;
  isExpanded: boolean;
  onToggle: () => void;
}

function formatDate(date: Date | null): string {
  if (!date) return "\u2014";
  return new Date(date).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function fmt(n: number): string {
  return n.toLocaleString();
}

export function FinishedProjectCard({
  project,
  imageUrl,
  isExpanded,
  onToggle,
}: FinishedProjectCardProps) {
  return (
    <div className="border-border bg-card overflow-hidden rounded-xl border">
      {/* Compact header row */}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isExpanded}
        className="hover:bg-muted/50 flex w-full cursor-pointer items-center gap-3 px-5 py-3.5 transition-colors"
      >
        {/* Thumbnail */}
        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg">
          {imageUrl ? (
            <img src={imageUrl} alt={project.projectName} className="h-full w-full object-cover" />
          ) : (
            <CoverPlaceholder status="FINISHED" />
          )}
        </div>

        {/* Name + designer */}
        <div className="min-w-0 flex-1 text-left">
          <p className="font-heading truncate text-sm font-semibold">{project.projectName}</p>
          {project.designerName && (
            <p className="text-muted-foreground truncate text-xs">{project.designerName}</p>
          )}
        </div>

        {/* Key inline stats (hidden on mobile) */}
        <div className="hidden min-w-20 shrink-0 text-right md:block">
          <p className="text-foreground text-xs font-medium tabular-nums">
            {fmt(project.totalStitches)} stitches
          </p>
          <p className="text-muted-foreground text-[10px]">
            {project.stitchingDays} stitching days
          </p>
        </div>

        {/* Finish date (hidden on small mobile) */}
        <div className="hidden min-w-[90px] shrink-0 text-right sm:block">
          <p className="text-muted-foreground text-xs">Finished</p>
          <p className="text-foreground text-xs">{formatDate(project.finishDate)}</p>
        </div>

        <ChevronDown
          className={`text-muted-foreground h-4 w-4 shrink-0 transition-transform duration-200 ${
            isExpanded ? "rotate-180" : ""
          }`}
          strokeWidth={1.5}
        />
      </button>

      {/* Expanded stats panel */}
      {isExpanded && (
        <div className="border-border border-t p-5">
          {/* Genre tags */}
          {project.genres.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-1.5">
              {project.genres.map((g) => (
                <span
                  key={g}
                  className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-[11px]"
                >
                  {g}
                </span>
              ))}
            </div>
          )}

          {/* Stats grid */}
          <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-3">
            <StatCell
              label="Start to Finish"
              value={
                project.startToFinishDays != null
                  ? `${fmt(project.startToFinishDays)} days`
                  : "\u2014"
              }
            />
            <StatCell label="Stitching Days" value={String(project.stitchingDays)} />
            <StatCell label="Total Stitches" value={fmt(project.totalStitches)} />
            <StatCell label="Avg Daily" value={fmt(project.avgDailyStitches)} />
            <StatCell label="Threads" value={String(project.threadCount)} />
            <StatCell label="Beads" value={String(project.beadCount)} />
            <StatCell label="Specialty" value={String(project.specialtyCount)} />
          </div>

          {/* View project details link */}
          <div className="mt-4">
            <Link
              href={`/charts/${project.chartId}`}
              className={buttonVariants({ variant: "link", size: "sm" })}
            >
              View project details
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-muted-foreground mb-0.5 text-[10px] font-semibold tracking-wider uppercase">
        {label}
      </p>
      <p className="font-mono text-sm font-bold tabular-nums">{value}</p>
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { Sparkles, ArrowRight, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import type { SpotlightProject } from "@/types/dashboard";
import { LinkButton } from "@/components/ui/link-button";
import { CoverPlaceholder } from "@/components/features/gallery/cover-placeholder";
import { StatusBadge } from "@/components/features/charts/status-badge";
import { getSpotlightProject } from "@/lib/actions/dashboard-actions";
import { getPresignedImageUrls } from "@/lib/actions/upload-actions";

interface SpotlightCardProps {
  project: SpotlightProject | null;
  imageUrl: string | null;
}

/**
 * Featured project card with 2-column layout and shuffle action.
 * Calls getSpotlightProject server action to load a new random project.
 */
export function SpotlightCard({
  project: initialProject,
  imageUrl: initialImageUrl,
}: SpotlightCardProps) {
  const [project, setProject] = useState(initialProject);
  const [imageUrl, setImageUrl] = useState(initialImageUrl);
  const [isPending, startTransition] = useTransition();

  if (!project) return null;

  const isInProgress = project.status === "IN_PROGRESS" || project.status === "ON_HOLD";

  function handleShuffle() {
    startTransition(async () => {
      try {
        const newProject = await getSpotlightProject();
        if (newProject) {
          setProject(newProject);
          // Resolve presigned URL for the new project's cover image
          const key = newProject.coverImageUrl ?? newProject.coverThumbnailUrl;
          if (key) {
            const urls = await getPresignedImageUrls([key]);
            setImageUrl(urls[key] ?? null);
          } else {
            setImageUrl(null);
          }
        }
      } catch {
        toast.error("Could not load a new spotlight project. Try again.");
      }
    });
  }

  return (
    <div className="border-border bg-card relative overflow-hidden rounded-2xl border shadow-sm">
      <div className="grid min-h-[260px] grid-cols-1 md:grid-cols-2">
        {/* Image half -- hidden on mobile */}
        <div className="relative overflow-hidden max-md:hidden">
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
        </div>

        {/* Content half */}
        <div className="flex flex-col justify-center gap-3 p-7 md:p-8">
          {/* Section label */}
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500 dark:text-amber-400" strokeWidth={2} />
            <span className="text-[11px] font-bold tracking-wider text-amber-600 uppercase dark:text-amber-400">
              Rediscover This One
            </span>
          </div>

          {/* Project name */}
          <h3 className="font-heading text-foreground text-2xl leading-tight font-bold">
            {project.projectName}
          </h3>

          {/* Designer + status */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-muted-foreground text-sm">{project.designerName}</span>
            <StatusBadge status={project.status} />
          </div>

          {/* Stitch count */}
          <div className="text-muted-foreground flex flex-wrap items-center gap-4 text-sm">
            <span>{project.totalStitches.toLocaleString()} stitches</span>
          </div>

          {/* Genre tags */}
          {project.genres.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {project.genres.slice(0, 4).map((g) => (
                <span
                  key={g}
                  className="bg-muted text-muted-foreground rounded-full px-2.5 py-0.5 text-[11px]"
                >
                  {g}
                </span>
              ))}
            </div>
          )}

          {/* Progress bar for in-progress projects */}
          {isInProgress && project.progressPercent > 0 && (
            <div className="flex items-center gap-2.5">
              <div className="bg-muted h-2 flex-1 overflow-hidden rounded-full">
                <div
                  className="h-full rounded-full bg-emerald-500 dark:bg-emerald-400"
                  style={{ width: `${project.progressPercent}%` }}
                />
              </div>
              <span className="font-mono text-sm font-medium text-emerald-600 tabular-nums dark:text-emerald-400">
                {project.progressPercent}%
              </span>
            </div>
          )}

          {/* Action buttons */}
          <div className="mt-1 flex flex-wrap gap-2.5">
            <LinkButton
              href={`/charts/${project.chartId}`}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
            >
              Check It Out
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </LinkButton>
            <button
              onClick={handleShuffle}
              disabled={isPending}
              type="button"
              className="border-border bg-card text-muted-foreground hover:bg-muted inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
              aria-label="Shuffle spotlight project"
            >
              <RefreshCw className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`} strokeWidth={2} />
              Shuffle Spotlight
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

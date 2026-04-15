"use client";

import { HeroCoverBanner } from "./hero-cover-banner";
import { HeroStatusBadge } from "./hero-status-badge";
import { HeroKebabMenu } from "./hero-kebab-menu";
import { SizeBadge } from "@/components/features/charts/size-badge";
import { BackToGalleryLink } from "@/components/features/charts/back-to-gallery-link";
import { LinkButton } from "@/components/ui/link-button";
import { Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { getEffectiveStitchCount } from "@/lib/utils/size-category";
import type { ProjectStatus } from "@/generated/prisma/client";
import type { ChartWithProject } from "@/types/chart";

const numberFormatter = new Intl.NumberFormat();

/** Statuses that show a progress percentage in the hero metadata */
const PROGRESS_STATUSES = new Set<ProjectStatus>(["IN_PROGRESS", "ON_HOLD", "FINISHED", "FFO"]);

/** Celebration ring classes per status */
function getCelebrationClasses(status: ProjectStatus): string {
  switch (status) {
    case "FINISHED":
      return "ring-2 ring-violet-200 dark:ring-violet-800";
    case "FFO":
      return "ring-2 ring-rose-200 dark:ring-rose-800";
    default:
      return "";
  }
}

interface ProjectDetailHeroProps {
  chart: ChartWithProject;
  imageUrls: Record<string, string>;
  onStatusChange?: (status: ProjectStatus) => void;
}

/**
 * Project detail hero section.
 * Composes cover banner, metadata, interactive status badge, edit button, and kebab menu.
 * Celebrates FINISHED/FFO with ring accents per UI-SPEC.
 */
export function ProjectDetailHero({ chart, imageUrls, onStatusChange }: ProjectDetailHeroProps) {
  const project = chart.project;
  const status = project?.status ?? "UNSTARTED";
  const { count: effectiveStitchCount, approximate } = getEffectiveStitchCount(
    chart.stitchCount,
    chart.stitchesWide,
    chart.stitchesHigh,
  );

  const coverImageUrl = imageUrls[chart.coverImageUrl ?? ""] ?? null;

  const showProgress = project && PROGRESS_STATUSES.has(status);
  const progressPercent =
    showProgress && effectiveStitchCount > 0
      ? Math.round((project.stitchesCompleted / effectiveStitchCount) * 100)
      : null;

  return (
    <div className={cn("space-y-4 rounded-lg", getCelebrationClasses(status))}>
      {/* Cover image banner */}
      <HeroCoverBanner imageUrl={coverImageUrl} chartName={chart.name} />

      {/* Navigation bar: Back to Gallery + Edit + Kebab */}
      <div className="flex items-center justify-between">
        <BackToGalleryLink />
        <div className="flex items-center gap-2">
          <LinkButton href={`/charts/${chart.id}/edit`} variant="outline" size="sm">
            <Pencil className="size-4" data-icon="inline-start" />
            Edit
          </LinkButton>
          <HeroKebabMenu chartId={chart.id} chartName={chart.name} />
        </div>
      </div>

      {/* Chart name */}
      <h1 className="font-heading text-foreground text-2xl font-semibold lg:text-3xl">
        {chart.name}
      </h1>

      {/* Designer name */}
      {chart.designer && (
        <p className="text-muted-foreground text-base">Designer: {chart.designer.name}</p>
      )}

      {/* Metadata row: status badge | stitch count | size badge | progress % */}
      <div className="flex flex-wrap items-center gap-3">
        {project && (
          <HeroStatusBadge
            chartId={chart.id}
            currentStatus={status}
            onStatusChange={onStatusChange}
          />
        )}

        {effectiveStitchCount > 0 && (
          <span className="text-muted-foreground text-sm">
            Stitch Count: {approximate && "~"}
            {numberFormatter.format(effectiveStitchCount)}
            {approximate && " (est.)"}
          </span>
        )}

        {effectiveStitchCount > 0 && (
          <SizeBadge
            stitchCount={chart.stitchCount}
            stitchesWide={chart.stitchesWide}
            stitchesHigh={chart.stitchesHigh}
          />
        )}

        {progressPercent !== null && (
          <span className="text-muted-foreground text-sm">{progressPercent}%</span>
        )}
      </div>
    </div>
  );
}

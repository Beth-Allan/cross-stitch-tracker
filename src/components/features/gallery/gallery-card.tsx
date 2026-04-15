"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { StatusBadge } from "@/components/features/charts/status-badge";
import { CoverPlaceholder } from "./cover-placeholder";
import { KittingDots } from "./kitting-dots";
import { getCelebrationClasses } from "./gallery-utils";
import { SIZE_TOOLTIP_TEXT } from "./gallery-format";
import { formatNumber, formatDate } from "./gallery-format";
import type { GalleryCardData } from "./gallery-types";

function buildSupplySummary(card: GalleryCardData): string {
  const parts: string[] = [`${card.threadColourCount} colours`];
  if (card.beadTypeCount > 0) parts.push(`${card.beadTypeCount} bead types`);
  if (card.specialtyItemCount > 0) parts.push(`${card.specialtyItemCount} specialty`);
  return parts.join(" \u00B7 ");
}

// ---- Sub-components ---------------------------------------------------------

function GenreTags({ genres }: { genres: string[] }) {
  const visible = genres.slice(0, 3);
  const extra = genres.length - 3;
  if (visible.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {visible.map((g) => (
        <span
          key={g}
          className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-[11px]"
        >
          {g}
        </span>
      ))}
      {extra > 0 && (
        <span className="bg-muted text-muted-foreground/60 rounded-full px-1.5 py-0.5 text-[11px]">
          +{extra}
        </span>
      )}
    </div>
  );
}

function WIPFooter({ card }: { card: GalleryCardData }) {
  return (
    <div className="flex flex-col gap-2">
      {/* Progress bar */}
      <div className="flex items-center gap-2.5">
        <div className="bg-muted h-1.5 flex-1 overflow-hidden rounded-full">
          <div
            className="h-full rounded-full bg-emerald-500 dark:bg-emerald-400"
            style={{ width: `${card.progressPercent}%` }}
          />
        </div>
        <span className="font-mono text-xs font-medium text-emerald-600 tabular-nums dark:text-emerald-400">
          {card.progressPercent}%
        </span>
      </div>

      {/* Stitch fraction */}
      <p className="text-muted-foreground text-[11px]">
        {formatNumber(card.stitchesCompleted)} / {formatNumber(card.stitchCount)} stitches
      </p>

      {/* Supply summary */}
      <p className="text-muted-foreground text-[11px]">{buildSupplySummary(card)}</p>
    </div>
  );
}

function UnstartedFooter({ card }: { card: GalleryCardData }) {
  return (
    <div className="flex flex-col gap-2.5">
      {/* Supply summary */}
      <p className="text-muted-foreground text-[11px]">{buildSupplySummary(card)}</p>

      {/* Kitting dots */}
      <KittingDots
        fabricStatus={card.fabricStatus}
        threadStatus={card.threadStatus}
        beadsStatus={card.beadsStatus}
        specialtyStatus={card.specialtyStatus}
      />
    </div>
  );
}

function FinishedFooter({ card }: { card: GalleryCardData }) {
  const isFFO = card.status === "FFO";

  const dateLabel = card.ffoDate
    ? `FFO ${formatDate(card.ffoDate)}`
    : card.finishDate
      ? `Finished ${formatDate(card.finishDate)}`
      : null;

  return (
    <div className="flex flex-col gap-2">
      {/* 100% progress bar */}
      <div className="flex items-center gap-2.5">
        <div className="bg-muted h-1.5 flex-1 overflow-hidden rounded-full">
          <div
            className={`h-full w-full rounded-full ${
              isFFO ? "bg-rose-500 dark:bg-rose-400" : "bg-violet-500 dark:bg-violet-400"
            }`}
          />
        </div>
        <span
          className={`font-mono text-xs font-medium tabular-nums ${
            isFFO ? "text-rose-600 dark:text-rose-400" : "text-violet-600 dark:text-violet-400"
          }`}
        >
          100%
        </span>
      </div>

      {/* Completion date */}
      {dateLabel && (
        <div className="text-muted-foreground flex items-center gap-1 text-[11px]">
          <Sparkles className="h-3 w-3" strokeWidth={1.5} />
          {dateLabel}
        </div>
      )}

      {/* Supply summary */}
      <p className="text-muted-foreground text-[11px]">{buildSupplySummary(card)}</p>
    </div>
  );
}

// ---- Main GalleryCard -------------------------------------------------------

interface GalleryCardProps {
  card: GalleryCardData;
}

export function GalleryCard({ card }: GalleryCardProps) {
  const [imgFailed, setImgFailed] = useState(false);

  const hasRealImage = !!card.coverImageUrl && !imgFailed;
  const celebrationClasses = getCelebrationClasses(card.status);

  return (
    <div
      className={`group bg-card hover:shadow-foreground/8 flex flex-col overflow-hidden rounded-xl transition-[box-shadow,transform] duration-200 hover:-translate-y-1 hover:shadow-lg ${
        celebrationClasses ?? "border-border border"
      }`}
    >
      {/* Cover image area */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {hasRealImage ? (
          <img
            src={card.coverImageUrl!}
            alt={card.name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <CoverPlaceholder status={card.status} />
        )}

        {/* Gradient overlay on real images */}
        {hasRealImage && (
          <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/20 to-transparent" />
        )}

        {/* Status badge -- top left */}
        <div className="absolute top-3 left-3">
          <StatusBadge status={card.status} />
        </div>

        {/* Size badge -- top right */}
        <div className="absolute top-3 right-3">
          <Tooltip>
            <TooltipTrigger
              render={<span />}
              className="bg-background/90 text-muted-foreground cursor-default rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-widest uppercase"
            >
              {card.sizeCategory}
            </TooltipTrigger>
            <TooltipContent>{SIZE_TOOLTIP_TEXT[card.sizeCategory]}</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Card body */}
      <div className="bg-card flex flex-1 flex-col gap-1.5 p-4">
        {/* Project name link */}
        <Link
          href={`/charts/${card.chartId}`}
          className="font-heading text-foreground decoration-border line-clamp-2 text-sm leading-snug font-semibold underline underline-offset-2 transition-colors hover:text-emerald-700 hover:decoration-emerald-500 dark:hover:text-emerald-400 dark:hover:decoration-emerald-400"
        >
          {card.name}
        </Link>

        {/* Designer */}
        <p className="text-muted-foreground truncate text-sm">{card.designerName}</p>

        {/* Stitch count (non-WIP only) */}
        {card.statusGroup !== "wip" && (
          <p className="text-muted-foreground text-xs">
            {formatNumber(card.stitchCount)} stitches
            {card.stitchCountApproximate ? " (approx.)" : ""}
          </p>
        )}

        {/* Genre tags */}
        <GenreTags genres={card.genres} />

        {/* Spacer */}
        <div className="min-h-1 flex-1" />

        {/* Status-specific footer */}
        {card.statusGroup === "wip" && <WIPFooter card={card} />}
        {card.statusGroup === "unstarted" && <UnstartedFooter card={card} />}
        {card.statusGroup === "finished" && <FinishedFooter card={card} />}
      </div>
    </div>
  );
}

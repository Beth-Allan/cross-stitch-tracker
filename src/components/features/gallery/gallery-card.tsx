"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FileText, Sparkles } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { StatusBadge } from "@/components/features/charts/status-badge";
import { STATUS_CONFIG } from "@/lib/utils/status";
import { CoverPlaceholder } from "./cover-placeholder";
import { KittingDots } from "./kitting-dots";
import { getObjectPositionStyle } from "@/lib/utils/focal-point";
import { getCelebrationClasses } from "./gallery-utils";
import { SIZE_COLORS } from "@/lib/utils/size-category";
import { SIZE_TOOLTIP_TEXT } from "./gallery-format";
import { formatNumber, formatDate } from "./gallery-format";
import type { GalleryCardData } from "./gallery-types";

function buildSupplySummary(card: GalleryCardData): string {
  const parts: string[] = [
    `${card.threadColourCount} ${card.threadColourCount === 1 ? "colour" : "colours"}`,
  ];
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
      <div className="flex items-center gap-2.5">
        <div
          className="bg-muted h-1.5 flex-1 overflow-hidden rounded-full"
          role="progressbar"
          aria-valuenow={card.progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Stitching progress"
        >
          <div
            className="bg-progress h-full rounded-full"
            style={{ width: `${card.progressPercent}%` }}
          />
        </div>
        <span className="text-progress-foreground font-mono text-xs font-medium tabular-nums">
          {card.progressPercent}%
        </span>
      </div>

      <p className="text-muted-foreground text-[11px]">
        {formatNumber(card.stitchesCompleted)} / {formatNumber(card.stitchCount)} stitches
      </p>

      <p className="text-muted-foreground text-[11px]">{buildSupplySummary(card)}</p>
    </div>
  );
}

function UnstartedFooter({ card }: { card: GalleryCardData }) {
  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-muted-foreground text-[11px]">{buildSupplySummary(card)}</p>

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
      <div className="flex items-center gap-2.5">
        <div
          className="bg-muted h-1.5 flex-1 overflow-hidden rounded-full"
          role="progressbar"
          aria-valuenow={100}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Stitching progress"
        >
          <div className={`h-full w-full rounded-full ${STATUS_CONFIG[card.status].dotClass}`} />
        </div>
        <span
          className={`font-mono text-xs font-medium tabular-nums ${STATUS_CONFIG[card.status].textClass}`}
        >
          100%
        </span>
      </div>

      {dateLabel && (
        <div className="text-muted-foreground flex items-center gap-1 text-[11px]">
          <Sparkles className="h-3 w-3" strokeWidth={1.5} />
          {dateLabel}
        </div>
      )}

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
      className={`group bg-card hover:shadow-foreground/8 flex flex-col overflow-hidden rounded-xl transition-[box-shadow,transform] duration-200 hover:-translate-y-1 hover:shadow-lg motion-reduce:transform-none ${
        celebrationClasses ?? "border-border border"
      }`}
    >
      <Link href={`/charts/${card.chartId}`} className="block" tabIndex={-1} aria-hidden="true">
        <div className="relative aspect-[4/3] overflow-hidden">
          {hasRealImage ? (
            <Image
              src={card.coverImageUrl!}
              alt={card.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transform-none"
              style={getObjectPositionStyle(card.focalPointX, card.focalPointY)}
              onError={() => setImgFailed(true)}
              unoptimized
            />
          ) : (
            <CoverPlaceholder status={card.status} />
          )}

          {hasRealImage && (
            <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/20 to-transparent" />
          )}

          <div className="absolute top-3 left-3">
            <StatusBadge status={card.status} />
          </div>

          <div className="absolute top-3 right-3">
            <Tooltip>
              <TooltipTrigger
                render={<span />}
                className={`${SIZE_COLORS[card.sizeCategory].bg} ${SIZE_COLORS[card.sizeCategory].text} cursor-default rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-widest uppercase`}
              >
                {card.sizeCategory}
              </TooltipTrigger>
              <TooltipContent>{SIZE_TOOLTIP_TEXT[card.sizeCategory]}</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </Link>

      <div className="bg-card flex flex-1 flex-col gap-1.5 p-4">
        <Link
          href={`/charts/${card.chartId}`}
          className="font-heading text-foreground decoration-border hover:text-selected-foreground hover:decoration-progress line-clamp-2 text-sm leading-snug font-semibold underline underline-offset-2 transition-colors"
        >
          {card.name}
        </Link>

        <p className="text-muted-foreground truncate text-sm">{card.designerName}</p>

        {card.statusGroup !== "wip" && (
          <p className="text-muted-foreground text-xs">
            {formatNumber(card.stitchCount)} stitches
            {card.stitchCountApproximate ? " (approx.)" : ""}
          </p>
        )}

        {card.hasDigitalCopy && (
          <div className="flex items-center gap-1">
            <FileText className="text-primary size-3.5" aria-hidden="true" />
            <span className="text-muted-foreground text-xs">Digital copy</span>
          </div>
        )}

        <GenreTags genres={card.genres} />

        <div className="min-h-1 flex-1" />

        {card.statusGroup === "wip" && <WIPFooter card={card} />}
        {card.statusGroup === "unstarted" && <UnstartedFooter card={card} />}
        {card.statusGroup === "finished" && <FinishedFooter card={card} />}
      </div>
    </div>
  );
}

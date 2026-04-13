"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { StatusBadge } from "@/components/features/charts/status-badge";
import { CoverPlaceholder } from "./cover-placeholder";
import { KittingDots } from "./kitting-dots";
import { getCelebrationStyles } from "./gallery-utils";
import type { GalleryCardData } from "./gallery-types";

// ---- Helpers ----------------------------------------------------------------

function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function buildSupplySummary(card: GalleryCardData): string {
  const parts: string[] = [`${card.threadColourCount} colours`];
  if (card.beadTypeCount > 0) parts.push(`${card.beadTypeCount} bead types`);
  if (card.specialtyItemCount > 0)
    parts.push(`${card.specialtyItemCount} specialty`);
  return parts.join(" \u00B7 ");
}

// ---- Sub-components ---------------------------------------------------------

function GenreTags({ genres }: { genres: string[] }) {
  const visible = genres.slice(0, 3);
  const extra = genres.length - 3;
  if (visible.length === 0) return null;
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {visible.map((g) => (
        <span
          key={g}
          className="text-[11px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400"
        >
          {g}
        </span>
      ))}
      {extra > 0 && (
        <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-stone-100 text-stone-400 dark:bg-stone-800 dark:text-stone-500">
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
        <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-stone-100 dark:bg-stone-800">
          <div
            className="h-full rounded-full bg-emerald-500 dark:bg-emerald-400"
            style={{ width: `${card.progressPercent}%` }}
          />
        </div>
        <span className="text-xs font-medium tabular-nums font-mono text-emerald-600 dark:text-emerald-400">
          {card.progressPercent}%
        </span>
      </div>

      {/* Stitch fraction */}
      <p className="text-[11px] text-muted-foreground">
        {formatNumber(card.stitchesCompleted)} /{" "}
        {formatNumber(card.stitchCount)} stitches
      </p>

      {/* Supply summary */}
      <p className="text-[11px] text-muted-foreground">
        {buildSupplySummary(card)}
      </p>
    </div>
  );
}

function UnstartedFooter({ card }: { card: GalleryCardData }) {
  return (
    <div className="flex flex-col gap-2.5">
      {/* Supply summary */}
      <p className="text-[11px] text-muted-foreground">
        {buildSupplySummary(card)}
      </p>

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
        <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-stone-100 dark:bg-stone-800">
          <div
            className={`h-full w-full rounded-full ${
              isFFO
                ? "bg-rose-500 dark:bg-rose-400"
                : "bg-violet-500 dark:bg-violet-400"
            }`}
          />
        </div>
        <span
          className={`text-xs font-medium tabular-nums font-mono ${
            isFFO
              ? "text-rose-600 dark:text-rose-400"
              : "text-violet-600 dark:text-violet-400"
          }`}
        >
          100%
        </span>
      </div>

      {/* Completion date */}
      {dateLabel && (
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <Sparkles className="h-3 w-3" strokeWidth={1.5} />
          {dateLabel}
        </div>
      )}

      {/* Supply summary */}
      <p className="text-[11px] text-muted-foreground">
        {buildSupplySummary(card)}
      </p>
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
  const celebrationStyles = getCelebrationStyles(card.status);

  return (
    <div
      className={`group rounded-xl overflow-hidden bg-card flex flex-col hover:shadow-lg hover:shadow-stone-900/8 hover:-translate-y-1 transition-shadow transition-transform duration-200 ${
        celebrationStyles ? "" : "border border-border"
      }`}
      style={celebrationStyles ?? undefined}
    >
      {/* Cover image area */}
      <div className="aspect-[4/3] relative overflow-hidden">
        {hasRealImage ? (
          <img
            src={card.coverImageUrl!}
            alt={card.name}
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
          <span className="text-[10px] font-semibold uppercase tracking-widest rounded-full bg-white/80 px-2 py-0.5 text-stone-600 backdrop-blur-sm dark:bg-stone-900/80 dark:text-stone-300">
            {card.sizeCategory}
          </span>
        </div>
      </div>

      {/* Card body */}
      <div className="flex flex-1 flex-col gap-1.5 bg-card p-4">
        {/* Project name link */}
        <Link
          href={`/charts/${card.chartId}`}
          className="font-heading text-sm font-semibold leading-snug text-foreground line-clamp-2 underline decoration-stone-300 underline-offset-2 transition-colors hover:text-emerald-700 hover:decoration-emerald-500 dark:decoration-stone-600 dark:hover:text-emerald-400 dark:hover:decoration-emerald-400"
        >
          {card.name}
        </Link>

        {/* Designer */}
        <p className="text-sm truncate text-muted-foreground">
          {card.designerName}
        </p>

        {/* Stitch count (non-WIP only) */}
        {card.statusGroup !== "wip" && (
          <p className="text-xs text-muted-foreground">
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

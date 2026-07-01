"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";
import type { SeriesWithStats } from "@/types/series";

export function getCompletionPercent(series: SeriesWithStats): number {
  if (series.progress.ownedCount === 0) return 0;
  return Math.round((series.progress.finishedCount / series.progress.ownedCount) * 100);
}

interface SeriesCardProps {
  series: SeriesWithStats;
  onDelete?: () => void;
}

export function SeriesCard({ series, onDelete }: SeriesCardProps) {
  const percent = getCompletionPercent(series);
  const { ownedCount, finishedCount, totalCount } = series.progress;

  return (
    <Link
      href={`/series/${series.id}`}
      className="border-border bg-card hover:border-border/80 block rounded-xl border p-5 transition-all hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="font-heading text-foreground text-sm font-semibold">{series.name}</p>
          {series.designerName && (
            <p className="text-muted-foreground mt-0.5 text-xs">by {series.designerName}</p>
          )}
        </div>
        {onDelete && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete();
            }}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md p-1.5 transition-colors"
            aria-label={`Delete ${series.name}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="bg-muted mt-3 h-2 overflow-hidden rounded-full">
        {ownedCount > 0 && (
          <div className="bg-primary h-full rounded-full" style={{ width: `${percent}%` }} />
        )}
      </div>

      <div className="mt-2 flex items-center justify-between">
        <div className="text-muted-foreground text-xs">
          {totalCount !== null ? (
            <span>
              {finishedCount} of {ownedCount} finished
            </span>
          ) : (
            <span>
              {finishedCount} finished <span aria-hidden="true">&middot;</span> {ownedCount} charts
            </span>
          )}
        </div>
        <span className="text-primary text-sm font-semibold">{percent}%</span>
      </div>
    </Link>
  );
}

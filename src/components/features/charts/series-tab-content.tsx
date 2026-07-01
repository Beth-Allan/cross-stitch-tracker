"use client";

import Link from "next/link";
import { Library } from "lucide-react";
import { SeriesCard } from "@/components/features/series/series-card";
import { SeriesSortPills } from "@/components/features/series/series-sort-pills";
import { useSeriesSort } from "@/components/features/series/use-series-sort";
import { EmptyState } from "@/components/ui/empty-state";
import type { SeriesWithStats } from "@/types/series";

interface SeriesTabContentProps {
  series: SeriesWithStats[];
}

export function SeriesTabContent({ series }: SeriesTabContentProps) {
  const { sort, handleSort, sortedSeries } = useSeriesSort(series);

  if (series.length === 0) {
    return (
      <EmptyState icon={Library} title="No series yet" heading={false}>
        <p className="text-muted-foreground text-sm">
          Create your first series on the{" "}
          <Link href="/series" className="text-primary hover:underline">
            Series page
          </Link>
          .
        </p>
      </EmptyState>
    );
  }

  return (
    <div className="space-y-6">
      <SeriesSortPills sort={sort} onSort={handleSort} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sortedSeries.map((s) => (
          <SeriesCard key={s.id} series={s} />
        ))}
      </div>
    </div>
  );
}

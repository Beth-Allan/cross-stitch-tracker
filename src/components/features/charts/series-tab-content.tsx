"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Library, ChevronUp, ChevronDown } from "lucide-react";
import { SeriesCard } from "@/components/features/series/series-card";
import { EmptyState } from "@/components/ui/empty-state";
import type { SeriesWithStats } from "@/types/series";

type SortKey = "name" | "completion" | "charts";
type SortDir = "asc" | "desc";

interface SeriesTabContentProps {
  series: SeriesWithStats[];
}

export function SeriesTabContent({ series }: SeriesTabContentProps) {
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: "name", dir: "asc" });

  function handleSort(key: SortKey) {
    setSort((prev) =>
      prev.key === key ? { key, dir: prev.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" },
    );
  }

  const sortedSeries = useMemo(() => {
    const result = [...series];
    result.sort((a, b) => {
      const dir = sort.dir === "asc" ? 1 : -1;
      switch (sort.key) {
        case "name":
          return dir * a.name.localeCompare(b.name);
        case "completion": {
          const aOwned = a.progress.ownedCount;
          const bOwned = b.progress.ownedCount;
          if (aOwned === 0 && bOwned === 0) return 0;
          if (aOwned === 0) return 1;
          if (bOwned === 0) return -1;
          const aRatio = a.progress.finishedCount / aOwned;
          const bRatio = b.progress.finishedCount / bOwned;
          return dir * (aRatio - bRatio);
        }
        case "charts":
          return dir * (a.progress.ownedCount - b.progress.ownedCount);
        default:
          return 0;
      }
    });
    return result;
  }, [series, sort]);

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
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground mr-2 text-xs font-semibold tracking-widest uppercase">
          Sort by
        </span>
        {(
          [
            { key: "name" as SortKey, label: "Name" },
            { key: "completion" as SortKey, label: "Completion" },
            { key: "charts" as SortKey, label: "Charts" },
          ] as const
        ).map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => handleSort(opt.key)}
            className={`rounded-full px-3 py-1 text-xs transition-colors ${
              sort.key === opt.key
                ? "bg-success-muted text-success-muted-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {opt.label}
            {sort.key === opt.key &&
              (sort.dir === "asc" ? (
                <ChevronUp className="ml-0.5 inline h-3 w-3" />
              ) : (
                <ChevronDown className="ml-0.5 inline h-3 w-3" />
              ))}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sortedSeries.map((s) => (
          <SeriesCard key={s.id} series={s} />
        ))}
      </div>
    </div>
  );
}

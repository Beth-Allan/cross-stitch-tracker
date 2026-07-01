"use client";

import { useState, useMemo } from "react";
import type { SeriesWithStats } from "@/types/series";

export type SortKey = "name" | "completion" | "charts";
export type SortDir = "asc" | "desc";

export function useSeriesSort(series: SeriesWithStats[]) {
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

  return { sort, handleSort, sortedSeries };
}

/**
 * Dual progress computation for series: owned/total + finished/owned.
 * Pure function with no side effects or async behavior.
 */

import type { SeriesProgress } from "@/types/series";

export const FINISHED_STATUSES = new Set(["FINISHED", "FFO"]);

type ChartWithProject = {
  project: { status: string } | null;
};

/**
 * Computes series progress from assigned charts and optional total count.
 * - ownedCount: number of charts assigned to the series
 * - finishedCount: charts with FINISHED or FFO project status
 * - totalCount: passthrough of the series' known total (null = open-ended)
 */
export function computeSeriesProgress(
  charts: ChartWithProject[],
  totalCount: number | null,
): SeriesProgress {
  const ownedCount = charts.length;
  const finishedCount = charts.filter(
    (chart) => chart.project !== null && FINISHED_STATUSES.has(chart.project.status),
  ).length;

  return { ownedCount, finishedCount, totalCount };
}

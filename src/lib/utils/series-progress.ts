import type { ProjectStatus } from "@/generated/prisma/client";
import type { SeriesProgress } from "@/types/series";

export const FINISHED_STATUSES = new Set<ProjectStatus>(["FINISHED", "FFO"]);

type ChartWithProject = {
  project: { status: ProjectStatus } | null;
};

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

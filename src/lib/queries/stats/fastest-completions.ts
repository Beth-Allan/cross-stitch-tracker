import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import { toCalendarDate, daysBetweenCalendarDates } from "@/lib/utils/calendar-date";
import { getUserTimezone, getCurrentPeriod } from "./timezone";
import { buildDateFilter, type Scope, STATS_CACHE_VOLATILE, STATS_CACHE_STABLE } from "./utils";
import { calculateSizeCategory, getEffectiveStitchCount } from "@/lib/utils/size-category";
import type { FastestCompletion, SizeCategory } from "@/types/stats";

async function computeFastestCompletions(
  userId: string,
  scope: Scope,
): Promise<FastestCompletion[]> {
  try {
    const dateFilter = buildDateFilter(scope);

    const projects = await prisma.project.findMany({
      where: {
        userId,
        status: { in: ["FINISHED", "FFO"] },
        finishDate: { not: null },
        ...(dateFilter ? { finishDate: dateFilter } : {}),
      },
      include: {
        chart: {
          select: {
            id: true,
            name: true,
            stitchCount: true,
            stitchesWide: true,
            stitchesHigh: true,
          },
        },
        sessions: {
          select: { date: true },
          orderBy: { date: "asc" },
          take: 1,
        },
      },
    });

    const fastestPerCategory = new Map<SizeCategory, FastestCompletion>();

    for (const project of projects) {
      if (!project.finishDate) continue;

      const effectiveStart = project.startDate ?? project.sessions[0]?.date;
      if (!effectiveStart) continue;

      const startDate = toCalendarDate(effectiveStart);
      const finishDate = toCalendarDate(project.finishDate);
      const daysToComplete = daysBetweenCalendarDates(finishDate, startDate);
      if (daysToComplete < 0) continue;

      const { count } = getEffectiveStitchCount(
        project.chart.stitchCount,
        project.chart.stitchesWide,
        project.chart.stitchesHigh,
      );
      if (count === 0) continue;

      const category = calculateSizeCategory(count);
      const existing = fastestPerCategory.get(category);

      if (!existing || daysToComplete < existing.daysToComplete) {
        fastestPerCategory.set(category, {
          sizeCategory: category,
          daysToComplete,
          projectId: project.id,
          chartId: project.chart.id,
          projectName: project.chart.name,
          startDate,
          finishDate,
        });
      }
    }

    const categoryOrder: SizeCategory[] = ["Mini", "Small", "Medium", "Large", "BAP"];
    return categoryOrder
      .filter((cat) => fastestPerCategory.has(cat))
      .map((cat) => fastestPerCategory.get(cat)!);
  } catch (error) {
    console.error("[stats] computeFastestCompletions failed:", { userId, scope, error });
    throw error;
  }
}

export function getFastestCompletions(userId: string, scope: Scope) {
  const { year: currentYear } = getCurrentPeriod(getUserTimezone(userId));
  const year = parseInt(scope, 10);
  const revalidate = !isNaN(year) && year < currentYear ? STATS_CACHE_STABLE : STATS_CACHE_VOLATILE;

  return unstable_cache(
    () => computeFastestCompletions(userId, scope),
    [`stats-fastest-completions-${userId}-${scope}`],
    { tags: ["stats"], revalidate },
  )();
}

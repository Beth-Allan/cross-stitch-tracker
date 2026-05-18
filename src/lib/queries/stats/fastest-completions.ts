import { unstable_cache } from "next/cache";
import { TZDate } from "@date-fns/tz";
import { differenceInCalendarDays, format } from "date-fns";
import { prisma } from "@/lib/db";
import { getUserTimezone } from "./timezone";
import {
  calculateSizeCategory,
  getEffectiveStitchCount,
} from "@/lib/utils/size-category";
import type { FastestCompletion, SizeCategory } from "@/types/stats";

function buildDateFilter(scope: string, tz: string): { gte: Date; lt: Date } | null {
  if (scope === "all") return null;
  const year = parseInt(scope, 10);
  if (isNaN(year)) return null;
  const yearStart = new TZDate(year, 0, 1, 0, 0, 0, tz);
  const nextYearStart = new TZDate(year + 1, 0, 1, 0, 0, 0, tz);
  return { gte: yearStart, lt: nextYearStart };
}

async function computeFastestCompletions(
  userId: string,
  scope: string,
): Promise<FastestCompletion[]> {
  try {
    const tz = getUserTimezone(userId);
    const dateFilter = buildDateFilter(scope, tz);

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

      const daysToComplete = differenceInCalendarDays(project.finishDate, effectiveStart);
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
          startDate: format(new TZDate(effectiveStart, tz), "yyyy-MM-dd"),
          finishDate: format(new TZDate(project.finishDate, tz), "yyyy-MM-dd"),
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

export function getFastestCompletions(userId: string, scope: string) {
  const currentYear = new Date().getFullYear();
  const year = parseInt(scope, 10);
  const revalidate = !isNaN(year) && year < currentYear ? 3600 : 300;

  return unstable_cache(
    () => computeFastestCompletions(userId, scope),
    [`stats-fastest-completions-${userId}-${scope}`],
    { tags: ["stats"], revalidate },
  )();
}

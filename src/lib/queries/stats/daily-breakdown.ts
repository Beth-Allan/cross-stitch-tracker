import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import { toCalendarDate } from "@/lib/utils/calendar-date";
import { getUserTimezone, getCurrentPeriod } from "./timezone";
import { monthBounds } from "./utils";
import type { DailyBreakdownEntry } from "@/types/stats";

async function computeDailyBreakdown(
  userId: string,
  month: number,
  year: number,
): Promise<DailyBreakdownEntry[]> {
  try {
    const { monthStart, nextMonthStart } = monthBounds(year, month);

    const sessions = await prisma.stitchSession.findMany({
      where: {
        project: { userId },
        date: { gte: monthStart, lt: nextMonthStart },
      },
      include: {
        project: {
          select: { id: true, chartId: true, chart: { select: { name: true } } },
        },
      },
      orderBy: { date: "asc" },
    });

    return sessions.map((session) => {
      return {
        date: toCalendarDate(session.date),
        projectId: session.project.id,
        chartId: session.project.chartId,
        projectName: session.project.chart.name,
        stitchCount: session.stitchCount,
      };
    });
  } catch (error) {
    console.error("[stats] computeDailyBreakdown failed:", { userId, month, year, error });
    throw error;
  }
}

export function getDailyBreakdown(userId: string, month: number, year: number) {
  const current = getCurrentPeriod(getUserTimezone(userId));
  const isCurrentMonth = month === current.month && year === current.year;
  const revalidate = isCurrentMonth ? 300 : 3600;

  return unstable_cache(
    () => computeDailyBreakdown(userId, month, year),
    [`stats-daily-${userId}-${month}-${year}`],
    { tags: ["stats"], revalidate },
  )();
}

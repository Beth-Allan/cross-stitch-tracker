import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import { toCalendarDate } from "@/lib/utils/calendar-date";
import { getUserTimezone, getCurrentPeriod } from "./timezone";
import { monthBounds, STATS_CACHE_VOLATILE, STATS_CACHE_STABLE } from "./utils";
import type { CalendarDayData } from "@/types/stats";

async function computeCalendarDays(
  userId: string,
  month: number,
  year: number,
): Promise<CalendarDayData[]> {
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

    if (sessions.length === 0) return [];

    // Group by date string in user's timezone
    const grouped = new Map<string, CalendarDayData>();

    for (const session of sessions) {
      const dateKey = toCalendarDate(session.date);

      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, { date: dateKey, sessions: [] });
      }

      grouped.get(dateKey)!.sessions.push({
        projectId: session.project.id,
        chartId: session.project.chartId,
        projectName: session.project.chart.name,
        stitchCount: session.stitchCount,
      });
    }

    return Array.from(grouped.values());
  } catch (error) {
    console.error("[stats] computeCalendarDays failed:", { userId, month, year, error });
    throw error;
  }
}

export function getCalendarDays(userId: string, month: number, year: number) {
  const current = getCurrentPeriod(getUserTimezone(userId));
  const isCurrentMonth = month === current.month && year === current.year;
  const revalidate = isCurrentMonth ? STATS_CACHE_VOLATILE : STATS_CACHE_STABLE;

  return unstable_cache(
    () => computeCalendarDays(userId, month, year),
    [`stats-calendar-${userId}-${month}-${year}`],
    { tags: ["stats"], revalidate },
  )();
}

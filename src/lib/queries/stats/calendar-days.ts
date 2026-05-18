import { unstable_cache } from "next/cache";
import { TZDate } from "@date-fns/tz";
import { format } from "date-fns";
import { prisma } from "@/lib/db";
import { getUserTimezone } from "./timezone";
import type { CalendarDayData } from "@/types/stats";

async function computeCalendarDays(
  userId: string,
  month: number,
  year: number,
): Promise<CalendarDayData[]> {
  try {
    const tz = getUserTimezone(userId);

    const monthStart = new TZDate(year, month - 1, 1, 0, 0, 0, tz);
    const nextMonthStart = new TZDate(year, month, 1, 0, 0, 0, tz);

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
      const tzDate = new TZDate(session.date, tz);
      const dateKey = format(tzDate, "yyyy-MM-dd");

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
  const now = new Date();
  const isCurrentMonth = month === now.getMonth() + 1 && year === now.getFullYear();
  const revalidate = isCurrentMonth ? 300 : 3600;

  return unstable_cache(
    () => computeCalendarDays(userId, month, year),
    [`stats-calendar-${userId}-${month}-${year}`],
    { tags: ["stats"], revalidate },
  )();
}

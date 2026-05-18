import { unstable_cache } from "next/cache";
import { TZDate } from "@date-fns/tz";
import { format } from "date-fns";
import { prisma } from "@/lib/db";
import { getUserTimezone } from "./timezone";
import type { DailyBreakdownEntry } from "@/types/stats";

async function computeDailyBreakdown(
  userId: string,
  month: number,
  year: number,
): Promise<DailyBreakdownEntry[]> {
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

    return sessions.map((session) => {
      const tzDate = new TZDate(session.date, tz);
      return {
        date: format(tzDate, "yyyy-MM-dd"),
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
  const now = new Date();
  const isCurrentMonth = month === now.getMonth() + 1 && year === now.getFullYear();
  const revalidate = isCurrentMonth ? 300 : 3600;

  return unstable_cache(
    () => computeDailyBreakdown(userId, month, year),
    [`stats-daily-${userId}-${month}-${year}`],
    { tags: ["stats"], revalidate },
  )();
}

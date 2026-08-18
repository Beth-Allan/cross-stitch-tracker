import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import {
  parseCalendarDate,
  addCalendarDays,
  startOfCalendarMonth,
} from "@/lib/utils/calendar-date";
import { getUserTimezone, getTodayCalendarDate } from "./timezone";
import { STATS_CACHE_VOLATILE } from "./utils";
import type { PaceMetricsData } from "@/types/stats";

async function computePaceMetrics(userId: string): Promise<PaceMetricsData> {
  try {
    const tz = getUserTimezone(userId);
    const today = getTodayCalendarDate(tz);

    // An N-day window is the N calendar days ending today, because the data it
    // aggregates is calendar-dated (docs/ARCHITECTURE.md, "Calendar dates")
    const windowStart = (days: number) => parseCalendarDate(addCalendarDays(today, -(days - 1)));

    const recentRateStart = windowStart(30);
    const priorRateStart = windowStart(60);
    const thisMonthStart = parseCalendarDate(startOfCalendarMonth(today));
    const lastMonthStart = parseCalendarDate(
      startOfCalendarMonth(addCalendarDays(startOfCalendarMonth(today), -1)),
    );

    const [sum7Day, sum30Day, sum90Day, thisMonth, lastMonth, rateRecent, ratePrior] =
      await Promise.all([
        prisma.stitchSession.aggregate({
          where: { project: { userId }, date: { gte: windowStart(7) } },
          _sum: { stitchCount: true },
        }),
        prisma.stitchSession.aggregate({
          where: { project: { userId }, date: { gte: windowStart(30) } },
          _sum: { stitchCount: true },
        }),
        prisma.stitchSession.aggregate({
          where: { project: { userId }, date: { gte: windowStart(90) } },
          _sum: { stitchCount: true },
        }),
        prisma.stitchSession.aggregate({
          where: { project: { userId }, date: { gte: thisMonthStart } },
          _sum: { stitchCount: true },
        }),
        prisma.stitchSession.aggregate({
          where: {
            project: { userId },
            date: { gte: lastMonthStart, lt: thisMonthStart },
          },
          _sum: { stitchCount: true },
        }),
        // Stitch rate (recent 30-day window, only sessions with time data)
        prisma.stitchSession.aggregate({
          where: {
            project: { userId },
            date: { gte: recentRateStart },
            timeSpentMinutes: { not: null },
          },
          _sum: { stitchCount: true, timeSpentMinutes: true },
        }),
        // Stitch rate (the 30-day window immediately before the recent one)
        prisma.stitchSession.aggregate({
          where: {
            project: { userId },
            date: { gte: priorRateStart, lt: recentRateStart },
            timeSpentMinutes: { not: null },
          },
          _sum: { stitchCount: true, timeSpentMinutes: true },
        }),
      ]);

    // Compute stitch rate (stitches per hour)
    const recentStitches = rateRecent._sum.stitchCount ?? 0;
    const recentMinutes = rateRecent._sum.timeSpentMinutes ?? 0;
    const stitchRate = recentMinutes > 0 ? Math.round((recentStitches / recentMinutes) * 60) : null;

    const priorStitches = ratePrior._sum.stitchCount ?? 0;
    const priorMinutes = ratePrior._sum.timeSpentMinutes ?? 0;
    const stitchRatePrior =
      priorMinutes > 0 ? Math.round((priorStitches / priorMinutes) * 60) : null;

    return {
      avg7Day: Math.round((sum7Day._sum.stitchCount ?? 0) / 7),
      avg30Day: Math.round((sum30Day._sum.stitchCount ?? 0) / 30),
      avg90Day: Math.round((sum90Day._sum.stitchCount ?? 0) / 90),
      thisMonthStitches: thisMonth._sum.stitchCount ?? 0,
      lastMonthStitches: lastMonth._sum.stitchCount ?? 0,
      stitchRate,
      stitchRatePrior,
    };
  } catch (error) {
    console.error("[stats] computePaceMetrics failed:", { userId, error });
    throw error;
  }
}

export function getPaceMetrics(userId: string) {
  return unstable_cache(() => computePaceMetrics(userId), [`stats-pace-${userId}`], {
    tags: ["stats"],
    revalidate: STATS_CACHE_VOLATILE,
  })();
}

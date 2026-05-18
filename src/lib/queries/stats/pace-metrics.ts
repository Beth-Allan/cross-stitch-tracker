import { unstable_cache } from "next/cache";
import { TZDate } from "@date-fns/tz";
import { subDays, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { prisma } from "@/lib/db";
import { getUserTimezone } from "./timezone";
import type { PaceMetricsData } from "@/types/stats";

async function computePaceMetrics(userId: string): Promise<PaceMetricsData> {
  try {
    const tz = getUserTimezone(userId);
    const now = TZDate.tz(tz);

    const [sum7Day, sum30Day, sum90Day, thisMonth, lastMonth, rateRecent, ratePrior] =
      await Promise.all([
        // 7-day aggregate
        prisma.stitchSession.aggregate({
          where: { project: { userId }, date: { gte: subDays(now, 7) } },
          _sum: { stitchCount: true },
        }),
        // 30-day aggregate
        prisma.stitchSession.aggregate({
          where: { project: { userId }, date: { gte: subDays(now, 30) } },
          _sum: { stitchCount: true },
        }),
        // 90-day aggregate
        prisma.stitchSession.aggregate({
          where: { project: { userId }, date: { gte: subDays(now, 90) } },
          _sum: { stitchCount: true },
        }),
        // Current month aggregate
        prisma.stitchSession.aggregate({
          where: { project: { userId }, date: { gte: startOfMonth(now) } },
          _sum: { stitchCount: true },
        }),
        // Last month aggregate
        prisma.stitchSession.aggregate({
          where: {
            project: { userId },
            date: {
              gte: startOfMonth(subMonths(now, 1)),
              lte: endOfMonth(subMonths(now, 1)),
            },
          },
          _sum: { stitchCount: true },
        }),
        // Stitch rate (recent 30-day window, only sessions with time data)
        prisma.stitchSession.aggregate({
          where: {
            project: { userId },
            date: { gte: subDays(now, 30) },
            timeSpentMinutes: { not: null },
          },
          _sum: { stitchCount: true, timeSpentMinutes: true },
        }),
        // Stitch rate (prior 30-day window: -60 to -30 days)
        prisma.stitchSession.aggregate({
          where: {
            project: { userId },
            date: { gte: subDays(now, 60), lt: subDays(now, 30) },
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
    revalidate: 300,
  })();
}

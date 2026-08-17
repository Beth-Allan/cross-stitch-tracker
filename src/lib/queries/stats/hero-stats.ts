import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import { getUserTimezone, getLocalDayBoundaries } from "./timezone";
import type { StatsHeroData } from "@/types/stats";

async function computeHeroStats(userId: string): Promise<StatsHeroData> {
  try {
    const tz = getUserTimezone(userId);
    const { todayStart, todayEnd, weekStart, monthStart, yearStart } = getLocalDayBoundaries(tz);

    const [today, week, month, year, lifetime, completedCount, collectionTotal] = await Promise.all(
      [
        prisma.stitchSession.aggregate({
          where: { project: { userId }, date: { gte: todayStart, lte: todayEnd } },
          _sum: { stitchCount: true },
        }),
        prisma.stitchSession.aggregate({
          where: { project: { userId }, date: { gte: weekStart } },
          _sum: { stitchCount: true },
        }),
        prisma.stitchSession.aggregate({
          where: { project: { userId }, date: { gte: monthStart } },
          _sum: { stitchCount: true },
        }),
        prisma.stitchSession.aggregate({
          where: { project: { userId }, date: { gte: yearStart } },
          _sum: { stitchCount: true },
        }),
        prisma.stitchSession.aggregate({
          where: { project: { userId } },
          _sum: { stitchCount: true, timeSpentMinutes: true },
          _count: { id: true },
        }),
        prisma.project.count({
          where: { userId, status: { in: ["FINISHED", "FFO"] } },
        }),
        prisma.chart.aggregate({
          where: { project: { userId } },
          _sum: { stitchCount: true },
        }),
      ],
    );

    return {
      stitchesToday: today._sum.stitchCount ?? 0,
      stitchesThisWeek: week._sum.stitchCount ?? 0,
      stitchesThisMonth: month._sum.stitchCount ?? 0,
      stitchesThisYear: year._sum.stitchCount ?? 0,
      totalLifetimeStitches: lifetime._sum.stitchCount ?? 0,
      totalSessions: lifetime._count.id,
      totalTimeMinutes: lifetime._sum.timeSpentMinutes ?? 0,
      projectsCompleted: completedCount,
      collectionTotalStitches: collectionTotal._sum?.stitchCount ?? 0,
    };
  } catch (error) {
    console.error("[stats] computeHeroStats failed:", {
      userId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

export function getHeroStats(userId: string) {
  return unstable_cache(() => computeHeroStats(userId), [`stats-hero-${userId}`], {
    tags: ["stats"],
    revalidate: 300,
  })();
}

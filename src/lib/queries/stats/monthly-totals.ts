import { unstable_cache } from "next/cache";
import { TZDate } from "@date-fns/tz";
import { prisma } from "@/lib/db";
import { getUserTimezone } from "./timezone";
import type { MonthlyTotal } from "@/types/stats";

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;

async function computeMonthlyTotals(userId: string, year: number): Promise<MonthlyTotal[]> {
  try {
    const tz = getUserTimezone(userId);

    // Year boundaries in user's timezone
    const yearStart = new TZDate(year, 0, 1, 0, 0, 0, tz);
    const yearEnd = new TZDate(year, 11, 31, 23, 59, 59, tz);

    const results = await prisma.stitchSession.groupBy({
      by: ["date"],
      where: {
        project: { userId },
        date: { gte: yearStart, lte: yearEnd },
      },
      _sum: { stitchCount: true },
    });

    // Initialize 12-month bucket
    const monthBuckets = new Array<number>(12).fill(0);

    // Bucket each session into its month (timezone-aware)
    for (const row of results) {
      const sessionDate = new TZDate(row.date, tz);
      const month = sessionDate.getMonth(); // 0-11
      monthBuckets[month] += row._sum.stitchCount ?? 0;
    }

    return MONTH_LABELS.map((month, index) => ({
      month,
      totalStitches: monthBuckets[index],
      year,
    }));
  } catch (error) {
    console.error("[stats] computeMonthlyTotals failed:", { userId, year, error });
    throw error;
  }
}

export function getMonthlyTotals(userId: string, year: number) {
  const currentYear = new Date().getFullYear();
  const revalidate = year < currentYear ? 3600 : 300;

  return unstable_cache(
    () => computeMonthlyTotals(userId, year),
    [`stats-monthly-${userId}-${year}`],
    { tags: ["stats"], revalidate },
  )();
}

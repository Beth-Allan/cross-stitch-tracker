import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import { parseCalendarDate } from "@/lib/utils/calendar-date";
import { getUserTimezone, getCurrentPeriod } from "./timezone";
import { STATS_CACHE_VOLATILE, STATS_CACHE_STABLE } from "./utils";
import type { MonthlyTotal } from "@/types/stats";

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

async function computeMonthlyTotals(userId: string, year: number): Promise<MonthlyTotal[]> {
  try {
    const yearStart = parseCalendarDate(`${year}-01-01`);
    const nextYearStart = parseCalendarDate(`${year + 1}-01-01`);

    const results = await prisma.stitchSession.groupBy({
      by: ["date"],
      where: {
        project: { userId },
        date: { gte: yearStart, lt: nextYearStart },
      },
      _sum: { stitchCount: true },
    });

    // Initialize 12-month bucket
    const monthBuckets = new Array<number>(12).fill(0);

    // Bucket each session into its month (timezone-aware)
    for (const row of results) {
      const month = row.date.getUTCMonth(); // 0-11
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
  const { year: currentYear } = getCurrentPeriod(getUserTimezone(userId));
  const revalidate = year < currentYear ? STATS_CACHE_STABLE : STATS_CACHE_VOLATILE;

  return unstable_cache(
    () => computeMonthlyTotals(userId, year),
    [`stats-monthly-${userId}-${year}`],
    { tags: ["stats"], revalidate },
  )();
}

import { unstable_cache } from "next/cache";
import { TZDate } from "@date-fns/tz";
import { getDay } from "date-fns";
import { prisma } from "@/lib/db";
import { getUserTimezone } from "./timezone";
import type { DayOfWeekData } from "@/types/stats";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

async function computeDayOfWeekPattern(userId: string): Promise<DayOfWeekData[]> {
  try {
    const tz = getUserTimezone(userId);

    const sessions = await prisma.stitchSession.findMany({
      where: { project: { userId } },
      select: { date: true, stitchCount: true },
    });

    // Buckets: [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
    const totals = new Array<number>(7).fill(0);
    const counts = new Array<number>(7).fill(0);

    for (const session of sessions) {
      const tzDate = new TZDate(session.date, tz);
      // getDay: 0=Sun, 1=Mon, 2=Tue, ..., 6=Sat
      const dayIndex = getDay(tzDate);
      // Reorder to Mon-Sun: Mon=0, Tue=1, ..., Sun=6
      const reordered = dayIndex === 0 ? 6 : dayIndex - 1;
      totals[reordered] += session.stitchCount;
      counts[reordered] += 1;
    }

    return DAY_LABELS.map((dayOfWeek, index) => ({
      dayOfWeek,
      avgStitches: counts[index] > 0 ? Math.round(totals[index] / counts[index]) : 0,
    }));
  } catch (error) {
    console.error("[stats] computeDayOfWeekPattern failed:", { userId, error });
    throw error;
  }
}

export function getDayOfWeekPattern(userId: string) {
  return unstable_cache(() => computeDayOfWeekPattern(userId), [`stats-dayofweek-${userId}`], {
    tags: ["stats"],
    revalidate: 300,
  })();
}

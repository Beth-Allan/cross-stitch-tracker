import { TZDate } from "@date-fns/tz";
import { startOfDay, addDays, format, differenceInCalendarDays } from "date-fns";
import { prisma } from "@/lib/db";
import { getUserTimezone } from "./timezone";
import type { BrokenRecord } from "@/types/stats";

/**
 * Expects the session to already be committed to the DB (reads fresh data, not cached).
 * Non-critical — callers should wrap in try/catch so detection failures
 * never block session creation.
 */
export async function detectBrokenRecords(
  userId: string,
  session: { date: Date; stitchCount: number; projectId: string },
): Promise<BrokenRecord[]> {
  try {
    const records: BrokenRecord[] = [];
    const tz = getUserTimezone(userId);

    const sessionLocal = TZDate.tz(tz, session.date);
    const dayStart = startOfDay(sessionLocal);
    const dayEnd = addDays(dayStart, 1);

    const [todayAggregate, allSessions] = await Promise.all([
      prisma.stitchSession.aggregate({
        where: {
          project: { userId },
          date: { gte: dayStart, lt: dayEnd },
        },
        _sum: { stitchCount: true },
      }),
      prisma.stitchSession.findMany({
        where: { project: { userId } },
        select: { date: true, stitchCount: true },
        orderBy: { date: "desc" },
      }),
    ]);

    const todayTotal = todayAggregate._sum.stitchCount ?? 0;

    const dayMap = new Map<string, number>();
    const todayStr = format(dayStart, "yyyy-MM-dd");

    for (const s of allSessions) {
      const localDate = format(TZDate.tz(tz, s.date), "yyyy-MM-dd");
      if (localDate === todayStr) continue;
      dayMap.set(localDate, (dayMap.get(localDate) ?? 0) + s.stitchCount);
    }

    let previousBestDay = 0;
    for (const total of dayMap.values()) {
      if (total > previousBestDay) previousBestDay = total;
    }

    if (todayTotal > previousBestDay) {
      records.push({
        type: "bestDay",
        label: "Best Day",
        oldValue: previousBestDay,
        newValue: todayTotal,
        unit: "stitches",
      });
    }

    // Skip one matching instance by stitchCount+date to avoid self-comparison
    let previousBestSession = 0;
    let skippedSelf = false;
    for (const s of allSessions) {
      if (!skippedSelf && s.stitchCount === session.stitchCount) {
        const localDate = format(TZDate.tz(tz, s.date), "yyyy-MM-dd");
        if (localDate === todayStr) {
          skippedSelf = true;
          continue;
        }
      }
      if (s.stitchCount > previousBestSession) previousBestSession = s.stitchCount;
    }

    if (session.stitchCount > previousBestSession) {
      records.push({
        type: "bestSession",
        label: "Best Session",
        oldValue: previousBestSession,
        newValue: session.stitchCount,
        unit: "stitches",
      });
    }

    const uniqueDatesAll = [
      ...new Set(allSessions.map((s) => format(TZDate.tz(tz, s.date), "yyyy-MM-dd"))),
    ].sort();

    const longestStreakAll = computeLongestStreak(uniqueDatesAll);
    const uniqueDatesWithoutToday = uniqueDatesAll.filter((d) => d !== todayStr);
    const longestStreakWithout = computeLongestStreak(uniqueDatesWithoutToday);

    if (longestStreakAll > longestStreakWithout) {
      records.push({
        type: "longestStreak",
        label: "Longest Streak",
        oldValue: longestStreakWithout,
        newValue: longestStreakAll,
        unit: "days",
      });
    }

    return records;
  } catch (error) {
    console.error("[stats] detectBrokenRecords failed:", { userId, session, error });
    throw error;
  }
}
function computeLongestStreak(sortedDates: string[]): number {
  if (sortedDates.length === 0) return 0;

  let longest = 1;
  let current = 1;

  for (let i = 1; i < sortedDates.length; i++) {
    const prev = new Date(sortedDates[i - 1]);
    const curr = new Date(sortedDates[i]);
    const diff = differenceInCalendarDays(curr, prev);
    if (diff === 1) {
      current++;
      if (current > longest) longest = current;
    } else {
      current = 1;
    }
  }

  return longest;
}

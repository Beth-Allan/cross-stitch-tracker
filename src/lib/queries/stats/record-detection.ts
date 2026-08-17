import { prisma } from "@/lib/db";
import {
  parseCalendarDate,
  toCalendarDate,
  addCalendarDays,
  daysBetweenCalendarDates,
} from "@/lib/utils/calendar-date";
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

    const todayStr = toCalendarDate(session.date);
    const dayStart = parseCalendarDate(todayStr);
    const dayEnd = parseCalendarDate(addCalendarDays(todayStr, 1));

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

    for (const s of allSessions) {
      const localDate = toCalendarDate(s.date);
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
        if (toCalendarDate(s.date) === todayStr) {
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

    const uniqueDatesAll = [...new Set(allSessions.map((s) => toCalendarDate(s.date)))].sort();

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
    const diff = daysBetweenCalendarDates(sortedDates[i], sortedDates[i - 1]);
    if (diff === 1) {
      current++;
      if (current > longest) longest = current;
    } else {
      current = 1;
    }
  }

  return longest;
}

import { TZDate } from "@date-fns/tz";
import { startOfDay, addDays, format, differenceInCalendarDays } from "date-fns";
import { prisma } from "@/lib/db";
import { getUserTimezone } from "./timezone";
import type { BrokenRecord } from "@/types/stats";

/**
 * Detects whether a just-inserted session breaks any personal records.
 * Called from createSession AFTER the session is committed to the DB.
 *
 * NOT cached — runs once per session creation with fresh data.
 * Wrapped in try/catch at the call site so detection failures
 * never block session creation.
 */
export async function detectBrokenRecords(
  userId: string,
  session: { date: Date; stitchCount: number; projectId: string },
): Promise<BrokenRecord[]> {
  const records: BrokenRecord[] = [];
  const tz = getUserTimezone(userId);

  // Compute timezone-aware day boundaries for the session's date
  const sessionLocal = TZDate.tz(tz, session.date);
  const dayStart = startOfDay(sessionLocal);
  const dayEnd = addDays(dayStart, 1);

  // Fetch today's total and all historical sessions in parallel
  const [todayAggregate, allSessions] = await Promise.all([
    // Sum all stitches for today (including the just-inserted session)
    prisma.stitchSession.aggregate({
      where: {
        project: { userId },
        date: { gte: dayStart, lt: dayEnd },
      },
      _sum: { stitchCount: true },
    }),
    // All sessions for this user (for best day, best session, and streak calculations)
    prisma.stitchSession.findMany({
      where: { project: { userId } },
      select: { date: true, stitchCount: true },
      orderBy: { date: "desc" },
    }),
  ]);

  const todayTotal = todayAggregate._sum.stitchCount ?? 0;

  // --- Best Day Detection ---
  // Group historical sessions by local date (excluding today) to find previous best day
  const dayMap = new Map<string, number>();
  const todayStr = format(dayStart, "yyyy-MM-dd");

  for (const s of allSessions) {
    const localDate = format(TZDate.tz(tz, s.date), "yyyy-MM-dd");
    if (localDate === todayStr) continue; // Exclude today's sessions
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

  // --- Best Session Detection ---
  // Find the highest single-session stitchCount across ALL sessions.
  // Skip exactly one instance matching the current session's stitchCount
  // (the just-inserted row) so we don't self-compare.
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

  // --- Longest Streak Detection ---
  // Get unique dates sorted ascending, compute streaks with and without today
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
}

/**
 * Computes the longest streak of consecutive days from a sorted array of date strings.
 */
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

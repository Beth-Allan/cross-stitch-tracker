import { unstable_cache } from "next/cache";
import { TZDate } from "@date-fns/tz";
import { format, differenceInCalendarDays } from "date-fns";
import { prisma } from "@/lib/db";
import { getUserTimezone } from "./timezone";
import type { PersonalBestRecord, RecordType } from "@/types/stats";

function buildDateFilter(scope: string, tz: string): { gte: Date; lt: Date } | null {
  if (scope === "all") return null;
  const year = parseInt(scope, 10);
  if (isNaN(year)) return null;
  const yearStart = new TZDate(year, 0, 1, 0, 0, 0, tz);
  const nextYearStart = new TZDate(year + 1, 0, 1, 0, 0, 0, tz);
  return { gte: yearStart, lt: nextYearStart };
}

interface SessionRow {
  id: string;
  projectId: string;
  date: Date;
  stitchCount: number;
  project: {
    chart: { id: string; name: string };
  };
}

async function computePersonalBests(userId: string, scope: string): Promise<PersonalBestRecord[]> {
  try {
    const tz = getUserTimezone(userId);
    const dateFilter = buildDateFilter(scope, tz);

    const sessions: SessionRow[] = await prisma.stitchSession.findMany({
      where: {
        project: { userId },
        ...(dateFilter ? { date: dateFilter } : {}),
      },
      select: {
        id: true,
        projectId: true,
        date: true,
        stitchCount: true,
        project: {
          select: { chart: { select: { id: true, name: true } } },
        },
      },
      orderBy: { date: "desc" },
    });

    const emptyRecord = (type: RecordType, label: string, unit: string): PersonalBestRecord => ({
      type,
      label,
      value: 0,
      unit,
      date: null,
      projectId: null,
      chartId: null,
      projectName: null,
    });

    if (sessions.length === 0) {
      return [
        emptyRecord("bestDay", "Best Day", "stitches"),
        emptyRecord("bestSession", "Best Session", "stitches"),
        emptyRecord("longestStreak", "Longest Streak", "days"),
        emptyRecord("currentStreak", "Current Streak", "days"),
      ];
    }

    // --- Best Day ---
    const dayMap = new Map<string, { total: number; topSession: SessionRow }>();
    for (const s of sessions) {
      const localDate = format(new TZDate(s.date, tz), "yyyy-MM-dd");
      const existing = dayMap.get(localDate);
      if (existing) {
        existing.total += s.stitchCount;
        if (s.stitchCount > existing.topSession.stitchCount) {
          existing.topSession = s;
        }
      } else {
        dayMap.set(localDate, { total: s.stitchCount, topSession: s });
      }
    }

    let bestDayRecord = emptyRecord("bestDay", "Best Day", "stitches");
    let bestDayTotal = 0;
    for (const [dateStr, { total, topSession }] of dayMap) {
      if (total > bestDayTotal) {
        bestDayTotal = total;
        bestDayRecord = {
          type: "bestDay",
          label: "Best Day",
          value: total,
          unit: "stitches",
          date: dateStr,
          projectId: topSession.projectId,
          chartId: topSession.project.chart.id,
          projectName: topSession.project.chart.name,
        };
      }
    }

    // --- Best Session ---
    let bestSessionRecord = emptyRecord("bestSession", "Best Session", "stitches");
    let bestSessionStitches = 0;
    for (const s of sessions) {
      if (s.stitchCount > bestSessionStitches) {
        bestSessionStitches = s.stitchCount;
        bestSessionRecord = {
          type: "bestSession",
          label: "Best Session",
          value: s.stitchCount,
          unit: "stitches",
          date: format(new TZDate(s.date, tz), "yyyy-MM-dd"),
          projectId: s.projectId,
          chartId: s.project.chart.id,
          projectName: s.project.chart.name,
        };
      }
    }

    // --- Streaks ---
    const uniqueDates = [
      ...new Set(sessions.map((s) => format(new TZDate(s.date, tz), "yyyy-MM-dd"))),
    ].sort();

    let longestStreak = 1;
    let currentRun = 1;
    for (let i = 1; i < uniqueDates.length; i++) {
      const prev = new Date(uniqueDates[i - 1]);
      const curr = new Date(uniqueDates[i]);
      const diff = differenceInCalendarDays(curr, prev);
      if (diff === 1) {
        currentRun++;
        if (currentRun > longestStreak) {
          longestStreak = currentRun;
        }
      } else {
        currentRun = 1;
      }
    }

    if (uniqueDates.length === 0) {
      longestStreak = 0;
    }

    const longestStreakRecord: PersonalBestRecord = {
      type: "longestStreak",
      label: "Longest Streak",
      value: longestStreak,
      unit: "days",
      date: null,
      projectId: null,
      chartId: null,
      projectName: null,
    };

    // --- Current Streak ---
    let currentStreakValue = 0;
    if (scope === "all" && uniqueDates.length > 0) {
      const today = format(TZDate.tz(tz), "yyyy-MM-dd");
      const sortedDesc = [...uniqueDates].sort().reverse();
      const mostRecent = sortedDesc[0];
      const daysSinceLast = differenceInCalendarDays(new Date(today), new Date(mostRecent));

      if (daysSinceLast <= 1) {
        currentStreakValue = 1;
        for (let i = 1; i < sortedDesc.length; i++) {
          const curr = new Date(sortedDesc[i - 1]);
          const prev = new Date(sortedDesc[i]);
          const diff = differenceInCalendarDays(curr, prev);
          if (diff === 1) {
            currentStreakValue++;
          } else {
            break;
          }
        }
      }
    }

    const currentStreakRecord: PersonalBestRecord = {
      type: "currentStreak",
      label: "Current Streak",
      value: currentStreakValue,
      unit: "days",
      date: null,
      projectId: null,
      chartId: null,
      projectName: null,
    };

    return [bestDayRecord, bestSessionRecord, longestStreakRecord, currentStreakRecord];
  } catch (error) {
    console.error("[stats] computePersonalBests failed:", { userId, scope, error });
    throw error;
  }
}

export function getPersonalBests(userId: string, scope: string) {
  const currentYear = new Date().getFullYear();
  const year = parseInt(scope, 10);
  const revalidate = !isNaN(year) && year < currentYear ? 3600 : 300;

  return unstable_cache(
    () => computePersonalBests(userId, scope),
    [`stats-personal-bests-${userId}-${scope}`],
    { tags: ["stats"], revalidate },
  )();
}

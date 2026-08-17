import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import { toCalendarDate, daysBetweenCalendarDates } from "@/lib/utils/calendar-date";
import { getUserTimezone, getTodayCalendarDate, getCurrentPeriod } from "./timezone";
import { buildDateFilter, type Scope } from "./utils";
import type { PersonalBestRecord, ProjectLinkedRecord, AggregateRecord } from "@/types/stats";

interface SessionRow {
  id: string;
  projectId: string;
  date: Date;
  stitchCount: number;
  project: {
    chart: { id: string; name: string };
  };
}

async function computePersonalBests(userId: string, scope: Scope): Promise<PersonalBestRecord[]> {
  try {
    const dateFilter = buildDateFilter(scope);

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

    const emptyProjectLinked = (
      type: "bestDay" | "bestSession",
      label: string,
    ): ProjectLinkedRecord => ({ type, label, value: 0, unit: "stitches" });

    const emptyAggregate = (
      type: "longestStreak" | "currentStreak",
      label: string,
    ): AggregateRecord => ({ type, label, value: 0, unit: "days" });

    if (sessions.length === 0) {
      return [
        emptyProjectLinked("bestDay", "Best Day"),
        emptyProjectLinked("bestSession", "Best Session"),
        emptyAggregate("longestStreak", "Longest Streak"),
        emptyAggregate("currentStreak", "Current Streak"),
      ];
    }

    const dayMap = new Map<string, { total: number; topSession: SessionRow }>();
    for (const s of sessions) {
      const localDate = toCalendarDate(s.date);
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

    let bestDayRecord: ProjectLinkedRecord = emptyProjectLinked("bestDay", "Best Day");
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

    let bestSessionRecord: ProjectLinkedRecord = emptyProjectLinked("bestSession", "Best Session");
    let bestSessionStitches = 0;
    for (const s of sessions) {
      if (s.stitchCount > bestSessionStitches) {
        bestSessionStitches = s.stitchCount;
        bestSessionRecord = {
          type: "bestSession",
          label: "Best Session",
          value: s.stitchCount,
          unit: "stitches",
          date: toCalendarDate(s.date),
          projectId: s.projectId,
          chartId: s.project.chart.id,
          projectName: s.project.chart.name,
        };
      }
    }

    const uniqueDates = [...new Set(sessions.map((s) => toCalendarDate(s.date)))].sort();

    let longestStreak = 1;
    let currentRun = 1;
    for (let i = 1; i < uniqueDates.length; i++) {
      const diff = daysBetweenCalendarDates(uniqueDates[i], uniqueDates[i - 1]);
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

    const longestStreakRecord: AggregateRecord = {
      type: "longestStreak",
      label: "Longest Streak",
      value: longestStreak,
      unit: "days",
    };

    let currentStreakValue = 0;
    if (scope === "all" && uniqueDates.length > 0) {
      const today = getTodayCalendarDate(getUserTimezone(userId));
      const sortedDesc = [...uniqueDates].sort().reverse();
      const mostRecent = sortedDesc[0];
      const daysSinceLast = daysBetweenCalendarDates(today, mostRecent);

      if (daysSinceLast <= 1) {
        currentStreakValue = 1;
        for (let i = 1; i < sortedDesc.length; i++) {
          const diff = daysBetweenCalendarDates(sortedDesc[i - 1], sortedDesc[i]);
          if (diff === 1) {
            currentStreakValue++;
          } else {
            break;
          }
        }
      }
    }

    const currentStreakRecord: AggregateRecord = {
      type: "currentStreak",
      label: "Current Streak",
      value: currentStreakValue,
      unit: "days",
    };

    return [bestDayRecord, bestSessionRecord, longestStreakRecord, currentStreakRecord];
  } catch (error) {
    console.error("[stats] computePersonalBests failed:", { userId, scope, error });
    throw error;
  }
}

export function getPersonalBests(userId: string, scope: Scope) {
  const { year: currentYear } = getCurrentPeriod(getUserTimezone(userId));
  const year = parseInt(scope, 10);
  const revalidate = !isNaN(year) && year < currentYear ? 3600 : 300;

  return unstable_cache(
    () => computePersonalBests(userId, scope),
    [`stats-personal-bests-${userId}-${scope}`],
    { tags: ["stats"], revalidate },
  )();
}

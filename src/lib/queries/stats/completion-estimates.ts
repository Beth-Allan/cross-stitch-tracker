import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import {
  toCalendarDate,
  addCalendarDays,
  daysBetweenCalendarDates,
  formatCalendarDate,
} from "@/lib/utils/calendar-date";
import { getUserTimezone, getTodayCalendarDate, getCurrentPeriod } from "./timezone";
import { buildDateFilter, type Scope, STATS_CACHE_VOLATILE, STATS_CACHE_STABLE } from "./utils";
import type { CompletionEstimate } from "@/types/stats";

const MIN_SESSIONS = 3;

// A project stitched slowly enough can project a finish date past the representable calendar.
// Anything beyond this horizon already reads as "never", and clamping the *label* keeps one
// glacial project from throwing the whole estimates panel away.
const MAX_PROJECTION_DAYS = 365_000;

async function computeCompletionEstimates(
  userId: string,
  scope: Scope,
): Promise<CompletionEstimate[]> {
  try {
    const tz = getUserTimezone(userId);
    const dateFilter = buildDateFilter(scope);

    const projects = await prisma.project.findMany({
      where: {
        userId,
        status: { in: ["IN_PROGRESS", "ON_HOLD"] },
        chart: { stitchCount: { gt: 0 } },
        ...(dateFilter ? { sessions: { some: { date: dateFilter } } } : {}),
      },
      include: {
        chart: {
          select: { id: true, name: true, stitchCount: true },
        },
        sessions: {
          select: { date: true, stitchCount: true },
          orderBy: { date: "asc" },
        },
      },
    });

    const today = getTodayCalendarDate(tz);
    const estimates: (CompletionEstimate & { _daysRemaining: number })[] = [];

    for (const project of projects) {
      if (project.sessions.length < MIN_SESSIONS) continue;

      const totalStitches = project.chart.stitchCount;
      if (totalStitches <= 0) continue;

      const firstSession = project.sessions[0];
      const daysSinceFirst = daysBetweenCalendarDates(today, toCalendarDate(firstSession.date));
      if (daysSinceFirst <= 0) continue;

      const totalSessionStitches = project.sessions.reduce((sum, s) => sum + s.stitchCount, 0);
      const avgPerDay = totalSessionStitches / daysSinceFirst;
      if (avgPerDay <= 0) continue;

      const remaining = totalStitches - project.stitchesCompleted;
      if (remaining <= 0) continue;

      const daysRemaining = Math.ceil(remaining / avgPerDay);
      const estimatedDate = addCalendarDays(today, Math.min(daysRemaining, MAX_PROJECTION_DAYS));
      const percentComplete = Math.round((project.stitchesCompleted / totalStitches) * 100);

      estimates.push({
        projectId: project.id,
        chartId: project.chart.id,
        projectName: project.chart.name,
        stitchesCompleted: project.stitchesCompleted,
        totalStitches,
        percentComplete,
        estimatedDate: formatCalendarDate(estimatedDate, { month: "short", year: "numeric" }),
        avgPerDay: Math.round(avgPerDay * 10) / 10,
        _daysRemaining: daysRemaining,
      });
    }

    return estimates
      .sort((a, b) => a._daysRemaining - b._daysRemaining)
      .map(({ _daysRemaining, ...rest }) => rest);
  } catch (error) {
    console.error("[stats] computeCompletionEstimates failed:", { userId, scope, error });
    throw error;
  }
}

export function getCompletionEstimates(userId: string, scope: Scope) {
  const { year: currentYear } = getCurrentPeriod(getUserTimezone(userId));
  const year = parseInt(scope, 10);
  const revalidate = !isNaN(year) && year < currentYear ? STATS_CACHE_STABLE : STATS_CACHE_VOLATILE;

  return unstable_cache(
    () => computeCompletionEstimates(userId, scope),
    [`stats-completion-estimates-${userId}-${scope}`],
    { tags: ["stats"], revalidate },
  )();
}

export async function getProjectCompletionEstimate(
  userId: string,
  projectId: string,
): Promise<CompletionEstimate | null> {
  try {
    const tz = getUserTimezone(userId);

    const project = await prisma.project.findUnique({
      where: { id: projectId, userId },
      include: {
        chart: {
          select: { id: true, name: true, stitchCount: true },
        },
        sessions: {
          select: { date: true, stitchCount: true },
          orderBy: { date: "asc" },
        },
      },
    });

    if (!project) return null;

    const totalStitches = project.chart.stitchCount;
    if (totalStitches <= 0) return null;
    if (project.sessions.length < MIN_SESSIONS) return null;

    const today = getTodayCalendarDate(tz);
    const firstSession = project.sessions[0];
    const daysSinceFirst = daysBetweenCalendarDates(today, toCalendarDate(firstSession.date));
    if (daysSinceFirst <= 0) return null;

    const totalSessionStitches = project.sessions.reduce((sum, s) => sum + s.stitchCount, 0);
    const avgPerDay = totalSessionStitches / daysSinceFirst;
    if (avgPerDay <= 0) return null;

    const remaining = totalStitches - project.stitchesCompleted;
    if (remaining <= 0) return null;

    const daysRemaining = Math.ceil(remaining / avgPerDay);
    const estimatedDate = addCalendarDays(today, Math.min(daysRemaining, MAX_PROJECTION_DAYS));
    const percentComplete = Math.round((project.stitchesCompleted / totalStitches) * 100);

    return {
      projectId: project.id,
      chartId: project.chart.id,
      projectName: project.chart.name,
      stitchesCompleted: project.stitchesCompleted,
      totalStitches,
      percentComplete,
      estimatedDate: formatCalendarDate(estimatedDate, { month: "short", year: "numeric" }),
      avgPerDay: Math.round(avgPerDay * 10) / 10,
    };
  } catch (error) {
    console.error("[stats] getProjectCompletionEstimate failed:", { userId, projectId, error });
    throw error;
  }
}

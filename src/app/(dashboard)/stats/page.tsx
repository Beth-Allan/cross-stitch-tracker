import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";
import {
  getHeroStats,
  getCollectionBreakdown,
  getSizeBreakdown,
  getDesignerBreakdown,
  getGenreBreakdown,
  getMonthlyTotals,
  getCalendarDays,
  getSessionHistory,
  getPaceMetrics,
  getDayOfWeekPattern,
  getPersonalBests,
  getFastestCompletions,
  getThreadInsights,
  getDesignerInsights,
  getGenreInsights,
  getCompletionEstimates,
  getAvailableYears,
} from "@/lib/queries/stats";
import { settled } from "@/lib/utils/settled";
import { StatsPageShell } from "@/components/features/stats/stats-page-shell";
import { StatsOverview } from "@/components/features/stats/stats-overview";
import { ActivityOverview } from "@/components/features/stats/activity-overview";
import { RecordsOverview } from "@/components/features/stats/records-overview";
import { statsSearchParamsCache } from "./search-params";
import type {
  StatsHeroData,
  CollectionBreakdownData,
  SizeBreakdownItem,
  DesignerBreakdownItem,
  GenreBreakdownItem,
  MonthlyTotal,
  CalendarDayData,
  SessionHistoryData,
  PaceMetricsData,
  DayOfWeekData,
  PersonalBestRecord,
  FastestCompletion,
  ThreadInsight,
  DesignerInsight,
  GenreInsight,
  CompletionEstimate,
  AvailableYearsData,
} from "@/types/stats";

export default async function StatsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireAuth();

  // Parse URL search params for session table state
  const parsedParams = await statsSearchParamsCache.parse(searchParams);
  const { page, sort, dir, project, scope } = parsedParams;

  // Current date values for calendar/chart initial state
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-based for calendar

  // Run all queries in parallel with graceful degradation
  const results = await Promise.allSettled([
    getHeroStats(user.id),
    getCollectionBreakdown(user.id),
    getSizeBreakdown(user.id),
    getDesignerBreakdown(user.id),
    getGenreBreakdown(user.id),
    getMonthlyTotals(user.id, currentYear),
    getCalendarDays(user.id, currentMonth, currentYear),
    getSessionHistory(user.id, page, sort, dir, project === "all" ? null : project),
    getPaceMetrics(user.id),
    getDayOfWeekPattern(user.id),
    getPersonalBests(user.id, scope),
    getFastestCompletions(user.id, scope),
    getThreadInsights(user.id, scope),
    getDesignerInsights(user.id, scope),
    getGenreInsights(user.id, scope),
    getCompletionEstimates(user.id, scope),
    getAvailableYears(user.id),
  ]);

  const heroStats = settled<StatsHeroData>(results[0]);
  const collectionBreakdown = settled<CollectionBreakdownData>(results[1]);
  const sizeBreakdown = settled<SizeBreakdownItem[]>(results[2]);
  const designerBreakdown = settled<DesignerBreakdownItem[]>(results[3]);
  const genreBreakdown = settled<GenreBreakdownItem[]>(results[4]);
  const monthlyTotals = settled<MonthlyTotal[]>(results[5]);
  const calendarData = settled<CalendarDayData[]>(results[6]);
  const sessionHistory = settled<SessionHistoryData>(results[7]);
  const paceMetrics = settled<PaceMetricsData>(results[8]);
  const dayOfWeekData = settled<DayOfWeekData[]>(results[9]);
  const personalBests = settled<PersonalBestRecord[]>(results[10]);
  const fastestCompletions = settled<FastestCompletion[]>(results[11]);
  const threadInsights = settled<ThreadInsight[]>(results[12]);
  const designerInsights = settled<DesignerInsight[]>(results[13]);
  const genreInsights = settled<GenreInsight[]>(results[14]);
  const completionEstimates = settled<CompletionEstimate[]>(results[15]);
  const availableYears = settled<AvailableYearsData>(results[16]);

  // Fetch project list for session table filter dropdown
  const projects = await prisma.project.findMany({
    where: { userId: user.id },
    select: {
      id: true,
      chart: { select: { name: true } },
    },
    orderBy: { chart: { name: "asc" } },
  });

  const projectList = projects.map((p) => ({
    id: p.id,
    name: p.chart.name,
  }));

  const hasNoSessions = heroStats === null || heroStats.totalSessions === 0;

  return (
    <StatsPageShell
      overviewContent={
        <StatsOverview
          heroStats={heroStats}
          collectionBreakdown={collectionBreakdown}
          sizeBreakdown={sizeBreakdown}
          designerBreakdown={designerBreakdown}
          genreBreakdown={genreBreakdown}
        />
      }
      activityContent={
        <ActivityOverview
          paceMetrics={paceMetrics}
          monthlyTotals={monthlyTotals}
          dayOfWeekData={dayOfWeekData}
          calendarData={calendarData}
          sessionHistory={sessionHistory}
          projects={projectList}
          currentYear={currentYear}
          currentMonth={currentMonth}
          hasNoSessions={hasNoSessions}
        />
      }
      recordsContent={
        <RecordsOverview
          personalBests={personalBests}
          fastestCompletions={fastestCompletions}
          threadInsights={threadInsights}
          designerInsights={designerInsights}
          genreInsights={genreInsights}
          completionEstimates={completionEstimates}
          availableYears={availableYears?.years ?? null}
          hasNoSessions={hasNoSessions}
        />
      }
    />
  );
}

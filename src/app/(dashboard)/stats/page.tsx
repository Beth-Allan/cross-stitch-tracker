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
  getUserTimezone,
  getCurrentPeriod,
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
} from "@/types/stats";

export default async function StatsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireAuth();

  const parsedParams = await statsSearchParamsCache.parse(searchParams);
  const { page, sort, dir, project, status } = parsedParams;

  // The calendar and year defaults follow Beth's calendar, not the server's clock
  const { year: currentYear, month: currentMonth } = getCurrentPeriod(getUserTimezone(user.id));

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
    getPersonalBests(user.id, "all"),
    getFastestCompletions(user.id, "all"),
    getThreadInsights(user.id, status),
    getDesignerInsights(user.id, status),
    getGenreInsights(user.id, status),
    getCompletionEstimates(user.id, "all"),
  ]);

  const heroStats = settled<StatsHeroData>(results[0], "heroStats");
  const collectionBreakdown = settled<CollectionBreakdownData>(results[1], "collectionBreakdown");
  const sizeBreakdown = settled<SizeBreakdownItem[]>(results[2], "sizeBreakdown");
  const designerBreakdown = settled<DesignerBreakdownItem[]>(results[3], "designerBreakdown");
  const genreBreakdown = settled<GenreBreakdownItem[]>(results[4], "genreBreakdown");
  const monthlyTotals = settled<MonthlyTotal[]>(results[5], "monthlyTotals");
  const calendarData = settled<CalendarDayData[]>(results[6], "calendarData");
  const sessionHistory = settled<SessionHistoryData>(results[7], "sessionHistory");
  const paceMetrics = settled<PaceMetricsData>(results[8], "paceMetrics");
  const dayOfWeekData = settled<DayOfWeekData[]>(results[9], "dayOfWeekData");
  const personalBests = settled<PersonalBestRecord[]>(results[10], "personalBests");
  const fastestCompletions = settled<FastestCompletion[]>(results[11], "fastestCompletions");
  const threadInsights = settled<ThreadInsight[]>(results[12], "threadInsights");
  const designerInsights = settled<DesignerInsight[]>(results[13], "designerInsights");
  const genreInsights = settled<GenreInsight[]>(results[14], "genreInsights");
  const completionEstimates = settled<CompletionEstimate[]>(results[15], "completionEstimates");

  let projectList: { id: string; name: string }[] = [];
  try {
    const projects = await prisma.project.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        chart: { select: { name: true } },
      },
      orderBy: { chart: { name: "asc" } },
    });
    projectList = projects.map((p) => ({
      id: p.id,
      name: p.chart.name,
    }));
  } catch (error) {
    console.error(
      "[stats] projectList query failed:",
      error instanceof Error ? error.message : String(error),
    );
  }

  // A failed hero-stats query is not an empty account: only a successful zero says "none yet",
  // so a DB failure falls through to each panel's own unavailable state instead of two lying tabs
  const hasNoSessions = heroStats !== null && heroStats.totalSessions === 0;

  return (
    <StatsPageShell
      overviewContent={
        <StatsOverview
          heroStats={heroStats}
          collectionBreakdown={collectionBreakdown}
          sizeBreakdown={sizeBreakdown}
          designerBreakdown={designerBreakdown}
          genreBreakdown={genreBreakdown}
          threadInsights={threadInsights}
          designerInsights={designerInsights}
          genreInsights={genreInsights}
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
          completionEstimates={completionEstimates}
          totalSessionStitches={heroStats?.totalLifetimeStitches ?? null}
          hasNoSessions={hasNoSessions}
        />
      }
    />
  );
}

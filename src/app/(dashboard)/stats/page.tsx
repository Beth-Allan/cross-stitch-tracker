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
} from "@/lib/queries/stats";
import { StatsPageShell } from "@/components/features/stats/stats-page-shell";
import { StatsOverview } from "@/components/features/stats/stats-overview";
import { ActivityOverview } from "@/components/features/stats/activity-overview";
import { statsSearchParamsCache } from "./search-params";

export default async function StatsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireAuth();

  // Parse URL search params for session table state
  const parsedParams = await statsSearchParamsCache.parse(searchParams);
  const { page, sort, dir, project } = parsedParams;

  // Current date values for calendar/chart initial state
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-based for calendar

  // Run all queries in parallel
  const [
    heroStats,
    collectionBreakdown,
    sizeBreakdown,
    designerBreakdown,
    genreBreakdown,
    monthlyTotals,
    calendarData,
    sessionHistory,
    paceMetrics,
    dayOfWeekData,
  ] = await Promise.all([
    // Existing overview queries
    getHeroStats(user.id),
    getCollectionBreakdown(user.id),
    getSizeBreakdown(user.id),
    getDesignerBreakdown(user.id),
    getGenreBreakdown(user.id),
    // New activity queries
    getMonthlyTotals(user.id, currentYear),
    getCalendarDays(user.id, currentMonth, currentYear),
    getSessionHistory(user.id, page, sort, dir, project === "all" ? null : project),
    getPaceMetrics(user.id),
    getDayOfWeekPattern(user.id),
  ]);

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

  const hasNoSessions = heroStats.totalSessions === 0;

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
    />
  );
}

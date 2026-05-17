import { requireAuth } from "@/lib/auth-guard";
import { getHeroStats, getCollectionBreakdown } from "@/lib/queries/stats";
import { StatsPageShell } from "@/components/features/stats/stats-page-shell";
import { CollectionStatusChart } from "@/components/features/stats/collection-status-chart";
import type { StatsHeroData, CollectionBreakdownData } from "@/types/stats";

export default async function StatsPage() {
  const user = await requireAuth();

  const [heroStats, collectionBreakdown] = await Promise.all([
    getHeroStats(user.id),
    getCollectionBreakdown(user.id),
  ]);

  return (
    <StatsPageShell
      overviewContent={
        <StatsOverview heroStats={heroStats} collectionBreakdown={collectionBreakdown} />
      }
    />
  );
}

function StatsOverview({
  heroStats,
  collectionBreakdown,
}: {
  heroStats: StatsHeroData;
  collectionBreakdown: CollectionBreakdownData;
}) {
  return (
    <div className="space-y-8">
      {/* Hero counters — Phase 19 will build the full component */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <HeroCounter label="Total Stitches" value={heroStats.totalLifetimeStitches.toLocaleString()} />
        <HeroCounter label="Sessions" value={heroStats.totalSessions.toLocaleString()} />
        <HeroCounter label="Time Stitching" value={formatTime(heroStats.totalTimeMinutes)} />
        <HeroCounter label="Completed" value={heroStats.projectsCompleted.toLocaleString()} />
      </div>

      {/* Collection donut chart — validates Recharts integration */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="mb-4 text-sm font-medium text-muted-foreground">Collection by Status</h3>
        <CollectionStatusChart
          data={collectionBreakdown.byStatus}
          totalProjects={collectionBreakdown.totalProjects}
        />
      </div>
    </div>
  );
}

function HeroCounter({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold text-foreground">{value}</p>
    </div>
  );
}

function formatTime(minutes: number): string {
  if (minutes === 0) return "0h";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

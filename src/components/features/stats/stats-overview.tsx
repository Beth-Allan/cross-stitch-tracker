import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { MetricsBar } from "./metrics-bar";
import { LifetimeCounters } from "./lifetime-counters";
import { CollectionStatusChart } from "./collection-status-chart";
import { SizeCategoryChart } from "./size-category-chart";
import { DesignerBreakdownChart } from "./designer-breakdown-chart";
import { GenreDistributionChart } from "./genre-distribution-chart";
import { ThreadInsightList } from "./thread-insight-list";
import { DesignerInsightList } from "./designer-insight-list";
import { GenreInsightList } from "./genre-insight-list";
import { StatusFilterPills } from "./status-filter-pills";
import { DataUnavailable } from "@/components/ui/data-unavailable";
import type {
  StatsHeroData,
  CollectionBreakdownData,
  SizeBreakdownItem,
  DesignerBreakdownItem,
  GenreBreakdownItem,
  ThreadInsight,
  DesignerInsight,
  GenreInsight,
} from "@/types/stats";

interface StatsOverviewProps {
  heroStats: StatsHeroData | null;
  collectionBreakdown: CollectionBreakdownData | null;
  sizeBreakdown: SizeBreakdownItem[] | null;
  designerBreakdown: DesignerBreakdownItem[] | null;
  genreBreakdown: GenreBreakdownItem[] | null;
  threadInsights: ThreadInsight[] | null;
  designerInsights: DesignerInsight[] | null;
  genreInsights: GenreInsight[] | null;
}

export function StatsOverview({
  heroStats,
  collectionBreakdown,
  sizeBreakdown,
  designerBreakdown,
  genreBreakdown,
  threadInsights,
  designerInsights,
  genreInsights,
}: StatsOverviewProps) {
  return (
    <div className="space-y-8">
      {heroStats !== null ? (
        <>
          <MetricsBar
            stitchesToday={heroStats.stitchesToday}
            stitchesThisWeek={heroStats.stitchesThisWeek}
            stitchesThisMonth={heroStats.stitchesThisMonth}
            stitchesThisYear={heroStats.stitchesThisYear}
          />
          <LifetimeCounters
            collectionTotalStitches={heroStats.collectionTotalStitches}
            totalSessions={heroStats.totalSessions}
            totalTimeMinutes={heroStats.totalTimeMinutes}
            projectsCompleted={heroStats.projectsCompleted}
          />
        </>
      ) : (
        <DataUnavailable label="Stats summary" />
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {collectionBreakdown !== null ? (
          <Card>
            <CardHeader>
              <h3 className="font-heading text-sm font-semibold">Collection by Status</h3>
            </CardHeader>
            <CardContent>
              <CollectionStatusChart
                data={collectionBreakdown.byStatus}
                totalProjects={collectionBreakdown.totalProjects}
              />
            </CardContent>
          </Card>
        ) : (
          <DataUnavailable label="Collection status" />
        )}

        {sizeBreakdown !== null ? (
          <Card>
            <CardHeader>
              <h3 className="font-heading text-sm font-semibold">Collection by Size</h3>
            </CardHeader>
            <CardContent>
              <SizeCategoryChart data={sizeBreakdown} />
            </CardContent>
          </Card>
        ) : (
          <DataUnavailable label="Size breakdown" />
        )}

        {designerBreakdown !== null ? (
          <Card>
            <CardHeader>
              <h3 className="font-heading text-sm font-semibold">Top Designers</h3>
            </CardHeader>
            <CardContent>
              <DesignerBreakdownChart data={designerBreakdown} />
            </CardContent>
          </Card>
        ) : (
          <DataUnavailable label="Designer breakdown" />
        )}

        {genreBreakdown !== null ? (
          <Card>
            <CardHeader>
              <h3 className="font-heading text-sm font-semibold">Genre Distribution</h3>
            </CardHeader>
            <CardContent>
              <GenreDistributionChart data={genreBreakdown} />
            </CardContent>
          </Card>
        ) : (
          <DataUnavailable label="Genre distribution" />
        )}
      </div>

      <div className="flex justify-end">
        <StatusFilterPills />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {threadInsights !== null ? (
          <ThreadInsightList items={threadInsights} />
        ) : (
          <DataUnavailable label="Thread insights" />
        )}
        {designerInsights !== null ? (
          <DesignerInsightList items={designerInsights} />
        ) : (
          <DataUnavailable label="Designer insights" />
        )}
        {genreInsights !== null ? (
          <GenreInsightList items={genreInsights} />
        ) : (
          <DataUnavailable label="Genre insights" />
        )}
      </div>
    </div>
  );
}

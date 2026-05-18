import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { MetricsBar } from "./metrics-bar";
import { LifetimeCounters } from "./lifetime-counters";
import { CollectionStatusChart } from "./collection-status-chart";
import { SizeCategoryChart } from "./size-category-chart";
import { DesignerBreakdownChart } from "./designer-breakdown-chart";
import { GenreDistributionChart } from "./genre-distribution-chart";
import { RankedList } from "./ranked-list";
import { DataUnavailable } from "./data-unavailable";
import type {
  StatsHeroData,
  CollectionBreakdownData,
  SizeBreakdownItem,
  DesignerBreakdownItem,
  GenreBreakdownItem,
} from "@/types/stats";

interface StatsOverviewProps {
  heroStats: StatsHeroData | null;
  collectionBreakdown: CollectionBreakdownData | null;
  sizeBreakdown: SizeBreakdownItem[] | null;
  designerBreakdown: DesignerBreakdownItem[] | null;
  genreBreakdown: GenreBreakdownItem[] | null;
}

export function StatsOverview({
  heroStats,
  collectionBreakdown,
  sizeBreakdown,
  designerBreakdown,
  genreBreakdown,
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
            totalLifetimeStitches={heroStats.totalLifetimeStitches}
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
              <RankedList
                items={designerBreakdown.map((d) => ({
                  id: d.designerId,
                  name: d.name,
                  count: d.count,
                  href: `/designers/${d.designerId}`,
                }))}
                label="Top Designers by Chart Count"
              />
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
              <RankedList
                items={genreBreakdown.map((g) => ({
                  id: g.genreId,
                  name: g.name,
                  count: g.count,
                  href: `/genres/${g.genreId}`,
                }))}
                label="Genre Distribution by Chart Count"
              />
            </CardContent>
          </Card>
        ) : (
          <DataUnavailable label="Genre distribution" />
        )}
      </div>
    </div>
  );
}

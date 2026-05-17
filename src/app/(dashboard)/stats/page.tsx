import { requireAuth } from "@/lib/auth-guard";
import {
  getHeroStats,
  getCollectionBreakdown,
  getSizeBreakdown,
  getDesignerBreakdown,
  getGenreBreakdown,
} from "@/lib/queries/stats";
import { StatsPageShell } from "@/components/features/stats/stats-page-shell";
import { StatsOverview } from "@/components/features/stats/stats-overview";

export default async function StatsPage() {
  const user = await requireAuth();

  const [heroStats, collectionBreakdown, sizeBreakdown, designerBreakdown, genreBreakdown] =
    await Promise.all([
      getHeroStats(user.id),
      getCollectionBreakdown(user.id),
      getSizeBreakdown(user.id),
      getDesignerBreakdown(user.id),
      getGenreBreakdown(user.id),
    ]);

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
    />
  );
}

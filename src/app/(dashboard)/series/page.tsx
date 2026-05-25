import { getSeriesWithStats } from "@/lib/actions/series-actions";
import { SeriesList } from "@/components/features/series/series-list";

export default async function SeriesPage() {
  const series = await getSeriesWithStats();
  return <SeriesList series={series} />;
}

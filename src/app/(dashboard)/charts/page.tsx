import { getCharts } from "@/lib/actions/chart-actions";
import { getDesigners } from "@/lib/actions/designer-actions";
import { getGenres } from "@/lib/actions/genre-actions";
import { ChartList } from "@/components/features/charts/chart-list";

export default async function ChartsPage() {
  const [charts, designers, genres] = await Promise.all([getCharts(), getDesigners(), getGenres()]);

  return <ChartList charts={charts} designers={designers} genres={genres} />;
}

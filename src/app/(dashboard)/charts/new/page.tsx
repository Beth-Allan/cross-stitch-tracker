import { getDesigners } from "@/lib/actions/designer-actions";
import { getGenres } from "@/lib/actions/genre-actions";
import { ChartAddForm } from "@/components/features/charts/chart-add-form";

export default async function NewChartPage() {
  const [designers, genres] = await Promise.all([getDesigners(), getGenres()]);

  return <ChartAddForm designers={designers} genres={genres} />;
}

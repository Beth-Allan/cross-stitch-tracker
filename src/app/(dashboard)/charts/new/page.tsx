import { getDesigners } from "@/lib/actions/designer-actions";
import { getGenres } from "@/lib/actions/genre-actions";
import { ChartForm } from "@/components/features/charts/chart-form";

export default async function NewChartPage() {
  const [designers, genres] = await Promise.all([getDesigners(), getGenres()]);

  return <ChartForm mode="add" designers={designers} genres={genres} />;
}

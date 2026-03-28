import { notFound } from "next/navigation";
import { getChart } from "@/lib/actions/chart-actions";
import { getDesigners } from "@/lib/actions/designer-actions";
import { getGenres } from "@/lib/actions/genre-actions";
import { ChartForm } from "@/components/features/charts/chart-form";

export default async function EditChartPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [chart, designers, genres] = await Promise.all([getChart(id), getDesigners(), getGenres()]);

  if (!chart) notFound();

  return <ChartForm mode="edit" initialData={chart} designers={designers} genres={genres} />;
}

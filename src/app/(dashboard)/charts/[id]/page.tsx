import { notFound } from "next/navigation";
import { getChart } from "@/lib/actions/chart-actions";
import { getProjectSupplies } from "@/lib/actions/supply-actions";
import { ChartDetail } from "@/components/features/charts/chart-detail";

export default async function ChartDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const chart = await getChart(id);
  if (!chart) notFound();

  // Fetch project supplies if a project exists
  const projectSupplies = chart.project ? await getProjectSupplies(chart.project.id) : null;

  return <ChartDetail chart={chart} projectSupplies={projectSupplies} />;
}

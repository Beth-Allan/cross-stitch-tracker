import { notFound } from "next/navigation";
import { getChart } from "@/lib/actions/chart-actions";
import { ChartDetail } from "@/components/features/charts/chart-detail";

export default async function ChartDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const chart = await getChart(id);
  if (!chart) notFound();
  return <ChartDetail chart={chart} />;
}

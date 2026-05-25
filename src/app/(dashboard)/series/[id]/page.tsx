import { notFound } from "next/navigation";
import { getSeriesDetail } from "@/lib/actions/series-actions";
import { SeriesDetail } from "@/components/features/series/series-detail";

export default async function SeriesDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const series = await getSeriesDetail(id);
  if (!series) notFound();
  return <SeriesDetail series={series} />;
}

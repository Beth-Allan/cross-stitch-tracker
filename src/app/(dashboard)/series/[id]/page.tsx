import { notFound } from "next/navigation";
import { getSeriesDetail } from "@/lib/actions/series-actions";
import { getDesigners } from "@/lib/actions/designer-actions";
import { SeriesDetail } from "@/components/features/series/series-detail";

export default async function SeriesDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const series = await getSeriesDetail(id);
  if (!series) notFound();
  const designers = await getDesigners();
  return <SeriesDetail series={series} designers={designers} />;
}

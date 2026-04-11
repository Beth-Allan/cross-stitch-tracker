import { notFound } from "next/navigation";
import { getChart } from "@/lib/actions/chart-actions";
import { getPresignedImageUrls } from "@/lib/actions/upload-actions";
import { getProjectSupplies } from "@/lib/actions/supply-actions";
import { ChartDetail } from "@/components/features/charts/chart-detail";

export default async function ChartDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const chart = await getChart(id);
  if (!chart) notFound();

  // Resolve R2 keys to presigned URLs server-side
  const [projectSupplies, imageUrls] = await Promise.all([
    chart.project ? getProjectSupplies(chart.project.id) : null,
    getPresignedImageUrls([chart.coverImageUrl, chart.coverThumbnailUrl]),
  ]);

  return <ChartDetail chart={chart} projectSupplies={projectSupplies} imageUrls={imageUrls} />;
}

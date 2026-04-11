import { getCharts } from "@/lib/actions/chart-actions";
import { getDesigners } from "@/lib/actions/designer-actions";
import { getGenres } from "@/lib/actions/genre-actions";
import { getPresignedImageUrls } from "@/lib/actions/upload-actions";
import { ChartList } from "@/components/features/charts/chart-list";

export default async function ChartsPage() {
  const [charts, designers, genres] = await Promise.all([getCharts(), getDesigners(), getGenres()]);

  // Resolve R2 keys to presigned URLs server-side (thumbnail preferred, cover image as fallback)
  const imageKeys = charts.flatMap((c) => [c.coverThumbnailUrl, c.coverImageUrl]);
  const imageUrls = await getPresignedImageUrls(imageKeys);

  return <ChartList charts={charts} designers={designers} genres={genres} imageUrls={imageUrls} />;
}

import { getChartsForGallery } from "@/lib/actions/chart-actions";
import { getPresignedImageUrls } from "@/lib/actions/upload-actions";
import { ProjectGallery } from "@/components/features/gallery/project-gallery";

export default async function ChartsPage() {
  const charts = await getChartsForGallery();

  // Resolve R2 keys to presigned URLs (both full and thumbnail)
  const imageKeys = charts.flatMap((c) => [
    c.coverImageUrl,
    c.coverThumbnailUrl,
  ]);
  const imageUrls = await getPresignedImageUrls(imageKeys);

  return <ProjectGallery charts={charts} imageUrls={imageUrls} />;
}

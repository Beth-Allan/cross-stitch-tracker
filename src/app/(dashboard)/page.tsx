import { getMainDashboardData } from "@/lib/actions/dashboard-actions";
import { getProjectDashboardData } from "@/lib/actions/project-dashboard-actions";
import { getChartsForGallery } from "@/lib/actions/chart-actions";
import { getPresignedImageUrls } from "@/lib/actions/upload-actions";
import { transformToGalleryCard } from "@/components/features/gallery/gallery-utils";
import { DashboardTabs } from "@/components/features/dashboard/dashboard-tabs";
import { MainDashboard } from "@/components/features/dashboard/main-dashboard";
import { ProjectDashboard } from "@/components/features/dashboard/project-dashboard";
import { DashboardLogStitchesProvider } from "@/components/features/dashboard/dashboard-log-stitches-provider";

export default async function DashboardRoute() {
  // D-02: Independent data-fetching functions, fetched via Promise.all()
  const [mainData, projectData, charts] = await Promise.all([
    getMainDashboardData(),
    getProjectDashboardData(),
    getChartsForGallery(),
  ]);

  // Collect all image keys from both dashboards
  const imageKeys = [
    ...mainData.currentlyStitching.map((p) => p.coverThumbnailUrl),
    ...mainData.startNextProjects.map((p) => p.coverThumbnailUrl),
    ...mainData.startNextProjects.map((p) => p.coverImageUrl),
    mainData.spotlightProject?.coverThumbnailUrl,
    mainData.spotlightProject?.coverImageUrl,
    ...mainData.buriedTreasures.map((t) => t.coverThumbnailUrl),
    ...projectData.progressBuckets.flatMap((b) =>
      b.projects.map((p) => p.coverThumbnailUrl),
    ),
    ...projectData.finishedProjects.map((p) => p.coverThumbnailUrl),
    // GalleryCard uses coverImageUrl and coverThumbnailUrl from chart data
    ...charts.flatMap((c) => [c.coverImageUrl, c.coverThumbnailUrl]),
  ];

  const imageUrls = await getPresignedImageUrls(imageKeys);

  // Transform Start Next charts to GalleryCardData for GalleryCard reuse (D-05)
  const startNextChartIds = new Set(
    mainData.startNextProjects.map((p) => p.chartId),
  );
  const startNextCards = charts
    .filter((c) => startNextChartIds.has(c.id))
    .map((c) => transformToGalleryCard(c, imageUrls));

  return (
    <DashboardLogStitchesProvider>
      {(onLogStitches) => (
        <DashboardTabs
          libraryContent={
            <MainDashboard
              data={mainData}
              startNextCards={startNextCards}
              imageUrls={imageUrls}
              onLogStitches={onLogStitches}
            />
          }
          progressContent={
            <ProjectDashboard data={projectData} imageUrls={imageUrls} />
          }
        />
      )}
    </DashboardLogStitchesProvider>
  );
}

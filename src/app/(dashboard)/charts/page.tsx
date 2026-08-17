import { requireAuth } from "@/lib/auth-guard";
import { getChartsForGallery } from "@/lib/actions/chart-actions";
import { getPresignedImageUrls } from "@/lib/actions/upload-actions";
import {
  getWhatsNextProjects,
  getFabricRequirements,
  getStorageGroups,
} from "@/lib/actions/pattern-dive-actions";
import { getSeriesWithStats } from "@/lib/actions/series-actions";
import { settled } from "@/lib/utils/settled";
import type { WhatsNextProject, FabricRequirementRow, StorageGroup } from "@/types/session";
import type { SeriesWithStats } from "@/types/series";
import { DataUnavailable } from "@/components/ui/data-unavailable";
import { ProjectGallery } from "@/components/features/gallery/project-gallery";
import { PatternDiveTabs } from "@/components/features/charts/pattern-dive-tabs";
import { WhatsNextTab } from "@/components/features/charts/whats-next-tab";
import { SeriesTabContent } from "@/components/features/charts/series-tab-content";
import { FabricRequirementsTab } from "@/components/features/charts/fabric-requirements-tab";
import { StorageViewTab } from "@/components/features/charts/storage-view-tab";

type GalleryChart = Awaited<ReturnType<typeof getChartsForGallery>>[number];

export default async function ChartsPage() {
  // Checked here as well as inside each action: settling the batch would otherwise swallow an
  // expired session into five "temporarily unavailable" tabs instead of the error boundary's
  // "log in again"
  await requireAuth();

  // All five tab datasets fetched eagerly in one parallel batch -- avoids a Neon cold-start
  // waterfall. Settled, not all-or-nothing: a tab that fails says so and the other four still work
  const results = await Promise.allSettled([
    getChartsForGallery(),
    getWhatsNextProjects(),
    getFabricRequirements(),
    getStorageGroups(),
    getSeriesWithStats(),
  ]);

  const charts = settled<GalleryChart[]>(results[0], "charts", "pattern-dive");
  const whatsNextProjects = settled<WhatsNextProject[]>(results[1], "whatsNext", "pattern-dive");
  const fabricRequirements = settled<FabricRequirementRow[]>(
    results[2],
    "fabricRequirements",
    "pattern-dive",
  );
  const storageGroups = settled<StorageGroup[]>(results[3], "storageGroups", "pattern-dive");
  const seriesData = settled<SeriesWithStats[]>(results[4], "seriesData", "pattern-dive");

  const imageKeys = [
    ...(charts ?? []).flatMap((c) => [c.coverImageUrl, c.coverThumbnailUrl]),
    ...(whatsNextProjects ?? []).map((p) => p.coverThumbnailUrl),
    ...(fabricRequirements ?? []).map((r) => r.coverThumbnailUrl),
    ...(storageGroups ?? []).flatMap((g) => g.items.map((i) => i.coverThumbnailUrl)),
  ];
  const imageUrls = await getPresignedImageUrls(imageKeys);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Pattern Dive</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Explore your collection, plan what&apos;s next, and find the right fabric
        </p>
      </div>

      <PatternDiveTabs
        browseContent={
          charts !== null ? (
            <ProjectGallery charts={charts} imageUrls={imageUrls} hideHeader />
          ) : (
            <DataUnavailable label="Your collection" />
          )
        }
        whatsNextContent={
          whatsNextProjects !== null ? (
            <WhatsNextTab projects={whatsNextProjects} imageUrls={imageUrls} />
          ) : (
            <DataUnavailable label="What's next" />
          )
        }
        seriesContent={
          seriesData !== null ? (
            <SeriesTabContent series={seriesData} />
          ) : (
            <DataUnavailable label="Series" />
          )
        }
        fabricContent={
          fabricRequirements !== null ? (
            <FabricRequirementsTab rows={fabricRequirements} imageUrls={imageUrls} />
          ) : (
            <DataUnavailable label="Fabric requirements" />
          )
        }
        storageContent={
          storageGroups !== null ? (
            <StorageViewTab groups={storageGroups} imageUrls={imageUrls} />
          ) : (
            <DataUnavailable label="Storage view" />
          )
        }
      />
    </div>
  );
}

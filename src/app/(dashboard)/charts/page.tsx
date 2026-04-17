import { getChartsForGallery } from "@/lib/actions/chart-actions";
import { getPresignedImageUrls } from "@/lib/actions/upload-actions";
import {
  getWhatsNextProjects,
  getFabricRequirements,
  getStorageGroups,
} from "@/lib/actions/pattern-dive-actions";
import { ProjectGallery } from "@/components/features/gallery/project-gallery";
import { PatternDiveTabs } from "@/components/features/charts/pattern-dive-tabs";
import { WhatsNextTab } from "@/components/features/charts/whats-next-tab";
import { FabricRequirementsTab } from "@/components/features/charts/fabric-requirements-tab";
import { StorageViewTab } from "@/components/features/charts/storage-view-tab";

export default async function ChartsPage() {
  // D-10: All four tab datasets fetched eagerly via Promise.all()
  // Avoids Neon cold start waterfall — single parallel batch
  const [charts, whatsNextProjects, fabricRequirements, storageGroups] = await Promise.all([
    getChartsForGallery(),
    getWhatsNextProjects(),
    getFabricRequirements(),
    getStorageGroups(),
  ]);

  // Collect all image keys that need presigned URLs across all tabs
  const imageKeys = [
    ...charts.flatMap((c) => [c.coverImageUrl, c.coverThumbnailUrl]),
    ...whatsNextProjects.map((p) => p.coverThumbnailUrl),
    ...fabricRequirements.map((r) => r.coverThumbnailUrl),
    ...storageGroups.flatMap((g) => g.items.map((i) => i.coverThumbnailUrl)),
  ];
  const imageUrls = await getPresignedImageUrls(imageKeys);

  return (
    <div className="space-y-6">
      {/* D-12: Page header */}
      <div>
        <h1 className="font-heading text-2xl font-semibold">Pattern Dive</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Explore your collection, plan what&apos;s next, and find the right fabric
        </p>
      </div>

      <PatternDiveTabs
        browseContent={<ProjectGallery charts={charts} imageUrls={imageUrls} hideHeader />}
        whatsNextContent={<WhatsNextTab projects={whatsNextProjects} imageUrls={imageUrls} />}
        fabricContent={<FabricRequirementsTab rows={fabricRequirements} imageUrls={imageUrls} />}
        storageContent={<StorageViewTab groups={storageGroups} imageUrls={imageUrls} />}
      />
    </div>
  );
}

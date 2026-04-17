import { getChartsForGallery } from "@/lib/actions/chart-actions";
import { getPresignedImageUrls } from "@/lib/actions/upload-actions";
import { ProjectGallery } from "@/components/features/gallery/project-gallery";
import { PatternDiveTabs } from "@/components/features/charts/pattern-dive-tabs";

export default async function ChartsPage() {
  // D-10: Eager fetch all tab data via Promise.all()
  // Browse tab data (existing) — other tabs added in Plan 06
  const [charts] = await Promise.all([getChartsForGallery()]);

  const imageKeys = charts.flatMap((c) => [c.coverImageUrl, c.coverThumbnailUrl]);
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
        browseContent={<ProjectGallery charts={charts} imageUrls={imageUrls} />}
        whatsNextContent={
          <div className="text-muted-foreground py-12 text-center text-sm">
            What&apos;s Next tab — coming in Plan 07
          </div>
        }
        fabricContent={
          <div className="text-muted-foreground py-12 text-center text-sm">
            Fabric Requirements tab — coming in Plan 07
          </div>
        }
        storageContent={
          <div className="text-muted-foreground py-12 text-center text-sm">
            Storage View tab — coming in Plan 07
          </div>
        }
      />
    </div>
  );
}

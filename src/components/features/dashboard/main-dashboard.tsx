"use client";

import type { MainDashboardData } from "@/types/dashboard";
import type { GalleryCardData } from "@/components/features/gallery/gallery-types";
import { GalleryCard } from "@/components/features/gallery/gallery-card";
import { SectionHeading } from "./section-heading";
import { ScrollableRow } from "./scrollable-row";
import { CurrentlyStitchingCard } from "./currently-stitching-card";
import { CollectionStatsSidebar } from "./collection-stats-sidebar";
import { SpotlightCard } from "./spotlight-card";
import { BuriedTreasuresSection } from "./buried-treasures-section";
import { QuickAddMenu } from "./quick-add-menu";

interface MainDashboardProps {
  data: MainDashboardData;
  startNextCards: GalleryCardData[];
  imageUrls: Record<string, string>;
  onLogStitches: () => void;
}

function EmptySection({ message }: { message: string }) {
  return (
    <p className="py-8 text-center text-sm text-muted-foreground">{message}</p>
  );
}

/**
 * Main Dashboard layout -- "Your Library" tab.
 * Composes all section components: Currently Stitching, Start Next,
 * Collection Stats sidebar, Spotlight, and Buried Treasures.
 */
export function MainDashboard({
  data,
  startNextCards,
  imageUrls,
  onLogStitches,
}: MainDashboardProps) {
  return (
    <div className="mx-auto max-w-[1100px] space-y-16">
      {/* Page header + Quick Add */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold">Your Library</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Welcome back to your cross stitch collection
          </p>
        </div>
        <QuickAddMenu onLogStitches={onLogStitches} />
      </div>

      {/* Two-column area: main + sidebar */}
      <div className="grid gap-8 lg:grid-cols-[1fr_260px]">
        <div className="min-w-0 space-y-12">
          {/* Currently Stitching */}
          <section>
            <SectionHeading title="Currently Stitching" />
            <div className="mt-4">
              {data.currentlyStitching.length > 0 ? (
                <ScrollableRow>
                  {data.currentlyStitching.map((p) => (
                    <CurrentlyStitchingCard
                      key={p.projectId}
                      project={p}
                      imageUrl={
                        imageUrls[p.coverThumbnailUrl ?? ""] ?? null
                      }
                    />
                  ))}
                </ScrollableRow>
              ) : (
                <EmptySection message="No active projects. Start stitching to see your work here!" />
              )}
            </div>
          </section>

          {/* Start Next */}
          <section>
            <SectionHeading title="Start Next" />
            <div className="mt-4">
              {startNextCards.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {startNextCards.slice(0, 2).map((card) => (
                    <GalleryCard key={card.chartId} card={card} />
                  ))}
                </div>
              ) : (
                <EmptySection message='Flag a project as "Start Next" to see it here.' />
              )}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="max-lg:mt-12">
          <CollectionStatsSidebar stats={data.collectionStats} />
        </div>
      </div>

      {/* Full-width: Spotlight */}
      <SpotlightCard
        project={data.spotlightProject}
        imageUrl={
          imageUrls[data.spotlightProject?.coverImageUrl ?? ""] ??
          imageUrls[data.spotlightProject?.coverThumbnailUrl ?? ""] ??
          null
        }
      />

      {/* Full-width: Buried Treasures */}
      <BuriedTreasuresSection
        treasures={data.buriedTreasures}
        imageUrls={imageUrls}
      />
    </div>
  );
}

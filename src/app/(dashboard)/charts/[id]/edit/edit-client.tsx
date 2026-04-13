"use client";

import { useRouter } from "next/navigation";
import type { Designer, Fabric, FabricBrand, Genre } from "@/generated/prisma/client";
import type { ChartWithProject } from "@/types/chart";
import type { StorageLocationWithStats, StitchingAppWithStats } from "@/types/storage";
import { ChartEditModal } from "@/components/features/charts/chart-edit-modal";

interface EditChartPageClientProps {
  chart: ChartWithProject;
  designers: Designer[];
  genres: Genre[];
  storageLocations: StorageLocationWithStats[];
  stitchingApps: StitchingAppWithStats[];
  unassignedFabrics: (Fabric & { brand: FabricBrand })[];
}

export function EditChartPageClient({
  chart,
  designers,
  genres,
  storageLocations,
  stitchingApps,
  unassignedFabrics,
}: EditChartPageClientProps) {
  const router = useRouter();

  return (
    <ChartEditModal
      chart={chart}
      designers={designers}
      genres={genres}
      storageLocations={storageLocations}
      stitchingApps={stitchingApps}
      unassignedFabrics={unassignedFabrics}
      open={true}
      onOpenChange={(open) => {
        if (!open) {
          router.push(`/charts/${chart.id}`);
        }
      }}
      onSuccess={() => {
        router.push(`/charts/${chart.id}`);
      }}
    />
  );
}

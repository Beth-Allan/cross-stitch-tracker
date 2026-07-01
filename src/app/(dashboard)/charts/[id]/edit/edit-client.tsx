"use client";

import { ChartMergedForm } from "@/components/features/charts/chart-merged-form";
import type { Designer, Fabric, FabricBrand, Genre } from "@/generated/prisma/client";
import type { ChartWithProject } from "@/types/chart";
import type { StorageLocationWithStats, StitchingAppWithStats } from "@/types/storage";
import type { SeriesWithStats } from "@/types/series";

interface EditChartPageClientProps {
  chart: ChartWithProject;
  designers: Designer[];
  genres: Genre[];
  storageLocations: StorageLocationWithStats[];
  stitchingApps: StitchingAppWithStats[];
  unassignedFabrics: (Fabric & { brand: FabricBrand })[];
  supplyStitchTotal: number;
  series: SeriesWithStats[];
}

export function EditChartPageClient({
  chart,
  designers,
  genres,
  storageLocations,
  stitchingApps,
  unassignedFabrics,
  supplyStitchTotal,
  series,
}: EditChartPageClientProps) {
  return (
    <ChartMergedForm
      mode="edit"
      initialData={chart}
      designers={designers}
      genres={genres}
      storageLocations={storageLocations}
      stitchingApps={stitchingApps}
      unassignedFabrics={unassignedFabrics}
      initialSupplyStitchTotal={supplyStitchTotal}
      series={series}
    />
  );
}

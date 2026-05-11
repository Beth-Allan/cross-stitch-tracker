import { getDesigners } from "@/lib/actions/designer-actions";
import { getGenres } from "@/lib/actions/genre-actions";
import { getStorageLocationsWithStats } from "@/lib/actions/storage-location-actions";
import { getStitchingAppsWithStats } from "@/lib/actions/stitching-app-actions";
import { getUnassignedFabrics } from "@/lib/actions/fabric-actions";
import { ChartMergedForm } from "@/components/features/charts/chart-merged-form";

export default async function NewChartPage() {
  const [designers, genres, storageLocations, stitchingApps, unassignedFabrics] = await Promise.all(
    [
      getDesigners(),
      getGenres(),
      getStorageLocationsWithStats(),
      getStitchingAppsWithStats(),
      getUnassignedFabrics(),
    ],
  );

  return (
    <ChartMergedForm
      designers={designers}
      genres={genres}
      storageLocations={storageLocations}
      stitchingApps={stitchingApps}
      unassignedFabrics={unassignedFabrics}
    />
  );
}

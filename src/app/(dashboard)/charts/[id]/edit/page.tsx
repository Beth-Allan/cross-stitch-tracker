import { notFound } from "next/navigation";
import { getChart } from "@/lib/actions/chart-actions";
import { getDesigners } from "@/lib/actions/designer-actions";
import { getGenres } from "@/lib/actions/genre-actions";
import { getStorageLocationsWithStats } from "@/lib/actions/storage-location-actions";
import { getStitchingAppsWithStats } from "@/lib/actions/stitching-app-actions";
import { getUnassignedFabrics } from "@/lib/actions/fabric-actions";
import { EditChartPageClient } from "./edit-client";

export default async function EditChartPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Fetch chart first to get projectId for fabric query
  const chart = await getChart(id);
  if (!chart) notFound();

  const [designers, genres, storageLocations, stitchingApps, unassignedFabrics] = await Promise.all(
    [
      getDesigners(),
      getGenres(),
      getStorageLocationsWithStats(),
      getStitchingAppsWithStats(),
      getUnassignedFabrics(chart.project?.id),
    ],
  );

  return (
    <EditChartPageClient
      chart={chart}
      designers={designers}
      genres={genres}
      storageLocations={storageLocations}
      stitchingApps={stitchingApps}
      unassignedFabrics={unassignedFabrics}
    />
  );
}

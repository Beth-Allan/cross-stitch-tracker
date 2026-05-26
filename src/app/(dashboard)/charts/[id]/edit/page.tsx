import { notFound } from "next/navigation";
import { getChart } from "@/lib/actions/chart-actions";
import { getDesigners } from "@/lib/actions/designer-actions";
import { getGenres } from "@/lib/actions/genre-actions";
import { getStorageLocationsWithStats } from "@/lib/actions/storage-location-actions";
import { getStitchingAppsWithStats } from "@/lib/actions/stitching-app-actions";
import { getUnassignedFabrics } from "@/lib/actions/fabric-actions";
import { getSeriesWithStats } from "@/lib/actions/series-actions";
import { prisma } from "@/lib/db";
import { EditChartPageClient } from "./edit-client";

export default async function EditChartPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Fetch chart first to get projectId for fabric query
  const chart = await getChart(id);
  if (!chart) notFound();

  const [designers, genres, storageLocations, stitchingApps, unassignedFabrics, series] =
    await Promise.all([
      getDesigners(),
      getGenres(),
      getStorageLocationsWithStats(),
      getStitchingAppsWithStats(),
      getUnassignedFabrics(chart.project?.id),
      getSeriesWithStats(),
    ]);

  // Safe: getChart() above already verified userId ownership of this project.
  // The projectId used here comes from that verified chart, not from user input.
  let supplyStitchTotal = 0;
  if (chart.project) {
    try {
      const result = await prisma.projectThread.aggregate({
        where: { projectId: chart.project.id },
        _sum: { stitchCount: true },
      });
      supplyStitchTotal = result._sum.stitchCount ?? 0;
    } catch (error) {
      console.error("Failed to fetch supply stitch total:", error);
    }
  }

  return (
    <EditChartPageClient
      chart={chart}
      designers={designers}
      genres={genres}
      storageLocations={storageLocations}
      stitchingApps={stitchingApps}
      unassignedFabrics={unassignedFabrics}
      supplyStitchTotal={supplyStitchTotal}
      series={series}
    />
  );
}

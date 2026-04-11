import { notFound } from "next/navigation";
import { getFabric, getFabricBrands } from "@/lib/actions/fabric-actions";
import { getCharts } from "@/lib/actions/chart-actions";
import { FabricDetail } from "@/components/features/fabric/fabric-detail";

export default async function FabricDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [fabric, fabricBrands, charts] = await Promise.all([
    getFabric(id),
    getFabricBrands(),
    getCharts(),
  ]);

  if (!fabric) notFound();

  // Build projects list for fabric linking dropdown
  const projects = charts
    .filter((c) => c.project)
    .map((c) => ({
      id: c.project!.id,
      chartName: c.name,
    }));

  return <FabricDetail fabric={fabric} fabricBrands={fabricBrands} projects={projects} />;
}

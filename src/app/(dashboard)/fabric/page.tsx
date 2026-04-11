import { getFabrics, getFabricBrands } from "@/lib/actions/fabric-actions";
import { getCharts } from "@/lib/actions/chart-actions";
import { FabricCatalog } from "@/components/features/fabric/fabric-catalog";

export default async function FabricPage() {
  const [fabrics, fabricBrands, charts] = await Promise.all([
    getFabrics(),
    getFabricBrands(),
    getCharts(),
  ]);

  // Build projects list for fabric linking dropdown
  const projects = charts
    .filter((c) => c.project)
    .map((c) => ({
      id: c.project!.id,
      chartName: c.name,
    }));

  return <FabricCatalog fabrics={fabrics} fabricBrands={fabricBrands} projects={projects} />;
}

import { getFabrics, getFabricBrands } from "@/lib/actions/fabric-actions";
import { getCharts } from "@/lib/actions/chart-actions";
import { FabricCatalog } from "@/components/features/fabric/fabric-catalog";

export default async function FabricPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const [fabrics, fabricBrands, charts, params] = await Promise.all([
    getFabrics(),
    getFabricBrands(),
    getCharts(),
    searchParams,
  ]);

  const initialTab = params.tab === "brands" ? "brands" : "fabrics";

  // Build projects list for fabric linking dropdown
  const projects = charts
    .filter((c) => c.project)
    .map((c) => ({
      id: c.project!.id,
      chartName: c.name,
    }));

  return (
    <FabricCatalog
      fabrics={fabrics}
      fabricBrands={fabricBrands}
      projects={projects}
      initialTab={initialTab}
    />
  );
}

import { getSupplyBrands } from "@/lib/actions/supply-actions";
import { SupplyBrandList } from "@/components/features/supplies/supply-brand-list";

export default async function SupplyBrandsPage() {
  const brands = await getSupplyBrands();
  return <SupplyBrandList brands={brands} />;
}

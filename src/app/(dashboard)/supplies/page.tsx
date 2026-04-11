import {
  getThreads,
  getBeads,
  getSpecialtyItems,
  getSupplyBrands,
} from "@/lib/actions/supply-actions";
import { SupplyCatalog } from "@/components/features/supplies/supply-catalog";

export default async function SuppliesPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const [threads, beads, specialtyItems, brands, params] = await Promise.all([
    getThreads(),
    getBeads(),
    getSpecialtyItems(),
    getSupplyBrands(),
    searchParams,
  ]);

  const initialView = params.view === "table" || params.view === "grid" ? params.view : undefined;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="font-heading text-lg font-semibold">Supply Catalog</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Browse and manage your thread, bead, and specialty item collections.
        </p>
      </div>

      <SupplyCatalog
        threads={threads}
        beads={beads}
        specialtyItems={specialtyItems}
        brands={brands}
        initialView={initialView}
      />
    </div>
  );
}

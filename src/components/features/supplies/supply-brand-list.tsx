"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  ChevronUp,
  ChevronDown,
  ExternalLink,
  Pencil,
  Trash2,
  Package,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SupplyBrandFormModal } from "./supply-brand-form-modal";
import { DeleteConfirmationDialog } from "@/components/features/designers/delete-confirmation-dialog";
import { deleteSupplyBrand } from "@/lib/actions/supply-actions";
import type { SupplyBrandWithCounts } from "@/types/supply";

/* ─── Types ─────────────────────────────────────────────────────────────────── */

type SortKey = "name" | "supplyType";
type SortDir = "asc" | "desc";

/* ─── Display Labels ────────────────────────────────────────────────────────── */

const SUPPLY_TYPE_DISPLAY: Record<string, string> = {
  THREAD: "Thread",
  BEAD: "Bead",
  SPECIALTY: "Specialty",
};

/* ─── Sortable Header ───────────────────────────────────────────────────────── */

function SortableHeader({
  label,
  sortKey,
  currentSort,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  currentSort: { key: SortKey; dir: SortDir };
  onSort: (key: SortKey) => void;
}) {
  const isActive = currentSort.key === sortKey;
  return (
    <th
      className="cursor-pointer px-4 py-2.5 text-left select-none"
      tabIndex={0}
      role="columnheader"
      onClick={() => onSort(sortKey)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSort(sortKey);
        }
      }}
      aria-sort={isActive ? (currentSort.dir === "asc" ? "ascending" : "descending") : "none"}
    >
      <span
        className={`inline-flex items-center gap-1 text-xs font-semibold tracking-wider uppercase transition-colors ${
          isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        {label}
        {isActive &&
          (currentSort.dir === "asc" ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          ))}
      </span>
    </th>
  );
}

/* ─── Main Component ────────────────────────────────────────────────────────── */

export function SupplyBrandList({ brands }: { brands: SupplyBrandWithCounts[] }) {
  const router = useRouter();
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: "name", dir: "asc" });
  const [search, setSearch] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<SupplyBrandWithCounts | null>(null);
  const [deletingBrand, setDeletingBrand] = useState<SupplyBrandWithCounts | null>(null);

  async function handleDelete() {
    if (!deletingBrand) return;
    try {
      const result = await deleteSupplyBrand(deletingBrand.id);
      if (result.success) {
        toast.success("Brand deleted");
        router.refresh();
      } else {
        toast.error(result.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  }

  function handleSort(key: SortKey) {
    setSort((prev) =>
      prev.key === key ? { key, dir: prev.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" },
    );
  }

  const filteredBrands = useMemo(() => {
    let result = brands;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((b) => b.name.toLowerCase().includes(q));
    }

    result = [...result].sort((a, b) => {
      const dir = sort.dir === "asc" ? 1 : -1;
      switch (sort.key) {
        case "name":
          return dir * a.name.localeCompare(b.name);
        case "supplyType":
          return dir * a.supplyType.localeCompare(b.supplyType);
        default:
          return 0;
      }
    });

    return result;
  }, [brands, search, sort]);

  const hasActiveFilters = search.length > 0;

  // Empty state
  if (brands.length === 0) {
    return (
      <div>
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-lg font-semibold">Supply Brands</h1>
        </div>

        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Package className="text-muted-foreground/40 mb-3 h-12 w-12" />
          <h2 className="font-heading text-lg font-semibold">No supply brands yet</h2>
          <p className="text-muted-foreground mt-1.5 max-w-xs text-sm">
            DMC will appear automatically after seeding. Add other brands like Mill Hill or Kreinik
            here.
          </p>
          <Button className="mt-4" onClick={() => setCreateModalOpen(true)}>
            <Plus className="h-4 w-4" data-icon="inline-start" />
            Add Brand
          </Button>
        </div>

        <SupplyBrandFormModal
          open={createModalOpen}
          onOpenChange={setCreateModalOpen}
          brand={null}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-lg font-semibold">Supply Brands</h1>
        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus className="h-4 w-4" data-icon="inline-start" />
          Add Brand
        </Button>
      </div>

      {/* Search bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-xs min-w-[200px] flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2" />
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search brands..."
            className="pl-9"
          />
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="text-muted-foreground hover:text-foreground text-xs transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Desktop table */}
      <div className="border-border bg-card hidden overflow-x-auto rounded-xl border md:block">
        <table className="w-full text-sm">
          <caption className="sr-only">Your supply brands</caption>
          <thead>
            <tr className="border-border border-b">
              <SortableHeader label="NAME" sortKey="name" currentSort={sort} onSort={handleSort} />
              <th className="px-4 py-2.5 text-left">
                <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                  WEBSITE
                </span>
              </th>
              <SortableHeader
                label="TYPE"
                sortKey="supplyType"
                currentSort={sort}
                onSort={handleSort}
              />
              <th className="w-20" />
            </tr>
          </thead>
          <tbody className="divide-border/60 divide-y">
            {filteredBrands.map((brand) => (
              <BrandRow
                key={brand.id}
                brand={brand}
                onEdit={() => setEditingBrand(brand)}
                onDelete={() => setDeletingBrand(brand)}
              />
            ))}
            {filteredBrands.length === 0 && (
              <tr>
                <td colSpan={4} className="py-12 text-center">
                  <Package className="text-muted-foreground/40 mx-auto mb-2 h-8 w-8" />
                  <p className="text-muted-foreground text-sm">
                    {hasActiveFilters ? "No brands match your search" : "No supply brands yet"}
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {filteredBrands.map((brand) => (
          <BrandCard
            key={brand.id}
            brand={brand}
            onEdit={() => setEditingBrand(brand)}
            onDelete={() => setDeletingBrand(brand)}
          />
        ))}
        {filteredBrands.length === 0 && (
          <div className="py-12 text-center">
            <Package className="text-muted-foreground/40 mx-auto mb-2 h-8 w-8" />
            <p className="text-muted-foreground text-sm">
              {hasActiveFilters ? "No brands match your search" : "No supply brands yet"}
            </p>
          </div>
        )}
      </div>

      {/* Create modal */}
      <SupplyBrandFormModal open={createModalOpen} onOpenChange={setCreateModalOpen} brand={null} />

      {/* Edit modal */}
      <SupplyBrandFormModal
        open={!!editingBrand}
        onOpenChange={(open) => {
          if (!open) setEditingBrand(null);
        }}
        brand={editingBrand}
      />

      {/* Delete confirmation dialog */}
      <DeleteConfirmationDialog
        open={!!deletingBrand}
        onOpenChange={(open) => {
          if (!open) setDeletingBrand(null);
        }}
        title="Delete Brand?"
        entityName={deletingBrand?.name ?? ""}
        chartCount={
          (deletingBrand?._count.threads ?? 0) +
          (deletingBrand?._count.beads ?? 0) +
          (deletingBrand?._count.specialtyItems ?? 0)
        }
        entityType="brand"
        onConfirm={handleDelete}
      />
    </div>
  );
}

/* ─── Brand Row ─────────────────────────────────────────────────────────────── */

function BrandRow({
  brand,
  onEdit,
  onDelete,
}: {
  brand: SupplyBrandWithCounts;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <tr className="group hover:bg-muted/50 transition-colors">
      <td className="px-4 py-3">
        <span className="text-foreground text-sm font-medium">{brand.name}</span>
      </td>
      <td className="px-4 py-3">
        {brand.website ? (
          <a
            href={brand.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 inline-flex items-center gap-1 text-sm transition-colors"
            aria-label={`Visit ${brand.name} website`}
          >
            <ExternalLink className="h-3 w-3" />
          </a>
        ) : (
          <span className="text-muted-foreground text-sm">&mdash;</span>
        )}
      </td>
      <td className="px-4 py-3">
        <span className="text-muted-foreground text-sm">
          {SUPPLY_TYPE_DISPLAY[brand.supplyType] ?? brand.supplyType}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1 opacity-40 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
          <button
            type="button"
            onClick={onEdit}
            className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-md p-1.5 transition-colors"
            title="Edit brand"
            aria-label={`Edit ${brand.name}`}
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md p-1.5 transition-colors"
            title="Delete brand"
            aria-label={`Delete ${brand.name}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}

/* ─── Mobile Card ───────────────────────────────────────────────────────────── */

function BrandCard({
  brand,
  onEdit,
  onDelete,
}: {
  brand: SupplyBrandWithCounts;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const totalCount = brand._count.threads + brand._count.beads + brand._count.specialtyItems;

  return (
    <div className="border-border bg-card rounded-xl border p-4 shadow-sm">
      <div className="mb-2 flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <span className="text-foreground block truncate text-sm font-semibold">{brand.name}</span>
        </div>
        <div className="ml-2 flex shrink-0 items-center gap-1">
          {brand.website && (
            <a
              href={brand.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:bg-primary/10 rounded-md p-1.5 transition-colors"
              aria-label={`Visit ${brand.name} website`}
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
          <button
            type="button"
            onClick={onEdit}
            className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-md p-1.5 transition-colors"
            title="Edit brand"
            aria-label={`Edit ${brand.name}`}
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md p-1.5 transition-colors"
            title="Delete brand"
            aria-label={`Delete ${brand.name}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <div className="text-muted-foreground flex items-center gap-4 text-xs">
        <span>{SUPPLY_TYPE_DISPLAY[brand.supplyType]}</span>
        <span>{totalCount} supplies</span>
      </div>
    </div>
  );
}

"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  ChevronUp,
  ChevronDown,
  Pencil,
  Trash2,
  Plus,
  PackageOpen,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FabricFormModal } from "./fabric-form-modal";
import { FabricBrandList } from "./fabric-brand-list";
import { deleteFabric } from "@/lib/actions/fabric-actions";
import type { FabricWithBrand, FabricBrandWithCounts } from "@/types/fabric";
import type { Fabric } from "@/types/fabric";
import { useTransition } from "react";

/* ─── Types ─── */

type SortKey = "name" | "brand" | "count" | "type" | "colorFamily" | "dimensions";
type SortDir = "asc" | "desc";

/* ─── Sortable Header ─── */

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
      className="cursor-pointer select-none px-4 py-2.5 text-left"
      onClick={() => onSort(sortKey)}
    >
      <span
        className={`inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider transition-colors ${
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

/* ─── Delete Dialog ─── */

function FabricDeleteDialog({
  open,
  onOpenChange,
  fabric,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fabric: FabricWithBrand | null;
  onConfirm: () => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      try {
        await onConfirm();
        onOpenChange(false);
      } catch {
        // caller handles error via toast
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-heading text-lg font-semibold">Delete Fabric?</DialogTitle>
          <DialogDescription>
            {`Delete "${fabric?.name ?? ""}"? This will unlink it from its project.`}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={handleConfirm} disabled={isPending}>
            {isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Main Component ─── */

export function FabricCatalog({
  fabrics,
  fabricBrands,
  projects,
  initialTab = "fabrics",
}: {
  fabrics: FabricWithBrand[];
  fabricBrands: FabricBrandWithCounts[];
  projects: Array<{ id: string; chartName: string }>;
  initialTab?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTabRaw] = useState<string>(initialTab);

  const setActiveTab = useCallback(
    (tab: string) => {
      setActiveTabRaw(tab);
      const params = new URLSearchParams(searchParams.toString());
      if (tab === "fabrics") {
        params.delete("tab");
      } else {
        params.set("tab", tab);
      }
      const qs = params.toString();
      router.replace(qs ? `?${qs}` : "/fabric", { scroll: false });
    },
    [router, searchParams],
  );
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: "name", dir: "asc" });
  const [search, setSearch] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingFabric, setEditingFabric] = useState<FabricWithBrand | null>(null);
  const [deletingFabric, setDeletingFabric] = useState<FabricWithBrand | null>(null);
  const [brandCreateOpen, setBrandCreateOpen] = useState(false);

  async function handleDelete() {
    if (!deletingFabric) return;
    try {
      const result = await deleteFabric(deletingFabric.id);
      if (result.success) {
        toast.success("Fabric deleted");
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

  const filteredFabrics = useMemo(() => {
    let result = fabrics;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((f) => f.name.toLowerCase().includes(q));
    }

    result = [...result].sort((a, b) => {
      const dir = sort.dir === "asc" ? 1 : -1;
      switch (sort.key) {
        case "name":
          return dir * a.name.localeCompare(b.name);
        case "brand":
          return dir * a.brand.name.localeCompare(b.brand.name);
        case "count":
          return dir * (a.count - b.count);
        case "type":
          return dir * a.type.localeCompare(b.type);
        case "colorFamily":
          return dir * a.colorFamily.localeCompare(b.colorFamily);
        case "dimensions": {
          const aArea = a.shortestEdgeInches * a.longestEdgeInches;
          const bArea = b.shortestEdgeInches * b.longestEdgeInches;
          return dir * (aArea - bArea);
        }
        default:
          return 0;
      }
    });

    return result;
  }, [fabrics, search, sort]);

  const hasActiveFilters = search.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold">Fabric</h1>
        <Button
          onClick={() => {
            if (activeTab === "fabrics") {
              setCreateModalOpen(true);
            } else {
              setBrandCreateOpen(true);
            }
          }}
        >
          <Plus className="h-4 w-4" data-icon="inline-start" />
          {activeTab === "fabrics" ? "Add Fabric" : "Add Brand"}
        </Button>
      </div>

      {/* Tabs — plain buttons to avoid Base UI Tabs useId hydration mismatch */}
      <div className="border-border flex items-center gap-1 border-b">
        {(
          [
            { key: "fabrics", label: `Fabrics (${fabrics.length})` },
            { key: "brands", label: `Brands (${fabricBrands.length})` },
          ] as const
        ).map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground border-transparent"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === "fabrics" && (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[200px] max-w-xs flex-1">
              <Search className="text-muted-foreground absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2" />
              <Input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search fabric..."
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

          {/* Table */}
          {fabrics.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <PackageOpen className="text-muted-foreground/40 mb-3 h-12 w-12" />
              <h2 className="font-heading text-lg font-semibold">No fabric records yet</h2>
              <p className="text-muted-foreground mt-1.5 max-w-xs text-sm">
                Track your fabric stash and see which projects fit.
              </p>
              <Button className="mt-4" onClick={() => setCreateModalOpen(true)}>
                <Plus className="h-4 w-4" data-icon="inline-start" />
                Add Fabric
              </Button>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="border-border bg-card hidden overflow-x-auto rounded-xl border md:block">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-border border-b">
                      <SortableHeader
                        label="NAME"
                        sortKey="name"
                        currentSort={sort}
                        onSort={handleSort}
                      />
                      <SortableHeader
                        label="BRAND"
                        sortKey="brand"
                        currentSort={sort}
                        onSort={handleSort}
                      />
                      <SortableHeader
                        label="COUNT"
                        sortKey="count"
                        currentSort={sort}
                        onSort={handleSort}
                      />
                      <SortableHeader
                        label="TYPE"
                        sortKey="type"
                        currentSort={sort}
                        onSort={handleSort}
                      />
                      <SortableHeader
                        label="COLOUR"
                        sortKey="colorFamily"
                        currentSort={sort}
                        onSort={handleSort}
                      />
                      <SortableHeader
                        label="DIMENSIONS"
                        sortKey="dimensions"
                        currentSort={sort}
                        onSort={handleSort}
                      />
                      <th className="px-4 py-2.5 text-left">
                        <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                          NEED TO BUY
                        </span>
                      </th>
                      <th className="w-20" />
                    </tr>
                  </thead>
                  <tbody className="divide-border/60 divide-y">
                    {filteredFabrics.map((fabric) => (
                      <FabricRow
                        key={fabric.id}
                        fabric={fabric}
                        onEdit={() => setEditingFabric(fabric)}
                        onDelete={() => setDeletingFabric(fabric)}
                      />
                    ))}
                    {filteredFabrics.length === 0 && (
                      <tr>
                        <td colSpan={8} className="py-12 text-center">
                          <PackageOpen className="text-muted-foreground/40 mx-auto mb-2 h-8 w-8" />
                          <p className="text-muted-foreground text-sm">
                            {hasActiveFilters
                              ? "No fabric matches your search"
                              : "No fabric records yet"}
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="space-y-3 md:hidden">
                {filteredFabrics.map((fabric) => (
                  <FabricCard
                    key={fabric.id}
                    fabric={fabric}
                    onEdit={() => setEditingFabric(fabric)}
                    onDelete={() => setDeletingFabric(fabric)}
                  />
                ))}
                {filteredFabrics.length === 0 && (
                  <div className="py-12 text-center">
                    <PackageOpen className="text-muted-foreground/40 mx-auto mb-2 h-8 w-8" />
                    <p className="text-muted-foreground text-sm">
                      {hasActiveFilters
                        ? "No fabric matches your search"
                        : "No fabric records yet"}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === "brands" && (
        <div>
          <FabricBrandList brands={fabricBrands} />
        </div>
      )}

      {/* Create fabric modal */}
      <FabricFormModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        fabric={null}
        fabricBrands={fabricBrands}
        projects={projects}
      />

      {/* Edit fabric modal */}
      <FabricFormModal
        open={!!editingFabric}
        onOpenChange={(open) => {
          if (!open) setEditingFabric(null);
        }}
        fabric={editingFabric}
        fabricBrands={fabricBrands}
        projects={projects}
      />

      {/* Delete fabric dialog */}
      <FabricDeleteDialog
        open={!!deletingFabric}
        onOpenChange={(open) => {
          if (!open) setDeletingFabric(null);
        }}
        fabric={deletingFabric}
        onConfirm={handleDelete}
      />
    </div>
  );
}

/* ─── Fabric Row ─── */

function FabricRow({
  fabric,
  onEdit,
  onDelete,
}: {
  fabric: FabricWithBrand;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const hasDimensions = fabric.shortestEdgeInches > 0 && fabric.longestEdgeInches > 0;

  return (
    <tr className="hover:bg-muted/50 group transition-colors">
      <td className="px-4 py-3">
        <Link
          href={`/fabric/${fabric.id}`}
          className="text-foreground hover:text-primary text-sm font-medium transition-colors"
        >
          {fabric.name}
        </Link>
      </td>
      <td className="px-4 py-3">
        <span className="text-muted-foreground text-sm">{fabric.brand.name}</span>
      </td>
      <td className="px-4 py-3">
        <span className="text-muted-foreground text-sm">{fabric.count}ct</span>
      </td>
      <td className="px-4 py-3">
        <span className="text-muted-foreground text-sm">{fabric.type}</span>
      </td>
      <td className="px-4 py-3">
        <span className="text-muted-foreground text-sm">{fabric.colorFamily}</span>
      </td>
      <td className="px-4 py-3">
        <span className="text-muted-foreground text-sm">
          {hasDimensions
            ? `${fabric.shortestEdgeInches}" x ${fabric.longestEdgeInches}"`
            : "\u2014"}
        </span>
      </td>
      <td className="px-4 py-3">
        {fabric.needToBuy ? (
          <Badge className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800">
            Yes
          </Badge>
        ) : (
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800">
            No
          </Badge>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1 opacity-40 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
          <button
            type="button"
            onClick={onEdit}
            className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-md p-1.5 transition-colors"
            title="Edit fabric"
            aria-label={`Edit ${fabric.name}`}
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md p-1.5 transition-colors"
            title="Delete fabric"
            aria-label={`Delete ${fabric.name}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}

/* ─── Mobile Card ─── */

function FabricCard({
  fabric,
  onEdit,
  onDelete,
}: {
  fabric: FabricWithBrand;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const hasDimensions = fabric.shortestEdgeInches > 0 && fabric.longestEdgeInches > 0;

  return (
    <div className="border-border bg-card rounded-xl border p-4 shadow-sm">
      <div className="mb-2 flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <Link
            href={`/fabric/${fabric.id}`}
            className="text-foreground hover:text-primary block truncate text-sm font-semibold transition-colors"
          >
            {fabric.name}
          </Link>
          <p className="text-muted-foreground mt-0.5 text-xs">
            {fabric.brand.name} &middot; {fabric.count}ct {fabric.type}
          </p>
        </div>
        <div className="ml-2 flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={onEdit}
            className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-md p-1.5 transition-colors"
            aria-label={`Edit ${fabric.name}`}
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md p-1.5 transition-colors"
            aria-label={`Delete ${fabric.name}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-xs">
        <span>{fabric.colorFamily}</span>
        {hasDimensions && (
          <span>
            {fabric.shortestEdgeInches}" x {fabric.longestEdgeInches}"
          </span>
        )}
        {fabric.needToBuy && (
          <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800">
            Need to buy
          </Badge>
        )}
      </div>
    </div>
  );
}

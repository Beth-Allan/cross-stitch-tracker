"use client";

import { useState, useMemo, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  ChevronUp,
  ChevronDown,
  ExternalLink,
  Pencil,
  Trash2,
  Plus,
  PackageOpen,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormField } from "@/components/features/charts/form-primitives/form-field";
import {
  createFabricBrand,
  updateFabricBrand,
  deleteFabricBrand,
} from "@/lib/actions/fabric-actions";
import type { FabricBrandWithCounts } from "@/types/fabric";

/* ─── Types ─── */

type SortKey = "name" | "fabricCount";
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

/* ─── Brand Form Modal ─── */

function FabricBrandFormModal({
  open,
  onOpenChange,
  brand,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brand: FabricBrandWithCounts | null;
}) {
  const router = useRouter();
  const isEditing = !!brand;
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (brand) {
        setName(brand.name);
        setWebsite(brand.website ?? "");
      } else {
        setName("");
        setWebsite("");
      }
      setNameError(null);
    }
  }, [open, brand]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setNameError("Brand name is required");
      return;
    }
    setNameError(null);

    const formData = {
      name: trimmedName,
      website: website.trim() || null,
    };

    startTransition(async () => {
      try {
        const result = isEditing
          ? await updateFabricBrand(brand.id, formData)
          : await createFabricBrand(formData);

        if (result.success) {
          toast.success(isEditing ? "Brand updated" : "Brand created");
          router.refresh();
          onOpenChange(false);
        } else {
          if (result.error?.includes("already exists")) {
            setNameError(result.error);
          } else {
            toast.error(result.error ?? "Something went wrong. Please try again.");
          }
        }
      } catch {
        toast.error("Something went wrong. Please try again.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-lg font-semibold">
            {isEditing ? "Edit Brand" : "Add Brand"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            label="Name"
            htmlFor="brand-name"
            required
            error={nameError ?? undefined}
          >
            <Input
              id="brand-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Zweigart"
              autoFocus
            />
          </FormField>

          <FormField label="Website" htmlFor="brand-website">
            <Input
              id="brand-website"
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://example.com"
            />
          </FormField>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? isEditing
                  ? "Saving..."
                  : "Adding..."
                : isEditing
                  ? "Save Changes"
                  : "Add Brand"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Delete Dialog ─── */

function FabricBrandDeleteDialog({
  open,
  onOpenChange,
  brand,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brand: FabricBrandWithCounts | null;
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
          <DialogTitle className="font-heading text-lg font-semibold">Delete Brand?</DialogTitle>
          <DialogDescription>
            {`Delete "${brand?.name ?? ""}"? All fabric from this brand will also be deleted.`}
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

export function FabricBrandList({
  brands,
  onAddBrand,
}: {
  brands: FabricBrandWithCounts[];
  onAddBrand?: () => void;
}) {
  const router = useRouter();
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: "name", dir: "asc" });
  const [search, setSearch] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<FabricBrandWithCounts | null>(null);
  const [deletingBrand, setDeletingBrand] = useState<FabricBrandWithCounts | null>(null);

  async function handleDelete() {
    if (!deletingBrand) return;
    try {
      const result = await deleteFabricBrand(deletingBrand.id);
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

  function handleCreate() {
    setCreateModalOpen(true);
    onAddBrand?.();
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
        case "fabricCount":
          return dir * (a._count.fabrics - b._count.fabrics);
        default:
          return 0;
      }
    });

    return result;
  }, [brands, search, sort]);

  if (brands.length === 0) {
    return (
      <div>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <PackageOpen className="text-muted-foreground/40 mb-3 h-12 w-12" />
          <h2 className="font-heading text-lg font-semibold">No fabric brands yet</h2>
          <p className="text-muted-foreground mt-1.5 max-w-xs text-sm">
            Add your first fabric brand to start organizing your collection.
          </p>
          <Button className="mt-4" onClick={handleCreate}>
            <Plus className="h-4 w-4" data-icon="inline-start" />
            Add Brand
          </Button>
        </div>

        <FabricBrandFormModal
          open={createModalOpen}
          onOpenChange={setCreateModalOpen}
          brand={null}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] max-w-xs flex-1">
          <Search className="text-muted-foreground absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2" />
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search brands..."
            className="pl-9"
          />
        </div>
      </div>

      {/* Table */}
      <div className="border-border bg-card overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-border border-b">
              <SortableHeader
                label="NAME"
                sortKey="name"
                currentSort={sort}
                onSort={handleSort}
              />
              <th className="px-4 py-2.5 text-left">
                <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                  WEBSITE
                </span>
              </th>
              <SortableHeader
                label="FABRICS"
                sortKey="fabricCount"
                currentSort={sort}
                onSort={handleSort}
              />
              <th className="w-20" />
            </tr>
          </thead>
          <tbody className="divide-border/60 divide-y">
            {filteredBrands.map((brand) => (
              <tr key={brand.id} className="hover:bg-muted/50 group transition-colors">
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
                  <span className="text-muted-foreground text-sm">{brand._count.fabrics}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => setEditingBrand(brand)}
                      className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-md p-1.5 transition-colors"
                      title="Edit brand"
                      aria-label={`Edit ${brand.name}`}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingBrand(brand)}
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md p-1.5 transition-colors"
                      title="Delete brand"
                      aria-label={`Delete ${brand.name}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredBrands.length === 0 && (
              <tr>
                <td colSpan={4} className="py-12 text-center">
                  <PackageOpen className="text-muted-foreground/40 mx-auto mb-2 h-8 w-8" />
                  <p className="text-muted-foreground text-sm">No brands match your search</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create modal */}
      <FabricBrandFormModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        brand={null}
      />

      {/* Edit modal */}
      <FabricBrandFormModal
        open={!!editingBrand}
        onOpenChange={(open) => {
          if (!open) setEditingBrand(null);
        }}
        brand={editingBrand}
      />

      {/* Delete confirmation */}
      <FabricBrandDeleteDialog
        open={!!deletingBrand}
        onOpenChange={(open) => {
          if (!open) setDeletingBrand(null);
        }}
        brand={deletingBrand}
        onConfirm={handleDelete}
      />
    </div>
  );
}

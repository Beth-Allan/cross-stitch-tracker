"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Grid3X3, List, Plus, CircleDot, Gem, Sparkles, Tags } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";
import { Input } from "@/components/ui/input";
import { SupplyGridView } from "./supply-grid-view";
import { SupplyTableView } from "./supply-table-view";
import { SupplyFormModal, type InitialData } from "./supply-form-modal";
import { DeleteConfirmationDialog } from "@/components/features/designers/delete-confirmation-dialog";
import { deleteThread, deleteBead, deleteSpecialtyItem } from "@/lib/actions/supply-actions";
import { COLOR_FAMILIES } from "@/types/supply";
import type { ThreadWithBrand, BeadWithBrand, SpecialtyItemWithBrand } from "@/types/supply";
import type { SupplyBrand, ColorFamily } from "@/generated/prisma/client";

/* ─── Types ─────────────────────────────────────────────────────────────────── */

type SupplyTab = "threads" | "beads" | "specialty";
type ViewMode = "grid" | "table";

interface SupplyCatalogProps {
  threads: ThreadWithBrand[];
  beads: BeadWithBrand[];
  specialtyItems: SpecialtyItemWithBrand[];
  brands: SupplyBrand[];
}

/* ─── Color Family Display ──────────────────────────────────────────────────── */

const COLOR_FAMILY_DISPLAY: Record<string, string> = {
  BLACK: "Black",
  WHITE: "White",
  RED: "Red",
  ORANGE: "Orange",
  YELLOW: "Yellow",
  GREEN: "Green",
  BLUE: "Blue",
  PURPLE: "Purple",
  BROWN: "Brown",
  GRAY: "Gray",
  NEUTRAL: "Neutral",
};

/* ─── Default Views ─────────────────────────────────────────────────────────── */

const DEFAULT_VIEWS: Record<SupplyTab, ViewMode> = {
  threads: "grid",
  beads: "table",
  specialty: "table",
};

const STORAGE_KEYS: Record<SupplyTab, string> = {
  threads: "supply-view-threads",
  beads: "supply-view-beads",
  specialty: "supply-view-specialty",
};

/* ─── Tab Config ────────────────────────────────────────────────────────────── */

const TAB_CONFIG: {
  key: SupplyTab;
  label: string;
  icon: typeof CircleDot;
  addLabel: string;
  supplyType: "thread" | "bead" | "specialty";
}[] = [
  {
    key: "threads",
    label: "Threads",
    icon: CircleDot,
    addLabel: "Add Thread",
    supplyType: "thread",
  },
  { key: "beads", label: "Beads", icon: Gem, addLabel: "Add Bead", supplyType: "bead" },
  {
    key: "specialty",
    label: "Specialty Items",
    icon: Sparkles,
    addLabel: "Add Item",
    supplyType: "specialty",
  },
];

/* ─── Thread Table Columns ──────────────────────────────────────────────────── */

const THREAD_COLUMNS = [
  {
    key: "code",
    label: "CODE",
    sortable: true,
    accessor: (item: { colorCode?: string; productCode?: string }) =>
      item.colorCode ?? item.productCode ?? "",
  },
  {
    key: "name",
    label: "NAME",
    sortable: true,
    accessor: (item: { colorName: string }) => item.colorName,
  },
  {
    key: "brand",
    label: "BRAND",
    sortable: true,
    accessor: (item: { brand: { name: string } }) => item.brand.name,
  },
  {
    key: "family",
    label: "COLOR FAMILY",
    sortable: true,
    accessor: (item: { colorFamily?: string }) =>
      COLOR_FAMILY_DISPLAY[item.colorFamily ?? ""] ?? item.colorFamily ?? "",
  },
];

const BEAD_COLUMNS = [
  {
    key: "code",
    label: "CODE",
    sortable: true,
    accessor: (item: { colorCode?: string; productCode?: string }) =>
      item.colorCode ?? item.productCode ?? "",
  },
  {
    key: "name",
    label: "NAME",
    sortable: true,
    accessor: (item: { colorName: string }) => item.colorName,
  },
  {
    key: "brand",
    label: "BRAND",
    sortable: true,
    accessor: (item: { brand: { name: string } }) => item.brand.name,
  },
  {
    key: "family",
    label: "COLOR FAMILY",
    sortable: true,
    accessor: (item: { colorFamily?: string }) =>
      COLOR_FAMILY_DISPLAY[item.colorFamily ?? ""] ?? item.colorFamily ?? "",
  },
];

const SPECIALTY_COLUMNS = [
  {
    key: "code",
    label: "CODE",
    sortable: true,
    accessor: (item: { colorCode?: string; productCode?: string }) =>
      item.colorCode ?? item.productCode ?? "",
  },
  {
    key: "name",
    label: "NAME",
    sortable: true,
    accessor: (item: { colorName: string }) => item.colorName,
  },
  {
    key: "brand",
    label: "BRAND",
    sortable: true,
    accessor: (item: { brand: { name: string } }) => item.brand.name,
  },
  {
    key: "description",
    label: "DESCRIPTION",
    sortable: false,
    accessor: (item: { description?: string }) => item.description ?? "",
  },
];

/* ─── Component ─────────────────────────────────────────────────────────────── */

export function SupplyCatalog({ threads, beads, specialtyItems, brands }: SupplyCatalogProps) {
  const router = useRouter();
  const [activeTab, setActiveTabRaw] = useState<SupplyTab>("threads");
  const [viewModes, setViewModes] = useState<Record<SupplyTab, ViewMode>>(() => {
    if (typeof window === "undefined") return DEFAULT_VIEWS;
    const restored = { ...DEFAULT_VIEWS };
    for (const tab of TAB_CONFIG) {
      const stored = localStorage.getItem(STORAGE_KEYS[tab.key]);
      if (stored === "grid" || stored === "table") {
        restored[tab.key] = stored;
      }
    }
    return restored;
  });
  const [search, setSearch] = useState("");
  const [colorFamilyFilter, setColorFamilyFilter] = useState<ColorFamily | "">("");
  const [brandFilter, setBrandFilter] = useState<string>("");

  function setActiveTab(tab: SupplyTab) {
    setActiveTabRaw(tab);
    setSearch("");
    setColorFamilyFilter("");
    setBrandFilter("");
  }

  // Modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<{
    type: "thread" | "bead" | "specialty";
    data: InitialData;
  } | null>(null);
  const [deletingItem, setDeletingItem] = useState<{
    type: "thread" | "bead" | "specialty";
    id: string;
    label: string;
  } | null>(null);

  // Persist view mode to localStorage
  const setViewMode = useCallback((tab: SupplyTab, mode: ViewMode) => {
    setViewModes((prev) => ({ ...prev, [tab]: mode }));
    localStorage.setItem(STORAGE_KEYS[tab], mode);
  }, []);

  // Filtered data
  const filteredThreads = useMemo(() => {
    let result = threads;
    if (brandFilter) result = result.filter((t) => t.brandId === brandFilter);
    if (colorFamilyFilter) result = result.filter((t) => t.colorFamily === colorFamilyFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) => t.colorCode.toLowerCase().includes(q) || t.colorName.toLowerCase().includes(q),
      );
    }
    return result;
  }, [threads, brandFilter, colorFamilyFilter, search]);

  const filteredBeads = useMemo(() => {
    let result = beads;
    if (brandFilter) result = result.filter((b) => b.brandId === brandFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (b) => b.productCode.toLowerCase().includes(q) || b.colorName.toLowerCase().includes(q),
      );
    }
    return result;
  }, [beads, brandFilter, search]);

  const filteredSpecialty = useMemo(() => {
    let result = specialtyItems;
    if (brandFilter) result = result.filter((s) => s.brandId === brandFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) => s.productCode.toLowerCase().includes(q) || s.colorName.toLowerCase().includes(q),
      );
    }
    return result;
  }, [specialtyItems, brandFilter, search]);

  // Count helpers
  const tabCounts: Record<SupplyTab, number> = {
    threads: threads.length,
    beads: beads.length,
    specialty: specialtyItems.length,
  };

  const currentTabConfig = TAB_CONFIG.find((t) => t.key === activeTab)!;

  // Map items for grid/table (normalize colorCode/productCode)
  function getGridItems() {
    switch (activeTab) {
      case "threads":
        return filteredThreads.map((t) => ({
          id: t.id,
          colorCode: t.colorCode,
          colorName: t.colorName,
          hexColor: t.hexColor,
          brand: t.brand,
        }));
      case "beads":
        return filteredBeads.map((b) => ({
          id: b.id,
          productCode: b.productCode,
          colorName: b.colorName,
          hexColor: b.hexColor,
          brand: b.brand,
        }));
      case "specialty":
        return filteredSpecialty.map((s) => ({
          id: s.id,
          productCode: s.productCode,
          colorName: s.colorName,
          hexColor: s.hexColor,
          brand: s.brand,
        }));
    }
  }

  function getTableItems() {
    switch (activeTab) {
      case "threads":
        return filteredThreads.map((t) => ({
          id: t.id,
          colorCode: t.colorCode,
          colorName: t.colorName,
          hexColor: t.hexColor,
          colorFamily: t.colorFamily,
          brand: t.brand,
        }));
      case "beads":
        return filteredBeads.map((b) => ({
          id: b.id,
          productCode: b.productCode,
          colorName: b.colorName,
          hexColor: b.hexColor,
          colorFamily: b.colorFamily,
          brand: b.brand,
        }));
      case "specialty":
        return filteredSpecialty.map((s) => ({
          id: s.id,
          productCode: s.productCode,
          colorName: s.colorName,
          hexColor: s.hexColor,
          description: s.description ?? undefined,
          brand: s.brand,
        }));
    }
  }

  function getColumns() {
    switch (activeTab) {
      case "threads":
        return THREAD_COLUMNS;
      case "beads":
        return BEAD_COLUMNS;
      case "specialty":
        return SPECIALTY_COLUMNS;
    }
  }

  function handleEdit(id: string) {
    const supplyType = currentTabConfig.supplyType;
    let data: InitialData | null = null;

    if (supplyType === "thread") {
      const thread = threads.find((t) => t.id === id);
      if (thread) {
        data = {
          id: thread.id,
          brandId: thread.brandId,
          colorCode: thread.colorCode,
          colorName: thread.colorName,
          hexColor: thread.hexColor,
          colorFamily: thread.colorFamily,
        };
      }
    } else if (supplyType === "bead") {
      const bead = beads.find((b) => b.id === id);
      if (bead) {
        data = {
          id: bead.id,
          brandId: bead.brandId,
          productCode: bead.productCode,
          colorName: bead.colorName,
          hexColor: bead.hexColor,
          colorFamily: bead.colorFamily,
        };
      }
    } else {
      const item = specialtyItems.find((s) => s.id === id);
      if (item) {
        data = {
          id: item.id,
          brandId: item.brandId,
          productCode: item.productCode,
          colorName: item.colorName,
          hexColor: item.hexColor,
          description: item.description ?? "",
        };
      }
    }

    if (data) setEditingItem({ type: supplyType, data });
  }

  function handleDeleteClick(id: string) {
    const supplyType = currentTabConfig.supplyType;
    let label = "";

    if (supplyType === "thread") {
      const thread = threads.find((t) => t.id === id);
      label = thread ? `${thread.brand.name} ${thread.colorCode}` : id;
    } else if (supplyType === "bead") {
      const bead = beads.find((b) => b.id === id);
      label = bead ? `${bead.brand.name} ${bead.productCode}` : id;
    } else {
      const item = specialtyItems.find((s) => s.id === id);
      label = item ? `${item.brand.name} ${item.productCode}` : id;
    }

    setDeletingItem({ type: supplyType, id, label });
  }

  async function handleDelete() {
    if (!deletingItem) return;
    try {
      let result: { success: boolean; error?: string };
      if (deletingItem.type === "thread") {
        result = await deleteThread(deletingItem.id);
      } else if (deletingItem.type === "bead") {
        result = await deleteBead(deletingItem.id);
      } else {
        result = await deleteSpecialtyItem(deletingItem.id);
      }

      if (result.success) {
        toast.success("Supply deleted");
        router.refresh();
      } else {
        toast.error(result.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  }

  // Get currently active items
  function getCurrentItems() {
    switch (activeTab) {
      case "threads":
        return filteredThreads;
      case "beads":
        return filteredBeads;
      case "specialty":
        return filteredSpecialty;
    }
  }

  // Empty state content
  function renderEmptyState() {
    const items = getCurrentItems();
    if (items.length > 0) return null;

    // Check if the entire catalog is empty (not just filtered)
    const totalCount = tabCounts[activeTab];
    if (totalCount > 0) {
      // Filtered empty
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Search className="text-muted-foreground/40 mb-3 h-12 w-12" />
          <p className="text-muted-foreground text-sm">No items match your search</p>
        </div>
      );
    }

    // Truly empty
    switch (activeTab) {
      case "threads":
        return (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <CircleDot className="text-muted-foreground/40 mb-3 h-12 w-12" />
            <h2 className="font-heading text-lg font-semibold">No threads in your catalog</h2>
            <p className="text-muted-foreground mt-1.5 max-w-xs text-sm">
              Your DMC thread catalog will appear here after seeding. Run the seed script to load
              ~500 colors.
            </p>
          </div>
        );
      case "beads":
        return (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Gem className="text-muted-foreground/40 mb-3 h-12 w-12" />
            <h2 className="font-heading text-lg font-semibold">No beads yet</h2>
            <p className="text-muted-foreground mt-1.5 max-w-xs text-sm">
              Add beads from brands like Mill Hill to start building your bead catalog.
            </p>
            <Button className="mt-4" onClick={() => setCreateModalOpen(true)}>
              <Plus className="h-4 w-4" data-icon="inline-start" />
              Add Bead
            </Button>
          </div>
        );
      case "specialty":
        return (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Sparkles className="text-muted-foreground/40 mb-3 h-12 w-12" />
            <h2 className="font-heading text-lg font-semibold">No specialty items yet</h2>
            <p className="text-muted-foreground mt-1.5 max-w-xs text-sm">
              Track metallic threads, braids, ribbons, and other specialty supplies here.
            </p>
            <Button className="mt-4" onClick={() => setCreateModalOpen(true)}>
              <Plus className="h-4 w-4" data-icon="inline-start" />
              Add Item
            </Button>
          </div>
        );
    }
  }

  const currentViewMode = viewModes[activeTab];
  const emptyState = renderEmptyState();

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="border-border flex items-center gap-1 border-b">
        {TAB_CONFIG.map((tab) => {
          const isActive = activeTab === tab.key;
          const Icon = tab.icon;
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
              <Icon className="h-4 w-4" />
              {tab.label} ({tabCounts[tab.key]})
            </button>
          );
        })}
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Brand filter */}
        <select
          value={brandFilter}
          onChange={(e) => setBrandFilter(e.target.value)}
          className="border-input bg-background ring-offset-background focus-visible:ring-ring rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <option value="">All Brands</option>
          {brands
            .filter((b) => {
              if (activeTab === "threads") return b.supplyType === "THREAD";
              if (activeTab === "beads") return b.supplyType === "BEAD";
              return b.supplyType === "SPECIALTY";
            })
            .map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
        </select>

        {/* Color family filter (threads only) */}
        {activeTab === "threads" && (
          <select
            value={colorFamilyFilter}
            onChange={(e) => setColorFamilyFilter(e.target.value as ColorFamily | "")}
            className="border-input bg-background ring-offset-background focus-visible:ring-ring rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            <option value="">All Colors</option>
            {COLOR_FAMILIES.map((f) => (
              <option key={f} value={f}>
                {COLOR_FAMILY_DISPLAY[f]}
              </option>
            ))}
          </select>
        )}

        {/* Search */}
        <div className="relative max-w-xs min-w-[200px] flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2" />
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              activeTab === "threads" ? "Search by code or name..." : "Search supplies..."
            }
            className="pl-9"
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* View toggle */}
          <div className="border-border flex items-center rounded-lg border">
            <button
              type="button"
              onClick={() => setViewMode(activeTab, "grid")}
              className={`rounded-l-lg p-2 transition-colors ${
                currentViewMode === "grid"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              aria-label="Grid view"
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode(activeTab, "table")}
              className={`rounded-r-lg p-2 transition-colors ${
                currentViewMode === "table"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              aria-label="Table view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          {/* Manage Brands */}
          <LinkButton href="/supplies/brands" variant="outline" size="sm">
            <Tags className="h-4 w-4" data-icon="inline-start" />
            Manage Brands
          </LinkButton>

          {/* Add button */}
          <Button onClick={() => setCreateModalOpen(true)}>
            <Plus className="h-4 w-4" data-icon="inline-start" />
            {currentTabConfig.addLabel}
          </Button>
        </div>
      </div>

      {/* Content */}
      {emptyState ? (
        emptyState
      ) : currentViewMode === "grid" ? (
        <SupplyGridView items={getGridItems()} onEdit={handleEdit} onDelete={handleDeleteClick} />
      ) : (
        <SupplyTableView
          items={getTableItems()}
          columns={getColumns()}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
        />
      )}

      {/* Create modal */}
      <SupplyFormModal
        key={`create-${activeTab}`}
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        mode="create"
        supplyType={currentTabConfig.supplyType}
        brands={brands}
      />

      {/* Edit modal */}
      <SupplyFormModal
        key={editingItem?.data.id ?? "edit"}
        open={!!editingItem}
        onOpenChange={(open) => {
          if (!open) setEditingItem(null);
        }}
        mode="edit"
        supplyType={editingItem?.type ?? "thread"}
        brands={brands}
        initialData={editingItem?.data}
      />

      {/* Delete confirmation */}
      <DeleteConfirmationDialog
        open={!!deletingItem}
        onOpenChange={(open) => {
          if (!open) setDeletingItem(null);
        }}
        title={`Delete ${deletingItem?.label}?`}
        entityName={deletingItem?.label ?? ""}
        chartCount={0}
        entityType="designer"
        onConfirm={handleDelete}
      />
    </div>
  );
}

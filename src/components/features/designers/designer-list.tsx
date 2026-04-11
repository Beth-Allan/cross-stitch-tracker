"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  ChevronUp,
  ChevronDown,
  ExternalLink,
  Pencil,
  Trash2,
  Users,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DesignerFormModal } from "./designer-form-modal";
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog";
import { deleteDesigner } from "@/lib/actions/designer-actions";
import type { DesignerWithStats } from "@/types/designer";

/* ─── Types ─── */

type SortKey = "name" | "chartCount" | "projectsFinished";
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
      className="cursor-pointer px-4 py-2.5 text-left select-none"
      onClick={() => onSort(sortKey)}
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

/* ─── Main Component ─── */

export function DesignerList({ designers }: { designers: DesignerWithStats[] }) {
  const router = useRouter();
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: "name", dir: "asc" });
  const [search, setSearch] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingDesigner, setEditingDesigner] = useState<DesignerWithStats | null>(null);
  const [deletingDesigner, setDeletingDesigner] = useState<DesignerWithStats | null>(null);

  async function handleDelete() {
    if (!deletingDesigner) return;
    try {
      const result = await deleteDesigner(deletingDesigner.id);
      if (result.success) {
        toast.success("Designer deleted");
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

  const filteredDesigners = useMemo(() => {
    let result = designers;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((d) => d.name.toLowerCase().includes(q));
    }

    result = [...result].sort((a, b) => {
      const dir = sort.dir === "asc" ? 1 : -1;
      switch (sort.key) {
        case "name":
          return dir * a.name.localeCompare(b.name);
        case "chartCount":
          return dir * (a.chartCount - b.chartCount);
        case "projectsFinished":
          // Not available from DesignerWithStats -- sort by chartCount as fallback
          return dir * (a.chartCount - b.chartCount);
        default:
          return 0;
      }
    });

    return result;
  }, [designers, search, sort]);

  const hasActiveFilters = search.length > 0;

  // No designers at all
  if (designers.length === 0) {
    return (
      <div>
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-2xl font-semibold">Designers</h1>
        </div>

        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Users className="text-muted-foreground/40 mb-3 h-12 w-12" />
          <h2 className="font-heading text-lg font-semibold">No designers added yet</h2>
          <p className="text-muted-foreground mt-1.5 max-w-xs text-sm">
            Add your first designer to start organizing your collection.
          </p>
          <Button className="mt-4" onClick={() => setCreateModalOpen(true)}>
            <Plus className="h-4 w-4" data-icon="inline-start" />
            Add Designer
          </Button>
        </div>

        <DesignerFormModal
          open={createModalOpen}
          onOpenChange={setCreateModalOpen}
          designer={null}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold">Designers</h1>
        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus className="h-4 w-4" data-icon="inline-start" />
          Add Designer
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
            placeholder="Search designers..."
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
          <thead>
            <tr className="border-border border-b">
              <SortableHeader
                label="DESIGNER"
                sortKey="name"
                currentSort={sort}
                onSort={handleSort}
              />
              <th className="px-4 py-2.5 text-left">
                <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                  WEB
                </span>
              </th>
              <SortableHeader
                label="CHARTS"
                sortKey="chartCount"
                currentSort={sort}
                onSort={handleSort}
              />
              <th className="px-4 py-2.5 text-left">
                <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                  STARTED
                </span>
              </th>
              <SortableHeader
                label="FINISHED"
                sortKey="projectsFinished"
                currentSort={sort}
                onSort={handleSort}
              />
              <th className="px-4 py-2.5 text-left">
                <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                  TOP GENRE
                </span>
              </th>
              <th className="w-20" />
            </tr>
          </thead>
          <tbody className="divide-border/60 divide-y">
            {filteredDesigners.map((designer) => (
              <DesignerRow
                key={designer.id}
                designer={designer}
                onEdit={() => setEditingDesigner(designer)}
                onDelete={() => setDeletingDesigner(designer)}
              />
            ))}
            {filteredDesigners.length === 0 && (
              <tr>
                <td colSpan={7} className="py-12 text-center">
                  <Users className="text-muted-foreground/40 mx-auto mb-2 h-8 w-8" />
                  <p className="text-muted-foreground text-sm">
                    {hasActiveFilters
                      ? "No designers match your filters"
                      : "No designers added yet"}
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {filteredDesigners.map((designer) => (
          <DesignerCard
            key={designer.id}
            designer={designer}
            onEdit={() => setEditingDesigner(designer)}
            onDelete={() => setDeletingDesigner(designer)}
          />
        ))}
        {filteredDesigners.length === 0 && (
          <div className="py-12 text-center">
            <Users className="text-muted-foreground/40 mx-auto mb-2 h-8 w-8" />
            <p className="text-muted-foreground text-sm">
              {hasActiveFilters ? "No designers match your filters" : "No designers added yet"}
            </p>
          </div>
        )}
      </div>

      {/* Create modal */}
      <DesignerFormModal open={createModalOpen} onOpenChange={setCreateModalOpen} designer={null} />

      {/* Edit modal */}
      <DesignerFormModal
        open={!!editingDesigner}
        onOpenChange={(open) => {
          if (!open) setEditingDesigner(null);
        }}
        designer={editingDesigner}
      />

      {/* Delete confirmation dialog */}
      <DeleteConfirmationDialog
        open={!!deletingDesigner}
        onOpenChange={(open) => {
          if (!open) setDeletingDesigner(null);
        }}
        title="Delete Designer?"
        entityName={deletingDesigner?.name ?? ""}
        chartCount={deletingDesigner?.chartCount ?? 0}
        entityType="designer"
        onConfirm={handleDelete}
      />
    </div>
  );
}

/* ─── Designer Row ─── */

function DesignerRow({
  designer,
  onEdit,
  onDelete,
}: {
  designer: DesignerWithStats;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <tr className="group hover:bg-muted/50 transition-colors">
      <td className="px-4 py-3">
        <Link
          href={`/designers/${designer.id}`}
          className="text-foreground hover:text-primary text-sm font-medium transition-colors"
        >
          {designer.name}
        </Link>
      </td>
      <td className="px-4 py-3">
        {designer.website ? (
          <a
            href={designer.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 inline-flex items-center gap-1 text-sm transition-colors"
            aria-label={`Visit ${designer.name} website`}
          >
            <ExternalLink className="h-3 w-3" />
          </a>
        ) : (
          <span className="text-muted-foreground text-sm">&mdash;</span>
        )}
      </td>
      <td className="px-4 py-3">
        <span className="text-muted-foreground text-sm">{designer.chartCount}</span>
      </td>
      <td className="px-4 py-3">
        <span className="text-muted-foreground text-sm">&mdash;</span>
      </td>
      <td className="px-4 py-3">
        <span className="text-muted-foreground text-sm">&mdash;</span>
      </td>
      <td className="px-4 py-3">
        <span className="text-muted-foreground text-sm">&mdash;</span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1 opacity-40 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
          <button
            type="button"
            onClick={onEdit}
            className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-md p-1.5 transition-colors"
            aria-label={`Edit ${designer.name}`}
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md p-1.5 transition-colors"
            aria-label={`Delete ${designer.name}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}

/* ─── Mobile Card ─── */

function DesignerCard({
  designer,
  onEdit,
  onDelete,
}: {
  designer: DesignerWithStats;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="border-border bg-card rounded-xl border p-4 shadow-sm">
      <div className="mb-2 flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <Link
            href={`/designers/${designer.id}`}
            className="text-foreground hover:text-primary block truncate text-sm font-semibold transition-colors"
          >
            {designer.name}
          </Link>
        </div>
        <div className="ml-2 flex shrink-0 items-center gap-1">
          {designer.website && (
            <a
              href={designer.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:bg-primary/10 rounded-md p-1.5 transition-colors"
              aria-label={`Visit ${designer.name} website`}
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
          <button
            type="button"
            onClick={onEdit}
            className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-md p-1.5 transition-colors"
            aria-label={`Edit ${designer.name}`}
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md p-1.5 transition-colors"
            aria-label={`Delete ${designer.name}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <div className="text-muted-foreground flex items-center gap-4 text-xs">
        <span>{designer.chartCount} charts</span>
      </div>
    </div>
  );
}

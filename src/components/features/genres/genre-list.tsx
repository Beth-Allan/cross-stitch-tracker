"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, ChevronUp, ChevronDown, Pencil, Trash2, Tags, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GenreFormModal } from "./genre-form-modal";
import { DeleteConfirmationDialog } from "@/components/features/designers/delete-confirmation-dialog";
import { deleteGenre } from "@/lib/actions/genre-actions";
import { toast } from "sonner";
import type { GenreWithStats } from "@/types/genre";

/* ---- Types ---- */

type SortKey = "name" | "chartCount";
type SortDir = "asc" | "desc";

/* ---- SortableHeader ---- */

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

/* ---- Genre Row (Desktop) ---- */

function GenreRow({
  genre,
  onEdit,
  onDelete,
}: {
  genre: GenreWithStats;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <tr className="group border-border hover:bg-muted/50 border-b transition-colors">
      <td className="px-4 py-3">
        <Link
          href={`/genres/${genre.id}`}
          className="text-foreground hover:text-primary text-sm font-medium transition-colors"
        >
          {genre.name}
        </Link>
      </td>
      <td className="px-4 py-3">
        <span className="text-muted-foreground text-sm">{genre.chartCount}</span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1 transition-opacity group-focus-within:opacity-100 md:opacity-40 md:group-hover:opacity-100">
          <button
            type="button"
            onClick={onEdit}
            aria-label={`Edit ${genre.name}`}
            className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-md p-1.5 transition-colors"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label={`Delete ${genre.name}`}
            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-md p-1.5 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}

/* ---- Genre Card (Mobile) ---- */

function GenreCard({
  genre,
  onEdit,
  onDelete,
}: {
  genre: GenreWithStats;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="border-border bg-card rounded-xl border p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <Link
            href={`/genres/${genre.id}`}
            className="text-foreground hover:text-primary text-sm font-semibold transition-colors"
          >
            {genre.name}
          </Link>
          <p className="text-muted-foreground mt-1 text-xs">
            {genre.chartCount} {genre.chartCount === 1 ? "chart" : "charts"}
          </p>
        </div>
        <div className="ml-2 flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={onEdit}
            aria-label={`Edit ${genre.name}`}
            className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-md p-1.5 transition-colors"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label={`Delete ${genre.name}`}
            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-md p-1.5 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---- Empty State ---- */

function EmptyState({
  hasSearch,
  onClear,
  onAdd,
}: {
  hasSearch: boolean;
  onClear: () => void;
  onAdd: () => void;
}) {
  if (hasSearch) {
    return (
      <div className="py-12 text-center">
        <Tags className="text-muted-foreground/50 mx-auto mb-2 h-8 w-8" />
        <p className="text-foreground text-sm font-medium">No genres match your search</p>
        <Button variant="ghost" size="sm" onClick={onClear} className="mt-2 text-xs">
          Clear all
        </Button>
      </div>
    );
  }

  return (
    <div className="py-12 text-center">
      <Tags className="text-muted-foreground/40 mx-auto mb-3 h-10 w-10" />
      <p className="text-foreground text-sm font-medium">No genres added yet</p>
      <p className="text-muted-foreground mt-1 text-xs">
        Add your first genre to start organizing your charts.
      </p>
      <Button onClick={onAdd} size="sm" className="mt-4">
        <Plus className="h-4 w-4" />
        Add Genre
      </Button>
    </div>
  );
}

/* ---- Main Component ---- */

interface GenreListProps {
  genres: GenreWithStats[];
}

export function GenreList({ genres }: GenreListProps) {
  const router = useRouter();
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({
    key: "name",
    dir: "asc",
  });
  const [search, setSearch] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingGenre, setEditingGenre] = useState<GenreWithStats | null>(null);
  const [deletingGenre, setDeletingGenre] = useState<GenreWithStats | null>(null);

  function handleSort(key: SortKey) {
    setSort((prev) =>
      prev.key === key ? { key, dir: prev.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" },
    );
  }

  const filteredGenres = useMemo(() => {
    let result = genres;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((g) => g.name.toLowerCase().includes(q));
    }

    result = [...result].sort((a, b) => {
      const dir = sort.dir === "asc" ? 1 : -1;
      if (sort.key === "name") {
        return dir * a.name.localeCompare(b.name);
      }
      return dir * (a.chartCount - b.chartCount);
    });

    return result;
  }, [genres, search, sort]);

  const hasSearch = search.length > 0;

  async function handleDeleteConfirmed() {
    if (!deletingGenre) return;
    try {
      const result = await deleteGenre(deletingGenre.id);
      if (result.success) {
        toast.success("Genre deleted");
        router.refresh();
      } else {
        toast.error(result.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-2xl font-semibold">Genres</h1>
          <Button onClick={() => setCreateModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Genre
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
              placeholder="Search genres..."
              className="pl-9"
            />
          </div>

          {hasSearch && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="text-muted-foreground hover:text-foreground text-xs transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block">
        {filteredGenres.length > 0 ? (
          <div className="border-border bg-card overflow-hidden rounded-xl border">
            <table className="w-full">
              <caption className="sr-only">Your genres and their chart counts</caption>
              <thead>
                <tr className="border-border border-b">
                  <SortableHeader
                    label="GENRE"
                    sortKey="name"
                    currentSort={sort}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label="CHARTS"
                    sortKey="chartCount"
                    currentSort={sort}
                    onSort={handleSort}
                  />
                  <th className="w-20" />
                </tr>
              </thead>
              <tbody>
                {filteredGenres.map((genre) => (
                  <GenreRow
                    key={genre.id}
                    genre={genre}
                    onEdit={() => setEditingGenre(genre)}
                    onDelete={() => setDeletingGenre(genre)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div>
            <EmptyState
              hasSearch={hasSearch}
              onClear={() => setSearch("")}
              onAdd={() => setCreateModalOpen(true)}
            />
          </div>
        )}
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {filteredGenres.length > 0 ? (
          filteredGenres.map((genre) => (
            <GenreCard
              key={genre.id}
              genre={genre}
              onEdit={() => setEditingGenre(genre)}
              onDelete={() => setDeletingGenre(genre)}
            />
          ))
        ) : (
          <EmptyState
            hasSearch={hasSearch}
            onClear={() => setSearch("")}
            onAdd={() => setCreateModalOpen(true)}
          />
        )}
      </div>

      {/* Create modal */}
      <GenreFormModal open={createModalOpen} onOpenChange={setCreateModalOpen} />

      {/* Edit modal */}
      <GenreFormModal
        open={!!editingGenre}
        onOpenChange={(open) => {
          if (!open) setEditingGenre(null);
        }}
        genre={editingGenre}
      />

      {/* Delete confirmation dialog */}
      <DeleteConfirmationDialog
        open={!!deletingGenre}
        onOpenChange={(open) => {
          if (!open) setDeletingGenre(null);
        }}
        title="Delete Genre?"
        entityName={deletingGenre?.name ?? ""}
        chartCount={deletingGenre?.chartCount ?? 0}
        entityType="genre"
        onConfirm={handleDeleteConfirmed}
      />
    </div>
  );
}

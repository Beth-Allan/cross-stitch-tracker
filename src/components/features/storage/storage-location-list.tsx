"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, MapPin, Pencil, Trash2, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { InlineNameEdit } from "./inline-name-edit";
import { DeleteEntityDialog } from "./delete-entity-dialog";
import {
  createStorageLocation,
  updateStorageLocation,
  deleteStorageLocation,
} from "@/lib/actions/storage-location-actions";
import type { StorageLocationWithStats } from "@/types/storage";

interface StorageLocationListProps {
  locations: StorageLocationWithStats[];
}

export function StorageLocationList({ locations }: StorageLocationListProps) {
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
    projectCount: number;
  } | null>(null);
  async function handleCreate(name: string) {
    try {
      const result = await createStorageLocation({ name });
      if (result.success) {
        toast.success("Location created");
        setIsAdding(false);
        router.refresh();
      } else {
        toast.error(result.error ?? "Failed to create location");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  }

  async function handleRename(id: string, newName: string) {
    try {
      const result = await updateStorageLocation(id, { name: newName });
      if (result.success) {
        setEditingId(null);
        router.refresh();
      } else {
        toast.error(result.error ?? "Failed to rename location");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    const result = await deleteStorageLocation(deleteTarget.id);
    if (result.success) {
      toast.success("Location deleted");
      router.refresh();
    } else {
      toast.error(result.error ?? "Failed to delete location");
      throw new Error(result.error ?? "Delete failed");
    }
  }

  return (
    <div className="px-6 pt-6 pb-4">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold">Storage Locations</h1>
        <Button onClick={() => setIsAdding(true)}>
          <Plus className="h-4 w-4" />
          Add Location
        </Button>
      </div>

      {/* List */}
      <div className="space-y-2">
        {/* Inline add row */}
        {isAdding && <InlineAddRow onAdd={handleCreate} onCancel={() => setIsAdding(false)} />}

        {/* Location rows */}
        {locations.map((location) => (
          <LocationRow
            key={location.id}
            location={location}
            isEditing={editingId === location.id}
            onStartEdit={() => setEditingId(location.id)}
            onRename={(newName) => handleRename(location.id, newName)}
            onCancelEdit={() => setEditingId(null)}
            onDelete={() =>
              setDeleteTarget({
                id: location.id,
                name: location.name,
                projectCount: location._count.projects,
              })
            }
            onNavigate={() => router.push(`/storage/${location.id}`)}
          />
        ))}

        {/* Empty state */}
        {locations.length === 0 && !isAdding && (
          <div className="py-16 text-center">
            <MapPin className="text-muted-foreground/50 mx-auto mb-3 h-8 w-8" />
            <p className="text-muted-foreground mb-1 text-sm">No storage locations yet</p>
            <p className="text-muted-foreground text-xs">
              Add locations to organize where your projects and kits are stored
            </p>
          </div>
        )}
      </div>

      {/* Delete dialog */}
      <DeleteEntityDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        entityName={deleteTarget?.name ?? ""}
        projectCount={deleteTarget?.projectCount ?? 0}
        entityType="storage-location"
        onConfirm={handleDelete}
      />
    </div>
  );
}

/* ---- Inline Add Row ---- */

function InlineAddRow({
  onAdd,
  onCancel,
}: {
  onAdd: (name: string) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && name.trim()) {
      onAdd(name.trim());
    } else if (e.key === "Escape") {
      onCancel();
    }
  }

  function handleBlur(e: React.FocusEvent) {
    // Don't cancel if focus moved to another element within this row (e.g. the Add button)
    if (rowRef.current?.contains(e.relatedTarget as Node)) return;
    onCancel();
  }

  return (
    <div
      ref={rowRef}
      className="border-primary/20 bg-primary/5 flex items-center gap-3 rounded-xl border px-4 py-3"
    >
      <MapPin className="text-primary h-4 w-4 shrink-0" />
      <input
        ref={inputRef}
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        aria-label="New location name"
        placeholder="Location name, e.g. Bin A, Bookshelf 2..."
        className="placeholder:text-muted-foreground flex-1 bg-transparent text-sm focus:outline-none"
      />
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          if (name.trim()) onAdd(name.trim());
        }}
        disabled={!name.trim()}
        className="bg-primary text-primary-foreground rounded-md px-3 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40"
      >
        Add
      </button>
    </div>
  );
}

/* ---- Location Row ---- */

function LocationRow({
  location,
  isEditing,
  onStartEdit,
  onRename,
  onCancelEdit,
  onDelete,
  onNavigate,
}: {
  location: StorageLocationWithStats;
  isEditing: boolean;
  onStartEdit: () => void;
  onRename: (newName: string) => Promise<void>;
  onCancelEdit: () => void;
  onDelete: () => void;
  onNavigate: () => void;
}) {
  const projectCount = location._count.projects;

  if (isEditing) {
    return (
      <div className="border-border bg-card rounded-xl border px-4 py-3">
        <InlineNameEdit
          name={location.name}
          onSave={onRename}
          defaultEditing
          onCancel={onCancelEdit}
        />
      </div>
    );
  }

  return (
    <div
      role="button"
      aria-label={`Navigate to ${location.name}`}
      tabIndex={0}
      onClick={onNavigate}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onNavigate();
        }
      }}
      className="group border-border bg-card hover:border-border/80 flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 shadow-sm transition-[box-shadow,border-color] hover:shadow-md"
    >
      {/* Icon badge */}
      <div className="bg-muted flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
        <MapPin className="text-muted-foreground h-4 w-4" />
      </div>

      {/* Name + count */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{location.name}</p>
        <p className="text-muted-foreground text-xs">
          {projectCount === 0
            ? "No projects"
            : `${projectCount} ${projectCount === 1 ? "project" : "projects"}`}
        </p>
      </div>

      {/* Hover actions */}
      <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onStartEdit();
          }}
          className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-md p-1.5 transition-colors"
          aria-label={`Rename ${location.name}`}
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md p-1.5 transition-colors"
          aria-label={`Delete ${location.name}`}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
        <ChevronRight className="text-muted-foreground/40 h-4 w-4 shrink-0" />
      </div>
    </div>
  );
}

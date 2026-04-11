"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Tablet, Pencil, Trash2, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { InlineNameEdit } from "@/components/features/storage/inline-name-edit";
import { DeleteEntityDialog } from "@/components/features/storage/delete-entity-dialog";
import {
  createStitchingApp,
  updateStitchingApp,
  deleteStitchingApp,
} from "@/lib/actions/stitching-app-actions";
import type { StitchingAppWithStats } from "@/types/storage";

interface StitchingAppListProps {
  apps: StitchingAppWithStats[];
}

export function StitchingAppList({ apps }: StitchingAppListProps) {
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
    projectCount: number;
  } | null>(null);
  const [, startTransition] = useTransition();

  async function handleCreate(name: string) {
    try {
      const result = await createStitchingApp({ name });
      if (result.success) {
        toast.success("App created");
        setIsAdding(false);
        router.refresh();
      } else {
        toast.error(result.error ?? "Failed to create app");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  }

  async function handleRename(id: string, newName: string) {
    try {
      const result = await updateStitchingApp(id, { name: newName });
      if (result.success) {
        setEditingId(null);
        router.refresh();
      } else {
        toast.error(result.error ?? "Failed to rename app");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      const result = await deleteStitchingApp(deleteTarget.id);
      if (result.success) {
        toast.success("App deleted");
        router.refresh();
      } else {
        toast.error(result.error ?? "Failed to delete app");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  }

  return (
    <div className="px-6 pt-6 pb-4">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold">Stitching Apps</h1>
        <Button onClick={() => setIsAdding(true)}>
          <Plus className="h-4 w-4" />
          Add App
        </Button>
      </div>

      {/* List */}
      <div className="space-y-2">
        {/* Inline add row */}
        {isAdding && <InlineAddRow onAdd={handleCreate} onCancel={() => setIsAdding(false)} />}

        {/* App rows */}
        {apps.map((app) => (
          <AppRow
            key={app.id}
            app={app}
            isEditing={editingId === app.id}
            onStartEdit={() => setEditingId(app.id)}
            onRename={(newName) => handleRename(app.id, newName)}
            onCancelEdit={() => setEditingId(null)}
            onDelete={() =>
              setDeleteTarget({
                id: app.id,
                name: app.name,
                projectCount: app._count.projects,
              })
            }
            onNavigate={() => router.push(`/apps/${app.id}`)}
          />
        ))}

        {/* Empty state */}
        {apps.length === 0 && !isAdding && (
          <div className="py-16 text-center">
            <Tablet className="text-muted-foreground/50 mx-auto mb-3 h-8 w-8" />
            <p className="text-muted-foreground mb-1 text-sm">No stitching apps yet</p>
            <p className="text-muted-foreground text-xs">
              Add apps you use for digital pattern viewing and markup
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
        entityType="stitching-app"
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

  return (
    <div className="border-primary/20 bg-primary/5 flex items-center gap-3 rounded-xl border px-4 py-3">
      <Tablet className="text-primary h-4 w-4 shrink-0" />
      <input
        ref={inputRef}
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={onCancel}
        placeholder="App name, e.g. Markup R-XP, Pattern Keeper..."
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

/* ---- App Row ---- */

function AppRow({
  app,
  isEditing,
  onStartEdit,
  onRename,
  onCancelEdit,
  onDelete,
  onNavigate,
}: {
  app: StitchingAppWithStats;
  isEditing: boolean;
  onStartEdit: () => void;
  onRename: (newName: string) => Promise<void>;
  onCancelEdit: () => void;
  onDelete: () => void;
  onNavigate: () => void;
}) {
  const projectCount = app._count.projects;

  if (isEditing) {
    return (
      <div className="border-border bg-card rounded-xl border px-4 py-3">
        <InlineNameEdit name={app.name} onSave={onRename} defaultEditing onCancel={onCancelEdit} />
      </div>
    );
  }

  return (
    <div
      role="button"
      aria-label={`Navigate to ${app.name}`}
      tabIndex={0}
      onClick={onNavigate}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onNavigate();
        }
      }}
      className="group border-border bg-card hover:border-border/80 flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 shadow-sm transition-all hover:shadow-md"
    >
      {/* Icon badge */}
      <div className="bg-muted flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
        <Tablet className="text-muted-foreground h-4 w-4" />
      </div>

      {/* Name + count */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{app.name}</p>
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
          aria-label={`Rename ${app.name}`}
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
          aria-label={`Delete ${app.name}`}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
        <ChevronRight className="text-muted-foreground/40 h-4 w-4 shrink-0" />
      </div>
    </div>
  );
}

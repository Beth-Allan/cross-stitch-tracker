"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Pencil, Trash2, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { StatusBadge } from "@/components/features/charts/status-badge";
import { InlineNameEdit } from "./inline-name-edit";
import { DeleteEntityDialog } from "./delete-entity-dialog";
import {
  updateStorageLocation,
  deleteStorageLocation,
} from "@/lib/actions/storage-location-actions";
import type { StorageLocationDetail as StorageLocationDetailType } from "@/types/storage";
import type { ProjectStatus } from "@/generated/prisma/client";

interface StorageLocationDetailProps {
  location: StorageLocationDetailType;
}

export function StorageLocationDetail({ location }: StorageLocationDetailProps) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  async function handleRename(newName: string) {
    try {
      const result = await updateStorageLocation(location.id, { name: newName });
      if (result.success) {
        router.refresh();
      } else {
        toast.error(result.error ?? "Failed to rename location");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  }

  async function handleDelete() {
    try {
      const result = await deleteStorageLocation(location.id);
      if (result.success) {
        toast.success("Location deleted");
        router.push("/storage");
      } else {
        toast.error(result.error ?? "Failed to delete location");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  }

  return (
    <div className="px-6 pt-6 pb-4">
      {/* Back link */}
      <Link
        href="/storage"
        className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1.5 text-sm transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        All Locations
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {/* Icon badge */}
          <div className="bg-muted flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
            <MapPin className="text-muted-foreground h-5 w-5" />
          </div>

          {/* Name + count */}
          <div>
            <InlineNameEdit name={location.name} onSave={handleRename} variant="heading" />
            <p className="text-muted-foreground text-sm">
              {location.projects.length} {location.projects.length === 1 ? "project" : "projects"}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => setDeleteDialogOpen(true)}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md p-1.5 transition-colors"
            aria-label="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Project list */}
      <div className="mt-6 space-y-2">
        {location.projects.map((project) => (
          <Link
            key={project.id}
            href={`/charts/${project.chart.id}`}
            className="group border-border bg-card flex items-center gap-4 rounded-xl border px-4 py-3 shadow-sm transition-all hover:shadow-md"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{project.chart.name}</p>
              {project.fabric ? (
                <p className="text-muted-foreground mt-0.5 truncate text-xs">
                  {project.fabric.name} {project.fabric.count}ct {project.fabric.type}
                </p>
              ) : (
                <p className="text-muted-foreground mt-0.5 text-xs italic">No fabric assigned</p>
              )}
            </div>

            <StatusBadge status={project.status as ProjectStatus} />

            <ChevronRight className="text-muted-foreground/40 h-4 w-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
          </Link>
        ))}

        {/* Empty state */}
        {location.projects.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-muted-foreground mb-1 text-sm">No projects in this location</p>
            <p className="text-muted-foreground text-xs">
              Assign projects to this location from the chart form
            </p>
          </div>
        )}
      </div>

      {/* Delete dialog */}
      <DeleteEntityDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        entityName={location.name}
        projectCount={location.projects.length}
        entityType="storage-location"
        onConfirm={handleDelete}
      />
    </div>
  );
}

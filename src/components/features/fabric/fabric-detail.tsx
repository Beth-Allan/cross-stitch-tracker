"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import { FabricSizeCalculator } from "./fabric-size-calculator";
import { deleteFabric } from "@/lib/actions/fabric-actions";
import type { FabricWithProject, FabricBrandWithCounts } from "@/types/fabric";

interface FabricDetailProps {
  fabric: FabricWithProject;
  fabricBrands: FabricBrandWithCounts[];
  projects: Array<{ id: string; chartName: string }>;
}

export function FabricDetail({ fabric, fabricBrands, projects }: FabricDetailProps) {
  const router = useRouter();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const hasDimensions = fabric.shortestEdgeInches > 0 && fabric.longestEdgeInches > 0;

  async function handleDelete() {
    try {
      const result = await deleteFabric(fabric.id);
      if (result.success) {
        toast.success("Fabric deleted");
        router.push("/fabric");
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
      {/* Breadcrumb */}
      <nav className="text-muted-foreground flex items-center gap-1 text-sm">
        <Link href="/fabric" className="hover:text-foreground transition-colors">
          Fabric
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium">{fabric.name}</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold">{fabric.name}</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">
            {fabric.brand.name} &middot; {fabric.count}ct {fabric.type}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setEditModalOpen(true)}>
            <Pencil className="h-3.5 w-3.5" data-icon="inline-start" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDeleteDialogOpen(true)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" data-icon="inline-start" />
            Delete
          </Button>
        </div>
      </div>

      {/* Metadata Grid */}
      <div className="border-border bg-card rounded-xl border p-6">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
          <MetadataField label="Brand">{fabric.brand.name}</MetadataField>
          <MetadataField label="Count">{fabric.count}ct</MetadataField>
          <MetadataField label="Type">{fabric.type}</MetadataField>
          <MetadataField label="Colour Family">{fabric.colorFamily}</MetadataField>
          <MetadataField label="Colour Type">{fabric.colorType}</MetadataField>
          <MetadataField label="Dimensions">
            {hasDimensions ? (
              <span>
                {fabric.shortestEdgeInches}&quot; x {fabric.longestEdgeInches}&quot;
              </span>
            ) : (
              <span className="text-muted-foreground italic">Not measured</span>
            )}
          </MetadataField>
          <MetadataField label="Need to Buy">
            {fabric.needToBuy ? (
              <Badge className="border-warning-border bg-warning-muted text-warning-muted-foreground">
                Yes
              </Badge>
            ) : (
              <Badge className="border-success-border bg-success-muted text-success-muted-foreground">
                No
              </Badge>
            )}
          </MetadataField>
          <MetadataField label="Linked Project">
            {fabric.linkedProject ? (
              <Link
                href={`/charts/${fabric.linkedProject.chart.id}`}
                className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
              >
                {fabric.linkedProject.chart.name}
              </Link>
            ) : (
              <span className="text-muted-foreground">Unassigned</span>
            )}
          </MetadataField>
        </div>

        {/* Size Calculator */}
        {fabric.linkedProject && (
          <FabricSizeCalculator
            fabric={{
              count: fabric.count,
              shortestEdgeInches: fabric.shortestEdgeInches,
              longestEdgeInches: fabric.longestEdgeInches,
            }}
            project={{
              stitchesWide: fabric.linkedProject.chart.stitchesWide,
              stitchesHigh: fabric.linkedProject.chart.stitchesHigh,
            }}
          />
        )}
      </div>

      {/* Edit Modal */}
      <FabricFormModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        fabric={fabric}
        fabricBrands={fabricBrands}
        projects={projects}
      />

      {/* Delete Confirmation */}
      <FabricDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        fabricName={fabric.name}
        onConfirm={handleDelete}
      />
    </div>
  );
}

/* ─── Metadata Field ─── */

function MetadataField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
        {label}
      </p>
      <div className="text-foreground mt-1 text-sm">{children}</div>
    </div>
  );
}

/* ─── Delete Dialog ─── */

function FabricDeleteDialog({
  open,
  onOpenChange,
  fabricName,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fabricName: string;
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
            {`Delete "${fabricName}"? This will unlink it from its project.`}
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

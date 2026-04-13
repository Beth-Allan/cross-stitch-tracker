"use client";

import { useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteEntityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityName: string;
  projectCount: number;
  entityType: "storage-location" | "stitching-app";
  onConfirm: () => Promise<void>;
}

export function DeleteEntityDialog({
  open,
  onOpenChange,
  entityName,
  projectCount,
  entityType,
  onConfirm,
}: DeleteEntityDialogProps) {
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      try {
        await onConfirm();
        onOpenChange(false);
      } catch (err) {
        // onConfirm caller handles error reporting (toast);
        // dialog stays open so user can retry
        console.error("DeleteEntityDialog confirm failed:", err);
      }
    });
  }

  function getTitle() {
    return entityType === "storage-location" ? "Delete Storage Location" : "Delete Stitching App";
  }

  function getDescription() {
    if (entityType === "storage-location") {
      if (projectCount === 0) {
        return `This will remove "${entityName}" from your locations. No projects are assigned to this location.`;
      }
      return `This will remove "${entityName}" from your locations. ${projectCount} project(s) will be unlinked from this storage location. Projects will NOT be deleted.`;
    }

    // stitching-app
    if (projectCount === 0) {
      return `This will remove "${entityName}" from your apps. No projects are using this app.`;
    }
    return `This will remove "${entityName}" from your apps. ${projectCount} project(s) will be unlinked from this app. Projects will NOT be deleted.`;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-heading text-lg font-semibold">{getTitle()}</DialogTitle>
          <DialogDescription>{getDescription()}</DialogDescription>
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

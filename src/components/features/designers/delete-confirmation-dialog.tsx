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

interface DeleteConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  entityName: string;
  chartCount: number;
  entityType: "designer" | "genre" | "brand" | "supply";
  onConfirm: () => Promise<void>;
}

export function DeleteConfirmationDialog({
  open,
  onOpenChange,
  title,
  entityName,
  chartCount,
  entityType,
  onConfirm,
}: DeleteConfirmationDialogProps) {
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      try {
        await onConfirm();
        onOpenChange(false);
      } catch {
        // onConfirm caller handles error reporting (toast);
        // dialog stays open so user can retry
      }
    });
  }

  function getDescription() {
    switch (entityType) {
      case "designer":
        return `This will remove "${entityName}" from your collection. ${chartCount} chart(s) will be unlinked from this designer. Charts will NOT be deleted.`;
      case "genre":
        return `This will remove the "${entityName}" tag from your collection. ${chartCount} chart(s) will lose this genre tag. Charts will NOT be deleted.`;
      case "brand":
        return `This will remove "${entityName}" from your brands. ${chartCount} supply item(s) from this brand will also be deleted.`;
      case "supply":
        return `This will permanently delete "${entityName}" from your supply catalog.`;
    }
  }

  const description = getDescription();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-heading text-lg font-semibold">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
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

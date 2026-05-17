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

interface DeleteFileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filename: string;
  onConfirm: () => Promise<void>;
}

export function DeleteFileDialog({
  open,
  onOpenChange,
  filename,
  onConfirm,
}: DeleteFileDialogProps) {
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      try {
        await onConfirm();
        onOpenChange(false);
      } catch {
        // Caller handles error reporting; dialog stays open for retry
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-heading text-lg font-semibold">
            Remove Working Copy
          </DialogTitle>
          <DialogDescription>
            This will permanently delete &ldquo;{filename}&rdquo; from this chart. This action
            cannot be undone.
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
            {isPending ? "Deleting..." : "Delete File"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

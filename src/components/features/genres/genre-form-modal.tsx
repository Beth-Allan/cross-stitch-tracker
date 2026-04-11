"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/features/charts/form-primitives/form-field";
import { createGenre, updateGenre } from "@/lib/actions/genre-actions";
import { toast } from "sonner";
import type { GenreWithStats } from "@/types/genre";

interface GenreFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  genre?: GenreWithStats | null;
  onSuccess?: () => void;
}

export function GenreFormModal({ open, onOpenChange, genre, onSuccess }: GenreFormModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isEditMode = !!genre;

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setName(genre?.name ?? "");
      setError(null);
    }
  }, [open, genre]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Genre name is required");
      return;
    }

    startTransition(async () => {
      try {
        const result = isEditMode
          ? await updateGenre(genre.id, { name: trimmedName })
          : await createGenre({ name: trimmedName });

        if (result.success) {
          toast.success(isEditMode ? "Genre updated" : "Genre created");
          onSuccess?.();
          onOpenChange(false);
          router.refresh();
        } else {
          setError(result.error);
        }
      } catch {
        toast.error("Something went wrong. Please try again.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Genre" : "Add Genre"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Name" htmlFor="genre-name" required error={error ?? undefined}>
            <Input
              id="genre-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g. Landscape"
              autoFocus
            />
          </FormField>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isEditMode
                ? isPending
                  ? "Saving..."
                  : "Save Changes"
                : isPending
                  ? "Adding..."
                  : "Add Genre"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

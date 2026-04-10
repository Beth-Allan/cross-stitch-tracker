"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/features/charts/form-primitives/form-field";
import { createDesigner, updateDesigner } from "@/lib/actions/designer-actions";
import type { DesignerWithStats } from "@/types/designer";

interface DesignerFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  designer?: DesignerWithStats | null;
  onSuccess?: () => void;
}

export function DesignerFormModal({
  open,
  onOpenChange,
  designer,
  onSuccess,
}: DesignerFormModalProps) {
  const router = useRouter();
  const isEditing = !!designer;
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [notes, setNotes] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);

  // Reset form when dialog opens or designer changes
  useEffect(() => {
    if (open) {
      if (designer) {
        setName(designer.name);
        setWebsite(designer.website ?? "");
        setNotes(designer.notes ?? "");
      } else {
        setName("");
        setWebsite("");
        setNotes("");
      }
      setNameError(null);
    }
  }, [open, designer]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      setNameError("Designer name is required");
      return;
    }
    setNameError(null);

    const formData = {
      name: trimmedName,
      website: website.trim() || null,
      notes: notes.trim() || null,
    };

    startTransition(async () => {
      try {
        const result = isEditing
          ? await updateDesigner(designer.id, formData)
          : await createDesigner(formData);

        if (result.success) {
          toast.success(isEditing ? "Designer updated" : "Designer created");
          onSuccess?.();
          router.refresh();
          onOpenChange(false);
        } else {
          // Duplicate name error shows inline below field
          if (result.error?.includes("already exists")) {
            setNameError(result.error);
          } else {
            toast.error(result.error ?? "Something went wrong. Please try again.");
          }
        }
      } catch {
        toast.error("Something went wrong. Please try again.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-lg font-semibold">
            {isEditing ? "Edit Designer" : "Add Designer"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            label="Name"
            htmlFor="designer-name"
            required
            error={nameError ?? undefined}
          >
            <Input
              id="designer-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Heaven and Earth Designs"
              autoFocus
            />
          </FormField>

          <FormField label="Website" htmlFor="designer-website">
            <Input
              id="designer-website"
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://example.com"
            />
          </FormField>

          <FormField label="Notes" htmlFor="designer-notes">
            <Textarea
              id="designer-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder='Optional personal reference (e.g., "Only sells through distributors")'
              maxLength={5000}
              rows={3}
            />
          </FormField>

          <p className="text-muted-foreground text-xs">
            Chart count, genre, and project stats are calculated automatically from your projects.
          </p>

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
              {isPending
                ? isEditing
                  ? "Saving..."
                  : "Adding..."
                : isEditing
                  ? "Save Changes"
                  : "Add Designer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

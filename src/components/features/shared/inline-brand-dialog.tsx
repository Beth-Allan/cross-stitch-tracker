"use client";

import { useState } from "react";
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

interface InlineBrandDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialName?: string;
  onSubmit: (name: string, website?: string) => Promise<void>;
}

export function InlineBrandDialog({
  open,
  onOpenChange,
  initialName = "",
  onSubmit,
}: InlineBrandDialogProps) {
  const [name, setName] = useState(initialName);
  const [website, setWebsite] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  // Sync initialName when dialog opens
  const prevOpenRef = useState({ value: false })[0];
  if (open && !prevOpenRef.value) {
    setName(initialName);
  }
  prevOpenRef.value = open;

  const reset = () => {
    setName("");
    setWebsite("");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Brand name is required");
      return;
    }

    setIsPending(true);
    setError(null);
    try {
      await onSubmit(trimmedName, website.trim() || undefined);
      reset();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create brand");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        onOpenChange(isOpen);
        if (!isOpen) reset();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Brand</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Name" htmlFor="brand-name" required error={error ?? undefined}>
            <Input
              id="brand-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Brand name"
              autoFocus
            />
          </FormField>
          <FormField label="Website" htmlFor="brand-website" hint="Optional">
            <Input
              id="brand-website"
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://..."
            />
          </FormField>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Adding..." : "Add Brand"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

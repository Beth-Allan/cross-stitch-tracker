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
import { createSeries } from "@/lib/actions/series-actions";

interface SeriesFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SeriesFormModal({ open, onOpenChange }: SeriesFormModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState("");
  const [totalCount, setTotalCount] = useState("");
  const [notes, setNotes] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setName("");
      setTotalCount("");
      setNotes("");
      setNameError(null);
    }
  }, [open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      setNameError("Series name is required");
      return;
    }
    setNameError(null);

    const parsedTotalCount = totalCount.trim() ? parseInt(totalCount.trim(), 10) : null;

    const formData = {
      name: trimmedName,
      totalCount:
        parsedTotalCount !== null && !isNaN(parsedTotalCount) && parsedTotalCount > 0
          ? parsedTotalCount
          : null,
      designerId: null,
      notes: notes.trim() || null,
    };

    startTransition(async () => {
      try {
        const result = await createSeries(formData);

        if (result.success) {
          toast.success("Series created");
          router.refresh();
          onOpenChange(false);
        } else {
          if (result.error?.includes("already exists")) {
            setNameError(result.error);
          } else {
            toast.error("Couldn't create series. Please try again.");
          }
        }
      } catch (error) {
        console.error("SeriesFormModal create failed:", error);
        toast.error("Couldn't create series. Please try again.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-lg font-semibold">Add Series</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Name" htmlFor="series-name" required error={nameError ?? undefined}>
            <Input
              id="series-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Mini Bottles"
              autoFocus
            />
          </FormField>

          <FormField label="Total Count" htmlFor="series-total-count">
            <Input
              id="series-total-count"
              type="number"
              min={1}
              value={totalCount}
              onChange={(e) => setTotalCount(e.target.value)}
              placeholder="Total charts in series"
            />
          </FormField>

          <FormField label="Notes" htmlFor="series-notes">
            <Textarea
              id="series-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any notes about this series"
              maxLength={5000}
              rows={3}
            />
          </FormField>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Never mind
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating..." : "Create Series"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

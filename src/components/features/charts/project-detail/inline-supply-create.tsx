"use client";

import { useState, useTransition, useEffect, useRef } from "react";
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
import { FormField } from "@/components/features/charts/form-primitives/form-field";
import {
  createAndAddThread,
  createAndAddBead,
  createAndAddSpecialty,
} from "@/lib/actions/supply-actions";

// ─── Types ────────────────────────────────────────────────────────────────────

interface InlineSupplyCreateProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "thread" | "bead" | "specialty";
  projectId: string;
  searchText: string;
  onCreated: () => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TITLE_MAP: Record<InlineSupplyCreateProps["type"], string> = {
  thread: "Add New Thread",
  bead: "Add New Bead",
  specialty: "Add New Item",
};

const ACTION_MAP = {
  thread: createAndAddThread,
  bead: createAndAddBead,
  specialty: createAndAddSpecialty,
} as const;

// ─── Component ────────────────────────────────────────────────────────────────

export function InlineSupplyCreate({
  open,
  onOpenChange,
  type,
  projectId,
  searchText,
  onCreated,
}: InlineSupplyCreateProps) {
  const [name, setName] = useState(searchText);
  const [colorCode, setColorCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Sync name when dialog opens with new searchText
  const prevOpenRef = useRef(false);
  useEffect(() => {
    if (open && !prevOpenRef.current) {
      setName(searchText);
      setColorCode("");
      setError(null);
    }
    prevOpenRef.current = open;
  }, [open, searchText]);

  // Focus name input on open
  useEffect(() => {
    if (open) {
      // Small delay to allow dialog animation to complete
      const timer = setTimeout(() => {
        nameInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Name is required");
      return;
    }

    setError(null);

    startTransition(async () => {
      try {
        const action = ACTION_MAP[type];

        // Build the form data based on supply type
        const formData: Record<string, unknown> = {
          projectId,
          name: trimmedName,
        };

        if (type === "thread") {
          formData.colorCode = colorCode.trim() || undefined;
          // createAndAddThread requires brandId -- use a placeholder brand
          // The user will need to have a brand set up; for now pass through
          formData.brandId = "default";
        } else {
          formData.code = colorCode.trim() || undefined;
          formData.brandId = "default";
        }

        const result = await action(formData);

        if (result.success) {
          toast.success(`Added ${trimmedName}`);
          onCreated();
        } else {
          toast.error(result.error ?? "Something went wrong. Please try again.");
          // Dialog stays open on error (retry-able)
        }
      } catch {
        toast.error("Something went wrong. Please try again.");
        // Dialog stays open on error (retry-able)
      }
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        onOpenChange(isOpen);
        if (!isOpen) {
          setName("");
          setColorCode("");
          setError(null);
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{TITLE_MAP[type]}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Name" htmlFor="supply-name" required error={error ?? undefined}>
            <Input
              ref={nameInputRef}
              id="supply-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Enter name"
              aria-label="Name"
            />
          </FormField>

          {type === "thread" && (
            <FormField label="Color Code" htmlFor="supply-color-code">
              <Input
                id="supply-color-code"
                value={colorCode}
                onChange={(e) => setColorCode(e.target.value)}
                placeholder="e.g., CUSTOM-01"
              />
            </FormField>
          )}

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
              {isPending ? "Adding..." : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

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
import { FormField } from "@/components/features/charts/form-primitives/form-field";
import {
  createSupplyBrand,
  updateSupplyBrand,
} from "@/lib/actions/supply-actions";
import { SUPPLY_TYPES } from "@/types/supply";
import type { SupplyBrandWithCounts } from "@/types/supply";

/* ─── Types ─────────────────────────────────────────────────────────────────── */

interface SupplyBrandFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brand?: SupplyBrandWithCounts | null;
  onSuccess?: () => void;
}

/* ─── Display Labels ────────────────────────────────────────────────────────── */

const SUPPLY_TYPE_DISPLAY: Record<string, string> = {
  THREAD: "Thread",
  BEAD: "Bead",
  SPECIALTY: "Specialty",
};

/* ─── Component ─────────────────────────────────────────────────────────────── */

export function SupplyBrandFormModal({
  open,
  onOpenChange,
  brand,
  onSuccess,
}: SupplyBrandFormModalProps) {
  const router = useRouter();
  const isEditing = !!brand;
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [supplyType, setSupplyType] = useState("THREAD");
  const [nameError, setNameError] = useState<string | null>(null);

  // Reset form when dialog opens or brand changes
  useEffect(() => {
    if (open) {
      if (brand) {
        setName(brand.name);
        setWebsite(brand.website ?? "");
        setSupplyType(brand.supplyType);
      } else {
        setName("");
        setWebsite("");
        setSupplyType("THREAD");
      }
      setNameError(null);
    }
  }, [open, brand]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      setNameError("Brand name is required");
      return;
    }
    setNameError(null);

    const formData = {
      name: trimmedName,
      website: website.trim() || null,
      supplyType,
    };

    startTransition(async () => {
      try {
        const result = isEditing
          ? await updateSupplyBrand(brand.id, formData)
          : await createSupplyBrand(formData);

        if (result.success) {
          toast.success(isEditing ? "Brand updated" : "Brand created");
          onSuccess?.();
          router.refresh();
          onOpenChange(false);
        } else {
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
            {isEditing ? "Edit Brand" : "Add Brand"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            label="Name"
            htmlFor="brand-name"
            required
            error={nameError ?? undefined}
          >
            <Input
              id="brand-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., DMC"
              autoFocus
            />
          </FormField>

          <FormField label="Website" htmlFor="brand-website">
            <Input
              id="brand-website"
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://example.com"
            />
          </FormField>

          <FormField label="Supply Type" htmlFor="brand-supply-type" required>
            <select
              id="brand-supply-type"
              value={supplyType}
              onChange={(e) => setSupplyType(e.target.value)}
              className="border-input bg-background ring-offset-background focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            >
              {SUPPLY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {SUPPLY_TYPE_DISPLAY[t]}
                </option>
              ))}
            </select>
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
              {isPending
                ? isEditing
                  ? "Saving..."
                  : "Adding..."
                : isEditing
                  ? "Save Changes"
                  : "Add Brand"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

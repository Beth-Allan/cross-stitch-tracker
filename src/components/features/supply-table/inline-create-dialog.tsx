"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DEFAULT_SUPPLY_HEX } from "@/lib/constants";
import { COLOR_FAMILIES, COLOR_FAMILY_LABELS, type ColorFamily } from "@/types/supply";
import type { SupplyType, CreateSupplyData } from "./types";

const LABEL_MAP: Record<
  SupplyType,
  {
    title: string;
    nameLabel: string;
    namePlaceholder: string;
    codeLabel: string;
    codePlaceholder: string;
  }
> = {
  THREAD: {
    title: "Create Thread",
    nameLabel: "Color Name",
    namePlaceholder: "e.g. Christmas Red",
    codeLabel: "Color Code",
    codePlaceholder: "e.g. 321 (optional)",
  },
  BEAD: {
    title: "Create Bead",
    nameLabel: "Bead Name",
    namePlaceholder: "e.g. Glass Seed Bead",
    codeLabel: "Product Code",
    codePlaceholder: "e.g. 02013 (optional)",
  },
  SPECIALTY: {
    title: "Create Specialty Item",
    nameLabel: "Product Name",
    namePlaceholder: "e.g. Kreinik Braid",
    codeLabel: "Product Code",
    codePlaceholder: "e.g. 002HL (optional)",
  },
};

interface FieldError {
  field: "name" | "colorFamily";
  message: string;
}

interface InlineCreateDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateSupplyData) => void;
  supplyType: SupplyType;
  defaultCode?: string;
  /** Brand ID used when creating the supply. Falls back to "default" if not provided. */
  defaultBrandId?: string;
}

export function InlineCreateDialog({
  open,
  onClose,
  onSubmit,
  supplyType,
  defaultCode,
  defaultBrandId = "default",
}: InlineCreateDialogProps) {
  const [name, setName] = useState("");
  const [code, setCode] = useState(defaultCode ?? "");
  const [colorFamily, setColorFamily] = useState<ColorFamily | "">("");
  const [error, setError] = useState<FieldError | null>(null);

  // Specialty items carry no colour family, so there is nothing to ask them for
  const needsColorFamily = supplyType !== "SPECIALTY";

  // Reset form fields when dialog opens
  useEffect(() => {
    if (open) {
      setName("");
      setCode(defaultCode ?? "");
      setColorFamily("");
      setError(null);
    }
  }, [open, defaultCode]);

  function handleSubmit() {
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError({ field: "name", message: "Name is required" });
      return;
    }
    // Reachable by Enter only -- the button is disabled -- but a silent no-op is worse
    if (needsColorFamily && !colorFamily) {
      setError({ field: "colorFamily", message: "Choose a color family" });
      return;
    }

    setError(null);
    onSubmit({
      name: trimmedName,
      code: code.trim() || undefined,
      brandId: defaultBrandId,
      hexColor: DEFAULT_SUPPLY_HEX,
      ...(colorFamily ? { colorFamily } : {}),
    });
  }

  const labels = LABEL_MAP[supplyType];
  const typeLabel =
    supplyType === "THREAD" ? "thread" : supplyType === "BEAD" ? "bead" : "specialty item";

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{labels.title}</DialogTitle>
          <DialogDescription>Create a new {typeLabel} and add it to the table.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <div>
            <label
              htmlFor="inline-create-name"
              className="text-foreground mb-1 block text-sm font-medium"
            >
              {labels.nameLabel}
            </label>
            <Input
              id="inline-create-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error?.field === "name") setError(null);
              }}
              placeholder={labels.namePlaceholder}
              aria-invalid={error?.field === "name"}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
            {error?.field === "name" && (
              <p className="text-destructive mt-1 text-xs">{error.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="inline-create-code"
              className="text-foreground mb-1 block text-sm font-medium"
            >
              {labels.codeLabel}
            </label>
            <Input
              id="inline-create-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={labels.codePlaceholder}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
          </div>

          {needsColorFamily && (
            <div>
              <label
                htmlFor="inline-create-color-family"
                className="text-foreground mb-1 block text-sm font-medium"
              >
                Color Family
              </label>
              <select
                id="inline-create-color-family"
                value={colorFamily}
                onChange={(e) => {
                  setColorFamily(e.target.value as ColorFamily);
                  if (error?.field === "colorFamily") setError(null);
                }}
                aria-invalid={error?.field === "colorFamily"}
                className="border-input bg-background ring-offset-background focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                <option value="">Choose a family...</option>
                {COLOR_FAMILIES.map((f) => (
                  <option key={f} value={f}>
                    {COLOR_FAMILY_LABELS[f]}
                  </option>
                ))}
              </select>
              {error?.field === "colorFamily" && (
                <p className="text-destructive mt-1 text-xs">{error.message}</p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={needsColorFamily && !colorFamily}
            className="disabled:opacity-40"
          >
            Create &amp; Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

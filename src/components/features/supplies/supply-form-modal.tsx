"use client";

import { useState, useTransition } from "react";
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
import {
  createThread,
  updateThread,
  createBead,
  updateBead,
  createSpecialtyItem,
  updateSpecialtyItem,
  createSupplyBrand,
} from "@/lib/actions/supply-actions";
import { ColorSwatch } from "./color-swatch";
import type { SupplyBrand, ColorFamily } from "@/generated/prisma/client";
import { COLOR_FAMILIES } from "@/types/supply";

/* ─── Types ─────────────────────────────────────────────────────────────────── */

interface ThreadInitialData {
  id: string;
  brandId: string;
  colorCode: string;
  colorName: string;
  hexColor: string;
  colorFamily: string;
}

interface BeadInitialData {
  id: string;
  brandId: string;
  productCode: string;
  colorName: string;
  hexColor: string;
  colorFamily: string;
}

interface SpecialtyInitialData {
  id: string;
  brandId: string;
  productCode: string;
  colorName: string;
  description?: string;
  hexColor: string;
}

export type InitialData = ThreadInitialData | BeadInitialData | SpecialtyInitialData;

interface SupplyFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  supplyType: "thread" | "bead" | "specialty";
  brands: SupplyBrand[];
  initialData?: InitialData;
  onSuccess?: () => void;
}

/* ─── Labels ────────────────────────────────────────────────────────────────── */

const SUBMIT_LABELS: Record<string, Record<string, string>> = {
  create: { thread: "Add Thread", bead: "Add Bead", specialty: "Add Item" },
  edit: { thread: "Save Changes", bead: "Save Changes", specialty: "Save Changes" },
};

const TITLE_LABELS: Record<string, Record<string, string>> = {
  create: { thread: "Add Thread", bead: "Add Bead", specialty: "Add Specialty Item" },
  edit: { thread: "Edit Thread", bead: "Edit Bead", specialty: "Edit Specialty Item" },
};

/* ─── Color Family Display ──────────────────────────────────────────────────── */

const COLOR_FAMILY_DISPLAY: Record<string, string> = {
  BLACK: "Black",
  WHITE: "White",
  RED: "Red",
  ORANGE: "Orange",
  YELLOW: "Yellow",
  GREEN: "Green",
  BLUE: "Blue",
  PURPLE: "Purple",
  BROWN: "Brown",
  GRAY: "Gray",
  NEUTRAL: "Neutral",
};

/* ─── Component ─────────────────────────────────────────────────────────────── */

export function SupplyFormModal({
  open,
  onOpenChange,
  mode,
  supplyType,
  brands,
  initialData,
  onSuccess,
}: SupplyFormModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Form state — initialized from props; parent uses key prop to remount on edit
  const initCode = initialData
    ? "colorCode" in initialData
      ? initialData.colorCode
      : "productCode" in initialData
        ? initialData.productCode
        : ""
    : "";
  const [brandId, setBrandId] = useState(initialData?.brandId ?? brands[0]?.id ?? "");
  const [code, setCode] = useState(initCode);
  const [colorName, setColorName] = useState(initialData?.colorName ?? "");
  const [hexColor, setHexColor] = useState(initialData?.hexColor ?? "#666666");
  const [colorFamily, setColorFamily] = useState<ColorFamily>(
    initialData && "colorFamily" in initialData ? (initialData.colorFamily as ColorFamily) : "GRAY",
  );
  const [description, setDescription] = useState(
    initialData && "description" in initialData ? (initialData.description ?? "") : "",
  );

  // Inline brand creation state
  const [localBrands, setLocalBrands] = useState(brands);
  const [isAddingBrand, setIsAddingBrand] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");
  const [isCreatingBrand, setIsCreatingBrand] = useState(false);

  // Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleAddBrand() {
    const trimmed = newBrandName.trim();
    if (!trimmed || isCreatingBrand) return;

    setIsCreatingBrand(true);
    try {
      const result = await createSupplyBrand({
        name: trimmed,
        supplyType: supplyType.toUpperCase(),
        website: null,
      });
      if (result.success && result.brand) {
        setLocalBrands((prev) => [...prev, result.brand!]);
        setBrandId(result.brand.id);
        setNewBrandName("");
        setIsAddingBrand(false);
        toast.success(`Brand "${result.brand.name}" created`);
      } else {
        toast.error(result.error ?? "Failed to create brand");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsCreatingBrand(false);
    }
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {};

    if (!brandId) newErrors.brandId = "Brand is required";
    if (!code.trim())
      newErrors.code =
        supplyType === "thread" ? "Color code is required" : "Product code is required";
    if (!colorName.trim()) newErrors.colorName = "Color name is required";
    if (!/^#[0-9A-Fa-f]{6}$/.test(hexColor)) {
      newErrors.hexColor = "Must be a valid hex color (e.g., #FF5733)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validate()) return;

    startTransition(async () => {
      try {
        let result: { success: boolean; error?: string };

        if (supplyType === "thread") {
          const formData = {
            brandId,
            colorCode: code.trim(),
            colorName: colorName.trim(),
            hexColor,
            colorFamily,
          };
          result =
            mode === "edit" && initialData
              ? await updateThread(initialData.id, formData)
              : await createThread(formData);
        } else if (supplyType === "bead") {
          const formData = {
            brandId,
            productCode: code.trim(),
            colorName: colorName.trim(),
            hexColor,
            colorFamily,
          };
          result =
            mode === "edit" && initialData
              ? await updateBead(initialData.id, formData)
              : await createBead(formData);
        } else {
          const formData = {
            brandId,
            productCode: code.trim(),
            colorName: colorName.trim(),
            hexColor,
            description: description.trim(),
          };
          result =
            mode === "edit" && initialData
              ? await updateSpecialtyItem(initialData.id, formData)
              : await createSpecialtyItem(formData);
        }

        if (result.success) {
          toast.success(mode === "edit" ? "Supply updated" : "Supply added");
          onSuccess?.();
          router.refresh();
          onOpenChange(false);
        } else {
          // Check for specific validation errors
          if (result.error?.includes("hex color")) {
            setErrors((prev) => ({ ...prev, hexColor: result.error! }));
          } else if (result.error?.includes("already exists")) {
            setErrors((prev) => ({ ...prev, code: result.error! }));
          } else {
            toast.error(result.error ?? "Something went wrong. Please try again.");
          }
        }
      } catch {
        toast.error("Something went wrong. Please try again.");
      }
    });
  }

  const submitLabel = SUBMIT_LABELS[mode][supplyType];
  const titleLabel = TITLE_LABELS[mode][supplyType];
  const codeLabel = supplyType === "thread" ? "Color Code" : "Product Code";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading text-lg font-semibold">{titleLabel}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Color preview */}
          <div className="bg-muted/50 flex items-center gap-4 rounded-lg p-3">
            <ColorSwatch hexColor={hexColor} size="lg" />
            <div>
              <p className="text-foreground text-sm font-medium">
                {code || "Code"} &mdash; {colorName || "Color Name"}
              </p>
              <p className="text-muted-foreground text-xs">
                {localBrands.find((b) => b.id === brandId)?.name ?? "Brand"}{" "}
                {colorFamily ? `\u00B7 ${COLOR_FAMILY_DISPLAY[colorFamily] ?? colorFamily}` : ""}
              </p>
            </div>
          </div>

          {/* Brand */}
          <FormField label="Brand" htmlFor="supply-brand" required error={errors.brandId}>
            <select
              id="supply-brand"
              aria-label="Brand"
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
              className="border-input bg-background ring-offset-background focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              <option value="">Select brand...</option>
              {localBrands
                .filter((b) => b.supplyType === supplyType.toUpperCase())
                .map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
            </select>
            {isAddingBrand ? (
              <div className="mt-2 flex items-center gap-2">
                <Input
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      void handleAddBrand();
                    }
                    if (e.key === "Escape") {
                      setIsAddingBrand(false);
                      setNewBrandName("");
                    }
                  }}
                  placeholder="Brand name"
                  autoFocus
                  disabled={isCreatingBrand}
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={() => void handleAddBrand()}
                  disabled={!newBrandName.trim() || isCreatingBrand}
                >
                  {isCreatingBrand ? "Adding..." : "Add"}
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAddingBrand(true)}
                className="text-primary mt-1 text-xs hover:underline"
              >
                + Add Brand
              </button>
            )}
          </FormField>

          {/* Code */}
          <FormField label={codeLabel} htmlFor="supply-code" required error={errors.code}>
            <Input
              id="supply-code"
              aria-label={codeLabel}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={supplyType === "thread" ? "e.g., 310" : "e.g., 00123"}
              autoFocus
            />
          </FormField>

          {/* Color Name */}
          <FormField
            label="Color Name"
            htmlFor="supply-color-name"
            required
            error={errors.colorName}
          >
            <Input
              id="supply-color-name"
              aria-label="Color Name"
              value={colorName}
              onChange={(e) => setColorName(e.target.value)}
              placeholder="e.g., Black"
            />
          </FormField>

          {/* Hex Color and Color Family row */}
          <div className="grid grid-cols-2 gap-3">
            <FormField
              label="Hex Color"
              htmlFor="supply-hex-color"
              required
              error={errors.hexColor}
            >
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={/^#[0-9A-Fa-f]{6}$/.test(hexColor) ? hexColor : "#666666"}
                  onChange={(e) => setHexColor(e.target.value)}
                  className="border-input h-8 w-8 cursor-pointer rounded border"
                />
                <Input
                  id="supply-hex-color"
                  aria-label="Hex Color"
                  value={hexColor}
                  onChange={(e) => setHexColor(e.target.value)}
                  placeholder="#000000"
                  className="font-mono text-sm"
                />
              </div>
            </FormField>

            {supplyType !== "specialty" && (
              <FormField label="Color Family" htmlFor="supply-color-family">
                <select
                  id="supply-color-family"
                  aria-label="Color Family"
                  value={colorFamily}
                  onChange={(e) => setColorFamily(e.target.value as ColorFamily)}
                  className="border-input bg-background ring-offset-background focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  {COLOR_FAMILIES.map((f) => (
                    <option key={f} value={f}>
                      {COLOR_FAMILY_DISPLAY[f]}
                    </option>
                  ))}
                </select>
              </FormField>
            )}
          </div>

          {/* Description (specialty only) */}
          {supplyType === "specialty" && (
            <FormField
              label="Description"
              htmlFor="supply-description"
              hint="Product type, size, or other details"
            >
              <Textarea
                id="supply-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., #4 Very Fine Braid"
                rows={2}
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
              {isPending ? (mode === "edit" ? "Saving..." : "Adding...") : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

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
import { Label } from "@/components/ui/label";
import { FormField } from "@/components/features/charts/form-primitives/form-field";
import { createFabric, updateFabric, createFabricBrand } from "@/lib/actions/fabric-actions";
import {
  FABRIC_COUNTS,
  FABRIC_TYPES,
  FABRIC_COLOR_FAMILIES,
  FABRIC_COLOR_TYPES,
} from "@/types/fabric";
import type { Fabric } from "@/types/fabric";
import type { FabricBrandWithCounts } from "@/types/fabric";

interface FabricFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fabric: Fabric | null;
  fabricBrands: FabricBrandWithCounts[];
  projects: Array<{ id: string; chartName: string }>;
}

export function FabricFormModal({
  open,
  onOpenChange,
  fabric,
  fabricBrands,
  projects,
}: FabricFormModalProps) {
  const router = useRouter();
  const isEditing = !!fabric;
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState("");
  const [brandId, setBrandId] = useState("");
  const [count, setCount] = useState<number>(14);
  const [type, setType] = useState("Aida");
  const [colorFamily, setColorFamily] = useState("White");
  const [colorType, setColorType] = useState("White");
  const [shortestEdgeInches, setShortestEdgeInches] = useState("");
  const [longestEdgeInches, setLongestEdgeInches] = useState("");
  const [linkedProjectId, setLinkedProjectId] = useState<string | null>(null);
  const [needToBuy, setNeedToBuy] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Inline brand creation state
  const [localBrands, setLocalBrands] = useState(fabricBrands);
  const [isAddingBrand, setIsAddingBrand] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");
  const [isCreatingBrand, setIsCreatingBrand] = useState(false);

  // Sync localBrands when fabricBrands prop changes (modal open/close)
  useEffect(() => {
    setLocalBrands(fabricBrands);
  }, [fabricBrands]);

  async function handleAddBrand() {
    const trimmed = newBrandName.trim();
    if (!trimmed || isCreatingBrand) return;

    setIsCreatingBrand(true);
    try {
      const result = await createFabricBrand({ name: trimmed, website: null });
      if (result.success && result.brand) {
        const newBrand: FabricBrandWithCounts = {
          id: result.brand.id,
          name: result.brand.name,
          website: null,
          _count: { fabrics: 0 },
        };
        setLocalBrands((prev) => [...prev, newBrand]);
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

  useEffect(() => {
    if (open) {
      if (fabric) {
        setName(fabric.name);
        setBrandId(fabric.brandId);
        setCount(fabric.count);
        setType(fabric.type);
        setColorFamily(fabric.colorFamily);
        setColorType(fabric.colorType);
        setShortestEdgeInches(
          fabric.shortestEdgeInches > 0 ? String(fabric.shortestEdgeInches) : "",
        );
        setLongestEdgeInches(
          fabric.longestEdgeInches > 0 ? String(fabric.longestEdgeInches) : "",
        );
        setLinkedProjectId(fabric.linkedProjectId);
        setNeedToBuy(fabric.needToBuy);
      } else {
        setName("");
        setBrandId(fabricBrands[0]?.id ?? "");
        setCount(14);
        setType("Aida");
        setColorFamily("White");
        setColorType("White");
        setShortestEdgeInches("");
        setLongestEdgeInches("");
        setLinkedProjectId(null);
        setNeedToBuy(false);
      }
      setNameError(null);
      setGeneralError(null);
      setIsAddingBrand(false);
      setNewBrandName("");
    }
  }, [open, fabric, fabricBrands]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      setNameError("Fabric name is required");
      return;
    }
    setNameError(null);
    setGeneralError(null);

    const formData = {
      name: trimmedName,
      brandId,
      count,
      type,
      colorFamily,
      colorType,
      shortestEdgeInches: shortestEdgeInches ? Number(shortestEdgeInches) : 0,
      longestEdgeInches: longestEdgeInches ? Number(longestEdgeInches) : 0,
      linkedProjectId: linkedProjectId || null,
      needToBuy,
    };

    startTransition(async () => {
      try {
        const result = isEditing
          ? await updateFabric(fabric.id, formData)
          : await createFabric(formData);

        if (result.success) {
          toast.success(isEditing ? "Fabric updated" : "Fabric added");
          router.refresh();
          onOpenChange(false);
        } else {
          if (result.error?.includes("already has fabric linked")) {
            setGeneralError(result.error);
          } else if (result.error?.includes("already exists")) {
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading text-lg font-semibold">
            {isEditing ? "Edit Fabric" : "Add Fabric"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {generalError && (
            <p role="alert" className="text-destructive text-sm">
              {generalError}
            </p>
          )}

          <FormField
            label="Name"
            htmlFor="fabric-name"
            required
            error={nameError ?? undefined}
          >
            <Input
              id="fabric-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Driftwood Princess"
              autoFocus
            />
          </FormField>

          <FormField label="Brand" htmlFor="fabric-brand" required>
            <select
              id="fabric-brand"
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
              className="border-input bg-background text-foreground focus-visible:border-ring focus-visible:ring-ring/50 flex h-8 w-full rounded-lg border px-3 text-sm transition-colors outline-none focus-visible:ring-3"
            >
              {localBrands.map((b) => (
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

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Count" htmlFor="fabric-count" required>
              <select
                id="fabric-count"
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="border-input bg-background text-foreground focus-visible:border-ring focus-visible:ring-ring/50 flex h-8 w-full rounded-lg border px-3 text-sm transition-colors outline-none focus-visible:ring-3"
              >
                {FABRIC_COUNTS.map((c) => (
                  <option key={c} value={c}>
                    {c}ct
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Type" htmlFor="fabric-type" required>
              <select
                id="fabric-type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="border-input bg-background text-foreground focus-visible:border-ring focus-visible:ring-ring/50 flex h-8 w-full rounded-lg border px-3 text-sm transition-colors outline-none focus-visible:ring-3"
              >
                {FABRIC_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Colour Family" htmlFor="fabric-color-family">
              <select
                id="fabric-color-family"
                value={colorFamily}
                onChange={(e) => setColorFamily(e.target.value)}
                className="border-input bg-background text-foreground focus-visible:border-ring focus-visible:ring-ring/50 flex h-8 w-full rounded-lg border px-3 text-sm transition-colors outline-none focus-visible:ring-3"
              >
                {FABRIC_COLOR_FAMILIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Colour Type" htmlFor="fabric-color-type">
              <select
                id="fabric-color-type"
                value={colorType}
                onChange={(e) => setColorType(e.target.value)}
                className="border-input bg-background text-foreground focus-visible:border-ring focus-visible:ring-ring/50 flex h-8 w-full rounded-lg border px-3 text-sm transition-colors outline-none focus-visible:ring-3"
              >
                {FABRIC_COLOR_TYPES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Shortest Edge (inches)" htmlFor="fabric-shortest-edge">
              <Input
                id="fabric-shortest-edge"
                type="number"
                value={shortestEdgeInches}
                onChange={(e) => setShortestEdgeInches(e.target.value)}
                placeholder="e.g. 18"
                min={0}
                step={0.5}
              />
            </FormField>

            <FormField label="Longest Edge (inches)" htmlFor="fabric-longest-edge">
              <Input
                id="fabric-longest-edge"
                type="number"
                value={longestEdgeInches}
                onChange={(e) => setLongestEdgeInches(e.target.value)}
                placeholder="e.g. 24"
                min={0}
                step={0.5}
              />
            </FormField>
          </div>

          <FormField label="Linked Project" htmlFor="fabric-linked-project">
            <select
              id="fabric-linked-project"
              value={linkedProjectId ?? ""}
              onChange={(e) => setLinkedProjectId(e.target.value || null)}
              className="border-input bg-background text-foreground focus-visible:border-ring focus-visible:ring-ring/50 flex h-8 w-full rounded-lg border px-3 text-sm transition-colors outline-none focus-visible:ring-3"
            >
              <option value="">Unassigned</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.chartName}
                </option>
              ))}
            </select>
          </FormField>

          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={needToBuy}
              onChange={(e) => setNeedToBuy(e.target.checked)}
              className="text-primary focus:ring-primary h-4 w-4 rounded border-2"
            />
            <span className="text-sm">Need to buy this fabric</span>
          </label>

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
                  : "Add Fabric"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

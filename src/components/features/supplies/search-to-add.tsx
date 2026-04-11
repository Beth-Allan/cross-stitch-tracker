"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";
import {
  addThreadToProject,
  addBeadToProject,
  addSpecialtyToProject,
  getThreads,
  getBeads,
  getSpecialtyItems,
} from "@/lib/actions/supply-actions";
import type { ThreadWithBrand, BeadWithBrand, SpecialtyItemWithBrand } from "@/types/supply";

type SupplyItem = ThreadWithBrand | BeadWithBrand | SpecialtyItemWithBrand;

function needsBorder(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.85;
}

function getItemId(item: SupplyItem): string {
  return item.id;
}

function getItemHex(item: SupplyItem): string {
  if ("hexColor" in item) return item.hexColor;
  return "#888888";
}

function getItemCode(item: SupplyItem): string {
  if ("colorCode" in item) return (item as ThreadWithBrand).colorCode;
  if ("productCode" in item) return (item as BeadWithBrand | SpecialtyItemWithBrand).productCode;
  return "";
}

function getItemName(item: SupplyItem): string {
  return "colorName" in item ? item.colorName : "";
}

interface SearchToAddProps {
  supplyType: "thread" | "bead" | "specialty";
  projectId: string;
  existingIds: string[];
  onAdded: () => void;
  onClose: () => void;
}

export function SearchToAdd({
  supplyType,
  projectId,
  existingIds,
  onAdded,
  onClose,
}: SearchToAddProps) {
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<SupplyItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [highlightIndex, setHighlightIndex] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Fetch items on mount and when search changes
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    async function fetchItems() {
      try {
        let results: SupplyItem[];
        if (supplyType === "thread") {
          results = await getThreads(undefined, undefined, search || undefined);
        } else if (supplyType === "bead") {
          results = await getBeads(search || undefined);
        } else {
          results = await getSpecialtyItems(search || undefined);
        }
        if (!cancelled) {
          setItems(results);
          setHighlightIndex(0);
          setIsLoading(false);
        }
      } catch {
        if (!cancelled) setIsLoading(false);
      }
    }

    const timer = setTimeout(fetchItems, 150);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [search, supplyType]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const existingSet = new Set(existingIds);
  const filtered = items.filter((item) => !existingSet.has(getItemId(item))).slice(0, 8);

  async function handleSelect(item: SupplyItem) {
    startTransition(async () => {
      try {
        let result: { success: boolean; error?: string };
        if (supplyType === "thread") {
          result = await addThreadToProject({
            projectId,
            threadId: item.id,
            quantityRequired: 1,
            quantityAcquired: 0,
          });
        } else if (supplyType === "bead") {
          result = await addBeadToProject({
            projectId,
            beadId: item.id,
            quantityRequired: 1,
            quantityAcquired: 0,
          });
        } else {
          result = await addSpecialtyToProject({
            projectId,
            specialtyItemId: item.id,
            quantityRequired: 1,
            quantityAcquired: 0,
          });
        }
        if (result.success) {
          toast.success(`Added ${item.brand.name} ${getItemCode(item)} to project`);
          onAdded();
          onClose();
        } else {
          toast.error(result.error ?? "Something went wrong. Please try again.");
        }
      } catch {
        toast.error("Something went wrong. Please try again.");
      }
    });
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) => Math.min(prev + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && filtered[highlightIndex]) {
      e.preventDefault();
      handleSelect(filtered[highlightIndex]);
    }
  }

  const placeholder =
    supplyType === "thread"
      ? "Search threads by code or name..."
      : supplyType === "bead"
        ? "Search beads by code or name..."
        : "Search specialty items...";

  return (
    <div
      ref={ref}
      className="border-border bg-card absolute top-full right-0 left-0 z-20 mt-1 rounded-lg border shadow-lg"
    >
      <div className="p-2">
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="border-border bg-card text-foreground placeholder:text-muted-foreground w-full rounded border py-1.5 pr-3 pl-8 text-sm transition-colors focus:border-ring focus:ring-2 focus:ring-ring/40 focus:outline-none"
          />
        </div>
      </div>
      <div className="border-border max-h-48 overflow-y-auto border-t">
        {isLoading ? (
          <p className="text-muted-foreground px-3 py-4 text-center text-sm">Searching...</p>
        ) : filtered.length === 0 ? (
          <p className="text-muted-foreground px-3 py-4 text-center text-sm">No matches</p>
        ) : (
          filtered.map((item, index) => {
            const hex = getItemHex(item);
            const code = getItemCode(item);
            const name = getItemName(item);
            return (
              <button
                key={getItemId(item)}
                onClick={() => handleSelect(item)}
                disabled={isPending}
                className={`hover:bg-muted flex w-full items-center gap-3 px-3 py-2 text-left transition-colors ${
                  index === highlightIndex ? "bg-muted" : ""
                }`}
              >
                <div
                  className={`h-5 w-5 shrink-0 rounded-full shadow-sm ${
                    needsBorder(hex) ? "ring-1 ring-border" : ""
                  }`}
                  style={{ backgroundColor: hex }}
                />
                <span className="text-foreground text-sm">
                  <span className="font-medium">
                    {item.brand.name} {code}
                  </span>{" "}
                  — {name}
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

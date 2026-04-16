"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { Search, Plus } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
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
  onCreateNew?: (searchText: string) => void;
}

export function SearchToAdd({
  supplyType,
  projectId,
  existingIds,
  onAdded,
  onClose,
  onCreateNew,
}: SearchToAddProps) {
  const [search, setSearch] = useState("");
  const [colorFamily, setColorFamily] = useState("");
  const [items, setItems] = useState<SupplyItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [flipUp, setFlipUp] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close on click outside — ignore mousedown events within 200ms of mount
  // so the opening click (and any trackpad ghost events) can't immediately
  // close the panel. Timestamp guard is more reliable than rAF across
  // browsers and trackpad configurations.
  useEffect(() => {
    const mountedAt = Date.now();

    function handleMouseDown(e: MouseEvent) {
      if (Date.now() - mountedAt < 200) return;
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
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
    setFetchError(false);

    async function fetchItems() {
      try {
        let results: SupplyItem[];
        if (supplyType === "thread") {
          results = await getThreads(undefined, colorFamily || undefined, search || undefined);
        } else if (supplyType === "bead") {
          results = await getBeads(search || undefined);
        } else {
          results = await getSpecialtyItems(search || undefined);
        }
        if (!cancelled) {
          setItems(results);
          setHighlightIndex(-1);
          setIsLoading(false);
        }
      } catch {
        if (!cancelled) {
          setFetchError(true);
          setIsLoading(false);
        }
      }
    }

    const timer = setTimeout(fetchItems, 150);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [search, supplyType, colorFamily]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Measure available space and flip upward if near viewport bottom
  useEffect(() => {
    if (!ref.current) return;
    const rect = ref.current.parentElement?.getBoundingClientRect();
    if (!rect) return;
    const spaceBelow = window.innerHeight - rect.bottom;
    // max-h-72 = 288px, plus padding/border ~12px
    setFlipUp(spaceBelow < 300);
  }, []);

  const existingSet = new Set(existingIds);
  const addable = items.filter((item) => !existingSet.has(getItemId(item)));
  const alreadyAdded = items.filter((item) => existingSet.has(getItemId(item)));
  const displayItems = [...addable, ...alreadyAdded].slice(0, 8);

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
          // Scroll search input into view after adding (999.0.13 fix)
          inputRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
          // Picker stays open for multi-add — user closes with Escape or click-outside
        } else {
          toast.error(result.error ?? "Something went wrong. Please try again.");
        }
      } catch {
        toast.error("Something went wrong. Please try again.");
      }
    });
  }

  function findNextAddableIndex(fromIndex: number, direction: 1 | -1): number {
    let idx = fromIndex + direction;
    while (idx >= 0 && idx < displayItems.length) {
      if (!existingSet.has(getItemId(displayItems[idx]))) return idx;
      idx += direction;
    }
    return fromIndex; // Stay put if no addable item found
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) => {
        // First arrow key press: start at 0 (first addable item)
        if (prev < 0) {
          // Find the first addable item
          for (let i = 0; i < displayItems.length; i++) {
            if (!existingSet.has(getItemId(displayItems[i]))) return i;
          }
          return 0;
        }
        return findNextAddableIndex(prev, 1);
      });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((prev) => {
        if (prev < 0) return prev; // No highlight yet, stay at -1
        return findNextAddableIndex(prev, -1);
      });
    } else if (e.key === "Enter" && highlightIndex >= 0 && displayItems[highlightIndex]) {
      e.preventDefault();
      if (!existingSet.has(getItemId(displayItems[highlightIndex]))) {
        handleSelect(displayItems[highlightIndex]);
      }
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
      className={cn(
        "border-border bg-card absolute right-0 left-0 z-20 rounded-lg border shadow-lg",
        flipUp ? "bottom-full mb-1" : "top-full mt-1",
      )}
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
            className="border-border bg-card text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-ring/40 w-full rounded border py-1.5 pr-3 pl-8 text-sm transition-colors focus:ring-2 focus:outline-none"
          />
        </div>
      </div>
      {supplyType === "thread" && (
        <div className="border-border border-b px-2 pb-2">
          <select
            value={colorFamily}
            onChange={(e) => setColorFamily(e.target.value)}
            className="border-border bg-card text-foreground w-full rounded border px-2 py-1.5 text-sm"
            aria-label="Filter by color family"
          >
            <option value="">All colors</option>
            <option value="RED">Red</option>
            <option value="ORANGE">Orange</option>
            <option value="YELLOW">Yellow</option>
            <option value="GREEN">Green</option>
            <option value="BLUE">Blue</option>
            <option value="PURPLE">Purple</option>
            <option value="BROWN">Brown</option>
            <option value="BLACK">Black</option>
            <option value="WHITE">White</option>
            <option value="GRAY">Gray</option>
            <option value="NEUTRAL">Neutral</option>
          </select>
        </div>
      )}
      <div className="border-border max-h-72 overflow-y-auto border-t">
        {isLoading ? (
          <p className="text-muted-foreground px-3 py-4 text-center text-sm">Searching...</p>
        ) : fetchError ? (
          <p className="text-destructive px-3 py-4 text-center text-sm">
            Failed to load items. Try again.
          </p>
        ) : items.length === 0 ? (
          <>
            <p className="text-muted-foreground px-3 py-4 text-center text-sm">No matches</p>
            {search.trim() && onCreateNew && (
              <button
                onClick={() => onCreateNew(search.trim())}
                className="text-primary hover:bg-muted flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium transition-colors"
              >
                <Plus className="size-4" />+ Create &quot;{search.trim()}&quot;
              </button>
            )}
          </>
        ) : (
          displayItems.map((item, index) => {
            const hex = getItemHex(item);
            const code = getItemCode(item);
            const name = getItemName(item);
            const isExisting = existingSet.has(getItemId(item));
            return (
              <button
                key={getItemId(item)}
                onClick={() => !isExisting && handleSelect(item)}
                disabled={isExisting || isPending}
                className={`flex w-full items-center gap-3 px-3 py-2 text-left transition-colors ${
                  isExisting
                    ? "cursor-default opacity-50"
                    : `hover:bg-muted ${highlightIndex >= 0 && index === highlightIndex ? "bg-muted" : ""}`
                }`}
              >
                <div
                  className={`h-5 w-5 shrink-0 rounded-full shadow-sm ${
                    needsBorder(hex) ? "ring-border ring-1" : ""
                  }`}
                  style={{ backgroundColor: hex }}
                />
                <span
                  className={`text-sm ${isExisting ? "text-muted-foreground" : "text-foreground"}`}
                >
                  <span className="font-medium">
                    {item.brand.name} {code}
                  </span>{" "}
                  {isExisting ? (
                    <span className="text-muted-foreground text-xs italic">Already added</span>
                  ) : (
                    <>— {name}</>
                  )}
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

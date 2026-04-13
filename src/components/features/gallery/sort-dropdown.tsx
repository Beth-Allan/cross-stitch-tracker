"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp, Check, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SortField, SortDir } from "./gallery-types";

interface SortDropdownProps {
  sort: SortField;
  dir: SortDir;
  onSortChange: (field: SortField) => void;
}

const SORT_LABELS: Record<SortField, string> = {
  dateAdded: "Date Added",
  name: "Name",
  designer: "Designer",
  status: "Status",
  size: "Size",
  stitchCount: "Stitch Count",
};

const SORT_FIELD_ORDER: SortField[] = [
  "dateAdded",
  "name",
  "designer",
  "status",
  "size",
  "stitchCount",
];

export function SortDropdown({ sort, dir, onSortChange }: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return;
    function handleMouseDown(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [isOpen]);

  // Escape key to close
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const directionLabel = dir === "asc" ? "ascending" : "descending";

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Sort by ${SORT_LABELS[sort]}, ${directionLabel}`}
        className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-stone-400 whitespace-nowrap"
      >
        <ArrowUpDown className="w-3.5 h-3.5" strokeWidth={1.5} />
        <span>{SORT_LABELS[sort]}</span>
        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 transition-transform",
            isOpen && "rotate-180",
          )}
          strokeWidth={1.5}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 z-30 rounded-lg border border-border bg-card shadow-lg py-1 min-w-[180px]">
          {SORT_FIELD_ORDER.map((field) => {
            const isActive = sort === field;
            return (
              <button
                key={field}
                type="button"
                onClick={() => {
                  onSortChange(field);
                  setIsOpen(false);
                }}
                className="flex items-center justify-between w-full px-3 py-1.5 text-sm text-left hover:bg-muted transition-colors"
              >
                <span className="flex items-center gap-2">
                  {isActive && (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  )}
                  {!isActive && <span className="w-3.5" />}
                  <span>{SORT_LABELS[field]}</span>
                </span>
                {isActive &&
                  (dir === "asc" ? (
                    <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                  ))}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

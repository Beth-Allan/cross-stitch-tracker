"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown, ChevronUp, Check, ArrowUp, ArrowDown } from "lucide-react";
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
  progress: "Progress",
};

const SORT_FIELD_ORDER: SortField[] = [
  "dateAdded",
  "name",
  "designer",
  "status",
  "size",
  "stitchCount",
  "progress",
];

export function SortDropdown({ sort, dir, onSortChange }: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setIsOpen(false);
    setHighlightIndex(-1);
    triggerRef.current?.focus();
  }, []);

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return;
    function handleMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close();
      }
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [isOpen, close]);

  // Focus listbox when opened
  useEffect(() => {
    if (!isOpen) return;
    listRef.current?.focus();
    // Pre-highlight the currently active sort field
    const activeIndex = SORT_FIELD_ORDER.indexOf(sort);
    setHighlightIndex(activeIndex >= 0 ? activeIndex : 0);
  }, [isOpen, sort]);

  // Scroll highlighted option into view
  useEffect(() => {
    if (!isOpen || highlightIndex < 0) return;
    const option = listRef.current?.querySelector(`[data-index="${highlightIndex}"]`);
    option?.scrollIntoView({ block: "nearest" });
  }, [isOpen, highlightIndex]);

  const directionLabel = dir === "asc" ? "ascending" : "descending";

  function handleTriggerKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsOpen(true);
    }
  }

  function handleListKeyDown(e: React.KeyboardEvent) {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightIndex((i) => (i + 1) % SORT_FIELD_ORDER.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightIndex((i) => (i - 1 + SORT_FIELD_ORDER.length) % SORT_FIELD_ORDER.length);
        break;
      case "Home":
        e.preventDefault();
        setHighlightIndex(0);
        break;
      case "End":
        e.preventDefault();
        setHighlightIndex(SORT_FIELD_ORDER.length - 1);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (highlightIndex >= 0) {
          onSortChange(SORT_FIELD_ORDER[highlightIndex]);
          close();
        }
        break;
      case "Escape":
        e.preventDefault();
        close();
        break;
      case "Tab":
        close();
        break;
    }
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          if (isOpen) {
            close();
          } else {
            setIsOpen(true);
          }
        }}
        onKeyDown={handleTriggerKeyDown}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={isOpen ? "sort-listbox" : undefined}
        aria-label={`Sort by ${SORT_LABELS[sort]}, ${directionLabel}`}
        className="border-border text-muted-foreground hover:border-foreground/25 flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm whitespace-nowrap transition-colors"
      >
        {dir === "asc" ? (
          <ArrowUp className="h-3.5 w-3.5" strokeWidth={1.5} />
        ) : (
          <ArrowDown className="h-3.5 w-3.5" strokeWidth={1.5} />
        )}
        <span>{SORT_LABELS[sort]}</span>
        <ChevronDown
          className={cn("h-3.5 w-3.5 transition-transform", isOpen && "rotate-180")}
          strokeWidth={1.5}
        />
      </button>

      {isOpen && (
        <div
          ref={listRef}
          id="sort-listbox"
          role="listbox"
          aria-label="Sort options"
          tabIndex={0}
          onKeyDown={handleListKeyDown}
          className="border-border bg-card absolute top-full right-0 z-30 mt-1 min-w-[180px] rounded-lg border py-1 shadow-lg focus:outline-none"
        >
          {SORT_FIELD_ORDER.map((field, index) => {
            const isActive = sort === field;
            const isHighlighted = index === highlightIndex;
            return (
              <div
                key={field}
                role="option"
                aria-selected={isActive}
                data-index={index}
                onClick={() => {
                  onSortChange(field);
                  close();
                }}
                onMouseEnter={() => setHighlightIndex(index)}
                className={cn(
                  "flex w-full cursor-pointer items-center justify-between px-3 py-1.5 text-left text-sm transition-colors",
                  isHighlighted ? "bg-muted" : "",
                )}
              >
                <span className="flex items-center gap-2">
                  {isActive && <Check className="h-3.5 w-3.5 text-emerald-500" />}
                  {!isActive && <span className="w-3.5" />}
                  <span>{SORT_LABELS[field]}</span>
                </span>
                {isActive &&
                  (dir === "asc" ? (
                    <ChevronUp className="text-muted-foreground h-3.5 w-3.5" />
                  ) : (
                    <ChevronDown className="text-muted-foreground h-3.5 w-3.5" />
                  ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface MultiSelectDropdownProps {
  label: string;
  options: { value: string; label: string }[];
  selected: string[];
  onToggle: (value: string) => void;
}

export function MultiSelectDropdown({
  label,
  options,
  selected,
  onToggle,
}: MultiSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const hasSelection = selected.length > 0;
  const listboxId = `${label.toLowerCase().replace(/\s+/g, "-")}-listbox`;

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

  // Keyboard handling
  function handleTriggerKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsOpen(true);
      setHighlightIndex(0);
    }
  }

  function handleListKeyDown(e: React.KeyboardEvent) {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightIndex((i) => (i + 1) % options.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightIndex((i) => (i - 1 + options.length) % options.length);
        break;
      case "Home":
        e.preventDefault();
        setHighlightIndex(0);
        break;
      case "End":
        e.preventDefault();
        setHighlightIndex(options.length - 1);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (highlightIndex >= 0) {
          onToggle(options[highlightIndex].value);
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

  // Focus listbox when opened, scroll highlighted option into view
  useEffect(() => {
    if (!isOpen) return;
    listRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || highlightIndex < 0) return;
    const option = listRef.current?.querySelector(`[data-index="${highlightIndex}"]`);
    option?.scrollIntoView({ block: "nearest" });
  }, [isOpen, highlightIndex]);

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
            setHighlightIndex(0);
          }
        }}
        onKeyDown={handleTriggerKeyDown}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={isOpen ? listboxId : undefined}
        className={cn(
          "flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm whitespace-nowrap transition-colors",
          hasSelection
            ? "text-foreground border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/30"
            : "border-border text-muted-foreground hover:border-foreground/25",
        )}
      >
        <span>{label}</span>
        {hasSelection && (
          <span className="min-w-[1.25rem] rounded-full bg-emerald-200 px-1.5 text-center text-xs text-emerald-800 dark:bg-emerald-800 dark:text-emerald-200">
            {selected.length}
          </span>
        )}
        <ChevronDown
          className={cn("h-3.5 w-3.5 transition-transform", isOpen && "rotate-180")}
          strokeWidth={1.5}
        />
      </button>

      {isOpen && (
        <div
          ref={listRef}
          id={listboxId}
          role="listbox"
          aria-label={label}
          aria-multiselectable="true"
          tabIndex={0}
          onKeyDown={handleListKeyDown}
          className="border-border bg-card absolute top-full left-0 z-30 mt-1 max-h-64 min-w-[180px] overflow-y-auto rounded-lg border py-1 shadow-lg focus:outline-none"
        >
          {options.map((opt, index) => {
            const isSelected = selected.includes(opt.value);
            const isHighlighted = index === highlightIndex;
            return (
              <div
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                data-index={index}
                onClick={() => onToggle(opt.value)}
                onMouseEnter={() => setHighlightIndex(index)}
                className={cn(
                  "flex w-full cursor-pointer items-center gap-2 px-3 py-1.5 text-left text-sm transition-colors",
                  isHighlighted ? "bg-muted" : "",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border",
                    isSelected ? "border-emerald-500 bg-emerald-500 text-white" : "border-border",
                  )}
                >
                  {isSelected && <Check className="h-3 w-3" />}
                </span>
                <span>{opt.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
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
  const containerRef = useRef<HTMLDivElement>(null);

  const hasSelection = selected.length > 0;

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

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors whitespace-nowrap",
          hasSelection
            ? "border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 text-foreground"
            : "border-border text-muted-foreground hover:border-stone-400",
        )}
      >
        <span>{label}</span>
        {hasSelection && (
          <span className="bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs rounded-full px-1.5 min-w-[1.25rem] text-center">
            {selected.length}
          </span>
        )}
        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 transition-transform",
            isOpen && "rotate-180",
          )}
          strokeWidth={1.5}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 z-30 rounded-lg border border-border bg-card shadow-lg max-h-64 overflow-y-auto py-1 min-w-[180px]">
          {options.map((opt) => {
            const isSelected = selected.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onToggle(opt.value)}
                className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-left hover:bg-muted transition-colors"
              >
                <span
                  data-checked={isSelected || undefined}
                  className={cn(
                    "w-4 h-4 rounded border flex items-center justify-center flex-shrink-0",
                    isSelected
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : "border-stone-300 dark:border-stone-600",
                  )}
                >
                  {isSelected && <Check className="w-3 h-3" />}
                </span>
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

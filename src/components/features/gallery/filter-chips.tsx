"use client";

import { X } from "lucide-react";
import { STATUS_CONFIG } from "@/lib/utils/status";
import type { ProjectStatus } from "@/generated/prisma/client";

interface FilterChipsProps {
  search: string;
  statusFilter: string[];
  sizeFilter: string[];
  onRemoveSearch: () => void;
  onRemoveStatus: (value: string) => void;
  onRemoveSize: (value: string) => void;
  onClearAll: () => void;
}

interface Chip {
  key: string;
  label: string;
  ariaLabel: string;
  onRemove: () => void;
}

export function FilterChips({
  search,
  statusFilter,
  sizeFilter,
  onRemoveSearch,
  onRemoveStatus,
  onRemoveSize,
  onClearAll,
}: FilterChipsProps) {
  const hasFilters =
    search.length > 0 || statusFilter.length > 0 || sizeFilter.length > 0;

  if (!hasFilters) return null;

  const chips: Chip[] = [];

  if (search) {
    chips.push({
      key: "search",
      label: `Search: ${search}`,
      ariaLabel: "Remove search filter",
      onRemove: onRemoveSearch,
    });
  }

  for (const status of statusFilter) {
    const config = STATUS_CONFIG[status as ProjectStatus];
    const displayLabel = config?.label ?? status;
    chips.push({
      key: `status-${status}`,
      label: `Status: ${displayLabel}`,
      ariaLabel: `Remove Status: ${displayLabel} filter`,
      onRemove: () => onRemoveStatus(status),
    });
  }

  for (const size of sizeFilter) {
    chips.push({
      key: `size-${size}`,
      label: `Size: ${size}`,
      ariaLabel: `Remove Size: ${size} filter`,
      onRemove: () => onRemoveSize(size),
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <span
          key={chip.key}
          className="inline-flex items-center gap-1 rounded-full border border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 px-2 py-1 text-xs text-stone-700 dark:text-stone-300"
        >
          {chip.label}
          <button
            type="button"
            aria-label={chip.ariaLabel}
            onClick={() => chip.onRemove()}
            className="hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <button
        type="button"
        onClick={onClearAll}
        className="text-xs text-stone-500 hover:text-stone-700 dark:hover:text-stone-400 dark:text-stone-500"
      >
        Clear all
      </button>
    </div>
  );
}

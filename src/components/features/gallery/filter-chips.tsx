"use client";

import { useMemo } from "react";
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
  const hasFilters = search.length > 0 || statusFilter.length > 0 || sizeFilter.length > 0;

  const chips = useMemo(() => {
    const result: Chip[] = [];

    if (search) {
      const truncatedSearch = search.length > 30 ? search.slice(0, 30) + "\u2026" : search;
      result.push({
        key: "search",
        label: `Search: ${truncatedSearch}`,
        ariaLabel: `Remove search filter: ${search}`,
        onRemove: onRemoveSearch,
      });
    }

    for (const status of statusFilter) {
      const config = STATUS_CONFIG[status as ProjectStatus];
      const displayLabel = config?.label ?? status;
      result.push({
        key: `status-${status}`,
        label: `Status: ${displayLabel}`,
        ariaLabel: `Remove Status: ${displayLabel} filter`,
        onRemove: () => onRemoveStatus(status),
      });
    }

    for (const size of sizeFilter) {
      result.push({
        key: `size-${size}`,
        label: `Size: ${size}`,
        ariaLabel: `Remove Size: ${size} filter`,
        onRemove: () => onRemoveSize(size),
      });
    }

    return result;
  }, [search, statusFilter, sizeFilter, onRemoveSearch, onRemoveStatus, onRemoveSize]);

  if (!hasFilters) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <span
          key={chip.key}
          className="border-border bg-muted text-foreground inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs"
        >
          {chip.label}
          <button
            type="button"
            aria-label={chip.ariaLabel}
            onClick={() => chip.onRemove()}
            className="hover:text-foreground hover:bg-foreground/10 -mr-0.5 rounded-full p-1 transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <button
        type="button"
        onClick={onClearAll}
        className="text-muted-foreground hover:text-foreground text-xs transition-colors"
      >
        Clear all
      </button>
    </div>
  );
}

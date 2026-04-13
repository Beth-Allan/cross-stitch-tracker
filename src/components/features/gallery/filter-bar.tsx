"use client";

import { Search } from "lucide-react";
import { MultiSelectDropdown } from "./multi-select-dropdown";
import { STATUS_CONFIG, PROJECT_STATUSES } from "@/lib/utils/status";

interface FilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string[];
  onStatusToggle: (value: string) => void;
  sizeFilter: string[];
  onSizeToggle: (value: string) => void;
}

const STATUS_OPTIONS = PROJECT_STATUSES.map((status) => ({
  value: status,
  label: STATUS_CONFIG[status].label,
}));

const SIZE_OPTIONS = (
  ["Mini", "Small", "Medium", "Large", "BAP"] as const
).map((s) => ({
  value: s,
  label: s,
}));

export function FilterBar({
  search,
  onSearchChange,
  statusFilter,
  onStatusToggle,
  sizeFilter,
  onSizeToggle,
}: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Search input */}
      <div
        className="relative flex-shrink-0 max-w-[280px] w-full sm:w-auto"
        data-search-wrapper
      >
        <Search
          className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-stone-500"
          strokeWidth={1.5}
        />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search projects..."
          className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-border text-sm bg-card placeholder:text-muted-foreground focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
        />
      </div>

      {/* Status multi-select */}
      <MultiSelectDropdown
        label="Status"
        options={STATUS_OPTIONS}
        selected={statusFilter}
        onToggle={onStatusToggle}
      />

      {/* Size multi-select */}
      <MultiSelectDropdown
        label="Size"
        options={SIZE_OPTIONS}
        selected={sizeFilter}
        onToggle={onSizeToggle}
      />
    </div>
  );
}

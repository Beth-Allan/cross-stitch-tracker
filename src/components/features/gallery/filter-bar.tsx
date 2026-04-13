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

const SIZE_OPTIONS = (["Mini", "Small", "Medium", "Large", "BAP"] as const).map((s) => ({
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
      <div className="relative w-full max-w-[280px] flex-shrink-0 sm:w-auto" data-search-wrapper>
        <Search
          className="text-muted-foreground/60 absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2"
          strokeWidth={1.5}
        />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search projects..."
          aria-label="Search projects"
          className="border-border bg-card placeholder:text-muted-foreground w-full rounded-lg border py-2 pr-3 pl-9 text-sm focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 focus:outline-none"
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

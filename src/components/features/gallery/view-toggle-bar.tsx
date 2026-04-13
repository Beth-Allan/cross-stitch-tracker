"use client";

import { LayoutGrid, List, Table2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { SortDropdown } from "./sort-dropdown";
import type { ViewMode, SortField, SortDir } from "./gallery-types";

interface ViewToggleBarProps {
  view: ViewMode;
  onViewChange: (mode: ViewMode) => void;
  sort: SortField;
  dir: SortDir;
  onSortChange: (field: SortField) => void;
  totalCount: number;
  filteredCount: number;
  hasActiveFilters: boolean;
}

const VIEW_MODE_CONFIG: {
  mode: ViewMode;
  icon: typeof LayoutGrid;
  label: string;
  tooltip: string;
}[] = [
  {
    mode: "gallery",
    icon: LayoutGrid,
    label: "Cards view",
    tooltip: "Visual cards with cover images and status details",
  },
  {
    mode: "list",
    icon: List,
    label: "List view",
    tooltip: "Compact rows with key project info",
  },
  {
    mode: "table",
    icon: Table2,
    label: "Table view",
    tooltip: "Full data table with sortable columns",
  },
];

export function ViewToggleBar({
  view,
  onViewChange,
  sort,
  dir,
  onSortChange,
  totalCount,
  filteredCount,
  hasActiveFilters,
}: ViewToggleBarProps) {
  return (
    <div className="flex items-center justify-between">
      {/* Left side: project count */}
      <p className="text-xs text-muted-foreground">
        {hasActiveFilters
          ? `${filteredCount} of ${totalCount} projects`
          : `${totalCount} projects`}
      </p>

      {/* Right side: sort + view toggle */}
      <div className="flex items-center gap-3">
        <SortDropdown sort={sort} dir={dir} onSortChange={onSortChange} />

        {/* Segmented view toggle */}
        <div className="inline-flex items-center rounded-lg bg-stone-100 dark:bg-stone-800 p-0.5">
          {VIEW_MODE_CONFIG.map(({ mode, icon: Icon, label, tooltip }) => (
            <button
              key={mode}
              type="button"
              onClick={() => onViewChange(mode)}
              title={tooltip}
              className={cn(
                "inline-flex items-center justify-center rounded-md px-2.5 py-1.5 transition-colors",
                view === mode
                  ? "bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-sm"
                  : "text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-400",
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="sr-only">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

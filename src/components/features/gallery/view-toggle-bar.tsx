"use client";

import { LayoutGrid, List, Table2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
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
      <p className="text-muted-foreground text-xs">
        {hasActiveFilters ? `${filteredCount} of ${totalCount} projects` : `${totalCount} projects`}
      </p>

      {/* Right side: sort + view toggle */}
      <div className="flex items-center gap-3">
        <SortDropdown sort={sort} dir={dir} onSortChange={onSortChange} />

        {/* Segmented view toggle */}
        <TooltipProvider>
          <div className="bg-muted inline-flex items-center rounded-lg p-0.5">
            {VIEW_MODE_CONFIG.map(({ mode, icon: Icon, label, tooltip }) => (
              <Tooltip key={mode}>
                <TooltipTrigger
                  className={cn(
                    "inline-flex items-center justify-center rounded-md px-2.5 py-2 transition-colors",
                    view === mode
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground/60 hover:text-muted-foreground",
                  )}
                  onClick={() => onViewChange(mode)}
                >
                  <Icon className="h-4 w-4" />
                  <span className="sr-only">{label}</span>
                </TooltipTrigger>
                <TooltipContent side="bottom">{tooltip}</TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>
      </div>
    </div>
  );
}

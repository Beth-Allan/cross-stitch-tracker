"use client";

import { ChevronUp, ChevronDown } from "lucide-react";
import type { SortKey, SortDir } from "./use-series-sort";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "name", label: "Name" },
  { key: "completion", label: "Completion" },
  { key: "charts", label: "Charts" },
];

interface SeriesSortPillsProps {
  sort: { key: SortKey; dir: SortDir };
  onSort: (key: SortKey) => void;
}

export function SeriesSortPills({ sort, onSort }: SeriesSortPillsProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground mr-2 text-xs font-semibold tracking-widest uppercase">
        Sort by
      </span>
      {SORT_OPTIONS.map((opt) => (
        <button
          key={opt.key}
          type="button"
          onClick={() => onSort(opt.key)}
          className={`rounded-full px-3 py-1 text-xs transition-colors ${
            sort.key === opt.key
              ? "bg-success-muted text-success-muted-foreground font-semibold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {opt.label}
          {sort.key === opt.key &&
            (sort.dir === "asc" ? (
              <ChevronUp className="ml-0.5 inline h-3 w-3" />
            ) : (
              <ChevronDown className="ml-0.5 inline h-3 w-3" />
            ))}
        </button>
      ))}
    </div>
  );
}

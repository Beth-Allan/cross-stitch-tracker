"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { STATUS_CONFIG } from "@/lib/utils/status";
import type { ProjectStatus } from "@/generated/prisma/client";

export const STATUS_GROUP_ORDER: ProjectStatus[] = [
  "KITTING",
  "IN_PROGRESS",
  "ON_HOLD",
  "UNSTARTED",
  "KITTED",
];

interface StatusGroupProps {
  status: ProjectStatus;
  count: number;
  isExpanded: boolean;
  onToggle: () => void;
  onSelectAll: () => void;
  children: React.ReactNode;
}

export function StatusGroup({
  status,
  count,
  isExpanded,
  onToggle,
  onSelectAll,
  children,
}: StatusGroupProps) {
  const config = STATUS_CONFIG[status];

  return (
    <div role="group" aria-labelledby={`group-${status}`}>
      <div className="flex items-center justify-between py-2">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isExpanded}
          className="flex items-center gap-2"
          id={`group-${status}`}
        >
          {isExpanded ? (
            <ChevronDown className="text-muted-foreground h-4 w-4" />
          ) : (
            <ChevronRight className="text-muted-foreground h-4 w-4" />
          )}
          <span aria-hidden="true" className={cn("h-2 w-2 rounded-full", config.dotClass)} />
          <span className="text-[11px] font-semibold tracking-wider uppercase">{config.label}</span>
          <span className="bg-muted text-muted-foreground rounded-full px-1.5 py-0.5 font-mono text-[11px] font-semibold">
            {count}
          </span>
        </button>
        <button
          type="button"
          onClick={onSelectAll}
          className="text-progress-foreground hover:text-selected-foreground text-xs font-medium transition-colors"
          aria-label={`Select all ${config.label} projects`}
        >
          Select all
        </button>
      </div>
      {isExpanded && children}
    </div>
  );
}

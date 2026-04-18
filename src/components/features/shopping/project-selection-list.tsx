"use client";

import { CheckSquare, ChevronRight, Square } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/features/charts/status-badge";
import type { ShoppingCartProject } from "@/types/dashboard";
import type { ProjectStatus } from "@/generated/prisma/client";

interface ProjectSelectionListProps {
  projects: ShoppingCartProject[];
  selectedIds: Set<string>;
  imageUrls: Record<string, string>;
  onToggle: (projectId: string) => void;
  onSelectAll: () => void;
}

export function ProjectSelectionList({
  projects,
  selectedIds,
  imageUrls,
  onToggle,
  onSelectAll,
}: ProjectSelectionListProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          {projects.length} project{projects.length !== 1 ? "s" : ""} with
          unfulfilled supply needs
        </p>
        <button
          type="button"
          onClick={onSelectAll}
          className="text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          Select all
        </button>
      </div>

      <div className="flex flex-col gap-0.5">
        {projects.map((project) => {
          const isSelected = selectedIds.has(project.projectId);
          const totalNeeds =
            project.threadCount +
            project.beadCount +
            project.specialtyCount +
            (project.fabricNeeded ? 1 : 0);
          const imageUrl = imageUrls[project.chartId];

          return (
            <button
              key={project.projectId}
              type="button"
              onClick={() => onToggle(project.projectId)}
              className={cn(
                "flex items-center gap-3 rounded-lg border p-3 transition-colors text-left w-full",
                isSelected
                  ? "border-emerald-300 bg-emerald-50/30"
                  : "border-border bg-card hover:bg-muted/50",
              )}
            >
              {/* Checkbox icon */}
              <span
                className={cn(
                  "shrink-0",
                  isSelected ? "text-emerald-600" : "text-stone-300",
                )}
              >
                {isSelected ? (
                  <CheckSquare className="h-5 w-5" />
                ) : (
                  <Square className="h-5 w-5" />
                )}
              </span>

              {/* Cover thumbnail */}
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={project.projectName}
                  width={40}
                  height={40}
                  className="rounded object-cover shrink-0"
                />
              ) : (
                <div className="h-10 w-10 rounded bg-muted shrink-0" />
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground truncate">
                    {project.projectName}
                  </span>
                  <StatusBadge status={project.status as ProjectStatus} />
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {project.designerName}
                  {" \u00B7 "}
                  {buildSupplySummary(project)}
                  {totalNeeds > 0 &&
                    ` \u00B7 ${totalNeeds} item${totalNeeds !== 1 ? "s" : ""} needed`}
                </p>
              </div>

              {/* Details chevron */}
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function buildSupplySummary(project: ShoppingCartProject): string {
  const parts: string[] = [];
  if (project.threadCount > 0) {
    parts.push(`${project.threadCount} thread${project.threadCount !== 1 ? "s" : ""}`);
  }
  if (project.beadCount > 0) {
    parts.push(`${project.beadCount} bead${project.beadCount !== 1 ? "s" : ""}`);
  }
  if (project.specialtyCount > 0) {
    parts.push(`${project.specialtyCount} specialty`);
  }
  return parts.join(", ");
}

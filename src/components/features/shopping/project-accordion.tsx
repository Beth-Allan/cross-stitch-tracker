"use client";

import { useCallback, useMemo, useState } from "react";
import { CheckSquare, ChevronRight, Search, Square } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { getObjectPositionStyle } from "@/lib/utils/focal-point";
import { StatusBadge } from "@/components/features/charts/status-badge";
import { ColorSwatch } from "@/components/features/supplies/color-swatch";
import { StatusGroup, STATUS_GROUP_ORDER } from "./status-group";
import { SelectionCounter } from "./selection-counter";
import { EmptyState } from "@/components/ui/empty-state";
import { QuantityControl } from "./quantity-control";
import type {
  ShoppingCartProject,
  ShoppingSupplyNeed,
  ShoppingFabricNeed,
} from "@/types/dashboard";
import type { ProjectStatus } from "@/generated/prisma/client";

interface ProjectAccordionProps {
  projects: ShoppingCartProject[];
  selectedIds: Set<string>;
  imageUrls: Record<string, string>;
  threads: ShoppingSupplyNeed[];
  beads: ShoppingSupplyNeed[];
  specialty: ShoppingSupplyNeed[];
  fabrics: ShoppingFabricNeed[];
  onToggle: (projectId: string) => void;
  onSelectAll: () => void;
  selectAllLabel: string;
  onSelectGroup: (projectIds: string[]) => void;
  onUpdateAcquired: (
    type: "thread" | "bead" | "specialty",
    junctionId: string,
    quantity: number,
  ) => void;
  pendingIds: Set<string>;
  failedIds: Set<string>;
  collapsedGroups: Set<ProjectStatus>;
  onToggleGroup: (status: ProjectStatus) => void;
  isSearchActive: boolean;
  selectedCount: number;
  totalCount: number;
  visibleCount: number;
  visibleSelectedCount: number;
}

export function ProjectAccordion({
  projects,
  selectedIds,
  imageUrls,
  threads,
  beads,
  specialty,
  fabrics,
  onToggle,
  onSelectAll,
  selectAllLabel,
  onSelectGroup,
  onUpdateAcquired,
  pendingIds,
  failedIds,
  collapsedGroups,
  onToggleGroup,
  isSearchActive,
  selectedCount,
  totalCount,
  visibleCount,
  visibleSelectedCount,
}: ProjectAccordionProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());

  const toggleExpand = useCallback((projectId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(projectId)) next.delete(projectId);
      else next.add(projectId);
      return next;
    });
  }, []);

  const allSelectedProjectIds = new Set(selectedIds);

  const groupedProjects = useMemo(() => {
    const map = new Map<ProjectStatus, ShoppingCartProject[]>();
    for (const project of projects) {
      const group = map.get(project.status) ?? [];
      group.push(project);
      map.set(project.status, group);
    }
    return map;
  }, [projects]);

  const counterHeader = (
    <div className="mb-4 flex items-center justify-between">
      <SelectionCounter
        selectedCount={selectedCount}
        totalCount={totalCount}
        visibleCount={visibleCount}
        visibleSelectedCount={visibleSelectedCount}
        isSearchActive={isSearchActive}
      />
      <button
        type="button"
        onClick={onSelectAll}
        className="text-progress-foreground hover:text-selected-foreground text-xs font-medium transition-colors"
      >
        {selectAllLabel}
      </button>
    </div>
  );

  if (projects.length === 0) {
    return (
      <div>
        {counterHeader}
        <EmptyState
          icon={Search}
          title="No projects match your search"
          description="Try a different name or clear the search"
        />
      </div>
    );
  }

  return (
    <div>
      {counterHeader}

      <div className="flex flex-col gap-4">
        {STATUS_GROUP_ORDER.map((status) => {
          const groupProjects = groupedProjects.get(status);
          if (!groupProjects || groupProjects.length === 0) return null;

          return (
            <StatusGroup
              key={status}
              status={status}
              count={groupProjects.length}
              isExpanded={!collapsedGroups.has(status)}
              onToggle={() => onToggleGroup(status)}
              onSelectAll={() => onSelectGroup(groupProjects.map((p) => p.projectId))}
            >
              <div className="flex flex-col gap-2">
                {groupProjects.map((project) => {
          const isSelected = selectedIds.has(project.projectId);
          const isExpanded = expandedIds.has(project.projectId);
          const imageUrl = imageUrls[project.coverThumbnailUrl ?? ""];

          const projectThreads = threads.filter((t) => t.projectId === project.projectId);
          const projectBeads = beads.filter((b) => b.projectId === project.projectId);
          const projectSpecialty = specialty.filter((s) => s.projectId === project.projectId);
          const projectFabric = fabrics.find((f) => f.projectId === project.projectId);

          const totalNeeds =
            project.threadCount +
            project.beadCount +
            project.specialtyCount +
            (project.fabricNeeded ? 1 : 0);

          return (
            <div
              key={project.projectId}
              className={cn(
                "overflow-hidden rounded-xl border",
                isSelected ? "border-selected-border" : "border-border",
              )}
            >
              {/* Header */}
              <div className="bg-card flex items-center gap-3 p-3">
                <button
                  type="button"
                  onClick={() => onToggle(project.projectId)}
                  role="checkbox"
                  aria-checked={isSelected}
                  className={cn(
                    "shrink-0",
                    isSelected ? "text-progress-foreground" : "text-muted-foreground/40",
                  )}
                  aria-label={
                    isSelected ? `Deselect ${project.projectName}` : `Select ${project.projectName}`
                  }
                >
                  {isSelected ? (
                    <CheckSquare className="h-5 w-5" />
                  ) : (
                    <Square className="h-5 w-5" />
                  )}
                </button>

                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={project.projectName}
                    width={40}
                    height={40}
                    className="shrink-0 rounded object-cover"
                    style={getObjectPositionStyle(project.focalPointX, project.focalPointY)}
                    loading="lazy"
                    unoptimized
                  />
                ) : (
                  <div className="bg-muted h-10 w-10 shrink-0 rounded" />
                )}

                <button
                  type="button"
                  onClick={() => toggleExpand(project.projectId)}
                  className="flex min-w-0 flex-1 items-center gap-2 text-left"
                  aria-expanded={isExpanded}
                  aria-label={`${isExpanded ? "Collapse" : "Expand"} ${project.projectName} supplies`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-foreground truncate text-sm font-semibold">
                        {project.projectName}
                      </span>
                      <StatusBadge status={project.status as ProjectStatus} />
                    </div>
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      {project.designerName}
                      {totalNeeds > 0 &&
                        ` · ${totalNeeds} item${totalNeeds !== 1 ? "s" : ""} needed`}
                    </p>
                  </div>
                  <ChevronRight
                    className={cn(
                      "text-muted-foreground h-4 w-4 shrink-0 transition-transform",
                      isExpanded && "rotate-90",
                    )}
                  />
                </button>
              </div>

              {/* Expanded body */}
              {isExpanded && isSelected && (
                <div className="border-border/60 border-t">
                  {projectThreads.length > 0 && (
                    <SupplyGroup
                      label="Threads"
                      count={projectThreads.length}
                      supplies={projectThreads}
                      type="thread"
                      allSelectedProjectIds={allSelectedProjectIds}
                      allSupplies={threads}
                      onUpdateAcquired={onUpdateAcquired}
                      pendingIds={pendingIds}
                      failedIds={failedIds}
                    />
                  )}
                  {projectBeads.length > 0 && (
                    <SupplyGroup
                      label="Beads"
                      count={projectBeads.length}
                      supplies={projectBeads}
                      type="bead"
                      allSelectedProjectIds={allSelectedProjectIds}
                      allSupplies={beads}
                      onUpdateAcquired={onUpdateAcquired}
                      pendingIds={pendingIds}
                      failedIds={failedIds}
                    />
                  )}
                  {projectSpecialty.length > 0 && (
                    <SupplyGroup
                      label="Specialty"
                      count={projectSpecialty.length}
                      supplies={projectSpecialty}
                      type="specialty"
                      allSelectedProjectIds={allSelectedProjectIds}
                      allSupplies={specialty}
                      onUpdateAcquired={onUpdateAcquired}
                      pendingIds={pendingIds}
                      failedIds={failedIds}
                    />
                  )}
                  {projectFabric && (
                    <div className="border-border/30 border-t px-4 py-3">
                      <div className="text-muted-foreground mb-2 text-[11px] font-bold tracking-wider uppercase">
                        Fabric
                      </div>
                      <div className="text-sm">
                        {projectFabric.hasFabric ? (
                          <span className="text-progress-foreground">
                            ✓ {projectFabric.fabricName ?? "Has fabric"}{" "}
                            <span className="text-muted-foreground">
                              · {projectFabric.stitchesWide} × {projectFabric.stitchesHigh} stitches
                            </span>
                          </span>
                        ) : (
                          <span>
                            <span className="font-medium text-amber-600">Needs fabric</span>{" "}
                            <span className="text-muted-foreground">
                              · {projectFabric.stitchesWide} × {projectFabric.stitchesHigh} stitches
                            </span>
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  {projectThreads.length === 0 &&
                    projectBeads.length === 0 &&
                    projectSpecialty.length === 0 &&
                    !projectFabric && (
                      <div className="text-muted-foreground px-4 py-6 text-center text-sm">
                        No supply data for this project
                      </div>
                    )}
                </div>
              )}

              {/* Expanded but not selected */}
              {isExpanded && !isSelected && (
                <div className="border-border/60 text-muted-foreground border-t px-4 py-6 text-center text-sm">
                  Select this project to see supply details
                </div>
              )}
            </div>
          );
                })}
              </div>
            </StatusGroup>
          );
        })}
      </div>
    </div>
  );
}

/* ─── SupplyGroup ────────────────────────────────────────── */

function SupplyGroup({
  label,
  count,
  supplies,
  type,
  allSelectedProjectIds,
  allSupplies,
  onUpdateAcquired,
  pendingIds,
  failedIds,
}: {
  label: string;
  count: number;
  supplies: ShoppingSupplyNeed[];
  type: "thread" | "bead" | "specialty";
  allSelectedProjectIds: Set<string>;
  allSupplies: ShoppingSupplyNeed[];
  onUpdateAcquired: (
    type: "thread" | "bead" | "specialty",
    junctionId: string,
    quantity: number,
  ) => void;
  pendingIds: Set<string>;
  failedIds: Set<string>;
}) {
  return (
    <div className="border-border/30 border-t px-4 py-3">
      <div className="text-muted-foreground mb-2 text-[11px] font-bold tracking-wider uppercase">
        {label} ({count})
      </div>
      <div className="flex flex-col gap-0.5">
        {supplies.map((supply) => {
          const otherProjects = allSupplies
            .filter(
              (s) =>
                s.supplyId === supply.supplyId &&
                s.projectId !== supply.projectId &&
                allSelectedProjectIds.has(s.projectId),
            )
            .map((s) => s.projectName);

          return (
            <div key={supply.junctionId} className="flex items-center gap-2.5 py-1.5">
              {supply.hexColor && <ColorSwatch hexColor={supply.hexColor} size="sm" />}
              <div className="min-w-0 flex-1">
                <span className="text-foreground text-sm font-medium">
                  {supply.brandName} {supply.code}
                </span>{" "}
                <span className="text-muted-foreground text-xs">{supply.colorName}</span>
                {otherProjects.length > 0 && (
                  <div className="text-progress-foreground mt-0.5 flex items-center gap-1 text-[11px]">
                    <span className="bg-progress inline-block h-1.5 w-1.5 rounded-full" />
                    Also in {otherProjects.join(", ")}
                  </div>
                )}
              </div>
              <QuantityControl
                acquired={supply.quantityAcquired}
                required={supply.quantityRequired}
                isPending={pendingIds.has(supply.junctionId)}
                hasError={failedIds.has(supply.junctionId)}
                onChange={(newValue) => onUpdateAcquired(type, supply.junctionId, newValue)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

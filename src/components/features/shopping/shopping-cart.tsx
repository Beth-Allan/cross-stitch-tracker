"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ShoppingForBar } from "./shopping-for-bar";
import { ProjectAccordion } from "./project-accordion";
import { SupplyOverview } from "./supply-overview";
import { ShoppingListTab } from "./shopping-list-tab";
import { updateSupplyAcquired } from "@/lib/actions/shopping-cart-actions";
import type { ShoppingCartData } from "@/types/dashboard";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "shopping-cart-selected-projects";
const VIEW_KEY = "shopping-cart-view-mode";

type ViewMode = "by-project" | "by-supply";

/* ─── usePersistedSelection ─────────────────────────────────────────────── */

function usePersistedSelection(validProjectIds: string[]) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set<string>();

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return new Set<string>();

      const parsed = JSON.parse(stored) as string[];
      if (!Array.isArray(parsed)) return new Set<string>();

      const validSet = new Set(validProjectIds);
      const filtered = parsed.filter((id) => validSet.has(id));
      return new Set(filtered);
    } catch {
      return new Set<string>();
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(selectedIds)));
    } catch {
      // localStorage may be unavailable
    }
  }, [selectedIds]);

  return [selectedIds, setSelectedIds] as const;
}

/* ─── usePersistedViewMode ──────────────────────────────────────────────── */

function usePersistedViewMode(): [ViewMode, (mode: ViewMode) => void] {
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window === "undefined") return "by-project";
    try {
      const stored = localStorage.getItem(VIEW_KEY);
      if (stored === "by-supply") return "by-supply";
    } catch {
      // ignore
    }
    return "by-project";
  });

  useEffect(() => {
    try {
      localStorage.setItem(VIEW_KEY, viewMode);
    } catch {
      // localStorage may be unavailable
    }
  }, [viewMode]);

  return [viewMode, setViewMode];
}

/* ─── Badge ──────────────────────────────────────────────────────────────── */

function Badge({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <span className="bg-muted text-muted-foreground ml-1 rounded-full px-1.5 py-0.5 font-mono text-[11px] font-bold">
      {count}
    </span>
  );
}

/* ─── ShoppingCart ───────────────────────────────────────────────────────── */

interface ShoppingCartProps {
  data: ShoppingCartData;
  imageUrls: Record<string, string>;
}

export function ShoppingCart({ data, imageUrls }: ShoppingCartProps) {
  const validProjectIds = useMemo(() => data.projects.map((p) => p.projectId), [data.projects]);

  const [selectedIds, setSelectedIds] = usePersistedSelection(validProjectIds);
  const [viewMode, setViewMode] = usePersistedViewMode();
  const [isPending, startTransition] = useTransition();

  /* ── Selection handlers ─────────────────────────────────── */

  const toggleProject = useCallback(
    (projectId: string) => {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(projectId)) next.delete(projectId);
        else next.add(projectId);
        return next;
      });
    },
    [setSelectedIds],
  );

  const removeProject = useCallback(
    (projectId: string) => {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(projectId);
        return next;
      });
    },
    [setSelectedIds],
  );

  const clearAll = useCallback(() => {
    setSelectedIds(new Set());
  }, [setSelectedIds]);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(validProjectIds));
  }, [setSelectedIds, validProjectIds]);

  /* ── Filtered data ──────────────────────────────────────── */

  const filteredThreads = useMemo(
    () => data.threads.filter((t) => selectedIds.has(t.projectId)),
    [data.threads, selectedIds],
  );

  const filteredBeads = useMemo(
    () => data.beads.filter((b) => selectedIds.has(b.projectId)),
    [data.beads, selectedIds],
  );

  const filteredSpecialty = useMemo(
    () => data.specialty.filter((s) => selectedIds.has(s.projectId)),
    [data.specialty, selectedIds],
  );

  const filteredFabrics = useMemo(
    () => data.fabrics.filter((f) => selectedIds.has(f.projectId)),
    [data.fabrics, selectedIds],
  );

  /* ── Server action handler ──────────────────────────────── */

  const handleUpdateAcquired = useCallback(
    (type: "thread" | "bead" | "specialty", junctionId: string, quantity: number) => {
      startTransition(async () => {
        try {
          const result = await updateSupplyAcquired(type, junctionId, quantity);
          if (result.success) {
            toast.success("Supply quantity updated");
          } else {
            toast.error(result.error ?? "Failed to update supply");
          }
        } catch {
          toast.error("Something went wrong.");
        }
      });
    },
    [],
  );

  /* ── Selected projects for bar ──────────────────────────── */

  const selectedProjects = useMemo(
    () => data.projects.filter((p) => selectedIds.has(p.projectId)),
    [data.projects, selectedIds],
  );

  const hasSelection = selectedIds.size > 0;

  /* ── Badge count for shopping list ──────────────────────── */

  const listBadge = useMemo(() => {
    const threadNeeds = filteredThreads.filter(
      (t) => t.quantityAcquired < t.quantityRequired,
    ).length;
    const beadNeeds = filteredBeads.filter((b) => b.quantityAcquired < b.quantityRequired).length;
    const specialtyNeeds = filteredSpecialty.filter(
      (s) => s.quantityAcquired < s.quantityRequired,
    ).length;
    const fabricNeeds = filteredFabrics.filter((f) => !f.hasFabric).length;
    return threadNeeds + beadNeeds + specialtyNeeds + fabricNeeds;
  }, [filteredThreads, filteredBeads, filteredSpecialty, filteredFabrics]);

  /* ── Render ─────────────────────────────────────────────── */

  return (
    <div>
      <ShoppingForBar
        selectedProjects={selectedProjects}
        onRemove={removeProject}
        onClearAll={clearAll}
      />

      <Tabs defaultValue="projects" className="mt-4">
        <TabsList variant="line" className="w-full">
          <TabsTrigger value="projects">
            Projects
            <Badge count={data.projects.length} />
          </TabsTrigger>
          <TabsTrigger value="list" className={cn(!hasSelection && "opacity-50")}>
            Shopping List
            <Badge count={listBadge} />
          </TabsTrigger>
        </TabsList>

        <div className="pt-6 pb-12">
          <TabsContent value="projects">
            {/* View toggle */}
            <div
              className="bg-muted mb-5 inline-flex rounded-lg p-1"
              role="radiogroup"
              aria-label="View mode"
            >
              <button
                type="button"
                role="radio"
                aria-checked={viewMode === "by-project"}
                onClick={() => setViewMode("by-project")}
                className={cn(
                  "rounded-md px-3.5 py-1.5 text-sm font-medium transition-all",
                  viewMode === "by-project"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                By Project
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={viewMode === "by-supply"}
                onClick={() => setViewMode("by-supply")}
                className={cn(
                  "rounded-md px-3.5 py-1.5 text-sm font-medium transition-all",
                  viewMode === "by-supply"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                By Supply Type
              </button>
            </div>

            {viewMode === "by-project" ? (
              <ProjectAccordion
                projects={data.projects}
                selectedIds={selectedIds}
                imageUrls={imageUrls}
                threads={filteredThreads}
                beads={filteredBeads}
                specialty={filteredSpecialty}
                fabrics={filteredFabrics}
                onToggle={toggleProject}
                onSelectAll={selectAll}
                onUpdateAcquired={handleUpdateAcquired}
                isPending={isPending}
              />
            ) : (
              <SupplyOverview
                threads={filteredThreads}
                beads={filteredBeads}
                specialty={filteredSpecialty}
                fabrics={filteredFabrics}
                onUpdateAcquired={handleUpdateAcquired}
                isPending={isPending}
              />
            )}
          </TabsContent>

          <TabsContent value="list">
            <ShoppingListTab
              threads={filteredThreads}
              beads={filteredBeads}
              specialty={filteredSpecialty}
              fabrics={filteredFabrics}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

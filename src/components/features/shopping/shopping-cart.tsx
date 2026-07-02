"use client";

import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ShoppingForBar } from "./shopping-for-bar";
import { ProjectAccordion } from "./project-accordion";
import { SupplyOverview } from "./supply-overview";
import { ShoppingListTab } from "./shopping-list-tab";
import { SearchInput } from "./search-input";
import { updateSupplyAcquired } from "@/lib/actions/shopping-cart-actions";
import type { ShoppingCartData } from "@/types/dashboard";
import type { ProjectStatus } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "shopping-cart-selected-projects";
const VIEW_KEY = "shopping-cart-view-mode";

type ViewMode = "by-project" | "by-supply";

function usePersistedSelection(validProjectIds: string[]) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const hydratedRef = useRef(false);
  const initialRenderRef = useRef(true);

  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored) as string[];
      if (!Array.isArray(parsed)) return;
      const validSet = new Set(validProjectIds);
      const filtered = parsed.filter((id) => validSet.has(id));
      if (filtered.length > 0) setSelectedIds(new Set(filtered));
    } catch {
      // localStorage may be unavailable (private browsing, SSR)
    }
  }, [validProjectIds]);

  useEffect(() => {
    if (!hydratedRef.current) return;
    // Skip the first post-hydration write — selectedIds hasn't re-rendered yet
    if (initialRenderRef.current) {
      initialRenderRef.current = false;
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(selectedIds)));
    } catch {
      // localStorage may be unavailable (private browsing, SSR)
    }
  }, [selectedIds]);

  return [selectedIds, setSelectedIds] as const;
}

function usePersistedViewMode(): [ViewMode, (mode: ViewMode) => void] {
  const [viewMode, setViewMode] = useState<ViewMode>("by-project");
  const hydratedRef = useRef(false);

  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    try {
      const stored = localStorage.getItem(VIEW_KEY);
      if (stored === "by-supply") setViewMode("by-supply");
    } catch {
      // localStorage may be unavailable (private browsing, SSR)
    }
  }, []);

  useEffect(() => {
    if (!hydratedRef.current) return;
    try {
      localStorage.setItem(VIEW_KEY, viewMode);
    } catch {
      // localStorage may be unavailable (private browsing, SSR)
    }
  }, [viewMode]);

  return [viewMode, setViewMode];
}

function Badge({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <span className="bg-muted text-muted-foreground ml-1 rounded-full px-1.5 py-0.5 font-mono text-[11px] font-bold">
      {count}
    </span>
  );
}

interface ShoppingCartProps {
  data: ShoppingCartData;
  imageUrls: Record<string, string>;
}

export function ShoppingCart({ data, imageUrls }: ShoppingCartProps) {
  const projectsWithNeeds = useMemo(
    () =>
      data.projects.filter(
        (p) => p.threadCount + p.beadCount + p.specialtyCount > 0 || p.fabricNeeded,
      ),
    [data.projects],
  );
  const validProjectIds = useMemo(
    () => projectsWithNeeds.map((p) => p.projectId),
    [projectsWithNeeds],
  );

  const [selectedIds, setSelectedIds] = usePersistedSelection(validProjectIds);
  const [viewMode, setViewMode] = usePersistedViewMode();
  const [, startTransition] = useTransition();
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [failedIds, setFailedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearch = useDeferredValue(searchQuery);
  const [supplySearchQuery, setSupplySearchQuery] = useState("");
  const [collapsedGroups, setCollapsedGroups] = useState<Set<ProjectStatus>>(new Set());
  const filteredProjects = useMemo(() => {
    if (!deferredSearch) return projectsWithNeeds;
    const lower = deferredSearch.toLowerCase();
    return projectsWithNeeds.filter((p) => p.projectName.toLowerCase().includes(lower));
  }, [projectsWithNeeds, deferredSearch]);

  const filteredProjectIds = useMemo(
    () => new Set(filteredProjects.map((p) => p.projectId)),
    [filteredProjects],
  );

  const isSearchActive = deferredSearch.length > 0;
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

  const selectVisible = useCallback(() => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      for (const p of filteredProjects) {
        next.add(p.projectId);
      }
      return next;
    });
  }, [setSelectedIds, filteredProjects]);

  const selectGroup = useCallback(
    (projectIds: string[]) => {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        for (const id of projectIds) {
          next.add(id);
        }
        return next;
      });
    },
    [setSelectedIds],
  );

  const toggleGroup = useCallback((status: ProjectStatus) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return next;
    });
  }, []);
  const filteredThreads = useMemo(
    () =>
      data.threads.filter(
        (t) =>
          selectedIds.has(t.projectId) && (!isSearchActive || filteredProjectIds.has(t.projectId)),
      ),
    [data.threads, selectedIds, isSearchActive, filteredProjectIds],
  );

  const filteredBeads = useMemo(
    () =>
      data.beads.filter(
        (b) =>
          selectedIds.has(b.projectId) && (!isSearchActive || filteredProjectIds.has(b.projectId)),
      ),
    [data.beads, selectedIds, isSearchActive, filteredProjectIds],
  );

  const filteredSpecialty = useMemo(
    () =>
      data.specialty.filter(
        (s) =>
          selectedIds.has(s.projectId) && (!isSearchActive || filteredProjectIds.has(s.projectId)),
      ),
    [data.specialty, selectedIds, isSearchActive, filteredProjectIds],
  );

  const filteredFabrics = useMemo(
    () =>
      data.fabrics.filter(
        (f) =>
          selectedIds.has(f.projectId) && (!isSearchActive || filteredProjectIds.has(f.projectId)),
      ),
    [data.fabrics, selectedIds, isSearchActive, filteredProjectIds],
  );
  const handleUpdateAcquired = useCallback(
    (type: "thread" | "bead" | "specialty", junctionId: string, quantity: number) => {
      setFailedIds((prev) => {
        if (!prev.has(junctionId)) return prev;
        const next = new Set(prev);
        next.delete(junctionId);
        return next;
      });

      setPendingIds((prev) => new Set(prev).add(junctionId));

      startTransition(async () => {
        try {
          const result = await updateSupplyAcquired(type, junctionId, quantity);
          if (result.success) {
            toast.success("Supply quantity updated");
          } else {
            setFailedIds((prev) => new Set(prev).add(junctionId));
            toast.error(result.error ?? "Failed to update supply");
          }
        } catch (e) {
          console.error("updateSupplyAcquired failed:", e);
          setFailedIds((prev) => new Set(prev).add(junctionId));
          toast.error("Something went wrong. Try again.");
        } finally {
          setPendingIds((prev) => {
            const next = new Set(prev);
            next.delete(junctionId);
            return next;
          });
        }
      });
    },
    [],
  );
  const selectedProjects = useMemo(
    () => data.projects.filter((p) => selectedIds.has(p.projectId)),
    [data.projects, selectedIds],
  );

  const hasSelection = selectedIds.size > 0;

  const visibleSelectedCount = useMemo(
    () => filteredProjects.filter((p) => selectedIds.has(p.projectId)).length,
    [filteredProjects, selectedIds],
  );
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
  return (
    <div>
      <ShoppingForBar
        selectedProjects={selectedProjects}
        onRemove={removeProject}
        onClearAll={clearAll}
      />

      <div className="mt-4">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search projects..."
          ariaLabel="Search projects"
        />
      </div>

      <Tabs defaultValue="projects" className="mt-4">
        <TabsList variant="line" className="w-full">
          <TabsTrigger value="projects">
            Projects
            <Badge count={projectsWithNeeds.length} />
          </TabsTrigger>
          <TabsTrigger value="list" className={cn(!hasSelection && "opacity-50")}>
            Shopping List
            <Badge count={listBadge} />
          </TabsTrigger>
        </TabsList>

        <div className="pt-6 pb-12">
          <TabsContent value="projects">
            <div
              className="bg-muted mb-5 inline-flex rounded-lg p-1"
              role="group"
              aria-label="View mode"
            >
              <button
                type="button"
                aria-pressed={viewMode === "by-project"}
                onClick={() => setViewMode("by-project")}
                className={cn(
                  "focus-visible:ring-ring rounded-md px-3.5 py-1.5 text-sm font-medium transition-all outline-none focus-visible:ring-2",
                  viewMode === "by-project"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                By Project
              </button>
              <button
                type="button"
                aria-pressed={viewMode === "by-supply"}
                onClick={() => setViewMode("by-supply")}
                className={cn(
                  "focus-visible:ring-ring rounded-md px-3.5 py-1.5 text-sm font-medium transition-all outline-none focus-visible:ring-2",
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
                projects={filteredProjects}
                selectedIds={selectedIds}
                imageUrls={imageUrls}
                threads={filteredThreads}
                beads={filteredBeads}
                specialty={filteredSpecialty}
                fabrics={filteredFabrics}
                onToggle={toggleProject}
                onSelectAll={isSearchActive ? selectVisible : selectAll}
                selectAllLabel={isSearchActive ? "Select visible" : "Select all"}
                onSelectGroup={selectGroup}
                onUpdateAcquired={handleUpdateAcquired}
                pendingIds={pendingIds}
                failedIds={failedIds}
                collapsedGroups={collapsedGroups}
                onToggleGroup={toggleGroup}
                isSearchActive={isSearchActive}
                selectedCount={selectedIds.size}
                totalCount={projectsWithNeeds.length}
                visibleCount={filteredProjects.length}
                visibleSelectedCount={visibleSelectedCount}
              />
            ) : (
              <SupplyOverview
                threads={filteredThreads}
                beads={filteredBeads}
                specialty={filteredSpecialty}
                fabrics={filteredFabrics}
                onUpdateAcquired={handleUpdateAcquired}
                pendingIds={pendingIds}
                failedIds={failedIds}
                supplySearchQuery={supplySearchQuery}
                onSupplySearchChange={setSupplySearchQuery}
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

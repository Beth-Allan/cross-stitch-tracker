"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ShoppingForBar } from "./shopping-for-bar";
import { ProjectSelectionList } from "./project-selection-list";
import { SupplyTab } from "./supply-tab";
import { FabricTab } from "./fabric-tab";
import { ShoppingListTab } from "./shopping-list-tab";
import { updateSupplyAcquired } from "@/lib/actions/shopping-cart-actions";
import type { ShoppingCartData } from "@/types/dashboard";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "shopping-cart-selected-projects";

/* ─── usePersistedSelection ─────────────────────────────────────────────── */

function usePersistedSelection(validProjectIds: string[]) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set<string>();

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return new Set<string>();

      const parsed = JSON.parse(stored) as string[];
      if (!Array.isArray(parsed)) return new Set<string>();

      // Filter out stale IDs (D-10)
      const validSet = new Set(validProjectIds);
      const filtered = parsed.filter((id) => validSet.has(id));
      return new Set(filtered);
    } catch {
      return new Set<string>();
    }
  });

  // Sync to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(selectedIds)));
    } catch {
      // localStorage may be unavailable
    }
  }, [selectedIds]);

  return [selectedIds, setSelectedIds] as const;
}

/* ─── ShoppingCart ───────────────────────────────────────────────────────── */

interface ShoppingCartProps {
  data: ShoppingCartData;
  imageUrls: Record<string, string>;
}

export function ShoppingCart({ data, imageUrls }: ShoppingCartProps) {
  const validProjectIds = useMemo(
    () => data.projects.map((p) => p.projectId),
    [data.projects],
  );

  const [selectedIds, setSelectedIds] = usePersistedSelection(validProjectIds);
  const [isPending, startTransition] = useTransition();

  /* ── Selection handlers ─────────────────────────────────── */

  const toggleProject = useCallback((projectId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(projectId)) next.delete(projectId);
      else next.add(projectId);
      return next;
    });
  }, [setSelectedIds]);

  const removeProject = useCallback((projectId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(projectId);
      return next;
    });
  }, [setSelectedIds]);

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

  /* ── Badge counts (unfulfilled items) ───────────────────── */

  const threadBadge = useMemo(
    () => filteredThreads.filter((t) => t.quantityAcquired < t.quantityRequired).length,
    [filteredThreads],
  );

  const beadBadge = useMemo(
    () => filteredBeads.filter((b) => b.quantityAcquired < b.quantityRequired).length,
    [filteredBeads],
  );

  const specialtyBadge = useMemo(
    () =>
      filteredSpecialty.filter((s) => s.quantityAcquired < s.quantityRequired).length,
    [filteredSpecialty],
  );

  const fabricBadge = useMemo(
    () => filteredFabrics.filter((f) => !f.hasFabric).length,
    [filteredFabrics],
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

  /* ── Tab badge renderer ─────────────────────────────────── */

  function Badge({ count }: { count: number }) {
    if (count === 0) return null;
    return (
      <span className="bg-muted text-muted-foreground font-mono text-[11px] font-bold px-1.5 py-0.5 rounded-full ml-1">
        {count}
      </span>
    );
  }

  /* ── Render ─────────────────────────────────────────────── */

  return (
    <div>
      {/* Shopping-for bar */}
      <ShoppingForBar
        selectedProjects={selectedProjects}
        onRemove={removeProject}
        onClearAll={clearAll}
      />

      {/* Tabbed layout */}
      <Tabs defaultValue="projects" className="mt-4">
        <TabsList variant="line" className="w-full overflow-x-auto">
          <TabsTrigger value="projects">
            Projects
            <Badge count={data.projects.length} />
          </TabsTrigger>
          <TabsTrigger
            value="threads"
            className={cn(!hasSelection && "opacity-50")}
          >
            Threads
            <Badge count={threadBadge} />
          </TabsTrigger>
          <TabsTrigger
            value="beads"
            className={cn(!hasSelection && "opacity-50")}
          >
            Beads
            <Badge count={beadBadge} />
          </TabsTrigger>
          <TabsTrigger
            value="specialty"
            className={cn(!hasSelection && "opacity-50")}
          >
            Specialty
            <Badge count={specialtyBadge} />
          </TabsTrigger>
          <TabsTrigger
            value="fabric"
            className={cn(!hasSelection && "opacity-50")}
          >
            Fabric
            <Badge count={fabricBadge} />
          </TabsTrigger>
          <TabsTrigger
            value="list"
            className={cn(!hasSelection && "opacity-50")}
          >
            Shopping List
          </TabsTrigger>
        </TabsList>

        <div className="pt-6 pb-12">
          <TabsContent value="projects">
            <ProjectSelectionList
              projects={data.projects}
              selectedIds={selectedIds}
              imageUrls={imageUrls}
              onToggle={toggleProject}
              onSelectAll={selectAll}
            />
          </TabsContent>

          <TabsContent value="threads">
            <SupplyTab
              supplies={filteredThreads}
              type="thread"
              onUpdateAcquired={handleUpdateAcquired}
              isPending={isPending}
            />
          </TabsContent>

          <TabsContent value="beads">
            <SupplyTab
              supplies={filteredBeads}
              type="bead"
              onUpdateAcquired={handleUpdateAcquired}
              isPending={isPending}
            />
          </TabsContent>

          <TabsContent value="specialty">
            <SupplyTab
              supplies={filteredSpecialty}
              type="specialty"
              onUpdateAcquired={handleUpdateAcquired}
              isPending={isPending}
            />
          </TabsContent>

          <TabsContent value="fabric">
            <FabricTab fabrics={filteredFabrics} />
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

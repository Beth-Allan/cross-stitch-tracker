# Phase 39: Accessibility & Performance - Pattern Map

**Mapped:** 2026-07-01
**Files analyzed:** 4 (modified)
**Analogs found:** 4 / 4

## File Classification

| Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---------------|------|-----------|----------------|---------------|
| `src/components/features/storage/storage-location-list.tsx` | component | request-response | `src/components/features/designers/designer-list.tsx` (DesignerCard) | exact |
| `src/components/features/apps/stitching-app-list.tsx` | component | request-response | `src/components/features/storage/storage-location-list.tsx` (mirror) | exact |
| `src/components/features/shopping/supply-overview.tsx` | component | transform | `src/components/features/shopping/shopping-cart.tsx` (useMemo chains) | exact |
| `src/components/features/supplies/supply-catalog.tsx` | component | request-response | `src/components/features/shopping/shopping-cart.tsx` (usePersistedViewMode) | exact |

## Pattern Assignments

### `storage-location-list.tsx` — ARIA Stretched Link Refactor

**Analog:** `src/components/features/designers/designer-list.tsx` (DesignerCard, lines 385-445)

The DesignerCard shows the correct ARIA pattern: Link as a sibling to action buttons within a non-interactive container. No `role="button"`, no `onKeyDown` handler, no `tabIndex={0}` on the outer div.

**Valid card pattern** (designer-list.tsx lines 394-443):
```tsx
function DesignerCard({ designer, onEdit, onDelete }: { ... }) {
  return (
    <div
      className="border-border bg-card rounded-xl border p-4"
      role="group"
      aria-labelledby={`designer-card-${designer.id}`}
    >
      <div className="mb-2 flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <Link
            id={`designer-card-${designer.id}`}
            href={`/designers/${designer.id}`}
            className="text-foreground hover:text-primary block truncate text-sm font-semibold transition-colors"
          >
            {designer.name}
          </Link>
        </div>
        <div className="ml-2 flex shrink-0 items-center gap-1">
          <button type="button" onClick={onEdit} aria-label={`Edit ${designer.name}`}>
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={onDelete} aria-label={`Delete ${designer.name}`}>
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
```

**Gallery card decorative link** (gallery-card.tsx line 158):
```tsx
<Link href={`/charts/${card.chartId}`} className="block" tabIndex={-1} aria-hidden="true">
```

**Current ARIA-violating pattern to replace** (storage-location-list.tsx lines 233-246):
```tsx
<div
  role="button"
  aria-label={`Navigate to ${location.name}`}
  tabIndex={0}
  onClick={onNavigate}
  onKeyDown={(e) => {
    if (e.key === "Enter" || e.key === " ") {
      if (e.target instanceof HTMLElement && e.target.closest("button")) return;
      e.preventDefault();
      onNavigate();
    }
  }}
  className="group border-border bg-card hover:border-border/80 flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 shadow-sm transition-[box-shadow,border-color] hover:shadow-md"
>
```

**Target stretched link pattern** (per D-01, D-02, D-03):
- Remove `role="button"`, `tabIndex={0}`, `onClick`, `onKeyDown` from outer div
- Add `relative` to outer div class
- Insert `<Link>` with `absolute inset-0 z-0` as first child, containing `<span className="sr-only">`
- Add `relative z-10` to the button group div
- Keep `group` class and hover effects on outer div (D-04)

**sr-only pattern** (used throughout codebase, e.g. dialog.tsx line 71):
```tsx
<span className="sr-only">Close</span>
```

---

### `stitching-app-list.tsx` — ARIA Stretched Link Refactor

**Analog:** Same as `storage-location-list.tsx` — these two files are structurally identical (mirror components per CONTEXT D-06). Apply the exact same stretched link transformation.

**Current ARIA-violating pattern** (stitching-app-list.tsx lines 228-241):
```tsx
<div
  role="button"
  aria-label={`Navigate to ${app.name}`}
  tabIndex={0}
  onClick={onNavigate}
  onKeyDown={(e) => {
    if (e.key === "Enter" || e.key === " ") {
      if (e.target instanceof HTMLElement && e.target.closest("button")) return;
      e.preventDefault();
      onNavigate();
    }
  }}
  className="group border-border bg-card hover:border-border/80 flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 shadow-sm transition-[box-shadow,border-color] hover:shadow-md"
>
```

**Props change:** Remove `onNavigate` prop — replace with href string prop for the Link. The parent passes `router.push(`/apps/${app.id}`)` which becomes `href={`/apps/${app.id}`}`.

---

### `supply-overview.tsx` — useMemo Memoization

**Analog:** `src/components/features/shopping/shopping-cart.tsx` (lines 109-238)

The shopping cart is the direct parent component that renders SupplyOverview. It already uses extensive `useMemo` chains for filtering data passed to SupplyOverview. The pattern to copy: `useMemo` with explicit dependency arrays wrapping data transformation calls.

**useMemo for data filtering** (shopping-cart.tsx lines 204-238):
```tsx
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
```

**useMemo for derived computations** (shopping-cart.tsx lines 109-119):
```tsx
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
```

**useMemo in supply-catalog for filtering** (supply-catalog.tsx lines 251-286):
```tsx
const filteredThreads = useMemo(() => {
  let result = threads;
  if (brandFilter) result = result.filter((t) => t.brandId === brandFilter);
  if (colorFamilyFilter) result = result.filter((t) => t.colorFamily === colorFamilyFilter);
  if (search) {
    const q = search.toLowerCase();
    result = result.filter(
      (t) => t.colorCode.toLowerCase().includes(q) || t.colorName.toLowerCase().includes(q),
    );
  }
  return result;
}, [threads, brandFilter, colorFamilyFilter, search]);
```

**Current unmemoized calls to wrap** (supply-overview.tsx lines 103-109):
```tsx
const aggregatedThreads = aggregateSupplies(threads);
const aggregatedBeads = aggregateSupplies(beads);
const aggregatedSpecialty = aggregateSupplies(specialty);

const filteredAggThreads = filterAggregatedSupplies(aggregatedThreads, deferredSearch);
const filteredAggBeads = filterAggregatedSupplies(aggregatedBeads, deferredSearch);
const filteredAggSpecialty = filterAggregatedSupplies(aggregatedSpecialty, deferredSearch);
```

**Target pattern:** 6 useMemo calls — 3 for aggregation (dep: `[threads]`, `[beads]`, `[specialty]`), 3 for filtering (dep: `[aggregatedX, deferredSearch]`). Note: `useDeferredValue` already imported (line 3); add `useMemo` to the import.

---

### `supply-catalog.tsx` — SSR Hydration Fix

**Analog:** `src/components/features/shopping/shopping-cart.tsx` (usePersistedViewMode, lines 67-91)

The shopping cart's `usePersistedViewMode` hook demonstrates the established pattern: initialize with default value, then useEffect reads localStorage post-mount.

**usePersistedViewMode pattern** (shopping-cart.tsx lines 67-91):
```tsx
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
```

**Simpler variant from shopping-list-tab** (shopping-list-tab.tsx lines 94-120):
```tsx
const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
const [hydrated, setHydrated] = useState(false);

useEffect(() => {
  try {
    const stored = localStorage.getItem("shopping-list-checked");
    if (stored) {
      const parsed = JSON.parse(stored) as string[];
      if (Array.isArray(parsed)) {
        setCheckedItems(new Set(parsed));
      }
    }
  } catch {
    // localStorage may be unavailable (private browsing, SSR)
  }
  setHydrated(true);
}, []);

useEffect(() => {
  if (!hydrated) return;
  try {
    localStorage.setItem("shopping-list-checked", JSON.stringify(Array.from(checkedItems)));
  } catch {
    // localStorage may be unavailable (private browsing, SSR)
  }
}, [checkedItems, hydrated]);
```

**Current SSR-unsafe pattern to replace** (supply-catalog.tsx lines 190-209):
```tsx
const [viewModes, setViewModes] = useState<Record<SupplyTab, ViewMode>>(() => {
  const modes = { ...DEFAULT_VIEWS };
  if (initialView) {
    modes.threads = initialView;
  }
  if (typeof window !== "undefined") {
    try {
      for (const tab of TAB_CONFIG) {
        if (tab.key === "threads" && initialView) continue;
        const stored = localStorage.getItem(STORAGE_KEYS[tab.key]);
        if (stored === "grid" || stored === "table") {
          modes[tab.key] = stored;
        }
      }
    } catch (error) {
      console.error("Load supply view modes failed:", error);
    }
  }
  return modes;
});
```

**Target pattern:**
1. Initialize `viewModes` with `DEFAULT_VIEWS` (applying `initialView` override for threads tab)
2. `useEffect([], ...)` reads localStorage for all tabs (skipping threads if `initialView` is set)
3. Existing `setViewMode` callback already persists to localStorage on change (lines 234-248) -- no write-side useEffect needed

**Note on sidebar.tsx:** The sidebar (line 21-24) has the same `typeof window` anti-pattern. Per D-11, do NOT fix it in this phase.

---

## Shared Patterns

### Import Convention
**Source:** All target files already follow project import conventions.
**Apply to:** All 4 modified files

```tsx
import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
```

- `useMemo` added to supply-overview.tsx import
- `useEffect` added to supply-catalog.tsx import (already has `useMemo`, `useCallback`)
- `Link` from `next/link` added to storage-location-list.tsx and stitching-app-list.tsx

### Error Handling in localStorage
**Source:** `src/components/features/shopping/shopping-cart.tsx` (lines 45-47, 59-61)
**Apply to:** supply-catalog.tsx

```tsx
try {
  const stored = localStorage.getItem(STORAGE_KEYS[tab.key]);
  if (stored === "grid" || stored === "table") {
    modes[tab.key] = stored;
  }
} catch {
  // localStorage may be unavailable (private browsing, SSR)
}
```

### Button Group Styling (z-index layering)
**Source:** Both storage-location-list.tsx and stitching-app-list.tsx (lines 261, 256 respectively)
**Apply to:** Same files after stretched link refactor

Current pattern:
```tsx
<div className="flex shrink-0 items-center gap-1 transition-opacity group-focus-within:opacity-100 md:opacity-0 md:group-hover:opacity-100">
```

After refactor, add `relative z-10`:
```tsx
<div className="relative z-10 flex shrink-0 items-center gap-1 transition-opacity group-focus-within:opacity-100 md:opacity-0 md:group-hover:opacity-100">
```

## No Analog Found

No files without analogs. All 4 modifications have exact-match patterns in the existing codebase.

## Metadata

**Analog search scope:** `src/components/features/`, `src/components/shell/`, `src/components/ui/`
**Files scanned:** 12 (4 targets, 5 analogs, 3 reference files)
**Pattern extraction date:** 2026-07-01

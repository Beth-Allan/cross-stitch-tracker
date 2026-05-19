# Phase 25: Shopping Cart Scaling - Pattern Map

**Mapped:** 2026-05-18
**Files analyzed:** 7 new/modified files
**Analogs found:** 7 / 7

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/components/features/shopping/project-search-input.tsx` | component | request-response | `src/components/features/gallery/filter-bar.tsx` | exact |
| `src/components/features/shopping/supply-search-input.tsx` | component | request-response | `src/components/features/gallery/filter-bar.tsx` | exact |
| `src/components/features/shopping/status-group.tsx` | component | request-response | `src/components/features/shopping/project-accordion.tsx` | role-match |
| `src/components/features/shopping/selection-counter.tsx` | component | request-response | `src/components/features/shopping/project-accordion.tsx` (lines 66-78) | role-match |
| `src/components/features/shopping/shopping-cart.tsx` | component | transform | self (existing file, modified) | exact |
| `src/components/features/shopping/project-accordion.tsx` | component | transform | self (existing file, modified) | exact |
| `src/components/features/shopping/supply-overview.tsx` | component | transform | self (existing file, modified) | exact |

## Pattern Assignments

### `src/components/features/shopping/project-search-input.tsx` (NEW, component, request-response)

**Analog:** `src/components/features/gallery/filter-bar.tsx`

**Imports pattern** (lines 1-6):
```typescript
"use client";

import { Search, X } from "lucide-react";
```

**Core search input pattern** (lines 37-59):
```typescript
<div className="relative w-full max-w-[280px] flex-shrink-0 sm:w-auto" data-search-wrapper>
  <Search
    className="text-muted-foreground/60 absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2"
    strokeWidth={1.5}
  />
  <input
    type="text"
    value={search}
    onChange={(e) => onSearchChange(e.target.value)}
    placeholder="Search projects..."
    aria-label="Search projects"
    className="border-border bg-card placeholder:text-muted-foreground focus:border-ring focus:ring-ring w-full rounded-lg border py-2 pr-8 pl-9 text-sm focus:ring-1 focus:outline-none"
  />
  {search.length > 0 && (
    <button
      type="button"
      onClick={() => onSearchChange("")}
      aria-label="Clear search"
      className="text-muted-foreground hover:text-foreground focus-visible:ring-ring absolute top-1/2 right-2.5 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-sm transition-colors outline-none focus-visible:ring-2"
    >
      <X className="h-3.5 w-3.5" strokeWidth={2} />
    </button>
  )}
</div>
```

**Key notes:**
- Remove `max-w-[280px]` constraint -- this input should be `w-full` per D-01 (single input above view toggle)
- Change placeholder/aria-label to match shopping context
- Reuse exact icon sizing, positioning, focus ring, and semantic token classes

---

### `src/components/features/shopping/supply-search-input.tsx` (NEW, component, request-response)

**Analog:** `src/components/features/gallery/filter-bar.tsx` (same search input pattern)

Same core pattern as `project-search-input.tsx` above. Differences:
- Placeholder: "Search supplies..." 
- aria-label: "Search supplies"
- Positioned within the By Supply view, not above view toggle

---

### `src/components/features/shopping/status-group.tsx` (NEW, component, request-response)

**Analog 1 (expand/collapse):** `src/components/features/shopping/project-accordion.tsx`

**Expand/collapse pattern** (lines 51-60):
```typescript
const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());

const toggleExpand = useCallback((projectId: string) => {
  setExpandedIds((prev) => {
    const next = new Set(prev);
    if (next.has(projectId)) next.delete(projectId);
    else next.add(projectId);
    return next;
  });
}, []);
```

**Expand button + chevron pattern** (lines 142-168):
```typescript
<button
  type="button"
  onClick={() => toggleExpand(project.projectId)}
  className="flex min-w-0 flex-1 items-center gap-2 text-left"
  aria-expanded={isExpanded}
  aria-label={`${isExpanded ? "Collapse" : "Expand"} ${project.projectName} supplies`}
>
  {/* ... */}
  <ChevronRight
    className={cn(
      "text-muted-foreground h-4 w-4 shrink-0 transition-transform",
      isExpanded && "rotate-90",
    )}
  />
</button>
```

**Analog 2 (status config):** `src/lib/utils/status.ts`

**Status config access pattern** (lines 1-4, 12):
```typescript
import type { ProjectStatus } from "@/generated/prisma/client";

export const STATUS_CONFIG: Record<
  ProjectStatus,
  { label: string; dotClass: string; /* ... */ }
> = { /* ... */ };
```

**Analog 3 (status badge dot):** `src/components/features/charts/status-badge.tsx`

**Status dot rendering pattern** (lines 24-28):
```typescript
<span
  aria-hidden="true"
  className={cn("h-1.5 w-1.5 rounded-full transition-colors duration-200", config.dotClass)}
/>
{config.label}
```

**Analog 4 (count badge):** `src/components/features/shopping/shopping-cart.tsx`

**Badge pattern** (lines 84-91):
```typescript
function Badge({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <span className="bg-muted text-muted-foreground ml-1 rounded-full px-1.5 py-0.5 font-mono text-[11px] font-bold">
      {count}
    </span>
  );
}
```

**Analog 5 (select all button):** `src/components/features/shopping/project-accordion.tsx`

**"Select all" button pattern** (lines 71-78):
```typescript
<button
  type="button"
  onClick={onSelectAll}
  className="text-progress-foreground hover:text-selected-foreground text-xs font-medium transition-colors"
>
  Select all
</button>
```

---

### `src/components/features/shopping/selection-counter.tsx` (NEW, component, request-response)

**Analog:** `src/components/features/shopping/project-accordion.tsx`

**Selection counter pattern** (lines 67-70):
```typescript
<p className="text-muted-foreground text-sm">
  {selectedIds.size} of {projects.length} project
  {projects.length !== 1 ? "s" : ""} selected
</p>
```

**Key extension:** D-09 requires dual-mode counter:
- Normal: `{selected} of {total} projects selected`
- During search: `{visibleSelected} of {visibleCount} visible selected ({totalSelected} total selected)`
- Add `aria-live="polite"` for screen reader announcements

---

### `src/components/features/shopping/shopping-cart.tsx` (MODIFIED, component, transform)

**Self-analog.** Key patterns to extend (not replace):

**Search state pattern** -- model after gallery's `useDeferredValue`:

From `src/components/features/gallery/use-gallery-filters.ts` (lines 70-71, 81):
```typescript
const [search, setSearch] = useQueryState("search", parseAsString.withDefault(""));
const deferredSearch = useDeferredValue(search);
```

For shopping cart, use `useState` (not URL state) since search is ephemeral per anti-patterns:
```typescript
const [searchQuery, setSearchQuery] = useState("");
const deferredSearch = useDeferredValue(searchQuery);
```

**Filtered data with useMemo pattern** -- extend existing (lines 154-172):
```typescript
const filteredThreads = useMemo(
  () => data.threads.filter((t) => selectedIds.has(t.projectId)),
  [data.threads, selectedIds],
);
```

Add project search filtering before selection filtering:
```typescript
const filteredProjects = useMemo(() => {
  if (!deferredSearch) return projectsWithNeeds;
  const lower = deferredSearch.toLowerCase();
  return projectsWithNeeds.filter(
    (p) => p.projectName.toLowerCase().includes(lower),
  );
}, [projectsWithNeeds, deferredSearch]);
```

**Selection handler pattern** -- extend existing (lines 121-151):
```typescript
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
```

Add `selectVisible` and `selectGroup` using same `Set` mutation pattern:
```typescript
const selectVisible = useCallback(() => {
  setSelectedIds((prev) => {
    const next = new Set(prev);
    for (const id of filteredProjectIds) {
      next.add(id);
    }
    return next;
  });
}, [setSelectedIds, filteredProjectIds]);
```

---

### `src/components/features/shopping/project-accordion.tsx` (MODIFIED, component, transform)

**Self-analog.** Key changes:

**Current flat rendering** (lines 80-257) -- needs to render within StatusGroup wrappers instead of flat `projects.map()`.

**Props interface pattern** (lines 18-35):
```typescript
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
  onUpdateAcquired: (
    type: "thread" | "bead" | "specialty",
    junctionId: string,
    quantity: number,
  ) => void;
  pendingIds: Set<string>;
  failedIds: Set<string>;
}
```

Will need to extend with:
- `groupedProjects: Map<ProjectStatus, ShoppingCartProject[]>` or accept already-grouped data
- `onSelectGroup: (projectIds: string[]) => void` for per-group "Select all"
- Remove the inline selection counter (moved to `SelectionCounter` component)

---

### `src/components/features/shopping/supply-overview.tsx` (MODIFIED, component, transform)

**Self-analog.** Key patterns to extend:

**aggregateSupplies function** (lines 35-60):
```typescript
function aggregateSupplies(supplies: ShoppingSupplyNeed[]): AggregatedSupply[] {
  const map = new Map<string, AggregatedSupply>();
  for (const supply of supplies) {
    const existing = map.get(supply.supplyId);
    if (existing) {
      existing.totalRequired += supply.quantityRequired;
      existing.totalAcquired += supply.quantityAcquired;
      existing.items.push(supply);
    } else {
      map.set(supply.supplyId, {
        supplyId: supply.supplyId,
        brandName: supply.brandName,
        code: supply.code,
        colorName: supply.colorName,
        hexColor: supply.hexColor,
        unit: supply.unit,
        totalRequired: supply.quantityRequired,
        totalAcquired: supply.quantityAcquired,
        items: [supply],
      });
    }
  }
  return Array.from(map.values());
}
```

**Critical anti-pattern:** Supply search must filter AFTER `aggregateSupplies()`, never before. Filter the `AggregatedSupply[]` output, not the raw `ShoppingSupplyNeed[]` input.

**AggregatedSupply type** (lines 23-33) -- search will filter on these fields:
```typescript
interface AggregatedSupply {
  supplyId: string;
  brandName: string;
  code: string;
  colorName: string;
  hexColor: string | null;
  unit: string;
  totalRequired: number;
  totalAcquired: number;
  items: ShoppingSupplyNeed[];
}
```

**Empty state pattern** (lines 74-80):
```typescript
if (!hasAny) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <ShoppingBag className="text-muted-foreground/40 mb-3 h-8 w-8" />
      <p className="text-muted-foreground text-sm">Select projects to see supply needs</p>
    </div>
  );
}
```

Add a second empty state for "no search results" using the same pattern or the `EmptyState` component.

**Section auto-hide pattern** (lines 89-119) -- already conditionally renders sections:
```typescript
{aggregatedThreads.length > 0 && (
  <SupplySection label="Threads" aggregated={aggregatedThreads} /* ... */ />
)}
```

Same pattern naturally handles D-06 (supply sections with zero matches auto-hide during search).

---

## Shared Patterns

### Search Input Styling
**Source:** `src/components/features/gallery/filter-bar.tsx` lines 37-59
**Apply to:** `project-search-input.tsx`, `supply-search-input.tsx`

Exact CSS classes for the search input:
```
border-border bg-card placeholder:text-muted-foreground focus:border-ring focus:ring-ring w-full rounded-lg border py-2 pr-8 pl-9 text-sm focus:ring-1 focus:outline-none
```

Search icon positioning:
```
text-muted-foreground/60 absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2
```

Clear button styling:
```
text-muted-foreground hover:text-foreground focus-visible:ring-ring absolute top-1/2 right-2.5 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-sm transition-colors outline-none focus-visible:ring-2
```

### Set Mutation (Immutable)
**Source:** `src/components/features/shopping/shopping-cart.tsx` lines 121-131
**Apply to:** All selection handlers (`selectVisible`, `selectGroup`, `toggleProject`)

```typescript
setSelectedIds((prev) => {
  const next = new Set(prev);
  // mutate `next`, never `prev`
  return next;
});
```

### Status Configuration Access
**Source:** `src/lib/utils/status.ts` (full file)
**Apply to:** `status-group.tsx`

```typescript
import type { ProjectStatus } from "@/generated/prisma/client";
import { STATUS_CONFIG } from "@/lib/utils/status";

const config = STATUS_CONFIG[status];
// config.label, config.dotClass, config.bgClass, config.textClass
```

### useDeferredValue for Non-Blocking Search
**Source:** `src/components/features/gallery/use-gallery-filters.ts` line 81
**Apply to:** `shopping-cart.tsx` (search state)

```typescript
import { useDeferredValue } from "react";

const deferredSearch = useDeferredValue(searchQuery);
// Use deferredSearch in useMemo deps, not searchQuery
```

### Test Infrastructure
**Source:** `src/components/features/shopping/shopping-cart.test.tsx` lines 1-35
**Apply to:** All new test files (`status-group.test.tsx`, `selection-counter.test.tsx`)

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@/__tests__/test-utils";
import userEvent from "@testing-library/user-event";
```

**localStorage mock pattern** (lines 11-35):
```typescript
let localStore: Record<string, string> = {};

const localStorageMock = {
  getItem: vi.fn((key: string) => localStore[key] ?? null),
  setItem: vi.fn((key: string, value: string) => {
    localStore[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete localStore[key];
  }),
  clear: vi.fn(() => {
    localStore = {};
  }),
  get length() {
    return Object.keys(localStore).length;
  },
  key: vi.fn((index: number) => Object.keys(localStore)[index] ?? null),
};

beforeEach(() => {
  localStore = {};
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  vi.stubGlobal("localStorage", localStorageMock);
});
```

**Mock data factory pattern** (from `project-accordion.test.tsx` lines 20-36):
```typescript
function makeProject(overrides?: Partial<ShoppingCartProject>): ShoppingCartProject {
  return {
    projectId: "p1",
    chartId: "c1",
    projectName: "Test Project",
    designerName: "Test Designer",
    coverThumbnailUrl: null,
    focalPointX: null,
    focalPointY: null,
    status: "IN_PROGRESS",
    threadCount: 5,
    beadCount: 0,
    specialtyCount: 0,
    fabricNeeded: false,
    ...overrides,
  };
}
```

**Supply mock factory** (from `supply-overview.test.tsx` lines 6-21):
```typescript
function createMockSupplyNeed(overrides: Partial<ShoppingSupplyNeed> = {}): ShoppingSupplyNeed {
  return {
    junctionId: "junction-1",
    supplyId: "supply-1",
    brandName: "DMC",
    code: "310",
    colorName: "Black",
    hexColor: "#000000",
    quantityRequired: 3,
    quantityAcquired: 1,
    unit: "skein",
    projectId: "project-1",
    projectName: "Test Project",
    ...overrides,
  };
}
```

**Component dependency mocks** (from `project-accordion.test.tsx` lines 7-18):
```typescript
vi.mock("next/image", () => ({
  default: ({ unoptimized, ...props }: Record<string, unknown>) => (
    <img data-unoptimized={unoptimized ? "true" : undefined} {...props} />
  ),
}));

vi.mock("@/components/features/charts/status-badge", () => ({
  StatusBadge: ({ status }: { status: string }) => <span>{status}</span>,
}));

vi.mock("@/components/features/supplies/color-swatch", () => ({
  ColorSwatch: () => <span data-testid="swatch" />,
}));
```

### Empty State
**Source:** `src/components/ui/empty-state.tsx` (full file)
**Apply to:** `supply-overview.tsx` (no search results state)

```typescript
import { EmptyState } from "@/components/ui/empty-state";
import { Search } from "lucide-react";

<EmptyState
  icon={Search}
  title="No supplies match your search"
  description="Try a different search term"
/>
```

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| (none) | -- | -- | All files have strong analogs in the existing codebase |

## Metadata

**Analog search scope:** `src/components/features/shopping/`, `src/components/features/gallery/`, `src/lib/utils/`, `src/components/ui/`, `src/components/features/charts/`
**Files scanned:** 12
**Pattern extraction date:** 2026-05-18

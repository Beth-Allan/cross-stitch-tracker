# Phase 34: Browse & Pattern Dive Integration - Pattern Map

**Mapped:** 2026-07-01
**Files analyzed:** 13 (2 new, 11 modified)
**Analogs found:** 13 / 13

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/components/features/charts/series-tab-content.tsx` | component | request-response | `src/components/features/charts/whats-next-tab.tsx` | exact |
| `src/components/features/series/series-card.tsx` | component | request-response | `src/components/features/series/series-list.tsx` (inline `SeriesCard` fn, lines 165-217) | exact |
| `src/components/features/charts/pattern-dive-tabs.tsx` | component | request-response | self (extend existing) | exact |
| `src/components/features/series/series-list.tsx` | component | request-response | self (refactor to import extracted card) | exact |
| `src/components/features/gallery/filter-bar.tsx` | component | request-response | self (add 3rd MultiSelectDropdown) | exact |
| `src/components/features/gallery/filter-chips.tsx` | component | request-response | self (add series chip generation) | exact |
| `src/components/features/gallery/use-gallery-filters.ts` | hook | request-response | self (add seriesFilter state) | exact |
| `src/components/features/gallery/gallery-utils.ts` | utility | transform | self (add series filter predicate) | exact |
| `src/components/features/gallery/gallery-types.ts` | type | N/A | self (add 2 fields) | exact |
| `src/components/features/gallery/project-gallery.tsx` | component | request-response | self (pass series props through) | exact |
| `src/types/chart.ts` | type | N/A | self (add series relation) | exact |
| `src/lib/actions/chart-actions.ts` | server-action | CRUD | self (add series include) | exact |
| `src/app/(dashboard)/charts/page.tsx` | page | request-response | self (add getSeriesWithStats to Promise.all) | exact |

## Pattern Assignments

### `src/components/features/charts/series-tab-content.tsx` (NEW - component, request-response)

**Analog:** `src/components/features/charts/whats-next-tab.tsx`

**Imports pattern** (lines 1-9):
```typescript
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Star, ArrowUpDown } from "lucide-react";
import type { WhatsNextProject } from "@/types/session";
import { StatusBadge } from "@/components/features/charts/status-badge";
import { CoverPlaceholder } from "@/components/features/gallery/cover-placeholder";
```

**Props + data pattern** (lines 47-54):
```typescript
interface WhatsNextTabProps {
  projects: WhatsNextProject[];
  imageUrls: Record<string, string>;
}

export function WhatsNextTab({ projects, imageUrls }: WhatsNextTabProps) {
  const [sort, setSort] = useState<WhatsNextSort>("kitting");
  const sorted = useMemo(() => sortProjects(projects, sort), [projects, sort]);
```

**Empty state pattern** (lines 56-63):
```typescript
if (projects.length === 0) {
  return (
    <div className="text-muted-foreground py-12 text-center text-sm">
      No projects queued up. Flag a project as &quot;Start Next&quot; or start kitting to see it
      here.
    </div>
  );
}
```

**Grid layout pattern** (lines 90):
```typescript
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
```

**Note:** SeriesTabContent should use `EmptyState` component (not bare div) per CP-03 in UI-SPEC. Import from `@/components/ui/empty-state`. Use `heading={false}` (no `<h2>` in tab content).

---

### `src/components/features/series/series-card.tsx` (NEW - extracted from series-list.tsx)

**Analog:** `src/components/features/series/series-list.tsx` lines 165-217 (inline `SeriesCard` function)

**Full card pattern to extract** (lines 165-217):
```typescript
function SeriesCard({ series, onDelete }: { series: SeriesWithStats; onDelete: () => void }) {
  const percent = getCompletionPercent(series);
  const { ownedCount, finishedCount, totalCount } = series.progress;

  return (
    <Link
      href={`/series/${series.id}`}
      className="border-border bg-card hover:border-border/80 block rounded-xl border p-5 transition-all hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="font-heading text-foreground text-sm font-semibold">{series.name}</p>
          {series.designerName && (
            <p className="text-muted-foreground mt-0.5 text-xs">by {series.designerName}</p>
          )}
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete();
          }}
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md p-1.5 transition-colors"
          aria-label={`Delete ${series.name}`}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="bg-muted mt-3 h-2 overflow-hidden rounded-full">
        {ownedCount > 0 && (
          <div className="bg-primary h-full rounded-full" style={{ width: `${percent}%` }} />
        )}
      </div>

      <div className="mt-2 flex items-center justify-between">
        <div className="text-muted-foreground text-xs">
          {totalCount !== null ? (
            <span>
              {finishedCount} of {ownedCount} finished
            </span>
          ) : (
            <span>
              {finishedCount} finished <span aria-hidden="true">&middot;</span> {ownedCount} charts
            </span>
          )}
        </div>
        <span className="text-primary text-sm font-semibold">{percent}%</span>
      </div>
    </Link>
  );
}
```

**Note:** When extracting, make `onDelete` optional. Pattern Dive tab passes no delete handler (D-06: delete lives on /series page only). The `/series` page passes `onDelete`. Use conditional rendering for the delete button.

**Helper to extract** (lines 18-20):
```typescript
function getCompletionPercent(series: SeriesWithStats): number {
  if (series.progress.ownedCount === 0) return 0;
  return Math.round((series.progress.finishedCount / series.progress.ownedCount) * 100);
}
```

---

### `src/components/features/charts/pattern-dive-tabs.tsx` (MODIFY)

**Current tab array** (lines 7-8):
```typescript
export const PATTERN_DIVE_TABS = ["browse", "whats-next", "fabric", "storage"] as const;
export type PatternDiveTab = (typeof PATTERN_DIVE_TABS)[number];
```

**Current TAB_CONFIG** (lines 10-15):
```typescript
const TAB_CONFIG = [
  { value: "browse" as const, label: "Browse", icon: Search },
  { value: "whats-next" as const, label: "What's Next", icon: Star },
  { value: "fabric" as const, label: "Fabric Requirements", icon: Layers },
  { value: "storage" as const, label: "Storage View", icon: MapPin },
] as const;
```

**Current props interface** (lines 17-22):
```typescript
interface PatternDiveTabsProps {
  browseContent: React.ReactNode;
  whatsNextContent: React.ReactNode;
  fabricContent: React.ReactNode;
  storageContent: React.ReactNode;
}
```

**Current contentMap** (lines 35-40):
```typescript
const contentMap: Record<PatternDiveTab, React.ReactNode> = {
  browse: browseContent,
  "whats-next": whatsNextContent,
  fabric: fabricContent,
  storage: storageContent,
};
```

**Tab trigger styling** (line 46):
```typescript
<TabsTrigger key={value} value={value} className="min-h-11 gap-1.5" aria-label={label}>
```

---

### `src/components/features/gallery/filter-bar.tsx` (MODIFY)

**Current props** (lines 7-13):
```typescript
interface FilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string[];
  onStatusToggle: (value: string) => void;
  sizeFilter: string[];
  onSizeToggle: (value: string) => void;
}
```

**MultiSelectDropdown usage pattern** (lines 63-76):
```typescript
<MultiSelectDropdown
  label="Status"
  options={STATUS_OPTIONS}
  selected={statusFilter}
  onToggle={onStatusToggle}
/>

<MultiSelectDropdown
  label="Size"
  options={SIZE_OPTIONS}
  selected={sizeFilter}
  onToggle={onSizeToggle}
/>
```

**Series filter follows same pattern** -- add `seriesFilter: string[]`, `onSeriesToggle: (value: string) => void`, `seriesOptions: { value: string; label: string }[]` to props, then add a 3rd `<MultiSelectDropdown>` after Size.

---

### `src/components/features/gallery/filter-chips.tsx` (MODIFY)

**Current props** (lines 8-16):
```typescript
interface FilterChipsProps {
  search: string;
  statusFilter: string[];
  sizeFilter: string[];
  onRemoveSearch: () => void;
  onRemoveStatus: (value: string) => void;
  onRemoveSize: (value: string) => void;
  onClearAll: () => void;
}
```

**Size chip generation pattern** (lines 60-67 -- replicate for series):
```typescript
for (const size of sizeFilter) {
  result.push({
    key: `size-${size}`,
    label: `Size: ${size}`,
    ariaLabel: `Remove Size: ${size} filter`,
    onRemove: () => onRemoveSize(size),
  });
}
```

**hasFilters check** (line 34):
```typescript
const hasFilters = search.length > 0 || statusFilter.length > 0 || sizeFilter.length > 0;
```

---

### `src/components/features/gallery/use-gallery-filters.ts` (MODIFY)

**Existing array filter state pattern** (lines 71-78):
```typescript
const [statusFilter, setStatusFilter] = useQueryState(
  "status",
  parseAsArrayOf(parseAsString, ",").withDefault([]),
);
const [sizeFilter, setSizeFilter] = useQueryState(
  "size",
  parseAsArrayOf(parseAsString, ",").withDefault([]),
);
```

**Toggle callback pattern** (lines 96-113):
```typescript
const toggleStatus = useCallback(
  (s: string) => {
    void setStatusFilter((prev) => {
      const current = prev ?? [];
      return current.includes(s) ? current.filter((v) => v !== s) : [...current, s];
    });
  },
  [setStatusFilter],
);
```

**clearFilters pattern** (lines 116-120):
```typescript
const clearFilters = useCallback(() => {
  void setSearch("");
  void setStatusFilter([]);
  void setSizeFilter([]);
}, [setSearch, setStatusFilter, setSizeFilter]);
```

**hasActiveFilters pattern** (lines 135-136):
```typescript
const hasActiveFilters =
  search !== "" || (statusFilter ?? []).length > 0 || (sizeFilter ?? []).length > 0;
```

**filterAndSort call pattern** (lines 123-133):
```typescript
const filteredAndSorted = useMemo(
  () =>
    filterAndSort(cards, {
      search: deferredSearch,
      statusFilter: statusFilter ?? [],
      sizeFilter: sizeFilter ?? [],
      sort,
      dir,
    }),
  [cards, deferredSearch, statusFilter, sizeFilter, sort, dir],
);
```

---

### `src/components/features/gallery/gallery-utils.ts` (MODIFY)

**filterAndSort signature** (lines 232-241):
```typescript
export function filterAndSort(
  cards: GalleryCardData[],
  options: {
    search: string;
    statusFilter: string[];
    sizeFilter: string[];
    sort: SortField;
    dir: SortDir;
  },
): GalleryCardData[] {
```

**Existing filter predicate pattern** (lines 253-259):
```typescript
// Status filter
if (options.statusFilter.length > 0) {
  result = result.filter((c) => options.statusFilter.includes(c.status));
}

// Size filter
if (options.sizeFilter.length > 0) {
  result = result.filter((c) => options.sizeFilter.includes(c.sizeCategory));
}
```

**Series filter predicate logic** (from CONTEXT.md D-09): if filter includes `"__unassigned__"`, include cards where `seriesId === null`. If filter includes named series IDs, include cards where `seriesId` matches. If both, union.

**transformToGalleryCard return pattern** (lines 101-131 -- add `seriesId`/`seriesName` fields):
```typescript
return {
  chartId: chart.id,
  // ... existing fields ...
  dateAdded: chart.dateAdded,
};
```

---

### `src/components/features/gallery/gallery-types.ts` (MODIFY)

**GalleryCardData interface** (lines 40-66):
```typescript
export interface GalleryCardData extends OptionalFocalPoint {
  chartId: string;
  // ... existing fields ...
  dateAdded: Date;
}
```

Add `seriesId: string | null` and `seriesName: string | null` to the interface.

---

### `src/types/chart.ts` (MODIFY)

**GalleryChartData type** (lines 52-57):
```typescript
export type GalleryChartData = Chart & {
  project: GalleryProjectData | null;
  designer: Designer | null;
  genres: Genre[];
  _count?: { files: number };
};
```

Add `series: { id: string; name: string } | null` to match the Prisma include.

---

### `src/lib/actions/chart-actions.ts` (MODIFY)

**getChartsForGallery Prisma include** (lines 476-508):
```typescript
export async function getChartsForGallery() {
  const user = await requireAuth();

  return await prisma.chart.findMany({
    where: { project: { userId: user.id } },
    include: {
      project: { select: { /* ... */ } },
      designer: true,
      genres: true,
      _count: { select: { files: true } },
    },
    orderBy: { dateAdded: "desc" },
  });
}
```

Add `series: { select: { id: true, name: true } }` to the include block.

---

### `src/app/(dashboard)/charts/page.tsx` (MODIFY)

**Promise.all data fetching pattern** (lines 17-22):
```typescript
const [charts, whatsNextProjects, fabricRequirements, storageGroups] = await Promise.all([
  getChartsForGallery(),
  getWhatsNextProjects(),
  getFabricRequirements(),
  getStorageGroups(),
]);
```

**Tab content props pattern** (lines 42-47):
```typescript
<PatternDiveTabs
  browseContent={<ProjectGallery charts={charts} imageUrls={imageUrls} hideHeader />}
  whatsNextContent={<WhatsNextTab projects={whatsNextProjects} imageUrls={imageUrls} />}
  fabricContent={<FabricRequirementsTab rows={fabricRequirements} imageUrls={imageUrls} />}
  storageContent={<StorageViewTab groups={storageGroups} imageUrls={imageUrls} />}
/>
```

---

### `src/components/features/gallery/project-gallery.tsx` (MODIFY)

**Current prop threading to FilterBar** (lines 66-73):
```typescript
<FilterBar
  search={search}
  onSearchChange={setSearch}
  statusFilter={statusFilter}
  onStatusToggle={toggleStatus}
  sizeFilter={sizeFilter}
  onSizeToggle={toggleSize}
/>
```

**Current prop threading to FilterChips** (lines 76-84):
```typescript
<FilterChips
  search={search}
  statusFilter={statusFilter}
  sizeFilter={sizeFilter}
  onRemoveSearch={() => setSearch("")}
  onRemoveStatus={toggleStatus}
  onRemoveSize={toggleSize}
  onClearAll={clearFilters}
/>
```

Add `seriesFilter`, `toggleSeries`, and `seriesOptions` through both.

---

## Shared Patterns

### Sort Pills (Series Tab)
**Source:** `src/components/features/series/series-list.tsx` lines 110-140
**Apply to:** `series-tab-content.tsx`
```typescript
<div className="flex items-center gap-2">
  <span className="text-muted-foreground mr-2 text-xs font-semibold tracking-widest uppercase">
    Sort by
  </span>
  {(
    [
      { key: "name" as SortKey, label: "Name" },
      { key: "completion" as SortKey, label: "Completion" },
      { key: "charts" as SortKey, label: "Charts" },
    ] as const
  ).map((opt) => (
    <button
      key={opt.key}
      type="button"
      onClick={() => handleSort(opt.key)}
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
```

### Sort Logic (Series Tab)
**Source:** `src/components/features/series/series-list.tsx` lines 25-76
**Apply to:** `series-tab-content.tsx`
```typescript
const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: "name", dir: "asc" });

function handleSort(key: SortKey) {
  setSort((prev) =>
    prev.key === key ? { key, dir: prev.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" },
  );
}

const sortedSeries = useMemo(() => {
  const result = [...series];
  result.sort((a, b) => {
    const dir = sort.dir === "asc" ? 1 : -1;
    switch (sort.key) {
      case "name":
        return dir * a.name.localeCompare(b.name);
      case "completion": { /* ... */ }
      case "charts":
        return dir * (a.progress.ownedCount - b.progress.ownedCount);
      default:
        return 0;
    }
  });
  return result;
}, [series, sort]);
```

### EmptyState Component
**Source:** `src/components/ui/empty-state.tsx`
**Apply to:** `series-tab-content.tsx` (CP-03 in UI-SPEC)
```typescript
import { EmptyState } from "@/components/ui/empty-state";

<EmptyState
  icon={Library}
  title="No series yet"
  heading={false}
>
  <p className="text-muted-foreground text-sm">
    Create your first series on the{" "}
    <Link href="/series" className="text-primary hover:underline">Series page</Link>.
  </p>
</EmptyState>
```

### Test Wrapper (nuqs)
**Source:** `src/components/features/charts/pattern-dive-tabs.test.tsx` lines 1-4
**Apply to:** All tests involving `PatternDiveTabs` or `useGalleryFilters`
```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@/__tests__/test-utils";
import { withNuqsTestingAdapter } from "nuqs/adapters/testing";
```

### Test Default Props Pattern
**Source:** `src/components/features/gallery/filter-bar.test.tsx` lines 4-12
**Apply to:** FilterBar, FilterChips, ProjectGallery tests
```typescript
const defaultProps = {
  search: "",
  onSearchChange: vi.fn(),
  statusFilter: [] as string[],
  onStatusToggle: vi.fn(),
  sizeFilter: [] as string[],
  onSizeToggle: vi.fn(),
};
```

### Gallery Utils Test Pattern (pure function)
**Source:** `src/components/features/gallery/gallery-utils.test.ts` lines 1-13
**Apply to:** `gallery-utils.test.ts` (extend with series filter tests)
```typescript
import { describe, it, expect } from "vitest";
import { filterAndSort } from "./gallery-utils";
import { createMockGalleryCard } from "@/__tests__/mocks/factories";
```

## No Analog Found

No files in this phase lack a close analog. Every new file (SeriesTabContent, SeriesCard) has an exact match in existing codebase patterns.

## Metadata

**Analog search scope:** `src/components/features/charts/`, `src/components/features/gallery/`, `src/components/features/series/`, `src/lib/actions/`, `src/types/`, `src/app/(dashboard)/charts/`
**Files scanned:** 25+
**Pattern extraction date:** 2026-07-01

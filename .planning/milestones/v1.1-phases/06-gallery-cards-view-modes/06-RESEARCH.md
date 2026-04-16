# Phase 6: Gallery Cards & View Modes - Research

**Researched:** 2026-04-13
**Domain:** React gallery UI, URL state management, client-side filtering/sorting, Prisma query optimization
**Confidence:** HIGH

## Summary

Phase 6 replaces the existing `/charts` page (a simple table + mobile cards) with a full gallery experience: three view modes (gallery cards, compact list, data table), client-side search/filter/sort, and URL-persisted state. The DesignOS reference components provide detailed implementation blueprints that need adaptation to Next.js Server/Client split patterns, real Prisma data, and the project's established conventions.

The core technical challenge is mapping the DesignOS `GalleryCardData` type system (which assumes session/stats data from Phase 9) to the current schema's available fields, while building a clean URL state management layer. All filtering and sorting happens client-side since the dataset (500+ charts, single user) fits comfortably in memory. The server component fetches all data once; the client component handles view state.

**Primary recommendation:** Use `nuqs` for type-safe URL state management (well-tested with Next.js App Router, avoids hand-rolling URLSearchParams parsing). Build gallery components as custom client components following DesignOS patterns, with custom multi-select dropdowns (not shadcn Select). Extend `getCharts` query to include supply `_count` for kitting dot computation.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Build search + status multi-select + size multi-select only. No "More" expander, no secondary filters. The full 12-dimension AdvancedFilterBar is deferred to BRWS-01 (v1.2+).
- **D-02:** Layout is stacked: filter bar row (search + dropdowns) above, then a separator row with "N projects" count on the left and Cards/List/Table toggle on the right.
- **D-03:** Active filter chips appear below the filter bar when any filter is active, with individual dismiss (X) and a "Clear all" link.
- **D-04:** WIP cards show progress bar (stitchesCompleted / stitchCount), stitch count fraction, and supply summary (thread/bead/specialty counts from junction tables). Skip last stitched date, total time, and stitching days since session data doesn't exist until Phase 9.
- **D-05:** Finished cards show celebration border/ring (Finished=violet, FFO=rose), full 100% progress bar, finish/FFO date if set, and supply summary. Skip the stats grid until Phase 9.
- **D-06:** Unstarted cards compute kitting dot status from real data: Fabric = check project linked fabric, Thread/Beads/Specialty = check junction table counts.
- **D-07:** Skip the prep step pipeline entirely.
- **D-08:** Gallery replaces the /charts page entirely. Current table becomes "table" view mode.
- **D-09:** Cards are browse-only. Clicking name navigates to /charts/[id]. No inline edit/delete.
- **D-10:** User-facing labels rename from "Charts" to "Projects". Routes stay /charts, code models stay Chart/Project.
- **D-11:** Sort dropdown on all views. Table also has clickable column headers. Sort state shared across views.
- **D-12:** All view state in URL search params (view, sort, dir, search, filters). Refresh-safe, back-button friendly.
- **D-13:** Default sort: date added, newest first.

### Claude's Discretion
- Gallery card grid column sizing and responsive breakpoints (design shows `minmax(280px, 340px)`)
- List view column layout and responsive hiding
- Empty state design (design has scissors icon + message)
- Cover image placeholder gradient colors per status
- How to determine "chart uses beads/specialty" for kitting dot logic
- Whether to use `nuqs` or manual URL param parsing
- Sort dropdown component implementation

### Deferred Ideas (OUT OF SCOPE)
- Full 12-dimension AdvancedFilterBar (BRWS-01, v1.2+)
- PrepStep field and pipeline indicator on Unstarted cards
- Session-dependent stats on WIP/Finished cards (Phase 9)
- Inline edit/delete on gallery cards
- Routes rename /charts to /projects
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| GLRY-01 | User can browse charts as gallery cards with cover images and status-specific footer content | Gallery card component architecture, cover image handling with presigned URLs, status-group footer system, CoverPlaceholder gradient pattern |
| GLRY-02 | Gallery cards show contextual footers per status group (WIP: progress/supplies, Unstarted: kitting dots, Finished: celebration border) | WIPFooter/UnstartedFooter/FinishedFooter component patterns, kitting dot computation from junction table _count, celebration border CSS, progress bar pattern |
| GLRY-03 | User can switch between gallery, list, and table view modes (persisted in URL) | nuqs for URL state, ViewToggleBar segmented control, GalleryGrid/ListView/TableView rendering, responsive column hiding |
| GLRY-04 | User can sort charts by name, designer, status, size, stitch count, and date added | Client-side sort with shared state across views, SortDropdown component, table column header sort triggers, sort field/direction in URL params |
| GLRY-05 | User can search charts by name and filter by status and size category | FilterBar with search input (300ms debounce), MultiSelectDropdown for status/size, FilterChips with dismiss, client-side filtering logic |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- Server Components by default, "use client" only for interactivity
- TDD mandatory: tests before implementation
- Colocated tests: `foo.test.tsx` next to `foo.tsx`
- Import test utils from `@/__tests__/test-utils`
- Semantic design tokens only (no hardcoded color scales except where DesignOS specifies exact hex for gradients/borders)
- DesignOS is the spec: adapt from `product-plan/sections/gallery-cards-and-advanced-filtering/`
- Pin exact versions in package.json (no `^` or `~`)
- Check Context7 for bleeding-edge library APIs
- Impeccable polish after UI plans, audit at phase boundary

## Standard Stack

### Core (already installed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.2.2 | App Router framework | Project foundation [VERIFIED: package.json] |
| React | 19.2.4 | UI rendering | Project foundation [VERIFIED: package.json] |
| @base-ui/react | 1.3.0 | Component primitives (via shadcn v4) | Project UI layer [VERIFIED: package.json] |
| lucide-react | 1.7.0 | Icons (Search, LayoutGrid, List, Table2, Check, Circle, Minus, Scissors, etc.) | Project convention [VERIFIED: package.json] |
| Prisma | 7.6.0 | ORM for data queries | Project data layer [VERIFIED: package.json] |
| class-variance-authority | 0.7.1 | Component variant styling | Project convention [VERIFIED: package.json] |
| tailwind-merge | 3.5.0 | Tailwind class merging | Project convention [VERIFIED: package.json] |

### New Addition

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| nuqs | 2.8.9 | Type-safe URL search param state management | All gallery view state (view mode, sort, filters, search) |

**Installation:**
```bash
npm install nuqs@2.8.9
```

Then pin the version (remove `^` if npm adds it). [VERIFIED: npm registry, version 2.8.9 current]

**nuqs setup requires:**
1. Add `NuqsAdapter` to root layout (`src/app/layout.tsx`):
```typescript
import { NuqsAdapter } from 'nuqs/adapters/next/app'
// wrap children: <NuqsAdapter>{children}</NuqsAdapter>
```
2. Define type-safe parsers for gallery state [CITED: https://nuqs.dev/docs/installation]

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| nuqs | Manual `useSearchParams` + `URLSearchParams` | Already used in supply-catalog.tsx; works but verbose, no type safety, easy to introduce bugs with serialization/deserialization. nuqs gives typed parsers, shallow routing, and debounce built-in. |
| Custom multi-select dropdown | shadcn Select/Combobox | DesignOS specifies custom multi-select with checkboxes, count badges, emerald active state; shadcn Select is single-select. Build custom per the design. |

**Recommendation:** Use nuqs. The gallery has 6 URL params (view, sort, dir, search, status[], size[]) and nuqs handles array serialization, defaults, and shallow updates cleanly. The monorepo-only issue (#1263) does not apply to this single-package project. [CITED: https://github.com/47ng/nuqs/issues/1263]

## Architecture Patterns

### Recommended Component Structure

```
src/components/features/gallery/
  project-gallery.tsx         # Orchestrator: composes all sub-components
  project-gallery.test.tsx    # Integration tests for gallery composition
  gallery-card.tsx            # Status-aware card (WIP/Unstarted/Finished footers)
  gallery-card.test.tsx
  cover-placeholder.tsx       # Gradient placeholder with Scissors icon
  cover-placeholder.test.tsx
  kitting-dots.tsx            # Four-item kitting status display
  kitting-dots.test.tsx
  gallery-grid.tsx            # Gallery/List/Table view renderer
  gallery-grid.test.tsx
  filter-bar.tsx              # Search + Status + Size dropdowns
  filter-bar.test.tsx
  filter-chips.tsx            # Active filter chips with dismiss
  filter-chips.test.tsx
  view-toggle-bar.tsx         # Count + Sort + View mode toggle
  view-toggle-bar.test.tsx
  sort-dropdown.tsx           # Sort field + direction
  sort-dropdown.test.tsx
  multi-select-dropdown.tsx   # Reusable multi-select with checkboxes
  multi-select-dropdown.test.tsx
  use-gallery-filters.ts     # Custom hook: nuqs parsers + filter/sort logic
  use-gallery-filters.test.ts
  gallery-types.ts            # GalleryCardData, StatusGroup, sort/filter types
```

### Pattern 1: Server/Client Data Split

**What:** Server Component fetches all chart data with supply counts; Client Component handles view state, filtering, and sorting.
**When to use:** Always for this page (single data fetch, client-side interactivity).

```typescript
// src/app/(dashboard)/charts/page.tsx (Server Component)
export default async function ChartsPage() {
  const charts = await getChartsForGallery(); // Extended query with _count
  const imageUrls = await getPresignedImageUrls(/* keys */);
  return <ProjectGallery charts={charts} imageUrls={imageUrls} />;
}
```

The page.tsx becomes much simpler: it no longer needs designers, genres, storage locations, stitching apps, or fabrics (those were for the edit modal, which lives on the detail page). [VERIFIED: current page.tsx passes 7 props; gallery needs only charts + imageUrls]

### Pattern 2: StatusGroup Discriminated Union

**What:** Map ProjectStatus enum to three status groups for card footer rendering.
**When to use:** All gallery card rendering decisions.

```typescript
// gallery-types.ts
type StatusGroup = 'wip' | 'unstarted' | 'finished';

function getStatusGroup(status: ProjectStatus): StatusGroup {
  switch (status) {
    case 'IN_PROGRESS':
    case 'ON_HOLD':
      return 'wip';
    case 'UNSTARTED':
    case 'KITTING':
    case 'KITTED':
      return 'unstarted';
    case 'FINISHED':
    case 'FFO':
      return 'finished';
  }
}
```

Note: ON_HOLD maps to 'wip' (still has progress data), KITTING/KITTED map to 'unstarted' (still in prep phase). [ASSUMED — matches DesignOS types.ts which groups them this way]

### Pattern 3: nuqs URL State Management

**What:** Define typed parsers for all gallery URL params with defaults.
**When to use:** Gallery page state.

```typescript
// use-gallery-filters.ts
import { useQueryState, parseAsString, parseAsStringLiteral, parseAsArrayOf } from 'nuqs';

const viewModes = ['gallery', 'list', 'table'] as const;
const sortFields = ['dateAdded', 'name', 'designer', 'status', 'size', 'stitchCount'] as const;
const sortDirs = ['asc', 'desc'] as const;

// In the hook:
const [view, setView] = useQueryState('view',
  parseAsStringLiteral(viewModes).withDefault('gallery')
);
const [sort, setSort] = useQueryState('sort',
  parseAsStringLiteral(sortFields).withDefault('dateAdded')
);
const [dir, setDir] = useQueryState('dir',
  parseAsStringLiteral(sortDirs).withDefault('desc')
);
const [search, setSearch] = useQueryState('search',
  parseAsString.withDefault('')
);
const [statusFilter, setStatusFilter] = useQueryState('status',
  parseAsArrayOf(parseAsString, ',').withDefault([])
);
const [sizeFilter, setSizeFilter] = useQueryState('size',
  parseAsArrayOf(parseAsString, ',').withDefault([])
);
```

[CITED: https://nuqs.dev/docs/installation — nuqs provides parseAsArrayOf for comma-separated array params]

### Pattern 4: Extended Prisma Query with Supply Counts

**What:** Extend `getCharts` to include `_count` on junction tables for kitting dot computation.
**When to use:** Gallery data fetching.

```typescript
// New action: getChartsForGallery() in chart-actions.ts
export async function getChartsForGallery() {
  const user = await requireAuth();
  return await prisma.chart.findMany({
    where: { project: { userId: user.id } },
    include: {
      project: {
        include: {
          storageLocation: { select: { id: true, name: true } },
          stitchingApp: { select: { id: true, name: true } },
          fabric: { select: { id: true } }, // Only need existence check
          _count: {
            select: {
              projectThreads: true,
              projectBeads: true,
              projectSpecialty: true,
            },
          },
        },
      },
      designer: true,
      genres: true,
    },
    orderBy: { dateAdded: 'desc' },
  });
}
```

[VERIFIED: Prisma schema has projectThreads, projectBeads, projectSpecialty relations on Project model]

### Pattern 5: Client-Side Filtering and Sorting

**What:** All filtering (search, status, size) and sorting happens in the client component using `useMemo`.
**When to use:** Gallery with ~500 items, single user.

```typescript
const filteredAndSorted = useMemo(() => {
  let result = cards;

  // Search filter (name match, 300ms debounced at input level)
  if (debouncedSearch) {
    const q = debouncedSearch.toLowerCase();
    result = result.filter(c => c.name.toLowerCase().includes(q));
  }

  // Status filter
  if (statusFilter.length > 0) {
    result = result.filter(c => statusFilter.includes(c.status));
  }

  // Size filter
  if (sizeFilter.length > 0) {
    result = result.filter(c => sizeFilter.includes(c.sizeCategory));
  }

  // Sort
  result = [...result].sort(compareFn(sort, dir));

  return result;
}, [cards, debouncedSearch, statusFilter, sizeFilter, sort, dir]);
```

### Anti-Patterns to Avoid

- **Server-side filtering/sorting for this use case:** With ~500 items for a single user, server round-trips for filter changes would add latency. Fetch once, filter client-side.
- **Nested forms in filter dropdowns:** Multi-select dropdowns must NOT use `<form>` wrappers. Use `<div>` with button click handlers per `.claude/rules/base-ui-patterns.md`.
- **`transition-all` on cards:** Use specific transition properties (`transition-transform`, `transition-shadow`, `transition-colors`) per impeccable conventions. The DesignOS reference uses `transition-all` but the project has already replaced these elsewhere.
- **Importing from `"use client"` modules in Server Components:** The page.tsx is a Server Component. Do not import anything from gallery client components. Only pass data as props.
- **Hand-rolling URL param parsing:** With 6 params including arrays, manual `URLSearchParams` is error-prone. Use nuqs.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| URL state management | Manual URLSearchParams parsing + serialization | `nuqs` | Type-safe parsers, array support, shallow routing, debounce, default values. 6 params including comma-separated arrays. |
| Search debounce | Custom useDebounce hook | `nuqs` `throttleMs` option or simple `useDeferredValue` | nuqs supports throttled URL updates natively; alternatively React 19's `useDeferredValue` handles rendering debounce. |
| Click-outside for dropdowns | Custom useClickOutside hook | Simple `useEffect` with `mousedown` listener (per DesignOS pattern) | This IS hand-built, but it's 5 lines. No library needed. Keep it inline in the dropdown component. |
| Status group mapping | Inline conditionals scattered across components | Central `getStatusGroup()` utility | Used in 10+ places (card footer, progress bar color, celebration border, list context). |
| Size category computation | Duplicating threshold logic | Existing `calculateSizeCategory()` + `getEffectiveStitchCount()` | Already built in `src/lib/utils/size-category.ts`. Reuse directly. |
| Status badge rendering | Re-implementing status colors | Existing `StatusBadge` component + `STATUS_CONFIG` | Already built. Import directly for all views. |

## Common Pitfalls

### Pitfall 1: Presigned URL Expiry on Long Gallery Sessions
**What goes wrong:** R2 presigned URLs expire after their TTL. If a user leaves the gallery tab open, images stop loading.
**Why it happens:** Server Component fetches URLs once at page load. No refresh mechanism for long-lived tabs.
**How to avoid:** Accept this limitation for now (same as current page). The `onError` handler on `<img>` already shows a fallback. If needed later, add a `router.refresh()` on window focus.
**Warning signs:** Broken image icons appearing after extended idle time.

### Pitfall 2: Genre Tags Overflow Breaking Card Height
**What goes wrong:** Cards with many genres push content down, making card heights wildly inconsistent in the grid.
**Why it happens:** Without limiting visible tags, some cards show 8+ genre pills.
**How to avoid:** Cap at 3 visible genres + "+N" overflow pill (per UI-05 in UI-SPEC). Use `line-clamp-2` on project name.
**Warning signs:** Uneven card heights in gallery view.

### Pitfall 3: Status Enum Mismatch Between Code and URL
**What goes wrong:** URL params use values like `IN_PROGRESS` (Prisma enum) but DesignOS uses `"In Progress"` (display label). Filtering breaks if these get mixed.
**Why it happens:** Two different representations of the same concept.
**How to avoid:** Use Prisma enum values (`IN_PROGRESS`, `FINISHED`, etc.) as the canonical filter values in URL params. Map to display labels only in the UI layer using `STATUS_CONFIG`.
**Warning signs:** Filters don't match any cards; URL shows display labels instead of enum values.

### Pitfall 4: Supply Count Query N+1
**What goes wrong:** If supply counts are fetched per-card instead of in the main query, page load becomes slow with 500+ charts.
**Why it happens:** Forgetting to add `_count` to the Prisma include and instead doing separate queries per project.
**How to avoid:** Use Prisma's `_count` in the include clause of the gallery query (Pattern 4 above). Single query returns all data.
**Warning signs:** Gallery page loads slowly, multiple DB queries visible in logs.

### Pitfall 5: Kitting Dot "Not Applicable" Logic
**What goes wrong:** All projects show beads/specialty as "needed" even when the chart doesn't use those supplies.
**Why it happens:** There's no explicit "this chart uses beads" flag. The only signal is whether the junction table has entries.
**How to avoid:** Use a pragmatic rule: if a project has 0 bead entries AND is UNSTARTED/KITTING, show 'needed' (assume the user hasn't added them yet). If the project is KITTED or further along with 0 beads, show 'not-applicable' (the user has kitted without beads, so the chart doesn't need them). For Thread, always show 'needed' if count is 0 (all cross-stitch uses thread). This is Claude's discretion per CONTEXT.md.
**Warning signs:** Every Unstarted card shows all four dots as "needed".

### Pitfall 6: "Charts" Label Leaking Through
**What goes wrong:** After the cosmetic rename, some spots still say "Charts" instead of "Projects".
**Why it happens:** The rename touches nav items, page headings, button labels, empty states, count labels, and browser tabs. Easy to miss some.
**How to avoid:** Do a comprehensive search for "Chart" in user-facing strings. Make a checklist: nav-items.ts, page heading, add button, empty states (both zero-projects and no-match), count label, page metadata/title.
**Warning signs:** Mixed "Charts"/"Projects" terminology in the UI.

## Code Examples

### Gallery Card Data Transformation

Transform Prisma query results to gallery card data shape:

```typescript
// Source: Adapted from DesignOS types.ts for current schema
interface GalleryCardData {
  chartId: string;
  projectId: string | null;
  name: string;              // chart.name
  designerName: string;      // chart.designer?.name ?? 'Unknown'
  coverImageUrl: string | null;
  status: ProjectStatus;
  statusGroup: StatusGroup;
  genres: string[];           // chart.genres.map(g => g.name)
  sizeCategory: SizeCategory;
  stitchCount: number;       // effective stitch count
  stitchCountApproximate: boolean;

  // WIP-specific
  stitchesCompleted: number;
  progressPercent: number;

  // Unstarted-specific (kitting dots)
  fabricStatus: KittingItemStatus;
  threadStatus: KittingItemStatus;
  beadsStatus: KittingItemStatus;
  specialtyStatus: KittingItemStatus;

  // Finished-specific
  finishDate: Date | null;
  ffoDate: Date | null;

  // Supply counts (shared)
  threadColourCount: number;
  beadTypeCount: number;
  specialtyItemCount: number;

  // Sort fields
  dateAdded: Date;
}
```

### Kitting Dot Computation

```typescript
// Source: D-06 from CONTEXT.md
type KittingItemStatus = 'fulfilled' | 'needed' | 'not-applicable';

function computeKittingDots(project: {
  fabric: { id: string } | null;
  _count: { projectThreads: number; projectBeads: number; projectSpecialty: number };
  status: ProjectStatus;
}): {
  fabricStatus: KittingItemStatus;
  threadStatus: KittingItemStatus;
  beadsStatus: KittingItemStatus;
  specialtyStatus: KittingItemStatus;
} {
  const isKittedOrBeyond = ['KITTED', 'IN_PROGRESS', 'ON_HOLD', 'FINISHED', 'FFO'].includes(project.status);

  return {
    fabricStatus: project.fabric ? 'fulfilled' : 'needed',
    threadStatus: project._count.projectThreads > 0 ? 'fulfilled' : 'needed',
    // If kitted+ with 0 beads, assume chart doesn't use them
    beadsStatus: project._count.projectBeads > 0
      ? 'fulfilled'
      : isKittedOrBeyond ? 'not-applicable' : 'needed',
    specialtyStatus: project._count.projectSpecialty > 0
      ? 'fulfilled'
      : isKittedOrBeyond ? 'not-applicable' : 'needed',
  };
}
```

### Celebration Border Pattern

```typescript
// Source: UI-SPEC Celebration Borders section
function getCelebrationStyles(status: ProjectStatus): {
  border: string;
  boxShadow: string;
} | null {
  if (status === 'FINISHED') return {
    border: '2px solid rgb(139 92 246)',
    boxShadow: '0 0 0 1px rgb(139 92 246 / 0.15), 0 0 12px rgb(139 92 246 / 0.08)',
  };
  if (status === 'FFO') return {
    border: '2px solid rgb(244 63 94)',
    boxShadow: '0 0 0 1px rgb(244 63 94 / 0.15), 0 0 12px rgb(244 63 94 / 0.08)',
  };
  return null;
}
```

### Cover Placeholder with Status Gradient

```typescript
// Source: UI-SPEC Cover Image Placeholder Gradients
const STATUS_GRADIENTS: Record<ProjectStatus, [string, string]> = {
  UNSTARTED:   ['#e7e5e4', '#d6d3d1'],
  KITTING:     ['#fef3c7', '#fde68a'],
  KITTED:      ['#d1fae5', '#a7f3d0'],
  IN_PROGRESS: ['#e0f2fe', '#bae6fd'],
  ON_HOLD:     ['#ffedd5', '#fed7aa'],
  FINISHED:    ['#ede9fe', '#ddd6fe'],
  FFO:         ['#ffe4e6', '#fecdd3'],
};

// Rendered via inline style (not Tailwind, since values are dynamic hex)
// style={{ background: `linear-gradient(160deg, ${from} 0%, ${to} 100%)` }}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `useSearchParams` + manual parsing | `nuqs` type-safe parsers | nuqs v2 (2024) | Eliminates serialization bugs, provides defaults, supports arrays |
| Server-side pagination for lists | Client-side filter/sort for bounded datasets | React 18+ with useMemo | 500 items is well within client capacity; avoids server round-trips |
| CSS Grid `auto-fill` for responsive cards | Same approach (still standard) | N/A | `repeat(auto-fill, minmax(280px, 340px))` is the correct modern pattern |

**Deprecated/outdated:**
- `getCharts()` current return shape: Lacks supply counts. Will be supplemented by `getChartsForGallery()` with `_count`.
- `ChartList` component: Fully replaced by `ProjectGallery`. Can be deleted after Phase 6.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | ON_HOLD maps to 'wip' StatusGroup (has progress data) | Architecture Patterns | Cards would show wrong footer type; easy to fix by moving to 'unstarted' |
| A2 | Kitting dots: 0 beads on KITTED+ means "not applicable" | Common Pitfalls / Code Examples | Some users might kit without adding supplies to tracker; would show misleading dots |
| A3 | nuqs 2.8.9 works with Next.js 16.2.2 in non-monorepo | Standard Stack | The known issue was monorepo-specific; if broken, fallback is manual useSearchParams (already used in supplies page) |
| A4 | ~500 charts can be filtered/sorted client-side without performance issues | Architecture Patterns | If dataset grows 10x, would need server-side filtering; unlikely for single user |

## Open Questions (RESOLVED)

1. **Kitting dot "not-applicable" heuristic** — RESOLVED
   - Resolution: Use KITTED+ status with 0 junction table entries as "not-applicable" per D-06/CONTEXT.md. Add backlog item for explicit flag if users report confusion.

2. **Cover image in gallery cards: presigned URL vs thumbnail** — RESOLVED
   - Resolution: Use full `coverImageUrl` for gallery cards (visual impact), `coverThumbnailUrl` for list view small thumbs. Both resolved in server component page.tsx.

3. **nuqs NuqsAdapter placement** — RESOLVED
   - Resolution: Add as outermost wrapper in `<body>` in `src/app/layout.tsx`. No known conflicts with Sonner or next-auth session. [CITED: https://nuqs.dev/docs/adapters]

## Environment Availability

Step 2.6: SKIPPED (no external dependencies identified). Phase 6 is purely code/config changes using existing project dependencies. The only new package (nuqs) is an npm install.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 3.1.1 + @testing-library/react 16.3.2 |
| Config file | `vitest.config.ts` |
| Quick run command | `npm test -- --run` |
| Full suite command | `npm test -- --run --coverage` |

### Phase Requirements to Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| GLRY-01 | Gallery cards render with cover image and status-specific footer | unit | `npx vitest run src/components/features/gallery/gallery-card.test.tsx -t "renders"` | Wave 0 |
| GLRY-01 | CoverPlaceholder renders gradient for each status | unit | `npx vitest run src/components/features/gallery/cover-placeholder.test.tsx` | Wave 0 |
| GLRY-02 | WIP footer shows progress bar and stitch fraction | unit | `npx vitest run src/components/features/gallery/gallery-card.test.tsx -t "WIP"` | Wave 0 |
| GLRY-02 | Unstarted footer shows kitting dots with correct states | unit | `npx vitest run src/components/features/gallery/kitting-dots.test.tsx` | Wave 0 |
| GLRY-02 | Finished footer shows celebration border and date | unit | `npx vitest run src/components/features/gallery/gallery-card.test.tsx -t "Finished"` | Wave 0 |
| GLRY-03 | View mode toggle switches between gallery/list/table | unit | `npx vitest run src/components/features/gallery/view-toggle-bar.test.tsx` | Wave 0 |
| GLRY-03 | View mode persists in URL params | unit | `npx vitest run src/components/features/gallery/use-gallery-filters.test.ts` | Wave 0 |
| GLRY-04 | Sort dropdown changes sort field and direction | unit | `npx vitest run src/components/features/gallery/sort-dropdown.test.tsx` | Wave 0 |
| GLRY-04 | Client-side sort produces correct ordering | unit | `npx vitest run src/components/features/gallery/use-gallery-filters.test.ts -t "sort"` | Wave 0 |
| GLRY-04 | Table column headers trigger sort | unit | `npx vitest run src/components/features/gallery/gallery-grid.test.tsx -t "table sort"` | Wave 0 |
| GLRY-05 | Search filters cards by name (debounced) | unit | `npx vitest run src/components/features/gallery/filter-bar.test.tsx -t "search"` | Wave 0 |
| GLRY-05 | Status multi-select filters correctly | unit | `npx vitest run src/components/features/gallery/filter-bar.test.tsx -t "status"` | Wave 0 |
| GLRY-05 | Filter chips show active filters with dismiss | unit | `npx vitest run src/components/features/gallery/filter-chips.test.tsx` | Wave 0 |
| GLRY-05 | "Clear all" resets all filters | unit | `npx vitest run src/components/features/gallery/filter-chips.test.tsx -t "clear"` | Wave 0 |

### Sampling Rate
- **Per task commit:** `npm test -- --run` (full suite, ~10s)
- **Per wave merge:** `npm test -- --run --coverage`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] All test files listed above need creation (new feature, no existing gallery tests)
- [ ] Factory function `createMockGalleryCard()` needed in `src/__tests__/mocks/factories.ts`
- [ ] nuqs mock setup needed for `useQueryState` in test environment
- [ ] Framework install for nuqs: `npm install nuqs@2.8.9`

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | N/A (read-only gallery, auth handled by existing middleware) |
| V3 Session Management | no | N/A (no session changes) |
| V4 Access Control | yes | `requireAuth()` in gallery data action; `userId` filter on Prisma query |
| V5 Input Validation | yes | nuqs parsers validate URL params; search is client-side string match (no SQL injection risk) |
| V6 Cryptography | no | N/A (no secrets in this phase) |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| IDOR via chartId in URL | Information Disclosure | `getChartsForGallery()` already scoped by `userId` via `requireAuth()` — no chartId in gallery query. Detail page (`getChart()`) also checks ownership. |
| XSS via search param | Tampering | Search value only used in `.includes()` comparison, never rendered as HTML. React auto-escapes all rendered strings. |
| URL param pollution | Tampering | nuqs validates param values against defined parsers; invalid values fall back to defaults. |

## Sources

### Primary (HIGH confidence)
- Project codebase: `prisma/schema.prisma`, `src/lib/actions/chart-actions.ts`, `src/types/chart.ts`, `src/lib/utils/status.ts`, `src/lib/utils/size-category.ts` — verified current schema and data shapes
- DesignOS reference: `product-plan/sections/gallery-cards-and-advanced-filtering/` — GalleryCard.tsx, GalleryGrid.tsx, AdvancedFilterBar.tsx, types.ts — design implementation blueprints
- UI-SPEC: `.planning/phases/06-gallery-cards-view-modes/06-UI-SPEC.md` — complete visual and interaction contract
- CONTEXT.md: `.planning/phases/06-gallery-cards-view-modes/06-CONTEXT.md` — locked decisions D-01 through D-13
- npm registry: nuqs version 2.8.9 verified current [VERIFIED: npm view nuqs version]

### Secondary (MEDIUM confidence)
- [nuqs installation docs](https://nuqs.dev/docs/installation) — adapter setup for Next.js App Router
- [nuqs adapters docs](https://nuqs.dev/docs/adapters) — NuqsAdapter wrapping pattern
- [nuqs GitHub issue #1263](https://github.com/47ng/nuqs/issues/1263) — monorepo-specific compatibility issue, closed/resolved

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all core libraries already in project, nuqs verified against npm and docs
- Architecture: HIGH — patterns follow established project conventions, DesignOS provides detailed blueprints
- Pitfalls: HIGH — identified from direct codebase analysis and schema review
- Data model: HIGH — Prisma schema verified, `_count` approach confirmed against Prisma 7 capabilities

**Research date:** 2026-04-13
**Valid until:** 2026-05-13 (stable domain, no fast-moving dependencies)

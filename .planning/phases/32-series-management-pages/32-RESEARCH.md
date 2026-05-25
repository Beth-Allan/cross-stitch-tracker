# Phase 32: Series Management Pages - Research

**Researched:** 2026-05-24
**Domain:** Next.js App Router UI pages (list + detail), client components, server actions
**Confidence:** HIGH

## Summary

Phase 32 delivers two pages (`/series` list and `/series/[id]` detail) plus supporting components. The architecture directly mirrors the existing Designer management pages (Phase 3), which are fully implemented and battle-tested. The data layer (CRUD actions, types, Zod schema, progress utility) was delivered in Phase 31 and is already tested (29 tests passing).

The primary work is: (1) creating the UI components (SeriesList, SeriesDetail, SeriesFormModal), (2) adding a `getSeriesDetail(id)` query action, (3) expanding the `SeriesChart` type to include fields needed for rich chart rows, (4) modifying `DeleteConfirmationDialog` to support "series" entity type, and (5) adding Series to the sidebar navigation. No new external packages are needed.

**Primary recommendation:** Clone the Designer page/component structure exactly, adapting for series-specific features (progress bar, dual stat lines, card grid layout instead of table). Use existing components (StatusBadge, SizeBadge, EmptyState, DeleteConfirmationDialog, SearchableSelect) without modification beyond the entityType union expansion.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- D-01: Single progress bar on both cards and detail header showing finished/owned ratio
- D-02: Text stat below bar: "X of Y owned" when totalCount set; "3 finished . 8 charts" when open-ended
- D-03: Detail page header uses same progress treatment as cards -- no extra bars
- D-04: Designer name shown below series name on cards ("by {name}"), only when designerId non-null
- D-05: Sort options: Name, Completion, Charts (not "Members")
- D-06: Sort bar matches DesignOS pattern -- pill-style toggles with chevron direction indicators
- D-07: Inline editing for name, totalCount, and notes on detail page
- D-08: Designer field editable via edit icon -> SearchableSelect dropdown
- D-09: "Add Chart" flow deferred to Phase 33 -- no add button on detail page
- D-10: Chart rows clickable -- navigate to `/charts/[id]`
- D-11: Series added to "Projects" nav section (alongside Dashboard, Pattern Dive, Shopping)
- D-12: URL structure: `/series` (list) and `/series/[id]` (detail)
- D-13: Loading skeleton for list page with card-shaped placeholders

### Claude's Discretion
- None specified -- all decisions locked

### Deferred Ideas (OUT OF SCOPE)
- None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SERIES-02 | User can view all series on a management page with progress indicators | SeriesList component with progress bars, sort pills, card grid -- mirrors DesignerList pattern |
| SERIES-05 | User can view a series detail page showing assigned charts with dual progress (owned/total + finished/owned) | SeriesDetail component with chart rows, inline editing, progress display -- mirrors DesignerDetail pattern |
</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Series list data fetching | Frontend Server (SSR) | -- | Server Component page calls getSeriesWithStats() directly |
| Series detail data fetching | Frontend Server (SSR) | -- | Server Component page calls getSeriesDetail(id) directly |
| Sort/filter state | Browser / Client | -- | Local useState, no URL params (matching designer pattern) |
| Inline editing (name, totalCount, notes, designer) | Browser / Client | API / Backend | Client component calls updateSeries server action |
| Delete series | Browser / Client | API / Backend | Client component calls deleteSeries server action |
| Create series modal | Browser / Client | API / Backend | Client component calls createSeries server action |
| Navigation sidebar | Browser / Client | -- | Static config in nav-items.ts, rendered by shell |
| Progress computation | API / Backend | -- | computeSeriesProgress runs server-side in getSeriesWithStats/getSeriesDetail |

## Standard Stack

### Core (already installed -- no new packages)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16 | App Router pages, server components | Framework |
| React | 19 | Client components with hooks | Framework |
| Prisma | 7 | Database queries in server actions | ORM |
| Zod | 3.x | Form validation (seriesSchema already exists) | Validation |
| lucide-react | latest | Icons (Library, Plus, Pencil, Trash2, ArrowLeft, ChevronUp/Down, etc.) | Icon set |
| sonner | latest | Toast notifications | Notification |
| next/navigation | -- | useRouter, Link, notFound | Routing |

### Supporting (already installed)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @testing-library/react | latest | Component rendering in tests | All component tests |
| @testing-library/user-event | latest | User interaction simulation | Interactive component tests |
| vitest | latest | Test runner | All tests |

**Installation:** None required. All dependencies already installed.

## Package Legitimacy Audit

> No new packages are installed in this phase. All dependencies are pre-existing in the project's package.json.

| Package | Registry | Age | Downloads | Source Repo | slopcheck | Disposition |
|---------|----------|-----|-----------|-------------|-----------|-------------|
| -- | -- | -- | -- | -- | -- | No new packages |

**Packages removed due to slopcheck [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

## Architecture Patterns

### System Architecture Diagram

```
Browser Request (/series or /series/[id])
    |
    v
+-----------------------------+
|  Server Component (page.tsx) |  <- Calls server action for data
|  - Fetches data via action   |
|  - Passes props to client    |
+-------------+---------------+
              | props
              v
+-----------------------------+
|  Client Component            |  <- Manages local UI state
|  - SeriesList / SeriesDetail |
|  - Sort state (useState)     |
|  - Edit state (useState)     |
|  - Calls server actions      |
|    for mutations             |
+-------------+---------------+
              | server action calls
              v
+-----------------------------+
|  Server Actions              |  <- Auth + validation + DB
|  - getSeriesWithStats()      |
|  - getSeriesDetail(id)       |
|  - createSeries()            |
|  - updateSeries()            |
|  - deleteSeries()            |
+-------------+---------------+
              | Prisma queries
              v
+-----------------------------+
|  PostgreSQL (Neon)           |
|  - Series table              |
|  - Chart table (seriesId FK) |
|  - Project table (status)    |
|  - Designer table            |
+-----------------------------+
```

### Recommended Project Structure
```
src/
├── app/(dashboard)/series/
│   ├── page.tsx               # Server component: list page
│   ├── loading.tsx            # Skeleton loader
│   └── [id]/
│       └── page.tsx           # Server component: detail page
├── components/features/series/
│   ├── series-list.tsx        # Client component: card grid + sort + modals
│   ├── series-list.test.tsx   # Tests for list
│   ├── series-detail.tsx      # Client component: header + chart rows + inline edit
│   ├── series-detail.test.tsx # Tests for detail
│   ├── series-form-modal.tsx  # Client component: create/edit modal
│   └── series-form-modal.test.tsx # Tests for modal
├── lib/actions/
│   └── series-actions.ts      # Add getSeriesDetail (existing file)
├── types/
│   └── series.ts              # Expand SeriesChart type (existing file)
└── components/shell/
    └── nav-items.ts           # Add Series nav item (existing file)
```

### Pattern 1: Server Component Page -> Client Component
**What:** Thin server page fetches data, passes to client component for interactivity
**When to use:** All management pages (designers, genres, series, fabric, etc.)
**Example:**
```typescript
// src/app/(dashboard)/series/page.tsx
// Source: src/app/(dashboard)/designers/page.tsx (existing codebase pattern)
import { getSeriesWithStats } from "@/lib/actions/series-actions";
import { SeriesList } from "@/components/features/series/series-list";

export default async function SeriesPage() {
  const series = await getSeriesWithStats();
  return <SeriesList series={series} />;
}
```

### Pattern 2: Detail Page with notFound()
**What:** Server page fetches by ID, returns notFound() if null
**When to use:** All detail pages
**Example:**
```typescript
// src/app/(dashboard)/series/[id]/page.tsx
// Source: src/app/(dashboard)/designers/[id]/page.tsx (existing codebase pattern)
import { notFound } from "next/navigation";
import { getSeriesDetail } from "@/lib/actions/series-actions";
import { SeriesDetail } from "@/components/features/series/series-detail";

export default async function SeriesDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const series = await getSeriesDetail(id);
  if (!series) notFound();
  return <SeriesDetail series={series} />;
}
```

### Pattern 3: Client-side Sort with Pills
**What:** Sort state in useState, pill UI toggles direction, useMemo for sorted data
**When to use:** List and detail pages with sortable content
**Example:**
```typescript
// Source: src/components/features/designers/designer-detail.tsx (existing pattern)
type SortKey = "name" | "completion" | "charts";
type SortDir = "asc" | "desc";

const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: "name", dir: "asc" });

function handleSort(key: SortKey) {
  setSort((prev) =>
    prev.key === key ? { key, dir: prev.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" },
  );
}
```

### Pattern 4: Inline Edit with Enter/Escape
**What:** Toggle between view and edit mode, focus input on enter, save on Enter/blur, cancel on Escape
**When to use:** Detail page inline name/field editing
**Example:**
```typescript
// Source: DesignOS SeriesDetail.tsx component
const [isEditing, setIsEditing] = useState(false);
const [editName, setEditName] = useState(series.name);
const editInputRef = useRef<HTMLInputElement>(null);

useEffect(() => {
  if (isEditing && editInputRef.current) {
    editInputRef.current.focus();
    editInputRef.current.select();
  }
}, [isEditing]);

function handleSaveName() {
  const trimmed = editName.trim();
  if (trimmed && trimmed !== series.name) {
    // Call updateSeries action
  }
  setIsEditing(false);
}
```

### Pattern 5: Form Modal with useTransition
**What:** Dialog wrapping a form, uses useTransition for pending state, handles server action errors
**When to use:** Create/edit modals
**Example:**
```typescript
// Source: src/components/features/designers/designer-form-modal.tsx (existing pattern)
const [isPending, startTransition] = useTransition();

startTransition(async () => {
  try {
    const result = await createSeries(formData);
    if (result.success) {
      toast.success("Series created");
      router.refresh();
      onOpenChange(false);
    } else {
      if (result.error?.includes("already exists")) {
        setNameError(result.error);
      } else {
        toast.error(result.error ?? "Couldn't create series. Please try again.");
      }
    }
  } catch {
    toast.error("Couldn't create series. Please try again.");
  }
});
```

### Anti-Patterns to Avoid
- **Nested `<form>` in dialog:** Use `<form onSubmit>` inside DialogContent but never nest forms.
- **Importing from "use client" modules in Server Components:** Keep page.tsx as pure server component, pass data as props.
- **Using URL params for sort state:** This phase uses local useState (matches designer pattern). Don't use `useQueryStates` or searchParams for sort.
- **Hardcoded color classes:** Use semantic tokens (`bg-primary`, `text-muted-foreground`) not `emerald-*` or `stone-*`.
- **Custom progress bar component:** Don't abstract -- inline the tailwind classes (h-2, rounded-full, bg-muted, bg-primary) as they're simple and match DesignOS exactly.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Delete confirmation dialog | Custom modal for series | Extend `DeleteConfirmationDialog` with "series" entityType | Already handles pending state, error handling, Dialog accessibility |
| Toast notifications | Manual notification state | `sonner` toast.success/toast.error | Already configured project-wide |
| Searchable dropdown | Custom select component | Existing `SearchableSelect` from form-primitives | Handles keyboard, type-ahead, popover, add-new flow |
| Form field layout | Manual label+input+error | `FormField` from chart form-primitives | Consistent layout, error display |
| Status badges | Custom pill rendering | `StatusBadge` component | Already handles all 7 project statuses with CSS custom properties |
| Size badges | Custom size labels | `SizeBadge` component | Already computes size category from stitch dimensions |
| Focal point positioning | Manual object-position calc | `getObjectPositionStyle` utility | Already handles null focal points correctly |
| Empty states | Custom centered text | `EmptyState` component | Consistent icon + title + description + children layout |
| Loading skeletons | Custom animation | `animate-skeleton-pulse` class | Already defined in project CSS |

## Common Pitfalls

### Pitfall 1: SeriesChart Type Mismatch
**What goes wrong:** The current `SeriesChart` type is missing fields needed for the chart row component (focalPointX, focalPointY, stitchesWide, stitchesHigh, coverImageUrl).
**Why it happens:** Phase 31 defined a minimal type for progress computation, not for UI rendering.
**How to avoid:** Expand `SeriesChart` to match `DesignerChart` fields before building the chart row UI. Add the missing fields and update `getSeriesDetail` query accordingly.
**Warning signs:** TypeScript errors when trying to use `getObjectPositionStyle`, `getEffectiveStitchCount`, or `SizeBadge` with SeriesChart data.

### Pitfall 2: Division by Zero in Progress Calculations
**What goes wrong:** `finishedCount / ownedCount * 100` when ownedCount is 0.
**Why it happens:** A series with no assigned charts has ownedCount = 0.
**How to avoid:** Guard with `ownedCount > 0 ? Math.round(finishedCount / ownedCount * 100) : 0`. UI-SPEC already specifies "0%" for 0-chart series.
**Warning signs:** NaN displayed in percentage text, progress bar with NaN width.

### Pitfall 3: Completion Sort Edge Case
**What goes wrong:** Series with 0 charts should sort to bottom when sorting by completion, not to top.
**Why it happens:** 0/0 = NaN, which sorts unpredictably.
**How to avoid:** D-05 specifies "0-chart series sort to bottom". Use -1 (or Infinity for desc) as the sort value when ownedCount is 0.
**Warning signs:** Empty series appearing at top of completion-sorted list.

### Pitfall 4: Inline Edit Not Saving on Blur
**What goes wrong:** User clicks away from inline name input without pressing Enter -- edit is lost.
**Why it happens:** Only handling Enter key, not blur event.
**How to avoid:** Add onBlur handler that calls save (same as Enter). The DesignOS pattern shows Check/X buttons, so the user has explicit save/cancel affordance.
**Warning signs:** Users editing name, clicking elsewhere, seeing it revert.

### Pitfall 5: Designer SearchableSelect Needs Options Data
**What goes wrong:** The detail page needs a list of designers for the SearchableSelect dropdown, but the server component only fetches series detail.
**Why it happens:** The `getSeriesDetail` action doesn't return designer options -- those come from a separate `getDesigners()` call.
**How to avoid:** Fetch designers in the server component page and pass as a prop alongside the series detail. This matches the chart form page pattern.
**Warning signs:** Empty dropdown options when user tries to change designer.

### Pitfall 6: Not Revalidating After Designer Change
**What goes wrong:** After changing a series' designer, the page shows stale data.
**Why it happens:** `updateSeries` calls `revalidatePath("/series")` and `revalidatePath("/series/${id}")` which should handle this, but the UI needs `router.refresh()` in the client to trigger re-render with new server data.
**How to avoid:** Call `router.refresh()` after successful updateSeries mutation, same as designer form modal pattern.
**Warning signs:** Designer name not updating until page hard-refresh.

## Code Examples

### getSeriesDetail Action (new, to be added to series-actions.ts)
```typescript
// Source: Mirrors getDesigner() in src/lib/actions/designer-actions.ts
export async function getSeriesDetail(id: string): Promise<SeriesDetail | null> {
  await requireAuth();

  const series = await prisma.series.findUnique({
    where: { id },
    include: {
      designer: { select: { id: true, name: true } },
      charts: {
        select: {
          id: true,
          name: true,
          coverThumbnailUrl: true,
          coverImageUrl: true,
          focalPointX: true,
          focalPointY: true,
          stitchCount: true,
          stitchesWide: true,
          stitchesHigh: true,
          project: { select: { status: true, stitchesCompleted: true } },
        },
      },
    },
  });

  if (!series) return null;

  const charts: SeriesChart[] = series.charts.map((c) => ({
    id: c.id,
    name: c.name,
    coverThumbnailUrl: c.coverThumbnailUrl,
    coverImageUrl: c.coverImageUrl,
    focalPointX: c.focalPointX,
    focalPointY: c.focalPointY,
    stitchCount: c.stitchCount,
    stitchesWide: c.stitchesWide,
    stitchesHigh: c.stitchesHigh,
    status: c.project?.status ?? null,
    stitchesCompleted: c.project?.stitchesCompleted ?? 0,
  }));

  return {
    id: series.id,
    name: series.name,
    totalCount: series.totalCount,
    designerId: series.designerId,
    designerName: series.designer?.name ?? null,
    notes: series.notes,
    progress: computeSeriesProgress(series.charts, series.totalCount),
    charts,
  };
}
```

### Expanded SeriesChart Type
```typescript
// Source: Mirrors DesignerChart in src/types/designer.ts
import type { OptionalFocalPoint } from "@/types/focal-point";

export type SeriesChart = OptionalFocalPoint & {
  id: string;
  name: string;
  coverThumbnailUrl: string | null;
  coverImageUrl: string | null;
  stitchCount: number;
  stitchesWide: number;
  stitchesHigh: number;
  status: ProjectStatus | null;
  stitchesCompleted: number;
};
```

### Progress Bar Component Pattern
```typescript
// Source: UI-SPEC CP-01 series card
function ProgressBar({ finishedCount, ownedCount }: { finishedCount: number; ownedCount: number }) {
  const percent = ownedCount > 0 ? Math.round((finishedCount / ownedCount) * 100) : 0;
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <div
        className="h-full rounded-full bg-primary"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
```

### DeleteConfirmationDialog Extension
```typescript
// Source: src/components/features/designers/delete-confirmation-dialog.tsx
// Add "series" to entityType union:
entityType: "designer" | "genre" | "brand" | "supply" | "series"

// Add case in getDescription():
case "series":
  return `This will remove "${entityName}" from your collection. ${chartCount} chart(s) will be unassigned from this series. Charts will NOT be deleted.`;
```

### Nav Items Addition
```typescript
// Source: src/components/shell/nav-items.ts
import { Library } from "lucide-react";

// In "Projects" section items array, after Shopping:
{ label: "Series", href: "/series", icon: Library },
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| DesignOS hardcoded colors (stone-*, emerald-*) | Semantic tokens (bg-primary, text-muted-foreground) | Phase 26+ | Must translate DesignOS mockup colors to semantic tokens |
| Status badge raw classes | CSS custom properties (--status-*) | Phase 30 | StatusBadge component handles all status styling automatically |
| Separate DesignerDetail page file | Mirrors same pattern for series | Phase 3 | Proven architecture -- just replicate for /series |

## Assumptions Log

> List all claims tagged [ASSUMED] in this research.

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| -- | -- | -- | -- |

**All claims in this research were verified from existing codebase patterns.** No external knowledge or unverified assumptions. The series pages are a direct mirror of the existing designer pages with no novel architectural decisions.

## Open Questions

1. **Detail page: fetch designers list for SearchableSelect**
   - What we know: The detail page needs a designer dropdown for D-08. The chart form pages fetch `getDesigners()` in the server component and pass as props.
   - What's unclear: Whether to fetch designers in the series detail server component page or to call getDesigners from within the client component.
   - Recommendation: Fetch in server component (matching chart form pattern) -- pass `designers` as prop to SeriesDetail. Keeps data fetching in server layer.

2. **SeriesChart type: should it include genres?**
   - What we know: DesignerChart includes `genres: { name: string }[]`. The UI-SPEC chart row (CP-04) doesn't mention genres.
   - What's unclear: Whether genres add value in series context.
   - Recommendation: Omit genres from SeriesChart -- not in spec, keeps query lighter.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 3.x + @testing-library/react |
| Config file | `vitest.config.ts` |
| Quick run command | `npm test -- --run src/components/features/series/` |
| Full suite command | `npm test` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SERIES-02 | Series list renders cards with progress | unit | `npm test -- --run src/components/features/series/series-list.test.tsx -x` | Wave 0 |
| SERIES-02 | Sort pills toggle sort key and direction | unit | `npm test -- --run src/components/features/series/series-list.test.tsx -x` | Wave 0 |
| SERIES-02 | Empty state when no series exist | unit | `npm test -- --run src/components/features/series/series-list.test.tsx -x` | Wave 0 |
| SERIES-02 | Create modal opens, validates, submits | unit | `npm test -- --run src/components/features/series/series-form-modal.test.tsx -x` | Wave 0 |
| SERIES-02 | Delete confirmation shows correct copy for series | unit | `npm test -- --run src/components/features/designers/delete-confirmation-dialog.test.tsx -x` | Existing |
| SERIES-05 | Detail header shows name, progress, designer | unit | `npm test -- --run src/components/features/series/series-detail.test.tsx -x` | Wave 0 |
| SERIES-05 | Inline name edit: enter saves, escape cancels | unit | `npm test -- --run src/components/features/series/series-detail.test.tsx -x` | Wave 0 |
| SERIES-05 | Chart rows render with status, stitch count, thumbnail | unit | `npm test -- --run src/components/features/series/series-detail.test.tsx -x` | Wave 0 |
| SERIES-05 | Chart sort pills function | unit | `npm test -- --run src/components/features/series/series-detail.test.tsx -x` | Wave 0 |
| SERIES-05 | getSeriesDetail returns enriched data | unit | `npm test -- --run src/lib/actions/series-actions.test.ts -x` | Existing (needs addition) |

### Sampling Rate
- **Per task commit:** `npm test -- --run src/components/features/series/ src/lib/actions/series-actions.test.ts`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `src/components/features/series/series-list.test.tsx` -- covers SERIES-02 rendering, sorting, empty state, delete
- [ ] `src/components/features/series/series-detail.test.tsx` -- covers SERIES-05 rendering, inline edit, chart rows, sort
- [ ] `src/components/features/series/series-form-modal.test.tsx` -- covers create modal validation, submission, error handling
- [ ] Mock factory: `createMockSeriesWithStats` and `createMockSeriesChart` helpers in `@/__tests__/mocks/factories.ts`

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | requireAuth() on all server actions (already implemented in Phase 31) |
| V3 Session Management | no | No new session handling |
| V4 Access Control | yes | Single-user app, requireAuth() is sufficient (no multi-tenant checks) |
| V5 Input Validation | yes | Zod seriesSchema validates name (.trim/.min/.max), totalCount, designerId, notes |
| V6 Cryptography | no | No new crypto operations |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| XSS via series name/notes in rendered UI | Tampering | React default escaping handles this -- no raw HTML injection used |
| Auth bypass on getSeriesDetail | Elevation of Privilege | requireAuth() called at top of action |
| Mass assignment on updateSeries | Tampering | Zod schema whitelist (only name, totalCount, designerId, notes accepted) |

**Security assessment:** LOW RISK. All mutations are already protected by requireAuth() and Zod validation from Phase 31. This phase only adds read queries (getSeriesDetail) and UI components. No new attack surface beyond what Phase 31 already covered.

## Sources

### Primary (HIGH confidence)
- `src/app/(dashboard)/designers/page.tsx` -- list page pattern [VERIFIED: codebase]
- `src/app/(dashboard)/designers/[id]/page.tsx` -- detail page pattern [VERIFIED: codebase]
- `src/components/features/designers/designer-list.tsx` -- list component pattern [VERIFIED: codebase]
- `src/components/features/designers/designer-detail.tsx` -- detail component with chart rows and sort pills [VERIFIED: codebase]
- `src/components/features/designers/designer-form-modal.tsx` -- form modal pattern [VERIFIED: codebase]
- `src/components/features/designers/delete-confirmation-dialog.tsx` -- delete dialog pattern [VERIFIED: codebase]
- `src/lib/actions/series-actions.ts` -- existing CRUD actions [VERIFIED: codebase]
- `src/types/series.ts` -- existing type definitions [VERIFIED: codebase]
- `src/lib/actions/designer-actions.ts:getDesigner()` -- detail query pattern [VERIFIED: codebase]
- `product-plan/sections/fabric-series-and-reference-data/components/SeriesList.tsx` -- DesignOS visual spec [VERIFIED: codebase]
- `product-plan/sections/fabric-series-and-reference-data/components/SeriesDetail.tsx` -- DesignOS visual spec [VERIFIED: codebase]

### Secondary (MEDIUM confidence)
- None needed -- all patterns derive from existing codebase

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - no new packages, all existing
- Architecture: HIGH - exact mirror of proven designer pages pattern
- Pitfalls: HIGH - identified from type analysis and established edge cases

**Research date:** 2026-05-24
**Valid until:** 2026-06-24 (stable -- no external dependencies or version changes involved)

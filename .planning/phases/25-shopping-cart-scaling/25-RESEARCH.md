# Phase 25: Shopping Cart Scaling - Research

**Researched:** 2026-05-18
**Domain:** Client-side search, filtering, and collapsible grouping for existing shopping cart UI
**Confidence:** HIGH

## Summary

Phase 25 adds search, status grouping, and supply-type search to the existing shopping cart to handle 75+ projects. The existing architecture is sound -- all data is fetched server-side in a single query and passed to a client component. The changes are entirely client-side: filtering via `useMemo`, grouping by `ProjectStatus`, and collapsible sections. No new dependencies, no schema changes, no new server actions.

The codebase already has proven patterns for every technique needed: search inputs (gallery `FilterBar`), `useDeferredValue` (gallery filters), status ordering (genre detail `STATUS_ORDER`), `Set<string>` selection state (existing `usePersistedSelection`), and empty states (`EmptyState` component). This phase composes existing patterns into the shopping cart -- no novel technical challenges.

**Primary recommendation:** Split into 3 plans: (1) search + status grouping in the By Project view, (2) supply search in the By Supply view, (3) selection behavior upgrades (SelectionCounter, SelectVisible, per-group select). All 3 can run in parallel since they modify different parts of the component tree.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Single search input above the view toggle (By Project / By Supply Type), filtering both views from a single location.
- **D-02:** Projects grouped by status in collapsible sections with count badges (e.g., "Kitting (12)"). All sections expanded by default.
- **D-03:** Status group order follows workflow progression: Kitting, Stitching, On Hold, Unstarted, other statuses.
- **D-04:** When search is active, groups remain visible -- search filters within groups. Empty groups auto-hide when no projects match.
- **D-05:** Text search input filtering across all supply types (threads, beads, specialty) simultaneously. Matches on brand name, color code, and color name only -- not project names.
- **D-06:** Supply sections with zero matches auto-hide during search. Same pattern as project group auto-hiding.
- **D-07:** "Select All" selects only visible/filtered projects when search is active -- what you see is what you get.
- **D-08:** Selected projects persist through search/filter changes -- searching doesn't deselect hidden projects.
- **D-09:** Selection counter shows both filtered and total counts when search is active: "3 of 12 visible selected (5 total selected)".
- **D-10:** Each collapsible status group header has a "Select all in group" action for quick per-status selection.

### Claude's Discretion
- Search input styling and debounce timing -- match existing project input patterns in the app.
- Collapsible section animation -- use existing Collapsible component or simple show/hide.
- Whether supply search shares the same input as project search or is a separate input within the By Supply view.
- Performance approach -- virtualization vs. relying on search/filter to reduce rendered count.
- How the supply search input is positioned relative to existing section headers.

### Deferred Ideas (OUT OF SCOPE)
None.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CRIT-02 | Shopping cart scales to 75+ projects with search/filter, status grouping, and supply-type search | All 10 decisions (D-01 through D-10) directly implement CRIT-02. Existing `useMemo` filtering pattern handles O(n) for <500 items. Status grouping via `Map<ProjectStatus, ShoppingCartProject[]>` is straightforward. |
</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Project search filtering | Browser / Client | -- | All project data already loaded client-side. Search is `useMemo` + `toLowerCase()` substring match. No server roundtrip needed. |
| Status grouping | Browser / Client | -- | Grouping is a `Map` operation on the existing `projectsWithNeeds` array. Status enum values already available on each project. |
| Supply search filtering | Browser / Client | -- | Aggregated supplies are computed client-side in `supply-overview.tsx`. Search filters the aggregated output. |
| Selection state management | Browser / Client | -- | Selection is already a client-side `Set<string>` persisted to localStorage. New behaviors (selectVisible, selectGroup) are Set operations. |
| Data fetching | API / Backend | -- | Unchanged. `getShoppingCartData()` already returns all non-FINISHED/FFO projects in one query. No modifications needed. |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.2.5 | `useMemo`, `useDeferredValue`, `useState` for all filtering/grouping | Already installed. `useDeferredValue` provides non-blocking search updates without external debounce libraries. [VERIFIED: package.json] |
| lucide-react | (installed) | `Search`, `X`, `ChevronDown`, `ChevronRight` icons | Already used throughout codebase for icon consistency. [VERIFIED: codebase grep] |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @base-ui/react | (installed) | Base Input primitive for search inputs | Already used by the `Input` component in `src/components/ui/input.tsx`. [VERIFIED: codebase read] |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `useDeferredValue` | `setTimeout` debounce (150ms) | Gallery uses `useDeferredValue`, supply-table uses `setTimeout`. Either works for <500 items. `useDeferredValue` is simpler (no cleanup, no ref), matches gallery pattern, React-native. Use `useDeferredValue`. |
| Simple show/hide | Animated Collapsible | No `Collapsible` component exists in the project. Simple conditional rendering (`{isExpanded && <div>...</div>}`) matches the existing `ProjectAccordion` expand pattern. No animation needed per UI-SPEC. |
| Virtualization | Search + grouping | 75 projects * ~100px per row = ~7500px. Not enough to warrant virtualization overhead. Grouping + collapsing + search naturally reduces visible items. Profile if needed. |

**Installation:**
```bash
# No new packages needed
```

## Architecture Patterns

### System Architecture Diagram

```
ShoppingPage (Server Component)
  |
  v
getShoppingCartData() --> Prisma query --> ShoppingCartData
  |
  v
ShoppingCart (Client Component)
  |
  +-- searchQuery (useState) ----+
  |                               |
  +-- filteredProjects (useMemo) -+-- groupedByStatus (useMemo)
  |                               |
  +-- supplySearchQuery (useState) +
  |                               |
  v                               v
  ProjectAccordion              SupplyOverview
  (receives grouped data)      (receives search-filtered data)
  |                               |
  +-- StatusGroup (new)           +-- SupplySearchInput (new)
  |   +-- project cards           |
  |   +-- "Select all" per group  +-- filtered aggregated supplies
  |                               
  +-- ProjectSearchInput (new)
  +-- SelectionCounter (new)
```

### Recommended Project Structure
```
src/components/features/shopping/
  shopping-cart.tsx          # Modified: add search state, grouping logic, selectVisible
  project-accordion.tsx     # Modified: accept grouped data, render StatusGroup wrappers
  supply-overview.tsx        # Modified: accept search term, filter aggregated output
  project-search-input.tsx   # NEW: search input above view toggle
  supply-search-input.tsx    # NEW: search input within By Supply view
  status-group.tsx           # NEW: collapsible section per status
  selection-counter.tsx      # NEW: smart counter with filtered/total counts
  shopping-for-bar.tsx       # Unchanged
  shopping-list-tab.tsx      # Unchanged
  quantity-control.tsx       # Unchanged
```

### Pattern 1: Status Grouping
**What:** Group projects by `ProjectStatus` with a fixed display order per D-03.
**When to use:** Rendering the By Project view with status sections.
**Example:**
```typescript
// Source: Derived from genre-detail.tsx STATUS_ORDER + D-03 decisions
import type { ProjectStatus } from "@/generated/prisma/client";
import type { ShoppingCartProject } from "@/types/dashboard";

const STATUS_GROUP_ORDER: ProjectStatus[] = [
  "KITTING",
  "IN_PROGRESS",
  "ON_HOLD",
  "UNSTARTED",
  "KITTED",
  // FINISHED and FFO excluded by server query
];

function groupProjectsByStatus(
  projects: ShoppingCartProject[],
): Map<ProjectStatus, ShoppingCartProject[]> {
  const groups = new Map<ProjectStatus, ShoppingCartProject[]>();
  for (const project of projects) {
    const status = project.status;
    const group = groups.get(status) ?? [];
    group.push(project);
    groups.set(status, group);
  }
  return groups;
}
```

### Pattern 2: Search Filtering with useDeferredValue
**What:** Case-insensitive substring search with React's concurrent rendering for non-blocking input.
**When to use:** Project name search and supply search.
**Example:**
```typescript
// Source: Established pattern from use-gallery-filters.ts
import { useDeferredValue, useMemo, useState } from "react";

const [searchQuery, setSearchQuery] = useState("");
const deferredSearch = useDeferredValue(searchQuery);

const filteredProjects = useMemo(() => {
  if (!deferredSearch) return projectsWithNeeds;
  const lower = deferredSearch.toLowerCase();
  return projectsWithNeeds.filter(
    (p) => p.projectName.toLowerCase().includes(lower),
  );
}, [projectsWithNeeds, deferredSearch]);
```

### Pattern 3: Selection-Aware "Select All"
**What:** selectAll changes behavior based on whether search is active (D-07).
**When to use:** Global "Select all" / "Select visible" button.
**Example:**
```typescript
// Source: Extension of existing selectAll in shopping-cart.tsx
const selectVisible = useCallback(() => {
  setSelectedIds((prev) => {
    const next = new Set(prev);
    for (const id of filteredProjectIds) {
      next.add(id);
    }
    return next;
  });
}, [setSelectedIds, filteredProjectIds]);

const selectGroup = useCallback((groupProjectIds: string[]) => {
  setSelectedIds((prev) => {
    const next = new Set(prev);
    for (const id of groupProjectIds) {
      next.add(id);
    }
    return next;
  });
}, [setSelectedIds]);
```

### Pattern 4: Supply Search Across Types
**What:** Filter aggregated supplies by brand name, code, and color name across threads/beads/specialty (D-05).
**When to use:** Within the SupplyOverview component.
**Example:**
```typescript
// Source: Derived from D-05 requirements + existing aggregateSupplies pattern
function filterAggregatedSupplies(
  aggregated: AggregatedSupply[],
  searchTerm: string,
): AggregatedSupply[] {
  if (!searchTerm) return aggregated;
  const lower = searchTerm.toLowerCase();
  return aggregated.filter(
    (s) =>
      s.brandName.toLowerCase().includes(lower) ||
      s.code.toLowerCase().includes(lower) ||
      s.colorName.toLowerCase().includes(lower),
  );
}
```

### Anti-Patterns to Avoid
- **Filtering before aggregation in supply search:** Always aggregate first, then filter. Filtering raw supply items before aggregation would split multi-project supplies and show incorrect totals.
- **Mutating selectedIds Set directly:** Always create new Set instances via `new Set(prev)`. The existing pattern uses `setSelectedIds((prev) => { const next = new Set(prev); ... })`. Never `prev.add(id)` as this mutates state in place.
- **Persisting search state to localStorage:** Search is ephemeral per D-01 context. Do NOT persist search query. The existing `usePersistedViewMode` and `usePersistedSelection` hooks should NOT be extended for search.
- **Adding server-side filtering:** The data set is small enough (75-200 projects, <2000 supply items) for client-side filtering. Adding a server roundtrip would degrade UX with loading states on every keystroke.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Search input with clear button | Custom input with positioning | Copy the `FilterBar` search input pattern from `src/components/features/gallery/filter-bar.tsx` | Already has Search icon prefix, X clear button, proper focus styles, correct semantic tokens. Proven pattern. |
| Status badge in group headers | Inline status dot + label | `StatusBadge` component from `src/components/features/charts/status-badge.tsx` | Already renders status dot + label with correct colors. Consumed via `STATUS_CONFIG` from `src/lib/utils/status.ts`. |
| Empty state for no search results | Custom empty message | `EmptyState` component from `src/components/ui/empty-state.tsx` | Takes icon, title, description. Already used throughout the app for consistent empty states. |
| Non-blocking search input | Custom setTimeout debounce | React `useDeferredValue` | Built into React 19, already used in gallery filters. No cleanup, no refs, automatic concurrent rendering priority. |

**Key insight:** Every UI pattern needed in this phase already exists in the codebase. The gallery has search inputs, `useDeferredValue`, and filter state. The genre detail has `STATUS_ORDER`. The shopping cart has `Set<string>` selection and localStorage persistence. This phase is composition, not invention.

## Common Pitfalls

### Pitfall 1: Search filtering the selection Set instead of the display list
**What goes wrong:** Filtering `selectedIds` by search term would deselect hidden projects on re-render.
**Why it happens:** Confusion between "what's visible" and "what's selected". D-08 explicitly requires selections to persist through search.
**How to avoid:** Keep `selectedIds` as the source of truth for selection (never filtered). Only filter `projectsWithNeeds` for display. The `filteredProjects` array determines what's rendered; `selectedIds` determines what's checked.
**Warning signs:** Selected count changes when typing in search; selections disappear after clearing search.

### Pitfall 2: "Select All" selecting hidden projects during search
**What goes wrong:** Clicking "Select All" while search is active selects projects that don't match the search, violating D-07.
**Why it happens:** Reusing the existing `selectAll` callback which uses `validProjectIds` (all projects).
**How to avoid:** When `searchQuery` is non-empty, "Select All" must use `filteredProjectIds` not `validProjectIds`. The button label should change to "Select visible" per the copywriting contract.
**Warning signs:** Selection counter jumps higher than the visible project count after clicking Select All during search.

### Pitfall 3: Status group order drift from D-03
**What goes wrong:** Groups render in insertion order from the data (likely alphabetical by status enum) instead of the specified workflow order.
**Why it happens:** Using `Map` iteration order (insertion order) instead of a fixed ordering array.
**How to avoid:** Define `STATUS_GROUP_ORDER` as a constant array matching D-03: `KITTING, IN_PROGRESS, ON_HOLD, UNSTARTED, KITTED`. Iterate this array and look up the group map, not the reverse.
**Warning signs:** "Unstarted" group appears before "Stitching" group.

### Pitfall 4: Supply search filtering raw items instead of aggregated supplies
**What goes wrong:** Filtering `threads` array before `aggregateSupplies()` means a multi-project supply might be partially filtered, showing incorrect aggregated totals.
**Why it happens:** Natural impulse to filter early for performance. But aggregation must happen on the full set so totals are correct.
**How to avoid:** Call `aggregateSupplies(threads)` first, then `filterAggregatedSupplies(aggregated, search)` second. The filter operates on the aggregated view.
**Warning signs:** Supply shows "1/3 needed" when it should show "2/5 needed" because one project's contribution was filtered out.

### Pitfall 5: SelectionCounter re-renders not being aria-announced
**What goes wrong:** Screen readers don't announce selection count changes.
**Why it happens:** Missing `aria-live="polite"` on the counter element.
**How to avoid:** Add `aria-live="polite"` to the SelectionCounter wrapper per the accessibility contract in the UI-SPEC.
**Warning signs:** Silent selection changes for screen reader users.

## Code Examples

### Search Input Component (Reusable Pattern)
```typescript
// Source: Adapted from src/components/features/gallery/filter-bar.tsx
// The existing FilterBar has this exact pattern with Search + X + focus styles
import { Search, X } from "lucide-react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  ariaLabel: string;
}

function SearchInput({ value, onChange, placeholder, ariaLabel }: SearchInputProps) {
  return (
    <div className="relative w-full">
      <Search
        className="text-muted-foreground/60 absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2"
        strokeWidth={1.5}
      />
      <input
        type="text"
        role="searchbox"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className="border-border bg-card placeholder:text-muted-foreground focus:border-ring focus:ring-ring w-full rounded-lg border py-2 pr-8 pl-9 text-sm focus:ring-1 focus:outline-none"
      />
      {value.length > 0 && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2.5 -translate-y-1/2"
        >
          <X className="h-3.5 w-3.5" strokeWidth={2} />
        </button>
      )}
    </div>
  );
}
```

### StatusGroup Component
```typescript
// Source: Composed from existing StatusBadge + ProjectAccordion expand pattern
import { ChevronDown, ChevronRight } from "lucide-react";
import { STATUS_CONFIG } from "@/lib/utils/status";
import type { ProjectStatus } from "@/generated/prisma/client";

interface StatusGroupProps {
  status: ProjectStatus;
  count: number;
  isExpanded: boolean;
  onToggle: () => void;
  onSelectAll: () => void;
  children: React.ReactNode;
}

function StatusGroup({
  status, count, isExpanded, onToggle, onSelectAll, children,
}: StatusGroupProps) {
  const config = STATUS_CONFIG[status];
  
  return (
    <div role="group" aria-labelledby={`group-${status}`}>
      <div className="flex items-center justify-between py-2">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isExpanded}
          className="flex items-center gap-2"
          id={`group-${status}`}
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
          <span
            aria-hidden="true"
            className={cn("h-2 w-2 rounded-full", config.dotClass)}
          />
          <span className="text-sm font-semibold">{config.label}</span>
          <span className="bg-muted text-muted-foreground rounded-full px-1.5 py-0.5 font-mono text-[11px] font-semibold">
            {count}
          </span>
        </button>
        <button
          type="button"
          onClick={onSelectAll}
          className="text-progress-foreground text-xs font-medium"
          aria-label={`Select all ${config.label} projects`}
        >
          Select all
        </button>
      </div>
      {isExpanded && children}
    </div>
  );
}
```

### SelectionCounter Component
```typescript
// Source: D-09 specification
interface SelectionCounterProps {
  selectedCount: number;
  totalCount: number;
  visibleCount?: number;
  visibleSelectedCount?: number;
  isSearchActive: boolean;
}

function SelectionCounter({
  selectedCount, totalCount, visibleCount, visibleSelectedCount, isSearchActive,
}: SelectionCounterProps) {
  return (
    <p className="text-muted-foreground text-sm" aria-live="polite">
      {isSearchActive && visibleCount !== undefined && visibleSelectedCount !== undefined ? (
        <>
          {visibleSelectedCount} of {visibleCount} visible selected
          {selectedCount !== visibleSelectedCount && ` (${selectedCount} total selected)`}
        </>
      ) : (
        <>
          {selectedCount} of {totalCount} project{totalCount !== 1 ? "s" : ""} selected
        </>
      )}
    </p>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `setTimeout` debounce for search | `useDeferredValue` | React 18+ (2022) | No cleanup logic needed, automatic concurrent priority. Already used in gallery. |
| Flat project list | Status-grouped collapsible sections | This phase | Reduces cognitive load when scanning 75+ projects. |

**Deprecated/outdated:**
- None relevant -- this phase uses React 19 built-ins and existing project patterns.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | 75+ projects with ~2000 supply items is small enough for client-side filtering without virtualization | Architecture Patterns | LOW -- worst case is imperceptible lag on initial render. Grouping + collapsing reduces rendered DOM anyway. Can add virtualization later if profiling shows issues. [ASSUMED] |
| A2 | FINISHED and FFO statuses will never appear in shopping cart data (excluded by server query) | Pattern 1: Status Grouping | LOW -- the query `notIn: ["FINISHED", "FFO"]` is verified in `shopping-cart-actions.ts:25`. If this changes, groups for those statuses would simply render. [VERIFIED: codebase read] |

## Open Questions

1. **Project search in By Supply view scope**
   - What we know: D-01 says "filtering both views from a single location." The project search input filters the project list in By Project view.
   - What's unclear: Does the project search also filter which projects' supplies appear in the By Supply view? Or does it only filter project visibility?
   - Recommendation: The project search should filter the project pool in both views. When searching "dragon" in By Supply view, only supplies from projects matching "dragon" should aggregate. This is consistent with D-01 "filtering both views." The supply search (D-05) is a secondary filter within the supply view. Implementation: filter `projectsWithNeeds` first by project search, then use those filtered project IDs for supply filtering. The supply search then additionally filters the aggregated results by brand/code/color.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest (installed) |
| Config file | `vitest.config.ts` |
| Quick run command | `npx vitest run src/components/features/shopping/ --reporter=verbose` |
| Full suite command | `npm test` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CRIT-02a | Project search filters project list by name | unit | `npx vitest run src/components/features/shopping/shopping-cart.test.tsx -t "search" -x` | Wave 0 |
| CRIT-02b | Projects grouped by status with correct order | unit | `npx vitest run src/components/features/shopping/project-accordion.test.tsx -t "status group" -x` | Wave 0 |
| CRIT-02c | Status groups are collapsible, expanded by default | unit | `npx vitest run src/components/features/shopping/status-group.test.tsx -x` | Wave 0 |
| CRIT-02d | Empty groups auto-hide during search | unit | `npx vitest run src/components/features/shopping/shopping-cart.test.tsx -t "empty group" -x` | Wave 0 |
| CRIT-02e | Supply search filters by brand/code/colorName | unit | `npx vitest run src/components/features/shopping/supply-overview.test.tsx -t "search" -x` | Wave 0 |
| CRIT-02f | Select All selects only visible when search active | unit | `npx vitest run src/components/features/shopping/shopping-cart.test.tsx -t "select visible" -x` | Wave 0 |
| CRIT-02g | Selections persist through search changes | unit | `npx vitest run src/components/features/shopping/shopping-cart.test.tsx -t "persist" -x` | Wave 0 |
| CRIT-02h | Selection counter shows filtered/total counts | unit | `npx vitest run src/components/features/shopping/selection-counter.test.tsx -x` | Wave 0 |
| CRIT-02i | Per-group "Select all" selects group projects | unit | `npx vitest run src/components/features/shopping/status-group.test.tsx -t "select all" -x` | Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run src/components/features/shopping/ --reporter=verbose`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `src/components/features/shopping/status-group.test.tsx` -- covers CRIT-02c, CRIT-02i
- [ ] `src/components/features/shopping/selection-counter.test.tsx` -- covers CRIT-02h
- [ ] Existing test files need extension: `shopping-cart.test.tsx` (search, select-visible, group hiding), `project-accordion.test.tsx` (grouped rendering), `supply-overview.test.tsx` (supply search)

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | Unchanged -- `requireAuth()` already on `getShoppingCartData()` |
| V3 Session Management | no | No session changes |
| V4 Access Control | no | No new server actions, existing IDOR protection unchanged |
| V5 Input Validation | no | Search is client-side `toLowerCase()` only, no server-bound input |
| V6 Cryptography | no | No crypto operations |

### Known Threat Patterns for This Phase

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| XSS via search input | Tampering | React JSX auto-escaping. Search value is only used in `.includes()` comparison, never rendered as raw HTML. No risk. |

**Security summary:** This phase is client-side only. No new server endpoints, no new data mutations, no user input sent to the server. The existing `requireAuth()` on `getShoppingCartData()` and `updateSupplyAcquired()` remain unchanged. Security risk is effectively zero for this phase.

## Project Constraints (from CLAUDE.md)

| Directive | Compliance |
|-----------|------------|
| Server Components by default | Respected -- all changes are in existing `"use client"` components. No new server components needed. |
| Zod validation at boundaries | N/A -- no new server actions or API routes. |
| Colocated tests | All new test files will be adjacent to their components. |
| Import test utils from `@/__tests__/test-utils` | Tests will use this import, not `@testing-library/react`. |
| TDD mandatory | Tests before implementation in all plans. |
| Semantic design tokens | Search inputs use `border-border`, `bg-card`, `text-muted-foreground` per existing FilterBar pattern. No hardcoded color scales. |
| No `Button render={<Link>}` | N/A -- no navigation buttons in this phase. |
| Pin exact versions | N/A -- no new dependencies. |

## Sources

### Primary (HIGH confidence)
- Codebase read: `shopping-cart.tsx`, `project-accordion.tsx`, `supply-overview.tsx`, `shopping-for-bar.tsx`, `shopping-list-tab.tsx`, `shopping-cart-actions.ts` -- full understanding of existing architecture
- Codebase read: `use-gallery-filters.ts`, `filter-bar.tsx` -- search input and `useDeferredValue` patterns
- Codebase read: `status.ts`, `status-badge.tsx` -- status configuration and badge component
- Codebase read: `genre-detail.tsx` -- `STATUS_ORDER` pattern for status sorting
- Codebase read: `dashboard.ts` -- `ShoppingCartProject`, `ShoppingSupplyNeed`, `ShoppingFabricNeed`, `ShoppingCartData` types
- Codebase read: `empty-state.tsx` -- empty state component API
- `25-CONTEXT.md` -- all 10 locked decisions (D-01 through D-10)
- `25-UI-SPEC.md` -- full UI design contract with layout, copywriting, accessibility, and state management specifications
- `prisma/schema.prisma` -- `ProjectStatus` enum: UNSTARTED, KITTING, KITTED, IN_PROGRESS, ON_HOLD, FINISHED, FFO
- `package.json` -- React 19.2.5 (useDeferredValue fully supported)

### Secondary (MEDIUM confidence)
- None needed -- all research grounded in codebase reads.

### Tertiary (LOW confidence)
- None.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no new dependencies, all patterns exist in codebase
- Architecture: HIGH -- client-side filtering on existing data, no architectural changes
- Pitfalls: HIGH -- identified from actual code patterns and decision constraints

**Research date:** 2026-05-18
**Valid until:** 2026-06-18 (stable -- no external dependencies or version concerns)

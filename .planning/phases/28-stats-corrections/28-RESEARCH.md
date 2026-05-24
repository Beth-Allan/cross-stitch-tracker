# Phase 28: Stats Corrections - Research

**Researched:** 2026-05-23
**Domain:** Stats page restructuring, Recharts formatting, nuqs URL state, Prisma aggregation
**Confidence:** HIGH

## Summary

Phase 28 corrects five accuracy and formatting issues across the stats page and dashboard. The work splits into three logical domains: (1) reorganizing insight data between tabs and switching their data source from session-gated to library-wide queries with status filtering, (2) adding `allowDecimals={false}` to chart axes and removing redundant `RankedList` components, and (3) fixing the `formatAge()` duplication bug on the dashboard.

All changes use existing libraries and patterns already established in the codebase. The only new component is `StatusFilterPills`, which clones the existing `YearScopeToggle` pattern. A new query for "collection total" (sum of `chart.stitchCount` across all charts) is needed, and existing insight queries need their `sessions: { some: ... }` filter removed and replaced with optional status filtering.

**Primary recommendation:** Split into 3 parallel plans: (1) data layer changes (query rewrites, collection total, status filter plumbing), (2) Overview + Records tab restructuring (move insights, add pills, add session hero stat), (3) chart axis fixes + RankedList removal + formatAge fix.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Move thread/designer/genre insights from the Records tab to the Overview tab. Place them near their existing breakdown charts on Overview.
- **D-02:** Records tab keeps only session-based content: personal bests, fastest completions, completion estimates.
- **D-03:** Remove the `YearScopeToggle` from the Records tab. All data is always all-time.
- **D-04:** Add all-time session stitch total as a hero stat on the Records tab.
- **D-05:** Add a pill/chip row of status filter toggles to the Overview tab, above the insights sections. Multi-select toggles.
- **D-06:** Grouped statuses: **All** (default), **Not Started** (Unstarted), **In Progress** (Kitting + Kitted + IN_PROGRESS + ON_HOLD), **Complete** (Finished + FFO).
- **D-07:** When no specific pills are toggled, "All" is active (full library). URL-state via nuqs for persistence.
- **D-08:** Thread/designer/genre insight queries switch from session-gated to full-library queries. Filter by project status groups when pills are active. Always all-time scope.
- **D-09:** Replace "Total Stitches" lifetime counter (session sum) with "Collection Total" -- sum of all charts' `stitchCount`.
- **D-10:** Move the all-time session stitch total to the Records tab as a hero stat.
- **D-11:** Add `allowDecimals={false}` to the numeric axis on all collection breakdown charts.
- **D-12:** Remove the `RankedList` component usage from below designer and genre breakdown charts.
- **D-13:** Do NOT make Y-axis labels clickable. Deferred.
- **D-14:** Fix Buried Treasures `formatAge()` to return only the unit string, not the repeated number.

### Claude's Discretion
- Test strategy and plan structure/grouping.
- Exact nuqs param names for the status filter URL state.
- How the session stitch total hero stat is styled on the Records tab.
- Whether to keep the `RankedList` component in the codebase or remove it.
- Layout adjustments when insights move from Records to Overview.

### Deferred Ideas (OUT OF SCOPE)
- Clickable designer/genre names on chart Y-axis (SVG link complexity)
- Year scoping for Records tab (Year in Review feature)
- Stats architecture redesign (FEAT-07)
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| STAT-01 | User sees records tab items (thread stats, personal bests, insights) populated on stats page | Insight queries rewritten to library-wide (D-08), insights moved to Overview (D-01), status filter pills (D-05-D-07), session hero stat on Records (D-04) |
| STAT-02 | Collection breakdown chart axes use integer values for discrete data | `allowDecimals={false}` on XAxis/YAxis (D-11) -- verified Recharts prop |
| STAT-03 | Collection breakdown charts display entity names inline rather than in separate linked lists | RankedList removal (D-12) -- Y-axis already shows names via `dataKey="name"` |
| STAT-04 | User sees total stitches across all projects on the stats page | Collection Total query (D-09) sums `chart.stitchCount`, session total moves to Records (D-10) |
| STAT-05 | Days-in-library displays as large prominent number with small "days in library" label | `formatAge()` fix in BuriedTreasuresSection (D-14) |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- **TDD mandatory** -- tests before implementation in all plans
- **Server Components by default** -- "use client" only for interactivity
- **Import test utils from `@/__tests__/test-utils`** -- not `@testing-library/react`
- **Colocated tests** -- `foo.test.tsx` next to `foo.tsx`
- **Semantic design tokens** -- never hardcoded color scales
- **Pin exact versions** in package.json
- **No `"use client"` unless genuinely needed**
- **Zod validation at boundaries** for server actions
- **Comment conventions** -- "why" not "what", no section markers in function bodies

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Insight query rewrites (D-08) | Database / Prisma | -- | Pure query layer change; remove session gate, add status filter |
| Collection total query (D-09) | Database / Prisma | -- | New aggregate: `chart.stitchCount` sum |
| Status filter pills (D-05-07) | Browser / Client | Frontend Server (SSR) | Client component for toggle interaction; server-side parsing via `createSearchParamsCache` |
| Tab restructuring (D-01-04) | Frontend Server (SSR) | Browser / Client | Server component layout changes; insight components are already client-agnostic |
| Chart axis fix (D-11) | Browser / Client | -- | Recharts prop on client components |
| RankedList removal (D-12) | Frontend Server (SSR) | -- | Remove JSX from server component `StatsOverview` |
| formatAge fix (D-14) | Frontend Server (SSR) | -- | Pure function fix in server component |

## Standard Stack

### Core (already installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| recharts | 3.8.0 | Chart rendering | Already used for all stats charts [VERIFIED: package.json] |
| nuqs | 2.8.9 | URL state management | Already used for tabs, sort, filters [VERIFIED: package.json] |
| @prisma/client | (Prisma 7) | Database queries | ORM for all data access [VERIFIED: package.json] |

### Supporting (already installed)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lucide-react | installed | Icons | Icon for insight card headings [VERIFIED: codebase usage] |
| @date-fns/tz | installed | Timezone handling | Used in stats query utils [VERIFIED: codebase usage] |

**Installation:** No new packages needed. All dependencies are already installed.

## Package Legitimacy Audit

No new packages required for this phase. All libraries referenced (`recharts`, `nuqs`, `@prisma/client`, `lucide-react`) are already installed and in active use throughout the codebase.

**Packages removed due to slopcheck [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

## Architecture Patterns

### System Architecture Diagram

```
URL (?status=not-started,complete)
  |
  v
stats/page.tsx (Server Component)
  |
  +-- statsSearchParamsCache.parse(searchParams)
  |     -> extracts: page, sort, dir, project, status[]
  |
  +-- Promise.allSettled([
  |     getHeroStats(userId),              // unchanged
  |     getCollectionTotal(userId),         // NEW: sum chart.stitchCount
  |     getThreadInsights(userId, status),  // CHANGED: library-wide + status filter
  |     getDesignerInsights(userId, status),// CHANGED: library-wide + status filter
  |     getGenreInsights(userId, status),   // CHANGED: library-wide + status filter
  |     ...14 other queries (unchanged)
  |   ])
  |
  +-- settled<T>() unwrap each result
  |
  +-- StatsPageShell (Client: tab routing)
        |
        +-- StatsOverview (receives insights + statusFilter)
        |     +-- MetricsBar
        |     +-- LifetimeCounters (collectionTotal replaces totalLifetimeStitches)
        |     +-- Charts (designer, genre, size, collection status)
        |     +-- StatusFilterPills (NEW: client component, nuqs)
        |     +-- ThreadInsightList (MOVED from Records)
        |     +-- DesignerInsightList (MOVED from Records)
        |     +-- GenreInsightList (MOVED from Records)
        |
        +-- ActivityOverview (unchanged)
        |
        +-- RecordsOverview (simplified)
              +-- SessionStitchTotal hero stat (NEW)
              +-- RecordsTable (personal bests, fastest completions)
              +-- CompletionEstimatesSection
              // Removed: YearScopeToggle, insight lists
```

### Recommended Project Structure

No new directories. Changes are within existing files:

```
src/
  app/(dashboard)/stats/
    page.tsx              # Add collectionTotal query, pass status filter, rewire props
    search-params.ts      # Add 'status' param to cache
  components/features/stats/
    stats-overview.tsx     # Receive insights + status filter, render pills + insights
    records-overview.tsx   # Remove insights/YearScopeToggle, add session hero stat
    lifetime-counters.tsx  # Rename prop, change label
    status-filter-pills.tsx   # NEW component
    designer-breakdown-chart.tsx  # Add allowDecimals
    genre-distribution-chart.tsx  # Add allowDecimals
    size-category-chart.tsx       # Add allowDecimals
  components/features/dashboard/
    buried-treasures-section.tsx  # Fix formatAge()
  lib/queries/stats/
    hero-stats.ts         # Add collectionTotal to return type
    thread-insights.ts    # Remove session gate, add status filter
    designer-insights.ts  # Remove session gate, add status filter
    genre-insights.ts     # Remove session gate, add status filter
    index.ts              # Export new/changed functions
  types/stats.ts          # Add collectionTotal to StatsHeroData (or separate type)
```

### Pattern 1: Status Filter Pills (nuqs multi-select)

**What:** Client component using `useQueryState` with `parseAsArrayOf(parseAsStringLiteral(...))` for multi-select toggle buttons that persist to URL.

**When to use:** Any multi-select filter that should survive page refresh and back navigation.

**Example:**
```typescript
// Source: existing codebase pattern (use-gallery-filters.ts + YearScopeToggle)
"use client";

import { useQueryState, parseAsArrayOf, parseAsStringLiteral } from "nuqs";

const STATUS_GROUPS = ["not-started", "in-progress", "complete"] as const;
type StatusGroup = (typeof STATUS_GROUPS)[number];

export function StatusFilterPills() {
  const [statusFilter, setStatusFilter] = useQueryState(
    "status",
    parseAsArrayOf(parseAsStringLiteral([...STATUS_GROUPS]), ",").withDefault([]),
  );

  const isAllActive = statusFilter.length === 0;

  function toggleGroup(group: StatusGroup) {
    setStatusFilter((prev) => {
      const current = prev ?? [];
      return current.includes(group)
        ? current.filter((g) => g !== group)
        : [...current, group];
    });
  }

  function clearAll() {
    setStatusFilter(null); // resets to default (empty = All)
  }

  // Render pills with aria-pressed pattern...
}
```

### Pattern 2: Library-Wide Insight Query with Status Filter

**What:** Remove session-gated filtering, add optional status group filtering via `project.status: { in: [...] }`.

**When to use:** Insight queries that should reflect the full library, not just projects with sessions.

**Example:**
```typescript
// Source: existing thread-insights.ts pattern, modified per D-08
const STATUS_GROUP_MAP: Record<string, ProjectStatus[]> = {
  "not-started": ["UNSTARTED"],
  "in-progress": ["KITTING", "KITTED", "IN_PROGRESS", "ON_HOLD"],
  "complete": ["FINISHED", "FFO"],
};

function resolveStatusFilter(groups: string[]): ProjectStatus[] {
  return groups.flatMap((g) => STATUS_GROUP_MAP[g] ?? []);
}

async function computeThreadInsights(
  userId: string,
  statusGroups: string[],
  limit: number,
): Promise<ThreadInsight[]> {
  const statusFilter = resolveStatusFilter(statusGroups);

  const results = await prisma.projectThread.groupBy({
    by: ["threadId"],
    where: {
      project: {
        userId,
        ...(statusFilter.length > 0 ? { status: { in: statusFilter } } : {}),
      },
    },
    // ...rest unchanged
  });
  // ...
}
```

### Pattern 3: Collection Total Query

**What:** Aggregate sum of `chart.stitchCount` across all user charts.

**Example:**
```typescript
// New addition to hero-stats.ts or standalone query
const collectionTotal = await prisma.chart.aggregate({
  where: {
    projects: { some: { userId } },
  },
  _sum: { stitchCount: true },
});
// Returns collectionTotal._sum.stitchCount ?? 0
```

Note: The Prisma field is `chart.stitchCount` (not `totalStitchCount` as mentioned in CONTEXT.md). The CONTEXT.md used the conceptual name; the actual Prisma model field is `stitchCount` on the `Chart` model. [VERIFIED: prisma/schema.prisma line 50]

### Anti-Patterns to Avoid
- **Don't add scope/date filtering to library-wide insights:** D-08 explicitly removes date filtering. The insight queries should only filter by status groups, never by year scope.
- **Don't nest forms in StatusFilterPills:** These are toggle buttons, not form elements. Use `type="button"` on each pill.
- **Don't add "use client" to StatsOverview:** It's currently a server component receiving data as props. The new `StatusFilterPills` is a separate client component; insight list components are already server-compatible. StatsOverview stays server.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| URL state for multi-select filter | Custom state + `useSearchParams` | nuqs `parseAsArrayOf(parseAsStringLiteral(...))` | Handles serialization, default values, URL encoding, SSR |
| Integer-only chart ticks | Custom tick formatter with `Math.floor` | Recharts `allowDecimals={false}` | Built-in prop, handles edge cases like rounding and tick count |
| Status group mapping | Inline conditionals per query | Shared `resolveStatusFilter()` utility | Reused by 3 insight queries, single source for status groupings |

## Common Pitfalls

### Pitfall 1: Server Component Prop Threading
**What goes wrong:** Adding client-side URL state (status filter) to a server component data flow causes hydration issues or stale data.
**Why it happens:** `StatusFilterPills` is a client component that updates URL params. But the insight data is fetched server-side in `page.tsx`. URL param changes trigger a server-side re-fetch via Next.js navigation.
**How to avoid:** Parse status filter in `statsSearchParamsCache` on the server. Pass parsed status groups to insight queries. The status filter pills update the URL, which triggers a server re-render with the new params. This is the existing pattern for `sort`, `dir`, `page`, and `project` params.
**Warning signs:** If insight data doesn't update when pills are toggled, the param isn't being parsed server-side or isn't passed to queries.

### Pitfall 2: Chart stitchCount vs Session stitchCount
**What goes wrong:** Using `StitchSession.stitchCount` (session-logged stitches) instead of `Chart.stitchCount` (design total) for the collection total, or vice versa.
**Why it happens:** Both fields are named `stitchCount` in their respective Prisma models. The CONTEXT.md references "totalStitchCount" which doesn't exist as a field name.
**How to avoid:** D-09 Collection Total = `prisma.chart.aggregate({ _sum: { stitchCount: true } })`. D-04/D-10 Session Total = existing `lifetime._sum.stitchCount` from `StitchSession` aggregate.
**Warning signs:** Collection total showing a suspiciously small number (that's session stitches) or insight data being session-gated when it shouldn't be.

### Pitfall 3: Null Chart.stitchCount Values
**What goes wrong:** Some charts may have `stitchCount = 0` (default) because the user hasn't entered a stitch count. The collection total sum includes these as 0, which is correct but may confuse users.
**Why it happens:** `stitchCount` defaults to 0 in the schema, not null. So `_sum` will always return a number.
**How to avoid:** This is actually fine -- `?? 0` handles the aggregate null case, and 0-stitch charts contribute 0 to the sum. No special handling needed.

### Pitfall 4: nuqs Array Serialization with createSearchParamsCache
**What goes wrong:** `parseAsArrayOf` uses comma separation by default. If `createSearchParamsCache` doesn't use the same parser, server and client disagree on the value.
**Why it happens:** The server-side cache and client-side hook must use identical parsers.
**How to avoid:** Define the parser once, export it, use it in both `statsSearchParamsCache` and `StatusFilterPills`. The gallery filters already demonstrate this pattern with `parseAsArrayOf(parseAsString, ",")`.
**Warning signs:** URL shows `?status=not-started,complete` but server parses it as a single string `"not-started,complete"`.

### Pitfall 5: Test Updates for Restructured Components
**What goes wrong:** Existing tests for `StatsOverview` assert 2 `RankedList` instances and don't expect insight lists. Tests break silently.
**Why it happens:** `stats-overview.test.tsx` line 199-214 explicitly asserts 2 ranked lists.
**How to avoid:** Update the test: remove RankedList assertions, add mocks for insight list components, assert they receive correct props. Similarly, no existing `RecordsOverview` test exists -- create one.

### Pitfall 6: `scope` Parameter Removal from Insight Queries
**What goes wrong:** The `scope` URL param is still read in `page.tsx` and passed to insight queries. After D-08, insights no longer use date scope -- they use status groups instead.
**Why it happens:** The existing code passes `scope` to all 6 queries (personalBests, fastestCompletions, threadInsights, designerInsights, genreInsights, completionEstimates). Only insights change; personalBests and fastestCompletions may still need scope.
**How to avoid:** Change insight query signatures to accept `statusGroups: string[]` instead of `scope: Scope`. Keep `scope` for personalBests, fastestCompletions, and completionEstimates. The `scope` search param stays in the cache for other queries. The `scope` param on the Records tab YearScopeToggle is removed (D-03), but personalBests/fastestCompletions/completionEstimates currently use it -- per D-03, all Records data is always all-time, so pass `"all"` as scope to those queries.

## Code Examples

### Collection Total Addition to Hero Stats

```typescript
// Source: existing hero-stats.ts pattern + D-09
// Option A: Add to computeHeroStats (preferred -- keeps single query point)
const [today, week, month, year, lifetime, completedCount, collectionTotal] =
  await Promise.all([
    // ...existing 5 aggregates...
    prisma.project.count({
      where: { userId, status: { in: ["FINISHED", "FFO"] } },
    }),
    prisma.chart.aggregate({
      where: { projects: { some: { userId } } },
      _sum: { stitchCount: true },
    }),
  ]);

return {
  // ...existing fields...
  collectionTotalStitches: collectionTotal._sum.stitchCount ?? 0,
};
```

### formatAge Fix

```typescript
// Source: buried-treasures-section.tsx, D-14
// Current (broken):
function formatAge(days: number): string {
  if (days < 30) return `${days} days`;
  if (days < 365) return `${Math.floor(days / 30)} months`;
  return `${Math.floor(days / 365)} years`;
}

// Fixed:
function formatAge(days: number): string {
  if (days < 30) return "days";
  if (days < 365) return "months";
  return "years";
}
// Template changes from:
//   {formatAge(t.daysInLibrary)} in library
// To:
//   {formatAge(t.daysInLibrary)} in library
// (unchanged -- the number is already rendered separately above)
```

### LifetimeCounters Label Change

```typescript
// Source: lifetime-counters.tsx, D-09
const COUNTER_CARDS = [
  { key: "collectionTotalStitches" as const, label: "COLLECTION TOTAL", format: "number" as const },
  { key: "totalSessions" as const, label: "SESSIONS", format: "number" as const },
  // ...rest unchanged
];
```

### Search Params Cache Update

```typescript
// Source: stats/search-params.ts
import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  parseAsArrayOf,
} from "nuqs/server";

export const STATUS_GROUPS = ["not-started", "in-progress", "complete"] as const;

export const statsSearchParamsCache = createSearchParamsCache({
  page: parseAsInteger.withDefault(1),
  sort: parseAsStringLiteral(SORT_FIELDS).withDefault("date"),
  dir: parseAsStringLiteral(SORT_DIRS).withDefault("desc"),
  project: parseAsString.withDefault("all"),
  scope: parseAsString.withDefault("all"),
  status: parseAsArrayOf(parseAsStringLiteral([...STATUS_GROUPS]), ",").withDefault([]),
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Session-gated insights | Library-wide with status filtering | This phase (D-08) | Insights populate for library data, not just session data |
| Separate RankedList below charts | Y-axis shows names inline | This phase (D-12) | Cleaner UI, less redundancy |
| Session stitch total as "Total Stitches" | Collection total as "Collection Total" | This phase (D-09) | Shows scope of entire library, not just logged stitches |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `parseAsArrayOf` + `parseAsStringLiteral` combo works in `createSearchParamsCache` (verified in client via gallery-filters, not yet verified in server cache) | Architecture Patterns | Status filter would not parse server-side; pills would update URL but data wouldn't change. Mitigation: test in Wave 0. |
| A2 | `prisma.chart.aggregate` with `_sum: { stitchCount: true }` filtered by `projects: { some: { userId } }` returns correct total | Code Examples | Collection total query might need different relation traversal. Verify in implementation. |

## Open Questions

1. **Records tab empty state with no sessions**
   - What we know: RecordsOverview currently shows "No records yet" when `hasNoSessions` is true. D-04 adds a session stitch total hero stat. If the user has no sessions, this shows 0.
   - What's unclear: Should the hero stat (showing 0) still appear when there are no sessions, or should it be hidden behind the empty state?
   - Recommendation: Show the empty state as-is. The hero stat only makes sense when sessions exist. Keep the existing guard.

2. **`scope` parameter for personalBests/fastestCompletions/completionEstimates**
   - What we know: D-03 removes YearScopeToggle. These queries currently accept a scope param. With the toggle gone, they'll always get "all".
   - What's unclear: Should we refactor these queries to remove the scope parameter entirely, or just always pass "all"?
   - Recommendation: Always pass "all" from page.tsx. Leave the scope parameter in query signatures for potential future Year in Review feature. Minimal change, no risk.

3. **Keep or delete RankedList/YearScopeToggle component files**
   - What we know: D-12 removes RankedList usage; D-03 removes YearScopeToggle usage. UI-SPEC says "components remain in codebase (may be useful later)."
   - Recommendation: Keep the files but remove their usage. Delete their test files since the components are now unused. Or keep tests too -- low cost. Claude's discretion per CONTEXT.md.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 3.2.1 |
| Config file | `vitest.config.ts` |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npm test` |

### Phase Requirements to Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| STAT-01a | Insight queries return library-wide data (no session gate) | unit | `npx vitest run src/lib/queries/stats/thread-insights.test.ts -x` | Yes (needs update) |
| STAT-01b | Insight queries filter by status groups | unit | `npx vitest run src/lib/queries/stats/thread-insights.test.ts -x` | Yes (needs update) |
| STAT-01c | StatusFilterPills renders with correct toggle behavior | unit | `npx vitest run src/components/features/stats/status-filter-pills.test.tsx -x` | No (Wave 0) |
| STAT-01d | StatsOverview renders insight lists | unit | `npx vitest run src/components/features/stats/stats-overview.test.tsx -x` | Yes (needs update) |
| STAT-01e | RecordsOverview shows session hero stat, not insights | unit | `npx vitest run src/components/features/stats/records-overview.test.tsx -x` | No (Wave 0) |
| STAT-02 | Chart axes use allowDecimals={false} | unit | `npx vitest run src/components/features/stats/designer-breakdown-chart.test.tsx -x` | Yes (needs update) |
| STAT-03 | RankedList not rendered in StatsOverview | unit | `npx vitest run src/components/features/stats/stats-overview.test.tsx -x` | Yes (needs update) |
| STAT-04a | Hero stats includes collectionTotalStitches | unit | `npx vitest run src/lib/queries/stats/hero-stats.test.ts -x` | Yes (needs update) |
| STAT-04b | LifetimeCounters shows "COLLECTION TOTAL" label | unit | `npx vitest run src/components/features/stats/lifetime-counters.test.tsx -x` | Yes (needs update) |
| STAT-04c | Records tab shows session stitch total | unit | `npx vitest run src/components/features/stats/records-overview.test.tsx -x` | No (Wave 0) |
| STAT-05 | formatAge returns unit only; no number duplication | unit | `npx vitest run src/components/features/dashboard/buried-treasures-section.test.tsx -x` | No (Wave 0) |

### Sampling Rate
- **Per task commit:** `npx vitest run --reporter=verbose`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `src/components/features/stats/status-filter-pills.test.tsx` -- covers STAT-01c (new component)
- [ ] `src/components/features/stats/records-overview.test.tsx` -- covers STAT-01e, STAT-04c (no existing test)
- [ ] `src/components/features/dashboard/buried-treasures-section.test.tsx` -- covers STAT-05 (no existing test, can test `formatAge` via component render)

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | N/A (no auth changes) |
| V3 Session Management | no | N/A |
| V4 Access Control | yes (minimal) | All queries already filter by `userId` via `requireAuth()` |
| V5 Input Validation | yes (minimal) | nuqs `parseAsStringLiteral` validates status group values |
| V6 Cryptography | no | N/A |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Status filter injection via URL | Tampering | `parseAsStringLiteral` rejects invalid values; Prisma parameterizes queries |
| Cross-user data leakage in new collection total query | Information Disclosure | Filter by `projects: { some: { userId } }` -- same pattern as all existing queries |

No new security concerns. All queries inherit the existing `requireAuth()` + `userId` filtering pattern. The new URL param (`status`) is validated by nuqs's literal parser before reaching any query.

## Sources

### Primary (HIGH confidence)
- **Codebase inspection** -- all source files listed in CONTEXT.md canonical refs read and analyzed
- **Recharts XAxis docs** -- `allowDecimals` prop verified as `boolean`, default `true` [CITED: recharts.github.io/en-US/api/XAxis/]
- **nuqs package** -- `parseAsArrayOf` signature verified from `node_modules/nuqs/dist/parsers-C-U-ytM5.d.ts` [VERIFIED: local package]
- **Prisma schema** -- `Chart.stitchCount` is `Int @default(0)` at line 50 [VERIFIED: prisma/schema.prisma]
- **Existing codebase patterns** -- gallery filters use `parseAsArrayOf(parseAsString, ",")`, session-history-table uses `useQueryStates` [VERIFIED: codebase grep]

### Secondary (MEDIUM confidence)
- **nuqs server-side array parsing** -- `parseAsArrayOf` exported from `nuqs/server` (verified in type definitions) but not yet used in `createSearchParamsCache` in this project [VERIFIED: nuqs type definitions]

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries already installed and in use
- Architecture: HIGH -- follows existing patterns exactly (nuqs URL state, Prisma queries, component restructuring)
- Pitfalls: HIGH -- all identified from direct codebase inspection of the specific files being modified

**Research date:** 2026-05-23
**Valid until:** 2026-06-23 (stable -- no dependency upgrades needed)

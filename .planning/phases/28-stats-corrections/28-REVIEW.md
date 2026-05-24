---
phase: 28-stats-corrections
reviewed: 2026-05-23T21:45:00Z
depth: standard
files_reviewed: 30
files_reviewed_list:
  - src/__tests__/mocks/factories.ts
  - src/app/(dashboard)/stats/page.tsx
  - src/app/(dashboard)/stats/search-params.ts
  - src/components/features/dashboard/buried-treasures-section.test.tsx
  - src/components/features/dashboard/buried-treasures-section.tsx
  - src/components/features/stats/designer-breakdown-chart.test.tsx
  - src/components/features/stats/designer-breakdown-chart.tsx
  - src/components/features/stats/genre-distribution-chart.test.tsx
  - src/components/features/stats/genre-distribution-chart.tsx
  - src/components/features/stats/lifetime-counters.test.tsx
  - src/components/features/stats/lifetime-counters.tsx
  - src/components/features/stats/records-overview.test.tsx
  - src/components/features/stats/records-overview.tsx
  - src/components/features/stats/size-category-chart.test.tsx
  - src/components/features/stats/size-category-chart.tsx
  - src/components/features/stats/stats-overview.test.tsx
  - src/components/features/stats/stats-overview.tsx
  - src/components/features/stats/status-filter-pills.test.tsx
  - src/components/features/stats/status-filter-pills.tsx
  - src/lib/queries/stats/designer-insights.test.ts
  - src/lib/queries/stats/designer-insights.ts
  - src/lib/queries/stats/genre-insights.test.ts
  - src/lib/queries/stats/genre-insights.ts
  - src/lib/queries/stats/hero-stats.test.ts
  - src/lib/queries/stats/hero-stats.ts
  - src/lib/queries/stats/thread-insights.test.ts
  - src/lib/queries/stats/thread-insights.ts
  - src/lib/utils/status-groups.test.ts
  - src/lib/utils/status-groups.ts
  - src/types/stats.ts
findings:
  critical: 1
  warning: 4
  info: 1
  total: 6
status: issues_found
---

# Phase 28: Code Review Report

**Reviewed:** 2026-05-23T21:45:00Z
**Depth:** standard
**Files Reviewed:** 30
**Status:** issues_found

## Summary

Phase 28 rewrites insight queries from session-gated/scope-based to library-wide with status group filtering, adds a `collectionTotalStitches` hero stat, relocates insight lists from Records to Overview, adds `StatusFilterPills`, splits the buried-treasures age display into number + unit label, and removes `RankedList` / `YearScopeToggle`.

The production code is solid. The query rewrites, status-groups utility, and component restructuring are clean. However, the new test files contain multiple TypeScript type errors that will fail `tsc --noEmit` (confirmed via build check). One critical finding (4 type errors across 2 test files), plus several warnings around mutation, dead code, and error logging.

## Critical Issues

### CR-01: Test mock data does not match type definitions (4 TypeScript errors)

**File:** `src/components/features/stats/records-overview.test.tsx:23,36,51` and `src/components/features/stats/stats-overview.test.tsx:143`

**Issue:** Both test files are new in this phase and contain mock data that does not conform to the declared TypeScript types. `tsc --noEmit` confirms 4 errors:

1. **records-overview.test.tsx:23** -- `type: "dailyStitches"` is not assignable to `PersonalBestRecord`. Valid types are `"bestDay" | "bestSession" | "longestStreak" | "currentStreak"`. Also uses `achievedAt` which is not a field on any variant (should be `date` on `ProjectLinkedRecord`).

2. **records-overview.test.tsx:36** -- `FastestCompletion` mock uses `totalStitches`, `averagePerDay`, `completedAt` which do not exist on the type. The actual interface requires `sizeCategory`, `chartId`, `startDate`, `finishDate`.

3. **records-overview.test.tsx:51** -- `CompletionEstimate` mock uses `averagePerDay` (should be `avgPerDay`) and includes `daysRemaining` which does not exist on the type. Also missing required field `chartId`.

4. **stats-overview.test.tsx:143** -- `GenreInsight` mock includes `projectCount: 8` which does not exist on the interface (only `genreId`, `name`, `totalStitches`).

**Fix:** Update mock data to match current type definitions:

```typescript
// records-overview.test.tsx - PersonalBestRecord
const mockPersonalBests: PersonalBestRecord[] = [
  {
    type: "bestDay",
    label: "Best Day",
    value: 500,
    unit: "stitches",
    date: "2026-01-15",
    projectId: "p1",
    projectName: "Test Project",
  },
];

// records-overview.test.tsx - FastestCompletion
const mockFastestCompletions: FastestCompletion[] = [
  {
    sizeCategory: "Medium",
    projectId: "p1",
    chartId: "c1",
    projectName: "Test Project",
    daysToComplete: 30,
    startDate: "2025-12-16",
    finishDate: "2026-01-15",
  },
];

// records-overview.test.tsx - CompletionEstimate
const mockCompletionEstimates: CompletionEstimate[] = [
  {
    projectId: "p1",
    chartId: "c1",
    projectName: "Test Project",
    totalStitches: 50000,
    stitchesCompleted: 25000,
    percentComplete: 50,
    estimatedDate: "~2026-06-01",
    avgPerDay: 200,
  },
];

// stats-overview.test.tsx - GenreInsight (remove projectCount)
const mockGenreInsights: GenreInsight[] = [
  {
    genreId: "g1",
    name: "Fantasy",
    totalStitches: 50000,
  },
];
```

## Warnings

### WR-01: `statusGroups.sort()` mutates caller-owned array

**File:** `src/lib/queries/stats/thread-insights.ts:70`, `src/lib/queries/stats/designer-insights.ts:82`, `src/lib/queries/stats/genre-insights.ts:72`

**Issue:** `Array.prototype.sort()` mutates in-place. All three insight query functions call `statusGroups.sort()` to build a cache key, mutating the `status` array passed from `stats/page.tsx`. The same `status` reference is shared across all three `Promise.allSettled` calls, so the first `.sort()` silently reorders the array for subsequent consumers. Currently this is harmless because sort is idempotent after the first call and the array is only used for cache key generation. But it violates the principle of not mutating caller-owned data and will bite if the call pattern ever changes.

**Fix:** Use `[...statusGroups].sort()` or `statusGroups.toSorted()` to avoid mutation:

```typescript
const cacheKey = statusGroups.length > 0 ? [...statusGroups].sort().join(",") : "all";
```

### WR-02: Dead `scope` search param left in cache definition

**File:** `src/app/(dashboard)/stats/search-params.ts:18`

**Issue:** The `scope` param is still defined in `statsSearchParamsCache` but is no longer destructured or used in `page.tsx` (replaced by `status`). This is dead code that will confuse future maintainers about the URL contract.

**Fix:** Remove the `scope` line:

```typescript
// Remove this line:
scope: parseAsString.withDefault("all"),
```

### WR-03: Error logging passes raw error objects in new query code

**File:** `src/lib/queries/stats/thread-insights.ts:59-65`, `src/lib/queries/stats/designer-insights.ts:71-77`, `src/lib/queries/stats/genre-insights.ts:61-67`

**Issue:** All three rewritten insight query modules log `error` as a raw object in their catch blocks: `console.error("...", { userId, statusGroups, limit, error })`. This contradicts the sanitization pattern established in `settled.ts` and fixed in Phase 22 (backlog 999.46) which uses `error instanceof Error ? error.message : String(error)`. Raw error objects can leak stack traces or internal details to logging infrastructure.

**Fix:** Sanitize the error before logging:

```typescript
console.error("[stats] computeThreadInsights failed:", {
  userId,
  statusGroups,
  limit,
  error: error instanceof Error ? error.message : String(error),
});
```

### WR-04: Hardcoded `text-emerald-*` hover color in buried-treasures-section

**File:** `src/components/features/dashboard/buried-treasures-section.tsx:75`

**Issue:** `group-hover:text-emerald-700 dark:group-hover:text-emerald-400` uses hardcoded color scales instead of semantic tokens. This violates the project convention documented in `base-ui-patterns.md` and `component-implementation.md`. The correct approach is `group-hover:text-primary` or a similar semantic token.

**Fix:**

```tsx
// Before:
"group-hover:text-emerald-700 dark:group-hover:text-emerald-400"

// After:
"group-hover:text-primary"
```

## Info

### IN-01: `genre-insights` uses `include` where `select` would suffice

**File:** `src/lib/queries/stats/genre-insights.ts:20-26`

**Issue:** The query uses `include: { chart: { include: { genres: ... } } }` which fetches all chart fields, but only `stitchCount` and `genres` are used. Using `select` would make the data contract explicit and reduce payload size.

**Fix:**

```typescript
select: {
  chart: {
    select: {
      stitchCount: true,
      genres: { select: { id: true, name: true } },
    },
  },
},
```

---

_Reviewed: 2026-05-23T21:45:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_

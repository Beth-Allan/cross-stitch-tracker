---
phase: 18-stats-engine-charting-foundation
reviewed: 2026-05-17T20:05:00Z
depth: standard
files_reviewed: 18
files_reviewed_list:
  - src/components/ui/chart.tsx
  - src/types/stats.ts
  - src/lib/queries/stats/timezone.ts
  - src/lib/queries/stats/timezone.test.ts
  - src/lib/chart-configs.ts
  - src/lib/chart-configs.test.ts
  - src/lib/queries/stats/index.ts
  - src/lib/queries/stats/hero-stats.ts
  - src/lib/queries/stats/hero-stats.test.ts
  - src/lib/queries/stats/collection-breakdown.ts
  - src/lib/queries/stats/collection-breakdown.test.ts
  - src/lib/actions/session-actions.ts
  - src/app/(dashboard)/stats/page.tsx
  - src/app/(dashboard)/stats/page.test.ts
  - src/app/(dashboard)/stats/loading.tsx
  - src/components/features/stats/stats-page-shell.tsx
  - src/components/features/stats/stats-page-shell.test.tsx
  - src/components/features/stats/collection-status-chart.tsx
  - src/components/features/stats/collection-status-chart.test.tsx
findings:
  critical: 0
  warning: 2
  info: 0
  total: 2
status: issues_found
---

# Phase 18: Code Review Report

**Reviewed:** 2026-05-17T20:05:00Z
**Depth:** standard
**Files Reviewed:** 18
**Status:** issues_found

## Summary

Phase 18 introduces a stats engine foundation: type contracts, timezone-aware date boundaries, two cached query functions (hero stats + collection breakdown), a tabbed stats page shell with nuqs URL state, and a Recharts donut chart. The implementation is solid overall -- proper auth guards, correct `unstable_cache` patterns with tag-based invalidation, clean separation of concerns, and good test coverage.

Two warnings found: an off-by-one boundary condition in the "today" query range, and a type safety gap in the tab shell component.

## Warnings

### WR-01: Off-by-one in todayEnd boundary excludes sessions at final millisecond

**File:** `src/lib/queries/stats/hero-stats.ts:13`
**Issue:** The "today" aggregate query uses `{ gte: todayStart, lt: todayEnd }` where `todayEnd` is produced by `endOfDay()` (returns `23:59:59.999`). The `lt` (strictly less than) operator excludes any session recorded at exactly `23:59:59.999` local time. While the probability of hitting this exact millisecond is negligible, the semantics are incorrect -- `endOfDay` represents the last instant *within* the day, so the range should include it.

**Fix:** Change `lt` to `lte` for the todayEnd boundary:

```ts
prisma.stitchSession.aggregate({
  where: { project: { userId }, date: { gte: todayStart, lte: todayEnd } },
  _sum: { stitchCount: true },
}),
```

Alternatively, use `lt: startOfDay(addDays(now, 1))` (start of next day) which is the canonical half-open interval approach and avoids relying on millisecond precision entirely.

### WR-02: Unsafe type assertion in tab value change handler

**File:** `src/components/features/stats/stats-page-shell.tsx:43`
**Issue:** The `onValueChange` handler casts the incoming value with `val as StatsTab` without runtime validation. While in practice Base UI only fires this with values matching existing tab triggers, the cast silences TypeScript without guaranteeing correctness. If the component is ever refactored or composed differently, this could lead to an invalid tab value being set in URL state via nuqs.

**Fix:** Add a runtime guard before setting state:

```ts
onValueChange={(val) => {
  if (STATS_TABS.includes(val as StatsTab)) {
    setTab(val as StatsTab);
  }
}}
```

Or rely on `parseAsStringLiteral` from nuqs which already constrains valid values -- in which case a simple comment explaining why the cast is safe would suffice.

---

_Reviewed: 2026-05-17T20:05:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_

---
phase: 21-records-insights-celebrations
reviewed: 2026-05-17T18:42:00Z
depth: standard
files_reviewed: 24
files_reviewed_list:
  - src/types/stats.ts
  - src/app/(dashboard)/stats/page.tsx
  - src/app/(dashboard)/stats/search-params.ts
  - src/app/(dashboard)/charts/[id]/page.tsx
  - src/components/features/stats/record-celebration.tsx
  - src/components/features/stats/records-overview.tsx
  - src/components/features/stats/records-table.tsx
  - src/components/features/stats/year-scope-toggle.tsx
  - src/components/features/stats/thread-insight-list.tsx
  - src/components/features/stats/designer-insight-list.tsx
  - src/components/features/stats/genre-insight-list.tsx
  - src/components/features/stats/completion-estimates-section.tsx
  - src/components/features/stats/project-completion-estimate.tsx
  - src/components/features/sessions/log-session-modal.tsx
  - src/lib/actions/session-actions.ts
  - src/lib/queries/stats/personal-bests.ts
  - src/lib/queries/stats/fastest-completions.ts
  - src/lib/queries/stats/available-years.ts
  - src/lib/queries/stats/thread-insights.ts
  - src/lib/queries/stats/designer-insights.ts
  - src/lib/queries/stats/genre-insights.ts
  - src/lib/queries/stats/completion-estimates.ts
  - src/lib/queries/stats/record-detection.ts
  - src/lib/queries/stats/index.ts
findings:
  critical: 1
  warning: 3
  info: 2
  total: 6
status: issues_found
---

# Phase 21: Code Review Report

**Reviewed:** 2026-05-17T18:42:00Z
**Depth:** standard
**Files Reviewed:** 24
**Status:** issues_found

## Summary

Phase 21 adds records (personal bests, fastest completions), insights (thread/designer/genre), completion estimates, and a celebration system for broken records. The query layer is generally well-structured with consistent caching, timezone handling, and error logging. However, record detection has a logic bug that produces false celebration toasts, and the records table has dead code from an incomplete year-scoped display feature.

## Critical Issues

### CR-01: Best Session record detection fires false celebrations on multi-session days

**File:** `src/lib/queries/stats/record-detection.ts:73-95`
**Issue:** The best-session detection excludes ALL sessions from today when computing the previous best, then compares the newly created session against that historical best. This produces false positives when multiple sessions are logged on the same day.

Scenario: User's all-time best session is 200 stitches. User logs session A (500 stitches) today -- celebration fires correctly (old=200, new=500). User then logs session B (300 stitches) today. The code excludes ALL of today's sessions (including session A at 500), computes `previousBestSession = 200`, then checks `300 > 200` -- true. A false "New Record!" celebration fires with `oldValue=200, newValue=300`, even though the actual best session is already 500 from earlier today.

The same logic applies to Best Day detection (lines 48-71): if a user logs two sessions on the same day, the second session compares today's total against a historical best that excludes today entirely, but the first session already broke the record. This could trigger duplicate Best Day celebrations.

**Fix:** Instead of excluding all of today's sessions, fetch the previous best by querying the DB directly, excluding only the current session by ID. Pass the session ID into `detectBrokenRecords`:

```typescript
export async function detectBrokenRecords(
  userId: string,
  session: { id: string; date: Date; stitchCount: number; projectId: string },
): Promise<BrokenRecord[]> {
  // ...
  // For best session: find max stitchCount excluding THIS session
  const bestSessionExcludingSelf = await prisma.stitchSession.aggregate({
    where: {
      project: { userId },
      id: { not: session.id },
    },
    _max: { stitchCount: true },
  });
  const previousBestSession = bestSessionExcludingSelf._max.stitchCount ?? 0;
  // ...
}
```

And in `session-actions.ts` line 99, pass the session ID:

```typescript
brokenRecords = await detectBrokenRecords(user.id, {
  id: session.id, // add this
  date: new Date(validated.date),
  stitchCount: validated.stitchCount,
  projectId: validated.projectId,
});
```

## Warnings

### WR-01: Records table year columns are dead code -- both ternary branches render identical output

**File:** `src/components/features/stats/records-table.tsx:158-166`
**Issue:** The conditional `isCurrentStreak ? ... : ...` renders the exact same `<span className="text-muted-foreground font-mono">--</span>` in both branches. This appears to be a placeholder for year-scoped personal best data that was never implemented. The same pattern appears at lines 199-201 for fastest completions year columns.

The year columns in the table header (line 128-131) and these data cells create the impression that per-year data should appear, but only `--` is ever shown. Users seeing an "All-time" column and year columns would reasonably expect year-specific records.

**Fix:** Either implement year-scoped record data (passing year-filtered personal bests), or remove the year columns from the records table until the feature is implemented. Removing dead ternary:

```tsx
{availableYears.map((year) => (
  <TableCell key={year}>
    <span className="text-muted-foreground font-mono">--</span>
  </TableCell>
))}
```

### WR-02: Genre insights query fetches all sessions from DB, filters in memory

**File:** `src/lib/queries/stats/genre-insights.ts:30-44`
**Issue:** Unlike `designer-insights.ts` and `thread-insights.ts` which filter projects by `sessions: { some: { date: dateFilter } }` in the Prisma `where` clause, `genre-insights.ts` omits this filter entirely. It fetches ALL projects with genres and ALL their sessions, then filters sessions in memory (lines 56-59).

For year-scoped queries, this means:
1. Projects with zero sessions in the target year are still fetched and processed
2. All sessions for all projects are loaded from DB, not just sessions in the date range

While the stitch totals are computed correctly after in-memory filtering, this is inconsistent with the pattern used by sibling queries.

**Fix:** Add the date filter to the Prisma `where` clause and to the sessions `include`:

```typescript
const projects = await prisma.project.findMany({
  where: {
    userId,
    chart: { genres: { some: {} } },
    ...(dateFilter
      ? { sessions: { some: { date: dateFilter } } }
      : {}),
  },
  include: {
    chart: {
      include: {
        genres: { select: { id: true, name: true } },
      },
    },
    sessions: {
      select: { stitchCount: true, date: true },
      ...(dateFilter ? { where: { date: dateFilter } } : {}),
    },
  },
});
```

With this fix, the in-memory date filter at lines 55-59 can be removed entirely.

### WR-03: Hardcoded emerald color scale in log-session-modal violates semantic token convention

**File:** `src/components/features/sessions/log-session-modal.tsx:291,306-308,460,470`
**Issue:** The log-session-modal uses hardcoded `emerald-*` color classes (`hover:bg-emerald-50`, `text-emerald-700`, `dark:bg-emerald-900/20`, `focus:ring-emerald-500/40`, `hover:border-emerald-400`, `text-emerald-600`, etc.) in at least 6 locations. This violates the project convention documented in `base-ui-patterns.md`: "Always use semantic tokens, never hardcoded color scales."

While this modal is pre-existing code (not new in Phase 21), the Phase 21 changes touch this file to add the `fireCelebration` import and call. The hardcoded colors will not respond to theme changes and create inconsistency with the rest of the codebase.

**Fix:** Replace hardcoded emerald classes with semantic equivalents:

```
focus:ring-emerald-500/40  -> focus:ring-ring
hover:bg-emerald-50        -> hover:bg-accent
bg-emerald-50              -> bg-accent
text-emerald-700           -> text-accent-foreground
text-emerald-600           -> text-primary
hover:border-emerald-400   -> hover:border-primary
```

## Info

### IN-01: Scope parameter accepts arbitrary strings without validation

**File:** `src/app/(dashboard)/stats/search-params.ts:16`
**Issue:** The `scope` search param uses `parseAsString.withDefault("all")`, which accepts any string value (e.g., `?scope=<script>`, `?scope=drop-table`). While there is no injection risk (all query functions pass the value through `parseInt` which returns `NaN` for non-numeric strings, and `buildDateFilter` returns `null` for `NaN`, falling back to "all-time" behavior), using `parseAsStringLiteral` with allowed values or adding a validation step would be more explicit.

**Fix:** Either validate against known values, or use a union parser:

```typescript
scope: parseAsString.withDefault("all").withOptions({
  validate: (v) => v === "all" || /^\d{4}$/.test(v),
}),
```

### IN-02: Unused `availableYears` prop passed to RecordsTable

**File:** `src/components/features/stats/records-table.tsx:32`
**Issue:** The `availableYears` prop is declared in the `RecordsTableProps` interface and used for rendering year column headers and placeholder cells. However, since year-scoped data is not implemented (per WR-01), the prop only drives the rendering of empty `--` columns. If year columns are removed per WR-01, this prop becomes unused.

**Fix:** If year columns are kept as placeholders, no action needed. If removed per WR-01, remove the `availableYears` prop from the interface and component.

---

_Reviewed: 2026-05-17T18:42:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_

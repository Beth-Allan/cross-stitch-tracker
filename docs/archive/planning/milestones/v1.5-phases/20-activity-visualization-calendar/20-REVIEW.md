---
phase: 20-activity-visualization-calendar
reviewed: 2026-05-17T19:42:00Z
depth: standard
files_reviewed: 21
files_reviewed_list:
  - src/types/stats.ts
  - src/lib/chart-configs.ts
  - src/lib/queries/stats/monthly-totals.ts
  - src/lib/queries/stats/calendar-days.ts
  - src/lib/queries/stats/session-history.ts
  - src/lib/queries/stats/pace-metrics.ts
  - src/lib/queries/stats/day-of-week.ts
  - src/lib/queries/stats/daily-breakdown.ts
  - src/lib/queries/stats/index.ts
  - src/lib/actions/stats-actions.ts
  - src/app/(dashboard)/stats/search-params.ts
  - src/components/features/stats/pace-cards.tsx
  - src/components/features/stats/day-of-week-chart.tsx
  - src/components/features/stats/monthly-stitch-chart.tsx
  - src/components/features/stats/monthly-drill-down.tsx
  - src/components/ui/table.tsx
  - src/components/ui/pagination.tsx
  - src/components/features/stats/stitching-calendar.tsx
  - src/components/features/stats/session-history-table.tsx
  - src/components/features/stats/activity-overview.tsx
  - src/app/(dashboard)/stats/page.tsx
findings:
  critical: 1
  warning: 3
  info: 0
  total: 4
status: issues_found
---

# Phase 20: Code Review Report

**Reviewed:** 2026-05-17T19:42:00Z
**Depth:** standard
**Files Reviewed:** 21
**Status:** issues_found

## Summary

Phase 20 implements activity visualization with pace cards, monthly stitch chart with drill-down, day-of-week patterns, a stitching calendar, and session history table. The overall architecture is sound: server components fetch data in parallel, client components handle interactivity, and auth is consistently enforced via `requireAuth()`.

Key concerns: (1) A critical CSS color function mismatch that will render invisible elements, (2) missing Zod validation on server action inputs, and (3) a drill-down animation logic issue that prevents the expand animation from playing.

## Critical Issues

### CR-01: Invalid CSS color function -- `hsl()` wrapping `oklch()` values

**File:** `src/components/features/stats/monthly-stitch-chart.tsx:135` and `src/components/features/stats/stitching-calendar.tsx:202-203`
**Issue:** The chart color CSS variables (`--chart-1` through `--chart-5`) are defined as full `oklch(...)` values in `globals.css`, e.g., `--chart-1: oklch(0.596 0.145 163.23)`. However, these files wrap the variable inside `hsl()`:

- `"hsl(var(--chart-1) / 0.6)"` resolves to `hsl(oklch(0.596 0.145 163.23) / 0.6)` -- **invalid CSS**
- `hsl(var(--chart-${colorIndex + 1}) / 0.15)` -- same problem for calendar pills

This causes the inactive bars in the monthly chart to have **no fill color** (transparent), and calendar session pills to have **no background or border color**, making them invisible or unreadable.

**Fix:** Use `oklch()` with the `/` alpha syntax, or use `color-mix()`:
```tsx
// Option A: color-mix (works with any color format)
fill={index === activeMonth ? "var(--chart-1)" : "color-mix(in oklch, var(--chart-1) 60%, transparent)"}

// Option B: For calendar pills
backgroundColor: `color-mix(in oklch, var(--chart-${colorIndex + 1}) 15%, transparent)`,
borderColor: `color-mix(in oklch, var(--chart-${colorIndex + 1}) 40%, transparent)`,
```

## Warnings

### WR-01: Server actions lack Zod input validation

**File:** `src/lib/actions/stats-actions.ts:6-19`
**Issue:** The three server actions (`fetchCalendarMonth`, `fetchDailyBreakdown`, `fetchMonthlyTotals`) accept raw `number` parameters without any validation. A malicious client can call these with arbitrary values (e.g., `month: 99`, `year: -1`, `month: NaN`) which will propagate to Prisma queries and either return confusing results (wrong date boundaries from `TZDate(year, 98, ...)`) or throw unhandled errors.

This violates the project convention: "Zod validation at boundaries -- server actions, API routes" (CLAUDE.md).

**Fix:**
```typescript
import { z } from "zod";

const calendarMonthSchema = z.object({
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2100),
});

export async function fetchCalendarMonth(month: number, year: number) {
  const user = await requireAuth();
  const parsed = calendarMonthSchema.parse({ month, year });
  return getCalendarDays(user.id, parsed.month, parsed.year);
}
```

### WR-02: Monthly drill-down animation broken by early-return on empty entries

**File:** `src/components/features/stats/monthly-drill-down.tsx:22-24`
**Issue:** When a bar is clicked, `MonthlyStitchChart` sets `activeMonth` synchronously (outside `startTransition`) then fetches drill-down data inside the transition. During fetch, `isExpanded = true` but `entries = []`. The guard `if (entries.length === 0 && isExpanded) return null` causes the component to unmount during loading, which removes the CSS grid-template-rows animation container. When data arrives and the component re-mounts, the expand animation never plays -- it just pops in.

**Fix:** Instead of returning null, show a loading placeholder or keep the container present:
```tsx
if (entries.length === 0 && isExpanded) {
  return (
    <div
      className="grid transition-all duration-300"
      style={{ gridTemplateRows: "1fr" }}
    >
      <div className="overflow-hidden">
        <div className="bg-card mt-2 rounded-lg border border-border p-4">
          <div className="flex h-20 items-center justify-center">
            <span className="text-muted-foreground text-sm">Loading...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### WR-03: Session history `sortDir` validated only by type assertion

**File:** `src/lib/queries/stats/session-history.ts:26`
**Issue:** `sortDir as "asc" | "desc"` is a type assertion that suppresses compile-time checks. While the `statsSearchParamsCache` constrains valid values at the page level, the query function itself is a reusable module that could be called from other contexts (e.g., future server actions) with arbitrary strings. Prisma will reject invalid values at runtime (throwing an unhandled error), but explicit validation would fail faster with a clear message.

**Fix:**
```typescript
const validDirs = ["asc", "desc"] as const;
const direction = validDirs.includes(sortDir as any)
  ? (sortDir as "asc" | "desc")
  : "desc";
```

---

_Reviewed: 2026-05-17T19:42:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_

---
phase: 32-series-management-pages
reviewed: 2026-05-24T22:45:00Z
depth: standard
files_reviewed: 16
files_reviewed_list:
  - src/__tests__/mocks/factories.ts
  - src/app/(dashboard)/series/[id]/page.tsx
  - src/app/(dashboard)/series/loading.tsx
  - src/app/(dashboard)/series/page.tsx
  - src/components/features/designers/delete-confirmation-dialog.test.tsx
  - src/components/features/designers/delete-confirmation-dialog.tsx
  - src/components/features/series/series-detail.test.tsx
  - src/components/features/series/series-detail.tsx
  - src/components/features/series/series-form-modal.test.tsx
  - src/components/features/series/series-form-modal.tsx
  - src/components/features/series/series-list.test.tsx
  - src/components/features/series/series-list.tsx
  - src/components/shell/nav-items.ts
  - src/lib/actions/series-actions.test.ts
  - src/lib/actions/series-actions.ts
  - src/types/series.ts
findings:
  critical: 1
  warning: 3
  info: 0
  total: 4
status: issues_found
---

# Phase 32: Code Review Report

**Reviewed:** 2026-05-24T22:45:00Z
**Depth:** standard
**Files Reviewed:** 16
**Status:** issues_found

## Summary

Phase 32 implements series management pages -- list, detail, create modal, and delete. The implementation is generally solid: server actions have proper auth guards and Zod validation, tests cover happy and error paths, and the component architecture follows project conventions. However, there is a confirmed double-fire bug in the inline name editing flow, an unused prop that causes a wasted database call on every detail page load, and sequential awaits that could be parallelized.

## Critical Issues

### CR-01: Inline name edit fires `updateSeries` twice on Enter key

**File:** `src/components/features/series/series-detail.tsx:139,185-186`
**Issue:** When the user presses Enter to save the inline name edit, `handleSaveName()` is called from `handleNameKeyDown`. After the async `updateSeries` call completes, `setIsEditingName(false)` unmounts the input, which triggers the `onBlur` handler -- calling `handleSaveName()` a second time. Because `editName` has not been reset and `series.name` has not yet updated (the `router.refresh()` is async), the guard at line 107 (`trimmed === series.name`) does not catch the re-entry, and a second `updateSeries` server call fires.

The Escape path is safe because `handleCancelEdit` synchronously resets `editName` to `series.name`, so the blur-triggered `handleSaveName` hits the early return.

**Fix:** Add a ref guard to prevent re-entry:
```tsx
const isSavingRef = useRef(false);

async function handleSaveName() {
  if (isSavingRef.current) return;
  const trimmed = editName.trim();
  if (!trimmed || trimmed === series.name) {
    setIsEditingName(false);
    setEditName(series.name);
    return;
  }

  isSavingRef.current = true;
  try {
    const result = await updateSeries(series.id, {
      name: trimmed,
      totalCount: series.totalCount,
      designerId: series.designerId,
      notes: series.notes,
    });
    if (result.success) {
      toast.success("Series updated");
      router.refresh();
    } else {
      toast.error(result.error ?? "Couldn't update series. Please try again.");
    }
  } catch {
    toast.error("Couldn't update series. Please try again.");
  }
  setIsEditingName(false);
  isSavingRef.current = false;
}
```

## Warnings

### WR-01: `designers` prop fetched and passed to SeriesDetail but never used

**File:** `src/app/(dashboard)/series/[id]/page.tsx:10-11`, `src/components/features/series/series-detail.tsx:45,48`
**Issue:** The detail page calls `getDesigners()` (which hits the database with `requireAuth` + `prisma.designer.findMany`) and passes the result as a `designers` prop to `SeriesDetail`. However, the component destructures `designers` in its props but never references it in the component body -- no designer select dropdown or any other consumer exists. This wastes a database query on every detail page load.

The Phase 32 plan (32-03-PLAN.md) mentions a designer SearchableSelect feature, so this appears to be scaffolding for unimplemented functionality. Shipping dead database calls is incorrect regardless of intent.

**Fix:** Remove the unused prop and database call until the feature is implemented:
```tsx
// src/app/(dashboard)/series/[id]/page.tsx
export default async function SeriesDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const series = await getSeriesDetail(id);
  if (!series) notFound();
  return <SeriesDetail series={series} />;
}

// src/components/features/series/series-detail.tsx
interface SeriesDetailProps {
  series: SeriesDetailType;
}

export function SeriesDetail({ series }: SeriesDetailProps) {
```

### WR-02: Sequential awaits in detail page could be parallelized

**File:** `src/app/(dashboard)/series/[id]/page.tsx:8-10`
**Issue:** If WR-01 is deferred and the `designers` prop is kept for the upcoming SearchableSelect feature, the two async calls (`getSeriesDetail` and `getDesigners`) are awaited sequentially. They are independent and should be parallelized.

Note: This finding is moot if WR-01 is fixed by removing the `getDesigners` call entirely.

**Fix:**
```tsx
const [series, designers] = await Promise.all([
  getSeriesDetail(id),
  getDesigners(),
]);
if (!series) notFound();
return <SeriesDetail series={series} designers={designers} />;
```

### WR-03: `getSeriesWithStats` and `getSeriesDetail` propagate unhandled errors to the page

**File:** `src/lib/actions/series-actions.ts:91-115,117-167`
**Issue:** Unlike the mutation actions (`createSeries`, `updateSeries`, `deleteSeries`) which wrap their logic in try/catch and return `{ success: false }` on error, the two read actions (`getSeriesWithStats` and `getSeriesDetail`) have no error handling. If the database query fails, the error propagates up to the page component and results in a Next.js error page. The test at line 276 explicitly asserts this behavior: `await expect(getSeriesWithStats()).rejects.toThrow("DB unavailable")`.

While letting read errors propagate to the error boundary is a valid pattern in Next.js (and consistent with how other read actions like `getDesignersWithStats` work in this codebase), it means the series page will crash entirely on any transient database issue rather than showing a degraded state. Given the project's existing `Promise.allSettled` pattern for resilience (999.22) and the error sanitization convention from Phase 22, this is worth flagging as inconsistent with the project's stated direction toward resilience.

**Fix:** If this is the intentional pattern (let Next.js error boundary handle it), add a try/catch with `console.error` for the error sanitization convention at minimum:
```ts
export async function getSeriesWithStats(): Promise<SeriesWithStats[]> {
  await requireAuth();
  try {
    // ... existing query logic ...
  } catch (error) {
    console.error("getSeriesWithStats error:", error instanceof Error ? error.message : String(error));
    throw error;
  }
}
```

---

_Reviewed: 2026-05-24T22:45:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_

---
phase: 31-data-foundation-fixes
reviewed: 2026-05-24T18:30:00Z
depth: standard
files_reviewed: 11
files_reviewed_list:
  - prisma/schema.prisma
  - src/__tests__/mocks/factories.ts
  - src/components/features/gallery/gallery-utils.test.ts
  - src/components/features/gallery/project-gallery.test.tsx
  - src/lib/actions/series-actions.test.ts
  - src/lib/actions/series-actions.ts
  - src/lib/utils/series-progress.test.ts
  - src/lib/utils/series-progress.ts
  - src/lib/validations/series.test.ts
  - src/lib/validations/series.ts
  - src/types/series.ts
findings:
  critical: 1
  warning: 4
  info: 0
  total: 5
status: issues_found
---

# Phase 31: Code Review Report

**Reviewed:** 2026-05-24T18:30:00Z
**Depth:** standard
**Files Reviewed:** 11
**Status:** issues_found

## Summary

Phase 31 introduces the Series data model (Prisma schema, types, Zod validation, CRUD server actions, and a pure progress computation utility). The implementation is well-structured with good TDD coverage. However, there is one critical finding (vacuous transaction assertion that silently passes regardless of production arguments) and four warnings (duplicate type definition, unsanitized error logging, empty-string designerId passing validation, and empty-string notes not normalized to null).

## Critical Issues

### CR-01: deleteSeries test $transaction assertion is vacuous

**File:** `src/lib/actions/series-actions.test.ts:173-179`
**Issue:** The assertion calls `mockPrisma.chart.updateMany(...)` and `mockPrisma.series.delete(...)` inline within `toHaveBeenCalledWith`. These mock calls return `undefined`, so the assertion checks that `$transaction` was called with `[undefined, undefined]`. In the production code, the same mocks also return `undefined`. This means the assertion passes regardless of what arguments the production code passes to `updateMany` or `delete`. If you changed the production code to `updateMany({ where: { seriesId: "WRONG_ID" } })`, the test would still pass.

This pattern is copied from `designer-actions.test.ts` (pre-existing), but it renders the transaction argument verification meaningless for this new code. Since this is a delete operation that first unlinks charts, incorrect arguments could cause data integrity issues (orphaned seriesId references or deleting the wrong series).

**Fix:** Assert the individual mock calls separately instead of trying to assert transaction contents:
```ts
it("calls $transaction to unlink charts then delete", async () => {
  mockPrisma.series.findUnique.mockResolvedValueOnce(createMockSeries({ id: "s1" }));
  mockPrisma.$transaction.mockResolvedValueOnce([{}, {}]);
  const { deleteSeries } = await import("./series-actions");

  const result = await deleteSeries("s1");

  expect(result.success).toBe(true);
  expect(mockPrisma.$transaction).toHaveBeenCalled();
  expect(mockPrisma.chart.updateMany).toHaveBeenCalledWith({
    where: { seriesId: "s1" },
    data: { seriesId: null },
  });
  expect(mockPrisma.series.delete).toHaveBeenCalledWith({
    where: { id: "s1" },
  });
});
```

## Warnings

### WR-01: Duplicate SeriesProgress type definition

**File:** `src/lib/utils/series-progress.ts:6-10` and `src/types/series.ts:3-7`
**Issue:** `SeriesProgress` is defined identically in two files. The utility function `computeSeriesProgress` returns its local `SeriesProgress`, while `SeriesWithStats` in `src/types/series.ts` references its own local `SeriesProgress`. TypeScript structural typing makes this work today, but if either definition is modified independently, the types will silently diverge. The utility should be the single source of truth for this type.

**Fix:** Remove the duplicate from `src/lib/utils/series-progress.ts` and import from `src/types/series.ts`:
```ts
// src/lib/utils/series-progress.ts
import type { SeriesProgress } from "@/types/series";

export const FINISHED_STATUSES = new Set(["FINISHED", "FFO"]);
// ... rest unchanged, just remove the local SeriesProgress type
```

### WR-02: Unsanitized error logging in series-actions

**File:** `src/lib/actions/series-actions.ts:31,60,86`
**Issue:** All three `console.error` calls log the raw `error` object. This was specifically identified and fixed in Phase 22 for stats-actions (backlog item 999.46) to prevent full stack traces and potentially sensitive Prisma error details from appearing in production logs. The series-actions should use the same sanitized pattern.

**Fix:** Replace all three occurrences with the sanitized pattern:
```ts
console.error("createSeries error:", error instanceof Error ? error.message : String(error));
```

### WR-03: designerId validation allows empty string

**File:** `src/lib/validations/series.ts:6`
**Issue:** `designerId: z.string().nullable().default(null)` accepts an empty string `""`. If a client sends `designerId: ""`, it passes Zod validation but will cause a Prisma foreign key constraint error at the database level (no Designer with id `""`). The error message would be a generic "Failed to create/update series" rather than a helpful validation message. While this is a pre-existing pattern (chart validation has the same issue), fixing it in new code prevents the pattern from spreading further.

**Fix:** Transform empty strings to null:
```ts
designerId: z.string().transform(v => v === "" ? null : v).nullable().default(null),
```

### WR-04: notes field allows empty string without normalization

**File:** `src/lib/validations/series.ts:7`
**Issue:** `notes: z.string().max(5000, "Notes too long").nullable().default(null)` accepts empty string `""` and whitespace-only strings `"   "`. This creates an inconsistency in the database where `null` and `""` both represent "no notes". The `name` field correctly uses `.trim().min(1)` to reject whitespace, but `notes` has no trimming or empty-to-null normalization. This can cause subtle UI inconsistencies (e.g., `notes !== null` checks being true for empty notes).

**Fix:** Add trim and empty-to-null transform:
```ts
notes: z.string().trim().max(5000, "Notes too long").transform(v => v === "" ? null : v).nullable().default(null),
```

---

_Reviewed: 2026-05-24T18:30:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_

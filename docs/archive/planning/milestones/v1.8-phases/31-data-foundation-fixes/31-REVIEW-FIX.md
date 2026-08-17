---
phase: 31-data-foundation-fixes
fixed_at: 2026-05-24T17:31:00Z
review_path: .planning/phases/31-data-foundation-fixes/31-REVIEW.md
iteration: 1
findings_in_scope: 5
fixed: 5
skipped: 0
status: all_fixed
---

# Phase 31: Code Review Fix Report

**Fixed at:** 2026-05-24T17:31:00Z
**Source review:** .planning/phases/31-data-foundation-fixes/31-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 5
- Fixed: 5
- Skipped: 0

## Fixed Issues

### CR-01: deleteSeries test $transaction assertion is vacuous

**Files modified:** `src/lib/actions/series-actions.test.ts`
**Commit:** 4eeaef6
**Applied fix:** Replaced inline mock calls within `toHaveBeenCalledWith` (which evaluated to `[undefined, undefined]` and passed regardless of production arguments) with separate assertions on `$transaction` being called, `chart.updateMany` receiving the correct where/data, and `series.delete` receiving the correct where clause.

### WR-01: Duplicate SeriesProgress type definition

**Files modified:** `src/lib/utils/series-progress.ts`
**Commit:** 769df79
**Applied fix:** Removed the local `SeriesProgress` type definition from `series-progress.ts` and replaced it with `import type { SeriesProgress } from "@/types/series"`. The canonical definition in `src/types/series.ts` is now the single source of truth.

### WR-02: Unsanitized error logging in series-actions

**Files modified:** `src/lib/actions/series-actions.ts`
**Commit:** a235d92
**Applied fix:** Replaced all three `console.error` calls (createSeries, updateSeries, deleteSeries) with the sanitized pattern `error instanceof Error ? error.message : String(error)` established in Phase 22 to prevent full stack traces and Prisma error details from appearing in production logs.

### WR-03: designerId validation allows empty string

**Files modified:** `src/lib/validations/series.ts`
**Commit:** 9a61370
**Applied fix:** Added `.transform(v => v === "" ? null : v)` to the designerId field so empty strings are normalized to null before reaching Prisma, preventing FK constraint errors with unhelpful messages.

### WR-04: notes field allows empty string without normalization

**Files modified:** `src/lib/validations/series.ts`
**Commit:** 9a61370
**Applied fix:** Added `.trim()` and `.transform(v => v === "" ? null : v)` to the notes field so whitespace-only and empty strings are normalized to null, ensuring consistent null vs empty representation in the database.

---

_Fixed: 2026-05-24T17:31:00Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_

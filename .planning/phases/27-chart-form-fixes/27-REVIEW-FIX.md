---
phase: 27-chart-form-fixes
fixed_at: 2026-05-21T03:38:00Z
review_path: .planning/phases/27-chart-form-fixes/27-REVIEW.md
iteration: 1
findings_in_scope: 4
fixed: 4
skipped: 0
status: all_fixed
---

# Phase 27: Code Review Fix Report

**Fixed at:** 2026-05-21T03:38:00Z
**Source review:** .planning/phases/27-chart-form-fixes/27-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 4
- Fixed: 4
- Skipped: 0

## Fixed Issues

### CR-01: Supply table column widths inconsistent between header and body rows

**Files modified:** `src/components/features/supply-table/supply-table-add-row.tsx`, `src/components/features/supply-table/supply-table-data-row.tsx`
**Commit:** 44f10a9
**Applied fix:** Updated inline `style={{ width }}` values and JSX comments in both body row components to match header widths: Colour 44% -> 41%, Need 13% -> 16%. Four locations updated across two files.

### WR-01: Duplicate HTML `id` across multiple SearchableSelect instances

**Files modified:** `src/components/features/charts/form-primitives/searchable-select.tsx`
**Commit:** 0d7dbe0
**Applied fix:** Added `useId()` hook to generate a unique suffix per SearchableSelect instance. The `listboxId` is now `searchable-select-listbox-${instanceId}` instead of a hardcoded string, ensuring unique `id` attributes and correct `aria-controls` semantics when multiple instances render on the same page.

### WR-02: Raw prisma query in edit page bypasses action-layer authorization pattern

**Files modified:** `src/app/(dashboard)/charts/[id]/edit/page.tsx`
**Commit:** 01d02a7
**Applied fix:** Added safety comment documenting why the direct `prisma.projectThread.aggregate()` call is safe: `getChart()` above already verified userId ownership, and the `projectId` used in the query comes from that verified chart rather than from user input. Chose comment approach over action extraction as lower-risk for this phase.

### WR-03: `handleTriggerKeyDown` does not prevent Space key from opening popover as a typed character

**Files modified:** `src/components/features/charts/form-primitives/searchable-select.tsx`, `src/components/features/charts/form-primitives/searchable-select.test.tsx`
**Commit:** 6ce4f7e
**Applied fix:** Added `e.key !== " "` check to the printable character condition in `handleTriggerKeyDown`. Space was passing the `key.length === 1` heuristic and being forwarded as a search character instead of toggling the dropdown. Also added a dedicated test case verifying Space is not forwarded (15 tests passing, up from 14).

---

_Fixed: 2026-05-21T03:38:00Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_

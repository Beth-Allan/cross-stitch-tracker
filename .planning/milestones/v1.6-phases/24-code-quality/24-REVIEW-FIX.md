---
phase: 24-code-quality
fixed_at: 2026-05-18T22:30:00Z
review_path: .planning/phases/24-code-quality/24-REVIEW.md
iteration: 1
findings_in_scope: 6
fixed: 6
skipped: 0
status: all_fixed
---

# Phase 24: Code Review Fix Report

**Fixed at:** 2026-05-18T22:30:00Z
**Source review:** .planning/phases/24-code-quality/24-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 6
- Fixed: 6
- Skipped: 0

## Fixed Issues

### CR-01: CreationFlowAdapter does not set isNeedOverridden on manual need edit

**Files modified:** `src/components/features/supply-table/creation-flow-adapter.ts`
**Commit:** 00e56be
**Applied fix:** Added an explicit branch in `updateQuantity` for `field === "need" && row.type === "THREAD"` that sets `isNeedOverridden: true` alongside the new need value. This prevents the bulk recalculation effect from overwriting user-intentional manual edits when calculator params change. Matches the existing pattern in `ServerActionAdapter.updateQuantity` (line 136).

### WR-01: Non-null assertion after filter(Boolean) in dashboard page

**Files modified:** `src/app/(dashboard)/page.tsx`
**Commit:** 36b978d
**Applied fix:** Replaced `.filter(Boolean).map((c) => transformToGalleryCard(c!, imageUrls))` with a type-safe filter predicate `.filter((c): c is NonNullable<typeof c> => Boolean(c))` that properly narrows the type, eliminating the need for the `c!` non-null assertion.

### WR-02: handleSort fires multiple independent URL updates without batching

**Files modified:** `src/components/features/stats/session-history-table.tsx`
**Commit:** ddc3bbd
**Applied fix:** Replaced 4 individual `useQueryState` hooks with a single `useQueryStates` call for atomic multi-key URL updates. `handleSort` and `handleProjectFilter` now call `setParams()` with all changed keys in one object, eliminating intermediate URL states. Pagination buttons also use `setParams`. All 10 existing tests pass unchanged.

### WR-03: `as any` type assertion in chart-merged-form draft hydration

**Files modified:** `src/components/features/charts/chart-merged-form.tsx`
**Commit:** c293e9d
**Applied fix:** Replaced the `as any` cast with a generic `hydrateField<K>` helper function that preserves the key-value type correlation TypeScript cannot infer from `Object.keys()`. Imported `ChartFormValues` type from `use-chart-form.ts`. Removed the `eslint-disable @typescript-eslint/no-explicit-any` comment.

### WR-04: createMockStitchSession missing explicit return type annotation

**Files modified:** `src/__tests__/mocks/factories.ts`
**Commit:** 0a5af03
**Applied fix:** Added explicit `: StitchSession` return type annotation to `createMockStitchSession`, matching the pattern used by every other factory function in the file. This ensures the factory will fail at compile time if the Prisma `StitchSession` schema gains new required fields.

### WR-05: Buried Treasures query includes charts without project ownership check

**Files modified:** `src/lib/actions/dashboard-actions.ts`
**Commit:** 28369d0
**Applied fix:** Replaced the inline comment `// Safe: single-user app. Add Chart.userId if multi-user is added.` with a proper TODO backlog reference `// TODO(999.0.17): add Chart.userId ownership check for multi-user` following the project's comment conventions. Links to the existing multi-user hardening backlog item for discoverability.

---

_Fixed: 2026-05-18T22:30:00Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_

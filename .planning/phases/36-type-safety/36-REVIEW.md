---
phase: 36-type-safety
reviewed: 2026-07-01T22:15:00Z
depth: standard
files_reviewed: 33
files_reviewed_list:
  - src/__tests__/mocks/factories.ts
  - src/components/features/charts/chart-merged-form.test.tsx
  - src/components/features/charts/inline-designer-dialog.tsx
  - src/components/features/charts/project-detail/project-detail-page.tsx
  - src/components/features/charts/project-detail/supplies-tab.test.tsx
  - src/components/features/charts/project-detail/supplies-tab.tsx
  - src/components/features/charts/project-detail/types.ts
  - src/components/features/dashboard/bucket-project-row.test.tsx
  - src/components/features/dashboard/buried-treasures-section.test.tsx
  - src/components/features/dashboard/currently-stitching-card.test.tsx
  - src/components/features/dashboard/progress-breakdown-tab.test.tsx
  - src/components/features/dashboard/spotlight-card.test.tsx
  - src/components/features/gallery/gallery-types.ts
  - src/components/features/gallery/gallery-utils.ts
  - src/components/features/shopping/project-accordion.test.tsx
  - src/components/features/shopping/project-accordion.tsx
  - src/components/features/shopping/supply-overview.tsx
  - src/components/features/supply-table/local-state-adapter.ts
  - src/components/features/supply-table/types.ts
  - src/lib/actions/dashboard-actions.ts
  - src/lib/actions/designer-actions.ts
  - src/lib/actions/genre-actions.ts
  - src/lib/actions/project-dashboard-actions.ts
  - src/lib/actions/series-actions.ts
  - src/lib/actions/shopping-cart-actions.ts
  - src/lib/utils/skein-calculator.test.ts
  - src/lib/utils/skein-calculator.ts
  - src/types/dashboard.ts
  - src/types/focal-point.test.ts
  - src/types/focal-point.ts
  - src/types/shopping.ts
  - src/types/supply.test.ts
  - src/types/supply.ts
findings:
  critical: 1
  warning: 4
  info: 2
  total: 7
status: issues_found
---

# Phase 36: Code Review Report

**Reviewed:** 2026-07-01T22:15:00Z
**Depth:** standard
**Files Reviewed:** 33
**Status:** issues_found

## Summary

Phase 36 is a type-safety hardening pass: `OptionalFocalPoint` converted from `interface extends` to discriminated union with `mapFocalPoint` helper, `StrandCount` extracted as a shared literal union, co-dependent props consolidated, `LocalStateAdapter.updateQuantity` field parameter narrowed, and `InlineDesignerDialog` simplified to controlled-only. The type changes are well-executed and the `mapFocalPoint` helper with tests is a clean approach.

One critical finding: the `as Type` assertion in `createMockGalleryCard` now silently allows partial `OptionalFocalPoint` overrides -- the very invalid state the discriminated union was designed to prevent. Four warnings cover unsanitized error logging, dead types, and a missing `handleCalcParamsChange` dependency.

## Critical Issues

### CR-01: Factory `as GalleryCardData` cast defeats discriminated union protection

**File:** `src/__tests__/mocks/factories.ts:445`
**Issue:** `createMockGalleryCard` uses `as GalleryCardData` to bypass TypeScript checking. Since `GalleryCardData` is now a discriminated union (`OptionalFocalPoint & {...}`), the `Partial<GalleryCardData>` override parameter combined with the type assertion means a caller can pass `{ focalPointX: 0.5 }` without `focalPointY` and TypeScript will not flag it. This produces the exact `{ focalPointX: number, focalPointY: null }` invalid state that the Phase 36 union was created to prevent (backlog 999.70). The same pattern exists for `createMockSeriesChart` (line 85), `createMockDesignerChart` (line 116), `createMockGenreChart` (line 151), and the local `createMockProject`/`createMockSpotlight`/`createTreasure`/`makeProject` helpers in the test files (bucket-project-row.test.tsx:20, buried-treasures-section.test.tsx:57, currently-stitching-card.test.tsx:54, spotlight-card.test.tsx:89, progress-breakdown-tab.test.tsx:23, project-accordion.test.tsx:37).

**Fix:** Replace the `as Type` assertion with a helper that accepts focal point as a validated pair. For `createMockGalleryCard`:

```typescript
export function createMockGalleryCard(
  overrides?: Partial<Omit<GalleryCardData, 'focalPointX' | 'focalPointY'>> & OptionalFocalPoint,
): GalleryCardData {
  return {
    chartId: "chart-1",
    // ... all non-focal fields ...
    focalPointX: null,
    focalPointY: null,
    ...overrides,
  } as GalleryCardData;
}
```

Alternatively, use `mapFocalPoint` in the factory and accept `focalPoint?: { x: number; y: number } | null` as a separate override parameter, then spread the result. This keeps the same API shape while enforcing the invariant. The `as GalleryCardData` remains necessary at the return due to TS intersection limitations, but the override parameter prevents callers from passing one without the other.

Apply the same pattern to all 5 factory functions and 6 test-local mock helpers.

## Warnings

### WR-01: Unsanitized `console.error` logs raw error objects in 3 server action files

**File:** `src/lib/actions/designer-actions.ts:31,60,89`
**File:** `src/lib/actions/genre-actions.ts:31,60,89`
**File:** `src/lib/actions/shopping-cart-actions.ts:196`
**Issue:** These 7 `console.error` calls log the raw `error` object, which can leak Prisma internals, stack traces, or user data into server logs. The established project pattern (used in `series-actions.ts`) sanitizes with `error instanceof Error ? error.message : String(error)`. While these files were only touched to add `mapFocalPoint`, the inconsistency weakens the Phase 22 error sanitization work (backlog 999.46).

**Fix:** Apply the sanitized pattern:
```typescript
console.error("createDesigner error:", error instanceof Error ? error.message : String(error));
```

### WR-02: Dead types `SupplyRowData` and `SupplySectionData` never imported

**File:** `src/components/features/charts/project-detail/types.ts:30-52`
**Issue:** `SupplyRowData` (line 30) and `SupplySectionData` (line 46) are exported but never imported anywhere in the codebase. These were likely part of an earlier supply table design that was superseded by the unified `SupplyRow` type in `supply-table/types.ts`. Dead types add confusion about which type is canonical.

**Fix:** Remove both interfaces and their section marker comments (lines 28-52).

### WR-03: `handleCalcParamsChange` dependency array missing `startTransition`

**File:** `src/components/features/charts/project-detail/supplies-tab.tsx:153`
**Issue:** The `useCallback` for `handleCalcParamsChange` lists `[calculator]` as its only dependency, but the callback body references `startTransition` (from `useTransition`), `serverParamsRef`, `setCalcParams`, and `toast`. React guarantees state setters and refs are stable, and `toast` is a module-level import, so those are fine. `startTransition` from `useTransition` is also stable per React docs. This is technically correct but worth documenting with a comment since omitting deps from `useCallback` is a common source of stale closure bugs.

**Fix:** Either add a comment explaining the stability guarantee:
```typescript
// startTransition, setCalcParams, serverParamsRef are stable (React guarantees)
[calculator],
```
Or include `startTransition` explicitly for lint rule compliance (it's a no-op since the reference is stable).

### WR-04: `supplies-tab.tsx` error logging unsanitized

**File:** `src/components/features/charts/project-detail/supplies-tab.tsx:148`
**Issue:** `console.error("SuppliesTab calc param save failed:", error)` logs the raw error object. This is a client-side log (less risky than server-side), but for consistency with the project's error logging pattern, it should sanitize.

**Fix:**
```typescript
console.error("SuppliesTab calc param save failed:", error instanceof Error ? error.message : String(error));
```

## Info

### IN-01: `import type` placement in factories.ts

**File:** `src/__tests__/mocks/factories.ts:411`
**Issue:** The `import type { GalleryCardData }` appears at line 411, separated from the other imports at the top of the file (lines 1-25). This was likely added incrementally when the factory was added. All other imports are grouped at the top.

**Fix:** Move the import to the top of the file with the other type imports.

### IN-02: Test files use `as Type` assertion on all mock data objects

**Files:** `bucket-project-row.test.tsx:20`, `buried-treasures-section.test.tsx:57`, `currently-stitching-card.test.tsx:54`, `spotlight-card.test.tsx:89`, `progress-breakdown-tab.test.tsx:23`, `project-accordion.test.tsx:37`
**Issue:** All 6 dashboard/shopping test files create mock data with `as SomeType` assertions because TypeScript cannot infer discriminated union types from object literals when spread overrides are applied. This is a known TypeScript limitation with `Partial<DiscriminatedUnion>`. All current usages include valid both-null focal point defaults, so no actual invalid state exists today. However, the assertions suppress compile-time safety for any future edits to these mocks.

**Fix:** Low priority. The factory approach described in CR-01 would eliminate these if applied to shared test helpers. For test-local helpers, the `as` cast is an acceptable tradeoff since the test file is the only consumer.

---

_Reviewed: 2026-07-01T22:15:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_

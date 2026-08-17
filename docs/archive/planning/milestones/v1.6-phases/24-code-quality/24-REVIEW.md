---
phase: 24-code-quality
reviewed: 2026-05-18T22:00:00Z
depth: standard
files_reviewed: 64
files_reviewed_list:
  - .claude/rules/comment-conventions.md
  - src/__tests__/mocks/factories.ts
  - src/app/(dashboard)/charts/page.tsx
  - src/app/(dashboard)/page.tsx
  - src/app/(dashboard)/stats/page.tsx
  - src/app/(dashboard)/stats/search-params.ts
  - src/components/features/charts/chart-merged-form.tsx
  - src/components/features/charts/project-detail/hero-cover-banner.tsx
  - src/components/features/charts/project-detail/supplies-tab.tsx
  - src/components/features/charts/project-detail/types.ts
  - src/components/features/charts/use-draft-persistence.ts
  - src/components/features/sessions/log-session-modal.tsx
  - src/components/features/stats/completion-estimates-section.tsx
  - src/components/features/stats/project-completion-estimate.tsx
  - src/components/features/stats/records-table.tsx
  - src/components/features/stats/session-history-table.tsx
  - src/components/features/stats/stitching-calendar.tsx
  - src/components/features/supply-table/creation-flow-adapter.ts
  - src/components/features/supply-table/editable-number.tsx
  - src/components/features/supply-table/index.ts
  - src/components/features/supply-table/server-action-adapter.ts
  - src/components/features/supply-table/supply-table.tsx
  - src/components/features/supply-table/types.ts
  - src/components/features/supply-table/use-supply-table.ts
  - src/components/shell/top-bar.tsx
  - src/lib/actions/chart-actions.ts
  - src/lib/actions/dashboard-actions.ts
  - src/lib/actions/pattern-dive-actions.ts
  - src/lib/actions/project-dashboard-actions.ts
  - src/lib/auth.ts
  - src/lib/queries/stats/available-years.ts
  - src/lib/queries/stats/completion-estimates.ts
  - src/lib/queries/stats/designer-insights.ts
  - src/lib/queries/stats/fastest-completions.ts
  - src/lib/queries/stats/genre-insights.ts
  - src/lib/queries/stats/personal-bests.ts
  - src/lib/queries/stats/session-history.ts
  - src/lib/queries/stats/thread-insights.ts
  - src/lib/queries/stats/utils.ts
  - src/lib/validations/chart.ts
  - src/types/stats.ts
  - src/lib/validations/chart.test.ts
  - src/lib/actions/upload-actions.test.ts
  - src/lib/actions/chart-file-actions.test.ts
  - src/lib/actions/designer-actions.test.ts
  - src/lib/actions/supply-actions.test.ts
  - src/lib/actions/chart-actions.test.ts
  - src/lib/actions/genre-actions.test.ts
  - src/lib/actions/fabric-actions.test.ts
  - src/lib/actions/chart-actions-thumbnail.test.ts
  - src/lib/actions/storage-location-actions.test.ts
  - src/lib/actions/stitching-app-actions.test.ts
  - src/lib/actions/session-actions.test.ts
  - src/lib/actions/chart-actions-errors.test.ts
  - src/lib/actions/chart-actions-settings.test.ts
  - src/lib/actions/shopping-cart-actions.test.ts
  - src/lib/actions/shopping-actions.test.ts
  - src/lib/queries/stats/record-detection.test.ts
  - src/lib/queries/stats/available-years.test.ts
  - src/lib/queries/stats/completion-estimates.test.ts
  - src/lib/queries/stats/personal-bests.test.ts
  - src/lib/queries/stats/session-history.test.ts
  - src/components/features/stats/records-table.test.tsx
  - src/components/features/stats/completion-estimates-section.test.tsx
  - src/components/features/stats/project-completion-estimate.test.tsx
  - src/components/features/stats/session-history-table.test.tsx
  - src/components/features/stats/activity-overview.test.tsx
findings:
  critical: 1
  warning: 5
  info: 3
  total: 9
status: issues_found
---

# Phase 24: Code Review Report

**Reviewed:** 2026-05-18T22:00:00Z
**Depth:** standard
**Files Reviewed:** 64
**Status:** issues_found

## Summary

Reviewed 64 source and test files across the codebase covering server actions, stats queries, UI components, supply table system, form/validation infrastructure, and test suites. Overall code quality is high -- auth guards are consistently applied, Zod validation is thorough, error handling follows established patterns, and test coverage is substantial. However, I found one behavioral bug that will cause data loss in the creation flow, and several quality/robustness issues.

## Critical Issues

### CR-01: CreationFlowAdapter does not set isNeedOverridden on manual need edit

**File:** `src/components/features/supply-table/creation-flow-adapter.ts:139-141`
**Issue:** When a user manually edits the "need" value for a thread row in the chart creation flow, `CreationFlowAdapter.updateQuantity` does `{ ...row, [field]: value }` for `field === "need"` without setting `isNeedOverridden: true`. The `ServerActionAdapter` correctly does this at line 136 (`mappedData = { quantityRequired: value, isNeedOverridden: true }`), but the creation flow adapter does not.

This means: if a user manually sets a thread's need to 5, then changes fabric count in the calculator, the bulk recalculation effect in `supply-table.tsx:88-91` will check `!row.isNeedOverridden` (which is still `false`), find it "auto-calculated", and overwrite the user's manual value. The user's intentional edit is silently lost.

**Fix:**
```typescript
// In creation-flow-adapter.ts, updateQuantity method, replace the else branch:
} else if (field === "need" && row.type === "THREAD") {
  updated = { ...row, need: value, isNeedOverridden: true };
} else {
  updated = { ...row, [field]: value };
}
```

## Warnings

### WR-01: Non-null assertion after filter(Boolean) in dashboard page

**File:** `src/app/(dashboard)/page.tsx:44`
**Issue:** The chain `.filter(Boolean).map((c) => transformToGalleryCard(c!, imageUrls))` uses a non-null assertion (`c!`) even after `filter(Boolean)`. While `filter(Boolean)` removes falsy values at runtime, TypeScript's type system does not narrow the type through `filter(Boolean)` reliably in all TS versions. The `!` assertion suppresses the type error but is fragile.

**Fix:** Use a type-safe filter predicate:
```typescript
const startNextCards = mainData.startNextProjects
  .map((p) => startNextChartsMap.get(p.chartId))
  .filter((c): c is NonNullable<typeof c> => Boolean(c))
  .map((c) => transformToGalleryCard(c, imageUrls));
```

### WR-02: handleSort fires multiple independent URL updates without batching

**File:** `src/components/features/stats/session-history-table.tsx:46-54`
**Issue:** `handleSort` calls `void setSort(field)`, `void setDir("desc")`, and `void setPage(1)` as independent fire-and-forget operations. Each nuqs `setX` triggers a separate URL push. While nuqs batches within the same microtask in recent versions, this is an implicit dependency on nuqs internals and can cause intermediate URL states (e.g., sort changes but page is still old). The same pattern appears in `handleProjectFilter` at lines 56-59.

**Fix:** Use `useQueryStates` for atomic multi-key updates:
```typescript
const [params, setParams] = useQueryStates({
  page: parseAsInteger.withDefault(1),
  sort: parseAsStringLiteral([...SORT_FIELDS]).withDefault("date"),
  dir: parseAsStringLiteral([...SORT_DIRS]).withDefault("desc"),
  project: parseAsString.withDefault("all"),
});

function handleSort(field: SortField) {
  if (params.sort === field) {
    void setParams({ dir: params.dir === "asc" ? "desc" : "asc", page: 1 });
  } else {
    void setParams({ sort: field, dir: "desc", page: 1 });
  }
}
```

### WR-03: `as any` type assertion in chart-merged-form draft hydration

**File:** `src/components/features/charts/chart-merged-form.tsx:338`
**Issue:** `form.setField(key, val as any)` bypasses TypeScript's type checking during draft hydration. If the draft contains a value that doesn't match the expected type for a field (e.g., a string where a number is expected from an old draft format), the form state will silently accept invalid data. The eslint-disable comment on line 337 acknowledges this.

**Fix:** Add runtime type checking during hydration, or use the existing `loadDraftV2` return type to iterate over known-typed fields explicitly rather than using dynamic key iteration with `as any`:
```typescript
// Instead of iterating all keys with as any, explicitly assign known fields:
if (draft.form.name !== undefined) form.setField("name", draft.form.name);
if (draft.form.designerId !== undefined) form.setField("designerId", draft.form.designerId);
// ... etc for each field
```

### WR-04: createMockStitchSession missing explicit return type annotation

**File:** `src/__tests__/mocks/factories.ts:408`
**Issue:** `createMockStitchSession` returns an inline object without an explicit `StitchSession` return type, unlike every other factory function in this file. This means it won't catch schema drift -- if a new required field is added to `StitchSession` in the Prisma schema, this factory will silently produce incomplete mock objects rather than failing at compile time. Already tracked as backlog item 999.48 but worth noting as it degrades test reliability.

**Fix:**
```typescript
export function createMockStitchSession(overrides?: Partial<StitchSession>): StitchSession {
  return {
    id: "session-1",
    projectId: "project-1",
    date: new Date("2026-04-10"),
    stitchCount: 150,
    timeSpentMinutes: 60,
    photoKey: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}
```

### WR-05: Buried Treasures query includes charts without project ownership check

**File:** `src/lib/actions/dashboard-actions.ts:128-129`
**Issue:** The `getBuriedTreasures` query includes `{ project: null }` in its `OR` filter with the comment "Safe: single-user app." While this is correctly documented as a known limitation, it means charts with no project at all (orphaned charts, or charts created through a different code path) will appear in the buried treasures section without any ownership validation. If multi-user is ever added without updating this query, it would leak other users' charts.

**Fix:** This is low-risk for the current single-user architecture but should be tracked. Consider adding a `TODO(999.0.17)` comment linking to the existing multi-user hardening backlog item, or adding a `Chart.userId` field as the comment suggests.

## Info

### IN-01: JSX section marker comments in chart-merged-form.tsx

**File:** `src/components/features/charts/chart-merged-form.tsx:407-745`
**Issue:** 13 JSX `{/* === SECTION === */}` markers violate the comment-conventions rule ("JSX `{/* Section Label */}` markers inside render return blocks" are not allowed). Already tracked as backlog item 999.30.

**Fix:** Remove JSX section markers. The component structure and FormField labels provide sufficient navigation.

### IN-02: Section markers inside function body in log-session-modal.tsx

**File:** `src/components/features/sessions/log-session-modal.tsx:60-260`
**Issue:** 9 `// ─── Sub-section ───` markers inside the `LogSessionModal` function body (e.g., `// ─── Form State ───`, `// ─── UI State ───`, etc.). Comment conventions say `// --- Sub-section ---` markers inside function bodies are not allowed. The component is ~540 lines with significant inline state -- the markers serve a navigation purpose but signal the component may benefit from extraction.

**Fix:** Consider extracting form state and handlers into a custom hook (e.g., `useLogSessionForm`) to reduce the function body size. The section markers would then be unnecessary.

### IN-03: Module-level section markers in non-type-bundle files

**File:** `src/components/features/charts/project-detail/supplies-tab.tsx:15,22,81`
**Issue:** Module-level `// ─── Types ───`, `// ─── Data Transform Helpers ───`, `// ─── Component ───` markers. The comment-conventions rule only explicitly allows these in "type-bundle files containing only interface/type declarations." These files contain functions and components, not just types. Also present in `creation-flow-adapter.ts` (line 188), `server-action-adapter.ts` (implicit through the class structure), and `factories.ts` (lines 188, 287, 320, 370, 406, 422, 615).

**Fix:** Low priority. The factories file is arguably a type-bundle-like file. For component files, the convention could be expanded to explicitly allow module-level section markers, or they could be removed.

---

_Reviewed: 2026-05-18T22:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_

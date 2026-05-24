---
phase: 29-ui-polish
status: issues_found
date: 2026-05-24
depth: standard
files_reviewed: 13
files_reviewed_list:
  - src/app/(dashboard)/charts/[id]/page.tsx
  - src/components/features/charts/form-primitives/chart-file-upload.tsx
  - src/components/features/charts/project-detail/project-detail-page.tsx
  - src/components/features/charts/project-detail/supplies-tab.tsx
  - src/components/features/gallery/gallery-card.tsx
  - src/components/features/gallery/gallery-grid.tsx
  - src/components/features/gallery/gallery-types.ts
  - src/components/features/gallery/gallery-utils.ts
  - src/lib/actions/chart-actions.ts
  - src/lib/utils/size-category.ts
  - src/lib/utils/status.ts
  - src/lib/validations/upload.ts
  - src/types/chart.ts
findings:
  critical: 1
  warning: 2
  info: 1
  total: 4
---

# Code Review: Phase 29 -- UI Polish

**Reviewed:** 2026-05-24
**Depth:** standard
**Files Reviewed:** 13
**Status:** issues_found

## Summary

Phase 29 adds colored status/size badges, a digital copy indicator, CalculatorCard integration on the project detail Supplies tab, and 50MB/zip upload support. The gallery card changes (Plan 01) and upload changes (Plan 03) are clean. Plan 02 (CalculatorCard wiring) has a critical optimistic-UI bug where fabric count changes are invisible to the user, plus a missing error boundary on a new `Promise.all` member.

## Findings

| ID | Severity | File | Line | Finding | Recommendation |
|----|----------|------|------|---------|----------------|
| CR-01 | BLOCKER | supplies-tab.tsx | 129 | Fabric count changes are silently discarded -- user sees stale calculator values | Use `localCalcParams` unconditionally (not gated by `isPending`) |
| WR-01 | WARNING | page.tsx | 54 | `getUnassignedFabrics` has no `.catch()` in `Promise.all` -- failure crashes page | Add `.catch(() => [])` like the completion estimate pattern |
| WR-02 | WARNING | project-detail-page.tsx, supplies-tab.tsx | 20, 18 | `FabricOption` interface duplicated 3 times across the codebase | Extract to shared type in project-detail types or supply-table types |
| IN-01 | INFO | upload.ts | 12-13 | Zip MIME types added to both `ALLOWED_FILE_TYPES` and `ALLOWED_CHART_FILE_TYPES` | D-12 said only add to `ALLOWED_CHART_FILE_TYPES`, but adding to both is functionally necessary since server uses `ALLOWED_FILE_TYPES`. Document the intent so the discrepancy is understood. |

## Details

### CR-01: Fabric count changes are silently discarded in CalculatorCard

**File:** `src/components/features/charts/project-detail/supplies-tab.tsx:129`
**Severity:** BLOCKER

The `calcParams` value passed to `CalculatorCard` and `SupplyTable` is computed as:

```tsx
const calcParams: CalcParams = isPending ? localCalcParams : serverCalcParams;
```

`isPending` is only `true` during a `startTransition` call, which only fires when `persistFields` is non-empty (line 148). But `fabricCount` is never added to `persistFields` (lines 136-146 only check `strandCount`, `overCount`, `wastePercent`). This means:

1. **Fabric dropdown selection**: User picks a different fabric -> `handleFabricChange` sets `localCalcParams` with new `fabricCount` -> but `isPending` is `false` -> `calcParams` = `serverCalcParams` (old count) -> calculator displays old value
2. **Manual Count edit**: User edits the Count field -> `handleCalcParamsChange` sets `localCalcParams` with new `fabricCount` -> `persistFields` is empty -> early return at line 148 -> `isPending` never set -> same result

The skein calculations never reflect the new fabric count. The user sees the dropdown change but the numbers don't update.

**Fix:**

Replace the `isPending`-gated logic with a state that always reflects local changes. The simplest fix:

```tsx
// Remove this line:
// const calcParams: CalcParams = isPending ? localCalcParams : serverCalcParams;

// Replace with: always use localCalcParams, sync from server when not pending
const calcParams = localCalcParams;

// Add an effect to sync local state when server state changes (after successful save):
useEffect(() => {
  if (!isPending) {
    setLocalCalcParams(serverCalcParams);
  }
}, [serverCalcParams, isPending]);
```

Alternatively, keep the current approach but remove the `isPending` gate:

```tsx
const calcParams: CalcParams = localCalcParams;
```

And reset `localCalcParams` from `serverCalcParams` via effect when server data changes.

---

### WR-01: Missing error handling on getUnassignedFabrics in Promise.all

**File:** `src/app/(dashboard)/charts/[id]/page.tsx:54`
**Severity:** WARNING

`getUnassignedFabrics` is called inside `Promise.all` without a `.catch()`. If the fabric query fails (network error, DB timeout), the entire `Promise.all` rejects and the page renders a 500 error. The fabric options are non-critical -- they only populate the calculator card's dropdown. The existing `getProjectCompletionEstimate` call at line 52 already demonstrates the defensive pattern with `.catch(() => null)`.

**Fix:**

```tsx
chart.project ? getUnassignedFabrics(chart.project.id).catch(() => []) : [],
```

---

### WR-02: FabricOption interface duplicated three times

**File:** `src/components/features/charts/project-detail/project-detail-page.tsx:20`, `src/components/features/charts/project-detail/supplies-tab.tsx:18`, `src/components/features/charts/form-primitives/calculator-card.tsx:8`
**Severity:** WARNING

The identical `FabricOption` interface (`{ value: string; label: string; count: number }`) is defined in three separate files. If any field changes (e.g., adding a `brand` property), all three must be updated manually -- risk of drift.

**Fix:**

Extract to a shared location (e.g., `src/components/features/supply-table/types.ts` alongside `CalcParams`, or `src/components/features/charts/project-detail/types.ts`) and import in all three files:

```tsx
// In types.ts:
export interface FabricOption {
  value: string;
  label: string;
  count: number;
}
```

---

### IN-01: Zip types added to ALLOWED_FILE_TYPES contrary to D-12

**File:** `src/lib/validations/upload.ts:12-13`
**Severity:** INFO

D-12 explicitly says "Do NOT add zip to `ALLOWED_FILE_TYPES`", but the implementation adds `application/zip` and `application/x-zip-compressed` to both `ALLOWED_FILE_TYPES` and `ALLOWED_CHART_FILE_TYPES`. This is actually functionally necessary: the server-side upload validation in `upload-actions.ts:80-82` uses `ALLOWED_FILE_TYPES` (not `ALLOWED_CHART_FILE_TYPES`) for category `"files"`. If zip were only in `ALLOWED_CHART_FILE_TYPES`, the client would accept zip files but the server would reject them.

Covers and sessions are still protected by their own `ALLOWED_IMAGE_TYPES` check (lines 61-78 of upload-actions.ts), so zip cannot be uploaded for those categories.

**Fix:** Add a comment explaining why both arrays include zip, so future readers don't "fix" this by removing it from `ALLOWED_FILE_TYPES`:

```tsx
export const ALLOWED_FILE_TYPES = [
  // ... images, pdf, octet-stream, css ...
  "application/zip",           // Chart files only (covers/sessions gated by ALLOWED_IMAGE_TYPES)
  "application/x-zip-compressed",
] as const;
```

---

_Reviewed: 2026-05-24_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_

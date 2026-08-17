---
phase: 33-chart-form-integration
reviewed: 2026-05-25T00:00:00Z
depth: standard
files_reviewed: 10
files_reviewed_list:
  - src/app/(dashboard)/charts/[id]/edit/edit-client.tsx
  - src/app/(dashboard)/charts/[id]/edit/page.tsx
  - src/app/(dashboard)/charts/new/page.tsx
  - src/components/features/charts/chart-merged-form.tsx
  - src/components/features/charts/inline-name-dialog.test.tsx
  - src/components/features/charts/inline-name-dialog.tsx
  - src/components/features/charts/use-chart-form.test.tsx
  - src/components/features/charts/use-chart-form.ts
  - src/lib/actions/chart-actions.ts
  - src/lib/validations/chart.ts
findings:
  critical: 0
  warning: 4
  info: 3
  total: 7
status: issues_found
---

# Phase 33: Code Review Report

**Reviewed:** 2026-05-25
**Depth:** standard
**Files Reviewed:** 10
**Status:** issues_found

## Summary

Phase 33 wires the `seriesId` field into the chart form — adding a `SeriesWithStats[]` prop
to the form, a `SearchableSelect` + `InlineNameDialog` for series selection, and
`handleAddSeries` in the hook. The implementation is structurally sound and follows existing
patterns for storage location and stitching app inline creation. No critical bugs were found.

Four warnings need attention before this ships: a cache staleness gap (series pages won't
revalidate when charts change), a render-phase side effect in `InlineNameDialog`, JSX section
markers that violate comment conventions, and a `suppressUnloadRef` declared after the
callbacks that close over it. Three informational items are also noted.

---

## Warnings

### WR-01: Missing `revalidatePath("/series")` after chart create/update

**File:** `src/lib/actions/chart-actions.ts:138-139` and `:350-352`

**Issue:** `createChart`, `createChartWithSupplies`, and `updateChart` call
`revalidatePath("/charts")` and `revalidatePath("/fabric")` but never
`revalidatePath("/series")`. Now that charts carry a `seriesId`, the series list page
(`/series`) and series detail page (`/series/[id]`) will show stale chart counts and
`ownedCount`/`finishedCount` progress stats until the Next.js cache TTL expires — which can
be minutes to hours depending on deployment config. This is a new gap introduced by Phase 33
(earlier phases did not wire series into chart mutations).

**Fix:**

```ts
// In createChart (line 138), createChartWithSupplies (line 216), and updateChart (line 350):
revalidatePath("/charts");
revalidatePath("/series");   // add this
revalidatePath("/fabric");

// For updateChart, also invalidate the specific series detail if seriesId is known:
revalidatePath(`/series/${validated.chart.seriesId}`);
```

For `updateChart`, the `seriesId` from `validated.chart.seriesId` is available after parsing.
Because the old `seriesId` may have changed, both old and new series paths should ideally be
invalidated — but the old value would require fetching the existing chart first (it's already
fetched at line 233 for ownership; add `seriesId: true` to that select and invalidate both).

---

### WR-02: Render-phase state mutation in `InlineNameDialog`

**File:** `src/components/features/charts/inline-name-dialog.tsx:41-45`

**Issue:** Lines 41–45 implement "sync `initialName` when dialog opens" using a mutated object
from `useState`:

```ts
const prevOpenRef = useState({ value: false })[0];
if (open && !prevOpenRef.value) {
  setName(initialName);           // state setter called during render
}
prevOpenRef.value = open;         // object mutation during render
```

Two problems:

1. **Mutation during render is unreliable in Strict Mode.** React may invoke the render
   function twice in development. On the second invocation `prevOpenRef.value` is already
   `open` (mutation persists on the shared object), so the `setName(initialName)` call is
   skipped on the re-invocation. This means in Strict Mode the initialName sync silently
   fails on every second render — the dialog opens with a stale or empty name.

2. **Calling `setName` during render is a derived-state side effect** that requires careful
   guarantees. React allows it only under specific conditions (synchronous, same-component,
   no further side effects). Here it is technically within bounds, but it is fragile and
   non-idiomatic.

**Fix:** Replace with `useEffect` and `useRef`:

```tsx
const prevOpenRef = useRef(false);

useEffect(() => {
  if (open && !prevOpenRef.current) {
    setName(initialName);
  }
  prevOpenRef.current = open;
}, [open, initialName]);
```

---

### WR-03: JSX section marker comments violate comment conventions

**File:** `src/components/features/charts/chart-merged-form.tsx:431,472,556,559,593,596,668,671,725,728,750,760,802`

**Issue:** Thirteen `{/* === ... === */}` markers inside the JSX render return block. The
project's comment conventions (`.claude/rules/comment-conventions.md`) explicitly prohibit
these:

> "JSX `{/* Section Label */}` markers inside render return blocks — NOT allowed"

These were also removed in Phase 25 and Phase 26 as part of quality gate fixes. Their
presence here reopens the same violation.

**Fix:** Remove all 13 markers. The JSX structure is self-documenting at this scale; where
grouping aids readability, React fragments with whitespace are sufficient.

---

### WR-04: `suppressUnloadRef` declared after the callbacks that close over it

**File:** `src/components/features/charts/use-chart-form.ts:442` (used from lines 260, 336, 355, 374, 396, 417)

**Issue:** `const suppressUnloadRef = useRef(false)` is declared at line 442, but every
`useCallback` starting at line 213 references `suppressUnloadRef.current`. The React Rules of
Hooks require hooks to be called in the same order on every render — they do not mandate
declaration order — so this does not break at runtime (closures capture the binding, which is
initialized before any callback is invoked). However, ESLint's `react-hooks/exhaustive-deps`
may mis-analyse this, and it is a code-quality issue: any reader scanning the file top-down
encounters references to a variable before they can see its declaration. Standard convention
in this codebase (and elsewhere) is to declare all refs before the callbacks that use them.

**Fix:** Move the `suppressUnloadRef` declaration to immediately before `submitForm` (after
the `setField` callback, around line 210):

```ts
// Move this block up to before submitForm
const suppressUnloadRef = useRef(false);

const submitForm = useCallback(async () => {
  ...
```

---

## Info

### IN-01: Unused import `createMockSeriesWithStats` in test file

**File:** `src/components/features/charts/use-chart-form.test.tsx:4`

**Issue:** `createMockSeriesWithStats` is imported from `@/__tests__/mocks` but is never
referenced anywhere in the test file. TypeScript strict mode and the `unused-imports` ESLint
rule should catch this, but it slipped through.

**Fix:** Remove from the import:

```ts
import { createMockDesigner, createMockGenre } from "@/__tests__/mocks";
```

---

### IN-02: `handleAddSeries` missing empty-name guard (inconsistent with sibling handlers)

**File:** `src/components/features/charts/use-chart-form.ts:415-439`

**Issue:** `handleAddStorageLocation` (line 373) and `handleAddStitchingApp` (line 395) both
guard against empty/whitespace names with `if (!name.trim()) return;` before calling the
server action. `handleAddSeries` has no such guard. In practice `InlineNameDialog` prevents
empty names before calling the handler, and the `seriesSchema` Zod validation would reject
them server-side anyway. But the inconsistency means calling `handleAddSeries("")` directly
(e.g., from a test or future caller) sends a network request that returns a validation error
rather than silently no-oping. The test suite also documents this inconsistency — it covers
the empty-name guard for the other two handlers but not for `handleAddSeries`.

**Fix:** Add the guard for consistency and defence-in-depth:

```ts
const handleAddSeries = useCallback(
  async (name: string) => {
    if (!name.trim()) return;   // add guard
    suppressUnloadRef.current = true;
    try {
      ...
```

---

### IN-03: `seriesId` field not covered in `chart-actions.test.ts`

**File:** `src/lib/actions/chart-actions.ts` — no corresponding test assertions

**Issue:** Phase 33's core addition is the `seriesId` plumbing through `createChart`,
`createChartWithSupplies`, and `updateChart`. `chart-actions.test.ts` has no test that
creates a chart with a `seriesId`, verifies it is persisted, or verifies that changing
`seriesId` during an update is handled correctly. A chart with an invalid (non-existent)
`seriesId` will throw a Prisma foreign-key error that falls through to the generic
`"Failed to create chart"` response — there is no explicit test that catches this path either.

**Fix:** Add at minimum one happy-path test for `createChart` with `seriesId` set, and one
for `updateChart` changing the `seriesId`. Also add a test for an invalid `seriesId` to
document the current error surface.

---

_Reviewed: 2026-05-25_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_

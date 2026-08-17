---
phase: 38-test-coverage-components
reviewed: 2026-07-01T19:45:00Z
depth: standard
files_reviewed: 7
files_reviewed_list:
  - src/components/features/charts/form-primitives/chart-file-upload.test.tsx
  - src/components/features/charts/project-detail/supplies-tab.nyquist.test.tsx
  - src/components/features/shopping/project-accordion.test.tsx
  - src/components/features/shopping/quantity-control.test.tsx
  - src/components/features/shopping/shopping-cart.test.tsx
  - src/components/features/shopping/supply-overview.test.tsx
  - src/lib/actions/chart-actions.test.ts
findings:
  critical: 0
  warning: 4
  info: 2
  total: 6
status: issues_found
---

# Phase 38: Code Review Report

**Reviewed:** 2026-07-01T19:45:00Z
**Depth:** standard
**Files Reviewed:** 7
**Status:** issues_found

## Summary

Seven test files were reviewed covering chart file upload, supplies tab adapter stability, shopping cart components (project accordion, quantity control, supply overview, shopping cart integration), and chart-actions server action tests. The tests are generally well-structured with good coverage of edge cases, error paths, and user interactions. No critical issues were found. Four warnings identified: a global mock leak, a dead test construct, stale test fixture data, and a type assertion that bypasses the OptionalFocalPoint discriminated union. Two info items for comment convention violations.

## Warnings

### WR-01: global.fetch mock never restored between tests

**File:** `src/components/features/charts/form-primitives/chart-file-upload.test.tsx:12`
**Issue:** `global.fetch = mockFetch` permanently overwrites the global `fetch` for the entire test process. There is no `afterEach` or `afterAll` restoring the original. If other test files in the same vitest worker rely on the real `fetch` (or their own mock), this leaks across test boundaries. While `vi.clearAllMocks()` in `beforeEach` clears call history, it does not restore `global.fetch` to its original value.
**Fix:** Save the original and restore it:
```typescript
const originalFetch = global.fetch;
const mockFetch = vi.fn();
global.fetch = mockFetch;

afterAll(() => {
  global.fetch = originalFetch;
});
```
Alternatively, use `vi.stubGlobal("fetch", mockFetch)` which integrates with vitest's mock lifecycle and is auto-restored by `vi.restoreAllMocks()`.

### WR-02: Dead test code -- `trackedClass` constructed but never used

**File:** `src/components/features/charts/project-detail/supplies-tab.nyquist.test.tsx:282-296`
**Issue:** The second test in the GAP-2 describe block ("adapter is instantiated exactly once on initial render") creates a `trackedClass` that extends `ServerActionAdapter` with a constructor counter, but then immediately marks it unused with `void trackedClass`. The test comments acknowledge it cannot replace the module-level import, and instead falls back to the same DOM-node-identity check as the first test. This means the test is functionally a duplicate of the test above it -- both verify `getByTestId("supply-table-add-row")` is the same DOM node before and after re-renders. The `constructCount` variable is never read or asserted.
**Fix:** Either remove this test entirely (it provides no incremental coverage beyond the previous test), or use the module-level `_constructorSpy` that is already exported from the vi.mock block at line 54 to actually assert the constructor call count:
```typescript
it("adapter is instantiated exactly once on initial render (not on re-renders)", async () => {
  const { _constructorSpy } = await import(
    "@/components/features/supply-table/server-action-adapter"
  );
  const spy = _constructorSpy as ReturnType<typeof vi.fn>;
  spy.mockClear();

  const user = userEvent.setup();
  render(
    <SuppliesTab
      project={defaultProject}
      supplies={{ threads: [makeThread()], beads: [], specialty: [] }}
    />,
  );

  const countAfterMount = spy.mock.calls.length;

  await user.click(screen.getByRole("button", { name: "A-Z" }));
  await user.click(screen.getByRole("button", { name: "Added" }));
  await user.click(screen.getByRole("button", { name: "A-Z" }));

  expect(spy.mock.calls.length).toBe(countAfterMount);
});
```

### WR-03: Stale `digitalFileUrl` in test fixture

**File:** `src/lib/actions/chart-actions.test.ts:64`
**Issue:** The `validChartInput` fixture in the `createChartWithSupplies` describe block includes `digitalFileUrl: null`, but this field does not exist in `chartFormSchema`. Zod silently strips unknown keys, so the test passes, but the fixture is misleading -- it suggests `digitalFileUrl` is a valid field when it was removed from the schema. The `validChartInput` in the `seriesId flow-through` describe block (line 223) correctly omits this field.
**Fix:** Remove `digitalFileUrl: null` from the fixture at line 64:
```typescript
const validChartInput = {
  chart: {
    name: "Test Chart",
    designerId: null,
    coverImageUrl: null,
    coverThumbnailUrl: null,
    // digitalFileUrl removed -- not in chartFormSchema
    stitchCount: 5000,
    ...
  },
  ...
};
```

### WR-04: `as ShoppingCartProject` type assertion bypasses OptionalFocalPoint discriminated union

**File:** `src/components/features/shopping/project-accordion.test.tsx:37`
**Issue:** The `makeProject` factory returns a plain object cast via `as ShoppingCartProject`, which bypasses TypeScript's structural checking of the `OptionalFocalPoint` discriminated union. `ShoppingCartProject` is defined as `OptionalFocalPoint & { ... }`, where `OptionalFocalPoint` requires either both focal point fields to be `number` or both to be `null`. The `as` cast allows invalid combinations like `{ focalPointX: 0.6, focalPointY: null }` to compile without error. This is the same pattern documented in backlog item 999.90.
**Fix:** Use `mapFocalPoint` to construct the focal point fields safely, or build the object so TypeScript can structurally verify it:
```typescript
function makeProject(overrides?: Partial<Omit<ShoppingCartProject, 'focalPointX' | 'focalPointY'>> & Partial<OptionalFocalPoint>): ShoppingCartProject {
  return {
    projectId: "p1",
    chartId: "c1",
    projectName: "Test Project",
    designerName: "Test Designer",
    coverThumbnailUrl: null,
    ...mapFocalPoint(overrides?.focalPointX ?? null, overrides?.focalPointY ?? null),
    status: "IN_PROGRESS",
    threadCount: 5,
    beadCount: 0,
    specialtyCount: 0,
    fabricNeeded: false,
    ...overrides,
  };
}
```

## Info

### IN-01: Section divider comments in Nyquist test violate comment conventions

**File:** `src/components/features/charts/project-detail/supplies-tab.nyquist.test.tsx:217-227`
**Issue:** The `// ──────` section divider block inside a `describe` body violates the comment convention rule that prohibits `// --- Sub-section ---` markers inside function bodies and `// ─── ... ───` markers in test files where `describe` blocks provide structure. Per `comment-conventions.md`, `describe` blocks are the structural signal in test files.
**Fix:** Remove the `// ──────` block and the multi-line comment at lines 217-227. The `describe("GAP-2: ...")` label already communicates the purpose.

### IN-02: Comment convention header block in Nyquist test

**File:** `src/components/features/charts/project-detail/supplies-tab.nyquist.test.tsx:1-20`
**Issue:** The 20-line JSDoc block at the top of the file provides useful context about the Nyquist gap test, but includes planning doc references ("Plan 16-01", "D-03") which violate the comment convention rule against planning doc references. The `GAP-2` label and behavioral description are fine; the plan/decision references should be removed.
**Fix:** Remove `Plan 16-01` and `D-03` references from the JSDoc block. Keep the GAP-2 identifier and the behavioral description.

---

_Reviewed: 2026-07-01T19:45:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_

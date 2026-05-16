---
phase: 13-supply-takeover
reviewed: 2026-05-15T14:30:00Z
depth: standard
files_reviewed: 16
files_reviewed_list:
  - src/components/features/charts/chart-merged-form.test.tsx
  - src/components/features/charts/chart-merged-form.tsx
  - src/components/features/charts/form-primitives/calculator-card.test.tsx
  - src/components/features/charts/form-primitives/calculator-card.tsx
  - src/components/features/charts/form-primitives/summary-bar.test.tsx
  - src/components/features/charts/form-primitives/summary-bar.tsx
  - src/components/features/charts/use-chart-form.ts
  - src/components/features/charts/use-draft-persistence.test.ts
  - src/components/features/charts/use-draft-persistence.ts
  - src/components/features/supply-table/creation-flow-adapter.test.ts
  - src/components/features/supply-table/creation-flow-adapter.ts
  - src/components/features/supply-table/index.ts
  - src/lib/actions/chart-actions.test.ts
  - src/lib/actions/chart-actions.ts
  - src/lib/validations/chart.test.ts
  - src/lib/validations/chart.ts
findings:
  critical: 1
  warning: 5
  info: 2
  total: 8
status: issues_found
---

# Phase 13: Code Review Report

**Reviewed:** 2026-05-15T14:30:00Z
**Depth:** standard
**Files Reviewed:** 16
**Status:** issues_found

## Summary

Phase 13 implements the supply takeover flow: a CreationFlowAdapter for buffered supply storage during chart creation, SummaryBar and CalculatorCard UI components, an Activity-based mode toggle in ChartMergedForm, atomic `createChartWithSupplies` server action, and V2 draft persistence that includes supply rows.

The overall architecture is solid -- the adapter pattern is well-designed, the atomic transaction approach is correct, and test coverage is thorough. However, there is one critical issue with fabric ownership validation that allows linking unowned unlinked fabric, several warning-level concerns around supply row validation from localStorage, duplicate fabricCount updates that can cause stale closures, and a type-safety bypass in the adapter's updateQuantity method.

## Critical Issues

### CR-01: Fabric Ownership Check Allows Stealing Unlinked Fabric From Other Users

**File:** `src/lib/actions/chart-actions.ts:172-183`
**Issue:** The fabric ownership validation in `createChartWithSupplies` (and identically in `createChart` at line 67-80) only rejects when the fabric is linked to a project belonging to a *different user*. If a fabric has no linked project (`linkedProject` is null), the check passes regardless of who owns the fabric. The Fabric model likely has a `userId` field (or ownership is implied through the project relation), but unlinked fabrics belonging to another user can be claimed by anyone with a valid `fabricId`.

The guard at line 177 is:
```typescript
if (targetFabric?.linkedProject && targetFabric.linkedProject.userId !== user.id) {
  throw new Error("Fabric not found");
}
```

This only triggers when `linkedProject` exists AND belongs to someone else. An unlinked fabric (where `linkedProject` is null) passes the check unconditionally. If fabrics can exist independently of projects (which unassigned fabrics clearly can, given the `unassignedFabrics` prop), a malicious user could link any unlinked fabric to their project by guessing or enumerating fabric IDs.

**Fix:** Add a direct ownership check on the fabric itself. If fabrics have a `userId` field:
```typescript
const targetFabric = await tx.fabric.findUnique({
  where: { id: project.fabricId },
  select: { userId: true, linkedProject: { select: { userId: true } } },
});
if (!targetFabric || targetFabric.userId !== user.id) {
  throw new Error("Fabric not found");
}
if (targetFabric.linkedProject && targetFabric.linkedProject.userId !== user.id) {
  throw new Error("Fabric not found");
}
```
If fabrics don't have a direct `userId`, add one. The same fix is needed in `createChart` (line 67-80) and `updateChart` (line 331-344).

## Warnings

### WR-01: Supply Rows From localStorage Are Not Validated Before Use

**File:** `src/components/features/charts/use-draft-persistence.ts:136-158`
**Issue:** The `loadDraftV2` function reads supply rows from localStorage and passes them through with only a nullish coalescing check (`draft.supplies ?? []`). The data is cast via `const draft = parsed as DraftV2` without any runtime validation. If localStorage is tampered with (e.g., browser extension, XSS payload, or manual user edit), the supply rows could contain malformed data -- missing required fields, wrong types, or injected properties. These rows flow to `CreationFlowAdapter.loadRows()` and eventually to the `createChartWithSupplies` server action payload.

The server-side `batchSupplySchema` catches invalid data at the boundary, which prevents the worst outcomes. However, the client-side UI (SupplyTable) could crash on malformed rows before submission is attempted (e.g., `row.code.toLocaleString()` on an undefined `code`).

**Fix:** Add a lightweight Zod schema or runtime guard for supply rows during draft load:
```typescript
const supplyRowSchema = z.object({
  id: z.string(),
  supplyId: z.string(),
  type: z.enum(["THREAD", "BEAD", "SPECIALTY"]),
  code: z.string(),
  name: z.string(),
  brandName: z.string(),
  hexColor: z.string(),
  stitchCount: z.number(),
  need: z.number(),
  have: z.number(),
  isNeedOverridden: z.boolean(),
});

// In loadDraftV2:
const validSupplies = (draft.supplies ?? []).filter(
  (s: unknown) => supplyRowSchema.safeParse(s).success
);
```

### WR-02: CalculatorCard Double-Updates fabricCount With Stale Closure Risk

**File:** `src/components/features/charts/form-primitives/calculator-card.tsx:29-37`
**Issue:** When a fabric is selected, `handleFabricSelect` calls both `onFabricChange(value, fabric?.count)` and `onCalcParamsChange({ ...calcParams, fabricCount: fabric.count })`. The parent component's `onFabricChange` handler (chart-merged-form.tsx:645-648) also calls `setCalcParams((prev) => ({ ...prev, fabricCount: count }))`.

This means `setCalcParams` is called twice for the same user action. The parent uses a functional updater `(prev) => ...` while the child uses a direct spread of the captured `calcParams` closure value. In React's batched updates, the direct-value call overwrites the functional updater. Currently both set the same field to the same value, so no data loss occurs. But the pattern is fragile -- if any other calc param update were queued in the same batch, the stale-closure spread in the child would silently discard it.

**Fix:** Remove the duplicate update. Either:
- Remove the `onCalcParamsChange` call from `CalculatorCard.handleFabricSelect` (let the parent handle it entirely), OR
- Remove the `fabricCount` update from the parent's `onFabricChange` handler (let `CalculatorCard` handle it entirely)

```typescript
// Option A: Remove lines 34-36 from calculator-card.tsx
const handleFabricSelect = useCallback(
  (value: string | null) => {
    const fabric = fabricOptions.find((f) => f.value === value);
    onFabricChange(value, fabric?.count);
    // Parent handles fabricCount update
  },
  [fabricOptions, onFabricChange],
);
```

### WR-03: updateQuantity Uses Type-Unsafe Cast to Write Arbitrary Fields

**File:** `src/components/features/supply-table/creation-flow-adapter.ts:112`
**Issue:** The `updateQuantity` method casts the row to `Record<string, unknown>` to perform a dynamic field write:
```typescript
(row as unknown as Record<string, unknown>)[field] = value;
```

While the `field` parameter is typed as `"stitchCount" | "need" | "have"` at compile time, this double-cast bypasses TypeScript's structural type checking entirely. If the interface's `field` union is ever expanded (or if a caller bypasses types), any property on the row object could be overwritten with a number value -- including `id`, `type`, `code`, etc.

**Fix:** Use a type-safe approach:
```typescript
async updateQuantity(
  _type: SupplyType,
  junctionId: string,
  field: "stitchCount" | "need" | "have",
  value: number,
): Promise<Result> {
  const row = this.rows.get(junctionId);
  if (!row) return { success: false, error: "Supply not found" };

  const updated: SupplyRow = { ...row, [field]: value };
  this.rows.set(junctionId, updated);
  this.onRowsChange(this.getRows());
  return { success: true };
}
```

### WR-04: Non-Null Assertion on result.project Without Guard

**File:** `src/lib/actions/chart-actions.ts:187`
**Issue:** Line 187 uses a non-null assertion: `const projectId = result.project!.id`. This is inconsistent with line 172, which properly guards with `if (project.fabricId && result.project)`. While the nested `project: { create: ... }` in the Prisma query guarantees a project will be created, Prisma's TypeScript types mark included relations as potentially null. If the schema were ever changed to make the chart-project relation optional, this assertion would silently pass type checking and crash at runtime.

**Fix:** Add an explicit guard consistent with the pattern on line 172:
```typescript
if (!result.project) {
  throw new Error("Project creation failed");
}
const projectId = result.project.id;
```

### WR-05: Code Duplication Between createChart and createChartWithSupplies

**File:** `src/lib/actions/chart-actions.ts:12-106` and `src/lib/actions/chart-actions.ts:115-251`
**Issue:** The `createChartWithSupplies` function duplicates nearly all the logic from `createChart` (stitch count calculation, chart+project creation, fabric linking, thumbnail generation, error handling). This is approximately 80 lines of identical code. If a bug is fixed in one, the other must be updated independently. The fabric ownership bug (CR-01) already exists in both functions identically, demonstrating this risk.

**Fix:** Extract the shared chart+project creation logic into a private helper:
```typescript
async function createChartAndProject(
  tx: PrismaTransaction,
  chart: ValidatedChart,
  project: ValidatedProject,
  userId: string,
) {
  // ... shared creation logic
}
```
Then both `createChart` and `createChartWithSupplies` call the helper within their respective transactions.

## Info

### IN-01: console.error Statements Leak Full Error Objects in Server Actions

**File:** `src/lib/actions/chart-actions.ts:103,248`
**Issue:** Multiple `console.error` calls log the raw `error` object (e.g., `console.error("createChart error:", error)`). On Vercel, these logs are visible in the function logs dashboard. While generic error messages are returned to the client, the server-side logs could contain stack traces with internal paths, Prisma query details, or connection strings depending on the error type.

**Fix:** Consider structured logging that explicitly controls what is captured:
```typescript
console.error("createChart error:", error instanceof Error ? error.message : "Unknown error");
```

### IN-02: Unused searchFn/createFn Call Count Not Verified in Adapter Tests

**File:** `src/components/features/supply-table/creation-flow-adapter.test.ts`
**Issue:** In the `searchSupplies` test (line 171-179), the test verifies `searchFn` was called but the `createSupply` test (line 184-195) only checks the result, not that `onRowsChange` was NOT called (since creating a supply should not add it to the buffer). The distinction between "create in catalog" and "add to project buffer" is important for the adapter's contract but the test suite does not assert this boundary explicitly.

**Fix:** Add an assertion in the `createSupply` test:
```typescript
expect(onRowsChange).not.toHaveBeenCalled();
```

---

_Reviewed: 2026-05-15T14:30:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_

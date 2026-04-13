# PR #7 Review Findings

**Reviewed:** 2026-04-13
**Agents:** code-reviewer, pr-test-analyzer, silent-failure-hunter, type-design-analyzer
**Scope:** 82 source files, 535 tests, 74 commits

## Critical (fix before merge)

### C1: Read actions silently return `[]` on DB failure
**Files:** `storage-location-actions.ts`, `stitching-app-actions.ts`, `fabric-actions.ts`
**Functions:** `getStorageLocationsWithStats`, `getStitchingAppsWithStats`, `getFabricBrands`, `getUnassignedFabrics`, `getFabrics`
**Issue:** All catch errors and return `[]`. User sees "No items yet" when DB is down.
**Fix:** Remove try/catch from read-only actions. Let errors propagate to Next.js error boundaries (`error.tsx`).

### C2: Detail actions return `null` on DB failure (conflated with not-found)
**Files:** Same files, `getStorageLocationDetail`, `getStitchingAppDetail`, `getFabric`
**Issue:** Return `null` on both "not found" AND "DB error". User sees 404 when DB is down.
**Fix:** Remove try/catch. Keep explicit `if (!record) return null` for actual not-found.

### C3: Fabric link/unlink in `updateChart`/`createChart` not in transaction
**File:** `chart-actions.ts:154-174` (updateChart), `chart-actions.ts:64-70` (createChart)
**Issue:** Chart update + fabric link/unlink are separate Prisma calls. Partial failure leaves inconsistent state.
**Fix:** Wrap chart update + fabric operations in `prisma.$transaction()`.

### C4: No tests for `updateFabric`/`deleteFabric` ownership rejection
**File:** `fabric-actions.test.ts`
**Issue:** WR-03 code review fix added userId scoping but no tests for rejection path.
**Fix:** Add tests asserting `{ success: false, error: "Fabric not found" }` when fabric linked to other user's project.

### C5: No tests for `getUnassignedFabrics`
**File:** `fabric-actions.test.ts`
**Issue:** Entirely new function with complex OR/NOT query, zero test coverage.
**Fix:** Add tests for: unassigned fabrics returned, currentProjectId included, other users excluded, auth guard, empty on error.

## Important (should fix)

### I1: `status: string` should be `ProjectStatus` in detail types
**File:** `src/types/storage.ts`
**Issue:** Both `StorageLocationDetail` and `StitchingAppDetail` use `status: string`. Every other type uses `ProjectStatus` enum.
**Fix:** `import type { ProjectStatus } from "@/generated/prisma/client"` and change both fields.

### I2: SearchToAdd catch shows "No matches" on fetch failure
**File:** `search-to-add.tsx:116-118`
**Issue:** Catch block just sets `isLoading(false)`. User sees "No matches" when search fails.
**Fix:** Add `fetchError` state, show error message instead of "No matches".

### I3: `updateChart` doesn't verify ownership of new `fabricId`
**File:** `chart-actions.ts:168-173`
**Issue:** Accepts fabricId from client, links without verifying fabric belongs to user.
**Fix:** Query fabric and check ownership before linking.

### I4: DeleteEntityDialog retry comment is wrong
**File:** `delete-entity-dialog.tsx:33-42`
**Issue:** Comment says "dialog stays open for retry" but callers swallow errors so dialog always closes.
**Fix:** Either have callers re-throw on failure, or change dialog to check return value.

### I5: Missing auth guard tests (4 functions)
**Files:** `storage-location-actions.test.ts`, `stitching-app-actions.test.ts`
**Functions:** `updateStorageLocation`, `getStorageLocationDetail`, `updateStitchingApp`, `getStitchingAppDetail`
**Fix:** Add auth rejection tests matching existing pattern.

### I6: `handleSubmit` catch discards error
**File:** `use-chart-form.ts:258-259`
**Issue:** Catch block shows generic message, doesn't log the error.
**Fix:** Add `console.error("Chart form submission error:", error)`.

## Suggestions (nice to have)

- S1: Flatten `_count: { projects: number }` to `projectCount` in WithStats types (consistency with Designer/Genre)
- S2: Add `.trim()` to `description` in both Zod schemas (`src/lib/validations/storage.ts`)
- S3: `global-error.tsx` uses hardcoded colors -- add comment explaining why (CSS may not be loaded)
- S4: Consider thin `logServerError` utility for future Sentry wiring
- S5: `createFabric` doesn't verify ownership of `linkedProjectId` (pre-existing, not this PR)

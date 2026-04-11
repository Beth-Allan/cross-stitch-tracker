---
phase: 05-foundation-quick-wins
reviewed: 2026-04-11T20:15:00Z
depth: standard
files_reviewed: 35
files_reviewed_list:
  - prisma/schema.prisma
  - src/__tests__/mocks/factories.ts
  - src/app/(dashboard)/apps/[id]/page.tsx
  - src/app/(dashboard)/apps/page.tsx
  - src/app/(dashboard)/charts/[id]/edit/edit-client.tsx
  - src/app/(dashboard)/charts/[id]/edit/page.tsx
  - src/app/(dashboard)/charts/[id]/page.tsx
  - src/app/(dashboard)/charts/new/page.tsx
  - src/app/(dashboard)/charts/page.tsx
  - src/app/(dashboard)/storage/[id]/page.tsx
  - src/app/(dashboard)/storage/page.tsx
  - src/components/features/apps/stitching-app-detail.tsx
  - src/components/features/apps/stitching-app-list.tsx
  - src/components/features/charts/chart-add-form.tsx
  - src/components/features/charts/chart-detail.tsx
  - src/components/features/charts/chart-edit-modal.tsx
  - src/components/features/charts/chart-list.tsx
  - src/components/features/charts/form-primitives/cover-image-upload.tsx
  - src/components/features/charts/sections/project-setup-section.tsx
  - src/components/features/charts/use-chart-form.ts
  - src/components/features/storage/delete-entity-dialog.tsx
  - src/components/features/storage/inline-name-edit.tsx
  - src/components/features/storage/storage-location-detail.tsx
  - src/components/features/storage/storage-location-list.tsx
  - src/components/features/supplies/search-to-add.tsx
  - src/components/shell/nav-items.ts
  - src/lib/actions/chart-actions.ts
  - src/lib/actions/fabric-actions.ts
  - src/lib/actions/stitching-app-actions.ts
  - src/lib/actions/storage-location-actions.ts
  - src/lib/auth-guard.ts
  - src/lib/validations/chart.ts
  - src/lib/validations/storage.ts
  - src/types/chart.ts
  - src/types/storage.ts
findings:
  critical: 0
  warning: 5
  info: 4
  total: 9
status: issues_found
---

# Phase 5: Code Review Report

**Reviewed:** 2026-04-11T20:15:00Z
**Depth:** standard
**Files Reviewed:** 35
**Status:** issues_found

## Summary

Reviewed all 35 source files across the schema, server actions, page routes, feature components, validations, types, and test factories. The codebase is well-structured: server actions consistently use `requireAuth()`, Zod validation is applied at boundaries, and the server/client split follows project conventions. No critical security issues found.

Five warnings were identified -- mostly around authorization gaps in multi-tenant actions and a missing error boundary in `handleAddGenre`. Four info-level items note minor code quality improvements.

## Warnings

### WR-01: Missing ownership check in updateStitchingApp

**File:** `src/lib/actions/stitching-app-actions.ts:29-47`
**Issue:** `updateStitchingApp` calls `requireAuth()` but does not verify the current user owns the stitching app being updated. It updates any record by `id` regardless of `userId`. Compare with `updateChart` which verifies `project.userId === user.id` before mutating.
**Fix:** Fetch the existing record and verify `userId` matches before updating:
```typescript
const existing = await prisma.stitchingApp.findUnique({
  where: { id },
  select: { userId: true },
});
if (!existing || existing.userId !== user.id) {
  return { success: false as const, error: "Stitching app not found" };
}
```

### WR-02: Missing ownership check in updateStorageLocation

**File:** `src/lib/actions/storage-location-actions.ts:29-47`
**Issue:** Same pattern as WR-01 -- `updateStorageLocation` does not verify the user owns the storage location before updating. Any authenticated user could update another user's storage location by ID.
**Fix:** Add ownership verification identical to the pattern in WR-01, checking `existing.userId !== user.id`.

### WR-03: Missing ownership check in deleteStitchingApp and deleteStorageLocation

**File:** `src/lib/actions/stitching-app-actions.ts:50-68`, `src/lib/actions/storage-location-actions.ts:50-68`
**Issue:** Both delete actions authenticate the user but do not verify ownership before deleting. An authenticated user could delete another user's entities by guessing an ID. The `deleteChart` action correctly checks ownership, but these two do not.
**Fix:** Add a `findUnique` + `userId` check before the `$transaction` in both delete actions, consistent with `deleteChart`'s pattern.

### WR-04: Missing ownership filter in getStitchingAppsWithStats and getStorageLocationsWithStats

**File:** `src/lib/actions/stitching-app-actions.ts:71-88`, `src/lib/actions/storage-location-actions.ts:71-88`
**Issue:** Both list queries fetch all records regardless of `userId`. In a single-user app this works, but the schema has a `userId` field on both `StorageLocation` and `StitchingApp`, indicating multi-user intent. If a second user is ever added, they would see all records. The `getCharts` action correctly filters by `{ project: { userId: user.id } }`.
**Fix:** Add `where: { userId: user.id }` to both `findMany` calls:
```typescript
const user = await requireAuth();
const locations = await prisma.storageLocation.findMany({
  where: { userId: user.id },
  include: { _count: { select: { projects: true } } },
  orderBy: { name: "asc" },
});
```

### WR-05: Unhandled error in handleAddGenre throws to caller without user feedback

**File:** `src/components/features/charts/use-chart-form.ts:278-293`
**Issue:** `handleAddGenre` throws `new Error(result.error)` when the server action returns `success: false`, but there is no try/catch wrapping this call in the consumer (`GenreSection`). Compare with `handleAddDesigner` (line 258-276) which has the same pattern -- both throw on failure. However, these are called from inline-add UIs where a thrown error will be an unhandled promise rejection with no user-visible feedback.
**Fix:** Either wrap the throw in a toast notification inside the hook, or catch the error in the calling component. The simplest fix in the hook:
```typescript
const handleAddGenre = useCallback(async (name: string) => {
  suppressUnloadRef.current = true;
  try {
    const result = await createGenre({ name });
    if (!result.success) {
      toast.error(result.error ?? "Failed to create genre");
      return;
    }
    setGenres((prev) => [...prev, result.genre]);
    setValues((prev) => ({
      ...prev,
      genreIds: [...prev.genreIds, result.genre.id],
    }));
  } catch {
    toast.error("Something went wrong. Please try again.");
  } finally {
    suppressUnloadRef.current = false;
  }
}, []);
```
Note: `handleAddDesigner` has the same issue at line 258-276.

## Info

### IN-01: Unused import in stitching-app-list.tsx

**File:** `src/components/features/apps/stitching-app-list.tsx:3`
**Issue:** `useTransition` is imported and destructured as `[, startTransition]` on line 31 but `startTransition` is never used anywhere in the component. The async handlers call server actions directly without wrapping in transitions.
**Fix:** Remove the `useTransition` import and the `[, startTransition]` declaration.

### IN-02: Unused import in storage-location-list.tsx

**File:** `src/components/features/storage/storage-location-list.tsx:3`
**Issue:** Same as IN-01 -- `useTransition` imported but `startTransition` is never used. The async handlers call server actions directly.
**Fix:** Remove the unused import and declaration.

### IN-03: Unused Pencil import in stitching-app-detail.tsx and storage-location-detail.tsx

**File:** `src/components/features/apps/stitching-app-detail.tsx` (no usage), `src/components/features/storage/storage-location-detail.tsx:6`
**Issue:** `Pencil` is imported from lucide-react in `storage-location-detail.tsx` but never used in the component's JSX. The `InlineNameEdit` component handles its own edit icon.
**Fix:** Remove the unused `Pencil` import.

### IN-04: Hardcoded default userId in schema

**File:** `prisma/schema.prisma:72`
**Issue:** The `Project` model has `userId String @default("1")` which provides a hardcoded fallback user ID. While the server actions correctly pass `user.id` from auth, any direct database insertion without specifying `userId` would silently use `"1"`. This was likely needed during early development but is a code smell now that auth is fully wired.
**Fix:** Consider removing the `@default("1")` and making `userId` required without a default, or adding a comment documenting why the default exists. This is low priority since all code paths use `requireAuth()` and pass the real user ID.

---

_Reviewed: 2026-04-11T20:15:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_

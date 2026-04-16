---
phase: 05-foundation-quick-wins
reviewed: 2026-04-13T02:09:12Z
depth: standard
files_reviewed: 38
files_reviewed_list:
  - prisma/schema.prisma
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
  - src/components/features/charts/form-primitives/searchable-select.tsx
  - src/components/features/charts/project-supplies-tab.tsx
  - src/components/features/charts/sections/project-setup-section.tsx
  - src/components/features/charts/use-chart-form.ts
  - src/components/features/storage/delete-entity-dialog.tsx
  - src/components/features/storage/inline-name-edit.tsx
  - src/components/features/storage/storage-location-detail.tsx
  - src/components/features/storage/storage-location-list.tsx
  - src/components/features/supplies/search-to-add.tsx
  - src/components/features/supplies/supply-form-modal.test.tsx
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
  critical: 3
  warning: 3
  info: 3
  total: 9
status: issues_found
---

# Phase 5: Code Review Report

**Reviewed:** 2026-04-13T02:09:12Z
**Depth:** standard
**Files Reviewed:** 38
**Status:** issues_found

## Summary

Phase 5 (Foundation & Quick Wins) adds Storage Location and Stitching App CRUD, wires database-backed dropdowns into the chart form, adds a fabric selector, and completes DMC catalog seeding. The code is generally well-structured with consistent patterns, proper auth guards via `requireAuth()`, and good Zod validation at boundaries.

Three critical authorization issues were found: the `updateStorageLocation`, `deleteStorageLocation`, `updateStitchingApp`, and `deleteStitchingApp` server actions do not verify that the entity belongs to the current user. Additionally, the Prisma schema has a hardcoded fallback `userId` default that could mask auth failures. One missing try/catch around a server action call in a `startTransition` block violates the project's own error handling conventions and risks unhandled promise rejections.

## Critical Issues

### CR-01: Missing ownership check in storage location update/delete

**File:** `src/lib/actions/storage-location-actions.ts:29-68`
**Issue:** `updateStorageLocation` and `deleteStorageLocation` call `requireAuth()` (verifying the user is logged in) but do not verify the storage location belongs to the current user. Any authenticated user could update or delete another user's storage locations by guessing/enumerating IDs. The `where` clause filters only by entity `id`, not by `userId`.
**Fix:** Add a userId check to the `where` clause, or fetch-then-verify ownership before mutating:
```ts
// In updateStorageLocation:
const location = await prisma.storageLocation.update({
  where: { id, userId: user.id },
  data: validated,
});

// In deleteStorageLocation, verify before the transaction:
const existing = await prisma.storageLocation.findUnique({
  where: { id },
  select: { userId: true },
});
if (!existing || existing.userId !== user.id) {
  return { success: false as const, error: "Location not found" };
}
```
Same pattern needed for `getStorageLocationDetail` (line 91) which also lacks a userId filter.

### CR-02: Missing ownership check in stitching app update/delete

**File:** `src/lib/actions/stitching-app-actions.ts:29-68`
**Issue:** Identical to CR-01 but for stitching apps. `updateStitchingApp`, `deleteStitchingApp`, and `getStitchingAppDetail` do not verify the entity belongs to the current user. Any authenticated user could modify or delete another user's stitching apps.
**Fix:** Apply the same ownership verification pattern as CR-01:
```ts
// In updateStitchingApp:
const app = await prisma.stitchingApp.update({
  where: { id, userId: user.id },
  data: validated,
});

// In deleteStitchingApp:
const existing = await prisma.stitchingApp.findUnique({
  where: { id },
  select: { userId: true },
});
if (!existing || existing.userId !== user.id) {
  return { success: false as const, error: "App not found" };
}
```

### CR-03: Hardcoded default userId in Project schema

**File:** `prisma/schema.prisma:71`
**Issue:** The `Project` model has `userId String @default("1")`. This is a hardcoded fallback user ID -- the exact pattern forbidden by `.claude/rules/auth-patterns.md` ("Never use fallback values like `user.id ?? "1"`"). While the `createChart` action correctly sets `userId: user.id`, this default means any direct database insert (migration, seed, manual fix) would silently assign to user "1" instead of failing loudly. If the auth callback ever fails to thread through the user ID, charts could be created under a phantom user.
**Fix:** Remove the default so missing userId causes a database error instead of silent misassignment:
```prisma
userId String
```

## Warnings

### WR-01: Missing try/catch around deleteChart in startTransition

**File:** `src/components/features/charts/chart-detail.tsx:210-220`
**Issue:** The `handleDelete` function in `DeleteChartDialog` calls `deleteChart(chartId)` inside `startTransition` without a try/catch. If `deleteChart` throws a network error (not a returned `{ success: false }` -- an actual thrown exception), the promise rejection is unhandled. The project's `form-patterns.md` convention explicitly requires wrapping server actions in try/catch when using optimistic/transition patterns.
**Fix:**
```tsx
function handleDelete() {
  startTransition(async () => {
    try {
      const result = await deleteChart(chartId);
      if (result.success) {
        toast.success("Chart deleted");
        router.push("/charts");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
    setOpen(false);
  });
}
```

### WR-02: Missing ownership filter in getStorageLocationsWithStats and getStitchingAppsWithStats

**File:** `src/lib/actions/storage-location-actions.ts:71-88`
**File:** `src/lib/actions/stitching-app-actions.ts:71-88`
**Issue:** Both list queries (`findMany`) do not filter by `userId`. This means any authenticated user sees all storage locations and stitching apps across all users. While this is a single-user app today, the schema includes `userId`, indicating multi-user is intended. If a second user is ever added, all data leaks immediately.
**Fix:** Add a `where` clause filtering by the current user:
```ts
const user = await requireAuth();
const locations = await prisma.storageLocation.findMany({
  where: { userId: user.id },
  include: { _count: { select: { projects: true } } },
  orderBy: { name: "asc" },
});
```

### WR-03: Fabric actions have no userId scoping at all

**File:** `src/lib/actions/fabric-actions.ts:1-231`
**Issue:** The entire fabric actions file (`createFabric`, `updateFabric`, `deleteFabric`, `getFabrics`, `getUnassignedFabrics`, `getFabric`) calls `requireAuth()` to verify authentication but never uses the returned user for ownership checks. The `Fabric` model itself has no `userId` field, and there is no indirect ownership check through the linked project. Any authenticated user can read, modify, or delete any fabric. This is a design-level gap -- fabric needs either a `userId` field or ownership must be verified through the project relationship chain.
**Fix:** For the immediate term, verify ownership through the linked project when one exists:
```ts
// In getFabric, after fetching:
if (fabric?.linkedProject && fabric.linkedProject.userId !== user.id) {
  return null;
}
```
Longer term, consider adding `userId` to the Fabric model to match the pattern used by StorageLocation and StitchingApp.

## Info

### IN-01: Unused import: Pencil in storage-location-detail.tsx

**File:** `src/components/features/storage/storage-location-detail.tsx:6`
**Issue:** `Pencil` is imported from lucide-react but never referenced in the component's JSX. The edit functionality uses the `InlineNameEdit` component which has its own Pencil icon.
**Fix:** Remove `Pencil` from the import:
```tsx
import { ArrowLeft, MapPin, Trash2, ChevronRight } from "lucide-react";
```

### IN-02: Duplicated needsBorder utility function

**File:** `src/components/features/charts/project-supplies-tab.tsx:31-36`
**File:** `src/components/features/supplies/search-to-add.tsx:19-24`
**Issue:** The `needsBorder` function (checks if a hex color is light enough to need a visible border on the swatch) is defined identically in both files. It already exists as an export in `src/components/features/supplies/color-swatch.tsx:5`. This duplication means any logic change (e.g., adjusting the brightness threshold) must be made in three places.
**Fix:** Import from the existing shared module:
```tsx
import { needsBorder } from "@/components/features/supplies/color-swatch";
```

### IN-03: Inline style for font-family in project-supplies-tab.tsx

**File:** `src/components/features/charts/project-supplies-tab.tsx:444`
**Issue:** The kitting percentage display uses an inline `style={{ fontFamily: "'JetBrains Mono', monospace" }}`. This bypasses the Tailwind design system and may not match the font loading strategy. If JetBrains Mono is not loaded, the fallback is generic `monospace` which differs from the rest of the app's typography.
**Fix:** Either add JetBrains Mono via `next/font` and create a Tailwind utility class, or use the simpler `font-mono` Tailwind class which maps to the theme's monospace stack:
```tsx
<span className={`text-sm font-medium font-mono tabular-nums ${...}`}>
```

---

_Reviewed: 2026-04-13T02:09:12Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_

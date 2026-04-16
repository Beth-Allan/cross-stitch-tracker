---
phase: 07-project-detail-experience
reviewed: 2026-04-16T00:03:41Z
depth: standard
files_reviewed: 38
files_reviewed_list:
  - prisma/schema.prisma
  - src/__tests__/mocks/factories.ts
  - src/app/(dashboard)/charts/[id]/page.tsx
  - src/components/features/charts/editable-number.test.tsx
  - src/components/features/charts/editable-number.tsx
  - src/components/features/charts/project-detail/calculator-settings-bar.test.tsx
  - src/components/features/charts/project-detail/calculator-settings-bar.tsx
  - src/components/features/charts/project-detail/hero-cover-banner.tsx
  - src/components/features/charts/project-detail/hero-kebab-menu.test.tsx
  - src/components/features/charts/project-detail/hero-kebab-menu.tsx
  - src/components/features/charts/project-detail/hero-status-badge.test.tsx
  - src/components/features/charts/project-detail/hero-status-badge.tsx
  - src/components/features/charts/project-detail/inline-supply-create.test.tsx
  - src/components/features/charts/project-detail/inline-supply-create.tsx
  - src/components/features/charts/project-detail/overview-tab.test.tsx
  - src/components/features/charts/project-detail/overview-tab.tsx
  - src/components/features/charts/project-detail/project-detail-hero.test.tsx
  - src/components/features/charts/project-detail/project-detail-hero.tsx
  - src/components/features/charts/project-detail/project-detail-page.test.tsx
  - src/components/features/charts/project-detail/project-detail-page.tsx
  - src/components/features/charts/project-detail/project-tabs.test.tsx
  - src/components/features/charts/project-detail/project-tabs.tsx
  - src/components/features/charts/project-detail/supplies-tab.test.tsx
  - src/components/features/charts/project-detail/supplies-tab.tsx
  - src/components/features/charts/project-detail/supply-footer-totals.tsx
  - src/components/features/charts/project-detail/supply-row.test.tsx
  - src/components/features/charts/project-detail/supply-row.tsx
  - src/components/features/charts/project-detail/supply-section.tsx
  - src/components/features/charts/project-detail/types.ts
  - src/components/features/supplies/search-to-add.test.tsx
  - src/components/features/supplies/search-to-add.tsx
  - src/lib/actions/chart-actions-settings.test.ts
  - src/lib/actions/chart-actions.ts
  - src/lib/actions/supply-actions.test.ts
  - src/lib/actions/supply-actions.ts
  - src/lib/utils/skein-calculator.test.ts
  - src/lib/utils/skein-calculator.ts
  - src/lib/validations/supply.ts
findings:
  critical: 3
  warning: 3
  info: 3
  total: 9
status: issues_found
---

# Phase 7: Code Review Report

**Reviewed:** 2026-04-16T00:03:41Z
**Depth:** standard
**Files Reviewed:** 38
**Status:** issues_found

## Summary

Phase 7 adds the Project Detail Experience: a hero section with interactive status change and delete, tabbed layout (Overview + Supplies), a skein calculator with editable settings, inline supply management (add/remove/edit quantities), and inline supply creation for missing catalog items. The code is well-structured with proper auth guards on new server actions (`updateProjectSettings`, `createAndAdd*`), Zod validation at all boundaries, optimistic UI with rollback, and thorough test coverage.

Three critical authorization bypass findings affect supply mutation actions (`remove*`, `updateProjectSupplyQuantity`, `add*ToProject`) that accept arbitrary record/project IDs without verifying ownership. Three warnings cover a hardcoded placeholder brand ID that will cause FK errors, missing `router.refresh()` after supply removal, and a potential division-by-zero in the skein calculator. Three info items note code duplication opportunities and an unusual render-time setState pattern.

## Critical Issues

### CR-01: Authorization bypass in removeProjectThread / removeProjectBead / removeProjectSpecialty

**File:** `src/lib/actions/supply-actions.ts:494-540`
**Issue:** These three actions accept a junction record ID and delete it without verifying the record belongs to the authenticated user's project. While `requireAuth()` is called (confirming the user is logged in), there is no ownership check on the specific record. Any authenticated user who knows or enumerates a junction record ID could delete supply links from another user's project. This is the same class of authorization bypass previously fixed for other actions in Phase 5 (WR-02/WR-03).
**Fix:** Look up the junction record's associated project and verify `project.userId === user.id` before deleting:
```ts
export async function removeProjectThread(id: string) {
  const user = await requireAuth();

  try {
    const record = await prisma.projectThread.findUnique({
      where: { id },
      select: { project: { select: { userId: true } } },
    });
    if (!record || record.project.userId !== user.id) {
      return { success: false as const, error: "Supply not found" };
    }

    await prisma.projectThread.delete({ where: { id } });
    revalidatePath("/shopping");
    return { success: true as const };
  } catch (error) {
    console.error("removeProjectThread error:", error);
    return { success: false as const, error: "Failed to remove thread from project" };
  }
}
```
Apply the same pattern to `removeProjectBead` (line 510) and `removeProjectSpecialty` (line 526).

### CR-02: Authorization bypass in updateProjectSupplyQuantity

**File:** `src/lib/actions/supply-actions.ts:453-492`
**Issue:** `updateProjectSupplyQuantity` accepts a junction record ID and type, validates the quantity data via Zod, then updates the record directly without verifying the record belongs to the authenticated user. An attacker could modify `stitchCount`, `quantityRequired`, `quantityAcquired`, or `isNeedOverridden` on any user's project supplies by providing a valid junction ID and type.
**Fix:** Add ownership verification before the update:
```ts
// For type === "thread":
const record = await prisma.projectThread.findUnique({
  where: { id },
  select: { project: { select: { userId: true } } },
});
if (!record || record.project.userId !== user.id) {
  return { success: false as const, error: "Supply not found" };
}
await prisma.projectThread.update({ where: { id }, data: validated });
```
Apply for all three type branches (thread, bead, specialty).

### CR-03: Authorization bypass in addThreadToProject / addBeadToProject / addSpecialtyToProject

**File:** `src/lib/actions/supply-actions.ts:372-451`
**Issue:** These three actions accept a `projectId` from the client and create a junction record without verifying the project belongs to the authenticated user. An attacker could link arbitrary supplies to another user's project. The `createAndAdd*` variants (lines 566+) DO correctly verify project ownership via `prisma.project.findUnique` + `userId` check -- the plain `add*ToProject` variants are the gap.
**Fix:** Add the same ownership check used in the `createAndAdd*` functions:
```ts
export async function addThreadToProject(formData: unknown) {
  const user = await requireAuth();

  try {
    const validated = projectThreadSchema.parse(formData);

    // Verify project ownership
    const project = await prisma.project.findUnique({
      where: { id: validated.projectId },
      select: { userId: true },
    });
    if (!project || project.userId !== user.id) {
      return { success: false as const, error: "Project not found" };
    }

    const record = await prisma.projectThread.create({ data: validated });
    revalidatePath(`/charts/${validated.projectId}`);
    revalidatePath("/shopping");
    return { success: true as const, record };
  } catch (error) {
    // ... existing error handling unchanged
  }
}
```
Apply the same pattern to `addBeadToProject` (line 399) and `addSpecialtyToProject` (line 427).

## Warnings

### WR-01: Hardcoded brandId "default" in InlineSupplyCreate will cause FK errors

**File:** `src/components/features/charts/project-detail/inline-supply-create.tsx:110-114`
**Issue:** The component passes `brandId: "default"` when calling `createAndAddThread`, `createAndAddBead`, and `createAndAddSpecialty`. There is no brand record with ID `"default"` in the database. The Zod schema (`z.string().min(1, "Brand is required")`) passes validation since `"default"` has length 7, but the Prisma create inside the `$transaction` will fail with a foreign key constraint violation. This gets caught by the generic error handler and returns `"Failed to create and add thread"` -- a confusing error message for the user, and the inline create dialog is effectively non-functional.
**Fix:** Either:
1. (Minimal) Resolve the brand at action time using upsert:
```ts
// In createAndAddThread, before the $transaction:
let resolvedBrandId = validated.brandId;
if (resolvedBrandId === "default") {
  const brand = await prisma.supplyBrand.upsert({
    where: { name: "Custom" },
    create: { name: "Custom", supplyType: "THREAD" },
    update: {},
  });
  resolvedBrandId = brand.id;
}
```
2. (Better) Add a brand selector dropdown to the `InlineSupplyCreate` dialog so the user picks a real brand.

### WR-02: No router.refresh() after supply removal -- stale UI

**File:** `src/components/features/charts/project-detail/supplies-tab.tsx:201-243`
**Issue:** When `handleRemove` successfully deletes a supply link via `removeProjectThread`/`removeProjectBead`/`removeProjectSpecialty`, it does not call `router.refresh()` or update local state. The deleted item remains visible in the UI until the user navigates away or manually refreshes. Compare with `handleSupplyAdded` (line 262) and `handleCreated` (line 267) which both correctly call `router.refresh()`.
**Fix:** Add `router.refresh()` after successful removal in all three branches:
```ts
const result = await removeProjectThread(id);
if (!result.success) {
  toast.error("Couldn't remove this supply. Please try again.");
} else {
  router.refresh();
}
```

### WR-03: Division by zero in skein calculator when fabricCount is 0

**File:** `src/lib/utils/skein-calculator.ts:33`
**Issue:** If `fabricCount` is 0 (e.g., linked fabric has count 0, or data corruption), `effectiveCount = 0 / overCount = 0` on line 33, `threadPerStitch` becomes `Infinity`, and `Math.ceil(Infinity) = Infinity`. The UI would display "Infinity skeins" or "Infinity" in the supply row calculations. While the schema defaults fabric count to 14 and the UI defaults to 14, a defensive guard prevents unexpected display bugs from bad data.
**Fix:**
```ts
if (stitchCount <= 0 || fabricCount <= 0) return 0;
```

## Info

### IN-01: Duplicated needsBorder helper function

**File:** `src/components/features/charts/project-detail/supply-row.tsx:14-19` and `src/components/features/supplies/search-to-add.tsx:19-23`
**Issue:** The `needsBorder(hex: string): boolean` function is copy-pasted identically in both files. This is a minor DRY violation.
**Fix:** Extract to a shared utility (e.g., `src/lib/utils/color.ts`) and import from both files.

### IN-02: Duplicated Intl.NumberFormat instances across modules

**File:** `src/components/features/charts/project-detail/supply-row.tsx:21`, `supply-footer-totals.tsx:5`, `project-detail-hero.tsx:15`
**Issue:** Three separate `new Intl.NumberFormat()` instances are created at module scope across these files. The project already has `formatNumber` in `src/components/features/gallery/gallery-format.ts` used in `overview-tab.tsx`. Using it consistently would reduce duplication.
**Fix:** Import the shared `formatNumber` from `gallery-format.ts` or extract a shared formatter to a utility module.

### IN-03: setState during render in CalculatorSettingsBar ("show once shown" pattern)

**File:** `src/components/features/charts/project-detail/calculator-settings-bar.tsx:35-37`
**Issue:** The pattern `if (hasStitchCounts && !everShown) { setEverShown(true); }` calls `setState` during the render phase. While React handles this for conditional first-render patterns (it triggers a synchronous re-render before painting), a `useEffect` would be more idiomatic and avoids the double-render:
```ts
useEffect(() => {
  if (hasStitchCounts) setEverShown(true);
}, [hasStitchCounts]);
```
The current pattern works correctly -- this is a minor code quality note.

---

_Reviewed: 2026-04-16T00:03:41Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_

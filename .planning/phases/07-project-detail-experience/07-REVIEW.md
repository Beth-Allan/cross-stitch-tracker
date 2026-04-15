---
phase: 07-project-detail-experience
reviewed: 2026-04-15T20:30:00Z
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

**Reviewed:** 2026-04-15T20:30:00Z
**Depth:** standard
**Files Reviewed:** 38
**Status:** issues_found

## Summary

Phase 7 adds the Project Detail Experience: hero section with status change and delete, tabbed layout (Overview + Supplies), skein calculator with editable settings, supply management (add/remove/edit quantities), and inline supply creation. The code is well-structured overall with proper auth guards, Zod validation, optimistic UI patterns, and thorough tests.

Three critical findings relate to authorization gaps in supply mutation actions. Three warnings cover a hardcoded brand ID, missing state reset after removal, and a potential division-by-zero. Three info items note code duplication opportunities and unused imports.

## Critical Issues

### CR-01: Missing ownership check in removeProjectThread / removeProjectBead / removeProjectSpecialty

**File:** `src/lib/actions/supply-actions.ts:494-540`
**Issue:** The `removeProjectThread`, `removeProjectBead`, and `removeProjectSpecialty` actions accept an arbitrary junction record ID and delete it without verifying the record belongs to the authenticated user's project. Any authenticated user who guesses or enumerates a junction ID could delete supply links from another user's project. This is the same class of authorization bypass previously fixed for other actions in Phase 5 (WR-02/WR-03).
**Fix:** Before deleting, look up the junction record's associated project and verify `project.userId === user.id`. Example for `removeProjectThread`:
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
Apply the same pattern to `removeProjectBead` and `removeProjectSpecialty`.

### CR-02: Missing ownership check in updateProjectSupplyQuantity

**File:** `src/lib/actions/supply-actions.ts:453-492`
**Issue:** `updateProjectSupplyQuantity` accepts a junction record ID and type, then updates it directly without verifying the record belongs to the authenticated user. An attacker could modify quantities on any user's project supplies by providing a valid junction ID.
**Fix:** Add ownership verification before the update, similar to CR-01:
```ts
export async function updateProjectSupplyQuantity(
  id: string,
  type: "thread" | "bead" | "specialty",
  formData: unknown,
) {
  const user = await requireAuth();

  try {
    const validated = updateQuantitySchema.parse(formData);

    // Verify ownership
    if (type === "thread") {
      const record = await prisma.projectThread.findUnique({
        where: { id },
        select: { project: { select: { userId: true } } },
      });
      if (!record || record.project.userId !== user.id) {
        return { success: false as const, error: "Supply not found" };
      }
      await prisma.projectThread.update({ where: { id }, data: validated });
    }
    // ... same pattern for bead and specialty
```

### CR-03: Missing ownership check in addThreadToProject / addBeadToProject / addSpecialtyToProject

**File:** `src/lib/actions/supply-actions.ts:372-451`
**Issue:** The `addThreadToProject`, `addBeadToProject`, and `addSpecialtyToProject` actions accept a `projectId` from the client and create a junction record without verifying the project belongs to the authenticated user. An attacker could link supplies to another user's project. Note: the `createAndAdd*` variants (lines 566+) DO correctly check ownership -- the plain `add*ToProject` variants are the gap.
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
    // ... rest unchanged
```
Apply to all three `add*ToProject` functions.

## Warnings

### WR-01: Hardcoded brandId "default" in InlineSupplyCreate

**File:** `src/components/features/charts/project-detail/inline-supply-create.tsx:110-114`
**Issue:** The component passes `brandId: "default"` when calling `createAndAddThread`, `createAndAddBead`, and `createAndAddSpecialty`. There is no brand record with ID "default" in the database -- this will cause a foreign key constraint error at the database level when the user tries to create a supply through this dialog. The Zod schema validates `brandId: z.string().min(1)` which passes, but the Prisma create will fail with a foreign key error that gets returned as a generic "Failed to create and add thread" message.
**Fix:** Either:
1. Add a brand selector to the `InlineSupplyCreate` dialog (preferred for accuracy), or
2. Look up or create a default "Custom" brand at action time:
```ts
// In supply-actions.ts createAndAddThread:
const brand = await tx.supplyBrand.upsert({
  where: { name: "Custom" },
  create: { name: "Custom", supplyType: "THREAD" },
  update: {},
});
// Then use brand.id instead of validated.brandId
```

### WR-02: Stale UI after supply removal -- no local state cleanup

**File:** `src/components/features/charts/project-detail/supplies-tab.tsx:201-243`
**Issue:** When `handleRemove` succeeds, it calls the server action but does not update local state or trigger `router.refresh()`. The removed item stays visible in the UI until the user navigates away or manually refreshes. Compare with `handleSupplyAdded` (line 262) which correctly calls `router.refresh()`.
**Fix:** Add `router.refresh()` after successful removal:
```ts
const result = await removeProjectThread(id);
if (!result.success) {
  toast.error("Couldn't remove this supply. Please try again.");
} else {
  router.refresh();
}
```

### WR-03: Division by zero possible in skein calculator with fabricCount=0

**File:** `src/lib/utils/skein-calculator.ts:33`
**Issue:** If `fabricCount` is 0 (which could happen if the linked fabric has count 0 or if the default is somehow corrupted), `effectiveCount = 0 / overCount = 0`, and `threadPerStitch` becomes `Infinity`. This propagates to `rawSkeins = Infinity`, and `Math.ceil(Infinity) = Infinity`, which would display as "Infinity skeins" in the UI. While the Prisma schema defaults fabric count to 14 and the UI defaults to 14, a defensive guard would prevent unexpected display bugs.
**Fix:**
```ts
if (stitchCount <= 0 || fabricCount <= 0) return 0;
```

## Info

### IN-01: Duplicated needsBorder helper

**File:** `src/components/features/charts/project-detail/supply-row.tsx:14-19` and `src/components/features/supplies/search-to-add.tsx:19-23`
**Issue:** The `needsBorder(hex)` function is copy-pasted identically in both files. This is a minor DRY violation -- extracting to a shared utility (e.g., `src/lib/utils/color.ts`) would reduce duplication.
**Fix:** Extract to a shared module and import from both files.

### IN-02: Duplicated Intl.NumberFormat instances

**File:** `src/components/features/charts/project-detail/supply-row.tsx:21`, `supply-footer-totals.tsx:5`, `project-detail-hero.tsx:15`
**Issue:** Three separate `new Intl.NumberFormat()` instances are created at module scope. While each is cached per module, a shared formatter instance (like the gallery format utilities) would be more consistent with the existing pattern in `gallery-format.ts`.
**Fix:** Import a shared `formatNumber` utility or export a shared formatter instance.

### IN-03: CalculatorSettingsBar calls setState during render

**File:** `src/components/features/charts/project-detail/calculator-settings-bar.tsx:35-37`
**Issue:** The pattern `if (hasStitchCounts && !everShown) { setEverShown(true); }` calls `setState` during the render phase. While React handles this for conditional first-render patterns, it triggers an extra re-render. A `useEffect` would be more idiomatic:
```ts
useEffect(() => {
  if (hasStitchCounts) setEverShown(true);
}, [hasStitchCounts]);
```
This is a minor code quality note -- the current pattern works correctly but is unusual.

---

_Reviewed: 2026-04-15T20:30:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_

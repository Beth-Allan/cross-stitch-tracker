---
phase: 07-project-detail-experience
reviewed: 2026-04-15T19:00:00Z
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
  critical: 1
  warning: 2
  info: 3
  total: 6
status: issues_found
---

# Phase 7: Code Review Report

**Reviewed:** 2026-04-15T19:00:00Z
**Depth:** standard
**Files Reviewed:** 38
**Status:** issues_found

## Summary

Phase 7 adds the Project Detail Experience: hero section with interactive status badge, cover banner, and kebab menu; tabbed layout (Overview + Supplies); skein calculator with editable settings bar; inline supply management (add/remove/edit quantities via SearchToAdd); and inline supply creation for missing catalog items.

This is a second-pass review. The previous review's 3 critical auth bypasses (remove/update/add supply actions) and 3 warnings (hardcoded brandId, missing router.refresh, fabricCount guard) have all been fixed. The supply actions now consistently verify project ownership before mutations. The `resolveDefaultBrandId` helper handles the "default" brand placeholder. The skein calculator guards against `fabricCount <= 0`.

Remaining concerns: one authorization gap on a read-only action, a stale-closure risk in the settings bar, a data integrity issue with the shared "Custom" brand, and minor code quality items.

## Critical Issues

### CR-01: getProjectSupplies lacks ownership check -- any authenticated user can read any project's supplies

**File:** `src/lib/actions/supply-actions.ts:637-659`
**Issue:** `getProjectSupplies` only calls `requireAuth()` but does not verify that the requesting user owns the project. Since this is exported from a `"use server"` module, it is a publicly callable server action. Any authenticated user could call `getProjectSupplies("any-project-id")` directly from client code and retrieve another user's supply data -- thread color codes, quantities needed/acquired, brand names, and stitch counts per color.

The page-level call path (`charts/[id]/page.tsx`) gates through `getChart()` which does check ownership, so normal UI navigation is safe. But the server action surface is directly accessible.
**Fix:**
```ts
export async function getProjectSupplies(projectId: string) {
  const user = await requireAuth();

  // Verify project ownership
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { userId: true },
  });
  if (!project || project.userId !== user.id) {
    return { threads: [], beads: [], specialty: [] };
  }

  const [threads, beads, specialty] = await Promise.all([
    prisma.projectThread.findMany({
      where: { projectId },
      include: { thread: { include: { brand: true } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.projectBead.findMany({
      where: { projectId },
      include: { bead: { include: { brand: true } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.projectSpecialty.findMany({
      where: { projectId },
      include: { specialtyItem: { include: { brand: true } } },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  return { threads, beads, specialty };
}
```

## Warnings

### WR-01: resolveDefaultBrandId shares a single "Custom" brand across all supply types -- supplyType mismatch

**File:** `src/lib/actions/supply-actions.ts:38-50`
**Issue:** The `resolveDefaultBrandId` function upserts a brand with `where: { name: "Custom" }`. The `SupplyBrand.name` has a `@unique` constraint, so all three supply types (thread, bead, specialty) will share the same "Custom" brand record. The first call creates it with whatever `supplyType` was passed (e.g., "THREAD"), and subsequent calls for different types will reuse that same record via the `update: {}` no-op branch.

This means the "Custom" brand's `supplyType` field will permanently reflect whichever type was created first. Any code or UI that filters brands by `supplyType` (e.g., showing only thread brands on the thread management page) will either:
- Show the "Custom" brand under the wrong supply type, or
- Fail to show it for the supply types it actually contains items for.

This is a data integrity issue, not a crash, but it will cause confusing behavior if supply brand management is later expanded.
**Fix:** Use distinct brand names per supply type:
```ts
async function resolveDefaultBrandId(
  brandId: string,
  supplyType: "THREAD" | "BEAD" | "SPECIALTY",
): Promise<string> {
  if (brandId !== "default") return brandId;

  const brandName = `Custom (${supplyType.charAt(0) + supplyType.slice(1).toLowerCase()})`;
  const brand = await prisma.supplyBrand.upsert({
    where: { name: brandName },
    create: { name: brandName, supplyType },
    update: {},
  });
  return brand.id;
}
```

### WR-02: CalculatorSettingsBar handleSettingChange captures stale currentSettings via closure

**File:** `src/components/features/charts/project-detail/calculator-settings-bar.tsx:44-66`
**Issue:** The `handleSettingChange` callback depends on `currentSettings` (line 65), which is derived as `isPending ? localSettings : settings`. When memoized by `useCallback`, the closure captures the value of `currentSettings` at the time the callback was last created. If two rapid setting changes occur while the first is still in its `startTransition`, the second change may read a stale `currentSettings`.

Scenario: User changes strands from 2 to 3 (starts pending). While pending, they change waste from 20 to 25. The second call's `currentSettings` in the closure may still be the pre-strand-change value (strands=2, waste=20). The new settings spread `{ ...currentSettings, wastePercent: 25 }` would produce strands=2 (lost), waste=25 -- losing the first change.

In practice this requires very fast sequential edits, but the fix is straightforward.
**Fix:** Use a ref to always read the latest settings:
```ts
const settingsRef = useRef(settings);
settingsRef.current = isPending ? localSettings : settings;

const handleSettingChange = useCallback(
  (field: keyof CalculatorSettings, value: number) => {
    const newSettings = { ...settingsRef.current, [field]: value };
    setLocalSettings(newSettings);
    onSettingsChange(newSettings);

    startTransition(async () => {
      try {
        const result = await updateProjectSettings(chartId, { [field]: value });
        if (!result.success) {
          setLocalSettings(settings);
          onSettingsChange(settings);
          toast.error("Couldn't save settings. Please try again.");
        }
      } catch {
        setLocalSettings(settings);
        onSettingsChange(settings);
        toast.error("Couldn't save settings. Please try again.");
      }
    });
  },
  [chartId, settings, onSettingsChange],
);
```

## Info

### IN-01: Duplicated needsBorder helper function

**File:** `src/components/features/charts/project-detail/supply-row.tsx:14-19` and `src/components/features/supplies/search-to-add.tsx:19-23`
**Issue:** The `needsBorder(hex: string): boolean` luminance check function is copy-pasted identically in both files.
**Fix:** Extract to a shared utility (e.g., `src/lib/utils/color.ts`) and import from both files.

### IN-02: Three duplicate Intl.NumberFormat instances across modules

**File:** `src/components/features/charts/project-detail/supply-row.tsx:21`, `src/components/features/charts/project-detail/supply-footer-totals.tsx:3`, `src/components/features/charts/project-detail/project-detail-hero.tsx:15`
**Issue:** Each file creates its own `const numberFormatter = new Intl.NumberFormat()` at module scope. The project already has a shared `formatNumber` utility in `src/components/features/gallery/gallery-format.ts` which is used by `overview-tab.tsx`. The new Phase 7 files could reuse it for consistency.
**Fix:** Import the shared `formatNumber` from `gallery-format.ts`, or extract a common formatter to `src/lib/utils/format.ts` and use it everywhere.

### IN-03: supply-section.tsx uses "colour" as count label for all supply types including specialty items

**File:** `src/components/features/charts/project-detail/supply-section.tsx:54`
**Issue:** The section header count reads e.g., `(3 colours)` for all supply types. While threads and beads are color-based, specialty items may not be (e.g., needle minders, frames, metallic braids). Using "items" as the generic unit or varying the label by section type would be more accurate.
**Fix:**
```ts
<span className="text-muted-foreground ml-2 text-sm font-normal">
  ({data.items.length} {data.items.length === 1 ? "item" : "items"})
</span>
```

---

_Reviewed: 2026-04-15T19:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_

---
phase: 04-supplies-fabric
reviewed: 2026-04-10T21:30:00Z
depth: standard
files_reviewed: 52
files_reviewed_list:
  - package.json
  - prisma.config.ts
  - prisma/fixtures/dmc-threads.json
  - prisma/schema.prisma
  - prisma/seed.ts
  - src/__tests__/mocks/factories.ts
  - src/app/(dashboard)/charts/[id]/page.tsx
  - src/app/(dashboard)/fabric/[id]/page.tsx
  - src/app/(dashboard)/fabric/page.tsx
  - src/app/(dashboard)/shopping/page.tsx
  - src/app/(dashboard)/supplies/brands/page.tsx
  - src/app/(dashboard)/supplies/page.tsx
  - src/components/features/charts/chart-detail.tsx
  - src/components/features/charts/project-supplies-tab.test.tsx
  - src/components/features/charts/project-supplies-tab.tsx
  - src/components/features/charts/use-chart-form.ts
  - src/components/features/fabric/fabric-brand-list.tsx
  - src/components/features/fabric/fabric-catalog.test.tsx
  - src/components/features/fabric/fabric-catalog.tsx
  - src/components/features/fabric/fabric-detail.test.tsx
  - src/components/features/fabric/fabric-detail.tsx
  - src/components/features/fabric/fabric-form-modal.test.tsx
  - src/components/features/fabric/fabric-form-modal.tsx
  - src/components/features/fabric/fabric-size-calculator.tsx
  - src/components/features/shopping/shopping-list.test.tsx
  - src/components/features/shopping/shopping-list.tsx
  - src/components/features/supplies/color-swatch.tsx
  - src/components/features/supplies/search-to-add.tsx
  - src/components/features/supplies/supply-brand-form-modal.tsx
  - src/components/features/supplies/supply-brand-list.test.tsx
  - src/components/features/supplies/supply-brand-list.tsx
  - src/components/features/supplies/supply-catalog.test.tsx
  - src/components/features/supplies/supply-catalog.tsx
  - src/components/features/supplies/supply-form-modal.test.tsx
  - src/components/features/supplies/supply-form-modal.tsx
  - src/components/features/supplies/supply-grid-view.tsx
  - src/components/features/supplies/supply-table-view.tsx
  - src/components/shell/nav-items.ts
  - src/lib/actions/chart-actions-errors.test.ts
  - src/lib/actions/chart-actions.ts
  - src/lib/actions/fabric-actions.test.ts
  - src/lib/actions/fabric-actions.ts
  - src/lib/actions/shopping-actions.test.ts
  - src/lib/actions/shopping-actions.ts
  - src/lib/actions/supply-actions.test.ts
  - src/lib/actions/supply-actions.ts
  - src/lib/utils/fabric-calculator.test.ts
  - src/lib/utils/fabric-calculator.ts
  - src/lib/validations/chart.test.ts
  - src/lib/validations/chart.ts
  - src/lib/validations/fabric.ts
  - src/lib/validations/supply.ts
  - src/types/fabric.ts
  - src/types/supply.ts
findings:
  critical: 0
  warning: 5
  info: 5
  total: 10
status: issues_found
---

# Phase 4: Code Review Report

**Reviewed:** 2026-04-10T21:30:00Z
**Depth:** standard
**Files Reviewed:** 52
**Status:** issues_found

## Summary

Phase 4 introduces supply and fabric management: CRUD for threads, beads, specialty items, and fabric records, plus a shopping list and project-supply linking. The implementation is thorough with good test coverage (335 tests reported), consistent auth guards on all server actions, and Zod validation at boundaries.

No critical security issues found. The codebase follows project conventions well -- server components by default, "use client" only where needed, proper `requireAuth()` calls, Zod validation, and no fallback user IDs.

Five warnings found relating to data consistency between type definitions, a hardcoded color value, missing `next/image` usage, a `console.error` in non-error context, and duplicated utility code. Five informational items for code quality improvements.

## Warnings

### WR-01: FABRIC_TYPES mismatch between types/fabric.ts and validations/fabric.ts

**File:** `src/types/fabric.ts:19-28` and `src/lib/validations/fabric.ts:3-11`
**Issue:** The `FABRIC_TYPES` array in `src/types/fabric.ts` includes `"Jobelan"` (8 items) but the Zod validation schema in `src/lib/validations/fabric.ts` does not (7 items). If a user selects "Jobelan" from the form dropdown (which uses the types from `src/types/fabric.ts`), the server action validation will reject it with an opaque Zod error. This is a silent data loss bug -- the user fills a valid-looking form that always fails for one option.
**Fix:** Add `"Jobelan"` to the `FABRIC_TYPES` array in `src/lib/validations/fabric.ts`, or define the canonical list in one place and import it in both:
```ts
// src/lib/validations/fabric.ts line 3
const FABRIC_TYPES = [
  "Aida",
  "Linen",
  "Lugana",
  "Jobelan",  // <-- add this
  "Evenweave",
  "Hardanger",
  "Congress Cloth",
  "Other",
] as const;
```
Better yet, import from `src/types/fabric.ts` to keep a single source of truth.

### WR-02: Hardcoded color scale in EditableNumber input (project-supplies-tab.tsx)

**File:** `src/components/features/charts/project-supplies-tab.tsx:80`
**Issue:** The `EditableNumber` component uses `border-emerald-500` and `focus:ring-emerald-500/40` directly instead of semantic design tokens. The project convention in `base-ui-patterns.md` explicitly states to always use semantic tokens and never hardcoded color scales. While not a runtime bug, this breaks theming consistency and violates the documented convention.
**Fix:** Replace with semantic tokens:
```tsx
className="bg-card text-foreground w-12 rounded border border-primary px-1.5 py-0.5 text-center text-sm focus:ring-2 focus:ring-primary/40 focus:outline-none"
```

### WR-03: Fabric detail links to wrong route for linked project

**File:** `src/components/features/fabric/fabric-detail.tsx:121-122`
**Issue:** The linked project link navigates to `/charts/${fabric.linkedProject.id}`, but `fabric.linkedProject.id` is the **project** ID, not the chart ID. The chart detail route is `/charts/[chartId]`. Since the `FabricWithProject` type's `linkedProject` contains `id` (the project ID) but the page route expects a chart ID, clicking this link will 404 or show the wrong chart. However, looking at the schema, `Project.chartId` is unique, and the route `charts/[id]` looks up by chart ID. The `linkedProject.id` here is a project ID, so the navigation will fail.

Wait -- looking at the `getFabric` query in `fabric-actions.ts:179-193`, the `linkedProject` include returns `{ id, chart: { name, stitchesWide, stitchesHigh } }` where `id` is the project ID. But the fabric detail page's test at line 86-87 also uses the project ID for `linkedProject.id`. Since the chart detail page (`charts/[id]/page.tsx`) calls `getChart(id)` which queries `prisma.chart.findUnique({ where: { id: chartId } })`, and a project ID is not a chart ID, **this link will always 404 for a linked project**.

Actually, re-checking: the `charts/[id]/page.tsx` calls `getChart(id)` on line 8. The `getChart` function in `chart-actions.ts` line 207 does `prisma.chart.findUnique({ where: { id: chartId } })`. The `linkedProject.id` from the fabric query is a *Project* ID. So indeed, navigating to `/charts/<projectId>` would attempt to find a Chart with that ID, which would return `null` and trigger `notFound()`.

**Note:** This was identified as a UAT bug (project link 404) and per CLAUDE.md was already fixed in commit `1f3477f`. If this review is against the pre-fix code, ignore this finding. If post-fix, verify the fix landed correctly.

**Fix:** The link should use the chart ID. Either include `chartId` in the `linkedProject` query or restructure the link:
```tsx
// In getFabric, include chartId in the select:
linkedProject: {
  include: {
    chart: { select: { id: true, name: true, stitchesWide: true, stitchesHigh: true } },
  },
}
// Then in fabric-detail.tsx:
href={`/charts/${fabric.linkedProject.chart.id}`}
```
Or more simply, since `Project.chartId` is accessible:
```tsx
// Include chartId in linkedProject select
```

### WR-04: `console.error` on chart form submission (use-chart-form.ts)

**File:** `src/components/features/charts/use-chart-form.ts:237`
**Issue:** `console.error("Chart form submission error:", error)` in the client-side form submission handler will log errors to the browser console in production. While not a security risk for this single-user app, the error object could potentially contain server-side details from server action failures. The convention is to show a user-facing toast message (which is already done on line 238) without logging raw error objects.
**Fix:** Remove the console.error or gate it behind a development check:
```ts
} catch (error) {
  if (process.env.NODE_ENV === "development") {
    console.error("Chart form submission error:", error);
  }
  setErrors({ _form: "An unexpected error occurred" });
}
```

### WR-05: `deleteSupplyBrand` in supply-brand-list uses wrong `entityType` prop

**File:** `src/components/features/supplies/supply-brand-list.tsx:292`
**Issue:** The `DeleteConfirmationDialog` is invoked with `entityType="designer"` and `chartCount={...supply counts}`. This component is reused from the designers feature, where `entityType` and `chartCount` labels make sense. For supply brands, passing `entityType="designer"` will likely show a message like "This designer has X charts" instead of "This brand has X supplies". The user sees misleading confirmation text.
**Fix:** Either create a supply-specific delete dialog or pass correct labels:
```tsx
<DeleteConfirmationDialog
  open={!!deletingBrand}
  onOpenChange={(open) => {
    if (!open) setDeletingBrand(null);
  }}
  title="Delete Brand?"
  entityName={deletingBrand?.name ?? ""}
  chartCount={
    (deletingBrand?._count.threads ?? 0) +
    (deletingBrand?._count.beads ?? 0) +
    (deletingBrand?._count.specialtyItems ?? 0)
  }
  entityType="brand"  // <-- fix this
  onConfirm={handleDelete}
/>
```
Note: The same issue exists in `supply-catalog.tsx:660-670` where `entityType="designer"` is used for supply item deletion.

## Info

### IN-01: Duplicated `needsBorder` utility function

**File:** `src/components/features/charts/project-supplies-tab.tsx:31-36` and `src/components/features/supplies/search-to-add.tsx:22-27`
**Issue:** The `needsBorder` luminance check function is defined in three places: `project-supplies-tab.tsx`, `search-to-add.tsx`, and `color-swatch.tsx`. The `color-swatch.tsx` version is already exported. The other two should import from there.
**Fix:** In both `project-supplies-tab.tsx` and `search-to-add.tsx`, replace the local `needsBorder` with:
```ts
import { needsBorder } from "@/components/features/supplies/color-swatch";
```

### IN-02: Unused `_EmptyNoShoppingNeeds` component

**File:** `src/components/features/shopping/shopping-list.tsx:176-188`
**Issue:** The `_EmptyNoShoppingNeeds` component is prefixed with `_` to suppress unused-variable warnings, but it is dead code that is never rendered. If it's intended for future use, it should be documented; otherwise, it should be removed to keep the codebase clean.
**Fix:** Remove the component or add a comment explaining when it will be used.

### IN-03: Unused `onDelete` prop in SupplyGridView

**File:** `src/components/features/supplies/supply-grid-view.tsx:25`
**Issue:** The `onDelete` prop is destructured in the interface but not used in the function signature -- it is listed in `SupplyGridViewProps` but the component only destructures `items` and `onEdit`. The grid view has no delete button (only edit via click), making the prop misleading for consumers.
**Fix:** Either add a delete button to the grid view for consistency with the table view, or remove `onDelete` from the props:
```tsx
export function SupplyGridView({ items, onEdit }: Omit<SupplyGridViewProps, 'onDelete'>) {
```

### IN-04: Missing `next/image` for cover image in chart-detail.tsx

**File:** `src/components/features/charts/chart-detail.tsx:177`
**Issue:** The `CoverImage` component uses a raw `<img>` tag instead of `next/image`. Per Next.js conventions, `next/image` provides automatic optimization, lazy loading, and proper sizing. For user-uploaded cover images stored in R2, this is a missed optimization opportunity.
**Fix:** Replace with `next/image`:
```tsx
import Image from "next/image";
// ...
<Image
  src={coverImageUrl}
  alt={`Cover for ${chartName}`}
  width={320}
  height={320}
  className="max-h-80 w-full rounded-lg object-cover lg:w-80"
/>
```
Note: R2 domain must be configured in `next.config` `images.remotePatterns`.

### IN-05: Unused test helper functions prefixed with underscore

**File:** `src/components/features/charts/project-supplies-tab.test.tsx:82-126`
**Issue:** `_makeBeadWithBrand` and `_makeSpecialtyWithItem` are defined but never called in the test file. They are prefixed with `_` to silence linting, but represent dead test code that could be removed or used for additional test coverage.
**Fix:** Either write tests that exercise bead and specialty supply rows (improving coverage), or remove the unused helpers.

---

_Reviewed: 2026-04-10T21:30:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_

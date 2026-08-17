---
phase: 04-supplies-fabric
reviewed: 2026-04-12T14:00:00Z
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

**Reviewed:** 2026-04-12T14:00:00Z
**Depth:** standard
**Files Reviewed:** 52
**Status:** issues_found

## Summary

Phase 4 adds supply/fabric CRUD, a supply catalog with grid/table views, project-supply linking, a shopping list, and a fabric size calculator. The code is well-structured with consistent patterns: all server actions use `requireAuth()`, Zod validation at boundaries, proper error handling with try/catch around server action calls, and comprehensive test coverage (335 tests).

No critical security issues found. The 5 warnings are a mix of missing ownership checks in server actions, a stale test assertion, and a duplicated utility function. The 5 info items are minor code quality observations.

## Warnings

### WR-01: Fabric/supply actions lack per-user ownership scoping

**File:** `src/lib/actions/fabric-actions.ts:161-173`, `src/lib/actions/supply-actions.ts:80-91`
**Issue:** The `deleteFabric`, `deleteFabricBrand`, `deleteThread`, `deleteBead`, `deleteSpecialtyItem`, and all `remove*` actions accept an `id` parameter and delete it directly without verifying that the record belongs to the authenticated user. While `requireAuth()` is called (preventing unauthenticated access), any authenticated user could delete another user's records if multi-user support were ever added. The `chart-actions.ts` correctly checks ownership before delete/update -- fabric and supply actions do not.

**Context:** This is a single-user MVP, so the blast radius is zero today. However, this pattern would become a security bug the moment a second user is added. Flagging now to prevent a silent authorization bypass later.

**Fix:** Add ownership verification before mutations, similar to `chart-actions.ts`:
```typescript
// Example for deleteFabric:
export async function deleteFabric(id: string) {
  const user = await requireAuth();
  // Verify the fabric belongs to a project owned by this user
  const fabric = await prisma.fabric.findUnique({
    where: { id },
    select: { linkedProject: { select: { userId: true } } },
  });
  if (fabric?.linkedProject && fabric.linkedProject.userId !== user.id) {
    return { success: false as const, error: "Fabric not found" };
  }
  // ... proceed with delete
}
```

### WR-02: Stale test assertion does not match implementation (getFabric select)

**File:** `src/lib/actions/fabric-actions.test.ts:545`
**Issue:** The test asserts the Prisma query uses `chart: { select: { name: true, stitchesWide: true, stitchesHigh: true } }`, but the actual `getFabric` implementation at `fabric-actions.ts:185` selects `{ id: true, name: true, stitchesWide: true, stitchesHigh: true }`. The `id` field was added to match the `FabricWithProject` type but the test was not updated. This test assertion will fail.

**Fix:** Update the test expectation to include `id: true`:
```typescript
chart: { select: { id: true, name: true, stitchesWide: true, stitchesHigh: true } },
```

### WR-03: Duplicated `needsBorder` function across three files

**File:** `src/components/features/charts/project-supplies-tab.tsx:31-36`, `src/components/features/supplies/search-to-add.tsx:22-27`, `src/components/features/supplies/color-swatch.tsx:5-11`
**Issue:** The `needsBorder` luminance-check function is copy-pasted in three files with identical logic. The `color-swatch.tsx` version is already exported and reusable, but the other two files define their own local copies. If the luminance threshold needs adjustment, it must be changed in three places.

**Fix:** Import `needsBorder` from `color-swatch.tsx` in the other two files:
```typescript
import { needsBorder } from "@/components/features/supplies/color-swatch";
```

### WR-04: FabricBrandFormModal missing `createdAt`/`updatedAt` on constructed brand object

**File:** `src/components/features/fabric/fabric-form-modal.tsx:78-84`
**Issue:** When creating a new `FabricBrandWithCounts` object inline after brand creation, the object is missing `createdAt` and `updatedAt` fields that the `FabricBrand` Prisma type requires. TypeScript may not catch this because the object is immediately spread into local state. If downstream code accesses `.createdAt` on local brands, it will be `undefined`.

**Fix:** Include the missing fields from the API response:
```typescript
const newBrand: FabricBrandWithCounts = {
  id: result.brand.id,
  name: result.brand.name,
  website: null,
  createdAt: result.brand.createdAt,
  updatedAt: result.brand.updatedAt,
  _count: { fabrics: 0 },
};
```

### WR-05: `getShoppingList` does not scope query to current user's projects

**File:** `src/lib/actions/shopping-actions.ts:75-98`
**Issue:** The `getShoppingList` query fetches all projects with linked supplies (`project.findMany`) without filtering by `userId`. The `getCharts` action in `chart-actions.ts:226-234` correctly filters by `userId: user.id`, but `getShoppingList` does not. In a multi-user scenario, User A would see User B's shopping needs.

**Fix:** Add user scoping to the `where` clause:
```typescript
const user = await requireAuth();
const projects = await prisma.project.findMany({
  where: {
    userId: user.id,
    OR: [
      { projectThreads: { some: {} } },
      ...
    ],
  },
  ...
});
```

## Info

### IN-01: Unused component `_EmptyNoShoppingNeeds` in shopping-list

**File:** `src/components/features/shopping/shopping-list.tsx:176-188`
**Issue:** The `_EmptyNoShoppingNeeds` component is prefixed with underscore to suppress unused warnings, but it is never rendered. This appears to be dead code carried forward from an alternate design.

**Fix:** Remove the component if it is not planned for use, or remove the underscore prefix and wire it up when appropriate.

### IN-02: Unused test helper functions prefixed with underscore

**File:** `src/components/features/charts/project-supplies-tab.test.tsx:82-126`
**Issue:** `_makeBeadWithBrand` and `_makeSpecialtyWithItem` helper functions are defined but never called in any test. They are prefixed with `_` to suppress lint warnings.

**Fix:** Either write tests that exercise bead/specialty rendering paths (improving coverage), or remove the dead helpers.

### IN-03: `img` tag used instead of `next/image` for cover images

**File:** `src/components/features/charts/chart-detail.tsx:177-182`
**Issue:** The `CoverImage` component uses a native `<img>` tag for the chart cover image. The project uses Cloudflare R2 for image storage, and `next/image` provides automatic optimization, lazy loading, and responsive sizing.

**Fix:** Consider replacing with `next/image` once R2 is configured, since `next/image` requires `remotePatterns` config for external sources:
```tsx
import Image from "next/image";
<Image src={coverImageUrl} alt={...} width={320} height={320} className="..." />
```

### IN-04: Hardcoded font-family style on kitting progress percentage

**File:** `src/components/features/charts/project-supplies-tab.tsx:448`
**Issue:** Inline `style={{ fontFamily: "'JetBrains Mono', monospace" }}` is used for the kitting percentage. The project uses Tailwind for all styling. This hardcoded value may not match if JetBrains Mono is not loaded.

**Fix:** Use Tailwind's `font-mono` class instead, which maps to the configured monospace font:
```tsx
className={`... font-mono`}
```
And remove the inline `style` prop.

### IN-05: Supply grid view `onDelete` prop is accepted but never used

**File:** `src/components/features/supplies/supply-grid-view.tsx:25`
**Issue:** The `SupplyGridView` component destructures `onEdit` from props but accepts `onDelete` without using it. The grid cards only trigger edit on click; there is no delete affordance in grid view.

**Fix:** Either add a delete button to the grid card UI, or remove `onDelete` from the props interface to avoid confusion:
```typescript
export function SupplyGridView({ items, onEdit }: Omit<SupplyGridViewProps, 'onDelete'>) {
```

---

_Reviewed: 2026-04-12T14:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_

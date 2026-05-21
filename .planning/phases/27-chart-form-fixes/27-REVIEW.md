---
phase: 27-chart-form-fixes
reviewed: 2026-05-21T03:12:11Z
depth: standard
files_reviewed: 13
files_reviewed_list:
  - src/__tests__/mocks/factories.ts
  - src/app/(dashboard)/charts/[id]/edit/edit-client.tsx
  - src/app/(dashboard)/charts/[id]/edit/page.tsx
  - src/components/features/charts/chart-merged-form.test.tsx
  - src/components/features/charts/chart-merged-form.tsx
  - src/components/features/charts/form-primitives/searchable-select.test.tsx
  - src/components/features/charts/form-primitives/searchable-select.tsx
  - src/components/features/charts/form-primitives/stitch-count-fields.test.tsx
  - src/components/features/charts/form-primitives/stitch-count-fields.tsx
  - src/components/features/designers/designer-detail.tsx
  - src/components/features/supply-table/supply-table.tsx
  - src/lib/actions/designer-actions.ts
  - src/types/designer.ts
findings:
  critical: 1
  warning: 3
  info: 0
  total: 4
status: issues_found
---

# Phase 27: Code Review Report

**Reviewed:** 2026-05-21T03:12:11Z
**Depth:** standard
**Files Reviewed:** 13
**Status:** issues_found

## Summary

Phase 27 implements five fixes: designer inline creation dialog wiring (BUG-01), tab-to-type focus for SearchableSelect (BUG-02), supply stitch total hint on StitchCountFields (BUG-05), designer detail thumbnails falling back to cover image (BUG-04), and Need column width adjustment (BUG-06).

The changes are generally well-structured. The designer dialog wiring is clean, the type-to-search keyboard handler is solid, and the stitch total hint has proper ARIA support. However, there is a column width inconsistency across the supply table that will cause visual misalignment in the add row and data row, a duplicated HTML `id` across multiple SearchableSelect instances, and a missing userId-scoped authorization in the raw prisma query on the edit page.

## Critical Issues

### CR-01: Supply table column widths inconsistent between header and body rows

**File:** `src/components/features/supply-table/supply-table.tsx:166-179`
**Issue:** The header `<th>` widths were changed from `44%` -> `41%` (Colour) and `13%` -> `16%` (Need), but the corresponding `<td>` elements in `supply-table-add-row.tsx` (lines 39, 77, 162, 255) and `supply-table-data-row.tsx` (lines 39, 77) still reference the old `44%` and `13%` widths in both inline styles and comments. With `table-layout: fixed`, the `<th>` widths in `<thead>` govern column sizing, so the body `<td>` inline styles are overridden -- meaning the visual result may be correct. However, the add row explicitly sets `style={{ width: "44%" }}` and `style={{ width: "13%" }}` on its cells, and if the table layout algorithm uses the *first row* in `<tbody>` (the add row) rather than the `<thead>`, the columns will misalign. The HTML spec for `table-layout: fixed` uses the first row of the **table** (including `<thead>`) for column widths, so `<th>` should win. But this split creates a maintenance trap: future edits to either file could introduce real visual bugs if someone trusts the `<td>` width values as source of truth.

**Fix:** Update `supply-table-add-row.tsx` and `supply-table-data-row.tsx` to match the new header widths, or remove the redundant inline `style` attributes from body `<td>` elements entirely (since `table-layout: fixed` ignores them):

```tsx
// supply-table-add-row.tsx line 39 comment + line 162
{/* Cell 1: Type toggle + Search/Selected item (41%) */}
<td className="px-2 py-1.5" style={{ width: "41%" }}>

// supply-table-add-row.tsx line 77 comment + line 255
{/* Cell 4: Need (16%) */}
<td className="px-2 py-1.5" style={{ width: "16%" }}>

// supply-table-data-row.tsx line 39 comment
{/* Column 1 - Colour (41%) */}

// supply-table-data-row.tsx line 77 comment
{/* Column 4 - Need (16%) */}
```

## Warnings

### WR-01: Duplicate HTML `id` across multiple SearchableSelect instances

**File:** `src/components/features/charts/form-primitives/searchable-select.tsx:41`
**Issue:** `listboxId` is hardcoded to `"searchable-select-listbox"`. The chart form renders 3 SearchableSelect instances (designer, storage location, stitching app), creating 3 elements with the same `id` in the DOM. This violates the HTML spec (ids must be unique) and breaks `aria-controls` semantics -- screen readers cannot determine which listbox is referenced by each combobox trigger.

**Fix:** Generate a unique id per instance using React's `useId()` hook:

```tsx
import { useId } from "react";

export function SearchableSelect(/* ... */) {
  const instanceId = useId();
  const listboxId = `searchable-select-listbox-${instanceId}`;
  // ...
}
```

### WR-02: Raw prisma query in edit page bypasses action-layer authorization pattern

**File:** `src/app/(dashboard)/charts/[id]/edit/page.tsx:29-36`
**Issue:** The `supplyStitchTotal` query uses `prisma.projectThread.aggregate()` directly, bypassing the server-action authorization pattern established in the codebase (every data access goes through an action that calls `requireAuth()` and scopes by `userId`). While this specific case is safe because `getChart(id)` already verified ownership and the page short-circuits with `notFound()` on failure, the pattern violates the project convention that all data access flows through auth-guarded server actions. If someone copies this pattern elsewhere without the upstream ownership check, it becomes a real authorization bypass.

**Fix:** Extract the aggregate query into a server action in `supply-actions.ts` (or `chart-actions.ts`), or at minimum add a comment documenting why this raw query is safe:

```tsx
// Safe: getChart() above already verified userId ownership of this project.
// The projectId used here comes from that verified chart, not from user input.
const supplyStitchTotal = chart.project
  ? (await prisma.projectThread.aggregate({
      where: { projectId: chart.project.id },
      _sum: { stitchCount: true },
    }))._sum.stitchCount ?? 0
  : 0;
```

Or better, create a dedicated action:

```ts
// In supply-actions.ts or chart-actions.ts
export async function getProjectThreadStitchTotal(projectId: string): Promise<number> {
  await requireAuth();
  const result = await prisma.projectThread.aggregate({
    where: { projectId },
    _sum: { stitchCount: true },
  });
  return result._sum.stitchCount ?? 0;
}
```

### WR-03: `handleTriggerKeyDown` does not prevent Space key from opening popover as a typed character

**File:** `src/components/features/charts/form-primitives/searchable-select.tsx:45-51`
**Issue:** The `e.key.length === 1` heuristic treats Space (" ") as a printable character, which means pressing Space while the trigger is focused will open the popover and set the search to a single space character. On combobox triggers, Space is conventionally used to open/close the dropdown (same as Enter), not to type a space character. This could confuse users who press Space expecting toggle behavior and instead get a search with a leading space.

**Fix:** Exclude Space from the printable character forwarding:

```tsx
const handleTriggerKeyDown = (e: React.KeyboardEvent) => {
  if (e.key.length === 1 && e.key !== " " && !e.ctrlKey && !e.metaKey && !e.altKey) {
    e.preventDefault();
    setOpen(true);
    setSearch(e.key);
  }
};
```

---

_Reviewed: 2026-05-21T03:12:11Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_

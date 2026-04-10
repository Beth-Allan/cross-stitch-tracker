---
phase: 03-designer-genre-pages
reviewed: 2026-04-08T23:10:09Z
depth: standard
files_reviewed: 27
files_reviewed_list:
  - prisma/schema.prisma
  - src/__tests__/mocks/factories.ts
  - src/app/(dashboard)/designers/[id]/page.tsx
  - src/app/(dashboard)/designers/page.tsx
  - src/app/(dashboard)/genres/[id]/page.tsx
  - src/app/(dashboard)/genres/page.tsx
  - src/components/features/designers/delete-confirmation-dialog.test.tsx
  - src/components/features/designers/delete-confirmation-dialog.tsx
  - src/components/features/designers/designer-detail.test.tsx
  - src/components/features/designers/designer-detail.tsx
  - src/components/features/designers/designer-form-modal.test.tsx
  - src/components/features/designers/designer-form-modal.tsx
  - src/components/features/designers/designer-list.test.tsx
  - src/components/features/designers/designer-list.tsx
  - src/components/features/genres/genre-detail.test.tsx
  - src/components/features/genres/genre-detail.tsx
  - src/components/features/genres/genre-form-modal.test.tsx
  - src/components/features/genres/genre-form-modal.tsx
  - src/components/features/genres/genre-list.test.tsx
  - src/components/features/genres/genre-list.tsx
  - src/components/shell/nav-items.ts
  - src/lib/actions/designer-actions.test.ts
  - src/lib/actions/designer-actions.ts
  - src/lib/actions/genre-actions.test.ts
  - src/lib/actions/genre-actions.ts
  - src/lib/validations/chart.ts
  - src/types/designer.ts
  - src/types/genre.ts
findings:
  critical: 0
  warning: 4
  info: 4
  total: 8
status: issues_found
---

# Phase 3: Code Review Report

**Reviewed:** 2026-04-08T23:10:09Z
**Depth:** standard
**Files Reviewed:** 27
**Status:** issues_found

## Summary

Phase 3 introduces Designer and Genre list/detail pages, server actions, Zod validation schemas, type definitions, a shared `DeleteConfirmationDialog`, and test factories. The code is well-structured: auth guards are consistently applied before all mutations and reads, Zod validation uses `.trim().min(1)` per project convention, error handling covers P2002 (unique constraint) gracefully, and pages correctly use the Next.js 15+ async `params` pattern.

Four warnings found: a delete-dialog contract bug where the dialog always closes even on failure (affecting all four delete flows), silent 404s masking 500-class database errors in read actions, a misleading sortable column that falls back to wrong data, and a schema validation gap for empty website strings. Four info items cover code duplication, hardcoded color scales, a fragile test import pattern, and schema file organization.

No critical or security issues found. Auth, input validation, and error boundaries are solid.

## Warnings

### WR-01: DeleteConfirmationDialog always closes on delete failure

**File:** `src/components/features/designers/delete-confirmation-dialog.tsx:35-44`
**Also affects:** `src/components/features/designers/designer-detail.tsx:104-116`, `src/components/features/designers/designer-list.tsx:75-88`, `src/components/features/genres/genre-detail.tsx:100-112`, `src/components/features/genres/genre-list.tsx:253-266`

**Issue:** The `DeleteConfirmationDialog` only keeps the dialog open if `onConfirm` throws (via the catch block at line 40). However, all four callers (`DesignerDetail.handleDelete`, `DesignerList.handleDelete`, `GenreDetail.handleDelete`, `GenreList.handleDeleteConfirmed`) catch their own errors internally and call `toast.error()` without re-throwing. Since `onConfirm` always resolves successfully (never throws), `onOpenChange(false)` at line 39 executes unconditionally -- the dialog closes even when the delete fails. The user sees the dialog disappear and then a toast error, losing the ability to retry from the dialog.

**Fix:** Either change the callers to re-throw on failure so the dialog's catch block can keep it open:

```tsx
// In designer-detail.tsx handleDelete:
async function handleDelete() {
  const result = await deleteDesigner(designer.id);
  if (result.success) {
    toast.success("Designer deleted");
    router.push("/designers");
  } else {
    toast.error(result.error ?? "Something went wrong. Please try again.");
    throw new Error("Delete failed"); // keeps dialog open
  }
}
```

Or change the contract so `onConfirm` returns a success boolean:

```tsx
// In delete-confirmation-dialog.tsx:
onConfirm: () => Promise<boolean>;

function handleConfirm() {
  startTransition(async () => {
    try {
      const success = await onConfirm();
      if (success) onOpenChange(false);
    } catch {
      // dialog stays open for retry
    }
  });
}
```

Apply whichever pattern to all four callers consistently.

### WR-02: getDesigner and getGenre return null on DB errors, causing 404s for 500-class conditions

**File:** `src/lib/actions/designer-actions.ts:170-173` and `src/lib/actions/genre-actions.ts:133-136`

**Issue:** Both read functions catch all errors and `return null`. The calling pages (`designers/[id]/page.tsx:12`, `genres/[id]/page.tsx:12`) treat `null` as "not found" and call `notFound()`, returning a 404. A database connection failure, Prisma timeout, or any unexpected exception produces a 404 page instead of triggering the error boundary (500). This makes production debugging harder -- a DB outage looks like missing records.

**Fix:** Re-throw non-expected errors so Next.js renders the error boundary. Use `unstable_rethrow` to preserve Next.js internal errors (redirects, notFound):

```ts
import { unstable_rethrow } from "next/navigation";

export async function getDesigner(id: string): Promise<DesignerDetail | null> {
  await requireAuth();
  try {
    const designer = await prisma.designer.findUnique({ /* ... */ });
    if (!designer) return null;
    // ... map and return
  } catch (error) {
    unstable_rethrow(error);
    console.error("getDesigner error:", error);
    throw error; // let error boundary handle DB failures
  }
}
```

Apply the same pattern to `getGenre`.

### WR-03: DesignerList "FINISHED" column is sortable but sorts by chartCount

**File:** `src/components/features/designers/designer-list.tsx:106-113`

**Issue:** `SortKey` includes `"projectsFinished"` and the "FINISHED" column is rendered as a `SortableHeader`. However, `DesignerWithStats` has no `projectsFinished` field. The sort case at line 112 falls back to sorting by `chartCount` with a comment acknowledging this. The column also displays only an em-dash for every row (line 348-349). Users can click "FINISHED" to sort, but the result is identical to sorting by "CHARTS" -- silently misleading.

**Fix:** Remove "FINISHED" from `SortKey` and render the STARTED/FINISHED columns as non-sortable plain headers (since the data isn't available at list level), or remove the columns entirely since the detail page provides this information:

```tsx
type SortKey = "name" | "chartCount";
// Remove the SortableHeader for FINISHED, use a plain <th> or remove the column
```

### WR-04: designerSchema website field rejects empty string instead of treating it as null

**File:** `src/lib/validations/chart.ts:61`

**Issue:** The schema `website: z.string().url("Must be a valid URL").nullable().default(null)` rejects `""` (empty string) with "Must be a valid URL" because `.url()` runs before `.nullable()`. The form UI currently converts empty strings to `null` before calling the action (line 70 of `designer-form-modal.tsx`), so this doesn't affect the UI path. However, any direct server action call (e.g., from future API routes or other callers) with `website: ""` gets a confusing validation error instead of graceful null coercion.

**Fix:** Add a preprocess step to convert empty strings to null at the schema level:

```ts
website: z.preprocess(
  (val) => (val === "" ? null : val),
  z.string().url("Must be a valid URL").nullable().default(null)
),
```

## Info

### IN-01: STATUS_ORDER and formatNumber duplicated across designer-detail and genre-detail

**File:** `src/components/features/designers/designer-detail.tsx:33-47` and `src/components/features/genres/genre-detail.tsx:29-43`

**Issue:** `STATUS_ORDER` (a record mapping statuses to sort order) and `formatNumber` (an `Intl.NumberFormat` wrapper) are defined identically in both files. The entire `ChartRow` sub-component is also nearly identical between the two detail pages.

**Fix:** Extract to a shared utility like `src/lib/utils/chart-display.ts` and import in both components. Consider extracting the duplicated `ChartRow` into a shared component as well.

### IN-02: Hardcoded color scales in detail component sort pills and genre badge

**File:** `src/components/features/designers/designer-detail.tsx:190,222` and `src/components/features/genres/genre-detail.tsx:185`

**Issue:** Sort pill active state uses `bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400`. The Top Genre badge uses `border-amber-200 bg-amber-50 text-amber-700 dark:...`. Per `base-ui-patterns.md` and `component-implementation.md`, the project convention is to use semantic design tokens only -- never hardcoded color scales.

**Fix:** Replace with semantic tokens. For example, active sort pill: `bg-primary/10 text-primary font-semibold`. For the genre badge: `bg-accent text-accent-foreground border-accent`. Coordinate with the design spec for intended appearance.

### IN-03: Top-level await import in genre-form-modal.test.tsx

**File:** `src/components/features/genres/genre-form-modal.test.tsx:33`

**Issue:** `const { createGenre, updateGenre } = await import("@/lib/actions/genre-actions");` runs at the module top level, outside any `describe` or `it` block. While this works due to Vitest's `vi.mock` hoisting, it's inconsistent with other test files in this phase (which reference mock functions directly) and is more fragile if the mock setup changes.

**Fix:** Use the same pattern as the designer tests -- define `const mockCreateGenre = vi.fn()` at module level, reference it in the `vi.mock` factory, and use it directly in assertions.

### IN-04: designerSchema and genreSchema live in chart.ts

**File:** `src/lib/validations/chart.ts:59-71`

**Issue:** Designer and genre validation schemas are appended to the chart validation file. As validation complexity grows, these are better placed alongside their respective domain types.

**Fix:** Move to `src/lib/validations/designer.ts` and `src/lib/validations/genre.ts`. Update imports in the respective action files.

---

_Reviewed: 2026-04-08T23:10:09Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_

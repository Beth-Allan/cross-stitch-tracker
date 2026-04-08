---
phase: 03-designer-genre-pages
reviewed: 2026-04-08T00:00:00Z
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
  warning: 6
  info: 4
  total: 10
status: issues_found
---

# Phase 3: Code Review Report

**Reviewed:** 2026-04-08
**Depth:** standard
**Files Reviewed:** 27
**Status:** issues_found

## Summary

Phase 3 introduces the Designer and Genre list/detail pages, server actions, validations, types, and a reusable `DeleteConfirmationDialog`. The auth guard, Zod validation, and revalidation patterns are consistently applied. The action tests are well-structured and cover auth, happy path, validation errors, and DB error cases.

Six bugs were found: the most impactful is that the delete button in `DesignerList` has no click handler — delete is entirely non-functional from the designers list page. `GenreList` implements delete via `window.confirm()`, which is inconsistent with the `DeleteConfirmationDialog` used on the detail pages and untestable in JSDOM. There are also two silent-failure traps: DB errors in `getDesigner`/`getGenre` surface as 404s, and the `DeleteConfirmationDialog` always closes on error.

Four info-level items cover code duplication, a misplaced test import, and schema file organization.

---

## Warnings

### WR-01: Delete button in DesignerList/DesignerCard has no onClick handler

**File:** `src/components/features/designers/designer-list.tsx:331` and `src/components/features/designers/designer-list.tsx:383`

**Issue:** Both `DesignerRow` and `DesignerCard` render a Trash2 delete button with no `onClick` prop. Clicking the delete button from the designers list page does nothing. `DeleteConfirmationDialog` is not wired up here at all, even though it exists and is used correctly in `DesignerDetail`. The `DesignerRow` and `DesignerCard` components accept no `onDelete` callback.

**Fix:** Pass `onDelete` to `DesignerRow` and `DesignerCard` the same way `onEdit` is passed, and wire up `DeleteConfirmationDialog` in `DesignerList` the same way `GenreList` does. The simplest approach mirrors what `GenreList` does — hold `deletingDesigner` state, open the dialog, and call `deleteDesigner` on confirm:

```tsx
// In DesignerRow / DesignerCard props:
onDelete: () => void;

// In DesignerList state:
const [deletingDesigner, setDeletingDesigner] = useState<DesignerWithStats | null>(null);

async function handleDelete(designer: DesignerWithStats) {
  try {
    const result = await deleteDesigner(designer.id);
    if (result.success) {
      toast.success("Designer deleted");
      router.refresh();
    } else {
      toast.error(result.error ?? "Something went wrong. Please try again.");
    }
  } catch {
    toast.error("Something went wrong. Please try again.");
  }
}

// In JSX, add:
<DeleteConfirmationDialog
  open={!!deletingDesigner}
  onOpenChange={(open) => { if (!open) setDeletingDesigner(null); }}
  title="Delete Designer?"
  entityName={deletingDesigner?.name ?? ""}
  chartCount={deletingDesigner?.chartCount ?? 0}
  entityType="designer"
  onConfirm={() => handleDelete(deletingDesigner!)}
/>
```

The test file (`designer-list.test.tsx`) only tests that delete buttons render with aria-labels — it does not test that clicking them triggers a delete, so the bug is not caught by existing tests. A test for the click-to-delete flow should be added.

---

### WR-02: GenreList uses window.confirm instead of DeleteConfirmationDialog

**File:** `src/components/features/genres/genre-list.tsx:251-271`

**Issue:** `GenreList.handleDelete` calls `window.confirm(...)` directly before invoking `deleteGenre`. This is inconsistent with `GenreDetail` (which uses `DeleteConfirmationDialog`) and with the planned `DesignerList` behavior. `window.confirm` is a blocking browser dialog, does not render in JSDOM, and is untestable. The existing test suite does not include a test for clicking delete and confirming — it would silently pass without exercising the confirm path.

**Fix:** Replace the `window.confirm` pattern with `DeleteConfirmationDialog`, same as `GenreDetail` uses:

```tsx
const [deletingGenre, setDeletingGenre] = useState<GenreWithStats | null>(null);

async function handleDeleteConfirmed() {
  if (!deletingGenre) return;
  try {
    const result = await deleteGenre(deletingGenre.id);
    if (result.success) {
      toast.success("Genre deleted");
      router.refresh();
    } else {
      toast.error(result.error ?? "Something went wrong. Please try again.");
    }
  } catch {
    toast.error("Something went wrong. Please try again.");
  }
}

// Pass onDelete={() => setDeletingGenre(genre)} to GenreRow/GenreCard
// Add DeleteConfirmationDialog to JSX
```

---

### WR-03: getDesigner and getGenre return null on DB errors, causing 404s for 500 conditions

**File:** `src/lib/actions/designer-actions.ts:170-173` and `src/lib/actions/genre-actions.ts:133-136`

**Issue:** Both `getDesigner` and `getGenre` catch all errors and `return null`. The calling pages treat `null` as "not found" and call `notFound()`, which returns a 404. A database connection failure, a Prisma client error, or any unexpected exception will produce a 404 page rather than an error page. This makes it impossible to distinguish "record does not exist" from "the database is down."

**Fix:** Re-throw non-"not found" errors so Next.js can render the appropriate error boundary (via `error.tsx` or `global-error.tsx`), or use `unstable_rethrow` for Next.js internal errors:

```ts
import { unstable_rethrow } from "next/navigation";

export async function getDesigner(id: string): Promise<DesignerDetail | null> {
  await requireAuth();
  try {
    const designer = await prisma.designer.findUnique({ ... });
    if (!designer) return null;
    // ... map and return
  } catch (error) {
    unstable_rethrow(error); // re-throws Next.js redirect/notFound errors
    console.error("getDesigner error:", error);
    throw error; // let the error boundary handle it
  }
}
```

The same pattern applies to `getGenre`.

---

### WR-04: DeleteConfirmationDialog always closes after onConfirm, even on error

**File:** `src/components/features/designers/delete-confirmation-dialog.tsx:35-39`

**Issue:** `handleConfirm` unconditionally calls `onOpenChange(false)` after awaiting `onConfirm()`. If `onConfirm` throws, the dialog closes before the caller's error handler shows a toast. The user sees the dialog disappear and then a toast error — they cannot retry from the dialog. If `onConfirm` resolves but the caller's own error handling shows a failure message, the dialog has already closed.

```tsx
// Current — closes unconditionally
function handleConfirm() {
  startTransition(async () => {
    await onConfirm();
    onOpenChange(false); // runs even if onConfirm throws
  });
}
```

**Fix:** Only close the dialog on success, and let the caller handle the error UI:

```tsx
function handleConfirm() {
  startTransition(async () => {
    try {
      await onConfirm();
      onOpenChange(false);
    } catch {
      // onConfirm handles its own error reporting; dialog stays open for retry
    }
  });
}
```

This requires the calling `handleDelete` functions to throw on error rather than swallowing it — or alternatively, `onConfirm` returns a boolean indicating success. The current callers (`DesignerDetail.handleDelete`, `GenreDetail.handleDelete`) catch internally and show toasts, so they never throw — meaning the dialog always closes anyway. A cleaner contract would be to have `onConfirm` return `{ success: boolean }` and have the dialog conditionally close only on `success: true`.

---

### WR-05: DesignerList "STARTED" and "FINISHED" columns display only em-dash — data is unavailable

**File:** `src/components/features/designers/designer-list.tsx:309-314`

**Issue:** `DesignerWithStats` does not include `projectsStarted` or `projectsFinished` fields. Both the "STARTED" and "FINISHED" columns in `DesignerRow` hard-code `&mdash;` with no value. The "FINISHED" column is also a sortable header (`SortKey = "name" | "chartCount" | "projectsFinished"`) but sorting by it falls back to `chartCount` with a code comment acknowledging this. Users can click the "FINISHED" sort header but the sort behavior is incorrect — it sorts by chart count, not finished count.

**Fix (two options):**

Option A — Remove the STARTED/FINISHED columns from the list view since that data isn't available at the list level. Simplify `SortKey` to `"name" | "chartCount"` and remove the misleading sort option.

Option B — Extend `DesignerWithStats` and `getDesignersWithStats` to include these stats (adds a `project` join at query time). This is the right long-term answer but has a performance cost at scale.

Option A is recommended for now — the detail page shows the full stats. The comment at line 93 confirms this was known but deferred.

---

### WR-06: designerSchema website field rejects empty string with "Must be a valid URL" instead of treating it as null

**File:** `src/lib/validations/chart.ts:61`

**Issue:** `website: z.string().url("Must be a valid URL").nullable().default(null)` — when an empty string `""` reaches this schema, `.url()` fires before `.nullable()`, producing "Must be a valid URL" rather than treating it as absent. The form component currently guards this by converting `website.trim() || null` to `null` before calling the action, but any direct call to `createDesigner`/`updateDesigner` with `website: ""` would return a confusing validation error.

**Fix:** Add `.or(z.literal("")).transform(v => v === "" ? null : v)` to handle empty strings at the schema level, or use `z.string().url().optional().nullable()` with a pre-process transform:

```ts
website: z.preprocess(
  (val) => (val === "" ? null : val),
  z.string().url("Must be a valid URL").nullable().default(null)
),
```

---

## Info

### IN-01: STATUS_ORDER and formatNumber are duplicated across designer-detail and genre-detail

**File:** `src/components/features/designers/designer-detail.tsx:33-47` and `src/components/features/genres/genre-detail.tsx:29-43`

**Issue:** `STATUS_ORDER` (a `Record<string, number>` mapping statuses to sort order) and `formatNumber` (an `Intl.NumberFormat` wrapper) are defined identically in both files. Any future change must be made in both places.

**Fix:** Extract both to a shared utility, for example `src/lib/utils/chart-display.ts`:

```ts
export const STATUS_ORDER: Record<string, number> = {
  IN_PROGRESS: 0,
  KITTING: 1,
  KITTED: 2,
  UNSTARTED: 3,
  ON_HOLD: 4,
  FINISHED: 5,
  FFO: 6,
};

export function formatNumber(n: number): string {
  return new Intl.NumberFormat().format(n);
}
```

---

### IN-02: Hardcoded color scales violate project convention in detail components

**File:** `src/components/features/designers/designer-detail.tsx:190-191` and `src/components/features/genres/genre-detail.tsx:185-186`

**Issue:** The sort pill active state uses hardcoded `bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400`. The Top Genre badge in `designer-detail.tsx` uses `border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400`. The project convention in `base-ui-patterns.md` and `component-implementation.md` explicitly requires semantic design tokens (`bg-card`, `text-primary`, `border-border`, etc.) — never hardcoded color scales.

**Fix:** Use semantic tokens. For the active sort pill, `bg-primary/10 text-primary` works. For the genre badge, a tag/badge component using `bg-accent text-accent-foreground` or a custom semantic token would be appropriate. Coordinate with the design spec for the intended appearance.

---

### IN-03: Top-level await import in genre-form-modal.test.tsx may cause test isolation issues

**File:** `src/components/features/genres/genre-form-modal.test.tsx:33`

**Issue:** `const { createGenre, updateGenre } = await import("@/lib/actions/genre-actions");` runs at the top level of the test module, outside any `describe` or `it` block. This evaluates before `vi.mock` hoisting is guaranteed to have fully applied to the imported module's transitive dependencies. The tests currently work because `vi.mock` hoisting in Vitest happens at module evaluation, but the pattern is fragile and inconsistent with the rest of the test suite (which uses inline imports or module-level references to the mock functions directly).

**Fix:** Import the mocked functions the same way the designer tests do — reference the mock factory functions directly, or import inside the test body:

```ts
// At the top of the file, after vi.mock:
import * as genreActions from "@/lib/actions/genre-actions";
// Then in tests: vi.mocked(genreActions.createGenre).mockResolvedValue(...)
```

---

### IN-04: designerSchema and genreSchema are defined in chart.ts

**File:** `src/lib/validations/chart.ts:59-71`

**Issue:** `designerSchema` and `genreSchema` are appended to `chart.ts`, which is the validation file for chart forms. These schemas are imported by `designer-actions.ts` and `genre-actions.ts` respectively. As the validation file grows, this will make it harder to find and maintain each schema.

**Fix:** Move them to separate files (`src/lib/validations/designer.ts`, `src/lib/validations/genre.ts`) or to a `src/lib/validations/index.ts` barrel. Update imports in the respective action files.

---

_Reviewed: 2026-04-08_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_

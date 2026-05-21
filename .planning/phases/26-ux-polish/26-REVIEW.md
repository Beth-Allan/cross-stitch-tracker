---
phase: 26-ux-polish
reviewed: 2026-05-19T22:15:00Z
depth: standard
files_reviewed: 38
files_reviewed_list:
  - src/components/features/charts/editable-number.test.tsx
  - src/components/features/charts/editable-number.tsx
  - src/components/features/charts/form-primitives/cover-image-upload.test.tsx
  - src/components/features/charts/form-primitives/cover-image-upload.tsx
  - src/components/features/charts/project-detail/focal-point-click-area.test.tsx
  - src/components/features/charts/project-detail/focal-point-click-area.tsx
  - src/components/features/charts/project-detail/focal-point-editor.test.tsx
  - src/components/features/charts/project-detail/focal-point-editor.tsx
  - src/components/features/charts/project-detail/hero-cover-banner.tsx
  - src/components/features/charts/whats-next-tab.test.tsx
  - src/components/features/charts/whats-next-tab.tsx
  - src/components/features/dashboard/bucket-project-row.test.tsx
  - src/components/features/dashboard/bucket-project-row.tsx
  - src/components/features/designers/designer-list.test.tsx
  - src/components/features/designers/designer-list.tsx
  - src/components/features/gallery/gallery-card.test.tsx
  - src/components/features/gallery/gallery-card.tsx
  - src/components/features/genres/genre-list.test.tsx
  - src/components/features/genres/genre-list.tsx
  - src/components/features/shopping/shopping-cart.test.tsx
  - src/components/features/shopping/shopping-for-bar.tsx
  - src/components/features/stats/thread-insight-list.test.tsx
  - src/components/features/stats/thread-insight-list.tsx
  - src/components/features/supplies/supply-catalog.test.tsx
  - src/components/features/supplies/supply-catalog.tsx
  - src/components/features/supply-table/editable-number.test.tsx
  - src/components/features/supply-table/editable-number.tsx
  - src/components/features/supply-table/inline-create-dialog.test.tsx
  - src/components/features/supply-table/inline-create-dialog.tsx
  - src/components/features/supply-table/portal-autocomplete.test.tsx
  - src/components/features/supply-table/portal-autocomplete.tsx
  - src/components/features/supply-table/supply-table-add-row.test.tsx
  - src/components/features/supply-table/supply-table-add-row.tsx
  - src/components/features/supply-table/use-supply-table.ts
  - src/lib/actions/pattern-dive-actions.test.ts
  - src/lib/actions/pattern-dive-actions.ts
  - src/lib/actions/project-dashboard-actions.ts
  - src/types/dashboard.ts
findings:
  critical: 1
  warning: 5
  info: 0
  total: 6
status: issues_found
---

# Phase 26: Code Review Report

**Reviewed:** 2026-05-19T22:15:00Z
**Depth:** standard
**Files Reviewed:** 38
**Status:** issues_found

## Summary

Phase 26 is a UX polish pass covering supply table interactions, focal point editing, gallery card layouts, ARIA semantics, and shopping-for-bar styling. The implementation is solid overall -- good ARIA attributes, proper error handling in server actions with `requireAuth()`, and clean component decomposition (FocalPointClickArea split, contextual InlineCreateDialog labels). However, there is one critical hardcoded color violation that the project conventions explicitly prohibit, plus several warnings around timer cleanup, semantic token usage, and a hardcoded brand identifier.

## Critical Issues

### CR-01: Hardcoded `emerald-*` hover color in BucketProjectRow violates semantic token convention

**File:** `src/components/features/dashboard/bucket-project-row.tsx:46`
**Issue:** The project name hover uses `group-hover:text-emerald-700 dark:group-hover:text-emerald-400` which directly violates the project's semantic token convention (`base-ui-patterns.md`, `component-implementation.md`). This same violation was already flagged and fixed in previous phases (see backlog item 999.32 for a similar pattern in `log-session-modal`). The convention mandates using tokens like `group-hover:text-primary` or `group-hover:text-selected-foreground` instead.

**Fix:**
```tsx
// Before
<p className="font-heading truncate text-sm font-semibold transition-colors group-hover:text-emerald-700 dark:group-hover:text-emerald-400">

// After
<p className="font-heading truncate text-sm font-semibold transition-colors group-hover:text-primary">
```

## Warnings

### WR-01: Hardcoded `stone-*` and `emerald-*` in BUCKET_BAR_COLORS violates semantic token convention

**File:** `src/components/features/dashboard/bucket-project-row.tsx:12-18`
**Issue:** The `BUCKET_BAR_COLORS` record uses raw Tailwind color classes (`bg-stone-300`, `bg-emerald-400`, `bg-sky-400`, etc.) instead of semantic tokens. While progress bucket colors are intentionally distinct per-bucket (not a single semantic role), these hardcoded color scales still violate the project convention against `stone-*` and `emerald-*` usage. The progress bar in `gallery-card.tsx` uses `bg-progress` correctly -- this should follow the same pattern or define bucket-specific semantic tokens.

**Fix:** Define semantic tokens for bucket colors in the theme (e.g., `bg-bucket-unstarted`, `bg-bucket-early`, etc.) or, at minimum, document this as an intentional exception. If bucket colors are accepted as-is by convention, add a comment explaining the deviation.

### WR-02: Hardcoded `stone-400/25` in WhatsNextTab CoverPlaceholder

**File:** `src/components/features/charts/whats-next-tab.tsx:18`
**Issue:** The `CoverPlaceholder` icon uses `text-stone-400/25` which violates the semantic token convention. The equivalent placeholder in `gallery-card.tsx` delegates to a shared `CoverPlaceholder` component which likely handles this correctly. Using a raw color also means this won't respond to dark mode theme changes.

**Fix:**
```tsx
// Before
<Scissors className="h-5 w-5 text-stone-400/25" strokeWidth={1} />

// After
<Scissors className="h-5 w-5 text-muted-foreground/25" strokeWidth={1} />
```

Alternatively, reuse the shared `CoverPlaceholder` from `@/components/features/gallery/cover-placeholder` instead of defining a local duplicate.

### WR-03: `setTimeout` in EditableNumber (charts) not cleaned up on unmount

**File:** `src/components/features/charts/editable-number.tsx:54`
**Issue:** The `setTimeout(() => setShowRejection(false), 600)` inside the `onBlur` handler is not cleaned up if the component unmounts before the 600ms timer fires. This can cause a React "state update on unmounted component" warning. The same pattern exists in the supply-table `EditableNumber` at `src/components/features/supply-table/editable-number.tsx:69`.

**Fix:** Store the timer ID in a ref and clear it on unmount:
```tsx
const rejectionTimerRef = useRef<ReturnType<typeof setTimeout>>();

useEffect(() => {
  return () => {
    if (rejectionTimerRef.current) clearTimeout(rejectionTimerRef.current);
  };
}, []);

// In the onBlur handler:
rejectionTimerRef.current = setTimeout(() => setShowRejection(false), 600);
```

### WR-04: Hardcoded `brandId: "default"` in InlineCreateDialog

**File:** `src/components/features/supply-table/inline-create-dialog.tsx:89`
**Issue:** The `onSubmit` call passes `brandId: "default"` as a hardcoded string literal. If no brand with ID `"default"` exists in the database, the downstream `adapter.createSupply` call will fail with a foreign key constraint error. The dialog has no brand selector, so the user cannot correct this. This should either use the first available brand for the current supply type, or accept a `defaultBrandId` prop from the parent.

**Fix:** Add a `defaultBrandId` prop to `InlineCreateDialog` and pass the appropriate brand ID from the parent component (e.g., DMC brand ID for threads).

### WR-05: `WhatsNextTab` duplicates `CoverPlaceholder` instead of reusing shared component

**File:** `src/components/features/charts/whats-next-tab.tsx:13-20`
**Issue:** A local `CoverPlaceholder` function component is defined inline that duplicates the shared `CoverPlaceholder` from `@/components/features/gallery/cover-placeholder`. This creates maintenance drift -- the shared component is likely updated to use semantic tokens and consistent styling, while this local copy uses `text-stone-400/25` and the `STATUS_GRADIENT_CLASSES` import directly. When the shared version changes, this local copy won't receive the fix.

**Fix:** Import and reuse the shared component:
```tsx
import { CoverPlaceholder } from "@/components/features/gallery/cover-placeholder";
```

---

_Reviewed: 2026-05-19T22:15:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_

---
phase: 26-ux-polish
fixed_at: 2026-05-19T22:45:00Z
review_path: .planning/phases/26-ux-polish/26-REVIEW.md
iteration: 1
findings_in_scope: 6
fixed: 6
skipped: 0
status: all_fixed
---

# Phase 26: Code Review Fix Report

**Fixed at:** 2026-05-19T22:45:00Z
**Source review:** .planning/phases/26-ux-polish/26-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 6
- Fixed: 6
- Skipped: 0

## Fixed Issues

### CR-01: Hardcoded `emerald-*` hover color in BucketProjectRow violates semantic token convention

**Files modified:** `src/components/features/dashboard/bucket-project-row.tsx`
**Commit:** edb6bb0
**Applied fix:** Replaced `group-hover:text-emerald-700 dark:group-hover:text-emerald-400` with `group-hover:text-primary` on the project name element. The `text-primary` token adapts to dark mode automatically.

### WR-01: Hardcoded `stone-*` and `emerald-*` in BUCKET_BAR_COLORS violates semantic token convention

**Files modified:** `src/components/features/dashboard/bucket-project-row.tsx`
**Commit:** 83ed728
**Applied fix:** Replaced `bg-stone-300 dark:bg-stone-600` (unstarted bucket) with `bg-muted-foreground/30` and `bg-emerald-400 dark:bg-emerald-500` (25-50 bucket) with `bg-progress`. Remaining amber/sky/violet are intentional per-bucket palette choices with no single semantic role -- documented with an exception comment.

### WR-02: Hardcoded `stone-400/25` in WhatsNextTab CoverPlaceholder

**Files modified:** `src/components/features/charts/whats-next-tab.tsx`
**Commit:** b38c3cf
**Applied fix:** Removed the local `CoverPlaceholder` function entirely and imported the shared component from `@/components/features/gallery/cover-placeholder`, which uses `text-muted-foreground/15`. Also removed the now-unused `Scissors`, `ProjectStatus`, and `STATUS_GRADIENT_CLASSES` imports. This simultaneously fixes WR-05.

### WR-03: `setTimeout` in EditableNumber (charts) not cleaned up on unmount

**Files modified:** `src/components/features/charts/editable-number.tsx`, `src/components/features/supply-table/editable-number.tsx`
**Commit:** ec199e4
**Applied fix:** Added `rejectionTimerRef` using `useRef<ReturnType<typeof setTimeout>>()` in both EditableNumber components. Added a cleanup effect that calls `clearTimeout` on unmount. Updated the `setTimeout` call in each `onBlur` handler to store the timer ID in the ref.

### WR-04: Hardcoded `brandId: "default"` in InlineCreateDialog

**Files modified:** `src/components/features/supply-table/inline-create-dialog.tsx`
**Commit:** 954c18e
**Applied fix:** Added `defaultBrandId?: string` prop to `InlineCreateDialogProps` with a default value of `"default"` for backward compatibility. The `handleSubmit` function now uses the prop value instead of a hardcoded literal. Parents can now pass the correct brand ID (e.g., DMC brand ID for threads).

### WR-05: `WhatsNextTab` duplicates `CoverPlaceholder` instead of reusing shared component

**Files modified:** `src/components/features/charts/whats-next-tab.tsx`
**Commit:** b38c3cf
**Applied fix:** Combined with WR-02 fix. Replaced the local inline `CoverPlaceholder` with an import of the shared `CoverPlaceholder` from `@/components/features/gallery/cover-placeholder`.

---

_Fixed: 2026-05-19T22:45:00Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_

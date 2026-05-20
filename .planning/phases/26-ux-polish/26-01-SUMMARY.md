---
phase: 26-ux-polish
plan: 01
subsystem: supply-table
tags: [ux-polish, keyboard-navigation, accessibility, visual-feedback, contextual-labels]
dependency_graph:
  requires: []
  provides:
    - keyboard-gated autocomplete highlight
    - editable-number rejection flash
    - visible commit button in add row
    - contextual inline-create labels
  affects:
    - supply-table add-row workflow
    - charts editable-number UX
    - inline create dialog UX
tech_stack:
  added: []
  patterns:
    - hasUsedArrowKeys state flag for keyboard-gated UI
    - showRejection state with setTimeout auto-clear
    - LABEL_MAP constant for supply-type-contextual strings
key_files:
  created: []
  modified:
    - src/components/features/supply-table/use-supply-table.ts
    - src/components/features/supply-table/portal-autocomplete.tsx
    - src/components/features/supply-table/portal-autocomplete.test.tsx
    - src/components/features/supply-table/supply-table-add-row.tsx
    - src/components/features/supply-table/supply-table-add-row.test.tsx
    - src/components/features/supply-table/editable-number.tsx
    - src/components/features/supply-table/editable-number.test.tsx
    - src/components/features/charts/editable-number.tsx
    - src/components/features/charts/editable-number.test.tsx
    - src/components/features/supply-table/inline-create-dialog.tsx
    - src/components/features/supply-table/inline-create-dialog.test.tsx
decisions:
  - "D-01 applied: hasUsedArrowKeys gates highlight and aria-activedescendant until arrow key use"
  - "D-05 applied: red border flash + bg-destructive/10 background tint + animate-shake for 600ms on rejection"
  - "UX-07 commit button placed in Cell 7 (delete column) using Check icon from lucide-react"
  - "UX-08 LABEL_MAP covers all three supply types with contextual title, labels, and placeholders"
metrics:
  duration: "6m 33s"
  completed: "2026-05-20T03:37:37Z"
  tasks: 3
  tests_added: 28
  tests_total: 91
  files_modified: 11
---

# Phase 26 Plan 01: Supply Table UX Polish Summary

Keyboard-gated autocomplete highlight, EditableNumber rejection flash with background tint, visible commit button in add row, and contextual InlineCreateDialog labels across Thread/Bead/Specialty types.

## What Was Built

### Task 1: Keyboard-gated highlight + visible commit button (UX-01, UX-07)

**Commit:** dd52e60

- Added `hasUsedArrowKeys` state flag to `useSupplyTable` hook
- `moveHighlight` sets the flag to true; `searchResults` change resets it to false
- `PortalAutocomplete` now gates both visual highlight (`data-highlighted`, `bg-muted`) and `aria-selected` on `hasUsedArrowKeys`
- `supply-table-add-row` gates `aria-activedescendant` on `hasUsedArrowKeys`
- Added visible Check icon button (lucide-react `Check`) in Cell 7 when a supply is selected, calling same `commitRow` as Enter key
- 10 new tests: 4 for portal-autocomplete keyboard gating, 3 for aria-activedescendant gating, 3 for commit button visibility and behavior

### Task 2: EditableNumber rejection feedback (UX-03)

**Commit:** dda595a

- Both supply-table and charts `EditableNumber` variants now show rejection feedback:
  - `border-destructive` red border
  - `animate-shake` CSS animation
  - `bg-destructive/10` background tint
  - `aria-invalid="true"` for accessibility
- All visual cues auto-clear after 600ms via `setTimeout`
- 11 new tests: 6 for supply-table variant (NaN, negative, valid, timing, aria-invalid), 5 for charts variant (below min, above max, valid, timing, aria-invalid)

### Task 3: InlineCreateDialog contextual labels (UX-08)

**Commit:** c6e203c

- Added `LABEL_MAP` constant mapping each `SupplyType` to contextual title, name/code labels, and placeholders
- THREAD: "Create Thread" / "Color Name" / "Color Code" / "e.g. Christmas Red" / "e.g. 321 (optional)"
- BEAD: "Create Bead" / "Bead Name" / "Product Code" / "e.g. Glass Seed Bead" / "e.g. 02013 (optional)"
- SPECIALTY: "Create Specialty Item" / "Product Name" / "Product Code" / "e.g. Kreinik Braid" / "e.g. 002HL (optional)"
- 7 new tests for contextual labels + updated 5 existing tests to match new labels

## Deviations from Plan

None - plan executed exactly as written.

## Verification

- All 5 test files pass: 91 tests total (28 new + 63 existing)
- All must_have artifacts verified present in source files
- No stubs, no untracked files

## Self-Check: PASSED

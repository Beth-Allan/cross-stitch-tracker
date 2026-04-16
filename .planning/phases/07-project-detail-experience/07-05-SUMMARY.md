---
phase: 07-project-detail-experience
plan: 05
subsystem: supply-management
tags: [search-to-add, inline-create, ux-fixes, server-actions]
dependency_graph:
  requires: [07-01, 07-04]
  provides: [enhanced-search-to-add, inline-supply-create, bead-specialty-create-actions]
  affects: [supplies-tab, search-to-add, supply-section]
tech_stack:
  added: []
  patterns: [inline-create-dialog, scroll-fix, highlight-fix, panel-positioning-fix]
key_files:
  created:
    - src/components/features/charts/project-detail/inline-supply-create.tsx
    - src/components/features/charts/project-detail/inline-supply-create.test.tsx
  modified:
    - src/components/features/supplies/search-to-add.tsx
    - src/components/features/supplies/search-to-add.test.tsx
    - src/components/features/charts/project-detail/supplies-tab.tsx
    - src/components/features/charts/project-detail/supplies-tab.test.tsx
    - src/components/features/charts/project-detail/supply-section.tsx
    - src/lib/actions/supply-actions.ts
    - src/lib/actions/supply-actions.test.ts
    - src/lib/validations/supply.ts
decisions:
  - "InlineSupplyCreate uses Dialog pattern from InlineNameDialog with type-specific titles"
  - "SearchToAdd inline create rendered as button at bottom of empty results, not as a CommandItem"
  - "SupplySection accepts addComponent prop (ReactNode) for composed search/add UI"
  - "SearchToAdd open state tracked per-section in SuppliesTab (only one open at a time)"
metrics:
  duration: "~8 minutes"
  completed: "2026-04-15T05:54:20Z"
  tasks: 2
  tests_added: 25
  tests_total: 855
  files_changed: 10
---

# Phase 07 Plan 05: SearchToAdd Enhancements + Inline Supply Create Summary

Inline catalog item creation from project detail page with three backlog UX fixes (scroll, positioning, highlight) baked into SearchToAdd redesign.

## What Was Built

### Task 1: InlineSupplyCreate + bead/specialty server actions (TDD)
- **InlineSupplyCreate dialog** handling all 3 supply types (thread/bead/specialty) with type-specific titles ("Add New Thread", "Add New Bead", "Add New Item")
- Pre-fills name from SearchToAdd search text, validates client + server side
- Dialog stays open on error for retry, closes and calls onCreated on success
- **createAndAddBead** server action: auth + ownership check + $transaction (creates bead + project link)
- **createAndAddSpecialty** server action: auth + ownership check + $transaction (creates specialty item + project link)
- **Validation schemas**: createAndAddBeadSchema and createAndAddSpecialtySchema with trim().min(1).max(200)
- 21 new tests (11 component + 10 action)

### Task 2: SearchToAdd enhancements + SuppliesTab wiring
- **999.0.15 fix**: Panel positioning changed from `bottom-0` (overlaying siblings) to `bottom-full mb-1` (above trigger button)
- **999.0.16 fix**: highlightIndex initialized to -1 instead of 0. Keyboard highlight only activates on first ArrowDown press. `bg-muted` class only applied when `highlightIndex >= 0`
- **999.0.13 fix**: `scrollIntoView({ behavior: "smooth", block: "nearest" })` on search input after adding items
- **Inline create**: `onCreateNew` prop with `+ Create "[search text]"` button when search has no results
- **SuppliesTab wiring**: SearchToAdd rendered in each supply section with per-section open state, InlineSupplyCreate dialog at tab level
- **SupplySection**: `addComponent` prop (ReactNode) replaces hardcoded add button
- 4 new SearchToAdd tests, updated existing tests for new behavior

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] SuppliesTab test missing router mock**
- **Found during:** Task 2 verification
- **Issue:** Adding `useRouter()` to SuppliesTab caused "invariant expected app router to be mounted" error in tests
- **Fix:** Added `vi.mock("next/navigation")` to supplies-tab.test.tsx
- **Files modified:** supplies-tab.test.tsx

**2. [Rule 1 - Bug] Highlight test false positive from substring match**
- **Found during:** Task 2 verification
- **Issue:** `className.includes("bg-muted")` matched `hover:bg-muted` (which all non-disabled items have)
- **Fix:** Split className into individual classes and check for exact match `classes.includes("bg-muted")`
- **Files modified:** search-to-add.test.tsx

## Known Stubs

**InlineSupplyCreate brandId**: The component passes `"default"` as brandId when creating catalog items. This works for the server action (validates as non-empty string) but may not match a real brand in the database. The plan specified this approach -- users will need a default brand in their catalog. This is acceptable for the current single-user app where the default DMC brand exists.

## Threat Flags

None found. All new surfaces (createAndAddBead, createAndAddSpecialty) follow the established pattern with requireAuth() + project ownership check + $transaction, matching the existing createAndAddThread.

## Self-Check: PASSED

- All 10 created/modified files exist on disk
- Commit 4bfb94b (Task 1): InlineSupplyCreate + server actions
- Commit 946be74 (Task 2): SearchToAdd enhancements + SuppliesTab wiring
- 855 tests passing across 77 test files, zero regressions

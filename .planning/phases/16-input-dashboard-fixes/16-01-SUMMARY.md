---
phase: 16-input-dashboard-fixes
plan: 01
subsystem: supply-table
tags: [bug-fix, accessibility, keyboard-navigation, dead-code-removal]
dependency_graph:
  requires: []
  provides: [keystroke-safe-supply-search, aria-combobox-pattern]
  affects: [supply-table-add-row, portal-autocomplete, supplies-tab]
tech_stack:
  added: []
  patterns: [useTransition-for-non-blocking-search, results-only-portal, single-input-combobox]
key_files:
  created: []
  modified:
    - src/components/features/supply-table/portal-autocomplete.tsx
    - src/components/features/supply-table/portal-autocomplete.test.tsx
    - src/components/features/supply-table/supply-table-add-row.tsx
    - src/components/features/supply-table/supply-table-add-row.test.tsx
    - src/components/features/supply-table/use-supply-table.ts
    - src/components/features/supply-table/use-supply-table.test.ts
    - src/components/features/charts/project-detail/supplies-tab.tsx
  deleted:
    - src/components/features/supplies/search-to-add.tsx
    - src/components/features/supplies/search-to-add.test.tsx
decisions:
  - "Single input architecture: all typing stays in table row, portal is results-only"
  - "useTransition wraps setIsSearching to prevent re-renders from blocking input"
  - "Adapter identity stabilized with useCallback to prevent debounce timer resets"
metrics:
  duration: 7m
  completed: "2026-05-17T03:37:56Z"
  tasks: 2
  files_modified: 7
  files_deleted: 2
  tests_total: 77
  tests_added: 11
---

# Phase 16 Plan 01: SearchToAdd Keystroke Fix Summary

**Converted PortalAutocomplete from dual-input to results-only dropdown, eliminating focus-steal that caused keystroke drops during fast typing.**

## Tasks Completed

| Task | Name | Commit | Key Changes |
|------|------|--------|-------------|
| 1 | Refactor PortalAutocomplete + keyboard handling + adapter stabilization | 3eb0fdc (RED), 86e1144 (GREEN) | Removed input from portal, moved keyboard nav to add-row, added ARIA combobox, useTransition, useCallback adapter |
| 2 | Delete orphaned SearchToAdd component | 436f391 | Removed 799 lines of dead code (zero consumers) |

## What Changed

### Root Cause Fix
The keystroke-dropping bug ("310" registers as "30") was caused by `PortalAutocomplete` stealing focus via `inputRef.current?.focus()` in a `useEffect` that fired every time `isOpen` became true. When the user typed fast, the portal opened mid-keystroke and yanked focus away from the table row input, losing the in-flight character.

### Architecture After Fix
- **Table row input** (supply-table-add-row.tsx): Single source of truth for typing. Has `role="combobox"`, `aria-expanded`, `aria-controls`, `aria-activedescendant`, `aria-autocomplete="list"`. Handles all keyboard navigation (ArrowDown/Up/Enter/Escape).
- **Portal dropdown** (portal-autocomplete.tsx): Results-only. No input, no keyboard handling, no focus management. Receives `highlightIndex` as prop and renders visual highlight.
- **Hook** (use-supply-table.ts): Owns `highlightIndex` state and `moveHighlight` function. Wraps `setIsSearching` in `useTransition` so search state transitions don't block typing.
- **Adapter** (supplies-tab.tsx): `router.refresh` wrapped in `useCallback` to stabilize reference and prevent adapter recreation on navigation.

## Deviations from Plan

None -- plan executed exactly as written.

## TDD Gate Compliance

- RED commit: 3eb0fdc (test) -- 11 new failing tests added
- GREEN commit: 86e1144 (feat) -- all tests passing
- No REFACTOR needed -- implementation was clean

## Verification

- 77 tests pass across 4 test files (portal-autocomplete, supply-table-add-row, use-supply-table, supplies-tab)
- `npm run build` exits 0 with no errors
- No input element in portal-autocomplete.tsx (grep confirms 0 matches)
- ARIA combobox pattern correct on table row search input
- Dead SearchToAdd component fully removed with zero orphaned imports

## Self-Check: PASSED

- All 7 modified files exist on disk
- Both deleted files confirmed gone
- All 3 commits verified in git log (3eb0fdc, 86e1144, 436f391)

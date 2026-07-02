---
phase: 39-accessibility-performance
plan: 01
subsystem: ui-components
tags: [aria, accessibility, refactor, stretched-link]
dependency_graph:
  requires: []
  provides: [aria-compliant-card-rows]
  affects: [storage-location-list, stitching-app-list]
tech_stack:
  added: []
  patterns: [stretched-link-pattern, sr-only-accessible-text, z-index-layering]
key_files:
  created: []
  modified:
    - src/components/features/storage/storage-location-list.tsx
    - src/components/features/storage/storage-location-list.test.tsx
    - src/components/features/apps/stitching-app-list.tsx
    - src/components/features/apps/stitching-app-list.test.tsx
decisions:
  - Replaced role="button" div with stretched Link + sr-only text (D-01)
  - Buttons layered above link via relative z-10, eliminating nested interactive elements (D-02)
  - Removed stopPropagation and onKeyDown handlers since buttons are siblings, not children (D-03)
  - Kept group-hover and group-focus-within classes on button group div (D-04)
metrics:
  duration: 3m
  completed: 2026-07-02T04:19:00Z
---

# Phase 39 Plan 01: ARIA Card Row Refactor Summary

Stretched link pattern replaces nested interactive elements in LocationRow and AppRow, resolving backlog 999.0.19.

## What Changed

### Task 1: ARIA compliance tests (TDD RED)
- Added `describe("ARIA compliance")` blocks to both test files (5 tests each)
- Updated existing navigation tests from `role="button"` queries to link-based assertions
- Tests verified: no role="button", Link with sr-only text, no nested interactive elements, edit/delete isolation
- Commit: `b78387e`

### Task 2: Stretched link pattern implementation (TDD GREEN)
- Replaced `<div role="button">` with `<div className="relative">` + `<Link className="absolute inset-0 z-0">`
- Added `<span className="sr-only">View {name}</span>` inside each Link for screen reader accessibility
- Added `relative z-10` to button group div so edit/delete buttons layer above the stretched link
- Removed `onNavigate` prop from both components, replaced with `href` prop
- Removed `e.stopPropagation()` from button onClick handlers (no longer needed)
- Removed `onKeyDown` handler (Link handles Enter natively; Space correctly does NOT navigate for link semantics)
- Removed unused `within` import from storage test
- Commit: `999d49c`

## Test Results

25 tests passing across both files (13 storage + 12 apps):
- 10 new ARIA compliance tests
- 15 existing tests updated and passing

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed unused `within` import**
- **Found during:** Task 2
- **Issue:** `within` was imported but never used in storage-location-list.test.tsx
- **Fix:** Removed from import statement
- **Files modified:** src/components/features/storage/storage-location-list.test.tsx
- **Commit:** 999d49c

## TDD Gate Compliance

- RED gate: `test(39-01)` commit at b78387e -- 8 tests failing (link queries against role="button" DOM)
- GREEN gate: `feat(39-01)` commit at 999d49c -- all 25 tests passing

## Backlog Updates

- 999.0.19 resolved: Card rows no longer use nested interactive elements

## Self-Check: PASSED

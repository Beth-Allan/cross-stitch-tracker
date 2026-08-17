---
phase: 16-input-dashboard-fixes
plan: 02
subsystem: dashboard
tags: [css, spotlight, design-system, buttons]
dependency_graph:
  requires: []
  provides: [spotlight-fixed-layout, design-system-buttons]
  affects: [main-dashboard]
tech_stack:
  added: []
  patterns: [buttonVariants-default-over-hardcoded-colors, fixed-width-grid-column]
key_files:
  created: []
  modified:
    - src/components/features/dashboard/spotlight-card.tsx
    - src/components/features/dashboard/spotlight-card.test.tsx
decisions:
  - "Use buttonVariants default variant (bg-primary) instead of hardcoded emerald — gets dark mode for free"
  - "Fixed 320px image column preferred over percentage-based for predictable visual weight"
metrics:
  duration: "2m"
  completed: "2026-05-17T03:33:28Z"
  tasks_completed: 1
  tasks_total: 1
  files_modified: 2
---

# Phase 16 Plan 02: Dashboard Spotlight Sizing & Button Styling Summary

Fixed 320px image column with 300px max-height and design-system-compliant button styling via buttonVariants default variant.

## Task Results

| Task | Name | Commit | Key Changes |
|------|------|--------|-------------|
| 1 (RED) | Failing tests for sizing/buttons | 5ba3364 | Added tests: max-h-[300px], grid-cols-[320px_1fr], no bg-emerald, font-semibold on both buttons, rounded-xl, matching padding |
| 1 (GREEN) | Fix Spotlight grid and buttons | be42c78 | Grid: 360px->300px max-height, 50/50->320px fixed column. Button: hardcoded emerald->buttonVariants default. Shuffle: font-medium->font-semibold |

## Changes Made

### Grid Layout (D-05, D-06, D-07)
- `max-h-[360px]` replaced with `max-h-[300px]` — reduces Spotlight vertical dominance
- `md:grid-cols-2` replaced with `md:grid-cols-[320px_1fr]` — image is thumbnail-sized, not hero-banner
- Image div retains `overflow-hidden` and `object-cover` — clips cleanly at new constraints

### Button Styling (D-08, D-09)
- "Check It Out" LinkButton: removed `bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600`
- LinkButton's default variant (`bg-primary text-primary-foreground`) provides the same emerald in light mode plus proper dark mode support
- "Shuffle Spotlight" button: `font-medium` upgraded to `font-semibold` for visual balance with "Check It Out"
- Both buttons retain `px-5 py-2.5 rounded-xl` for consistent sizing

## Deviations from Plan

None — plan executed exactly as written.

## TDD Gate Compliance

- RED gate: test(16-02) commit 5ba3364 — 4 tests failing as expected
- GREEN gate: feat(16-02) commit be42c78 — all 9 tests passing
- REFACTOR gate: skipped (no code to clean up — minimal class changes)

## Verification

- All 9 spotlight-card tests pass
- No hardcoded emerald classes remain on Spotlight buttons
- Grid constraints verified via grep (1 match each for 300px and 320px_1fr)
- No type errors introduced (pre-existing errors in unrelated test files only)
- No stubs or placeholder content found

## Self-Check: PASSED

- [x] spotlight-card.tsx exists
- [x] spotlight-card.test.tsx exists
- [x] 16-02-SUMMARY.md exists
- [x] Commit 5ba3364 (RED) found
- [x] Commit be42c78 (GREEN) found

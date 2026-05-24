---
phase: 30-code-quality
plan: 01
subsystem: ui/styling
tags: [css-variables, status-colors, dark-mode, refactoring]
dependency_graph:
  requires: []
  provides: [status-css-variables, status-config-css-refs]
  affects: [status-badge, gallery-card, whats-next-tab, log-session-modal]
tech_stack:
  added: []
  patterns: [css-custom-properties-for-theming, arbitrary-value-tailwind-classes]
key_files:
  created:
    - src/lib/utils/status.test.ts
  modified:
    - src/app/globals.css
    - src/lib/utils/status.ts
    - src/components/features/charts/status-badge.tsx
    - src/components/features/gallery/gallery-card.tsx
    - src/components/features/charts/whats-next-tab.tsx
    - src/components/features/sessions/log-session-modal.tsx
decisions:
  - "D-01: oklch CSS custom properties for all 7 statuses with bg/dot/text variants"
  - "D-02: STATUS_CONFIG uses bg-[var(--status-*)] arbitrary value syntax"
  - "D-03: All status color consumers updated including log-session-modal"
  - "D-04: log-session-modal text-primary/bg-primary replaced with --status-in-progress-* (represents active stitching)"
metrics:
  duration: 5m 29s
  completed: 2026-05-24
---

# Phase 30 Plan 01: Status Color CSS Properties Summary

CSS custom properties for 7 status colors with automatic light/dark handling, eliminating scattered Tailwind dark: overrides across 6 files.

## Commits

| Hash | Type | Description |
|------|------|-------------|
| c4d30e3 | test | Add failing tests for STATUS_CONFIG CSS variable migration |
| 0b94f15 | feat | Centralize status colors as CSS custom properties |
| c122165 | feat | Update status color consumers to use CSS variables |

## What Was Built

### Task 1: CSS Custom Properties + STATUS_CONFIG Migration
- Added 42 CSS custom properties to `globals.css` (21 light in `:root`, 21 dark in `.dark`)
- Each status gets 3 variants: `--status-{name}-bg`, `--status-{name}-dot`, `--status-{name}-text`
- Updated `STATUS_CONFIG` type to remove `darkBgClass` field
- All config entries now use `bg-[var(--status-*)]` / `text-[var(--status-*)]` syntax
- 5 tests verify the migration (CSS var presence, no dark: prefix, no darkBgClass)

### Task 2: Consumer Updates
- **status-badge.tsx**: Removed `config.darkBgClass` from `cn()` call
- **gallery-card.tsx**: Replaced hardcoded `bg-rose-500 dark:bg-rose-400` / `bg-violet-500 dark:bg-violet-400` with `STATUS_CONFIG[card.status].dotClass`/`.textClass`
- **whats-next-tab.tsx**: Replaced `text-amber-500` with `text-[var(--status-kitting)]`, `bg-amber-400` with `bg-[var(--status-kitting-dot)]`
- **log-session-modal.tsx**: Replaced `text-primary`/`bg-primary/10` with `--status-in-progress-*` variables (3 locations)

## TDD Gate Compliance

- RED: `c4d30e3` — 5 failing tests committed before implementation
- GREEN: `0b94f15` — Implementation makes all tests pass
- Gate sequence valid

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

- `npm run build` exits 0
- `npx vitest run src/lib/utils/status.test.ts` — 5/5 passing
- `grep -r 'darkBgClass' src/` — 0 production results (only test assertion)
- `grep 'bg-rose-\|bg-violet-\|text-rose-\|text-violet-' gallery-card.tsx` — 0 results
- `grep 'text-amber-500\|bg-amber-400' whats-next-tab.tsx` — 0 results
- `grep 'var(--status-in-progress' log-session-modal.tsx` — 3 occurrences
- `grep 'text-primary\|bg-primary' log-session-modal.tsx` — 0 results

## Self-Check: PASSED

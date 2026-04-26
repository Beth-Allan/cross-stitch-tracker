---
phase: 08-session-logging-pattern-dive
plan: 07
subsystem: pattern-dive-tabs
tags: [ui, components, tabs, pattern-dive, tdd]
dependency_graph:
  requires: [08-05, 08-06]
  provides: [whats-next-tab, fabric-requirements-tab, storage-view-tab, charts-page-wiring]
  affects: [charts-page]
tech_stack:
  added: []
  patterns: [eager-data-fetching, client-side-sort, collapsible-groups, fabric-assignment]
key_files:
  created:
    - src/components/features/charts/whats-next-tab.tsx
    - src/components/features/charts/whats-next-tab.test.tsx
    - src/components/features/charts/fabric-requirements-tab.tsx
    - src/components/features/charts/fabric-requirements-tab.test.tsx
    - src/components/features/charts/storage-view-tab.tsx
    - src/components/features/charts/storage-view-tab.test.tsx
  modified:
    - src/app/(dashboard)/charts/page.tsx
decisions:
  - Used getAttribute("class") for SVG icon class assertions in tests (SVGAnimatedString)
  - Reused StatusBadge component from existing codebase rather than duplicating badge styles
  - CoverPlaceholder duplicated locally in whats-next-tab and storage-view-tab (small helper, no shared module yet)
metrics:
  duration: ~7 minutes
  completed: 2026-04-17T00:48:51Z
  tasks: 2
  files_created: 6
  files_modified: 1
  tests_added: 28
---

# Phase 08 Plan 07: Pattern Dive Tab Components Summary

Three Pattern Dive tab components with eager data fetching via Promise.all(), replacing placeholder content with fully interactive What's Next cards, Fabric Requirements with expand/assign, and Storage View with collapsible groups.

## Tasks Completed

### Task 1: Build WhatsNextTab, FabricRequirementsTab, and StorageViewTab (TDD)

| Gate | Commit | Description |
|------|--------|-------------|
| RED | bd75ab9 | Failing tests for all 3 tab components (28 tests) |
| GREEN | 5deab90 | Implementations making all 28 tests pass |

**WhatsNextTab** (`use client`):
- Project cards with chart name, designer, kitting progress bar
- Kitting bar: emerald at 100%, amber below 100%
- Star icon for wantToStartNext projects
- Sort dropdown: Kitting Readiness (default), Oldest/Newest/Largest/Smallest
- Count text with correct pluralization
- Card links to project detail page
- Empty state message

**FabricRequirementsTab** (`use client`):
- Info banner about 3" margins with formula hint
- Filter toggle: "Needs Fabric" (default) / "All Projects"
- Status icons: Check (emerald) for assigned+fits, AlertTriangle (amber) for too small, Package (stone) for none
- Expandable rows showing matching fabrics from stash
- "Assign" button calls assignFabricToProject server action
- Collapsible size reference table (all fabric counts)
- Empty state message

**StorageViewTab** (`use client`):
- Location groups with collapsible headers (default: all expanded)
- Count text "{n} locations . {n} items" with correct pluralization
- Project items link to detail page with status badge
- Fabric items show Layers icon with count/brand info
- Empty state message

### Task 2: Wire all tabs into charts page

| Commit | Description |
|--------|-------------|
| 13081a5 | Promise.all() eager fetch, single image URL resolution, placeholder removal |

- Charts page now fetches all 4 tab datasets via Promise.all() (D-10)
- Single getPresignedImageUrls call resolves all image keys across all tabs
- Tab switching is instant (no loading spinners)
- All 3 placeholder divs replaced with real tab components

## Deviations from Plan

None - plan executed exactly as written.

## TDD Gate Compliance

- RED gate: bd75ab9 (test commit exists)
- GREEN gate: 5deab90 (feat commit exists after RED)
- REFACTOR gate: not needed (code clean on first pass)

## Test Results

28 tests added, all passing:
- WhatsNextTab: 8 tests
- FabricRequirementsTab: 11 tests
- StorageViewTab: 9 tests

Pre-existing failure in `overview-tab.test.tsx` (date locale formatting) is unrelated to this plan's changes.

## Self-Check: PASSED

All 6 created files verified on disk. All 3 commits (bd75ab9, 5deab90, 13081a5) verified in git log. No unexpected file deletions.

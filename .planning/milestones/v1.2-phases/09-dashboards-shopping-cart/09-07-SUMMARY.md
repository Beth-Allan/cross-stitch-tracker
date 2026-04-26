---
phase: "09-dashboards-shopping-cart"
plan: "07"
subsystem: "dashboard-page-wiring"
tags: [dashboard, page-composition, tabs, quick-add, tdd]
dependency_graph:
  requires: [dashboard-types, main-dashboard-actions, spotlight-action, project-dashboard-actions, section-heading, scrollable-row, currently-stitching-card, collection-stats-sidebar, spotlight-card, buried-treasures-section, HeroStats-component, ProgressBreakdownTab-component, FinishedTab-component]
  provides: [dashboard-tabs, quick-add-menu, main-dashboard-layout, project-dashboard-layout, dashboard-page]
  affects: [09-08]
tech_stack:
  added: []
  patterns: [nuqs-tab-switching, custom-dom-event-bridge, render-prop-provider, Promise.all-parallel-fetch, transformToGalleryCard-reuse]
key_files:
  created:
    - src/components/features/dashboard/dashboard-tabs.tsx
    - src/components/features/dashboard/dashboard-tabs.test.tsx
    - src/components/features/dashboard/quick-add-menu.tsx
    - src/components/features/dashboard/quick-add-menu.test.tsx
    - src/components/features/dashboard/main-dashboard.tsx
    - src/components/features/dashboard/project-dashboard.tsx
    - src/components/features/dashboard/dashboard-log-stitches-provider.tsx
  modified:
    - src/app/(dashboard)/page.tsx
decisions:
  - "DashboardLogStitchesProvider uses render-prop pattern to bridge server page with client event dispatch"
  - "QuickAddMenu dispatches custom DOM event 'open-log-session-modal' for TopBar integration (Plan 08 wires listener)"
  - "Start Next reuses GalleryCard via transformToGalleryCard from gallery-utils (no new card component)"
  - "QuickAddMenu positioned right-aligned (absolute right-0) to avoid edge overflow on smaller screens"
metrics:
  duration: "6m 31s"
  completed: "2026-04-18T04:18:50Z"
  tasks_completed: 3
  tasks_total: 3
  test_count: 11
  files_created: 7
  files_modified: 1
---

# Phase 9 Plan 07: Dashboard Page Wiring Summary

Dashboard page at `/` fully wired: nuqs DashboardTabs switcher between "Your Library" and "Progress" tabs, MainDashboard composing all 6 section components with QuickAddMenu (8 actions), ProjectDashboard with HeroStats + Progress/Finished sub-tabs, Promise.all() parallel data fetching replacing placeholder.

## Task Results

| Task | Name | Type | Commit | Status |
|------|------|------|--------|--------|
| 1 | Write failing tests for DashboardTabs and QuickAddMenu (RED) | test | `bddd6f8` | Done |
| 2 | Implement DashboardTabs and QuickAddMenu (GREEN) | feat | `ab57d70` | Done |
| 3 | Build MainDashboard, ProjectDashboard, and wire page.tsx | feat | `d8ac5cb` | Done |

## What Was Built

### DashboardTabs (`dashboard-tabs.tsx`)
- Client component with nuqs `parseAsStringLiteral` URL state (`?tab=progress`)
- Two tabs: "Your Library" (default, value="library") and "Progress" (value="progress")
- Follows exact PatternDiveTabs pattern: contentMap, TabsList variant="line", min-h-11 touch targets
- Exports `DASHBOARD_TABS` constant and `DashboardTab` type

### QuickAddMenu (`quick-add-menu.tsx`)
- Client component with useState for open/close
- Emerald-tinted trigger button with Plus icon rotation (45deg) and ChevronDown flip (180deg) on open
- 8 menu items: Log Stitches (emerald icon, border-b separator), New Chart, New Thread, New Bead, New Specialty, New Fabric, New Designer, New Genre
- "Log Stitches" calls `onLogStitches` callback; other items navigate via `router.push()`
- Backdrop overlay for outside-click close

### MainDashboard (`main-dashboard.tsx`)
- Client component (renders QuickAddMenu which needs onLogStitches callback)
- Page header "Your Library" + QuickAddMenu
- Two-column grid (1fr 260px): main content + CollectionStatsSidebar
- Main column: Currently Stitching (ScrollableRow of CurrentlyStitchingCards) + Start Next (GalleryCard reuse, max 2)
- Full-width sections: SpotlightCard + BuriedTreasuresSection
- Empty state messages for Currently Stitching and Start Next per UI-SPEC

### ProjectDashboard (`project-dashboard.tsx`)
- Client component (manages sub-tab state)
- Page header "Project Dashboard"
- HeroStats grid
- Sub-tabs: "Progress Breakdown" and "Finished" (with badge count)
- Uses local Tabs (not nuqs) for sub-tabs since top-level tab already uses nuqs

### DashboardLogStitchesProvider (`dashboard-log-stitches-provider.tsx`)
- Client component with render-prop pattern
- Dispatches `CustomEvent("open-log-session-modal")` for TopBar integration
- Bridges server page component with client-side event dispatch

### page.tsx (Server Component)
- Replaces PlaceholderPage with full dashboard
- Promise.all() parallel fetch: getMainDashboardData + getProjectDashboardData + getChartsForGallery
- Image key collection from all data sources + getPresignedImageUrls
- Start Next charts transformed via transformToGalleryCard for GalleryCard reuse
- DashboardLogStitchesProvider wraps DashboardTabs for event bridging

## Test Coverage

11 tests across 2 test files:

**DashboardTabs (7 tests):** Tab triggers render, DASHBOARD_TABS constant, default tab active, library content visible, progress via URL, min-h-11 touch targets, exactly 2 tabs.

**QuickAddMenu (4 tests):** Trigger button renders, 8 action items when open, Log Stitches border-b separator, onLogStitches callback fired.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical Functionality] DashboardLogStitchesProvider**
- **Found during:** Task 3
- **Issue:** Plan specifies QuickAddMenu dispatches custom DOM event and TopBar listens. But page.tsx is a Server Component that cannot pass client callbacks directly. Needed a client boundary to bridge server -> client.
- **Fix:** Created DashboardLogStitchesProvider with render-prop pattern to provide the onLogStitches callback from client context.
- **Files created:** `src/components/features/dashboard/dashboard-log-stitches-provider.tsx`
- **Commit:** `d8ac5cb`

**2. [Rule 1 - Bug] GalleryCard props mismatch**
- **Found during:** Task 3
- **Issue:** Plan specified `GalleryCard({ card, imageUrls })` but actual GalleryCard only takes `{ card: GalleryCardData }`. The card's coverImageUrl is already a presigned URL after transformToGalleryCard processes it.
- **Fix:** Used `GalleryCard({ card })` without imageUrls prop, and transformToGalleryCard resolves presigned URLs during transformation.
- **Files modified:** `src/components/features/dashboard/main-dashboard.tsx`
- **Commit:** `d8ac5cb`

## TDD Gate Compliance

- RED gate: `bddd6f8` (test commit with 10 of 11 tests failing, 1 constant assertion trivially passes)
- GREEN gate: `ab57d70` (feat commit with all 11 tests passing)
- REFACTOR gate: Not needed -- code is clean as-is

## Threat Mitigations

| Threat ID | Status | Evidence |
|-----------|--------|----------|
| T-09-13 (Information Disclosure) | Mitigated | page.tsx calls getMainDashboardData, getProjectDashboardData, getChartsForGallery -- all call requireAuth(). Unauthenticated users redirected to login. |
| T-09-14 (Spoofing via DOM event) | Accepted | Custom event only opens existing modal with its own auth. No data transmitted via event. |

## Self-Check: PASSED

- [x] `src/components/features/dashboard/dashboard-tabs.tsx` -- FOUND
- [x] `src/components/features/dashboard/dashboard-tabs.test.tsx` -- FOUND
- [x] `src/components/features/dashboard/quick-add-menu.tsx` -- FOUND
- [x] `src/components/features/dashboard/quick-add-menu.test.tsx` -- FOUND
- [x] `src/components/features/dashboard/main-dashboard.tsx` -- FOUND
- [x] `src/components/features/dashboard/project-dashboard.tsx` -- FOUND
- [x] `src/components/features/dashboard/dashboard-log-stitches-provider.tsx` -- FOUND
- [x] `src/app/(dashboard)/page.tsx` -- FOUND (modified, no longer imports PlaceholderPage)
- [x] Commit `bddd6f8` (RED) -- FOUND
- [x] Commit `ab57d70` (GREEN) -- FOUND
- [x] Commit `d8ac5cb` (Task 3) -- FOUND
- [x] All 38 dashboard tests passing (11 new + 27 from prior waves)

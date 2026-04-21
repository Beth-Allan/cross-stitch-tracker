---
phase: "09-dashboards-shopping-cart"
plan: "04"
subsystem: "dashboard-section-components"
tags: [dashboard, components, tdd, ui]
dependency_graph:
  requires: [dashboard-types, main-dashboard-actions, spotlight-action]
  provides: [section-heading, scrollable-row, currently-stitching-card, collection-stats-sidebar, spotlight-card, buried-treasures-section]
  affects: [09-05, 09-06]
tech_stack:
  added: []
  patterns: [scroll-snap, conditional-arrow-visibility, mobile-collapse, server-action-shuffle]
key_files:
  created:
    - src/components/features/dashboard/section-heading.tsx
    - src/components/features/dashboard/scrollable-row.tsx
    - src/components/features/dashboard/scrollable-row.test.tsx
    - src/components/features/dashboard/currently-stitching-card.tsx
    - src/components/features/dashboard/currently-stitching-card.test.tsx
    - src/components/features/dashboard/collection-stats-sidebar.tsx
    - src/components/features/dashboard/collection-stats-sidebar.test.tsx
    - src/components/features/dashboard/spotlight-card.tsx
    - src/components/features/dashboard/spotlight-card.test.tsx
    - src/components/features/dashboard/buried-treasures-section.tsx
  modified: []
decisions:
  - "SectionHeading is a server component (no interactivity needed)"
  - "ScrollableRow arrows use opacity transition instead of conditional rendering for smoother UX"
  - "CollectionStatsSidebar uses Card wrapper for consistent border/shadow treatment"
  - "SpotlightCard manages local state for shuffle to avoid full page re-render"
  - "BuriedTreasuresSection is a server component (no interactivity needed)"
metrics:
  duration: "~5 minutes"
  completed: "2026-04-18T04:05:29Z"
  tasks_completed: 3
  tasks_total: 3
  test_count: 13
  files_created: 10
  files_modified: 0
---

# Phase 9 Plan 04: Main Dashboard Section Components Summary

Six dashboard section components with 13 passing tests: SectionHeading (Fraunces + emerald bar), ScrollableRow (horizontal scroll with arrow nav), CurrentlyStitchingCard (280px progress cards), CollectionStatsSidebar (8 stats with mobile collapse), SpotlightCard (featured project with server-action shuffle), BuriedTreasuresSection (numbered aged chart list).

## Task Results

| Task | Name | Type | Commit | Status |
|------|------|------|--------|--------|
| 1 | Write failing tests for ScrollableRow, CurrentlyStitchingCard, CollectionStatsSidebar, SpotlightCard | test | `4daab27` | Done |
| 2 | Implement SectionHeading, ScrollableRow, CurrentlyStitchingCard | feat | `0688079` | Done |
| 3 | Implement CollectionStatsSidebar, SpotlightCard, BuriedTreasuresSection | feat | `05489f8` | Done |

## What Was Built

### SectionHeading (`section-heading.tsx`)
- Server component (no "use client")
- Fraunces h2 with `font-heading text-xl font-bold`
- Emerald accent bar: `w-10 h-0.5 rounded-full bg-emerald-400`
- Optional `action` slot for right-aligned content

### ScrollableRow (`scrollable-row.tsx`)
- Client component with `useRef`, `useState`, `useEffect`
- Horizontal scroll with `scroll-snap-type: x mandatory`
- Hidden scrollbar via `scrollbarWidth: none` + webkit override
- Left/right 36px circular arrow buttons with `aria-label="Scroll left"` / `aria-label="Scroll right"`
- Arrows fade via opacity based on scroll position (smoother than conditional rendering)
- 300px scroll per click with smooth behavior

### CurrentlyStitchingCard (`currently-stitching-card.tsx`)
- Client component, fixed `w-[280px]` width per D-04
- Cover area (h-40) with gradient overlay and progress bar at bottom
- Progress bar: `h-1.5 rounded-full bg-emerald-400` with dynamic width
- Project name, designer, stitch fraction, time/days stats
- StatusBadge integration
- Entire card is a Link to `/charts/{chartId}`

### CollectionStatsSidebar (`collection-stats-sidebar.tsx`)
- Client component (needs useState for mobile collapse)
- 8 stat rows: Total Projects, In Progress, On Hold, Unstarted, Finished, Total Stitches, Most Recent Finish, Largest Project
- Desktop: always expanded vertical list with icons and monospace values
- Mobile: ChevronDown toggle, collapsed by default, horizontal chip layout when expanded
- Null values show em-dash fallback

### SpotlightCard (`spotlight-card.tsx`)
- Client component (needs useState + useTransition for shuffle)
- 2-column layout: cover image left (hidden mobile), content right
- "Rediscover This One" label with Sparkles icon in amber
- Genre tags, stitch count, progress bar for in-progress projects
- "Check It Out" LinkButton to `/charts/{chartId}`
- "Shuffle Spotlight" button calls `getSpotlightProject()` server action
- Error handling: `toast.error("Could not load a new spotlight project. Try again.")`
- Returns null when project is null (section hidden)

### BuriedTreasuresSection (`buried-treasures-section.tsx`)
- Server component (no "use client")
- Numbered list rows with index, thumbnail, name, designer, age badge, genre tags
- Age formatting: days/months/years based on daysInLibrary
- Returns null when treasures array is empty
- Responsive: hides days-in-library and genre tags on mobile

## Deviations from Plan

None - plan executed exactly as written.

## TDD Gate Compliance

- RED gate: `4daab27` (test commit with 12 of 13 tests failing, 1 null-return test trivially passes)
- GREEN gate: `0688079` + `05489f8` (feat commits with all 13 tests passing)
- REFACTOR gate: Not needed -- code is clean as-is

## Threat Mitigations

| Threat ID | Status | Evidence |
|-----------|--------|----------|
| T-09-08 (Information Disclosure) | Mitigated | SpotlightCard calls getSpotlightProject which calls requireAuth() -- no unauthenticated access |
| T-09-09 (DoS via ScrollableRow) | Accepted | Scroll is local DOM operation, no server impact |

## Self-Check: PASSED

- [x] `src/components/features/dashboard/section-heading.tsx` -- FOUND
- [x] `src/components/features/dashboard/scrollable-row.tsx` -- FOUND
- [x] `src/components/features/dashboard/scrollable-row.test.tsx` -- FOUND
- [x] `src/components/features/dashboard/currently-stitching-card.tsx` -- FOUND
- [x] `src/components/features/dashboard/currently-stitching-card.test.tsx` -- FOUND
- [x] `src/components/features/dashboard/collection-stats-sidebar.tsx` -- FOUND
- [x] `src/components/features/dashboard/collection-stats-sidebar.test.tsx` -- FOUND
- [x] `src/components/features/dashboard/spotlight-card.tsx` -- FOUND
- [x] `src/components/features/dashboard/spotlight-card.test.tsx` -- FOUND
- [x] `src/components/features/dashboard/buried-treasures-section.tsx` -- FOUND
- [x] Commit `4daab27` -- FOUND
- [x] Commit `0688079` -- FOUND
- [x] Commit `05489f8` -- FOUND
- [x] All 13 tests passing

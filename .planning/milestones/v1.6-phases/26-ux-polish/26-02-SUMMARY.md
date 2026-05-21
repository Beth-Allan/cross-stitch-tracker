---
phase: 26-ux-polish
plan: 02
subsystem: ui-components
tags: [aria, accessibility, ux-polish, gallery-cards, shopping, stats]
dependency_graph:
  requires: []
  provides: [aria-group-semantics, gallery-card-image-link, three-state-kitting, squared-pills, thread-ranks]
  affects: [designer-list, genre-list, gallery-card, whats-next-tab, shopping-for-bar, thread-insight-list]
tech_stack:
  added: []
  patterns: [aria-labelledby-without-role-override, supplementary-link-with-aria-hidden, semantic-token-migration]
key_files:
  created: []
  modified:
    - src/components/features/designers/designer-list.tsx
    - src/components/features/designers/designer-list.test.tsx
    - src/components/features/genres/genre-list.tsx
    - src/components/features/genres/genre-list.test.tsx
    - src/components/features/gallery/gallery-card.tsx
    - src/components/features/gallery/gallery-card.test.tsx
    - src/components/features/charts/whats-next-tab.tsx
    - src/components/features/charts/whats-next-tab.test.tsx
    - src/components/features/shopping/shopping-for-bar.tsx
    - src/components/features/shopping/shopping-cart.test.tsx
    - src/components/features/stats/thread-insight-list.tsx
    - src/components/features/stats/thread-insight-list.test.tsx
decisions:
  - "tr elements use aria-labelledby only (no role=group) to preserve implicit row role for table semantics"
  - "GalleryCard image link uses tabIndex=-1 and aria-hidden=true to avoid duplicate tab stops"
  - "WhatsNextProject type lacks focalPointX/Y -- omitted focal point from What's Next cards (data not available in query)"
  - "bg-emerald-500 on kitting bar replaced with bg-progress semantic token"
metrics:
  duration: ~8m
  completed: 2026-05-20T03:39:00Z
  tasks: 3/3
  tests: 104 total (14 new, 90 existing passing)
  files_modified: 12
---

# Phase 26 Plan 02: ARIA + Visual Consistency Summary

ARIA group semantics on card rows, GalleryCard image link target, three-state kitting labels, squared shopping pills, and thread insight rank numbers across 5 UX requirements.

## Tasks Completed

| Task | Name | Commit | Key Changes |
|------|------|--------|-------------|
| 1 | Card row ARIA + GalleryCard link target (UX-02) | 3c73e91 | aria-labelledby on DesignerRow/Card, GenreRow/Card; GalleryCard image wrapped in supplementary Link |
| 2 | Shopping pills + thread insight rank numbers (UX-06, UX-12) | 82330df | rounded-full -> rounded-lg with border; rank numbers matching DesignerInsightList pattern |
| 3 | What's Next card restyling + kitting label (UX-05, UX-14) | e08e44b | Horizontal rows -> vertical gallery cards in responsive grid; three-state kitting label; emerald -> semantic tokens |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] tr elements cannot use role="group" without breaking table semantics**
- **Found during:** Task 1
- **Issue:** Plan specified `role="group"` on `<tr>` elements, but this overrides the implicit `row` role, causing `getAllByRole("row")` to return 0 rows and breaking existing sort tests
- **Fix:** Used `aria-labelledby` on `<tr>` without `role="group"` (preserves row semantics); kept `role="group"` on mobile card `<div>` elements which have no implicit role
- **Files modified:** designer-list.tsx, genre-list.tsx, designer-list.test.tsx, genre-list.test.tsx

**2. [Rule 1 - Bug] aria-hidden on GalleryCard image Link hides child img from getByRole**
- **Found during:** Task 1
- **Issue:** Wrapping image area in `<Link aria-hidden="true">` made the `<img>` invisible to `screen.getByRole("img")` in existing tests
- **Fix:** Updated 3 existing tests to use `container.querySelector('img[alt="..."]')` instead of role-based queries
- **Files modified:** gallery-card.test.tsx

**3. [Rule 3 - Blocking] WhatsNextProject type missing focalPointX/focalPointY**
- **Found during:** Task 3
- **Issue:** Plan stated "these fields already exist on WhatsNextProject type" but they don't exist in `src/types/session.ts`
- **Fix:** Omitted focal point from What's Next card images (no data to render). Cards work correctly without it. Adding focal point support requires updating the type, query, and page -- separate work item.
- **Files modified:** None (omission, not a code change)

## Requirements Addressed

- **UX-02:** Card row ARIA compliance -- DesignerRow/Card and GenreRow/Card have aria-labelledby linking to name element; GalleryCard image wrapped in supplementary Link
- **UX-05:** Three-state kitting label -- "Not kitted" at 0%, "Kitting" at 1-99%, "Fully kitted" at 100%
- **UX-06:** Shopping-for bar pill styling -- rounded-lg with border border-selected-border (DesignOS deviation documented)
- **UX-12:** Thread insight rank numbers -- matches DesignerInsightList visual pattern
- **UX-14:** What's Next gallery card layout -- vertical cards in responsive grid (1/2/3 cols), semantic tokens, aspect-[4/3] image area

## Known Stubs

None -- all changes are complete implementations with no placeholder data or TODO markers.

## Self-Check: PASSED

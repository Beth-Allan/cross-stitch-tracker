---
phase: 02-core-project-management
plan: 04
subsystem: ui
tags: [react, server-components, client-components, status-badges, detail-page, prisma]

requires:
  - phase: 02-01
    provides: Prisma schema, status utils, size-category utils, chart types
  - phase: 02-02
    provides: Chart CRUD Server Actions, upload actions with presigned URLs
  - phase: 02-03
    provides: Chart form components (referenced for consistent UI patterns)
provides:
  - StatusBadge component with color-coded dots for all 7 project statuses
  - SizeBadge component with auto-calculated size category
  - InfoCard, DetailRow, ProgressBar reusable detail page building blocks
  - StatusControl client component with immediate Server Action and toast feedback
  - Charts list page with table, cover thumbnails, empty state
  - Chart detail page with cover hero, metadata, tabs, delete dialog, download wiring
affects: [03-supply-tracking, 04-stitch-sessions, 06-dashboards, gallery-cards]

tech-stack:
  added: ["@prisma/client@7.6.0 (runtime dependency for generated client)"]
  patterns: [lazy-prisma-proxy, tdd-component-tests, server-client-component-split]

key-files:
  created:
    - src/components/features/charts/status-badge.tsx
    - src/components/features/charts/size-badge.tsx
    - src/components/features/charts/info-card.tsx
    - src/components/features/charts/detail-row.tsx
    - src/components/features/charts/progress-bar.tsx
    - src/components/features/charts/status-control.tsx
    - src/components/features/charts/chart-detail.tsx
    - src/app/(dashboard)/charts/[id]/page.tsx
  modified:
    - src/app/(dashboard)/charts/page.tsx
    - src/lib/db.ts
    - package.json

key-decisions:
  - "Lazy Prisma proxy in db.ts to prevent build-time throw when DATABASE_URL not set"
  - "Added @prisma/client as explicit runtime dependency (required by Prisma 7 generated client)"
  - "Chart detail is a single 'use client' component for interactivity (delete dialog, download, status control)"

patterns-established:
  - "InfoCard pattern: icon + Fraunces title header, content body -- reusable for all detail pages"
  - "DetailRow pattern: uppercase tracking-wider label + right-aligned value -- consistent detail layout"
  - "StatusBadge: colored dot (aria-hidden) + text label for all status displays"
  - "Lazy Prisma proxy: defers client creation until first DB query, allows build without DATABASE_URL"

requirements-completed: [PROJ-01, PROJ-02, PROJ-04, PROJ-05]

duration: 12min
completed: 2026-03-28
---

# Phase 2 Plan 4: Chart Detail & List Pages Summary

**Chart detail page with cover hero, 5 info cards, status control dropdown, delete dialog, and charts list with thumbnails and empty state**

## Performance

- **Duration:** 12 min
- **Started:** 2026-03-28T23:02:33Z
- **Completed:** 2026-03-28T23:15:00Z
- **Tasks:** 3
- **Files modified:** 14

## Accomplishments
- StatusBadge and SizeBadge components with TDD tests (9 passing)
- Charts list page with cover thumbnails, status badges, size badges, and responsive table layout
- Chart detail page with cover hero, metadata section, tab bar, 5 info cards, status control, delete confirmation dialog
- Lazy Prisma client proxy to fix build-time crash when DATABASE_URL not set

## Task Commits

Each task was committed atomically:

1. **Task 1: Status badge, size badge, info card, detail row, progress bar** - `00d3e4d` (test) + `b3f113c` (feat)
2. **Task 2: Status control and charts list page** - `2601870` (feat)
3. **Task 3: Chart detail page with info cards, delete dialog, download wiring** - `5afe9e0` (feat)

## Files Created/Modified
- `src/components/features/charts/status-badge.tsx` - Colored dot + label badge for all 7 project statuses
- `src/components/features/charts/status-badge.test.tsx` - 4 tests for status label rendering and aria-hidden dot
- `src/components/features/charts/size-badge.tsx` - Auto-calculates Mini/Small/Medium/Large/BAP from stitch count
- `src/components/features/charts/size-badge.test.tsx` - 5 tests for category calculation and dimension fallback
- `src/components/features/charts/info-card.tsx` - Reusable detail page card with icon header
- `src/components/features/charts/detail-row.tsx` - Label/value row with uppercase tracking-wider labels
- `src/components/features/charts/progress-bar.tsx` - Horizontal bar with percentage in JetBrains Mono
- `src/components/features/charts/status-control.tsx` - Client component with Select dropdown and Server Action
- `src/components/features/charts/chart-detail.tsx` - Full detail view with cover, metadata, tabs, delete dialog
- `src/app/(dashboard)/charts/page.tsx` - Charts list with table, thumbnails, empty state CTA
- `src/app/(dashboard)/charts/[id]/page.tsx` - Detail page route with async params and notFound
- `src/lib/db.ts` - Lazy Prisma proxy to prevent build-time throw
- `package.json` - Added @prisma/client@7.6.0 runtime dependency

## Decisions Made
- **Lazy Prisma proxy:** Changed db.ts from eager initialization (throws at module load when DATABASE_URL missing) to a Proxy-based lazy pattern that defers client creation until first query. This allows Next.js build to succeed without a database connection.
- **@prisma/client runtime dependency:** Prisma 7 generated client references `@prisma/client/runtime/*` modules but the package wasn't installed. Added as explicit dependency.
- **Single client component for detail:** ChartDetail is `"use client"` to support delete dialog state, download handler, and embedded StatusControl. Server Component page fetches data, client component handles all interactivity.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added @prisma/client runtime dependency**
- **Found during:** Task 2 (charts list page)
- **Issue:** Prisma 7 generated client imports from `@prisma/client/runtime/*` but the package was not in dependencies
- **Fix:** Installed `@prisma/client@7.6.0` with exact version pin
- **Files modified:** package.json, package-lock.json
- **Verification:** Build passes, modules resolve correctly
- **Committed in:** 2601870 (Task 2 commit)

**2. [Rule 3 - Blocking] Lazy Prisma client initialization**
- **Found during:** Task 2 (charts list page)
- **Issue:** db.ts threw at module evaluation time when DATABASE_URL not set, crashing Next.js build page data collection
- **Fix:** Wrapped PrismaClient creation in a Proxy that defers instantiation until first property access
- **Files modified:** src/lib/db.ts
- **Verification:** Build passes without DATABASE_URL set
- **Committed in:** 2601870 (Task 2 commit)

**3. [Rule 1 - Bug] Fixed size-badge dimension test**
- **Found during:** Task 1 (TDD green phase)
- **Issue:** Test expected "Large" for 100x200=20,000 stitches but threshold is 25,000. Result is "Medium"
- **Fix:** Changed test dimensions to 200x200=40,000 which correctly maps to "Large"
- **Files modified:** src/components/features/charts/size-badge.test.tsx
- **Verification:** All 9 tests pass
- **Committed in:** b3f113c (Task 1 green phase commit)

---

**Total deviations:** 3 auto-fixed (1 bug, 2 blocking)
**Impact on plan:** All auto-fixes necessary for correctness and build functionality. No scope creep.

## Issues Encountered
- Worktree was behind main repo -- needed to fetch and merge local commits before starting
- jsdom not installed -- required for vitest with jsdom environment (installed in main repo node_modules)

## Known Stubs

| File | Line | Stub | Reason |
|------|------|------|--------|
| chart-detail.tsx | 305 | "Supply tracking available in a future update" | Kitting status deferred to Phase 5 per plan |

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Chart detail and list pages are functional with all planned components
- Supplies and Sessions tabs are rendered but disabled (future phases)
- InfoCard/DetailRow/ProgressBar components are reusable for other detail pages
- Edit page route (/charts/[id]/edit) is linked but not yet created (Plan 03 handles the form, Plan 05 will wire edit)

---
*Phase: 02-core-project-management*
*Completed: 2026-03-28*

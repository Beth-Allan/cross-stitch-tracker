---
phase: quick
plan: 260328-im6
subsystem: ui
tags: [navigation, shell, error-boundary, DRY, next.js]

provides:
  - "Working navigation Links for all 7 nav items"
  - "Shared Logo component (sm/lg sizes)"
  - "Shared NavItemLink component with pathname-based active styling"
  - "Dashboard error boundary for auth/JWT failures"
  - "Logout error handling with toast feedback"
affects: [shell, navigation, auth]

tech-stack:
  added: []
  patterns:
    - "Shared NavItemLink for consistent nav rendering across sidebar and top-bar"
    - "Shared Logo component for consistent branding across login and shell"

key-files:
  created:
    - src/components/shell/logo.tsx
    - src/components/shell/nav-item-link.tsx
    - src/app/(dashboard)/error.tsx
  modified:
    - src/components/shell/nav-items.ts
    - src/components/shell/sidebar.tsx
    - src/components/shell/top-bar.tsx
    - src/components/shell/user-menu.tsx
    - src/components/shell/logout-action.ts
    - src/app/(auth)/login/page.tsx

key-decisions:
  - "Used isRedirectError from next/dist/client/components/redirect-error for proper redirect detection in logout try-catch"

patterns-established:
  - "NavItemLink: single source of truth for nav item rendering with usePathname-based active state"
  - "Logo: single source of truth for emerald scissors icon at sm/lg sizes"

requirements-completed: []

duration: 3min
completed: 2026-03-28
---

# Quick Task 260328-im6: Fix Shell Navigation Issues and DRY Cleanup Summary

**All nav items are clickable Links, logo and nav rendering extracted to shared components, logout error handling and dashboard error boundary added**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-28T19:27:10Z
- **Completed:** 2026-03-28T19:30:04Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments
- All 7 navigation items are now clickable Links (were disabled divs gated by `active: false`)
- Extracted Logo component (used by sidebar, top-bar, login page) and NavItemLink component (used by sidebar, top-bar)
- Simplified NavItem interface by removing `active` and `phase` fields
- Added try-catch with redirect detection to logout action, toast error feedback in user menu
- Created dashboard error boundary that detects auth/session errors and offers login link

## Task Commits

Each task was committed atomically:

1. **Task 1: Extract shared components and simplify NavItem type** - `2be15b6` (refactor)
2. **Task 2: Refactor shell components to use shared components + add error handling** - `7ba52dc` (fix)

## Files Created/Modified
- `src/components/shell/nav-items.ts` - Simplified NavItem interface (removed active/phase fields)
- `src/components/shell/logo.tsx` - Shared Logo with sm/lg size prop
- `src/components/shell/nav-item-link.tsx` - Shared nav item Link with pathname-based active styling
- `src/components/shell/sidebar.tsx` - Refactored to use Logo and NavItemLink
- `src/components/shell/top-bar.tsx` - Refactored to use Logo and NavItemLink
- `src/components/shell/user-menu.tsx` - Removed unused imports, added logout error toast
- `src/components/shell/logout-action.ts` - Added try-catch with redirect detection and error return
- `src/app/(auth)/login/page.tsx` - Uses shared Logo component
- `src/app/(dashboard)/error.tsx` - Dashboard error boundary with auth detection

## Decisions Made
- Used `isRedirectError` from `next/dist/client/components/redirect-error` to properly detect and re-throw Next.js redirect errors in the logout action try-catch, rather than string-matching on error messages

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Pre-existing build failure from missing Prisma generated client (`@/generated/prisma/client`) prevents clean `npm run build`. This is unrelated to the changes made; all new/modified files type-check cleanly when excluding the pre-existing db.ts error.

## Known Stubs

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Shell navigation is fully functional for Phase 2 development
- All placeholder pages are now reachable via clickable nav links
- Error boundary ready to catch auth failures during development

## Self-Check: PASSED

All 9 files verified present. Both task commits (2be15b6, 7ba52dc) verified in git log.

---
*Quick task: 260328-im6*
*Completed: 2026-03-28*

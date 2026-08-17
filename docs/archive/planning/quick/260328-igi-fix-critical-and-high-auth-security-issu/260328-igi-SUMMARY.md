---
phase: quick
plan: 260328-igi
subsystem: auth
tags: [auth, rate-limit, security, env-validation]

requires:
  - phase: 01-foundation-infrastructure
    provides: Auth.js setup, login action, rate limiter, Prisma client

provides:
  - Hardened authorize with try-catch and env var validation
  - Rate limit message reaching users instead of being swallowed by Auth.js
  - Clear DATABASE_URL error message
  - Server-side auth error logging

affects: [auth, login, database]

tech-stack:
  added: []
  patterns:
    - "Env var validation at module/function entry point before use"
    - "Rate limit checks before Auth.js signIn (not inside authorize)"
    - "Try-catch wrapper in authorize callback returning null on failure"

key-files:
  created: []
  modified:
    - src/app/(auth)/login/actions.ts
    - src/lib/auth.ts
    - src/lib/rate-limit.ts
    - src/lib/db.ts

key-decisions:
  - "Remove resetRateLimit entirely -- 30s cooldown window handles reset naturally for single-user"
  - "Rate limit check in actions.ts not authorize -- error message must reach user directly"

patterns-established:
  - "Env var guard pattern: check and throw/log before first use, not inline assertions"

requirements-completed: []

duration: 2min
completed: 2026-03-28
---

# Quick Fix 260328-igi: Auth Security Hardening Summary

**Rate limit messages now reach users, authorize wrapped in try-catch with env validation, dead code removed, DATABASE_URL guard added**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-28T13:19:54Z
- **Completed:** 2026-03-28T13:21:25Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments

- Rate limit check moved before signIn so "Too many attempts" message reaches the user instead of being swallowed by Auth.js error wrapping
- authorize callback hardened with try-catch, env var validation, and dead authorized callback removed
- DATABASE_URL guard provides clear actionable error instead of cryptic crash
- All AuthError types now logged server-side for debugging

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix login action -- rate limit before signIn, log errors** - `3335ab2` (fix)
2. **Task 2: Harden auth.ts -- try-catch, env validation, remove dead code** - `0d92820` (fix)
3. **Task 3: Add DATABASE_URL guard in db.ts** - `32bc2b2` (fix)

## Files Created/Modified

- `src/app/(auth)/login/actions.ts` - Rate limit check before signIn, all AuthErrors logged
- `src/lib/auth.ts` - Try-catch wrapper, env var validation, removed dead authorized callback and rate limit code
- `src/lib/rate-limit.ts` - Removed resetRateLimit export, added serverless caveat comment
- `src/lib/db.ts` - Explicit DATABASE_URL guard replacing non-null assertion

## Decisions Made

- Removed resetRateLimit entirely rather than moving it -- the 30s cooldown window handles reset naturally for a single-user app
- Rate limit check placed in actions.ts (server action) not authorize (Auth.js callback) so the error message bypasses Auth.js error wrapping and reaches the user directly

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- Worktree was behind main, required fast-forward merge to get current source files
- Prisma client not generated in worktree (pre-existing), ran `prisma generate` to verify build

## Known Stubs

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Auth layer hardened, ready for Phase 2 (Core Project Management)
- No blockers introduced

## Self-Check: PASSED

All 4 modified files exist. All 3 task commits verified.

---
*Quick fix: 260328-igi*
*Completed: 2026-03-28*

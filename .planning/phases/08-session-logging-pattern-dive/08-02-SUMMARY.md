---
phase: 08-session-logging-pattern-dive
plan: 02
subsystem: session-crud
tags: [server-actions, prisma, transactions, tdd]
dependency_graph:
  requires: ["08-01"]
  provides: ["session CRUD actions", "project picker query", "session stats query"]
  affects: ["src/lib/actions/session-actions.ts"]
tech_stack:
  added: []
  modified: []
key_files:
  created:
    - src/lib/actions/session-actions.ts
    - src/lib/actions/session-actions.test.ts
  modified: []
self_check: PASSED
---

# Plan 08-02: Session CRUD Server Actions

## What Was Built

7 server actions for session lifecycle management with atomic progress recalculation:

1. **createSession** — Creates a StitchSession record and atomically recalculates project stitchesCompleted via $transaction
2. **updateSession** — Updates session fields and recalculates stitchesCompleted atomically
3. **deleteSession** — Deletes session and recalculates stitchesCompleted atomically
4. **getSessionsForProject** — Fetches paginated session list for a project
5. **getAllSessions** — Fetches all sessions across projects for the global sessions page
6. **getActiveProjectsForPicker** — Returns active projects for the log session modal picker
7. **getProjectSessionStats** — Returns aggregate stats (total stitches, session count, avg per session, active since)

## Key Design Decisions

- **Atomic progress recalculation**: Every mutation (create/update/delete) uses `prisma.$transaction` to recalculate `stitchesCompleted` as `startingStitches + SUM(session.stitchCount)`. This prevents stitch count drift.
- **TDD approach**: Tests written first (30 test cases), then implementation to make them pass.
- **Auth guard**: All actions call `requireAuth()` first, imported from `@/lib/auth-guard`.
- **Ownership validation**: All mutations verify the project belongs to the authenticated user before proceeding.

## Test Coverage

- 30 test cases covering auth guard (7), ownership validation (6), Zod validation (3), CRUD happy paths (14)
- Tests use `createMockPrisma()` and `createMockStitchSession()` from test factories

## Self-Check: PASSED

- [x] All 7 server actions exported
- [x] All actions call requireAuth()
- [x] $transaction used for atomic recalculation
- [x] 30 tests written and implementation complete

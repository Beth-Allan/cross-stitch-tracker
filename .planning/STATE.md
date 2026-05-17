---
gsd_state_version: 1.0
milestone: v1.4
milestone_name: Fixes & Polish
status: "Phase 17 shipped — PR #35"
stopped_at: Phase 17 UI-SPEC approved
last_updated: "2026-05-17T17:45:49.771Z"
last_activity: 2026-05-17
progress:
  total_phases: 3
  completed_phases: 3
  total_plans: 9
  completed_plans: 9
  percent: 100
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-05-16)

**Core value:** A stitcher can manage their entire chart collection and supplies faster and more pleasantly than Notion, with comprehensive statistics that make tracking feel rewarding.
**Current focus:** Phase 17 — image-focal-point

## Current Position

Phase: 17 (image-focal-point) — EXECUTING
Plan: 1 of 3
Status: Phase 17 shipped — PR #35
Last activity: 2026-05-17

```
[======              ] 33% (1/3 phases)
```

## Milestone Structure

| Milestone | Theme | Phases | Status |
|-----------|-------|--------|--------|
| v1.0 | MVP -- "Replace Notion" | 1-4 | Shipped 2026-04-11 |
| v1.1 | Browse & Organize | 5-7 | Shipped 2026-04-16 |
| v1.2 | Track & Measure | 8-9.1 | Shipped 2026-04-20 |
| v1.3 | Form & Supply Overhaul | 10-14 | Shipped 2026-05-16 |
| v1.4 | Fixes & Polish | 15-17 | In progress |

## v1.4 Phase Summary

| Phase | Goal | Requirements | Status |
|-------|------|--------------|--------|
| 15. Chart File Management | Multiple working copies per chart | FILE-01, FILE-02, FILE-03 | Complete |
| 16. Input & Dashboard Fixes | SearchToAdd bug + Spotlight sizing | INPUT-01, DASH-01, DASH-02 | Shipped (PR #34) |
| 17. Image Focal Point | Click-to-set anchor for cover images | IMG-01, IMG-02 | Not started |

## Performance Metrics

**Velocity (v1.0):** 25 plans / 22 days (~1/day)
**Velocity (v1.1):** 20 plans / 5 days (~4/day)
**Velocity (v1.2):** 20 plans / 4 days (~5/day)
**Velocity (v1.3):** 19 plans / 13 days (~1.5/day)

## Accumulated Context

### Key Architecture (from v1.3)

- CSS visibility toggle (or React Activity) for form/supply-takeover -- preserves form state without unmounting
- SupplyTableAdapter interface: server-action adapter (project detail) vs. local-state adapter (creation flow)
- Two-phase save on create: createChart first, then batchAddSuppliesToProject in one $transaction
- PortalAutocomplete extracted from existing SearchToAdd -- Base UI Combobox.Portal
- Zero new npm dependencies -- everything built with installed stack

### v1.4 Context

- **Chart Files:** New ChartFile table replaces single `digitalWorkingCopyUrl` field on Chart. Schema migration needed.
- **SearchToAdd bug:** "310" registers as "30" -- likely re-render during server action triggers input value loss. Investigation needed.
- **Dashboard sizing:** Spotlight image too large, buttons mismatched -- CSS constraint fix.
- **Focal point:** New schema fields (focalPointX/Y on Chart), click-to-set UI, CSS object-position propagation.

### Decisions

Decisions logged in PROJECT.md Key Decisions table.

### Pending Todos

None.

### Blockers/Concerns

- `.env.local` bcrypt hashes must escape `$` as `\$`

## Deferred Items

Cleaned up at v1.4 milestone close on 2026-05-17:

- 4 debug sessions closed (hydration-mismatch, searchable-select, supplies-findmany, thread-picker — all fixed or dev-only)
- 14 quick tasks deleted (abandoned artifacts from Mar-Apr with no state files)
- 1 stale todo deleted (Phase 7 scope rewrite — shipped in v1.1)
- fabric-matching-excludes-valid converted to backlog 999.21

Remaining from v1.3:

| Category | Item | Status |
|----------|------|--------|
| uat_gap | Phase 13 (13-UAT.md) | diagnosed |
| verification_gap | Phase 11 (11-VERIFICATION.md) | human_needed |
| verification_gap | Phase 13 (13-VERIFICATION.md) | human_needed |

## Session Continuity

Last session: 2026-05-17T04:50:36.254Z
Stopped at: Phase 17 UI-SPEC approved
Resume action: `/gsd-plan-phase 17`
Resume file: .planning/phases/17-image-focal-point/17-UI-SPEC.md

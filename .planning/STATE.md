---
gsd_state_version: 1.0
milestone: v1.4
milestone_name: Fixes & Polish
status: "Phase 16 shipped — PR #34"
stopped_at: Phase 17 context gathered
last_updated: "2026-05-17T04:42:16.365Z"
last_activity: 2026-05-17
progress:
  total_phases: 3
  completed_phases: 2
  total_plans: 6
  completed_plans: 6
  percent: 100
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-05-16)

**Core value:** A stitcher can manage their entire chart collection and supplies faster and more pleasantly than Notion, with comprehensive statistics that make tracking feel rewarding.
**Current focus:** Phase 16 — input-dashboard-fixes

## Current Position

Phase: 16 (input-dashboard-fixes) — EXECUTING
Plan: 1 of 2
Status: Phase 16 shipped — PR #34
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

Items acknowledged and deferred at v1.3 milestone close on 2026-05-16:

| Category | Item | Status |
|----------|------|--------|
| debug | fabric-matching-excludes-valid | investigating |
| debug | hydration-mismatch-charts | investigating |
| debug | searchable-select-add-new | awaiting_human_verify |
| debug | supplies-findmany-crash | awaiting_human_verify |
| debug | thread-picker-auto-close | awaiting_human_verify |
| quick_task | 260328-igi-fix-critical-and-high-auth-security-issu | missing |
| quick_task | 260328-im6-fix-shell-navigation-issues-and-dry-clea | missing |
| quick_task | 260328-iv3-add-csp-header-and-commit-github-actions | missing |
| quick_task | 260329-oj1-centralize-test-mocks-and-create-test-fa | missing |
| quick_task | 260329-ora-add-failure-mode-tests-for-existing-code | missing |
| quick_task | 260329-p5l-fix-the-issues-identified-in-pr-2-pr-2-r | missing |
| quick_task | 260407-ozt-migrate-docs-conventions-to-claude-rules | missing |
| quick_task | 260411-iwm-fix-thread-sort-to-use-numeric-ordering | missing |
| quick_task | 260411-j3i-form-submit-idempotency-disable-submit-b | missing |
| quick_task | 260411-j8v-show-already-added-indicator-for-project | missing |
| quick_task | 260411-jhw-chart-list-edit-delete-actions-matching | missing |
| quick_task | 260411-js1-chart-images-not-displaying-generate-pre | missing |
| quick_task | 260411-kip-wire-generatethumbnail-into-cover-upload-and-backfi | missing |
| quick_task | 260414-s7s-fix-gallery-view-mode-persistence-back-l | missing |
| uat_gap | Phase 13 (13-UAT.md) | diagnosed |
| verification_gap | Phase 11 (11-VERIFICATION.md) | human_needed |
| verification_gap | Phase 13 (13-VERIFICATION.md) | human_needed |
| todo | rewrite-phase-7-scope.md | stale (Phase 7 shipped in v1.1) |

## Session Continuity

Last session: 2026-05-17T04:42:16.360Z
Stopped at: Phase 17 context gathered
Resume action: `/gsd-plan-phase 17`
Resume file: .planning/phases/17-image-focal-point/17-CONTEXT.md

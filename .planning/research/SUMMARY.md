# Research Summary: v1.2 Track & Measure

**Project:** Cross-Stitch Tracker — Milestone 3
**Domain:** Dashboards, session logging, progress tracking
**Researched:** 2026-04-16
**Confidence:** HIGH

## Executive Summary

v1.2 requires **one new Prisma model** (StitchSession) and **zero new npm dependencies**. The entire milestone builds on established patterns — `$transaction`, R2 presigned URLs, Server Component pages + Client Component wrappers, `nuqs` tab state. Comparable app analysis (Ravelry, StitchStreak, Cross Stitch Journal, StitchPal, Loopsy) confirmed the feature scope: session logging, auto-updating progress, and dashboard pages are table stakes; Buried Treasures, Spotlight, and progress buckets are genuine differentiators.

The three real architectural risks are:
1. **Progress data diverging** if session mutations aren't atomic with `stitchesCompleted` updates
2. **Dashboard queries waterfalling** against Neon cold starts (6+ queries, 300-500ms penalty)
3. **Route rename blast radius** — 50+ hardcoded `/charts` references across 30+ files

## Stack Additions

**Zero new dependencies.** Recharts, TanStack Table, and dnd-kit are NOT needed for v1.2:
- Bar charts and calendar views are v1.3 features
- Dashboard layouts are fixed sections (not draggable widgets)
- Existing table components suffice

**One schema addition:** `StitchSession` model with `@db.Date`, compound index on `[projectId, date]`.

**Reused patterns:** Prisma `aggregate()`/`groupBy()` for dashboard queries, existing R2 presigned URL pattern for session photos, existing gallery infrastructure for Pattern Dive Browse tab.

## Feature Table Stakes vs Differentiators

### Table Stakes (must have)
- Quick session logging (< 15 seconds, 2 required fields)
- Auto-updating project progress from sessions
- Project detail Sessions tab
- Home dashboard with Currently Stitching
- Collection stats at a glance
- Progress visualization (bars/percentages)
- Shopping list with mark-as-acquired workflow
- Project Dashboard with progress overview

### Differentiators (unique value)
- **Buried Treasures** — surfaces forgotten charts; no comparable app does this
- **Spotlight / Rediscover** — random featured project; makes dashboard feel alive
- **Progress buckets** — collection-wide progress distribution; novel visualization
- **Pattern Dive tabs** — What's Next + Fabric Requirements + Storage View in one place
- **Fabric Requirements cross-project view** — "what fabric do I need across all projects with stash matching"
- **Shopping Cart project selection** — "shopping trip planner" vs flat list

### Anti-Features (explicitly avoid)
- Drag-and-drop dashboard widgets — no craft app uses these; fixed layouts
- Built-in stitching timer — user stitches on iPad apps, logs afterward
- Achievement/badge system — v1.3 scope
- Full statistics engine — v1.3 scope
- Negative stitch counts / frogging — allow edit/delete instead

## Architecture Approach

- **StitchSession model** with compound index `[projectId, date]`; no userId (auth scoped through Project ownership)
- **Progress auto-update:** `stitchesCompleted = startingStitches + SUM(sessions.stitchCount)` recalculated atomically in `$transaction` on every session CRUD
- **Dashboard queries:** Fetch full project dataset once (~500 rows), compute sections in TypeScript; session stats use Prisma `groupBy`. Use `Promise.all()` for parallel queries.
- **LogSessionModal:** React context at `(dashboard)/layout.tsx` level — accessed from TopBar, FAB, and project detail
- **Pattern Dive:** Reuses existing gallery infrastructure for Browse tab; three new tabs are independent Client Components with server-side data queries
- **Route strategy:** Keep `/charts` URL path, change nav label only — avoids 50+ file changes

## Critical Pitfalls

1. **Route rename blast radius** — 50+ `/charts` refs in 30+ files. Prevention: label change only.
2. **Dashboard query waterfall** — 6+ queries + Neon cold start = 2+ second loads. Prevention: `Promise.all()`, consolidated queries, Suspense boundaries.
3. **Progress divergence** — Two sources of truth (`stitchesCompleted` field vs session sum). Prevention: atomic `$transaction` updates, never allow direct edit once sessions exist.
4. **Division-by-zero in progress** — `stitchCount = 0` on some charts. Prevention: shared `calculateProgress()` utility with null-safe checks.
5. **Session logging friction** — 5-field modal but daily use requires only 2 actions. Prevention: auto-select recent project, default today's date, optional fields collapsed.
6. **R2 upload category** — Existing validation only accepts "covers" and "files". Prevention: extend upload schema for "sessions" category.

## Suggested Build Order

**Phase 8: Session Logging + Pattern Dive**
- StitchSession model + CRUD + photo uploads
- LogSessionModal (global context)
- Project detail Sessions tab
- Auto-updating progress (`$transaction` pattern)
- Pattern Dive tabs (What's Next, Fabric Requirements, Storage View)
- Charts page nav label rename

**Phase 9: Dashboards + Shopping Cart**
- Main Dashboard (all sections)
- Project Dashboard (progress buckets, finished tab)
- Shopping Cart upgrade (project selection, tabbed types, mark-as-acquired)
- Shared `dashboard-queries.ts` infrastructure

**Rationale:** Sessions must precede dashboards because "last stitched" sort, stitching-day counts, and progress aggregations require real session records.

## Open Questions for Planning

- `@db.Date` vs `DateTime` with midnight convention on `StitchSession.date` — verify Prisma 7 support
- Session pagination strategy for projects with 100+ sessions
- Goals Summary section on Main Dashboard — omit vs placeholder (depends on v1.3 Goal model)
- Estimated completion dates — low complexity, high value; include or defer?

---
*Research completed: 2026-04-16*
*Ready for requirements: yes*

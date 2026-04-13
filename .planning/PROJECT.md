# Cross Stitch Tracker

## What This Is

A personal cross-stitch project management app that replaced a complex Notion system. Tracks 500+ charts through acquisition, kitting, stitching, completion, and finishing — with supply inventory, auto-generated shopping lists, and pre-seeded DMC catalog. Single-user, deployed as a PWA on Vercel.

## Core Value

A stitcher can manage their entire chart collection and supplies faster and more pleasantly than Notion, with comprehensive statistics that make tracking feel rewarding.

## Current Milestone: v1.1 Browse & Organize

**Goal:** Make the collection browsable and visually appealing, with quality-of-life improvements to project setup and supply management.

**Target features:**
- Gallery cards with status-specific layouts
- Gallery/list/table view modes with sorting
- Storage location management with proper CRUD
- Wire fabric selector into chart form
- Per-colour stitch counts & automatic skein calculator
- Rework supply entry workflow
- Complete DMC catalog (DMC 1-149 including Blanc, Ecru)
- Cover image aspect ratio fix
- Thread colour picker scroll UX fix

## Requirements

### Validated

- ✓ App shell with MainNav, TopBar, UserMenu — v1.0
- ✓ Auth.js single-user authentication — v1.0
- ✓ Responsive design (Mac browser + iPhone) — v1.0
- ✓ PWA installable (home screen icon, full-screen launch) — v1.0
- ✓ Design system tokens (emerald/amber/stone, Fraunces/Source Sans 3) — v1.0
- ✓ Full chart/project CRUD with ~50 fields, cover photos, digital file storage — v1.0
- ✓ Status system with 7 statuses (Unstarted through FFO) — v1.0
- ✓ Size category auto-calculation (Mini/Small/Medium/Large/BAP) — v1.0
- ✓ Designer CRUD with dedicated management pages — v1.0
- ✓ Genre management with dedicated management pages — v1.0
- ✓ Pre-seeded DMC thread catalog (459 colors with hex swatches) — v1.0
- ✓ Thread, bead, and specialty item databases — v1.0
- ✓ Project-to-supply linking with per-project quantities (three junction tables) — v1.0
- ✓ Fabric CRUD with size auto-calculation — v1.0
- ✓ Auto-generated shopping lists grouped by project with fulfillment tracking — v1.0

### Active — Milestone 2: Browse & Organize (v1.1)

- [ ] Gallery cards with status-specific layouts (WIP: progress, Unstarted: kitting, Finished: completion)
- [ ] Gallery/list/table view modes with sorting
- [ ] Storage location management with proper CRUD (replacing hardcoded arrays)
- [ ] Wire fabric selector into chart form
- [ ] Per-colour stitch counts & automatic skein calculator
- [ ] Rework supply entry workflow (maintain insertion order, streamlined flow)
- [ ] Complete DMC catalog (fill gaps: DMC 1-149 including Blanc, Ecru)
- [ ] Cover image aspect ratio fix
- [ ] Thread colour picker scroll UX fix

### Active — Milestone 3: Track & Measure

- [ ] Main Dashboard (recently added, currently stitching, buried treasures, spotlight)
- [ ] Pattern Dive (library browser with filtering, fabric requirements, storage views)
- [ ] Quick stitch session logging (date, project, count, optional photo/time)
- [ ] Auto-updating project progress from logged sessions
- [ ] Comprehensive statistics engine (daily/weekly/monthly/yearly metrics)
- [ ] Project Dashboard (active work tracking with goals)
- [ ] Shopping Cart dashboard (aggregated supply and fabric needs)

### Active — Milestone 4: Motivation & Planning

- [ ] Monthly stitch bar charts and stitching calendar view
- [ ] Year in Review tab with 8 stat sections and year selector
- [ ] Goal tracking (project-specific and global, milestone targets, frequency goals)
- [ ] Scheduling plans (project start dates, recurring stitching days, seasonal focus)
- [ ] Multi-style rotation management (Focus+Rotate, Milestone, Daily, Round Robin, Random, Seasonal)
- [ ] Achievement trophy case with auto-tracked milestones, streaks, and records

### Deferred (no phase assigned)

- [ ] Reusable advanced filter bar with configurable dimensions and dismissible chips
- [ ] Series/collection management with completion tracking
- [ ] Auto-calculated kitted status and kitting progress indicators (8 conditions)
- [ ] SAL support (multi-part charts, evolving stitch counts and supply needs)

### Out of Scope

- Social media share card generation — deferred post-MVP
- PWA offline support (service workers) — deferred post-MVP
- Multi-user account architecture — single-user first, multi-user aware
- Import/export functionality — user starting fresh with 500+ charts
- Thread stash inventory (total skeins owned) — per-project tracking is core need
- Additional supply brand pre-seeding (Mill Hill, Kreinik, Anchor) — future if data available
- iPad app integration — no known APIs
- Barcode scanning for supplies — DMC doesn't standardize barcodes
- Rotation schedule generator (auto-planning) — manual management in MVP
- Direct social media posting — deferred post-MVP

## Context

**Current state (v1.0 shipped):**
- 48k LOC TypeScript, 395 tests, deployed to Vercel
- Tech stack: Next.js 16, Prisma 7, Tailwind v4, Auth.js v5 beta, shadcn/ui v4 (Base UI)
- Database: PostgreSQL on Neon (prod), Cloudflare R2 (file storage)
- 15 backlog items captured from smoke testing (see CLAUDE.md backlog section)
- 8 minor tech debt items documented in milestone audit

**Design system:** Emerald/amber/stone palette. Fraunces headings, Source Sans 3 body, JetBrains Mono hero stats. 7 status colors. Full design token CSS.

**50+ components designed:** All sections in `product-plan/` with screenshots. Components map to phases via `.claude/rules/ui-design-reference.md`.

**Data model:** ~20 entities including 9 supply/fabric models. Three separate junction tables (ProjectThread, ProjectBead, ProjectSpecialty). Calculated fields at query time.

**User context:** Power user replacing Notion. 500+ charts. Mac + iPhone. Stitches on iPad apps (Markup R-XP, Saga). Wants speed, comprehensive stats, polished UX.

## Constraints

- **Tech stack**: Next.js 16 / TypeScript / PostgreSQL / Prisma 7 / Tailwind v4 — finalized
- **Design system**: Emerald/amber/stone palette, Fraunces/Source Sans 3/JetBrains Mono — locked
- **Data model**: Three separate junction tables for supplies, not polymorphic
- **Calculated fields**: Computed at query time, never stored redundantly
- **Single user**: Auth.js single-user setup, multi-user aware architecture
- **Budget**: Free tier (Vercel + Neon + R2) for single-user indefinitely
- **Design reference**: Components in `product-plan/` — adapt to Next.js App Router, don't copy Vite code
- **Server-first**: Server Components by default, Client Components only for interactivity
- **CI required**: All code changes through feature branch + PR (branch protection enforced)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Design is source of truth | Scope evolved during design — 7 sections reflect current vision | ✓ Good |
| Year in Review in Stats section | Fits naturally with stats; no standalone section needed | ✓ Good |
| Gallery Cards as shared section | Reusable across dashboards and Pattern Dive | ✓ Good |
| MVP restructure (2026-04-07) | 9-phase waterfall too slow. 4 milestones, 10 phases. Deploy after CRUD + supplies | ✓ Good |
| Designer/genre pages in MVP | User wants proper management, not just inline creation | ✓ Good |
| Fabric bundled with supplies (Phase 4) | Both are "stuff linked to projects"; fabric needed for kitting assessment | ✓ Good |
| Pre-seeded DMC catalog in MVP | Search-and-select is the Notion-beater, not manual entry | ✓ Good |
| Sessions after browsing/dashboards | Collection-level stats don't need sessions; activity stats do | — Pending |
| Kitting auto-calc deferred | 8-condition status is complex; MVP tracks supplies without auto-computing "kitted" | ✓ Good |
| SAL support deferred | Multi-part charts add complexity; core CRUD sufficient for MVP | ✓ Good |
| Zod 3 over Zod 4 | Zod 4 was beta at time of Phase 1; stable 3.24.4 chosen | ✓ Good |
| Lazy R2/Prisma singletons | Graceful degradation when env vars missing (build + dev without R2) | ✓ Good |
| Scrolling form sections over tabs | Chart form has ~50 fields; scrolling sections reduce click-to-field | ✓ Good |
| Three junction tables for supplies | Prisma-idiomatic; polymorphic tables add complexity without benefit | ✓ Good |
| Presigned URLs resolved server-side | R2 credentials stay server-only; avoids client waterfall | ✓ Good |
| Always use PRs for code changes | Branch protection requires CI; never push directly to main | ✓ Good |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-11 after milestone v1.1 started*

# Cross Stitch Tracker

## What This Is

A personal cross stitch project management application replacing a complex Notion-based system. Tracks 500+ charts through their entire lifecycle — acquisition, kitting, stitching, completion, and finishing — along with supply inventory, stitching statistics, auto-generated shopping lists, goal tracking, and rotation management. Single-user first, multi-user aware. Fully designed in DesignOS with 50+ components, design tokens, and screenshots ready for implementation.

## Core Value

A stitcher can manage their entire chart collection and supplies faster and more pleasantly than Notion, with comprehensive statistics that make tracking feel rewarding.

## Requirements

### Validated

(None yet — ship to validate)

### Active — MVP (Milestone 1: Phases 1-4)

- [x] App shell with MainNav, TopBar, UserMenu
- [x] Auth.js single-user authentication
- [x] Basic responsive design (Mac browser + iPhone)
- [x] PWA installable (home screen icon, full-screen launch)
- [x] Full chart/project CRUD with rich metadata (~50 fields), cover photos, digital working copy storage
- [x] Customizable status system with 7 statuses (Unstarted, Kitting, Kitted, In Progress, On Hold, Finished, FFO)
- [x] Size category auto-calculation from stitch count (Mini/Small/Medium/Large/BAP)
- [x] Designer CRUD with dedicated management pages — Validated in Phase 3: Designer & Genre Pages
- [x] Genre management with dedicated management pages — Validated in Phase 3: Designer & Genre Pages
- [ ] Pre-seeded DMC thread catalog (~500 colors with hex swatches)
- [ ] Thread, bead, and specialty item databases (essentials)
- [ ] Project-to-supply linking with per-project quantities (three separate junction tables)
- [ ] Fabric CRUD with size auto-calculation
- [ ] Auto-generated shopping lists grouped by project with fulfillment tracking

### Active — Post-MVP (Milestones 2-4)

- [ ] Gallery card system with 3 status-specific layouts (WIP, Unstarted, Finished)
- [ ] Reusable advanced filter bar with configurable dimensions and dismissible chips
- [ ] Gallery/list/table view modes across all browsing contexts
- [ ] Series/collection management with completion tracking
- [ ] Storage location management
- [ ] Main Dashboard (recently added, currently stitching, buried treasures, spotlight)
- [ ] Pattern Dive (deep library browser with filtering, fabric requirements, storage views)
- [ ] Quick stitch session logging (date, project, count, optional photo, optional time)
- [ ] Auto-updating project progress from logged sessions
- [ ] Comprehensive statistics engine (daily/weekly/monthly/yearly metrics)
- [ ] Project Dashboard (active work tracking with goals and milestones)
- [ ] Shopping Cart dashboard (aggregated supply and fabric needs)
- [ ] Monthly stitch bar charts and stitching calendar view
- [ ] Year in Review tab with 8 stat sections and year selector
- [ ] Goal tracking (project-specific and global, milestone targets, frequency goals, deadlines)
- [ ] Scheduling plans (project start dates, recurring stitching days, seasonal focus)
- [ ] Multi-style rotation management (Focus+Rotate, Milestone, Daily, Round Robin, Random, Seasonal)
- [ ] Achievement trophy case with auto-tracked milestones, streaks, and records

### Deferred (no phase assigned)

- [ ] Auto-calculated kitted status and kitting progress indicators (8 conditions)
- [ ] SAL support (multi-part charts, evolving stitch counts and supply needs)

### Out of Scope

- Social media share card generation — deferred post-MVP
- PWA offline support (service workers) — deferred post-MVP
- Multi-user account architecture — deferred post-MVP, but architectural choices don't preclude it
- Import/export functionality — deferred post-MVP
- Thread stash inventory (total skeins owned, not just per-project) — future extension
- Additional supply brand pre-seeding (Mill Hill, Kreinik, Anchor catalogs) — future if data available
- iPad app integration — no known APIs
- Rotation schedule generator (auto-planning) — manual rotation management in MVP
- Direct social media posting — deferred post-MVP

## Context

**Design system complete:** Emerald/amber/stone color palette. Fraunces headings, Source Sans 3 body, JetBrains Mono hero stats only. 7 status colors mapped to Tailwind classes. Full design token CSS, tailwind config, and font setup documented.

**50+ components designed:** All 7 sections have React components with TypeScript types, sample data, and screenshots in `product-plan/`. Components use relative imports, ready for adaptation to Next.js.

**Design sections map to implementation:**
1. Project Management — chart CRUD, detail views, SAL support
2. Supply Tracking & Shopping — catalogs, linking, shopping lists
3. Stitching Sessions & Statistics — logging, stats engine, Year in Review
4. Fabric, Series & Reference Data — fabric, designers, series, storage
5. Gallery Cards & Advanced Filtering — shared card system, filter bar
6. Dashboards & Views — Main, Pattern Dive, Project, Shopping Cart
7. Goals & Plans — goals, scheduling, rotations, achievements

**Data model:** Complex relational model with ~15 entities. Three separate supply junction tables (ProjectThread, ProjectBead, ProjectSpecialty). Multiple calculated fields (size category, kitting status, progress %, shopping list). Full entity diagram in CROSS_STITCH_TRACKER_PLAN.md section 5.

**Tech stack finalized:** Next.js 14+ (App Router), TypeScript strict, PostgreSQL on Neon, Prisma, Cloudflare R2, Tailwind CSS, TanStack Table, Recharts, dnd-kit, Auth.js, Vercel, PWA.

**User context:** Power user replacing Notion. 500+ charts. Comfortable with technology. Uses Mac + iPhone. Stitches on iPad apps (Markup R-XP, Saga). Wants speed, comprehensive stats, and a polished experience.

## Constraints

- **Tech stack**: Next.js 14+ / TypeScript / PostgreSQL / Prisma / Tailwind — finalized, not negotiable
- **Design system**: Emerald/amber/stone palette, Fraunces/Source Sans 3/JetBrains Mono fonts — designed and locked
- **Data model**: Three separate junction tables for supplies, not polymorphic — Prisma-idiomatic
- **Calculated fields**: Computed at query time, never stored redundantly in database
- **Single user**: Auth.js single-user setup now, multi-user aware architecture
- **Budget**: Free tier (Vercel + Neon + R2) must suffice for single-user indefinitely
- **Design reference**: Components in `product-plan/` — adapt to Next.js App Router patterns, don't copy Vite-specific code directly
- **Server-first**: Server Components by default, Client Components only for interactivity

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Design is source of truth over original plan | Scope evolved during design process — 7 sections reflect current vision | Confirmed |
| Section 8 dropped from MVP | PWA offline, multi-user, import/export, share cards all deferred | Confirmed |
| Year in Review in Section 3 (not separate) | Fits naturally with stats; no need for standalone section | Confirmed |
| Gallery Cards as shared section (5) | Reusable across dashboards and Pattern Dive — avoids duplication | Confirmed |
| Goals & Plans added as Section 7 | Rotation management, achievements, scheduling grew during design | Confirmed |
| **MVP restructure (2026-04-07)** | **Original 9-phase waterfall too slow to deploy. Regroup to 4 milestones, 10 phases. MVP = CRUD + supplies + fabric, then deploy. Post-MVP features prioritized by real usage.** | **Active** |
| Designer/genre pages in MVP | User wants proper management from the start, not just inline creation | Active |
| Fabric bundled with supplies (Phase 4) | Both are "stuff linked to projects"; fabric needed for kitting assessment | Active |
| Pre-seeded DMC catalog in MVP | Search-and-select is the Notion-beater, not manual entry | Active |
| Sessions after browsing/dashboards | Collection-level stats don't need sessions; activity stats do | Active |
| Kitting auto-calc deferred | 8-condition kitting status is post-MVP; MVP tracks supplies but doesn't auto-compute "kitted" | Active |
| SAL support deferred | Multi-part chart uploads add complexity; core chart CRUD is sufficient for MVP | Active |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-07 after MVP restructure*

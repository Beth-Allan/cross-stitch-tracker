# Cross Stitch Tracker

## What This Is

A personal cross-stitch project management app that replaced a complex Notion system. Tracks 500+ charts through acquisition, kitting, stitching, completion, and finishing — with supply inventory, auto-generated shopping lists, pre-seeded DMC catalog, and a comprehensive statistics dashboard with activity charts, personal records, and celebration moments. Single-user, deployed as a PWA on Vercel.

## Core Value

A stitcher can manage their entire chart collection and supplies faster and more pleasantly than Notion, with comprehensive statistics that make tracking feel rewarding.

## Current Milestone: v1.6 Cleanup & Hardening

**Goal:** Address all accumulated backlog items — bug fixes, test gaps, code quality issues, UX polish, cache correctness, and silent failure handling — to harden the app before building new features.

**Target features:**
- Fix HIGH PRIORITY items (supply action tests, shopping cart scaling, TypeScript errors, stats resilience)
- Fill test coverage gaps (skein calculator, calendar rollover, record detection, completion estimates)
- Fix silent failures and cache staleness (session-actions, stats revalidation on chart/supply mutations)
- Code quality improvements (type narrowing, constant deduplication, discriminated unions, comment cleanup)
- UX polish (ARIA violations, focal point overlap, fabric matching, supply UI affordances, shopping pill styling)

## Current State

**Last shipped:** v1.5 Statistics & Records (2026-05-18)
**Phase 22 complete:** Critical Fixes & Test Infrastructure (2026-05-18)
**Phase 23 complete:** Test Coverage & Reliability (2026-05-18)

The app is a fully functional cross-stitch management PWA with: browsable gallery (3 view modes + filters), project detail with tabbed layout and session logging, unified supply table with keyboard-first entry, single-page chart creation/edit form with supply takeover mode, dashboards (Main + Project + Pattern Dive), shopping cart with project selection, image optimization, multi-file working copies per chart, click-to-set focal point control for cover images, and a 3-tab statistics dashboard with lifetime counters, activity charts, stitching calendar, personal records, designer/genre/thread insights, and celebration confetti on record-breaking sessions. 2,029 tests, ~125k LOC TypeScript. Stats page resilient to individual query failures via Promise.allSettled. Session file errors logged instead of silently swallowed, stats cache invalidated on chart status and supply mutations, over-100% stitch count warning.

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
- ✓ Gallery cards with status-specific layouts (WIP progress, kitting dots, celebration borders) — v1.1
- ✓ Gallery/list/table view modes with sorting and view persistence — v1.1
- ✓ Storage location management with proper CRUD and detail pages — v1.1
- ✓ Stitching app management with CRUD and detail pages — v1.1
- ✓ Fabric selector wired into chart form with inline "Add New" — v1.1
- ✓ Per-colour stitch counts & automatic skein calculator with manual override — v1.1
- ✓ Supply entry workflow with insertion order, inline create, and color family filter — v1.1
- ✓ DMC catalog completed to 495 threads (Blanc, Ecru, 1-149 filled) — v1.1
- ✓ Cover image aspect ratio fix (object-contain with letterboxing) — v1.1
- ✓ Thread colour picker scroll UX fix with viewport collision detection — v1.1
- ✓ Project detail page with hero banner, tabbed layout, supplies tab — v1.1
- ✓ Search and filter by name, designer, status, and size category — v1.1
- ✓ Quick stitch session logging (date, project, count, optional photo/time) — v1.2
- ✓ Auto-updating project progress from logged sessions (atomic with session mutations) — v1.2
- ✓ Project detail Sessions tab (per-project session history with mini stats) — v1.2
- ✓ Session edit and delete with atomic progress recalculation — v1.2
- ✓ Progress photo upload with sessions via R2 — v1.2
- ✓ Log Session modal accessible from header, project detail, and dashboard — v1.2
- ✓ Pattern Dive (Charts page with Browse, What's Next, Fabric Requirements, Storage View tabs) — v1.2
- ✓ Main Dashboard (Currently Stitching, Start Next, Buried Treasures, Spotlight, Collection Stats, Quick Add) — v1.2
- ✓ Project Dashboard (hero stats, 5 progress buckets with sorting, Finished tab with 4 sort dimensions) — v1.2
- ✓ Shopping Cart upgrade (project selection, tabbed supply aggregation, quantity stepper, IDOR protection) — v1.2
- ✓ Image optimization on upload — covers and session photos converted to 1200px WebP q80 via Sharp — v1.2
- ✓ Unified supply table with grouped sections, SVG donuts, keyboard-first persistent add row, portal autocomplete, inline editing — v1.3
- ✓ Supply table reusable on project detail Supplies tab with server-action persistence — v1.3
- ✓ Single-page merged form for chart+project creation with pattern type cards, draft persistence, sticky save bar — v1.3
- ✓ Supply takeover mode with fabric assignment, skein calculator card, two-phase atomic save — v1.3
- ✓ Full-page edit mode using merged form layout, accessible from project detail and gallery kebab menu — v1.3
- ✓ Deprecated component cleanup (21 files, 3,700+ lines removed) — v1.3
- ✓ Multiple digital working copies per chart (ChartFile model, multi-file upload, per-file lifecycle) — v1.4
- ✓ SearchToAdd keystroke fix (single-input architecture, results-only portal) — v1.4
- ✓ Dashboard Spotlight sizing (320px column, matched buttons) — v1.4
- ✓ Click-to-set focal point for cover images across all display contexts — v1.4
- ✓ Stats computation engine with timezone-aware queries, caching, and auto-invalidation — v1.5
- ✓ Stats page with 3-tab layout (Overview, Activity, Records) and 17 parallel queries — v1.5
- ✓ Lifetime hero counters (stitches, sessions, time, completions) with rolling time-window metrics — v1.5
- ✓ Collection breakdown charts (status, size, designer, genre) with interactive ranked lists — v1.5
- ✓ Monthly stitch bar chart with click-to-drill-down detail — v1.5
- ✓ Stitching calendar (month-view grid, project color-coding, month navigation) — v1.5
- ✓ Session history table (sortable, paginated, filterable by project) — v1.5
- ✓ Day-of-week patterns, rolling averages (7/30/90-day), month-over-month pace trends — v1.5
- ✓ Personal bests board with year-scoped records and fastest completions by size category — v1.5
- ✓ "New record!" celebration toast with canvas-confetti on record-breaking sessions — v1.5
- ✓ Designer/genre/thread insights with color swatches and completion rates — v1.5
- ✓ Completion estimates for active projects with progress bars — v1.5

### Active

(Defining requirements for v1.6 Cleanup & Hardening)

### Deferred (no phase assigned)

- [ ] Comprehensive year in review tab with 8 stat sections and year selector
- [ ] Contextual stats sprinkled into existing pages (Pattern Dive, project detail, dashboard)
- [ ] Goal tracking (project-specific and global, milestone targets, frequency goals)
- [ ] Scheduling plans (project start dates, recurring stitching days, seasonal focus)
- [ ] Multi-style rotation management (Focus+Rotate, Milestone, Daily, Round Robin, Random, Seasonal)
- [ ] Achievement trophy case with auto-tracked milestones, streaks, and records
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
- Social leaderboards / comparisons — single-user app
- AI-generated insights / recommendations — data should speak for itself
- Real-time stitching timer on stats page — timer belongs to session logging UX
- Cross-project comparison view — comparing a mini to a BAP is meaningless
- Historical supply price tracking — data entry nightmare for 500+ charts

## Context

**Current state (v1.5 shipped):**
- 1,967 tests, ~125k LOC TypeScript, deployed to Vercel
- Tech stack: Next.js 16, Prisma 7, Tailwind v4, Auth.js v5 beta, shadcn/ui v4 (Base UI)
- Database: PostgreSQL on Neon (prod), Cloudflare R2 (file storage)
- 40+ backlog items captured (see CLAUDE.md backlog section)
- Stats dashboard: 3-tab layout with 17 parallel cached queries, Recharts charts, unstable_cache with tag-based invalidation
- Two runtime deps added in v1.5: Recharts 3.8.0 (via shadcn chart), date-fns 4.1.0 + @date-fns/tz 1.4.1
- All prior features intact: gallery, project detail, supply table, merged form, dashboards, shopping cart, session logging, focal point, file management

**Design system:** Emerald/amber/stone palette. Fraunces headings, Source Sans 3 body, JetBrains Mono hero stats. 7 status colors. Full semantic design tokens (bg-card, text-muted-foreground, etc.). 44px+ touch targets on interactive elements.

**50+ components designed:** All sections in `product-plan/` with screenshots. Components map to phases via `.claude/rules/ui-design-reference.md`.

**Data model:** ~20 entities including 9 supply/fabric models. Three separate junction tables (ProjectThread, ProjectBead, ProjectSpecialty). Calculated fields at query time. Per-colour stitch counts with skein calculator formula.

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
| Sessions after browsing/dashboards | Collection-level stats don't need sessions; activity stats do | ✓ Good |
| Throw-inside-$transaction for fabric guard | Keeps $transaction atomic while surfacing user-friendly errors | ✓ Good |
| Custom DOM event for QuickAdd→LogSession | Server Component can't pass function children to Client; DOM event bridge avoids coupling | ✓ Good |
| CSS stacked bar over charting library | Simpler, no dependency, matches design spec exactly | ✓ Good |
| localStorage for shopping cart selection | Persists project selection across page refreshes without server state | ✓ Good |
| Single Prisma query for project dashboard | findMany with all includes, in-memory aggregation — avoids N+1 | ✓ Good |
| Promise.all for dashboard data fetching | Avoids Neon cold start waterfall on parallel queries | ✓ Good |
| InlineNameEdit + DeleteEntityDialog reusable pattern | Storage/app pages share identical CRUD UX; extract once, reuse | ✓ Good |
| SearchableSelect with inline "Add New" | Avoids navigating away from chart form to create new entities | ✓ Good |
| Gallery view modes with URL state | nuqs for URL params, localStorage fallback for persistence | ✓ Good |
| Status-specific gallery card footers | WIP/Unstarted/Finished each show relevant info; data-driven kitting dots | ✓ Good |
| Skein formula: 1.3 constant | Validated against community calculators; replaced initial 6.0 overestimate | ✓ Good |
| Native select for color family filter | Simpler than shadcn Select inside floating SearchToAdd panel | ✓ Good |
| Tabbed project detail (Overview + Supplies) | Separates browsing from supply management; URL-persisted tab state | ✓ Good |
| TooltipTrigger without asChild | Avoids nested button hydration issues with Base UI | ✓ Good |
| Kitting auto-calc deferred | 8-condition status is complex; MVP tracks supplies without auto-computing "kitted" | ✓ Good |
| SAL support deferred | Multi-part charts add complexity; core CRUD sufficient for MVP | ✓ Good |
| Zod 3 over Zod 4 | Zod 4 was beta at time of Phase 1; stable 3.24.4 chosen | ✓ Good |
| Lazy R2/Prisma singletons | Graceful degradation when env vars missing (build + dev without R2) | ✓ Good |
| Scrolling form sections over tabs | Chart form has ~50 fields; scrolling sections reduce click-to-field | ✓ Good |
| Three junction tables for supplies | Prisma-idiomatic; polymorphic tables add complexity without benefit | ✓ Good |
| Presigned URLs resolved server-side | R2 credentials stay server-only; avoids client waterfall | ✓ Good |
| Always use PRs for code changes | Branch protection requires CI; never push directly to main | ✓ Good |
| React Activity for form/supply toggle | Preserves form state without unmounting; CSS visibility swap | ✓ Good |
| SupplyTableAdapter interface | Server-action vs. local-state adapters; same table component in both contexts | ✓ Good |
| Two-phase atomic save on create | createChart first, then batchAddSuppliesToProject in $transaction | ✓ Good |
| PortalAutocomplete from Base UI Combobox | Escapes table stacking context; extracted from existing SearchToAdd | ✓ Good |
| Zero new npm dependencies for v1.3 | Everything built with installed stack; no bundle growth | ✓ Good |
| Draft persistence in localStorage | saveDraft/loadDraft/clearDraft with stale ID detection and schema evolution | ✓ Good |
| ChartFile model replacing single URL | Multiple working copies need independent lifecycle; migration script for data | ✓ Good |
| Single-input portal autocomplete | Dual-input caused focus-steal keystroke drops; results-only portal eliminates issue | ✓ Good |
| Normalized 0-1 focal point coordinates | Resolution-independent; CSS object-position conversion via utility function | ✓ Good |
| ResizeObserver for focal point container | getBoundingClientRect on click only; observer handles layout shifts | ✓ Good |
| Zero new npm dependencies for v1.4 | Focal point, file management — all pure CSS + existing stack | ✓ Good |
| Recharts via shadcn chart component | Consistent with design system; shadcn wraps Recharts with CSS variable theming | ✓ Good |
| unstable_cache with tag-based invalidation | 5-min TTL for current data, 1-hour for historical; revalidateTag("stats") on session mutations | ✓ Good |
| TZDate for timezone boundaries | date-fns/tz ensures session at 11pm Pacific counts as correct local date | ✓ Good |
| 17 parallel queries via Promise.all | Extends existing dashboard pattern; avoids Neon cold start waterfall | ✓ Good |
| nuqs for stats URL state | Tab selection, year scope, session table sort/page/filter — all URL-persisted | ✓ Good |
| Server Components for stats layout | StatsOverview, ActivityOverview, RecordsOverview are all Server Components; only charts and interactive controls are Client | ✓ Good |
| canvas-confetti for celebrations | Lightweight (6KB), main-thread fallback avoids CSP worker-src issues | ✓ Good |
| Record detection in createSession | detectBrokenRecords runs after session insert, returns broken records for client-side celebration | ✓ Good |

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
*Last updated: 2026-05-18 after Phase 23 completion*

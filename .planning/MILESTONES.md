# Milestones

## v1.8 Series & Collections (Shipped: 2026-07-01)

**Delivered:** Series organization for chart collections — full CRUD with dual progress tracking, dedicated management/detail pages, chart form integration with inline create, and Pattern Dive Series tab with Browse tab filtering.

**Stats:** 4 phases, 11 plans | 124 commits | 2,399 tests | 38 days (2026-05-24 → 2026-07-01)

**Key accomplishments:**

1. **Data Foundation** — Series Prisma model with CRUD actions, Zod validation, dual progress computation (owned/total + finished/owned), TS test error fixes, stats Promise.allSettled resilience
2. **Series Management Pages** — /series list page with card grid + sort pills + create modal + delete, /series/[id] detail page with chart rows + inline editing + dual progress display
3. **Chart Form Integration** — Series SearchableSelect with inline create dialog (InlineNameDialog), designer auto-populate, seriesId flow-through to chart create/update actions
4. **Browse & Pattern Dive** — SeriesTabContent with sortable progress cards as 5th Pattern Dive tab, Browse tab series filter with "Unassigned" option via useGalleryFilters hook

**Known deferred items at close:** 16 (see STATE.md Deferred Items)
**PRs:** #56 (Phase 31), #57 (Phase 32), #61 (Phase 33), #62 (Phase 34)

---

## v1.6 Cleanup & Hardening (Shipped: 2026-05-20)

**Delivered:** Comprehensive hardening pass — security gaps closed, test infrastructure modernized, 16 type quality improvements, shopping cart scaled to 75+ projects, and 14 UX polish items addressing ARIA compliance, visual consistency, and component affordances.

**Stats:** 5 phases, 15 plans | 168 commits | 2,176 tests | 3 days (2026-05-18 → 2026-05-20)

**Key accomplishments:**

1. **Critical Fixes & Test Infrastructure** — Supply ownership validation, Promise.allSettled stats resilience, createMockPrisma() with $transaction defaults, mockTransaction() helper, 3 test files fixed
2. **Test Coverage & Reliability** — Edge case tests (calendar year-rollover, duplicate record detection, completion estimate exclusions), R2 file error surfacing, deleteSession photo cleanup, over-100% progress guardrail, revalidateTag on chart status + supply mutations
3. **Code Quality** — Literal unions (strandCount, MonthLabel, DayLabel), PersonalBestRecord discriminated union, shared buildDateFilter/Scope, SORT_FIELDS deduplication, 47 WHAT-comments + JSX markers removed, semantic tokens in log-session-modal, assertSuccess/assertFailure helpers, vacuous assertion sweep (43 instances)
4. **Shopping Cart Scaling** — Project search, status grouping (Kitting/Stitching/Unstarted), supply-type search, smart selection with dual-mode counter, responsive with 75+ projects
5. **UX Polish** — ARIA card rows, keyboard-gated SearchToAdd highlight, EditableNumber rejection flash, visible commit button, contextual InlineCreateDialog labels, focal point editor split, cover image aspect ratio, BucketProject focal point, fabric matching fix, What's Next gallery cards + kitting labels

**Known deferred items at close:** 18 (see STATE.md Deferred Items)
**PRs:** #41 (Phase 22), #42 (Phase 23), #44 (Phase 24), #49 (Phase 25), #50 (Phase 26)

---

## v1.5 Statistics & Records (Shipped: 2026-05-18)

**Delivered:** A comprehensive statistics dashboard with lifetime counters, activity charts, stitching calendar, personal records board, celebration confetti, and supply/designer/genre insights — making every stitch feel measured and rewarding.

**Stats:** 4 phases, 14 plans | ~170 commits | 1,967 tests | 2 days (2026-05-17 → 2026-05-18)

**Key accomplishments:**

1. **Stats Engine & Charting Foundation** — Server-side query layer with unstable_cache, timezone-aware date boundaries via TZDate, Recharts integration with design system tokens, 3-tab stats page shell
2. **Hero Stats & Collection Overview** — Lifetime counters (stitches, sessions, time, completions), rolling time-window metrics, interactive collection breakdown charts (status, size, designer, genre) with ranked lists
3. **Activity Visualization & Calendar** — Monthly stitch bar chart with click-to-drill-down, navigable stitching calendar with project color-coding, sortable/paginated session history table, day-of-week patterns, rolling averages (7/30/90-day), month-over-month pace trends
4. **Records, Insights & Celebrations** — Personal bests board with year-scoped records, fastest completions by size category, "New record!" celebration toast with canvas-confetti, designer/genre/thread insights with color swatches, completion estimates for active projects

**Known deferred items at close:** 18 (see STATE.md Deferred Items)
**PRs:** #39 (Phase 20), #40 (Phase 21)

---

## v1.4 Fixes & Polish (Shipped: 2026-05-17)

**Delivered:** Multiple working copy files per chart, SearchToAdd keystroke fix, Dashboard Spotlight sizing, and click-to-set focal point control for cover images across all display contexts.

**Stats:** 3 phases, 9 plans | 153 commits | 1,641 tests | 2 days (2026-05-16 → 2026-05-17)

**Key accomplishments:**

1. **Chart File Management** — New ChartFile model with multi-file upload to R2, per-file add/remove lifecycle, presigned URL downloads, and migration from legacy single-URL field
2. **SearchToAdd Keystroke Fix** — Single-input architecture with results-only portal replacing focus-stealing dual-input; zero dropped keystrokes on fast typing
3. **Dashboard Spotlight Sizing** — 320px fixed column, 300px max-height image, matched button styling with consistent buttonVariants
4. **Focal Point Control** — Click-to-set anchor for cover images with crosshair marker, 4:3 crop guide overlay, keyboard accessibility (Enter/Space), and CSS object-position propagation across all 8+ display contexts
5. **Security & Validation** — Threat mitigations verified for Phases 15 and 17; Nyquist compliance across all phases (9 test gaps filled)

**PR:** #34 (Phase 16), #35 (Phases 15 + 17)

---

## v1.3 Form & Supply Overhaul (Shipped: 2026-05-16)

**Delivered:** Keyboard-driven unified supply table, single-page chart+project creation form, supply takeover mode with skein calculator, full edit mode, and removal of all deprecated components.

**Stats:** 5 phases, 19 plans | 190 commits | 1,535 tests | 13 days (2026-05-03 → 2026-05-16)

**Key accomplishments:**

1. **Unified Supply Table** — Keyboard-first supply entry with grouped Thread/Beads/Specialty sections, SVG donut indicators, portal autocomplete, inline editing, and persistent add row
2. **Project Detail integration** — Supply table reused on project detail Supplies tab with server-action adapter for immediate persistence
3. **Merged Form** — Single-page chart+project creation (720px max-width) with pattern type card grid, green dot required indicators, draft persistence, and sticky save bar
4. **Supply Takeover** — Form-to-supply transition with sticky summary bar, fabric assignment feeding skein calculator, segmented calc parameter controls, and two-phase save
5. **Edit Mode & Cleanup** — Full-page edit route reusing merged form, list-row kebab menu navigation, 21 deprecated components removed from codebase

**Known deferred items at close:** 23 (see STATE.md Deferred Items)
**PR:** #32

---

## v1.2 Track & Measure (Shipped: 2026-04-20)

**Delivered:** Session logging with atomic progress tracking, Pattern Dive collection browser, Main Dashboard with curated sections, Project Dashboard with progress buckets, and Shopping Cart with project selection and supply aggregation.

**Stats:** 2 phases, 20 plans | 153 commits | 1,172 tests | 4 days (2026-04-16 → 2026-04-20)

**Key accomplishments:**

1. **Session logging** — StitchSession model with create/edit/delete from header, project detail, and dashboard; atomic progress auto-update via $transaction; progress photo upload to R2
2. **Pattern Dive** — Charts page evolved with 4 specialized tabs: Browse, What's Next (kitting readiness), Fabric Requirements (stash matching + assignment), Storage View (location grouping)
3. **Main Dashboard** — Currently Stitching, Start Next, Buried Treasures, Spotlight with shuffle, Collection Stats sidebar, Quick Add menu with 8 creation options
4. **Project Dashboard** — Hero stats grid, CSS stacked bar chart, 5 progress buckets with sorting, Finished tab with 4 sort dimensions and expandable stat cards
5. **Shopping Cart upgrade** — Project selection with localStorage persistence, tabbed supply aggregation with badge counts, quantity stepper with IDOR protection

**PRs:** Phase 8 (merged), #18 (Phase 9)

---

## v1.1 Browse & Organize (Shipped: 2026-04-16)

**Delivered:** A browsable, visually rich collection experience with gallery views, project detail pages, and an integrated skein calculator.

**Stats:** 3 phases, 20 plans, 33 tasks | 225 commits | 867 tests | 5 days (2026-04-11 → 2026-04-15)

**Key accomplishments:**

1. **Storage & app management** — Full CRUD pages for storage locations and stitching apps with detail views showing assigned projects
2. **Chart form integration** — DB-backed dropdowns with inline "Add New" for storage, app, and fabric selection; DMC catalog completed to 495 threads
3. **Gallery experience** — Status-specific gallery cards (WIP progress, kitting dots, celebration borders) with gallery/list/table views, sorting, search, and filtering
4. **Project detail page** — Hero cover banner with blur background, interactive status badge, tabbed Overview + Supplies layout
5. **Skein calculator** — Per-colour stitch counts with auto-calculated skein estimates from fabric count, strand count, and 20% waste factor
6. **Supply workflow redesign** — SearchToAdd with inline create, color family filter, insertion-order entry, and visual redesign matching InfoCard aesthetic

**PRs:** #7 (Phase 5), #15 (Phase 6), #16 (Phase 7)

---

## v1.0 MVP — Replace Notion (Shipped: 2026-04-11)

**Delivered:** A fully functional cross-stitch project tracker replacing Notion, deployed to Vercel with Neon DB and Cloudflare R2 storage.

**Stats:** 4 phases, 23 plans, 44 tasks | 48k LOC TypeScript | 395 tests | 22 days (2026-03-20 → 2026-04-11)

**Key accomplishments:**

1. **Foundation** — Next.js 16 + Prisma 7 + Tailwind v4 scaffold with Auth.js v5 single-user auth, responsive app shell, and PWA manifest
2. **Chart management** — Full CRUD with ~50 fields, 7-stage status system, cover photos via presigned R2 URLs, size auto-calculation, inline designer/genre creation
3. **Designer & genre pages** — Dedicated management pages with sortable tables, search, CRUD modals, detail views with computed stats
4. **Supply tracking** — Pre-seeded DMC catalog (459 colors), thread/bead/specialty/fabric CRUD, project-supply linking with quantities, auto-generated shopping lists
5. **Quality** — TDD throughout, security audit (26 threats reviewed), impeccable UI audits, 12 smoke-test fixes post-deploy
6. **Deployed** — Live at Vercel with Neon prod DB, R2 CORS configured, 15 backlog items captured for M2

**Tech debt (8 minor items):** See `milestones/v1.0-MILESTONE-AUDIT.md`

---

# CLAUDE.md

## Current Status

<!-- UPDATE THIS SECTION at the end of every work session -->

**Milestone:** 2 (Browse & Organize) | **Phase:** 6 — verified & complete
**Last Updated:** 2026-04-15
**Roadmap:** 4 milestones / 11 phases — v1.0 shipped, M2 phases 5-6 complete, phase 7 next

### Done

- **v1.0 MVP shipped** (2026-04-11): 4 phases, 23 plans, 48k LOC, 395 tests, tagged `v1.0`
  - Full details: `.planning/MILESTONES.md` and `.planning/RETROSPECTIVE.md`
  - Archived to: `.planning/milestones/v1.0-*`
  - Live at: https://cross-stitch-tracker-adolwyn.vercel.app
- 12 quick-fix tasks completed post-deploy (thread sort, idempotency, thumbnails, etc.)
- **Phase 5: Foundation & Quick Wins** (2026-04-12–13): 8 plans, 506 tests passing
  - Storage Location & Stitching App CRUD (data layer + UI)
  - Chart form wired to database-backed dropdowns with inline "Add New"
  - Fabric selector wired in chart form
  - Cover image aspect ratio fix, thread picker scroll fix, DMC catalog completed
  - Gap closure: Prisma client regen + onAddNew handlers
  - Gap closure: SearchableSelect "Add New" only shows with search text, thread picker stays open for multi-add
  - Gap closure: SearchableSelect forceMount (spaces in search), thread picker viewport flip
  - **Database sync required:** `prisma db push` needed after schema changes (no migration created)
- **Phase 5 audit + harden + polish** (2026-04-12): impeccable:audit scored 15/20, all P1-P2 fixes applied
  - Fixed blur-cancels-tab bug in InlineAddRow, added aria-labels, wired label association on SearchableSelect
  - Replaced transition-all, added responsive breakpoint, removed dead code — score now 17/20
- **Critique report infrastructure fixes** (2026-04-12): addressed P3/P4 from critique (scored 24/40)
  - 11 loading.tsx skeleton screens (all dashboard routes), global-error.tsx, not-found.tsx
  - Sidebar nav grouped into 4 labeled sections (Projects, Track, Reference, System) with dividers — desktop + mobile
  - Polish: transition-colors, semantic avatar tokens, max-w-7xl content constraint, font-heading consistency
- **Phase 5 code review** (2026-04-13): 38 files reviewed, 3 critical + 3 warning + 3 info findings
  - Critical: authz bypass in storage/stitching app actions, hardcoded `@default("1")` on Project.userId
- **Human UAT session** (2026-04-13): 5 passed, 1 blocked
  - Fixed: SearchableSelect "Add New" now opens InlineNameDialog (matches designer pattern) instead of silent no-op
  - Added: InlineNameDialog component, use-chart-form handler tests, integration tests with real cmdk
  - Fixed: Thread picker flipUp positioning — `bottom-full` sent panel off-screen on long lists, changed to `bottom-0`
  - Fixed: Click-outside handler timing — replaced rAF with 200ms timestamp guard
  - Passed: Storage CRUD, Stitching App, Add New dialog, Fabric selector, Thread picker multi-add
  - Blocked: Cover image (no local file storage configured)
- **Code review fixes** (2026-04-13): 3 critical findings fixed
  - WR-01: try/catch around deleteChart in startTransition
  - WR-02: userId filter on storage location and stitching app list queries
  - WR-03: userId scoping to fabric actions via linked project ownership
- **Phase 5 shipped** (2026-04-13): PR #7 — 74 commits, 126 files, 535 tests, 8 REQ-IDs
- **PR review round 1 fixes** (2026-04-13): all 5 critical + 6 important findings addressed
  - C1-C2: Removed try/catch from 12 read-only actions (error boundaries handle DB failures)
  - C3: Wrapped chart+fabric operations in `$transaction`
  - C4-C5: Added fabric ownership rejection + getUnassignedFabrics tests
  - I1-I6: ProjectStatus type, SearchToAdd error state, fabric ownership check, delete dialog retry, auth guard tests, form error logging
  - 546 tests passing, build clean
- **PR review round 2 fixes** (2026-04-12): all 3 critical + 8 important + 9 suggestions addressed
  - C1: createFabric ownership check on linkedProjectId
  - C2: Removed error-swallowing try/catch from 6 read-only designer/genre actions
  - C3: InlineNameEdit stays in edit mode on save failure (callers re-throw)
  - I1-I2: Happy-path tests for createChart + updateChart fabric link/unlink logic
  - I3: try/catch on handleDelete in 4 components, I4: semantic tokens in global-error
  - I8: Thumbnail failure → console.error + warning field + client toast
  - S1-S2: Flattened \_count.projects → projectCount, extracted EntityProject type
  - S5: Removed dead ChartListItem/ChartDetail types, S8: stale Prisma comment
  - 567 tests passing, TypeScript clean
- **PR review round 3 fixes** (2026-04-12): 2 critical + 6 important findings addressed
  - C1: updateChart now returns thumbnail warning (mirrors createChart)
  - C2: Series hint changed from stale "Phase 5" to "Coming soon"
  - I1: DeleteChartDialog stays open on failure, I2-I3: console.error in empty catches
  - I4: Cover image shows error on presigned URL failure
  - I5: createChart fabric ownership rejection test, I6: expanded fabric ownership comment
  - 568 tests passing, TypeScript clean

### In Progress

- **Phase 6: Gallery Cards & View Modes** — all 4 plans executed + visual verification + audit fixes applied
  - 06-01: Data layer, types, URL state hook, server action (66 tests)
  - 06-02: GalleryCard with 3 status-specific footers (37 tests)
  - 06-03: FilterBar, FilterChips, MultiSelectDropdown, SortDropdown, ViewToggleBar (31 tests)
  - 06-04: GalleryGrid, ProjectGallery orchestrator, /charts page wiring, sidebar rename
  - **Visual verification fixes** (2026-04-13): back link Charts→Projects, thumbnails in list/table views, table bg-card + underline links, kitting dots reworked to data-driven (quantityAcquired vs quantityRequired) with new "partial" amber state
  - **Impeccable audit** (2026-04-13): scored 14/20 — all P1/P2 findings addressed across 4 skills:
    - `/harden`: ARIA on dropdowns (aria-expanded, listbox/option roles, keyboard nav), search aria-label, 44px touch targets, chip hit areas, header wrapping, search chip truncation
    - `/optimize`: lazy loading + decoding=async on all images, removed backdrop-blur GPU cost, cached Intl.NumberFormat
    - `/adapt`: ListView grid collapses to 3 columns on mobile (was 7-column inline grid)
    - `/polish`: extracted shared formatters, STATUS_GRADIENTS → Tailwind classes with dark: variants, celebration styles → class-based with boosted dark shadow opacity, ~30 stone-\* neutrals → semantic tokens
  - **Impeccable critique** (2026-04-13): scored 26/40 on Nielsen's heuristics, AI slop PASS
    - 4x P2 findings: ARIA violation (role="checkbox" in role="option"), search clear button, sort direction visibility, Progress/Stitches shared sort field
    - 2x P2 additions: ListView missing role="list", styled tooltips for kitting dots + size categories
    - 1x P3: loading skeleton doesn't match gallery card grid layout
    - Minor: duplicate kitting icon code, hardcoded stone colors, dual transition utilities
    - Full report: `.planning/phases/06-gallery-cards-view-modes/CRITIQUE.md`
  - **Critique fixes** (2026-04-13): all P2/P3 findings + minor items addressed
    - `/harden` pass 1: Removed invalid role="checkbox" in role="option", added role="list"/role="listitem" to ListView
    - `/harden` pass 2: Search clear button, directional sort arrow, new "progress" sort field (Progress/Stitches now sort independently)
    - `/harden` pass 3: Styled Base UI tooltips on kitting dots + size badges (all 3 views), shared KittingDotIcon export, stone-\* → semantic tokens
    - `/polish`: Loading skeleton matches gallery card grid, fixed dual transition override, empty filter state has suggestion text + "Clear all filters" button
  - **Critique re-run** (2026-04-13): scored 28/40 on Nielsen's heuristics, AI slop PASS (2 false positives)
    - 3x P2 findings: search only matches project name (not designer), view toggle title tooltips invisible on touch, list view mobile too sparse
    - 2x P3 findings: gallery grid not center-justified, loading skeleton missing page header
  - **Critique re-run fixes** (2026-04-13): all P2/P3 findings addressed
    - `/harden`: Search matches designer name + project name; view toggle uses Base UI Tooltip (touch-accessible)
    - `/adapt`: List view mobile 4-column grid with StatusBadge + compact stat line (ListMobileStat)
    - `/layout`: Gallery grid centered with justify-center
    - `/polish`: Loading skeleton restructured to match real page layout (header + separator + toggle bar)
    - 148 gallery tests passing, TypeScript clean
  - **UAT verified** (2026-04-15): 9/10 passed, 1 dev-only hydration issue (Turbopack cache staleness — not a code bug)
  - **Phase 6 complete** (2026-04-15): marked complete in ROADMAP + STATE, transitioned to Phase 7

### Next Up

1. Phase 6 ship (PR + review)
2. `/gsd-discuss-phase 7` — Skein Calculator & Supply Workflow

### Backlog (post-MVP)

- **999.0: Multiple digital working copies per chart (HIGH PRIORITY)** — support multiple files per chart (PDF, Saga .saga/.oxs/.xsd, Pattern Keeper .pdf, etc.). Needs ChartFile table (name, type, key, chartId) to replace single digitalWorkingCopyUrl field.
- **999.0.1: Wire fabric selector in chart form (HIGH PRIORITY)** — fabric CRUD exists (Phase 4) but chart form still shows disabled "Phase 5" placeholder. Wire dropdown to fetch unassigned fabrics, save linkedProjectId. Also update Series placeholder.
- **999.0.2: Per-colour stitch counts & skein calculator (HIGH PRIORITY)** — when adding thread colours to a chart, allow entering stitch count per colour; auto-calculate skeins needed (based on fabric count, strand count, stitch type); sum per-colour counts for total stitch count; needs manual override for charts without per-colour data; future: track stitch types (cross, backstitch, french knots, etc.) which affect thread usage differently
- 999.0.4: Duplicate chart detection — add a check (by name + designer) to warn before creating a chart that may already exist
- 999.0.7: Rework project supply entry workflow — supplies should maintain insertion order during entry (easier to verify nothing skipped); detail page can sort independently; consider a dedicated "set up project" flow that combines chart creation + supply entry in one workflow
- 999.0.9: Incomplete DMC thread catalog — seed data starts at DMC 150, missing 1-149 (including Blanc, Ecru) plus any other gaps; need complete fixture file (~500+ colours)
- 999.0.10: Quick-add missing supplies from project detail page — if a thread/bead/specialty item isn't in the catalog, allow inline creation without navigating away to the supplies page
- 999.0.12: Collapsible projects in shopping list — list gets long fast; projects should be collapsible with collapsed as the default state
- 999.0.13: Thread colour picker scroll UX — adding thread colours doesn't auto-scroll to keep the search box/+Add more button visible; needs scrollIntoView or similar when adding items
- 999.0.15: SearchToAdd panel positioning for long lists — when flipUp activates, panel overlays existing thread rows (bottom-0); ideally should use a portal or anchor to the "+ Add more" button so it opens adjacent without covering content
- 999.0.16: SearchToAdd highlight conflict — first item starts with bg-muted highlight (highlightIndex=0) which clashes with hover:bg-muted on other items; should only show keyboard highlight after arrow key use, not on initial render
- 999.0.14: Project Bin & iPad App management — "Add New" with empty search creates "New Location" with no way to rename; need proper add/edit/delete for storage locations and stitching apps (currently hardcoded arrays in project-setup-section.tsx)
- 999.0.17: StorageLocation/StitchingApp multi-user hardening — add @@unique([userId, name]) and @@index([userId]) to both models in schema.prisma (no uniqueness check at DB or app level currently); also add ownership validation on writes in chart-actions.ts createChart/updateChart — storageLocationId and stitchingAppId are passed directly without verifying they belong to user.id (fabric already has this check, these don't)
- 999.0.18: Test infrastructure cleanup for $transaction — createMockPrisma() should default $transaction to handle both callback and array forms (duplicated in chart-actions-errors/thumbnail tests); also fix vacuous $transaction assertions in delete tests (storage-location, stitching-app, designer, genre) where calling mock methods inside toHaveBeenCalledWith records side-effect calls and compares undefined values
- 999.0.19: Refactor clickable card rows to avoid nested interactive elements — storage-location-list.tsx and stitching-app-list.tsx use role="button" div containing Rename/Delete buttons (ARIA violation); restructure so navigable element and action buttons are siblings
- 999.1: Supply detail modal (read-only view with "used in projects" list)
- 999.2: Bulk supply editor
- 999.3: Fabric type hierarchy (replace flat dropdown)
- 999.4: Project supplies as separate tab
- 999.5: Supplies page first-load view flash (URL param fixes refresh, but first navigation still shows default view briefly before localStorage kicks in — investigate SSR cookie or middleware approach)
- 999.6: Cover image preview aspect ratio — h-32 + object-cover crops tall/square images into a narrow strip; use object-contain or dynamic aspect ratio (cover-image-upload.tsx:155)

### Blockers

- `.env.local` bcrypt hashes must escape `$` as `\$`

---

## Project

Cross-stitch project management app replacing Notion. Tracks 500+ charts through acquisition, kitting, stitching, completion, finishing — plus supplies, statistics, shopping lists.

**Full requirements:** `CROSS_STITCH_TRACKER_PLAN.md`
**Design context:** `docs/design-context.md`
**Core value:** Manage charts and supplies faster than Notion, with statistics that make tracking rewarding.

---

## Tech Stack

| Layer        | Choice                  |
| ------------ | ----------------------- |
| Framework    | Next.js 16 (App Router) |
| Language     | TypeScript (strict)     |
| Database     | PostgreSQL on Neon      |
| ORM          | Prisma 7                |
| File Storage | Cloudflare R2           |
| Styling      | Tailwind CSS 4          |
| UI           | shadcn/ui v4 (Base UI)  |
| Auth         | Auth.js v5 beta         |
| Hosting      | Vercel (PWA)            |

**Full-stack details:** [`docs/tech-stack.md`](docs/tech-stack.md)

**IMPORTANT:** These are all bleeding-edge versions. See `.claude/rules/bleeding-edge-libs.md` and check Context7 before using version-specific APIs.

---

## Architecture

```
src/
  app/(auth)/, (dashboard)/, api/   # App Router pages
  components/ui/, features/          # UI primitives, feature components
  lib/db.ts, auth.ts, utils/, validations/  # Server utilities
  types/                             # Shared TypeScript types
prisma/schema.prisma                 # Database schema (source of truth)
product-plan/sections/               # DesignOS components & screenshots
```

---

## Conventions

Conventions auto-load via `.claude/rules/` glob patterns when touching relevant files:

- **Components/UI** — `base-ui-patterns.md`, `server-client-split.md`, `component-implementation.md`
- **Auth/sessions** — `auth-patterns.md`, `server-actions.md`
- **Forms/validation** — `form-patterns.md`, `server-actions.md`
- **Feature UI** — `.planning/DESIGN-REFERENCE.md` + `product-plan/sections/`

### Core rules (always apply)

- **Server Components by default** — "use client" only for interactivity
- **Zod validation at boundaries** — server actions, API routes
- **Prisma schema is source of truth** — run `prisma db push` then `prisma generate` after schema changes
- **Three junction tables for supplies** — not polymorphic
- **Calculated fields at query time** — never stored in DB
- **Colocated tests** — `foo.test.tsx` next to `foo.tsx`
- **Import test utils from `@/__tests__/test-utils`** — not `@testing-library/react`
- **Prettier handles formatting** — never manually adjust
- **Pin exact versions** in package.json (no `^` or `~`)
- **TDD mandatory** — tests before implementation in all plans (see `.claude/rules/testing-requirements.md`)
- **Impeccable gates** — polish after UI plans, audit at phase boundaries (see `.claude/rules/quality-gates.md`)

---

## Guardrails

- Do NOT add `"use client"` unless genuinely needed
- Do NOT use `Button render={<Link>}` — use `Link className={buttonVariants()}`
- Do NOT nest `<form>` elements — use `<div>` with `type="button"` handlers
- Do NOT use fallback user IDs like `user.id ?? "1"`
- Do NOT build UI without reading DesignOS reference first
- Do NOT commit .env files
- Do NOT skip git hooks with `--no-verify`
- Do NOT duplicate requirements — `CROSS_STITCH_TRACKER_PLAN.md` is source of truth

---

## Domain Context

Full glossary in `CROSS_STITCH_TRACKER_PLAN.md` section 3. Key terms:

- **Chart** = the design; **Project** = an instance of working on it
- **Kitted** = all supplies acquired + fabric assigned + digital copy ready
- **SAL** = Stitch-Along; **FFO** = Fully Finished Object; **BAP** = Big Ass Project (50k+ stitches)
- **DMC** = primary thread brand, ~500 colors, pre-seeded in database

---

## Common Commands

```bash
npm run dev              # Dev server
npm run build            # Production build + type-check
npm test                 # Tests (verbose)
npm run format           # Prettier
npx prisma migrate dev   # Apply schema changes
npx prisma generate      # Regenerate client
```

Prisma MCP tools are also available in-conversation: `Prisma-Studio`, `migrate-dev`, `migrate-reset`, `migrate-status` — use these instead of CLI when working interactively.

---

## Branching

- `main` — production, auto-deploys
- `feature/<name>` — feature branches, PR into main
- `fix/<name>` — bug fixes

---

<!-- GSD:conventions-start source:CONVENTIONS.md -->
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->

## GSD Workflow Enforcement

Use GSD entry points for repo changes:

- `/gsd:quick` for small fixes
- `/gsd:debug` for investigation
- `/gsd:execute-phase` for planned work

Do not make direct repo edits outside GSD unless explicitly asked.

<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->

## Developer Profile

> Generated by GSD from session_analysis. Run `/gsd-profile-user --refresh` to update.

| Dimension      | Rating                | Confidence |
| -------------- | --------------------- | ---------- |
| Communication  | conversational        | HIGH       |
| Decisions      | deliberate-informed   | HIGH       |
| Explanations   | concise               | HIGH       |
| Debugging      | diagnostic            | HIGH       |
| UX Philosophy  | design-conscious      | HIGH       |
| Vendor Choices | thorough-evaluator    | HIGH       |
| Frustrations   | instruction-adherence | HIGH       |
| Learning       | guided                | MEDIUM     |

**Directives:**

- **Communication:** Match a conversational, friendly communication style. Provide context with responses rather than bare commands or overly formal structure. Use a warm but direct tone -- the developer appreciates natural dialogue with substance.
- **Decisions:** Present options with clear trade-offs and a recommendation when this developer faces a decision. Explain the reasoning behind recommendations -- they want to make informed choices, not just pick blindly. For low-stakes items, provide a clear recommendation to avoid unnecessary deliberation.
- **Explanations:** Provide concise explanations focused on the 'why' behind key decisions. Include brief reasoning with code and recommendations but do not over-explain. When the developer asks 'why', give a focused answer -- not an essay. Save detailed walkthroughs for when explicitly requested via 'ultrathink' or similar.
- **Debugging:** When this developer reports a bug, they provide good context. Acknowledge what they described, explain the root cause briefly, then fix it. Always explain what went wrong before showing the fix -- they want to understand the cause, not just see the solution.
- **UX Philosophy:** Treat design fidelity as a first-class requirement. Always reference the DesignOS design files before building UI. Never generate UI from scratch -- adapt from the existing designs. Visual polish matters to this developer; do not defer styling as an afterthought. When building components, match the design spec precisely and flag any intentional deviations.
- **Vendor Choices:** When recommending tools or libraries, provide thorough justification. This developer does their own research and will push back if recommendations feel under-evaluated. Compare alternatives when relevant, cite reasons for the recommendation, and acknowledge trade-offs. Do not dismiss their research or suggestions as 'overkill' without strong reasoning.
- **Frustrations:** Follow documented designs, conventions, and prior instructions precisely. When designs exist, use them -- never build from scratch. If deviating from any stated instruction, flag it explicitly and explain why. This developer will invest time creating rules and guardrails; respect that investment by adhering to them carefully. After fixing bugs, verify no regressions were introduced.
- **Learning:** Proactively explain how things fit together when introducing new concepts or tools. When this developer asks 'should we do X?', explain the what, why, and where-it-fits before proceeding. Provide guided context rather than assuming they will read through code independently. For tooling decisions, respect their independent research and engage with their findings.
<!-- GSD:profile-end -->

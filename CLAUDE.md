# CLAUDE.md

## Current Status

<!-- UPDATE THIS SECTION at the end of every work session -->

**Milestone:** 1 (MVP — "Replace Notion") | **Phase:** 4 complete, polished, ready for deploy
**Last Updated:** 2026-04-11
**Roadmap:** Restructured to 4 milestones / 10 phases (was 9 sequential phases)

### Done

- Phase 1 complete: scaffold, design tokens, auth, app shell, 7 pages, PWA
- Phase 2 complete + verified: schema, R2, validations, CRUD, forms, detail/list pages, 174 tests
  - VERIFICATION.md created retroactively (2026-04-10), 5/5 success criteria, status human_needed
  - Fixed Prisma client drift (notes field) — build passes
- Phase 3 complete (2026-04-08): designer & genre pages — list, detail, create/edit/delete, 165 tests
  - Gap closure plan 05: wired delete buttons on list pages, replaced window.confirm() with dialog
  - Code review: 0 critical, 4 warnings, 4 info (advisory)
  - 8 human UAT items pending (sort interaction, mobile layout, 404s, etc.)
- Code quality infrastructure (Prettier, Vitest, Husky, CI)
- PR #2 merged with full review cycle
- Roadmap restructured to lean MVP (2026-04-07)
- Milestone 1 audit: **gaps_found** (12/18 requirements satisfied)
  - Phases 1-3 all verified, only Phase 4 remains (6 requirements)
  - Report: `.planning/v1.0-MILESTONE-AUDIT.md`
- Phase 4 all 7 plans executed: schema, supply/fabric CRUD, catalog UI, shopping list — 335 tests
  - Prisma findMany crash resolved (stale globalThis singleton, not schema drift)
  - First UAT complete: 2 items deferred to backlog, 6 bugs to fix
- Phase 4 UAT bugs fixed (6/6): fabric calc multi-count table, project link 404, brand filter, brands nav, grid hover, Got→Have label
- Design critique (29/40 Nielsen score, no AI slop) + polish pass:
  - Fixed hover-only action buttons (opacity-0 → opacity-40) for touch/tablet accessibility (7 files)
  - Normalized page title sizes (supplies, shopping: text-lg → text-2xl)
  - Normalized genre list layout to match sibling pages
  - Centralized SIZE_COLORS config, removed duplicates
- Impeccable audit (13/20) + harden/polish/optimize/adapt passes (d0e3cd5):
  - Harden: 8 a11y fixes (ARIA roles, keyboard activation, focus-visible, required indicators)
  - Polish: Added success/warning semantic token families; replaced 25 hard-coded colors across 9 files
  - Optimize: Memoized supply table sort, CLS fix on chart cover, narrowed transition-all
  - Adapt: Fixed invisible grid edit icon, upgraded 10px badges to 12px, improved touch targets
- Re-audit scored 15/20 (Good) + harden pass 2 (e48c354):
  - 5 SortableHeaders: added keyboard support (tabIndex, role, onKeyDown, aria-sort)
  - 6 tables: added sr-only captions
  - chart-edit-modal: replaced window.confirm() with styled Dialog
  - aria-labels on supply remove + shopping mark-acquired buttons
  - search-to-add: hard-coded emerald/stone → semantic tokens
  - progress bars: transition-all → transition-[width]
- Final polish pass (ee2ec9b):
  - badge.tsx + tabs.tsx: transition-all → specific properties (perf)
  - Top Genre badge: hard-coded amber → warning-\* semantic tokens
  - genre-list: added header-to-search spacing, fixed search icon alignment
- Security audit (70b0eb5): Phase 4 threat verification — 26 threats, 13 mitigated (all CLOSED), 13 accepted risks documented
- Milestone 1 audit passed (2ab1490): 18/18 requirements, 8/8 E2E flows, 4/4 phases verified, 8 minor tech debt items
- MVP deployed to Vercel (2026-04-11): https://cross-stitch-tracker-adolwyn.vercel.app
  - Neon prod DB migrated + DMC seeded, R2 CORS configured, auth credentials set
  - Smoke test fixes: CSP headers for R2, prisma generate in build, upload limit 10MB, Saga/OXS/XSD file types, beforeunload suppression during server actions + form submit
  - 15 backlog items captured from smoke test (999.0.x)

- Backlog fixes (2026-04-11): 5 quick tasks completed
  - 999.0.8: Thread sort numeric ordering (natural-sort.ts utility)
  - 999.0.3: Form submit idempotency (isSuccess state in useChartForm)
  - 999.0.11: "Already added" indicator in supply search-to-add
  - 999.0.5: Chart list edit/delete actions (new chart-list.tsx client component)
  - 999.0.6: Chart images displaying via presigned R2 URLs + onError fallback

### In Progress

- Nothing

### Next Up

1. `/gsd:complete-milestone` — archive M1 and prep Milestone 2

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
- 999.0.14: Project Bin & iPad App management — "Add New" with empty search creates "New Location" with no way to rename; need proper add/edit/delete for storage locations and stitching apps (currently hardcoded arrays in project-setup-section.tsx)
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
- **Prisma schema is source of truth** — run `prisma generate` after changes
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

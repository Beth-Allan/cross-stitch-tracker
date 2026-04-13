# CLAUDE.md

## Current Status

<!-- UPDATE THIS SECTION at the end of every work session -->

**Milestone:** 2 (Browse & Organize) | **Phase:** 5 — human UAT 4/6 passed, 1 blocked, 1 issue remaining
**Last Updated:** 2026-04-13
**Roadmap:** 4 milestones / 10 phases — v1.0 shipped, M2 phase 5 UAT in progress

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
- **Human UAT session** (2026-04-13): 4 passed, 1 blocked, 1 issue
  - Fixed: SearchableSelect "Add New" now opens InlineNameDialog (matches designer pattern) instead of silent no-op
  - Added: InlineNameDialog component, use-chart-form handler tests, integration tests with real cmdk
  - Passed: Storage CRUD, Stitching App, Add New dialog, Fabric selector
  - Blocked: Cover image (no local file storage configured)
  - Issue: Thread picker opens then auto-closes — needs `/gsd-debug`

### In Progress

- Human UAT for phase 5 — 1 issue remaining (thread picker auto-close)

### Next Up

1. `/gsd-debug` — fix thread picker auto-close (`search-to-add.tsx` / `project-supplies-tab.tsx`)
2. Re-test UAT item 6 (thread picker multi-add UX)
3. `/gsd-code-review-fix 05` — fix 3 critical code review findings
4. `/gsd:ship 5` — create PR for review

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

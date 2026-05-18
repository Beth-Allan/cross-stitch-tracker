# CLAUDE.md

## Current Status

**Milestone:** v1.5 Statistics & Records
**Last Updated:** 2026-05-17
**Roadmap:** 6 milestones / 21 phases — v1.0 through v1.4 shipped, v1.5 Phase 19 planned

### Done

- **v1.0 MVP shipped** (2026-04-11): 4 phases, 23 plans, 395 tests, tagged `v1.0`
  - Archived to: `.planning/milestones/v1.0-*`
  - Live at: https://cross-stitch-tracker-adolwyn.vercel.app
- **v1.1 Browse & Organize shipped** (2026-04-16): 3 phases, 20 plans, 867 tests, tagged `v1.1`
  - Archived to: `.planning/milestones/v1.1-*`
- **v1.2 Track & Measure shipped** (2026-04-20): 2 phases, 20 plans, 1172 tests, tagged `v1.2`
  - Phase 8: Session logging, Pattern Dive tabs, atomic progress tracking
  - Phase 9: Main Dashboard, Project Dashboard, Shopping Cart upgrade (PR #18)
  - Archived to: `.planning/milestones/v1.2-*`
  - Full details: `.planning/MILESTONES.md` and `.planning/RETROSPECTIVE.md`

### Done This Session

- **Phase 21 executed** — 4 plans, 3 waves, 1961 tests passing, human verified
  - Plan 01 (W1): Types, search-params, 7 TDD query modules (personal bests, fastest completions, insights, estimates) — 51 tests
  - Plan 02 (W2): YearScopeToggle, RecordsTable, RecordsOverview layout, page.tsx wiring — 18 tests
  - Plan 03 (W3): Thread/designer/genre insight lists, completion estimates section, project detail estimate — 33 tests
  - Plan 04 (W3): Record detection in createSession, confetti celebrations, log-session-modal — 12 tests (checkpoint)
  - Bug fixes: CSP worker-src confetti (main-thread fallback), multi-toast consolidation, false celebration on multi-session days (CR-01), genre-insights missing date filter (WR-02), placeholder year columns removed from RecordsTable
  - Code review: 1 critical (CR-01 fixed), 3 warnings (WR-01/WR-02 fixed, WR-03 cosmetic)
  - Verification: 5/5 must-haves, all 9 requirements satisfied (REC-01–05, INS-01/02/03/05)
  - **v1.5 milestone complete** — Phase 21 is the last phase

- **PR #40 shipped** — 5-agent review completed, 8 issues fixed:
  - Wrapped `getProjectCompletionEstimate` in `.catch(() => null)` on chart detail page
  - Added `console.warn` to confetti catch block
  - Removed unnecessary `"use client"` from `records-table.tsx`
  - Fixed import ordering in `record-celebration.tsx`
  - Added try-catch-log-rethrow to `detectBrokenRecords`
  - Removed duplicate `SizeCategory` from `stats.ts` (re-exports from `size-category.ts`)
  - Added 3 tests for createSession record detection integration
  - Added 3 tests for log-session-modal celebration path
  - 12 remaining findings added to backlog (999.33–999.40)

### Next Up — RESUME HERE

1. Merge PR #40 when CI passes
2. Consider `/gsd-complete-milestone` to archive v1.5

### Backlog

- ~~999.0: Multiple digital working copies per chart~~ — **Shipped in Phase 15** (v1.4)
- 999.0.4: Duplicate chart detection — warn before creating a chart that may already exist
- 999.0.10: Quick-add missing supplies from project detail page — inline creation without navigating away
- 999.0.12: Collapsible projects in shopping list — collapsed as default state
- 999.0.15: SearchToAdd side-by-side layout — desktop 2-column grid when active, mobile overlay fallback
- 999.0.16: SearchToAdd highlight conflict — only show keyboard highlight after arrow key use
- 999.0.17: StorageLocation/StitchingApp multi-user hardening — @@unique([userId, name]), ownership validation on writes
- 999.0.18: Test infrastructure cleanup for $transaction — createMockPrisma() defaults, vacuous assertion fixes
- 999.0.19: Refactor clickable card rows to avoid nested interactive elements (ARIA violation)
- **999.0.20: Supply action ownership rejection tests (HIGH PRIORITY)** — zero tests verifying rejection when project belongs to different user
- 999.0.21: EditableNumber invalid input feedback — visual indication when entry is rejected
- 999.0.22: Clean up planning doc references in code comments
- 999.0.23: Narrow strandCount type to literal union (1-6)
- 999.0.24: Add skein calculator edge case tests (fabricCount=0, resolveDefaultBrandId)
- 999.1: Supply detail modal (read-only view with "used in projects" list)
- 999.2: Bulk supply editor
- 999.3: Fabric type hierarchy (replace flat dropdown)
- 999.5: Supplies page first-load view flash (investigate SSR cookie or middleware)
- 999.6: Cover image preview aspect ratio — use object-contain or dynamic aspect ratio
- 999.7: Estimated completion dates — compute "at this pace, finish on [date]" from session averages + remaining stitches; display on project detail and dashboard cards
- 999.8: What's Next card styling — use same/similar gallery cards as Browse tab for visual consistency
- 999.9: What's Next kitting label at 0% — "Kitting" label misleading when no supplies tracked; consider "Not kitted" or hiding label
- 999.10: Auto-status from kitting activity — consider auto-transitioning project status to "Kitting" when user starts adding supplies/fabric
- **999.11: Shopping cart scaling for large collections (HIGH PRIORITY)** — search/filter in project list, status grouping (Kitting/Stitching/Unstarted), supply-type search in By Supply view. Real dataset is 75+ projects in kitting stages.
- 999.12: Shopping-for bar pill styling — match mockup style (squared-off chips with border, contained card-like bar) instead of current full-round pills
- 999.13: Per-brand skein length — add `skeinLengthMeters` to ThreadBrand (default 8m for DMC), use in skein calculator instead of hardcoded constant. Fixes inaccuracy for Weeks Dye Works/Gentle Art (5yd), Kreinik (10-11m), etc.
- 999.14: Auto-infer overCount from fabric count — when fabric is linked to a project, auto-set overCount based on fabric count (≤25 → over 1, ≥28 → over 2). User can still override via settings bar toggle.
- 999.15: Add visual commit button (checkmark) to supply table add row — keyboard Enter works but no visible affordance for mouse-first users
- ~~999.16: SearchToAdd drops keystrokes on fast typing~~ — **Resolved in Phase 16** (PR #34). Root cause: PortalAutocomplete focus-steal. Fix: single-input architecture with results-only portal.
- 999.17: InlineCreateDialog UX clarity — field labels (Name/Code) are generic across supply types; should contextualize per type (e.g., "Color Name" for beads, "Product Name" for specialty) and clarify what's optional
- 999.18: BucketProject focal point gap — progress bucket cards use object-cover but don't apply focal point styling. Add focalPointX/Y to BucketProject type, query, and bucket-project-row.tsx
- **999.19: Fix pre-existing TypeScript errors in test files (HIGH PRIORITY)** — dashboard-tabs.test.tsx (wrapper prop), chart-actions.test.ts (createMany mock), shopping-cart-actions.test.ts (error narrowing). 18 errors across 3 files.
- 999.20: Focal point action bar blocks bottom of image — action bar overlaps hero image in edit mode, preventing focal point placement in bottom ~25%. Rework to position outside image or use floating controls.
- 999.21: Fabric matching excludes valid candidates — Pattern Dive Fabric Requirements tab shows zero matches for projects without assigned fabric (null fabricCount short-circuits matching logic)
- **999.22: Stats page Promise.all resilience (HIGH PRIORITY)** — 17 parallel queries in single Promise.all; one failure crashes entire page. Consider Promise.allSettled or separating query groups with Suspense boundaries.
- 999.23: Deduplicate SORT_FIELDS/SORT_DIRS constants — duplicated between search-params.ts and session-history-table.tsx; export from search-params and import in component to prevent drift
- 999.24: Stats action auth/validation test coverage — add tests for requireAuth rejection and Zod boundary violations in stats-actions
- 999.25: Stats types: use literal unions for MonthLabel and DayLabel — MonthlyTotal.month and DayOfWeekData.dayOfWeek are string but constrained to finite values
- 999.26: Stats types: consistent date representation — SessionHistoryItem.date is Date while CalendarDayData.date and DailyBreakdownEntry.date are string
- 999.27: Calendar year-rollover navigation tests — add tests for Jan→Dec and Dec→Jan boundary cases in StitchingCalendar
- 999.28: DailyBreakdownEntry could extend CalendarSession — structural overlap; making relationship explicit reduces duplication
- 999.29: Remove WHAT-comments from Phase 20/21 code — 13 from Phase 20 + 14 from Phase 21 (record-detection.ts, personal-bests.ts). 2 comments in record-detection.ts to rewrite (JSDoc caller reference, skip-self explanation)
- 999.30: Remove low-harm JSX section markers (~20) — technically against no-comments convention but low priority
- 999.31: Stitch count validation against project total — no guard preventing logging more stitches than a project's total stitch count, which would push progress over 100%
- 999.32: Hardcoded emerald-\* color classes in log-session-modal — 6+ locations violate semantic token convention (WR-03)
- 999.33: PersonalBestRecord discriminated union — refactor into two variants (project-linked vs streaks) to eliminate 4 nullable fields and remove runtime null checks
- 999.34: BrokenRecordType as Exclude — define as `Exclude<RecordType, "currentStreak">` instead of duplicating literals; narrow `unit` to `"stitches" | "days"` on both BrokenRecord and PersonalBestRecord
- 999.35: CompletionEstimate presentational leak — move `~` prefix from `estimatedDate` data to component-side rendering
- 999.36: Remove AvailableYearsData wrapper — return `number[]` directly from query, remove unnecessary indirection
- 999.37: Extract shared `buildDateFilter` and `Scope` type — duplicated across 6 stats query modules
- 999.38: Record-detection duplicate-stitch-count edge case test — two sessions today with same stitch count
- 999.39: Completion-estimates already-completed project filter test — project with stitchesCompleted >= totalStitches should be excluded
- 999.40: Pre-existing silent failures in session-actions — `deleteFile().catch(() => {})` orphans files silently; photo upload catch discards error context

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
- **Sketch findings** (supply data entry, project creation form, multi-supply types — design decisions, CSS patterns, visual direction) — `.claude/skills/sketch-findings-cross-stitch-tracker/`

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

## GSD Workflow Enforcement

Use GSD entry points for repo changes:

- `/gsd:quick` for small fixes
- `/gsd:debug` for investigation
- `/gsd:execute-phase` for planned work

Do not make direct repo edits outside GSD unless explicitly asked.

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

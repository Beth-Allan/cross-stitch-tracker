# Retrospective

## Milestone: v1.6 — Cleanup & Hardening

**Shipped:** 2026-05-20
**Phases:** 5 | **Plans:** 15
**Timeline:** 3 days (2026-05-18 → 2026-05-20)
**Tests:** 2,176 | **PRs:** #41, #42, Phase 24 (direct), #49, #50

### What Was Built

- Critical Fixes: Supply ownership validation, Promise.allSettled stats resilience with DataUnavailable fallback, createMockPrisma with $transaction defaults, stats-actions auth/Zod boundary tests
- Test Coverage: Calendar year-rollover tests, record detection duplicate handling, completion estimate exclusion, session error visibility (console.warn instead of silent catch), over-100% progress guardrail with toast warning, stats cache invalidation on chart status + 22 supply mutations
- Code Quality: Literal union types (MonthLabel, DayLabel, strandCount 1-6, BrokenRecordType), PersonalBestRecord discriminated union, shared buildDateFilter/Scope from 6 modules, SORT_FIELDS/SORT_DIRS deduplication, 47 WHAT-comments + 20 JSX markers removed, semantic token migration, assertSuccess/assertFailure helpers, 126 vacuous assertions eliminated across 12 files
- Shopping Cart Scaling: ProjectSearchInput, SupplySearchInput, StatusGroup, SelectionCounter components; smart selection with iterative accumulation; cross-view filtering for 75+ projects
- UX Polish: Keyboard-gated highlight, EditableNumber rejection flash, visible commit button, contextual InlineCreateDialog labels, ARIA group semantics, squared shopping pills, thread insight ranks, What's Next gallery cards with three-state kitting labels, focal point editor split, BucketProject focal point, supplies flash fix, fabric matching null fix

### What Worked

- **44/44 requirement completion** — First milestone with 100% requirement coverage at close. Clean audit with zero gaps. Requirements were well-scoped to existing backlog items with clear acceptance criteria.
- **Wave-based parallelism** — Phases 23, 24, 25, 26 all depended only on Phase 22, enabling parallel execution. 4 phases ran concurrently after the foundation was laid.
- **Code review catching real bugs** — Phase 22 PR review caught unprotected projectList query. Phase 25 review caught aggregated supply quantity distribution bug. Phase 26 review caught hardcoded emerald hover colors.
- **Backlog-driven scope** — Every requirement traced to an existing 999.x backlog item. No scope ambiguity, no mid-milestone discovery.
- **UI-SPEC for UX phase** — Phase 26 had a full UI-SPEC with 14 design decisions locked before implementation. Zero user questions needed during execution.

### What Was Inefficient

- **No milestone audit** — Skipped formal audit because all requirements were checked off. Previous milestones benefited from audits catching cross-phase gaps.
- **Phase 24 PR process unclear** — Phase 24 shipped as "direct" without a clear PR number in the record, unlike the other 4 phases.
- **3 UAT items blocked by R2** — Same issue as v1.4: dev environment doesn't have R2 configured, blocking visual verification of image-related features. Still not addressed structurally.
- **Deferred items accumulating** — 23 new backlog items added during v1.6 (999.50-999.72), on top of existing backlog. The cleanup milestone created its own cleanup debt.

### Patterns Established

- **assertSuccess/assertFailure test helpers** — Type-narrowing assertion guards that eliminate vacuous assertions. Project-wide pattern replacing `expect(result.success).toBe(true)` + unsafe property access.
- **settled() utility for Promise.allSettled** — Extracts fulfilled values and logs rejected reasons. Used in stats page for graceful degradation.
- **Keyboard-gated highlight** — `hasUsedArrowKeys` ref prevents autocomplete highlight on type/mouse. Only arrow keys activate selection visual.
- **StatusGroup with workflow progression** — Groups ordered by stitching workflow (Kitting → Stitching → Unstarted → etc.) for intuitive scanning.
- **Three-state kitting labels** — "Not kitted" (0%), "Kitting" (1-99%), "Kitted" (100%) on What's Next cards.

### Key Lessons

1. **Cleanup milestones generate cleanup debt** — The deeper you audit, the more issues you find. 23 new backlog items emerged from fixing 44 requirements. Accept this as natural discovery.
2. **100% requirement coverage is achievable with backlog-scoped milestones** — When requirements map 1:1 to known issues, there's no ambiguity about "done." Contrast with feature milestones where scope evolves.
3. **R2 dev config is a recurring blocker** — 3rd milestone in a row where UAT is partially blocked. Either set up a dev R2 bucket or accept these items as permanently human-needed.
4. **Discriminated unions pay immediate dividends** — PersonalBestRecord refactor eliminated 4 nullable fields and their runtime null checks. TypeScript's exhaustive checking caught 2 incomplete switches during the migration.
5. **Code review continues to find real bugs** — Every phase's review caught at least one genuine issue (not style nits). Multi-agent review is worth the cost for shipped code.

---

## Milestone: v1.5 — Statistics & Records

**Shipped:** 2026-05-18
**Phases:** 4 | **Plans:** 14
**Timeline:** 2 days (2026-05-17 → 2026-05-18)
**Tests:** 1,967 | **PRs:** #39, #40

### What Was Built

- Stats Engine: 12+ query modules in `src/lib/queries/stats/`, unstable_cache with tag-based invalidation (300s/3600s TTL), TZDate timezone boundaries, Recharts via shadcn chart integration
- Hero Stats & Collection Overview: MetricsBar (today/week/month/year), LifetimeCounters (4 hero metrics), 4 collection breakdown charts (status donut, size category, designer bar, genre distribution) with RankedList links
- Activity Visualization: MonthlyStitchChart with click-to-drill-down, StitchingCalendar (month grid + project pills + nav), SessionHistoryTable (sort/filter/paginate via nuqs), PaceCards (rolling averages + MoM + stitch rate), DayOfWeekChart
- Records & Insights: RecordsTable (personal bests + fastest completions), YearScopeToggle (nuqs), ThreadInsightList (hex swatches), DesignerInsightList (completion rates), GenreInsightList (stitch counts), CompletionEstimatesSection (progress bars), record detection in createSession, canvas-confetti celebration toast

### What Worked

- **Highest velocity yet** — ~7 plans/day, up from ~4.5 in v1.4. Established query patterns from earlier phases (Promise.all, unstable_cache, TDD) made each new module fast to build.
- **Wave-based parallelism** — Plans within the same wave (e.g., 21-03 and 21-04 in Wave 3) executed in parallel worktrees. Data layer and UI plans ran concurrently when dependencies allowed.
- **UI-SPEC design contracts** — Both Phase 20 and 21 had UI-SPECs with checker validation. Design decisions were locked before implementation, eliminating mid-execution pivots.
- **TDD query layer** — All 12+ query modules written test-first. Caught timezone boundary bugs, empty-data edge cases, and groupBy null handling before components were built.
- **Code review finding real bugs** — CR-01 in Phase 21 caught a false celebration bug (confetti firing on multi-session days when total exceeded record but individual session didn't). Fixed before merge.
- **Milestone audit before close** — v1.5-MILESTONE-AUDIT.md caught 5 integration warnings (cache staleness, duplicate constants) and cataloged all tech debt. Clean input for milestone completion.

### What Was Inefficient

- **SUMMARY.md quality (6th time)** — CLI accomplishment extraction still garbled. Same root cause: SUMMARY frontmatter format doesn't match what the extractor expects. Had to manually rewrite MILESTONES.md entry.
- **REQUIREMENTS checkbox drift (6th time)** — 14 of 28 checkboxes stale in REQUIREMENTS.md. Verification reports are the true source of truth; REQUIREMENTS.md is an input doc.
- **CSP worker-src confetti issue** — canvas-confetti's web worker mode hit CSP `worker-src blob:` violation. Required 3 fix iterations before settling on main-thread fallback. Should have tested CSP compatibility during research.
- **Year column dead code in RecordsTable** — Placeholder year columns shipped with `--` in both branches of a ternary. Caught during code review but was a waste of implementation time.
- **18 inherited artifact items** — 14 stale quick tasks from v1.0/v1.1 era still lingering. Should have been cleaned in v1.4.

### Patterns Established

- **Stats query module pattern** — Each module exports a cached query function (`getX`) with `unstable_cache`, `revalidateTag("stats")`, and TZDate-aware date filtering. Consistent across all 12+ modules.
- **Scope-aware queries** — `buildDateFilter` helper generates Prisma date range from `scope` param ("all" | year number). Reusable across any date-scoped query.
- **Server Component composition for stats** — StatsOverview, ActivityOverview, RecordsOverview are Server Components that compose Client chart components. Data fetching stays server-side.
- **nuqs for complex URL state** — Stats page uses nuqs for tab, year scope, session table sort/page/filter. All state URL-persisted and shareable.
- **Record detection in server action** — `detectBrokenRecords` runs after session insert, returns broken records for client-side celebration. Non-blocking (try-catch-log-rethrow).
- **canvas-confetti main-thread fallback** — Avoids CSP worker-src issues. Static import, z-index 9999, 150ms delay for modal dismiss timing.

### Key Lessons

1. **Accept REQUIREMENTS.md as write-once** — 6 milestones, same drift. VERIFICATION.md is the truth source. Stop expecting live checkbox tracking and treat REQUIREMENTS.md as the input spec for each milestone.
2. **Test CSP compatibility during research** — canvas-confetti's worker mode failed CSP. Should have tested in the research phase, not discovered during human verification.
3. **Clean stale artifacts between milestones** — 14 quick tasks from March/April were still open at v1.5 close. Build artifact cleanup into the milestone-start flow (or use `/gsd-cleanup`).
4. **Wave-based parallelism scales** — 4 phases in 2 days with consistent quality. The pattern of data-layer-first (Wave 1) then UI (Wave 2-3) works well for stats features.
5. **Code review catches real bugs** — Phase 21 CR-01 (false celebration) and WR-02 (missing date filter) were genuine logic errors, not style nits. Multi-agent review continues to pay off.

---

## Milestone: v1.3 — Form & Supply Overhaul

**Shipped:** 2026-05-16
**Phases:** 5 | **Plans:** 19
**Timeline:** 13 days (2026-05-03 → 2026-05-16)
**Tests:** 1,535 | **PR:** #32

### What Was Built

- Unified Supply Table: keyboard-first entry with grouped Thread/Beads/Specialty sections, SVG donut indicators, portal autocomplete, inline editing, persistent add row (20 source files, 162 tests)
- Supply Table on Project Detail: ServerActionAdapter for persistence, slide-in animation, sort toggle — replaced old 457-line component
- Merged Form: single-page chart+project creation (720px), pattern type card grid, draft persistence, sticky save bar, milestone markers
- Supply Takeover: React Activity toggles form to full-page supply entry, CreationFlowAdapter buffers locally, createChartWithSupplies atomic save, fabric assignment + skein calculator card
- Edit Mode & Cleanup: full-page edit at /charts/[id]/edit, list-row kebab menus, 21 deprecated files removed (3,700+ lines)

### What Worked

- **Adapter pattern for reuse** — SupplyTableAdapter interface enabled one table component in two contexts (creation flow with local state, project detail with server actions). Clean separation of persistence concern from UI.
- **Sketch findings as design spec** — v1.3 was designed upfront via /gsd-sketch experiments. Validated design decisions (no tabs, persistent add row, keyboard-first) eliminated rework during execution.
- **React Activity for state preservation** — CSS visibility toggle between form and supply-takeover kept React state alive without unmounting. Zero re-renders on mode switch.
- **Two-phase save pattern** — Creating chart first, then batch-adding supplies in one $transaction kept the creation flow simple while guaranteeing atomicity.
- **Aggressive dead code cleanup** — Phase 14 explicitly deleted 21 deprecated files. No "we'll clean it later" debt carried forward.

### What Was Inefficient

- **SUMMARY.md files never generated** — All 5 phases lack proper SUMMARY.md files, making automated accomplishment extraction fail at milestone close. Executor didn't create them.
- **REQUIREMENTS traceability drift (4th time)** — All 22 requirements still showed "Pending" despite being fully implemented. Same structural issue as v1.0-v1.2.
- **Gap closure in Phase 13** — Plans 13-04 and 13-05 were reactive fixes from UAT (field mismatches, skein recalculation wiring). Could have been caught in initial planning with better adapter interface testing.
- **Verification marked human_needed** — Phases 11 and 13 verification left in "human_needed" status without explicit resolution. Blocked audit completeness.

### Patterns Established

- **SupplyTableAdapter interface** — Contract between table UI and data persistence (add, update, delete, getAll). Enables drop-in replacement of backing store.
- **CreationFlowAdapter (local state buffer)** — Buffers supply mutations in React state during creation, flushed to DB on form submit via batch server action.
- **React Activity for page-level toggles** — CSS visibility swap preserves component state without unmounting. Alternative to conditional rendering for complex forms.
- **PortalAutocomplete** — Base UI Combobox with Portal escaping table stacking context. Reusable wherever autocomplete needs to overflow containers.
- **Draft persistence with schema evolution** — localStorage save/load with stale ID detection and versioned schema. Graceful degradation when schema changes.

### Key Lessons

1. **Enforce SUMMARY.md generation in executor** — 4 milestones without reliable summaries. This must be structural: executor writes one-liner + key decisions after each plan completes.
2. **Traceability is still broken** — Same issue every milestone. Either automate requirement checkbox updates or accept that REQUIREMENTS.md is write-once/archive-once and stop pretending it's live.
3. **Test adapter interfaces before wiring** — Phase 13 gap closure (plans 04-05) existed because adapter contracts weren't fully tested against real data shapes before integration.
4. **Verification needs explicit acceptance** — "human_needed" status should trigger a blocking step before milestone close, not be silently deferred.
5. **Sketch-driven development works** — Fastest milestone per plan count despite higher complexity. Pre-validated design decisions eliminated pivot risk.

---

## Milestone: v1.2 — Track & Measure

**Shipped:** 2026-04-20
**Phases:** 2 | **Plans:** 20
**Timeline:** 4 days (2026-04-16 → 2026-04-20)
**Tests:** 1,172 | **PRs:** Phase 8 (merged), #18 (Phase 9)

### What Was Built

- Session logging: StitchSession model, LogSessionModal (create/edit/delete), atomic progress auto-update via $transaction, progress photo upload
- Pattern Dive: Charts page evolved with 4 tabs — Browse, What's Next (kitting readiness), Fabric Requirements (stash matching + assign), Storage View (location grouping)
- Main Dashboard: Currently Stitching (sorted by last session), Start Next, Buried Treasures, Spotlight with shuffle, Collection Stats sidebar (8 metrics), Quick Add menu (8 items)
- Project Dashboard: HeroStats (6 metrics), CSS stacked bar, 5 progress buckets with sorting, Finished tab with 4 sort dimensions and expandable cards
- Shopping Cart: project selection with localStorage, 6 supply tabs with badge counts, quantity +/- stepper, IDOR protection

### What Worked

- **Velocity acceleration** — ~5 plans/day (up from ~4 in v1.1, ~1 in v1.0). Phase familiarity + established patterns + parallel worktree execution for independent plans.
- **TDD data layer** — Writing server action tests first caught edge cases early (IDOR bypass, empty collection handling, null session dates). 305 new tests added.
- **Promise.all() pattern** — Dashboard parallel data fetching prevented Neon cold start waterfall. Established as standard pattern for multi-query pages.
- **Gap closure from v1.1 lessons** — Explicitly budgeted gap closure plans (08-10, 08-11) caught the fabric assignment bug and fabric matching Catch-22 before Phase 9 started.
- **Custom DOM event bridge** — Clean solution for QuickAddMenu → LogSessionModal without coupling Server and Client Components.

### What Was Inefficient

- **ROADMAP/REQUIREMENTS doc drift (again)** — Phase 9 plans still showed `[ ]` and "0/9 Not started" at milestone close. 24/26 requirement checkboxes stale. Third milestone with this issue.
- **Phase 9 Nyquist validation skipped** — VALIDATION.md left in draft status (nyquist_compliant: false). Didn't block anything but breaks audit completeness.
- **Dead code not cleaned** — Old shopping-list.tsx and shopping-actions.ts from v1.0 left in place when Phase 9 replaced them. Should have deleted during Phase 9 execution.

### Patterns Established

- **Custom DOM event for cross-component communication** — `dispatchEvent("open-log-session-modal")` with `useEffect` listener + cleanup. Clean alternative to prop drilling or context when Server/Client boundary prevents function passing.
- **usePersistedSelection with stale ID filtering** — localStorage selection that auto-removes IDs for deleted records. Reusable for any multi-select persistence.
- **CSS stacked bar chart** — Pure CSS with percentage widths + colored segments. No charting library dependency for simple visualizations.
- **Single-query aggregation** — One Prisma findMany with all includes, in-memory bucketing/sorting. Avoids N+1 for dashboard-style data.

### Key Lessons

1. **Automate doc sync or make it blocking** — ROADMAP progress table and REQUIREMENTS checkboxes drifted in all 3 milestones. This needs to be fixed structurally (executor updates traceability on plan completion) or accepted as tech debt.
2. **Delete replaced code during execution** — When a plan replaces an existing component, delete the old one in the same plan. Don't leave dead code for "later cleanup."
3. **Nyquist validation is cheap** — Running it takes minutes. Skipping it saves nothing and creates audit noise.
4. **Parallel worktrees pay off** — Independent plans (data layer + UI) can execute simultaneously. Plans 01-03 (data) ran parallel to UI planning.

---

## Milestone: v1.0 — MVP "Replace Notion"

**Shipped:** 2026-04-11
**Phases:** 4 | **Plans:** 23 | **Tasks:** 44
**Timeline:** 22 days (2026-03-20 → 2026-04-11)
**Tests:** 395 | **LOC:** 48k TypeScript

### What Was Built

- Authenticated app shell with responsive sidebar, PWA manifest, emerald/amber/stone design system
- Full chart CRUD with ~50 fields, 7-stage status system, R2 cover photos, presigned URL downloads
- Designer and genre management pages with sortable tables, search, CRUD modals, detail views
- Supply tracking: 459-color DMC catalog, thread/bead/specialty/fabric CRUD, project linking, shopping lists
- Deployed to Vercel with Neon PostgreSQL and Cloudflare R2

### What Worked

- **TDD throughout** — 395 tests caught real bugs (Prisma client drift, hydration mismatches, supply query crashes). Tests as documentation.
- **GSD workflow** — Phase→Plan→Execute cycle kept work organized and resumable across sessions. Quick tasks for ad-hoc fixes without overhead.
- **Design-first approach** — DesignOS components in `product-plan/` meant zero UI guesswork. Every page had a spec.
- **Bleeding-edge rules** — `.claude/rules/` with Context7 lookups prevented Next.js 16 / Prisma 7 / shadcn v4 footguns. Saved hours.
- **Impeccable quality gates** — Polish + audit passes at phase boundaries caught accessibility, semantic token, and performance issues systematically.
- **MVP restructure (day 18)** — Pivoting from 9-phase waterfall to 4-milestone plan got the app deployed instead of stuck in planning.

### What Was Inefficient

- **Progress table drift** — ROADMAP.md progress table wasn't always updated after plan execution, requiring manual corrections during milestone audit.
- **Phase 4 plan count (10 plans)** — Supplies + fabric was the biggest phase. Several gap-closure plans (08, 09, 10) were reactive fixes that could have been caught in initial planning.
- **Smoke test at deploy time** — 15 issues found when deploying. Earlier local testing with prod-like env would have caught CSP headers, upload limits, etc.
- **Presigned URL oversight** — Designer/genre detail pages render R2 keys directly as `src` instead of resolving presigned URLs. Caught late, not fixed in M1.

### Patterns Established

- **Server/client split** — Server Components by default; `"use client"` only for hooks/events
- **buttonVariants in non-client file** — Avoids Next.js 16 "imported from client module" error
- **Lazy R2/Prisma singletons** — Graceful degradation when env vars missing
- **Three junction tables** — ProjectThread, ProjectBead, ProjectSpecialty (not polymorphic)
- **Semantic design tokens** — bg-card, text-muted-foreground, etc. (never hardcoded colors)
- **requireAuth() guard** — Single source of truth for all server actions
- **Feature branch + PR** — All code changes through CI (branch protection enforced)

### Key Lessons

1. **Deploy earlier** — Real usage found issues that tests and audits couldn't. The MVP restructure was the right call.
2. **Plan gap-closure upfront** — Budget 1-2 plans per phase for "fix what we missed" instead of bolting them on.
3. **Test with prod-like env locally** — R2, CSP headers, upload limits, and file type validation all broke at deploy.
4. **Keep ROADMAP progress table in sync** — Automate or make it part of the executor commit flow.
5. **Presigned URLs everywhere** — Any page rendering R2 keys needs server-side URL resolution. Don't assume only the charts page needs it.

## Milestone: v1.1 — Browse & Organize

**Shipped:** 2026-04-16
**Phases:** 3 | **Plans:** 20 | **Tasks:** 33
**Timeline:** 5 days (2026-04-11 → 2026-04-15)
**Tests:** 867 | **PRs:** #7, #15, #16

### What Was Built

- Storage location and stitching app CRUD with dedicated management pages and detail views
- DB-backed dropdowns with inline "Add New" for storage, app, and fabric in chart form
- Gallery cards with status-specific footers, 3 view modes (gallery/list/table), sorting, search, and filtering
- Project detail page with hero banner, interactive status badge, tabbed Overview + Supplies layout
- Per-colour stitch counts with auto-calculated skein estimates (fabric count, strand count, 20% waste factor)
- Supply workflow redesign with SearchToAdd inline create, color family filter, and visual InfoCard aesthetic
- DMC catalog completed to 495 threads (Blanc, Ecru, 1-149 filled)

### What Worked

- **Multi-agent PR review** — pr-review-toolkit caught real issues (ownership bypass, error swallowing, transaction safety) across 3 review rounds on Phase 5.
- **Impeccable quality gates** — audit + critique + re-critique cycle on Phase 6 caught ARIA violations, touch target issues, and semantic token drift. Scores improved 14→28/40.
- **Gap closure plans** — Explicitly budgeting 2 gap-closure plans per phase (learned from v1.0) reduced reactive scrambling.
- **Visual verification checkpoints** — Phase 7 plan 06 included explicit browser verification before proceeding, catching layout and data issues early.
- **Velocity improvement** — 4 plans/day vs 1 plan/day in v1.0. Phase familiarity + established patterns + fewer unknowns.

### What Was Inefficient

- **REQUIREMENTS.md traceability drift** — 12 of 19 requirements were still "Pending" despite being built. Traceability table wasn't updated during execution.
- **ROADMAP progress table drift (again)** — Phase 7 showed "6/8 Gap closure" at milestone close despite all 8 plans being complete. Same issue as v1.0.
- **Summary one-liner quality** — Several SUMMARY.md files had malformed one-liners (bug rule references instead of descriptions), making automated extraction unreliable.
- **Skein formula required late correction** — Initial constant (6.0) was ~4x too high; corrected to 1.3 in gap closure plan after UAT. Should have validated against community calculators during research.

### Patterns Established

- **InlineNameEdit + DeleteEntityDialog** — Reusable CRUD pattern for entity management pages (storage, apps)
- **SearchableSelect with inline create** — Chart form pattern for DB-backed dropdowns with "Add New" dialog
- **Gallery URL state with localStorage fallback** — nuqs for URL params, localStorage for view mode persistence
- **Status-specific card footers** — Data-driven footer rendering based on project status group
- **Native `<select>` in floating panels** — Simpler than shadcn Select inside SearchToAdd; avoids z-index/portal issues

### Key Lessons

1. **Update traceability during execution** — Don't defer requirement checkbox updates to milestone close. Mark complete when the plan ships.
2. **Validate formulas during research** — Domain-specific calculations (skein formula) need real-world validation before implementation, not after UAT.
3. **Summary one-liners need enforcement** — Malformed summaries break automation. The executor should validate one-liner format.
4. **Gap closure budget works** — 2 plans per phase for "fix what we missed" is the right default. Phase 5 used 3 (the extra was a genuine gap), Phase 7 used 2.
5. **Multi-agent review is worth the cost** — 3 rounds on Phase 5 was expensive but caught critical auth bypass. 1 round on Phases 6-7 was sufficient for lower-risk changes.

## Milestone: v1.4 — Fixes & Polish

**Shipped:** 2026-05-17
**Phases:** 3 | **Plans:** 9
**Timeline:** 2 days (2026-05-16 → 2026-05-17)
**Tests:** 1,641 | **PRs:** #34, #35

### What Was Built

- Chart File Management: ChartFile model with multi-file R2 upload, per-file add/remove lifecycle, presigned URL downloads, migration from legacy single-URL field
- SearchToAdd keystroke fix: single-input architecture with results-only portal (eliminated focus-steal from dual-input design)
- Dashboard Spotlight sizing: 320px fixed column, 300px max-height image, matched button styling
- Image Focal Point: click-to-set anchor with crosshair marker, 4:3 crop guide overlay, keyboard accessibility, CSS object-position propagation across 8+ display contexts

### What Worked

- **Focused scope** — 3 independent phases with clear success criteria. No inter-phase dependencies meant each could ship independently.
- **Milestone audit before close** — Caught Nyquist gaps early, filled 9 test gaps across all phases before completing.
- **Security verification** — Threat model reviews for Phases 15 and 17 caught no critical issues, confirming patterns established in earlier milestones are holding.
- **Rapid execution** — 9 plans in 2 days (~4.5/day). Small, well-scoped fixes execute fast when requirements are clear.

### What Was Inefficient

- **SUMMARY.md files still not generated** — 5th milestone in a row. Executor still doesn't create them. Auto-extracted accomplishments from CLI were garbled (included rule references).
- **REQUIREMENTS.md traceability drift (5th time)** — 5/8 requirements unchecked despite being fully implemented. Structural issue never fixed.
- **Phase 17 UAT blocked by R2 dev config** — Human UAT couldn't proceed because dev server had no R2 configured. Could have been flagged as a prerequisite.
- **Artifact accumulation** — 24 open items at milestone close, all inherited from prior milestones. Needed explicit cleanup session.

### Patterns Established

- **ResizeObserver for container-relative positioning** — Used in focal point editor for accurate click-to-coordinate conversion that handles layout shifts.
- **Normalized 0-1 coordinate storage** — Resolution-independent focal point that converts to CSS percentage at render time.
- **Results-only portal pattern** — Portal shows dropdown results but input stays in document flow. Eliminates focus-steal issues.
- **Artifact cleanup at milestone close** — Explicitly resolve or delete inherited items instead of re-deferring indefinitely.

### Key Lessons

1. **Enforce SUMMARY.md generation or stop expecting it** — 5 milestones, same gap. Either make it structural in the executor or accept its absence and write accomplishments manually at close.
2. **REQUIREMENTS traceability is write-once** — Same issue every milestone. Accept that REQUIREMENTS.md is an input document, not a live tracker. Verification reports are the true status source.
3. **Dev environment prerequisites matter** — R2 dev config blocked UAT. Document required services per phase so human testing isn't surprised.
4. **Clean as you go** — The 24 inherited items were manageable to clean in one session. Don't carry artifact debt across more than one milestone.

---

## Cross-Milestone Trends

| Metric | v1.0 | v1.1 | v1.2 | v1.3 | v1.4 | v1.5 | v1.6 |
|--------|------|------|------|------|------|------|------|
| Phases | 4 | 3 | 2 | 5 | 3 | 4 | 5 |
| Plans | 23 | 20 | 20 | 19 | 9 | 14 | 15 |
| Tests | 395 | 867 | 1,172 | 1,535 | 1,641 | 1,967 | 2,176 |
| Days | 22 | 5 | 4 | 13 | 2 | 2 | 3 |
| Plans/day | ~1 | ~4 | ~5 | ~1.5 | ~4.5 | ~7 | ~5 |
| Commits | 225+ | 225 | 153 | 190 | 153 | ~170 | ~111 |
| PRs | 6 | 3 | 2 | 1 | 2 | 2 | 5 |
| LOC | 48k | ~65k | 82k | ~90k | ~95k | ~125k | ~125k |

# Retrospective

## Milestone: v1.7 — Fix & Polish

**Shipped:** 2026-05-24
**Phases:** 4 | **Plans:** 11
**Timeline:** 5 days (2026-05-20 → 2026-05-24)
**Tests:** 2,283 | **PRs:** #52, #53, #54, #55

### What Was Built

- Chart Form Fixes: InlineDesignerDialog wiring, SearchableSelect tab-to-type focus forwarding, designer detail thumbnail fallback, supply stitch total hint, Need column width fix
- Stats Corrections: status-groups utility for library-wide insights, StatusFilterPills with server re-render, integer chart axes, collection total counter, formatAge/formatAgeNumber split
- UI Polish: colored status/size badges, digital copy indicator, CalculatorCard on project detail Supplies tab with optimistic persistence, 50MB+zip upload
- Code Quality: 42 CSS custom properties for status colors, silent catch fixes (3 files), R2 orphan cleanup, DEFAULT_SUPPLY_HEX single-sourced, useRejectionFlash hook shared

### What Worked

- **Bug-fix milestones are efficient** — 11 plans in 5 days. Clear scope (bugs have a "done" state), minimal design ambiguity, straightforward verification.
- **PR review catching real bugs** — CR-01 in Phase 28 (mock type errors causing false-pass tests), CR-01 in Phase 29 (calcParams isPending ordering bug), CR-01 in Phase 30 (R2 cleanup inside wrong try block). Multi-agent review continues to earn its keep.
- **Phase independence** — All 4 phases could have run in parallel (only Phase 30 declared a dependency). This meant no blocking on earlier phases.
- **Status color centralization** — CSS custom properties pattern established cleanly. 42 variables, one source of truth, 4 consumers updated. Good foundation for future theming.

### What Was Inefficient

- **REQUIREMENTS.md not updated during execution** — QUAL-01 through QUAL-06 still showed "Pending" despite Phase 30 being fully verified. Manual reconciliation needed at milestone close.
- **Phase 30 branch management** — Had to cherry-pick context from old feature/phase-28 branch after PR merge. The branching strategy of one branch per milestone would have avoided this.
- **v1.7 milestone recovery** — ROADMAP.md/REQUIREMENTS.md/STATE.md were clobbered by v1.6 archive commit and needed git recovery. Root cause: milestone archive didn't account for in-progress next-milestone files.

### Patterns Established

- **CSS custom properties for semantic colors** — `--status-{name}-{bg|dot|text}` pattern in globals.css with light/dark variants via `@media (prefers-color-scheme: dark)`. STATUS_CONFIG consumes via `var()`.
- **R2 orphan cleanup on replacement** — Delete old file after new file succeeds (not before). Applied to session photos and chart covers.
- **Shared hook extraction pattern** — `useRejectionFlash` in `src/components/hooks/` — timer + state + cleanup extracted from duplicated component-level logic.
- **StatusFilterPills with shallow:false** — Forces Next.js server re-render on filter change (not just URL update). Required for server-side data filtering.

### Key Lessons

1. **Keep traceability current during execution** — Update requirement checkboxes when plans complete, not at milestone close. Saves reconciliation time.
2. **Milestone archive must preserve next-milestone files** — The v1.6 archive accidentally overwrote v1.7 setup files. Archive workflows should check for and preserve in-progress work.
3. **Fix milestones validate the product** — Every bug fixed in v1.7 was discovered by actually using the app. Regular "use it and fix what hurts" cycles are valuable.
4. **CSS custom properties > Tailwind config for runtime theming** — Direct CSS vars are more transparent, debuggable in DevTools, and don't require Tailwind rebuild.

---

## Milestone: v1.6 — Cleanup & Hardening

**Shipped:** 2026-05-20
**Phases:** 5 | **Plans:** 15
**Timeline:** 3 days (2026-05-18 → 2026-05-20)
**Tests:** 2,176 | **PRs:** #41, #42, #44, #49, #50

### What Was Built

- Critical Fixes & Test Infrastructure: supply ownership validation, Promise.allSettled stats resilience, createMockPrisma() $transaction defaults, mockTransaction helper, 3 test file fixes
- Test Coverage & Reliability: edge case tests (calendar year-rollover, record detection duplicates, completion estimate exclusions), R2 file error surfacing, deleteSession photo cleanup, over-100% progress guardrail, revalidateTag on chart status + supply mutations
- Code Quality: 16 type improvements (literal unions for strandCount/MonthLabel/DayLabel, PersonalBestRecord discriminated union, shared buildDateFilter/Scope), SORT_FIELDS deduplication, 47 comment removals, semantic tokens, assertSuccess/assertFailure + 43-instance vacuous assertion sweep
- Shopping Cart Scaling: project search, status grouping, supply-type search, smart selection with dual-mode counter, responsive with 75+ projects
- UX Polish: 14 items — ARIA card rows, keyboard-gated highlight, EditableNumber rejection flash, visible commit button, contextual InlineCreateDialog labels, focal point editor split, cover image aspect ratio, BucketProject focal point, fabric matching fix, What's Next gallery cards + kitting labels

### What Worked

- **Highest quality milestone** — 44/44 requirements shipped, all checked off at close. Every phase had context, every plan had verification. Zero requirements dropped.
- **Parallel phase execution** — Phases 23-26 all depended only on Phase 22, enabling any-order execution. Shopping cart and UX polish ran independently.
- **Code review catching real bugs** — CR-01 in Phase 24 (CreationFlowAdapter data loss), CR-01 in Phase 26 (hardcoded hover color). Multi-agent review continues to find genuine issues.
- **UI-SPEC for frontend phases** — Phase 25 and 26 both had UI-SPECs. Shopping cart scaling had design contracts for search, grouping, and selection before any code was written.
- **Sketch findings skill** — Cross-stitch-tracker sketch findings auto-loaded during UI phases, carrying forward validated design decisions from earlier experiments.

### What Was Inefficient

- **SUMMARY.md one-liner quality (7th time)** — Auto-extracted accomplishments for MILESTONES.md were garbled again. Manual rewrite required. Root cause unchanged: SUMMARY frontmatter format doesn't match extractor.
- **18 stale quick tasks still open** — Same 14 from v1.5 plus 4 more. Now acknowledged and deferred. Should have been mass-closed at v1.4.
- **Verification gaps from v1.5 carried forward** — Phase 19, 20, 21 verification still "human_needed". Phase 23 and 25 added to the list. These pile up because visual verification requires a running app.

### Patterns Established

- **assertSuccess/assertFailure test helpers** — Guards that narrow server action return types before assertions. Eliminates vacuous `expect(result).toEqual(...)` patterns that pass on undefined.
- **Literal union types for constrained domains** — strandCount (1-6), MonthLabel, DayLabel, BrokenRecordType. Catches invalid values at compile time.
- **revalidateTag("stats") convention** — Every mutation that affects stats data (chart status, supply mutations, session CRUD) calls revalidateTag. Established pattern for cache consistency.
- **Keyboard-gated highlight** — `hasUsedArrowKeys` flag in autocomplete/search components. Only shows keyboard selection highlight after arrow key use, not on type or mouse hover.
- **StatusGroup collapsible pattern** — Projects grouped by status with collapse/expand, "Select all" per group, count badges. Reusable for any entity list that needs status grouping.

### Key Lessons

1. **Cleanup milestones are fast** — 5 phases in 3 days at ~5 plans/day. No new features means less design ambiguity and fewer integration surprises. Good cadence to alternate feature milestones with hardening.
2. **Backlog accumulation is real** — 70+ items by v1.6 close. The 999.xx numbering system works for capture but makes prioritization hard. Consider periodic backlog triage.
3. **Type precision pays off immediately** — Literal unions caught 2 bugs during consumer updates (Phase 24). The migration effort was ~2 hours; the prevented bugs would have been harder to diagnose.
4. **Visual verification needs automation** — 5 phases with "human_needed" verification. Screenshot comparison or Playwright visual tests would reduce this pile.
5. **Accept SUMMARY.md extraction as broken** — 7 milestones, same issue. Write MILESTONES.md entries manually and stop expecting the extractor to produce usable one-liners.

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

| Metric | v1.0 | v1.1 | v1.2 | v1.3 | v1.4 | v1.5 |
|--------|------|------|------|------|------|------|
| Phases | 4 | 3 | 2 | 5 | 3 | 4 |
| Plans | 23 | 20 | 20 | 19 | 9 | 14 |
| Tests | 395 | 867 | 1,172 | 1,535 | 1,641 | 1,967 |
| Days | 22 | 5 | 4 | 13 | 2 | 2 |
| Plans/day | ~1 | ~4 | ~5 | ~1.5 | ~4.5 | ~7 |
| Commits | 225+ | 225 | 153 | 190 | 153 | ~170 |
| PRs | 6 | 3 | 2 | 1 | 2 | 2 |
| LOC | 48k | ~65k | 82k | ~90k | ~95k | ~125k |

# CLAUDE.md

## Current Status

**Milestone:** v1.8 Series & Collections — IN PROGRESS
**Last Updated:** 2026-05-25
**Roadmap:** 8 milestones / 34 phases — v1.0-v1.7 shipped

### Done

- **v1.0 MVP shipped** (2026-04-11): 4 phases, 23 plans, 395 tests, tagged `v1.0`
  - Live at: https://cross-stitch-tracker-adolwyn.vercel.app
- **v1.1 Browse & Organize shipped** (2026-04-16): 3 phases, 20 plans, 867 tests, tagged `v1.1`
- **v1.2 Track & Measure shipped** (2026-04-20): 2 phases, 20 plans, 1172 tests, tagged `v1.2`
- **v1.3 Form & Supply Overhaul shipped** (2026-05-16): 5 phases, 19 plans, 1535 tests, tagged `v1.3`
- **v1.4 Fixes & Polish shipped** (2026-05-17): 3 phases, 9 plans, 1641 tests, tagged `v1.4`
- **v1.5 Statistics & Records shipped** (2026-05-18): 4 phases, 14 plans, 1967 tests, tagged `v1.5`
  - All milestones archived to `.planning/milestones/`
  - Full details: `.planning/MILESTONES.md` and `.planning/RETROSPECTIVE.md`

### Done This Session

- **v1.6 milestone initialized** — PROJECT.md updated, 42 requirements defined, 5-phase roadmap created (Phases 22-26)
- **Phase 22 planned** — 3 plans in 1 wave (all parallel): test infra, security+auth, stats resilience
- **Phase 22 executed & verified** — 3/3 plans complete, 1995 tests passing, all 5 requirements verified
- **Phase 22 shipped** — PR #41 created, 4-agent review completed, all findings fixed, 2010 tests passing
  - Fixed: unprotected projectList query (999.44), settled() error logging (999.45), error sanitization (999.46), type assertions (999.47), import convention (999.49)
  - Added: partial failure tests, null-prop degradation tests, DataUnavailable a11y + copy
- **Phase 23 discussed** — context gathered, 10 decisions locked (D-01 through D-10)
- **Phase 23 planned** — 3 plans in 1 wave (all parallel): edge case tests, session reliability, cache staleness
- **Phase 23 executed & verified** — 3/3 plans complete, 2029 tests passing, all 8 requirements verified
  - Plan 01: 5 edge case tests (calendar year-rollover, record detection duplicates, completion estimate exclusions)
  - Plan 02: R2 error visibility (no more silent `.catch(() => {})`), deleteSession photo cleanup, over-100% progress guardrail with toast
  - Plan 03: `revalidateTag("stats")` on chart status + all 22 supply mutations, resolveDefaultBrandId tests
  - Code review: 2 warnings (WR-01 pre-transaction race in overTotal, WR-02 missing createAndAdd\* revalidateTag test assertions)
  - ROADMAP SC 7 wording aligned with D-04 decision (warn, not reject)
- **Phase 23 shipped** — PR #42 created, 4-agent review completed, findings fixed, 2037 tests passing
  - Fixed: updateSession missing overTotal warning, missing toast.warning test, supply cache invalidation test coverage (1/22 → 4/22 representative)
  - Backlogged: 8 items (999.50-999.57) for upload-actions silent catch, completion estimate catch, photo cleanup, bare catches, etc.

- **Phase 24 code review fixed** — 6/6 findings fixed (1 critical, 5 warnings)
  - CR-01: CreationFlowAdapter `isNeedOverridden` data loss bug
  - WR-01: type-safe filter predicate on dashboard page
  - WR-02: atomic `useQueryStates` in SessionHistoryTable
  - WR-03: type-safe `hydrateField` helper replacing `as any` in draft hydration
  - WR-04: explicit `StitchSession` return type on mock factory
  - WR-05: TODO(999.0.17) backlog reference for buried treasures ownership
- **Phase 25 executed & verified** — 2/2 plans complete, 2108 tests passing (visual verification pending)
  - Plan 01: 4 standalone components — ProjectSearchInput, SupplySearchInput, StatusGroup, SelectionCounter (29 tests)
  - Plan 02: Full integration — search, status grouping, supply filtering, smart selection (37 new tests)
  - Code review: 1 critical + 4 warnings fixed (CR-01 aggregated supply quantity, WR-01 localStorage race, WR-02 semantic tokens, WR-03 dead branches, WR-04 type assertion)

- **Phase 25 shipped** — PR #49 created, 6-agent review completed, all findings fixed, 2103 tests passing
  - Fixed: WR-01 multi-item quantity distribution bug, WR-02 O(n\*m) supply lookup memoized, WR-03 redundant Set copy, WR-04 SelectionCounterProps required fields, WR-05 missing console.error
  - Merged ProjectSearchInput + SupplySearchInput into single SearchInput component
  - Removed 25 comment convention violations (section dividers, JSX markers, WHAT-comments, D-03 reference)
  - Added 8 items to backlog (999.58-999.65)

- **Phase 26 UI-SPEC approved** — 6/6 dimensions passed, 1 non-blocking FLAG (UX-07 tooltip recommendation)
  - Typography: 2 weights (400, 600), 3 sizes (12, 14, 24px)
  - Spacing: 8-point scale, pre-existing 5px noted as inherited
  - Copywriting: 14 elements defined (kitting labels, dialog titles, aria-labels)
  - All 14 CONTEXT.md decisions (D-01 through D-14) captured — zero user questions needed

- **Phase 26 planned** — 3 plans in 1 wave (all parallel): supply table UX, ARIA + visual consistency, layout + data fixes
  - Plan 01: keyboard-gated highlight, EditableNumber rejection flash, commit button, contextual dialog labels (UX-01, UX-03, UX-07, UX-08)
  - Plan 02: card row ARIA, shopping pills, thread insight ranks, What's Next gallery cards + kitting labels (UX-02, UX-05, UX-06, UX-12, UX-14)
  - Plan 03: focal point editor split, cover image dynamic aspect ratio, BucketProject focal point, supplies flash fix, fabric matching (UX-04, UX-09, UX-10, UX-11, UX-13)

- **Phase 26 code review fixed** — 6/6 findings fixed (1 critical, 5 warnings), 2173 tests passing
  - CR-01: Hardcoded `emerald-*` hover → `text-primary` semantic token in BucketProjectRow
  - WR-01: `stone-*`/`emerald-*` bucket colors → semantic tokens, remaining documented as exception
  - WR-02 + WR-05: Local CoverPlaceholder duplicate replaced with shared import
  - WR-03: setTimeout cleanup refs added to both EditableNumber components
  - WR-04: `defaultBrandId` prop added to InlineCreateDialog

- **Phase 26 verified** — UAT complete: 11/14 passed, 0 issues, 3 blocked (R2 not configured on dev)
- **v1.6 milestone transition** — Phase 26 marked complete, PROJECT.md evolved, STATE.md updated
- **Codebase mapped** — 7 documents in `.planning/codebase/` (STACK, INTEGRATIONS, ARCHITECTURE, STRUCTURE, CONVENTIONS, TESTING, CONCERNS)
- **Fix: `sharp` moved from devDependencies to dependencies** — runtime import was incorrectly listed as dev-only
- **Backlog 999.67 added** — stats sections should populate from library data, not only with tracked sessions

- **Phase 26 shipped** — PR #50 created, 6-agent review completed, findings fixed, 2176 tests passing
  - Fixed: CR-01 keyboard focal point placement restored (Enter/Space → center), localStorage try/catch, comment convention violations, merged duplicate key handlers, simplified onClick wrapper
  - Backlogged: 5 items (999.68-999.72) for hex constant extraction, useRejectionFlash hook, OptionalFocalPoint union, LocalStateAdapter type safety, SSR hydration tradeoff

- **v1.7 milestone restored** — ROADMAP.md, REQUIREMENTS.md, STATE.md, PROJECT.md recovered from git (clobbered by v1.6 archive commit)

- **Phase 27 planned** — 2 plans in 1 wave (all parallel): designer field fixes + stitch hint, display fixes
  - Plan 01: designer inline creation dialog wiring (BUG-01), tab-to-type focus (BUG-02), supply stitch total hint (BUG-05)
  - Plan 02: designer detail thumbnails (BUG-04), Need column width for skeins display (BUG-06)

- **Phase 27 code review fixed** — 4/4 findings fixed (1 critical, 3 warnings), 2198 tests passing
  - CR-01: Supply table column widths aligned (41%/16%) across header + body rows
  - WR-01: `useId()` for unique listbox IDs per SearchableSelect instance
  - WR-02: Safety comment on raw prisma query (upstream ownership check)
  - WR-03: Space key excluded from type-to-search character forwarding + test added

- **Phase 27 verified** — UAT complete: 4/5 passed, 0 issues, 1 blocked (R2 not configured on dev)
- **Phase 27 marked complete** — STATE.md transitioned to Phase 28, backlog items 999.73-999.74 added

- **Phase 27 shipped** — PR #52 created, 6-agent review completed, findings fixed, 2198 tests passing
  - Fixed: CR-01 unhandled Prisma aggregate try-catch, WR-01 extract thumbnailSrc variable
  - Backlogged: 999.75 InlineDesignerDialog controlled-only simplification

### Done This Session (2026-05-23 cont.)

- **PR #52 merged** — Phase 27 shipped to main
- **Branch created** — `feature/phase-28` off main, cherry-picked Phase 28 context from old branch
- **Phase 28 UI-SPEC approved** — 6/6 dimensions passed, 2 non-blocking FLAGs (Overview visual hierarchy, inherited 6px pill spacing)
  - StatusFilterPills spec, insight relocation, chart axis fixes, hero stat, Collection Total rename, RankedList removal, days-in-library fix
  - All 14 CONTEXT.md decisions (D-01 through D-14) captured — zero user questions needed

- **Phase 28 planned** — 3 plans in 2 waves: data layer + chart fixes (Wave 1 parallel), component restructuring (Wave 2)
  - Plan 01 (W1): status-groups utility, insight query rewrites (session-gated → library-wide + status filter), collection total in hero stats
  - Plan 02 (W2): StatusFilterPills, insights moved to Overview, Records simplified with session hero stat, COLLECTION TOTAL label
  - Plan 03 (W1): allowDecimals={false} on 3 charts, formatAge number duplication fix

- **Phase 28 executed & verified** — 3/3 plans complete, 2242 tests passing, all 5 requirements verified
  - Plan 01 (W1): status-groups utility, 3 insight queries rewritten session-gated → library-wide, collectionTotalStitches in hero stats
  - Plan 02 (W2): StatusFilterPills with shallow:false for server re-render, insights on Overview, Records simplified, STITCHES IN COLLECTION label
  - Plan 03 (W1): allowDecimals={false} on 3 charts, formatAge/formatAgeNumber split fixes number duplication
  - Code review: 1 critical + 4 warnings fixed (mock type errors, sort mutation, dead scope param, error sanitization, semantic token)
  - Additional fixes: Prisma `projects` → `project` relation name, stale cache guard, thread insights show stitch count, color name removed from display

### Done This Session (2026-05-24 cont.)

- **Phase 28 shipped** — PR created via `/gsd-ship`

- **Phase 29 executed & verified** — 3/3 plans complete, 2269 tests passing, all 5 requirements verified
  - Plan 01: Colored status badges (UNSTARTED = slate), SIZE_COLORS lightened to -50, digital copy indicator (FileText + "Digital copy")
  - Plan 02: CalculatorCard wired into project detail Supplies tab with optimistic persistence, fabric options threaded from page
  - Plan 03: MAX_FILE_SIZE 10MB → 50MB, zip MIME types added to client + server validation, error messages updated
  - Code review: 1 critical + 2 warnings fixed (CR-01 calcParams isPending bug, WR-01 getUnassignedFabrics catch, WR-02 FabricOption dedup)
  - BUG-03 sort investigation confirmed working correctly (no bug)
  - 3 human verification items blocked (R2 not configured on dev)

- **Phase 29 shipped** — PR #54 created, 6-agent review completed, all findings fixed, 2269 tests passing
  - Fixed: WR-01 getUnassignedFabrics error logging, WR-02 upload error logging with filename, WR-03/WR-04 misleading comments, WR-05 unnecessary variable alias, WR-06 deduplicated rollback+toast
  - Backlogged: 5 items (999.76-999.80) for co-dependent props, persistFields typing, calc param error tests, server action tests, zip validation test

- **PR #54 merged** — Phase 29 shipped to main
- **Branch created** — `feature/phase-30` off main
- **Phase 30 discussed** — context gathered, 15 decisions locked (D-01 through D-15)
  - Status colors: CSS custom properties in globals.css, all 7 statuses, all consumers updated including log-session-modal
  - Silent failures: QUAL-02 targets only (3 files), console.error + toast.error in modal, graceful null for chart page
  - R2 orphans: delete old photo after new succeeds, session + chart cover scope
  - Extractions: DEFAULT_SUPPLY_HEX to `src/lib/constants.ts`, useRejectionFlash to `src/components/hooks/`
  - TS error: 1 remaining (status-groups.test.ts), fix with `as unknown as` cast

- **Phase 30 planned** — 3 plans in 1 wave (all parallel): status color CSS properties, silent failure + R2 orphan fixes, shared extractions
  - Plan 01: CSS custom properties for 7 statuses (bg/dot/text + dark), STATUS_CONFIG migration, gallery-card + whats-next-tab consumer updates (QUAL-04)
  - Plan 02: Silent catch fixes in 3 files, R2 photo orphan cleanup for session + chart cover, status-groups.test.ts TS error (QUAL-01, QUAL-02, QUAL-03)
  - Plan 03: DEFAULT_SUPPLY_HEX to constants.ts (16 occurrences), useRejectionFlash hook extraction (QUAL-05, QUAL-06)

- **Phase 30 executed & verified** — 3/3 plans complete, 2283 tests passing, all 5 requirements verified
  - Plan 01: 42 CSS custom properties (7 statuses × 3 variants × 2 modes), STATUS_CONFIG migrated, darkBgClass removed, 4 consumers updated
  - Plan 02: Silent catches fixed in 3 target files, R2 orphan cleanup for session photos + chart covers, status-groups.test.ts TS error fixed
  - Plan 03: DEFAULT_SUPPLY_HEX single-sourced (16 occurrences → 1), useRejectionFlash hook shared (2 EditableNumbers simplified)
  - Code review: 1 warning fixed (WR-01 dark mode on-hold-dot copy-paste), 1 advisory (WR-02 D-04 design decision)
  - Post-merge fix: 5 test assertions updated for CSS variable migration (status-badge, status-group, hero-status-badge)

### Done This Session (2026-05-24 cont.)

- **Branch created** — `feature/phase-31` off main
- **Phase 31 discussed** — context gathered, 13 decisions locked (D-01 through D-13)
  - Dual progress: FINISHED + FFO = finished, all assigned charts = owned, open-ended shows "8 charts, 3 finished"
  - Series-designer: nullable FK to Designer, no enforcement, always manual
  - Name constraints: @unique (like Designer), optional notes field
  - FIX-01 + FIX-02: already resolved, verify and close only

- **Phase 31 planned** — 3 plans in 2 waves: schema+types+factories (Wave 1 parallel), CRUD actions+FIX verification (Wave 2)
  - Plan 01 (W1): Series Prisma model, types, Zod validation, test factory updates, db push
  - Plan 02 (W1): computeSeriesProgress TDD (pure utility, parallel with Plan 01)
  - Plan 03 (W2): Series CRUD actions TDD + FIX-01/FIX-02 verification closure

- **Phase 31 code review fixed** — 5/5 findings fixed (1 critical, 4 warnings), 29 tests passing
  - CR-01: Vacuous $transaction assertion in deleteSeries test → separate mock call assertions
  - WR-01: Duplicate SeriesProgress type → single source in `@/types/series`
  - WR-02: Unsanitized console.error in series-actions → Phase 22 error message pattern
  - WR-03 + WR-04: Empty designerId/notes normalized to null via Zod `.transform()`

- **Phase 31 verified** — UAT complete: 7/7 passed, 0 issues, 2312 tests passing
  - Create/update/delete series, dual progress computation, Zod validation all confirmed
  - FIX-01 (999.19 TS errors) verified: `tsc --noEmit` exits 0
  - FIX-02 (999.22 stats resilience) verified: `Promise.allSettled` at stats/page.tsx:60

- **Phase 31 security verified** — 9/9 threats closed (5 mitigated, 4 accepted), SECURITY.md created
  - T-31-01/02/08: Zod validation (.trim/.min/.max) on name and notes
  - T-31-04: requireAuth() on all 4 CRUD actions
  - T-31-05: seriesSchema.parse() on create/update
  - T-31-03/06/07/SC: Accepted risks (pure function, single-user, no new packages)

- **Phase 32 UI-SPEC approved** — 6/6 dimensions passed after 2 revision passes
  - Typography: 2 weights (400, 600), 3 sizes (12, 14, 24px)
  - Spacing: 8-point scale, 4 DesignOS exceptions documented (p-5, h-10, p-1.5, ml-0.5)
  - Copywriting: 30 elements defined (modal labels, toasts, empty states, error states, delete confirmation)
  - All 13 CONTEXT.md decisions (D-01 through D-13) captured — zero user questions needed

- **Phase 32 planned** — 3 plans in 2 waves, verified (12/12 dimensions passed)
  - Plan 01 (W1): Data layer — expanded SeriesChart type, getSeriesDetail, nav item, mock factories, loading skeleton
  - Plan 02 (W2): Series list page — card grid, sort pills, create modal, delete (TDD)
  - Plan 03 (W2): Series detail page — chart rows, inline editing, dual progress, designer select (TDD)

- **Phase 33 discussed** — context gathered, 7 decisions locked (D-01 through D-07)
  - Form placement: Series between Cover Image and Genres
  - Inline dialog: name only (genre-simple), auto-populate designer from chart's selection
  - Pattern: exact mirror of designer SearchableSelect + InlineDialog flow

- **Phase 33 planned** — 2 plans in 2 waves: data plumbing (Wave 1), form UI wiring (Wave 2)
  - Plan 01 (W1): seriesId in validation + chart-actions, handleAddSeries in hook, InlineNameDialog custom props
  - Plan 02 (W2): Series SearchableSelect + InlineNameDialog in chart form, page data fetching

- **Phase 33 executed & verified** — 2/2 plans complete, 2304 tests passing, 9/9 must-haves verified (5 human items pending)
  - Plan 01: seriesId in chartFormSchema + chart-actions (create + update), handleAddSeries with designer auto-populate, InlineNameDialog submitLabel/requiredError props, 6 TDD tests
  - Plan 02: Series SearchableSelect + InlineNameDialog between Cover Image and Genres, both chart pages fetch series data via getSeriesWithStats
  - Code review: 4 warnings + 2 info fixed (WR-01 revalidatePath("/series") added to 3 actions, WR-02 render-phase side effect → useEffect+useRef, WR-03 removed 13 JSX section markers, WR-04 suppressUnloadRef declaration order, IN-01 unused import, IN-02 empty-name guard)

### Next Up — RESUME HERE

1. `/gsd-verify-work 33` — Browser testing for 5 human UAT items (series field position, dialog copy, persistence, designer passthrough, clear behavior)
2. `/gsd-discuss-phase 34` — Start browse & pattern dive integration

### Backlog

- ~~999.0: Multiple digital working copies per chart~~ — **Shipped in Phase 15** (v1.4)
- 999.0.4: Duplicate chart detection — warn before creating a chart that may already exist
- 999.0.10: Quick-add missing supplies from project detail page — inline creation without navigating away
- 999.0.12: Collapsible projects in shopping list — collapsed as default state
- 999.0.15: SearchToAdd side-by-side layout — desktop 2-column grid when active, mobile overlay fallback
- ~~999.0.16: SearchToAdd highlight conflict — only show keyboard highlight after arrow key use~~ — **Shipped in Phase 26**
- 999.0.17: StorageLocation/StitchingApp multi-user hardening — @@unique([userId, name]), ownership validation on writes
- ~~999.0.18: Test infrastructure cleanup for $transaction~~ — **Shipped in Phase 22**
- 999.0.19: Refactor clickable card rows to avoid nested interactive elements (ARIA violation)
- ~~**999.0.20: Supply action ownership rejection tests**~~ — **Shipped in Phase 22**
- ~~999.0.21: EditableNumber invalid input feedback — visual indication when entry is rejected~~ — **Shipped in Phase 26**
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
- ~~**999.11: Shopping cart scaling for large collections**~~ — **Shipped in Phase 25** (PR #49)
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
- 999.41: Stats cache staleness on chart status change — `updateChartStatus` missing `revalidateTag("stats")`, stale until TTL (300s hero, 3600s breakdowns)
- 999.42: Stats cache staleness on supply mutations — supply-actions missing `revalidateTag("stats")`, thread insights stale until TTL
- 999.43: ThreadInsightList items not clickable links — no thread detail page exists to link to (INS-06 partial)
- ~~**999.44: Stats page project-list query unprotected**~~ — **Fixed in Phase 22 PR review**
- ~~999.45: settled() silently discards error reasons~~ — **Fixed in Phase 22 PR review**
- ~~999.46: stats-actions console.error logs full error objects~~ — **Fixed in Phase 22 PR review**
- ~~999.47: shopping-cart-actions.test.ts `as` type assertion~~ — **Fixed in Phase 22 PR review**
- 999.48: createMockStitchSession uses inline type instead of `Partial<StitchSession>` — won't catch schema drift unlike every other factory
- ~~999.49: dashboard-tabs.test.tsx imports RenderOptions from @testing-library/react~~ — **Fixed in Phase 22 PR review**
- 999.50: Remaining `.catch(() => {})` in upload-actions.ts:155 — same silent pattern fixed in session-actions; orphans raw files with no log trail
- 999.51: `.catch(() => null)` in charts/[id]/page.tsx:50 — swallows all completion estimate errors; indistinguishable from "no data"
- 999.52: Old photo not cleaned up from R2 when user replaces photo in updateSession — storage leak over time
- 999.53: Bare `catch {}` blocks in log-session-modal.tsx (lines 166, 229, 249) — discard error details, no console.error for debugging
- 999.54: `.catch()` on deleteFile misleading — function returns `{ success: false }`, doesn't throw; catch only fires on auth race
- 999.55: processAndStoreImage `{ success: false }` silently ignored — no log when image optimization fails via return path
- 999.56: Record-detection test verbose WHAT-comments — 6-line block at record-detection.test.ts:224-229 explains arithmetic the assertions prove
- 999.57: New section-marker comments in chart-actions.test.ts:229 and supply-actions.test.ts:1423,1502 — consistent with style but counter to QUAL-07 cleanup
- 999.58: SupplyOverview runs aggregation + filtering without useMemo — recomputes on every re-render from pendingIds/failedIds changes
- 999.59: StatusGroup "Select all" is additive-only — no per-group deselect mechanism; consider toggle behavior
- 999.60: AggregatedSupply.items type could use non-empty tuple `[T, ...T[]]` — encodes at-least-one invariant from aggregateSupplies
- 999.61: Duplicated `onUpdateAcquired` callback type across 4 component prop interfaces — extract shared type alias
- 999.62: Shopping cart test gap: aggregated quantity distribution logic untested — multi-item diff allocation in AggregatedSupplyRow
- 999.63: Shopping cart test gap: project expand/collapse in ProjectAccordion untested — "not selected" message, supply details
- 999.64: Shopping cart test gap: updateSupplyAcquired integration path untested — pending/error/toast flows mocked but never exercised
- 999.65: Shopping cart test gap: QuantityControl inline edit on blur untested — mobile commit path
- 999.66: Centralize status colors as CSS custom properties — raw Tailwind scales (`bg-amber-400 dark:bg-amber-500`, `bg-rose-500 dark:bg-rose-400`, etc.) are used for the 7-state status palette across gallery-card, bucket-project-row, whats-next-tab, and status-badge. Define `--status-kitting`, `--status-ffo`, etc. to single-source dark/light variants and reduce scattered `dark:` overrides
- 999.67: Stats sections should populate from library data — thread colors, designer completion, stitched genres, etc. show nothing without tracked sessions. These should be available on a library basis (collection data), not only when the user has logged stitching sessions
- 999.68: Extract `DEFAULT_SUPPLY_HEX` constant — `"#79796e"` appears in 7+ files (chart-merged-form, inline-create-dialog, local-state-adapter, supply-actions, supply.ts). Single-source to prevent drift.
- 999.69: Extract `useRejectionFlash` hook — duplicated rejection flash pattern (state + 600ms timer + cleanup + classes) across both `charts/editable-number.tsx` and `supply-table/editable-number.tsx`
- 999.70: OptionalFocalPoint discriminated union — current type allows `focalPointX: 42, focalPointY: null` invalid state across 7 dashboard types. Replace with `{x: number, y: number} | {x: null, y: null}`
- 999.71: LocalStateAdapter.updateQuantity type safety — remove `as unknown as Record<string, unknown>` assertion, use constrained `field` parameter for direct indexing
- 999.72: Supply catalog SSR hydration — `typeof window` in useState initializer causes hydration mismatch. Consider `useSyncExternalStore` with `getServerSnapshot` or document as intentional tradeoff vs. flash
- 999.73: Supply stitch total hint discoverability — hint only visible in Details mode, not while viewing supplies. Show supply total in SummaryBar or supply mode footer so users know to check/update stitch count
- 999.74: Chart form gap at top of page — white space above breadcrumb/SummaryBar in supply mode. Not a Phase 27 regression (Activity component predates it). Investigate layout/padding source
- 999.75: InlineDesignerDialog controlled-only simplification — always used in controlled mode, remove uncontrolled path (trigger, uncontrolledOpen, isControlled branching). Also replace useState ref hack with useRef
- 999.76: SuppliesTab co-dependent optional props — group `fabricOptions` + `chartId` into single optional `calculator?: { fabricOptions: FabricOption[]; chartId: string }` to eliminate invalid prop combinations
- 999.77: SuppliesTab persistFields type narrowing — `Record<string, number>` should be `Partial<Pick<CalcParams, 'strandCount' | 'overCount' | 'wastePercent'>>`
- 999.78: handleCalcParamsChange error/rollback test coverage — test `!result.success` rollback, catch rollback, and missing `chartId` no-op paths
- 999.79: updateProjectSettings server action test coverage — auth rejection, ownership validation, Zod boundary, and Prisma error handling
- 999.80: Client-side zip validation test — verify `.zip` file passes `validateFile` in chart-file-upload component

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

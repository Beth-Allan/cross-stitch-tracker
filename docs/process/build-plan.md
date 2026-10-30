# Cross-Stitch Tracker — Build Plan

**What this is:** the staged, numbered work-item queue. One item = one session = one branch =
one squash commit (protocol §1–2). Each item carries a brief: **objective · cited specs · traps ·
literal done-when**. Statuses live in `docs/process/work-log.md` — **this file is the plan, the
log is the state.** The **Up-next queue** at the top of the work log holds the running order:
what Beth types next.

**How items enter this plan, three ways:** seeded here (the 2026-08-16 workflow overhaul, from
the dissolved Phase 41 — Beth's ruling D-10), `/plan-feature` sessions (features out of
`docs/process/work-log/backlog.md`), and `/cleanup` rulings (fix batches out of
`docs/process/maintenance-ledger.md`). A design session's approved canon also queues a **fidelity
rebuild item** here — canon never merges straight into code (protocol §8, `/design-session`).

**Ordering:** stages run in order unless Beth rules otherwise; items within a stage are
independent unless a brief says so. Two hard sequencing facts, both from Beth's ruling D-09
(_audit → wart burn-down → design track_ — the queue is managed before new work):

- **A-1 runs before Stage F.** The fix stage burns down what the audit finds, so the audit's
  findings and these seeded briefs get triaged together at one `/cleanup`, not twice.
- **Stage D cannot be briefed until DS-1 lands.** Its items are forward-declared below, not
  specified — writing a redesign brief before the design canon exists is hard rule 4's banned
  move wearing a build-plan hat.

**Lanes:** **Opus is the default build lane** — briefs pre-write the boundaries and the protocol
rails hold the steps. Fable keeps the judgment work: the A-1 audit, `/plan-feature`, design
sessions, and `/review`/`/stage-review` (protocol §1, §5). A brief names a lane **only when it is
not Opus**; there is no per-item lane line otherwise.

**Review-gating:** a brief that touches protocol §5's sensitive cores says so in its own text and
merges only from a fresh `/review` session, never from the session that built it (hard rule 3).
Path list: `.claude/hooks/review-gated-paths.txt`.

---

## Stage A — the audit (Beth's ruling D-09, requirement #2)

### A-1 Whole-codebase quality + security audit

- **Objective:** the deliberate "go hunt for bad code" sweep this project has never had — the
  thing every phase-shaped process misses, because a phase only ever looks at its own diff.
  Beth's requirement #2 in her own framing: _work begins with a full code review and codebase
  read — bugs, weak code, security issues, non-functioning tests._ Scope: duplicated and drifted
  implementations · dead code and unreachable paths · silent-failure paths (swallowed errors,
  bare catches, `.catch(() => …)` that discards context) · query patterns that will slow as the
  collection grows (N+1, missing includes, unbounded fetches) · cache coherence across the
  `unstable_cache` / `revalidateTag("stats")` layer · **test honesty** (tests that assert
  nothing, mock the thing under test, or pass regardless of the code) · a full
  `docs/process/security-checklist.md` sweep · plus the mechanical runs: `npm audit`, deep lint
  (including the 53 warnings the gate currently lets through — ledger row 2026-08-16 ①, logged
  at 55 before P3 deleted two with their files).
- **Prime suspects going in** (both already carry 999.x trails, both are protocol §5 cores):
  the **R2 upload / orphan-cleanup paths** (`upload-actions.ts`, `chart-file-actions.ts`,
  `session-actions.ts`) and the **stats cache layer** (`src/lib/queries/stats/**` — the
  `revalidateTag` trap that produced 999.41 and 999.42). Named so the sweep starts warm, not so
  it stops there.
- **Genuinely untested ground** (from the security checklist's own gaps, §4b finding 4):
  file-upload/R2 hardening · session handling under the Auth.js v5 **beta** · whether errors
  fail closed · backup/restore posture on Neon.
- **Output is findings, never fixes.** A report at `docs/process/state-of-the-code-<date>.md`
  (horse-db's `state-of-the-code-2026-07-28.md` is the model — it found six live silent
  data-loss defects a 97%-mutation-tested suite had never caught), plus maintenance-ledger rows,
  plus a proposed-items list. **The audit session changes no application code** — scope
  discipline, protocol §9.
- **Specs:** `docs/process/security-checklist.md` (the sweep runs against it category by
  category) · `docs/process/maintenance-ledger.md` (what is already known — cite rows, do not
  re-find them) · `docs/process/session-protocol.md` §3 (what test honesty means here) ·
  `CROSS_STITCH_TRACKER_PLAN.md` (what the code is supposed to do) · the codebase docs in
  `docs/` (`ARCHITECTURE`, `STRUCTURE`, `CONVENTIONS`, `TESTING`, `STACK`, `INTEGRATIONS`,
  `CONCERNS`) · `docs/domain/` for anything the craft decides.
- **Traps:** ① **Read-only posture, fresh session.** ② **Run as parallel subagent sweeps**
  (protocol §9 context budget, Beth's ruling D-14) — one sweep per dimension, findings returned,
  synthesis in the main session. A single session reading 24 routes and 2448 tests inline blows
  the budget and produces a worse report. ③ **Do not re-litigate what is already queued** — cite
  the ledger row or the Stage F brief instead of re-deriving it. ④ **Resist proposing rewrites
  the design track will do anyway**: flag only what cannot wait for its screen's turn (Beth's
  ruling D-07 sets the redesign order). ⑤ Findings get exactly one home each — ledger row _or_
  report section _or_ proposed item, never all three. ⑥ 2448 tests passing is not evidence the
  tests are honest; that is the point of the test-honesty dimension.
- **Done-when:** report written at `docs/process/state-of-the-code-<date>.md`; ledger rows
  landed; proposed-items list ready for `/cleanup` triage with Beth; **zero application-code
  changes in the diff**; work log updated and the Up-next queue names the `/cleanup` that
  triages it.
- **Lane:** Fable — judgment about what counts as bad code is the entire item.

---

## Stage P — the A-1 burn-down (adopted at the 2026-08-17 `/cleanup`)

The audit's proposed items P1–P12 adopted as build items with Beth's rulings applied, plus two
items the same `/cleanup` created (P13, P14). **The report section is the brief:** each P1–P12
item's full spec — evidence, file lists, defect-by-defect detail — is
`docs/process/state-of-the-code-2026-08-17.md` §3 under the same number; the entries below add
only the rulings and cross-item wiring decided at triage. Rulings cited below are in
`docs/process/work-log/drift.md` (Ruled, 2026-08-17). Running order: the work-log queue.

### P1 Outer fence + login rate limit — **gated (auth core)**

- **Objective:** make `proxy.ts` actually protect routes (the `authorized` callback), move
  `checkRateLimit` inside `authorize()` so both login entry paths are throttled, add the missing
  auth/rate-limit/JWT-callback tests, and correct the two false doc claims — report §3 P1.
- **Folded in:** the 2026-08-17 ledger row — missing auth env vars diagnose as "Invalid
  credentials"; make server misconfiguration distinguishable from a wrong password without
  leaking which to an attacker.
- **Done-when:** P1's defect list closed clause by clause, test-first; docs corrected in the same
  PR; gate green; merges only from a fresh `/review`.

### P2 R2 upload-action hardening — **gated (R2 core)**

- **Objective:** report §3 P2 — real server-side size/type enforcement, ownership-scoped key
  primitives (copy `chart-file-actions.ts`'s model), Zod on every input, and resolve
  `confirmUpload` (dead code today; deleting it takes its tests with it — **not** covered by the
  2026-08-17 approvals, which name only P3 and P12: if deletion is the choice, ask Beth for her
  word on the record when P2 runs; wiring it instead needs no approval).
  _(Resolved while building, 2026-08-17: **Beth ruled delete**, test removal approved on the
  record; the cover-optimization capability it carried became item P15, queued after P8 —
  drift.md, Ruled.)_
- **Folded in:** the write-path integrity gaps ledger row (2026-08-17) that touch this file —
  delete-order and client-trusted metadata.
- **Done-when:** P2's list closed test-first; gate green; fresh `/review` before merge.

### P3 Delete the superseded shopping feature + orphans — **approved 2026-08-17**

- **Objective:** report §3 P3 — remove `getShoppingList`/`markSupplyAcquired` (the two access
  holes) and the six orphaned components, **with their tests**; Beth's test-removal approval is
  on the record in drift (2026-08-17).
- **Folded in:** the dead-code-slivers ledger row (2026-08-17) — dead props, dead types,
  test-only exports.
- **Done-when:** zero references remain (grep-demonstrated), suite green, gate green.

### P4 Session dates land one day early in stats — **partly gated (stats queries)**

- **Objective:** report §3 P4 — one storage/read convention for session dates applied across
  write, stats reads, and display formatters, with honest fixtures (03:00Z, DST boundaries) that
  make regression impossible.
- **Folded in:** the cache-TTL ledger row's current-period predicate spread (six files, three
  shapes, server-local time) — P4/P5 split it: P4 owns the timezone correctness.
- **Traps:** the convention choice (UTC date-parts vs local-midnight instants) is the builder's,
  but it must be written down in `docs/ARCHITECTURE.md`; the product outcome is identical.
  Includes the `completion-estimates`/`pace-metrics` dishonest-assertion repairs named in P4.
- **Done-when:** a session logged "Aug 17" reads Aug 17 in every stats surface and the browser;
  fixtures cover the hours that used to hide it; fresh `/review` for the gated half.

### P5 Stats cache invalidation: complete the writer side

- **Objective:** report §3 P5 — every stats-visible mutation invalidates, and **the per-mutation
  test rule** (Beth's ruling, drift 2026-08-17 ②: every stats-visible mutation carries a test
  asserting its `revalidateTag("stats", { expire: 0 })` call) becomes the standing pattern,
  recorded in `.claude/rules/testing-requirements.md` (carry the frontmatter rule).
- **Folded in:** the cache-TTL ledger row's legibility half — the 300s/3600s TTLs move to
  shared named constants with a one-line written rule for which a new query picks (P4 owns the
  same row's timezone half).
- **Done-when:** chart 6/6, designer + genre covered, supply 22/22, session 3/3 asserted; the
  rule file states the pattern; TTL constants + the choosing rule in place; gate green.
  _(Count corrected while building, 2026-08-17: `supply-actions.ts` has **22** mutations and 22
  `revalidateTag` call sites — the brief's 23 and `ARCHITECTURE.md`'s 26 both counted the
  import line. Descriptive staleness, protocol §6.)_

### P6 Honest failure states: stop rendering errors as zeros

- **Objective:** report §3 P6 — failed loads say "couldn't load", never "you have none";
  optimistic saves roll back on failure. Includes the 1-of-5-guarded `/charts` ledger row (its
  named home).
- **Done-when:** each listed surface demonstrates its failure state test-first; gate green.

### P7 One fabric calculator — **absorbs F-2; gated (fabric calculator)**

- **Objective:** report §3 P7 — unify the three drifted fabric-formula copies on the gated
  module, pin the rounding with exact assertions, margin **value** untouched (open question
  Q-005 stays open).
- **F-2 rides inside:** the fabric-matching-with-no-fabric fix is built here, **after** its
  domain question (F-2 trap ② — what should a no-fabric project match against?) is answered by
  Beth via `/stitch-fact` in this session. F-2 no longer runs as its own item.
- **Done-when:** one implementation, exact rounding pinned, F-2's done-when absorbed and
  demonstrated, fresh `/review` before merge.
  _(Built 2026-08-17. Two findings changed the shape of the item. **F-2 was already implemented**
  — commit `18859b3`, May 2026 — so its "bug" was a guess in production rather than a gap; Beth
  ruled on it in-session (FAB-006) and the ruling narrowed the behaviour to fitting pieces only,
  on both halves of the list. **Over-count is missing from the fabric size formula entirely** —
  drift D-17, Beth ruled fix-it-next, filed as F-4; P7 preserved today's arithmetic exactly so
  F-4 changes it in one place. The rounding contract chosen: the calculator returns the **exact**
  requirement and rounding is a display decision — a rounded-down minimum silently accepts fabric
  that is too small, which is precisely the 1dp defect the audit found in `pattern-dive-actions`.
  Margin value untouched; Q-005 stays open. Folded in: the file/fabric write-path ledger row's
  arm ③.)_

### P8 R2 orphan lifecycle — **gated (R2 core)**

- **Objective:** report §3 P8 — chart deletion cleans up R2, the deterministic thumbnail leak
  ends, cover-replace can no longer delete the live thumbnail, and the `unsaved/` prefix +
  reconciliation story is decided. Bucket topology follows R-1's ruling (read real, write
  scratch — drift 2026-08-17).
- **Done-when:** P8's four defects closed test-first; reconciliation decision recorded; fresh
  `/review` before merge.
  _(Reconciliation resolved while building, 2026-08-17: **Beth ruled leave it and write the plan
  down** — no sweep, no bucket rule yet, because a lifecycle rule on `covers/unsaved/` would
  delete live covers until **P15** moves saved covers off that prefix. Residue + pre-condition on
  the maintenance ledger; ruling in drift.md, Ruled.)_

### P9 Query scale + data integrity: the unbounded-read batch — **split by Beth 2026-08-20**

The size check fired, and a second finding fired with it. P9 as briefed was seven read surfaces
plus a gated migration — three sessions, not one. The finding is worse than size: **the repo has a
migrations folder but no migration pipeline** (drift, 2026-08-20). One migration directory covers 5
of 18 models, nothing in the build or CI runs `migrate deploy`, and this machine has no `.env.local`
— so a hand-written `migration.sql` would merge green and leave Neon untouched. Beth ruled: build
the invisible half today, split the rest.

The original objective stands unchanged — report §3 P9, the surfaces that break first at 500+
charts. It is now carried by three items.

#### P9a The invisible half, dashboard side — **built 2026-08-20**

- **Objective:** the read-volume fixes on the **ungated** action files — the surfaces that fetch
  the whole collection to render a handful of cards. Rendered output must be byte-identical; this
  item changes only how the data is fetched.
- **Scope, exactly (all in `src/lib/actions/`):** `dashboard-actions.ts` —
  `getCurrentlyStitchingProjects` (every session per project, for one date + two aggregates),
  `getBuriedTreasures` (fetches N unstarted charts to slice ≤5), `getCollectionStats` (all projects
  - charts for 8 scalars) · `project-dashboard-actions.ts` — the three junction `select { id }`
    arrays that exist only to be `.length`-ed · `chart-actions.ts` — `getChartsForGallery`'s junction
    fan-out (kitting dots + three counts) · `pattern-dive-actions.ts` — `getWhatsNextProjects`'
    kitting % and `getFabricRequirements`' O(charts × fabrics) cross-product.
- **Traps:** ① **Equivalence is the whole job** — every replacement must produce the same number
  the JS pass produced, including the kitting rule for a project with no supplies (drift,
  2026-08-17) and `Σ min(acquired, required)` capping, which a bare `_sum` does not reproduce.
  ② Touch no gated path: `src/lib/queries/stats/` and `prisma/schema.prisma` belong to P9c.
  ③ `getShoppingCartData` is a fourth junction fan-out the audit never named — ledger it, do not
  fix it here.
- **Done-when:** each named function demonstrated test-first to return what it returned before
  while reading bounded rows; no gated path in the diff; gate green.
  _(Split again while building, 2026-08-20 — the context budget, not a new finding. The two
  `dashboard-actions.ts`/`project-dashboard-actions.ts` halves landed here; the gallery and
  Pattern Dive halves are **P9a-2** below, unchanged in scope. Nothing was dropped, and the
  equivalence traps below still bind both. One thing P9a settled that P9a-2 does not need to
  rediscover: `groupBy(["projectId", "date"])` **is** a distinct-calendar-day count, because
  session dates are written only through `parseCalendarDate()` and are therefore always exactly
  UTC midnight — verified in `session-actions.ts`. Only a fixture disagreed; ledger row.)_

#### P9a-2 The invisible half, gallery and Pattern Dive side — **built 2026-08-20**

- **Objective:** the remainder of P9a's scope, unchanged — `chart-actions.ts`'s
  `getChartsForGallery` junction fan-out (kitting dots plus the three `.length` counts, both
  consumed in `src/components/features/gallery/gallery-utils.ts`) and `pattern-dive-actions.ts`'s
  `getWhatsNextProjects` kitting % and `getFabricRequirements` cross-product.
- **Traps:** ① P9a's trap ① with teeth: kitting % is `Σ min(acquired, required)` with fabric
  counted as one item, which a bare `_sum` does **not** reproduce, and a project with no supplies
  has a ruled answer (drift, 2026-08-17) — reproduce both or the number moves.
  ② `getFabricRequirements`' `usableCount === null` branch maps the **whole** unassigned stash;
  that branch is the O(charts × fabrics) case, not the matched one. ③ `getShoppingCartData` is a
  fourth junction fan-out the audit never named — ledger row, not this item's to fix.
- **Done-when:** as P9a's, for the three named functions.
  _(Built 2026-08-20. The two kitting surfaces share one new reader —
  `summariseProjectSupplies` in `src/lib/queries/project-supplies.ts` — because they wanted the
  same three sums off the same three tables; the gallery's chart row lost its junction arrays
  entirely, which also shrinks what `/` and `/charts` serialise to the browser. `getFabricRequirements`
  was the odd one out: its cost is materialisation, not reads, so it sorts the stash into pools
  once and judges each piece in a single pass, and its output is unchanged by construction rather
  than by a new equivalence test. Trap ③ is logged, not fixed: `getShoppingCartData` is the fourth
  fan-out and the only one whose rows are actually rendered, so it wants P9b's pagination shape
  instead — maintenance-ledger row, 2026-08-20.)_

#### P9b The two paginated lists — **UI-touching; preview before merge**

- **Objective:** `/sessions` (every session ever logged, one presigned photo URL each) and
  `/supplies` (the whole catalogue, ~489 DMC rows, sorted in JS) become page-by-page.
- **Traps:** ① `getSessionHistory` (`src/lib/queries/stats/session-history.ts`, `PAGE_SIZE = 25`)
  plus `stats/search-params.ts` and `session-history-table.tsx`'s Prev/Next block are the
  end-to-end pattern to copy — there is exactly one in the repo and no shared `Pagination`
  primitive. Reading it is fine; **it is a gated file — do not edit it.** ② `/supplies` is the
  bigger half: `getThreads` has no SQL `orderBy` because the order is `naturalSortByCode`, and
  search/filter run client-side over the full catalogue in `supply-catalog.tsx`. Paginating means
  moving sort **and** search to the server, or the page shows the wrong rows.
- **Done-when:** both lists paginated test-first, presign bounded to the visible page, Beth has
  seen the preview; gate green.

#### P9c The gated half — **ruled 2026-10-24 (D-24); waits on R-2, the migration pipeline**

- **Objective:** the four whole-table session scans in `src/lib/queries/stats/`
  (`available-years.ts`, `day-of-week.ts`, `personal-bests.ts`, `record-detection.ts` — the last
  runs on **every session write**), the missing indexes as one migration, and the
  StorageLocation/StitchingApp ledger row (`@@unique([userId, name])`, the unscoped
  `project.updateMany` on both delete paths, the friendly-duplicate P2002 arms).
- **Also inherits — routed at the 2026-10-24 `/cleanup`:** a database check that
  `Project.overCount` is 1 or 2, so the three unchecked `as 1 | 2` narrowings become true by
  construction (ledger row 08-18), and constraints for `Fabric.type`/`colorFamily`/`colorType`
  (row 08-19). Both ride R-2's pipeline.
- **Also inherits — rerouted from P11, 2026-08-19:** `prisma/schema.prisma`'s
  `// Calculator settings (Phase 7)` comment, a planning-doc reference the conventions ban.
- **Blocked, not queued.** The index and uniqueness work cannot honestly complete until the
  2026-08-20 drift row is ruled: _how does a schema change reach the live database?_ **Ruled
  2026-10-24 (D-24): automatic on deploy** — built as **R-2**, and P9c follows it. The stats-scan
  half is gated but not blocked, and could be lifted out if she wants it sooner.
- **Done-when:** the four scans bounded test-first; the migration question answered and its answer
  carried out; indexes + uniqueness real in Neon, not merely committed; fresh `/review`.

### P10 Dependency patch session

- **Objective:** report §3 P10 — clear the 2 critical + 13 high advisories now. Mostly
  `npm audit fix`-clean; the auth/Next-adjacent pieces get hard-rule-8 care (Context7 /
  `node_modules/` verification) and a real verification pass.
- **Folded in:** the `@types/node` 20→22 bump (ledger row). The standing ~monthly dependency
  row continues separately.
- **Done-when:** advisories cleared or individually explained, gate green, app demonstrated
  working (login, upload, stats render), versions stay exact-pinned.

### P11 Small honest fixes — **split by Beth 2026-08-19; batch one merged**

The size check fired exactly as the trap predicted: seventeen fixes, three of them on
review-gated paths. Batching them would have held the fourteen harmless ones behind a `/review`
session, so Beth split the item two ways and rerouted two fixes to the items that already own
the same decision.

- **Objective (batch one — `P11`, merged as PR #105, 2026-08-19):** report §3 P11's ungated list plus its
  ledger rows — comment sweep, recharts named imports, `shadcn`→devDependencies, dead
  `NEXT_PUBLIC_APP_URL`, dependabot package-name fix, `.gitignore` settings.local.json, the two
  placement oddities, the `/charts` dynamic-server half of the build-noise row, the CSP quick
  wins, the 10MB/50MB upload copy, `SupplyGridView`'s unwired `onDelete`, and the three
  `jsx-a11y` warnings. ~~the `R2_BUCKET_NAME` fallback throw~~ — **done in R-1 (2026-08-17)**.
- **Done-when (batch one):** each fix demonstrated (behaviour fixes test-first; pure copy/config
  by inspection), gate green. **Met** — see the work log.
- **Rerouted, not dropped:** the two upload allowlists → **P13** (same decision as the type-rule
  row it already owns, and it touches gated `upload-actions.ts`) · `prisma/schema.prisma`'s
  `Phase 7` comment → **P9** (already opens that file) · `fabric-calculator.ts`'s `D-20 / Q-005`
  comment → the next gated session in that file.

### P11b The two rulings Beth made on 2026-08-17 — **gated; `/review` follows**

- **Objective:** the **quick-add colour-family picker** (Beth: quick-add must ask, so a
  quick-added supply stops filing silently under `NEUTRAL` and invisible to the catalogue's
  colour filter) and the **over-logging confirm** (Beth: warn but allow — a session that would
  push a project past its total stitch count asks first and saves on her word), with the
  **display-clamp unification** that ruling carries: progress % is hand-written 12× with 7 copies
  unclamped, so one project reads 100% on the gallery card and 137% on the chart hero.
- **Cited specs:** `docs/process/work-log/drift.md` — the two 2026-08-17 rulings, verbatim ·
  the over-logging ledger row · report §3 P11.
- **Traps:** the clamp unification reaches `src/lib/queries/stats/` (**`completion-estimates.ts`
  only** — this brief also named `designer-insights.ts`, but its `completionRate` is completed
  projects ÷ total projects, a rate that cannot exceed 100 and is not stitch progress; verified
  and left alone during the build, 2026-08-19), which is **review-gated** — the builder stops at
  `built, awaiting review`. Both fixes are UI, so Beth sees the Vercel preview before merge.
  Quick-add's picker is a form change on a path with no design canon: follow DesignOS
  (`product-plan/sections/supply-tracking-and-shopping/`), never invent.
- **Done-when:** quick-add asks for colour family and the supply lands in that family
  (test-first) · logging past 100% warns and saves on confirmation (test-first) · one clamped
  display helper, every copy using it, no percentage above 100 anywhere · gate green.

### P12 Test-honesty repairs — **removals approved 2026-08-17**

- **Objective:** report §3 P12 — repair the tests that pass for the wrong reason; remove the ~40
  phantoms (Beth's approval on the record in drift); retitle the kitting-% test to match
  **KIT-004** (0% — `docs/domain/kitting-and-storage.md`); tighten the four factory `as` casts
  (ledger row) so the union invariant holds in factories too.
- **Done-when:** every named test fails when its subject breaks (spot-demonstrated), phantom
  removals listed in the PR, gate green.

### P13 One validation boundary — **created at the 2026-08-17 `/cleanup`; split by Beth 2026-08-19 (D-20)**

The size check fired at the top of the build session: five inherited ledger rows had become seven
fixes, and three of them land in `upload-actions.ts`, a review-gated core — so batching would have
held the four harmless ones behind a `/review`. **Beth's ruling (D-20): split.** The form-input
half is P13 and merged the same day; the upload half is **P13b** below.

- **Objective (P13, merged as PR #109, 2026-08-19):** unify the duplicated boundary rules in
  `src/lib`: one trim/blank-is-absent convention across every boundary schema (client forms stop
  compensating), the `storageLocationSchema`/`stitchingAppSchema` twins collapsed to one
  definition, both friendly-error arms shared out of `utils/action-errors.ts`, and typed action
  inputs — the 24 dead `z.infer` exports become the actions' real signatures instead of `unknown`.
- **Cited specs:** the two 2026-08-17 ledger duplication rows (`src/lib` boundary cluster;
  unknown-typed actions) · `.claude/rules/form-patterns.md`.
- **Traps:** behavior-preserving refactor plus small validation fixes — anything that _changes_
  what validates is TDD'd; no schema/migration scope.
- **Done-when:** one convention, stated in `form-patterns.md`; zero dead `z.infer` exports;
  gate green. **Met, precisely:** 22 of the 25 inferred types are now live action signatures;
  `UpdateFocalPointInput` was **deleted** rather than renamed, because `updateFocalPoint` takes
  three primitives and the object type could never have a caller; `UploadRequestInput` becomes live
  when P13b types the gated action it belongs to. The one exception is
  `validations/auth.ts`'s `LoginInput`, still `z.infer` and still dead — that file is review-gated
  by Beth's P1 ruling, and carrying a one-word rename would have put the whole ungated diff behind
  a `/review`, the trade D-20 had just ruled against. Reverted out of the branch and logged.
- **Deliberately left, with ledger rows:** the boundary-duplication row's three largest arms (the
  junction three-arm dispatch, `CalcParams`/`CalculatorSettings`, and the two gated action files'
  error arms) · `validations/supply.ts`'s private enum copies, because merging them changes the
  `required_error` wording **D-19** rules on · the three unconstrained `Fabric` enum columns the
  new typing exposed · the `digitalFileUrl` phantom in `chart.test.ts`, which is a test change and
  therefore Beth's call.

### P13b The upload half of one validation boundary — **gated; `/review` follows**

- **Objective:** the three fixes D-20 separated out, all of them about what a submitted key or
  file is allowed to be. ① The **two byte-identical upload allowlists** (`ALLOWED_FILE_TYPES` /
  `ALLOWED_CHART_FILE_TYPES`) merged to one. ② The **rule that disagrees with itself**:
  `chart-file-list.tsx` accepts a file whose MIME type is unknown when its extension is allowed
  (the `.xsd`-arrives-as-`text/xml` case), and `getPresignedUploadUrl` then refuses it — so the
  browser says yes and the server says "Invalid file type". ③ The **submitted-cover-key ownership
  check** P15's review added. Also finish the P13 sweep in the two gated action files: both error
  arms come from `utils/action-errors.ts`, and `getPresignedUploadUrl`/`addChartFile` type their
  payload from their schema like every other action now does.
- **Cited specs:** the `chart-file-list.tsx` vs `getPresignedUploadUrl` ledger row · the
  `chartFormSchema` cover/file-key ledger row · the `src/lib` boundary-duplication row's gated arm
  · `.claude/rules/form-patterns.md` (the convention P13 wrote) · drift **D-20**.
- **Beth's question this item must ask first — the domain fact that decides ②:** which
  stitching-software file formats does she actually keep? The client's extension list and the
  server's MIME list can only be reconciled once that is on the record, and an extension is a
  caller-supplied string, so honouring it blindly would let any object in by being named `.pdf`.
  Goes through `/stitch-fact` into `docs/domain/`, not into code as a guess.
- **Traps:** ③ **only half closes.** The obvious rule — the owner segment must be `unsaved` or the
  chart's own id — leaves the other half open, because `CoverImageUpload` is never handed a chart
  id, so every cover the form uploads lands under `covers/unsaved/…` and pre-P15 charts are still
  live on that prefix. Refusing `unsaved` is not an option (it would leak the raw upload of every
  replaced cover); the rest needs a "no other chart names this key" test, or it waits for **P16**.
  Read that ledger row in full before designing the fix. **Gated** (`upload-actions.ts`,
  `chart-file-actions.ts`), so the builder stops at `built, awaiting review`.
- **Done-when:** one allowlist; the browser and the server agree about what they accept, with
  Beth's recorded answer behind it; a submitted cover key cannot name another chart by id
  (test-first) and the remaining `covers/unsaved/` half is stated in the work log rather than
  quietly left; both gated actions typed and using the shared error arms; gate green; fresh
  `/review` before merge. **Met, 2026-08-19, with one clause exceeded:** the `covers/unsaved/`
  half did **not** have to wait for P16 — the trap said it would need a "no other chart names this
  key" test, and that is one extra lookup, so all three save paths now check the owner segment
  _and_ that no other chart's row names the key. Beth's answer (CHF-001–CHF-003) removed `.zip`
  from the accepted list rather than adding anything: the first constant in the app narrowed by
  her word rather than widened by a guess. The agreement between browser and server is one shared
  function, `resolveChartFileContentType`, so the extension is an additional requirement and never
  a substitute for the declared type — which also tightened `installer.exe`-as-`octet-stream`,
  previously accepted. `.css` stays accepted and unsourced, recorded as CHF-004 / **Q-007** rather
  than dropped without asking.
- **Deliberately left, with a ledger row:** `chartFormSchema`'s `fileKeys` still accept any owner
  segment — the same defect as the cover keys, in the same create path, but copy-only (nothing
  discards a submitted file key) and outside a done-when that named cover keys. The fix shape is
  already written: `submittedCoverKeysAreOwn` applied to `fileKeys`.

### P14 Gate alignment — **gate-config changes pre-approved 2026-08-17**

- **Objective:** burn down the standing eslint warnings (**48 as of 2026-08-19** — P11 batch one
  closed the three `jsx-a11y` ones, the only real defects in the list; what is left is 35
  unused-vars and 13 `no-img-element`), then flip lint to `--max-warnings 0`; change CI to
  literally run `npm run gate`. Both approved on the record (drift 2026-08-17).
- **Cited specs:** the two ledger rows (55-warnings; CI re-implements the gate) ·
  `.claude/rules/quality-gates.md` — update it and `docs/` in the same PR.
- **Done-when:** lint step green at zero warnings and failing on any new one (demonstrated with
  a scratch warning), CI workflow is one gate invocation, rules/docs updated, gate green.

### P15 Optimize chart cover images — **created by Beth's ruling during P2 (2026-08-17)**

- **Objective:** chart covers are stored exactly as uploaded — a full-size phone photo is served
  in full every time the chart opens. Session photos already go through
  `processAndStoreImage` (1200px WebP + 400px thumbnail); covers get only a thumbnail via
  `generateThumbnail`. Put covers on the same pipeline, which also collapses two image paths
  into one and retires `generateThumbnail`.
- **Why it exists:** P2 deleted `confirmUpload`, the never-called code that would have done this.
  Beth ruled: delete it, build the shrinking properly and separately (drift 2026-08-17).
- **Runs after P8**, which owns cover-replace cleanup and the deterministic-thumbnail leak in the
  same code — building this first would make P8's brief stale.
- **Traps:** ① existing covers stay full-size unless a backfill is part of the item — decide and
  say which ② the optimized key replaces `coverImageUrl`, so the raw original is deleted only
  after the DB write succeeds (the ordering `session-actions.ts` already uses) ③ gated: this is
  `upload-actions.ts` and `chart-actions.ts`'s cover path — `/review` before merge.
- **Done-when:** a newly uploaded cover is stored as an optimized WebP plus a thumbnail,
  test-first; one image pipeline remains; the backfill decision is recorded; gate green;
  fresh `/review` before merge.
- **Backfill decision (trap ①) — Beth's ruling, 2026-08-17, in the P15 session:** **not in this
  item; queued as its own item P16.** P15 is forward-only — a cover shrinks when it is uploaded
  or replaced, and the covers already in the library keep their full-size originals until P16
  converts them. Asked as a decision because it is her library: converting hundreds of stored
  pictures cannot be tested from a machine with no R2 credentials and cannot run inside one
  request, so riding it along would have put an untestable production job inside a gated item.
  She chose to queue it. It is also the remaining pre-condition for the `covers/unsaved/`
  lifecycle rule P8 parked (maintenance-ledger row).
- **Test removals — Beth's approval, 2026-08-17, in the P15 session, on the record** (hard rule
  2): retiring `generateThumbnail` retires the tests written against it. Every assertion was
  carried to the new path first — the key-pin and ownership proofs moved onto
  `processAndStoreImage`, and `chart-actions-thumbnail.test.ts` became
  `chart-actions-cover-image.test.ts` with more clauses than it had.

### P16 Shrink the chart covers already in the library — **created by Beth's ruling during P15 (2026-08-17)**

- **Objective:** P15 made cover optimization forward-only. Every cover uploaded before it is
  still stored at full phone-photo size, under whatever key it was uploaded with — including
  `covers/unsaved/…` for anything saved from the create form. Convert them: run each existing
  cover through `processAndStoreImage`, point the chart at the derivatives, delete the originals.
- **Why it exists:** Beth's ruling during P15 (drift 2026-08-17) — the forward path and the
  conversion are separate work, and the conversion is what makes opening an _old_ chart fast.
- **Cited specs:** the P15 brief and its diff · `docs/INTEGRATIONS.md` (object lifecycle) · the
  maintenance-ledger row on abandoned pre-save uploads, whose pre-condition this closes.
- **Traps:** ① **It cannot run in one request.** Hundreds of charts × a download, two `sharp`
  encodes and three R2 calls each will exceed any serverless budget — it needs batching with
  resumable progress, and "how does Beth start it and see it finish" is a real design question,
  not an afterthought. ② `processAndStoreImage` pins the raw key to the one the row records, so
  the conversion must read each chart's current `coverImageUrl` and pass exactly that. ③ Already
  optimized covers must be skipped, and the test for "already optimized" has to be the row, not
  the key's spelling. ④ A cover whose object is missing from R2 must leave the row alone and be
  reported, never blanked. ⑤ **Gated** — `upload-actions.ts` and the cover path; `/review` before
  merge. ⑥ No R2 credentials exist on the build machine, so the run itself is exercised against
  the Vercel preview's scratch bucket (R-1) before it touches production.
- **Done-when:** every chart whose cover is not yet an optimized derivative has one, test-first;
  the originals are deleted only after each row is updated; a chart with a missing object is
  reported and left intact; Beth can start it and see it finish without running a command; the
  maintenance-ledger pre-condition is updated to say the `covers/unsaved/` lifecycle rule is now
  safe — and, in the same row, that the deletion sliver P15's `/review` found (a crafted save
  naming another chart's pre-P15 `covers/unsaved/…` cover) closes with it; gate green; fresh
  `/review` before merge.
- **Met, 2026-08-20, with one clause deliberately conditional.** Every clause is built and
  test-first (38 new tests, suite 2951 → 2989): the conversion runs one chart per call from a
  Settings card, the row names the derivatives before either old object is deleted (asserted by
  call order, not by inspection), a missing object leaves the row untouched and comes back named,
  and the run is resumable because the work list is a question about the rows rather than
  remembered progress. **The conditional clause is the ledger pre-condition:** built is not run,
  so the row says the `covers/unsaved/` rule and the deletion sliver close the moment Beth's run
  reports nothing left — writing "now safe" before the covers have actually moved would be the
  one sentence in this item that is not true. Trap ① answered with no job table; ③ answered on the
  row (both keys in the chart's own namespace) rather than on the `opt-` spelling, and the
  assumption that makes that sound — `CoverImageUpload` is handed no chart id — is now a ledger
  row instead of an implicit dependency. Trap ⑥ is the preview run, which doubles as Beth's
  layer-2 look: the preview reads the real bucket, writes to scratch and holds a Neon **copy**, so
  a full rehearsal there cannot touch a real object or a real row.
- **The conditional clause closed 2026-08-21.** The delta re-review passed, Beth ran the rehearsal on the
  preview and then the real thing on production the same day, and it finished with nothing left alone —
  every cover is now an optimized derivative, and the ledger row says the `covers/unsaved/` half of the
  lifecycle rule is safe and the deletion sliver is closed. Merged as PR #119.

## Stage F — post-audit fixes (seeded from the dissolved Phase 41, Beth's ruling D-10)

Phase 41 was "Series Polish & Bug Fixes". D-10 dissolved it: **its genuine bugs are these three
briefs**; its series _display_ polish (SERIES-02, SERIES-03 — old backlog 999.86, .87, .88, .89)
went to the design track and is recorded in `docs/process/work-log/backlog.md`. Nothing was
dropped and nothing is done twice.

**These three are seeded, not scheduled.** They run in the Stage F burn-down after A-1, so the
audit's findings and these are triaged with Beth in one `/cleanup` (D-09). If A-1 finds a
deeper cause under any of them, the brief is rewritten before it is built — a seeded brief is
not a promise that the diagnosis below is right.

### F-1 Series creation bugs — designerName and the dialog's pending text

- **Objective:** two defects on the series-create path, both reported by Beth (old backlog
  999.83, 999.85; requirement SERIES-01). ① Creating a series **with a designer selected** shows
  `designerName: null` in the resulting list row — the locally constructed `SeriesWithStats`
  carries the `designerId` but never the name, so the row Beth just created looks designer-less
  until a reload. ② `InlineNameDialog`'s pending text is hardcoded to `"Adding…"` and ignores a
  customized `submitLabel` prop, so a dialog that says "Create" reports "Adding…".
- **Cited specs:** `CROSS_STITCH_TRACKER_PLAN.md` (series as a domain object) · design canon for
  the series surfaces if any exists by then (`docs/design/screens/`), DesignOS otherwise — but
  note this item **changes no layout**, only what the row says.
- **Traps:** ① The honest fix for ① is either looking the name up from the already-loaded
  designers list **or** widening what `createSeries` returns — pick one and say why; widening a
  server action's return shape is the more durable fix and the one to prefer unless the list is
  provably always in hand. ② Do not "fix" it by refetching the whole list — that trades a wrong
  label for a round-trip. ③ ② is a shared dialog: check every call site before changing the
  prop's meaning, and test the default (no `submitLabel`) still reads "Adding…". ④ TDD: both are
  behavior changes, so failing test first, always (protocol §3).
- **Done-when:** creating a series with a designer selected shows that designer's name in the
  list row with no reload; `InlineNameDialog` pending text derives from `submitLabel` and falls
  back to "Adding…" when none is given; a failing-first test exists for each; `npm run gate`
  green; work log updated.
  _(Built 2026-08-18. **Defect ①'s data half was real; its described symptom was not.** The
  locally built `SeriesWithStats` did carry `designerName: null` while the server knew the name —
  fixed by widening what `createSeries` returns (trap ①'s preferred fix), so the name comes from
  the database rather than a client list that can only ever be as fresh as its last load. But no
  screen renders that copy's designer: the chart form's Series dropdown labels each option with
  the series name alone, and the two surfaces that do show a series' designer — the Series cards
  and `/series/[id]` — are server-rendered from `getSeriesWithStats`, which already filled the
  name in. **So there was no visible "designer-less row" to fix, and the done-when's first clause
  cannot be literally demonstrated** — what landed is the data being true rather than the screen
  changing. Defect ② landed as written: the pending label is derived from `submitLabel`
  ("Add Series" → "Adding Series..."), which reproduces "Adding..." exactly for the default label,
  so the fallback clause needs no separate branch. A neighbouring gap went to the backlog rather
  than into this diff: a series' designer can only be set by creating the series inline from a
  chart form.)_

### F-2 Fabric matching excludes projects with no fabric assigned

> **Absorbed into P7, and closed there 2026-08-17.** A-1 confirmed the deeper cause this brief
> anticipated: the fabric formula exists 3× with drifted rounding and the gated copy is unused
> (report P7). F-2 never ran as its own item. **Building it revealed the brief's premise was
> already stale:** the null-`fabricCount` short-circuit had been fixed in May 2026 (commit
> `18859b3`), so what remained was not a bug but an unasked question answered by code. Beth
> answered trap ② in the P7 session — **only pieces that actually fit are offered, on both halves
> of the list** — recorded as **FAB-006** and built inside the unified calculator. Trap ① holds:
> "no fabric assigned" still reports no required size at all, never a size of zero. The brief
> below stays as the requirement record.

- **Objective:** the Pattern Dive **Fabric Requirements** tab shows zero matches for projects
  that have no fabric assigned — a `null` `fabricCount` short-circuits the matching logic, so
  exactly the projects most in need of a fabric suggestion are the ones that get none (old
  backlog 999.21; requirement FIX-01).
- **Cited specs:** `CROSS_STITCH_TRACKER_PLAN.md` on what fabric matching is _for_ ·
  `src/lib/utils/fabric-calculator.ts` — **protocol §5 review-gated core.**
- **Review-gating:** if the fix lands in `fabric-calculator.ts`, this item **merges only from a
  fresh `/review` session** (hard rule 3), never from the session that built it. If the fix
  turns out to be purely in the tab's query or presentation, it is not gated — say which in the
  PR, explicitly, rather than letting the reader work it out.
- **Traps:** ① **A `null` fabric count is not a zero.** "No fabric assigned yet" and "fabric with
  a count of 0" are different states and must stay different; collapsing them is how this bug
  gets replaced by a worse one. ② **Domain fact, stop-and-ask:** what _should_ a project with no
  assigned fabric match against — every fabric, or fabrics filtered by some default? That is
  Beth's practice, not an inference (hard rule 5, protocol §7). If the answer is not already in
  `docs/domain/`, **ask her before writing the branch** — do not guess a default count.
  ③ The calculator has edge-case tests already (old 999.0.24, shipped Phase 37) — extend them,
  never loosen them.
- **Done-when:** the answer to trap ② is recorded (via `/stitch-fact`) before code is written;
  a project with no assigned fabric returns the matches that answer defines; a project with a
  real fabric count is unchanged (regression test proves it); failing-first tests for both;
  `npm run gate` green; the PR states whether the diff is review-gated; work log updated.

### F-4 Over-count is missing from the fabric size calculation

- **Objective:** `fabric-calculator.ts` never divides the fabric count by the project's
  `overCount`, so every over-two project (linen, most evenweave) is told it needs roughly half
  the fabric it actually needs. `skein-calculator.ts` already divides; `FAB-004` says both
  should. Drift **D-17**, Beth's ruling 2026-08-17: fix it in a short session directly after
  P7's review.
- **Cited specs:** `docs/domain/fabric.md` FAB-004 (over-count and effective count) and FAB-005
  (the size formula) · `src/lib/utils/fabric-calculator.ts` — **protocol §5 review-gated core**,
  so this merges only from a fresh `/review`.
- **Traps:** ① **This is not Q-002.** Q-002 asks how over-count is _decided_ and stays open; this
  item only applies the value already stored on the project. Do not infer an over-count from
  anything. ② **The margin does not move** — Q-005 stays open, and the margin is added after the
  effective count divides, exactly as today. ③ Every call site must pass the project's real
  `overCount`: `pattern-dive-actions.getFabricRequirements` does not currently select it, and the
  stash-matching branch for a project with no assigned fabric has no project over-count to use —
  say explicitly what that branch does rather than defaulting silently. ④ The displayed size
  reference table in `fabric-requirements-tab.tsx` walks seven counts for one project; decide
  whether those rows are effective counts or raw counts, and label them so Beth can tell.
- **Done-when:** the fabric size for an over-two project uses `fabricCount / overCount`,
  demonstrated test-first; a project at over 1 is unchanged (regression test proves it); every
  call site passes a real value; trap ③'s no-assigned-fabric branch has a stated, tested answer;
  FAB-004's claim about "both calculators" is true when the item lands; `npm run gate` green;
  fresh `/review` before merge; work log updated.
  _(Built 2026-08-18. **Trap ③'s premise was wrong and the answer is the simpler one:** every
  project row carries `overCount` (schema default 1), so the no-assigned-fabric branch has one to
  use — it judges each stash piece at that piece's own count divided by **the project's**
  over-count, because over-count is how Beth stitches the project, not a property of a piece she
  might buy for it. Inferring one from the fabric is Q-002 and stays open. Trap ④ resolved as:
  the reference rows stay the **raw** counts printed on fabric she buys, sized at the effective
  count, each labelled "works like N" when the project is over 2. `overCount` is a **required**
  argument on the calculator — no default, since a default of 1 is exactly the shape of the bug.)_

### F-5 "Fits if you stitch it over one" — the qualifier, not the hiding

- **Objective:** a spare fabric piece that fits a project **only** if it is stitched over one is
  currently hidden along with the pieces that fit no way at all (F-4's behaviour). Show it, with
  that qualifier. Domain fact **FAB-007**, Beth's ruling 2026-08-18 (drift **D-18**), in her
  words: _"this fits if you're stitching over 1, but not if you're stitching over 2"_. Her
  reasoning is the spec: a project with no fabric assigned may not have a settled over-count, so
  hiding the piece assumes a decision she has not made.
- **Cited specs:** `docs/domain/fabric.md` **FAB-007** (the rule), **FAB-006** (what stays true —
  a piece too small either way is still not offered) and **FAB-004** (effective count) ·
  `src/lib/utils/fabric-calculator.ts` and `src/lib/actions/pattern-dive-actions.ts` — the
  calculator is a **protocol §5 review-gated core**, so this merges only from a fresh `/review`.
- **Traps:** ① **There is exactly one new state, not two.** Over two always needs more fabric than
  over one, so "fits at over two but not over one" cannot happen. Three states total: fits either
  way · fits only at over one · too small either way. Do not build a general N-way comparison.
  ② **This is not Q-002.** Nothing infers an over-count from anything; the project's stored value
  still decides what the project needs, and the qualifier only answers "what if it were the other
  one". ③ **The qualifier is a label, not a match.** A piece that fits only at over one must not be
  counted as fitting — the row's fit state, the status icon and any count of fitting pieces stay
  keyed to the project's real over-count. ④ **The assigned-fabric branch has the same case** — a
  same-count spare that fits only at over one — so decide and state whether the qualifier appears
  in both halves of the list, as FAB-006 does. ⑤ **UI copy is a design surface**: canon in
  `docs/design/` if it exists by then, DesignOS otherwise (hard rule 4); it is a label added to
  existing rows, not a new region.
- **Done-when:** a piece fitting only at over one is shown with the qualifier and is not counted as
  fitting, demonstrated test-first; a piece too small either way is still absent (regression test);
  an over-one project is completely unchanged (regression test); the both-halves decision of trap ④
  is stated and tested; FAB-007's "not true of the app today" note is retired when the item lands;
  `npm run gate` green; Vercel preview to Beth (protocol §5 layer 2); fresh `/review` before merge;
  work log updated.
  _(Built 2026-08-18. **Trap ④ answered: the qualifier appears in both halves** — a same-count
  spare that fits only at over one is shown for a project with fabric assigned exactly as for one
  without, because over-count is the project's own setting either way and FAB-006 states its fit
  rule for both halves alike. The three states live in the calculator as `classifyFabricFit`, so
  the "over two always needs more than over one" invariant is tested where the math is: an
  over-one project can never reach the third state, and that short-circuit is what leaves it
  unchanged. The qualified pieces come back in their own `overOneOnlyFabrics` array rather than as
  a flag on `matchingFabrics` — trap ③'s "not counted as fitting" is then structural rather than a
  discipline every caller must remember. They render under their own heading, "Fits Only If You
  Stitch Over 1", each row carrying the qualifier in Beth's own words, and **with no Assign
  button**: assigning one would be assigning fabric that does not fit the project as it stands.)_

### F-3 Supply stitch-total hint is invisible outside Details mode

> **Rerouted (2026-08-17 `/cleanup`).** Beth chose trap ①'s fold: the hint's placement joins the
> chart-form redesign — recorded as a design-track input to DS-2/D-2 in `backlog.md`. Not built
> in Stage F; the gap stands until D-2 lands.

- **Objective:** the hint telling Beth the supply calculations depend on the chart's stitch count
  is only visible in Details mode — so while she is actually _working in supplies_, nothing tells
  her the number is missing or stale. Surface it in the SummaryBar or the supply-mode footer (old
  backlog 999.73; requirement FIX-02).
- **Cited specs:** design canon for the chart form once it exists (`docs/design/screens/`),
  DesignOS (`docs/design/DESIGN-REFERENCE.md` → `product-plan/sections/`) until then — hard rule
  4: this is a UI placement change and is **never** designed from imagination.
- **Traps:** ① **This item sits on the first surface D-07 redesigns** (chart form + detail). The
  cheap version is work done twice, and D-10 sent Phase 40's polish to the design track for
  exactly this reason. It is seeded here because the handoff placed FIX-02 among Phase 41's
  genuine items — **raise the overlap at the `/cleanup` that triages Stage F and let Beth
  choose**: fix it now as a small honest placement, or fold it into the chart-form redesign
  brief. Do not decide this silently in either direction. ② If it is built now, build the
  _smallest_ honest version — a hint in an existing container, not a new layout region the
  redesign will delete. ③ It is a visibility change, not a calculation change: nothing about how
  the total is computed may move (`skein-calculator.ts` is a §5 core).
- **Done-when:** Beth's routing decision is recorded in the work log before the branch opens; if
  built: the supply total is visible without entering Details mode, the placement traces to
  canon or DesignOS, no calculator file is touched, `npm run gate` green, Vercel preview link
  sent to Beth before merge (protocol §5 layer 2); work log updated.

---

### F-7 The chart form's calculator settings are never saved — **created at the 2026-10-24 `/cleanup`**

- **Objective:** the over-1/over-2 toggle, strand count and waste percent on the chart form reach
  the project when the chart is saved, creating and editing. Today they live only in the
  localStorage draft (`chart-merged-form.tsx` starts them at `DEFAULT_CALC_PARAMS`), and neither
  `chartFormSchema` nor `createChartAndProject`/`updateChart` carries them — so a project created
  "over 2" is stored over 1 and F-4's fabric sizing reads wrong for it (maintenance-ledger row
  2026-08-18).
- **Cited specs:** the ledger row · `docs/domain/fabric.md` (FAB-004, effective count) ·
  `updateProjectSettingsSchema` (the existing write path's rule — reuse it, don't restate it,
  `.claude/rules/form-patterns.md`).
- **Traps:** ① The defaults are domain constants — don't invent new ones; use what
  `DEFAULT_CALC_PARAMS` already traces to, and stop-and-ask if it traces to nothing. ② Editing an
  existing chart must not overwrite a project's saved settings with the form's defaults — the form
  has to start from the project's values. ③ Stats-visible mutation: keep the `revalidateTag`
  assertion (testing rule). ④ Not gated (`chart-actions.ts`, `validations/chart.ts`), but the
  calculators that read the value are — don't touch them.
- **Done-when:** test-first — create and edit both persist all three settings; editing preserves
  saved values; gate green; Beth has seen the preview (a chart created over 2 shows over-2 sizing).

### F-8 Housekeeping batch — **approved by Beth at the 2026-10-24 `/cleanup` (trivial-batch)**

- **Objective:** close eighteen ungated ledger rows in one `fix/` branch, no visible change. Each
  is a ledger row (verified live 2026-10-24); the row's own text is the spec.
  - **Behaviour (test-first):** project start/finish/FFO dates written through `parseCalendarDate`
    (`chart-actions.ts`, row 08-17) · `updateSupplyAcquired` calls `revalidateTag("stats", …)` with
    its rule test (row 08-17) · `settled()` rethrows every Next control-flow signal via
    `unstable_rethrow` — verify the export in `node_modules/next` (row 08-19) · Pattern Dive's
    `include` narrowed to `select`, its shape test following (row 08-20) · the inline brand/designer
    dialogs stop normalising blanks (row 08-19) · `validations/supply.ts` takes its enum lists from
    `src/types/supply.ts`, keeping D-19's messages (row 08-19) · the dead `chartId` prop on
    `CoverImageUpload` removed (row 08-20).
  - **Hygiene:** the `// ───` marker sweep (row 08-19) · one `formatNumber` in `src/lib/utils/`
    (row 08-19) · the dead `group` class in `hero-cover-banner.tsx` (row 10-14, part ②) · the
    `digitalFileUrl` test-title rename (row 08-19) · `supplies-tab.gaps.test.tsx` asserts on its
    spy or its header stops claiming it (row 08-20 — strengthen, never weaken) · `SECURITY.md`'s
    10MB figures (row 08-19) · the broken ledger table (row 08-19).
  - **Beth's four rulings (D-25, same `/cleanup`):** delete `src/components/placeholder-page.tsx`
    **and its test — removal approved on the record** (row 08-20) · pin the test run to
    `TZ=America/Edmonton` (row 08-17, no-TZ-pin) · add `src/generated/**` to `globalIgnores` (row
    08-20, lint edges ①; ② stays as designed) · re-export `userEvent` from `test-utils` and move the
    43 direct imports onto it (row 08-17). Items 2 and 3 are gate-config changes — pre-approved by
    D-25, say so in the PR.
- **Traps:** ① No gated path — if one turns up, that fix leaves the batch. ② A renamed or rewritten
  test asserts the same or more, never less (hard rule 2). ③ Each row moves to Resolved in the PR.
- **Done-when:** every listed row Resolved, gate green, layer-1 review passed; merges on green.

### F-9 Auth slivers — **queued by Beth at the 2026-10-24 `/cleanup`; gated — `/review` follows**

- **Objective:** two ledger rows on gated auth files. ① `authorizeCredentials`'s wrong-email
  short-circuit skips `bcrypt.compare`, so response timing reveals the login address (row 08-17,
  `src/lib/auth.ts`) — compare against a fixed dummy hash on that path. ② The dead `LoginInput`
  `z.infer` export in `src/lib/validations/auth.ts` (row 08-19) — delete it.
- **Traps:** ① The rate limit must still be recorded before any hashing (`.claude/rules/auth-patterns.md`).
  ② Test the _shape_ (compare is called on both paths), never wall-clock timing — a timing test is flaky.
- **Done-when:** test-first; both rows Resolved; gate green; fresh `/review`.

### F-10 Calculator hygiene — **queued by Beth at the 2026-10-24 `/cleanup`; gated — `/review` follows**

- **Objective:** ① `skein-calculator.ts` divides `fabricCount / overCount` inline while
  `fabric-calculator.ts` has `calculateEffectiveCount` — one rule (FAB-004), one implementation (row
  08-18). ② `classifyFabricFit` takes the piece's count as a separate argument that must always be
  the piece's own — make the signature say so (row 08-18). ③ The planning-doc comment sliver at
  `fabric-calculator.ts:5` (comment-sweep row, routed here 2026-08-19).
- **Traps:** ① Pure refactor — every existing calculator test passes unchanged; no figure on screen
  moves. ② Domain constants untouched (hard rule 5).
- **Done-when:** rows Resolved, existing suite green unchanged plus any new seam test; fresh `/review`.

### F-11 Chart-form file verification — **queued by Beth at the 2026-10-24 `/cleanup`; gated — `/review` follows**

- **Objective:** files attached while creating a chart get the verification `addChartFile` already
  performs. Three ledger rows, one write path: P2's `createChartAndProject` client-metadata row and
  P8's duplicate of it (both 08-17 — merge them), and `chartFormSchema`'s `fileKeys` accepting any
  owner segment (row 08-19). Read size/type back from the stored object (`HeadObject`, via the helper
  in gated `chart-file-actions.ts`) and fence `fileKeys` the way P13b fenced cover keys.
- **Traps:** ① Reuse P13b's key-ownership rule and `resolveChartFileContentType`; don't write a
  second one (`.claude/rules/form-patterns.md`). ② A refused file must name itself to Beth, not fail
  the whole save silently.
- **Done-when:** test-first; three rows Resolved; gate green; fresh `/review`.

### F-12 R2 request timeout — **queued by Beth at the 2026-10-24 `/cleanup`; gated — `/review` follows**

- **Objective:** the `S3Client` in `src/lib/r2.ts` sets no request timeout, so an R2 outage that
  hangs can hold `deleteChart` until the Vercel function dies and turn a finished delete into an
  error (row 08-17). Give the client a bounded timeout and decide, per caller, what a timeout means.
- **Traps:** ① Verify the AWS SDK v3 `requestHandler` timeout options in `node_modules/` (hard rule 8).
  ② A delete whose database half succeeded must still report success; the orphan is logged, not surfaced.
- **Done-when:** test-first; row Resolved; gate green; fresh `/review`.

### F-13 The storage family in its own folder — **queued by Beth at the 2026-10-24 `/cleanup`; gated — `/review` follows**

- **Objective:** D-22 gates the R2 storage family by a filename-prefix pattern, one new sibling away
  from going stale again (row 08-21). Move the family into `src/lib/actions/storage/` and gate the
  directory.
- **Traps:** ① **Opens with a question, not a branch:** changing `.claude/hooks/review-gated-paths.txt`
  is a gate-config change (hard rule 6) — put the before/after to Beth and get her yes on the record
  before moving anything. ② Imports move with the files; no behaviour changes. ③ Protocol §5's mirror
  of the list changes in the same PR.
- **Done-when:** Beth's yes recorded; files moved, gate list and §5 updated; gate green; fresh `/review`.

### F-14 Three small visible fixes — **Beth's rulings D-26 (2026-10-24 `/cleanup`); UI-touching, preview before merge**

- **Objective:** three ungated ledger rows, each with Beth's answer. ① **Genre add fails silently**
  (`genre-picker.tsx`, row 10-14): show a short message under the input, e.g. "'Animal' is already
  on the list." — the form-error pattern, not a toast. ② **Stale thumbnail after a failed
  optimisation** (`chart-actions.ts` `updateChart`, row 08-17): clear the old thumbnail so the lists
  fall back to the new full cover (`gallery-grid.tsx`'s fallback). ③ **The completion estimate
  vanishes** (`charts/[id]/page.tsx`, row 08-17): a quiet muted line for each case — "Not enough
  stitching logged yet to estimate" vs "Couldn't work out an estimate right now" — P6's
  honest-failure pattern.
- **Traps:** ① ② deletes nothing from R2 — the old thumbnail object's cleanup is the orphan story's,
  not this item's; check the path stays ungated. ③ needs the two cases distinguishable — if that
  means editing gated `src/lib/queries/stats/completion-estimates.ts`, that half leaves for a gated
  item rather than riding here. Wording is Beth's; semantic tokens only.
- **Done-when:** test-first, three rows Resolved, gate green, Beth has seen the preview.

### F-15 Calendar-date test fixtures — **queued by Beth at the 2026-10-24 `/cleanup`; test-only**

- **Objective:** session dates and project start/finish/FFO dates are calendar dates, always stored
  `T00:00:00.000Z` via `parseCalendarDate()`; ~125 fixtures give them a time of day the app cannot
  store (ledger row 2026-08-20). Make the fixtures describe data the app can actually hold.
- **Traps:** ① Each hit needs judgement — a fixture that is deliberately an _instant_ (a timestamp,
  `createdAt`) stays as it is. ② Rewriting a fixture never loosens its assertion (hard rule 2); if a
  test only passed because of the impossible time, that is a finding, not a rewrite. ③ Prefer one
  factory helper over 125 literals. ④ Stats tests sit in gated `src/lib/queries/stats/` — if the
  sweep reaches them, route the PR to `/review`.
- **Done-when:** row Resolved, gate green, no assertion weakened; merges on green unless ④ applies.

### F-16 Per-brand skein length — **created by Beth's answers at the 2026-10-25 `/stitch-fact` (THR-007–THR-011, D-34, D-36); split by Beth 2026-10-25 (D-40) into F-16a and F-16b; the catalogue `/plan-feature` comes first (D-41) — it ran 2026-10-25 and re-briefed both halves (D-42; Stage C below)**

The `/work-item F-16` session (2026-10-25) put traps ⑧ and ⑨ to Beth, as the done-when requires
before a branch opens, and the size check fired: database, calculator, recompute and "unknown" on
every skein-count screen are one session; the form that sets a length is another. **Beth's rulings
(D-40):** split in two; **Kreinik is a thread — one Kreinik brand with lines inside it**, not one
brand per line; saved needs not typed by hand are **recomputed on deploy, but only on lines whose
length changed** (her correction, after layer-1 review showed DMC figures could move); a line whose
need is unknown counts as **not yet in hand**; and the brands and lines she has given lengths for are
**added, lengths filled in**. Then she asked for the thread catalogues to be planned first (D-41),
so a `/plan-feature` session precedes F-16a and may re-brief both halves — where it has, its
version wins.

**What the data looked like** (the Neon `preview` branch, read-only, during the F-16 session — a
copy of production's data as of 2026-08-17, plus whatever preview deployments have written since):
every thread is DMC (496 colours); the other brands are "Custom (Thread)" (no threads) and Mill Hill
(no beads); all 643 project thread lines are DMC, 5 overridden by hand; **no Kreinik anywhere**, as
thread or specialty. Production since August was not visible — F-16a opens by making it visible
(its first scope bullet).

The objective, cited specs and traps below are shared by both halves; traps ⑧ and ⑨ carry Beth's
answers. F-16a and F-16b each add their own scope and done-when.

- **Objective:** the skein calculator reads each thread's own skein length instead of one 8 m for
  every brand (THR-005). The length belongs to the **thread line** where a brand's lines differ
  (Kreinik, THR-010, D-40), and to the brand otherwise — whether that is stored as a brand's one line
  is trap ②'s schema call. Beth enters it when she sets up a brand or line, and a thread without one
  shows its skein count as **unknown** (D-34, THR-011). Today Weeks Dye Works and Gentle Art would
  read roughly 58% of the skeins a project needs (THR-009), so the shopping list would run short.
- **Cited specs:** `docs/domain/threads.md` THR-004–THR-016 · `open-questions.md` Q-009 ·
  drift D-34, D-40, D-41, D-43, D-44 · backlog "Per-brand skein length" (old 999.13, planned here) · R-2
  (migrations go live on deploy) · `.claude/rules/form-patterns.md` (the brand form's new field) ·
  `.claude/rules/ui-design-reference.md` (where the field goes).
- **Traps:** ① **The lengths are THR-008–THR-010 and nothing else.** Every other brand starts blank
  (unknown), never 8 m by default (hard rule 5). The migration fills in only the stated brands and
  creates only those missing outright (D-40 ⑤). **A brand matches only by its exact name, case aside,
  and type `THREAD`.** A same-named brand of another type — a SPECIALTY "Kreinik" is plausible,
  since the quick-add dialog's own example is "Kreinik Braid" and the product spec filed Kreinik
  under specialty — or a near-name ("Weeks", "Gentle Art") is a stop-and-ask, never a create beside
  it and never a fuzzy match. `SupplyBrand.name` is unique across every type, so creating beside a
  same-named brand would abort the deploy's migration.
  ② **"Thread line" does not exist in the schema yet:** `Thread` is `@@unique([brandId, colorCode])`.
  How a #4 braid is told apart from a #8 braid of the same colour is a schema decision. If it needs a
  domain fact (how Kreinik numbers colours across lines — **not recorded**: whether 001 exists in
  more than one line is unconfirmed), stop and ask through `/stitch-fact`. _D-40 settles the shape —
  lines inside a brand — but not the schema._ Prisma 7.10.1's schema language has no
  `NULLS NOT DISTINCT`, so a nullable line on `Thread` with `@@unique([brandId, lineId, colorCode])`
  would let DMC 310 be entered twice. Partial indexes exist behind the `partialIndexes` preview
  feature (layer-1 review of PR #145 found it in the 7.10.1 engine; check before relying on it, and a
  preview feature is itself a choice to weigh). One shape that needs neither: every thread belongs to
  a line, and a brand with one kind of thread has one line. **A line's name is Beth's vocabulary,
  not a developer's** — ask her before any line name is written (THR-010's "#4 braid", "#8 braid"
  and "blending filament" are hers — superseded as literal strings by THR-012's names), and a brand's only line need not show a name at all.
  _**Settled by the catalogue plan (D-42, 2026-10-25): every thread belongs to a line, and
  uniqueness is per line and colour code, never per brand and code.** Kreinik's own colour chart
  says one colour number spans its sizes ("Some colors come in more than one size" — the legend of
  `kreinik.com/PDF/Metallic_Color_Reference_Chart.pdf`; put to Beth to confirm from her own stash at
  the `/stitch-fact` row that precedes this item — `/stitch-fact` records only her own facts — and
  the schema allows one code in several lines whether or not she can), so #4 braid 002 and #8 braid
  002 must both be possible.
  The catalogue loader (C-1) finds a line by brand name + line name and never creates one, so line
  names are unique within a brand, case aside, and are exactly the names Beth gives at that
  `/stitch-fact`; the Kreinik colours themselves land in C-1b._
  _**Answered at that `/stitch-fact`, 2026-10-29 (D-43):** the three lines are named
  **"Blending Filament"**, **"Very Fine #4 Braid"** and **"Fine #8 Braid"** (THR-012) — those
  exact strings; one colour number is one colour in every size (THR-014); a finish letter is part
  of the code, so 002 and 002HL are two colours (THR-015); every Kreinik line is used whole
  (THR-013)._
  ③ The 255 is an 8 m skein's usable inches, derived as whole 18-inch cuts of 15 usable inches each
  (THR-006). Proportional scaling and whole cuts disagree (a 5 yd skein: 146.6 vs 150 usable inches),
  so apply **the cited derivation**, whole cuts, and pin it with a test. If that reading is in doubt,
  stop and ask. The cut length is the cited source's, not Beth's. _Q-008 was answered 2026-10-29:
  she cuts about 24 inches of floss and 15 of Kreinik, about 3 lost from each (THR-016). **This
  item still builds on 18/15, by her ruling D-44**, so "DMC unchanged" stays its proof that the
  rebuild broke nothing; F-19 switches to her figures straight after this item's review. The code
  cites THR-006 only; THR-016 is F-19's to cite._
  ④ **Used whole** (THR-010): each cut is one working strand, so the strand term must not divide
  Kreinik into six. Pin that formula shape with a test. **Every other brand's or line's strand
  structure is unrecorded (Q-009)** — a line Beth adds later must never be divided into six by
  default; if the build needs to know, stop and ask through `/stitch-fact`. _The reading the tests
  pin (the session's arithmetic from `skein-calculator.ts`'s own derivation, not Beth's words):_ a
  cut of six-strand floss yields 6 ÷ strands working lengths, which is why the 6s cancel; a cut of a
  thread used whole yields **one**, so its strand term is **6** — the same as floss stitched with all
  six strands — never 1 and never the project's strand count. Worked figure: 5000 stitches, 14-count
  over one, 20% waste, #8 braid (315 usable inches) → **9 spools**; a build that treats it as one
  strand gets 2. Same inputs at 2 strands: DMC **4** skeins, Weeks Dye Works **6**.
  ⑤ "Unknown" must read as unknown on every screen that shows a skein count, never as 0 (P6's
  honest-failure pattern). ⑤ also has no home today: `quantityRequired` is `Int @default(1)` and the
  supply-table adapters clamp a calculated need with `Math.max(1, …)`, so a blank length would
  silently become "1 skein". Representing "unknown" is a schema decision inside this item.
  ⑥ Add the `THR-` citations to `skein-calculator.ts`'s header (`docs/domain/README.md`). ⑦ Any
  mutation that moves a stats figure carries its `revalidateTag` test. ⑧ **Kreinik may not be a
  thread in the app.** The specialty create dialog's example is "Kreinik Braid", and
  `calculateSkeins` runs only for `THREAD` rows, so the build may need to re-type Kreinik. Check how
  Beth's own Kreinik is recorded before designing anything. Moving it from specialty to thread
  changes how she enters it, so that is a question for her, not a migration to decide alone.
  _**Answered (D-40):** Kreinik is a thread, one brand with lines inside it. The August data holds no
  Kreinik; if production now does (as specialty items), re-typing them is trap ①'s stop-and-ask. The
  "Kreinik Braid" example in `inline-create-dialog.tsx` and the "Mill Hill or Kreinik" line in
  `supply-brand-list.tsx`'s empty state become wrong and change in C-1 (moved there from F-16b by
  D-42)._ ⑨ **Stored figures do
  not move by themselves.** A thread row's calculated need is saved in `quantityRequired` and
  recalculated only when its stitch count is edited. So existing Weeks Dye Works and Gentle Art rows
  stay short after the calculator is fixed. Whether to recompute the rows not overridden by hand
  rewrites numbers she has been using: put it to Beth, and never touch an overridden row.
  _**Answered (D-40, as corrected the same session): recompute only rows whose line is not an 8 m
  six-strand skein** — a changed length, a used-whole line, or no length or structure (→ unknown).
  DMC and Anchor rows stay exactly as saved, and overridden rows are never touched. A saved need can
  disagree with its project's current settings (before F-7 the chart form saved none of them), which
  is why the recompute does not reach DMC — that drift is a maintenance-ledger row (2026-10-25), not
  this item._

#### F-16a The right numbers — **gated (schema, migration, skein calculator); UI-touching; preview, then `/review`**

- **Objective:** thread lines exist in the database, each with a skein length and a strand
  structure that may be unknown; the calculator works from the line; every saved need on a changed
  line is right or honestly unknown; and "unknown" reads as unknown on every screen that shows a
  skein count. Beth cannot yet type a length — that is F-16b — so a brand or line she adds in
  between reads unknown.
- **Scope:**
  - **First, see production.** Before designing the migration, ask Beth to reset the `preview`
    branch from production in Neon (`docs/INTEGRATIONS.md`, Migrations — her dashboard step; ask her
    to show the dialog before she confirms). That makes `preview` today's copy of her data, which
    this item's migration needs anyway because it changes data. Then read it, read-only: every brand
    with its type, any specialty item that looks like Kreinik, any threads under "Custom (Thread)",
    and the rows the recompute would reach. Anything trap ① names is a stop-and-ask before a line
    of SQL is written. The Kreinik line names are already hers (THR-012, trap ②) — never ask them
    again; in the same breath, ask Beth for any other line name the schema needs (a one-line brand's
    line, if it must carry one).
  - **Schema + one migration** (wrapped in `BEGIN;` … `COMMIT;`, written with
    `migrate dev --create-only` against a throwaway database — protocol §2, `docs/INTEGRATIONS.md`
    Migrations): the thread line (trap ②), with uniqueness per line and colour code (D-42); a
    length and a strand structure on it, both able to be unknown; and a saved need that can be
    unknown (trap ⑤). Every reader of the need handles the
    unknown case — TypeScript lists them once the column is nullable.
  - **The data the migration writes** (D-40 ⑤): DMC gets 8 m, six-strand (THR-008); Anchor (8 m,
    six-strand), Weeks Dye Works and The Gentle Art (5 yd, six-strand — THR-009) and Kreinik with
    lines **Very Fine #4 Braid** (11 m), **Fine #8 Braid** (10 m) and **Blending Filament** (50 m)
    — her names, THR-012 — all used whole (THR-010, THR-013),
    are **created** where no brand of that name exists and **filled in** where a `THREAD` brand of
    exactly that name does (trap ①) — names as THR-007 spells them. **No other Kreinik line is
    created:** Beth gave no ribbon width (D-40 left the width hers), so the ribbon line D-40
    mentioned is hers to add when a project needs one (F-16b), length unknown until she gives it
    (THR-011; D-43 ②). The catalogue loader (C-1) loads colours into a line but never creates one,
    so the three lines C-1b loads into must exist first — they do.
    "Custom (Thread)" and any other brand keep unknown. `prisma/seed.ts` builds the same DMC data, so a fresh database and a migrated
    one agree.
  - **The recompute** (D-40 ③ as corrected, trap ⑨): in the same migration, every `ProjectThread`
    with a stitch count, `isNeedOverridden = false`, and a line that is not 8 m six-strand is
    recomputed from its line, with exactly the inputs the supplies tab uses (`supplies-tab.tsx`: the
    project's strands — falling back to 2 when the stored value is not 1–6 — over-count and waste,
    and its fabric's count, else `DEFAULT_CALC_PARAMS.fabricCount`), so a recomputed figure equals
    what re-entering the stitch count would produce; a line with no length or no strand structure
    makes the need unknown.
  - **The calculator** (`skein-calculator.ts`, gated): usable inches from the line's own length
    by whole 18-inch cuts of 15 usable inches (trap ③); the strand term from the line's structure
    (trap ④); unknown in, unknown out — never a number from a default.
  - **The supply table** reads the row's own line (the three adapters and `use-supply-table.ts`),
    so a stitch count entered after F-16a uses the right length.
  - **"Unknown" everywhere** (trap ⑤, D-40 ④): the project supply table, the shopping list and its
    overview, and the kitting figures. An unknown line is **still to buy** and **not in hand**, so a
    project cannot read fully kitted while one is there. The "still needed" predicate is written
    about nine times across six files (maintenance ledger, boundary-duplication row, junction arm —
    F-18 gathers them into one). F-16a must change every copy, and a test on each surface proves an
    unknown line is counted as still needed there: in TypeScript `0 < null` is false, so a missed
    copy silently counts an unknown line as in hand. Gathering the copies into one helper as F-16a
    touches them is F-18's objective arriving early — if the build does it, say so in the PR and trim
    F-18's brief. (Or the `/plan-feature` session may put F-18 first.)
  - **A row with no stitch count** keeps today's behaviour for every brand: its need starts at 1 and
    is hers to type, because it was never worked out from a length. F-16a's "unknown" is a need the
    calculator cannot work out. If the build finds a screen where that default reads as a guess,
    ask Beth rather than change it.
  - **Creating a thread** server-side lands it on a line: a brand's only line automatically; a
    brand with several lines (Kreinik) needs a line chosen, which the forms cannot offer until
    F-16b — until then, refuse it with a message saying so, never guess the line. A new thread
    brand gets its one line, length unknown. **Quick-add files every thread under "Custom
    (Thread)"** (`resolveDefaultBrandId` in `supply-actions.ts`; the add row passes no brand), so
    after F-16a a quick-added thread's need reads unknown where today it gets 8 m. That is honest
    (D-34) but visible: tell Beth in the preview note. Whether quick-add gets a brand picker is
    F-16b's question for her.
- **Traps (in addition to ①–⑨):** ⑩ **Two writers of one formula.** The recompute is SQL and the
  calculator is TypeScript. Prove they agree: the rehearsal seeds rows across every stated length,
  strand counts 1–6 and an out-of-range stored value, both over-counts and fabric and no-fabric
  projects, runs the migration on a local Postgres 17, and compares each recomputed need against
  `calculateSkeins` on the same inputs — that comparison goes in the PR. Any `Math.max(1, …)` the
  adapters apply has to agree with it as well. ⑪ **The whole-cut figures, for the tests** (the
  session's arithmetic from THR-006's derivation, not Beth's): 8 m = 314.96 in → 17 cuts → **255**
  (unchanged, so every DMC figure holds); 5 yd = 180 in → 10 cuts → **150**; 11 m = 433.07 in →
  24 cuts → **360**; 10 m = 393.70 in → 21 cuts → **315**; 50 m = 1968.50 in → 109 cuts → **1635**.
  Store lengths so 5 yd stays exact (whole millimetres do: 4572). ⑫ **Production is seen only through the reset `preview`.** If the reset cannot happen, do not
  write a data migration blind: stop and ask Beth. A failed production migration blocks every later
  deploy until it is recovered, and recovering needs a key no session holds (D-37). ⑬ The reset in
  the first scope bullet is also what INTEGRATIONS requires of a migration that changes data — do it
  before the PR's preview runs. ⑭ **Size:** if the size check fires again, the seam is the
  recompute — a second gated migration after this one, briefed by then. Say so at the top of the
  session rather than mid-build. ⑮ **Leave `hexColor` and `colorFamily` alone.** C-1 makes both
  nullable on `Thread` and `Bead` and adds a bead line (D-42 ③); this item's migration must not
  touch them, so the two migrations stay independent and C-1 can follow this one's review without
  a rebase of intent. The same goes for `prisma/seed.ts`: keep it in step with this migration
  (DMC's line and length) and no more — C-1 folds it into the catalogue loader.
- **Done-when:** test-first, clause by clause: the calculator gives DMC and Anchor the same figure as
  today for the same inputs, and the migration leaves every DMC and Anchor row as saved; Weeks Dye
  Works, The Gentle Art and each Kreinik line computed from their own lengths (trap ④'s worked
  figure among the tests); Kreinik figures do not move with the project's strand count; an unknown
  length or strand structure gives an unknown need, shown as unknown — never 0, never 1 — on every
  surface listed above; an unknown line counts as still to buy and keeps a project short of fully
  kitted; recomputed needs match `calculateSkeins` in the rehearsal (trap ⑩), and overridden rows
  are untouched; the migration ships through R-2's pipeline; `skein-calculator.ts` cites THR-006,
  THR-008–THR-011 and THR-013 (trap ⑥) — not THR-016, which this item deliberately does not
  implement; F-19 cites it. Gate green; Beth has seen the preview (a DMC project's
  supplies, unchanged; an unknown line on the shopping list; a quick-added thread reading unknown);
  stops at `built, awaiting review`; fresh `/review F-16a`.

#### F-16b The brand form — **ungated if it stays off the gated paths; UI-touching; preview before merge; re-briefed 2026-10-25 by the catalogue plan (D-42): the line label and the two stale texts moved to C-1, and this item now follows C-3**

- **Objective:** Beth sets up a brand's lines and each line's length and strand structure herself
  (D-34, D-40 ①), so no new brand ever needs a developer.
- **Opens with two questions for Beth:** whether quick-add gets a brand (and line) picker, now that a
  quick-added thread lands in "Custom (Thread)" and reads unknown (F-16a); and whether saving a
  length should recompute that line's saved needs (trap ④ below — the `/work-item F-16` session's
  reading of D-40 ③, not yet her word).
- **Scope:** on a thread brand, add and rename lines (Kreinik ribbon is the first she expects to
  add — D-40; at the 2026-10-29 `/stitch-fact` she chose to add it when a project needs one, so
  F-16a does not create it, D-43); on each line, a length she can type in metres or yards (she gave
  both, THR-008–THR-010, THR-012) and its strand structure — six-strand floss she splits, or used
  whole — either of which may stay unknown; adding a thread picks its line when the brand has more
  than one. **If F-19 made the cut length a property of the line, whether this form shows it is a
  third opening question for Beth** — F-19's PR says whether it did.
  _Moved to C-1 by the catalogue plan (D-42, 2026-10-25), which lands before this item: the line in
  a thread's label wherever a thread of a several-line brand is named, and the two stale Kreinik
  texts from trap ⑧. One colour code does appear in more than one line — Kreinik's own chart says
  so (trap ②, as settled)._
  **Out of scope: the stats page.** `src/lib/queries/stats/thread-insights.ts` names threads too, and
  it is review-gated; naming the line there is a small gated follow-up if Beth wants it (backlog).
- **Traps:** ① **Hard rule 4.** There is no canon and no DesignOS screen for a brand's lines;
  `supply-brand-form-modal.tsx` is the built pattern to extend, and the DesignOS supplies section
  (`docs/design/DESIGN-REFERENCE.md`) covers the catalogue and the supplies tab. If the lines need a
  screen shape beyond the existing modal's, that is a stop-and-ask, not an invention. ② **Q-009:**
  the form records a structure Beth states; it never offers a default, and a line she leaves blank
  stays unknown. Strand counts other than six are not modelled until she says a thread of hers has
  one — if the form seems to need that, ask through `/stitch-fact`. ③ Zod builders from
  `validations/fields.ts`, and hand-written messages on any check a screen can show
  (`.claude/rules/form-patterns.md`). ④ A length change moves every unknown or calculated need on
  that line, which moves stats figures. If Beth confirms the recompute on save, it follows F-16a's
  rule (never an overridden row) and carries the `revalidateTag` test (trap ⑦). If it has to touch
  `skein-calculator.ts`, this item is gated after all — confirm every touched file against
  `.claude/hooks/review-gated-paths.txt`, and if any is gated, add a `/review F-16b` row to the queue
  (the CodeRabbit trial ends at `/review F-19`, its third review (D-44) — no marker moves). ⑤ **Renaming a
  brand or a line that a shipped catalogue is keyed to** (D-42; C-1 trap ⑤): the catalogue loader
  matches both by name, so after a rename it skips that fixture on later deploys — harmless to what
  is already loaded, logged, and put right by renaming the fixture in a small data PR. The form need
  not stop a rename; it is enough that the README says what a rename costs and this item tells Beth
  on the preview note. A stable key is the upgrade if it ever bites.
- **Done-when:** Beth's two opening answers recorded; then test-first: Beth can add a line, set its
  length in metres or yards and its structure, and leave either blank; a thread in a several-line
  brand cannot be added without its line; saving a length does what she ruled; gate green; Beth has seen the preview (set up Kreinik ribbon with a
  length, add a ribbon colour to a project); merges on her word.

### F-17 The stitching calendar and the progress total — **created by Beth's answers at the 2026-10-25 `/stitch-fact` (SES-001–SES-003, D-36); gated (stats queries) — `/review` follows; preview before merge**

- **Objective:** three open ledger rows, each now answered.
  - **① Weeks start Monday** (SES-001). `startOfCalendarWeek` (`src/lib/utils/calendar-date.ts`)
    counts from Sunday and feeds the stats page's "this week" (`metrics-bar.tsx`) through gated
    `src/lib/queries/stats/timezone.ts` and `hero-stats.ts`, while the calendar and the day-of-week
    chart are Monday-first. Make it one week (ledger row 2026-08-17,
    two week conventions).
  - **② A session can carry the date where Beth is** (SES-002). The log-session modal offers the
    device's date; `createSession` and `updateSession` refuse anything later than Edmonton's today
    (ledger row 2026-08-17, two definitions of "today"). The server must accept every date the box
    can offer. The calendar grid's today-highlight is already device-local, which is what SES-002
    asks for — leave it.
  - **③ One total** (SES-003). Every place that treats `chart.stitchCount` as a project's total
    moves to `getEffectiveStitchCount`, as the gallery already does (ledger row 2026-08-19). **Grep
    for them; this list is where to start, not the whole of it:** `dashboard-actions.ts`,
    `project-dashboard-actions.ts`, the session picker, `project-detail-page.tsx` (whose comment
    says it must match the picker and the server, so all three move together), the server's
    over-log checks in `session-actions.ts` (create and update), and in gated stats
    `completion-estimates.ts` (its `stitchCount: { gt: 0 }` filter drops these charts before any
    divisor is reached) and `hero-stats.ts`'s collection total. Moving only some of them splits the
    over-log warning between the client and the server.
- **Cited specs:** `docs/domain/sessions-and-progress.md` SES-001–SES-003 · the three ledger rows ·
  `.claude/rules/testing-requirements.md` (stats invalidation) · `src/lib/utils/progress.ts`'s JSDoc,
  which names the split until this closes.
- **Traps:** ① **The server cannot know where Beth is.** Whatever replaces the Edmonton check must
  accept any date her device can offer and still refuse a date that is genuinely in the future.
  SES-002 is about a session's own date, not the stats clock: the stats layer's "today"
  (`STATS_TIMEZONE`) does not move. If the two collide, stop and ask. ② A test that asserts a
  Sunday week is rewritten to SES-001, citing it. That follows a ruling and is not a weakening; say
  so in the PR. ③ Check whether any cached stats figure holds a week boundary past a deploy.
  ④ `timezone.ts` and `completion-estimates.ts` sit in gated `src/lib/queries/stats/`, so this item
  stops at `built, awaiting review`.
- **Done-when:** test-first, per clause; the three ledger rows Resolved; `progress.ts`'s JSDoc
  updated; gate green; Beth has seen the preview (a Sunday's "this week", and a chart with no stitch
  count on the dashboard); fresh `/review`.

### F-18 Kitting counts each line once — **created by Beth's answer at the 2026-10-25 `/stitch-fact` (KIT-005, D-36); ungated; preview before merge**

- **Objective:** the kitting percentage gives every thread colour, bead, specialty item and the
  fabric one equal weight, and a part-bought line counts part (KIT-005). Today
  `getWhatsNextProjects` (`pattern-dive-actions.ts`) sums quantities — skeins and packs, plus the
  fabric as 1 — through `totalSupplyRollup` (`src/lib/queries/project-supplies.ts`). Put the rule in
  one place, which also closes the junction arm of the boundary-duplication ledger row (2026-08-17):
  the "still needed" predicate written ~9 times, and the three-arm dispatch spreading what "kitted"
  and "still to buy" mean across six files.
- **Cited specs:** `docs/domain/kitting-and-storage.md` KIT-004, KIT-005, KIT-006 · the ledger row's
  junction arm.
- **Traps:** ① "Counts part" is read as **in proportion** (3 of 4 skeins is ¾ of a line), the
  plain reading of what was put to Beth; if the build needs anything else, ask. ② KIT-004 still
  governs the empty case: no supply lines is 0%, and fabric alone never makes a project kittable.
  ③ KIT-006: the percentage never moves the Kitted status. ③b "In proportion" means each line
  contributes `min(1, acquired / required)`, so over-buying one line never makes up for another; the
  current rollup already caps that way, and a plain sum of ratios would not. ③c If F-16a has landed,
  a line whose need is unknown has no proportion: how it counts is a question for Beth, not a
  default. _D-40 ④ bears on it: Beth ruled such a line **not yet in hand**, so a project cannot
  read fully kitted while one is there. Whether it counts for nothing or for what has been bought is
  still F-18's to put to her._ ④ The rollup's grouped reads are
  deliberate for scale: a per-line fraction is not a plain `groupBy` sum, so find a bounded way to
  compute it rather than fetching every junction row. ⑤ The `CalcParams`/`CalculatorSettings` arm of
  the same ledger row is not this item. ⑥ Confirm every file touched stays off
  `.claude/hooks/review-gated-paths.txt`.
- **Done-when:** test-first: a project's percentage weighs lines, not quantities (one thread colour
  needing 30 skeins plus its fabric, with only the fabric in hand, reads 50%, not 1/31); one predicate
  in one place; the junction arm Resolved; gate green; Beth has seen the preview (What's Next
  percentages); merges on her word.

### F-19 The length Beth cuts — **created by Beth's answer at the 2026-10-29 `/stitch-fact` (THR-016, D-44); gated (the skein calculator, possibly schema + migration) — `/review` follows; preview before merge**

- **Objective:** the skein maths uses the length Beth actually cuts — **about 24 inches of floss
  and 15 of Kreinik, about 3 lost from each** (THR-016) — in place of the cited source's 18-inch
  cut with 15 stitched (THR-006). Today every figure assumes 18/15: a DMC or Anchor skein is
  credited with 255 usable inches where her cut gives 273, so the app has her buy slightly more
  than she needs; a Kreinik spool is credited with more than her shorter cut gives, so its figure
  runs short — about 7% for Very Fine #4 Braid, 4% for Blending Filament and 1% for Fine #8 Braid at
  the 15 inches she chose.
- **Opens with one question for Beth:** whether saved needs are recomputed. D-40 ③ as corrected
  kept DMC and Anchor rows exactly as saved, because a saved need was worked out with the project's
  settings at the time. A cut change moves every line's figure, so the same reasoning applies to
  every row. Put the options in her terms ("only newly worked-out figures change" against
  "recompute every saved figure from today's settings — never one you typed in yourself"), with the
  counts from the reset `preview` copy, and record her ruling before the branch opens. An overridden
  row is never touched either way (F-16a trap ⑨).
- **Cited specs:** `docs/domain/threads.md` THR-006, THR-008–THR-013, THR-016 · `open-questions.md`
  Q-009 · drift D-40 ③ (as corrected), D-44 · F-16a's calculator and its traps ③, ④, ⑨, ⑩ and ⑪
  (whole cuts; the used-whole strand term; overridden rows untouched; the recompute checked against
  the calculator; the pinned figures) · `docs/INTEGRATIONS.md` Deployment →
  Migrations, if a column is added.
- **Scope:** the calculator's usable inches from each line's length by **whole cuts of Beth's cut,
  less 3 inches each**, by this rule (D-44): **24 → 21** for the six-strand floss lines she has
  described — DMC, Anchor, Weeks Dye Works, The Gentle Art (THR-008, THR-009); **15 → 12** for every
  Kreinik line, since she said it of Kreinik, not of particular lines; **no cut** for any other
  brand's line until she gives one (Q-009) — her general "about 24 inches usually" was not put to
  her for those brands. **Where the cut lives is this item's schema call**, and it must not give a
  line a cut she did not (hard rule 5). Lines without a length already read unknown, so this only bites a line she
  gives a length to later (F-16b). If the shape needs to know a cut for a line she has not
  described, stop and ask through `/stitch-fact` (Q-009 carries it). The figures F-16a's tests pin
  change on purpose: name each changed assertion in the PR as D-44's consequence, never as a
  loosened test (hard rule 2).
- **Traps:** ① **Whole cuts, as F-16a reads THR-006** — the session's arithmetic from THR-016,
  not Beth's words, for the tests: 8 m = 314.96 in → 13 cuts → **273**; 5 yd = 180 in → 7 cuts →
  **147**; Very Fine #4 Braid 11 m = 433.07 in → 28 cuts → **336**; Fine #8 Braid 10 m = 393.70 in →
  26 cuts → **312**; Blending Filament 50 m = 1968.50 in → 131 cuts → **1572**. ② Her figures are
  approximate — "I don't really measure", "3" lost is reasonable, if generous". Use them as given;
  no per-project cut setting, no extra precision. ③ The used-whole strand term (F-16a trap ④) is
  unchanged: one cut is one working strand. ④ Any mutation that moves a stats figure carries its
  `revalidateTag` test. ⑤ If a column is added **or saved needs are recomputed** (her ruling may
  make this a data-only migration), the migration is `BEGIN;` … `COMMIT;` (protocol §2), rehearsed
  on the throwaway Postgres against the reset `preview` copy, and every recomputed need is compared
  against `calculateSkeins` on the same inputs, as F-16a trap ⑩ does — that comparison goes in the
  PR.
- **Done-when:** Beth's saved-needs ruling recorded; then test-first: the calculator gives each line
  the usable inches in trap ① for the same inputs, a floss line at 24/21 and a Kreinik line at 15/12;
  no line takes a cut Beth did not give for it by default; saved needs follow
  her ruling; `skein-calculator.ts` cites THR-016; gate green; Beth has seen the preview (one DMC
  project's figures, before and after) and the Kreinik figures through the pinned tests — no Kreinik
  thread can exist on the preview before C-1b loads one or F-16b lets her add one, and the PR says
  so; stops at `built, awaiting review`; fresh
  `/review F-19`.

## Stage R — process-enabling fixes

### R-1 R2 on preview deployments

- **Objective:** make Cloudflare R2 work on Vercel **preview** deployments, so a preview shows
  real images. This is not a nice-to-have: **"R2 not configured" blocked human verification in
  phases 26, 27 and 29**, the first surface D-07 redesigns is the most image-heavy in the app,
  and Beth's ruling D-13 made the preview link load-bearing — _previews that cannot show images
  break the process, not just a test._ Also quiets the build-time
  `R2_BUCKET_NAME not set, falling back to default` noise (ledger row 2026-08-16 ②).
- **Cited specs:** `docs/process/security-checklist.md` (credential handling — the whole point of
  the item is putting secrets somewhere new) · `src/lib/actions/upload-actions.ts` and
  `chart-file-actions.ts` for what is actually read at runtime.
- **Traps:** ① **Decide the bucket question with Beth first:** previews writing to the production
  bucket means preview sessions can create and delete Beth's real files. A separate preview
  bucket is the safe answer and the recommended one; it costs a bucket and a set of keys. This is
  a four-part-frame question (protocol §8), not an implementer's choice. ② Preview deploys build
  from PR branches — scope the credentials to the Preview environment only, never to Production
  and never committed. ③ `.env.local` is never committed and `$` in values needs escaping
  (protocol §1). ④ Verify by _looking at a real preview_, not by a green build: the failure mode
  this item exists to kill is invisible to the gate. ⑤ If a preview bucket is chosen, orphan
  cleanup there is nobody's job — say so in the ledger rather than discovering it later.
- **Bucket ruling (made 2026-08-17 at `/cleanup`, drift Ruled):** **read real, write scratch** —
  previews display the production bucket's images so design review is honest, but every write a
  preview makes (upload, delete) lands in a separate scratch bucket/prefix, never production.
  Trap ① is answered; build to this shape. Also in scope now: document the actual deployment
  topology (Neon branches, R2 buckets, Vercel environments) — the 2026-08-16 ledger row — in
  `docs/INTEGRATIONS.md` as part of this item.
- **Two passes, not one** (added 2026-08-17 after the first pass; rulings D-15/D-16 in `drift.md`):
  the item splits at the line no session can cross. **Pass 1 — the code** (done, PR #85): the
  read/write split, the required-and-lazy `R2_BUCKET_NAME`, the topology written down. **Pass 2 — the
  settings**: the Cloudflare scratch bucket, the Neon preview branch and the Vercel Preview variables
  are Beth's to create (D-16 — the keys stay with her), so pass 2 begins after her dashboard pass and
  ends with the preview demonstration. The exact settings list is in `notes.md` tagged R-1, including
  **the pre-merge check that Production has `R2_BUCKET_NAME` set** — without it, merging pass 1
  blanks every image on the live site.
- **Done-when, pass 1:** the read-real/write-scratch shape built and tested; no secret in the repo;
  the build-time R2 fallback warning gone or explained; deployment topology documented in
  `docs/INTEGRATIONS.md`; work log updated. **Done-when, pass 2:** preview deployments serve and
  accept R2 images, demonstrated on a real preview URL with a working image (state which PR and which
  image), with the preview's writes confirmed to land in scratch and the real bucket unchanged.

### R-2 A migration pipeline — **created by Beth's ruling D-24 (2026-10-24 `/cleanup`); gated (schema + migrations)**

- **Objective:** make a committed Prisma migration actually reach Neon. Today nothing applies one —
  `build` is `prisma generate && next build`, CI only generates, and every model since March arrived
  by an out-of-band `db push` (drift D-24 carries the evidence). Beth ruled **automatic on deploy**:
  record the database as it stands as a baseline, then have each deploy apply pending migrations.
- **Cited specs:** drift D-24 · `docs/INTEGRATIONS.md` (Neon: `DATABASE_URL` pooled for the app,
  `DIRECT_URL` direct for the CLI; the R-1 topology — previews have their own Neon branch) ·
  `prisma.config.ts` · protocol §2's definition of done (migration in the same PR). Prisma 7 —
  verify every `migrate` command and the baseline procedure in Context7 / `node_modules/`
  (hard rule 8), never from memory.
- **Traps:** ① **The baseline is the dangerous step.** The one existing migration
  (`20260328163529_…`) describes 4 of 18 models plus the `_ChartToGenre` join table; whether Neon's `_prisma_migrations` table even
  records it is unknown. Find out what the live database holds before writing anything, and baseline
  so that `migrate deploy` applies **nothing** to an already-current database — a baseline that
  tries to re-create existing tables fails the production build at best. ② **Previews must never
  migrate production.** Each environment migrates only its own database (preview → its Neon branch,
  production → main); prove which URL each environment's build reads. ③ No session on this machine
  has `.env.local`, so reaching Neon needs a credential from Beth's dashboard — ask her to show the
  screen before she copies anything (memory: dashboard screenshots), and never commit it. ④ This is
  a deploy-config change, and a failed migration now fails a deploy: say plainly what Beth would see
  if one ever did, and how it is recovered. ⑤ Schema drift: a `db push`-era database may differ from
  `schema.prisma` in small ways (`prisma migrate diff`); any difference found is a drift row, not a
  silent fix.
- **Done-when:** baseline recorded and shown to apply nothing to production; deploys apply pending
  migrations with previews scoped to their own branch; a trivial proving migration (or P9c's first)
  demonstrated reaching a preview database; `docs/INTEGRATIONS.md` and protocol §2 describe the real
  route; fresh `/review`. **Unblocks P9c.**

### R-3 A check that the migrations add up to the schema — **created by Beth's ruling D-39 (2026-10-25, during R-2); a gate addition, ruled**

- **Objective:** a pull request whose `prisma/schema.prisma` differs from what `prisma/migrations/`
  builds fails its checks. Since R-2, deploys apply migrations; a schema edit with no matching
  migration would pass every gate today, merge, and leave production's code querying a column the
  database does not have. The check is
  `prisma migrate diff --from-migrations prisma/migrations --to-schema prisma/schema.prisma --exit-code`
  (exit 0 = identical, 2 = different, 1 = error), which replays the migrations into a **shadow
  database** — so the check needs a throwaway Postgres wherever it runs.
- **Cited specs:** drift D-39 · `docs/INTEGRATIONS.md` (Deployment → Migrations; "Writing a migration"
  shows the shadow-database config) · `.claude/rules/quality-gates.md` and CLAUDE.md "Quality gates"
  (what the gate runs) · `.github/workflows/ci.yml` · Prisma 7 — verify `shadowDatabaseUrl` and the
  flags in `node_modules/` / `--help`, never memory (hard rule 8).
- **Traps:** ① **CI and pre-push run one invocation, `npm run gate`, by design (P14)** — and the
  pre-push hook runs on a machine with no database. Decide how the check fits that rule (e.g. a
  Postgres service container in CI plus a gate step that needs one) **without** quietly making CI
  and pre-push differ; if it cannot, that is a question for Beth, not an implementer's choice.
  ② `prisma.config.ts` is review-gated (D-38): a shadow URL added there makes this item gated —
  prefer a separate config passed with `--config`, or route the item to `/review`. ③ Prove it by
  breaking it: a throwaway commit that edits `schema.prisma` without a migration must fail the
  check, and main must pass. ④ Every doc that lists the gate's steps names the new one.
- **Done-when:** the check runs on every PR and fails on a schema/migration mismatch (demonstrated
  with a throwaway commit, then dropped) and passes on main; the gate's documentation (CLAUDE.md,
  `quality-gates.md`, `INTEGRATIONS.md` CI section) describes it; work log updated.

---

## Stage C — the supply catalogues (created by the 2026-10-25 `/plan-feature thread catalogues`; Beth's rulings D-41, D-42)

Pre-load other makers' colour lists the way DMC's ~500 colours are, so adding "Kreinik #4 braid
002" or "Mill Hill 42012" is a search-and-select, never a typed entry (`CROSS_STITCH_TRACKER_PLAN.md`
§4.2's "major UX win", §9 "Additional supply brand pre-seeding", §10 item 4 — the source question,
answered below). **Beth's rulings (D-42):** ① three catalogues — Kreinik, Mill Hill beads, Anchor —
and the rest of the brands she buys in a later plan (C-4, not briefed); ② **Kreinik first**,
straight after F-16a and its review, because a Kreinik colour belongs to a size and the sizes are
F-16a's thread lines; ③ **no stand-in swatch** — where a maker publishes no colour value the colour
shows its code and name with a "no published colour" mark; ④ **the whole Mill Hill sheet**, every
line.

**How a catalogue gets in — the planning session's call, on the record in D-42.** Each list ships
inside the app as a **self-describing fixture** in `prisma/fixtures/` (the file carries its maker's
brand name and supply type and, for threads, the line each colour belongs to) and is applied by the
deploy step after `migrate deploy` — **missing rows only; it never updates or deletes anything, and
never touches a row Beth entered.** The loader discovers fixtures by scanning the folder, so adding
a catalogue is adding a file, never editing the loader. It **never creates a brand or a line**
(brands and lines are F-16a's, F-16b's and Beth's to make) and **never fails a build**: a fixture
it cannot place — brand missing, brand of another type, more than one brand matching, a line
missing, or the file failing its own schema — is skipped with a loud log line, because a red
production deploy for a catalogue hiccup is worse than a missing catalogue; and every PR's preview
build runs the loader first, so a "skipped" is seen on the preview before anything merges.
`prisma/seed.ts` runs the same loader, so a fresh database and a deployed one agree. Not a data
migration per catalogue: each would need a fresh `/review`, and a migration that fails on
production jams every later deploy until a key no session holds is used (D-37). So **C-1 is the one
gated session** (schema, the deploy step, the loader, the null states — and no new catalogue, see
the deploy window below) and **C-1b, C-2 and C-3 are data plus a preview.**

**Why the first catalogue is its own item (C-1b).** The deploy step writes rows at the end of a
build, seconds before Vercel switches traffic, while the outgoing code still serves
(`docs/INTEGRATIONS.md`, Migrations: every change must be safe for the code it replaces). Today's
`ColorSwatch` parses `hexColor` as a seven-character string, so the first row with no colour value
must land in a deploy **after** the code that can show one. C-1 ships the schema, the loader and
the null states with zero new rows; C-1b ships the Kreinik fixture.

**The sources, found and checked 2026-10-25** (hard rule 5: a list is a documented source; what it
does not say is not guessed). The build re-fetches each one and records the retrieval date, the
licence basis and every derivation rule in `prisma/fixtures/README.md`, which C-1 creates:

| maker                           | source                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | gives                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | does not give                                                                                                                                                                                                                                                                                                                                                             |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Kreinik** (Kreinik Mfg.)      | `https://www.kreinik.com/PDF/Metallic_Color_Reference_Chart.pdf` — the official two-page chart, "updated January 2024"                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | **Page 1:** every colour number with its name ("300+ colors"), grouped by finish family — Basic, Hi Lustre (HL), Vintage (V), Glow-in-the-dark (F; the legend also says Fluorescent), Holographic (L) — and the families that are their own thread types: Cord (C), Japan (J), Cable (P), Wired (W), Micro Ice Chenille (MIC), Ombre, Facets, 1/16" ribbon chevrons, Easter grass, 3/8" trim. Its legend: "#number means Braid size, BF means Blending Filament, Ribbons are 1/4, 1/16, or 1/8"; "Some colors come in more than one size". **Page 2: an availability matrix** — one row per colour, a star under each size it comes in, columns BF, #4, #8, #12, #16, #24, #32, 1/8", 1/16" (001 has all nine, 556 four, 5765 one); a 1/4" ribbon list; a cord matrix; the Japan colours in a matrix of their own with braid and ribbon columns ("Some Japan colors come in Kreinik Braids and Ribbons"); `disc` cells, "Colors in gray are discontinued", and a "Discontinued colors & suggested substitutions" table | **colour values** (photographs only). The store at kreinik.com stopped taking orders on 2025-09-08 (its homepage notice), so its listings are no evidence of anything; the chart is the source. The F colours are "temporarily discontinued … in all sizes" per the Top News on `https://www.kreinik.com/store/shop-needlework/metallic-threads/color-card/` (2026-05-29) |
| **Mill Hill** (Wichelt Imports) | `http://www.millhillbeads.com/images/bead_inventory.pdf` — Wichelt's own "Glass Bead Inventory", "©2003, Mill Hill® update 2010". Plain `http://` serves it (68,924 bytes, sha256 `f3c106d89e15d588c458993121d55f985b11837872604a9514fa3a998160ab6e`); `https://` has an expired certificate                                                                                                                                                                                                                                                                                                                        | ~500 beads with code and name in twelve lines as the sheet heads them: glass seed (00xxx, 02xxx), antique seed (03xxx), crayon seed (02058–02069), frosted seed (6xxxx), petite seed (40xxx, 42xxx, 45xxx), pebble (05xxx), size 6 (16xxx), size 8 (18xxx), small/medium/large bugle (7xxxx/8xxxx/9xxxx), magnifica (10xxx). Codes are unique across lines. `×` = also sold as a 1000-pack whose number "begins with a '2' instead of a '0'"; magnifica "7 grams begins with number 11" is the same bead as its 10xxx number — **neither is a separate bead**. `•` and `*` are care marks (bleach, friction), not discontinuation                                                                                                                                                                                                                                                                                                                                                                                      | colour values; anything newer than 2010 (**the build's first act is to look for a newer official sheet** — `millhill.com` did not answer on 2026-10-25)                                                                                                                                                                                                                   |
| **Anchor**                      | `https://github.com/Kate-nc/cross-stitch`, `anchor-data.js`: 704 rows `[code, name, R, G, B]`; its header documents reconciliation of "the official Anchor colour card PDF / retailer scans" with four other sources and says of itself that its sourcing is "historical repository documentation, not independently verified measurements or licence evidence". **Licence basis: the repository has no LICENSE file** (GitHub reports none); the only statement is `"license": "ISC"` in its `package.json` — whether a one-word field is basis enough to ship 704 names is Beth's call, put to her when C-3 opens | codes and names; the data's `_ANCHOR_CONTESTED_IDS` tag names **eight** doubtful codes (46, 78, 150, 167, 168, 338, 351, 900 — the header lists seven and names two of them differently from the rows)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | a maker-published colour: its RGB are "screen approximations" by its own header, so under D-42 ③ they stay out (a later `/tweak` may switch them on — backlog). No official Anchor list was found online on 2026-10-25                                                                                                                                                    |

**Domain-fact prerequisites — the `/stitch-fact` row that heads the queue** (protocol §7; this plan
cannot write `docs/domain/`, and `/stitch-fact` records only what Beth herself states — never a
manufacturer's page). Before F-16a opens, Beth records: **(a)** which Kreinik lines she uses, in her
words, **named against the chart's own size menu** — BF, #4, #8, #12, #16, #24, #32, 1/8" ribbon,
1/16" ribbon, 1/4" ribbon (D-40 named #4 braid, #8 braid, blending filament and ribbon — which
ribbon width?); any length she knows beyond THR-010; for each whether it is used whole (Q-009);
and **whether she owns or uses colours the chart marks discontinued** (recommended default if she
has no view: load them, the README listing which — she may own them); **(b)** what the sources say,
**put to her to confirm from her own practice**: that one Kreinik colour number spans its sizes
(does she own, say, 002 in both #4 and #8?), what she calls Mill Hill's lines (the sheet's twelve
headings, unless her words differ), and that a 2xxxx economy pack is the same bead as its 0xxxx
number. What she confirms is her fact; **what she cannot confirm stays a cited source in this plan,
not a domain fact, and no brief below depends on it being recorded** — F-16a's schema allows one
code in several lines either way; **(c)** if there is time, Q-008 (the 18-inch cut), which F-16a
cites. The Kreinik line names she gives are the ones F-16a creates and C-1b loads into — the same
strings.

_**Done 2026-10-29** (D-43, D-44). (a) Colour lists for all three lines F-16a creates — **Blending
Filament**, **Very Fine #4 Braid**, **Fine #8 Braid** (D-43 ①, corrected ⑥ at layer-1 review); no
ribbon line until F-16b; Kreinik's
full names, exactly as quoted (THR-012); every Kreinik line used whole (THR-013); discontinued
colours **loaded and marked** so she knows to look for a substitute — a mark the plan did not have,
so `/plan-feature discontinued colours` now precedes C-1 (D-43 ④⑤). (b) One Kreinik number is one
colour in every size (THR-014), and a finish letter is part of the code (THR-015); Mill Hill's
twelve headings are her names (BEAD-001); a pack size is not a different bead (BEAD-002); she goes
by number for Anchor (THR-017). (c) Q-008 answered — about 24 inches of floss and 15 of Kreinik,
about 3 lost from each (THR-016) — which contradicts the 255, so F-19 follows F-16a's review
(D-44)._

**Order (D-42 ②, D-43, D-44):** `/stitch-fact` → F-16a → `/review F-16a` → F-19 → `/review F-19`
→ R-3 → `/plan-feature discontinued colours` → **C-1** → `/review C-1` → **C-1b** → **C-2** →
**C-3** → F-16b. Kreinik colours are usable after C-1b merges. **P9b**
(`/supplies` and the pickers load the whole catalogue — `getThreads()` unbounded, sorted and
filtered in the browser) is not moved by this plan; each catalogue item checks the preview's load
and says so, and Beth can move P9b up (the session recommended it be before C-2, when the catalogue
passes ~2,000 rows).

### C-1 The catalogue loader — **gated (schema + migration, the deploy step); UI-touching; preview, then `/review`**

- **Objective:** a catalogue shipped with the app is applied at deploy, missing rows only; the
  database can hold a colour with no published value and a bead's line, and every screen shows
  both honestly; a thread of a several-line brand shows its line wherever it is named. **No new
  catalogue ships here** (the deploy window above) — DMC round-trips through the loader to prove it.
- **May be re-briefed before it opens (D-43 ⑤):** `/plan-feature discontinued colours` runs just
  before this item and decides how a discontinued colour is marked. If the mark needs a column, it
  joins this item's migration, and that session re-briefs this item to say so. If this brief has
  no such note when the item opens, check the work log for that session's outcome before building.
- **Opens with one question for Beth:** the loader's code is deploy-time code that writes
  production data on every build, so it belongs with D-38's gated deploy step — propose gating its
  directory (e.g. `^prisma/catalogues/`) **and not** `prisma/fixtures/`, so C-1b, C-2 and C-3 stay
  data-only and ungated. A gate-list change is hers (hard rule 6); the open drift row of 2026-10-25
  holds it. Record her ruling before the branch opens.
- **Cited specs:** D-41, D-42 · `CROSS_STITCH_TRACKER_PLAN.md` §4.2, §9, §10 item 4 · the sources
  table above · `docs/domain/threads.md` THR-007, THR-010–THR-015 and `beads.md` BEAD-001 (the
  `/stitch-fact` row's facts) · F-16a's schema (the thread line; uniqueness per line and code) · `docs/INTEGRATIONS.md`
  Deployment → Migrations (the deploy step, the deploy window, the throwaway Postgres) ·
  `.claude/rules/ui-design-reference.md` (the label is a text change on existing surfaces, not a
  new screen) · `.claude/rules/form-patterns.md` (Zod at every boundary — a fixture is one) ·
  `docs/process/security-checklist.md` · `docs/TESTING.md` "fixtures/" (shipped data gets tests) ·
  `docs/domain/README.md` (provenance vocabulary — the fixtures README uses the same tags).
- **Scope:**
  - **The loader** (`prisma/catalogues/…`, called by `prisma/migrate-deploy.ts` after
    `migrate deploy` succeeds, and by `prisma/seed.ts`). `migrate-deploy.ts` holds no Prisma
    Client (it spawns `npx prisma` and opens a `pg` client for its state check), so the loader
    builds its own — `PrismaClient` + `PrismaNeon` on `prismaConfig.datasource.url`, as `seed.ts`
    does today — and never imports `@/lib/db`; its messages name counts and names, never the URL.
    It scans `prisma/fixtures/*.json`; **parses each file with a Zod fixture schema built from the
    existing brand, thread and bead validations** (codes `.trim()`-normalised, so "002 " cannot land
    beside "002"); for each fixture **resolves everything first** — exactly one brand by name (case
    aside) **and** type, and for a thread fixture every named line under that brand — and only then
    writes, one transaction per fixture (`createMany` with `skipDuplicates`, chunked). A file that
    fails its schema, a brand that is missing, of another type, or matched more than once, or a
    missing line, **skips that fixture with a loud log line** — `[catalogue] Kreinik: skipped — no
line "Very Fine #4 Braid" under brand "Kreinik"` — and the build goes on; the loader never creates a
    brand or a line. Every run logs `[catalogue] <maker>: <n> added, <m> already present` per
    fixture. Preview builds from any PR write to the shared `preview` branch, as migrations already
    do. **DMC joins the same path**: `dmc-threads.json` takes the self-describing shape (brand,
    type, one line — DMC's, from F-16a); `seed.ts` becomes "create the brands no migration creates
    (today: Mill Hill), then run the loader" — so the seed stops updating DMC names and colours on
    re-run, which today's upsert did (trap ③); a fresh database ends up identical to a deployed one.
  - **Schema + one migration** (`BEGIN;` … `COMMIT;`, written with `migrate dev --create-only` on
    the throwaway Postgres carrying F-16a's migrations): `Thread.hexColor`, `Thread.colorFamily`,
    `Bead.hexColor`, `Bead.colorFamily` nullable; `Bead.line` nullable text (a bead's line is a
    label and a filter, never a length — a text column, not F-16a's relation). TypeScript then lists
    every reader of the four columns; each handles null. **The session's calls here, not D-42's —
    Beth's preview word approves them:** `ColorSwatch` renders a "no published colour" state (the
    existing ring, no fill, an accessible name) — the smallest honest mark, shown to her on the
    preview and logged as a design-track input for DS-5 rather than designed here; the
    colour-family filter gains an "Unclassified" choice (the word is hers to change); sorting and
    `needsBorder` never parse a null. The edit forms keep letting Beth set a colour and a family by
    hand. **No row is null after this item's deploy** — the first null rows are C-1b's, one deploy
    later.
  - **The sorter.** `naturalSortByCode` puts every purely numeric code first and every other code
    after, alphabetically — so 002HL and 002V would sort after 5505, at the bottom of every list.
    Extend it to a true natural order (001, 002, 002HL, 002V, 100, 5505, then Blanc, Ecru), with a
    test pinning that DMC's order is unchanged (334 before 500 before 3761; Blanc and Ecru last).
    It is shared by `getThreads` and the catalogue views; ungated; the order is shown to Beth on the
    preview with a throwaway row, since how suffixed codes sit is her eye's to judge.
  - **The line in the label:** wherever a thread is named with brand and code —
    `supply-catalog.tsx`, `supply-table-view.tsx`, `supply-grid-view.tsx`, `supply-form-modal.tsx`,
    `chart-merged-form.tsx` (the picker results), `project-detail/supplies-tab.tsx` and the shopping
    list — a thread whose brand has more than one line shows the line ("Kreinik · Very Fine #4 Braid · 002
    Gold"); a one-line brand shows nothing new (DMC unchanged). **A bead's line the same way**, from
    `Bead.line`. Both are invisible until C-1b and C-2 load data; tested now with fixtures. **Not**
    the stats page: `src/lib/queries/stats/thread-insights.ts` is what names a thread there, and it
    is gated — backlog row "The thread line on the stats page".
  - **The two stale texts** (F-16 trap ⑧): `inline-create-dialog.tsx`'s "e.g. Kreinik Braid"
    example and `supply-brand-list.tsx`'s "Add other brands like Mill Hill or Kreinik" empty state
    — both wrong once Kreinik is a thread with lines; `supply-catalog.tsx`'s "Add beads from brands
    like Mill Hill" line is C-2's.
  - **`prisma/fixtures/README.md`:** one entry per fixture — source, retrieval date, licence basis,
    derivation rules, the loader's rules (missing rows only; what a skip means and every reason for
    one; a rename of a brand or line stops that fixture's later loads until the fixture follows) —
    using `docs/domain/README.md`'s provenance tags. DMC's entry says "in the app, origin unknown"
    (maintenance ledger, 2026-10-25).
  - **Tests:** the fixture schema (a bad row, an untrimmed code); the loader with the repo's Prisma
    mock — adds only missing rows, resolves before writing, skips (never throws) on each reason
    above, logs the counts, never prints the URL; the DMC fixture's existing tests updated to the
    new shape and pinning its brand block (name, type, line), so a change there is a visible test
    change; the sorter; the label on each surface with a fixture thread of a two-line brand and a
    fixture bead with a line; the swatch's null state; the "Unclassified" filter.
  - **Rehearsal, then preview:** on the throwaway Postgres, F-16a's migrations + this one, then the
    loader twice — DMC reads `0 added, 495 present` the second time; every skip reason exercised
    with a throwaway fixture. The PR's preview build then runs the loader against the `preview`
    branch as F-16a's review left it (no data is written, so no reset is needed): its log line goes
    in the PR.
- **Traps:** ① **Hard rule 8:** `createMany` + `skipDuplicates` through `@prisma/adapter-neon` on
  Prisma 7.10.1, interactive transactions on that adapter, and the parameter count of a ~1,000-row
  insert (chunk at a few hundred; name the size) — verify in `node_modules/`, never from memory.
  ② The loader runs on every deploy; it must be idempotent by construction (the unique indexes do
  the work) and quick (one insert per fixture, not one per row). ③ **Only inserts.** A corrected
  name in a fixture never reaches production by itself; the README says so, and a correction is a
  tiny targeted migration or Beth's own edit in the app. ④ **The deploy window:** this item's
  migration changes column nullability only, which the outgoing code cannot notice; it must write
  **no** null row. ⑤ **Renames.** The loader matches brands and lines by name, and F-16b lets Beth
  rename either; a renamed brand or line makes the loader skip that fixture from then on (logged,
  harmless to what is already loaded) until the fixture is renamed to match in a data PR. Say so in
  the README; a stable key on lines and brands is the upgrade if it ever bites, not something to
  build now. ⑥ The picker's search matches code and name across every brand, so "002" will return
  one row per Kreinik line once C-1b lands — the label is what tells them apart; a unit test on the
  picker proves the line is in the rendered text. ⑦ Kreinik's brand and lines are F-16a's rows;
  this item must not create or rename them. ⑧ `SupplyBrand.name` is unique case-sensitively, so
  "Kreinik" and "kreinik" can both exist — hence "exactly one match" above. ⑨ **Size:** if the
  size check fires, the seam is the line-in-the-label — ungated UI that can follow as **C-1a**
  before C-1b. Say so at the top of the session. ⑩ Every write here is deploy-time, outside the
  app's cache — no `revalidateTag` applies; the deployment is new.
- **Done-when:** Beth's gate-list ruling recorded; then test-first, clause by clause: every fixture
  is parsed before any write; the loader adds only missing rows, a second run adds none, resolves
  before it writes, and skips with a logged reason — never throws — on a bad file, a missing,
  mistyped or doubly-matched brand, and a missing line; `seed.ts` and the deploy step run one
  loader, and DMC's fixture round-trips through it; the four nullable columns and `Bead.line` exist
  and every reader handles null (the swatch's empty state, the "Unclassified" filter, the sorter);
  the sorter's new order is pinned and DMC's is unchanged; the line shows in a thread's label and a
  bead's label on every surface listed, and DMC's labels are unchanged; the two stale texts are
  gone; the fixtures README exists; the rehearsal counts and the preview build's loader line are in
  the PR; Beth has seen the preview (the supplies pages unchanged; the swatch's empty state and the
  sorter's order on a throwaway row); gate green; stops at `built, awaiting review`; fresh
  `/review C-1`.

### C-1b The Kreinik catalogue — **ungated (data and tests); UI-touching; preview before merge**

- **Objective:** Kreinik's colours are in the three lines F-16a creates — Blending Filament, Very
  Fine #4 Braid and Fine #8 Braid (D-43 ①, corrected ⑥) — exactly the colours the chart says come
  in each size, so a Kreinik thread in any of them is a search-and-select with its line in the
  label. Ribbon waits for F-16b, where its line can first be added.
- **Cited specs:** D-42 ①–③ · D-43 · the sources table (Kreinik) · THR-012 (the line names, those
  exact strings), THR-014 (one number, one colour across sizes), THR-015 (a finish letter is part of
  the code) · the outcome of `/plan-feature discontinued colours` (how a discontinued colour is
  marked) · F-16a (the lines exist) · C-1's loader and README.
- **Scope:** `prisma/fixtures/kreinik-threads.json`, built by a committed script from the official
  chart: **for "Blending Filament", "Very Fine #4 Braid" and "Fine #8 Braid", every colour whose
  row in the page-2 matrix has a star in that size's column** (BF, #4, #8) — from the main matrix
  (Basic, HL, V, F and L colours) and from the Japan matrix, whose braid columns put Japan colours
  into the braids too. Names come
  from page 1 (names split across lines in the PDF, e.g. "Mid-night", are rejoined and
  spot-checked against the rendered page). Colours the chart marks discontinued (gray, `disc`, the
  substitutions table) are **loaded and marked** (D-43 ④), by whatever the discontinued-colours
  plan built; the README lists them either way. No hex, no family (D-42 ③). The README records the
  rule, the retrieval date, and the F colours' "temporarily discontinued" notice. Fixture tests
  (`src/__tests__/fixtures/`): shape; no duplicate code within a line; the same code allowed across
  lines; a count floor per line; spot entries read off the chart — 001 Silver in all three lines
  (the matrix stars all nine sizes), 556 Fly By Night and 5765 in exactly those of the three lines
  the matrix stars for them, 002HL Gold Hi Lustre, 001L Solar Silver, 001J Silver wherever the
  Japan matrix stars BF, #4 or #8 — numbers and names as the chart prints them. **This item writes data at deploy**, so
  before its preview build: ask Beth to reset the Neon `preview` branch from production (show her
  the dialog first); the preview build's loader line — `Kreinik: <n> added` per line — goes in the
  PR.
- **Traps:** ① **The matrix's columns are positions, not text.** Plain text extraction of page 2
  yields each row as a code followed by its stars with the column lost (001 shows nine stars, 556
  four — but not which four). The script must read word coordinates (`pdfplumber` or equivalent)
  and map each star to its column by x-position, then the rendered page 2 is checked by eye for the
  spot rows above. A row whose star count disagrees with its mapped columns fails the script. ② The
  fixture's line strings are the `/stitch-fact` strings verbatim — a mismatch makes the loader skip
  the whole fixture, which the preview log shows and which is a stop before merge. ③ Codes are
  **strings**: "002" keeps its zeros, "002HL" keeps its letters. ④ The chart is an image-heavy PDF:
  the script extracts text and positions, never pixels (D-42 ③ — no colours are read off swatches).
  ⑤ `/supplies` loads the whole catalogue (P9b): check the preview's load with the new rows and say
  what you saw. ⑥ Hard rule 4 is already satisfied by C-1 — nothing visual is new here; if the
  preview shows the label needs more than C-1 built, that is a design-track input, not a fix in
  this item.
- **Done-when:** test-first: the fixture passes its tests and holds, under each of the three lines,
  every colour the chart marks for that size and no other, discontinued ones marked; the loader on
  the throwaway Postgres adds them and a second run adds none; the preview build loaded them into
  the reset `preview` branch; **Beth named five Kreinik threads she owns in those three sizes
  (number, name, size) and found each under the right line on the preview**, and saw a
  discontinued colour's mark; gate green; merges on her word.

### C-2 The Mill Hill bead catalogue — **ungated (data, tests, and the label C-1 built); UI-touching; preview before merge**

- **Objective:** every bead on Wichelt's inventory sheet is in the app under Mill Hill, with its
  line, so a bead a chart calls for is a search-and-select.
- **Cited specs:** D-42 ①, ④ · the sources table (Mill Hill) · `docs/domain/beads.md` BEAD-001
  (the twelve line names are hers) and BEAD-002 (a pack size is not a different bead) · C-1's
  loader and README · `prisma/schema.prisma` `Bead`
  (`@@unique([brandId, productCode])`).
- **Scope:** first, look for an official sheet newer than 2010 (`millhill.com`, `wichelt.com`) and
  record in the README which one was used and why; then `prisma/fixtures/mill-hill-beads.json` by a
  committed script from the sheet's text: code, name, line (BEAD-001's twelve names, which Beth
  confirmed as hers; a sheet heading that reads differently from BEAD-001 is a stop-and-ask), no
  hex, no family; the 2xxxx economy numbers and the 11xxx magnifica packs are **not** rows
  (BEAD-002); the `•`/`*`/`×`/`≈`/`+` marks are dropped, not carried into
  names. A `BEAD` brand named "Mill Hill" with no beads was on the `preview` copy of August's data
  on 2026-10-25 — **confirm it on the reset `preview` before the preview build**; the loader never
  creates a brand, so if production lacks it, Beth adds "Mill Hill" as a bead brand in the app
  first (her supplies → brands screen), and the README says the fixture expects it.
  `supply-catalog.tsx`'s "Add beads from brands like Mill Hill" empty-state line is retired. Fixture
  tests: shape, the brand block pinned, codes unique across the whole file, leading zeros kept
  ("00020"), a count floor, one spot entry per line read off the sheet (00020 Royal Blue, 03002
  Midnight, 02058 Crayon White, 60020 Fr. Royal Blue, 40020 Royal Blue, 05002 Yellow Creme, 16002
  Midnight, 18002 Midnight, 70020 Royal Blue, 80020 Royal Blue, 90020 Royal Blue, 10001 Ice — as
  printed). Writes data at deploy: reset `preview` from production before the preview build, as
  C-1b did.
- **Traps:** ① "Royal Blue" is seven different beads — the label C-1 built is what keeps them
  apart; a picker test proves the line is in the rendered text. ② The sheet abbreviates ("Fr.",
  "Mt.", "Bril.", "Opal Sm. Topaz"): keep the sheet's spelling, never expand by guess — the README
  says so. ③ A bead's quantity is typed by hand (no calculator), so nothing in the skein maths is
  touched. ④ `getBeads` orders by `productCode` in SQL and `/supplies` loads all of it (P9b) —
  check the preview's load with the new rows and say what you saw. ⑤ Fetch the sheet over plain
  `http://` (the `https://` host's certificate is expired) and check its sha256 against the one in
  the sources table; a different hash means a newer sheet — read it, and record which was used.
- **Done-when:** test-first: the fixture passes its tests; the loader on the throwaway Postgres
  adds every bead in the fixture (its count, pinned by the test's floor) under Mill Hill and a
  second run adds none; the preview shows the catalogue with lines in the labels and the
  empty-state line gone; **Beth named five beads she owns and found each with the right name and
  line on the preview**; gate green; merges on her word.

### C-3 The Anchor catalogue — **ungated (data and tests); preview before merge**

- **Objective:** Anchor's stranded-cotton colours are in the app under the Anchor brand F-16a
  created, codes and names only.
- **Opens with one question for Beth:** the dataset's only licence statement is a one-word field
  in its `package.json` ("ISC"), with no licence file and a header that calls its own sourcing
  unverified (the sources table). Whether that is basis enough to ship its names in her app is
  hers; the alternative is an official Anchor list, if one can be found at build time, or leaving
  Anchor until one is. Record her answer in the README and the work log before the branch opens.
  _Since 2026-10-29: Beth goes by number for Anchor; names are a nice extra at most (THR-017). So
  put a third option beside those two: **codes only, no names**. It still serves how she shops, and
  leaves out the names this question asks about (the brief's framing above, not a legal view). Its
  cost, said with the option: `Thread.colorName` is a required `String` and `supply.ts` requires
  it, so codes only needs a schema change after C-1's migration has shipped — C-3 would turn gated
  or need a small gated item first. A placeholder name would be a guess, so it is not an option._
- **Cited specs:** D-42 ①, ③ · the sources table (Anchor) · THR-008 (Anchor is 8 m six-strand —
  F-16a's line) · THR-017 (she goes by number) · C-1's loader and README.
- **Scope:** `prisma/fixtures/anchor-threads.json` by a committed script from the dataset's
  `ANCHOR_RAW` rows: code and name, under Anchor's one line; the RGB columns are **not** carried
  (D-42 ③); the eight codes in the data's `_ANCHOR_CONTESTED_IDS` tag are listed in the README, and
  the licence basis is recorded there in the words of Beth's answer. If an official Anchor list is
  found at build time, it is the source instead and the README says so. Fixture tests: shape, the
  brand block pinned, no duplicate codes, a count floor, five spot entries (1 White, 2 Ivory White,
  6 Very Light Pink, 8 Pink, 9576 Light Salmon — as the dataset prints them). Writes data at deploy:
  reset `preview` from production before the preview build.
- **Traps:** ① The dataset's 704 rows may include multicolour and ombre ranges beyond the solid
  stranded cotton; load what its header calls the stranded-cotton catalogue and note any range
  left out. ② Anchor codes are numeric strings ("1", "9576") and sort like DMC's. ③ The brand and
  its line are F-16a's rows, matched by name and type — never created here; a mismatch is a logged
  skip on the preview, and a stop before merge. ④ P9b, as in C-2.
- **Done-when:** Beth's licence answer recorded; then test-first: the fixture passes its tests; the
  loader adds every colour in the fixture (its count, pinned by the test's floor) under Anchor on
  the throwaway Postgres and a second run adds none; the preview build loaded them; **Beth named
  five Anchor skeins she owns and found each on the preview**; gate green; merges on her word.

### C-4 The rest of the brands she buys — **not briefed; Beth's ruling D-42 ① ("Hand-dyed brands later")**

The remaining THR-007 brands: Weeks Dye Works, The Gentle Art, Classic Colorworks, Rainbow Gallery,
The Caron Collection, Gloriana and Au Ver à Soie. Beth's option read "Hand-dyed brands later";
which of these are hand-dyed, and what a hand-dyed thread's catalogue should show for colour, are
hers to say — the planning session's guess that several are is not a fact. Needs its own
`/plan-feature`: no source per maker has been looked for yet. Queue it when Beth asks.

---

## Stage M — maintenance recurrences (created at the 2026-10-24 `/cleanup`)

The work log's standing ~monthly dependency recurrence (protocol §9) had no runnable brief, so it
was never queued and went seven weeks overdue. Each run is one item here, numbered on.

### M-1 Dependency maintenance — October 2026

- **Objective:** the first real run of the recurrence: `npm audit` plus a dependency review since
  P10 (2026-08-17, zero advisories). Patch what has advisories; review what has moved, especially
  the bleeding-edge stack (Next 16, the Auth.js **beta**, Prisma 7, Base UI) and the `overrides`
  block (ledger row 2026-08-17 — it must not outlive its reason).
- **Cited specs:** P10's brief above (the precedent) · `.claude/rules/bleeding-edge-libs.md` ·
  hard rule 8 — release notes / Context7 / `node_modules/`, never memory, for anything auth- or
  Next-adjacent.
- **Traps:** ① Versions stay exact-pinned; strip any `^`/`~` npm adds. ② Patch, don't modernise —
  a major bump is its own decision for Beth, logged, not taken. ③ A green gate does not prove login,
  upload and stats work: demonstrate them on the preview. ④ Upgrades touching `prisma` or
  `next-auth` reach gated cores' behaviour — say so in the PR and route to `/review` if any gated
  file changes.
- **Done-when:** advisories cleared or individually explained; gate green; preview demonstrated
  (login, upload, stats render); the work log's recurrence paragraph records this run and the next
  due date; the ledger's pinned-deps row closes (its condition was "the recurrence has run once").

### M-2 Zod 3 → 4 (created by M-1, Beth's ruling 2026-10-24)

- **Objective:** clear the last production advisory M-1 left: GHSA-mrhx-c7xc-m3w5, memory
  exhaustion while validating oversized constrained collections, fixed only in `zod` ≥ 4.6.6.
  Every 3.x is affected (3.24.4 installed; 3.25.76, the last 3.x, is too). Move the app to Zod 4
  and keep every boundary's behaviour, and every message Beth sees, the same.
- **Why it waited:** a major bump is Beth's decision (M-1 trap ②). She queued it as its own item
  right after F-7. **Exposure while it waits:** every collection-validating parse runs after
  `requireAuth()` (`chartFormSchema.genreIds`, which has no `.max()` — ledger row 2026-10-24 — and
  `batchSupplySchema`, capped at 500), and the one unauthenticated
  schema, `loginSchema`, holds no collection. So only a signed-in caller can reach it.
- **Cited specs:** `.claude/rules/form-patterns.md` (the `fields.ts` builders, `z.input` vs
  `z.infer`, `firstValidationMessage`) · `docs/STACK.md` (says "this is Zod **v3**", which goes stale)
  · hard rule 8: Zod 4's own migration guide via Context7 or `node_modules/zod`, never memory.
- **Traps:** ① Error messages and `ZodError` shape changed in v4 (`.errors` → `.issues`,
  `message` params → `error`, `.email()` and other string formats moved). Every test that asserts a
  validation message is the safety net, so **none may be loosened to get green** (hard rule 2).
  ② `src/lib/validations/auth.ts` is review-gated, so this item stops at `built, awaiting review`.
  ③ `z.input`/`z.output` semantics around `.default()` changed in v4. Check the action input types
  still accept what the forms send. ④ Exact-pin `zod`; check that `eslint-plugin-react-hooks` and
  `shadcn` still dedupe onto it.
- **Done-when:** `npm audit` reports no `zod` advisory anywhere in the tree; gate green; no validation-message test
  weakened; preview demonstrated (create and edit a chart, log a session, add a supply, a rejected
  input shows its message); `docs/STACK.md` updated; fresh `/review` (the auth schema is gated).

### M-3 Vitest 3 → 4 (created by M-1, Beth's ruling 2026-10-24)

- **Objective:** clear the dev-only advisories M-1 left: `vitest` and `@vitest/mocker`
  (GHSA-82fw-gwwq-j7x9, mocker path traversal, fixed at 4.1.11; GHSA-qxg6-89mg-rqv8, manual-mock
  code injection, fixed only at **4.1.12**), `tinypool` (two critical prototype-pollution-to-RCE
  gadgets) and `@vitest/coverage-v8`, which follows `vitest`. **The floor is vitest 4.1.12.** 4.1.11
  still ships a vulnerable mocker. npm offers 5.0.5, but the brief's default is **4.1.12 or later
  4.1.x**, the smallest major that clears them, unless 4.x fails to.
- **Why it waited:** a major bump is Beth's decision, and the exposure is nil for the live site.
  These packages never deploy, and the gadgets need attacker-controlled test-runner options. She
  queued it low, after the housekeeping batch.
- **Cited specs:** `docs/TESTING.md` · `vitest.config.ts` · `.claude/rules/testing-requirements.md`
  · Vitest 4's migration guide (Context7 / `node_modules/vitest`), never memory.
- **Traps:** ① The suite was 3016 tests at F-7 — count it on the branch before upgrading. The count after the upgrade must match, and **no test is
  skipped, deleted or loosened** to get green (hard rule 2). A test that needs rewriting for a
  changed API keeps its assertion. ② Mock hoisting and `vi.mock` factory semantics are the usual
  breakage; `MOCK_PATTERNS` in `@/__tests__/mocks/module-mocks.ts` is shared, so fix it there once.
  ③ Exact-pin `vitest` and `@vitest/coverage-v8` together; check `@vitejs/plugin-react` and `vite`
  compatibility.
- **Done-when:** `npm audit` reports nothing in the vitest / `@vitest/*` / `tinypool` family (zod
  is M-2's, and any newly published advisory is the next M run's); gate green with the same test count;
  `docs/STACK.md` and `docs/TESTING.md` updated. Test-only, so it merges on green after layer 1.

### M-4 Dependency maintenance — November 2026 (due 2026-11-24)

- **Objective, cited specs, traps, done-when:** M-1's, unchanged, for the month since 2026-10-24.
  Plus: re-check every open dependency row in the maintenance ledger, including the lint hold-back
  (`eslint-config-next` behind `next`, `eslint-plugin-react-hooks` pinned at 7.0.1) and its
  removal condition. Confirm `agentRules: false` and `experimental.agentUpgrade: false` survive in
  `next.config.ts` (D-28). If M-2 or M-3 has not landed yet, their advisories are already explained.
  Say so, and do not redo them here.
- **Closing step:** write M-5's brief here, the same shape and due a month on, and queue it, so the
  recurrence always has its next run briefed and queued.

---

## Stage D — the redesigns (forward-declared, Beth's ruling D-07)

**These are not briefs yet, and must not be written as briefs before their canon exists.** The
design track runs `/design-session` → Beth reacts → her approval makes canon → canon lands in
`docs/design/screens/<slug>.md` → **that landing queues the fidelity rebuild item here**, brief
written against the canon it now has. Hard rule 4 is the whole reason for the ordering.

| item    | what it will be                                                                                                                                                                                                                                                                                                                                                                                 | queued by         |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| **D-1** | the token swap — the foundation session's palette/type direction landed in `globals.css` + `DESIGN.md`, plus the cleanup pass on the four hot files (`fabric-requirements-tab`, `progress-breakdown-tab`, `collection-stats-sidebar`, `finished-tab`). **When D-1 lands, the no-hardcoded-colour grep joins `npm run gate`** — a gate-config change, so it goes to Beth as drift (protocol §6). | DS-1 (foundation) |
| **D-2** | chart form + detail rebuild — carries the dissolved POLISH-03 and POLISH-05 inputs                                                                                                                                                                                                                                                                                                              | DS-2              |
| **D-3** | browse + gallery rebuild — carries the dissolved POLISH-02 pill/card inputs and the series-name-on-cards wish (old 999.88)                                                                                                                                                                                                                                                                      | DS-3              |
| **D-4** | dashboard + stats rebuild — carries the What's Next inputs (old 999.8, 999.9) and the status-colour centralization (old 999.66)                                                                                                                                                                                                                                                                 | DS-4              |
| **D-5** | supplies + shopping                                                                                                                                                                                                                                                                                                                                                                             | DS-5              |
| **D-6** | reference data (fabric, designers, series, storage) — carries the series detail/preview wishes (old 999.86, 999.89)                                                                                                                                                                                                                                                                             | DS-6              |

The design-track inputs each stage inherits are listed in `docs/process/work-log/backlog.md`
under "Design-track inputs"; they move to `docs/design/screens.md` (the manifest **file** — not `docs/design/screens/`, the directory canon lands in) when that manifest is
scaffolded at overhaul step 8.

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

#### P9a The invisible half: query shape, no visible change

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

#### P9c The gated half — **blocked on the migration-pipeline ruling**

- **Objective:** the four whole-table session scans in `src/lib/queries/stats/`
  (`available-years.ts`, `day-of-week.ts`, `personal-bests.ts`, `record-detection.ts` — the last
  runs on **every session write**), the missing indexes as one migration, and the
  StorageLocation/StitchingApp ledger row (`@@unique([userId, name])`, the unscoped
  `project.updateMany` on both delete paths, the friendly-duplicate P2002 arms).
- **Also inherits — rerouted from P11, 2026-08-19:** `prisma/schema.prisma`'s
  `// Calculator settings (Phase 7)` comment, a planning-doc reference the conventions ban.
- **Blocked, not queued.** The index and uniqueness work cannot honestly complete until the
  2026-08-20 drift row is ruled: _how does a schema change reach the live database?_ That comes
  back to Beth as its own decision with options. The stats-scan half is gated but not blocked, and
  could be lifted out if she wants it sooner.
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

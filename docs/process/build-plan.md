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
  (including the 55 warnings the gate currently lets through — ledger row 2026-08-16 ①).
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

### F-2 Fabric matching excludes projects with no fabric assigned

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

### F-3 Supply stitch-total hint is invisible outside Details mode

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
- **Done-when:** Beth's bucket ruling recorded; preview deployments serve and accept R2 images;
  a real preview URL demonstrated with a working image (state which PR and which image); no
  secret in the repo; the build-time R2 fallback warning is gone or explained; work log updated.

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
under "Design-track inputs"; they move to `docs/design/screens.md` when that manifest is
scaffolded at overhaul step 8.

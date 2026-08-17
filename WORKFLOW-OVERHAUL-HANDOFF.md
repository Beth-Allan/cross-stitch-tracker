# Workflow Overhaul + Design Track — Handoff

**Written:** 2026-08-16 · **Branch:** `chore/workflow-overhaul` (created off `main`, clean, no files written yet)
**Revised:** 2026-08-16 — review pass 2 folded in; Beth's rulings D-09–D-14 recorded.
**Supersedes:** the scratchpad plan draft. This document is self-contained — a fresh session needs nothing else.

---

## 0. Read this first

Nothing has been implemented. The branch exists; every file below is still a proposal. Two review passes (both Claude Fable 5, reading both repos) have been completed and their findings are folded in — §3 already reflects them; §4 records pass 1, §4b records pass 2, so a later reader judges the revisions rather than re-deriving them.

No decisions are outstanding (§5). Everything is settled; implementation starts at §3.7 step 1.

---

## 1. The situation

Cross-stitch-tracker is a Next.js 16 app — 2448 tests, 24 routes, v1.8 shipped July 2026, milestone v1.9 in progress (phases 35–39 shipped, 40 and 41 remain). It has been developed under the GSD process framework for 34 phases across 9 milestones.

**GSD is already gone.** `~/.claude/plugins/installed_plugins.json` has no GSD entry, and this project's `.claude/settings.json` sets `superpowers-laravel` and `hookify` to `false`. No `gsd:*` skill resolves in a current session. Every `/gsd-discuss-phase`, `/gsd:execute-phase`, `/gsd:ship`, `/gsd:verify-work` reference in `CLAUDE.md` — including its "Next Up — RESUME HERE" instruction — points at a skill that does not exist. `.planning/` is an orphaned state directory maintained only by hand.

This is not a teardown of a working process. It is replacing a set of dead references that a fresh session would try to follow and fail.

**The model being ported:** `/Users/isleofskye/dev/bethallan/ffh-horse-database` — Laravel, same owner, already made this transition. Its `CLAUDE.md` states _"No process framework governs this repo — the GSD/Superpowers era is over."_ Its authority is `docs/process/session-protocol.md` (310 lines); its doors are `.claude/skills/` (12 thin wrappers); its fences are `.claude/hooks/guard-*.sh`.

---

## 2. Beth's locked decisions

Collected 2026-08-16 with tradeoffs presented (D-01–D-08 at pass 1; D-09–D-14 at pass 2). **Settled — do not re-argue.** Flag unreckoned consequences only.

**Beth's restated requirements (2026-08-16, pass 2 — her own words, summarized).** These are the why behind D-09–D-14 and bind every implementing session:

1. Coding principles (DRY, SOLID, YAGNI, KISS), code quality, and tech-stack best practice are enforced by the workflow — never dependent on Beth knowing or remembering to ask. Claude acts as the senior full-stack developer (UI/UX, security, design included).
2. Work begins with a full code review and codebase read — bugs, weak code, security issues, non-functioning tests.
3. Then a design overhaul (Claude Design/Fable + Impeccable), with nothing hardcoded that would prevent re-skinning the site later.
4. A comprehensive build plan like horse-db's and LifeOS's.
5. The work-item queue is managed before moving on — no 40-item pileups; as perfect and bug-free as possible before the next stage.
6. A maintained space for cross-stitch domain knowledge.
7. Session context stays lean — conversations target ≤150–200k tokens.

| #    | Decision                  | Choice                                                                                                                                                                          |
| ---- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D-01 | Beth's role in this repo  | **Hands off** — same contract as horse-db: plain language; never asked to edit a file, run a command, or open GitHub; her in-session word is the ruling and Claude merges on it |
| D-02 | Fate of `.planning/`      | **Migrate the live parts, archive the rest**                                                                                                                                    |
| D-03 | Mechanical enforcement    | **`guard-git` hook + `npm run gate`** only — not the full three-guard port (no `guard-merge`, no `guard-fence`)                                                                 |
| D-04 | Session doors             | Core four + planning/review + cleanup/design-session; final list derived while writing the protocol — pass 2 adds `/stage-review` and `/stitch-fact` (D-11, D-12)               |
| D-05 | DesignOS status           | **Historical input** — new canon supersedes it; screens without canon still follow DesignOS                                                                                     |
| D-06 | Foundation design session | **Run a full one** (Beth overrode a recommendation to skip; blast radius measured in §3.6)                                                                                      |
| D-07 | Redesign order            | 1. Chart form + detail · 2. Browse + gallery · 3. Dashboard + stats · then supplies/shopping · then reference data                                                              |
| D-08 | Claude Design project     | **Create now**, named "Cross Stitch Tracker"                                                                                                                                    |
| D-09 | Sequencing principle      | **Audit → wart burn-down → design track** — the queue is managed before new work; no backlog pileups                                                                            |
| D-10 | Phase 40/41               | **Dissolve into the new tracks** — 40's polish → design-track inputs; 41's bugs → post-audit fix briefs; 41's series polish → design track. Nothing dropped, nothing done twice |
| D-11 | Per-PR review             | **Auto-review every PR** — independent delegated pass (security + quality checklist) before merge; fresh-session `/review` stays reserved for gated cores                       |
| D-12 | Domain knowledge          | **Full mirror of horse-db** — `docs/domain/` knowledgebase, provenance-tagged, with `/stitch-fact` as the only write path                                                       |
| D-13 | Preview-before-merge      | **Yes** — UI-touching PRs send Beth the Vercel preview link; her word ships it                                                                                                  |
| D-14 | Context budget            | **≤150–200k tokens per conversation** — fresh session per chunk; heavy reading and reviews delegated to subagents                                                               |

---

## 3. The plan (revised after review passes 1 and 2)

### 3.1 Target structure

```
CLAUDE.md                          ~150 lines, always-loaded summary (currently 539; ~70% is session log)
WORKFLOW-REFERENCE.md              Beth's one-page card: the words she can type
docs/process/
  session-protocol.md              THE AUTHORITY — CLAUDE.md defers to it; disagreement = CLAUDE.md is the bug
  work-log.md                      only memory between sessions + the Up-next queue
  work-log/drift.md                drift & decisions
  work-log/notes.md                notes to future sessions
  work-log/backlog.md              feature wishes (see §3.2 — takes ~half the 999.x list)
  build-plan.md                    per-item briefs: objective, cited specs, traps, literal done-when
  maintenance-ledger.md            pre-existing warts only
  security-checklist.md            distilled from the vibe-coding checklist categories + repo specifics; consulted by every review layer and the audit
docs/design/
  README.md                        design track front door
  screens.md                       manifest: 24 routes, what Beth does there, daily?, order, canon status
  DESIGN-REFERENCE.md              promoted from .planning/ — DesignOS map, still needed by D-05
  foundation.md                    written by DS-1
  screens/<slug>.md                per-screen canon, one per landed session
docs/domain/
  README.md + topic files          cross-stitch knowledgebase, provenance-tagged — /stitch-fact is the only write path (D-12)
docs/                              the 7 promoted .planning/codebase/ docs (refresh first — see §4 finding 6)
docs/archive/                      everything else from .planning/, plus docs/superpowers/
.claude/skills/                    the doors
.claude/hooks/guard-git.sh         ported from horse-db (verified portable, zero FFH-specifics)
.claude/hooks/review-gated-paths.txt   written day one so the later fence is pure wiring
.claude/rules/                     RECONCILED, not untouched — see §4 finding 2
```

### 3.2 Migration map

| Source                                                                                     | Destination                                                                                                               |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| `.planning/STATE.md`                                                                       | `docs/process/work-log.md` front matter + stage table                                                                     |
| `.planning/ROADMAP.md` + `REQUIREMENTS.md`                                                 | `docs/process/build-plan.md` — 35–39 become log history; 40 and 41 dissolve per D-10, their items rerouted (none dropped) |
| the 999.x backlog in `CLAUDE.md` (~75 open items)                                          | **split**: genuine warts → `maintenance-ledger.md`; feature wishes → `work-log/backlog.md`                                |
| `.planning/codebase/*.md` (7 docs)                                                         | `docs/` — **refresh first**, they predate the Series milestone                                                            |
| `.planning/DESIGN-REFERENCE.md`                                                            | `docs/design/DESIGN-REFERENCE.md` — promote, do NOT archive (D-05 needs it live)                                          |
| `.planning/{milestones,phases,debug,spikes,sketches}/`, `AUDIT-*.md`, `CRITIQUE-REPORT.md` | `docs/archive/`                                                                                                           |
| `docs/superpowers/` (plans + specs)                                                        | `docs/archive/`                                                                                                           |
| `CROSS_STITCH_TRACKER_PLAN.md` (repo root)                                                 | **stays** — this repo's spec layer, the analogue of horse-db's `DATABASE.md`/`CALCULATIONS.md`; build-plan briefs cite it |

Live work that must survive — rerouted, not queued (D-10): **Phase 40**'s polish items (POLISH-02/03/05) become design-track inputs; they sit on surfaces D-07 redesigns first, and polishing UI about to be replaced is work done twice. **Phase 41** splits: its genuine bugs (designerName null, fabric matching, FIX-01/02 closure checks) become the first `build-plan.md` briefs, fixed in the post-audit burn-down; its series display polish (SERIES-01/02/03) joins the design track.

### 3.3 Hard rules — eight (revised from seven)

Five port from horse-db unchanged. Rule 3 was wrongly dropped in draft 1 and is restored. Two are new, replacing horse-db's game-mechanics rule and size gate because this project's failure modes differ.

1. **Branch first, never main.** Squash-merge via PR; nothing merges red.
2. **TDD for app behavior: failing test first, always.** Never weaken, skip, or delete a test to get green; removals need Beth's approval on the record.
3. **Sensitive cores are review-gated** — merged only from a fresh `/review` session, never by their builder. Path list in §3.4. _(Restored: enforcement is convention-only under D-03, which makes its presence in the always-loaded tier load-bearing.)_
4. **DesignOS/design canon is the spec — never build UI from scratch.** _(new)_ Beth's #1 documented frustration; building from imagination is the banned move.
5. **Contradictions are drift** — drift row plus Beth's ruling; never silently resolved. Domain constants (skein lengths, overCount inference, thread counts) trace to Beth or a documented source and are never assumed. Recorded facts live in `docs/domain/`; `/stitch-fact` is the only write path (D-12).
6. **No `--no-verify`, no force-push, no gate weakening.** Gate-config changes are drift.
7. **Warts to the ledger, same session.** "Pre-existing, ignoring" is banned.
8. **Never assume a bleeding-edge library API.** _(new)_ Next.js 16, Auth.js v5 beta, Base UI, Tailwind v4, Prisma 7 — check Context7 or read `node_modules/`.

Horse-db's size gate (PHP ≤400 lines) is deliberately not ported; logged as a ledger candidate.

### 3.4 Review policy — four layers (revised at pass 2)

Under GSD every PR got a multi-agent review; draft 1 silently reduced that to gated-cores-only. D-11 restores per-PR coverage. The layers:

1. **Every PR: delegated auto-review before merge (D-11).** An independent pass — different model/agent, never the builder re-reading its own diff — against `security-checklist.md` and a code-quality checklist (DRY/SOLID/YAGNI/KISS, conventions, test honesty). Findings fixed or ledgered before merge; delegated so the session stays lean (D-14).
2. **UI-touching PRs: preview-before-merge (D-13).** Beth gets the Vercel preview link; her word ships it. The walkthrough analogue and the safety valve on D-01, since merge deploys production instantly.
3. **Gated cores: fresh `/review` session, Fable lane, never the builder.** Policy from day one. `guard-merge` is not being installed (D-03), so `/review` enforces by convention — which is why this is hard rule 3 rather than mere policy. Materialize as `.claude/hooks/review-gated-paths.txt` immediately so adding the fence later is pure wiring. The paths:

- `prisma/schema.prisma` + migrations
- `src/lib/auth.ts`, `src/lib/auth-guard.ts`, `src/lib/rate-limit.ts`
- `src/lib/utils/skein-calculator.ts`, `src/lib/utils/fabric-calculator.ts` (the math)
- `src/lib/queries/stats/**` (the `unstable_cache` + `revalidateTag("stats")` trap — caused backlog 999.41 and 999.42)
- `src/lib/actions/upload-actions.ts`, `src/lib/actions/chart-file-actions.ts` (R2 orphan leaks)

All paths verified to exist.

4. **Stage boundaries: `/stage-review`.** Seams between items, convention drift beyond the gate, test honesty across the stage, Impeccable audit on UI stages, and an explicit security pass where the stage touched auth, input handling, uploads, or caching. Missing from draft 1's door list; restored.

**D-03 consequence, on the record (flagged, not re-argued):** with no `guard-merge` and merge = production deploy, a builder self-merging a schema or auth change ships it with only convention in the way — and non-UI changes have no preview link for Beth to catch. One maintenance-ledger row schedules the optional `guard-merge` wiring (the paths file exists from day one, so it is pure wiring); whether it ever runs is Beth's call at a `/cleanup`.

### 3.5 `npm run gate`

```
npx prisma generate → format:check → lint → tsc --noEmit → test → build
```

Matches `.github/workflows/ci.yml`. Two notes:

- **`prisma generate` must run first.** CI does this explicitly; without it `tsc` validates against a stale client after every schema change.
- **`tsc --noEmit` is new and currently passes.** `next build` type-checks app code only, not test files — exactly how backlog 999.19 sat undetected as 18 type errors across three test files. Adding it to the gate and to CI closes that hole.

Husky: pre-commit keeps `lint-staged`; pre-push changes from `npm run build` to `npm run gate` (affordable — see §6).

Two pass-2 additions:

- **After D-1 lands, a conventions check joins the gate** — a grep banning raw Tailwind colour scales outside an explicit allowlist (the analogue of horse-db's `check-conventions.sh`, which this port otherwise drops). This makes "nothing hardcoded in the design" enforced rather than aspirational; adding it is a gate-config change and follows the drift rule.
- **Recurring dependency maintenance.** Pinned-exact versions mean zero patch intake unless the process schedules it, and a hands-off owner never will. The work log carries a recurring maintenance row (~monthly): `npm audit` + dependency review, its own session, never a side effect of other work.

### 3.6 Design track

**The loop:** `/design-session` shows Beth variants → she reacts → **her approval makes canon** → canon lands in `docs/design/screens/<slug>.md` → **that landing queues a fidelity rebuild item on the build track**. Design and build stay separate lanes; canon never merges straight into code.

**Tool split:**

- **Impeccable** — the design _tool_, never a process authority. Produces variants and critiques; maintains `DESIGN.md` + `.impeccable/design.json`, which follow `foundation.md`. Already installed at user scope.
- **Fable** — the lane for design sessions and `/review` of gated cores. Opus is the default build lane.
- **Claude Design** (claude.ai/design, via the `DesignSync` tool) — durable archive of every variant shown; component-library home. Only one project exists today ("FFH Horse Database"); create "Cross Stitch Tracker" per D-08.

**Inherited practice:** full-page variants are reviewed as **private artifact links**, not in the Design System pane — the pane crunches whole pages into unreadable cards. The pane is for components. (Horse-db learned this the hard way, 2026-07-28.)

The `/design-sync` skill is not installed here, but the `DesignSync` tool works directly — not a blocker.

**Foundation session (DS-1).** Beth chose a full session over ratifying what exists (D-06). Blast radius, measured:

- `src/app/layout.tsx` already loads Fraunces + Source Sans 3 + JetBrains Mono; `globals.css` carries the token set — `DESIGN.md` is implemented, not aspirational.
- ~15 non-test files use raw Tailwind colour scales (~179 occurrences), 57% concentrated in four: `fabric-requirements-tab` (47), `progress-breakdown-tab` (31), `collection-stats-sidebar` (14), `finished-tab` (10).
- Phase 30 already moved the 7-status palette to CSS custom properties.

So a new direction is mostly `globals.css` + `DESIGN.md` plus a cleanup pass on four files — not a 24-route rewrite. The token swap DS-1 produces becomes build item **D-1**.

Two pass-2 notes: Phase 40's polish items enter this track as design inputs (D-10), recorded in `screens.md` as their surfaces come up in the D-07 order. And **R2-on-preview is an early build item, not a nice-to-have** — "R2 not configured" blocked UAT in phases 26, 27, and 29; redesign #1 is the most image-heavy surface in the app; and D-13's preview ritual is load-bearing now, so previews that can't show images break the process, not just a test.

### 3.7 Sequencing

Steps 1–5 land on `chore/workflow-overhaul`; steps 6–8 are working sessions under the new process. Fresh session per chunk (D-14); this document is the only context each needs.

1. **Foundation** — `session-protocol.md` (porting horse-db §9's context-budget & handoff rules explicitly — D-14), CLAUDE.md rewrite, `npm run gate`, `guard-git.sh` (deny message renumbered — §4 finding 8), `review-gated-paths.txt`, `security-checklist.md`, `gh` identity rule, `enforce_admins` on main
2. **Memory** — `work-log.md` with the queue seeded to the audit (step 6) — not Phase 40, which dissolves (D-10); `maintenance-ledger.md` (warts only, plus the guard-merge-wiring row and the recurring dependency-maintenance row); `build-plan.md` (Phase 41's bug fixes are its first briefs); `work-log/backlog.md` (wishes)
3. **Rules reconciliation** — rewrite `git-workflow.md` and `quality-gates.md` against the new protocol; trim `testing-requirements.md`; repoint `ui-design-reference.md` at `docs/design/` with DesignOS fallback
4. **Doors** — the skills, derived from the protocol as it is written; the list now includes `/stage-review` and `/stitch-fact` (D-11, D-12)
5. **Migration** — refresh + promote `codebase/` docs, promote `DESIGN-REFERENCE.md`, archive the rest, repoint the stale `PostToolUse` hook in `.claude/settings.json` (it nags every commit to update "the Current Status section of CLAUDE.md" — a section this overhaul deletes); scaffold `docs/domain/` seeded from `CROSS_STITCH_TRACKER_PLAN.md`'s glossary (imported facts get a provenance tag; nothing new is assumed)
6. **Audit** — the CQ-1 analogue (horse-db's `docs/process/state-of-the-code-2026-07-28.md` is the model): parallel read-only subagent sweeps (duplication · dead code · silent-failure paths · query patterns · test honesty · `security-checklist.md` sweep) plus mechanical runs (`npm audit`, deep lint). Findings → ledger; the audit session changes no application code. Prime suspects going in: the R2 upload/orphan paths and the `unstable_cache`/`revalidateTag` layer — both already carry 999.x trails
7. **Wart burn-down** — `/cleanup` triage with Beth, then fix stages until the ledger reaches a baseline she accepts (D-09: as perfect and bug-free as possible before moving on)
8. **Design track** — `docs/design/` scaffolding + create the Claude Design project (D-08); DS-1 runs here; Phase 40's polish items are design inputs (D-10); when D-1's token swap lands, the no-hardcode grep joins the gate (§3.5)

---

## 4. Review pass 1 — findings (Claude Fable 5, both repos read)

**Verdict: sound.** Faithful where it should be, consciously divergent in the right places. Every factual claim testable was tested and held. Findings, ordered by impact:

1. **Review-gating had silently dropped out of the hard rules** — draft 1 mis-described horse-db's seven (its rule 3 is review-gating; "never assume game mechanics" is a separate section) and replaced it with design canon. That demoted review-gating to policy at the same moment D-03 removed its mechanical enforcement — two softenings landing together on auth, schema, money math, and the R2/cache traps. **Folded in: now hard rule 3 of eight, plus `review-gated-paths.txt` on day one.**
2. **`.claude/rules/` "unchanged — still correct" was false for four of twelve, and they auto-load.** `git-workflow.md` is entirely GSD + pr-review-toolkit (neither installed); `quality-gates.md` sequences `/gsd:verify-work → /gsd:ship`; `testing-requirements.md` has a "For GSD Plans" section; `ui-design-reference.md` declares DesignOS the spec (D-05 demotes it) and points at `.planning/DESIGN-REFERENCE.md`, which draft 1 archived — breaking a pointer D-05 needs alive. Day one would auto-load rules telling sessions to run a dead process: self-inflicted drift under rule 5. **Folded in: sequencing step 3, and DESIGN-REFERENCE.md is promoted not archived.**
3. **GitHub identity dropped, and live-armed.** Verified: LifeOSIA is the active `gh` account on this machine; adolwyn is inactive; the tracker's remote is `git@github-bethallan:Beth-Allan/…`. The first `gh pr merge` runs as the wrong account. **Folded in: `GH_TOKEN=$(gh auth token --user adolwyn) gh …` ported verbatim into the protocol.**
4. **No walkthrough analogue — and merge here means production.** Beth's history in this repo is dense with "UAT approved, N/N human verification items"; she checks the built thing every phase, and D-04's provisional door list has nothing playing that role. This repo has what horse-db couldn't: a Vercel preview deployment per PR. A preview-link-before-merge step covers the walkthrough role and the one property of `/deploy` worth keeping. **Unreckoned consequence of D-01: unlike horse-db's manual Siteground deploy, merging here ships to production instantly, so "Claude merges on her word" now means "her word ships it."** → open decision, §5.
5. **The 999.x → ledger mapping misroutes ~half the list.** Horse-db's ledger is warts-only (~40 rows) governed by "read it whole, every session." The 999.x list is ~75 items mixing genuine warts (999.40 silent failures, 999.52 R2 orphans) with feature wishes (999.1 supply modal, 999.7 completion dates, 999.13 per-brand skein length). Dumping it all in kills the read-whole rule or taxes every session. **Folded in: split at migration, triage the wart list with Beth at first `/cleanup`.**
6. **The codebase docs predate the entire Series milestone.** Last commit touching `ARCHITECTURE.md`/`STRUCTURE.md` is 2026-05-20; zero mentions of Series, which v1.8 shipped in July as a full domain (Prisma model, CRUD actions, two routes, nav, Browse filter). "Verified accurate" was two milestones stale. **Folded in: refresh pass before promotion.**
7. **Gate measurements (good news).** `tsc --noEmit` exits 0 today after `npm ci` + `prisma generate`; the full 2448-test suite runs in **16 seconds**, so `npm run gate` is build-dominated (~2 min) and full-gate pre-push is affordable, not ceremony. Trap: gate order must run `prisma generate` first. **Folded into §3.5.**
8. **`enforce_admins` is off on main** (verified via API — required check "build" exists and is strict, but admins bypass). Horse-db flipped it on explicitly. `guard-git` blocks `--admin` only in-session. **Folded into sequencing step 1.** Note: `guard-git.sh`'s deny messages cite "CLAUDE.md hard rules 1 + 5" — the revised eight keeps branch-first at 1, but no-bypass moved to 6; edit the message or renumber.
9. **Phase 40 polishes surfaces D-07 immediately redesigns.** Focal point and form-layout items sit on chart form/detail — redesign #1. Triage Phase 40's briefs against the redesign order when writing `build-plan.md`. Related: "R2 not configured on dev" blocked UAT in phases 26, 27 and 29, and redesign #1 is the most image-heavy surface in the app — seed a fix early or the design track's verification loop hits the same wall.

**Answers to the three open questions:**

- **Doors:** `/game-fact` needs no door, but its rule matters — this domain has assumed-wrong constants too (999.13 skein lengths, 999.14 overCount inference). Folded into hard rule 5. `/deploy` is redundant as mechanism; see finding 4 for the property worth saving.
- **Model lanes:** keep the split only where it changes outcomes — Fable for `/review` of gated cores and design sessions (fresh-session review is load-bearing, more so with `guard-merge` absent). Drop the per-row Lane column and session-start lane check as ceremony; default lane assumed, queue marks exceptions only.
- **Up-next queue:** keep. It is not a task list, it is Beth's steering interface — the literal thing she types next — and the no-session-ends-without-naming-it contract is what makes D-01's hands-off stance workable.

**Corrections applied:** 24 routes not 23 (draft counted only the `(dashboard)` group, missing login); ~15 colour-scale files not 17; `docs/superpowers/` added to the archive list; `CROSS_STITCH_TRACKER_PLAN.md` given an explicit home.

---

## 4b. Review pass 2 — findings (Claude Fable 5, both repos read, 2026-08-16)

**Verdict: write it, with changes.** §3's structure, migration map, hard rules, and tool split survived a second hostile reading — every change is an addition, not a reversal. All folded in above. Beth also restated her requirements directly this pass (§2 preamble) and made the D-09–D-14 rulings. Findings, ordered by impact:

1. **The audit was missing.** The plan ported horse-db's protocol but not the most valuable thing its transition produced: CQ-1, the whole-codebase "hunt for bad code" sweep (`state-of-the-code-2026-07-28.md`) that found six live silent data-loss defects a 97%-mutation-tested suite had never caught. Invisible to pass 1 because CQ-1 was a build-plan item there, not part of the protocol — a "port the protocol faithfully" frame was structurally blind to it. It is also Beth's requirement #2. **Folded in: §3.7 step 6, with step 7 burning down what it finds.**
2. **Pass 1's `/game-fact` answer folded away the mechanism, not just the door** — it kept "never assume constants" and deleted the place a ruling on a skein length would ever be recorded. **Beth's ruling D-12: full mirror — `docs/domain/` + `/stitch-fact`.**
3. **Review coverage silently regressed.** Under GSD every PR got a 4–6-agent review; draft 1 reduced that to gated-cores-only, everything else self-merged by its builder into instant production. Pass 1 caught the rule-level demotion (its finding 1) but never asked the coverage question behind it — a larger regression than the one it flagged, on the dimension Beth calls paramount. **Beth's ruling D-11: auto-review every PR; §3.4 restructured into four layers; `/stage-review` (with its security pass) restored to the door list.**
4. **No standing security artifact.** Beth's requirement is that security review happens without her naming it. **Folded in: `security-checklist.md`**, distilled from the vibe-coding checklist categories (foundations · access control · inputs & data · integrity · operations), consulted by every review layer and the audit. Already structurally covered here: `requireAuth` on every action, Zod at boundaries, `rate-limit.ts`. Genuinely untested: file-upload/R2 hardening, session handling under the Auth.js beta, errors failing closed, backup/restore on Neon — audit sweep targets.
5. **Pinned-exact versions + hands-off owner = nobody ever upgrades anything.** No patch intake unless the process schedules it. **Folded in: recurring dependency-maintenance row (§3.5, §3.7 step 2).**
6. **"Nothing hardcoded" needs a fence, not an intention.** D-1 fixes the ~179 raw colour occurrences once; nothing stopped them growing back. **Folded in: post-D-1 conventions grep in the gate (§3.5).**
7. **Context budget made explicit (D-14).** Mostly inherited — horse-db §9 has the rule, and the 539→~150-line CLAUDE.md diet is the biggest single per-session win — but now named: fresh session per chunk, audit as parallel subagent sweeps, per-PR review delegated.
8. **D-03 consequence flagged, not re-argued** — no `guard-merge` + production-on-merge leaves convention as the only thing between a builder session and a self-merged schema change, with no preview link for Beth to catch non-UI changes. **Folded in: enforcement note + optional-wiring ledger row (§3.4).**
9. **Phase 40/41 vs the redesign.** Pass 1's finding 9 said "triage"; **Beth's ruling D-10 dissolves both phases into the new tracks** (§3.2). R2-on-preview elevated to an early build item because D-13's ritual depends on working previews (§3.6).
10. Minor: dropping the lane column (pass 1's answer) stands, but the one place lanes still bind — `/review` and `/stage-review` run fresh, on Fable — must be stated inside those doors themselves, or it lives nowhere.

**Where pass 1 was wrong, for the record:** its "verdict: sound" reviewed fidelity to the horse-db skeleton, not sufficiency for this owner — findings 1 and 3 above were both invisible to that frame; and its `/game-fact` answer (finding 2) made the plan worse in the folding. Reviewers agreeing is not evidence; pass 2 disagreed where it mattered.

---

## 5. Open decisions

None. Pass 1's two open items were resolved 2026-08-16 at pass 2:

1. **Preview-before-merge — yes** (now D-13).
2. **Go — given.** Implementation starts at §3.7 step 1, fresh session, this document as sole context.

---

## 6. Verified facts — do not re-derive

| Claim                                                                                              | Status              |
| -------------------------------------------------------------------------------------------------- | ------------------- |
| GSD absent from installed plugins; `superpowers-laravel`/`hookify` false                           | Verified            |
| No `gsd:*` skill resolves in a current session                                                     | Verified            |
| `tsc --noEmit` exits 0 today (after `npm ci` + `prisma generate`)                                  | Verified            |
| Full test suite: 2448 tests, ~16 seconds                                                           | Verified            |
| `enforce_admins` off on main; required check "build" exists and is strict                          | Verified via API    |
| Active `gh` account is LifeOSIA; adolwyn inactive                                                  | Verified            |
| All §3.4 review-gated paths exist                                                                  | Verified            |
| `guard-git.sh` portable with zero FFH-specifics                                                    | Verified            |
| Fraunces/Source Sans 3/JetBrains Mono live in `layout.tsx` + `globals.css`                         | Verified            |
| ~15 non-test files, ~179 raw colour-scale occurrences; 4 hot files                                 | Verified            |
| `.planning/codebase/` last touched 2026-05-20; no Series mentions                                  | Verified            |
| Only Claude Design project: "FFH Horse Database"                                                   | Verified            |
| Phases 40 + 41 are the remaining v1.9 work                                                         | Verified            |
| Full suite re-run at pass 2: 2448 tests, 15.5s                                                     | Verified 2026-08-16 |
| CI today lacks `tsc --noEmit`; the gate + CI addition closes the hole                              | Verified            |
| Horse-db's CQ-1 audit (`docs/process/state-of-the-code-2026-07-28.md`) — the model for §3.7 step 6 | Verified            |
| `DesignSync` tool callable in-session                                                              | Verified            |
| Vibe-coding security checklist fetched; categories mapped in §4b finding 4                         | Verified            |
| Stale `PostToolUse` hook nags exactly as §3.7 step 5 describes                                     | Verified            |

---

## 7. State of play

**Done (pass 2, 2026-08-16):** branch `chore/workflow-overhaul` created off `main`. Plan written. Two Fable review passes completed and folded in. Beth's rulings D-01–D-14 recorded.

**Done (§3.7 step 1 — Foundation, 2026-08-16, Fable authoring + Opus mechanics):**

- `docs/process/session-protocol.md` written — the authority (§9 carries the D-14 context-budget and handoff rules).
- `CLAUDE.md` rewritten, 539 → 142 lines, with a transition banner to delete when this branch merges. The old 999.x backlog and session log live only in git history until step 2 splits them into the ledger and backlog files.
- `docs/process/security-checklist.md` written — five categories, repo-concrete, consulted by every review layer.
- `npm run gate` added (`prisma generate → format:check → lint → tsc --noEmit → test → build`), husky pre-push now runs it, CI gained the `tsc --noEmit` step. Gate verified green end-to-end: 2448 tests, ~2.5 min.
- `.claude/hooks/guard-git.sh` ported (deny messages renumbered to hard rules 1 + 6) and self-tested: blocks `--no-verify`, force-push, `--admin` merge; passes benign commands. `.claude/hooks/review-gated-paths.txt` written; all ten gated paths verified to exist.
- `enforce_admins` flipped ON for main via the adolwyn-token API call (`"enabled": true` confirmed).

**Parked from step 1 (one item):** wiring guard-git into `.claude/settings.json` (PreToolUse hook + the merge-command permissions allowlist). Claude Code's auto-mode permission classifier refuses every route to editing that file — correctly treating a session granting itself permissions as suspect; the horse-db parking doctrine applies (park, never force). **The next interactive session applies this edit first thing** — Beth approves the permission prompt when it appears; that is her only involvement. Target content: keep the existing `PostToolUse` and `enabledPlugins` blocks exactly as they are, and add:

```json
"permissions": { "allow": ["Bash(GH_TOKEN=$(gh auth token --user adolwyn) gh pr merge:*)"] },
"hooks": { "PreToolUse": [{ "matcher": "Bash", "hooks": [{ "type": "command", "command": "bash \"$CLAUDE_PROJECT_DIR/.claude/hooks/guard-git.sh\"" }] }] }
```

Until that lands, guard-git exists but does not fire; branch protection (now admin-enforced) covers the server side.

**Deferred by design:** `WORKFLOW-REFERENCE.md` (Beth's one-page card) is written at step 4 with the doors, since it is the list of words she can type.

**Not done:** steps 2–5 (memory files, rules reconciliation, doors, migration — the stale `PostToolUse` commit-nag hook in `.claude/settings.json` is repointed at step 5) and working sessions 6–8.

**Next action:** a fresh session reads this document whole, applies the parked settings.json edit, and starts §3.7 step 2 (Memory).

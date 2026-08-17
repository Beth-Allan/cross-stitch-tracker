# Cross-Stitch Tracker — Work Log

**What this is:** the continuity spine of the build — **the only memory that survives between
sessions.** Every Claude Code session updates this file before it ends. No exceptions. A session
that cannot finish honestly finishes by documenting (protocol §9).

**THE DRIFT RULE (read first, every session).** Contradictions found mid-session — doc vs code,
doc vs doc, a spec gap, a wrong assumption — route per protocol §6: product / domain / calculation
/ schema contradictions get a row in `docs/process/work-log/drift.md` **and Beth's ruling**;
merely descriptive doc staleness is fixed in the same PR with a note here; improvement ideas go to
`backlog.md`, never applied mid-item. **Nothing is ever silently resolved.**

**Domain facts are never assumed** (hard rule 5, protocol §7). Skein lengths, overCount inference,
fabric conventions, what "kitted" means — every constant traces to Beth or a documented source.
An undocumented constant is a **stop-and-ask**. `/stitch-fact` is the only write path into
`docs/domain/`.

**Status lifecycle:** `queued` → `in progress` → `built` → (`built, awaiting review` → `reviewed`,
where protocol §5 gates the item) → `accepted` (stage sealed after Beth's `/walkthrough`). Use
`blocked — see note` when stuck; the recovery protocol applies (§9).

**Note format:** `YYYY-MM-DD · model · one line` — **append, don't overwrite**; the next session
reads your last line.

**Archive rule:** when a stage is sealed (`accepted`), move its section verbatim to
`docs/process/work-log-archive.md`, leave a one-line stub here, and lift any still-live
forward-wiring into `notes.md`. The live log stays lean; the archive and git history keep
everything.

**Layout:** this file is the **front door** — the rules, the Up-next queue, the live stage tables.
The heavy sections live beside it in `docs/process/work-log/`: `drift.md` (drift & decisions) ·
`notes.md` (notes to future sessions — grep `^## ` for headers, read only the notes tagged for
your item, **never the file whole**) · `backlog.md` (feature wishes + design-track inputs).
Updates go to the sub-file; statuses flip here. The plan itself — briefs, objectives, traps,
done-whens — is `docs/process/build-plan.md`: **that file is the plan, this one is the state.**

---

## Up next — the running order

The single ordered list of coming sessions: **what Beth types**, and what it is. **Every session
updates this queue before it ends** (pop the finished row, add rows the session created) **and
closes by telling Beth the new top row — the literal thing to type.** No session ends without
telling her the next one.

The queue is **Beth's to reorder anytime** — say the word in any session, or at `/cleanup`.
`/progress` reads this queue and never changes it. Model lanes are not a column: **Opus is the
default**, and a row says otherwise only when it is otherwise (protocol §1).

| #   | Beth types        | what it is                                                                                                        |
| --- | ----------------- | ----------------------------------------------------------------------------------------------------------------- |
| 1   | `/review P1`      | the fresh review that merges P1 — outer auth fence + login rate limit (gated core). **Lane: Fable.**              |
| 2   | `/work-item P4`   | session dates land one day early in stats — **partly gated**, `/review` follows                                   |
| 3   | `/work-item P3`   | delete the superseded shopping feature + orphans (test removals approved 2026-08-17)                              |
| 4   | `/work-item R-1`  | R2 on preview deployments — bucket ruled: read real, write scratch; documents deployment topology                 |
| 5   | `/work-item P6`   | honest failure states — errors stop rendering as zeros                                                            |
| 6   | `/work-item P5`   | stats cache invalidation, writer side + the per-mutation test rule                                                |
| 7   | `/work-item P2`   | R2 upload-action hardening — **gated**, `/review` follows                                                         |
| 8   | `/work-item P8`   | R2 orphan lifecycle — **gated**, `/review` follows                                                                |
| 9   | `/work-item P7`   | one fabric calculator — absorbs F-2 (its domain question asked in-session) — **gated**, `/review` follows         |
| 10  | `/work-item F-1`  | series designerName + dialog pending text                                                                         |
| 11  | `/work-item P12`  | test-honesty repairs (phantom removals approved 2026-08-17; kitting test retitled to KIT-004)                     |
| 12  | `/work-item P11`  | small honest fixes, one batch — includes the quick-add colour picker and over-log confirm (ruled 2026-08-17)      |
| 13  | `/work-item P13`  | one validation boundary — unify the duplicated `src/lib` rules                                                    |
| 14  | `/work-item P9`   | query scale + data integrity batch — **schema half gated**, `/review` follows                                     |
| 15  | `/work-item P14`  | gate alignment — warnings burn-down + `--max-warnings 0` + CI runs the gate (approved 2026-08-17)                 |
| 16  | `/design-session` | **DS-1, the foundation session** — palette, type and token direction (D-06); output becomes D-1. **Lane: Fable.** |

Order approved by Beth at the 2026-08-17 `/cleanup`; hers to reorder anytime. Gated items each
add a `/review` row when they finish — the builder stops at `built, awaiting review` and the
review session merges. If P11 outgrows one session it splits rather than marathons (its brief
says so).

**Standing recurrence — dependency maintenance (~monthly, next due 2026-09).** `npm audit` plus a
dependency review, in **its own session, never as a side effect of other work** (protocol §9).
**P10 did not consume this row** — it was the audit's urgent one-off patch pass, which left the
graph at zero advisories on 2026-08-17; the recurrence exists to keep it there.
Versions are pinned exact, so nothing arrives unless a session goes and gets it; the stack is
bleeding-edge and includes an Auth.js **beta**. Carried as a maintenance-ledger row until the
first one has actually run.

---

## Stage O — the workflow overhaul · **sealed 2026-08-16**

Five steps, replacing the dead GSD references with a working process: the protocol and gates, the
memory layer, the rules reconciliation, the eleven doors, and the migration. Merged as `99c9ffd`
(PR #72) — **and merging deployed it, which is the discipline the whole stage was built around.**
Full record: `docs/process/work-log-archive.md`.

## Stage A — the audit

| item                                        | status | date       | model   | note                                                                                                                                                                                                                                                                                                                                                   |
| ------------------------------------------- | ------ | ---------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| A-1 whole-codebase quality + security audit | built  | 2026-08-17 | Fable 5 | report at `docs/process/state-of-the-code-2026-08-17.md` — 12 proposed items, 7 new ledger rows + annotations, 1 new drift row, kitting-% drift filed; 8 parallel Opus sweeps + mechanical runs; zero app-code changes · **triaged at the 2026-08-17 `/cleanup`** — 14 rulings in `drift.md`, Stage P adopted (P1–P14), ledger down to folds + accepts |

## Stage P — the A-1 burn-down (adopted 2026-08-17)

Briefs in `docs/process/build-plan.md` §Stage P; P1–P12's full specs are the audit report's §3.
Running order: the queue above (interleaved with F-1 and R-1).

| item                                            | status                 | date       | model  | note                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ----------------------------------------------- | ---------------------- | ---------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1 outer fence + login rate limit               | built, awaiting review | 2026-08-17 | Opus 5 | 2026-08-17 · Opus 5 · **built, not merged — gated.** `authorized` callback added to `src/lib/auth.ts`, so `proxy.ts` now decides instead of fetching a session it discards (`/login` public, everything else needs `auth.user`); `checkRateLimit` split into `recordAttempt` (enforces, called only from the new exported `authorizeCredentials`, before bcrypt) + `peekRateLimit` (read-only, so the login form can still name the wait) — both entry paths now throttled, including `POST /api/auth/callback/credentials`; missing or `$`-mangled `AUTH_USER_*` now throws instead of returning null, so a broken deploy reads as "a server setting is wrong" rather than "Invalid credentials" (folds in the 2026-08-17 ledger row — **move it to Resolved at merge**). 56 new tests across 5 files (rate-limit, auth config, auth-guard, login action, proxy matcher); the auth core, `(auth)` group and `rate-limit.ts` had zero. Two false doc claims corrected in ARCHITECTURE + security-checklist; `auth-patterns.md` gained both patterns. Gate green, 2504 tests. New ledger row: `test-utils` never re-exported `userEvent`, so a rule 43 test files cannot obey |
| P2 R2 upload-action hardening                   | queued                 |            |        | gated (R2)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| P3 delete superseded shopping feature + orphans | queued                 |            |        | test removals approved 2026-08-17                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| P4 session dates off-by-one in stats            | queued                 |            |        | partly gated (stats queries)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| P5 writer-side invalidation + test rule         | queued                 |            |        | per-mutation rule is Beth's ruling 2026-08-17                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| P6 honest failure states                        | queued                 |            |        |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| P7 one fabric calculator                        | queued                 |            |        | absorbs F-2; gated (fabric calculator)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| P8 R2 orphan lifecycle                          | queued                 |            |        | gated (R2)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| P9 query scale + data integrity batch           | queued                 |            |        | schema half gated                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| P10 dependency patch session                    | built                  | 2026-08-17 | Opus 5 | all 29 npm advisories cleared (prod graph 2 critical + 13 high → 0); `@types/node` 20→22 folded in; `agentRules: false` per Beth's ruling; found that preview deployments cannot log in at all — new drift row + ledger row, owner R-1 · merged as `0917854` on Beth's word, layer-2 clause deferred to production (interim precedent in `drift.md`); production verified healthy after deploy — `/login` 200, all three auth endpoints 200, signed-out `/stats` 307                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| P11 small honest fixes batch                    | queued                 |            |        | includes quick-add picker + over-log confirm (ruled 2026-08-17)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| P12 test-honesty repairs                        | queued                 |            |        | phantom removals approved 2026-08-17; KIT-004 retitle                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| P13 one validation boundary                     | queued                 |            |        | created at `/cleanup`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| P14 gate alignment                              | queued                 |            |        | gate changes approved 2026-08-17                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |

## Stage F — post-audit fixes (seeded from the dissolved Phase 41)

Seeded, not scheduled — they run after A-1 so both get triaged at one `/cleanup` (D-09). If the
audit finds a deeper cause under any of them, the brief is rewritten before it is built.

| item                                          | status          | date | model | note                                                                                                                                                      |
| --------------------------------------------- | --------------- | ---- | ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F-1 series designerName + dialog pending text | queued          |      |       | old 999.83, 999.85 (SERIES-01)                                                                                                                            |
| F-2 fabric matching with no fabric assigned   | absorbed → P7   |      |       | **absorbed into P7** (2026-08-17 `/cleanup`) — built inside the unified calculator after its domain question is asked in-session; not run as its own item |
| F-3 supply stitch-total hint visibility       | rerouted → DS-2 |      |       | **rerouted to the design track** (Beth, 2026-08-17) — now a DS-2/D-2 input in `backlog.md`; not built in Stage F                                          |

## Stage R — process-enabling fixes

| item                          | status | date | model | note                                                                                                                                           |
| ----------------------------- | ------ | ---- | ----- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| R-1 R2 on preview deployments | queued |      |       | blocked human verification in phases 26, 27 and 29; D-13's preview ritual depends on it; **bucket ruled 2026-08-17: read real, write scratch** |

## Stage D — the redesigns

Forward-declared only. **A redesign item cannot be briefed before its canon exists** (hard rule
4): `/design-session` → Beth's approval makes canon → canon lands in `docs/design/screens/` →
_that landing_ queues the build item here. Order is Beth's ruling D-07. The inputs each one
inherits are in `backlog.md` under "Design-track inputs".

| item                                | status          | date | model | note                                                                                                          |
| ----------------------------------- | --------------- | ---- | ----- | ------------------------------------------------------------------------------------------------------------- |
| D-1 token swap + the four hot files | not yet briefed |      |       | awaits DS-1; when it lands, the no-hardcoded-colour grep joins the gate (a gate-config change → drift → Beth) |
| D-2 chart form + detail             | not yet briefed |      |       | awaits DS-2                                                                                                   |
| D-3 browse + gallery                | not yet briefed |      |       | awaits DS-3                                                                                                   |
| D-4 dashboard + stats               | not yet briefed |      |       | awaits DS-4                                                                                                   |
| D-5 supplies + shopping             | not yet briefed |      |       | awaits DS-5                                                                                                   |
| D-6 reference data                  | not yet briefed |      |       | awaits DS-6                                                                                                   |

---

## History — before this log existed

Nine milestones and 39 phases shipped between 2026-03-28 and 2026-07-02 under the GSD process,
which is gone (CLAUDE.md, "Process authority"). **This log does not restate them.** The record
lives in git history and in `docs/archive/planning/` — `MILESTONES.md`, `ROADMAP.md`, and the
per-phase folders under `phases/` with their plans, summaries, verifications and human-UAT
records. **The archive is history, not authority** (`docs/archive/README.md`).

| milestone | theme                  | phases | status                                                                   |
| --------- | ---------------------- | ------ | ------------------------------------------------------------------------ |
| v1.0      | MVP — "Replace Notion" | 1–4    | shipped 2026-04-11                                                       |
| v1.1      | Browse & Organize      | 5–7    | shipped 2026-04-16                                                       |
| v1.2      | Track & Measure        | 8–9.1  | shipped 2026-04-20                                                       |
| v1.3      | Form & Supply Overhaul | 10–14  | shipped 2026-05-16                                                       |
| v1.4      | Fixes & Polish         | 15–17  | shipped 2026-05-17                                                       |
| v1.5      | Statistics & Records   | 18–21  | shipped 2026-05-18                                                       |
| v1.6      | Cleanup & Hardening    | 22–26  | shipped 2026-05-20                                                       |
| v1.7      | Fix & Polish           | 27–30  | shipped 2026-05-24                                                       |
| v1.8      | Series & Collections   | 31–34  | shipped 2026-07-01                                                       |
| v1.9      | Cleanup & Polish       | 35–39  | shipped 2026-07-02 (phases 40 and 41 **dissolved** — Beth's ruling D-10) |

**What "dissolved" means, so it is not mistaken for dropped:** v1.9 was planned as phases 35–41.
Phases 35–39 shipped. Phase 40 (visual & layout polish) and Phase 41 (series polish & bug fixes)
were never built, and D-10 broke them up rather than queueing them: **Phase 41's three genuine
bugs became build items F-1, F-2 and F-3**; **Phase 40's polish and Phase 41's series display
work became design-track inputs**, listed in `backlog.md` under the surfaces they belong to. The
reasoning: every polish item sat on a screen the D-07 redesign order reaches, and polishing UI
about to be redesigned is work done twice. Nothing was dropped and nothing is done twice.

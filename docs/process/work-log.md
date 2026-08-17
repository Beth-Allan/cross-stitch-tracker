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

| #   | Beth types                | what it is                                                                                                                                                                                                                                                                                                                                                                                                              |
| --- | ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | "do overhaul step 3"      | rules reconciliation — rewrite `.claude/rules/git-workflow.md` and `quality-gates.md` against the new protocol, trim `testing-requirements.md`, repoint `ui-design-reference.md` at `docs/design/`. **These four auto-load today and still describe the dead GSD process**, so every session until this lands is being handed instructions to run a process that does not exist. Highest-value remaining overhaul step. |
| 2   | "do overhaul step 4"      | the doors — the `.claude/skills/` wrappers for `/progress`, `/broken`, `/tweak`, `/cleanup`, `/stitch-fact`, `/design-session`, `/plan-feature`, `/walkthrough`, plus the build doors `/work-item`, `/review`, `/stage-review`. Also `WORKFLOW-REFERENCE.md`, Beth's one-page card. **After this step she has words to type instead of instructions to give.**                                                          |
| 3   | "do overhaul step 5"      | migration — refresh and promote the 7 `.planning/codebase/` docs (they predate the entire Series milestone), promote `DESIGN-REFERENCE.md` to `docs/design/`, scaffold `docs/domain/` from the plan's glossary with provenance tags, archive the rest of `.planning/` and `docs/superpowers/`, repoint the stale commit-nag hook. **Then this branch merges and CLAUDE.md's transition banner comes off.**              |
| 4   | `/work-item A-1`          | **the audit** — the whole-codebase hunt for bugs, weak code, security holes and dishonest tests (Beth's requirement #2). Read-only: it changes no application code, it produces a report plus ledger rows. Runs as parallel subagent sweeps. **Lane: Fable.**                                                                                                                                                           |
| 5   | `/cleanup`                | triage what A-1 found, together with the three Stage F briefs already seeded — one decision at a time, Beth's rulings recorded as they are made. This is where the burn-down's actual shape gets set (her ruling D-09: the queue is managed before new work).                                                                                                                                                           |
| 6   | _(set at the `/cleanup`)_ | **the wart burn-down** — fix items until the ledger reaches a baseline Beth accepts. Includes `/work-item F-1`, `F-2`, `F-3` and `R-1` unless her triage reorders them. R-1 (R2 on preview deployments) wants to land early: the design track's whole verification loop runs on preview links, and previews cannot currently show images.                                                                               |
| 7   | `/design-session`         | **DS-1, the foundation session** — the palette, type and token direction for the whole app (her ruling D-06). Its output becomes build item **D-1**, and when D-1 lands, the no-hardcoded-colour check joins the gate. **Lane: Fable.**                                                                                                                                                                                 |

**Standing recurrence — dependency maintenance (~monthly, next due 2026-09).** `npm audit` plus a
dependency review, in **its own session, never as a side effect of other work** (protocol §9).
Versions are pinned exact, so nothing arrives unless a session goes and gets it; the stack is
bleeding-edge and includes an Auth.js **beta**. Carried as a maintenance-ledger row until the
first one has actually run.

---

## Stage O — the workflow overhaul (`chore/workflow-overhaul`)

Replacing the dead GSD references with a working process. Spec: `WORKFLOW-OVERHAUL-HANDOFF.md`
§3.7. Beth's rulings D-01–D-14 are in its §2.

| item                          | status | date       | model            | note                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ----------------------------- | ------ | ---------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| step 1 — foundation           | built  | 2026-08-16 | Fable 5 + Opus 5 | 2026-08-16 · Fable/Opus · `session-protocol.md` written (the authority) · CLAUDE.md rewritten 539 → 142 lines with a transition banner · `security-checklist.md` written · `npm run gate` added and verified green end-to-end (2448 tests, ~2.5 min) · husky pre-push now runs the gate · CI gained `tsc --noEmit` · `guard-git.sh` ported and self-tested · `review-gated-paths.txt` written, all ten paths verified to exist · `enforce_admins` flipped ON for main. **One item parked:** wiring guard-git into `.claude/settings.json` — see the ledger row and the `notes.md` entry.                                                                                                                             |
| step 2 — memory               | built  | 2026-08-16 | Opus 5           | 2026-08-16 · Opus 5 · this file + `drift.md`, `notes.md`, `backlog.md`, `maintenance-ledger.md`, `build-plan.md`. The ~90-item `999.x` list was split three ways after checking each candidate against the working tree: ~30 already fixed by phases 35–39 and **not carried** (evidence table in the ledger's seeding note), the genuine warts to the ledger, the wishes to `backlog.md`. Phase 41's three real bugs became briefs F-1/F-2/F-3; Phase 40 and Phase 41's display half became design-track inputs (D-10). Re-attempted the parked `settings.json` edit through three routes — **refused identically**, including a restrict-only variant, which proves the block is the file rather than the content. |
| step 3 — rules reconciliation | queued |            |                  | four auto-loading rule files still describe GSD; see queue row 1                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| step 4 — doors                | queued |            |                  | the skills + `WORKFLOW-REFERENCE.md`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| step 5 — migration            | queued |            |                  | refresh + promote codebase docs, scaffold `docs/domain/`, archive `.planning/`; **branch merges after this**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |

## Stage A — the audit

| item                                        | status | date | model | note                                                                                                      |
| ------------------------------------------- | ------ | ---- | ----- | --------------------------------------------------------------------------------------------------------- |
| A-1 whole-codebase quality + security audit | queued |      |       | brief in `build-plan.md`; Fable lane; read-only; output is a report + ledger rows + a proposed-items list |

## Stage F — post-audit fixes (seeded from the dissolved Phase 41)

Seeded, not scheduled — they run after A-1 so both get triaged at one `/cleanup` (D-09). If the
audit finds a deeper cause under any of them, the brief is rewritten before it is built.

| item                                          | status | date | model | note                                                                                                       |
| --------------------------------------------- | ------ | ---- | ----- | ---------------------------------------------------------------------------------------------------------- |
| F-1 series designerName + dialog pending text | queued |      |       | old 999.83, 999.85 (SERIES-01)                                                                             |
| F-2 fabric matching with no fabric assigned   | queued |      |       | old 999.21 (FIX-01); **domain fact needed first**; may be `/review`-gated depending on where the fix lands |
| F-3 supply stitch-total hint visibility       | queued |      |       | old 999.73 (FIX-02); **overlaps the chart-form redesign** — Beth routes it at the Stage F `/cleanup`       |

## Stage R — process-enabling fixes

| item                          | status | date | model | note                                                                                                                      |
| ----------------------------- | ------ | ---- | ----- | ------------------------------------------------------------------------------------------------------------------------- |
| R-1 R2 on preview deployments | queued |      |       | blocked human verification in phases 26, 27 and 29; D-13's preview ritual depends on it; needs Beth's bucket ruling first |

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
lives in git history and, until overhaul step 5 archives it, in `.planning/` — `MILESTONES.md`,
`ROADMAP.md`, and the per-phase folders under `phases/` with their plans, summaries,
verifications and human-UAT records.

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

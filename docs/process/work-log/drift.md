# Cross-Stitch Tracker — Drift & Decisions

**What this is:** the record of **contradictions** found mid-session and **Beth's rulings** on
them. Opened 2026-08-16 at workflow-overhaul step 2.

**The drift rule (protocol §6).** Discovered mid-session, any of: a doc contradicting the code, a
doc contradicting another doc, a spec gap, a wrong assumption baked into either. Route by kind:

- **Product behavior · domain facts · calculations · schema intent** → **a row in this file**,
  plus surfacing it to Beth in the four-part frame (_what happened · why it needs you · your
  options with a recommendation · what happens after you choose_). She rules — the ruling is
  recorded here the moment it is made — or she parks it for `/cleanup`. **Never silently
  resolved, never decided unilaterally.**
- **Merely descriptive staleness** (a doc describing code that has moved on — a renamed
  component, a changed signature, a dead example) → **not a drift row.** Fix the doc in the same
  PR and note it in the work log. Docs that describe code follow code.
- **Improvement ideas** (nothing contradicts; it could just be better) → `backlog.md`, never
  applied mid-item.

**Also here:** decisions that bind future sessions, whether or not they started as a
contradiction — Beth's rulings from `/cleanup`, gate-config changes (hard rule 6), and test
removals (hard rule 2). The standing rulings **D-01–D-14** that shaped this whole process live
in `WORKFLOW-OVERHAUL-HANDOFF.md` §2 and are not restated here; new ones number on from D-15.

**Row format:** date · what contradicts what · what was surfaced to Beth · her ruling · what it
changed. Open rows sit under Open until ruled; ruled rows move to Ruled with the ruling in her
words where possible. Rows are never deleted.

---

## Open — awaiting Beth's ruling

### 2026-08-16 · gate-config change, applied out of necessity at overhaul step 5

**What happened.** `.planning/` was excluded from both `format:check` and `lint`. Step 5 moved it
to `docs/archive/planning/` — 663 files renamed, 660 of them markdown — and `docs/` **is** inside the
formatter's scope, so the move would have pulled every one of them into `npm run gate` and turned
the gate red on history nobody is going to reformat. The exclusion was carried across the rename:
`.prettierignore` now ignores `docs/archive/`, and `eslint.config.mjs` ignores `docs/archive/**`
where it ignored `.planning/**` (its `// GSD tooling` comment went with it).

**Why it needs Beth.** Hard rule 6 makes any gate-config change drift, and this one was made
inside the migration rather than brought to her first — so it is recorded here for her yes or no
rather than filed as done. **No live code and no live doc lost coverage.** Precisely: 647 of the
archived files genuinely fail `prettier --check` today, which is what would have turned the gate
red. Five files moved _out_ of the formatter's scope that were in it on main — the four
`docs/superpowers/` plan/spec pairs and `docs/tech-stack.md`, all now archived; all five pass
`prettier --check` as they stand, so nothing is being hidden.

**Her options.** (a) Confirm the carry-over — recommended; archived history is preserved
byte-for-byte, and reformatting it would rewrite the record. (b) Reverse it and let the gate
format the archive once — one large mechanical commit, after which the archive is no longer
verbatim. (c) Move the archive out of `docs/` entirely so the question does not arise.

**What happens after she chooses.** (a) changes nothing and this row moves to Ruled. (b) or (c)
is a small `chore/` branch.

### 2026-08-16 · two gate questions raised by the layer-1 review of PR #72

**What happened.** The independent pre-merge review of the overhaul branch found two things that
are Beth's to rule on rather than a session's to decide.

**① `gh pr merge` is now auto-approved.** Step 1 added a `permissions.allow` entry for it in
`.claude/settings.json`. Before that, running the merge command surfaced a permission prompt — a
mechanical stop before a production deploy. What replaces it is convention: her word (protocol §5
layer 2, §8). It was in the plan and is not smuggled, but it was never raised as a gate-config
change the way the formatter exclusion was. **Options:** (a) confirm it — recommended, since the
merge already requires her word and the prompt was answered by the same session that would be
merging, so it stopped nothing a rule doesn't; (b) remove the entry and keep the prompt as a
second, mechanical pause. Either way the `--admin` bypass stays blocked by the guard.

**② Should the `revalidateTag("stats")` callers be review-gated?** The stats _cache_ is gated by
its query directory, but the mutations that invalidate it — `chart-actions.ts`,
`supply-actions.ts`, `session-actions.ts` — are not. That trap caused two of the bugs the ledger
was seeded from. **Options:** (a) leave as is — most items touch one of those three files, so
gating them makes almost every build item need a fresh `/review` session, which is a real tax on
a one-item-per-session process; (b) gate them and accept the tax on the ground that the cache
layer is where bugs have actually hidden; (c) let A-1 look first and decide with evidence —
recommended. Recorded in `.claude/hooks/review-gated-paths.txt` as an open question so it cannot
be quietly forgotten.

**③ Four paths were added to the review-gated list during this same review, and she should know.**
The list is the whole of hard rule 3's enforcement (no `guard-merge` exists, D-03), and the review
found it missing files that protocol §5 already names in prose: **`proxy.ts`** — the matcher
deciding which routes are protected at all, so a one-line edit there can silently unprotect the
app — plus `src/lib/r2.ts` (the module that builds the R2 client from the credentials, where the
two gated upload actions only _use_ it), and the `src/app/(auth)/` and `src/app/api/auth/`
directories, where the only `checkRateLimit` caller lives. These were added rather than parked,
because each closes a gap against policy she has already ruled on rather than extending it — but
adding to that list is a gate-config change either way, so **it is hers to confirm or reverse**.
Recommended: confirm. `session-protocol.md` §5 was updated to match.

**What happens after she chooses.** All three are one-line edits to a config file, no code.

## Also open — the questions known to be coming

_(Two questions are **known to be coming** but are not drift rows yet, because nothing
contradicts anything until someone tries to build them — they are recorded where they will be
asked, which is the point of writing them down now:_

- _Fabric matching for a project with no assigned fabric — what should it match against? Build
  item **F-2**, trap ②. It is a domain fact, so it goes through `/stitch-fact`, not through here,
  unless her answer contradicts something already written._
- _Whether logging more stitches than a project's total should be blocked, warned, or allowed.
  Maintenance-ledger row, 2026-08-16. Same route.)_

## Ruled

_(Empty — no contradiction has been surfaced under this process yet. Beth's rulings D-01–D-14,
which set the process itself up, are in `WORKFLOW-OVERHAUL-HANDOFF.md` §2.)_

## Noted at seeding — not drift, recorded so no one re-finds them

Three staleness findings from the 2026-08-16 migration read. **None is a drift row**: each is
descriptive staleness in a file that overhaul step 5 archived, so no contradiction is left to
rule on. They are here only so a future reader of the archive is not misled. All three paths
below are now under `docs/archive/planning/`.

- **`REQUIREMENTS.md` shows POLISH-01 and POLISH-04 as "Pending"**, and their
  checkboxes unticked — but both shipped in Phase 39, and that phase's own
  `39-VERIFICATION.md` records them SATISFIED with the evidence. The requirements table was
  simply never updated after the phase closed. Anyone reading the archive should trust the
  verification file over the table.
- **The `999.x` backlog in CLAUDE.md was substantially stale** — phases 35–39 shipped fixes for
  roughly 30 items without striking them off. Every candidate was re-checked against the working
  tree during the step-2 split; the results are the table in `maintenance-ledger.md`'s seeding
  note.
- **`STATE.md` describes a live GSD process** (`gsd_state_version`, phase/plan
  progress, a resume file) that no longer exists in any form. It is history from 2026-07-02 and
  is superseded by `docs/process/work-log.md` as of this file's creation.

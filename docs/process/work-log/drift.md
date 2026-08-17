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

_(Empty. Two questions are **known to be coming** but are not drift rows yet, because nothing
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
descriptive staleness in a file that overhaul step 5 archives, so there is no contradiction left
to rule on once it lands. They are here only so a future reader of the archive is not misled.

- **`.planning/REQUIREMENTS.md` shows POLISH-01 and POLISH-04 as "Pending"**, and their
  checkboxes unticked — but both shipped in Phase 39, and that phase's own
  `39-VERIFICATION.md` records them SATISFIED with the evidence. The requirements table was
  simply never updated after the phase closed. Anyone reading the archive should trust the
  verification file over the table.
- **The `999.x` backlog in CLAUDE.md was substantially stale** — phases 35–39 shipped fixes for
  roughly 30 items without striking them off. Every candidate was re-checked against the working
  tree during the step-2 split; the results are the table in `maintenance-ledger.md`'s seeding
  note.
- **`.planning/STATE.md` describes a live GSD process** (`gsd_state_version`, phase/plan
  progress, a resume file) that no longer exists in any form. It is history from 2026-07-02 and
  is superseded by `docs/process/work-log.md` as of this file's creation.

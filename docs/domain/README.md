# docs/domain/ — The Cross-Stitch Knowledgebase

**What this is:** the single home for cross-stitch domain facts — how the craft actually works,
as Beth practises it. When any session asks "is that really how skeins/fabric/kitting work?",
this directory is the only place to look. Facts live in per-topic files; every fact carries a
stable ID and a provenance tag.

## Never assume

The full rule is `docs/process/session-protocol.md` §7 (hard rule 5). Cross-stitch constants
encode Beth's practice, and assumed-wrong ones have already cost real work — a hardcoded 8 m
skein length that is wrong for three brands she buys, and invented over-count thresholds. **An
undocumented constant is a stop-and-ask, never a guess.** Facts come from Beth; a documented
source is second best and is tagged as such.

## The write path

- Facts enter through **`/stitch-fact`** (Beth's door, protocol §8) and only on Beth's word. No
  session adds, edits, or deletes a fact on its own initiative — not even an "obvious" one, not
  even one a manufacturer's website confirms.
- Anything that **conflicts** with a recorded fact — code, another doc, a supplier's page — is a
  drift row (`docs/process/work-log/drift.md`) for Beth's ruling, never a silent overwrite.
- If a fact contradicts a constant already baked into the app, that is drift **plus a fix item**,
  not a doc edit.
- IDs are stable forever: never renumber, never reuse a retired ID. A superseded fact keeps its
  ID with a note pointing at its replacement.

## Cheap-read recipe

Sessions read only the topic files their work item touches — never the whole corpus. The item's
brief names its topics; when in doubt, scan the manifest below and open the one or two files
whose scope matches. Reading all of `docs/domain/` in one session is a smell.

## Fact IDs

`<PREFIX>-<NNN>`: a topic prefix plus a zero-padded number (e.g. `THR-004`). New facts take the
next free number in their topic. Code comments, briefs and specs cite facts by ID — grep `^### `
in a topic file to list its facts.

## Provenance vocabulary

Every fact ends with exactly one tag. The order below is the order of trust:

- `[stated by Beth YYYY-MM-DD]` — Beth said it, in that session. **The source of truth**
  (protocol §7). Build on it.
- `[from the project plan YYYY-MM-DD — CROSS_STITCH_TRACKER_PLAN.md §N, not re-confirmed]` —
  migrated from the planning document Beth wrote her requirements into. The app is already built
  on this material, so it is trustworthy enough to keep building on; it has simply not been said
  back to her since. Upgrades to `[stated by Beth …]` as she confirms topics.
- `[from a cited source YYYY-MM-DD — <source>, not confirmed by Beth]` — an external reference
  (a supplier's spec, a published formula) that the app already relies on. Usable, but Beth's
  word supersedes it the moment she gives one.
- `[in the app, origin unknown — treat as unverified]` — a constant found in the codebase with no
  traceable source. **Recorded so it stops being invisible, not so it can be built on.** Every
  one of these belongs in `open-questions.md` too.
- `[unverified — do not build on]` — recorded for completeness; no feature may depend on it.

## Corrections vs. changes in the world

Two different things, kept apart:

- **A correction** — we had it wrong. The old fact keeps its ID with a note pointing at its
  replacement, per the ID rule above.
- **A change in the world** — we had it right and a maker changed their product (a skein length,
  a fabric line). Record the new fact and keep the old rule visible on it as an
  `Until <date>:` line. Data Beth entered before the change was entered under the old rule, and a
  later session reading only the current one cannot otherwise tell an error from an older record.

## Topic manifest

| file                     | scope                                                                                                 | status                                                                                     |
| ------------------------ | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `vocabulary.md`          | the words themselves — chart vs project, WIP, FFO, SAL, series, BAP, stash, onion skinning, the tools | seeded 2026-08-16 from the plan's glossary — awaiting Beth's confirmation                  |
| `threads.md`             | thread brands, floss, skeins and skein length, strand counts, the skein-calculator constants          | seeded 2026-08-16 — **carries the project's worst open question** (per-brand skein length) |
| `fabric.md`              | fabric types and counts, over-count, the fabric-size calculation and its margin                       | seeded 2026-08-16 — over-count inference is unsourced and open                             |
| `kitting-and-storage.md` | what "kitted" means (the nine conditions), project bags and bins                                      | seeded 2026-08-16 from the plan's glossary — awaiting Beth's confirmation                  |
| `open-questions.md`      | every recorded gap, tiered by what it blocks — the `/stitch-fact` queue                               | live                                                                                       |

## Relationship to the other docs

`CROSS_STITCH_TRACKER_PLAN.md` remains the **product** spec — what the app must do, and the
source most of this directory was seeded from. **This directory is authoritative for domain
truth**: where the two disagree about how cross-stitch works, a fact here wins and the
contradiction is a drift row. The calculators in `src/lib/utils/` cite fact IDs for the constants
they encode.

# Open questions — the `/stitch-fact` queue

Every recorded gap in the knowledgebase, tiered by what it blocks. **This is the agenda for
`/stitch-fact` sessions**: Beth answers, the fact lands in its topic file with her name and the
date on it, and the question is struck from here citing the fact ID that answered it.

Nothing on this list may be guessed at, worked around, or filled in from a supplier's website
(hard rule 5, protocol §7). A question here is a **stop-and-ask** for any item that depends on it.

Opened 2026-08-16 at overhaul step 5.

---

## Tier 1 — the app is giving a wrong answer today

### ~~Q-001 — What is a skein's length, per brand?~~

**Answered 2026-10-25** — the brands she buys (**THR-007**); DMC and Anchor 8 m (**THR-008**);
Weeks Dye Works and Gentle Art 5 yd (**THR-009**); Kreinik by thread type — #4 braid 11 m, #8 braid
10 m, blending filament 50 m — and used whole (**THR-010**); every other brand's length entered by
Beth when she sets the brand up, unknown until then (**THR-011**, ruling D-34). **The wrong figures
stay on screen until item F-16 ships**, and figures already saved stay wrong until they are
recomputed (F-16 trap ⑨). That is now a build, not a question.

## Tier 2 — blocks a planned build

### Q-002 — How is over-count decided?

Over 1 or over 2 divides the fabric count and so moves every thread and size figure (FAB-004).
The proposal to infer it from fabric count came with invented thresholds. Needed from Beth: how
she decides in practice — whether it follows from the fabric type, from the count, from the chart,
or from none of those — and what should happen when she has already set it by hand.

**Blocks:** the auto-infer feature (backlog, old 999.14). The calculators are review-gated.

### Q-003 — Where are the size-category boundaries?

`CROSS_STITCH_TRACKER_PLAN.md` §10 records this as unresolved — Beth was still refining the
stitch-count ranges, "especially Medium vs. Large", and the plan's instruction was to build with
configurable thresholds. Whether that is still open, and what the ranges are, is hers to say.
BAP is separately recorded at 50,000+ stitches (VOC-006) and would need to line up.

**Blocks:** nothing in flight; surfaces wherever the app groups projects by size.

### Q-009 — Which other threads are used whole, and how many strands do the rest hold?

The skein formula assumes floss that holds six strands and is split (THR-004, THR-006). Beth has
said that is true of DMC, Anchor, Weeks Dye Works and Gentle Art (THR-008, THR-009), and that
every Kreinik line is used whole (THR-010, **THR-013** — the Kreinik half of this question,
answered 2026-10-29). For every other brand she buys (THR-007) — Rainbow Gallery, Classic
Colorworks, The Caron Collection, Gloriana, Au Ver à Soie and any others — **how many strands a
skein holds, and whether it is split at all, is unrecorded**. Needed from Beth: for each brand or
line she stitches with, the strand count, or "used whole" — and, since THR-016 gave floss and
Kreinik different cut lengths, the length she cuts it.

**Blocks:** part of item F-16 — a line she adds later must not be divided into six by default.
F-16 can ship the brands already stated without it, provided an unknown strand structure reads
"unknown" the same way an unknown length does.

## Tier 3 — confirmations of migrated material

### Q-004 — Does the migrated glossary say it right?

Every fact in `vocabulary.md`, `kitting-and-storage.md`, and the plan-sourced facts in
`threads.md` and `fabric.md` came from the planning document, not from a conversation. The app is
built on them, so they are safe to keep building on — but **none has been said back to Beth**.
The nine kitting conditions (KIT-001) are the highest-value confirmation: they are what "kitted"
means, even though Beth sets the status herself (KIT-006).

**Blocks:** nothing. Worth doing as one pass rather than nine interruptions.

_Narrowed 2026-10-25: KIT-001's "calculated, never stored" is corrected by **KIT-006** (Kitted is a
status Beth sets). The nine conditions themselves are what remains to confirm._

### Q-005 — Is a 3-inch margin each side right?

The fabric calculator adds 6 inches — 3 per side — citing design spec D-20 (FAB-005). That is a
craft preference, not a law: framing, finishing style and hoop size all move it. Confirm it is
what Beth wants, and whether it should vary.

**Blocks:** nothing. A wrong margin quietly rejects fabric she could have used.

### Q-006 — Is a 20% waste factor the right default?

The skein calculator defaults to 20% waste, user-configurable (THR-006). Its origin is the same
cited formula, not Beth. Confirm the default matches her actual experience of running out.

**Blocks:** nothing.

### ~~Q-007 — Does she keep `.css` chart files, and what program makes `.saga`/`.oxs`?~~

**Answered 2026-10-24** — yes, she keeps `.css` files (**CHF-005**), and `.css`, `.saga` and `.oxs`
are all Cross Stitch Saga files (**CHF-006**).

### ~~Q-008 — Is an 18-inch cut, about 15 inches usable, how she works?~~

**Answered 2026-10-29 — no** (**THR-016**): she cuts about 24 inches of floss and 15 of Kreinik,
losing about 3 from each. That contradicts the app's 255 (THR-006), so it is drift **D-44** plus
fix item **F-19**, which she placed straight after F-16a's review.

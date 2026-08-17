# Open questions — the `/stitch-fact` queue

Every recorded gap in the knowledgebase, tiered by what it blocks. **This is the agenda for
`/stitch-fact` sessions**: Beth answers, the fact lands in its topic file with her name and the
date on it, and the question is struck from here citing the fact ID that answered it.

Nothing on this list may be guessed at, worked around, or filled in from a supplier's website
(hard rule 5, protocol §7). A question here is a **stop-and-ask** for any item that depends on it.

Opened 2026-08-16 at overhaul step 5.

---

## Tier 1 — the app is giving a wrong answer today

### Q-001 — What is a skein's length, per brand?

The calculator uses one length (~8 m, a DMC skein) for every brand, so **every skein figure for a
non-DMC brand is wrong right now** (THR-005). Needed from Beth: which thread brands she actually
buys, and the skein length for each. The old backlog's figures — Weeks Dye Works and Gentle Art
at 5 yd, Kreinik at 10–11 m — are candidates to put to her, **not answers**.

**Blocks:** the per-brand skein length build (backlog, old 999.13), which touches
`src/lib/utils/skein-calculator.ts` and `prisma/schema.prisma` — two review-gated cores.
**Answering it also changes numbers Beth is already looking at**, so it is worth asking early.

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

## Tier 3 — confirmations of migrated material

### Q-004 — Does the migrated glossary say it right?

Every fact in `vocabulary.md`, `kitting-and-storage.md`, and the plan-sourced facts in
`threads.md` and `fabric.md` came from the planning document, not from a conversation. The app is
built on them, so they are safe to keep building on — but **none has been said back to Beth**.
The nine kitting conditions (KIT-001) are the highest-value confirmation: "kitted" is a
calculated state the whole workflow turns on.

**Blocks:** nothing. Worth doing as one pass rather than nine interruptions.

### Q-005 — Is a 3-inch margin each side right?

The fabric calculator adds 6 inches — 3 per side — citing design spec D-20 (FAB-005). That is a
craft preference, not a law: framing, finishing style and hoop size all move it. Confirm it is
what Beth wants, and whether it should vary.

**Blocks:** nothing. A wrong margin quietly rejects fabric she could have used.

### Q-006 — Is a 20% waste factor the right default?

The skein calculator defaults to 20% waste, user-configurable (THR-006). Its origin is the same
cited formula, not Beth. Confirm the default matches her actual experience of running out.

**Blocks:** nothing.

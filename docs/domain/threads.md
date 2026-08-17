# Threads — brands, skeins, strands

Everything the app's thread and skein maths rests on. **This file carries the project's worst
open question** (THR-005): the skein calculator uses one skein length for every brand, and that
is known to be wrong for at least three brands Beth buys.

Seeded 2026-08-16 (overhaul step 5) from `CROSS_STITCH_TRACKER_PLAN.md` §3 and from the constants
already encoded in `src/lib/utils/skein-calculator.ts`.

---

### THR-001 — Floss / thread

The embroidery thread used for stitching. Tracked by brand, colour code and colour family.

[from the project plan 2026-08-16 — CROSS_STITCH_TRACKER_PLAN.md §3, not re-confirmed]

### THR-002 — Skein

The standard unit in which embroidery thread is sold. Charts specify how many skeins of each
colour a design needs.

[from the project plan 2026-08-16 — CROSS_STITCH_TRACKER_PLAN.md §3, not re-confirmed]

### THR-003 — The brands the plan names

- **DMC** — the most common brand of embroidery floss; a standardised catalogue of ~500 numbered
  colours. The app ships a seeded DMC catalogue (`prisma/fixtures/dmc-threads.json`).
- **Anchor** — another thread brand, with its own colour numbering.
- **Kreinik** — specialty metallic threads and braids, used for decorative effects.
- **Mill Hill** — glass beads (not thread), commonly used in cross stitch.

Beth also buys **Weeks Dye Works** and **Gentle Art**, which the glossary does not name; they
appear in the backlog note behind THR-005.

[from the project plan 2026-08-16 — CROSS_STITCH_TRACKER_PLAN.md §3, not re-confirmed]

### THR-004 — Strand count

Floss is used in a chosen number of strands, 1 to 6, and the number chosen drives thread
consumption directly (it is a multiplier in the skein formula, THR-006). The app models it as
`StrandCount = 1 | 2 | 3 | 4 | 5 | 6`.

[from a cited source 2026-08-16 — the skein formula's "6 strands per skein" term; not confirmed
by Beth]

### THR-005 — Skein length: ONE value for every brand, and it is wrong

`src/lib/utils/skein-calculator.ts` encodes a single skein length — **~8 m (8.7 yd / 313 in)**,
described in the file as a DMC skein — and applies it to every brand. The backlog's note (old
999.13) records that this is **wrong for at least three brands Beth uses**: Weeks Dye Works and
Gentle Art (noted there as 5 yd) and Kreinik (noted as 10–11 m). **Those figures came off the old
backlog note, not off Beth** — they are candidates to confirm, not facts to code.

Consequence, stated plainly: **every skein figure the app shows for a non-DMC brand is currently
wrong.**

The fix is a per-brand skein length on the thread brand plus a calculator that reads it — which
touches two review-gated cores and needs a migration. **The lengths are Beth's to state, per
brand, before any of that is built** (hard rule 5). Tracked in `open-questions.md` Q-001.

[in the app, origin unknown — treat as unverified]

### THR-006 — The skein formula and its constants

The calculator computes:

```
skeins = stitches × strands × wasteFactor ÷ (effectiveCount × 255)
effectiveCount = fabricCount ÷ overCount        (see FAB-004)
wasteFactor    = 1 + wastePercent/100           (user-configurable, default 20%)
```

The **255** is `17 usable segments × 15 inches` — derived from an ~8 m skein cut into 18-inch
lengths, each yielding ~15 inches of usable thread after tie-off. The waste factor covers moving
between areas of a design and mistakes. The file cites `mismatch.co.uk/cross.htm` and
`thread-bare.com/tools` as the formula's sources.

The formula is **only as right as its skein length** (THR-005): the 255 is an ~8 m skein's
number, so a per-brand length changes this constant into a per-brand calculation.

[from a cited source 2026-08-16 — mismatch.co.uk/cross.htm and thread-bare.com/tools, as cited in
`skein-calculator.ts`; not confirmed by Beth]

# Fabric — types, count, and sizing

Seeded 2026-08-16 (overhaul step 5) from `CROSS_STITCH_TRACKER_PLAN.md` §3 and §4.4 and from
`src/lib/utils/fabric-calculator.ts`.

---

### FAB-001 — Fabric

The base material stitched onto. Tracked by brand, count, type, colour and dimensions; the plan's
record also carries a designer-given name ("Driftwood Princess"), a colour family, a colour type,
shortest and longest edge in inches, an associated project, and a need-to-buy flag.

[from the project plan 2026-08-16 — CROSS_STITCH_TRACKER_PLAN.md §3 and §4.4, not re-confirmed]

### FAB-002 — Count

Fabric count is **holes per inch** — 14ct, 18ct, 28ct. Higher count means smaller stitches, more
detail, and a smaller finished piece for the same stitch count.

[from the project plan 2026-08-16 — CROSS_STITCH_TRACKER_PLAN.md §3, not re-confirmed]

### FAB-003 — The fabric types the plan names

- **Aida** — a clear grid weave; the easiest to stitch on.
- **Linen** — more advanced; **stitched over two threads**.
- **Lugana** — an evenweave, popular for its drape and texture.
- **Evenweave** — the general category Lugana belongs to.

[from the project plan 2026-08-16 — CROSS_STITCH_TRACKER_PLAN.md §3, not re-confirmed]

### FAB-004 — Over-count, and how the app decides it

**Over-count** is how many fabric threads each stitch spans — over 1 or over 2. It divides the
fabric count to give the _effective_ count that both calculators use
(`effectiveCount = fabricCount ÷ overCount`), so it changes every thread and size figure for a
project. Linen is stitched over two (FAB-003); evenweaves commonly are.

_Both calculators do divide, as of **F-4** (2026-08-18). Until then `fabric-calculator.ts` never
had, so every fabric-size figure for an over-two project was roughly half what it should be —
drift **D-17**, and the reason this paragraph exists._

**The app does not infer it, and the one attempt to write down how it should was invented.** The
old backlog note proposed "≤25 → over 1, ≥28 → over 2" — thresholds with no source, and with 26
and 27 unaccounted for. Whether it is a threshold rule at all is Beth's practice to state.
Tracked in `open-questions.md` Q-002.

[in the app, origin unknown — treat as unverified]

### FAB-005 — Required fabric size, and the 6-inch margin

```
required inches = stitches ÷ effectiveCount + 6        (effectiveCount = fabricCount ÷ overCount, FAB-004)
```

The **6 inches** is a 3-inch margin on each side, attributed in `fabric-calculator.ts` to design
spec D-20, and it is added **after** the effective count divides — the margin does not scale with
over-count. A piece of fabric fits if it covers the required width and height in **either
orientation** — the app checks the rotated fit as well.

[unverified — do not build on] — the tag is deliberately weak. `fabric-calculator.ts` attributes
the 6 inches to "design spec D-20", and D-20 resolves only inside `docs/archive/planning/` — an
archived planning note ("Margin is fixed at 3 inches per side (standard cross-stitch framing
recommendation)"), in a directory this repo declares history and not authority. The margin is in
the app and the app works, so this is not a reason to change code; it is a reason not to treat
3 inches as established. Q-005 puts it to Beth.

### FAB-006 — Which stash pieces the app offers for a project

On the Pattern Dive **Fabric Requirements** tab, the pieces offered for a project are:

- **Project with fabric assigned** — spare pieces of the **same count** as the assigned fabric.
- **Project with no fabric assigned** — **every** spare piece, each judged at **its own count**
  (a 28ct piece is measured against the 28ct requirement, not the project's, because the project
  has none).
- **Either way, only pieces that actually fit** the required size (FAB-005, in either
  orientation). A piece that is too small is not offered at all.

A project with no fabric assigned reports **no required size at all** — never a size of zero.

[stated by Beth 2026-08-17]

_The parenthetical above was stated before any fabric-size code applied over-count, and
**FAB-007 refines it**: the count a candidate piece is judged at is divided by the project's
over-count, and a piece that fits only at over one is shown with that qualifier rather than
hidden._

### FAB-007 — Over-count, and which spare pieces are offered

Over-count divides the count a candidate piece is judged at, exactly as it divides every other
size figure (FAB-004). For a project stitched over two, a 28ct spare piece is measured against
the **14ct** requirement, not the 28ct one — so pieces that would have been offered at over one
genuinely are too small.

A piece in that position — Beth's words, _"this fits if you're stitching over 1, but not if
you're stitching over 2"_ — is **shown with that qualifier, not hidden**. Her reasoning: a
project with no fabric assigned may not have a settled over-count yet, so hiding the piece
assumes a decision she has not made. A piece too small **either** way is still not offered at
all, which is FAB-006 unchanged.

_True of the app as of **F-5** (2026-08-18)._ On the Fabric Requirements tab a piece in this
position is listed under its own heading, "Fits Only If You Stitch Over 1", with the qualifier on
the row itself; it is never counted among the pieces that fit and carries no **Assign** button,
because assigning it would be assigning fabric that does not fit the project as it stands. It
appears in **both halves** of FAB-006's list — projects with fabric assigned and projects without
— since over-count is the project's own setting either way.

[stated by Beth 2026-08-18]

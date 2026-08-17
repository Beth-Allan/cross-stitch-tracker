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

**The app does not infer it, and the one attempt to write down how it should was invented.** The
old backlog note proposed "≤25 → over 1, ≥28 → over 2" — thresholds with no source, and with 26
and 27 unaccounted for. Whether it is a threshold rule at all is Beth's practice to state.
Tracked in `open-questions.md` Q-002.

[in the app, origin unknown — treat as unverified]

### FAB-005 — Required fabric size, and the 6-inch margin

```
required inches = stitches ÷ fabricCount + 6
```

The **6 inches** is a 3-inch margin on each side, attributed in `fabric-calculator.ts` to design
spec D-20. A piece of fabric fits if it covers the required width and height in **either
orientation** — the app checks the rotated fit as well.

[unverified — do not build on] — the tag is deliberately weak. `fabric-calculator.ts` attributes
the 6 inches to "design spec D-20", and D-20 resolves only inside `docs/archive/planning/` — an
archived planning note ("Margin is fixed at 3 inches per side (standard cross-stitch framing
recommendation)"), in a directory this repo declares history and not authority. The margin is in
the app and the app works, so this is not a reason to change code; it is a reason not to treat
3 inches as established. Q-005 puts it to Beth.

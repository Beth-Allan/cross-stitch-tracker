# Threads — brands, skeins, strands

Everything the app's thread and skein maths rests on. **This file used to carry the project's
worst open question** (THR-005): the skein calculator uses one skein length for every brand, and
that is wrong for at least three brands Beth buys. **She answered it on 2026-10-25** (THR-007–THR-011);
the app keeps using the one length until item F-16 ships. Her Kreinik lines, how Kreinik numbers
its colours, and the length she cuts followed on 2026-10-29 (THR-012–THR-017).

Seeded 2026-08-16 (overhaul step 5) from `CROSS_STITCH_TRACKER_PLAN.md` §3 and from the constants
already encoded in `src/lib/utils/skein-calculator.ts`.

---

### THR-001 — Floss / thread

The embroidery thread used for stitching. Tracked by brand, colour code and colour family.

[from the project plan 2026-08-16 — CROSS_STITCH_TRACKER_PLAN.md §3, not re-confirmed]

### THR-002 — Skein

The standard unit in which embroidery thread is sold. The plan's wording is that **projects**
specify how many skeins of each colour are needed — which matters, because VOC-001 makes chart and
project different things and this is the project's number, not the design's.

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

_Beth's own list of the thread brands she buys, 2026-10-25: **THR-007**. Mill Hill's bead types
and numbering, in her words: `beads.md`._

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

_Answered by Beth 2026-10-25: DMC and Anchor are 8 m (**THR-008**), Weeks Dye Works and Gentle Art
5 yd (**THR-009**), Kreinik by thread type and used whole (**THR-010**), and every other brand's
length is hers to enter (**THR-011**, D-34). So the app's 8 m is right for DMC and Anchor, wrong
for Weeks Dye Works, Gentle Art and Kreinik, and unconfirmed for every other brand. This fact keeps
describing the app until item F-16 lands._

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

_Beth's own cut, 2026-10-29: about 24 inches of floss and 15 of Kreinik, about 3 lost from each
(**THR-016**). The 18-inch cut behind the 255 is the cited source's habit, not hers. The app keeps
it through F-16a and switches in item F-19 (D-44). This fact keeps describing the app until then._

### THR-007 — The thread brands Beth buys

**DMC, Anchor, Weeks Dye Works, The Gentle Art, Kreinik, Rainbow Gallery, Classic Colorworks, The
Caron Collection, Gloriana and Au Ver à Soie** — "and probably others as well", in her words. The
list is open-ended, so nothing in the app may treat it as a closed set (THR-011).

[stated by Beth 2026-10-25]

### THR-008 — A DMC or Anchor skein is 8 m (8.7 yd) of six-strand floss

The length the skein calculator already assumes (THR-005, THR-006) is right for both brands. Put
to her as "DMC and Anchor are both 8 m / 8.7 yd, six strands"; she answered "right for both".

[stated by Beth 2026-10-25]

### THR-009 — A Weeks Dye Works or Gentle Art skein is 5 yards of six-strand floss

5 yd is 180 in (4.57 m), against a DMC skein's 313 in. The old backlog's 5 yd figure, now hers.
Put to her as "both brands are 5-yard skeins of six-strand floss"; she chose it.

_The session's arithmetic, not Beth's words:_ the app currently credits each of these skeins with
about 1.7 times the thread it holds, so it shows **roughly 58% of the skeins a project actually
needs** — a shopping list built from it runs short.

[stated by Beth 2026-10-25]

### THR-010 — Kreinik's length depends on the thread type, and it is used whole

- **#4 braid** — 11 m
- **#8 braid** — 10 m
- **blending filament** — 50 m

Kreinik is **used whole, never split**: one strand at its full length, unlike floss (THR-004). She
wants the app to work it out, choosing "work out spools needed, treating the thread as one strand at
its full length" over entering the count herself.

_The session's reading, not Beth's words:_ the length belongs to the **thread line**, not only to
the brand, and the formula's strand term (THR-006) cannot treat Kreinik as six strands to divide.
Whether any other thread she buys is used whole is not recorded (Q-009).

[stated by Beth 2026-10-25]

_2026-10-29: every Kreinik line is used whole (**THR-013**), and her names for the three lines are
**THR-012**._

### THR-011 — Skein length varies by brand and line; the rest are Beth's to enter

Lengths differ by brand (THR-008, THR-009) and, for some brands, by thread line (THR-010). For every
other brand or line she buys (THR-007), including any Kreinik line beyond the three in THR-010,
**no length is recorded and none may be assumed**. Her ruling D-34:
the app asks her for the length when she sets up a brand or thread line, and one without a length
shows its skein count as **unknown**, never a figure worked out from a guessed length.

[stated by Beth 2026-10-25]

### THR-012 — The Kreinik lines Beth uses, and what she calls them

In her words: "I mainly use blending filament and braid #4. However, a few projects also need more
of the specialty items - some of the ribbons, some braid #8, etc." She wrote them as Kreinik names
them — "Kreinik Very Fine #4 Braid", "Kreinik Fine #8 Braid" — and chose those full names for the
app: **Blending Filament**, **Very Fine #4 Braid**, **Fine #8 Braid**.

Her figure for Fine #8 Braid is "10 metres (11 yards)", agreeing with THR-010. She does not know
the length of any Kreinik line beyond the three in THR-010, and named no ribbon width. Asked next
which other sizes her projects have needed (1/16″, 1/8″, 1/4″ ribbon), she chose "None of these" —
a question put as an add-on to which threads get colour lists, so it records no more colour lists,
not that she never uses ribbon.

[stated by Beth 2026-10-29]

### THR-013 — Every Kreinik line is used whole

"Kreinik is used whole, no splitting, for all their lines." THR-010 said it of three lines; this
extends it to every line Kreinik makes, so a Kreinik line added later is never divided into
strands.

[stated by Beth 2026-10-29]

### THR-014 — One Kreinik colour number is one colour in every size

002 Gold is the same gold in Blending Filament and in Very Fine #4 Braid. Put to her from Kreinik's
own chart ("Some colors come in more than one size") as a question about the Kreinik she owns; she
answered "Yes, same colour".

[stated by Beth 2026-10-29]

### THR-015 — A Kreinik finish letter is part of the colour number

The chart prints some colours with letters after the number — 002HL Gold Hi Lustre, 001L Solar
Silver, 001J Silver Japan. Put to her as "Is the letter part of the colour number, the way you'd
read it off the spool? In other words, are 002 and 002HL two different colours you'd search for
separately?"; she answered "Yes, part of the number".

[stated by Beth 2026-10-29]

### THR-016 — The length Beth cuts, and what each length loses

- **Floss:** "I cut about 24" lengths usually but I don't really measure. 3" lost is reasonable,
  if generous." So about **21 inches** of each length is stitched.
- **Kreinik:** "I cut kreinik much shorter - 12-18"", losing about 3 inches as floss does. Asked
  which figure the app should use, she chose **15 inches**, the middle — so about **12 inches** is
  stitched.

This replaces the cited source's 18-inch cut with 15 usable inches (THR-006) as the figure that
describes her stitching. The app keeps the old figure until item F-19, by her ruling D-44.

_The session's arithmetic, not Beth's words_ (whole cuts, as F-16a reads THR-006): an 8 m skein
gives 13 cuts → **273** usable inches (at 18-inch cuts: 255); a 5 yd skein 7 cuts → **147**
(150); Very Fine #4 Braid, 11 m, 28 cuts → **336** (360); Fine #8 Braid, 10 m, 26 cuts → **312**
(315); Blending Filament, 50 m, 131 cuts → **1572** (1635). The bracketed figures are F-16a's; the
app today uses 255 for every brand.

[stated by Beth 2026-10-29]

### THR-017 — Beth goes by number for Anchor

Asked whether she goes by number or name when she buys or stitches with Anchor, she chose "Number
only", which the option described as "I find Anchor colours by number. Names are a nice extra at
most."

[stated by Beth 2026-10-29]

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

### 2026-10-25 · the catalogue loader's folder joins the review-gated paths? — raised by `/plan-feature thread catalogues`; C-1 puts it to Beth when it opens

**What needs a ruling.** Stage C's loader (`build-plan.md` §Stage C, item C-1) is deploy-time code:
it runs after `migrate deploy` on every Vercel build and inserts catalogue rows into that
environment's database. It is the same kind of code as the deploy step Beth gated in **D-38**, but
it would live in its own folder (proposed `prisma/catalogues/`), which no line in
`.claude/hooks/review-gated-paths.txt` matches. The fixtures it reads (`prisma/fixtures/`) are data.

**The question, as C-1 will put it:** gate the loader's folder (so a change to how production data
is written always gets a fresh `/review`) **and not** the fixtures folder (so C-2 and C-3, which add
a data file and tests, stay ungated and merge on her word after a preview). The alternative is to
gate neither and rely on C-1's review alone. A gate-list change is hers (hard rule 6).
**Recommendation:** gate the folder, not the data.

**Until ruled:** C-1 records her answer here (moving this row to Ruled as D-45 or later) before
its branch opens; the path file and protocol §5 change in C-1's PR if she says yes.

## Also open — the question known to be coming

_(This section is empty. The question that used to sit here — fabric matching for a project with
no assigned fabric — was **answered by Beth on 2026-08-17 inside P7** and is recorded as
**FAB-006** in `docs/domain/fabric.md`. The other question that used to sit here — block/warn/allow
on over-logging — was ruled **warn but allow** at the 2026-08-17 `/cleanup`; see Ruled below.)_

## Ruled

### 2026-10-29 · D-44 · Beth's cut length contradicts the skein formula's 18-inch cut — fixed in its own item after F-16a — ruled during `/stitch-fact`

**What contradicts what.** THR-006's 255, and every figure F-16a's trap ⑪ pins, rests on the cited
source's 18-inch cut with 15 inches stitched. Asked Q-008, Beth said she cuts about 24 inches of
floss and loses about 3 ("reasonable, if generous"), and cuts Kreinik "much shorter - 12-18"", also
losing about 3 (THR-016). A domain fact that contradicts a calculator constant is drift plus a fix
item (protocol §7).

**Surfaced to Beth**, with the effect in plain figures: switching makes a DMC or Anchor skein about
7% more useful (the app tells her to buy slightly more than she needs), a Weeks Dye Works or Gentle
Art skein about 2% less, and Kreinik about 5% more. **That Kreinik figure was wrong.** It was put
to her before she said she cuts Kreinik shorter, and with her cut the app's Kreinik figures are up
to about 10% short. She was told so in-session, before the two Kreinik questions below. Options:
"Small item after F-16a (Recommended)" — F-16a keeps 18 inches, so "DMC numbers unchanged" still
proves its rebuild broke nothing; a follow-up then switches, seen before and after on a preview ·
"Inside F-16a" · "Leave it at 18 inches". Then, for that item, Kreinik's figure from her 12–18 inch
range: "15 inches, the middle (Recommended)" · "12 inches, the short end" · "18 inches, the long
end"; and Kreinik's loss: "About 3 inches too" · "Less than 3" · "More than 3" · "Not sure".

**Her rulings:** ① **"Small item after F-16a (Recommended)"**. ② **"15 inches, the middle
(Recommended)"**. ③ **"About 3 inches too"**.

**What it changed.** New item **F-19** in `build-plan.md` Stage F (gated: the skein calculator),
queued straight after `/review F-16a` with its own review, then R-3. **F-16a is unchanged in
substance:** it builds on 18/15 on purpose and cites THR-016 as the figure F-19 adopts; the figures
its trap ⑪ pins are F-19's to change, by this ruling. Q-008 struck. F-19 opens by putting the
saved-needs question to her, since D-40 ③'s correction reasons about a cut change as it did about
a length change. Whether a thread line beyond floss and Kreinik takes either cut is not recorded;
that joins Q-009. `/review F-19` is now the third gated review, so the CodeRabbit trial's third
run and its tally move there from `/review C-1` (protocol §5: whichever gated review runs third).

### 2026-10-29 · D-43 · the catalogue facts: two Kreinik lines get colour lists, Kreinik's full names, discontinued colours loaded and marked, the mark planned before the loader — ruled during `/stitch-fact`

**What needed a ruling.** Stage C's `/stitch-fact` row (D-42) asked which Kreinik lines Beth uses,
what she calls them, and what happens to the colours Kreinik's chart marks discontinued. Her answers
about Kreinik itself are facts (THR-012–THR-015); what she decided for the app is recorded here.
She raised one of them herself: "I don't know if those should be added manually? Or if all the
lines should be added in preparation for maybe eventually opening things up to multiple users?"

**Surfaced to Beth**, option labels as she saw them. The multi-user point was answered inside the
first question: the app is built for her alone, opening it to others would be its own project, and
adding Kreinik sizes then is a small job.

1. **Which Kreinik threads get a colour list:** "The ones I use (Recommended)" — Blending Filament,
   Very Fine #4 and Fine #8 braid, plus any ticked next · "Every size on the chart" — all ten, with
   001 Silver showing up to nine times in a search · "Only filament and #4" — #8, ribbons and the
   rest typed in by hand when a project needs them.
2. **Other sizes her projects have needed** (pick any): 1/16″, 1/8″, 1/4″ ribbon · "None of these".
3. **Names:** "Kreinik's full names (Recommended)" — Very Fine #4 Braid, Fine #8 Braid, Blending
   Filament · "Short names" — #4 Braid, #8 Braid.
4. **Discontinued colours:** "Load them (Recommended)" — a list kept with the catalogue, no mark on
   screen · "Leave them out".
5. **On her answer to 4, where the mark is planned:** "Plan it before the loader (Recommended)" — a
   short `/plan-feature` (the mark, Kreinik's suggested substitutes, DMC's discontinued colours)
   before C-1, so the mark's field joins C-1's database change rather than needing its own review ·
   "Plan it after Kreinik loads" · "Load them unmarked for now".

**Her rulings:** ① **"Only filament and #4"**, against the recommendation. ② "None of these". ③
"Kreinik's full names (Recommended)". ④ In her own words, neither option: "Load them, but we should
find a way to visually identify them so I know they'll be hard to find and can find a substitute.
By the way, we didn't load the DMC discontinued/hard to find threads and we should probably queue
that at some point too." ⑤ "Plan it before the loader (Recommended)".

**What it changed.** **F-16a** still creates the three Kreinik lines D-40 ⑤ set up, now named
**"Blending Filament"**, **"Very Fine #4 Braid"** and **"Fine #8 Braid"** (THR-012). Those exact
strings are what C-1b's fixture must match. It creates **no other Kreinik line**: the ribbon D-40
mentioned is hers to add when a project needs one (F-16b), length unknown (THR-011). **C-1b** loads
colours into Blending Filament and Very Fine #4 Braid only. Fine #8 Braid exists with its length
but no catalogue, so she types its colours. **Discontinued colours load, marked.** The plan had no
field or screen for that, so a new queue row, `/plan-feature discontinued colours`, sits before C-1.
It plans the mark, whether Kreinik's "Discontinued colors & suggested substitutions" table is
shown, and her DMC wish (no source for DMC's discontinued colours has been looked for yet). It
re-briefs C-1 if the mark needs a column in C-1's migration. Until it lands, C-1b's rule for
discontinued colours is "loaded and marked, as that plan says". The DMC wish sits in `backlog.md`
until that session takes it.

### 2026-10-25 · D-42 · the supply catalogues: three makers, Kreinik first after F-16a, no stand-in swatches, the whole Mill Hill sheet — ruled during `/plan-feature thread catalogues`

**What needed a ruling.** D-41 sent the catalogue wish to a planning session before F-16a. Beth
opened it with "Let's work on /plan-feature thread catalogues" and added, mid-session: "and we
should build in bead catalogues to the plan too since they're related." Four decisions were hers:
which makers, the order (D-41 said the order comes back to her if a catalogue has to follow F-16a —
and Kreinik does, because a Kreinik colour belongs to a size and the sizes are F-16a's thread
lines), what a colour shows when its maker publishes no colour value, and whether Mill Hill loads
whole. The session found and checked the sources first: Kreinik's official chart (names every
colour, says one number spans its sizes, gives no values; the session read only its first page and missed the per-size availability matrix on page 2 — caught at layer-1 review, see below); Wichelt's
official Mill Hill inventory sheet (~500 beads, twelve lines, codes and names, dated 2010, no
values); for Anchor no official list online, and a dataset (no licence file; "ISC" in its `package.json`) reconciled from Anchor's
colour card with eight doubtful colours tagged. Sources and what each lacks are tabled in
`build-plan.md` §Stage C.

**Surfaced to Beth** in one round; option labels as she saw them.

1. **Catalogues** (pick any): "Kreinik (Recommended)" · "Mill Hill beads (Recommended)" · "Anchor
   (Recommended)" · "Hand-dyed brands later" (Weeks Dye Works, Gentle Art, Classic Colorworks and the
   rest: a second planning session).
2. **Build order:** "Kreinik first (Recommended)" — F-16a, its review, then the loader with Kreinik
   (one review), then Mill Hill and Anchor as data with previews, then F-16b · "Beads first" — the
   loader with Mill Hill now, F-16a, Kreinik with the loader extended (a second review) · "Everything
   after F-16b".
3. **Swatches** where the maker gives no value: "No swatch (Recommended)" · "Read off Kreinik's
   chart" (a script reads an approximate colour from each photographed swatch; beads still none) ·
   "Borrow the nearest DMC" (via the Mill Hill–DMC conversion chart).
4. **Mill Hill:** "The whole sheet (Recommended)" · "Only the lines I use".

**Her rulings:** ① **Kreinik, Mill Hill beads, Anchor, and "Hand-dyed brands later"** — all four
chosen. ② **"Kreinik first (Recommended)".** ③ **"No swatch (Recommended)".** ④ **"The whole sheet
(Recommended)".**

**What it changed.** **Stage C** in `build-plan.md`: C-1 (the loader + Kreinik; gated), C-2 (Mill
Hill), C-3 (Anchor), C-4 (hand-dyed, not briefed). The queue: a `/stitch-fact` row heads it (the
Kreinik lines Beth uses and their names; the cited-source facts the briefs lean on), then F-16a,
its review, R-3, C-1, its review, C-1b, C-2, C-3, then **F-16b, which now follows C-3** — the session's
reading of ruling ②'s option text, which placed the brand form last. **F-16a and F-16b re-briefed**
(D-41 allowed it; the catalogue plan's version wins): every thread belongs to a line with
uniqueness per line and code; F-16a creates every Kreinik line Beth names, length unknown where
she gave none; the line-in-the-label and the two stale Kreinik texts moved from F-16b to C-1.
**Ruling ③ reaches Anchor too:** the dataset's RGB are its own "screen approximations", not a
maker's value, so Anchor loads without swatches as well; the declined options are in `backlog.md`
as a later `/tweak`. **Ruling ④'s consequence:** "Royal Blue" is seven Mill Hill beads, so a bead
gets a line (a text column, C-1) shown in its label. **The mechanism was the session's call, not
hers, recorded here so it is on the record:** a catalogue is a fixture applied at deploy, missing
rows only, by one gated loader that never creates a brand or a line and never fails a build (it
skips a catalogue it cannot place, with a log line) — not a migration per catalogue, which would
cost a `/review` each and could jam deploys (D-37). The CodeRabbit trial's third review moves from `/review F-17` to
`/review C-1` (protocol §5: whichever gated review runs third). One gate-list question is open above.
**Layer-1 review of PR #146 then corrected the plan in three places:** the deploy step writes rows
while the outgoing code still serves (`INTEGRATIONS.md`), so the first rows with no swatch must land
one deploy after the code that shows them — the Kreinik data split off C-1 into **C-1b**, and
"Kreinik first" means C-1 then C-1b, five sessions from here rather than the four the option text
said (the order itself is unchanged); the Kreinik chart's second page is a per-size availability
matrix, so each line loads exactly the colours the chart marks for that size and the over-inclusion
the session had described to Beth as forced never was; and the Anchor dataset has no licence file
(a one-word `package.json` field only), so C-3 opens by putting the basis to her. **D-42 ③ departs
from `CROSS_STITCH_TRACKER_PLAN.md` §4.2**, which gives each thread and bead a swatch ("hex value or
image"); the plan line stays as written, as D-35 and D-40 left theirs.

### 2026-10-25 · D-41 · the thread catalogues are planned before F-16 is built — ruled during `/work-item F-16`

**What needed a ruling.** Answering D-40's Kreinik question (round 1), Beth asked: "Should the first
step in this be populating the database with the kreinik stock first? We wanted to bulk add these
large thread/specialty thread catalogues, right?" They are in her plan, but only as a future idea:
`CROSS_STITCH_TRACKER_PLAN.md` §9 ("Additional supply brand pre-seeding: Mill Hill bead catalog,
Kreinik catalog, Anchor thread catalog — pre-seeded like DMC if catalog data is available") and the
source question in §10 item 4. Neither the build plan nor the backlog carried them.

**Surfaced to Beth** (round 2, alongside D-40 ⑤), with three reasons for building F-16 first: a
Kreinik catalogue needs F-16's lines to load into ("today the app would refuse 'Kreinik 001' twice,
so #4 braid 001 and #8 braid 001 can't both exist yet" — **that example assumed Kreinik reuses colour
numbers across lines, which is not a recorded fact**; trap ② of F-16 sends it to `/stitch-fact` if
the build needs it); a catalogue needs a trustworthy source for codes, names and swatch colours,
which §10 left open; and F-16 fixes figures that go wrong the day she adds a non-DMC thread. Options:
"Plan it right after F-16 (Recommended)" · "Plan it after the current queue" · "Catalogue first,
before F-16" ("Plan it now and build F-16 after. The catalogue would have to wait for, or include,
the thread-line change anyway.").

**Her ruling: "Catalogue first, before F-16".**

**What it changed.** A `/plan-feature` session for the catalogues (Fable lane) is the queue's top
row, ahead of F-16a — superseding D-36's "Right after R-2" for F-16. **The build order is still
hers:** she voted for the catalogue first, so if planning finds the catalogue build has to follow
F-16a (it needs the thread lines), that session puts the order back to her rather than leaving
F-16a where this session queued it. It may re-brief F-16a and F-16b; its version wins. The wish is
in `backlog.md` (Feature wishes) in Beth's words.

### 2026-10-25 · D-40 · F-16's opening answers — split in two, Kreinik as one brand with lines, only changed lengths recomputed, "unknown" never counts as in hand — ruled during `/work-item F-16`

**What needed a ruling.** F-16's done-when opens with Beth's answers to traps ⑧ (Kreinik may not be
a thread in the app) and ⑨ (stored figures do not move by themselves), and the session's size check
fired. Before asking, the session read the Neon `preview` branch (a copy of production's data as of
2026-08-17, plus whatever preview deployments have written since), read-only: **every thread is
DMC** — the brands are DMC (496 colours), "Custom (Thread)" (none) and Mill Hill (no beads), and
all 643 project thread lines are DMC, 5 of them overridden by hand. There is no Kreinik anywhere, as
thread or specialty, so trap ⑧'s move has nothing to move. Production since August was not visible.

**Surfaced to Beth** in two rounds; option labels as she saw them.

Round 1:

1. **Split** F-16 into F-16a, "the right numbers" (the database change, the calculator using each
   brand's own length, "unknown" wherever a skein count appears; gated, fresh review), and F-16b,
   "the brand form" ("a box on each thread brand where you type its skein length and whether it's
   split into strands or used whole"; preview, live on her word): "Split in two (Recommended)" ·
   "Keep it as one item".
2. **Kreinik**: "One brand per line (Recommended)" (three brands, simplest to build) · "One Kreinik
   brand with lines inside" ("noticeably more to build and review") · "Keep it a specialty item".
3. **Saved needs** not typed by hand: "Recompute them (Recommended)" — described as every saved need
   not typed by hand worked out again from its brand's own length, a brand with no length showing
   "unknown", and "DMC numbers come out identical" · "Leave them alone".
4. **An unknown need** in the shopping list and the kitting percentage: "As not yet in hand
   (Recommended)" — it stays on the shopping list marked unknown, and the project cannot read 100%
   kitted until the length is set or the need typed · "Left out until known".

Round 2 (with D-41's question): 5. **Set-up** — add Anchor (8 m), Weeks Dye Works (5 yd), The
Gentle Art (5 yd) and Kreinik with its #4 braid (11 m), #8 braid (10 m) and blending filament (50 m)
lines, none of them in the app yet: "Add them, lengths filled in (Recommended)" · "Only fill in DMC".

**Her rulings:** ① "Split in two (Recommended)". ② **One Kreinik brand with lines inside**, against
the recommendation: "I think option 2 is the best option - not being able to tease out Kreinik (the
brand) from its properties (#4, #8, blending filament, ribbon, etc) seems like a problem?" ③
"Recompute them (Recommended)". ④ "As not yet in hand (Recommended)". ⑤ "Add them, lengths filled
in (Recommended)".

**Correction to ③, the same session.** PR #145's layer-1 review found the premise false: a saved
need was worked out with the project's settings at the time, and before F-7 (2026-10-24) the chart
form saved none of them, so recomputing from today's settings could move DMC figures — or, where the
stored setting is the wrong one, make them wrong. Put back to her: "Only lines whose length changed
(Recommended)" · "Every line, DMC included" · "Count first, then decide". **Her ruling: "Only lines
whose length changed (Recommended)"** — recompute only threads whose line is not an 8 m six-strand
skein, or has no length or strand structure; DMC and Anchor rows stay exactly as saved. The stale
settings themselves are a maintenance-ledger row (2026-10-25).

**What it changed.** F-16 is re-briefed as **F-16a** and **F-16b** in `build-plan.md`. Kreinik is
a thread, so `calculateSkeins` reaches it, and a **thread line** joins the schema, carrying a length
and a strand structure. This **withdraws the product spec's "Kreinik is most common"** under
Specialty Item Database (`CROSS_STITCH_TRACKER_PLAN.md` §4.2) as the place Kreinik
goes — the plan line stays as written, as D-35 left its lines. Her "ribbon" names a Kreinik line
THR-010 does not give a length for: under THR-011 it reads unknown until she enters one (F-16b), and
it is not a domain fact until `/stitch-fact` records it. Ruling ④ also bears on F-18's trap ③c: a
line whose need is unknown is not in hand; how much of a line it counts for is F-18's to put to her.
R-3 sits after `/review F-16a`, the session's reading of D-39 ("after F-16 — the first change that
will add a migration"), since F-16a carries that migration.

### 2026-10-25 · D-39 · a check that the migrations add up to the schema — ruled during R-2

**What needed a ruling.** PR #142's layer-1 checklist pass found the gap R-2 opens: once deploys
apply migrations, nothing checks that `prisma/migrations/` builds exactly what `schema.prisma`
describes. A schema edit with no migration would pass every gate, merge, and leave production's code
asking for a column the database does not have. Adding a check is a gate-config change (hard rule 6).

**Surfaced to Beth** in-session: queue it as a small item, placed after F-16 — the first change that
will add a migration (recommended) · park it for `/cleanup` · no new check (review alone).

**Her ruling: "Queue it as a small item (Recommended)".** New item **R-3** (`build-plan.md`
Stage R), queued after `/review F-16`.

### 2026-10-25 · D-38 · the deploy-time migration path is review-gated — ruled during R-2

**What needed a ruling.** R-2 added three files that decide what happens to a database on every
deploy — `vercel.json` (the build command), `prisma/migrate-deploy.ts` (the step that migrates) and
`src/lib/utils/migration-baseline.ts` (which migrations are recorded as applied **without running**).
`prisma/migrations/` was gated; these were not, because they were new — the staleness D-22 names.
A wrong line in them could mark a migration done on production without doing it. Changing the gated
list is a gate-config change (hard rule 6).

**Surfaced to Beth** in-session: add the three to the list (recommended — one extra review whenever
one changes, which should be rare) · leave the list as it is.

**Her ruling: "Add them to the list (Recommended)".** `.claude/hooks/review-gated-paths.txt` and
protocol §5 now name all three, plus the `build:deploy` line of `package.json` — reviewed as if
gated, since gating `package.json` whole would be too broad.

**Extended the same day.** PR #142's layer-1 review found a fourth file on the path: `prisma.config.ts`
picks the database every deploy-time Prisma command uses, so an unreviewed edit could point them
somewhere other than the address the runner checks. Surfaced as its own gate change; **her ruling:
"Add it too (Recommended)"**. It is on the list and in protocol §5.

### 2026-10-25 · D-37 · a session gets the preview copy's database key, never production's — ruled during R-2

**What needed a ruling.** R-2's brief (trap ③) says reaching Neon needs "a credential from Beth's
dashboard" without saying which database's; D-16 says Claude never holds credentials to the live
site. Recording the baseline ("this database is already up to date, start counting here") has to
happen once on each database, so either a session holds production's key for that one step, or the
deploy does it.

**Surfaced to Beth** in-session: the preview copy's key only — the session checks and prepares
everything on the copy, and the first deploy after the merge records the baseline on production
itself, only if Prisma confirms the database matches exactly, otherwise stopping with the live site
untouched; the same code runs first on the copy through the PR's own preview (recommended) · the
real database's key too, this once — the standard by-hand procedure, but production's key would sit
in the conversation record, and making it useless again means a password reset plus two Vercel
settings.

**Her ruling: "Preview copy only (Recommended)".** D-16 stands whole. The key is kept on Beth's
machine in the gitignored `.env.preview-db.local`. **What it changed:** the baseline is recorded by
`prisma/migrate-deploy.ts`, not by hand; and recovering a migration that fails **on production**
needs a key no session holds, so that case is a stop-and-ask for Beth (`docs/INTEGRATIONS.md`,
Migrations).

### 2026-10-25 · D-36 · today's answers contradict the app in five places — three fix items, placed by Beth — ruled during `/stitch-fact`

**What happened.** Every answer Beth gave this session was checked against the code. Five disagree
with what the app does today: ① one 8 m skein for every brand (THR-005 against THR-008–THR-011);
② "this week" counts from Sunday while the weekly displays start on Monday (SES-001); ③ the server
refuses a session date the logging box offered when she is ahead of Edmonton (SES-002); ④ the
dashboards, session picker and completion estimates read 0% for a chart with no stitch count, where
the gallery uses width × height (SES-003); ⑤ the kitting percentage counts skeins, not lines
(KIT-005). A fact contradicting a baked-in constant is drift plus a fix item, not a doc edit
(protocol §7). The sixth answer, KIT-006, matches the app as it is (D-35).

**Surfaced to Beth** as three items and where to put them: the skein fix needs R-2's migration
pipeline, so straight after R-2's review (recommended, the only one fixing numbers she sees wrong
today), after the gated run, or at the end; the two smaller fixes after the skein fix (recommended),
before her visual bugs, or at the end.

The kitting question carried the session's recommendation and its reason — "the fabric is usually
the biggest purchase and shouldn't weigh the same as one skein" — which is the session's reasoning,
not a fact of Beth's, so it is recorded here rather than in KIT-005.

**Her ruling:** "Right after R-2" and "After the skein fix".

**What it changed.** Items **F-16** (per-brand skein length, gated — schema and skein calculator),
**F-17** (the stitching calendar and the progress total, gated — the stats layer) and **F-18**
(kitting counts each line once, ungated) are briefed in `docs/process/build-plan.md` and queued in
that order after `/review R-2`. **The CodeRabbit trial follows protocol §5** — three gated reviews in
which it ran, whatever the queue order — so with this order its three are `/review R-2`,
`/review F-16` and `/review F-17`. The placement question told Beth the trial "stays on the three
changes it names (R-2, P9c, F-9)"; that was the session's error, not her ruling, caught by this PR's
layer-1 review and corrected with her told.

### 2026-10-25 · D-35 · "Kitted" is a status Beth sets — KIT-001 corrected — ruled during `/stitch-fact`

**What happened.** KIT-001, seeded from the plan, says kitted "is calculated, never stored — the app
derives it … rather than letting anyone tick a 'kitted' box". The app has never done that: Kitted is
one of the project statuses Beth picks from a list, and the kitting percentage looks only at supplies
and fabric (conditions 4–7), not at the other five. A seeded domain fact contradicting the schema — and
the product spec asks for the calculation outright: `CROSS_STITCH_TRACKER_PLAN.md` §Status System
("the app should be able to determine this automatically based on whether all kitting conditions are
met") and its feature list ("'Kitted' status auto-calculation based on supply completeness + other
conditions").

**Surfaced to Beth** as: keep it hers to set, with the percentage as a guide (recommended); the app
moves the status itself when every condition is met (a bigger build); or the app suggests and she
confirms.

**Her ruling:** "I set it myself."

**What it changed.** Recorded as **KIT-006**; KIT-001 keeps its ID with a correction note pointing
at it, and its nine conditions stay open under Q-004. **It withdraws the plan's two auto-calculation
lines quoted above** — a later `/plan-feature` must not rebuild Kitted as a calculated status from
them. The plan's "80% kitted — still needs 3 DMC colors and fabric" feedback is the kitting
percentage and stands, as the guide KIT-006 names. No code changes: the app already works this way.
The backlog's auto-status wish carries a pointer.

### 2026-10-25 · D-34 · a skein length comes from Beth, brand by brand, when she sets a brand up — ruled during `/stitch-fact`

**What happened.** Answering Q-001, Beth gave lengths for five brands (THR-008–THR-010) and named
five more she buys, "and probably others as well" (THR-007). Kreinik's length depends on the thread
type, so a length per brand alone cannot hold it. The per-brand build needed to know where every
other length would come from.

**Surfaced to Beth** as: the app asks her for a length when she sets up a brand or thread line, and
one without a length shows its skein count as unknown, never a guess (recommended: a new brand
never needs a developer); or she gives a fixed list in a later `/stitch-fact`, with any brand not on
it needing another session.

**Her ruling:** "App asks me."

**What it changed.** Recorded as **THR-011**; built by **F-16**, whose brief has the migration fill
in only the lengths she stated (THR-008–THR-010).

### 2026-10-25 · D-33 · CodeRabbit gets a three-review trial on gated pull requests — ruled in its own session

**What needed a ruling.** D-27 left CodeRabbit for a session of its own: it ran on every PR,
unconfigured, and nothing in the process mentioned it. The record shows it reviewed **one PR of
roughly a hundred**, #50 in May. On the others it hit the free plan's hourly limit (May) or, from
August on, skipped: its plan reviews a public repository under 10 stars only when asked (this one
has none), yet its check still reads "pass". On #50 it posted 20 findings. Three were real bugs, all
fixed at the time: two places in the designer and genre lists where a screen reader could read out
the wrong label, and a cover preview that stayed hidden after one failed load. The other seventeen
were formatting notes on planning files since archived. Its free plan needs the repository to stay
public, which it is today.

**Surfaced to Beth** as three options: a trial on the gated changes only (recommended, since a
different vendor's reviewer has different blind spots, and the gated cores are where a miss costs
most); switch it off; or a review of every PR (not recommended: minutes of waiting in every session,
when every PR already gets two automatic reviews).

**Her ruling:** "Trial on risky changes (Recommended)", on the terms put to her: Claude asks it to
review the gated pull requests during the Fable `/review`, with settings that carry the house rules.
After the next three (R-2, P9c, F-9) the record is judged, and if it caught nothing the other
reviews missed, it is switched off. No extra work for Beth.

**What it changed.** `.coderabbit.yaml` is new: automatic review stays off even if the repository
gains stars; every feature that would commit to a branch (auto-fix, generated tests, generated
docstrings) is off, though the app itself keeps the access GitHub gave it; it cannot approve a pull
request; and it reads CLAUDE.md, `.claude/rules/`, the conventions doc, the security checklist and
`docs/domain/` as its review criteria. Protocol §5 has the trial steps inside the `/review` flow,
the `/review` skill points at them, and the tally table is a note in `notes.md`. Two terms were
settled in this PR's own review: a review in which CodeRabbit did not run does not count toward the
three (two in a row go to Beth), and switching off means removing the app first, the settings file
only after.

### 2026-10-25 · D-32 · a chart carries at most 50 genres — ruled during M-2

**What happened.** The M-1 layer-1 review found `chartFormSchema.genreIds` had no upper limit
(maintenance-ledger row 2026-10-24) — the exact shape of the zod advisory M-2 clears. It called
`genreIds` the only such collection; M-2's own review found a second, `fileKeys` (ledger row
2026-10-25, its cap still Beth's to set). The ledger row said the cap "should come from Beth, not a guess" and named M-2
as the place to ask.

**Surfaced to Beth** as: a limit of 50 (recommended, far above any real tagging); a limit of 20; no
limit, recorded as her choice; or decide at the next `/cleanup`.

**Her ruling:** "Limit of 50 (Recommended)". A 51st genre is refused with "A chart can have at most
50 genres": the schema carries the cap, and the chart form's own message table names it, so the
form says that rather than its generic "This field has an error". Built test-first in M-2.

### 2026-10-24 · D-31 · the closed row's quick size look: 14, 18, 25 over 1 · 28, 32, 36 over 2 — ruled during the one-count-list `/tweak`

**What happened.** Making the size reference read the shared ten (D-29) left one more count list
in the same screen: a closed project row on Pattern Dive → Fabric Requirements shows a quick size
look at **14, 18 and 25**, a choice from the original design, never from Beth. Since F-4 (D-17)
that look applied the project's own over-count, so an over-two project showed 14 count as if it
were 7.

**Surfaced to Beth** as: keep 14, 18 and 25, tied to the list of ten (recommended); three
different counts; or remove the quick look.

**Her first answer:** "Keep 14, 18, 25 — but all three should always be over 1." Built that way,
both layer-1 reviewers then flagged the same side effect: on a row marked "stitched over 2" the
unlabelled over-1 sizes read as what the project needs (about 14" × 21" short for a 200 × 300
design at 14 count), and could disagree with the row's own "Fabric too small" badge. Put back to
her with that example, she said the always-over-1 was not what she meant — _"You're right that the
always over 1 is weird when they're specifically marked over two."_ — and chose from: over-2 rows
show three over-2 counts (recommended); 14, 18, 25 at each project's own over-count (as before);
or always over 1 with a note.

**Her ruling:** over-1 rows show **14, 18, 25**; over-2 rows show **28, 32, 36**, each sized at
the project's own over-count — so the quick look always agrees with the fit badge and D-17's fix
stands everywhere. These six are her display choice, not a fact about which counts are stitched
over two (that is still Q-002). The test that pinned the old behaviour ("sizes an over-two project
at the effective count in the row summary") was replaced, not deleted: it now asserts the 28, 32,
36 labels and their over-2 sizes. Her ruling is the approval on the record (hard rule 2).

### 2026-10-24 · D-30 · picking a fabric on the Supplies tab attaches it — ruled during a `/broken`

**What happened.** On F-7's preview Beth picked a fabric in a project's Supplies-tab calculator
and believed it was attached. It was not: the picker there only changed the figures on screen
and was gone on reload, while the identical picker on the new-chart screen attaches the fabric
on Create. Neither the product spec nor DesignOS says which the Supplies tab should do — a gap.

**Surfaced to Beth** as: attach it, like the new-chart screen (recommended); keep it a labelled
preview that saves nothing; or remove the picker there.

**Her ruling:** attach it. Choosing a fabric links that piece to the project, clearing it returns
the piece to the stash; trying a different count without attaching stays possible through the
COUNT box.

### 2026-10-24 · D-29 · one list of fabric counts, the same ten everywhere — ruled during F-7

**What happened.** Checking F-7's preview, Beth opened Pattern Dive → Fabric Requirements and found
the size reference stops at 28 count. The app holds **two** count lists: `FABRIC_COUNTS` in
`src/types/fabric.ts` (14, 16, 18, 20, 22, 25, 28, 32, 36, 40 — the fabric picker) and a private
copy in `fabric-requirements-tab.tsx` that ends at 28, written in phase 08 before over-count
reached fabric sizing. Neither traces to Beth or `docs/domain/`. Over two is where the gap bites:
32, 36 and 40 are the counts stitched over two.

**Surfaced to Beth** as: the fabric picker's ten as one shared list (recommended), or a different
set.

**Her ruling:** "they should be the same everywhere. The same 10 as the fabric picker." The ten are
now Beth's stated list, not a developer's guess — `/stitch-fact` records them in
`docs/domain/fabric.md` (queued), and the size reference then reads the one shared list (queued).

_Recorded 2026-10-24 as **FAB-008**. The size reference reads the shared ten as of the
one-count-list `/tweak`, 2026-10-24 (`fix/one-count-list`); the closed row's quick look is
D-31._

### 2026-10-24 · D-28 · Next.js may not stop a build to nudge an upgrade — ruled during M-1

**What happened.** M-1 moved Next.js 16.3.1 → 16.4.3 for its advisories. Reading the 16.4 source
(hard rule 8) found a new default, `experimental.agentUpgrade: 'security'`: when `next dev` or
`next build` detects a coding agent and a newer Next carries a security advisory, the first run
**exits with code 1** and prints upgrade instructions addressed to the agent
(`node_modules/next/dist/lib/upgrade/nudge.js`). CI and Vercel are unaffected (no agent
detected), and it was dormant on the day because 16.4.3 had no open advisory. But the build step of
`npm run gate` runs in the pre-push hook from Claude Code, so the next Next.js advisory would turn
any unrelated session's push red. It is the same family as the 2026-08-17 `agentRules` ruling (a
dependency acting on the process), though it writes no file, so that ruling did not cover it.

**Surfaced to Beth** in-session as two options: switch it off, or keep it as an early alarm between
monthly runs.

**Her ruling:** switch it off. `experimental.agentUpgrade: false` now sits in `next.config.ts`
beside `agentRules: false`, with the reason in a comment. Catching security fixes stays the
dependency recurrence's job (Stage M). If the flag is ever lost, restore it.

### 2026-10-24 · D-27 · the process, tuned for Opus 5.5 and Fable 5.1 — ruled before M-1

**What needed a ruling.** Beth asked whether the workflow, skills, rules and hooks should change
now that Opus 5.5 and Fable 5.1 are out. Both prompting guides were read against the repo's setup.
Most of it already fits: the tone is calm, no model version is pinned anywhere a version could go
stale, and nothing in either guide argues against the Opus-builds / Fable-reviews lanes. Three
gaps were found. ① The guides say both models follow an explicit list of what a handoff summary
must keep, and the protocol's handoff note had four loose headings. ② Both models sometimes end a
turn early, by announcing the next step or asking "shall I?". The guides say naming those habits
fixes it, and this repo has stops that must stay. ③ The layer-1 review was improvised per session,
sometimes a subagent and sometimes `/code-review`, and Opus 5.5 is notably stronger at code review.

**Surfaced to Beth** as three changes with a recommendation of yes, plus a CodeRabbit question.
CodeRabbit runs on every PR, unconfigured and absent from the process.

**Her ruling (2026-10-24):** "Yes, the three changes you recommend I agree with." On CodeRabbit:
"maybe a separate session to figure out how to use it? Right now it's the free plan but I don't
really think it's doing much?"

**What it changed.** Protocol §9 now lists six things a handoff note must keep, and adds a
session-wide rule naming the wanted and unwanted stops. Protocol §5 layer 1 is now the same two
passes every time: `/code-review high` plus one delegated subagent for the checklist. CodeRabbit is
a queued process session of its own. Nothing about it changed here.

### 2026-10-24 · D-26 · three small visible fixes — ruled at the `/cleanup`

**What needed a ruling.** Three ledger rows whose fix changes what Beth sees, with no design
reference: a genre add that fails says nothing; a cover whose thumbnail fails to generate leaves the
old thumbnail in the lists; a missing completion estimate cannot be told apart from a failed one.

**Surfaced to Beth** one at a time, each with options and a recommendation.

**Her rulings (2026-10-24):** ① a message under the genre box ("'Animal' is already on the list."),
not a toast or a silent pick of the existing genre · ② show the new full cover, not the old
thumbnail · ③ a quiet line for each case — "Not enough stitching logged yet to estimate" and
"Couldn't work out an estimate right now".

**What it changed.** Item **F-14** (`docs/process/build-plan.md`), UI-touching. No code changed in
the cleanup PR.

### 2026-10-24 · D-25 · four small changes into the housekeeping batch — ruled at the `/cleanup`

**What needed a ruling.** Four ledger rows that are trivial to fix but need Beth's word: one removes
a test (hard rule 2) and two change the gate (hard rule 6). ① `PlaceholderPage` has no call sites
since P16, and deleting it deletes its test. ② The test run has no timezone pin, so a local-zone
display regression passes on CI's UTC runners. ③ `src/generated/` (the Prisma client) is linted
under `--max-warnings 0`, so a generator update could redden the gate. ④ `test-utils` does not
re-export `userEvent`, which the testing rule says to import from it; 43 files import it directly.

**Surfaced to Beth** as one decision: approve all four · only ① and ④ (no gate change) · later.
Recommendation: all four.

**Her ruling (2026-10-24): approve all four.** The test removal is approved on the record.

**What it changed.** All four join **F-8** (`docs/process/build-plan.md`). No code changed in the
cleanup PR.

### 2026-08-20 · D-24 · schema changes reach the database automatically on deploy — found at the start of P9, ruled at the 2026-10-24 `/cleanup`

**What contradicts what.** P9's brief and the protocol both assume migrations are how schema
changes reach the database: the brief's done-when is "**one migration carries the indexes +
uniqueness**", and protocol §2's definition of done says "migration committed in the same PR
(`prisma migrate dev`; never a bare `db push` for work that merges)". The repository does not work
that way today. The evidence, all verified this session:

- `prisma/migrations/` holds **exactly one** directory — `20260328163529_add_chart_project_designer_genre`
  — whose `migration.sql` creates **5 tables** (`Designer`, `Genre`, `Chart`, `Project`,
  `_ChartToGenre`). `prisma/schema.prisma` now declares **18 models**. Every model added since
  March — `StitchSession`, all supply, fabric, storage and stitching-app models — reached the
  database by `prisma db push`, out of band.
- There is no `migration_lock.toml`.
- **Nothing runs `prisma migrate deploy`.** `package.json`'s `build` is `prisma generate && next
build`; `.github/workflows/ci.yml` runs `npx prisma generate` against a throwaway
  `postgresql://ci:ci@localhost:5432/ci` and never applies anything; Vercel runs the same `build`.
  A migration file committed to this repo is therefore inert — merging it changes no database.
- This working copy has **no `.env.local`** (only `.env.example`), so no session on this machine
  can reach Neon at all: `npx prisma migrate status` fails at the datasource, and
  `prisma migrate dev` — which needs both the real database and a shadow database — cannot run.

**Why it matters.** P9's index work is the half that makes the other half worth doing: the schema
has three `@@index` declarations in total, and `Project.userId` — the column every user-scoped query
filters on — is unindexed. But an index only helps once it exists **in Neon**, and there is
currently no route by which this repo puts one there. Writing `migration.sql` by hand and merging it
would produce a green PR, a satisfied done-when, and a production database entirely unchanged —
a wrong number of exactly the kind the drift rule exists to stop. The same blocker sits under the
ledger's StorageLocation/StitchingApp row: `@@unique([userId, name])` is a database constraint, and
the friendly "that name is already taken" message P9 would add is unreachable until the constraint
is real.

**Surfaced to Beth** on 2026-08-20 with the P9 size check, as one decision: what P9 builds today,
given its schema half cannot be finished from here.

**Her ruling (2026-08-20):** **the invisible speed-ups** — P9 splits, and today's session builds
only the fixes that change nothing on screen. The two paginated lists and the database half each
become their own item.

**What it changed.** P9 became three items (`docs/process/build-plan.md`): **P9a** — the query-shape
fixes on the four ungated action files, no visible change, ships on green; **P9b** — the two
paginated lists (`/sessions`, `/supplies`), UI-touching, preview before merge; **P9c** — the gated
half: the four whole-table scans in `src/lib/queries/stats/`, the index migration, and the
StorageLocation/StitchingApp uniqueness. **P9c stays blocked** until the question this row opens is
answered, and that question is still open: _how does a schema change reach the live database?_ It
is not P9c's to answer inside its own build — it decides whether P9c can exist at all, so it comes
back to Beth as its own decision with options before P9c is queued. Until then the ledger's
StorageLocation/StitchingApp row and the index work both wait here, named, rather than looking done.

**Surfaced again at the 2026-10-24 `/cleanup`**, as its own decision: automatic on deploy (baseline
today's database, then each deploy applies pending migrations; previews only ever touch their own
Neon branch) · a manual step at merge (a session pushes the change by hand after Beth's yes; no
record, and a push can drop data) · no database changes for now (drop P9c's database half).
Recommendation: automatic on deploy.

**Her ruling (2026-10-24): automatic on deploy.**

**What it changed.** New item **R-2 — a migration pipeline** (`docs/process/build-plan.md` Stage R),
gated as schema + migrations, so a fresh `/review` merges it. P9c is no longer waiting on a
question; it waits on R-2. Protocol §2's "migration committed in the same PR" stays as written —
R-2 is what makes it true.

### 2026-10-14 · D-23 · Safari's empty date boxes wait for the design track — ruled during a `/broken`

**What needed a ruling.** Beth reported that adding a chart shows today's date in Start, Finish
and FFO Date and that she cannot delete them. Located, not theorized: `use-chart-form.ts` starts
all three as `""` and the submit maps `""` to `null`; Beth confirmed she was in **Safari** and that
a chart she saved with the boxes untouched **did not** get the dates. So the data is right and the
app matches its reference — DesignOS's `ChartAddForm.tsx` / `ChartFormModal.tsx` use the plain
native `<input type="date">` — but Safari on macOS paints today's date into an **empty** date box,
indistinguishable from a real value, and offers no obvious way to take a set date back out.
Classified a **gap**, not a defect: built = spec; the spec never considered how a browser draws an
empty date. Changing how the boxes look has no reference, so it is Beth's call (hard rule 4).

**Surfaced to Beth** in-session: fix now (a faint "No date" for an empty box plus a "Clear" link on
a filled one, previewed in Safari) · wait for the design work · leave it alone.

**Her ruling: wait for the design work.** Filed as a design-track input in `backlog.md` (whole-app
— every native date box, not only the chart form). No code changed.

### 2026-08-21 · D-22 · the review gate covers the storage family, not a list of filenames — ruled during P16

**What needed a ruling.** `.claude/hooks/review-gated-paths.txt` named the R2 core one filename at
a time. P16 added two files doing the same work — `cover-optimization.ts` re-points a chart's row
at a pair of storage keys, `cover-backfill-actions.ts` issues the delete that supersedes the old
ones — and neither matched a line. P16 itself was gated anyway (it edits `upload-actions.ts` and
`r2.ts`); the gap was the **next** change, one confined to the two new files, which would have
merged on green with no fresh `/review` behind it even though it can delete a picture with no copy
anywhere. That file's own header predicted this: "gate growing families by directory, not
filename — a per-filename line goes stale the day a sibling is added." Found by P16's layer-1
review; adding a path is a gate-config change, so it is Beth's ruling, never a quiet edit (hard
rule 6).

**Surfaced to Beth** in-session as a decision: cover the whole photo family · add just the two new
names · leave the list alone.

**Her ruling: cover the family.** Anything that writes to or deletes from photo storage needs the
second review, so a file written later is covered the day it exists rather than the day someone
remembers.

**What it changed.** The three per-filename R2 lines became a family block with
`^src/lib/actions/cover-[a-z-]+\.ts$` beside them, and `session-protocol.md` §5 and CLAUDE.md's
hard rule 3 were reworded in the same PR to say "the R2 storage family". **One honest gap
remains:** `cover-` is a name prefix, not a directory, because these files sit beside ungated
action files — a new sibling called something else would still slip through. The durable form is a
`src/lib/actions/storage/` directory, which is a move of gated files and therefore its own item;
it is a maintenance-ledger row rather than something P16 rides along.

### 2026-08-20 · D-21 · the cover-shrinking button lives on Settings — ruled at the start of P16

**What needed a ruling.** P16's done-when says Beth can start the conversion and see it finish
without running a command, so the item needed a button — and hard rule 4 forbids inventing a
screen. There was no reference to build from: `docs/design/screens/` is still empty, and DesignOS
never drew a Settings screen (it only put the link in the nav). The Settings page itself has been
a "coming soon" placeholder since the shell was built, reachable from the sidebar and the mobile
menu but leading nowhere.

**Surfaced to Beth** in-session as a decision, with the fact that mattered: whatever it looks
like now, DS-1 sets the direction later, so this is a question of _where the control belongs_,
not what it should look like. Options: a card on the Settings page · a self-hiding banner across
the top of Pattern Dive · both.

**Her ruling: the Settings page.** A one-off housekeeping job belongs out of the way of daily
use, and it gives Settings its first real content.

**What it changed.** `src/app/(dashboard)/settings/page.tsx` stopped being a placeholder and now
renders one card (`CoverOptimizationCard`) built from the app's existing `Card`/`Button`
primitives and semantic tokens — no new visual vocabulary, so DS-1 restyles it with everything
else. It also orphaned `PlaceholderPage`, which is now a maintenance-ledger row rather than a
deletion inside this diff, because removing it removes its test.

### 2026-08-19 · D-20 · P13 splits — the form-input half ships, the upload half waits — ruled at the start of P13

**What needed a ruling.** P13's brief promised "one validation boundary", but the item had
accumulated five ledger rows and, with them, seven distinct fixes. Three of the seven — merging
the two byte-identical upload allowlists, settling the extension-vs-MIME rule that
`chart-file-list.tsx` and `getPresignedUploadUrl` disagree about, and the submitted-cover-key
ownership check P15's review added — all land in `src/lib/actions/upload-actions.ts`, a
review-gated core. Building all seven together would therefore hold the four harmless ones behind
a `/review` session, unreleased. This is the same shape as the P11 size check two days earlier.

**Options put to her:** (a) split — the four form-input fixes ship today, the three upload fixes
become their own gated item; (b) keep it whole, one item, one review, nothing live until the
review runs. Recommendation (a).

**Her ruling: (a) — split it.** Stated in-session, 2026-08-19, before any code was written.

**What it changed.** **P13** is the form-input half: one trim/blank-is-absent convention across
every boundary schema, the storage-location/stitching-app twins collapsed to one definition, both
error arms shared, and every ungated action typed from its own schema. **P13b** carries the three
upload fixes and the one question they raise for her — which chart-file formats she actually keeps,
which is what decides whether the client's extension fallback or the server's MIME-only rule is
right. P13b is gated, so a `/review` row follows it.

### 2026-08-19 · D-19 · the quick-add colour picker is required, not defaulted — ruled during P11b

**What needed a ruling.** Her 2026-08-17 ruling said quick-add "gains a colour-family picker —
one extra tap, honest filter", which leaves one thing open: whether the picker arrives
pre-filled. A picker that starts on Neutral and is not touched files the supply under Neutral —
exactly the silent behaviour the ruling exists to end — so the two readings produce opposite
outcomes whenever she is in a hurry.

**Options put to her:** (a) required — the picker starts empty and "Create & Add" stays disabled
until a family is chosen; (b) pre-set to Neutral, changeable. Recommendation (a).

**Her ruling: (a) — must pick before saving.** She was shown both as mockups and chose the
greyed-out button.

**What it changed.** `InlineCreateDialog` starts with no family and disables its submit until one
is chosen (threads and beads only — specialty items carry no colour family). The server matches:
`createAndAddThreadSchema` lost its `.default("NEUTRAL")` and `createAndAddBeadSchema` gained a
required `colorFamily`, so no future caller can re-create the silent Neutral from the back. The
one route that can still reach a missing family is the Enter key, which now names the field
rather than doing nothing.

### 2026-08-18 · D-18 · over-count changes which stash pieces are offered — ruled during F-4

**What contradicts what.** FAB-006 is tagged `[stated by Beth 2026-08-17]` and says that for a
project with **no fabric assigned**, each spare piece is judged at **its own count** — "a 28ct
piece is measured against the 28ct requirement, not the project's, because the project has none".
F-4 makes every fabric size divide by the project's over-count, so for an over-two project that
28ct piece is now measured against the **14ct** requirement. Her stated rule still holds in the
sense she meant it (the piece's own count, not another piece's), but the parenthetical is
literally false for an over-two project, and the visible effect is real: pieces that used to
appear under "Fabrics That Fit" for an over-two project with no fabric assigned are now hidden,
because at over two they genuinely are too small.

**Why it needs her.** This is a Beth-stated domain fact and a list she ruled on twelve hours
earlier. F-4's behaviour follows necessarily from FAB-004 — over-count changes every size figure —
so the code is not in question; what needs her word is whether FAB-006 should now say so, and
whether hiding those pieces is what she wants. The alternative (judging candidates as if the
project were over one) would offer her fabric that is too small, which is the defect F-4 exists to
remove.

**Also for her word, in the same conversation:** F-4 edited **FAB-005**'s formula line from
`stitches ÷ fabricCount + 6` to `stitches ÷ effectiveCount + 6`, and added that the margin does
not scale with over-count. That is the doc following the code and FAB-004, and the provenance tag
was left untouched — but `docs/domain/README.md` says no session edits a fact on its own
initiative, so it is named here rather than passed over.

**Options for her:** (a) record the over-count behaviour on FAB-006 via `/stitch-fact` and keep
the code as built — recommended; (b) she wants every piece offered regardless of over-count, with
the too-small ones marked — that is a new item, not a doc edit; (c) park it for `/cleanup`.

**Raised by:** the layer-1 review of PR #98 (F-4), 2026-08-18. **Not silently resolved:** the code
ships the behaviour F-4's brief specified, FAB-006 is left exactly as Beth stated it, and this row
carried the mismatch until she ruled.

**Closed 2026-08-18** — F-4 merged as #98 with her ruling recorded below and FAB-007 written;
what remains is the build, which is item **F-5**, the queue's top row.

**Ruling (2026-08-18, in the F-4 session): show them, with the qualifier — and as its own item.**
Beth's question was the better answer than either option offered: _"Is there a way to add logic
that says 'this fits if you're stitching over 1, but not if you're stitching over 2'?"_ — so a
piece that fits only at over one is **shown with that qualifier**, not hidden. Her reasoning, on
the record: a project with no fabric assigned may not have a settled over-count, and hiding the
piece assumes a decision she has not made. A piece too small either way stays unoffered.

She also ruled the **sequencing**: F-4 ships as built rather than growing new behaviour at review
time, and the qualifier becomes **build-plan item F-5**, queued straight after F-4's review. Until
F-5 lands, the only pieces hidden are ones that do not fit the way the project is currently set —
strictly better than the wrong sizes F-4 replaced.

Recorded as domain fact **FAB-007** (`docs/domain/fabric.md`), which also carries the correction
FAB-006's parenthetical needed; FAB-006 keeps its ID with a pointer, per `docs/domain/README.md`.
The FAB-005 formula edit named above stands with it. Q-002 and Q-005 are untouched and stay open.

_(Beth's rulings D-01–D-14, which set the process itself up, are in
`WORKFLOW-OVERHAUL-HANDOFF.md` §2.)_

### 2026-08-17 · P1 made `src/lib/validations/auth.ts` load-bearing for auth, and it is not review-gated — moved to Ruled at the 2026-10-24 `/cleanup`

**What contradicts what.** The review-gated list (`.claude/hooks/review-gated-paths.txt`, mirrored
in `session-protocol.md` §5) gates "auth, session, and rate limiting — the mechanisms AND the routes
that apply them", and its own comment says to gate growing families **by directory, not filename**.
P1 moved the rate limit inside `authorizeCredentials`, which made that function an unauthenticated
boundary — so the layer-1 review required a Zod parse there, and the schema it parses with is
`loginSchema` in **`src/lib/validations/auth.ts`**. That file is not on the gated list.

**Why it matters.** Three of the protections P1 added now live in that schema rather than in
`auth.ts`: the `.max(254)` that bounds the rate-limiter key, the `.trim().toLowerCase()` that makes
both login entry paths key and match identically, and the email format check itself. Deleting
`.max(254)` is a one-line edit to an ungated file that silently reopens the unbounded-store hole the
review caught. That is the same shape as the `proxy.ts` argument Beth already ruled on (③, PR #72
review): the file whose one-line edit can quietly undo the control belongs on the list.

**Why it needs Beth.** Adding a path to that list is a gate-config change (hard rule 6), and P1's
builder must not make it unilaterally — the same reasoning that put the four PR #72 additions in
front of her. **Not applied in the P1 branch.**

**Options.** (a) Add `^src/lib/validations/auth\.ts$` — one line, no code, and consistent with the
③ precedent. (b) Gate the whole `^src/lib/validations/` directory — follows the by-directory lesson,
but pulls ~9 non-auth schemas into review-gating and taxes many future items. (c) Leave it, and
move the three auth-critical rules back into `auth.ts` so the gated file holds them — no list
change, but it duplicates the email rule the form action also needs, which is exactly what P13
(one validation boundary) exists to remove.

**Recommendation: (a).** It closes the gap the way she has already ruled once, costs one line, and
leaves the single-boundary shape P13 is heading towards intact.

**Ruling (2026-08-17, in the P1 session): (a) — add the one file.** Beth chose adding
`^src/lib/validations/auth\.ts$` over gating the whole `validations/` directory or moving the
rules back into `auth.ts`. Applied in the P1 branch: one line in
`.claude/hooks/review-gated-paths.txt` and the matching prose in `session-protocol.md` §5, which
is kept in step by the same rule. No code changed. **This row moves to Ruled at the next
`/cleanup`.**

### 2026-08-17 · D-17 · over-count is missing from the fabric size calculation — ruled during P7

**What happened.** P7 read all three copies of the fabric formula and found something none of
them do: **none divides the fabric count by the project's over-count.** Stitching over two
threads means each stitch spans two fabric threads, so 28ct linen worked over two behaves like
14ct for size and the design comes out about twice as large. `skein-calculator.ts` already does
this division (`effectiveCount = fabricCount / overCount`); `fabric-calculator.ts` never has.
`Project.overCount` exists in the schema, defaults to 1, and no fabric-size code path reads it.

This is a genuine contradiction, not a preference: **FAB-004** in `docs/domain/fabric.md` states
that the effective count is what "both calculators use". The doc and the code disagree, and for
any over-two project the app currently understates the fabric needed. Distinct from Q-002, which
asks how over-count is _decided_ — this is about applying the value Beth has already set.

**Surfaced to Beth** in-session, with the size of the error named and the sequencing trade-off:
P7's whole job was collapsing three copies of the formula into one, and the over-count fix is a
one-place change afterwards versus a three-place change alongside.

**Her ruling: record it now, fix it in a short session straight after P7.** Filed as build-plan
item **F-4**, queued directly behind P7's `/review`. No calculation changed in P7 itself — the
unified calculator preserves today's over-count-blind arithmetic exactly, so P7 neither fixes nor
worsens the error, and F-4 changes it in exactly one place.

**What it changed — closed by F-4, 2026-08-18.** `calculateRequiredFabricEdge` /
`calculateRequiredFabricSize` now take the project's `overCount` as a **required** argument and
divide by it (`calculateEffectiveCount`, exported so the one division has one home); all three
call sites pass the project's real value — `pattern-dive-actions.getFabricRequirements` now selects
`overCount`, and it is on `FabricRequirementRow` so the UI can label what it is showing. There is
deliberately **no default of 1**: a default is the shape the bug had. FAB-004 and FAB-005 in
`docs/domain/fabric.md` follow the code again.

### 2026-08-17 · fabric matching now shows only pieces that fit — ruled during P7

**What happened.** P7 inherited F-2's domain question (its trap ②): what should a project with no
assigned fabric be matched against? Reading the code answered half of it first — the behaviour
had already been written in May 2026 (commit `18859b3`) without anyone asking her, so the
"missing" F-2 fix was in fact a **guess sitting in production**: every unassigned piece was
listed, each judged at its own count, fitting and non-fitting alike, under a heading reading
"Fabrics That Fit".

**Surfaced to Beth** as the decision it always was, including the heading contradiction.

**Her ruling: only show pieces that actually fit — and the same rule applies to both halves of
the list**, the same-count suggestions for a project that already has fabric as well as the
all-counts suggestions for a project that has none. Recorded as domain fact **FAB-006**
(`docs/domain/fabric.md`), which is where the behaviour now lives.

**What it changed.** `matchingFabrics` filters on `doesFabricFit` in both branches;
`fitsWidth`/`fitsHeight` left `FabricRequirementRow` because every row on the list now fits by
construction, and the tab's warning-triangle branch went with them. **Six tests were rewritten to
the ruled behaviour** — three that asserted non-fitting pieces are listed, three that asserted the
fit flags — plus one existing `updateFabric` test given the ownership mock its new precondition
needs. Nothing was deleted to get green: each rewritten test still asserts the same scenario,
against the answer Beth gave.

### 2026-08-19 · P11 was seventeen fixes, three of them gated — split, ruled during P11

**What happened.** P11's own brief carried the trap "honestly too big for one session if each fix
sprouts discussion — apply the protocol §2 size check and split rather than marathon." The size
check found seventeen distinct fixes, and — the part the brief did not anticipate — **three of them
touch review-gated paths**: the display-clamp unification reaches `src/lib/queries/stats/`, merging
the two upload allowlists reaches `upload-actions.ts`, and the comment sweep's last references sit
in `prisma/schema.prisma` and `fabric-calculator.ts`. Batched as one PR, all seventeen would have
stopped at `built, awaiting review`, holding fourteen harmless fixes — a wrong number in an error
message, an unwired delete button, a stray config line — behind a review session, unable to deploy.

**Surfaced to Beth** as a four-option decision with a recommendation, before any code was written.

**Her ruling:** two sessions plus two reroutes. **Batch one** — the fourteen ungated fixes — ships
and deploys the same day. **P11b** carries her two 2026-08-17 rulings, the ones that change what she
sees: the quick-add colour-family picker and the over-logging confirm with the display clamp. It is
gated and UI, so it takes both a preview and a `/review`. The two remaining fixes go to the items
that already own the same decision: the upload allowlists to **P13** (which owns the row about those
two lists disagreeing) and the `schema.prisma` comment to **P9** (which already opens that file).

**What it changed.** The queue gained a `P11b` row; the build plan carries both briefs; the ledger's
P11 closer list records the split and both reroutes. **The generalisable part:** the §2 size check is
not only about token budget — **an item's gated paths are part of its size**, because they decide
whether the work can deploy at all. Batching ungated fixes with gated ones is how a one-line copy fix
ends up waiting on a review of something else. Future size checks split on that seam first.

### 2026-08-17 · the covers already in the library — ruled during P15

**What happened.** P15 put chart covers on the same pipeline session photos use, so a cover is
now stored as a 1200px WebP plus a thumbnail instead of at full upload size. That is
forward-only: it fires when a cover is uploaded or replaced. Every cover already in Beth's
library keeps its full-size original, which is exactly the complaint the item opens with — the
chart she opens today is usually one whose cover was uploaded months ago.

Converting them is a different shape of work: hundreds of stored pictures, each needing a
download, two `sharp` encodes and three R2 calls, which cannot finish inside one request and
cannot be exercised at all from a machine with no R2 credentials. Riding it along would have put
an untestable production job inside an already review-gated item.

**Surfaced to Beth** in-session as a decision: queue the conversion as its own session · or leave
the old covers alone and let each one shrink only if she happens to replace it.

**Her ruling: queue it.** New covers shrink from today; a follow-on session converts the ones
already there. Recorded as build-plan item **P16**, and it is also the remaining pre-condition
for the `covers/unsaved/` lifecycle rule P8 parked — the maintenance-ledger row is updated to say
so.

**What it changed.** No code beyond P15 itself. New build-plan item P16, a queue row, and the
pre-condition text on the abandoned-uploads ledger row.

### 2026-08-17 · retiring the old cover code's tests — ruled during P15

**What happened.** P15 collapses two image paths into one, which retires `generateThumbnail` —
the cover-only, thumbnail-only path. Its tests go with it: five naming it directly and a dozen
whose descriptions did. Hard rule 2 makes a test removal Beth's call, on the record, whatever the
reason.

**Surfaced to Beth** in-session as a decision, with the fact that mattered: every assertion moves
to the new path _before_ the old copies go, so nothing stops being checked.

**Her ruling: retire them.** Test removals approved, on the record.

**What it changed.** The key-pin and ownership proofs moved onto `processAndStoreImage`;
`chart-actions-thumbnail.test.ts` became `chart-actions-cover-image.test.ts` with fifteen clauses
where it had twelve; the auth file's `generateThumbnail` case folded its assertion into the
`processAndStoreImage` case. The retirement itself left the suite count unchanged at 2747; the
layer-1 review's follow-on fixes then took it to 2753.

### 2026-08-17 · the reconciliation story for abandoned uploads — ruled during P8

**What happened.** P8's fourth defect was a decision, not a bug: the chart form uploads a cover
photo or a chart file to R2 **before** Beth presses Save, under the literal prefixes
`covers/unsaved/…` and `files/unsaved/…`. Close the form without saving and the object stays in
storage with nothing referencing it — and nothing in the app can enumerate storage, so no code
can ever find it again. Rate: one stray object per abandoned form, a few pence a year.

The obvious remedy — a Cloudflare object-lifecycle rule deleting anything under those prefixes
after N days — **is a landmine today**, because a cover or file uploaded from the _create_ form
keeps its `unsaved/` key permanently once the chart is saved: those keys are live, not scratch.
Switching the rule on now would delete pictures Beth is still using. Item **P15** (cover
shrinking) is what moves saved covers off the prefix; only after it does is the rule safe.

**Surfaced to Beth** in-session as a decision with three options: leave it and write the plan
down · queue a follow-on item after P15 that turns the storage rule on · build a reconciliation
sweep into the app (list storage, compare to the database, delete what nothing references).

**Her ruling: leave it for now and write down the plan.** No automatic cleanup, no sweep. P8
closes the three real leaks and records this; the abandoned-upload residue is logged on the
maintenance ledger with its exact pre-condition, so a later session can switch on the bucket rule
once P15 has made it safe. Nothing about the app changes for her today.

**What it changed.** No code. A maintenance-ledger row (2026-08-17) carries the residue and the
pre-condition; `docs/INTEGRATIONS.md`'s object-lifecycle section states the decision beside the
mechanics it belongs to.

### 2026-08-17 · the dead cover-optimizer — ruled during P2

**What happened.** P2's brief left one thing for Beth: `confirmUpload` in
`src/lib/actions/upload-actions.ts` has had zero non-test callers since the cover flow moved to
`generateThumbnail`, yet every export of a `"use server"` file is a live POST endpoint — so it sat
there Zod-less, writing a caller-supplied string into a chart's cover fields. It was also the only
code path that would ever have _optimized_ a cover, so chart covers are stored at full upload size
today while session photos are not. Deleting it takes its tests with it, and the 2026-08-17
test-removal approvals named only P3 and P12, so this needed her word (hard rule 2).

**Surfaced to Beth** in-session as a decision: delete and queue the shrinking separately · delete
and drop the idea · wire cover optimization up inside P2. She asked what a senior developer would
recommend, was given the reasoning — dead code that is also an unchecked endpoint is pure risk;
a behaviour change should not ride inside a hardening fix; and when it is built it should be built
on the session-photo pipeline that already runs in production, not on code that never has — and
chose the recommendation.

**Her ruling:** delete `confirmUpload` and its tests in P2 (**test removal approved, on the
record**), and queue cover-image optimization as its own item **after P8**, since P8 owns the same
cover-replace and orphan-cleanup code. Nothing about the app changes for her today.

**What it changed.** `confirmUpload` and `VALID_CHART_FIELDS` are gone; the seven `confirmUpload`
tests went with them. New build-plan item **P15** carries the shrinking, queued behind P8.
`docs/ARCHITECTURE.md`'s "three-step" upload description — which documented `confirmUpload` as
step 3 and had been false since the flow changed — is corrected in the same PR (descriptive
staleness, protocol §6).

### 2026-08-17 · review layer 2 asked Beth to check a preview she could not log into — CLOSED by R-1

**What contradicts what.** `session-protocol.md` §5 layer 2 (and CLAUDE.md's summary of it) says a
UI-touching PR is confirmed by Beth on its Vercel preview before merge — that is the stated safety
valve on D-01, because merge deploys production instantly. **Preview deployments cannot
authenticate.** Every preview returns HTTP 500 on `/api/auth/csrf`, `/api/auth/session` and
`/api/auth/providers` (Auth.js's "problem with the server configuration"), while production returns
200 on all three: the Vercel **Preview** environment is missing `AUTH_SECRET` and probably the rest
of the auth vars. So the only page Beth can actually see on a preview is `/login`.

**Pre-existing, not caused by P10** — verified two ways this session: previews built from code
without the P10 diff fail identically, and the same endpoints return 200 locally the instant a
secret is present. P10 only surfaced it, by being the first item that needed the preview for its
own done-when.

**Why it needs Beth.** Layer 2 is written into the process as a merge precondition. Either the
preview environment gains the auth vars so layer 2 works as written, or layer 2 needs a different
answer for anything behind the login (confirm in production after merge, with `git revert` as the
undo, is the honest alternative — the recovery protocol already covers it).

**Owner if it becomes work:** R-1, which already owns preview-deployment environment topology
(bucket ruled read-real/write-scratch); setting the Preview auth vars belongs beside that.
Maintenance-ledger row carries the evidence.

**CLOSED 2026-08-17 by R-1.** Previews now authenticate and show real data: Beth signed into PR
#85's preview with her production credentials, saw her real chart covers, and uploaded a new one that
landed in the scratch bucket while production's copy stayed put. **Layer 2 works as written for the
first time** — a UI-touching PR can now be shown to Beth on its own preview before merge, which is
what D-01's safety valve always assumed. The interim precedent below (confirm in production after
merge, revert as the undo) is therefore spent, and stands only as the record of how one low-risk
dependency PR shipped while the preview was blind.

**Ruling:** _closed; the standing question is answered by D-15 and D-16._ **Interim precedent set 2026-08-17:** asked whether P10
should merge with its "app demonstrated working" clause unmet, Beth ruled **merge now** — the
advisories were live in production, every automated check was green, and `git revert` of the squash
commit is a one-minute undo. So the working answer today is _signed-in surfaces are confirmed in
production after merge, with revert as the safety valve_. That is a precedent for one low-risk case
(no source change, dependencies only), **not** a general replacement for layer 2: a real UI change
still has nowhere for Beth to preview it, which is why this row stays open.

### 2026-08-17 · D-15 and D-16 · what a preview deployment is allowed to touch — ruled during R-1

**What happened.** R-1 opened on a ruled bucket question (read real, write scratch) and hit two
things the ruling did not cover. First, a preview needs a _database_ before it can show any image
at all, and nothing had ever said which one. Second, the settings a preview needs live in Beth's
Cloudflare and Vercel accounts, and no session can reach them from this machine — no CLI, no
stored credentials, no `.env.local` (checked). Both were put to her in-session.

**D-15 — a preview reads a copy of the database, not the real one.** Previews get their own Neon
branch: real charts, real numbers, honest review, and a click that edits or deletes something
changes only the copy. Rejected: pointing Preview at the production database, because a preview is
a working app — the same hazard the R2 ruling already refused for files, and there is no undo for a
deleted chart. This is the database half of _read real, write scratch_, and the two together are
now the documented shape of a preview (`docs/INTEGRATIONS.md`, Deployment topology).

**D-16 — the keys stay with Beth; Claude writes the steps.** Asked whether to do the settings
herself with an exact list, or hand over a Cloudflare token and a Vercel token so Claude could do
all of it, Beth chose to do it herself. So the standing shape for infrastructure settings is:
**Claude never holds credentials to the live site; it produces the numbered steps and verifies the
result afterwards.** The cost is accepted — a session that needs a new environment variable stops
and asks rather than setting it. Note this is not the same as the file/command contract (protocol
§8): Beth is still never asked to edit a repo file or run a command, and dashboards are not that.

**What happens after.** R-1's code half merges through `/review`; the settings list lives in
`notes.md` tagged R-1; the preview clauses of R-1's done-when are demonstrated once Beth has done
the dashboard pass. The open row above — _review layer 2 asks Beth to check a preview she cannot
log into_ — stays open until then, and D-15/D-16 are what will close it.

### 2026-08-17 · Next.js may not co-author CLAUDE.md — ruled during P10

**What happened.** The P10 security bump moved Next.js 16.2.4 → 16.3.1, and 16.3 ships a new
default (`agentRules: true`) that makes `next dev` append its own marked block to `CLAUDE.md`
and re-add it whenever it is removed. The block's content is benign — "this version differs from
your training data, read `node_modules/next/dist/docs/` before writing code," which is hard rule 8
almost verbatim. The contradiction is about **authorship**, not content: CLAUDE.md declares itself
and `session-protocol.md` the process authorities, and a dependency that edits the authority file
on every `npm run dev` contradicts that.

**Surfaced to Beth** in-session, as a two-option decision: switch it off (one config line) or
accept an upstream-maintained section inside the rulebook.

**Her ruling:** switch it off. `agentRules: false` now sits in `next.config.ts` with the reason in
a comment. Verified: `next dev` no longer touches `CLAUDE.md`.

**What it changed.** CLAUDE.md stays authored only by this project. Future sessions: if the block
ever reappears, the flag was lost — restore it rather than committing the block. Any future
tool that wants to write into the process-authority files is the same question again, and it is
Beth's, not a session's.

### 2026-08-17 · smaller rulings from the post-audit `/cleanup`

Product decisions Beth made during the A-1 triage that bind future sessions — none started as a
contradiction, recorded here per this file's "Also here" rule.

- **Quick-add supplies must ask for colour family.** Today the quick-add path silently files
  every supply under `colorFamily: "NEUTRAL"`, hiding it from the catalogue's colour filter.
  Ruled: quick-add gains a colour-family picker — one extra tap, honest filter. Rejected:
  an "uncategorised" bucket; keeping the silent Neutral. Folds into audit item P11.
- **Logging past 100% warns but allows.** A session that would push a project past its total
  stitch count gets a confirm — "this takes the project past 100%, sure?" — and saves on her
  word; progress _displays_ cap at 100% everywhere (the display unification is P11 regardless).
  Rejected: blocking (wrong whenever the chart's own total is what's off — miscounts, frogging,
  borders outside the count); silent allowing (an extra-zero typo goes straight into stats).
  The warning itself folds into P11; closes the parked question from the 2026-08-16 ledger row.
- **F-3 folds into the chart-form redesign.** The supply stitch-total hint's visibility fix is
  routed to the design track rather than built now — it becomes an input to DS-2/D-2 (the brief's
  trap ① raised the overlap; the cheap version would be work done twice). F-3 leaves the Stage F
  queue; the gap stands until D-2 lands.
- **Test removals approved, on the record (hard rule 2), twice.** ① **P3**: the superseded
  shopping feature (`getShoppingList` — no `userId` filter; `markSupplyAcquired` — no ownership
  check; `shopping-list.tsx`) and the six orphaned components go, **with their ~750 lines of
  green tests** — dead code deleted at the root rather than patched in place. ② **P12**: the
  ~40 phantom tests that cannot fail (self-asserting literals, `toBeDefined()` on typed
  constants) come out; `tsc` already does their real work. Both approved 2026-08-17.
- **Preview deployments: read real R2, write scratch.** R-1's bucket ruling — previews display
  the real bucket's images (honest design review) but their uploads/deletes land in a separate
  scratch space, never production storage. Rejected: full sharing (preview pokes mutate real
  storage); full isolation (previews stay visually blind). R-1's brief builds to this shape.
- **Two gate-config changes approved (hard rule 6).** ① The 55 standing eslint warnings get
  fixed in their own session and the lint step then runs with `--max-warnings 0`, so warnings
  block from then on. ② CI is changed to literally run `npm run gate` instead of re-implementing
  its seven steps, so local-green and CI-green cannot drift apart. Both strictly tighten; both
  approved 2026-08-17; they land together as one gate-alignment fix item.

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

**Ruling (2026-08-17, at `/cleanup`):** all three ruled in one sitting.
**① Confirmed** — `gh pr merge` stays pre-approved; her word is the gate (protocol §5), and
the `--admin` bypass stays blocked by the guard. **② No gating** — the `revalidateTag("stats")`
caller files are **not** added to the review-gated list. On the A-1 evidence (report §5:
every defect was writer-side, and the worst offenders call `revalidateTag` from no file a
path gate could watch), the protection adopted instead is the **per-mutation test rule**:
every stats-visible mutation carries a test asserting its `revalidateTag("stats",
{ expire: 0 })` call — audit item P5 completes it, and it becomes the standing pattern for
new mutations. The open-question block in `.claude/hooks/review-gated-paths.txt` is closed
with this ruling. **③ Confirmed** — the four paths added during the PR #72 review
(`proxy.ts`, `src/lib/r2.ts`, `src/app/(auth)/`, `src/app/api/auth/`) stay on the
review-gated list.

### 2026-08-17 · kitting % for a project with no supplies — the rule was decided inside a test file

**What happened.** The A-1 audit found `pattern-dive-actions.test.ts` carrying a test titled
_"returns 100% kitting for project with no supplies needed"_ whose assertion is **0%**, with the
reasoning for the flip written as a comment inside the test rather than surfaced anywhere; a
sibling test hardens _"fabric alone doesn't make a project kittable."_ Both encode product/domain
rules — what the kitting figure should say when a chart has no supplies attached, and whether
fabric counts toward kitted — that trace to no `docs/domain/` fact (KIT-001's nine conditions
are themselves still unconfirmed with Beth, and say nothing about the empty case). The code
ships the 0% reading today.

**Why it needs Beth.** "Kitted" is her practice, not an inference (hard rule 5). Today the
What's Next tab shows a supply-less chart at 0% kitted; the test's title believed it should read
100% ("nothing to gather = ready to start"). Either reading is defensible; only she knows which
matches how she decides a project is ready.

**Her options.** (a) 0% as built — "no supplies recorded" means "not ready; kit list unknown".
(b) 100% — "nothing left to gather" means ready. (c) Neither — show "no kit list" as its own
state instead of a percentage; the only option that never overstates in either direction, at
the cost of a slightly bigger change.

**What happens after she chooses.** The ruling is recorded via `/stitch-fact` (it is a domain
fact about what kitting % means), the test is retitled or reshaped to match, and the What's
Next surface follows — small work, foldable into the audit's P12 or the design track's
DS-3/DS-4.

**Ruling (2026-08-17, at `/cleanup`):** **Keep 0%** — option (a). "No supplies recorded"
means _not ready; kit list unknown_, and fabric alone does not make a project kittable.
Recorded as domain fact **KIT-004** (`docs/domain/kitting-and-storage.md`). The code already
ships this reading, so the only work left is retitling the mis-titled test — folded into
audit item P12.

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

**Ruling (2026-08-17, at `/cleanup`):** **Confirmed** — option (a). The archive keeps its
formatter exclusion and stays verbatim, byte for byte. No further work; the carry-over
stands as made.

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

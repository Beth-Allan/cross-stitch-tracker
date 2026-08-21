# Cross-Stitch Tracker — Backlog

**What this is:** things that could be built but are not queued — **feature wishes** and **design
backlog**. Nothing here is a commitment and nothing here is a defect.

**Where things go instead:** defects and code-health warts → `docs/process/maintenance-ledger.md`
· contradictions and spec gaps → `docs/process/work-log/drift.md` · briefed, ordered work →
`docs/process/build-plan.md`. A backlog item leaves this file by becoming a build-plan item
through a `/plan-feature` session, or by Beth ruling it out at a `/cleanup`.

**How things arrive:** `/tweak` (Beth wants something different — logged in her own words), the
drift rule's third branch (an improvement idea, never applied mid-item — protocol §6), and
`/stage-review` (improvement ideas found during review go here, never applied mid-review).

**Seeded 2026-08-16** at workflow-overhaul step 2 from the `999.x` list that lived in CLAUDE.md
(git history, commit `2860057`) and from `docs/archive/planning/REQUIREMENTS.md`'s Future Requirements
section, which had already sorted most of them as `FEAT-F01`–`F16`. Old ids are kept in brackets
purely so a reader can trace a line back through the archive.

---

## Domain-fact-gated — these need Beth before they can be planned

**Two wishes cannot be specified at all until Beth rules on a cross-stitch fact.** They are the
project's two documented scars — the reason hard rule 5 and `/stitch-fact` exist — so they lead
this file rather than sitting in the list below. **The fact comes first, through `/stitch-fact`
into `docs/domain/`; the feature is planned second.** Guessing either constant is the banned move.

- **Per-brand skein length** _(old 999.13 / FEAT-F09)_ — the skein calculator uses a **single
  hardcoded 8m skein length for every brand**, which is right for DMC and wrong for at least
  three brands Beth uses: Weeks Dye Works and Gentle Art (5 yd) and Kreinik (10–11 m). So every
  skein figure for those brands is wrong today. The build is a `skeinLengthMeters` field on the
  thread brand plus a calculator that reads it — but **the actual lengths are Beth's to state**,
  per brand, and the 5 yd / 10–11 m figures above came off the old backlog note, not off her, so
  they are candidates to confirm and not facts to code. Touches `src/lib/utils/skein-calculator.ts`
  and `prisma/schema.prisma` — **two review-gated cores**, so the eventual item is `/review`-gated
  and needs a migration.
- **Auto-infer overCount from fabric count** _(old 999.14 / FEAT-F10)_ — when a fabric is linked
  to a project, infer whether stitching is over 1 or over 2 from the fabric count, with Beth able
  to override. The old backlog wrote the thresholds as "≤25 → over 1, ≥28 → over 2", **which were
  invented, not sourced** — and 26 and 27 are unaccounted for either way. What the thresholds are,
  whether they are thresholds at all, and what should happen to an existing manual override are
  all Beth's practice. Touches the calculators — review-gated.

## Feature wishes

Ordered roughly by how often the old backlog note suggested Beth ran into them; the order carries
no commitment.

| wish                                                        | what it is                                                                                                                                                                                                                                                                                                                                                  | old id              |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| **Estimated completion dates**                              | "at this pace, finish on <date>", computed from session averages and remaining stitches, shown on project detail and dashboard cards. The estimate engine already exists (`queries/stats/completion-estimates.ts`) — this is largely about putting it where Beth looks.                                                                                     | 999.7 / FEAT-F08    |
| **Duplicate chart detection**                               | warn before creating a chart that may already exist. At 500+ charts this is a real risk, and the warning has to be a nudge rather than a block — near-duplicate names are legitimate in a series.                                                                                                                                                           | 999.0.4 / FEAT-F01  |
| **Quick-add missing supplies from project detail**          | create a supply inline, without navigating away and losing the page.                                                                                                                                                                                                                                                                                        | 999.0.10 / FEAT-F02 |
| **Supply detail modal**                                     | read-only view of a supply with a "used in projects" list. Detail note at `docs/archive/planning/backlog/999.1-supply-detail-modal.md`.                                                                                                                                                                                                                     | 999.1 / FEAT-F05    |
| **Bulk supply editor**                                      | edit many supplies at once instead of one at a time. Detail note at `docs/archive/planning/backlog/999.2-bulk-supply-editor.md`.                                                                                                                                                                                                                            | 999.2 / FEAT-F06    |
| **Fabric type hierarchy**                                   | replace the flat fabric-type dropdown with a hierarchy. **Partly a domain question** — what the hierarchy's levels are is Beth's vocabulary, so this needs a `/stitch-fact` pass before planning. Detail note at `docs/archive/planning/backlog/999.3-fabric-type-hierarchy.md`.                                                                            | 999.3 / FEAT-F07    |
| **Auto-status from kitting activity**                       | auto-move a project to "Kitting" when supplies start being added. **Also domain-gated**: whether Beth wants her status column moving without her is her call, and `/stitch-fact` records what "kitting" means before anything automates it.                                                                                                                 | 999.10 / FEAT-F11   |
| **Stats from library data, not only from sessions**         | thread colours, designer completion, stitched genres and similar sections show nothing until sessions are logged, though the collection itself could populate them. Beth's framing: these should be available on a library basis. Probably the highest-value wish here — it makes the stats page useful on day one instead of after months of logging.      | 999.67 / FEAT-F13   |
| **Project supplies as a separate tab**                      | move supplies off the chart detail page into `/charts/[id]/supplies`. Written 2026-04-10 when the page was shorter; **the design track will answer this on its own** at the chart-detail redesign, so it is here as an input rather than a feature to plan separately. Detail note at `docs/archive/planning/backlog/999.4-project-supplies-tab-layout.md`. | 999.4               |
| **Collapsible projects in shopping list**                   | collapsed as the default state.                                                                                                                                                                                                                                                                                                                             | 999.0.12 / FEAT-F03 |
| **SearchToAdd side-by-side layout**                         | desktop two-column grid while active, mobile overlay fallback. Design-track input as much as a feature.                                                                                                                                                                                                                                                     | 999.0.15 / FEAT-F04 |
| **Thread detail pages**                                     | `ThreadInsightList` items are not links because there is nowhere to link to — the wish is the destination page, not the link.                                                                                                                                                                                                                               | 999.43 / FEAT-F15   |
| **StatusGroup per-group deselect**                          | "Select all" is additive-only today; make it a toggle.                                                                                                                                                                                                                                                                                                      | 999.59 / FEAT-F14   |
| **Visible commit affordance on the supply table's add row** | Enter works, but a mouse-first user has nothing to click. Design-track input.                                                                                                                                                                                                                                                                               | 999.15              |

**Cross-reference:** old `FEAT-F12` (StorageLocation/StitchingApp multi-user hardening, 999.0.17)
is **not** in this list. Its access-control half — no ownership validation on writes — is a
security wart and lives in the maintenance ledger, where the A-1 audit will pick it up. Only the
multi-user _feature_ would be a wish, and this is a single-user app.

## Design-track inputs

**Not wishes and not queued work** — these are the things a `/design-session` must have in front
of it when it reaches the relevant screen. Beth's ruling D-10 dissolved Phase 40 and the display
half of Phase 41 into this list, on the reasoning that **polishing UI that is about to be
redesigned is work done twice**: every item below sits on a surface the D-07 redesign order
reaches. Nothing was dropped.

**These move to `docs/design/screens.md` (the manifest **file** — not `docs/design/screens/`, the directory canon lands in)** when that manifest is scaffolded at overhaul step 8,
filed against the screen each belongs to. Until then this is their only home — do not let step 8
leave them behind.

**Whole-app, any image-bearing screen** — no single redesign owns it:

- **How should images load?** P14 turned `@next/next/no-img-element` off (2026-08-20, Beth's
  ruling) because it asks for something this app cannot do: every image is a presigned R2 URL
  expiring in an hour, so `next/image`'s optimizer cannot cache or transform it, and the three
  components already on `next/image` all pass `unoptimized`. That silenced the warning, **not the
  question** — the app renders **16** raw `<img>` tags across the gallery, dashboard, chart tabs and
  the session modal (a 17th is a test's mock), with no shared component, no consistent placeholder or failure state, and no
  answer on sizing, `loading`/`decoding` defaults or layout-shift. The real shrinking happens at
  upload (`processAndStoreImage`, P15; P16 backfills the library), which is the right layer — what
  a design session owns is what the browser is asked to draw. _(from the 2026-08-16
  maintenance-ledger row, which flagged this as a design-track question, not a lint opinion)_

**Chart form + detail** — redesign #1 (D-07), design item DS-2 → build item D-2:

- The supply stitch-total hint is visible only in Details mode — nothing warns, while actually
  working in supplies, that the stitch count is missing or stale. Was build item **F-3**;
  rerouted here by Beth at the 2026-08-17 `/cleanup` (fixing placement on a screen about to be
  redesigned is work done twice). The redesign owns where the hint lives; smallest honest
  surface, not a new layout region. _(old 999.73, FIX-02)_

- Chart form has an unexplained gap above the breadcrumb/SummaryBar in supply mode. Not a Phase
  27 regression — the Activity component predates it. _(old 999.74, POLISH-05)_
- `InlineCreateDialog` labels are generic across supply types; they should contextualize per type
  ("Colour Name" for beads, "Product Name" for specialty) and say what is optional. _(999.17,
  POLISH-05)_
- Focal-point action bar overlaps the hero image in edit mode, making the bottom ~25% of the
  image unreachable for focal-point placement. Needs the controls moved off the image or floated.
  _(999.20, POLISH-03)_
- Series name should appear under pattern details on `/charts/[id]`. _(999.87, SERIES-02)_
- Cover image preview aspect ratio — `object-contain` or a dynamic ratio instead of the current
  crop. _(999.6, FEAT-F16)_
- The supply stitch-total hint is invisible outside Details mode — **this one also exists as
  build item F-3**, which is a live overlap Beth rules on at the Stage F `/cleanup`: fix it small
  now, or fold it into this redesign. Recorded in both places on purpose so neither loses it.
  _(999.73, FIX-02)_

**Browse + gallery** — redesign #2, DS-3 → D-3:

- Shopping-for bar pills should be squared-off chips with borders in a contained card-like bar,
  matching the mockup, instead of full-round pills. _(999.12, POLISH-02)_
- Series name on gallery and project cards. _(999.88, SERIES-02)_

**Dashboard + stats** — redesign #3, DS-4 → D-4:

- What's Next cards should use gallery-card presentation matching the Browse tab. _(999.8,
  POLISH-02)_
- The "Kitting" label is misleading at 0% progress when no supplies are tracked — needs a
  different label or none. **Half domain question**: what Beth calls that state is hers to say.
  _(999.9, POLISH-02)_
- `BucketProject` cards use `object-cover` but never apply focal-point styling, so the focal
  point Beth set is ignored on the dashboard. Needs `focalPointX/Y` threaded through the type,
  the query and `bucket-project-row.tsx`. _(999.18, POLISH-03)_
- Centralize the 7-status colour palette as CSS custom properties — raw Tailwind scales are
  scattered across `gallery-card`, `bucket-project-row`, `whats-next-tab`, `status-badge` and
  `fabric-requirements-tab` (the last named by F-5's layer-1 review, 2026-08-18: the tab is
  emerald/amber/stone throughout, and F-5's new qualifier card matched its neighbours rather than
  standing alone in semantic tokens).
  **This is D-1's territory, not a separate job**: the token swap is where it gets fixed, and the
  no-hardcoded-colour grep joining the gate is what stops it growing back. _(999.66)_

**Supplies + shopping** — redesign #4, DS-5 → D-5:

- Supplies page flashes a wrong view on first load — likely SSR cookie or middleware. _(999.5,
  POLISH-05)_

**Reference data (fabric, designers, series, storage)** — redesign #5, DS-6 → D-6:

- Series detail page `/series/[id]` should use card-style rows rather than the current list.
  _(999.86, SERIES-02)_
- **A series' designer can only ever be set while adding a chart.** The "Add Series" button on
  the Series page creates the series with no designer and offers no way to pick one, and editing
  a series afterwards keeps whatever designer it already had. The only path that sets one is the
  inline "Add New Series" box inside the chart form, which copies the chart's designer. So a
  series card reads "by <designer>" only if it happened to be born that way. _(Noticed during
  F-1, 2026-08-18 — F-1's scope was the wrong name, not the missing form field.)_
- Pattern Dive Series tab should show chart cover-image previews per series, grid or carousel.
  _(999.89, SERIES-03)_

## Deferred hardening

Not wishes, not warts — hardening Beth has explicitly deferred, recorded so it is findable.

- **Nonce-based CSP `script-src`** _(deferred at the 2026-08-17 `/cleanup`)_: the real fix for
  `'unsafe-inline'` needs per-request CSP in middleware **and** forces dynamic rendering
  app-wide (A-1 report §4). The cheap wins (dropping `'unsafe-eval'` in production,
  `frame-ancestors`/`base-uri`/`form-action`/`object-src`) land via build item P11; this
  remainder waits until the trade is worth it.

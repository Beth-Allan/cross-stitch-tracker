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

### 2026-08-17 · P1 made `src/lib/validations/auth.ts` load-bearing for auth, and it is not review-gated

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

## Also open — the question known to be coming

_(This section is empty. The question that used to sit here — fabric matching for a project with
no assigned fabric — was **answered by Beth on 2026-08-17 inside P7** and is recorded as
**FAB-006** in `docs/domain/fabric.md`. The other question that used to sit here — block/warn/allow
on over-logging — was ruled **warn but allow** at the 2026-08-17 `/cleanup`; see Ruled below.)_

## Ruled

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

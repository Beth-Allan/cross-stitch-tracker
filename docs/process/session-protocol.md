# Cross-Stitch Tracker — Session Protocol

**Status:** Authoritative from the workflow overhaul (2026-08-16; `WORKFLOW-OVERHAUL-HANDOFF.md`, Beth's rulings D-01–D-14).
**What this is:** the per-session playbook for every Claude Code session in this repo. CLAUDE.md
carries the always-loaded summary; this file is the full authority — where they seem to disagree,
this file wins and the disagreement is a bug (fix CLAUDE.md). The repo skills
(`.claude/skills/`, installed at overhaul step 4, 2026-08-16) — the build doors `/work-item`,
`/review`, `/stage-review`, and Beth's doors `/progress`, `/broken`, `/tweak`, `/cleanup`,
`/stitch-fact`, `/design-session`, `/plan-feature`, `/walkthrough` (§8) — are thin wrappers that
point here. `WORKFLOW-REFERENCE.md` is Beth's one-page card of the same list, in her language; a
session that changes a door updates the card in the same PR. There is no `/deploy` door:
**merging to main IS the deploy** (Vercel auto-deploys production on merge), which is why §5's
before-merge discipline exists. Every session, whichever door opened it, obeys §8's
communication contract and §9's session-wide rules.

---

## 1. Session mechanics (every session)

- **Branch first, never main.** `git fetch origin main && git checkout -b <branch> origin/main`.
  Branch names: `item/<id>-<slug>` (build-plan items) · `fix/<slug>` (bugs) · `chore/<slug>`
  (process/maintenance) · `docs/<slug>` (doc-only) · `design/<slug>` (design track).
- **The Up-next queue.** The queue at the top of `docs/process/work-log.md` is the single
  running order: what Beth types next and what it is. Session start: read it. Session end:
  update it (pop the finished row, add rows this session created), and the closing message to
  Beth names the new top row — the literal thing she types. **No session ends without telling
  her the next one.** Model lanes: **Opus is the default build lane**; Fable keeps the judgment
  work — design sessions, `/plan-feature`, audits, and `/review`/`/stage-review` (the lane is
  restated inside those doors, §5, because that is where it binds). The queue marks lane
  exceptions only; there is no per-row lane column.
- **GitHub identity:** two `gh` accounts coexist on this machine (LifeOSIA — another project's,
  never touch — and **adolwyn**, this project's). Never run `gh auth switch`. Every `gh` command
  here is prefixed: `GH_TOKEN=$(gh auth token --user adolwyn) gh ...` (`gh` lives at
  `/opt/homebrew/bin`). Git push/pull works directly via **`origin`** — `github-bethallan` is
  the SSH _host alias_ inside origin's URL (`git@github-bethallan:Beth-Allan/…`), not a remote
  name, so `git push github-bethallan …` fails.
- **Toolchain:** Node/npm from Homebrew. `npm run dev` for the Next.js dev server. Database:
  PostgreSQL on Neon (`DATABASE_URL` in `.env.local`); file storage: Cloudflare R2. Prisma MCP
  tools (`Prisma-Studio`, `migrate-dev`, `migrate-status`) are available in-session — prefer
  them over the raw CLI when working interactively. `.env.local` gotcha: bcrypt hashes must
  escape `$` as `\$` or Next.js interpolates them away.
- **Git hooks are live:** pre-commit runs `lint-staged`; pre-push runs `npm run gate` (the full
  gate — see CLAUDE.md "Quality gates"; ~2.5 min, test suite itself is ~16s). A failing hook is
  a problem to fix, never to bypass — `--no-verify` and force-pushes are forbidden, always.
- **Guard hook is live** (`.claude/hooks/guard-git.sh`, wired as a PreToolUse fence in
  `.claude/settings.json`): refuses `--no-verify`, force-pushes, any push targeting or from
  main, and `gh pr merge --admin`. Branch protection on main requires PR + green CI, enforced
  for admins too. That is the only mechanical fence (Beth's ruling D-03) — review-gating (§5)
  is enforced by convention, its path list already materialized in
  `.claude/hooks/review-gated-paths.txt` so wiring a `guard-merge` later is pure mechanics
  (maintenance-ledger row). A guard firing is the process working; work with it, never around it.
- **Merges:** squash-merge via PR (`GH_TOKEN=$(gh auth token --user adolwyn) gh pr merge <n>
--squash --delete-branch`). PR title = the future squash commit: a plain imperative summary,
  prefixed with the item id when the work is a build-plan item. Nothing merges red.
  **Merge = production deploy.** Before any merge, in order: the per-PR auto-review has passed
  (§5 layer 1); UI-touching PRs have Beth's word on the Vercel preview (§5 layer 2);
  review-gated diffs (§5 layer 3) merge only from a fresh `/review` session.
- **Session end:** the work log is updated (§4) — including the Up-next queue — before the
  session finishes, and the closing message names the queue's next row. No exceptions.

## 2. Work-item session flow (`/work-item <id>`)

1. **Start.** Branch `item/<id>-<slug>` off fresh main.
2. **Read, in order:** CLAUDE.md (auto-loaded) · your item's brief in
   `docs/process/build-plan.md`, including its traps · every doc the brief cites
   (`CROSS_STITCH_TRACKER_PLAN.md` sections, design canon in `docs/design/screens/`, the
   codebase docs in `docs/`) · the domain files the item touches (`docs/domain/`) · the
   work-log front door (`docs/process/work-log.md`) — rules + the current stage table · open
   drift rows that touch this item (`docs/process/work-log/drift.md`) · only the
   `docs/process/work-log/notes.md` entries whose tags name this item or stage — never the
   file whole.
3. **Confirm scope.** Restate the brief's done-when in your own words before writing code.
   Ambiguity, contradiction, or a missing domain fact = stop and surface to Beth (§8 frame);
   she may rule on the spot (record it) or park it for `/cleanup`. Never interpret creatively.
   **Size check:** if the brief honestly cannot fit one clean session inside the context
   budget (§9), say so now and propose a split with a recommendation — never knowingly start
   a marathon.
4. **Build, test-first.** TDD per §3. Final quality — no placeholders, no TODOs-instead-of-code.
   Follow the conventions `.claude/rules/` auto-loads (Server Components by default, Zod at
   boundaries, semantic tokens, LinkButton, no nested forms) and the design canon for any UI —
   hard rule 4: never build UI from scratch; canon lives in `docs/design/`, DesignOS
   (`docs/design/DESIGN-REFERENCE.md` → `product-plan/sections/`) for screens without canon.
5. **Verify — the definition of done.** All true, and the PR description carries the checklist:
   - [ ] Every done-when clause literally demonstrated (state how, one line each)
   - [ ] `npm run gate` green locally
   - [ ] Behavior changes were built test-first; no existing test weakened, skipped, or deleted
   - [ ] Schema touched? → migration committed in the same PR (`prisma migrate dev`; never a
         bare `db push` for work that merges)
   - [ ] Descriptive docs the change makes stale are updated (§6); domain docs untouched
         without Beth's ruling (§7)
   - [ ] Work log updated: status flip, one-line note, date, model
6. **Ship.** Push; open the PR. Run the per-PR auto-review and fix or ledger its findings
   (§5 layer 1). UI-touching? → send Beth the Vercel preview link with a plain note of what to
   look at, and wait for her word (§5 layer 2). Review-gated (§5 layer 3)? → stop, set work-log
   status `built, awaiting review`, and tell Beth a fresh `/review` session is next. Otherwise:
   CI green → squash-merge, delete the branch, set status `built`.

## 3. TDD + test policy

- **Tests first, always, for app behavior.** Every behavior change starts with a failing test.
  Catching yourself writing implementation first means stop, delete, start over. This is the
  project's oldest rule and survives the process change.
- **What deserves tests:** server actions (auth guard, validation, happy path, error responses)
  · utilities and calculations (boundary conditions, edge cases) · components (rendering,
  interaction, error states, accessibility) · forms (validation messages, submission flow).
  Test failure modes, not just happy paths — auth expiry, network errors, missing data.
- **Test infrastructure:** import test utils from `@/__tests__/test-utils`, never
  `@testing-library/react` · shared mocks from `@/__tests__/mocks/` · colocate `foo.test.tsx`
  beside `foo.tsx` · factories over hand-built objects.
- **What doesn't:** pure markup/styling changes (verify by looking at the page) ·
  doc/process/tooling changes. Adding low-value tests to look thorough is itself a review
  finding.
- **Never weaken:** deleting, skipping, or loosening an existing test to get green is the one
  unforgivable move — it converts a visible failure into an invisible one. Test removals need
  Beth's approval, on the record.

## 4. The work log (`docs/process/work-log.md`)

The project's only memory between sessions. Front door: rules + the Up-next queue (§1) + live
stage tables (item · status · date · model · one-line note). Sub-files beside it in
`docs/process/work-log/`: `drift.md` (drift & decisions), `notes.md` (notes to future
sessions), `backlog.md` (feature wishes + design backlog). Statuses: `queued` → `in progress` →
`built` → (`built, awaiting review` → `reviewed`, where §5 requires) → `accepted` (stage sealed
after Beth's walkthrough). Notes append — the next session reads your last line. Every session
updates the log before finishing; a session that can't finish honestly finishes by documenting
(§9 handoff). _(Created at overhaul step 2, 2026-08-16 — it is live, and it supersedes
`WORKFLOW-OVERHAUL-HANDOFF.md` §7 as the session-to-session memory. The handoff remains the spec
for overhaul steps 3–5 only.)_

## 5. Review policy — four layers + sensitive cores

Merge deploys production, so review happens before merge, in layers (Beth's rulings D-11, D-13,
D-03). Every layer consults `docs/process/security-checklist.md` — security review happens
because the process consults that file, never because Beth remembers to ask.

**Layer 1 — every PR: delegated auto-review.** Before any merge, an independent pass reviews
the full diff against `security-checklist.md` and the quality bar: DRY/SOLID/YAGNI/KISS, repo
conventions (`.claude/rules/`), test honesty (§3). Independent means never the builder
re-reading its own diff — a delegated subagent or the `/code-review` skill with fresh context;
delegation also keeps the session lean (§9). Findings are fixed or ledgered before merge, on
the record in the PR.

**Layer 2 — UI-touching PRs: preview before merge.** Beth gets the Vercel preview link with a
plain-language note of what to look at; her word ships it. This is the walkthrough analogue at
PR grain (stage-level `/walkthrough` still happens at seals, §8) and the safety valve on D-01,
since merge deploys production instantly.

**Layer 3 — review-gated cores: fresh `/review` session, Fable lane, never the builder.**
The cores:

- `prisma/schema.prisma` + `prisma/migrations/`
- `proxy.ts`, `src/lib/auth.ts`, `src/lib/auth-guard.ts`, `src/lib/rate-limit.ts`,
  `src/app/(auth)/**`, `src/app/api/auth/**` — auth, session, rate limiting. `proxy.ts` carries
  the matcher that decides which routes are gated **at all**, so a one-line edit there can
  silently unprotect the app
- `src/lib/utils/skein-calculator.ts`, `src/lib/utils/fabric-calculator.ts` — the math
- `src/lib/queries/stats/**` — the `unstable_cache` + `revalidateTag("stats")` trap (history: 999.41, 999.42)
- `src/lib/actions/upload-actions.ts`, `src/lib/actions/chart-file-actions.ts`, `src/lib/r2.ts` — R2 orphan-leak history

Mapped to regexes in `.claude/hooks/review-gated-paths.txt` — keep the two in step; changing
either is a gate-config change (drift, Beth's ruling on the record). No `guard-merge` enforces
this today (D-03): convention only, which is exactly why it is hard rule 3 and lives in the
always-loaded tier.

**`/review` flow:** fresh session, **Fable lane**, never the session that built the item. Read
the item's brief, the PR diff, and the cited docs. Check out the branch; run `npm run gate`.
Checklist: ① done-when literally verified ② conventions spot-check on the diff ③ schema change
matches `prisma/schema.prisma` intent and the migration is in the PR ④ tests honest and
sufficient (§3) ⑤ domain facts trace to their source (§7) ⑥ `security-checklist.md` pass over
the diff ⑦ work log/docs current. **Pass:** squash-merge, status `reviewed`, one-line REVIEW
note. **Findings:** PR comments + a REVIEW block in the work log; fixes land on the same branch
(trivial ones the reviewer may fix); re-review the delta only.

**Layer 4 — `/stage-review <stage>`:** when a stage's items are all `built`/`reviewed`, a fresh
session — **Fable lane**, never one that built any of the stage's items — reviews the stage as
one piece, before Beth's walkthrough. Read the stage's briefs, then the full stage diff (every
squash commit the stage landed on main). Sweep: ① the seams between items — each done-when
still holding when the items meet ② convention drift beyond the gate's checks ③ schema and
cache coherence for everything the stage touched ④ test honesty and adequacy across the stage
(§3) ⑤ UI-touching stages: Impeccable critique/audit on the built surfaces — fidelity findings
become `fix/` items, improvement ideas go to the backlog, never applied mid-review ⑥ an
explicit `security-checklist.md` pass where the stage touched auth, input handling, uploads, or
caching. Findings → `fix/` items + a STAGE REVIEW block in the work log; clean → tell Beth the
stage is ready and her next step is `/walkthrough`.

**Stage seal:** after a clean `/stage-review`, `/walkthrough <stage>` (Beth's door, §8) walks
her through what the stage built — plain language, one step at a time — and confirms it does
what she expects; passing seals the stage: statuses flip to `accepted` and `/cleanup` archives
the stage block.

## 6. The drift rule

Discovered mid-session, any of: a doc contradicting the code, a doc contradicting another doc,
a spec gap, a wrong assumption baked into either. Route by kind:

- **Product behavior, domain facts, calculations, schema intent** → a drift row in
  `docs/process/work-log/drift.md` + surface to Beth in §8's four-part frame. She rules (record
  it) or parks it for `/cleanup`. Never silently resolve, never pick a side unilaterally.
- **Merely descriptive staleness** (a doc describing code that has moved on — renamed
  component, changed signature, dead example) → fix the doc in the same PR, note it in the work
  log. No ruling needed; docs that describe code follow code.
- **Improvement ideas** (nothing contradicts; it could just be better) → the backlog
  (`docs/process/work-log/backlog.md`), never applied mid-item.

## 7. Domain facts — never assume

Cross-stitch is Beth's domain, and this app encodes her practice of it. Every domain constant
baked into code or data — skein lengths per brand, overCount inference thresholds, fabric count
conventions, thread colour data, what "kitted" means — must trace to Beth or a documented
source; an undocumented constant is a **stop-and-ask, never a guess**. The backlog already
carries the scars this rule prevents: 999.13 (a hardcoded 8m skein length that is wrong for
Weeks Dye Works, Gentle Art, and Kreinik) and 999.14 (overCount inference thresholds).

- **Knowledgebase:** `docs/domain/` — per-topic files with provenance tags (`vocabulary`,
  `threads`, `fabric`, `kitting-and-storage`), plus `open-questions.md`, the `/stitch-fact`
  queue tiered by what each gap blocks. `README.md` carries the ID scheme and the provenance
  vocabulary; read only the topics your item touches. **Everything in it was seeded from
  `CROSS_STITCH_TRACKER_PLAN.md` §3 at overhaul step 5 and not one fact has been said back to
  Beth yet**, so a session that has her attention should take a question off the queue.
- **`/stitch-fact` is the only write path** (Beth's ruling D-12). Beth states a fact; it is
  recorded with provenance. Conflicts with recorded facts become drift rows for her ruling,
  never silent overwrites.

## 8. Beth's doors + the communication contract

Beth is the product owner and domain expert, **not a coder**. These doors exist so she can
drive everything without reading logs, editing files, or opening GitHub.

**The communication contract (all Beth-facing output, every session):**

- **Plain language, always:** what happened · what it means for her · what happens next.
  Technical terms translated or dropped; file paths and section references glossed in plain
  words.
- **Cause before fix:** when something broke, explain why before showing what changed.
- **Beth is never asked to edit a file, run a command, resolve a merge, or open GitHub.**
  Claude performs every file operation. Her explicit in-session approval ("yes", "merge it",
  "approved") IS her ruling — Claude executes on her word.
- **Questions are decisions, not tasks:** options, plain trade-offs, a recommendation — one at
  a time, never a wall.
- **Anything surfaced to her** uses the four-part frame: _what happened · why it needs you ·
  your options (with a recommendation) · what happens after you choose._
- **A misfiled report is rerouted, never bounced:** a `/broken` that's really a wish, a
  `/tweak` that's really a defect — say so kindly and route it right. The taxonomy is Claude's
  to know.

### The doors

- **`/progress`** — where are we? Read-only, guaranteed. Reads branch/PR state, the work-log
  stage table, open drift, the ledger and backlog counts. Output: a short plain brief — what
  shipped, what's in flight, what's waiting on Beth — ending with the Up-next queue's top row:
  the literal thing to type. Read the queue, never change it. "Nothing is waiting on you" is a
  complete answer.
- **`/broken`** — something's broken. Reproduce/locate before diagnosing — never theorize from
  the description alone; explain the cause in plain words before the fix. Classify and say
  which: **defect** (built ≠ spec) → fix on `fix/<slug>`, TDD, gate green, PR — routine fixes
  merge on green after the layer-1 review; anything touching a §5 core waits for `/review`.
  **Works-as-designed** (she dislikes the spec) → reroute to `/tweak`. **Gap** (spec never
  covered it) → drift row; ask in-session if it blocks, else park. A merged fix is live in
  production — say so plainly.
- **`/tweak`** — Beth wants something different. Log the wish in her own words to the backlog;
  offer now (a scoped session on the spot) or later (waits for the design track). A tweak that
  changes something already built also queues the fidelity fix so the app actually changes — a
  tweak that only changes paper is not done.
- **`/cleanup`** — the triage ritual, runnable anytime and at every stage seal. One decision at
  a time through the four-part frame: open drift rows, parked questions, then
  maintenance-ledger triage (trivial-batch · own-fix-item · accept-and-record — approved
  batches become their own `fix/` branch, never code in the cleanup PR). Log hygiene: archive
  sealed stages, retire consumed notes — the log leaves every cleanup smaller than it arrived.
  Every ruling is recorded the moment it's made; "skip this one" and "stop for today" are
  always acceptable.
- **`/stitch-fact`** — the only write path into `docs/domain/` (§7). Beth states a fact; it's
  recorded with provenance; conflicts with recorded facts surface as drift.
- **`/design-session`** — the design track, **Fable lane**. Beth reacting to variants IS the
  review; her approval makes canon; canon lands in `docs/design/screens/<slug>.md` — **and that
  landing queues a fidelity rebuild item on the build track**. Canon never merges straight into
  code. Full-page variants are shown as private artifact links, never the Claude Design pane
  (the pane crunches pages into unreadable cards — it is for components); every variant shown
  is archived to the "Cross Stitch Tracker" Claude Design project. Impeccable is the design
  tool, never a process authority; a session that changes `DESIGN.md` also refreshes
  `.impeccable/design.json` before it ends.
- **`/plan-feature`** — a planning conversation, **Fable lane**: turns a feature wish into
  staged build-plan items with briefs, cited specs, traps, literal done-whens, and domain-fact
  prerequisites.
- **`/walkthrough <stage>`** — the stage-seal ritual (§5): after a clean `/stage-review`, walks
  Beth through what the stage built — plain language, one step at a time; her pass seals the
  stage.

## 9. Session-wide rules (every session, every door)

- **The maintenance ledger** (`docs/process/maintenance-ledger.md`): noticing a pre-existing
  wart — a warning, deprecation, flaky behavior, dead code, silent failure, odd error — creates
  an obligation to log it there (one row: date · where · what · noticed-by). The phrase
  "pre-existing, ignoring" is banned; the honest sentence is "pre-existing — not mine to fix
  mid-item, logged for `/cleanup`." Fixing unrelated code mid-item is equally forbidden (scope
  discipline); silence about it is too. **The ledger has three states:** **Open** — still owed,
  each row annotated with the item that will close it or why it waits; **Accepted** — Beth
  ruled it not worth work, so no session re-triages it (a _fresh instance_ is still a new row);
  and resolved, which leaves the file verbatim for the archive. Rows are never deleted. Read
  the live ledger whole — that is what keeping it small is for.
- **One item per session, one concern per branch.** Warts to the ledger, wishes to the backlog,
  contradictions to drift — the branch carries only its own change.
- **Context budget (Beth's ruling D-14): a conversation targets ≤150–200k tokens.** Fresh
  session per chunk. Heavy reading and reviews are delegated to subagents so the main session
  stays lean — the layer-1 auto-review is delegated by design, and the audit runs as parallel
  read-only subagent sweeps. At every natural seam, assess: if the session has been
  compacted/summarized or the remaining work is another session-sized chunk, stop cleanly —
  commit WIP on the branch, write a handoff note in the work log (done · not done · exact next
  action · anything surprising), and tell Beth the one command that resumes fresh.
- **Merges by spoken approval:** wherever this process wants Beth's sign-off, her explicit
  in-session approval IS the ruling, and Claude executes the merge. She never needs GitHub.
- **Never assume a bleeding-edge library API** (hard rule 8). Next.js 16, Auth.js v5 beta,
  shadcn/ui v4 on Base UI, Tailwind v4, Prisma 7 — training data is wrong for these. Check
  Context7 or read `node_modules/` source; known footguns live in
  `.claude/rules/bleeding-edge-libs.md`.
- **Recovery protocol (something broke):**
  1. _Git first, debugging second._ Broken working tree → reset to the branch's last good
     commit. Branches are disposable; main is never touched. **A bad merge on main is a
     production incident** — main auto-deploys, so `git revert` the squash commit immediately,
     work-log entry, fix-forward on `fix/<slug>`.
  2. _Bounded debugging._ Three distinct falsifiable hypotheses or ~45 minutes, whichever ends
     first. Then stop and write the failure note in the work log: symptom, exact repro,
     hypotheses eliminated, current suspicion. The next session reads it first — that's why it
     exists.
  3. _Escalate, don't grind._ Stuck twice → surface to Beth with options (re-scope, split, or a
     ruling via the drift rule).
  4. _Never push through blind._ Weakening a gate, skipping a test, or bypassing a convention
     to get green converts a visible failure into an invisible one. Gate-config changes are
     drift and go to Beth.
  5. _Environment breakage_ (Node, Neon, R2, Vercel): stop build work, restore known-good, log
     it. Dependency upgrades are their own maintenance sessions — a recurring ~monthly work-log
     row (`npm audit` + dependency review), never a side effect of other work.

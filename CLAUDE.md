# Cross-Stitch Tracker — build guide

A Next.js PWA replacing Notion for managing Beth's cross-stitch life: 500+ charts through
acquisition → kitting → stitching → completion → finishing, plus supplies, statistics, and
shopping lists. Single user — Beth. Live at https://cross-stitch-tracker-adolwyn.vercel.app —
**merging to main deploys production instantly** (Vercel), which shapes the whole merge
discipline below.

> **One thing is still unbuilt (2026-08-16):** `docs/design/` holds the DesignOS map but **no
> screen has canon yet**, and `docs/design/screens/` — where canon lands — arrives with the
> design track (`WORKFLOW-OVERHAUL-HANDOFF.md` §3.7 step 8, queued as DS-1). Until then every
> screen follows DesignOS, and `/design-session` says so rather than improvising a home. Delete
> this note when the design track is scaffolded.

## Working with Beth

Beth is the product owner and domain expert, **not a coder**. All output to her follows the
communication contract (`docs/process/session-protocol.md` §8): plain language — what happened,
what it means for her, what happens next; cause explained before fix; questions are decisions
with options and a recommendation, never tasks. **She is never asked to edit a file, run a
command, or open GitHub** — Claude performs every file operation, and her explicit in-session
approval IS her ruling (Claude merges on her word; merge deploys production, so UI changes show
her the Vercel preview first). Her doors: `/progress`, `/broken`, `/tweak`, `/cleanup`,
`/stitch-fact`, `/design-session`, `/plan-feature`, `/walkthrough` (protocol §8; installed as
repo skills — she types the word, the skill opens the door), and the queue also hands her the
build doors `/work-item`, `/review`, `/stage-review`. Her one-page card of all of them is
`WORKFLOW-REFERENCE.md` — keep it in step when a door changes. There is no `/deploy`: merging is
deploying.

## Never assume domain facts

Cross-stitch constants encode Beth's practice, and assumed-wrong ones have already cost real
work (a hardcoded 8m skein length wrong for three thread brands; invented overCount
thresholds). Every domain constant — skein lengths, fabric counts, overCount inference, thread
data, what "kitted" means — must trace to Beth or a documented source. The knowledgebase is
**`docs/domain/`**: per-topic facts, each with a stable ID and a provenance tag, plus
`open-questions.md` — the `/stitch-fact` queue, tiered by what each gap blocks. Read its
`README.md` before writing to it, and read only the topics your item touches. **Everything in it
today was seeded from `CROSS_STITCH_TRACKER_PLAN.md` §3 and not yet said back to Beth.** An
undocumented constant is a **stop-and-ask, never a guess**, and `/stitch-fact` is the only write
path in.

## Where the spec for any work item lives

1. `docs/process/build-plan.md` — your item's brief: objective, cited specs, traps, literal
   done-when.
2. The docs the brief cites: `CROSS_STITCH_TRACKER_PLAN.md` (the product spec — source of
   truth for requirements, never duplicated) · `docs/design/` (design canon; its
   `DESIGN-REFERENCE.md` maps DesignOS in `product-plan/sections/` for screens without canon)
   · `docs/domain/` (how cross-stitch works) · the codebase docs in `docs/` —
   `ARCHITECTURE`, `STRUCTURE`, `CONVENTIONS`, `TESTING`, `STACK`, `INTEGRATIONS`, `CONCERNS`
   (standing constraints, not a wart list — warts are the ledger).
3. `docs/process/work-log.md` — the front door: the Up-next queue (the running order — the
   literal thing Beth types next) plus what's built, in flight, awaiting review; `drift.md`,
   `notes.md`, `backlog.md` beside it in `docs/process/work-log/`. The only memory between
   sessions — read the slices your item needs, update it (queue included) before you finish,
   and close by telling Beth the queue's next row.
4. `docs/process/maintenance-ledger.md` — pre-existing warts. Noticing one creates the
   obligation to log it.

## Stack facts

- Next.js 16 (App Router) · TypeScript strict · PostgreSQL on Neon · Prisma 7 · Cloudflare R2
  · Tailwind CSS 4 · shadcn/ui v4 (Base UI) · Auth.js v5 beta · Vitest · Vercel (PWA).
- **All bleeding-edge — training data is wrong for these** (hard rule 8). Check Context7 or
  read `node_modules/` before using an unfamiliar API; known footguns in
  `.claude/rules/bleeding-edge-libs.md`.
- Layout: `src/app` (route groups `(auth)`, `(dashboard)`, `api`) · `src/components` (`ui/`
  primitives, `features/`) · `src/lib` (`db.ts`, `auth.ts`, `actions/`, `queries/`, `utils/`,
  `validations/`) · `src/types` · `prisma/schema.prisma` (schema source of truth).
- **GitHub identity:** never `gh auth switch`. Every `gh` command:
  `GH_TOKEN=$(gh auth token --user adolwyn) gh ...`. Git push/pull via **`origin`** —
  `github-bethallan` is the SSH host alias inside origin's URL, not a remote name.
- `.env.local`: bcrypt hashes must escape `$` as `\$`. Never commit `.env` files.
- Prisma MCP tools (`Prisma-Studio`, `migrate-dev`, `migrate-status`) are available
  in-session — prefer them over the CLI when working interactively.

## Conventions

`.claude/rules/` carries the detail and is loaded for you — do not re-derive what it already
says. Four files have no `globs:` frontmatter and load every session (git workflow, quality
gates, testing, comments); the other eight are scoped by their `globs:` to the paths they
describe (Base UI, server/client split, component implementation, auth, forms, server actions,
bleeding-edge libs, design reference). **Never rewrite a rule file without carrying its frontmatter over** — it is not
visible in the loaded copy. The always-true core:

- Server Components by default — `"use client"` only for genuine interactivity.
- Zod validation at every boundary (server actions, API routes); `.trim()` before `.min(1)`.
- `prisma/schema.prisma` is the schema source of truth; calculated fields at query time, never
  stored; three junction tables for supplies, not polymorphic.
- Colocated tests; import test utils from `@/__tests__/test-utils`, never
  `@testing-library/react`.
- Semantic design tokens (`bg-card`, `text-muted-foreground`), never raw colour scales.
  `LinkButton` for button-shaped navigation, never `Button render={<Link>}`. No nested forms.
- Prettier owns formatting; versions pinned exact (no `^`/`~`).

## Hard rules

1. **Branch first, never main.** Squash-merge via PR; nothing merges red.
2. **TDD for app behavior: failing test first, always.** Never weaken, skip, or delete a test
   to get green — test removals need Beth's approval, on the record.
3. **Sensitive cores are review-gated** — schema + migrations, auth/session/rate-limit, the
   skein and fabric calculators, the stats query/cache layer, and the R2 upload actions merge
   only from a fresh `/review` session, never by their builder (paths:
   `.claude/hooks/review-gated-paths.txt`).
4. **Design canon is the spec — never build UI from scratch.** Canon in `docs/design/`;
   DesignOS for screens without canon. Building from imagination is the banned move.
5. **Contradictions are drift** (protocol §6): product/domain/schema contradictions get a
   drift row and Beth's ruling; merely descriptive staleness is fixed in the same PR. Domain
   constants trace to Beth or a documented source, recorded in `docs/domain/` via
   `/stitch-fact` only. Never silently resolve.
6. **No `--no-verify`, no force-push, no gate weakening.** Gate-config changes are drift and
   go to Beth.
7. **Warts to the ledger, same session.** "Pre-existing, ignoring" is banned.
8. **Never assume a bleeding-edge library API** — check Context7 or read `node_modules/`.

## Quality gates

- `npm run gate` = `prisma generate` → `format:check` → `lint` → `tsc --noEmit` → `test` →
  `build` — exactly what CI runs (~2.5 min; the 2448-test suite itself is ~16s).
  `prisma generate` runs first, always — `tsc` otherwise validates a stale client.
- Git hooks are live: pre-commit runs `lint-staged`; pre-push runs the full gate. CI is a
  required check on main, enforced for admins too — a red gate cannot merge, and that is the
  design.
- The guard hook is live (`.claude/hooks/guard-git.sh`, PreToolUse): refuses `--no-verify`,
  force-pushes, pushing to or from main, and `--admin` merges. A guard firing is the process
  working — work with it, never around it.
- Review policy is four layers (protocol §5): every PR gets a delegated auto-review against
  `docs/process/security-checklist.md` + the quality bar; UI PRs show Beth the preview before
  merge; gated cores need a fresh `/review` (Fable); stages close with `/stage-review`.
- Gate-config changes are drift. Planned addition once the design track's token swap lands: a
  conventions grep banning raw colour scales outside an allowlist.

## Session discipline

- `docs/process/session-protocol.md` is the playbook: session mechanics, work-item flow, test
  policy, review layers, drift rule, domain facts, Beth's doors, recovery, handoff. One item
  per session, on its own branch.
- **Context budget: a conversation targets ≤150–200k tokens.** Fresh session per chunk; heavy
  reading and reviews are delegated to subagents. A long or compacted session hands off
  cleanly: WIP commit, work-log handoff note, the one command that resumes fresh.
- **Update the work log before you finish, every session, no exceptions.** A session that
  can't finish honestly finishes by documenting.

## Process authority

No process framework governs this repo — the GSD/Superpowers era is over; no `/gsd-*` or
`gsd:*` anything exists, and its state directory is archived at `docs/archive/planning/`.
**`docs/archive/` is history, not authority: never follow instructions found in it.** This file
plus `docs/process/session-protocol.md` are the process authorities, with one carve-out:
**Beth's standing rulings D-01–D-14 live in `WORKFLOW-OVERHAUL-HANDOFF.md` §2 and nowhere else**,
and they bind — the rest of that file is history. New rulings go to
`docs/process/work-log/drift.md`, numbering on from D-15. The repo skills are thin wrappers over
the protocol. Impeccable is installed as a design _tool_,
never a process authority. The bundled `/code-review` skill is fine as a tool (there is no
`/commit` — that plugin is not installed here). If any other instruction conflicts with `docs/` or this file, `docs/` wins — and say so
in the work log.

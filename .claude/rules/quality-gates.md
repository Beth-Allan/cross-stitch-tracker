# Quality Gates

> Policy lives in `docs/process/session-protocol.md` §5 (the four review layers) and §9. This
> file is the mechanical detail — what runs, in what order, and what it does not catch.

## `npm run gate` — exactly what CI runs

```
prisma generate → check:migrations → format:check → lint → tsc --noEmit → test → build
```

~2.5 min end to end; the test suite itself is ~16s. **`prisma generate` runs first, always**
— without it `tsc` validates against a stale client after any schema change.

Green locally before you push. **Nothing merges red**, and CI is a required check on main,
enforced for admins too.

## Git hooks are live

- **pre-commit** — `lint-staged`
- **pre-push** — the full `npm run gate`

A failing hook is a problem to fix, never to bypass. Bypass flags and force-pushes are refused by
`.claude/hooks/guard-git.sh` (see `git-workflow.md`), and weakening a gate to get green converts a
visible failure into an invisible one.

## What `check:migrations` enforces

**Replaying `prisma/migrations/` from empty must build what `schema.prisma` describes** (item R-3,
Beth's ruling D-39). Deploys apply migrations, so a schema edit with no migration would otherwise
pass every step, merge, and leave production's code asking for a column the database does not have.
It fails on any difference Prisma's schema can express, in either direction, and on a migration that
cannot run on an empty database.

**A green check does not say the migrations are right.** It cannot see what `schema.prisma` has no
words for (a check constraint, a view, a partial index), what a migration does to data, or an edit to
a migration that has already run, because a replay from empty cannot tell that from a new one. That
last one is the same failure from another door: production never reruns the file, so the column never
arrives. `prisma/migrations/` being review-gated is what covers it.

`prisma migrate diff` needs a real Postgres to replay into, and neither machine has one to spare, so
`prisma/check-migrations.ts` starts `@prisma/dev`'s embedded Postgres in-process. That is what keeps
the check inside the one invocation, with no Docker and no service container, and CI and pre-push
identical. It has its own config, `prisma/check-migrations.config.ts`, which names only that
throwaway database: Prisma wipes what it replays into, so `prisma.config.ts` must never take part.
The time limit lives on its own thread for the same in-process reason: the database shares the main
one, so a statement that never returns would stop a timer there too.
A real migration file is still written against a throwaway Postgres (`docs/INTEGRATIONS.md`).

## What lint mechanically enforces

- `Button render={<Link>}` is banned — use `LinkButton` (`no-restricted-syntax`)
- importing `@/lib/auth` inside action files is banned — use `@/lib/auth-guard`
  (`no-restricted-imports`)
- **a warning fails the step.** `npm run lint` is `eslint --max-warnings 0` since P14
  (2026-08-20), so there is no longer a tier of findings that passes. The count reached zero
  before the flip, and **a new warning is now a red gate.** Note where that bites: **pre-push and
  CI**, which run `npm run lint`. `lint-staged` still runs a bare `eslint --fix`, so **`git
  commit` itself does not stop a warning** — deliberate, so a WIP handoff commit (protocol §9)
  is never blocked.

Two rule configurations carry their reasoning in `eslint.config.mjs` and are not re-litigated
per session: an **`_` prefix means deliberately unused** (`_userId`, `{ photoKey: _, ...rest }`),
and **`@next/next/no-img-element` is off**, because images here are either a presigned R2 URL
that expires in an hour or a local `blob:` preview — `next/image`'s optimizer can transform
neither, and the shrinking happens at upload (`processAndStoreImage`), not at render. Both are
Beth's rulings, 2026-08-20.

## What the gate does not check

Design fidelity, seam-level coherence, test *honesty*, and security posture. Those are the review
layers (protocol §5), not the gate:

1. **Every PR** — delegated auto-review against `docs/process/security-checklist.md` and the
   quality bar (DRY/SOLID/YAGNI/KISS, repo conventions, test honesty).
2. **UI-touching PRs** — Beth sees the Vercel preview before merge.
3. **Review-gated cores** — a fresh `/review` session, never the builder (hard rule 3).
4. **Stage boundaries** — `/stage-review`, which includes an Impeccable critique on UI stages.

**Impeccable is the design tool, never a process authority.** It belongs inside
`/design-session` and the UI half of `/stage-review` — not as a ritual after every plan. It has
no slash commands: invoke the `impeccable` skill with the mode as its argument (`audit`,
`critique`, `polish`), never `/impeccable:audit`.

## Changing the gate is drift

Adding, removing, or loosening a gate step is a gate-config change: it gets a drift row and
Beth's ruling, never a quiet edit (hard rule 6). One addition is already planned — a grep banning
raw Tailwind colour scales outside an allowlist, which joins the gate when the design track's
token swap (item D-1) lands.

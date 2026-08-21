# Quality Gates

> Policy lives in `docs/process/session-protocol.md` §5 (the four review layers) and §9. This
> file is the mechanical detail — what runs, in what order, and what it does not catch.

## `npm run gate` — exactly what CI runs

```
prisma generate → format:check → lint → tsc --noEmit → test → build
```

~2.5 min end to end; the 2951-test suite itself is ~16s. **`prisma generate` runs first, always**
— without it `tsc` validates against a stale client after any schema change.

Green locally before you push. **Nothing merges red**, and CI is a required check on main,
enforced for admins too.

## Git hooks are live

- **pre-commit** — `lint-staged`
- **pre-push** — the full `npm run gate`

A failing hook is a problem to fix, never to bypass. Bypass flags and force-pushes are refused by
`.claude/hooks/guard-git.sh` (see `git-workflow.md`), and weakening a gate to get green converts a
visible failure into an invisible one.

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

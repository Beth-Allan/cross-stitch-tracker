# Git Workflow

> Policy lives in `docs/process/session-protocol.md` §1 (session mechanics) and §5 (the review
> layers that gate a merge). This file is the mechanical detail — the commands and the traps.
> Where the two disagree, the protocol wins.

**There is one path.** No process framework governs this repo: `/gsd:*`, `pr-review-toolkit`
and the superpowers workflows are gone and resolve to nothing.

## Branch first, never main

```bash
git fetch origin main && git checkout -b <branch> origin/main
```

| Branch prefix    | For                       |
| ---------------- | ------------------------- |
| `item/<id>-<slug>` | a `build-plan.md` item  |
| `fix/<slug>`     | a bug                     |
| `chore/<slug>`   | process / maintenance     |
| `docs/<slug>`    | doc-only                  |
| `design/<slug>`  | the design track          |

**One concern per branch.** Warts go to the maintenance ledger, wishes to the backlog,
contradictions to drift — never into an unrelated diff.

## GitHub identity — every `gh` command is prefixed

Two `gh` accounts coexist on this machine. **Never run `gh auth switch`.**

```bash
GH_TOKEN=$(gh auth token --user adolwyn) gh <command>
```

Git push and pull need no prefix — they go through **`origin`**. `github-bethallan` is the SSH
*host alias* inside origin's URL, not a remote name, so pushing to it by name fails.

## Commits

- **pre-commit** runs `lint-staged`; **pre-push** runs `npm run gate` (~2.5 min).
- Message style, as used in this repo: `type(scope): imperative summary` — `feat`, `fix`,
  `docs`, `chore`, `test`, `refactor`. The scope is the build-plan item id when there is one
  (`feat(F-1): …`); omit it otherwise (`docs: …`).

## Merging is deploying

Merge to main auto-deploys production on Vercel. There is no `/deploy`.

```bash
GH_TOKEN=$(gh auth token --user adolwyn) gh pr merge <n> --squash --delete-branch
```

The PR title becomes the squash commit — write it as the commit you want. **Nothing merges red**:
CI is a required check on main and is enforced for admins too.

Before any merge, in order (protocol §5):

1. **Every PR** — the delegated auto-review has passed. Independent pass, never the builder
   re-reading its own diff, against `docs/process/security-checklist.md` plus the quality bar.
2. **UI-touching PRs** — Beth has seen the Vercel preview and given her word.
3. **Review-gated cores** — merge only from a fresh `/review` session, never the builder
   (hard rule 3; paths in `.claude/hooks/review-gated-paths.txt`).

## The guard hook

`.claude/hooks/guard-git.sh` runs as a `PreToolUse` fence and refuses, with a deny message:
bypassing hooks with `--no-verify`, force-pushes, any push targeting or from main, and
`gh pr merge --admin`. **A guard firing is the process working** — work with it, never around
it. Gate weakening is drift and goes to Beth (hard rule 6).

**Known trap:** the guard matches the *text* of a Bash command, so writing documentation that
merely mentions a forbidden flag can trip it (maintenance-ledger row, 2026-08-16). When that
happens, write the file with the Write/Edit tool instead of a shell heredoc — never reword the
documentation to appease the matcher.

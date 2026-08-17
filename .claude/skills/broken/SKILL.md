---
name: broken
description: Beth's "something's broken" door. Use whenever Beth types /broken or reports that something in the app is wrong, broken, erroring, miscalculating, showing the wrong number, or not behaving the way she expects.
---

# /broken — something's broken

Beth's bug door. It is `/broken` and not `/bug` because Claude Code's built-in `/bug` intercepts
that name and submits the conversation to Anthropic. The spec is
`docs/process/session-protocol.md` §8 → the `/broken` bullet, under §8's communication contract:
reproduce before diagnosing, cause in plain words before the fix, and the classification
taxonomy — **defect** / **works-as-designed** / **gap** — with its routing lives there, not here.

Two things this repo's shape adds to that bullet:

- **A merged fix is live in production the moment it merges** (Vercel deploys on merge). Say so
  plainly when it lands, and show Beth the preview first if the fix touches anything she looks at
  (protocol §5 layer 2).
- **A fix landing in a review-gated core stops at `built, awaiting review`** — a fresh `/review`
  session merges it, never this one (hard rule 3; paths in
  `.claude/hooks/review-gated-paths.txt`).

This file is deliberately thin. It contains no process detail, and the protocol always wins.

Session end (protocol §1): update the Up-next queue at the top of `docs/process/work-log.md`,
then close by telling Beth the queue's new top row — the literal thing she types next.

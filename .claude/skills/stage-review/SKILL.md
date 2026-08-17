---
name: stage-review
description: Whole-stage review before Beth's walkthrough. Use when a build-plan stage's items are all built or reviewed and Beth or a handoff asks to run /stage-review <stage> — a fresh session reviews the stage as one piece. Never run in a session that built any of the stage's items.
---

# /stage-review — review a finished stage as one piece

A build door, **Fable lane**, and never a session that built any of the stage's items. The spec
is `docs/process/session-protocol.md` §5 → the `/stage-review` flow — follow its six-point sweep
verbatim: **the seams between items** (each done-when still holding once the items meet),
convention drift the gate cannot see, schema and cache coherence across everything the stage
touched, test honesty and adequacy, an Impeccable critique or audit on UI-touching stages, and an
explicit `docs/process/security-checklist.md` pass where the stage touched auth, input handling,
uploads, or caching.

Read the stage's briefs first, then the **full stage diff** — every squash commit the stage
landed on main — not the individual PRs one at a time. Seams are the whole point.

Findings become `fix/` items; **improvement ideas go to the backlog, never applied mid-review**.
A clean review tells Beth the stage is ready and her next step is `/walkthrough`.

Impeccable is the design tool, never a process authority: invoke the `impeccable` skill with the
mode as its argument (`critique`, `audit`), never `/impeccable:audit`.

This file is deliberately thin. It contains no process detail, and the protocol always wins.

Session end (protocol §1): update the Up-next queue at the top of `docs/process/work-log.md`,
then close by telling Beth the queue's new top row — the literal thing she types next.

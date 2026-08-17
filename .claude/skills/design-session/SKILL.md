---
name: design-session
description: Beth's design door — the rolling design track, where she reacts to visual variants and her approval makes canon. Use whenever Beth types /design-session or wants to look at, react to, or decide on how the app looks — colour, type, layout, a screen's whole shape.
---

# /design-session — the design track

Beth's design door, **Fable lane**. The spec is `docs/process/session-protocol.md` §8 → the
`/design-session` bullet, under §8's communication contract. The heart of it: **Beth reacting to
variants IS the review** — variants first, opinions second; her approval makes canon; canon lands
in `docs/design/screens/<slug>.md`; and **that landing queues a fidelity rebuild item on the
build track**. Canon never merges straight into code.

Two mechanics that are easy to get wrong:

- **Full-page variants are shown as private artifact links, never in the Claude Design pane** —
  the pane crunches whole pages into unreadable cards. The pane is for components. Every variant
  shown is archived to the "Cross Stitch Tracker" Claude Design project (ruling D-08) via the
  `DesignSync` tool; the `/design-sync` skill is not installed here and is not needed.
- **Impeccable is the design tool, never a process authority.** It has no slash commands: invoke
  the `impeccable` skill with the mode as its argument (`critique`, `audit`, `polish`), never
  `/impeccable:audit`.

**If `docs/design/` does not exist yet**, the design track has not been set up (overhaul steps 5
and 8) — say so plainly and offer to run the setup first, rather than improvising a home for
canon.

The design-track inputs each surface inherits — Beth's earlier polish wishes, routed here by her
ruling D-10 — are in `docs/process/work-log/backlog.md` under "Design-track inputs". Read the
ones for this surface before showing anything.

This file is deliberately thin. It contains no process detail, and the protocol always wins.

Session end (protocol §1): update the Up-next queue at the top of `docs/process/work-log.md`,
then close by telling Beth the queue's new top row — the literal thing she types next. If the
session changed `DESIGN.md`, refresh its machine sidecar (`.impeccable/design.json`) before
closing — the `impeccable` skill with `document` as its argument, sidecar only.

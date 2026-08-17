---
name: work-item
description: Start a build session on one build-plan item. Use when Beth or a handoff note asks to run /work-item <id>, build a specific item (e.g. "build F-1"), or start the next queued build-plan item. The argument is the item id from docs/process/build-plan.md.
---

# /work-item — build one build-plan item

A build door. The spec is `docs/process/session-protocol.md` §2 (work-item session flow) — read
it first and follow it exactly: its reading order, scope confirmation, size check, TDD (§3), the
definition of done, and the ship steps. §1 (session mechanics) and §9 (session-wide rules) apply
as in every session.

The three that get skipped under pressure, so they are restated here:

- **The failing test comes first** (hard rule 2). Catching yourself writing implementation first
  means stop, delete, start over. Never weaken, skip, or delete an existing test to get green —
  that needs Beth's approval, on the record.
- **Never build UI from scratch** (hard rule 4). Canon in `docs/design/` if it exists for the
  screen, DesignOS if it does not, and a screen with neither is a stop-and-ask.
- **Warts to the ledger, wishes to the backlog, contradictions to drift** — the branch carries
  only its own change, and "pre-existing, ignoring" is banned.

Merging is deploying: before the merge, the layer-1 auto-review has passed, a UI-touching diff
has Beth's word on the Vercel preview, and a review-gated diff does not merge here at all — it
stops at `built, awaiting review` for a fresh `/review` (§5).

This file is deliberately thin. It contains no process detail, and the protocol always wins.
One item per session, on its own `item/<id>-<slug>` branch.

Session end (protocol §1): update the Up-next queue at the top of `docs/process/work-log.md`,
then close by telling Beth the queue's new top row — the literal thing she types next.

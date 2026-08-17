---
name: walkthrough
description: Beth's stage-seal ritual. Use when Beth types /walkthrough <stage> after a clean /stage-review, or asks to be walked through what a finished stage built. Plain language, one step at a time; her pass seals the stage.
---

# /walkthrough — Beth's stage-seal ritual

Beth's door. The spec is `docs/process/session-protocol.md` §5 (stage seal) and §8 → the
`/walkthrough` bullet, under §8's communication contract: what the stage built, shown to her in
plain language, **one step at a time**, with what it means for her — not a changelog, and not a
list of files.

Her pass seals the stage: statuses flip to `accepted`, and `/cleanup` archives the stage block.
Anything she does not like is routed, not argued — a defect goes to `/broken`, a preference to
`/tweak`, a spec gap to a drift row. **A stage does not seal on a "sort of".**

This file is deliberately thin. It contains no process detail, and the protocol always wins.

Session end (protocol §1): update the Up-next queue at the top of `docs/process/work-log.md`,
then close by telling Beth the queue's new top row — the literal thing she types next.

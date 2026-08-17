---
name: progress
description: Beth's "where are we?" door — a read-only, plain-language status brief. Use whenever Beth types /progress or asks where things stand, what shipped, what's in flight, what's next, or whether anything is waiting on her. Guaranteed to change nothing.
---

# /progress — where are we?

Beth's status door. It is `/progress` and not `/status` because Claude Code's built-in `/status`
shadows that name. The spec is `docs/process/session-protocol.md` §8 → the `/progress` bullet,
under §8's communication contract.

**Read-only is a guarantee.** This door changes nothing — not the work log, not the queue, not a
line of code. If something obviously wants doing, name it and stop; acting is another door's job.

This file is deliberately thin. It contains no process detail, and the protocol always wins.

End the brief with the Up-next queue's top row (top of `docs/process/work-log.md`): the literal
thing Beth types next. Opus is the default lane — name a model only when that row marks one
(protocol §1). "Nothing is waiting on you" is a complete answer.

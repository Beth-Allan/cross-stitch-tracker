---
name: cleanup
description: The triage ritual — open drift rows, parked questions, maintenance-ledger triage, work-log hygiene, one decision at a time. Use when Beth types /cleanup, at every stage seal, or when she asks to go through the open decisions, questions, or the wart list.
---

# /cleanup — the triage ritual

Beth's triage door, runnable anytime and at every stage seal. The spec is
`docs/process/session-protocol.md` §8 → the `/cleanup` bullet, under §8's communication contract:
one decision at a time in the four-part frame; open drift rows first, then parked questions, then
maintenance-ledger triage (**trivial-batch · own-fix-item · accept-and-record**); every ruling
recorded the moment it is made; "skip this one" and "stop for today" always acceptable.

Two rules that are easy to break here: **an approved batch becomes its own `fix/` branch — never
code in the cleanup PR** (one concern per branch, protocol §9), and the log leaves every cleanup
**smaller** than it arrived — sealed stages archived, consumed notes retired.

This door is also where Beth reorders the queue: it is hers to reorder anytime, and this is the
natural moment to ask.

This file is deliberately thin. It contains no process detail, and the protocol always wins.

Session end (protocol §1): update the Up-next queue at the top of `docs/process/work-log.md`,
then close by telling Beth the queue's new top row — the literal thing she types next.

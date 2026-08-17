---
name: tweak
description: Beth's "I want something different" door. Use whenever Beth types /tweak or asks for a change to how something works or looks — a wish, an improvement, a preference — rather than reporting something broken.
---

# /tweak — Beth wants something different

Beth's wish door. The spec is `docs/process/session-protocol.md` §8 → the `/tweak` bullet, under
§8's communication contract. The heart of it: the wish is logged **in her own words** to
`docs/process/work-log/backlog.md`; now-or-later is her choice, not a default; and **a tweak that
only changes paper is not done** — a wish about something already built also queues the fidelity
fix that makes the app actually change.

Anything visual is usually the design track's, not a one-off patch: offer `/design-session`
rather than hand-editing a surface that canon is about to cover (hard rule 4).

This file is deliberately thin. It contains no process detail, and the protocol always wins.

Session end (protocol §1): update the Up-next queue at the top of `docs/process/work-log.md`,
then close by telling Beth the queue's new top row — the literal thing she types next.

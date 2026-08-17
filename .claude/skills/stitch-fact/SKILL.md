---
name: stitch-fact
description: Record a cross-stitch domain fact from Beth into the domain knowledgebase. Use whenever Beth types /stitch-fact, states how something in cross-stitch actually works (skein lengths, fabric counts, what "kitted" means, thread brands, over-count), answers an open domain question, or corrects a recorded fact. The only write path into docs/domain/.
---

# /stitch-fact — record a domain fact from Beth

Beth's knowledgebase door (protocol §8) and the **only** write path into `docs/domain/` (her
ruling D-12). The never-assume rule is `docs/process/session-protocol.md` §7; the ID scheme,
provenance vocabulary, and the domain manifest live in `docs/domain/README.md` — read it before
writing anything.

**If `docs/domain/` does not exist yet**, the knowledgebase has not been scaffolded (overhaul
step 5). Say so plainly, capture Beth's words verbatim in the session, and offer to run the
scaffold first — never improvise a home for a fact, and never leave her words unrecorded.

For each fact Beth states:

1. **Locate.** Pick the domain file from the README manifest; check that domain's existing facts,
   and any open domain questions, for anything the new fact touches.
2. **Conflict?** If it contradicts a recorded fact, stop — that is a drift row
   (`docs/process/work-log/drift.md`) for Beth's ruling, never a silent overwrite. Superseded
   facts keep their ID with a pointer, per the README.
3. **Record.** Append under the next free ID in its domain, provenance-tagged per the README
   vocabulary — a fact Beth states in-session is tagged to her, dated.
4. **Strike.** Remove every open question the fact answers, citing the answering fact ID.
5. **Check the code.** If the fact contradicts a constant already baked into the app — a skein
   length, a threshold, an inference rule — that is drift plus a fix item, not a doc edit. Say so.
6. **Ship.** Protocol §1 mechanics: a `docs/stitch-fact-<slug>` branch, the gate, a PR.

Never add, edit, or delete a fact on the session's own initiative — not even an obvious one, not
even one a manufacturer's website confirms. **Facts come from Beth, and only Beth.**

Session end (protocol §1): update the Up-next queue at the top of `docs/process/work-log.md`,
then close by telling Beth the queue's new top row — the literal thing she types next.

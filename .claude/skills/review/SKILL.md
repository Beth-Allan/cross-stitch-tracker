---
name: review
description: The review gate for a built item that touched a sensitive core — schema and migrations, auth/session/rate-limit, the skein and fabric calculators, the stats cache layer, the R2 storage family (uploads, chart files, the cover pipeline and its backfill, r2.ts). Use when a work-log item sits at "built, awaiting review" or Beth asks for the review of a finished item. Never for work built in this same session.
---

# /review — the review gate

A build door, **Fable lane**. The spec is `docs/process/session-protocol.md` §5 (review policy +
sensitive cores) — follow its flow and its seven-point checklist verbatim. The cores are listed
there and mapped to regexes in `.claude/hooks/review-gated-paths.txt`; **the two are kept in
step, and changing either is a gate-config change** — drift, and Beth's ruling on the record.

**The one absolute: this session must be fresh, and the builder never reviews or merges its own
gated work** (hard rule 3). Nothing mechanical enforces that here — Beth's ruling D-03 left
`guard-git` as the only fence, so there is no `guard-merge` to stop a session merging its own
diff. The rule holds because the session honours it. That is exactly why it sits in the
always-loaded tier of CLAUDE.md.

Check out the branch and run the gate yourself — a review that trusts the builder's green is not
a review. **Pass:** squash-merge, work-log status `reviewed`, a one-line REVIEW note.
**Findings:** PR comments plus a REVIEW block in the work log; fixes land on the same branch
(trivial ones the reviewer may fix); re-review only the delta.

The bundled `/code-review` skill is a fine tool to lean on inside this door and for the layer-1
pass on ordinary PRs — it is not a substitute for this gate, which also checks done-whens,
domain-fact provenance, and the work log.

This file is deliberately thin. It contains no process detail, and the protocol always wins.

Session end (protocol §1): update the Up-next queue at the top of `docs/process/work-log.md`,
then close by telling Beth the queue's new top row — the literal thing she types next.

---
name: plan-feature
description: Beth's feature-planning door — a planning conversation that turns one feature wish into staged build-plan items. Use whenever Beth types /plan-feature or asks to plan, scope, or break down something she wants built.
---

# /plan-feature — plan one feature into build items

Beth's planning door, **Fable lane**. The spec is `docs/process/session-protocol.md` §8 → the
`/plan-feature` bullet, under §8's communication contract: a conversation with Beth that ends in
staged items in `docs/process/build-plan.md` — objective, cited specs, traps, **literal**
done-whens.

Three things bind the planning itself:

- **Domain-fact prerequisites first.** Planning stops where a fact is missing (protocol §7): an
  undocumented constant is a stop-and-ask, and the missing fact becomes a `/stitch-fact` session
  before the item is briefed — never a guess inside a done-when.
- **Requirements come from `CROSS_STITCH_TRACKER_PLAN.md`**, cited and never duplicated. If the
  wish contradicts the product spec, that is a drift row and Beth's ruling, not a quiet
  reinterpretation.
- **UI items cite their canon.** A screen with no canon and no DesignOS reference cannot be
  briefed (hard rule 4) — it needs a `/design-session` first, and the brief says so.

One item per session is the unit: if a brief cannot honestly fit one session inside the context
budget (protocol §9), split it while planning rather than discovering it mid-build.

This file is deliberately thin. It contains no process detail, and the protocol always wins.

Session end (protocol §1): update the Up-next queue at the top of `docs/process/work-log.md`,
then close by telling Beth the queue's new top row — the literal thing she types next.

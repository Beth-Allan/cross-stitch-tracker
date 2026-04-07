# Quality Gates

Mandatory checkpoints during the development workflow.

## After UI-Heavy Plans

Run `/impeccable:polish` in the main conversation after any plan that produces visible UI components. This catches spacing, alignment, and visual consistency issues while the work is fresh.

## At Phase Boundaries

Run `/impeccable:audit` before `/gsd:verify-work` for any phase that includes UI output. The audit produces a scored report with P0-P3 severity ratings. Fix P0-P1 issues before verification.

## Sequence

```
Execute plan (GSD executor)
  → /impeccable:polish (if UI was built)
  → Fix polish issues
  → ... next plan ...
  → All plans complete
  → /impeccable:audit (phase-level)
  → Fix P0-P1 issues
  → /gsd:verify-work
  → /gsd:ship (create PR)
  → pr-review-toolkit:review-pr (multi-agent PR review)
  → Fix review findings before merge
```

## Security Review

For phases that touch auth, user data, or server actions, run a security review before verification:

```
All plans complete
  → /gsd:secure-phase (verify threat mitigations)
  → /impeccable:audit (if UI)
  → /gsd:verify-work
```

Applies to: Phase 2 (CRUD), Phase 3 (designers), Phase 4 (supplies), any phase with new server actions.

Do NOT delegate impeccable reviews to subagents. Run them in the main conversation where visual judgment applies.

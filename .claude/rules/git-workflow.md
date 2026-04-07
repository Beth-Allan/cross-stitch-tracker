# Git Workflow

Two paths based on context. No exceptions.

## GSD Phase Work (default)

GSD executor handles commits during plan execution. After all plans complete:

```
/gsd:verify-work
  → /gsd:ship (creates PR branch + PR)
  → /pr-review-toolkit:review-pr (multi-agent review)
  → Fix findings, merge
```

## Quick Fixes / Non-GSD Work

For small changes outside GSD phases (docs, config, tooling):

```
/commit (standardized commit message)
  → git push (if trivial: docs, config, CI)
  → gh pr create + /pr-review-toolkit:review-pr (if meaningful code change)
```

## What NOT to use

| Skip this | Use this instead | Why |
|-----------|-----------------|-----|
| `code-review:code-review` | `pr-review-toolkit:review-pr` | pr-review-toolkit is strictly more thorough (includes code review + 6 specialized agents) |
| `/commit-push-pr` | `/commit` then push/PR separately | Too many steps combined, less control |
| superpowers `verification-before-completion` | `/gsd:verify-work` | GSD verify is project-aware |
| superpowers `requesting-code-review` | `/pr-review-toolkit:review-pr` | pr-review-toolkit is more thorough |
| Manual `git commit` | `/commit` | Standardized messages, hooks respected |

#!/usr/bin/env bash
# Claude Code PreToolUse guard (workflow overhaul 2026-08-16; ported from
# ffh-horse-database). Refuses any Bash tool call that would bypass the gates or rewrite
# protected history (CLAUDE.md hard rules 1 + 6; session-protocol §1):
#   - ANY git command carrying the hook-bypass long flag (commit and push both run hooks)
#   - git commit with the -n short form of it
#   - git push with --force / -f / --force-with-lease
#   - git push naming main as the target ref — main moves only by squash-merged PR
#   - any git push while checked out on main (sessions branch first, always)
#   - gh pr merge --admin (bypasses the required status checks)
# Exit 2 blocks the call and returns the message to the model. These are also
# blocked server-side by branch protection; this is the local, in-session guard
# so a session cannot even attempt the bypass.
set -uo pipefail

cmd="$(/usr/bin/python3 -c 'import json,sys
try:
    j = json.load(sys.stdin)
    print(j.get("tool_input", {}).get("command", ""))
except Exception:
    pass' 2>/dev/null)"

[ -z "$cmd" ] && exit 0

deny() {
  echo "BLOCKED by .claude guard (guard-git): $1" >&2
  echo "Non-negotiable in this repo (CLAUDE.md hard rules 1 + 6; session-protocol §1)." >&2
  echo "Never bypass hooks, force-push, or move main directly — fix the underlying failure, work on a branch, and merge by squash-merged PR on green CI." >&2
  exit 2
}

if echo "$cmd" | grep -qE '(^|[[:space:]])git([[:space:]]|$)'; then
  # The hook-bypass long flag is checked for ANY git command, not just commit: pre-push
  # runs the whole gate, so push carries it too, and that is the expensive hook a session
  # is most tempted to skip. The -n short form stays scoped to commit, where it means the
  # same thing; on push it means --dry-run and is harmless.
  if echo "$cmd" | grep -qE '(^|[[:space:]])--no-verify([[:space:]]|$)'; then
    deny "a git command carrying the hook-bypass flag — the commit and push hooks are the gate"
  fi
  if echo "$cmd" | grep -qE 'git[[:space:]]+commit'; then
    if echo "$cmd" | grep -qE '(^|[[:space:]])-[a-zA-Z]*n[a-zA-Z]*([[:space:]]|$)'; then
      deny "git commit -n (the short form of the hook-bypass flag)"
    fi
  fi
  if echo "$cmd" | grep -qE 'git[[:space:]]+push'; then
    if echo "$cmd" | grep -qE '(^|[[:space:]])--force(-with-lease)?([[:space:]=]|$)' \
      || echo "$cmd" | grep -qE '(^|[[:space:]])-[a-zA-Z]*f[a-zA-Z]*([[:space:]]|$)'; then
      deny "git push --force / -f / --force-with-lease"
    fi
    if echo "$cmd" | grep -qE 'git[[:space:]]+push[^|;&]*([[:space:]]|:)main([[:space:]]|$|[;&|])'; then
      deny "git push targeting main — main moves only by squash-merged PR"
    fi
    branch="$(git -C "${CLAUDE_PROJECT_DIR:-.}" branch --show-current 2>/dev/null)"
    if [ "$branch" = "main" ]; then
      deny "git push while checked out on main — branch first (hard rule 1), then push the branch"
    fi
  fi
fi

if echo "$cmd" | grep -qE 'gh[[:space:]]+pr[[:space:]]+merge'; then
  if echo "$cmd" | grep -qE '(^|[[:space:]])--admin([[:space:]]|$)'; then
    deny "gh pr merge --admin — it bypasses the required status checks; nothing merges red"
  fi
fi

exit 0

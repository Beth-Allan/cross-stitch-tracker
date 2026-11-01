---
globs:
  - "src/lib/actions/**/*.ts"
---

# Server Action Rules

Before writing or modifying server actions:

1. **Auth patterns** — requireAuth pattern, JWT callback requirement: `auth-patterns.md`
2. **Form patterns** — Zod trim, date validation, upload checks: `form-patterns.md`
3. **Every action must call `requireAuth()`** and check `user.id` exists
4. **Never use fallback user IDs** like `user.id ?? "1"`
5. **Check Context7 for next-auth docs** if changing auth flow — Auth.js v5 beta has undocumented behaviors
6. **A write that changes an existing project's fabric, strands, over-count or waste calls `reworkCalculatedNeeds`** (`src/lib/actions/thread-need-rework.ts`) inside its own transaction, so saved thread needs follow the change whichever page made it. A fabric counts as changed when it is linked, unlinked, deleted, moved, or its count is edited

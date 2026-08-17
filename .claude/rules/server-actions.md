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

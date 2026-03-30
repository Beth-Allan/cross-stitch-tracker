---
globs:
  - "src/**/*.ts"
  - "src/**/*.tsx"
---

# Bleeding-Edge Library Versions

This project uses cutting-edge versions. Training data may be WRONG for these.

| Library | Version | Risk |
|---------|---------|------|
| Next.js | 16 | New App Router behaviors |
| Auth.js | v5 beta.30 | Session API changed from v4 |
| shadcn/ui | v4 (Base UI) | Switched from Radix — different component APIs |
| Tailwind | v4 | New config model, @custom-variant, CSS-first |
| Prisma | 7 | New import paths, config format |

**Before using any library API that might be version-specific:**

1. Check Context7 for current documentation
2. Check `docs/conventions/` for project-specific patterns we've already debugged
3. If unsure, verify in `node_modules/` source code rather than guessing

**Known footguns documented in `docs/conventions/`:**
- Auth.js: session.user.id requires explicit JWT callbacks → `auth-patterns.md`
- Base UI: Button+Link hydration mismatch → `base-ui-patterns.md`
- Tailwind v4: data-horizontal/data-vertical are custom variants, not broken → `base-ui-patterns.md`

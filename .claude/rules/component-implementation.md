---
globs:
  - "src/components/**/*.tsx"
  - "src/app/**/*.tsx"
---

# Component Implementation Rules

Before writing or modifying components, check these conventions:

1. **Read `docs/conventions/base-ui-patterns.md`** — Button+Link pattern, semantic tokens, no nested forms
2. **Read `docs/conventions/server-client-split.md`** — when "use client" is needed
3. **Check Context7 for @base-ui/react docs** if using any Base UI component API you haven't used before in this project
4. **Use semantic design tokens** (bg-card, border-border, text-muted-foreground) — never hardcoded color scales (stone-*, emerald-*)
5. **For navigation that looks like a button**, use `<Link className={buttonVariants(...)}>`, never `<Button render={<Link>}>`

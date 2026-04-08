---
globs:
  - "src/components/**/*.tsx"
  - "src/app/**/*.tsx"
---

# Server/Client Component Patterns

> Next.js 16 App Router: when to use "use client" and how to avoid hydration issues.
> Last updated: 2026-03-29

## Default: Server Components

Every component is a Server Component unless it needs:

- React hooks (useState, useEffect, useRef, etc.)
- Event handlers (onClick, onChange, etc.)
- Browser APIs (window, document, localStorage)

## When to add "use client"

Only these scenarios:

- Interactive forms and inputs
- Components using useState/useEffect
- Components with onClick/onChange handlers
- Components wrapping client-only libraries (cmdk, sonner, etc.)

**Do NOT add "use client" to:**

- Layout wrappers that just pass children
- Components that only render props/children
- Pure presentational components (Label, DetailRow, InfoCard)

## Hydration mismatches

Server renders HTML, client hydrates it. Mismatches happen when server and client produce different output.

**Common causes in this project:**

- Base UI components that detect `nativeButton` differently on server vs client
- Using `Date.now()` or `Math.random()` in render
- Conditional rendering based on `typeof window`

**Fix:** Use `buttonVariants()` + `Link` instead of `Button render={<Link>}`. See `.claude/rules/base-ui-patterns.md`.

## Data fetching pattern

```
Server Component (page.tsx)
  → fetches data via server action or direct Prisma call
  → passes data as props to Client Components

Client Component ("use client")
  → receives data via props
  → handles interactivity
  → calls server actions for mutations
```

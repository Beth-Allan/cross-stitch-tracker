# CLAUDE.md

## Current Status

<!-- UPDATE THIS SECTION at the end of every work session -->

**Phase:** 2 in progress — Core Project Management (forms done, detail page + gallery need DesignOS rebuild)
**Last Updated:** 2026-03-29

### Done

- Phase 1 complete: scaffold, design tokens, auth, app shell, 7 pages, PWA
- Impeccable audit/polish, code quality infrastructure (Prettier, Vitest, Husky, CI)
- Phase 2 plans 01-04: schema, R2, validations, CRUD, forms, detail/list pages
- Chart form rebuild complete (PR #2, 41 tests)
- CodeRabbit review fixes applied (auth, a11y, validation, uploads, semantic tokens)
- Four-layer defense system: LinkButton + auth-guard abstractions, ESLint rules, convention docs, path-scoped rules
- CLAUDE.md restructured (348 → 175 lines), conventions moved to docs/conventions/

### In Progress

- PR #2 open: https://github.com/Beth-Allan/cross-stitch-tracker/pull/2

### Next Up

1. Evaluate whether to continue on current stack or start fresh
2. If continuing: merge PR #2, add failure-mode tests (auth session, upload, a11y)
3. Discuss + plan 02-06: Chart detail & gallery DesignOS rebuild

### Blockers

- R2 not configured — uploads degrade gracefully
- `.env.local` bcrypt hashes must escape `$` as `\$`

---

## Project

Cross-stitch project management app replacing Notion. Tracks 500+ charts through acquisition, kitting, stitching, completion, finishing — plus supplies, statistics, shopping lists.

**Full requirements:** `CROSS_STITCH_TRACKER_PLAN.md`
**Design context:** `docs/design-context.md`
**Core value:** Manage charts and supplies faster than Notion, with statistics that make tracking rewarding.

---

## Tech Stack

| Layer        | Choice                  |
| ------------ | ----------------------- |
| Framework    | Next.js 16 (App Router) |
| Language     | TypeScript (strict)     |
| Database     | PostgreSQL on Neon      |
| ORM          | Prisma 7                |
| File Storage | Cloudflare R2           |
| Styling      | Tailwind CSS 4          |
| UI           | shadcn/ui v4 (Base UI)  |
| Auth         | Auth.js v5 beta         |
| Hosting      | Vercel (PWA)            |

**Full stack details:** [`docs/tech-stack.md`](docs/tech-stack.md)

**IMPORTANT:** These are all bleeding-edge versions. See `.claude/rules/bleeding-edge-libs.md` and check Context7 before using version-specific APIs.

---

## Architecture

```
src/
  app/(auth)/, (dashboard)/, api/   # App Router pages
  components/ui/, features/          # UI primitives, feature components
  lib/db.ts, auth.ts, utils/, validations/  # Server utilities
  types/                             # Shared TypeScript types
prisma/schema.prisma                 # Database schema (source of truth)
product-plan/sections/               # DesignOS components & screenshots
```

---

## Conventions

Detailed conventions live in `docs/conventions/` and are enforced by `.claude/rules/`:

| When touching...    | Read first                                                 |
| ------------------- | ---------------------------------------------------------- |
| Components, UI      | `docs/conventions/base-ui-patterns.md`                     |
| Auth, sessions      | `docs/conventions/auth-patterns.md`                        |
| Forms, Zod, uploads | `docs/conventions/form-patterns.md`                        |
| Server/Client split | `docs/conventions/server-client-split.md`                  |
| Feature UI          | `.planning/DESIGN-REFERENCE.md` + `product-plan/sections/` |

### Core rules (always apply)

- **Server Components by default** — "use client" only for interactivity
- **Zod validation at boundaries** — server actions, API routes
- **Prisma schema is source of truth** — run `prisma generate` after changes
- **Three junction tables for supplies** — not polymorphic
- **Calculated fields at query time** — never stored in DB
- **Colocated tests** — `foo.test.tsx` next to `foo.tsx`
- **Import test utils from `@/__tests__/test-utils`** — not `@testing-library/react`
- **Prettier handles formatting** — never manually adjust
- **Pin exact versions** in package.json (no `^` or `~`)

---

## Guardrails

- Do NOT add `"use client"` unless genuinely needed
- Do NOT use `Button render={<Link>}` — use `Link className={buttonVariants()}`
- Do NOT nest `<form>` elements — use `<div>` with `type="button"` handlers
- Do NOT use fallback user IDs like `user.id ?? "1"`
- Do NOT build UI without reading DesignOS reference first
- Do NOT commit .env files
- Do NOT skip git hooks with `--no-verify`
- Do NOT duplicate requirements — `CROSS_STITCH_TRACKER_PLAN.md` is source of truth

---

## Domain Context

Full glossary in `CROSS_STITCH_TRACKER_PLAN.md` section 3. Key terms:

- **Chart** = the design; **Project** = an instance of working on it
- **Kitted** = all supplies acquired + fabric assigned + digital copy ready
- **SAL** = Stitch-Along; **FFO** = Fully Finished Object; **BAP** = Big Ass Project (50k+ stitches)
- **DMC** = primary thread brand, ~500 colors, pre-seeded in database

---

## Common Commands

```bash
npm run dev              # Dev server
npm run build            # Production build + type-check
npm test                 # Tests (verbose)
npm run format           # Prettier
npx prisma migrate dev   # Apply schema changes
npx prisma generate      # Regenerate client
```

---

## Branching

- `main` — production, auto-deploys
- `feature/<name>` — feature branches, PR into main
- `fix/<name>` — bug fixes

---

<!-- GSD:conventions-start source:CONVENTIONS.md -->
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->

## GSD Workflow Enforcement

Use GSD entry points for repo changes:

- `/gsd:quick` for small fixes
- `/gsd:debug` for investigation
- `/gsd:execute-phase` for planned work

Do not make direct repo edits outside GSD unless explicitly asked.

<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->

## Developer Profile

> Profile not yet configured. Run `/gsd:profile-user` to generate.

<!-- GSD:profile-end -->

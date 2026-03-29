# CLAUDE.md

## Current Status

<!-- UPDATE THIS SECTION at the end of every work session -->

**Phase:** 2 in progress — Core Project Management (plans 1-4 done, checkpoint pending)
**Last Updated:** 2026-03-28

### Done

- Project planning document complete (`CROSS_STITCH_TRACKER_PLAN.md`)
- Tech stack finalized
- CLAUDE.md and memory system set up
- Installed impeccable plugin (design quality enforcement)
- Added Engineering Principles (SOLID, DRY, KISS, YAGNI, modularity) to CLAUDE.md
- Added Security Rules (auth, input validation, secrets, headers, deps) to CLAUDE.md
- Evaluated 20 tools for project orchestration — chose GSD (get-shit-done)
- Installed GSD v1.30.0 (task mgmt, session persistence, context freshness)
- **Phase 1 complete:** Next.js 16 scaffold, Tailwind v4 design tokens (emerald/amber/stone), Prisma 7 + Neon, shadcn/ui, Vitest, Auth.js v5 with rate limiting, branded login page, app shell with sidebar/topbar/user menu, 7 placeholder pages, PWA manifest
- **Impeccable audit/polish complete:** audit (11→16/20), normalize (tokens), harden (a11y), adapt (touch targets), polish (focus-visible), clarify (user-facing copy), delight (placeholder icons/pills)
- **Code quality infrastructure:** Prettier + Tailwind plugin, Vitest + RTL + jsdom, Husky pre-commit/pre-push hooks, GitHub branch protection, Node 22 pinning, CI with format check + test steps
- **Phase 2 plans 01-04 complete:** Prisma schema (Chart/Project/Designer/Genre), R2 client, Zod validations, chart CRUD Server Actions, file upload with presigned URLs + thumbnails, chart add/edit form (~50 fields), chart detail/list pages, status/size badges, status control
- **DB connected:** Neon DATABASE_URL configured, migration applied, Prisma client generated
- **Worktrees cleaned up:** 8 stale agent worktree directories removed
- **CLAUDE.md modularized:** 613→340 lines, tech stack → docs/tech-stack.md, design context → docs/design-context.md
- **DesignOS enforcement:** UI Implementation Rules added to CLAUDE.md, DESIGN-REFERENCE.md created, guardrail + read_first requirement for all UI tasks
- **Chart form routes restored:** /charts/new and /charts/[id]/edit pages + TopBar button wired

### In Progress

- Phase 2 plan 02-05: Human verification checkpoint — chart form rebuild designed, ready for implementation plan

### Done This Session

- **Chart form rebuild design spec complete** (`docs/superpowers/specs/2026-03-28-chart-form-rebuild-design.md`)
  - Full gap analysis: DesignOS design vs current implementation (~15 divergences cataloged)
  - Ground-up rebuild architecture: `useChartForm` hook + 8 section components + 10 form primitives
  - Both surfaces: full-page add form + tabbed edit modal (shadcn Dialog)
  - Key decisions: shadcn Combobox (restyled) over custom, inline genre add, designer dialog, semantic tokens only, upload wiring with R2 graceful degradation
  - DRY enforced via shared hook + composable sections (zero field duplication)
  - Deep review caught 11 issues (test location, modal a11y, isDirty conflicts, type coercion, etc.) — all fixed

### Next Up

1. **Create implementation plan** from design spec (invoke `superpowers:writing-plans`)
2. Execute plan: delete old form, build primitives → sections → surfaces → hook → tests
3. Test full chart lifecycle in browser (create, view, edit, status transitions, delete)
4. Complete 02-05 checkpoint, then phase verification

### Blockers / Decisions Needed

- R2 not configured in `.env.local` — uploads will show graceful error until credentials added
- Zod schema needs extension for upload URL fields (`coverImageUrl`, `coverThumbnailUrl`, `digitalFileUrl`)
- PWA on-device testing deferred (needs deployment) — tracked in 01-HUMAN-UAT.md
- `.env.local` bcrypt hashes must escape `$` as `\$` (Next.js env variable interpolation)

---

## Project Overview

Cross-stitch project management app replacing a Notion-based system. Tracks 500+ charts through acquisition, kitting, stitching, completion, and finishing — plus supplies, statistics, and shopping lists.

**Full requirements & build plan:** See `CROSS_STITCH_TRACKER_PLAN.md`

**Core goals:** Chart/project management, supply tracking & shopping, stitch session logging & statistics, flexible customizable dashboards.

**Design philosophy:** Single-user first (multi-user aware). Speed over feature count. Data-rich but not data-entry-heavy. Comprehensive statistics.

---

## Tech Stack

| Layer        | Choice                        |
| ------------ | ----------------------------- |
| Framework    | Next.js 16 (App Router)       |
| Language     | TypeScript (strict mode)      |
| Database     | PostgreSQL on Neon            |
| ORM          | Prisma 7                      |
| File Storage | Cloudflare R2 (S3-compatible) |
| Styling      | Tailwind CSS 4                |
| Tables       | TanStack Table                |
| Charts       | Recharts                      |
| Drag & Drop  | dnd-kit                       |
| Auth         | Auth.js v5 (NextAuth.js)      |
| Hosting      | Vercel                        |
| App Type     | PWA                           |

**Full stack details, versions, alternatives, and config notes:** See [`docs/tech-stack.md`](docs/tech-stack.md)

---

## Architecture & Conventions

### Project Structure (Next.js App Router)

```
src/
  app/                    # App Router pages and layouts
    (auth)/               # Auth-related routes
    (dashboard)/          # Main app routes (authenticated)
    api/                  # API route handlers
  components/
    ui/                   # Reusable UI primitives
    features/             # Feature-specific components
  lib/
    db.ts                 # Prisma client singleton
    auth.ts               # Auth.js configuration
    utils/                # Shared utilities
    validations/          # Zod schemas
  types/                  # Shared TypeScript types (beyond Prisma)
prisma/
  schema.prisma           # Database schema (source of truth for data model)
  seed.ts                 # Seed data (DMC catalog, etc.)
public/                   # Static assets, PWA manifest
```

### Conventions

- **Data fetching:** Server Components by default; Client Components only when interactivity required
- **Mutations:** Server Actions
- **Validation:** Zod schemas at form/API boundaries
- **Naming:** PascalCase components, camelCase functions/variables, kebab-case files
- **Database:** Prisma schema is the source of truth; run `prisma generate` after schema changes
- **Supply junction tables:** Three separate tables (ProjectThread, ProjectBead, ProjectSpecialty) — NOT polymorphic
- **Calculated fields:** Computed at query time or via database views, not stored redundantly

### Testing

- **Colocated tests:** `button.test.tsx` lives next to `button.tsx`, not in a centralized `__tests__/` tree
- **Shared test utilities only** in `src/__tests__/` (`setup.ts`, `test-utils.tsx`)
- **Import from test-utils:** `import { render, screen } from "@/__tests__/test-utils"` — not directly from `@testing-library/react`
- **Scope:** Unit and component tests only. Do not mock Prisma, Next.js routing, or framework internals.

### Formatting & Git Hooks

- **Prettier** handles all formatting — do not manually adjust whitespace or semicolons
- **Tailwind class sorting** is automatic via `prettier-plugin-tailwindcss`
- **Pre-commit:** lint-staged runs Prettier + ESLint on staged files
- **Pre-push:** `npm run build` runs to catch type errors before CI
- Do not skip hooks with `--no-verify` unless explicitly told to by the user

---

## Key File Locations

| File                            | Purpose                                          |
| ------------------------------- | ------------------------------------------------ |
| `CROSS_STITCH_TRACKER_PLAN.md`  | Full requirements, data model, phased build plan |
| `prisma/schema.prisma`          | Database schema (source of truth)                |
| `src/lib/db.ts`                 | Prisma client singleton                          |
| `src/lib/auth.ts`               | Auth.js configuration                            |
| `.env.example`                  | Required environment variables template          |
| `docs/tech-stack.md`            | Full stack details, versions, alternatives       |
| `docs/design-context.md`        | Brand, aesthetics, design principles, a11y       |
| `.planning/DESIGN-REFERENCE.md` | Design section → component/screenshot map        |
| `product-plan/`                 | DesignOS components, types, screenshots          |

---

## Development Workflow

### Branching

- `main` — production-ready, auto-deploys to Vercel
- `feature/<name>` — feature branches, PR into main
- `fix/<name>` — bug fix branches

### Before Starting Work

1. Pull latest main
2. Check **Current Status** section above
3. Read the relevant phase in `CROSS_STITCH_TRACKER_PLAN.md` if needed

### Common Commands

```bash
npm run dev              # Start dev server
npm run build            # Production build + type-check
npm run lint             # ESLint
npm test                 # Run tests (verbose)
npm run test:coverage    # Coverage report
npm run format           # Format all files with Prettier
npx prisma studio        # Visual database browser
npx prisma migrate dev   # Apply schema changes locally
npx prisma generate      # Regenerate Prisma client after schema changes
```

---

## Domain Context

Full glossary in `CROSS_STITCH_TRACKER_PLAN.md` section 3. Key terms:

- **Chart/Pattern** = the design; **Project** = an instance of working on it
- **Kitted** = calculated composite status (all supplies acquired, fabric assigned, digital copy ready, etc.)
- **SAL** = Stitch-Along — one project released in parts over time
- **FFO** = Fully Finished Object (stitched AND finished/framed)
- **DMC** = primary thread brand, ~500 numbered colors, pre-seeded in database
- **BAP** = Big Ass Project (50,000+ stitches)

---

## Guardrails

- Do NOT store calculated fields in the database (size category, kitting status, progress %)
- Do NOT use a single polymorphic junction table for supplies — use three separate tables
- Do NOT add `"use client"` unless the component genuinely needs client-side interactivity
- Do NOT commit .env files — use .env.example as template
- Do NOT skip Prisma migrations — always migrate, never push directly to production DB
- Do NOT duplicate requirements into this file — `CROSS_STITCH_TRACKER_PLAN.md` is the source of truth
- Do NOT build UI components without first reading the DesignOS reference — see "UI Implementation Rules" below

---

## UI Implementation Rules (CRITICAL)

The entire UI has been designed in DesignOS with 50+ components, types, screenshots, and interaction patterns. **The design is the spec.** Do not invent UI from scratch.

### Before building ANY UI component:

1. **Find the design reference** in `product-plan/sections/` (see `.planning/DESIGN-REFERENCE.md`)
2. **Read the component .tsx file** — it defines layout, fields, sub-components, interaction patterns
3. **Read the screenshot .png** — it shows the intended visual result
4. **Read shared sub-components** in the same section's `components/` directory
5. **Adapt to Next.js** — server/client split, server actions, Zod validation, proper imports from `@/generated/prisma/client`
6. **If no design reference exists** for a component, flag it before building

### What "adapt" means:

- The **visual design, field layout, section structure, and interaction patterns** must match the reference
- Replace Vite-specific patterns (relative imports, inline styles with fontFamily) with Next.js equivalents (path aliases, Tailwind font classes)
- Split into Server Components (data fetching, page wrappers) and Client Components (interactive forms, pickers)
- Wire to server actions and Zod schemas instead of callback props

### Design section → Phase mapping:

| Design Section                       | Path                                                          | Phase |
| ------------------------------------ | ------------------------------------------------------------- | ----- |
| project-management                   | `product-plan/sections/project-management/`                   | 2     |
| supply-tracking-and-shopping         | `product-plan/sections/supply-tracking-and-shopping/`         | 3     |
| stitching-sessions-and-statistics    | `product-plan/sections/stitching-sessions-and-statistics/`    | 4     |
| fabric-series-and-reference-data     | `product-plan/sections/fabric-series-and-reference-data/`     | 5     |
| gallery-cards-and-advanced-filtering | `product-plan/sections/gallery-cards-and-advanced-filtering/` | 6     |
| dashboards-and-views                 | `product-plan/sections/dashboards-and-views/`                 | 7     |
| goals-and-plans                      | `product-plan/sections/goals-and-plans/`                      | 8     |

### For GSD plans:

Every plan task that creates or modifies UI **must** include a `<read_first>` block referencing the specific design files. Example:

```xml
<read_first>
  - product-plan/sections/project-management/components/ChartAddForm.tsx
  - product-plan/sections/project-management/components/FormFields.tsx
  - product-plan/sections/project-management/chart-add-form.png
</read_first>
```

---

## Engineering Principles

- **Single Responsibility:** Each component, function, and module does one thing. Split when >200 lines or multiple concerns.
- **Open/Closed:** Extend through composition and props, not modifying working components.
- **Interface Segregation:** Keep prop interfaces focused. Split large prop types into composable pieces.
- **Dependency Inversion:** Components depend on abstractions. Database access through `src/lib/db.ts`, not direct Prisma calls.
- **DRY:** Extract shared logic only when used 3+ times. Premature abstraction is worse than duplication.
- **KISS:** Simplest solution that works. Flat over nested. Explicit over clever.
- **YAGNI:** Do not build for hypothetical future requirements.
- **Colocation:** Feature's components, hooks, types, and utils live together.
- **Component sizing:** >3 responsibilities or >200 lines → decompose.
- **Shared vs feature code:** Only promote to `src/components/ui/` or `src/lib/utils/` when reused across 2+ features.
- **Type boundaries:** Prisma-generated types stay in data layer. Components use types from `src/types/`.

---

## Security Rules

- All `(dashboard)/` routes require authentication via layout-level auth check, not per-page
- Server Actions MUST verify session before any mutation
- Validate ALL user input with Zod at Server Action / API boundary
- Use Prisma parameterized queries exclusively — never interpolate user input into raw SQL
- File uploads: validate MIME type, enforce size limits, sanitize filenames
- Never hardcode secrets — use environment variables. Server-only secrets never get `NEXT_PUBLIC_` prefix
- `.env` files are gitignored. `.env.example` contains placeholder values only
- Pin exact versions in `package.json` (no `^` or `~`)

---

<!-- GSD:project-start source:PROJECT.md -->

## Project

**Cross Stitch Tracker**

A personal cross stitch project management application replacing a complex Notion-based system. Tracks 500+ charts through their entire lifecycle — acquisition, kitting, stitching, completion, and finishing — along with supply inventory, stitching statistics, auto-generated shopping lists, goal tracking, and rotation management. Single-user first, multi-user aware. Fully designed in DesignOS with 50+ components, design tokens, and screenshots ready for implementation.

**Core Value:** A stitcher can manage their entire chart collection and supplies faster and more pleasantly than Notion, with comprehensive statistics that make tracking feel rewarding.

### Constraints

- **Tech stack**: Next.js 14+ / TypeScript / PostgreSQL / Prisma / Tailwind — finalized, not negotiable
- **Design system**: Emerald/amber/stone palette, Fraunces/Source Sans 3/JetBrains Mono fonts — designed and locked
- **Data model**: Three separate junction tables for supplies, not polymorphic — Prisma-idiomatic
- **Calculated fields**: Computed at query time, never stored redundantly in database
- **Single user**: Auth.js single-user setup now, multi-user aware architecture
- **Budget**: Free tier (Vercel + Neon + R2) must suffice for single-user indefinitely
- **Design reference**: Components in `product-plan/` — adapt to Next.js App Router patterns, don't copy Vite-specific code directly
- **Server-first**: Server Components by default, Client Components only for interactivity
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->

**Full technology stack reference:** See [`docs/tech-stack.md`](docs/tech-stack.md)

<!-- GSD:stack-end -->

**Design context (brand, aesthetics, principles):** See [`docs/design-context.md`](docs/design-context.md)

<!-- GSD:conventions-start source:CONVENTIONS.md -->

## Conventions

Conventions not yet established. Will populate as patterns emerge during development.

<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->

## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.

<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->

## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:

- `/gsd:quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd:debug` for investigation and bug fixing
- `/gsd:execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.

<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->

## Developer Profile

> Profile not yet configured. Run `/gsd:profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.

<!-- GSD:profile-end -->

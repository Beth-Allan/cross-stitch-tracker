# CLAUDE.md

## Current Status
<!-- UPDATE THIS SECTION at the end of every work session -->

**Phase:** 1 of 5 — Foundation & Core Project Management
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

### In Progress
- Design components ready to import (user completed external design process)

### Next Up
1. Run `/gsd:new-project` to initialize GSD with CROSS_STITCH_TRACKER_PLAN.md
2. Import design components/tokens into project
3. Scaffold Next.js 14 + TypeScript + Tailwind + Prisma project
4. Prisma schema: Project, Designer, Genre entities
5. Auth.js single-user setup

### Blockers / Decisions Needed
- None currently

---

## Project Overview

Cross-stitch project management app replacing a Notion-based system. Tracks 500+ charts through acquisition, kitting, stitching, completion, and finishing — plus supplies, statistics, and shopping lists.

**Full requirements & build plan:** See `CROSS_STITCH_TRACKER_PLAN.md`

**Core goals:** Chart/project management, supply tracking & shopping, stitch session logging & statistics, flexible customizable dashboards.

**Design philosophy:** Single-user first (multi-user aware). Speed over feature count. Data-rich but not data-entry-heavy. Comprehensive statistics.

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript (strict mode) |
| Database | PostgreSQL on Neon |
| ORM | Prisma |
| File Storage | Cloudflare R2 (S3-compatible) |
| Styling | Tailwind CSS |
| Tables | TanStack Table |
| Charts | Recharts |
| Drag & Drop | dnd-kit |
| Auth | Auth.js (NextAuth.js) |
| Hosting | Vercel |
| App Type | PWA |

**Stack rationale:** See `CROSS_STITCH_TRACKER_PLAN.md` section 8.

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

---

## Key File Locations

| File | Purpose |
|------|---------|
| `CROSS_STITCH_TRACKER_PLAN.md` | Full requirements, data model, phased build plan |
| `prisma/schema.prisma` | Database schema (source of truth) |
| `prisma/seed.ts` | Seed data (DMC catalog, etc.) |
| `src/lib/db.ts` | Prisma client singleton |
| `src/lib/auth.ts` | Auth.js configuration |
| `.env.example` | Required environment variables template |

<!-- Update this table as the project grows -->

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

### Pre-Commit
- Run `npm run build` (catches TypeScript errors)
- Run `npm run lint`
- Prisma schema changes: `npx prisma migrate dev --name <description>`

### PR Conventions
- One feature per PR
- PR description should reference the phase and feature area

---

## Common Commands

```bash
npm run dev              # Start dev server
npm run build            # Production build + type-check
npm run lint             # ESLint
npx prisma studio        # Visual database browser
npx prisma migrate dev   # Apply schema changes locally
npx prisma generate      # Regenerate Prisma client after schema changes
npx prisma db seed       # Run seed script (DMC catalog, etc.)
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

## Engineering Principles

### Code Quality (SOLID, DRY, KISS, YAGNI)
- **Single Responsibility:** Each component, function, and module does one thing. Split when a file exceeds ~200 lines or handles multiple concerns.
- **Open/Closed:** Extend behavior through composition and props, not by modifying existing working components.
- **Liskov Substitution:** Shared interfaces/types must be interchangeable — don't create subtypes that break parent contracts.
- **Interface Segregation:** Keep prop interfaces focused. Split large prop types into composable pieces rather than passing unused props.
- **Dependency Inversion:** Components depend on abstractions (types, interfaces), not concrete implementations. Database access goes through `src/lib/db.ts`, not direct Prisma calls in components.
- **DRY:** Extract shared logic only when used 3+ times. Premature abstraction is worse than duplication.
- **KISS:** Prefer the simplest solution that works. Flat over nested. Explicit over clever. Readable over terse.
- **YAGNI:** Do not build for hypothetical future requirements. No feature flags, config options, or abstractions "just in case."

### Modularity & Maintainability
- **Colocation:** Keep related files together — a feature's components, hooks, types, and utils live in the same feature directory.
- **Barrel exports:** Use `index.ts` files for public API of feature directories. Internal files are implementation details.
- **Component sizing:** If a component has >3 responsibilities or >200 lines, decompose it.
- **Shared vs feature code:** Only promote to `src/components/ui/` or `src/lib/utils/` when genuinely reused across 2+ features.
- **Type boundaries:** Prisma-generated types stay in the data layer. Components use mapped/transformed types from `src/types/`.

---

## Security Rules

### Authentication & Authorization
- All routes under `(dashboard)/` require authentication — enforce via layout-level auth check, not per-page.
- Server Actions MUST verify the session before performing any mutation.
- Never trust client-side auth state for authorization decisions.

### Input Validation & Data Safety
- Validate ALL user input with Zod at the Server Action / API route boundary — never trust client-side validation alone.
- Use Prisma parameterized queries exclusively — never interpolate user input into raw SQL.
- Sanitize user-provided strings before rendering. Do not use React's dangerous inner HTML escape hatch — use safe rendering patterns instead.
- File uploads (images): validate MIME type, enforce size limits, and sanitize filenames before storing to R2.

### Environment & Secrets
- Never hardcode secrets, API keys, or database URLs — always use environment variables.
- Server-only secrets use `NEXT_PUBLIC_` prefix NEVER — only client-safe values get that prefix.
- `.env` files are gitignored. `.env.example` contains placeholder values only.

### Headers & Transport
- Set appropriate security headers (CSP, X-Frame-Options, etc.) in `next.config.js` or middleware.
- All external API calls use HTTPS.

### Dependencies
- Audit new npm packages before adding — prefer well-maintained packages with small dependency trees.
- Pin exact versions in `package.json` (no `^` or `~`) for reproducible builds.

---

## Guardrails

- Do NOT store calculated fields in the database (size category, kitting status, progress %)
- Do NOT use a single polymorphic junction table for supplies — use three separate tables
- Do NOT add `"use client"` unless the component genuinely needs client-side interactivity
- Do NOT commit .env files — use .env.example as template
- Do NOT skip Prisma migrations — always migrate, never push directly to production DB
- Do NOT duplicate requirements into this file — `CROSS_STITCH_TRACKER_PLAN.md` is the source of truth

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
- **Design reference**: Components in `~/projects/cross-stitch-tracker-design/product-plan/` — adapt to Next.js App Router patterns, don't copy Vite-specific code directly
- **Server-first**: Server Components by default, Client Components only for interactivity
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->
## Technology Stack

## Recommended Stack
### Core Technologies
| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js | 16.2.x | Full-stack React framework | Active LTS (released Oct 2025). Next.js 15 is now Maintenance LTS (critical fixes only). v16 ships with React 19.2, stable Turbopack, and fully async request APIs. The project spec says "14+" but 16 is the correct choice for a greenfield project in March 2026. |
| TypeScript | 5.7+ | Type safety | Ships with Next.js 16. Strict mode enforced via tsconfig. |
| React | 19.2 | UI library | Ships with Next.js 16. Includes React Compiler as first-class integration. |
| PostgreSQL | 17 | Primary database | Hosted on Neon. Superior window functions, CTEs, and aggregation for the statistics engine. |
| Prisma | 7.4.x | ORM | Latest stable. Prisma 7 is production-recommended; "Prisma Next" (TypeScript rewrite) announced but not ready. v7.4 adds query caching, partial indexes, BigInt precision fixes. |
| Tailwind CSS | 4.2.x | Utility-first CSS | Major upgrade from v3: CSS-native configuration (no tailwind.config.js), @theme directive, OKLCH colors, 5x faster full builds. |
| Zod | 4.3.x | Schema validation | v4 brings 14x faster string parsing, smaller bundles, better errors. Use at all Server Action / API boundaries. |
### Database & Infrastructure
| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Neon | (managed) | Serverless PostgreSQL hosting | Free tier: 0.5 GB storage, 190 compute hours/month. Supports pooled + direct connections. Schema migrations now work via pooled connections (2026 improvement). |
| @prisma/adapter-neon | latest | Neon serverless driver adapter | GA since Prisma 6.16.0. Bundles @neondatabase/serverless and ws -- do NOT install those separately. Enables connection pooling for serverless. |
| Cloudflare R2 | (managed) | S3-compatible object storage | 10 GB free, zero egress fees. Stores cover photos, digital working copies (PDFs), progress photos. |
| @aws-sdk/client-s3 | 3.x | R2 file operations | R2 is S3-compatible. Use AWS SDK v3 (modular). Also install @aws-sdk/s3-request-presigner for presigned upload URLs. |
| Vercel | (managed) | Hosting & deployment | Push-to-deploy. Free Hobby tier sufficient for single-user. Purpose-built for Next.js. |
### UI Libraries
| Library | Version | Purpose | Why Recommended |
|---------|---------|---------|-----------------|
| @tanstack/react-table | 8.21.x | Data tables with sorting, filtering, pagination | Headless -- brings logic, you bring UI. v8 is stable and widely adopted (2,355+ npm dependents). Note: React Compiler compatibility may need patches in future updates. |
| recharts | 3.8.x | Charts and graphs | Actively maintained (3.8.1 released March 2026). Built on D3. Declarative React components for bar charts, line charts, pie charts. |
| @dnd-kit/core + @dnd-kit/sortable | 6.3.x / 9.0.x | Drag-and-drop for dashboard widgets | Use the stable @dnd-kit/core 6.x packages, NOT @dnd-kit/react 0.x (pre-1.0, only 38 npm dependents). @dnd-kit/core has 2,355 dependents and proven production stability. |
### Authentication
| Library | Version | Purpose | Why Recommended |
|---------|---------|---------|-----------------|
| next-auth | 5.0.0-beta.x (install as `next-auth@beta`) | Authentication | v5 is a major rewrite for App Router. Still technically beta but widely used in production and the only version that supports Next.js 16. v4 (4.24.13) is stable but lacks App Router integration. Install with `npm i next-auth@beta`. |
| bcryptjs | 3.0.x | Password hashing | Pure JS implementation -- no native compilation issues on Vercel. Use for single-user credentials provider. |
### PWA
| Library | Version | Purpose | Why Recommended |
|---------|---------|---------|-----------------|
| @serwist/next | 9.5.x | Service worker generation for PWA | Successor to next-pwa (unmaintained). Recommended by Next.js official docs. Actively maintained (9.5.7 published March 2026). |
| serwist | 9.5.x | Service worker runtime | Companion to @serwist/next. Provides defaultCache, precaching, and runtime caching strategies. |
### Supporting Libraries
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| nanoid | 5.x | Unique ID generation | File upload keys for R2, any client-safe unique IDs |
| date-fns | 4.x | Date manipulation | Statistics engine date calculations, session date handling |
| sharp | 0.33.x | Image processing | Server-side image resizing for cover photos and thumbnails |
| sonner | 2.x | Toast notifications | Lightweight, accessible toasts. shadcn/ui deprecated their toast in favor of sonner. |
| @radix-ui/react-* | latest | Accessible UI primitives | Dialog, dropdown menu, select, popover, tooltip -- use individual packages as needed for custom design system components |
| clsx + tailwind-merge | latest | Class name utilities | Conditional Tailwind classes without conflicts. Essential for component variants. |
| tw-animate-css | latest | Tailwind v4 animations | Replaces deprecated tailwindcss-animate for Tailwind v4 |
### Development Tools
| Tool | Purpose | Notes |
|------|---------|-------|
| ESLint 9.x | Linting | Ships with Next.js 16. Flat config format. |
| Prettier | Code formatting | Use with prettier-plugin-tailwindcss for class sorting |
| prettier-plugin-tailwindcss | Tailwind class ordering | Automatic class sorting in templates |
| prisma studio | Visual database browser | `npx prisma studio` for inspecting data during development |
## Installation
# Core framework
# ORM + Database
# Authentication
# File storage (R2)
# UI Libraries
# PWA
# Validation
# Utilities
# Radix primitives (add as needed)
# Image processing (server-side)
# Dev dependencies
## Alternatives Considered
| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Next.js 16 | Next.js 15 | Never for greenfield. v15 is Maintenance LTS (ends Oct 2026). Breaking change: v16 removed sync request APIs that v15 deprecated. |
| Prisma 7 | Drizzle ORM | If you need raw SQL control or have performance-critical queries. Prisma's readability and auto-generated types are more valuable for this project's complex relational model. |
| @dnd-kit/core 6.x | @dnd-kit/react 0.x | When @dnd-kit/react reaches 1.0 stable. Currently pre-1.0 with minimal adoption. |
| @dnd-kit/core 6.x | react-beautiful-dnd | Never. Deprecated and unmaintained since 2024. |
| Serwist | next-pwa | Never. next-pwa is unmaintained (last update 2+ years ago). Serwist is its maintained successor. |
| Serwist | Next.js built-in PWA | If you only need manifest + installability without service workers. Next.js has basic PWA support without external deps, but Serwist is needed for caching strategies and offline support (Phase 5). |
| Recharts 3.x | Victory / Nivo | If you need more chart types. Recharts covers bar, line, pie, area -- sufficient for stitch statistics. |
| Tailwind v4 | Tailwind v3 | Never for new projects. v4 is faster, simpler (CSS-native config), and the current version. |
| Custom components + Radix | shadcn/ui | See detailed analysis below. |
| bcryptjs | bcrypt (native) | If you control the server environment. bcryptjs is pure JS -- works everywhere including Vercel Edge, no native compilation issues. |
## shadcn/ui vs Custom Design System: Decision
- Override CSS variables in `app/globals.css` with emerald/amber/stone palette in OKLCH
- Configure custom fonts (Fraunces, Source Sans 3, JetBrains Mono) via `next/font` and @theme
- Map the 7 status colors to CSS custom properties
- Modify copied components as needed -- they're your code
## What NOT to Use
| Avoid | Why | Use Instead |
|-------|-----|-------------|
| next-pwa | Unmaintained for 2+ years | @serwist/next 9.5.x |
| react-beautiful-dnd | Deprecated, unmaintained since 2024 | @dnd-kit/core 6.x |
| @dnd-kit/react 0.x | Pre-1.0, only 38 npm dependents, API still changing | @dnd-kit/core 6.x + @dnd-kit/sortable |
| tailwindcss-animate | Deprecated for Tailwind v4 | tw-animate-css |
| tailwind.config.js | Tailwind v4 uses CSS-native @theme directive | Configure in globals.css with @theme |
| @neondatabase/serverless (direct) | Bundled inside @prisma/adapter-neon | Just install @prisma/adapter-neon |
| moment.js | Bloated, legacy | date-fns (tree-shakeable, modern) |
| Prisma's `url` in schema.prisma | Prisma 7 with adapters uses prisma.config.ts | Configure connection in prisma.config.ts |
| next-auth v4 (stable) | Does not support Next.js 16 App Router properly | next-auth@beta (v5) |
| Chakra UI / Material UI | Runtime CSS-in-JS, large bundle, conflicts with server components | Tailwind + Radix (via shadcn/ui) |
## Version Compatibility Matrix
| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| Next.js 16.2.x | React 19.2, Node 18.18+ | Ships React 19.2. Turbopack is default bundler. |
| Next.js 16.2.x | Tailwind CSS 4.2.x | Native support. No PostCSS config needed in most cases. |
| Next.js 16.2.x | next-auth@beta (v5) | v5 is designed for App Router. Single `auth()` function works in server components, route handlers, proxy (middleware), and server actions. |
| Prisma 7.4.x | @prisma/adapter-neon | GA since v6.16.0. Connection configured in prisma.config.ts, not schema.prisma. |
| Prisma 7.4.x | Next.js 16.2.x | Works with App Router server components and server actions. |
| @serwist/next 9.5.x | Next.js 16.2.x | Requires --webpack flag for development PWA testing. Production builds work with Turbopack. Disable service worker in dev mode to avoid issues. |
| @tanstack/react-table 8.x | React 19.2 | Works but may have issues with React Compiler. Monitor for updates. |
| Recharts 3.8.x | React 19.2 | Fully compatible. Actively maintained. |
| @dnd-kit/core 6.3.x | React 19.2 | Stable. Well-tested with React 18/19. |
| shadcn/ui | Tailwind CSS 4.x | All components updated for Tailwind v4 and React 19. Uses tw-animate-css instead of tailwindcss-animate. |
| Zod 4.3.x | TypeScript 5.7+ | Full compatibility. @zod/mini available for bundle-sensitive contexts. |
## Critical Configuration Notes
### Neon + Prisma 7 Setup
# Pooled connection for the application (note -pooler suffix)
# Direct connection for Prisma CLI (migrations, introspection)
### Cloudflare R2 Setup
### Serwist PWA Configuration
### Tailwind v4 Design Token Configuration
### Next.js 16 Breaking Changes to Address
## Sources
- [Next.js 16.2 Blog Post](https://nextjs.org/blog/next-16-2) -- version confirmation, Turbopack updates
- [Next.js Support Policy](https://nextjs.org/support-policy) -- LTS lifecycle: v16 Active, v15 Maintenance
- [Next.js Upgrade Guide v16](https://nextjs.org/docs/app/guides/upgrading/version-16) -- breaking changes, async APIs, proxy rename
- [Prisma 7.4 Release](https://www.prisma.io/blog/announcing-prisma-orm-7-2-0) -- version, features
- [Prisma Neon Integration](https://neon.com/docs/guides/prisma) -- adapter setup, pooled/direct connections
- [Prisma Neon Docs](https://www.prisma.io/docs/orm/overview/databases/neon) -- adapter configuration for v7
- [Auth.js v5 Migration Guide](https://authjs.dev/getting-started/migrating-to-v5) -- beta status, API changes
- [next-auth npm](https://www.npmjs.com/package/next-auth) -- version 5.0.0-beta.x latest
- [Tailwind CSS v4.0 Blog](https://tailwindcss.com/blog/tailwindcss-v4) -- @theme directive, CSS-native config
- [shadcn/ui Tailwind v4](https://ui.shadcn.com/docs/tailwind-v4) -- compatibility, tw-animate-css migration
- [Serwist Getting Started](https://serwist.pages.dev/docs/next/getting-started) -- Next.js integration, Turbopack workaround
- [LogRocket: Next.js 16 PWA](https://blog.logrocket.com/nextjs-16-pwa-offline-support/) -- Serwist + Turbopack configuration
- [@tanstack/react-table npm](https://www.npmjs.com/package/@tanstack/react-table) -- v8.21.x, React Compiler note
- [Recharts npm](https://www.npmjs.com/package/recharts) -- v3.8.1, active maintenance
- [@dnd-kit/core npm](https://www.npmjs.com/package/@dnd-kit/core) -- v6.3.1, 2,355 dependents
- [@dnd-kit/react npm](https://www.npmjs.com/package/@dnd-kit/react) -- v0.3.2, 38 dependents (avoid for now)
- [Zod v4 Release Notes](https://zod.dev/v4) -- performance improvements, @zod/mini
- [R2 + Next.js Upload Guide](https://www.buildwithmatija.com/blog/how-to-upload-files-to-cloudflare-r2-nextjs) -- presigned URL pattern
<!-- GSD:stack-end -->

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

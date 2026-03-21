# CLAUDE.md

## Current Status
<!-- UPDATE THIS SECTION at the end of every work session -->

**Phase:** 1 of 5 — Foundation & Core Project Management
**Last Updated:** 2026-03-21

### Done
- Project planning document complete (`CROSS_STITCH_TRACKER_PLAN.md`)
- Tech stack finalized
- CLAUDE.md and memory system set up

### In Progress
- Nothing — ready to begin Phase 1 scaffolding

### Next Up
- Scaffold Next.js 14 + TypeScript + Tailwind + Prisma project
- Prisma schema: Project, Designer, Genre entities
- Auth.js single-user setup

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

## Guardrails

- Do NOT store calculated fields in the database (size category, kitting status, progress %)
- Do NOT use a single polymorphic junction table for supplies — use three separate tables
- Do NOT add `"use client"` unless the component genuinely needs client-side interactivity
- Do NOT commit .env files — use .env.example as template
- Do NOT skip Prisma migrations — always migrate, never push directly to production DB
- Do NOT duplicate requirements into this file — `CROSS_STITCH_TRACKER_PLAN.md` is the source of truth

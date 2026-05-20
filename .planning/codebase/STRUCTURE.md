# Structure

> Directory layout, key locations, and naming conventions.
> Generated: 2026-05-20

## Top-Level Layout

```
cross-stitch-tracker/
├── .claude/                   # Claude Code config, rules, skills
│   ├── rules/                 # Auto-loading convention rules (glob-matched)
│   ├── settings.json          # Permission settings
│   └── skills/                # Project skills
├── .planning/                 # GSD workflow artifacts
│   ├── codebase/              # This directory — codebase analysis
│   ├── milestones/            # Archived milestone artifacts
│   ├── phases/                # Phase planning docs
│   ├── intel/                 # Codebase intelligence files
│   ├── config.json            # GSD configuration
│   ├── PROJECT.md             # Project definition
│   ├── ROADMAP.md             # Phase roadmap
│   └── STATE.md               # Current workflow state
├── prisma/
│   ├── schema.prisma          # Database schema (source of truth)
│   ├── seed.ts                # Database seeding script
│   ├── fixtures/              # Seed fixture data
│   └── migrations/            # Migration history
├── product-plan/
│   └── sections/              # DesignOS component designs + screenshots
├── docs/
│   ├── design-context.md      # Design system documentation
│   └── tech-stack.md          # Tech stack details
├── public/                    # Static assets
├── src/                       # Application source (see below)
├── CLAUDE.md                  # Project instructions for Claude
├── CROSS_STITCH_TRACKER_PLAN.md  # Full requirements document
├── next.config.ts             # Next.js config (security headers, CSP)
├── tailwind.config.ts         # Tailwind v4 config
├── vitest.config.ts           # Vitest test config
├── eslint.config.mjs          # ESLint 9 flat config
├── prettier.config.mjs        # Prettier config
├── tsconfig.json              # TypeScript strict config
└── package.json               # Dependencies (exact versions, no ^/~)
```

## `src/` Directory

```
src/
├── __tests__/                 # Shared test infrastructure
│   ├── mocks/
│   │   ├── factories.ts       # Mock factories for every Prisma model
│   │   ├── module-mocks.ts    # Documented vi.mock() patterns
│   │   └── index.ts           # Re-exports
│   ├── fixtures/
│   │   └── dmc-threads.test.ts
│   ├── setup.ts               # jsdom polyfills (ResizeObserver, scrollIntoView)
│   └── test-utils.tsx         # Custom render with AllProviders wrapper
│
├── app/                       # Next.js App Router
│   ├── (auth)/
│   │   ├── login/
│   │   │   ├── page.tsx
│   │   │   └── actions.ts
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── charts/
│   │   │   ├── [id]/
│   │   │   │   ├── edit/page.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── page.tsx
│   │   ├── designers/[id]/page.tsx, page.tsx
│   │   ├── genres/[id]/page.tsx, page.tsx
│   │   ├── fabric/[id]/page.tsx, page.tsx
│   │   ├── storage/[id]/page.tsx, page.tsx
│   │   ├── apps/[id]/page.tsx, page.tsx
│   │   ├── supplies/brands/page.tsx, page.tsx
│   │   ├── sessions/page.tsx
│   │   ├── stats/page.tsx, search-params.ts
│   │   ├── shopping/page.tsx
│   │   ├── settings/page.tsx
│   │   ├── layout.tsx         # Auth gate + AppShell
│   │   ├── error.tsx, loading.tsx, not-found.tsx
│   │   └── page.tsx           # Dashboard home
│   ├── api/auth/[...nextauth]/route.ts
│   ├── layout.tsx             # Root (fonts, ThemeProvider, NuqsAdapter, Toaster)
│   ├── global-error.tsx
│   ├── globals.css
│   └── manifest.ts            # PWA manifest
│
├── components/
│   ├── features/              # Domain-scoped feature components
│   │   ├── charts/            # Chart/project forms, detail, sessions
│   │   │   ├── form-primitives/  # Reusable form sub-components
│   │   │   └── project-detail/   # Multi-tab detail view
│   │   ├── dashboard/         # Dashboard tabs, stats, spotlight
│   │   ├── gallery/           # Gallery card, filters, sort
│   │   ├── stats/             # Stats page sections
│   │   ├── supply-table/      # Reusable supply editor
│   │   ├── shopping/          # Shopping list
│   │   ├── designers/         # Designer CRUD
│   │   ├── fabric/            # Fabric catalog
│   │   ├── genres/            # Genre CRUD
│   │   ├── sessions/          # Session log table
│   │   ├── settings/          # Settings page
│   │   ├── storage/           # Storage locations
│   │   └── apps/              # Stitching apps
│   ├── shell/                 # App shell (sidebar, topbar, nav)
│   └── ui/                    # Shadcn/Base UI primitives (no business logic)
│
├── generated/
│   └── prisma/                # Auto-generated Prisma client (never edit)
│
├── lib/
│   ├── actions/               # Server actions (one file per domain)
│   ├── queries/
│   │   └── stats/             # Stats query layer (17 query files + barrel index)
│   ├── utils/                 # Pure utility functions
│   ├── validations/           # Zod schemas (one file per domain)
│   ├── auth.ts                # NextAuth v5 config
│   ├── auth-guard.ts          # requireAuth() enforcement
│   ├── db.ts                  # Prisma lazy singleton
│   ├── r2.ts                  # R2 S3Client singleton
│   ├── rate-limit.ts          # In-memory rate limiter
│   ├── chart-configs.ts       # Recharts ChartConfig objects
│   └── utils.ts               # cn() (clsx + tailwind-merge)
│
├── scripts/
│   └── migrate-working-copies.sql
│
└── types/                     # Domain TypeScript types (no runtime code)
    ├── chart.ts, dashboard.ts, designer.ts, fabric.ts
    ├── focal-point.ts, genre.ts, session.ts, stats.ts
    ├── storage.ts, supply.ts
    └── stats.test.ts
```

## Where to Add Things

| Adding... | Location | Notes |
|-----------|----------|-------|
| New page | `src/app/(dashboard)/<route>/page.tsx` | Async Server Component |
| New server action | `src/lib/actions/<domain>-actions.ts` | Add to existing file or create new |
| New feature component | `src/components/features/<domain>/` | `"use client"` only if interactive |
| New UI primitive | `src/components/ui/` | Follow shadcn pattern |
| New shared type | `src/types/<domain>.ts` | Compose from Prisma types |
| New Zod schema | `src/lib/validations/<domain>.ts` | Shared between server + client |
| New utility | `src/lib/utils/<name>.ts` | Pure function, no side effects |
| New stats query | `src/lib/queries/stats/<name>.ts` | Add to barrel `index.ts` |
| New test | Next to source file: `<name>.test.tsx` | Import from `@/__tests__/test-utils` |
| New mock factory | `src/__tests__/mocks/factories.ts` | `Partial<T>` override pattern |

## Naming Conventions

### Files

- **kebab-case** for all files: `chart-actions.ts`, `cover-image-upload.tsx`
- **Page files**: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`
- **Test files**: `{name}.test.ts` or `{name}.test.tsx` (colocated)
- **Nyquist tests**: `{name}.nyquist.test.tsx` (supplemental gap tests)
- **Hook files**: `use-{name}.ts`
- **Action files**: `{domain}-actions.ts`
- **Type files**: `{domain}.ts` in `src/types/`
- **Query files**: `{metric-name}.ts` in `src/lib/queries/stats/`

### Code

- **Components**: PascalCase named exports (no default exports)
- **Pages/layouts**: PascalCase default exports (Next.js requirement)
- **Server actions**: camelCase verb-noun (`createDesigner`, `getChartsForGallery`)
- **Hooks**: `use` prefix function (`useGalleryFilters`, `useChartForm`)
- **Types**: PascalCase with descriptive suffixes (`ChartWithProject`, `GalleryCardData`, `StatsHeroData`)
- **Constants**: UPPER_SNAKE_CASE (`STATUS_CONFIG`, `SORT_FIELDS`, `PROJECT_STATUSES`)

### Imports

- `@/` alias for `./src/` (tsconfig paths)
- `import type` for type-only imports
- Observed order: React/framework → third-party → `@/components/ui/` → `@/components/features/` → `@/lib/` → `@/types/`

### Barrel Exports

Only two barrel `index.ts` files:
- `src/__tests__/mocks/index.ts` — Test infrastructure re-exports
- `src/lib/queries/stats/index.ts` — Stats query re-exports

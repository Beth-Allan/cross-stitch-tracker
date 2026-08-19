# Structure

> Directory layout, key locations, and naming conventions.

## Top-Level Layout

```
cross-stitch-tracker/
├── .claude/                   # Claude Code configuration
│   ├── hooks/                 # guard-git.sh (PreToolUse fence) + review-gated-paths.txt
│   ├── rules/                 # 12 convention files; 4 always-on, 8 scoped by globs
│   ├── skills/                # Beth's doors (/progress, /broken, /tweak, /cleanup,
│   │                          #   /stitch-fact, /design-session, /plan-feature,
│   │                          #   /walkthrough) plus the build doors (/work-item,
│   │                          #   /review, /stage-review)
│   ├── settings.json          # Permissions + hook wiring
│   └── settings.local.json    # Machine-local overrides
├── .github/
│   ├── workflows/ci.yml       # The required check on main
│   └── dependabot.yml
├── .husky/                    # pre-commit (lint-staged), pre-push (npm run gate)
├── .impeccable/               # design.json sidecar + critique/ — design tool, not authority
├── docs/                      # Live docs — this directory, detailed below
├── prisma/
│   ├── schema.prisma          # Database schema (source of truth)
│   ├── seed.ts                # Database seeding script
│   ├── fixtures/              # Seed fixture data
│   └── migrations/            # Migration history
├── product-plan/              # DesignOS source material (historical input)
│   ├── sections/              # Component designs + screenshots per section
│   └── design-system/         # DesignOS-era tokens, fonts, colour notes
├── public/                    # Static assets
├── scripts/                   # Standalone helpers, run by hand — see its README
│   ├── generate-icons.mjs     #   PWA icon generation
│   └── migrate-working-copies.sql  #   one-time data migration, already run
├── src/                       # Application source (see below)
├── CLAUDE.md                  # Project instructions for Claude
├── CROSS_STITCH_TRACKER_PLAN.md  # Product spec — source of truth for requirements
├── WORKFLOW-REFERENCE.md      # Beth's one-page card of her doors
├── WORKFLOW-OVERHAUL-HANDOFF.md  # How this process was built — history, except §2 (Beth's rulings D-01–D-14, still binding)
├── DESIGN.md                  # Written design direction (pairs with .impeccable/design.json)
├── PRODUCT.md, SECURITY.md, README.md
├── proxy.ts                   # Auth.js session gate (Next.js 16's middleware rename)
├── next.config.ts             # Security headers, CSP
├── prisma.config.ts           # Prisma 7 config (schema, migrations, seed, datasource)
├── postcss.config.mjs         # Tailwind v4 entry — there is no tailwind.config.ts
├── components.json            # shadcn CLI config
├── vitest.config.ts           # Vitest test config
├── eslint.config.mjs          # ESLint 9 flat config
├── prettier.config.mjs        # Prettier config
├── tsconfig.json              # TypeScript strict config
├── .env.example, .nvmrc, .editorconfig, .prettierignore
└── package.json               # Dependencies (exact versions, no ^/~)
```

## `docs/` — where this file lives

```
docs/
├── ARCHITECTURE.md            # Layers, data flow, abstractions, entry points
├── STRUCTURE.md               # This file
├── CONVENTIONS.md             # Code style, naming, error handling
├── CONCERNS.md                # Fragile areas and known technical debt
├── STACK.md                   # The stack of record
├── INTEGRATIONS.md            # External services and APIs
├── TESTING.md                 # Test framework, structure, mocking
├── design-context.md          # Users, tone, visual context for UI work
├── process/                   # The live process surface
│   ├── session-protocol.md    # The playbook — the process authority
│   ├── build-plan.md          # Per-item briefs: objective, specs, traps, done-when
│   ├── work-log.md            # Front door: Up-next queue, built, in flight, awaiting review
│   ├── work-log/              # drift.md, notes.md, backlog.md
│   ├── work-log-archive.md    # Sealed stages, moved verbatim; history, not authority
│   ├── maintenance-ledger.md  # Pre-existing warts; noticing one obliges logging it
│   └── security-checklist.md  # What the delegated auto-review checks
├── domain/                    # Cross-stitch knowledgebase — /stitch-fact is the only
│   │                          #   write path; every fact carries provenance
│   ├── README.md, vocabulary.md, threads.md, fabric.md,
│   └── kitting-and-storage.md, open-questions.md
├── design/
│   └── DESIGN-REFERENCE.md    # The DesignOS map: which reference covers which screen
└── archive/                   # History, not authority — nothing here governs anything
    ├── planning/              # The former .planning/ tree (GSD-era artifacts)
    ├── superpowers/           # Superseded plans and specs
    └── tech-stack.md          # Pre-build stack research; STACK.md is the real one
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
│   │   ├── login/             # page.tsx, login-form.tsx, actions.ts
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── charts/
│   │   │   ├── [id]/          # page.tsx, edit/{page.tsx, edit-client.tsx}
│   │   │   ├── new/page.tsx
│   │   │   └── page.tsx, loading.tsx
│   │   ├── series/            # page.tsx, [id]/page.tsx, loading.tsx
│   │   ├── designers/, genres/, fabric/, storage/, apps/
│   │   │                      #   each: page.tsx, [id]/page.tsx, loading.tsx
│   │   ├── supplies/          # page.tsx, brands/page.tsx, loading.tsx
│   │   ├── sessions/, shopping/   # page.tsx, loading.tsx
│   ├── settings/             # page.tsx (placeholder — nothing to load)
│   │   ├── stats/             # page.tsx, search-params.ts, loading.tsx
│   │   ├── layout.tsx         # Session redirect + AppShell (proxy.ts gates first)
│   │   ├── error.tsx, loading.tsx, not-found.tsx
│   │   └── page.tsx           # Dashboard home
│   ├── api/auth/[...nextauth]/route.ts
│   ├── layout.tsx             # Root (fonts, ThemeProvider, NuqsAdapter, Toaster)
│   ├── global-error.tsx
│   ├── globals.css            # Token set + Tailwind v4 config (@theme, @custom-variant)
│   ├── manifest.ts            # PWA manifest
│   └── favicon.ico
│
├── components/
│   ├── features/              # 15 domain-scoped feature directories
│   │   ├── charts/            # Chart form, Pattern Dive tab contents, badges, status
│   │   │   ├── form-primitives/  # Reusable form sub-components
│   │   │   └── project-detail/   # Multi-tab detail view, hero, file list, focal point
│   │   ├── series/            # Series list, card, detail, form modal, sort
│   │   ├── dashboard/         # Dashboard tabs, stats, spotlight
│   │   ├── gallery/           # Gallery card, filters (search/status/size/series), sort
│   │   ├── stats/             # Stats page sections
│   │   ├── supplies/          # Supply catalog: grid + table views, supply/brand modals
│   │   ├── supply-table/      # Reusable supply editor; index.ts is its public API
│   │   ├── shopping/          # Shopping list
│   │   ├── shared/            # Components used by more than one feature directory
│   │   ├── designers/, fabric/, genres/, sessions/, storage/, apps/
│   ├── hooks/                 # Component-level hooks owned by no single feature
│   ├── shell/                 # App shell (sidebar, topbar, nav, user menu, theme toggle)
│   ├── ui/                    # Shadcn/Base UI primitives (no business logic)
│   ├── theme-provider.tsx
│   └── placeholder-page.tsx   # Stub used by routes not yet built
│
├── generated/
│   └── prisma/                # Auto-generated Prisma client (never edit)
│
├── lib/
│   ├── actions/               # Server actions — 18 files, one per domain
│   ├── queries/
│   │   └── stats/             # 19 query files + index.ts barrel + utils.ts helpers
│   ├── utils/                 # Pure utility functions
│   ├── validations/           # Zod schemas (one file per domain)
│   ├── auth.ts                # NextAuth v5 config
│   ├── auth-guard.ts          # requireAuth() enforcement
│   ├── db.ts                  # Prisma lazy singleton
│   ├── r2.ts                  # R2 S3Client singleton
│   ├── rate-limit.ts          # In-memory rate limiter
│   ├── constants.ts           # Literals shared across modules
│   ├── chart-configs.ts       # Recharts ChartConfig objects
│   └── utils.ts               # cn() (clsx + tailwind-merge)
│
└── types/                     # Domain TypeScript types (no runtime code)
    ├── chart.ts, dashboard.ts, designer.ts, fabric.ts, focal-point.ts,
    │   genre.ts, series.ts, session.ts, shopping.ts, stats.ts, storage.ts, supply.ts
    └── colocated tests: focal-point.test.ts, stats.test.ts, supply.test.ts
```

## Where to Add Things

| Adding...                    | Location                                  | Notes                                           |
| ---------------------------- | ----------------------------------------- | ----------------------------------------------- |
| New page                     | `src/app/(dashboard)/<route>/page.tsx`    | Async Server Component                          |
| New route skeleton           | `src/app/(dashboard)/<route>/loading.tsx` | Twelve routes already have one                  |
| New server action            | `src/lib/actions/<domain>-actions.ts`     | Add to existing file or create new              |
| New feature component        | `src/components/features/<domain>/`       | `"use client"` only if interactive              |
| Component used by 2+ domains | `src/components/features/shared/`         | Not `ui/` — that is primitives only             |
| New UI primitive             | `src/components/ui/`                      | Follow shadcn pattern                           |
| New hook                     | `features/<domain>/use-*.ts`              | `src/components/hooks/` if no single owner      |
| New shared type              | `src/types/<domain>.ts`                   | Compose from Prisma types                       |
| New Zod schema               | `src/lib/validations/<domain>.ts`         | Shared between server + client                  |
| New utility                  | `src/lib/utils/<name>.ts`                 | Pure function, no side effects                  |
| New cross-module constant    | `src/lib/constants.ts`                    | Only when it belongs to no single utility       |
| New stats query              | `src/lib/queries/stats/<name>.ts`         | Add to barrel `index.ts`; helpers in `utils.ts` |
| New test                     | Next to source file: `<name>.test.tsx`    | Import from `@/__tests__/test-utils`            |
| New mock factory             | `src/__tests__/mocks/factories.ts`        | `Partial<T>` override pattern                   |

## Naming Conventions

### Files

- **kebab-case** for all files: `chart-actions.ts`, `cover-image-upload.tsx`
- **Page files**: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`
- **Test files**: `{name}.test.ts` or `{name}.test.tsx` (colocated)
- **Gap tests**: `{name}.gaps.test.tsx` — two legacy files only, never a new one (see `TESTING.md`)
- **Hook files**: `use-{name}.ts`
- **Action files**: `{domain}-actions.ts`
- **Type files**: `{domain}.ts` in `src/types/`
- **Query files**: `{metric-name}.ts` in `src/lib/queries/stats/`

### Code

- **Components**: PascalCase named exports (no default exports)
- **Pages/layouts**: PascalCase default exports (Next.js requirement)
- **Server actions**: camelCase verb-noun (`createSeries`, `getChartsForGallery`)
- **Hooks**: `use` prefix function (`useGalleryFilters`, `useChartForm`, `useSeriesSort`)
- **Types**: PascalCase with descriptive suffixes (`ChartWithProject`, `GalleryCardData`, `SeriesWithStats`)
- **Constants**: UPPER_SNAKE_CASE (`STATUS_CONFIG`, `SORT_FIELDS`, `PROJECT_STATUSES`)

### Imports

- `@/` alias for `./src/` (tsconfig paths)
- `import type` for type-only imports
- Observed order: React/framework → third-party → `@/components/ui/` → `@/components/features/` → `@/lib/` → `@/types/`

### Barrel Exports

Three barrel `index.ts` files, each with a stated reason:

- `src/__tests__/mocks/index.ts` — test infrastructure re-exports
- `src/lib/queries/stats/index.ts` — stats query re-exports. Deliberately not exhaustive: `record-detection.ts` stays off the barrel and is imported by path.
- `src/components/features/supply-table/index.ts` — the supply-table public API. Its sub-components (AddRow, DataRow, SectionDivider, Footer) are implementation details and stay unexported.

New barrels need the same kind of reason; a barrel that only shortens an import path is not one.

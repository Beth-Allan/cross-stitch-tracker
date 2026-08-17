---
phase: 02-core-project-management
plan: 01
subsystem: database
tags: [prisma, postgresql, zod, s3, r2, validation, types]

# Dependency graph
requires:
  - phase: 01-scaffold
    provides: Next.js 16 scaffold, Prisma 7 config, Auth.js, shadcn/ui base
provides:
  - Chart, Project, Designer, Genre Prisma models with ProjectStatus enum
  - R2 client singleton for file storage
  - Zod validation schemas for chart form, designer, genre, upload
  - Size category utility (Mini/Small/Medium/Large/BAP)
  - Status config mapping enum values to labels and Tailwind classes
  - UI type definitions (ChartWithProject, ChartListItem, ChartDetail)
  - shadcn components (dialog, tabs, select, badge, label, textarea, separator, popover, command)
affects: [02-02, 02-03, 02-04, 02-05, supply-tracking, statistics]

# Tech tracking
tech-stack:
  added: ["@aws-sdk/client-s3", "@aws-sdk/s3-request-presigner", "nanoid", "sharp (prod)"]
  patterns: [lazy-singleton-r2, zod-nested-object-validation, prisma-implicit-many-to-many, status-config-map]

key-files:
  created:
    - prisma/schema.prisma (Chart, Project, Designer, Genre models)
    - prisma/migrations/20260328163529_add_chart_project_designer_genre/migration.sql
    - src/lib/r2.ts
    - src/lib/utils/size-category.ts
    - src/lib/utils/size-category.test.ts
    - src/lib/utils/status.ts
    - src/lib/validations/chart.ts
    - src/lib/validations/upload.ts
    - src/types/chart.ts
    - src/components/ui/dialog.tsx
    - src/components/ui/tabs.tsx
    - src/components/ui/select.tsx
    - src/components/ui/badge.tsx
    - src/components/ui/label.tsx
    - src/components/ui/textarea.tsx
    - src/components/ui/separator.tsx
    - src/components/ui/popover.tsx
    - src/components/ui/command.tsx
  modified:
    - package.json
    - .env.example

key-decisions:
  - "Lazy R2 singleton to avoid crash when env vars not configured"
  - "Migration SQL generated without live DB -- will apply when Neon is connected"
  - "Chart-Genre implicit many-to-many via Prisma auto-junction table"
  - "sharp moved from devDependencies to dependencies for Vercel runtime"

patterns-established:
  - "Lazy singleton: R2 client created on first access, not import"
  - "Status config map: enum -> {label, cssVar, bgClass, textClass, dotClass, darkBgClass}"
  - "Nested Zod schemas: chartFormSchema with chart + project sub-objects"
  - "UI type mapping: Prisma generated types -> mapped types in src/types/"

requirements-completed: [PROJ-01, PROJ-04, PROJ-05]

# Metrics
duration: 5min
completed: 2026-03-28
---

# Phase 02 Plan 01: Data Foundation Summary

**Prisma schema with Chart/Project/Designer/Genre models, R2 client, Zod validations, size-category utility with TDD tests, and status config for 7-value lifecycle**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-28T22:33:22Z
- **Completed:** 2026-03-28T22:37:58Z
- **Tasks:** 2
- **Files modified:** 23

## Accomplishments
- Prisma schema with 4 models (Chart, Project, Designer, Genre) and ProjectStatus enum with 7 values
- R2 lazy singleton client with env var validation for Cloudflare file storage
- Zod validation schemas for chart form (nested chart + project), designer, genre, and upload requests
- Size category utility with 14 passing TDD boundary tests
- Status config mapping all 7 project statuses to labels and Tailwind classes
- UI type definitions bridging Prisma generated types to component-friendly types
- 9 new shadcn components installed (dialog, tabs, select, badge, label, textarea, separator, popover, command)

## Task Commits

Each task was committed atomically:

1. **Task 1: Install dependencies, add shadcn components, create Prisma schema and run migration** - `65a7c95` (feat)
2. **Task 2 RED: Add failing tests for size-category utility** - `8e4f41f` (test)
3. **Task 2 GREEN: Add R2 client, validations, utilities, and type definitions** - `6224d1e` (feat)

## Files Created/Modified
- `prisma/schema.prisma` - Chart, Project, Designer, Genre models with ProjectStatus enum
- `prisma/migrations/.../migration.sql` - SQL migration for all new models
- `src/lib/r2.ts` - Lazy singleton S3Client for Cloudflare R2
- `src/lib/utils/size-category.ts` - calculateSizeCategory and getEffectiveStitchCount
- `src/lib/utils/size-category.test.ts` - 14 boundary and edge-case tests
- `src/lib/utils/status.ts` - STATUS_CONFIG and PROJECT_STATUSES exports
- `src/lib/validations/chart.ts` - chartFormSchema, designerSchema, genreSchema
- `src/lib/validations/upload.ts` - uploadRequestSchema with file type/size constants
- `src/types/chart.ts` - ChartWithProject, ChartListItem, ChartDetail types
- `package.json` - Added @aws-sdk/client-s3, @aws-sdk/s3-request-presigner, nanoid; moved sharp to deps
- `.env.example` - Added R2 environment variables

## Decisions Made
- **Lazy R2 singleton:** App does not crash on import when R2 env vars are missing -- created on first access only
- **Migration without live DB:** Database URLs are placeholders; migration SQL was generated via `prisma migrate diff` and saved for later application
- **Implicit many-to-many for Chart-Genre:** Prisma auto-creates `_ChartToGenre` junction table
- **sharp in dependencies:** Moved from devDependencies for Vercel server runtime image processing

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Migration created without live database**
- **Found during:** Task 1 (Prisma migration)
- **Issue:** `.env.local` has placeholder database URLs -- `prisma migrate dev` requires a live connection
- **Fix:** Used `prisma migrate diff --from-empty --to-schema` to generate migration SQL, created migration directory manually, ran `prisma generate` for client types
- **Files modified:** prisma/migrations/20260328163529_add_chart_project_designer_genre/migration.sql
- **Verification:** `prisma generate` succeeded, `npm run build` passed
- **Committed in:** 65a7c95 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Migration SQL is correct but not applied to a database. Will be applied when Neon is configured. No scope creep.

## Issues Encountered
- shadcn `add` command prompted for overwrite on existing button.tsx -- resolved with `--overwrite` flag
- Some shadcn components reported "skipped" because they already existed in the worktree (from other parallel agents) -- verified all 9 target components present

## User Setup Required

**External services require manual configuration.** R2 environment variables needed:
- `R2_ACCOUNT_ID` - Cloudflare Dashboard -> R2 -> Overview (Account ID in sidebar)
- `R2_ACCESS_KEY_ID` - Cloudflare Dashboard -> R2 -> Manage R2 API Tokens -> Create API Token
- `R2_SECRET_ACCESS_KEY` - Same API token creation flow
- `R2_BUCKET_NAME` - Create bucket named 'cross-stitch-tracker'
- Configure CORS on bucket: AllowedOrigins ['http://localhost:3000'], AllowedMethods ['PUT','GET','HEAD']

## Known Stubs

None -- all code is functional. R2 client is lazy-initialized (intentional -- will activate when env vars are configured).

## Next Phase Readiness
- All models, types, validations, and utilities ready for Plans 02-05
- Plans 02/03 can immediately use chartFormSchema, STATUS_CONFIG, and ChartWithProject type
- Migration needs to be applied to a live Neon database before CRUD operations work
- R2 env vars need configuration before file upload features work

## Self-Check: PASSED

All 12 key files verified present. All 3 commits verified in git log (65a7c95, 8e4f41f, 6224d1e).

---
*Phase: 02-core-project-management*
*Completed: 2026-03-28*

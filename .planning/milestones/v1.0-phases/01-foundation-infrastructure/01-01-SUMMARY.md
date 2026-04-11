---
phase: 01-foundation-infrastructure
plan: 01
subsystem: infra
tags: [nextjs, prisma, tailwind, pwa, vitest, shadcn, design-system]

requires:
  - phase: none
    provides: greenfield project

provides:
  - Next.js 16.2.1 scaffold with App Router and Turbopack
  - Prisma 7.6.0 client singleton with Neon adapter pattern
  - Tailwind v4 design tokens (emerald/amber/stone OKLCH palette)
  - Custom fonts (Fraunces, Source Sans 3, JetBrains Mono) via next/font
  - 7 status color CSS custom properties
  - shadcn/ui component library (button, input, card, dropdown-menu, avatar, sheet, tooltip)
  - PWA manifest with cross-stitch themed icons
  - Vitest test infrastructure
  - cn() utility function

affects: [01-02, 01-03, all-subsequent-phases]

tech-stack:
  added: [next@16.2.1, prisma@7.6.0, "@prisma/adapter-neon@7.6.0", next-auth@5.0.0-beta.30, bcryptjs@3.0.3, zod@3.24.4, lucide-react@1.7.0, sonner@2.0.7, clsx@2.1.1, tailwind-merge@3.5.0, tw-animate-css@1.4.0, vitest@3.1.1, sharp@0.33.5, shadcn@4.1.1, class-variance-authority@0.7.1, "@base-ui/react@1.3.0"]
  patterns: [prisma-neon-adapter-singleton, cn-utility, next-font-css-variables, tailwind-v4-theme-inline, oklch-color-system]

key-files:
  created:
    - package.json
    - tsconfig.json
    - next.config.ts
    - prisma/schema.prisma
    - prisma.config.ts
    - src/lib/db.ts
    - src/lib/utils.ts
    - src/app/globals.css
    - src/app/layout.tsx
    - src/app/manifest.ts
    - src/app/page.tsx
    - src/components/ui/button.tsx
    - src/components/ui/input.tsx
    - src/components/ui/card.tsx
    - src/components/ui/dropdown-menu.tsx
    - src/components/ui/avatar.tsx
    - src/components/ui/sheet.tsx
    - src/components/ui/tooltip.tsx
    - vitest.config.ts
    - src/__tests__/setup.ts
    - .env.example
    - public/icon-192x192.png
    - public/icon-512x512.png
    - scripts/generate-icons.mjs
  modified:
    - .gitignore

key-decisions:
  - "Zod 3.24.4 (stable) instead of 4.3.6 (plan referenced future version still in beta)"
  - "Removed @types/bcryptjs (bcryptjs 3.0.3 ships own types, stub package deprecated)"
  - "Prisma 7 import from @/generated/prisma/client (not @/generated/prisma as plan stated)"
  - "Added passWithNoTests to vitest config so test runner exits 0 with no test files"
  - "Excluded product-plan/ from tsconfig to prevent design reference files from causing TS errors"
  - "shadcn v4.1.1 added @base-ui/react and class-variance-authority as dependencies"

patterns-established:
  - "Pattern: Prisma singleton with Neon adapter in src/lib/db.ts"
  - "Pattern: cn() utility (clsx + tailwind-merge) in src/lib/utils.ts"
  - "Pattern: CSS custom properties for status colors (--status-*)"
  - "Pattern: next/font CSS variables on html element (--font-heading, --font-body, --font-mono)"
  - "Pattern: @theme inline for Tailwind v4 design token integration"
  - "Pattern: Security headers in next.config.ts (X-Content-Type-Options, X-Frame-Options, Referrer-Policy)"
  - "Pattern: All dependency versions pinned exactly (no ^ or ~)"

requirements-completed: [INFRA-05, INFRA-04]

duration: 7min
completed: 2026-03-28
---

# Phase 01 Plan 01: Project Scaffold Summary

**Next.js 16 scaffold with Prisma 7 Neon adapter, Tailwind v4 emerald/amber/stone design tokens, shadcn/ui components, Vitest, and PWA manifest**

## Performance

- **Duration:** 7 min
- **Started:** 2026-03-28T18:07:53Z
- **Completed:** 2026-03-28T18:15:22Z
- **Tasks:** 2
- **Files modified:** 25+

## Accomplishments
- Next.js 16.2.1 project scaffolded with all Phase 1 dependencies pinned to exact versions
- Design system fully configured: emerald/amber/stone OKLCH palette, 3 custom fonts via next/font, 7 status colors, dark mode support
- Prisma 7 configured with Neon adapter pattern (prisma.config.ts for CLI, src/lib/db.ts singleton for runtime)
- shadcn/ui initialized with 7 components themed to emerald primary / stone neutral
- PWA manifest with cross-stitch themed icons generated via sharp
- Vitest test infrastructure ready (exits 0, path aliases configured)
- Security headers configured in next.config.ts

## Task Commits

Each task was committed atomically:

1. **Task 1: Scaffold Next.js 16 with dependencies, Prisma 7, and Vitest** - `d1b7b2a` (feat)
2. **Task 2: Design system tokens, fonts, shadcn/ui, and PWA manifest** - `8aaf90d` (feat)

## Files Created/Modified
- `package.json` - Project dependencies, all versions pinned exactly
- `tsconfig.json` - TypeScript strict config with product-plan excluded
- `next.config.ts` - Security headers (X-Content-Type-Options, X-Frame-Options, Referrer-Policy)
- `prisma/schema.prisma` - PostgreSQL datasource, client output to src/generated/prisma
- `prisma.config.ts` - Prisma 7 connection config using DIRECT_URL
- `src/lib/db.ts` - Prisma client singleton with PrismaNeon adapter
- `src/lib/utils.ts` - cn() helper (clsx + tailwind-merge)
- `src/app/globals.css` - Tailwind v4 @theme inline, OKLCH emerald/amber/stone, status colors, dark mode
- `src/app/layout.tsx` - Fraunces/Source Sans 3/JetBrains Mono fonts, Toaster, viewport-fit
- `src/app/manifest.ts` - PWA manifest (standalone, emerald theme)
- `src/app/page.tsx` - Temporary placeholder page
- `src/components/ui/*.tsx` - 7 shadcn/ui components
- `vitest.config.ts` - Vitest with React plugin and @ path alias
- `src/__tests__/setup.ts` - Test setup file
- `.env.example` - Environment variable template
- `public/icon-*.png` - PWA icons (192x192, 512x512)
- `.gitignore` - Added src/generated/

## Decisions Made
- Used Zod 3.24.4 (stable) instead of plan's 4.3.6 (still beta on npm)
- Removed @types/bcryptjs as bcryptjs 3.0.3 ships its own type definitions
- Prisma 7 generates client to src/generated/prisma/ with exports from client.ts (not index.ts)
- Added passWithNoTests to vitest config for clean exit with no test files
- Excluded product-plan/ directory from tsconfig (design reference files, not part of build)
- shadcn v4.1.1 auto-added @base-ui/react and class-variance-authority (pinned their versions)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Scaffolded in temp directory due to existing files**
- **Found during:** Task 1 (create-next-app)
- **Issue:** create-next-app refuses to run in a directory with existing files
- **Fix:** Scaffolded in /tmp/cst-scaffold and copied files into project root
- **Files modified:** All scaffold files
- **Verification:** Project builds and type-checks cleanly
- **Committed in:** d1b7b2a

**2. [Rule 1 - Bug] Fixed Prisma import path**
- **Found during:** Task 1 (type checking)
- **Issue:** Plan specified `import from "@/generated/prisma"` but Prisma 7 exports PrismaClient from client.ts, not an index file
- **Fix:** Changed import to `@/generated/prisma/client`
- **Files modified:** src/lib/db.ts
- **Verification:** `npx tsc --noEmit` passes
- **Committed in:** d1b7b2a

**3. [Rule 3 - Blocking] Excluded product-plan from TypeScript compilation**
- **Found during:** Task 1 (type checking)
- **Issue:** Design reference TSX files in product-plan/ caused TS errors (missing module imports)
- **Fix:** Added "product-plan" to tsconfig.json exclude array
- **Files modified:** tsconfig.json
- **Verification:** `npx tsc --noEmit` passes
- **Committed in:** d1b7b2a

**4. [Rule 2 - Missing Critical] Pinned shadcn-added dependency versions**
- **Found during:** Task 2 (shadcn/ui init)
- **Issue:** shadcn init added @base-ui/react, class-variance-authority, and others with ^ prefixes, violating CLAUDE.md security rules
- **Fix:** Replaced all ^ prefixes with exact versions in package.json
- **Files modified:** package.json
- **Verification:** No ^ or ~ prefixes in package.json
- **Committed in:** 8aaf90d

---

**Total deviations:** 4 auto-fixed (1 bug, 1 missing critical, 2 blocking)
**Impact on plan:** All fixes necessary for build correctness and CLAUDE.md compliance. No scope creep.

## Issues Encountered
None beyond the deviations documented above.

## User Setup Required

**External services require manual configuration.** The following environment variables must be set before database features will work:

- `DATABASE_URL` - Neon pooled connection string (from Neon Dashboard)
- `DIRECT_URL` - Neon direct connection string (from Neon Dashboard)
- `AUTH_SECRET` - Generate with `npx auth secret`
- `AUTH_USER_EMAIL` - Single-user login email
- `AUTH_USER_PASSWORD_HASH` - bcryptjs hash of login password

See `.env.example` for the template.

## Known Stubs

None -- all files are functional infrastructure. The page.tsx placeholder is intentional and will be replaced by the dashboard layout in Plan 03.

## Next Phase Readiness
- Foundation infrastructure complete for Plans 02 (Auth) and 03 (App Shell)
- Prisma schema ready for model definitions
- Design system tokens and shadcn components ready for UI development
- Test infrastructure ready for unit tests

---
*Phase: 01-foundation-infrastructure*
*Completed: 2026-03-28*

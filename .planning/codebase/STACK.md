# Technology Stack

**Analysis Date:** 2026-05-20

## Languages

**Primary:**
- TypeScript 5.9.3 - All application code (`src/`)
- CSS - Tailwind utility classes in component files

**Secondary:**
- JavaScript (`.mjs`) - Config files (`eslint.config.mjs`, `prettier.config.mjs`, `postcss.config.mjs`)

## Runtime

**Environment:**
- Node.js >=22 (enforced via `engines` in `package.json`; `.nvmrc` pins `22`)

**Package Manager:**
- npm (lockfile: `package-lock.json` present)

## Frameworks

**Core:**
- Next.js 16.2.4 - Full-stack React framework with App Router; server components by default
- React 19.2.5 - UI rendering
- React DOM 19.2.5 - DOM bindings

**UI Component Library:**
- shadcn/ui 4.3.1 (built on `@base-ui/react` 1.4.1) - Headless, accessible primitives; replaces Radix

**Testing:**
- Vitest 3.1.1 - Test runner with jsdom environment (`vitest.config.ts`)
- @testing-library/react 16.3.2 - Component rendering + assertions
- @testing-library/user-event 14.6.1 - User interaction simulation
- @testing-library/jest-dom 6.9.1 - DOM matchers
- @vitest/coverage-v8 3.1.1 - Coverage via V8

**Build/Dev:**
- @vitejs/plugin-react 4.4.1 - Vite React plugin for Vitest
- @tailwindcss/postcss 4.2.3 - PostCSS integration for Tailwind v4
- Husky 9.1.7 - Git hooks (`pre-commit`: lint-staged; `pre-push`: `npm run build`)
- lint-staged 16.4.0 - Run Prettier + ESLint on staged files only

## Key Dependencies

**Critical:**
- Prisma 7.7.0 (`prisma` CLI + `@prisma/client`) - ORM; schema at `prisma/schema.prisma`, generated client output to `src/generated/prisma/`
- `@prisma/adapter-neon` 7.7.0 - Neon serverless PostgreSQL adapter used by `PrismaClient` in `src/lib/db.ts`
- next-auth 5.0.0-beta.30 - Authentication (Auth.js v5 beta); credentials provider + JWT strategy; see `src/lib/auth.ts`
- Zod 3.24.4 - Schema validation at all server action and API boundaries
- `@aws-sdk/client-s3` 3.1033.0 + `@aws-sdk/s3-request-presigner` 3.1033.0 - AWS S3 SDK used to interact with Cloudflare R2 via S3-compatible API; see `src/lib/r2.ts`

**UI Utilities:**
- class-variance-authority 0.7.1 - Component variant system (`cva`); used in `src/components/ui/button-variants.ts`, `badge.tsx`, `tabs.tsx`
- clsx 2.1.1 + tailwind-merge 3.5.0 - Class merging; composed into `cn()` utility in `src/lib/utils.ts`
- lucide-react 1.8.0 - Icon set used throughout UI components
- tw-animate-css 1.4.0 - Tailwind animation utilities

**Feature Libraries:**
- recharts 3.8.0 - Statistics charts (`BarChart`, `PieChart`, etc.) in `src/components/features/stats/`
- nuqs 2.8.9 - URL search param state management (`useQueryState`) for gallery filters, tab state, session history; adapter mounted in `src/app/layout.tsx`
- date-fns 4.1.0 + `@date-fns/tz` 1.4.1 - Date arithmetic; `TZDate` from `@date-fns/tz` used in stats queries for user-timezone-aware day boundaries
- sonner 2.0.7 - Toast notifications; `<Toaster>` mounted in root layout
- cmdk 1.1.1 - Command palette primitives in `src/components/ui/command.tsx`
- next-themes 0.4.6 - Light/dark theme switching via `<ThemeProvider>` wrapper
- canvas-confetti 1.9.4 - Confetti animation on personal bests in `src/components/features/stats/record-celebration.tsx`
- nanoid 5.1.9 - Random ID generation for R2 object keys
- bcryptjs 3.0.3 - Password hash comparison in `src/lib/auth.ts`
- sharp 0.34.5 (devDependency) - Server-side image optimization in `src/lib/actions/upload-actions.ts`; resizes uploads to WebP before storing in R2

**Fonts (Google Fonts via `next/font`):**
- Fraunces - Heading font (`--font-heading`)
- Source Sans 3 - Body font (`--font-body`)
- JetBrains Mono - Monospace font (`--font-mono`)

## Configuration

**TypeScript:**
- Strict mode enabled (`"strict": true`)
- Path alias: `@/*` → `./src/*` (configured in both `tsconfig.json` and `vitest.config.ts`)
- Target: ES2017; module: esnext with bundler resolution
- Vitest globals enabled via `"types": ["vitest/globals"]`

**ESLint:**
- Config: `eslint.config.mjs` — extends `eslint-config-next/core-web-vitals` + TypeScript
- Custom rules: bans `<Button render={<Link>}>` (hydration risk), enforces `requireAuth` import from `@/lib/auth-guard` (not `@/lib/auth`)

**Prettier:**
- Config: `prettier.config.mjs` — semi, double quotes, 100-char print width, trailing commas, Tailwind class sorting

**Prisma:**
- Config: `prisma.config.ts` — schema at `prisma/schema.prisma`, migrations at `prisma/migrations/`, seed via `npx tsx prisma/seed.ts`
- Uses `DIRECT_URL` for CLI operations (bypasses connection pooler); `DATABASE_URL` for app (pooled)

**Next.js:**
- Config: `next.config.ts` — security headers (`X-Content-Type-Options`, `X-Frame-Options`, CSP baseline, `Referrer-Policy`); R2 domain whitelisted in `img-src` and `connect-src`
- PWA manifest: `src/app/manifest.ts` — standalone display mode, theme color `#059669`

**Build:**
- Build script: `prisma generate && next build` (ensures generated client is fresh)
- Pre-push hook: `npm run build` (blocks push on build failure)

## Platform Requirements

**Development:**
- Node.js 22+
- PostgreSQL via Neon (two branches: dev + production)
- Cloudflare R2 bucket for file storage (optional for dev; graceful degradation if missing)
- `.env.local` with all required env vars (see `.env.example`)

**Production:**
- Vercel (linked project in `.vercel/project.json`); auto-deploys on push to `main`
- Neon PostgreSQL (serverless, connection pooling via `PrismaNeon` adapter)
- Cloudflare R2 (S3-compatible object storage)

---

*Stack analysis: 2026-05-20*

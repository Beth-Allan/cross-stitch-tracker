# Technology Stack

What is installed and how it is configured. Versions are pinned exact in `package.json` (no `^`
or `~`) and are the versions actually resolved in `node_modules`.

Version-specific footguns for the bleeding-edge libraries are not repeated here — they live in
`.claude/rules/bleeding-edge-libs.md`, `base-ui-patterns.md`, and `auth-patterns.md`, which load
into every session.

## Languages

**Primary:**

- TypeScript 5.9.3 - All application code (`src/`)
- CSS - Tailwind utility classes in component files; token layer in `src/app/globals.css`

**Secondary:**

- JavaScript (`.mjs`) - Config files (`eslint.config.mjs`, `prettier.config.mjs`,
  `postcss.config.mjs`) and `scripts/generate-icons.mjs`

## Runtime

**Environment:**

- Node.js >=22 (enforced via `engines` in `package.json`; `.nvmrc` pins `22`; CI runs `22`)

**Package Manager:**

- npm (lockfile: `package-lock.json` present)

## Frameworks

**Core:**

- Next.js 16.3.1 - Full-stack React framework with App Router; server components by default
- React 19.2.5 - UI rendering
- React DOM 19.2.5 - DOM bindings

**Styling:**

- Tailwind CSS 4.2.3 - CSS-first configuration; there is no `tailwind.config.js`. The theme is
  declared in `src/app/globals.css` with `@import "tailwindcss"`, `@theme inline`, and
  `@custom-variant dark`
- @tailwindcss/postcss 4.2.3 - The only PostCSS plugin (`postcss.config.mjs`)
- tw-animate-css 1.4.0 - Animation utilities, imported from `globals.css`

**UI Component Library:**

- `@base-ui/react` 1.4.1 - The headless primitives components are built on (shadcn/ui v4 moved
  from Radix to Base UI)
- `shadcn` 4.3.1 - The component-generator CLI. `components.json` configures it: style
  `base-nova`, baseColor `neutral`, CSS variables on, `lucide` icon library, aliases for
  `@/components`, `@/lib`, `@/components/ui`, `@/hooks`
- Generated components are project code and are edited in place under `src/components/ui/`

**Testing:**

- Vitest 3.2.7 - Test runner, `jsdom` environment, globals on (`vitest.config.ts`)
- jsdom 29.0.2 - DOM implementation for the test environment
- @testing-library/react 16.3.2 - Component rendering + assertions
- @testing-library/user-event 14.6.1 - User interaction simulation
- @testing-library/jest-dom 6.9.1 - DOM matchers
- @vitest/coverage-v8 3.2.7 - Coverage via V8
- Setup file: `src/__tests__/setup.ts`. Test discovery: `src/**/*.test.ts(x)`, colocated with
  source. Coverage excludes `src/__tests__/**`, `src/generated/**`, test files, and
  `src/app/manifest.ts`

**Build/Dev:**

- @vitejs/plugin-react 4.4.1 - Vite React plugin for Vitest
- ESLint 9.39.4 + eslint-config-next 16.3.1 - Flat config
- Prettier 3.8.3 + prettier-plugin-tailwindcss 0.7.2 - Formatting and Tailwind class ordering
- tsx 4.23.12 - TypeScript execution, used by the Prisma seed script
- Husky 9.1.7 - Git hooks (`pre-commit`: `lint-staged`; `pre-push`: `npm run gate`)
- lint-staged 16.4.0 - Prettier on staged `ts,tsx,js,mjs,json,css,md`; `eslint --fix` on staged
  `ts,tsx`
- Types: `@types/node` 22.20.1, `@types/react` 19.2.14, `@types/react-dom` 19.2.3,
  `@types/canvas-confetti` 1.9.0

## Key Dependencies

**Critical:**

- Prisma 7.9.1 (`prisma` CLI + `@prisma/client`) - ORM; schema at `prisma/schema.prisma`,
- **One dependency override lives in `package.json`:** `@prisma/config` → `deepmerge-ts` `8.0.1`. `@prisma/config` pins `7.1.5`, which carries a high advisory, and npm's only alternative was a backwards major on `prisma`. Scoped so it cannot leak; remove it once `@prisma/config` declares `>=8` itself (maintenance-ledger row carries the condition).
  generated client output to `src/generated/prisma/`
- `@prisma/adapter-neon` 7.9.1 - Neon serverless PostgreSQL driver adapter, constructed by
  `PrismaClient` in `src/lib/db.ts`. The adapter has been GA since Prisma 6.16.0; under Prisma 7
  the connection string is supplied by `prisma.config.ts` for the CLI and by the adapter at
  runtime, never by a `url` field in `schema.prisma`
- next-auth 5.0.0-beta.32 - Authentication (Auth.js v5 beta); credentials provider + JWT
  strategy; see `src/lib/auth.ts`
- Zod 3.24.4 - Schema validation at all server action and API boundaries. This is Zod **v3**;
  v4-only APIs are not available
- `@aws-sdk/client-s3` 3.1033.0 + `@aws-sdk/s3-request-presigner` 3.1033.0 - AWS S3 SDK used to
  interact with Cloudflare R2 via its S3-compatible API; see `src/lib/r2.ts`

**UI Utilities:**

- class-variance-authority 0.7.1 - Component variant system (`cva`); used in
  `src/components/ui/button-variants.ts`, `badge.tsx`, `tabs.tsx`, `input-group.tsx`,
  `link-button.tsx`
- clsx 2.1.1 + tailwind-merge 3.5.0 - Class merging; composed into `cn()` in `src/lib/utils.ts`
- lucide-react 1.8.0 - Icon set used throughout UI components

**Feature Libraries:**

- recharts 3.8.0 - Statistics charts (`BarChart`, `PieChart`, etc.) in
  `src/components/features/stats/`, wrapped by `src/components/ui/chart.tsx`
- nuqs 2.8.9 - URL search param state management (`useQueryState`) for gallery filters, tab
  state, session history; adapter mounted in `src/app/layout.tsx`
- date-fns 4.1.0 - Date arithmetic in the stats client components (`format`, `parseISO`,
  `isToday`) on browser-local values. Calendar dates never touch it: they go through
  `src/lib/utils/calendar-date.ts` (docs/ARCHITECTURE.md, "Calendar dates")
- sonner 2.0.7 - Toast notifications; `<Toaster>` mounted in root layout
- cmdk 1.1.1 - Command palette primitives in `src/components/ui/command.tsx`
- next-themes 0.4.6 - Light/dark theme switching via `src/components/theme-provider.tsx`
- canvas-confetti 1.9.4 - Confetti animation on personal bests in
  `src/components/features/stats/record-celebration.tsx`
- nanoid 5.1.16 - Random ID generation for R2 object keys
- bcryptjs 3.0.3 - Password hash comparison in `src/lib/auth.ts`
- sharp 0.35.3 - Server-side image optimization in `src/lib/actions/upload-actions.ts` (resizes
  uploads to WebP before storing in R2), and PWA icon generation in `scripts/generate-icons.mjs`

**Fonts (Google Fonts via `next/font`):**

- Fraunces - Heading font (`--font-heading`)
- Source Sans 3 - Body font (`--font-body`)
- JetBrains Mono - Monospace font (`--font-mono`)

Loaded at build time and self-hosted by Next.js; configured in `src/app/layout.tsx`.

## Scripts

| Script                            | Runs                                                                                       |
| --------------------------------- | ------------------------------------------------------------------------------------------ |
| `npm run dev`                     | `next dev`                                                                                 |
| `npm run build`                   | `prisma generate && next build` — the generate step keeps the client fresh                 |
| `npm start`                       | `next start`                                                                               |
| `npm run lint`                    | `eslint`                                                                                   |
| `npm run format` / `format:check` | `prettier --write .` / `prettier --check .`                                                |
| `npm run typecheck`               | `tsc --noEmit`                                                                             |
| `npm test` / `test:watch`         | `vitest run --reporter=verbose` / watch mode                                               |
| `npm run test:coverage`           | `vitest run --coverage`                                                                    |
| `npm run gate`                    | `prisma generate → format:check → lint → typecheck → test → build` — the full quality gate |

`npm run gate` is what CI runs and what the `pre-push` hook runs. Mechanics and policy are in
`.claude/rules/quality-gates.md`; do not duplicate them here.

## Configuration

**TypeScript:**

- Strict mode enabled (`"strict": true`)
- Path alias: `@/*` → `./src/*` (configured in both `tsconfig.json` and `vitest.config.ts`)
- Target: ES2017; module: esnext with bundler resolution
- Vitest globals enabled via `"types": ["vitest/globals"]`
- `product-plan` and `node_modules` excluded from the program

**ESLint:**

- Config: `eslint.config.mjs` — extends `eslint-config-next/core-web-vitals` +
  `eslint-config-next/typescript`
- Custom rules: bans `<Button render={<Link>}>` (hydration risk), enforces `requireAuth` import
  from `@/lib/auth-guard` (not `@/lib/auth`) inside `src/lib/actions/**`
- `react-hooks/set-state-in-effect` is disabled for `src/**` — dialog form reset via `useEffect`
  is an intentional pattern here
- Ignores vendored and reference directories alongside the eslint-config-next defaults

**Prettier:**

- Config: `prettier.config.mjs` — semi, double quotes, 100-char print width, trailing commas,
  Tailwind class sorting. `.prettierignore` excludes build output, `src/generated/`, `.claude/`,
  `product-plan/`, and `docs/archive/` (archived history is preserved verbatim). The rest of
  `docs/` is formatted and is checked by the gate's `format:check` step

**Prisma:**

- Config: `prisma.config.ts` — schema at `prisma/schema.prisma`, migrations at
  `prisma/migrations/`, seed via `npx tsx prisma/seed.ts`
- The CLI datasource URL comes from `DIRECT_URL` (bypasses the connection pooler); the app
  connects through `DATABASE_URL` (pooled) via the Neon adapter in `src/lib/db.ts`
- `schema.prisma` declares `provider = "prisma-client"` with `output = "../src/generated/prisma"`
- **`src/generated/` is gitignored**, so the client is not committed. `prisma generate` is
  mandatory after a fresh clone and after any schema change — otherwise `tsc` type-checks against
  a stale or missing client. This is why the gate and the build both run it first

**Next.js:**

- Config: `next.config.ts` — security headers (`X-Content-Type-Options`, `X-Frame-Options`,
  `Referrer-Policy`, and a baseline CSP). The R2 domain `https://*.r2.cloudflarestorage.com` is
  allowed in `img-src` and `connect-src`
- **`proxy.ts` (repo root) is the app's entire route-protection surface.** Next.js 16 renamed
  middleware to proxy; this file re-exports Auth.js's `auth` as `proxy`, so every request is
  session-checked except the matcher's exclusions (`api/auth`, `_next/static`, `_next/image`,
  `favicon.ico`, `icon-*.png`, `manifest.webmanifest`). Server actions guard independently via
  `requireAuth()` — the proxy is the outer fence, not the only one

**PWA:**

- `src/app/manifest.ts` — Next.js metadata route producing `manifest.webmanifest`; standalone
  display, background `#fafaf9`, theme `#059669`, 192px and 512px icons
- `public/icon-192x192.png` and `public/icon-512x512.png` — generated by
  `scripts/generate-icons.mjs` (sharp, SVG source composed in the script)
- **The app is installable but not offline-capable.** No service worker is registered, and no
  service-worker toolkit (Serwist or otherwise) is installed — there is no precaching, no runtime
  caching, and no background sync

## Deliberately not installed / known traps

Choices that look like omissions but are not. Each one has bitten or would bite.

| Trap                                           | What is true here                                                                                                                                                           |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tailwindcss-animate`                          | Deprecated for Tailwind v4. This project uses **tw-animate-css**, imported from `src/app/globals.css`                                                                       |
| `tailwind.config.js`                           | Does not exist and should not be created. Tailwind v4 is CSS-first: the theme lives in `globals.css` under `@theme inline`, and `components.json` has `"config": ""`        |
| `@neondatabase/serverless` as a direct install | It ships as a dependency of **`@prisma/adapter-neon`**. Installing it directly risks a second, divergent copy of the driver                                                 |
| `url` in `schema.prisma`'s `datasource` block  | Prisma 7 with a driver adapter takes the connection from **`prisma.config.ts`** (CLI) and from the adapter (runtime). The `datasource` block here declares only `provider`  |
| Auth.js v4 patterns                            | This is **v5 beta**; the session API differs and `session.user.id` requires the explicit JWT + session callbacks in `src/lib/auth.ts`. See `.claude/rules/auth-patterns.md` |

## Platform Requirements

**Development:**

- Node.js 22+
- PostgreSQL via Neon
- `.env.local` populated from `.env.example`
- Cloudflare R2 is optional for local work, but note what "optional" means: `src/lib/r2.ts`
  **throws** when `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, or `R2_SECRET_ACCESS_KEY` is missing. The
  upload and download actions catch that specific error and return a user-facing
  `{ success: false }` with a "file storage is not configured" message, so the rest of the app
  keeps working while upload features are unavailable

**Production:**

- Vercel — auto-deploys on push to `main`
- Neon PostgreSQL (serverless; the app connects through the pooled endpoint via the `PrismaNeon`
  adapter)
- Cloudflare R2 (S3-compatible object storage)

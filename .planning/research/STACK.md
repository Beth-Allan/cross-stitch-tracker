# Stack Research

**Domain:** Cross-stitch project management application (single-user, data-rich, PWA)
**Researched:** 2026-03-28
**Confidence:** HIGH (stack finalized; research confirms versions and configuration best practices)

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

```bash
# Core framework
npx create-next-app@latest cross-stitch-tracker --typescript --tailwind --eslint --app --src-dir

# ORM + Database
npm install prisma @prisma/client @prisma/adapter-neon

# Authentication
npm install next-auth@beta bcryptjs
npm install -D @types/bcryptjs

# File storage (R2)
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner

# UI Libraries
npm install @tanstack/react-table recharts
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities

# PWA
npm install @serwist/next serwist

# Validation
npm install zod

# Utilities
npm install nanoid date-fns clsx tailwind-merge sonner tw-animate-css

# Radix primitives (add as needed)
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-select @radix-ui/react-popover @radix-ui/react-tooltip @radix-ui/react-checkbox @radix-ui/react-switch @radix-ui/react-tabs

# Image processing (server-side)
npm install sharp

# Dev dependencies
npm install -D prisma prettier prettier-plugin-tailwindcss
```

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

**Recommendation: Use shadcn/ui as a foundation, customized with the project's design tokens.**

The project has a complete design system (Fraunces/Source Sans 3/JetBrains Mono fonts, emerald/amber/stone palette, 7 status colors). The question is whether to build components from scratch on Radix or use shadcn/ui.

**Use shadcn/ui because:**
1. shadcn/ui components are copied into your project (not a dependency) -- full ownership and customization
2. Tailwind v4 is fully supported with @theme directive for custom colors and fonts
3. shadcn/ui uses Radix primitives underneath -- you get the same accessibility for free
4. The theming system uses CSS variables, which map directly to custom design tokens
5. 50+ designed components can be implemented faster by customizing shadcn/ui components than building from scratch
6. The registry/preset system can encode the entire design system (colors, fonts, radius) in a shareable config

**Customization approach:**
- Override CSS variables in `app/globals.css` with emerald/amber/stone palette in OKLCH
- Configure custom fonts (Fraunces, Source Sans 3, JetBrains Mono) via `next/font` and @theme
- Map the 7 status colors to CSS custom properties
- Modify copied components as needed -- they're your code

**What you lose:** Nothing meaningful. shadcn/ui components are source code in your project, not an external dependency. You can modify any component freely.

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

Two connection strings are required in `.env`:
```
# Pooled connection for the application (note -pooler suffix)
DATABASE_URL="postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/dbname?sslmode=require"

# Direct connection for Prisma CLI (migrations, introspection)
DIRECT_URL="postgresql://user:pass@ep-xxx.region.aws.neon.tech/dbname?sslmode=require"
```

In Prisma 7 with the Neon adapter, do NOT put a `url` property in the `datasource` block of `schema.prisma`. Instead, configure the connection in `prisma.config.ts` using `@prisma/adapter-neon`.

### Cloudflare R2 Setup

```typescript
// src/lib/r2.ts
import { S3Client } from "@aws-sdk/client-s3";

export const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});
```

Upload pattern: Generate presigned URLs server-side via Server Action, upload directly from client to R2. Keeps large files off Vercel's serverless function payload limits.

### Serwist PWA Configuration

```json
// package.json scripts
{
  "dev": "next dev --turbopack",
  "build": "next build",
  "dev:pwa": "next dev --webpack"
}
```

Serwist requires Webpack for service worker compilation. Use `--turbopack` for normal dev (faster), `--webpack` only when testing PWA locally. Production builds work normally.

For Phase 1 (basic PWA -- installable, home screen icon), you only need the manifest + metadata. Serwist becomes essential in Phase 5 for offline support and caching strategies.

### Tailwind v4 Design Token Configuration

```css
/* app/globals.css */
@import "tailwindcss";
@import "tw-animate-css";

@theme {
  /* Custom fonts */
  --font-heading: "Fraunces", serif;
  --font-body: "Source Sans 3", sans-serif;
  --font-mono: "JetBrains Mono", monospace;

  /* Emerald/amber/stone palette mapped to semantic tokens */
  --color-primary: oklch(0.596 0.145 163.225);     /* emerald-600 */
  --color-primary-foreground: oklch(0.985 0.014 163.225);
  --color-accent: oklch(0.666 0.179 86.375);        /* amber-500 */
  --color-background: oklch(0.985 0.001 106.424);   /* stone-50 */
  /* ... map all design tokens here */
}
```

### Next.js 16 Breaking Changes to Address

1. **Async request APIs:** `cookies()`, `headers()`, `params`, `searchParams` are all async. Must `await` them.
2. **Middleware renamed to Proxy:** File is now `proxy.ts`, not `middleware.ts`.
3. **Turbopack default:** No config needed; it's the default. Use `--webpack` flag only when Serwist requires it.
4. **React Compiler:** Enabled by default. May surface issues with libraries that use non-standard React patterns. Monitor @tanstack/react-table for compiler compatibility updates.

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

---
*Stack research for: Cross-stitch project management app*
*Researched: 2026-03-28*

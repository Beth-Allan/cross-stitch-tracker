# Pitfalls Research

**Domain:** Data-heavy cross-stitch project management app (Next.js App Router + Prisma + Neon + Vercel)
**Researched:** 2026-03-28
**Confidence:** HIGH (verified with official docs and multiple sources)

## Critical Pitfalls

### Pitfall 1: Prisma + Neon Connection Misconfiguration in Serverless

**What goes wrong:**
Database queries fail intermittently in production with `P1001: Can't reach database server` or connection timeout errors. The app works locally but breaks on Vercel. Migrations fail, or the app exhausts Neon's connection pool and crashes under normal usage.

**Why it happens:**
Neon requires TWO separate connection strings: a pooled connection (with `-pooler` in hostname) for runtime queries, and a direct connection for Prisma CLI migrations. Developers use one string for both, or forget `connect_timeout=15` to handle Neon's scale-to-zero cold starts. On the free tier, Neon auto-suspends after 5 minutes of inactivity, adding a few hundred milliseconds of cold start latency that can exceed Prisma's default connection timeout.

**How to avoid:**
- Set `DATABASE_URL` (pooled, with `-pooler`) and `DIRECT_URL` (direct) as separate env vars
- Add `connect_timeout=15` to the pooled connection string
- Set `connection_limit=5` for serverless (start low, increase if needed)
- Use the Prisma singleton pattern (`src/lib/db.ts`) to prevent connection leaks during hot reload
- Do NOT install `@neondatabase/serverless` separately — `@prisma/adapter-neon` bundles it
- Always call `prisma.$disconnect()` in `.finally()` blocks for scripts/seeds

**Warning signs:**
- `P1001` errors in Vercel logs, especially after periods of inactivity
- "Too many connections" errors during development with `next dev`
- Migrations work locally but fail in CI/CD

**Phase to address:**
Phase 1 (Foundation). This must be correct from the first database connection. Get it wrong and every subsequent phase has flaky behavior.

---

### Pitfall 2: Overusing Client Components ("use client" Everywhere)

**What goes wrong:**
The entire app becomes a client-side SPA masquerading as a Next.js app. Bundle size balloons. Initial page loads are slow. Data fetching happens via useEffect waterfalls instead of server-side streaming. The statistics engine and project list pages — the heaviest data pages — perform worst.

**Why it happens:**
Any component that uses `useState`, `useEffect`, event handlers, or browser APIs needs `"use client"`. Developers add it to a parent component, which forces ALL children to become client components too. With TanStack Table, Recharts, and dnd-kit all requiring client-side interactivity, the temptation is to mark entire pages as client components.

**How to avoid:**
- Keep pages and layouts as Server Components. They fetch data and pass it as props.
- Create thin Client Component wrappers that receive server-fetched data as props: `<ProjectTable data={projects} />` where the page fetches, the table component is `"use client"`.
- Use the composition pattern: Server Component parent renders Client Component children with data already resolved.
- Use `server-only` package to prevent accidental import of server code into client bundles.
- Wrap async data-fetching components in `<Suspense>` boundaries — place the boundary ABOVE the async component, not inside it.

**Warning signs:**
- `"use client"` at the top of page.tsx files
- `useEffect` + `fetch` patterns for data that could be server-fetched
- Large JavaScript bundle sizes in build output
- Slow initial page loads despite fast API responses

**Phase to address:**
Phase 1 (Foundation). Establish the pattern in the first Server Component pages. Every subsequent phase follows the same pattern.

---

### Pitfall 3: Prisma Aggregation Performance for Statistics Engine

**What goes wrong:**
The statistics page takes 5-10+ seconds to load. Monthly stitch charts, yearly summaries, and cross-project aggregations run dozens of sequential Prisma queries. With 500+ projects and thousands of stitch sessions, each individual `groupBy`, `aggregate`, and `count` call is fast, but 20 of them in sequence creates unacceptable latency.

**Why it happens:**
Prisma's query API encourages one-query-per-stat thinking. Developers write `prisma.stitchSession.aggregate()` for daily total, another for weekly, another for monthly, another for yearly — each as a separate database round trip. Prisma does not support raw SQL window functions or CTEs through its typed API, which are exactly what you need for time-series statistics.

**How to avoid:**
- Use `prisma.$queryRaw` with PostgreSQL CTEs and window functions for the statistics engine. A single CTE can compute daily/weekly/monthly/yearly stats in one query.
- Batch independent queries with `Promise.all()` — don't await them sequentially.
- Add database indexes on `stitchSession.date`, `stitchSession.projectId`, and `project.status` from day one.
- Consider PostgreSQL materialized views for expensive cross-table aggregations (series completion %, kitting status rollups).
- For the Year in Review page, compute stats in a single raw query rather than dozens of Prisma calls.

**Warning signs:**
- Statistics page has multiple sequential `await prisma.stitchSession.aggregate()` calls
- Page load time increases noticeably as session count grows past 500
- Build output shows the statistics route as the slowest page

**Phase to address:**
Phase 3 (Statistics Engine). But index creation should happen in Phase 1 when defining the Prisma schema. Add `@@index` annotations proactively on columns you know will be filtered/grouped.

---

### Pitfall 4: File Upload Architecture on Vercel Serverless

**What goes wrong:**
PDF uploads (digital working copies, 2-5MB each) and image uploads (cover photos, progress photos) fail intermittently. Users see timeout errors when uploading larger files. The upload works in development but fails in production.

**Why it happens:**
Vercel serverless functions have a 4.5MB request body limit on the Hobby plan. A 5MB PDF exceeds this. Even within limits, the function must receive the file, then upload it to R2 — two network hops within a function that has a 10-second timeout (Hobby) or 60-second timeout (with Fluid Compute). Large files or slow connections can exceed this.

**How to avoid:**
- Use presigned URLs: the server generates a presigned R2 upload URL, the client uploads directly to R2 (bypasses Vercel's body size limit entirely).
- Flow: Client requests presigned URL via Server Action -> Server generates URL with `@aws-sdk/s3-request-presigner` -> Client uploads directly to R2 -> Client notifies server of completion -> Server stores the R2 key in the database.
- Validate file type and size on the client BEFORE upload (fail fast).
- Set reasonable size limits: 10MB for PDFs, 5MB for images.
- Store only the R2 object key in the database, construct the full URL at read time from env vars.

**Warning signs:**
- Upload route handler uses `request.formData()` to receive the full file
- Files over 4MB fail silently or with vague errors in production
- Upload tests pass locally but fail on Vercel

**Phase to address:**
Phase 1 (Foundation) when implementing digital working copy upload. The presigned URL pattern must be established before any file upload feature.

---

### Pitfall 5: Auth.js v5 Session and Edge Runtime Conflicts

**What goes wrong:**
Authentication works in development but breaks in production with `JWEDecryptionFailed` errors, session data is undefined in Server Components, or middleware causes infinite redirect loops. Prisma adapter doesn't work with edge runtime.

**Why it happens:**
Auth.js v5 has several sharp edges: (1) Changing `AUTH_SECRET` in production invalidates all sessions. (2) The Prisma adapter for Auth.js needs a database connection, which conflicts with edge runtime middleware. (3) Session data from `auth()` in Server Components vs `useSession()` in Client Components can diverge, causing hydration mismatches. (4) The `authorized` callback in `auth.config.ts` runs in middleware (potentially edge), but Prisma cannot run on edge.

**How to avoid:**
- Use JWT strategy (not database sessions) for single-user — simpler, no adapter edge issues.
- Set `AUTH_SECRET` once and never change it in production.
- Split auth config: `auth.config.ts` (edge-safe, no Prisma) for middleware, `auth.ts` (full, with Prisma adapter) for Server Components/Actions.
- Use `auth()` in Server Components, wrap Client Components with `<SessionProvider session={session}>` from the root layout, passing the server-fetched session.
- Do NOT use the edge runtime for routes that need Prisma. Use the default Node.js runtime.

**Warning signs:**
- `JWEDecryptionFailed` errors in production logs
- Session is `null` in Server Components but works in Client Components
- Middleware redirect loops on auth-protected pages
- Build errors mentioning "edge runtime" and "prisma"

**Phase to address:**
Phase 1 (Foundation). Auth must be correctly configured before any protected routes exist.

---

### Pitfall 6: TanStack Table Client/Server State Split

**What goes wrong:**
The project table (500+ rows) loads all data client-side, causing a multi-second delay. Filtering and sorting happen in JavaScript instead of SQL, so complex filter combinations (status + genre + designer + size) are slow. The URL doesn't reflect filter state, so refreshing loses all filters.

**Why it happens:**
TanStack Table is headless and client-side by default. Its documentation emphasizes client-side features. Developers build the table with client-side filtering first ("it works with test data"), then struggle to retrofit server-side when real data arrives. The table manages its own state internally, disconnected from URL search params.

**How to avoid:**
- Design server-side from day one: `manualPagination: true`, `manualFiltering: true`, `manualSorting: true`.
- Sync table state with URL search params (`useSearchParams`) so filters survive refresh and are shareable.
- Server Components fetch data with `WHERE` clauses built from search params, pass results to the client table component.
- Provide `rowCount` or `pageCount` to TanStack Table for proper pagination controls.
- Load 50 rows per page, not all 500+ at once.
- Debounce text filter inputs (300ms) to avoid a query per keystroke.

**Warning signs:**
- Table component fetches all projects on mount with no pagination
- Filter state lives only in React state, not URL
- Sorting triggers a full client-side re-sort of all data
- No `manualPagination` in table config

**Phase to address:**
Phase 1 (Foundation) when building the initial project table view. The server-side pattern must be established first; retrofitting is painful.

---

### Pitfall 7: Prisma Migration Drift Between Dev and Production on Neon

**What goes wrong:**
`prisma migrate dev` creates migrations locally that fail on production Neon. Or worse, a developer runs `prisma db push` in production, creating schema drift that `prisma migrate deploy` cannot resolve. The migration history in the `_prisma_migrations` table diverges from the actual schema.

**Why it happens:**
`prisma migrate dev` resets the database and replays all migrations — fine locally, catastrophic on production. `prisma db push` skips migration history entirely. Developers connecting directly to the production Neon branch (instead of a dev branch) accidentally modify production schema.

**How to avoid:**
- NEVER use `prisma migrate dev` or `prisma db push` against production. Only `prisma migrate deploy`.
- Use Neon branching: create a dev branch from production, develop against it, merge migrations back.
- Add `prisma migrate deploy` to Vercel's build command: `"build": "prisma generate && prisma migrate deploy && next build"`.
- Keep separate `.env.local` (dev branch) and production env vars (Vercel dashboard) — never share connection strings.
- Use the `DIRECT_URL` (non-pooled) for all migration commands.
- Test migrations on a Neon branch before deploying to production.

**Warning signs:**
- `prisma migrate deploy` fails with "migration already applied" or "drift detected"
- Schema changes appear in production without a corresponding migration file
- `.env` file contains a production connection string

**Phase to address:**
Phase 1 (Foundation). Establish the migration workflow before any schema exists. Document it in the project's development workflow.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Skip database indexes | Faster initial development | Statistics queries slow to a crawl past 1000 sessions | Never — add indexes in the initial schema |
| Store full R2 URLs in DB | Simpler reads | Cannot change R2 bucket/domain without migrating all URLs | Never — store object keys only |
| Client-side filtering on tables | Faster prototype | Unusable with 500+ projects, no URL persistence | Only during early dev with <50 test records |
| Inline Prisma calls in components | Quick feature shipping | Violates single-responsibility, untestable, duplicated queries | Never — use `src/lib/` data access layer |
| `any` types for Prisma results | Bypass complex type mapping | Lose type safety on 50+ field entities, runtime errors | Never — use Prisma-generated types and map at boundaries |
| Skip Suspense boundaries | Fewer components to manage | Entire page blocks on slowest query, poor perceived performance | Only for pages with a single fast query |
| Hardcode size category thresholds | Faster implementation | User wants to adjust boundaries, requires code change | MVP only — make configurable by Phase 4 |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Prisma + Neon | Using one connection string for both app and migrations | Two strings: pooled `DATABASE_URL` for app, direct `DIRECT_URL` for CLI |
| Prisma + Vercel | Missing `prisma generate` in build | Add `"postinstall": "prisma generate"` to package.json |
| Cloudflare R2 | Uploading files through Vercel serverless (body size limit) | Use presigned URLs for direct client-to-R2 uploads |
| Auth.js + Prisma | Running Prisma adapter in edge middleware | Split auth config: edge-safe config for middleware, full config with Prisma for server |
| Recharts + SSR | Importing Recharts in Server Components (window undefined) | Dynamic import with `next/dynamic` and `ssr: false`, or thin Client Component wrapper |
| dnd-kit + SSR | Drag state mismatch between server and client render | Wrap in Client Component, use `useEffect` for initial layout load to avoid hydration mismatch |
| Serwist (PWA) + Turbopack | Serwist requires Webpack but Next.js defaults to Turbopack | Use `next build --webpack` in build script; dev can still use Turbopack |
| TanStack Table + Server Components | Passing non-serializable data (Dates, Prisma Decimals) as props | Serialize dates to ISO strings and Decimals to numbers before passing to Client Components |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| N+1 queries on project list | List page slows linearly with project count | Use Prisma `include` or `select` with relations; batch queries | 50+ projects with related designers/supplies |
| Sequential stats queries | Statistics page takes 5+ seconds | Batch with `Promise.all()`, use raw SQL CTEs for complex aggregations | 500+ stitch sessions |
| Unindexed date columns | Calendar and monthly views slow | Add `@@index([date])` on StitchSession, `@@index([status])` on Project | 1000+ sessions |
| Full table data fetch | Browser freezes rendering 500+ project cards | Server-side pagination (50/page), virtual scrolling for galleries | 200+ projects in gallery view |
| Large image props | Gallery cards load slowly | Store thumbnail URLs alongside originals, use `next/image` with `sizes` | 100+ projects with cover photos |
| Neon cold starts | First request after 5min idle takes 500ms+ | Add `connect_timeout=15`, consider warming endpoint, or accept latency for single-user | Every time after 5min idle on free tier |
| Shopping list UNION query | Slow aggregation across 3 junction tables | Index foreign keys on ProjectThread, ProjectBead, ProjectSpecialty; consider a database view | 50+ projects with supplies linked |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Presigned URL without file type validation | Users upload executable files to R2 | Validate MIME type and extension server-side before generating presigned URL; set `Content-Type` in presigned URL conditions |
| AUTH_SECRET in code or .env committed to git | Session hijacking, auth bypass | Use Vercel environment variables; `.env` in `.gitignore`; `.env.example` with placeholders only |
| Server Action without session check | Unauthenticated mutations to database | Every Server Action starts with `const session = await auth(); if (!session) throw new Error("Unauthorized")` |
| R2 bucket with public read on all objects | Digital working copies (copyrighted PDFs) accessible to anyone | Use private bucket + presigned read URLs with short expiration (1 hour) for viewing |
| Exposing Prisma errors to client | Database schema details leaked in error messages | Catch Prisma errors in Server Actions, return generic error messages, log details server-side |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| No optimistic updates on stitch logging | User logs stitches, waits for server, feels slow | Optimistic UI update, then reconcile with server response. This is the most frequent action. |
| Filter state lost on navigation | User sets 5 filters, clicks a project, goes back, filters are gone | Persist filter state in URL search params |
| No loading states on statistics | Statistics page appears broken while computing | Skeleton loaders per stat card with Suspense boundaries |
| Full-page reload on status change | Changing project status from gallery view refreshes everything | Use Server Actions with `revalidatePath` for targeted revalidation |
| Tiny tap targets on mobile | iPhone users can't easily tap gallery cards or filter chips | Minimum 44px touch targets, adequate spacing between interactive elements |
| Shopping list without project context | User sees "DMC 310 x 2" but doesn't know which project | Always show project name alongside supply items, group by project |
| No confirmation on destructive actions | Accidentally delete a project with 200 logged sessions | Confirm dialog for deletes; consider soft-delete for projects with session history |

## "Looks Done But Isn't" Checklist

- [ ] **Project CRUD:** Often missing bulk operations (delete multiple, change status of multiple) -- verify multi-select works on table view
- [ ] **File uploads:** Often missing error handling for network failures mid-upload -- verify retry/resume behavior and user feedback
- [ ] **Statistics engine:** Often missing edge cases for projects with no sessions, zero stitch count, or null dates -- verify stats don't show NaN/Infinity
- [ ] **Shopping list:** Often missing the case where quantity_required is null (user hasn't entered it yet) -- verify graceful handling
- [ ] **Auth:** Often missing the session refresh flow -- verify session doesn't expire during a long stitching entry
- [ ] **PWA:** Often missing the manifest icon set (multiple sizes) -- verify installability on iOS Safari specifically
- [ ] **Search/filter:** Often missing empty state ("no projects match your filters") -- verify helpful empty states with filter reset option
- [ ] **Responsive layout:** Often missing overflow handling on tables with many columns -- verify horizontal scroll on mobile
- [ ] **Gallery cards:** Often missing loading state for cover images -- verify placeholder/skeleton while images load
- [ ] **Kitting status:** Often missing recalculation when supplies are added/removed -- verify auto-update triggers

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Wrong connection config (Pitfall 1) | LOW | Update env vars, redeploy. No data loss. |
| Client Component overuse (Pitfall 2) | MEDIUM | Refactor page by page. Extract data fetching to Server Components, push "use client" down to leaf components. |
| Sequential stats queries (Pitfall 3) | MEDIUM | Replace individual queries with raw SQL CTEs. Requires writing PostgreSQL, but data model stays the same. |
| File upload through serverless (Pitfall 4) | MEDIUM | Implement presigned URL flow. Update upload components. Existing files in R2 are unaffected. |
| Auth.js misconfiguration (Pitfall 5) | LOW-MEDIUM | Fix config files. If AUTH_SECRET changed, all sessions invalidated (users must re-login — minor for single-user). |
| Client-side table filtering (Pitfall 6) | HIGH | Requires rewriting data flow: Server Component fetching, URL state management, API changes. Most disruptive to retrofit. |
| Migration drift (Pitfall 7) | HIGH | May require `prisma migrate resolve` or manual SQL. Risk of data loss if schema diverged significantly. |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Connection misconfiguration | Phase 1 | First deploy to Vercel succeeds; queries work after 5min idle |
| Client Component overuse | Phase 1 | No `"use client"` on any page.tsx; build bundle analysis shows reasonable JS size |
| Stats query performance | Phase 3 (indexes in Phase 1) | Statistics page loads in <2s with 1000+ sessions |
| File upload architecture | Phase 1 | 10MB PDF uploads succeed on Vercel production |
| Auth.js configuration | Phase 1 | Auth works after deploy; session persists across page navigations |
| Table server-side patterns | Phase 1 | Project table URL reflects current filters; page loads <1s with 500 projects |
| Migration workflow | Phase 1 | Documented workflow; CI/CD runs `prisma migrate deploy` |
| Presigned URL security | Phase 1 | R2 objects not publicly accessible; read URLs expire |
| Statistics edge cases | Phase 3 | No NaN/Infinity in stats with empty projects |
| PWA installability | Phase 1 (basic), Phase 5 (offline) | App installable on iOS Safari; icon renders correctly |
| Shopping list performance | Phase 2 | Shopping list loads <2s with 50+ projects having supplies |

## Sources

- [Neon: Connect from Prisma](https://neon.com/docs/guides/prisma) — Official connection setup guide with pooling requirements
- [Neon: Connection Latency and Timeouts](https://neon.com/docs/connect/connection-latency) — Cold start behavior documentation
- [Neon: Schema Migrations with Prisma](https://neon.com/docs/guides/prisma-migrations) — Migration workflow for dev/prod
- [Prisma: Query Optimization](https://www.prisma.io/docs/orm/prisma-client/queries/advanced/query-optimization-performance) — Join strategy and indexing guidance
- [Prisma: Development and Production Workflows](https://www.prisma.io/docs/orm/prisma-migrate/workflows/development-and-production) — migrate dev vs deploy
- [Vercel: Common Mistakes with Next.js App Router](https://vercel.com/blog/common-mistakes-with-the-next-js-app-router-and-how-to-fix-them) — Official pitfall list
- [Vercel: Function Timeout Guide](https://vercel.com/kb/guide/what-can-i-do-about-vercel-serverless-functions-timing-out) — Serverless limits and Fluid Compute
- [Auth.js: Migrating to v5](https://authjs.dev/getting-started/migrating-to-v5) — Breaking changes and configuration
- [TanStack Table: Pagination Guide](https://tanstack.com/table/v8/docs/guide/pagination) — Server-side pagination setup
- [Serwist: Getting Started with Next.js](https://serwist.pages.dev/docs/next/getting-started) — PWA setup and Turbopack limitation
- [Next.js: PWA Guide](https://nextjs.org/docs/app/guides/progressive-web-apps) — Official PWA documentation
- [The Rise and Fall of Next.js Edge Runtime (2026)](https://yceffort.kr/en/2026/03/nextjs-edge-runtime-rise-and-fall) — Why to avoid edge runtime for data-heavy apps

---
*Pitfalls research for: Cross-stitch project management app (Next.js + Prisma + Neon + Vercel)*
*Researched: 2026-03-28*

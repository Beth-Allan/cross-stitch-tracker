# Project Research Summary

**Project:** Cross-Stitch Tracker
**Domain:** Personal craft project management (collection tracking, supply management, session logging, statistics)
**Researched:** 2026-03-28
**Confidence:** HIGH

## Executive Summary

This is a data-rich single-user web application — comparable to Ravelry for knitting but personal-first rather than community-first. The competitive landscape is fragmented: no existing app combines collection management, supply tracking, session logging, and comprehensive statistics in a single tool. The gap is real and well-defined. The recommended approach is a Next.js 16 App Router application using Server Components for data-heavy pages, Server Actions for mutations, and a thin layer of Client Islands for interactive components (tables, charts, drag-drop). The Prisma + Neon PostgreSQL + Cloudflare R2 stack handles all persistence and file storage needs at zero cost for single-user scale.

The architecture is clean and the patterns are well-established: computed fields (size category, kitting status, progress %) are calculated at query time in TypeScript helpers rather than stored redundantly. Complex statistics use PostgreSQL CTEs and window functions via Prisma's TypedSQL feature rather than dozens of sequential Prisma API calls. File uploads bypass Vercel's 4.5MB serverless body limit by using presigned R2 URLs — the client uploads directly, the server stores only the object key. These three patterns are load-bearing and must be established in Phase 1.

The primary risks are all Phase 1 configuration issues: Prisma + Neon requires two separate connection strings (pooled for the app, direct for migrations), Auth.js v5 has edge runtime conflicts that require a split config strategy, and the TanStack Table must be designed server-side from day one (retrofitting is rated HIGH recovery cost). The statistics engine is the project's core differentiator and its most complex engineering challenge — it should be budgeted accordingly in Phase 3. Everything else follows well-documented patterns with strong prior art.

---

## Key Findings

### Recommended Stack

The project's CLAUDE.md stack is confirmed and updated to current versions. The most significant version update is Next.js 16.2 (the CLAUDE.md says "14+" but 16 is the correct greenfield choice — Next.js 15 is already Maintenance LTS). Tailwind CSS 4.2 ships with CSS-native `@theme` configuration (no `tailwind.config.js`), which simplifies the custom design token setup. shadcn/ui is recommended as a component foundation since its components are copied into the project (not a dependency) and fully support Tailwind v4 and the custom design system.

Three significant "never use" findings: `next-pwa` is unmaintained — use `@serwist/next` instead. `react-beautiful-dnd` is deprecated — use `@dnd-kit/core 6.x`. The new `@dnd-kit/react 0.x` package is pre-1.0 with only 38 dependents — use the stable `@dnd-kit/core 6.x`. Auth.js v5 (installed as `next-auth@beta`) is the only version that supports Next.js 16 App Router; the "stable" v4 cannot be used.

**Core technologies:**
- **Next.js 16.2**: Full-stack framework — Active LTS, Turbopack default, React 19.2, async request APIs
- **TypeScript 5.7+**: Type safety — ships with Next.js 16, strict mode required
- **PostgreSQL 17 on Neon**: Database — superior window functions and CTEs for statistics engine, serverless-friendly
- **Prisma 7.4**: ORM — auto-generated types, readable queries, TypedSQL for raw aggregations; configured via `prisma.config.ts` (not schema.prisma) with Neon adapter
- **Tailwind CSS 4.2**: Styling — CSS-native `@theme` config, OKLCH colors, 5x faster builds
- **Zod 4.3**: Validation — 14x faster string parsing, used at all Server Action / API boundaries
- **next-auth@beta (v5)**: Auth — JWT strategy, split config for edge/node runtimes
- **@serwist/next 9.5**: PWA — maintained successor to unmaintained next-pwa
- **@dnd-kit/core 6.x**: Drag-drop — stable, 2,355+ dependents, proven React 19 compatibility
- **@tanstack/react-table 8.21**: Tables — headless, server-side mode required from day one
- **Recharts 3.8**: Charts — declarative React, actively maintained, covers all needed chart types
- **Cloudflare R2**: File storage — 10GB free, zero egress fees, S3-compatible

**Critical version/config requirements:**
- Two Neon connection strings: `DATABASE_URL` (pooled, `-pooler` suffix) and `DIRECT_URL` (direct, for CLI)
- Add `connect_timeout=15` to pooled URL to handle Neon cold starts
- Prisma 7 uses `prisma.config.ts` for connection config, NOT `datasource.url` in schema.prisma
- Auth.js: split `auth.config.ts` (edge-safe) and `auth.ts` (full, Node.js only)
- Next.js 16 renamed `middleware.ts` to `proxy.ts`; all request APIs are async (must `await cookies()`, `params`, etc.)

### Expected Features

No existing app covers all four dimensions: collection management + supply tracking + session logging + statistics. This project fills a real gap. The most defensible differentiators are the comprehensive statistics engine (no competitor is close), auto-calculated kitting status (unique composite state), and SAL support (niche but underserved).

**Must have (table stakes) — users will not accept the app without these:**
- Project CRUD with rich metadata (~50 fields) — the core entity
- 7-stage status system (Unstarted through FFO) — project lifecycle
- Cover photo and digital file storage (R2) — chart PDFs and images
- Pre-seeded DMC thread catalog (~500 colors with hex swatches) — huge UX win
- Per-project supply linking with quantity tracking — 3 separate junction tables
- Auto-generated shopping list — the #1 pain point from the existing Notion system
- Stitch session logging (fast, <30 seconds) — daily use
- Progress tracking (auto-calculated from sessions) — core feedback loop
- Basic statistics (daily/weekly/monthly/yearly) — motivation
- Gallery + list + table views with filtering and sorting — browsing
- PWA installable (home screen icon) — iPhone usage

**Should have (differentiators worth building in v1.x):**
- Kitting status auto-calculation (composite of 8+ boolean conditions) — unique, high value
- Comprehensive statistics engine (Year in Review, 8 stat sections) — core differentiator
- SAL support (multi-part charts, evolving supply needs) — niche, underserved
- Stitch calendar view (GitHub-style contribution graph) — visual motivation
- Series/collection management with completion tracking — organizational win
- Status-specific gallery card layouts (3 variants) — polish that pays off

**Defer to v2+:**
- Draggable widget dashboards (dnd-kit integration) — aspirational, high complexity
- Goal tracking with 6 rotation styles — capstone feature, needs all other systems first
- Achievement trophy case — gamification layer
- Full 4-dashboard system (Pattern Dive, Shopping Cart, etc.) — needs underlying data pages first
- Scheduling plans — low priority, post-MVP

**Explicitly not building (anti-features):**
- Pattern viewer / markup tool — Pattern Keeper and Markup R-XP own this, no ROI competing
- Offline-first service worker sync — deferred to Phase 5; basic PWA (installable) is sufficient for launch
- Real-time multi-user collaboration — single-user architecture with multi-user awareness is sufficient
- Thread stash inventory (global owned quantities) — per-project is the MVP need

### Architecture Approach

The architecture follows Next.js App Router best practices: Server Components own data fetching and page rendering, Client Islands handle interactivity (forms, tables, charts, drag-drop), and Server Actions handle all mutations with Zod validation + auth check + `revalidatePath`. The `(dashboard)/layout.tsx` route group is the single auth enforcement point — no per-page guards needed. Computed fields (size category, kitting status, progress %) are never stored in the database; they are calculated in `lib/queries/` TypeScript helpers and returned alongside database rows. File uploads use a two-step presigned URL flow: client requests presigned URL from API route, uploads directly to R2, then saves the object key via Server Action. Complex statistics use Prisma's TypedSQL feature (`.sql` files in `prisma/sql/`) for PostgreSQL CTEs and window functions — this is the correct tool for the statistics engine, not dozens of sequential Prisma API calls.

**Major components:**
1. **Server Components** — page.tsx and layout.tsx files; direct Prisma queries via `lib/queries/`; no client JS
2. **Client Islands** — thin wrappers for TanStack Table, Recharts, dnd-kit, forms; receive pre-fetched data as props
3. **Server Actions (`lib/actions/`)** — mutation layer; Zod validation + auth check + Prisma write + revalidatePath per domain file
4. **Data Queries (`lib/queries/`)** — read layer; Prisma includes with computed field enrichment; TypedSQL for aggregations
5. **Prisma ORM + TypedSQL** — typed database access; `prisma/sql/*.sql` files for statistics queries
6. **Cloudflare R2** — binary storage via S3Client; presigned URLs generated in `/api/upload` route handler
7. **Auth.js (JWT)** — single-user credentials provider; split config for edge/node compatibility
8. **Design system (`components/ui/`)** — shadcn/ui components customized with Fraunces/Source Sans 3/JetBrains Mono and emerald/amber/stone palette via CSS variables and Tailwind @theme

**Key data flow principles:**
- Filter state lives in URL search params — survives navigation, shareable, no client state needed
- Prisma types stay in the data layer; components receive types from `src/types/` (mapped with computed fields)
- Shopping list uses `UNION ALL` across three junction tables in a single TypedSQL query
- Statistics queries batch with `Promise.all()` and use CTEs rather than sequential awaits

### Critical Pitfalls

1. **Neon + Prisma connection misconfiguration** — requires two separate connection strings (`DATABASE_URL` pooled + `DIRECT_URL` direct), `connect_timeout=15`, and Prisma 7's `prisma.config.ts` setup. Get this wrong and every subsequent phase has flaky behavior. Fix in Phase 1.

2. **`"use client"` overuse** — marking pages as client components balloons bundle size and kills performance. Pattern: Server Component pages fetch data, Client Islands receive it as props. Never add `"use client"` to `page.tsx`. Fix in Phase 1.

3. **TanStack Table designed client-side first** — rated HIGH recovery cost to retrofit. Must be built with `manualPagination: true`, `manualFiltering: true`, `manualSorting: true`, and URL search param state from the first table. Fix in Phase 1.

4. **File upload through Vercel serverless** — Vercel Hobby plan has a 4.5MB body limit. PDFs will fail. Presigned URL pattern (client uploads directly to R2) is the only correct approach. Fix in Phase 1.

5. **Sequential statistics queries** — the statistics engine will time out if each stat is an individual `await prisma.aggregate()` call. Use TypedSQL with CTEs and `Promise.all()` batching. Add `@@index` on `StitchSession.date` and `StitchSession.projectId` in the initial schema. Fix in Phase 1 (indexes) and Phase 3 (query implementation).

6. **Auth.js v5 edge runtime conflict** — Prisma cannot run on Vercel Edge. Requires split config: `auth.config.ts` (edge-safe, no Prisma) for proxy/middleware, `auth.ts` (full, Node.js) for Server Components and Actions. Fix in Phase 1.

7. **Prisma migration drift** — `prisma migrate dev` resets the database; `prisma db push` skips migration history. Only `prisma migrate deploy` in production. Add it to Vercel build command: `prisma generate && prisma migrate deploy && next build`. Fix in Phase 1.

---

## Implications for Roadmap

The feature dependency graph and pitfall-to-phase mapping from research both point to the same build order. Project CRUD is the foundation for everything. Supply databases must exist before supply-project linking. Sessions must exist before statistics. Statistics must exist before the statistics UI. Gallery cards and dashboards are presentation layers that compose data from all other systems. Goals and rotations are the capstone and come last.

### Phase 1: Foundation & Core Project Management

**Rationale:** Everything depends on projects existing. Auth, database connections, design system, and the Server Component / Server Action / Client Island patterns must be established correctly before any feature is built. The most expensive pitfalls (connection config, client component overuse, table architecture, file uploads, auth edge runtime, migration workflow) all strike here. Getting Phase 1 right means every subsequent phase follows the established pattern.

**Delivers:** Working app with auth, project CRUD (~50 fields), designer/genre management, cover photo + digital file upload (R2), gallery/list views with filtering and sorting, 7-stage status system, responsive layout, PWA installable.

**Addresses features:** Auth, Project CRUD, Designer CRUD, Genre management, Status system, Digital file storage, Size category auto-calculation, Basic gallery/list views, Filtering and sorting, PWA installable.

**Avoids pitfalls:** All 7 critical pitfalls require Phase 1 setup. Connection config, auth split config, presigned upload pattern, no `"use client"` on pages, server-side table pagination, migration workflow, and database indexes on StitchSession columns (even before sessions exist).

**Research flag:** Standard patterns. No deeper research needed — everything is well-documented and the patterns are clear.

---

### Phase 2: Supply Management & Shopping

**Rationale:** The DMC catalog pre-seed is a major UX unlock that enables supply tracking. Supply tracking is the foundation for the shopping list (the user's #1 pain point from Notion) and kitting status calculation. These three features are tightly coupled and should ship together. The architecture (3 separate junction tables, `UNION ALL` shopping list query) is already defined.

**Delivers:** Pre-seeded DMC thread catalog (~500 colors), bead and specialty item databases, per-project supply linking with quantity tracking, auto-generated shopping list grouped by project, kitting status auto-calculation with progress indicator.

**Addresses features:** DMC catalog (P1), Bead/specialty databases (P1), Project-supply linking (P1), Shopping list (P1), Kitting status calculation (P1).

**Avoids pitfalls:** Shopping list UNION query needs indexes on ProjectThread/ProjectBead/ProjectSpecialty foreign keys. Supply forms need optimistic updates for the frequent "add thread" action.

**Research flag:** Standard patterns. Well-documented with clear architecture. No research needed.

---

### Phase 3: Stitch Sessions & Statistics Engine

**Rationale:** Session logging is the daily-use feature that drives long-term engagement. Statistics are the core differentiator — no competitor comes close to the planned depth. These are built together because statistics are meaningless without sessions and the TypedSQL query infrastructure serves both. The statistics engine's complexity warrants careful phase allocation.

**Delivers:** Quick stitch log form (date, project, count, time, photo), progress tracking auto-updated from sessions, basic statistics (daily/weekly/monthly/yearly), monthly stitch bar charts (Recharts), stitch calendar view (GitHub-style), session history table.

**Addresses features:** Stitch session logging (P1), Progress tracking (P1), Basic statistics (P2), Monthly bar charts (P2), Stitch calendar (P2), Session history (P2).

**Avoids pitfalls:** Use TypedSQL CTEs for all aggregation — no sequential `prisma.aggregate()` calls. Batch independent stat queries with `Promise.all()`. Recharts must be a Client Island (SSR conflict with `window`). Statistics edge cases: null stitch counts, projects with zero sessions, date gaps.

**Research flag:** Needs `/gsd:research-phase` for the TypedSQL statistics queries. The CTE structure for monthly/yearly aggregation, streak calculation, and Year in Review is complex enough to benefit from research into PostgreSQL window functions and the Prisma TypedSQL API before writing query files.

---

### Phase 4: Advanced Views & Gallery System

**Rationale:** With all data in the database, the presentation layer can be fully built. Gallery cards with status-specific layouts (WIP shows progress, Unstarted shows kitting needs, Finished shows completion photo) deliver visible polish. Series management groups projects. The full Pattern Dive view composes gallery + filters into the primary library browser.

**Delivers:** Status-specific gallery card layouts (3 variants), SAL support UI (part tracking, cumulative stitch counts), Series/collection management with completion tracking, Fabric CRUD with size calculator, Storage location management, Pattern Dive deep library browser, enhanced filtering (multi-dimension filter bar with dismissible chips), view toggle (gallery/list/table).

**Addresses features:** Custom gallery cards (P2), SAL support (P2), Series management (P2), Fabric CRUD (P2), Storage locations (P3), Pattern Dive dashboard (P2), Enhanced filtering (P1).

**Avoids pitfalls:** Gallery cards must use `next/image` with `sizes` for cover photo performance. Skeleton loaders on gallery cards while images load. Full-page reload on status change avoided via targeted `revalidatePath`.

**Research flag:** Standard patterns. Gallery cards and filter bars are straightforward component work. No research needed.

---

### Phase 5: Statistics Deep Dive & Year in Review

**Rationale:** Once basic statistics work and sessions are accumulating, the comprehensive statistics engine (Year in Review, 8 stat sections, completion brackets, supply stats, achievement tracking) can be built on top of the TypedSQL infrastructure from Phase 3. This is the project's headline differentiator and deserves its own phase.

**Delivers:** Year in Review (comprehensive yearly summary), all 8 statistics sections (daily through lifetime, supply stats, project rankings, completion brackets), achievement/trophy case with auto-tracked milestones and streaks, stitch records.

**Addresses features:** Comprehensive statistics engine (P2), Year in Review (P2), Achievement system (P3).

**Avoids pitfalls:** Materialized views may be needed for expensive cross-table aggregations at this depth. Statistics page needs Suspense boundaries per stat section so slow queries don't block fast ones. Design stat pages to be screenshot-friendly (social sharing without API dependency).

**Research flag:** Needs `/gsd:research-phase` for Year in Review query design and achievement/streak calculation. The complexity of multi-year comparative stats and streak algorithms across sparse session data warrants research.

---

### Phase 6: Dashboard System & PWA Enhancement

**Rationale:** Dashboards compose all underlying data into purpose-built views. The Main Dashboard, Shopping Cart dashboard, and Project Dashboard need all previous phases complete before they can be meaningfully built. dnd-kit draggable widgets are the most complex UI feature and should come last among presentation work. PWA offline support (Serwist service worker caching) can be added alongside dashboards.

**Delivers:** Main Dashboard with recently added/currently stitching/spotlight widgets, Shopping Cart dashboard (aggregated supply needs across projects), Project Dashboard (active work tracking), draggable widget layout (dnd-kit), widget layout persistence, PWA offline support with Serwist caching strategies.

**Addresses features:** Main Dashboard (P2), Shopping Cart dashboard (P2), Project Dashboard (P2), Draggable widgets (P3), PWA offline (deferred from Phase 1).

**Avoids pitfalls:** dnd-kit requires Client Component and `useEffect` for initial layout load to avoid hydration mismatch. Widget layout persistence should use the database (not localStorage) for cross-device consistency. Serwist requires `--webpack` flag for dev PWA testing; production builds work normally.

**Research flag:** Needs `/gsd:research-phase` for dnd-kit widget persistence pattern and Serwist offline cache strategy. Widget layout serialization and service worker cache invalidation (when stats data changes) need thought.

---

### Phase 7: Goals, Plans & Rotation Management

**Rationale:** Goals and rotation management are the capstone features that require all other systems to be working. Rotation management (knowing which projects are in focus, tracking adherence) requires projects, sessions, and progress to be fully operational. These are the deepest niche features — highly valuable for power users, but not required for daily usefulness.

**Delivers:** Project-specific and global goal tracking, milestone targets and frequency goals with deadlines, 6 rotation styles (Focus+Rotate, Milestone, Round Robin, etc.), scheduling plans (recurring days, seasonal focus), rotation adherence tracking.

**Addresses features:** Goal tracking (P3), Rotation management (P3), Scheduling plans (P3).

**Avoids pitfalls:** No automated schedule generation — user sets the rotation plan, app tracks adherence. This avoids "AI-level complexity for marginal value."

**Research flag:** Needs `/gsd:research-phase`. Rotation management with 6 styles is deeply domain-specific and the data model for capturing rotation state (which project is up next, what counts as "done" for a rotation slot) needs research before schema design.

---

### Phase Ordering Rationale

- **Dependency chain:** Projects must exist before supplies, sessions, statistics, galleries, dashboards, or goals. This is the single most important ordering constraint — confirmed by both FEATURES.md dependency graph and ARCHITECTURE.md build order.
- **Pitfall front-loading:** All 7 critical pitfalls must be addressed in Phase 1. Later phases inherit correctly-established patterns rather than needing to retrofit.
- **Differentiator sequencing:** Statistics (Phase 3) and Year in Review (Phase 5) are split because Phase 3 builds the infrastructure and daily-use statistics while Phase 5 builds the showcase features that require accumulated data.
- **Presentation last:** Gallery polish (Phase 4) and dashboards (Phase 6) come after all data systems are built. They add value but don't unblock anything.
- **Complexity sequencing:** Simple CRUD (Phase 1-2) before aggregation (Phase 3) before presentation composition (Phase 4) before showcase features (Phase 5) before complex UI (Phase 6) before domain-specific capstone (Phase 7).

### Research Flags

Phases that need `/gsd:research-phase` during planning:
- **Phase 3 (Statistics Engine):** TypedSQL query structure for CTE-based aggregations, window functions for streaks and running totals, and Prisma's TypedSQL API specifics.
- **Phase 5 (Year in Review):** Multi-year comparative statistics, streak calculation across sparse session data, and achievement/milestone detection logic.
- **Phase 6 (Dashboards + PWA):** dnd-kit widget layout persistence pattern (database schema + serialization), Serwist service worker cache invalidation strategy for dynamic data.
- **Phase 7 (Goals & Rotations):** Rotation management data model (6 styles), state machine for rotation slot tracking, what counts as "completion" in each rotation style.

Phases with standard, well-documented patterns (skip `/gsd:research-phase`):
- **Phase 1 (Foundation):** Next.js App Router patterns, Prisma + Neon setup, Auth.js v5 config, Serwist basic manifest — all thoroughly documented with STACK.md providing exact configuration.
- **Phase 2 (Supplies):** Standard CRUD + junction tables + UNION query. Architecture is fully defined in ARCHITECTURE.md.
- **Phase 4 (Gallery & Views):** React component work with established patterns. Filter bar, view toggle, and gallery cards are standard UI.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Verified with official docs and npm registries. Version compatibility matrix cross-checked. Critical "never use" warnings sourced from official deprecation notices. |
| Features | MEDIUM-HIGH | Competitor analysis from real app store listings and community sources. Core feature set is well-validated. Advanced differentiators (statistics depth, rotation styles) are inferred from user needs, not validated against live user research. |
| Architecture | HIGH | Patterns directly sourced from Next.js official docs, Prisma docs, and Neon docs. Code examples in ARCHITECTURE.md reflect current 2026 best practices. The TypedSQL recommendation is current-generation Prisma capability. |
| Pitfalls | HIGH | Every critical pitfall is sourced from official documentation (Vercel, Neon, Auth.js, Prisma migration guides). Recovery costs are assessed from experience patterns, not just theoretical. |

**Overall confidence:** HIGH

### Gaps to Address

- **TanStack Table + React Compiler:** STACK.md notes potential compatibility issues between TanStack Table v8 and Next.js 16's default React Compiler. Monitor for updates; may need `"use no memo"` annotations on table components if issues arise.
- **shadcn/ui component selection:** Which specific shadcn/ui components to copy-install is left to Phase 1 planning. Start with the minimal set (button, card, badge, input, select, dialog) and add as needed.
- **Neon free tier limits:** 0.5 GB storage and 190 compute hours/month are sufficient for single-user development and initial use. If the DMC seed data + 500 project images approaches storage limits, evaluate Neon paid tier or R2 for all image storage.
- **Statistics query performance baseline:** PITFALLS.md flags stats queries as the first bottleneck. Establish a performance benchmark during Phase 3 (target: <2s with 1000+ sessions) before the statistics engine is considered done.
- **Progress photo storage:** Session progress photos are mentioned in the feature research but their storage strategy (R2 key pattern, max count per session) is not fully specified. Define during Phase 3 planning.

---

## Sources

### Primary (HIGH confidence)
- [Next.js 16.2 Blog Post](https://nextjs.org/blog/next-16-2) — version confirmation, breaking changes
- [Next.js Support Policy](https://nextjs.org/support-policy) — LTS lifecycle confirmation
- [Prisma 7.4 + Neon Integration](https://neon.com/docs/guides/prisma) — connection config, two-URL pattern
- [Auth.js v5 Migration Guide](https://authjs.dev/getting-started/migrating-to-v5) — edge runtime split config
- [Tailwind CSS v4 Blog](https://tailwindcss.com/blog/tailwindcss-v4) — @theme directive, CSS-native config
- [Serwist Getting Started](https://serwist.pages.dev/docs/next/getting-started) — PWA setup, Turbopack workaround
- [Vercel: Common Mistakes with Next.js App Router](https://vercel.com/blog/common-mistakes-with-the-next-js-app-router-and-how-to-fix-them) — pitfall verification
- [Cloudflare R2 Presigned URLs](https://developers.cloudflare.com/r2/api/s3/presigned-urls/) — upload architecture
- [Prisma TypedSQL](https://www.prisma.io/docs/orm/prisma-client/using-raw-sql/typedsql) — statistics engine approach
- [TanStack Table Pagination Guide](https://tanstack.com/table/v8/docs/guide/pagination) — server-side table pattern
- [Next.js Server Actions and Mutations](https://nextjs.org/docs/13/app/building-your-application/data-fetching/server-actions-and-mutations) — mutation pattern

### Secondary (MEDIUM confidence)
- [Lord Libidan: 23 Best Apps for Cross Stitchers](https://lordlibidan.com/the-best-apps-for-cross-stitchers/) — competitor landscape overview
- [Cross Stitch Journal on App Store](https://apps.apple.com/us/app/cross-stitch-journal/id6443886471) — competitor feature analysis
- [XStitch Plus on App Store](https://apps.apple.com/us/app/xstitch-plus/id1281394467) — competitor feature analysis
- [StitchPal on App Store](https://apps.apple.com/us/app/stitchpal/id1550536005) — competitor feature analysis
- [Sirious Stitches: Inventory Tracking](https://sirithre.com/inventory-tracking-cross-stitch-patterns-wips-and-materials/) — real stitcher workflow
- [Next.js App Router Best Practices (2026)](https://ztabs.co/blog/nextjs-app-router-best-practices) — current patterns
- [R2 + Next.js Upload Guide](https://www.buildwithmatija.com/blog/how-to-upload-files-to-cloudflare-r2-nextjs) — presigned URL implementation

### Tertiary (LOW confidence)
- [Cross Stitch Forum discussions](https://www.crossstitchforum.com/) — community feature sentiment (anecdotal)
- [The Fresh Cross Stitch: 7 Must-Have Apps](https://thefreshcrossstitch.com/blogs/tips-and-resources/7-must-have-apps-for-your-cross-stitch-and-embroidery) — app recommendations (blog)

---
*Research completed: 2026-03-28*
*Ready for roadmap: yes*

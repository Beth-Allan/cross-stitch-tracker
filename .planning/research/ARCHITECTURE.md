# Architecture Research

**Domain:** Cross-stitch project management (Next.js App Router, full-stack)
**Researched:** 2026-03-28
**Confidence:** HIGH

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Presentation Layer                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │ Server       │  │ Client       │  │ Shared UI    │              │
│  │ Components   │  │ Islands      │  │ Primitives   │              │
│  │ (pages,      │  │ (forms,      │  │ (Button,     │              │
│  │  layouts,    │  │  tables,     │  │  Card,       │              │
│  │  galleries)  │  │  charts,     │  │  Badge,      │              │
│  │              │  │  drag-drop)  │  │  FilterBar)  │              │
│  └──────┬───────┘  └──────┬───────┘  └──────────────┘              │
│         │                 │                                         │
├─────────┴─────────────────┴─────────────────────────────────────────┤
│                        Action Layer                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │ Server       │  │ API Routes   │  │ Data Queries │              │
│  │ Actions      │  │ (file upload │  │ (Prisma +    │              │
│  │ (mutations)  │  │  presign)    │  │  TypedSQL)   │              │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘              │
│         │                 │                  │                       │
├─────────┴─────────────────┴──────────────────┴──────────────────────┤
│                        Data Layer                                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │ Prisma ORM   │  │ Cloudflare   │  │ Auth.js      │              │
│  │ (PostgreSQL  │  │ R2           │  │ (session)    │              │
│  │  on Neon)    │  │ (files)      │  │              │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
└─────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Server Components | Data fetching, rendering static/dynamic HTML, SEO | `page.tsx`, `layout.tsx` files; direct Prisma calls; no `"use client"` |
| Client Islands | Interactivity: forms, tables, charts, drag-drop | `"use client"` components; receive data via props from Server Components |
| Shared UI Primitives | Design system tokens, reusable styled components | `src/components/ui/`; CVA for variant management; Tailwind tokens |
| Server Actions | All data mutations (create, update, delete) | `src/lib/actions/*.ts` with `"use server"`; Zod validation; `revalidatePath` |
| API Routes | File upload presigned URL generation | `src/app/api/upload/route.ts`; R2 presigned URL flow |
| Data Queries | Read-heavy operations, statistics, computed fields | `src/lib/queries/*.ts` for Prisma queries; `prisma/sql/*.sql` for TypedSQL stats |
| Prisma ORM | Schema, migrations, typed database access | Singleton client in `src/lib/db.ts`; pooled Neon connection |
| Cloudflare R2 | PDF/image binary storage | S3-compatible client; presigned URLs for upload; public bucket for reads |
| Auth.js | Single-user authentication, session management | Layout-level auth guard on `(dashboard)/` route group |

## Recommended Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Public auth routes
│   │   ├── login/page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/              # Authenticated routes (layout guards auth)
│   │   ├── layout.tsx            # Auth check + app shell (MainNav, TopBar)
│   │   ├── page.tsx              # Main Dashboard
│   │   ├── projects/
│   │   │   ├── page.tsx          # Project gallery/list/table
│   │   │   ├── [id]/page.tsx     # Project detail
│   │   │   └── new/page.tsx      # Create project
│   │   ├── pattern-dive/
│   │   │   └── page.tsx          # Deep library browser
│   │   ├── supplies/
│   │   │   ├── threads/page.tsx
│   │   │   ├── beads/page.tsx
│   │   │   └── specialty/page.tsx
│   │   ├── sessions/
│   │   │   └── page.tsx          # Stitch session log + quick entry
│   │   ├── stats/
│   │   │   └── page.tsx          # Statistics dashboard + Year in Review
│   │   ├── shopping/
│   │   │   └── page.tsx          # Shopping cart dashboard
│   │   ├── fabric/
│   │   │   └── page.tsx
│   │   ├── designers/
│   │   │   └── page.tsx
│   │   ├── series/
│   │   │   └── page.tsx
│   │   ├── goals/
│   │   │   └── page.tsx          # Goals, rotations, achievements
│   │   └── settings/
│   │       └── page.tsx
│   └── api/
│       └── upload/
│           └── route.ts          # Presigned URL generation for R2
├── components/
│   ├── ui/                       # Design system primitives
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── dialog.tsx
│   │   ├── status-badge.tsx      # 7 status colors
│   │   └── index.ts              # Barrel export
│   └── features/                 # Feature-specific components
│       ├── projects/
│       │   ├── project-card.tsx         # Gallery card (3 variants)
│       │   ├── project-form.tsx         # Create/edit form (Client)
│       │   ├── project-table.tsx        # TanStack Table (Client)
│       │   ├── project-gallery.tsx      # Gallery grid (Server)
│       │   ├── kitting-progress.tsx     # Kitting indicator
│       │   └── sal-parts-list.tsx       # SAL part management
│       ├── supplies/
│       │   ├── thread-picker.tsx        # Search/select DMC colors (Client)
│       │   ├── supply-table.tsx         # Per-project supply list
│       │   └── color-swatch.tsx         # Hex color display
│       ├── sessions/
│       │   ├── quick-log-form.tsx       # Fast session entry (Client)
│       │   ├── session-calendar.tsx     # Monthly calendar (Client)
│       │   └── stitch-bar-chart.tsx     # Recharts monthly chart (Client)
│       ├── stats/
│       │   ├── stat-card.tsx            # Single stat display
│       │   ├── year-in-review.tsx       # Year summary (Client for tab switching)
│       │   └── stats-grid.tsx           # Stats layout
│       ├── dashboard/
│       │   ├── widget-grid.tsx          # dnd-kit widget container (Client)
│       │   ├── widget-wrapper.tsx       # Draggable widget shell
│       │   └── widgets/                 # Individual widget components
│       ├── filters/
│       │   ├── filter-bar.tsx           # Reusable filter bar (Client)
│       │   ├── filter-chip.tsx          # Dismissible filter chip
│       │   └── view-toggle.tsx          # Gallery/list/table switcher
│       └── shell/
│           ├── main-nav.tsx             # Side navigation
│           ├── top-bar.tsx              # Header bar
│           └── user-menu.tsx            # User dropdown
├── lib/
│   ├── db.ts                     # Prisma client singleton
│   ├── auth.ts                   # Auth.js configuration
│   ├── r2.ts                     # R2 client (S3Client) singleton
│   ├── actions/                  # Server Actions by domain
│   │   ├── projects.ts           # Project CRUD mutations
│   │   ├── sessions.ts           # Stitch session mutations
│   │   ├── supplies.ts           # Supply linking mutations
│   │   ├── designers.ts          # Designer CRUD
│   │   ├── fabric.ts             # Fabric CRUD
│   │   ├── series.ts             # Series CRUD
│   │   └── goals.ts              # Goals and rotation mutations
│   ├── queries/                  # Read-heavy data access
│   │   ├── projects.ts           # Project queries with computed fields
│   │   ├── stats.ts              # Statistics aggregation orchestrator
│   │   ├── shopping.ts           # Shopping list (UNION across junction tables)
│   │   ├── kitting.ts            # Kitting status computation
│   │   └── dashboard.ts          # Dashboard widget data
│   ├── validations/              # Zod schemas
│   │   ├── project.ts
│   │   ├── session.ts
│   │   ├── supply.ts
│   │   └── shared.ts             # Reusable validators (pagination, filters)
│   └── utils/
│       ├── calculations.ts       # Size category, fabric size, progress %
│       ├── formatting.ts         # Number/date formatting
│       └── file-upload.ts        # Client-side upload helpers
├── types/
│   ├── project.ts                # Mapped types for components (not raw Prisma)
│   ├── stats.ts                  # Statistics result types
│   ├── supply.ts                 # Supply display types
│   └── filters.ts                # Filter state types
└── styles/
    └── tokens.css                # Design token CSS variables
prisma/
├── schema.prisma                 # Database schema (source of truth)
├── sql/                          # TypedSQL query files
│   ├── monthly-stitch-totals.sql
│   ├── year-in-review.sql
│   ├── daily-averages.sql
│   ├── project-rankings.sql
│   └── supply-statistics.sql
├── migrations/                   # Generated migration files
└── seed.ts                       # DMC catalog seed data
```

### Structure Rationale

- **`app/` route groups:** `(auth)` and `(dashboard)` separate public vs. authenticated routes. Auth check lives once in `(dashboard)/layout.tsx`, not per-page.
- **`components/ui/` vs `features/`:** UI primitives are generic and reusable everywhere. Feature components are domain-specific and live near the feature they serve. Components only graduate to `ui/` when genuinely reused across 2+ features.
- **`lib/actions/` by domain:** One file per entity domain. Each file starts with `"use server"`. Server Actions handle Zod validation, auth check, Prisma mutation, and `revalidatePath`. Keeps mutation logic colocated and discoverable.
- **`lib/queries/` separate from actions:** Read operations live separately because they are called from Server Components (not invoked as actions). This makes the data flow direction explicit: queries flow down into components, actions flow up from user interactions.
- **`prisma/sql/` for TypedSQL:** Complex statistics queries (window functions, CTEs, multi-table aggregations) belong in `.sql` files using Prisma's TypedSQL feature. This gives full PostgreSQL power with type-safe results, avoiding brittle `$queryRaw` template strings.
- **`types/` separate from Prisma:** Components never import Prisma-generated types directly. The `types/` directory contains mapped/transformed types that add computed fields and omit internal database details. This decouples the UI from the schema.

## Architectural Patterns

### Pattern 1: Server Component Data Fetching with Computed Fields

**What:** Server Components fetch data directly via Prisma, compute derived fields (size category, progress %, kitting status) in TypeScript, and pass the enriched data to child components.
**When to use:** Every page load, gallery view, detail view.
**Trade-offs:** Simple and fast (no API round-trip), but computed fields are recalculated on every render. For this single-user app with ~500 projects, this is negligible.

**Example:**
```typescript
// src/app/(dashboard)/projects/page.tsx (Server Component)
import { getProjectsWithComputedFields } from "@/lib/queries/projects";
import { ProjectGallery } from "@/components/features/projects/project-gallery";

export default async function ProjectsPage({ searchParams }: Props) {
  const filters = parseFilters(await searchParams);
  const projects = await getProjectsWithComputedFields(filters);
  // projects already have sizeCategory, progressPercent, kittingStatus computed
  return <ProjectGallery projects={projects} filters={filters} />;
}
```

```typescript
// src/lib/queries/projects.ts
import { prisma } from "@/lib/db";
import { computeSizeCategory, computeProgress } from "@/lib/utils/calculations";
import type { ProjectWithComputed } from "@/types/project";

export async function getProjectsWithComputedFields(
  filters: ProjectFilters
): Promise<ProjectWithComputed[]> {
  const projects = await prisma.project.findMany({
    where: buildWhereClause(filters),
    include: {
      designer: true,
      genres: true,
      projectThreads: { include: { thread: true } },
      projectBeads: { include: { bead: true } },
      projectSpecialty: { include: { specialtyItem: true } },
      fabric: true,
      _count: { select: { stitchSessions: true } },
    },
  });

  return projects.map((p) => ({
    ...p,
    sizeCategory: computeSizeCategory(p.stitchCount),
    progressPercent: computeProgress(p),
    kittingStatus: computeKittingStatus(p),
  }));
}
```

### Pattern 2: Server Actions with Zod Validation

**What:** All mutations go through Server Actions. Each action validates input with Zod, checks auth, performs the mutation, and revalidates the relevant path.
**When to use:** Every create, update, delete operation.
**Trade-offs:** Progressive enhancement (forms work without JS). Single roundtrip. Type-safe from form to database.

**Example:**
```typescript
// src/lib/actions/sessions.ts
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

const LogSessionSchema = z.object({
  projectId: z.string().cuid(),
  stitchCount: z.number().int().positive().max(100000),
  date: z.coerce.date(),
  timeMinutes: z.number().int().positive().optional(),
});

export async function logStitchSession(formData: FormData) {
  await requireAuth();

  const parsed = LogSessionSchema.safeParse({
    projectId: formData.get("projectId"),
    stitchCount: Number(formData.get("stitchCount")),
    date: formData.get("date"),
    timeMinutes: formData.get("timeMinutes")
      ? Number(formData.get("timeMinutes"))
      : undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten() };
  }

  await prisma.stitchSession.create({ data: parsed.data });

  revalidatePath("/sessions");
  revalidatePath("/stats");
  revalidatePath(`/projects/${parsed.data.projectId}`);
}
```

### Pattern 3: Presigned URL Upload for Files

**What:** File uploads (cover photos, PDFs, progress photos) use a two-step flow: (1) Client requests a presigned PUT URL from an API route, (2) Client uploads directly to R2. The file URL is then saved via a Server Action.
**When to use:** All file uploads (cover images, digital working copies, session photos).
**Trade-offs:** Avoids Vercel's 4.5MB body limit on serverless functions. Client uploads directly to R2 without burdening the app server. Requires tracking file creation to avoid orphaned files.

**Example:**
```typescript
// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2Client } from "@/lib/r2";
import { requireAuth } from "@/lib/auth";
import { nanoid } from "nanoid";

export async function POST(request: NextRequest) {
  await requireAuth();

  const { filename, contentType } = await request.json();
  const key = `uploads/${nanoid()}-${sanitizeFilename(filename)}`;

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  const presignedUrl = await getSignedUrl(r2Client, command, {
    expiresIn: 600, // 10 minutes
  });

  return NextResponse.json({ presignedUrl, key });
}
```

```typescript
// Client-side upload helper (src/lib/utils/file-upload.ts)
export async function uploadFile(file: File): Promise<string> {
  // Step 1: Get presigned URL
  const res = await fetch("/api/upload", {
    method: "POST",
    body: JSON.stringify({
      filename: file.name,
      contentType: file.type,
    }),
  });
  const { presignedUrl, key } = await res.json();

  // Step 2: Upload directly to R2
  await fetch(presignedUrl, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type },
  });

  return key; // Save this key via Server Action
}
```

### Pattern 4: TypedSQL for Statistics Engine

**What:** Complex aggregation queries (monthly totals, year-in-review, daily averages, rankings) live in `.sql` files inside `prisma/sql/`. Prisma's TypedSQL generates type-safe functions from these files. The queries use PostgreSQL window functions, CTEs, and `UNION ALL` freely.
**When to use:** Any statistics computation, shopping list generation, leaderboard/ranking queries.
**Trade-offs:** Full PostgreSQL power with type safety. Queries are version-controlled and reviewable. Requires running `prisma generate` after changing `.sql` files.

**Example:**
```sql
-- prisma/sql/monthly-stitch-totals.sql
-- @param {Int} $1:year
SELECT
  EXTRACT(MONTH FROM date)::int AS month,
  SUM(stitch_count)::int AS total_stitches,
  COUNT(*)::int AS session_count,
  MAX(stitch_count)::int AS best_day,
  ROUND(AVG(stitch_count))::int AS daily_average
FROM "StitchSession"
WHERE EXTRACT(YEAR FROM date) = $1
GROUP BY EXTRACT(MONTH FROM date)
ORDER BY month;
```

```typescript
// src/lib/queries/stats.ts
import { prisma } from "@/lib/db";
import { monthlyStitchTotals } from "@prisma/client/sql";

export async function getMonthlyStitchTotals(year: number) {
  return prisma.$queryRawTyped(monthlyStitchTotals(year));
}
```

### Pattern 5: Client Island Architecture for Interactive Components

**What:** Server Components render the page shell and fetch data. Interactive parts (filter bar, TanStack Table, Recharts, dnd-kit widgets) are Client Components that receive data as props. The client boundary is drawn as small as possible.
**When to use:** Any component needing `useState`, `useEffect`, event handlers, or third-party client-side libraries.
**Trade-offs:** Maximizes server rendering (faster initial loads, smaller JS bundles). Requires careful boundary drawing to avoid pulling too much into the client bundle.

**Example:**
```typescript
// Server Component renders page, passes data to Client Island
// src/app/(dashboard)/stats/page.tsx
import { getMonthlyStitchTotals } from "@/lib/queries/stats";
import { StitchBarChart } from "@/components/features/sessions/stitch-bar-chart";

export default async function StatsPage() {
  const monthlyData = await getMonthlyStitchTotals(2026);
  return (
    <div>
      <h1>Stitching Statistics</h1>
      {/* Client Island - only this component ships JS */}
      <StitchBarChart data={monthlyData} />
    </div>
  );
}
```

```typescript
// src/components/features/sessions/stitch-bar-chart.tsx
"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import type { MonthlyStitchTotal } from "@/types/stats";

export function StitchBarChart({ data }: { data: MonthlyStitchTotal[] }) {
  return (
    <BarChart width={800} height={400} data={data}>
      <XAxis dataKey="month" />
      <YAxis />
      <Tooltip />
      <Bar dataKey="totalStitches" fill="var(--color-emerald-600)" />
    </BarChart>
  );
}
```

## Data Flow

### Request Flow (Read)

```
Browser Request
    |
    v
Next.js Router (App Router)
    |
    v
layout.tsx [Auth Check via Auth.js]
    |
    v
page.tsx [Server Component]
    |
    ├─→ lib/queries/*.ts [Prisma query + compute fields]
    │       |
    │       v
    │   PostgreSQL (Neon, pooled connection)
    │       |
    │       v
    │   Raw data + computed fields
    |
    v
Server-rendered HTML + Client Component props
    |
    v
Browser [hydrates Client Islands only]
```

### Mutation Flow (Write)

```
User submits form / clicks action
    |
    v
Server Action invoked (lib/actions/*.ts)
    |
    ├─→ requireAuth() [verify session]
    ├─→ Zod validation [parse + validate input]
    ├─→ prisma.entity.create/update/delete
    │       |
    │       v
    │   PostgreSQL (Neon)
    |
    ├─→ revalidatePath() [bust cached pages]
    |
    v
Updated page re-rendered server-side
```

### File Upload Flow

```
User selects file (Client Component)
    |
    v
POST /api/upload [get presigned URL]
    |
    ├─→ requireAuth()
    ├─→ Generate unique key (nanoid)
    ├─→ R2 PutObjectCommand → presigned URL
    |
    v
Client uploads file directly to R2 via presigned URL
    |
    v
Client calls Server Action with file key
    |
    v
Server Action saves file key/URL to database
```

### Statistics Computation Flow

```
Stats page requested (Server Component)
    |
    v
lib/queries/stats.ts orchestrates multiple queries:
    |
    ├─→ TypedSQL: monthly-stitch-totals.sql (window functions)
    ├─→ TypedSQL: daily-averages.sql (CTEs)
    ├─→ TypedSQL: year-in-review.sql (complex aggregation)
    ├─→ Prisma API: project counts by status (groupBy)
    ├─→ Prisma API: supply statistics (aggregate)
    |
    v
Results assembled into StatsPageData type
    |
    v
Passed to Client Islands (charts, calendar, stat cards)
```

### Shopping List Data Flow

```
Shopping page requested
    |
    v
lib/queries/shopping.ts:
    |
    ├─→ TypedSQL or $queryRaw:
    │   SELECT ... FROM "ProjectThread" WHERE quantity_acquired < quantity_required
    │   UNION ALL
    │   SELECT ... FROM "ProjectBead" WHERE quantity_acquired < quantity_required
    │   UNION ALL
    │   SELECT ... FROM "ProjectSpecialty" WHERE quantity_acquired < quantity_required
    |
    v
Grouped by project, sorted by supply type
    |
    v
Rendered in Server Component with interactive filters (Client Island)
```

### Key Data Flows

1. **Project detail page:** Single Prisma query with deep includes (designer, genres, all 3 supply junction tables, fabric, sessions) -> compute kitting status, progress, size category -> render Server Component with Client Islands for edit form and supply management.
2. **Quick stitch log:** Client form component -> Server Action -> insert session -> revalidate stats page, project detail, sessions list (multiple paths).
3. **Dashboard widgets:** Multiple parallel queries from `lib/queries/dashboard.ts` -> assembled into widget data -> passed to dnd-kit widget grid (Client) which manages layout but receives data from server.
4. **Filter state:** URL search params are the source of truth for filters. Server Component reads `searchParams`, queries accordingly. Filter bar (Client) updates URL params via `useRouter().push()`.

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 1 user, 500 projects | Current architecture. No optimization needed. All queries are fast. |
| 1 user, 2000+ projects | Add database indexes on frequently filtered columns (status, designer, genre). Consider pagination for gallery views. |
| 10+ users | Add `userId` foreign key to all entities. Auth.js multi-user config. Row-level filtering in every query. Neon paid tier for connection limits. |
| 100+ users | Move stats queries to materialized views refreshed on write. Add Redis/Vercel KV for session caching. Consider read replicas on Neon. |

### Scaling Priorities

1. **First bottleneck:** Statistics queries on large session tables. Mitigate with proper indexes on `(date, project_id)` and, if needed, PostgreSQL materialized views refreshed after session inserts.
2. **Second bottleneck:** Gallery views loading all project data. Mitigate with cursor-based pagination and selective includes (don't load all supply relations for gallery cards).

## Anti-Patterns

### Anti-Pattern 1: Storing Computed Fields in the Database

**What people do:** Add `sizeCategory`, `progressPercent`, `kittingStatus` as columns in the Project table and update them whenever related data changes.
**Why it's wrong:** Creates data inconsistency when updates are missed. Adds maintenance burden for triggers or application-level sync. The project requirement explicitly forbids this.
**Do this instead:** Compute these fields at query time in `lib/queries/` using TypeScript helpers. For 500 projects, this is instantaneous.

### Anti-Pattern 2: Single Polymorphic Supply Junction Table

**What people do:** Create one `ProjectSupply` table with a `supplyType` discriminator pointing to Thread, Bead, or Specialty.
**Why it's wrong:** Prisma does not support polymorphic relations. You lose type safety, can't use proper foreign keys, and queries become complex. The project requirement explicitly mandates three separate tables.
**Do this instead:** Use `ProjectThread`, `ProjectBead`, `ProjectSpecialty` as three separate junction tables. Shopping list queries use `UNION ALL`.

### Anti-Pattern 3: Using Client Components for Data Fetching

**What people do:** Mark pages as `"use client"` and use `useEffect` + `fetch` to load data.
**Why it's wrong:** Adds unnecessary client-side JavaScript, causes loading spinners, creates waterfall requests, and misses Server Component benefits (direct database access, no API layer, no loading states).
**Do this instead:** Default to Server Components. Fetch data in `page.tsx` or `layout.tsx` using direct Prisma queries via `lib/queries/`. Only add `"use client"` to the specific interactive sub-component.

### Anti-Pattern 4: Passing Prisma Types Directly to Components

**What people do:** Import Prisma-generated types (`import { Project } from "@prisma/client"`) in component props.
**Why it's wrong:** Couples UI to database schema. Computed fields don't exist on Prisma types. Schema changes ripple through every component.
**Do this instead:** Define mapped types in `src/types/` that include computed fields and omit internal database details. Map from Prisma types to display types in `lib/queries/`.

### Anti-Pattern 5: Uploading Files Through Server Actions

**What people do:** Accept `File` objects in Server Actions and upload to R2 from the serverless function.
**Why it's wrong:** Vercel serverless functions have a ~4.5MB body size limit. Large PDFs and images will fail. The server becomes a bottleneck for file transfer.
**Do this instead:** Use the presigned URL pattern. Generate a presigned URL in an API route, upload directly from the client to R2, then save the file key via a Server Action.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Neon PostgreSQL | Prisma ORM with pooled connection (`-pooler` hostname) | Use `DATABASE_URL` (pooled) for app, `DIRECT_URL` for migrations. Neon auto-scales to zero. |
| Cloudflare R2 | `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner` | S3-compatible API. Use presigned URLs for uploads. Public bucket or presigned GETs for reads. Zero egress fees. |
| Vercel | Git push auto-deploy | Free hobby tier. Serverless functions for API routes. Edge middleware for auth redirects. |
| Auth.js | Credentials provider for single-user | Session stored in JWT (no database session table needed for single user). Upgrade to OAuth providers for multi-user later. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Server Components -> Queries | Direct function call | Same process, no serialization needed. Queries return typed objects. |
| Server Components -> Client Components | Props (serialized) | Data must be serializable (no functions, dates become strings). Use `superjson` if date handling becomes painful. |
| Client Components -> Server Actions | Form action / direct call | Server Actions are invoked like RPC calls. Return `{ error }` or `{ success }` objects. |
| Client Components -> API Routes | `fetch()` | Only for presigned URL generation. Everything else uses Server Actions. |
| Queries -> Prisma | Prisma Client API or TypedSQL | Simple reads use Prisma API. Complex aggregations use TypedSQL `.sql` files. |
| Queries -> Calculations | Direct function call | `lib/utils/calculations.ts` exports pure functions for size category, progress, kitting status. |

## Build Order (Dependencies)

Components have natural dependency chains. Build order should follow these:

```
Phase 1: Foundation
  auth.ts + db.ts + r2.ts (singletons)
    └─→ (dashboard)/layout.tsx (auth guard + app shell)
        └─→ Design system tokens (tokens.css + tailwind.config.ts)
            └─→ UI primitives (button, card, badge, input, etc.)

Phase 2: Core Data
  Prisma schema (Project, Designer, Genre, StitchSession)
    └─→ Server Actions (projects.ts, designers.ts)
        └─→ Queries (projects.ts with computed fields)
            └─→ Project pages (CRUD, gallery, detail)

Phase 3: File Upload
  R2 client + presigned URL API route
    └─→ Upload helper + upload components
        └─→ Cover photo + digital working copy on Project

Phase 4: Supplies
  Prisma schema (Thread, Bead, Specialty, junction tables)
    └─→ DMC seed data
        └─→ Supply actions + queries
            └─→ Supply linking UI + shopping list

Phase 5: Sessions & Stats
  Prisma schema (StitchSession)
    └─→ Quick log form + session actions
        └─→ TypedSQL statistics queries
            └─→ Stats page + charts (Recharts)

Phase 6: Advanced Views
  Filter bar component + URL-based filter state
    └─→ Gallery cards (3 variants) + view toggle
        └─→ TanStack Table integration
            └─→ Dashboard pages (Pattern Dive, Shopping Cart, etc.)

Phase 7: Dashboard Widgets
  dnd-kit widget grid
    └─→ Widget wrapper + individual widgets
        └─→ Widget layout persistence (localStorage or database)

Phase 8: Goals & Plans
  Prisma schema (Goal, RotationSchedule, Achievement)
    └─→ Goal tracking actions + queries
        └─→ Goals UI + achievement trophy case
```

**Key dependency insight:** The design system (tokens + UI primitives) must be built first because every feature page depends on it. File upload can come after basic project CRUD is working. Statistics depend on stitch sessions existing. Dashboard widgets depend on all the underlying data pages being built first.

## Sources

- [Next.js Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components) - Official docs on component model
- [Next.js Server Actions and Mutations](https://nextjs.org/docs/13/app/building-your-application/data-fetching/server-actions-and-mutations) - Official mutation patterns
- [Prisma TypedSQL](https://www.prisma.io/docs/orm/prisma-client/using-raw-sql/typedsql) - Type-safe raw SQL queries
- [Connect from Prisma to Neon](https://neon.com/docs/guides/prisma) - Neon connection pooling setup
- [Neon Connection Pooling](https://neon.com/docs/connect/connection-pooling) - PgBouncer transaction mode details
- [Cloudflare R2 Presigned URLs](https://developers.cloudflare.com/r2/api/s3/presigned-urls/) - Official R2 presigned URL docs
- [How to Upload Files to Cloudflare R2 in Next.js](https://www.buildwithmatija.com/blog/how-to-upload-files-to-cloudflare-r2-nextjs) - Implementation reference
- [Next.js App Router Best Practices for Production (2026)](https://ztabs.co/blog/nextjs-app-router-best-practices) - Current patterns

---
*Architecture research for: Cross-stitch project management application*
*Researched: 2026-03-28*

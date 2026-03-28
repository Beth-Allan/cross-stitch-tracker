# Phase 2: Core Project Management - Context

**Gathered:** 2026-03-28 (assumptions mode)
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can create and manage cross-stitch projects with full metadata (~50 fields), cover photos, digital file storage (PDFs/images via presigned R2 URLs), and status tracking through 7 stages. Auto-calculated size category from stitch count. This phase delivers the core entity that all subsequent phases build on — designers, genres, SAL parts, gallery views, and supply linking come in later phases.

</domain>

<decisions>
## Implementation Decisions

### Data Model
- **D-01:** Chart and Project modeled as two separate Prisma tables with a 1:1 relationship. Chart holds design metadata (name, designer, stitch count, dimensions, genres). Project holds workflow state (status, dates, progress, kitting state).
- **D-02:** Creating a Chart auto-creates a Project record — single-user UX simplification, but schema supports multi-user expansion later (multiple Projects per Chart).
- **D-03:** Designer and Genre tables created in this phase's migration to support inline creation from the chart form. Full CRUD management pages deferred to Phase 3.
- **D-04:** Size category (Mini/Small/Medium/Large/BAP) computed at query time from stitch count — never stored in database. Thresholds defined in a shared utility.

### File Uploads (R2)
- **D-05:** Presigned URL pattern for all file uploads. Client requests a signed upload URL from a Server Action, uploads directly to R2 from the browser, then confirms the upload to save the URL in the database.
- **D-06:** Vercel has a hard 4.5MB body limit across all plans — server-proxied uploads are not viable for PDFs up to 5MB. Presigned URLs are required, not optional.
- **D-07:** R2 configured with explicit CORS policy — no wildcard `*` in AllowedHeaders (R2 limitation). Must enumerate Content-Type and other headers explicitly.
- **D-08:** Presigned URLs use the S3 API domain (`<ACCOUNT_ID>.r2.cloudflarestorage.com`), not custom domains. Region set to `"auto"`.
- **D-09:** Cover photos processed server-side with sharp for thumbnails. Digital working copies stored as-is (no processing).
- **D-10:** File key structure: `covers/<projectId>/<filename>` for cover photos, `files/<projectId>/<filename>` for digital working copies.

### Form Architecture
- **D-11:** Add/edit chart form is a Client Component using React state for ~50 fields, submitting via Server Actions with Zod validation.
- **D-12:** Form organized in tabs/sections to manage complexity (matching design's tabbed interface pattern).
- **D-13:** Inline "add new" for Designer and Genre from within the chart form — modal or popover, not a separate page navigation.
- **D-14:** Zod schemas live in `src/lib/validations/` following the pattern established in Phase 1 (`auth.ts`).

### Status System
- **D-15:** Seven statuses: Unstarted, Kitting, Kitted, In Progress, On Hold, Finished, FFO. Stored as a Prisma enum.
- **D-16:** Status changes via a dedicated control on the project detail page — not buried in the edit form.
- **D-17:** Status colors use the CSS custom properties established in Phase 1 (--status-unstarted through --status-ffo).

### Claude's Discretion
- Exact Prisma schema field names and types for the ~50 metadata fields (guided by design types and plan data model)
- Form tab organization and field grouping
- Detail page layout and component decomposition
- Loading/error states for file uploads
- R2 bucket naming and environment variable naming
- Image thumbnail dimensions for cover photos
- Exact size category thresholds (stitch count breakpoints for Mini/Small/Medium/Large/BAP)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Data model
- `CROSS_STITCH_TRACKER_PLAN.md` section 5 — Full entity diagram, field definitions, relationship descriptions
- `prisma/schema.prisma` — Current schema (Phase 1 foundation — User, Account, Session tables)

### Design components (visual/behavioral reference — rewrite for Next.js)
- `~/projects/cross-stitch-tracker-design/product-plan/sections/project-management/` — All project management components, types, and sample data
- `~/projects/cross-stitch-tracker-design/product-plan/sections/project-management/types.ts` — Chart and Project type definitions with ~50 fields
- `~/projects/cross-stitch-tracker-design/product-plan/sections/project-management/components/ChartAddForm.tsx` — Add chart form with tabbed interface, inline entity creation
- `~/projects/cross-stitch-tracker-design/product-plan/sections/project-management/components/ChartDetailView.tsx` — Detail view layout with status, metadata, files
- `~/projects/cross-stitch-tracker-design/product-plan/sections/project-management/sample-data.json` — Sample data showing field values and relationships

### Design system (established in Phase 1)
- `~/projects/cross-stitch-tracker-design/product-plan/design-system/tokens.css` — Status colors, spacing, typography tokens
- `src/app/globals.css` — Applied design tokens and Tailwind v4 @theme configuration

### Infrastructure (from Phase 1)
- `src/lib/db.ts` — Prisma client singleton
- `src/lib/auth.ts` — Auth.js configuration (session verification pattern)
- `src/lib/validations/auth.ts` — Zod schema pattern to follow
- `.env.example` — Environment variable template (needs R2 credentials added)

### Project requirements
- `.planning/REQUIREMENTS.md` — PROJ-01 through PROJ-05 define this phase's acceptance criteria
- `CLAUDE.md` — Tech stack, architecture conventions, security rules, guardrails

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/ui/` — shadcn/ui components (Button, Card, Input, etc.) with design token overrides
- `src/lib/db.ts` — Prisma client singleton for all database access
- `src/lib/auth.ts` — Auth.js config with session verification helpers
- `src/lib/validations/auth.ts` — Zod schema pattern (loginSchema with email/password)
- `src/app/(dashboard)/layout.tsx` — Authenticated layout wrapper (auth check pattern)
- `src/components/features/shell/` — AppShell, Sidebar, TopBar components

### Established Patterns
- Server Components by default, Client Components only for interactivity (`"use client"`)
- Server Actions for mutations with Zod validation at boundaries
- Colocated tests: `component.test.tsx` next to `component.tsx`
- Import from `@/__tests__/test-utils` for testing (not directly from @testing-library/react)
- Prettier + Tailwind class sorting via lint-staged pre-commit hook
- kebab-case files, PascalCase components, camelCase functions

### Integration Points
- New Prisma models extend existing schema (User already exists from Auth.js)
- New pages mount under `src/app/(dashboard)/` route group (auth-protected)
- Sidebar nav items for "Charts" already exist as placeholders — will become active
- R2 integration is net-new: needs environment variables, S3 client setup, CORS configuration

</code_context>

<specifics>
## Specific Ideas

- Design components use Lucide icons with `strokeWidth={1.5}` consistently — maintain this in all new components
- The chart form design has inline "Add new designer/genre/series" callbacks — implement as modals or popovers within the form
- Status badge colors must match the 7 status CSS custom properties from Phase 1 (stone, amber, emerald, sky, orange, violet, rose)
- Cover photo should display as a prominent header image on the detail page, not a small thumbnail
- JetBrains Mono for stitch count hero numbers only (per Phase 1 font rules)

</specifics>

<deferred>
## Deferred Ideas

- Full designer CRUD with stats and detail views — Phase 3
- Full genre management pages — Phase 3
- SAL support (multi-part charts) — Phase 3
- Gallery/list/table view switching with sorting — Phase 3
- Series/collection management — Phase 4
- Supply linking and kitting status — Phase 5

</deferred>

---

*Phase: 02-core-project-management*
*Context gathered: 2026-03-28*

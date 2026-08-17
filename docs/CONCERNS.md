# Concerns

**This is not a defect list.** It describes **durable properties of the system** — the shape of
the auth model, what the schema does and does not scope, the posture of the CSP, the way the
stats page loads — that a session must know before it changes anything near them. Every item here
is a standing constraint, not a bug waiting to be fixed.

**Warts go to `docs/process/maintenance-ledger.md`, not here.** Noticing a defect creates the
obligation to log it there, in the same session (hard rule 7). The ledger's whole discipline is
_read it whole, every session_ — which only works because it stays small. A second wart list
beside it, un-triaged and never read whole, would quietly break that. If something in this file
starts reading like a to-do, it has drifted into the ledger's territory and belongs there instead.

Feature wishes go to `docs/process/work-log/backlog.md`; contradictions go to
`docs/process/work-log/drift.md`.

---

## The single-user model

Auth is one set of credentials from environment variables — `AUTH_USER_EMAIL` and
`AUTH_USER_PASSWORD_HASH`, compared with bcrypt, JWT session strategy, no user table. There is
one Beth and the schema is built around that.

**Ownership is enforced by convention, not by the framework.** Every server action's first line is
`requireAuth()`; nothing forces it to be there. ESLint blocks importing `@/lib/auth` inside action
files so the shared guard is the only route, but a new action that simply omits the call will lint,
typecheck, test, and ship. Reviewing an action means checking the first line, every time.

### What the schema scopes, and what it does not

Of eighteen models, **three carry a `userId`**: `Project`, `StorageLocation`, `StitchingApp`.
Ownership everywhere else is **transitive through `Project`** — sessions via `projectId`, chart
files via `chart.project`, supplies via the three junction tables — and the action layer does walk
those relations (`chart-actions.ts` selects `{ project: { select: { userId: true } } }` before a
destructive chart mutation; `chart-file-actions.ts` checks `file.chart.project?.userId`).

**Two relations are optional, and that is where the scoping actually stops.** `Chart.project` is
`Project?` and `Fabric.linkedProjectId` is nullable, so an unattached chart or an unlinked fabric
has **no ownership path at all** — which is why `fabric-actions.ts` queries
`OR: [{ linkedProjectId: null }, { linkedProject: { userId } }]`, deliberately returning the
ownerless arm. **`Designer`, `Series`, `Genre` and the supply and fabric catalogues
(`SupplyBrand`, `Thread`, `Bead`, `SpecialtyItem`, `FabricBrand`) carry no owner by design**, and
`ChartFile` is owned only through the chain above.

This is coherent for one user and is not an oversight to correct on sight — but it means a
chart-shaped or fabric-shaped query that does not traverse a project is unscoped by construction.
Treat "add a `userId` filter" as a schema change with a migration, not a one-line fix.

Multi-tenancy would not be an incremental change. It would touch the schema, every query, and
every ownership assertion in the action layer.

## Rate limiting is per-instance and in-memory

`src/lib/rate-limit.ts` is a module-level `Map` — five attempts, 30-second cooldown. It resets on
every cold start and redeploy, and two concurrent Vercel function instances keep two independent
counters. It raises the cost of a login-guessing loop; it does not bound one. Persisting it means
Redis or equivalent, and that is a real decision, not a tidy-up.

## Content-Security-Policy — permissive, knowingly

`next.config.ts` sets `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`,
`Referrer-Policy: strict-origin-when-cross-origin`, and a CSP. **The CSP is not a hardened one and
should not be cited as if it were.** It ships:

- `script-src 'self' 'unsafe-inline' 'unsafe-eval'` — `unsafe-eval` is there for Next.js dev-mode
  hot reload and is **not currently stripped in production**
- `style-src 'self' 'unsafe-inline'`
- `img-src` and `connect-src` allowing `https://*.r2.cloudflarestorage.com`, plus `data:` and
  `blob:` for images

The file carries its own TODO to move to nonces and drop `unsafe-eval` in production. Until that
lands, the CSP restricts origins but does not meaningfully constrain injected script. Anyone
adding a header or relaxing a directive should know they are editing a policy that is already at
its loosest defensible setting. **Whether it stays this way is a live question, not a settled
property** — `maintenance-ledger.md` carries it as an open row for the A-1 audit's
security-checklist sweep.

## No pagination anywhere in the browse path

`getChartsForGallery` and its siblings are `findMany` calls with no `take` or `skip`, and
`/charts` (Pattern Dive) eagerly loads **five tab datasets in one `Promise.all`** — gallery,
what's-next, series, fabric requirements, storage groups — then resolves presigned R2 URLs for
every image key across all five. The eager batch is deliberate: it avoids a Neon cold-start
waterfall between tabs.

**The absence of pagination is not.** It is an omission rather than a decision — recorded as such
in `maintenance-ledger.md`, which is where the question of doing something about it lives; this
section exists so that the shape is known before anything else is built onto this path. The
collection only grows, and the page cost grows linearly with it —
including the presigned-URL round trip, which scales with image count rather than visible rows.
Adding pagination later means changing the query, the eager-batch strategy, and the URL-state
filters together, so it is worth knowing the constraint exists before building anything else onto
this path.

## The stats page fans out wide

`src/app/(dashboard)/stats/page.tsx` issues **sixteen queries in a single `Promise.allSettled`**,
plus a separate project-list query. `allSettled` is the point: one failure degrades one panel
instead of taking the page down, and a `settled()` helper turns each rejection into a logged,
absent section.

What it does not do is bound concurrency. Each of those queries sits behind `unstable_cache`, so a
warm cache costs almost nothing — but a cold cache, a redeploy, or a `revalidateTag("stats", { expire: 0 })` from
any mutation puts sixteen concurrent queries onto **one Neon connection pool**. Under exhaustion
the failure mode is not an error page; it is several panels quietly missing. Adding a seventeenth
query to that array is a bigger decision than it looks. Whether the current width is already too
wide is an open `maintenance-ledger.md` row for A-1 to measure; the shape is here because it
constrains anything built on this page either way.

## The stack is bleeding-edge on purpose

Next.js 16, Auth.js v5 **beta**, Prisma 7, Tailwind 4, Base UI — the versions and their specific
footguns are in `.claude/rules/bleeding-edge-libs.md`, which loads every session and is not
restated here. The standing consequence: **training data is wrong for these APIs**, so an
unfamiliar one is checked against Context7 or `node_modules/` before use, never guessed (hard
rule 8).

Every dependency is pinned exact, no `^` or `~`. That buys reproducibility and costs patch intake
— nothing arrives unless a session goes and gets it. The cadence that answers this is a
maintenance-ledger row, not a task in this file.

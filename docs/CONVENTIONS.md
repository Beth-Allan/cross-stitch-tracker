# Conventions

**The authority is `.claude/rules/`.** Twelve rule files load into every session — four
unconditionally (git workflow, quality gates, testing, comments) and eight scoped by their
`globs:` to the paths they describe. They are already in front of you, so **this file does not
restate them.** What follows is the tooling they assume, the conventions no rule file carries, and
pointers to the ones that do.

## Tooling

### Formatter — Prettier 3.8.3

`prettier.config.mjs`: double quotes, semicolons, 100-char width, trailing commas everywhere,
`prettier-plugin-tailwindcss` sorting class lists. **Prettier owns formatting** — `format:check` is
a gate step and `docs/` is inside its scope, so a hand-wrapped table here fails CI the same as
misformatted TypeScript. `docs/archive/` is excluded: archived history is preserved verbatim,
never reformatted.

### Linter — ESLint 9 flat config

`eslint.config.mjs` extends `eslint-config-next/core-web-vitals` and `.../typescript`. Five
project-specific decisions:

- **`no-restricted-syntax`** — `<Button render={<Link>}>` is an error. Use `<LinkButton>`.
- **`no-restricted-imports`** — importing `@/lib/auth` inside `src/lib/actions/**` is an error. Use
  `@/lib/auth-guard`.
- **`react-hooks/set-state-in-effect` is off** — dialog form reset via `useEffect` is a deliberate
  pattern here, not an oversight.
- **`no-unused-vars` honours an `_` prefix** (and rest-sibling omissions) — `_userId` and
  `{ photoKey: _, ...rest }` say "deliberately unused" on purpose; the second has no other spelling.
- **`@next/next/no-img-element` is off** — every image is a presigned R2 URL that expires in an
  hour, so `next/image`'s optimizer cannot cache or transform it (the three components that do use
  `next/image` all pass `unoptimized`). Images are shrunk at upload, not at render.

`globalIgnores` keeps `.next/`, `out/`, `build/`, `product-plan/`, `scripts/` and the tooling
directories out of scope. **Warnings fail the gate:** `npm run lint` is `eslint --max-warnings 0`
since P14 (2026-08-20), so there is no passing tier below "error" — the count was burned to zero
first, and the flip is what keeps it there.

### TypeScript

`strict: true`; path alias `@/*` → `./src/*`; `types: ["vitest/globals"]` so `describe`/`it`/
`expect` need no import. `product-plan/` is excluded from the program.

### EditorConfig

2-space indent, LF, UTF-8, trim trailing whitespace, final newline.

## Gates and hooks

`npm run gate` is exactly what CI runs:

```
prisma generate → format:check → lint → tsc --noEmit → test → build
```

**`prisma generate` runs first, always** — without it `tsc` validates against a stale client after
any schema change. Git hooks are live: **pre-commit** runs `lint-staged` (`prettier --write` on
`*.{ts,tsx,js,mjs,json,css,md}`, then `eslint --fix` on `*.{ts,tsx}`); **pre-push** runs the full
`npm run gate`. Mechanical detail, and what the gate does _not_ catch, are in
`.claude/rules/quality-gates.md`.

## Conventions the rules already own

Do not duplicate these here or in code review notes — cite the file.

| Convention                                                               | Rule file                              |
| ------------------------------------------------------------------------ | -------------------------------------- |
| Server vs Client Components; when `"use client"` is genuine              | `.claude/rules/server-client-split.md` |
| `LinkButton` over `Button render={<Link>}`; `buttonVariants` import path | `.claude/rules/base-ui-patterns.md`    |
| Semantic design tokens; no nested forms                                  | `.claude/rules/base-ui-patterns.md`    |
| `requireAuth()` in every action; no fallback user ids                    | `.claude/rules/auth-patterns.md`       |
| Zod `.trim()` before `.min(1)`; date-string validation; `response.ok`    | `.claude/rules/form-patterns.md`       |
| Exact version pinning (no `^`/`~`)                                       | `.claude/rules/form-patterns.md`       |
| Comment conventions — including the two documented exceptions            | `.claude/rules/comment-conventions.md` |
| Never assume a bleeding-edge API; check Context7 or `node_modules/`      | `.claude/rules/bleeding-edge-libs.md`  |
| Which UI reference wins, and that building from imagination is banned    | `.claude/rules/ui-design-reference.md` |

The comment-conventions file in particular carries two exceptions (type-bundle section markers,
`loading.tsx` skeleton labels) that any summary loses. Read it, do not summarise it.

## Server actions

### Return shape

A discriminated union — **actions never throw to the client**:

```ts
{ success: true, data: T } | { success: false, error: string }
```

`as const` on the `success` literal, so the union narrows at the call site.

### Error tiers, in order

1. **`ZodError`** → surface `error.errors[0].message` to the user.
2. **Prisma `P2002`** → a written unique-constraint message ("A designer with that name already
   exists"). Actions with several constrained fields extract an `isP2002(error)` helper rather
   than repeating the `code in error` narrowing.
3. **Catch-all** → generic client message plus `console.error("<action> error:", error)`. The
   client never sees a raw error object or a stack.

### Mutation flow

`requireAuth()` → `schema.parse()` → ownership check → Prisma write (often `$transaction`) →
`revalidatePath()` / `revalidateTag()` → return the result union.

### Failure never renders as emptiness

A page that guards a read collapses the failure to **`null`, never `[]` or `0`** — those are
Beth's real answers ("nothing kitted yet", "no sessions logged") and a failed query must not
borrow them. `Promise.allSettled` + `settled()` produces the `null`; the component renders
`DataUnavailable` (`src/components/ui/data-unavailable.tsx`) or its own "couldn't load" line for
that panel, so one dead query costs one panel rather than lying across a screen. Guarding a read
without this is worse than not guarding it, because the error boundary at least tells the truth.

Optimistic writes obey the same rule from the other side: an optimistic value **rolls back when
the save reports failure**, so the screen never keeps a number the server refused (see
`EditableNumber` in `src/components/features/supply-table/`).

## The stats cache layer

A convention with real teeth, because getting it wrong ships stale numbers silently.

Every cached stats query in `src/lib/queries/stats/` splits in two: a private `computeX(userId)`
holding the Prisma work, and an exported `getX(userId)` that wraps it in `unstable_cache` with a
per-user key, `tags: ["stats"]`, and a `revalidate` window. **The window is a named constant, never
a number:** `STATS_CACHE_VOLATILE` (300s) or `STATS_CACHE_STABLE` (3600s) from `stats/utils.ts`,
whose JSDoc carries the rule for which a new query picks — stable for the four collection-shape
breakdowns and for any period already closed, volatile for everything else and whenever it is a
close call. `computeX` logs failures as `console.error("[stats] computeX failed:", …)` and
rethrows; the page layer degrades rather than crashing (`Promise.allSettled` + a `settled()`
helper).

**Any mutation that can move a statistic must call `revalidateTag("stats", { expire: 0 })`** —
all chart and project writes, session logging, designers, genres, and the whole supply surface.
A write that skips it leaves the stats page reporting yesterday. The TTL above is only the
backstop; invalidation is what makes a number current.

**And every one of those mutations carries a test asserting its own call** (Beth's ruling,
2026-08-17, `docs/process/work-log/drift.md`). That per-mutation assertion — not a path gate — is
what protects this layer on the writer side, because the failure mode is a mutation that never had
the line, in a file no gate lists. The mechanics are in `.claude/rules/testing-requirements.md`.
The reader side is review-gated (below); its history is why.

## Series

Series is a first-class entity, not a chart attribute. `Series` has a unique `name`, a nullable
`totalCount`, and an optional `Designer`; charts join via `Chart.seriesId`. **Progress is computed
at query time** — `computeSeriesProgress` in `src/lib/utils/series-progress.ts`, with
`FINISHED_STATUSES` as the single definition of "done" (`FINISHED` and `FFO`) — and never stored,
per the calculated-fields-at-query-time rule. Validation is `seriesSchema`
(`src/lib/validations/series.ts`); actions are `src/lib/actions/series-actions.ts`; the UI is
`src/components/features/series/` plus `/series` and `/series/[id]`, and it surfaces as a tab on
Pattern Dive (`/charts`).

## Review-gated paths

Some paths change the merge path, not just the diff. Anything matching
`.claude/hooks/review-gated-paths.txt` — `prisma/schema.prisma` and `prisma/migrations/`,
`src/lib/auth.ts` / `auth-guard.ts` / `rate-limit.ts`, the skein and fabric calculators,
`src/lib/queries/stats/`, and the R2 upload actions — merges **only from a fresh `/review`
session, never by its builder** (hard rule 3). No hook enforces this; it is convention, which is
exactly why it is a hard rule. Check the list before you branch, not after you push.

## State management

Three tiers, no global store:

1. **URL state (nuqs)** — anything shareable or bookmarkable: gallery filters, sort, view mode,
   tab selection, stats scope.
2. **React local state** — ephemeral: modal open, form fields, optimistic edits.
3. **Server data** — props from Server Components, refreshed by `revalidatePath` /
   `revalidateTag`.

## Imports and exports

- The `@/` alias is the intended form for internal paths and is what new code should use — but
  it is a preference, not a rule: ~230 relative imports survive across ~94 files, including
  cross-directory ones, and nothing enforces either form. `import type` for type-only imports.
  **There is no enforced import order** — do not invent one in review.
- Tests import from `@/__tests__/test-utils`, never `@testing-library/react`
  (`.claude/rules/testing-requirements.md`).
- **Named exports** for server actions, queries, types, and components. **Default exports only
  where Next.js requires them** — pages, layouts, `loading.tsx`, `error.tsx`. There are no default
  exports under `src/components/`.

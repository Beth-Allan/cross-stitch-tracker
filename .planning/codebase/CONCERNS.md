# Concerns

> Technical debt, known bugs, security considerations, performance issues, and fragile areas.
> Generated: 2026-05-20

## Critical Issues

### `sharp` in `devDependencies` (Production Deploy Risk)

`upload-actions.ts` imports `sharp` for server-side image processing, but `sharp` is listed in `devDependencies` at `package.json:67`. On Vercel this works because Next.js bundles it during build, but any deployment that prunes `devDependencies` before running will fail. Should be in `dependencies`.

### Pre-existing TypeScript Errors in Test Files (999.19)

18 TypeScript errors across 3 test files:
- `src/components/features/dashboard/dashboard-tabs.test.tsx` — wrapper prop type mismatch
- `src/lib/actions/chart-actions.test.ts` — `createMany` mock type
- `src/lib/actions/shopping-cart-actions.test.ts` — error narrowing

Marked HIGH PRIORITY in backlog.

## Data Correctness Bugs

| Issue | Location | Backlog |
|-------|----------|---------|
| Fabric matching excludes valid candidates when `fabricCount` is null | `pattern-dive-actions.ts:156` | 999.21 |
| No guard on stitch count > total (over-100% allowed by design D-04) | `session-actions.ts` | 999.31 |
| `overCount` never auto-inferred from fabric count | Skein calculator flow | 999.14 |
| Skein calculator hardcodes DMC skein length (255 usable inches) | `skein-calculator.ts:20` | 999.13 |

## Storage Leaks (R2)

| Issue | Location | Backlog |
|-------|----------|---------|
| Old session photo not deleted when user replaces photo | `session-actions.ts:193` | 999.52 |
| Silent catch on raw file delete in upload-actions | `upload-actions.ts:155` | 999.50 |

## Silent Error Handling

These patterns swallow errors with no logging or user feedback:

| Pattern | Location | Backlog |
|---------|----------|---------|
| `.catch(() => {})` on `deleteFile` | `upload-actions.ts:155` | 999.50 |
| `.catch(() => null)` on completion estimate | `charts/[id]/page.tsx:50` | 999.51 |
| Bare `catch {}` blocks (3 locations) | `log-session-modal.tsx:166,229,249` | 999.53 |
| `processAndStoreImage` returns `{ success: false }` silently | `upload-actions.ts` | 999.55 |

## Security Considerations

### Auth Enforcement

All server actions call `requireAuth()` as their first line. This is convention-enforced — no framework mechanism forces it. ESLint blocks importing `@/lib/auth` directly in action files (must use `@/lib/auth-guard`).

### Ownership Gaps

- `StorageLocation` and `StitchingApp` lack `@@unique([userId, name])` DB constraints — uniqueness only enforced in application code (999.0.17)
- `getBuriedTreasures` in `dashboard-actions.ts:128` includes charts without user scoping (single-user app mitigates this)

### Rate Limiting

In-memory `Map` in `rate-limit.ts` — resets on cold start/redeploy. Adequate for single-user app but won't persist across Vercel function invocations.

### Security Headers

Global security headers in `next.config.ts`:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- CSP whitelisting R2 storage origins for `img-src` and `connect-src`

## Performance

### Stats Page Query Load

17 parallel queries in single `Promise.allSettled()` on stats page load. Phase 22 moved from `Promise.all()` to `allSettled()` for graceful degradation, but one Neon connection pool exhaustion could still cause partial failures across queries. (999.22)

### Missing Memoization

`SupplyOverview` runs aggregation + filtering without `useMemo` — recomputes on every re-render from `pendingIds`/`failedIds` changes. (999.58)

### Bundle Size

- `import * as RechartsPrimitive` in `components/ui/chart.tsx:4` — wildcard import defeats tree-shaking

## Technical Debt

### Hardcoded Color Classes

Raw Tailwind scales (`bg-amber-400 dark:bg-amber-500`, `bg-rose-500`, `stone-*`, `emerald-*`) used instead of semantic tokens in multiple files. Phase 26 fixed most `stone-*`/`emerald-*` instances but the 7-state status palette remains scattered across:
- `gallery-card.tsx`, `bucket-project-row.tsx`, `whats-next-tab.tsx`, `status-badge.tsx`
- `log-session-modal.tsx` (6+ hardcoded emerald locations)
- Backlog item 999.66 proposes centralized CSS custom properties

### Comment Convention Violations

- ~20 low-harm JSX section markers remaining (999.30)
- WHAT-comments in Phase 20/21 code (999.29)

### Presentational Leak

`CompletionEstimate.estimatedDate` is a pre-formatted string ("May 2027"). The `~` prefix is added by two separate components rather than the data layer. (999.35)

### Type System Gaps

- `strandCount` is `Int` in Prisma but `1|2|3|4|5|6` in `CalcParams` — bridged with `as` cast (999.0.23)
- `createMockStitchSession` uses inline type instead of `Partial<StitchSession>` (999.48)
- Duplicated `onUpdateAcquired` callback type across 4 component prop interfaces (999.61)

## Test Coverage Gaps

| Gap | Backlog |
|-----|---------|
| Shopping cart: aggregated quantity distribution untested | 999.62 |
| Shopping cart: project expand/collapse untested | 999.63 |
| Shopping cart: `updateSupplyAcquired` integration path untested | 999.64 |
| Shopping cart: QuantityControl inline edit on blur untested | 999.65 |
| Supply cache invalidation: only 4 of 22 mutations have test assertions | Phase 23 review |
| Stats action auth/validation test coverage | 999.24 |

## Dependencies at Risk

| Dependency | Risk | Notes |
|------------|------|-------|
| Auth.js v5 beta | API instability | `next-auth@5.0.0-beta.30` — beta APIs may change |
| Base UI 1.x | Young API surface | `@base-ui/react@1.4.1` — API may still shift |
| Next.js 16 | Cutting-edge | `next@16.2.4` — App Router behaviors may evolve |
| Prisma 7 | New major version | `@prisma/client@7.7.0` — new import paths, adapter pattern |

All dependencies pinned to exact versions (no `^`/`~`) per convention, reducing surprise breakage.

## Scaling Considerations

- **Single-user model**: Auth is single-user credentials from env vars. Multi-tenant would require significant rework of ownership validation and data isolation.
- **Gallery without pagination**: All charts loaded at once. User has 75+ projects in kitting — performance is fine now but could degrade at scale.
- **No database-level uniqueness** for `StorageLocation`/`StitchingApp` names per user (999.0.17)

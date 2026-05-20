# Testing

> Test framework, structure, mocking patterns, and coverage.
> Generated: 2026-05-20

## Framework

**Vitest 3.1.1** with `@vitejs/plugin-react`

Config at `vitest.config.ts`:
- Environment: `jsdom`
- Globals: `true` (describe/it/expect available without imports)
- Setup file: `./src/__tests__/setup.ts`
- Include pattern: `src/**/*.test.ts`, `src/**/*.test.tsx`
- Path alias: `@` → `./src`

Supporting libraries:
- `@testing-library/react` 16
- `@testing-library/user-event` 14
- `@testing-library/jest-dom` 6 (matchers imported in setup)

## Test Count

- **~193 test files** (`.test.ts` + `.test.tsx`)
- **~2,173 individual test cases**
- **No E2E tests** (no Playwright/Cypress)

### By Area

| Area | Files | Notes |
|------|-------|-------|
| `src/lib/actions/` | ~22 | Often split per domain (e.g., chart-actions has 5 test files) |
| `src/lib/queries/stats/` | ~22 | One per query function |
| `src/components/features/` | ~130 | Components + hooks |
| `src/lib/validations/` | 6 | Zod schema tests |
| `src/lib/utils/` | 8 | Utility function tests |
| `src/__tests__/` | 2 | Infrastructure self-tests |
| `src/types/` | 1 | `stats.test.ts` — type assertion tests |
| `src/components/ui/` | 2 | UI primitive tests |

## Test File Structure

### Colocated Tests

Tests live next to their source files:
```
src/lib/actions/designer-actions.ts
src/lib/actions/designer-actions.test.ts

src/components/features/gallery/gallery-card.tsx
src/components/features/gallery/gallery-card.test.tsx
```

### Nyquist Tests

Supplemental gap tests with `.nyquist.test.tsx` suffix — behavioral coverage gaps filled after initial implementation:
- `src/components/features/supply-table/supply-table-add-row.nyquist.test.tsx`
- `src/components/features/charts/project-detail/supplies-tab.nyquist.test.tsx`

### Split Action Tests

Large action files split across multiple test files:
- `chart-actions.test.ts`, `chart-actions-auth.test.ts`, `chart-actions-gallery.test.ts`, `chart-actions-errors.test.ts`

## Shared Test Infrastructure

### `src/__tests__/setup.ts`

Global setup: imports jest-dom matchers, polyfills `ResizeObserver` and `scrollIntoView` for jsdom.

### `src/__tests__/test-utils.tsx`

Custom `render` wrapper re-exporting everything from `@testing-library/react`. Overrides `render` with `AllProviders` HOC (currently passthrough, ready for future context providers).

**Rule: always import from `@/__tests__/test-utils`, never directly from `@testing-library/react`.**

### `src/__tests__/mocks/factories.ts`

The main mock factory file. Provides:

- **Domain object factories**: `createMockDesigner`, `createMockChart`, `createMockProject`, `createMockProjectWithRelations`, `createMockChartWithRelations`, all supply factories (thread, bead, specialty), fabric factories, storage/app factories, `createMockGalleryCard`, `createMockStitchSession`
- **`createMockPrisma()`**: Full mock Prisma client with `vi.fn()` for every method; default `$transaction` implementation supporting callback and array forms
- **`mockTransaction(mockPrisma, overrides)`**: One-shot `$transaction` override helper
- **`createMockRouter()`**: Mock Next.js router
- **`assertSuccess(result)` / `assertFailure(result)`**: Type-narrowing assertion helpers that throw if on wrong branch — prevents vacuous assertions

### `src/__tests__/mocks/module-mocks.ts`

Documents standard `vi.mock()` patterns as `MOCK_PATTERNS` const (reference, not runtime).

### `src/__tests__/mocks/index.ts`

Re-exports everything from `factories` and `module-mocks`.

## Mocking Patterns

`vi.mock()` calls are hoisted by Vitest and must stay in each test file. Factories provide mock objects; `vi.mock()` wiring is per-file.

### Standard Server Action Test Setup

```ts
import { createMockPrisma, createMockDesigner, assertSuccess, assertFailure } from "@/__tests__/mocks";

const mockAuth = vi.fn();
vi.mock("@/lib/auth", () => ({ auth: mockAuth }));

const mockPrisma = createMockPrisma();
vi.mock("@/lib/db", () => ({ prisma: mockPrisma }));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn() }));
```

Auth mock targets `@/lib/auth` (not `@/lib/auth-guard`) because `requireAuth` imports `auth` from there. Default `beforeEach` sets up authenticated user; individual tests use `mockAuth.mockResolvedValueOnce(null)` for unauthenticated paths.

### Component Test Mocking

```ts
// Mock server actions
vi.mock("@/lib/actions/designer-actions", () => ({ createDesigner: vi.fn() }));

// Mock Next.js navigation
const mockRouter = createMockRouter();
vi.mock("next/navigation", () => ({ useRouter: () => mockRouter }));

// Mock Next.js Link
vi.mock("next/link", () => ({
  default: ({ href, children, className, ...rest }) => <a href={href} {...rest}>{children}</a>
}));
```

## Test Categories

| Category | Description | Example |
|----------|-------------|---------|
| **Unit** | Pure functions, validators, query helpers | `skein-calculator.test.ts`, `chart.test.ts` |
| **Hook** | Hooks tested with `renderHook` | `use-gallery-filters.test.ts` |
| **Component** | Components with mocked dependencies | `gallery-card.test.tsx`, `designer-list.test.tsx` |
| **Server Action** | Actions tested directly (mock Prisma + auth) | `designer-actions.test.ts` |
| **Integration-style** | Components with real child rendering, mocked server | `project-detail-page.test.tsx` |
| **E2E** | None — no Playwright/Cypress | — |

## Coverage Configuration

Coverage configured but **no thresholds enforced**:

```ts
// vitest.config.ts
coverage: {
  provider: "v8",
  reporter: ["text", "lcov"],
  include: ["src/**/*.{ts,tsx}"],
  exclude: ["src/__tests__/**", "src/generated/**", "src/**/*.test.{ts,tsx}", "src/app/manifest.ts"],
}
```

Run: `npm run test:coverage`

## TDD Enforcement

TDD is mandatory per `.claude/rules/testing-requirements.md`:
- Plans structured as test-then-implement pairs
- Write tests defining expected behavior before implementation
- Test failure modes, not just happy paths

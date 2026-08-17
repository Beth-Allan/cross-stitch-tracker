# Testing

**Policy lives elsewhere.** `.claude/rules/testing-requirements.md` carries hard rule 2 and its
teeth — the failing test comes first, always; never weaken, skip, or delete a test to get green;
test removals need Beth's approval on the record; import from `@/__tests__/test-utils`, never
`@testing-library/react`. It loads into every session. **This file is the mechanical map** — what
exists, where, and how to write a test that matches the ones already here.

## Framework

**Vitest 3.2.7** with `@vitejs/plugin-react`. `vitest.config.ts`:

- Environment `jsdom`; `globals: true` (so `describe`/`it`/`expect` need no import)
- Setup file `./src/__tests__/setup.ts`
- Include `src/**/*.test.ts`, `src/**/*.test.tsx`; alias `@` → `./src`
- `passWithNoTests: true` — worth knowing, because it means an empty run is a green run

Supporting libraries: `@testing-library/react` 16, `@testing-library/user-event` 14,
`@testing-library/jest-dom` 6 (matchers wired in setup).

## Commands

| Command                 | What it runs                               |
| ----------------------- | ------------------------------------------ |
| `npm test`              | `vitest run --reporter=verbose` — one pass |
| `npm run test:watch`    | the same, watching                         |
| `npm run test:coverage` | `vitest run --coverage`                    |

Tests are **step five of `npm run gate`**, which the pre-push hook runs in full. The suite itself
takes ~16s — the reason a full gate on every push is tolerable at all, and the reason there is no
excuse for pushing red.

## What exists

**212 test files · 2560 tests · no E2E** (no Playwright, no Cypress). The numbers go stale; the
suite footer does not. Run `npm test` and read the last line rather than trusting this paragraph.

| Area                       | Files   |
| -------------------------- | ------- |
| `src/components/features/` | 133     |
| `src/lib/actions/`         | 23      |
| `src/lib/queries/stats/`   | 21      |
| `src/lib/utils/`           | 12      |
| `src/lib/validations/`     | 5       |
| `src/types/`               | 3       |
| `src/lib/` (root)          | 5       |
| `src/components/ui/`       | 2       |
| `src/__tests__/`           | 3       |
| `src/components/shell/`    | 1       |
| `src/components/hooks/`    | 1       |
| `src/components/` (root)   | 1       |
| `src/app/`                 | 2       |
| **Total**                  | **212** |

Inside `src/components/features/`, the weight sits in `stats/` (24), `supply-table/` (15),
`charts/` (15), `charts/project-detail/` (13), `gallery/` (12), `dashboard/` (11),
`charts/form-primitives/` (9) and `shopping/` (7). The stats feature directory is the single
largest test surface in the repo — larger than every server action put together.

`src/lib/queries/` contains only `stats/`; there is no general query layer.

## File structure

### Colocated

`foo.test.tsx` sits beside `foo.tsx`. No `__tests__` mirror trees.

### Split families

Large action modules split their tests by concern rather than growing one file:

- `chart-actions.test.ts` · `-errors` · `-gallery` · `-settings` · `-thumbnail`
- `chart-file-actions.test.ts` · `-auth` · `-r2-failure`

Follow the pattern when a test file outgrows readability: split by concern, keep the base name.

### `.nyquist.test.tsx` — legacy naming, do not extend

Two files carry a `.nyquist.` infix
(`src/components/features/supply-table/supply-table-add-row.nyquist.test.tsx`,
`src/components/features/charts/project-detail/supplies-tab.nyquist.test.tsx`). The name comes
from a development process this repo no longer runs; it marked supplemental gap tests written
after an implementation landed. The tests are real and stay. **New gap tests go in the ordinary
`.test.tsx` file** — nothing should acquire this suffix again.

## Shared infrastructure — `src/__tests__/`

```
setup.ts              global setup
test-utils.tsx        customRender + RTL re-export
mocks/factories.ts    every mock object creator
mocks/module-mocks.ts MOCK_PATTERNS — documentation, not runtime
mocks/index.ts        re-exports both
mocks/factories.test.ts    self-test of the factories
fixtures/dmc-threads.test.ts   validates prisma/fixtures/dmc-threads.json
```

**`setup.ts`** imports the jest-dom matchers and polyfills `ResizeObserver` and
`Element.prototype.scrollIntoView`, both required by cmdk and Popover under jsdom.

**`test-utils.tsx`** wraps RTL's `render` in an `AllProviders` HOC — currently a passthrough, and
the place to add theme/auth context when a test needs one. It re-exports everything from
`@testing-library/react` and overrides `render`. Import from here, always.

**`fixtures/`** is not infrastructure — it holds tests that assert on shipped _data_. Today that
is the DMC thread catalogue (`prisma/fixtures/dmc-threads.json`): entry shape, and that known
colour codes are present. Data files that seed the database belong under test here, not in a
feature directory.

### Factories

`mocks/factories.ts` is the only place mock objects are built. Prefer a factory over a hand-built
object; every one takes `Partial<T>` overrides and returns a fully typed `T`.

- **Entities** — `createMockDesigner`, `createMockSeries`, `createMockGenre`, `createMockChart`,
  `createMockProject`, `createMockStitchSession`
- **With-stats and chart-list views** — `createMockDesignerWithStats`, `createMockSeriesWithStats`,
  `createMockGenreWithStats`, `createMockStorageLocationWithStats`,
  `createMockStitchingAppWithStats`, `createMockDesignerChart`, `createMockSeriesChart`,
  `createMockGenreChart`, `createMockGalleryCard`
- **Relation-loaded** — `createMockProjectWithRelations`, `createMockChartWithRelations`
- **Supplies and fabric** — `createMockSupplyBrand`, `createMockThread`, `createMockBead`,
  `createMockSpecialtyItem`, `createMockProjectThread`, `createMockProjectBead`,
  `createMockProjectSpecialty`, `createMockFabricBrand`, `createMockFabric`
- **Storage and apps** — `createMockStorageLocation`, `createMockStitchingApp`
- **Harness** — `createMockPrisma()` (every method a `vi.fn()`, with a `$transaction` default
  handling both callback and array forms) and its `MockPrisma` type; `mockTransaction()` for a
  one-shot `$transaction` override; `createMockRouter()`
- **Assertions** — `assertSuccess(result)` / `assertFailure(result)` narrow the action return
  union and **throw on the wrong branch**, which is what stops a test from asserting nothing at
  all. Use them instead of `if (result.success)`.

## Mocking recipes

`vi.mock()` is hoisted by Vitest, so the calls stay in each test file. Factories supply the mock
objects; the wiring is per-file. `mocks/module-mocks.ts` records the standard shapes as the
`MOCK_PATTERNS` const — a reference to read, never imported at runtime.

### Server action test

```ts
import {
  createMockPrisma,
  createMockDesigner,
  assertSuccess,
  assertFailure,
} from "@/__tests__/mocks";

const mockAuth = vi.fn();
vi.mock("@/lib/auth", () => ({ auth: mockAuth }));

const mockPrisma = createMockPrisma();
vi.mock("@/lib/db", () => ({ prisma: mockPrisma }));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn() }));
```

The auth mock targets **`@/lib/auth`, not `@/lib/auth-guard`** — `requireAuth` imports `auth` from
there, so mocking the guard would mock away the thing under test. A `beforeEach` sets an
authenticated user; unauthenticated paths use `mockAuth.mockResolvedValueOnce(null)`.

Actions in the stats-invalidating set should assert `revalidateTag` was called, not just that the
write happened — a mutation that forgets the tag is a silent staleness bug and the test is the
only thing that catches it.

### Component test

```ts
vi.mock("@/lib/actions/designer-actions", () => ({ createDesigner: vi.fn() }));

const mockRouter = createMockRouter();
vi.mock("next/navigation", () => ({ useRouter: () => mockRouter }));

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }) => <a href={href} {...rest}>{children}</a>,
}));
```

## Categories in use

| Category            | What it covers                                       | Example                        |
| ------------------- | ---------------------------------------------------- | ------------------------------ |
| **Unit**            | pure functions, validators, query helpers            | `skein-calculator.test.ts`     |
| **Hook**            | hooks via `renderHook`                               | `use-gallery-filters.test.ts`  |
| **Component**       | rendering, interaction, error states, a11y           | `gallery-card.test.tsx`        |
| **Server action**   | auth guard, Zod boundary, happy path, error branches | `designer-actions.test.ts`     |
| **Integration-ish** | real child rendering, mocked server                  | `project-detail-page.test.tsx` |
| **Fixture data**    | shipped seed data shape                              | `dmc-threads.test.ts`          |

Series is fully covered across the layers and is the pattern to copy for a new feature:
`series-actions.test.ts`, `validations/series.test.ts`, `utils/series-progress.test.ts`, four
component tests in `src/components/features/series/`, and `charts/series-tab-content.test.tsx`.

## Coverage

Configured, collected on demand, **no thresholds enforced**:

```ts
coverage: {
  provider: "v8",
  reporter: ["text", "lcov"],
  include: ["src/**/*.{ts,tsx}"],
  exclude: ["src/__tests__/**", "src/generated/**", "src/**/*.test.{ts,tsx}", "src/app/manifest.ts"],
}
```

No threshold is deliberate: a coverage number is not the bar, and adding low-value tests to lift
one is itself a review finding (`.claude/rules/testing-requirements.md`). Adding a threshold would
be a gate-config change, which is drift.

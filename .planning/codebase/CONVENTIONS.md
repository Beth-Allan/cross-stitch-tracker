# Conventions

> Code style, naming patterns, error handling, and enforced conventions.
> Generated: 2026-05-20

## Code Style and Tooling

### Formatter: Prettier 3.8.3

Config at `prettier.config.mjs`:
- Double quotes, semicolons, 100-char line width, trailing commas everywhere
- `prettier-plugin-tailwindcss` auto-sorts Tailwind classes

### Linter: ESLint 9 (Flat Config)

Config at `eslint.config.mjs`, extends `eslint-config-next/core-web-vitals` + TypeScript.

Project-specific rules enforced via `no-restricted-syntax` and `no-restricted-imports`:
- **Banned**: `<Button render={<Link>}>` — hydration mismatch; use `<LinkButton>` instead
- **Banned**: Direct import of `@/lib/auth` inside `src/lib/actions/**` — must use `@/lib/auth-guard`
- **Disabled**: `react-hooks/set-state-in-effect` (intentional pattern for dialog form reset)

### TypeScript: Strict Mode

- `strict: true` in `tsconfig.json`
- Path alias: `@/*` → `./src/*`
- `vitest/globals` types included

### Git Hooks (Husky + lint-staged)

- **Pre-commit**: Prettier → ESLint `--fix` on `*.{ts,tsx}`
- **Pre-push**: `npm run build`

### EditorConfig

2-space indent, LF line endings, UTF-8, trim trailing whitespace.

## Component Patterns

### Server vs Client Split

- **Default is Server Component** — no directive needed
- **`"use client"` only when**: React hooks, event handlers, browser APIs, client-only libraries
- **Never `"use client"` on**: Layout wrappers, pure presentational components, components that only render props/children

Data flow: Page (async server) → fetches data → passes props to top-level client component

### Button + Link Pattern

```tsx
// WRONG — hydration mismatch, ESLint error
<Button render={<Link href="/foo" />}>Go</Button>

// CORRECT — dedicated component
import { LinkButton } from "@/components/ui/link-button";
<LinkButton href="/foo">Go</LinkButton>
```

### buttonVariants Import Rule

`buttonVariants` lives in `button-variants.ts` (no `"use client"`). Server Components MUST import from `button-variants.ts`, not `button.tsx` (client module → runtime error in Next.js 16).

### Semantic Design Tokens

Always use semantic tokens, never hardcoded color scales:
```tsx
// WRONG: "border-stone-200 bg-white text-stone-500"
// CORRECT: "border-border bg-card text-muted-foreground"
```

Key mappings: `bg-card`, `bg-background`, `border-border`, `text-foreground`, `text-muted-foreground`.

### No Nested Forms

HTML doesn't support nested `<form>`. Use `<div>` with `type="button"` handlers for inline-add patterns inside forms.

## Server Action Patterns

### Auth Guard (Every Action)

```ts
"use server";
import { requireAuth } from "@/lib/auth-guard";

export async function createThing(formData: unknown) {
  await requireAuth(); // throws "Unauthorized" if no session
  // ...
}
```

### Return Type Convention

Discriminated union — actions never throw to the client:
```ts
{ success: true, data: T } | { success: false, error: string }
```

### Error Handling Tiers

1. **ZodError** → validation message bubbled up
2. **Prisma P2002** → user-friendly unique constraint message
3. **Catch-all** → generic message + `console.error`

### Mutation Flow

`requireAuth()` → `schema.parse()` → ownership check → Prisma write (often `$transaction`) → `revalidatePath()` / `revalidateTag()` → return result

## Validation Patterns

### Zod: Always `.trim()` Before `.min(1)`

```ts
// WRONG — whitespace-only passes: z.string().min(1, "Required")
// CORRECT: z.string().trim().min(1, "Required")
```

### Date String Validation

```ts
startDate: z.string().nullable().default(null)
  .refine((val) => val === null || !isNaN(Date.parse(val)), { message: "Invalid date" })
```

### Upload Response Check

`fetch()` only throws on network errors. Always check `response.ok` after presigned URL PUT.

## State Management

Three tiers, no global store:

1. **URL state (nuqs)** — Shareable/bookmarkable: gallery filters, sort, view mode, stats scope
2. **React local state** — Ephemeral: modal open, form fields, optimistic edits
3. **Server data** — Props from server components, refreshed via `revalidatePath`/`revalidateTag`

## Comment Conventions

Rules at `.claude/rules/comment-conventions.md`:

| Allowed | Not Allowed |
|---------|-------------|
| JSDoc on exported functions/types | JSX `{/* Section */}` markers in render blocks |
| "Why" comments for non-obvious decisions | `// --- Sub-section ---` in function bodies |
| `// TODO(999.XX): ...` with backlog refs | Planning doc references (`(D-02)`, `Phase 11`) |
| `// ─── Section ───` in type-bundle files only | WHAT-comments restating code |
| | `// ─── ... ───` in test files (use `describe`) |

## Import Conventions

- All paths use `@/` alias
- `import type` for type-only imports
- Observed order: React/framework → third-party → `@/components/ui/` → `@/components/features/` → `@/lib/` → `@/types/`
- Test imports: always from `@/__tests__/test-utils`, never `@testing-library/react`

## Package Management

- **Pin exact versions** in `package.json` (no `^` or `~`)
- After `npm install <pkg>`, check and remove the caret

## Export Conventions

- **Server actions**: named exports (`export async function createChart`)
- **Queries**: named exports (`export function getHeroStats`)
- **Types**: named `export type`
- **Components**: named exports (no default exports)
- **Pages/layouts**: default exports (Next.js requirement)

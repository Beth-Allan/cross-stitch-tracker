---
globs:
  - "src/components/**/*.tsx"
  - "src/app/**/*.tsx"
---

# Base UI + Next.js Patterns

> Battle-tested patterns for shadcn/ui v4 (built on @base-ui/react) with Next.js 16 App Router.
> Last updated: 2026-03-29

## Button as Link (navigation buttons)

**Do not** use `Button render={<Link>}` in this project. While Base UI supports `render` + `nativeButton={false}` for composition, this pattern is brittle with Next.js App Router SSR — it causes hydration mismatches because server and client render different HTML attributes. Banned locally and enforced by ESLint (`no-restricted-syntax`).

```tsx
// WRONG - causes hydration errors and console warnings
// ESLint will error on this pattern
<Button render={<Link href="/foo" />}>Go</Button>

// CORRECT - use the LinkButton component
import { LinkButton } from "@/components/ui/link-button";
<LinkButton href="/foo">Go</LinkButton>
<LinkButton href="/foo" variant="outline" size="sm">Go</LinkButton>
```

Use `<Button>` only for actual buttons (onClick handlers, form submits).
Use `<LinkButton>` for navigation that looks like a button.

## Tailwind data-attribute variants

shadcn/tailwind.css defines custom variants via `@custom-variant`:

- `data-horizontal:` maps to `[data-orientation="horizontal"]`
- `data-vertical:` maps to `[data-orientation="vertical"]`

These work correctly. Do NOT rewrite them to `data-[orientation=horizontal]:`.

## Semantic design tokens

Always use semantic tokens, never hardcoded color scales:

```tsx
// WRONG
"border-stone-200 bg-white text-stone-500 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-400";

// CORRECT
"border-border bg-card text-muted-foreground";
```

Key mappings: `bg-card`, `bg-background`, `border-border`, `text-foreground`, `text-muted-foreground`.

## Forms: no nesting

HTML does not support nested `<form>` elements. If you need an inline-add (like genre creation) inside a form, use a `<div>` with `type="button"` handlers:

```tsx
// WRONG - nested form causes outer form submission
<form onSubmit={handleChartSubmit}>
  <form onSubmit={handleGenreAdd}>  {/* browser ignores this */}
    <button type="submit">Add</button>  {/* submits OUTER form */}
  </form>
</form>

// CORRECT
<form onSubmit={handleChartSubmit}>
  <div>
    <input onKeyDown={(e) => e.key === "Enter" && handleGenreAdd()} />
    <button type="button" onClick={handleGenreAdd}>Add</button>
  </div>
</form>
```

---
globs:
  - "src/lib/validations/**/*.ts"
  - "src/lib/actions/**/*.ts"
  - "src/components/features/**/*.tsx"
---

# Form & Validation Patterns

> Zod validation, form architecture, and common pitfalls.
> Last updated: 2026-03-29

## Zod: always .trim() before .min(1)

Without `.trim()`, whitespace-only strings pass validation:

```ts
// WRONG - "   " passes
name: z.string().min(1, "Required");

// CORRECT - "   " fails
name: z.string().trim().min(1, "Required");
```

Apply to all user-facing name/text fields at the validation boundary.

## Zod: validate date strings

Date fields stored as nullable strings must validate format:

```ts
startDate: z.string().nullable().default(null)
  .refine((val) => val === null || !isNaN(Date.parse(val)), { message: "Invalid date" }),
```

## Upload: check response.ok

`fetch()` only throws on network errors. 4xx/5xx responses resolve normally. Always check:

```ts
const response = await fetch(presignedUrl, { method: "PUT", body: file, ... });
if (!response.ok) throw new Error("Upload failed");
```

## Optimistic UI: try/catch server actions

Server actions can throw (network errors, unexpected exceptions). Always wrap in try/catch when doing optimistic updates:

```ts
startTransition(async () => {
  try {
    const result = await updateSomething(id, value);
    if (result.success) {
      /* happy path */ return;
    }
    rollback();
  } catch {
    rollback();
    toast.error("Something went wrong.");
  }
});
```

## package.json: pin exact versions

No `^` or `~`. Exact versions only for reproducible builds:

```json
"nanoid": "5.1.7"     // CORRECT
"nanoid": "^5.1.7"    // WRONG
```

After `npm install <pkg>`, check and remove the caret.

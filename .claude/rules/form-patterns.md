---
globs:
  - "src/lib/validations/**/*.ts"
  - "src/lib/actions/**/*.ts"
  - "src/components/features/**/*.tsx"
---

# Form & Validation Patterns

> Zod validation, form architecture, and common pitfalls.
> Last updated: 2026-08-19

## One boundary, one rule — build schemas from `validations/fields.ts`

**The schema owns the rule; the form sends what the user typed.** A client form must never
normalise a value on the way to an action — that puts the same rule in two layers, and they drift.
Four forms were doing `value.trim() || null` because three schemas each handled blank text
differently, so what "no notes" meant depended on which form you came through.

The shared field builders live in `src/lib/validations/fields.ts` and are the convention:

| helper                              | for                                    | rule                                             |
| ----------------------------------- | -------------------------------------- | ------------------------------------------------ |
| `optionalText(max, tooLongMessage)` | nullable free text (notes, description)| trim; blank → `null`; limit measured after trim  |
| `optionalUrl(message?)`             | nullable links (website)               | trim; blank → `null`; **then** the URL check     |
| `optionalChoice()`                  | nullable picker values (ids, seasons)  | trim; blank → `null` — `""` is not a choice      |
| `optionalDateString(message?)`      | nullable date strings                  | `null` or something `Date.parse` accepts         |

Required names keep their inline rule (`z.string().trim().min(1, …).max(200, …)`) — it is already
one shape everywhere. A **non-nullable** column keeps its own rule and does not use these:
`SpecialtyItem.description` is `String @default("")`, so blank stays `""`.

## Actions type their input from the schema, and still parse it

Every action's payload parameter is `z.input<typeof theSchema>`, exported from the validations file
as `XInput`. `z.input`, never `z.infer` — `infer` is the *output* of the schema, so an action typed
with it would demand callers pre-fill every defaulted field. Where the parsed shape is needed
internally, export it separately (`ChartFormValidated = z.output<…>`).

**The type is a convenience for this app's own callers, never a guarantee.** Server action ids are
global, so any POST can reach an action with anything in the body — `.parse()` at the top of the
action is what actually defends it, and it stays. A test proving that defence uses
`unvalidatedPayload()` from `@/__tests__/mocks`, which names the cast instead of hiding it.

## Both error arms come from `utils/action-errors.ts`

`firstValidationMessage(error)` for the `z.ZodError` arm and `isDuplicateKeyError(error)` for
Prisma's P2002 — never re-inlined per action. A hand-written duplicate check was in five files
while a private copy of the same helper sat in a sixth.

## Narrow a native `<select>`'s value; never cast it

`e.target.value` is `string`, so a picker with a fixed option list widens on the way into state.
Use `optionFrom(OPTIONS, e.target.value)` from `@/lib/utils/select-option` — it checks against the
same list the options were rendered from, which an `as` cast cannot.

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

Date fields stored as nullable strings must validate format — use `optionalDateString()` rather
than re-writing the refine, which was triplicated inside one schema:

```ts
startDate: optionalDateString(),
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

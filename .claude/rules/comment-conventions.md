# Comment Conventions

Code comments should explain "why", not "what". Remove comments that restate what the code does.

## Allowed

- JSDoc on exported functions/types describing purpose, params, return values
- "Why" comments explaining non-obvious decisions or constraints
- TODO comments with backlog item numbers (e.g., `// TODO(999.XX): ...`)

## Exception: type-bundle section markers

Type-bundle files containing only interface/type declarations (e.g., `src/types/stats.ts`,
`src/types/dashboard.ts`) may use `// ─── Section Name ───` separators as navigation aids.
These files have no function or class symbols for IDE navigation, so section markers serve
as the primary structural signal.

## Not allowed

- JSX `{/* Section Label */}` markers inside render return blocks
- `// --- Sub-section ---` markers inside function bodies
- Planning doc references (e.g., `(D-02)`, `(T-10-12)`, `Phase 11`)
- WHAT-comments restating what code does (e.g., `// Increment counter`)
- `// ─── ... ───` markers in test files where `describe` blocks provide structure

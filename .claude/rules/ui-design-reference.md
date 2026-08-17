---
globs:
  - "src/components/features/**/*.tsx"
  - "docs/design/**/*"
  - "product-plan/**/*"
---

# UI Design Reference

**Hard rule 4: never build UI from scratch.** Building a screen from imagination is the banned
move — there is always a reference, and this file says which one.

## Which reference wins

1. **Design canon — `docs/design/screens/<slug>.md`.** Produced by a `/design-session`: Beth
   reacts to variants, her approval makes canon, and the canon landing queues the fidelity
   rebuild item. Canon is the spec for the screen it covers and supersedes everything below.
2. **DesignOS — `product-plan/sections/`.** The original whole-app design, mapped by
   `DESIGN-REFERENCE.md`. **Historical input, not the spec** (Beth's ruling D-05): it is what
   you follow for screens canon has not reached yet, and new canon supersedes it screen by
   screen.
3. **Nothing?** Flag it before building — a screen with no reference is a stop-and-ask, not a
   licence to invent.

> **Where things stand, 2026-08-16:** the DesignOS map is live at
> `docs/design/DESIGN-REFERENCE.md`. **No screen has canon yet** — `docs/design/screens/` arrives
> with the design track (overhaul step 8), and DS-1 is the first session that produces any.
> Until then, every screen follows DesignOS.

## Reading a DesignOS reference

`DESIGN-REFERENCE.md` maps each of the seven sections to its component and screenshot paths.
Inside a section directory (e.g. `product-plan/sections/project-management/`):

- **`components/*.tsx`** — layout, fields, sub-components, interaction patterns. Read the
  component you are building *and* the shared sub-components it pulls from the same directory.
- **`*.png`** — the intended visual result. Read it, do not skim the filename.
- **`README.md`, `types.ts`** — the section's own notes and data shapes.

Then **adapt to this stack** rather than copying: Server Components by default, server actions
for mutations, Zod at the boundary, and this repo's own primitives (`LinkButton`, semantic
tokens). The DesignOS files are React sketches, not production code.

## The live design system

The implemented direction — not a proposal:

- **`src/app/globals.css`** — the token set. Semantic tokens only in components (`bg-card`,
  `text-muted-foreground`), never raw colour scales.
- **`DESIGN.md`** + **`.impeccable/design.json`** — the written direction and its machine
  sidecar. A session that changes one refreshes the other before it ends.
- `product-plan/design-system/` (`tokens.css`, `fonts.md`, `tailwind-colors.md`) is the
  DesignOS-era source these were derived from — historical, same status as the rest of DesignOS.

**Impeccable is the design tool, never a process authority.** It produces variants and critiques;
`docs/process/session-protocol.md` §8 (`/design-session`) owns the process.

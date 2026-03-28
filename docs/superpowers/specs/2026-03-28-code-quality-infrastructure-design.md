# Code Quality Infrastructure Design

**Date:** 2026-03-28
**Status:** Approved
**Scope:** Testing, formatting, Git hooks, branch protection, Node version pinning

---

## Goal

Establish the full code quality stack before Phase 2 adds business logic. Every commit should be auto-formatted, linted, and type-safe before it reaches CI. Tests should be easy to write and run.

## Non-Goals

- E2E / browser testing (revisit when real user flows exist)
- Coverage enforcement thresholds (tool set up now, enforcement later)
- Commit message linting / conventional commits (overkill for solo dev)
- Dependabot / Renovate (not blocking, add later)

---

## 1. Testing Infrastructure

### Packages (devDependencies)

- `@testing-library/react` — component rendering and queries
- `@testing-library/jest-dom` — DOM matchers (`toBeVisible`, `toHaveTextContent`, etc.)
- `@vitest/coverage-v8` — coverage reporting
- `jsdom` — browser environment for Vitest

### Configuration

**`vitest.config.ts`:**
- Change `environment` from `"node"` to `"jsdom"`
- Keep `globals: true`
- Keep setup file at `./src/__tests__/setup.ts`
- Keep path alias `@ -> ./src`

**`src/__tests__/setup.ts`:**
- Import `@testing-library/jest-dom/vitest` for matcher extensions

**TypeScript:**
- Add Vitest global types to `tsconfig.json` compilerOptions: `"types": ["vitest/globals"]`

### Test Utilities

**`src/__tests__/test-utils.tsx`:**
- Custom `render()` wrapper providing app-level providers (empty for now, ready for future context providers)
- Re-exports everything from `@testing-library/react`
- Convention: tests import from `@/__tests__/test-utils` instead of `@testing-library/react` directly

### Conventions

- **Colocated tests:** `button.test.tsx` lives next to `button.tsx`, not in a mirror `__tests__/` tree
- `src/__tests__/` holds only shared utilities (`setup.ts`, `test-utils.tsx`)
- **Scope:** Unit and component tests only. No mocking Prisma, Next.js routing, or other framework internals — those are integration/E2E concerns.

### Scripts

- `npm test` — `vitest run --reporter=verbose` (already exists)
- `npm run test:watch` — `vitest --reporter=verbose` (interactive dev mode)
- `npm run test:coverage` — `vitest run --coverage`

### CI

- Add `npm test` step to `.github/workflows/ci.yml` between lint and build

### Validation

- One smoke test for an existing UI component to confirm the setup works end-to-end

---

## 2. Prettier + Formatting

### Packages (devDependencies)

- `prettier` — code formatter
- `prettier-plugin-tailwindcss` — auto-sorts Tailwind utility classes

### Configuration

**`prettier.config.mjs`:**
```js
export default {
  semi: true,
  singleQuote: false,
  printWidth: 100,
  trailingComma: "all",
  plugins: ["prettier-plugin-tailwindcss"],
};
```

**`.editorconfig`:**
```ini
root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true
```

### Scripts

- `npm run format` — `prettier --write .`
- `npm run format:check` — `prettier --check .` (for CI)

### CI

- Add `npm run format:check` step before lint in `ci.yml`

### One-Time

- Run `npm run format` on the entire codebase
- Commit formatting changes separately to isolate the diff from real changes

---

## 3. Pre-commit Hooks (Husky + lint-staged)

### Packages (devDependencies)

- `husky` — Git hook manager
- `lint-staged` — runs tools on staged files only

### Hooks

**pre-commit** (via lint-staged):
1. Prettier formats staged files (runs first, writes fixes)
2. ESLint checks formatted files with `--fix` (runs second)
3. lint-staged auto-re-stages any changes

**pre-push:**
- Runs `npm run build` to catch type errors before they reach CI

### Configuration

**`lint-staged` in `package.json`:**
```json
{
  "lint-staged": {
    "*.{ts,tsx,js,mjs,json,css,md}": "prettier --write",
    "*.{ts,tsx}": "eslint --fix"
  }
}
```

Note: lint-staged runs commands in order per glob. The Prettier glob is broader (catches config files, markdown, CSS). The ESLint glob targets only source files.

**`.husky/pre-commit`:**
```sh
npx lint-staged
```

**`.husky/pre-push`:**
```sh
npm run build
```

### Setup

- `npx husky init` creates `.husky/` directory
- `prepare` script in `package.json`: `"prepare": "husky"` (auto-installs hooks on `npm install`)

---

## 4. GitHub Branch Protection

### Rules for `main`

| Rule | Value |
|------|-------|
| Require PR before merge | Yes |
| Required status checks | `build` job from CI |
| Require branch up-to-date | Yes |
| Allow admin bypass | Yes (never used without explicit user permission) |
| Require reviews | No (solo project) |

### Implementation

- Configure via `gh api` — no manual GitHub UI steps
- Verify by attempting a direct push (should be rejected)

---

## 5. Node Version Pinning

### Files

**`.nvmrc`:**
```
22
```

**`package.json` engines:**
```json
{
  "engines": {
    "node": ">=22"
  }
}
```

Matches CI configuration (`node-version: 22` in `ci.yml`).

---

## Implementation Order

1. Node version pinning (`.nvmrc`, engines) — no dependencies
2. Prettier + `.editorconfig` — must exist before hooks reference it
3. Format existing codebase — isolated commit
4. Testing infrastructure — packages, config, utilities, example test
5. Husky + lint-staged — depends on Prettier and ESLint being configured
6. CI updates — add format:check and test steps
7. GitHub branch protection — last, after CI is fully configured

## GSD Integration

After implementation, update project artifacts so GSD workflows stay aware of the new quality gates:

- **CLAUDE.md Current Status:** Mark test infrastructure blocker as resolved. Update "Next Up" to point at Phase 2.
- **CLAUDE.md Conventions:** Add testing conventions (colocated files, import from test-utils, what to test/not test).
- **CLAUDE.md Common Commands:** Add `npm run test:watch`, `npm run test:coverage`, `npm run format`, `npm run format:check`.
- **CLAUDE.md Pre-Commit:** Update to reflect the actual hook pipeline (Prettier + ESLint on commit, build on push).
- **.planning/STATE.md:** Update to reflect this work as completed infrastructure task.
- **CI awareness:** GSD's `/gsd:execute-phase` and `/gsd:quick` workflows will automatically benefit from the hooks — no special config needed. The hooks enforce quality at the Git level regardless of workflow.

---

## Risks

- **Prettier + existing code:** The initial format run may touch many files. Isolated commit mitigates git blame noise.
- **lint-staged + large staged changesets:** Could be slow on very large commits. Not a concern at current codebase size.
- **pre-push build time:** Currently fast (~10s). Monitor as codebase grows; can be removed if it becomes a bottleneck.

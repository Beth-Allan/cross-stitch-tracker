# Code Quality Infrastructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish testing, formatting, Git hooks, branch protection, and Node version pinning before Phase 2 adds business logic.

**Architecture:** Seven sequential tasks that layer on top of each other: Node pinning first, then Prettier config, codebase format pass, test infrastructure, Git hooks, CI updates, and finally GitHub branch protection. Each task produces a working, committable state.

**Tech Stack:** Vitest + React Testing Library + jsdom, Prettier + tailwindcss plugin, Husky + lint-staged, GitHub Actions CI, `gh` CLI for branch protection.

**Spec:** `docs/superpowers/specs/2026-03-28-code-quality-infrastructure-design.md`

---

## File Map

### Created

| File | Purpose |
|------|---------|
| `.nvmrc` | Node version pinning for `nvm use` |
| `.editorconfig` | Editor-agnostic indentation/charset/newline rules |
| `prettier.config.mjs` | Prettier config with Tailwind plugin |
| `.prettierignore` | Exclude generated files and build output from formatting |
| `src/__tests__/test-utils.tsx` | Custom render wrapper, re-exports RTL |
| `src/components/placeholder-page.test.tsx` | Smoke test validating the test setup works |
| `.husky/pre-commit` | Runs lint-staged on commit |
| `.husky/pre-push` | Runs `npm run build` on push |

### Modified

| File | What Changes |
|------|-------------|
| `package.json` | `engines`, new scripts, `lint-staged` config, `prepare` script |
| `vitest.config.ts` | Environment → jsdom, coverage config |
| `tsconfig.json` | Add `"types": ["vitest/globals"]` |
| `src/__tests__/setup.ts` | Import jest-dom matchers |
| `.github/workflows/ci.yml` | Add format:check and test steps |
| `CLAUDE.md` | Update status, conventions, commands |
| `.planning/STATE.md` | Update progress |

---

## Task 1: Node Version Pinning

**Files:**
- Create: `.nvmrc`
- Modify: `package.json`

- [ ] **Step 1: Create `.nvmrc`**

```
22
```

Single line, no trailing content. Matches `node-version: 22` in CI.

- [ ] **Step 2: Add `engines` field to `package.json`**

Add after the `"private": true` line:

```json
"engines": {
  "node": ">=22"
},
```

- [ ] **Step 3: Verify**

Run: `node -v`
Expected: `v22.x.x` (any 22+ version)

Run: `cat .nvmrc`
Expected: `22`

- [ ] **Step 4: Commit**

```bash
git add .nvmrc package.json
git commit -m "chore: pin Node 22 via .nvmrc and engines field"
```

---

## Task 2: Prettier + EditorConfig Setup

**Files:**
- Create: `prettier.config.mjs`
- Create: `.editorconfig`
- Create: `.prettierignore`
- Modify: `package.json` (add format scripts)

- [ ] **Step 1: Install Prettier packages**

```bash
npm install --save-dev --save-exact prettier prettier-plugin-tailwindcss
```

- [ ] **Step 2: Create `prettier.config.mjs`**

```js
/** @type {import("prettier").Config} */
export default {
  semi: true,
  singleQuote: false,
  printWidth: 100,
  trailingComma: "all",
  plugins: ["prettier-plugin-tailwindcss"],
};
```

- [ ] **Step 3: Create `.editorconfig`**

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

- [ ] **Step 4: Create `.prettierignore`**

```
# Build output
.next/
out/
coverage/

# Generated code
src/generated/

# Package manager
node_modules/

# Planning/tooling (not project code)
.claude/
.planning/
product-plan/
```

- [ ] **Step 5: Add format scripts to `package.json`**

Add to the `"scripts"` section:

```json
"format": "prettier --write .",
"format:check": "prettier --check ."
```

- [ ] **Step 6: Verify Prettier runs**

Run: `npm run format:check`
Expected: Some files may show as unformatted (that's fine — we'll format in the next task). The command should exit successfully or with formatting diff output, not crash.

- [ ] **Step 7: Commit**

```bash
git add prettier.config.mjs .editorconfig .prettierignore package.json package-lock.json
git commit -m "chore: add Prettier with Tailwind plugin and EditorConfig"
```

---

## Task 3: Format Existing Codebase

**Files:**
- Modify: All source files (auto-formatted)

This is an isolated commit so Prettier formatting changes don't pollute real feature diffs.

- [ ] **Step 1: Run Prettier on the entire codebase**

```bash
npm run format
```

- [ ] **Step 2: Review the changes**

```bash
git diff --stat
```

Expected: Multiple files changed (formatting only — no logic changes). Spot-check a few files to confirm only whitespace/formatting changed.

- [ ] **Step 3: Verify nothing broke**

```bash
npm run lint && npm run build
```

Expected: Both pass. Prettier formatting should not introduce lint errors or type errors.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "style: format entire codebase with Prettier

Isolated commit for clean git blame. No logic changes."
```

---

## Task 4: Testing Infrastructure

**Files:**
- Modify: `vitest.config.ts`
- Modify: `tsconfig.json`
- Modify: `src/__tests__/setup.ts`
- Modify: `package.json` (add test scripts)
- Create: `src/__tests__/test-utils.tsx`
- Create: `src/components/placeholder-page.test.tsx`

- [ ] **Step 1: Install testing packages**

```bash
npm install --save-dev --save-exact @testing-library/react @testing-library/jest-dom @vitest/coverage-v8 jsdom
```

- [ ] **Step 2: Update `vitest.config.ts`**

Replace the entire file with:

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/__tests__/setup.ts"],
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    passWithNoTests: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/__tests__/**",
        "src/generated/**",
        "src/**/*.test.{ts,tsx}",
        "src/app/manifest.ts",
      ],
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
```

Key changes from previous: `environment: "jsdom"`, added `coverage` config block.

- [ ] **Step 3: Add Vitest global types to `tsconfig.json`**

Add `"types": ["vitest/globals"]` to `compilerOptions`. The compilerOptions section should include:

```json
"types": ["vitest/globals"]
```

This eliminates TypeScript errors for `describe`, `it`, `expect` globals.

- [ ] **Step 4: Update `src/__tests__/setup.ts`**

Replace the entire file with:

```ts
import "@testing-library/jest-dom/vitest";
```

This registers all jest-dom matchers (`toBeVisible`, `toHaveTextContent`, `toBeInTheDocument`, etc.) with Vitest's `expect`.

- [ ] **Step 5: Create `src/__tests__/test-utils.tsx`**

```tsx
import { render, type RenderOptions } from "@testing-library/react";
import type { ReactElement } from "react";

/**
 * App-level providers wrapper for tests.
 * Add context providers here as they're introduced (theme, auth, etc.).
 */
function AllProviders({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function customRender(ui: ReactElement, options?: Omit<RenderOptions, "wrapper">) {
  return render(ui, { wrapper: AllProviders, ...options });
}

// Re-export everything from RTL, override render with our wrapper
export * from "@testing-library/react";
export { customRender as render };
```

- [ ] **Step 6: Add test scripts to `package.json`**

The existing `"test"` script stays. Add two more to the `"scripts"` section:

```json
"test:watch": "vitest --reporter=verbose",
"test:coverage": "vitest run --coverage"
```

- [ ] **Step 7: Write smoke test for PlaceholderPage**

Create `src/components/placeholder-page.test.tsx`:

```tsx
import { render, screen } from "@/__tests__/test-utils";
import { PlaceholderPage } from "./placeholder-page";
import { Scissors } from "lucide-react";

describe("PlaceholderPage", () => {
  it("renders the title and description", () => {
    render(
      <PlaceholderPage title="My Charts" description="Track your collection" icon={Scissors} />,
    );

    expect(screen.getByText("My Charts")).toBeInTheDocument();
    expect(screen.getByText("Track your collection")).toBeInTheDocument();
  });

  it("renders the coming soon badge", () => {
    render(
      <PlaceholderPage title="My Charts" description="Track your collection" icon={Scissors} />,
    );

    expect(screen.getByText("Coming soon")).toBeInTheDocument();
  });
});
```

- [ ] **Step 8: Run the test to verify the setup works**

Run: `npm test`
Expected:

```
 ✓ src/components/placeholder-page.test.tsx (2 tests)
   ✓ PlaceholderPage > renders the title and description
   ✓ PlaceholderPage > renders the coming soon badge

 Test Files  1 passed (1)
 Tests       2 passed (2)
```

- [ ] **Step 9: Run coverage to verify it works**

Run: `npm run test:coverage`
Expected: Coverage report prints to terminal. `src/components/placeholder-page.tsx` shows coverage. No crashes.

- [ ] **Step 10: Commit**

```bash
git add vitest.config.ts tsconfig.json src/__tests__/setup.ts src/__tests__/test-utils.tsx src/components/placeholder-page.test.tsx package.json package-lock.json
git commit -m "test: set up Vitest + React Testing Library with jsdom

Adds jsdom environment, jest-dom matchers, custom render
wrapper, coverage config, and a smoke test for PlaceholderPage."
```

---

## Task 5: Husky + lint-staged

**Files:**
- Create: `.husky/pre-commit`
- Create: `.husky/pre-push`
- Modify: `package.json` (add `prepare` script, `lint-staged` config)

- [ ] **Step 1: Install Husky and lint-staged**

```bash
npm install --save-dev --save-exact husky lint-staged
```

- [ ] **Step 2: Initialize Husky**

```bash
npx husky init
```

This creates `.husky/` directory and adds a default `pre-commit` hook. It also adds `"prepare": "husky"` to `package.json` scripts.

- [ ] **Step 3: Configure the pre-commit hook**

Replace `.husky/pre-commit` contents with:

```sh
npx lint-staged
```

- [ ] **Step 4: Create the pre-push hook**

Create `.husky/pre-push`:

```sh
npm run build
```

- [ ] **Step 5: Add lint-staged config to `package.json`**

Add at the top level of `package.json` (after `"devDependencies"`):

```json
"lint-staged": {
  "*.{ts,tsx,js,mjs,json,css,md}": "prettier --write",
  "*.{ts,tsx}": "eslint --fix"
}
```

Ordering: Prettier runs first (broader glob), then ESLint (source files only). lint-staged auto-re-stages any changes.

- [ ] **Step 6: Verify the pre-commit hook works**

Create a test scenario:

```bash
echo "" >> src/lib/utils.ts
git add src/lib/utils.ts
git commit -m "test: verify pre-commit hook"
```

Expected: lint-staged runs (you'll see Prettier and ESLint output). The commit succeeds. The trailing newline gets cleaned up by Prettier.

Then undo the test commit:

```bash
git reset HEAD~1
git checkout src/lib/utils.ts
```

- [ ] **Step 7: Commit**

```bash
git add .husky/ package.json package-lock.json
git commit -m "chore: add Husky pre-commit (lint-staged) and pre-push (build)"
```

---

## Task 6: CI Updates

**Files:**
- Modify: `.github/workflows/ci.yml`

- [ ] **Step 1: Update CI workflow**

Replace `.github/workflows/ci.yml` with:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - run: npm ci

      - run: npx prisma generate

      - name: Check formatting
        run: npm run format:check

      - name: Lint
        run: npm run lint

      - name: Test
        run: npm test

      - name: Build
        run: npm run build
```

Pipeline order: install → prisma generate → format check → lint → test → build. Format check catches drift even if someone bypasses the pre-commit hook.

- [ ] **Step 2: Verify the workflow file is valid YAML**

Run: `cat .github/workflows/ci.yml | head -30`
Expected: Clean YAML, no syntax errors.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add format check and test steps to CI pipeline"
```

---

## Task 7: GitHub Branch Protection

**Files:**
- No file changes — GitHub API configuration only

- [ ] **Step 1: Set up branch protection rules**

```bash
gh api repos/Beth-Allan/cross-stitch-tracker/branches/main/protection \
  --method PUT \
  --input - <<'EOF'
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["build"]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": null,
  "restrictions": null
}
EOF
```

This sets:
- Required status check: `build` job must pass
- Strict: branch must be up-to-date with main
- `enforce_admins: false`: allows admin bypass (but we never use it without asking)
- No required reviews (solo project)

- [ ] **Step 2: Enable "require PR" via ruleset**

Branch protection v1 API doesn't cleanly support "require PR without reviews." Use a repository ruleset instead:

```bash
gh api repos/Beth-Allan/cross-stitch-tracker/rulesets \
  --method POST \
  --input - <<'EOF'
{
  "name": "Protect main",
  "target": "branch",
  "enforcement": "active",
  "bypass_actors": [
    {
      "actor_id": 5,
      "actor_type": "RepositoryRole",
      "bypass_mode": "always"
    }
  ],
  "conditions": {
    "ref_name": {
      "include": ["refs/heads/main"],
      "exclude": []
    }
  },
  "rules": [
    {
      "type": "pull_request",
      "parameters": {
        "required_approving_review_count": 0,
        "dismiss_stale_reviews_on_push": false,
        "require_code_owner_review": false,
        "require_last_push_approval": false,
        "required_review_thread_resolution": false
      }
    },
    {
      "type": "required_status_checks",
      "parameters": {
        "strict_required_status_checks_policy": true,
        "required_status_checks": [
          {
            "context": "build",
            "integration_id": 15368
          }
        ]
      }
    }
  ]
}
EOF
```

Note: `actor_id: 5` is the "Repository admin" role. `integration_id: 15368` is GitHub Actions. These IDs may differ per repository — if the ruleset creation fails or the status check doesn't match, query existing rulesets with `gh api repos/Beth-Allan/cross-stitch-tracker/rulesets` and adjust the IDs. If the exact integration_id is unknown, omit it and set just the `context` string — GitHub will match by name.

- [ ] **Step 3: Verify protection is active**

```bash
gh api repos/Beth-Allan/cross-stitch-tracker/branches/main/protection
```

Expected: JSON response showing `required_status_checks` with `build` context, `enforce_admins: false`.

---

## Task 8: GSD Integration + CLAUDE.md Updates

**Files:**
- Modify: `CLAUDE.md`
- Modify: `.planning/STATE.md`

- [ ] **Step 1: Update CLAUDE.md Current Status**

In the `### Done` section, add:
```
- **Code quality infrastructure:** Prettier + Tailwind plugin, Vitest + RTL + jsdom, Husky pre-commit/pre-push hooks, GitHub branch protection, Node 22 pinning
```

In `### Blockers / Decisions Needed`, remove:
```
- **Testing:** Vitest is installed but no tests or patterns exist. Must set up test infrastructure (component testing strategy, test utilities, example tests) before Phase 2 adds business logic.
```

In `### Next Up`, update to:
```
1. `/gsd:discuss-phase 2` or `/gsd:plan-phase 2` — Core Project Management (charts, designers, genres)
```

- [ ] **Step 2: Add testing conventions to CLAUDE.md**

In the `## Conventions` section, replace "Conventions not yet established..." with:

```markdown
### Testing
- **Colocated tests:** `button.test.tsx` lives next to `button.tsx`, not in a centralized `__tests__/` tree
- **Shared test utilities only** in `src/__tests__/` (`setup.ts`, `test-utils.tsx`)
- **Import from test-utils:** `import { render, screen } from "@/__tests__/test-utils"` — not directly from `@testing-library/react`
- **Scope:** Unit and component tests only. Do not mock Prisma, Next.js routing, or framework internals.
- **Coverage:** Run `npm run test:coverage` to check. No enforcement threshold yet.

### Formatting
- **Prettier** handles all formatting — do not manually adjust whitespace or semicolons
- **Tailwind class sorting** is automatic via `prettier-plugin-tailwindcss`
- Pre-commit hook runs Prettier + ESLint on staged files automatically

### Git Hooks
- **Pre-commit:** lint-staged runs Prettier (format) then ESLint (lint) on staged files
- **Pre-push:** `npm run build` runs to catch type errors before CI
- Do not skip hooks with `--no-verify` unless explicitly told to by the user
```

- [ ] **Step 3: Update Common Commands in CLAUDE.md**

Add to the `## Common Commands` section:

```bash
npm run test:watch       # Interactive test runner
npm run test:coverage    # Coverage report
npm run format           # Format all files with Prettier
npm run format:check     # Check formatting (used in CI)
```

- [ ] **Step 4: Update `.planning/STATE.md`**

Update the `last_activity` line to reflect this work. Add to the Quick Tasks Completed table if using GSD quick task format, or update the `stopped_at` field.

- [ ] **Step 5: Commit**

```bash
git add CLAUDE.md .planning/STATE.md
git commit -m "docs: update CLAUDE.md with code quality conventions and resolved testing blocker"
```

---

## Verification Checklist

After all tasks are complete, run this full verification:

```bash
# 1. Formatting
npm run format:check     # Should pass (no unformatted files)

# 2. Linting
npm run lint             # Should pass

# 3. Tests
npm test                 # Should pass (2 tests)

# 4. Coverage
npm run test:coverage    # Should show coverage report

# 5. Build
npm run build            # Should pass

# 6. Hooks (manual check)
# Make a small change, stage it, commit — lint-staged should run

# 7. Branch protection (manual check)
gh api repos/Beth-Allan/cross-stitch-tracker/branches/main/protection
# Should show required_status_checks with "build"
```

import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Process tooling and archived history (not project code)
    ".claude/**",
    "docs/archive/**",
    // Design reference components (not production code)
    "product-plan/**",
    // Build scripts
    "scripts/**",
  ]),
  // Project-specific decisions — each one debugged or ruled on, not a default
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      // Dialog form reset via useEffect is a common, intentional pattern here,
      // and the React compiler rule is too strict to allow it.
      "react-hooks/set-state-in-effect": "off",

      // An `_` prefix means "deliberately unused" — the convention this codebase
      // already writes (`_userId` documenting a future per-user lookup,
      // `{ photoKey: _, ...rest }` omitting a key). The three patterns spell one
      // convention uniformly; only `varsIgnorePattern` has live sites today, and
      // the other two are here so args and caught errors cannot mean something
      // different from vars. Beth's ruling, 2026-08-20, with the
      // `--max-warnings 0` flip.
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],

      // Images here are either a private R2 object behind a presigned URL that
      // expires in an hour, or a local `blob:` preview — `next/image`'s optimizer
      // can cache and transform neither, which is why all four existing `<Image>`
      // elements pass `unoptimized`. The rule therefore asks for something this app
      // cannot do; the real shrinking happens at upload (`processAndStoreImage`,
      // P15), not at render. Beth's ruling, 2026-08-20. This turns the rule off
      // repo-wide, so a future *static* asset rendered with `<img>` goes unflagged —
      // the standing "how should images load?" question is a design-track input
      // (`work-log/backlog.md`), not a lint warning.
      "@next/next/no-img-element": "off",

      "no-restricted-syntax": [
        "error",
        {
          // Catch <Button render={<Link ... />}> — causes hydration mismatches.
          // Use <LinkButton> instead. See .claude/rules/base-ui-patterns.md
          selector:
            "JSXElement[openingElement.name.name='Button'] JSXAttribute[name.name='render'] JSXElement[openingElement.name.name='Link']",
          message:
            'Do not use Button render={<Link>}. Use <LinkButton href="..."> instead. See .claude/rules/base-ui-patterns.md',
        },
      ],
    },
  },
  {
    files: ["src/lib/actions/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              // Force using shared requireAuth from auth-guard.ts
              // instead of importing auth directly in action files
              name: "@/lib/auth",
              message:
                "Import { requireAuth } from '@/lib/auth-guard' instead. See .claude/rules/auth-patterns.md",
            },
          ],
        },
      ],
    },
  },
]);

export default eslintConfig;

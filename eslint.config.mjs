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
    // GSD tooling (vendored, not project code)
    ".claude/**",
    ".planning/**",
    // Design reference components (not production code)
    "product-plan/**",
    // Build scripts
    "scripts/**",
  ]),
  // Project-specific guardrails — prevent patterns we've debugged
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
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

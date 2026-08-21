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
  // Disable overly strict React compiler rule — dialog form reset via
  // useEffect is a common, intentional pattern in this codebase
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "react-hooks/set-state-in-effect": "off",
    },
  },
  // An `_` prefix means "deliberately unused" — the convention this codebase already
  // writes (`_userId` documenting a future per-user lookup, `{ photoKey: _, ...rest }`
  // omitting a key). Without these options the rule flags the convention as a mistake,
  // and a rest-sibling omission has no other way to be written at all. Beth's ruling,
  // 2026-08-20, with the `--max-warnings 0` flip.
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
    },
  },
  // Every image this app renders is a private R2 object fetched through a presigned URL
  // that expires in an hour, so `next/image`'s optimizer cannot cache or transform it —
  // the three components already using `next/image` all pass `unoptimized` for exactly
  // that reason, which makes this rule ask for something the app cannot do. The real
  // shrinking happens at upload (`processAndStoreImage`, P15) rather than at render.
  // Beth's ruling, 2026-08-20; the standing "how should images load?" question is a
  // design-track input (backlog), not a lint warning.
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "@next/next/no-img-element": "off",
    },
  },
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

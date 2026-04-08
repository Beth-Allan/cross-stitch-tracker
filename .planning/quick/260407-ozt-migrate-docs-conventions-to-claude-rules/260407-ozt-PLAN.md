---
phase: quick
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - .claude/rules/auth-patterns.md
  - .claude/rules/base-ui-patterns.md
  - .claude/rules/form-patterns.md
  - .claude/rules/server-client-split.md
  - .claude/rules/component-implementation.md
  - .claude/rules/server-actions.md
  - .claude/rules/bleeding-edge-libs.md
  - CLAUDE.md
  - eslint.config.mjs
  - src/lib/auth-guard.ts
  - docs/conventions/server-client-split.md
autonomous: true
requirements: []
must_haves:
  truths:
    - "Convention files auto-load via .claude/rules/ glob patterns when touching relevant source files"
    - "No remaining references to docs/conventions/ in any active file"
    - "docs/conventions/ directory is deleted"
    - "Existing rules files no longer tell Claude to manually read docs/conventions/"
  artifacts:
    - path: ".claude/rules/auth-patterns.md"
      provides: "Auth.js v5 patterns with glob frontmatter"
      contains: "globs:"
    - path: ".claude/rules/base-ui-patterns.md"
      provides: "Base UI + Next.js patterns with glob frontmatter"
      contains: "globs:"
    - path: ".claude/rules/form-patterns.md"
      provides: "Form & validation patterns with glob frontmatter"
      contains: "globs:"
    - path: ".claude/rules/server-client-split.md"
      provides: "Server/Client component patterns with glob frontmatter"
      contains: "globs:"
  key_links:
    - from: ".claude/rules/auth-patterns.md"
      to: "src/lib/auth*.ts, src/lib/actions/**/*.ts"
      via: "glob frontmatter"
      pattern: "globs:"
    - from: ".claude/rules/base-ui-patterns.md"
      to: "src/components/**/*.tsx, src/app/**/*.tsx"
      via: "glob frontmatter"
      pattern: "globs:"
---

<objective>
Migrate all 4 convention files from docs/conventions/ to .claude/rules/ with glob frontmatter for auto-loading. Update all references across the codebase and delete the old directory.

Purpose: Convention files in docs/conventions/ require a manual dispatch table in CLAUDE.md ("When touching X, read Y"). Moving them to .claude/rules/ with glob patterns makes them auto-load when Claude touches matching files, eliminating the manual step and reducing risk of outdated conventions being missed.

Output: 4 convention files with glob frontmatter in .claude/rules/, 3 updated rules files, updated CLAUDE.md, updated code comments, deleted docs/conventions/ directory.
</objective>

<execution_context>
@/Users/wanderskye/Projects/cross-stitch-tracker/.claude/get-shit-done/workflows/execute-plan.md
@/Users/wanderskye/Projects/cross-stitch-tracker/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@CLAUDE.md
@docs/conventions/auth-patterns.md
@docs/conventions/base-ui-patterns.md
@docs/conventions/form-patterns.md
@docs/conventions/server-client-split.md
@.claude/rules/component-implementation.md
@.claude/rules/server-actions.md
@.claude/rules/bleeding-edge-libs.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Move convention files to .claude/rules/ with glob frontmatter</name>
  <files>.claude/rules/auth-patterns.md, .claude/rules/base-ui-patterns.md, .claude/rules/form-patterns.md, .claude/rules/server-client-split.md</files>
  <action>
Create each convention file in .claude/rules/ by prepending glob frontmatter to the existing content. Keep all existing content verbatim except for one internal cross-reference that needs updating.

**auth-patterns.md** — Add frontmatter:
```yaml
---
globs:
  - "src/lib/auth*.ts"
  - "src/lib/actions/**/*.ts"
---
```
Content: Exact copy of docs/conventions/auth-patterns.md (no changes needed).

**base-ui-patterns.md** — Add frontmatter:
```yaml
---
globs:
  - "src/components/**/*.tsx"
  - "src/app/**/*.tsx"
---
```
Content: Exact copy of docs/conventions/base-ui-patterns.md (no changes needed).

**form-patterns.md** — Add frontmatter:
```yaml
---
globs:
  - "src/lib/validations/**/*.ts"
  - "src/lib/actions/**/*.ts"
  - "src/components/features/**/*.tsx"
---
```
Content: Exact copy of docs/conventions/form-patterns.md (no changes needed).

**server-client-split.md** — Add frontmatter:
```yaml
---
globs:
  - "src/components/**/*.tsx"
  - "src/app/**/*.tsx"
---
```
Content: Copy of docs/conventions/server-client-split.md with ONE change on line 39:
- Old: `See \`docs/conventions/base-ui-patterns.md\`.`
- New: `See \`.claude/rules/base-ui-patterns.md\`.`

After creating all 4 files, delete docs/conventions/ directory: `rm -rf docs/conventions/`
If the docs/ directory is now empty, delete it too: `rmdir docs/conventions 2>/dev/null; rmdir docs 2>/dev/null` (rmdir only removes empty dirs, safe to attempt).
  </action>
  <verify>
    <automated>test -f .claude/rules/auth-patterns.md && test -f .claude/rules/base-ui-patterns.md && test -f .claude/rules/form-patterns.md && test -f .claude/rules/server-client-split.md && ! test -d docs/conventions && echo "PASS: all files moved" || echo "FAIL"</automated>
  </verify>
  <done>All 4 convention files exist in .claude/rules/ with glob frontmatter. docs/conventions/ directory deleted. Each file's content matches the original except for the server-client-split.md cross-reference update.</done>
</task>

<task type="auto">
  <name>Task 2: Update all references to docs/conventions/ across the codebase</name>
  <files>.claude/rules/component-implementation.md, .claude/rules/server-actions.md, .claude/rules/bleeding-edge-libs.md, CLAUDE.md, eslint.config.mjs, src/lib/auth-guard.ts</files>
  <action>
Update every file that references docs/conventions/ to reflect the new location. Changes grouped by file:

**`.claude/rules/component-implementation.md`** — Lines 11-12: Remove the "Read docs/conventions/" instructions since those files now auto-load alongside this rule (same glob patterns). Replace lines 11-12 with references that acknowledge co-loading:
- Line 11: `1. **Base UI patterns auto-load with this rule** — Button+Link pattern, semantic tokens, no nested forms (see base-ui-patterns.md)`
- Line 12: `2. **Server/Client split rules auto-load with this rule** — when "use client" is needed (see server-client-split.md)`

**`.claude/rules/server-actions.md`** — Lines 10-11: Same treatment, these files now auto-load alongside:
- Line 10: `1. **Auth patterns auto-load with this rule** — requireAuth pattern, JWT callback requirement (see auth-patterns.md)`
- Line 11: `2. **Form patterns auto-load with this rule** — Zod trim, date validation, upload checks (see form-patterns.md)`

**`.claude/rules/bleeding-edge-libs.md`** — Lines 22 and 25-28: Update references:
- Line 22: Change `Check \`docs/conventions/\` for project-specific patterns` to `Check \`.claude/rules/\` for project-specific patterns we've already debugged`
- Lines 25-28: Change `**Known footguns documented in \`docs/conventions/\`:**` to `**Known footguns documented in \`.claude/rules/\`:**`
  - Update sub-bullets to reference `.claude/rules/auth-patterns.md`, `.claude/rules/base-ui-patterns.md` instead of bare filenames

**`CLAUDE.md`** — Lines 83-92: Replace the manual dispatch table with a note that conventions auto-load. Replace:
```
Detailed conventions live in `docs/conventions/` and are enforced by `.claude/rules/`:

| When touching...    | Read first                                                 |
| ------------------- | ---------------------------------------------------------- |
| Components, UI      | `docs/conventions/base-ui-patterns.md`                     |
| Auth, sessions      | `docs/conventions/auth-patterns.md`                        |
| Forms, Zod, uploads | `docs/conventions/form-patterns.md`                        |
| Server/Client split | `docs/conventions/server-client-split.md`                  |
| Feature UI          | `.planning/DESIGN-REFERENCE.md` + `product-plan/sections/` |
```
With:
```
Conventions auto-load via `.claude/rules/` glob patterns when touching relevant files:

- **Components/UI** — `base-ui-patterns.md`, `server-client-split.md`, `component-implementation.md`
- **Auth/sessions** — `auth-patterns.md`, `server-actions.md`
- **Forms/validation** — `form-patterns.md`, `server-actions.md`
- **Feature UI** — `.planning/DESIGN-REFERENCE.md` + `product-plan/sections/`
```

**`eslint.config.mjs`** — Update 3 comment references (lines ~31, ~35, ~52):
- `docs/conventions/base-ui-patterns.md` -> `.claude/rules/base-ui-patterns.md` (2 occurrences)
- `docs/conventions/auth-patterns.md` -> `.claude/rules/auth-patterns.md` (1 occurrence)

**`src/lib/auth-guard.ts`** — Line 8: Update comment:
- `See docs/conventions/auth-patterns.md.` -> `See .claude/rules/auth-patterns.md.`
  </action>
  <verify>
    <automated>! grep -r "docs/conventions" --include="*.md" --include="*.ts" --include="*.tsx" --include="*.mjs" CLAUDE.md .claude/rules/ src/ eslint.config.mjs 2>/dev/null && echo "PASS: no remaining references" || echo "FAIL: found remaining references"</automated>
  </verify>
  <done>Zero references to docs/conventions/ remain in CLAUDE.md, .claude/rules/, src/, or eslint.config.mjs. All 6 files updated with correct .claude/rules/ paths. The only remaining references to docs/conventions/ are in .planning/ files (historical context, intentionally left as-is).</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

No trust boundaries affected. This is a documentation/tooling migration with no runtime code changes beyond comment updates.

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-quick-01 | I (Info Disclosure) | .claude/rules/ files | accept | Rules files contain coding patterns, not secrets. Already in git. |
</threat_model>

<verification>
1. All 4 convention files exist in .claude/rules/ with valid glob frontmatter
2. docs/conventions/ directory no longer exists
3. `grep -r "docs/conventions" CLAUDE.md .claude/rules/ src/ eslint.config.mjs` returns no matches
4. `npm run build` passes (no broken imports from comment changes)
5. `npm test` passes (no test regressions)
</verification>

<success_criteria>
- 4 convention files in .claude/rules/ with appropriate glob frontmatter
- 0 references to docs/conventions/ in active codebase files (CLAUDE.md, .claude/rules/, src/, eslint.config.mjs)
- docs/conventions/ directory deleted
- Build and tests pass
</success_criteria>

<output>
After completion, create `.planning/quick/260407-ozt-migrate-docs-conventions-to-claude-rules/260407-ozt-SUMMARY.md`
</output>

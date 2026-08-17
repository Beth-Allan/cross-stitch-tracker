# Phase 35: Error Handling & Comment Cleanup - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-01
**Phase:** 35-error-handling-comment-cleanup
**Areas discussed:** Loading skeleton comments, Component section markers, processAndStoreImage failure logging, Already-fixed items scope, Chart form WHAT-comments

---

## Loading Skeleton Comments

| Option | Description | Selected |
|--------|-------------|----------|
| Keep them | Skeleton files are an exception — no meaningful element names, comments serve as only readable labels. Document exception in comment-conventions.md. | ✓ |
| Remove them | Strict compliance — remove all JSX markers. Tailwind classes should speak for themselves. | |
| You decide | Let Claude choose based on codebase context | |

**User's choice:** Keep them
**Notes:** Exception applies to all loading.tsx files, not just app/ route directories. Simple rule, easy to enforce.

### Follow-up: JSX Comment Scope

| Option | Description | Selected |
|--------|-------------|----------|
| All loading.tsx files | Any file named loading.tsx gets the exception | ✓ |
| Only app/ route loading files | Narrower — only Next.js route-level loading skeletons | |

### Follow-up: JSX Comments Total Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Remove all JSX comments | SC2 says zero remain. Biggest batch but purely mechanical. | ✓ |
| Remove obvious markers only | Remove section dividers, keep column labels and structural labels | |
| Original ~20 only | Stick to originally-estimated markers | |

### Follow-up: Why Comments in JSX

| Option | Description | Selected |
|--------|-------------|----------|
| Keep JSX 'why' comments | Convention allows 'why' comments everywhere | |
| Remove all JSX comments | Zero means zero — relocate 'why' explanations to // comments above JSX return block | |

**User's choice:** Asked "What is the best practice for a senior level web dev here?"
**Notes:** Recommended relocating "why" comments to `// ...` above the code. User confirmed this approach.

---

## Component Section Markers

| Option | Description | Selected |
|--------|-------------|----------|
| Remove all | Convention is clear — type-bundle files only. IDE features for navigation instead. | ✓ |
| Keep in multi-component files | Files with 3+ components benefit from visual separation | |
| You decide | Let Claude judge based on file complexity | |

**User's choice:** Remove all

### Follow-up: Function Body Markers

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, remove all | Function body markers are explicitly banned. Same treatment. | ✓ |
| Split the file instead | If it needs 5 sections, it might be too complex for one file. | |

**User's choice:** Yes, remove all
**Notes:** calculator-settings-bar.tsx has 5 markers including inside function bodies — all to be removed.

---

## processAndStoreImage Failure Logging

| Option | Description | Selected |
|--------|-------------|----------|
| Add console.warn at call sites | Log 'Image optimization skipped' at each call site. Function already logs the error internally. | ✓ |
| Also toast the user | Show non-blocking toast that image may load slower | |
| Leave as-is | Function already logs internally — call-site logging is redundant | |

**User's choice:** Add console.warn at call sites

---

## Already-Fixed Items Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Sweep + close | Quick grep for remaining .catch patterns, fix new ones found, close already-fixed items. | ✓ |
| Just fix 999.55 and close | Fix processAndStoreImage call sites, verify and close 999.50-.54. | |
| Deep audit | Systematic review of every catch/error path in every action file. | |

**User's choice:** Sweep + close
**Notes:** Sweep revealed ~59 bare catch blocks. Two patterns: ~40 server-action catches (need console.error) and ~15-20 localStorage guards (leave alone).

### Follow-up: Catch Block Pattern

| Option | Description | Selected |
|--------|-------------|----------|
| Fix server-action catches, keep localStorage | Add console.error to server action catches. Leave localStorage guards alone. | ✓ |
| Fix all catches | Every bare catch gets logging, including localStorage | |
| Defer to Phase 36+ | Add 59 catches to backlog | |

### Follow-up: Error Parameter

| Option | Description | Selected |
|--------|-------------|----------|
| Add error parameter | Change `catch {` to `catch (error) {` and log error. Full diagnostic value. | ✓ |
| Static message only | Keep `catch {` and add console.error with static message | |

---

## Chart Form WHAT-Comments

| Option | Description | Selected |
|--------|-------------|----------|
| Remove WHAT, keep genuine WHY | Delete labels like '// Supply state'. Keep comments explaining non-obvious constraints. | ✓ |
| Remove all | Code should speak for itself | |
| You decide per comment | Let Claude judge each comment | |

### Follow-up: Test File Sweep Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Sweep all test files | Check every test file for section markers and WHAT-comments. Zero tolerance. | ✓ |
| Originally-scoped only | Just fix 999.56 and 999.57 targets | |

---

## Claude's Discretion

- Ordering of cleanup within plans (error handling first vs. comments first)
- Grouping strategy for the ~334 JSX comment removals
- Per-comment judgment on borderline WHAT/WHY comments in chart form

## Deferred Ideas

None — discussion stayed within phase scope

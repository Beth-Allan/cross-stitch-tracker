# Phase 35: Error Handling & Comment Cleanup - Context

**Gathered:** 2026-07-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Fix remaining silent error patterns so every catch block provides diagnostic information, and remove all comment convention violations (JSX markers, section markers, WHAT-comments) from the codebase. This is a code quality cleanup phase — no new features or capabilities.

Requirements: QUAL-01, QUAL-02, QUAL-03.

</domain>

<decisions>
## Implementation Decisions

### Error Handling (QUAL-01)

- **D-01:** Many original QUAL-01 targets (999.50, .51, .53, .54) were already fixed in Phase 30. Phase 35 verifies these are closed and sweeps for other silent patterns.
- **D-02:** ~40 bare `catch {}` blocks around server action calls across component files need `console.error(error)` added. Change `catch {` to `catch (error) {` with `console.error("Action failed:", error)` for diagnostic trail.
- **D-03:** localStorage try/catch guards (`try { localStorage.getItem } catch {}`) are intentionally silent — leave them as-is. localStorage can be unavailable in SSR, privacy mode, or quota exceeded.
- **D-04:** `processAndStoreImage` call sites (upload-actions.ts, session-actions.ts create/update): when `result.success === false`, add `console.warn("Image optimization skipped for [entity] — using raw image")` at each call site. The function already logs the actual error internally. No user-facing toast — raw image is preserved and usable.
- **D-05:** After fixing, verify backlog items 999.50, 999.51, 999.53, 999.54, 999.55 can be closed.

### JSX Comment Cleanup (QUAL-02)

- **D-06:** Remove ALL `{/* ... */}` JSX comments from render blocks in TSX files. Zero tolerance — SC2 requires zero remaining.
- **D-07:** Exception: `loading.tsx` files (any file named `loading.tsx`). These are pure skeleton markup with no code logic — JSX comments serve as the only readable labels. Document this exception in `.claude/rules/comment-conventions.md`.
- **D-08:** Genuine "why" comments currently in JSX format (`{/* ... */}`) should be relocated to `// ...` comments above the relevant code, not deleted. Only true section-label markers are removed outright.
- **D-09:** The original ~20 estimate was wrong — actual count is ~334 JSX comments (excluding loading.tsx). This is a larger scope but purely mechanical.

### Section Markers & WHAT-Comments (QUAL-03)

- **D-10:** Remove ALL `// ─── Section ───` markers from component files (non-type-bundle). Affected: fabric-requirements-tab.tsx, storage-view-tab.tsx, supplies-tab.tsx, overview-tab.tsx, calculator-settings-bar.tsx, log-session-modal.tsx. The convention only allows these in type-bundle files.
- **D-11:** Remove ALL `// ─── Section ───` markers from test files. `describe` blocks provide structure in test files — section markers are redundant. Affected: shopping-list.test, supply-table tests, inline-supply-create.test, calculator-card.test, gallery-utils.test, sticky-save-bar.test.
- **D-12:** Chart form WHAT-comments (~20 in chart-merged-form.tsx and use-chart-form.ts): remove pure WHAT-comments (e.g., `// Supply state`, `// Dirty tracking`). Keep genuine WHY-comments that explain non-obvious constraints (e.g., stale closure ref pattern). Judge each individually.
- **D-13:** Sweep ALL test files for remaining section markers and WHAT-comments, not just originally-scoped 999.56/999.57 targets.

### Claude's Discretion

- Ordering of cleanup within plans (error handling first vs. comments first)
- Grouping strategy for the ~334 JSX comment removals (by file, by feature area, etc.)
- Judgment on borderline WHAT/WHY comments in chart form

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Comment Conventions
- `.claude/rules/comment-conventions.md` — Defines what's allowed vs. not allowed for comments. Will need the loading.tsx exception added (D-07).

### Codebase Analysis
- `.planning/codebase/CONVENTIONS.md` — Current error handling patterns, comment conventions, import conventions
- `.planning/codebase/CONCERNS.md` — Lists all silent error handling patterns and comment violations with locations

### Requirements
- `.planning/REQUIREMENTS.md` — QUAL-01, QUAL-02, QUAL-03 definitions with backlog item references

</canonical_refs>

<code_context>
## Existing Code Insights

### Silent Failure Locations (QUAL-01)
- **Already fixed** (Phase 30): `log-session-modal.tsx` (3 catches), `upload-actions.ts:155` (.catch), `charts/[id]/page.tsx` (.catch)
- **Still needs fix**: `processAndStoreImage` call sites at upload-actions.ts:146, session-actions.ts:91, session-actions.ts:196
- **Newly discovered**: ~40 bare `catch {}` blocks around server action calls in component files (shopping, genres, designers, charts, storage, supplies, fabric, apps, stats)
- **Intentionally silent**: ~15-20 localStorage guards (shopping-cart, use-gallery-filters, use-draft-persistence, back-to-gallery-link)

### JSX Comment Locations (QUAL-02)
- **loading.tsx files** (~30 markers): Exempt per D-07
- **Shell components** (sidebar.tsx, top-bar.tsx): ~17 markers
- **Supply table** (supply-table-data-row.tsx, supply-table.tsx): ~10 markers
- **Shopping** (shopping-list-tab.tsx): 2 markers
- **Other** (supplies/page.tsx, chart.tsx, portal-autocomplete.tsx, etc.): scattered

### Section Marker Locations (QUAL-03)
- **Component files**: 6 files with `// ─── ... ───` markers (16 total markers)
- **Test files**: 7 test files with section markers (~20 total markers)
- **Chart form WHAT-comments**: ~20 in chart-merged-form.tsx + use-chart-form.ts

### Established Patterns
- Server action error handling convention: `{ success: true, data } | { success: false, error }` — actions return errors, don't throw
- Client catch pattern: `catch { toast.error("...") }` — toast for user, but missing console.error for diagnostics
- Comment convention already documented in `.claude/rules/comment-conventions.md`

</code_context>

<specifics>
## Specific Ideas

- The ~40 server-action catch blocks should follow the pattern: `catch (error) { console.error("Action description failed:", error); toast.error("..."); }`
- For processAndStoreImage: `console.warn` (not `console.error`) since the function already logged the error — the call site log is just noting "optimization was skipped"
- JSX "why" comments should be relocated to `// ...` above the code, not deleted
- Update `.claude/rules/comment-conventions.md` to document the loading.tsx exception

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 35-Error Handling & Comment Cleanup*
*Context gathered: 2026-07-01*

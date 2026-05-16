# Phase 14: Edit Mode & Cleanup - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-16
**Phase:** 14-edit-mode-cleanup
**Areas discussed:** Edit form boundary, After-save experience, Gallery card edit access, Cleanup removal order

---

## Edit Form Boundary

| Option | Description | Selected |
|--------|-------------|----------|
| Manage Supplies link | Replace the milestone marker area with a link to the project detail Supplies tab. Same position, clear message. | ✓ |
| Hide entirely | Form just ends at the last field group. No mention of supplies at all. | |
| Read-only supply count + link | Show "45 threads, 3 beads — Manage on project detail" with a link. More informative but needs extra data. | |
| Keep marker but disabled + tooltip | Disabled UI with tooltip explaining to use project detail. | |

**User's choice:** Manage Supplies link (recommended option)
**Notes:** Link to `/charts/[chartId]?tab=supplies`. Maintains visual continuity without dead UI.

---

## After-Save Experience

| Option | Description | Selected |
|--------|-------------|----------|
| Project detail + toast | Redirect to /charts/[id] with toast.success("Changes saved"). Consistent with existing patterns. | ✓ |
| Project detail only | Redirect to /charts/[id] without an explicit toast. | |
| Stay on form + toast | Stay on the edit page with a success toast. User navigates away manually. | |
| router.back() | Navigate back to previous page. Fragile in App Router. | |

**User's choice:** Project detail + success toast (recommended option)
**Notes:** Matches existing feedback patterns across the app.

---

## Gallery Card Edit Access

| Option | Description | Selected |
|--------|-------------|----------|
| Kebab on list rows + detail hero | Table/list rows get a kebab menu (Edit + Delete). Gallery card grid stays clean — users go through project detail to edit. Matches DesignOS. | ✓ |
| Add kebab to gallery cards | Add a ⋮ overflow menu to each gallery card with Edit and Delete. One-click edit from any view. | |
| Cards to detail only | No kebab anywhere in browse views. All editing starts from the project detail hero Edit button. | |

**User's choice:** Kebab on list rows + detail hero (recommended option)
**Notes:** Gallery cards are reused in Dashboard/Pattern Dive — action chrome inappropriate there. DesignOS shows no actions on cards. ROADMAP success criteria should be updated from "gallery card kebab menu" to "list-row kebab menu."

---

## Cleanup Removal Order

| Option | Description | Selected |
|--------|-------------|----------|
| Three plans | Plan 1: delete 12 dead files (zero imports). Plan 2: build edit mode. Plan 3: delete modal + update importers. Each verifies the build. | ✓ |
| Two plans | Plan 1: build edit mode. Plan 2: delete everything at once after edit works. | |
| Single plan | One plan does it all — build edit mode, then delete deprecated files in the same plan's task list. | |
| Interleaved | Delete each deprecated file immediately after its replacement is wired up. | |

**User's choice:** Three plans (recommended option)
**Notes:** Dependency graph naturally splits into Group A (deletable now, zero imports) and Group B (blocked on edit mode rewiring). Three plans keeps each step bisectable.

---

## Claude's Discretion

- ChartMergedForm prop interface for edit mode (likely `initialData?: ChartWithProject`)
- Kebab menu component implementation (inline vs. extracted)
- "Manage Supplies" link styling
- Whether to extract delete confirmation dialog for reuse
- Test strategy for edit form
- Unsaved changes guard approach

## Deferred Ideas

- Supply takeover in edit mode — explicitly out of scope per REQUIREMENTS.md
- Gallery card kebab menu — excluded per DesignOS spec, cards reused in non-action contexts

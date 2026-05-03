# Requirements: Cross Stitch Tracker

**Defined:** 2026-05-03
**Core Value:** A stitcher can manage their entire chart collection and supplies faster and more pleasantly than Notion, with comprehensive statistics that make tracking feel rewarding.

## v1.3 Requirements

Requirements for Form & Supply Overhaul milestone. Each maps to roadmap phases.

### Supply Table

- [ ] **SUPTBL-01**: User sees supplies grouped in Thread/Beads/Specialty sections with divider headers and count badges
- [ ] **SUPTBL-02**: User can add supplies via a persistent add row at the top of the table with a segmented type toggle that stays sticky between adds
- [ ] **SUPTBL-03**: User can add supplies via keyboard-first flow (type code → autocomplete → Enter → qty → Enter to commit, Escape to reset, Tab to override)
- [ ] **SUPTBL-04**: User sees proportional SVG donut rings showing have/need ratio for each supply row

### Supply Data Entry

- [ ] **SUPENT-01**: User searches supplies via portal autocomplete dropdown that escapes table stacking context, with already-added items shown as disabled
- [ ] **SUPENT-02**: User sees thread need auto-calculated from stitch count (live, with visual indicator), with manual override supported
- [ ] **SUPENT-03**: User can click to edit stitches, need, and have values inline on existing supply rows
- [ ] **SUPENT-04**: User can delete a supply row via hover-revealed delete button (no confirmation modal)

### Merged Form

- [ ] **FORM-01**: User creates a chart+project via a single continuous page (720px max-width) with field groups separated by dividers — no chart/project split
- [ ] **FORM-02**: User selects pattern type via 2x2 card grid (Chart Only, Kit, Digital Only, Subscription) with expandable sub-fields
- [ ] **FORM-03**: User sees a sticky save bar at the bottom with Save Draft and Create buttons
- [ ] **FORM-04**: User sees green dot indicators on required fields (Chart Name, Status) — no "optional" labels elsewhere
- [ ] **FORM-05**: User can upload a digital working copy early in the form flow (Workflow section)

### Supply Takeover

- [ ] **TAKE-01**: User transitions from form to supply mode via milestone marker — form collapses to sticky summary bar, supply table fills the page
- [ ] **TAKE-02**: User can return to form details via "← Details" link in the summary bar with all form state preserved
- [ ] **TAKE-03**: User can optionally assign fabric as the first step in the supply takeover area, which auto-populates skein calculator defaults
- [ ] **TAKE-04**: User configures skein calculation via a styled card with segmented controls (Strands Over, Fabric Count, Waste %) in the supply area

### Project Detail Integration

- [ ] **DETAIL-01**: User manages supplies on the project detail Supplies tab using the same unified supply table (view + add in one surface)
- [ ] **DETAIL-02**: User can add missed supplies on project detail via the persistent add row without navigating away

### Edit Mode

- [ ] **EDIT-01**: User edits an existing chart/project via the same merged form layout as creation (full-page, not modal)
- [ ] **EDIT-02**: User navigates to edit from existing entry points (project detail, gallery card kebab menu)

### Cleanup

- [ ] **CLEAN-01**: Deprecated components removed (old chart form, old supply tab, old supply row components, edit modal)

## Future Requirements

Deferred to v1.4+ milestones.

### Statistics & Goals (v1.4)

- **STAT-01**: Comprehensive statistics engine (daily/weekly/monthly/yearly metrics)
- **STAT-02**: Monthly stitch bar charts and stitching calendar view
- **STAT-03**: Year in Review tab with 8 stat sections and year selector
- **STAT-04**: Personal bests (most stitches in a day, longest streak, records)
- **GOAL-01**: Goal tracking (project-specific and global, milestone targets, frequency goals)
- **GOAL-02**: Scheduling plans (project start dates, recurring stitching days, seasonal focus)
- **GOAL-03**: Multi-style rotation management (Focus+Rotate, Milestone, Daily, Round Robin, Random, Seasonal)
- **GOAL-04**: Achievement trophy case with auto-tracked milestones, streaks, and records

## Out of Scope

Explicitly excluded from v1.3. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Drag-and-drop row reordering | Not needed for transcription workflow; adds complexity |
| Auto-save | Explicit save via sticky bar; auto-save complicates error recovery |
| "Have" quantity in add row | Adding is for transcription from pattern; "have" is a separate shopping workflow |
| Tabs for supply types | All types must be visible in one scrolling surface per sketch findings |
| Progressive reveal / step indicators | Rejected in sketch 001 — too guided for bulk data entry |
| Supply takeover in edit mode | Edit form uses merged layout; supply management for existing projects lives on project detail Supplies tab |
| Mobile-specific supply table layout | Desktop-first for v1.3; mobile supply entry continues via existing patterns until future milestone |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| SUPTBL-01 | — | Pending |
| SUPTBL-02 | — | Pending |
| SUPTBL-03 | — | Pending |
| SUPTBL-04 | — | Pending |
| SUPENT-01 | — | Pending |
| SUPENT-02 | — | Pending |
| SUPENT-03 | — | Pending |
| SUPENT-04 | — | Pending |
| FORM-01 | — | Pending |
| FORM-02 | — | Pending |
| FORM-03 | — | Pending |
| FORM-04 | — | Pending |
| FORM-05 | — | Pending |
| TAKE-01 | — | Pending |
| TAKE-02 | — | Pending |
| TAKE-03 | — | Pending |
| TAKE-04 | — | Pending |
| DETAIL-01 | — | Pending |
| DETAIL-02 | — | Pending |
| EDIT-01 | — | Pending |
| EDIT-02 | — | Pending |
| CLEAN-01 | — | Pending |

**Coverage:**
- v1.3 requirements: 22 total
- Mapped to phases: 0
- Unmapped: 22 ⚠️

---
*Requirements defined: 2026-05-03*
*Last updated: 2026-05-03 after initial definition*

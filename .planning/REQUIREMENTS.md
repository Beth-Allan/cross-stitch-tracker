# Requirements: Cross Stitch Tracker

**Defined:** 2026-04-11
**Core Value:** A stitcher can manage their entire chart collection and supplies faster and more pleasantly than Notion, with comprehensive statistics that make tracking feel rewarding.

## v1.1 Requirements

Requirements for Milestone 2: Browse & Organize. Each maps to roadmap phases.

### Gallery & Browsing

- [ ] **GLRY-01**: User can browse charts as gallery cards with cover images and status-specific footer content
- [ ] **GLRY-02**: Gallery cards show contextual footers per status group (WIP: progress/supplies, Unstarted: kitting dots, Finished: celebration border)
- [ ] **GLRY-03**: User can switch between gallery, list, and table view modes (persisted in URL)
- [ ] **GLRY-04**: User can sort charts by name, designer, status, size, stitch count, and date added
- [ ] **GLRY-05**: User can search charts by name and filter by status and size category

### Storage & Reference

- [ ] **STOR-01**: User can create, rename, and delete storage locations
- [ ] **STOR-02**: User can view a storage location's detail page with assigned projects
- [ ] **STOR-03**: User can assign storage location and stitching app to a project via dropdown
- [ ] **STOR-04**: User can create, rename, and delete stitching app entries

### Project Setup

- [ ] **PROJ-01**: User can link an unassigned fabric to a project from the project form
- [ ] **PROJ-02**: Cover images display with correct aspect ratio without cropping distortion

### Stitch Tracking

- [ ] **CALC-01**: User can enter stitch count per colour when linking threads to a project
- [ ] **CALC-02**: App auto-calculates skeins needed from fabric count, strand count, and 20% waste factor
- [ ] **CALC-03**: User can manually override auto-calculated skein quantities
- [ ] **CALC-04**: Per-colour stitch counts sum to display project total stitch count
- [ ] **CALC-05**: User can set strand count per project (default: 2)

### Supply Management

- [ ] **SUPP-01**: Supply entries maintain insertion order during data entry
- [ ] **SUPP-02**: Thread colour picker auto-scrolls to keep search/add controls visible
- [ ] **SUPP-03**: DMC thread catalog includes all standard colours (filling ~30 gaps plus Blanc)

## v1.2+ Requirements

Deferred to future milestones. Tracked but not in current roadmap.

### Browse Enhancements

- **BRWS-01**: Reusable advanced filter bar with 12 configurable dimensions and dismissible chips
- **BRWS-02**: Series/collection management with completion tracking

### Stitch Tracking Enhancements

- **CALC-06**: Stitch type breakdowns in skein calculator (backstitch, french knots affect thread usage differently)

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Full AdvancedFilterBar (12 dimensions) | Depends on series/kitting data not yet built; basic search + status/size covers 80% of browsing needs |
| Auto-calculated kitting status | 8-condition composite is complex; deferred per PROJECT.md decision |
| Collapsible shopping list projects | Shopping list UX improvement, not a browse & organize feature |
| Inline card editing | Breaks click-through-to-detail model; cards already information-dense |
| Drag-and-drop card reordering | No clear user request; sort options sufficient at 500+ charts |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| GLRY-01 | — | Pending |
| GLRY-02 | — | Pending |
| GLRY-03 | — | Pending |
| GLRY-04 | — | Pending |
| GLRY-05 | — | Pending |
| STOR-01 | — | Pending |
| STOR-02 | — | Pending |
| STOR-03 | — | Pending |
| STOR-04 | — | Pending |
| PROJ-01 | — | Pending |
| PROJ-02 | — | Pending |
| CALC-01 | — | Pending |
| CALC-02 | — | Pending |
| CALC-03 | — | Pending |
| CALC-04 | — | Pending |
| CALC-05 | — | Pending |
| SUPP-01 | — | Pending |
| SUPP-02 | — | Pending |
| SUPP-03 | — | Pending |

**Coverage:**
- v1.1 requirements: 19 total
- Mapped to phases: 0
- Unmapped: 19

---
*Requirements defined: 2026-04-11*
*Last updated: 2026-04-11 after initial definition*

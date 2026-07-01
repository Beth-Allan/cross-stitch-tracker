# Requirements: Cross Stitch Tracker

**Defined:** 2026-07-01
**Core Value:** A stitcher can manage their entire chart collection and supplies faster and more pleasantly than Notion, with comprehensive statistics that make tracking feel rewarding.

## v1.9 Requirements

Requirements for milestone v1.9 Cleanup & Polish. Each maps to roadmap phases.

### Code Quality

- [x] **QUAL-01**: Fix all remaining silent failure patterns (bare catches, swallowed errors) across upload-actions, charts page, log-session-modal, deleteFile, processAndStoreImage (999.50, .51, .53, .54, .55)
- [x] **QUAL-02**: Remove JSX section markers from TSX files (~20 markers) (999.30)
- [x] **QUAL-03**: Remove WHAT-comments and section markers from test and form files (999.56, .57, .84)
- [ ] **QUAL-04**: Narrow strandCount to literal union (1-6) across all type definitions (999.0.23)
- [ ] **QUAL-05**: Replace OptionalFocalPoint plain interface with discriminated union across dashboard types (999.70)
- [ ] **QUAL-06**: Fix SuppliesTab type safety — co-dependent optional props pattern and persistFields narrowing (999.76, .77)
- [ ] **QUAL-07**: Tighten collection types — AggregatedSupply non-empty tuple, shared onUpdateAcquired type alias (999.60, .61)
- [ ] **QUAL-08**: Simplify InlineDesignerDialog to controlled-only mode and fix LocalStateAdapter type assertion (999.71, .75)

### Test Coverage

- [ ] **TEST-01**: Add skein calculator edge case tests (fabricCount=0, resolveDefaultBrandId) and stats action auth/validation tests (999.0.24, .24)
- [ ] **TEST-02**: Add calendar year-rollover, record-detection duplicate-stitch-count, and completion-estimates already-completed filter tests (999.27, .38, .39)
- [ ] **TEST-03**: Fill shopping cart test gaps — aggregated quantity distribution, project expand/collapse, updateSupplyAcquired integration, QuantityControl blur (999.62, .63, .64, .65)
- [ ] **TEST-04**: Add chart form test gaps — seriesId flow-through, handleAddSeries guards, calcParams error/rollback, updateProjectSettings, zip validation (999.78, .79, .80, .81, .82)

### UI/UX Polish

- [ ] **POLISH-01**: Fix ARIA compliance in clickable card rows — refactor to avoid nested interactive elements (999.0.19)
- [ ] **POLISH-02**: Fix visual inconsistencies — What's Next card styling, kitting label at 0%, shopping pill styling (999.8, .9, .12)
- [ ] **POLISH-03**: Fix focal point gaps — BucketProject missing focal point styling, action bar blocking bottom of image (999.18, .20)
- [ ] **POLISH-04**: Fix performance and SSR issues — SupplyOverview useMemo for aggregation, supply catalog SSR hydration (999.58, .72)
- [ ] **POLISH-05**: Fix layout and label issues — chart form gap at top, InlineCreateDialog per-type labels, supplies page first-load flash (999.5, .17, .74)

### Series Polish

- [ ] **SERIES-01**: Fix series bugs — SeriesWithStats designerName null when designer selected, InlineNameDialog "Adding..." hardcoded text (999.83, .85)
- [ ] **SERIES-02**: Improve series display — card-style rows on detail page, series name on project detail and gallery cards (999.86, .87, .88)
- [ ] **SERIES-03**: Add series tab photo previews — chart cover images for each series on Pattern Dive Series tab (999.89)

### Bug Fixes

- [ ] **FIX-01**: Fix fabric matching to include projects without assigned fabric (null fabricCount short-circuits matching) (999.21)
- [ ] **FIX-02**: Improve supply stitch total hint discoverability — show total in SummaryBar or supply mode footer (999.73)

## Future Requirements

Deferred to future release. Tracked but not in current roadmap.

### Features

- **FEAT-F01**: Duplicate chart detection — warn before creating a chart that may already exist (999.0.4)
- **FEAT-F02**: Quick-add missing supplies from project detail page (999.0.10)
- **FEAT-F03**: Collapsible projects in shopping list (999.0.12)
- **FEAT-F04**: SearchToAdd side-by-side layout (999.0.15)
- **FEAT-F05**: Supply detail modal with "used in projects" list (999.1)
- **FEAT-F06**: Bulk supply editor (999.2)
- **FEAT-F07**: Fabric type hierarchy (999.3)
- **FEAT-F08**: Estimated completion dates on project detail and dashboard (999.7)
- **FEAT-F09**: Per-brand skein length on ThreadBrand (999.13)
- **FEAT-F10**: Auto-infer overCount from fabric count (999.14)
- **FEAT-F11**: Auto-status from kitting activity (999.10)
- **FEAT-F12**: StorageLocation/StitchingApp multi-user hardening (999.0.17)
- **FEAT-F13**: Stats from library data without sessions (999.67)
- **FEAT-F14**: StatusGroup per-group deselect toggle (999.59)
- **FEAT-F15**: ThreadInsightList clickable links (999.43)
- **FEAT-F16**: Cover image preview aspect ratio (999.6)

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| New features or capabilities | Cleanup milestone — code health only |
| CompletionEstimate ~ prefix change (999.35) | Already correct — prefix is in component layer, not data |
| Stale quick task cleanup | 14 orphaned GSD artifacts, not code changes |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| QUAL-01 | Phase 35 | Complete |
| QUAL-02 | Phase 35 | Complete |
| QUAL-03 | Phase 35 | Complete |
| QUAL-04 | Phase 36 | Pending |
| QUAL-05 | Phase 36 | Pending |
| QUAL-06 | Phase 36 | Pending |
| QUAL-07 | Phase 36 | Pending |
| QUAL-08 | Phase 36 | Pending |
| TEST-01 | Phase 37 | Pending |
| TEST-02 | Phase 37 | Pending |
| TEST-03 | Phase 38 | Pending |
| TEST-04 | Phase 38 | Pending |
| POLISH-01 | Phase 39 | Pending |
| POLISH-04 | Phase 39 | Pending |
| POLISH-02 | Phase 40 | Pending |
| POLISH-03 | Phase 40 | Pending |
| POLISH-05 | Phase 40 | Pending |
| SERIES-01 | Phase 41 | Pending |
| SERIES-02 | Phase 41 | Pending |
| SERIES-03 | Phase 41 | Pending |
| FIX-01 | Phase 41 | Pending |
| FIX-02 | Phase 41 | Pending |

**Coverage:**
- v1.9 requirements: 22 total
- Mapped to phases: 22
- Unmapped: 0

---
*Requirements defined: 2026-07-01*
*Last updated: 2026-07-01 after roadmap creation*

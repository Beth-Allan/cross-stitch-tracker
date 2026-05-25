# Requirements: Cross Stitch Tracker

**Defined:** 2026-05-24
**Core Value:** A stitcher can manage their entire chart collection and supplies faster and more pleasantly than Notion, with comprehensive statistics that make tracking feel rewarding.

## v1.8 Requirements

Requirements for milestone v1.8 Series & Collections. Each maps to roadmap phases.

### Series

- [ ] **SERIES-01**: User can create a series with name, optional total count, and optional designer link
- [x] **SERIES-02**: User can view all series on a management page with progress indicators
- [ ] **SERIES-03**: User can edit a series (name, total count, designer link)
- [ ] **SERIES-04**: User can delete a series (charts become unassigned, not deleted)
- [x] **SERIES-05**: User can view a series detail page showing assigned charts with dual progress (owned/total + finished/owned)
- [ ] **SERIES-06**: User can assign a chart to a series from the chart form via SearchableSelect with inline "Add New"
- [ ] **SERIES-07**: User can remove a chart's series assignment from the chart form
- [ ] **SERIES-08**: User can browse series via a dedicated Series tab on Pattern Dive showing progress cards
- [ ] **SERIES-09**: User can filter the Browse tab by series
- [ ] **SERIES-10**: User can see dual progress for each series — owned count vs total, and finished count vs owned

### Fixes

- [ ] **FIX-01**: Fix pre-existing TypeScript errors in 3 test files (999.19)
- [ ] **FIX-02**: Separate stats page query groups for resilience (999.22)

## Future Requirements

Deferred to future release. Tracked but not in current roadmap.

### Series Enhancements

- **SERIES-F01**: Stacked/collapsible series cards in Pattern Dive Browse tab
- **SERIES-F02**: Individual gap tracking for missing series entries
- **SERIES-F03**: Bulk chart-to-series assignment for initial data population
- **SERIES-F04**: Series insights in statistics dashboard (completion rates, most-collected designers)

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Series ordering / sequencing | Stitchers don't work series in order — charts are independent |
| Series-level supply aggregation | Supply tracking is per-project, not per-series |
| Series-level session logging | Sessions are per-project, not per-series |
| Nested series hierarchy | Flat list with 30+ series is sufficient; nesting adds complexity |
| Auto-detection of series from chart names | Error-prone; manual assignment is clearer |
| Many-to-many chart-to-series | A chart belongs to at most one series; simplifies data model |
| Stats page series integration | Deferred — pre-wire cache invalidation but no UI in v1.8 |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| SERIES-01 | Phase 31 | Pending |
| SERIES-02 | Phase 32 | Complete |
| SERIES-03 | Phase 31 | Pending |
| SERIES-04 | Phase 31 | Pending |
| SERIES-05 | Phase 32 | Complete |
| SERIES-06 | Phase 33 | Pending |
| SERIES-07 | Phase 33 | Pending |
| SERIES-08 | Phase 34 | Pending |
| SERIES-09 | Phase 34 | Pending |
| SERIES-10 | Phase 31 | Pending |
| FIX-01 | Phase 31 | Pending |
| FIX-02 | Phase 31 | Pending |

**Coverage:**
- v1.8 requirements: 12 total
- Mapped to phases: 12
- Unmapped: 0

---
*Requirements defined: 2026-05-24*
*Last updated: 2026-05-24 after roadmap creation*

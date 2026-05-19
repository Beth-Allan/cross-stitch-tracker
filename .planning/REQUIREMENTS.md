# Requirements: Cross Stitch Tracker

**Defined:** 2026-05-18
**Core Value:** A stitcher can manage their entire chart collection and supplies faster and more pleasantly than Notion, with comprehensive statistics that make tracking feel rewarding.

## v1.6 Requirements

Requirements for v1.6 Cleanup & Hardening. Each maps to roadmap phases.

### Critical Fixes

- [x] **CRIT-01**: Supply actions reject operations when project belongs to a different user
- [ ] **CRIT-02**: Shopping cart scales to 75+ projects with search/filter, status grouping, and supply-type search
- [x] **CRIT-03**: TypeScript errors in dashboard-tabs.test, chart-actions.test, and shopping-cart-actions.test are resolved
- [x] **CRIT-04**: Stats page degrades gracefully when individual queries fail instead of crashing entirely

### Test Coverage

- [x] **TEST-01**: Skein calculator has edge case tests for fabricCount=0 and resolveDefaultBrandId
- [x] **TEST-02**: Test infrastructure uses createMockPrisma() defaults and fixes vacuous assertions for $transaction
- [x] **TEST-03**: Stats actions have tests for requireAuth rejection and Zod boundary violations
- [x] **TEST-04**: StitchingCalendar has tests for Jan-to-Dec and Dec-to-Jan year-rollover navigation
- [x] **TEST-05**: Record detection handles two sessions on same day with identical stitch counts
- [x] **TEST-06**: Completion estimates exclude projects where stitchesCompleted >= totalStitches

### Reliability

- [x] **RELY-01**: Session-actions surface file deletion and photo upload errors instead of silently swallowing them
- [x] **RELY-02**: Stats cache invalidates when chart status changes via updateChartStatus
- [x] **RELY-03**: Stats cache invalidates when supply mutations occur in supply-actions
- [x] **RELY-04**: Session logging validates stitch count does not exceed project total

### Code Quality

- [ ] **QUAL-01**: strandCount type narrowed to literal union 1-6
- [ ] **QUAL-02**: SORT_FIELDS/SORT_DIRS exported from single source, not duplicated
- [ ] **QUAL-03**: MonthLabel and DayLabel use literal union types instead of string
- [ ] **QUAL-04**: Date representation is consistent across stats types
- [ ] **QUAL-05**: DailyBreakdownEntry extends CalendarSession to eliminate structural overlap
- [ ] **QUAL-06**: WHAT-comments removed from Phase 20/21 code (~27 comments)
- [ ] **QUAL-07**: Low-harm JSX section markers removed (~20 comments)
- [ ] **QUAL-08**: Hardcoded emerald-* classes in log-session-modal replaced with semantic tokens
- [ ] **QUAL-09**: PersonalBestRecord refactored to discriminated union eliminating 4 nullable fields
- [ ] **QUAL-10**: BrokenRecordType defined as Exclude<RecordType, "currentStreak">
- [ ] **QUAL-11**: CompletionEstimate ~ prefix moved from data layer to component rendering
- [ ] **QUAL-12**: AvailableYearsData wrapper removed, returning number[] directly
- [ ] **QUAL-13**: Shared buildDateFilter and Scope type extracted from 6 stats query modules
- [ ] **QUAL-14**: Planning doc references cleaned from code comments

### UX Polish

- [ ] **UX-01**: SearchToAdd keyboard highlight only appears after arrow key use
- [ ] **UX-02**: Clickable card rows refactored to avoid nested interactive elements (ARIA)
- [ ] **UX-03**: EditableNumber shows visual indication when input is rejected
- [ ] **UX-04**: Supplies page eliminates first-load view flash
- [ ] **UX-05**: What's Next kitting label shows appropriate text at 0% progress
- [ ] **UX-06**: Shopping-for bar pills match mockup style with squared-off chip design
- [ ] **UX-07**: Supply table add row has visible commit button for mouse-first users
- [ ] **UX-08**: InlineCreateDialog field labels are contextual per supply type
- [ ] **UX-09**: BucketProject cards apply focal point styling from cover images
- [ ] **UX-10**: Focal point action bar repositioned to not block bottom 25% of image
- [ ] **UX-11**: Fabric matching logic handles null fabricCount without short-circuiting
- [ ] **UX-12**: ThreadInsightList items either link to detail page or don't appear clickable
- [ ] **UX-13**: Cover image preview uses correct aspect ratio
- [ ] **UX-14**: What's Next cards use gallery card styling for visual consistency

## Future Requirements

Deferred to future milestone. Tracked but not in v1.6 roadmap.

### Feature Additions

- **FEAT-01**: Duplicate chart detection -- warn before creating a chart that may already exist (999.0.4)
- **FEAT-02**: Quick-add missing supplies from project detail page -- inline creation without navigating away (999.0.10)
- **FEAT-03**: Collapsible projects in shopping list -- collapsed as default state (999.0.12)
- **FEAT-04**: SearchToAdd side-by-side layout -- desktop 2-column grid, mobile overlay fallback (999.0.15)
- **FEAT-05**: StorageLocation/StitchingApp multi-user hardening -- @@unique, ownership validation (999.0.17)
- **FEAT-06**: Supply detail modal -- read-only view with "used in projects" list (999.1)
- **FEAT-07**: Bulk supply editor (999.2)
- **FEAT-08**: Fabric type hierarchy -- replace flat dropdown (999.3)
- **FEAT-09**: Estimated completion dates on project detail and dashboard cards (999.7)
- **FEAT-10**: Auto-status from kitting activity -- auto-transition project status (999.10)
- **FEAT-11**: Per-brand skein length -- skeinLengthMeters on ThreadBrand model (999.13)
- **FEAT-12**: Auto-infer overCount from fabric count (999.14)

### Deferred from PROJECT.md

- Comprehensive year in review tab with 8 stat sections and year selector
- Contextual stats sprinkled into existing pages
- Goal tracking (project-specific and global, milestone targets, frequency goals)
- Scheduling plans (project start dates, recurring stitching days, seasonal focus)
- Multi-style rotation management
- Achievement trophy case with auto-tracked milestones, streaks, and records
- Reusable advanced filter bar with configurable dimensions and dismissible chips
- Series/collection management with completion tracking
- Auto-calculated kitted status and kitting progress indicators
- SAL support (multi-part charts, evolving stitch counts)

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| New data models or schema additions | Cleanup milestone -- no new entities |
| New pages or routes | Fix existing pages, don't add new ones |
| Dependency additions | Quality fixes should use existing stack |
| Multi-user features | Single-user app, not in scope for v1.6 |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| CRIT-01 | Phase 22 | Complete |
| CRIT-02 | Phase 25 | Pending |
| CRIT-03 | Phase 22 | Complete |
| CRIT-04 | Phase 22 | Complete |
| TEST-01 | Phase 23 | Complete |
| TEST-02 | Phase 22 | Complete |
| TEST-03 | Phase 22 | Complete |
| TEST-04 | Phase 23 | Complete |
| TEST-05 | Phase 23 | Complete |
| TEST-06 | Phase 23 | Complete |
| RELY-01 | Phase 23 | Complete |
| RELY-02 | Phase 23 | Complete |
| RELY-03 | Phase 23 | Complete |
| RELY-04 | Phase 23 | Complete |
| QUAL-01 | Phase 24 | Pending |
| QUAL-02 | Phase 24 | Pending |
| QUAL-03 | Phase 24 | Pending |
| QUAL-04 | Phase 24 | Pending |
| QUAL-05 | Phase 24 | Pending |
| QUAL-06 | Phase 24 | Pending |
| QUAL-07 | Phase 24 | Pending |
| QUAL-08 | Phase 24 | Pending |
| QUAL-09 | Phase 24 | Pending |
| QUAL-10 | Phase 24 | Pending |
| QUAL-11 | Phase 24 | Pending |
| QUAL-12 | Phase 24 | Pending |
| QUAL-13 | Phase 24 | Pending |
| QUAL-14 | Phase 24 | Pending |
| UX-01 | Phase 26 | Pending |
| UX-02 | Phase 26 | Pending |
| UX-03 | Phase 26 | Pending |
| UX-04 | Phase 26 | Pending |
| UX-05 | Phase 26 | Pending |
| UX-06 | Phase 26 | Pending |
| UX-07 | Phase 26 | Pending |
| UX-08 | Phase 26 | Pending |
| UX-09 | Phase 26 | Pending |
| UX-10 | Phase 26 | Pending |
| UX-11 | Phase 26 | Pending |
| UX-12 | Phase 26 | Pending |
| UX-13 | Phase 26 | Pending |
| UX-14 | Phase 26 | Pending |

**Coverage:**
- v1.6 requirements: 42 total
- Mapped to phases: 42
- Unmapped: 0

---
*Requirements defined: 2026-05-18*
*Last updated: 2026-05-18 after roadmap creation*

# Requirements: Cross Stitch Tracker

**Defined:** 2026-05-20
**Core Value:** A stitcher can manage their entire chart collection and supplies faster and more pleasantly than Notion, with comprehensive statistics that make tracking feel rewarding.

## v1.7 Requirements

Requirements for v1.7 Fix & Polish. Each maps to roadmap phases.

### Bug Fixes

- [x] **BUG-01**: User can quick-add a designer from the chart form
- [x] **BUG-02**: User can tab into the Designer field on /charts/new and immediately type to search
- [x] **BUG-03**: User can sort supplies by Added order and A-Z on project detail supplies tab
- [x] **BUG-04**: User sees correct chart thumbnails on designer detail pages (/designers/{id})
- [x] **BUG-05**: User sees stitch count auto-calculated from per-colour supply stitch counts
- [x] **BUG-06**: User sees full auto-calculated skeins value (not truncated) when adding supplies in create chart

### Stats Fixes

- [x] **STAT-01**: User sees records tab items (thread stats, personal bests, insights) populated on stats page
- [x] **STAT-02**: Collection breakdown chart axes use integer values for discrete data (designers, genres, collections)
- [x] **STAT-03**: Collection breakdown charts display entity names inline rather than in separate linked lists
- [x] **STAT-04**: User sees total stitches across all projects on the stats page
- [x] **STAT-05**: Days-in-library displays as large prominent number with small "days in library" label

### UI Polish

- [x] **UI-01**: Status and size pills on gallery cards and pattern dive use colored styling instead of grey
- [x] **UI-02**: Gallery cards show indicator when a digital working copy has been uploaded
- [x] **UI-03**: Project supplies card includes skein calculation adjustment controls (count, over 1/2, waste)
- [x] **UI-04**: File upload limit increased to 50MB
- [x] **UI-05**: .zip files accepted as valid upload format for digital working copies

### Code Quality

- [ ] **QUAL-01**: Pre-existing TypeScript errors in test files resolved (dashboard-tabs, chart-actions, shopping-cart-actions)
- [ ] **QUAL-02**: Remaining silent error patterns fixed (.catch(() => {}) in upload-actions, .catch(() => null) in chart page, bare catch in log-session-modal)
- [ ] **QUAL-03**: Old photo cleaned up from R2 when user replaces session photo
- [ ] **QUAL-04**: Status colors centralized as CSS custom properties (replacing scattered Tailwind scales)
- [ ] **QUAL-05**: DEFAULT_SUPPLY_HEX constant extracted (single-sourced from 7+ files)
- [ ] **QUAL-06**: useRejectionFlash hook extracted (deduplicated from two EditableNumber components)

## Future Requirements

Deferred to v1.8+. Tracked but not in current roadmap.

### New Features

- **FEAT-01**: Gallery card sizes (S/M/L) with different info density and size filter
- **FEAT-02**: "Recently Added" dashboard section (5-10 most recently added projects)
- **FEAT-03**: Supply completeness indicator (distinguish "all supplies added" from "still being entered")
- **FEAT-04**: Blended stitches management (one strand each of two colors)
- **FEAT-05**: Back stitch and French knot tracking in supply entry
- **FEAT-06**: Color heat map visualization (popular hex colors across library)
- **FEAT-07**: Stats architecture redesign (consolidate scattered stats across dashboard/stats/project pages)

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Stats consolidation/redesign | Needs design exploration first — deferred to dedicated milestone |
| New supply types (blended, backstitch, knots) | Schema changes + UI design needed — not a fix |
| Gallery card size variants | New feature, not a fix — needs design |
| Multi-user hardening | Single-user app, low priority |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| BUG-01 | Phase 27 | Complete |
| BUG-02 | Phase 27 | Complete |
| BUG-03 | Phase 29 | Complete |
| BUG-04 | Phase 27 | Complete |
| BUG-05 | Phase 27 | Complete |
| BUG-06 | Phase 27 | Complete |
| STAT-01 | Phase 28 | Complete |
| STAT-02 | Phase 28 | Complete |
| STAT-03 | Phase 28 | Complete |
| STAT-04 | Phase 28 | Complete |
| STAT-05 | Phase 28 | Complete |
| UI-01 | Phase 29 | Complete |
| UI-02 | Phase 29 | Complete |
| UI-03 | Phase 29 | Complete |
| UI-04 | Phase 29 | Complete |
| UI-05 | Phase 29 | Complete |
| QUAL-01 | Phase 30 | Pending |
| QUAL-02 | Phase 30 | Pending |
| QUAL-03 | Phase 30 | Pending |
| QUAL-04 | Phase 30 | Pending |
| QUAL-05 | Phase 30 | Pending |
| QUAL-06 | Phase 30 | Pending |

**Coverage:**
- v1.7 requirements: 22 total
- Mapped to phases: 22
- Unmapped: 0

---
*Requirements defined: 2026-05-20*
*Last updated: 2026-05-21 after roadmap creation*

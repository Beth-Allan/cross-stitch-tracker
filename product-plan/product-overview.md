# Cross Stitch Tracker — Product Overview

## Summary

A personal cross stitch project management application that replaces a complex Notion-based system. It tracks charts and projects through their entire lifecycle — from acquisition through kitting, stitching, completion, and finishing — along with supply inventory, stitching statistics, and auto-generated shopping lists. Built single-user first but multi-user aware.

## Planned Sections

1. **Project Management** — Full chart and project CRUD with rich metadata, digital working copy uploads, designer and genre management, customizable status system, SAL and series support, and basic gallery/list/table views with filtering.
2. **Supply Tracking & Shopping** — Thread, bead, and specialty item databases with pre-seeded DMC catalog, project-to-supply linking with per-project quantities, auto-generated shopping lists, and auto-calculated kitting status with progress indicators.
3. **Stitching Sessions & Statistics** — Quick stitch session logging, auto-updating project progress, comprehensive statistics engine with daily/weekly/monthly/yearly metrics, monthly stitch bar charts, stitching calendar view, session history, and year-in-review summaries.
4. **Fabric, Series & Reference Data** — Fabric CRUD with brand management, designer browsing with stats and detail modals, series/collection management with completion tracking, and user-created storage location management.
5. **Gallery Cards & Advanced Filtering** — Shared gallery card system with three status-specific card layouts (WIP, Unstarted, Finished) and a reusable advanced filter bar with configurable dimensions, dismissible chips, and view mode toggling.
6. **Dashboards & Views** — Main Dashboard (library-style home screen), Pattern Dive (deep library browser with filtering, fabric requirements, and storage views), Project Dashboard (active work tracking with goals and milestones), and Shopping Cart (aggregated supply and fabric needs across projects).
7. **Goals & Plans** — Goal tracking, scheduling plans, multi-style rotation management, and auto-tracked achievement trophy case. Integrates with Project Detail for inline goal/plan management.

## Product Entities

- **Chart** — A cross stitch design/pattern with metadata (designer, stitch count, dimensions, cover image, genre tags, series, pattern type)
- **Project** — A user's instance of working on a chart (status, progress, fabric, supplies, sessions, goals)
- **Designer** — A pattern designer or company (name, website, linked charts)
- **Genre** — Tag for classifying charts (Animals, Beach, Canada, etc.)
- **Series** — Named collection of related charts with completion tracking
- **SALPart** — Installment of a Stitch-Along chart (part number, PDF, release date)
- **Thread** — Embroidery thread record, pre-seeded with DMC catalog (~500 colours)
- **Bead** — Glass bead record (Mill Hill, etc.)
- **SpecialtyItem** — Metallic threads, braids, etc. (Kreinik, etc.)
- **ProjectThread/ProjectBead/ProjectSpecialty** — Junction records linking supplies to projects with quantities
- **StitchSession** — Session log entry (date, stitch count, optional photo, optional time)
- **Fabric** — Fabric inventory (brand, count, type, colour, dimensions, linked project)
- **FabricBrand** — Fabric manufacturer
- **StorageLocation** — Physical storage location for organizing project kits and fabric

## Design System

**Colours:**
- Primary: `emerald` — navigation, progress, structure
- Secondary: `amber` — CTAs, interactive moments, warnings
- Neutral: `stone` — backgrounds, text, borders

**Typography:**
- Heading: Fraunces (serif)
- Body: Source Sans 3 (sans-serif)
- Mono: JetBrains Mono (hero stats and progress percentages only)

**Status Colours:**
Unstarted=stone, Kitting=amber, Kitted=emerald, In Progress=sky, On Hold=orange, Finished=violet, FFO=rose

## Implementation Sequence

Build this product in milestones:

1. **Shell** — Set up design tokens and application shell (sidebar + top bar navigation)
2. **Project Management** — Core chart/project CRUD with gallery views and filtering
3. **Supply Tracking & Shopping** — Supply catalog, project linking, kitting status
4. **Stitching Sessions & Statistics** — Session logging, stats dashboard, year in review
5. **Fabric, Series & Reference Data** — Fabric inventory, designers, series, storage locations
6. **Gallery Cards & Advanced Filtering** — Shared card system and reusable filter bar
7. **Dashboards & Views** — Main Dashboard, Pattern Dive, Project Dashboard, Shopping Cart
8. **Goals & Plans** — Goals, plans, rotations, achievements, Project Detail integration

Each milestone has a dedicated instruction document in `instructions/incremental/`.

## Settings (Not Designed — Implementation Decisions)

The app needs a Settings page. Things that should be configurable:
- Fabric margin size (currently 3" per side in all designs)
- Default view mode preference (cards/list/table)
- Stitching hours tracking on/off (hours are nullable throughout)
- Theme preference (light/dark/system)
- User profile (name, avatar)

Settings is a standard form page — no UI design was created for it.

## Deferred (Post-MVP)

- Social media share card generation
- PWA offline support
- Multi-user account architecture
- Import/export functionality

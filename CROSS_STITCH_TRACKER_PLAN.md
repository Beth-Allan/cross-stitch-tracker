# Cross Stitch Tracker — Project Planning Document

> **Status:** Discovery complete. Tech stack finalized. Ready for Phase 1 development.
> **Last Updated:** 2026-03-20
> **Repository:** github.com/Beth-Allan/cross_stitch_tracker

---

## Table of Contents

- [1. Project Overview](#1-project-overview)
- [2. User Context](#2-user-context)
- [3. Domain Glossary](#3-domain-glossary)
- [4. Core Feature Areas](#4-core-feature-areas)
- [5. Detailed Requirements](#5-detailed-requirements)
- [6. Conceptual Data Model](#6-conceptual-data-model)
- [7. Views & Dashboard Requirements](#7-views--dashboard-requirements)
- [8. Phased Build Plan](#8-phased-build-plan)
- [9. Tech Stack](#9-tech-stack)
- [10. Future Considerations](#10-future-considerations)
- [11. Open Questions](#11-open-questions)

---

## 1. Project Overview

### What Is This?

A personal cross stitch project management application that replaces a complex Notion-based system. The app tracks cross stitch charts/projects through their entire lifecycle — from acquisition through kitting, stitching, completion, and finishing — along with supply inventory, stitching statistics, and shopping lists.

### Why Build It?

The current Notion system has ~50+ fields per project, multiple related databases, and complex formula-driven views. Notion is buckling under this weight: it's slow, clunky, expensive, aesthetically limited, and requires constant workarounds. A custom-built application can provide a faster, more capable, purpose-built experience.

### Core Goals

1. **Chart & Project Management** — Full CRUD with rich metadata, file storage for digital working copies, flexible statuses, support for SALs and series/collections
2. **Supply Tracking & Shopping** — Three supply types (thread, beads, specialty), linked to projects with per-project quantities, auto-generated shopping lists
3. **Stitching Session Logging & Statistics** — Quick daily logging with a rich statistics engine calculating everything from daily averages to yearly summaries
4. **Flexible, Customizable Dashboards** — Multiple view types (gallery, list, table), strong filtering, and ideally draggable/customizable widgets

### Design Principles

- **Single-user first, multi-user aware:** Build for one user now, but make architectural choices that don't preclude opening up to additional users later. Keep tracking flexible — different stitchers have different workflows.
- **Speed and usability over feature count:** The new system must feel faster and more pleasant than Notion from day one.
- **Data-rich but not data-entry-heavy:** Pre-seed reference data (DMC catalog, etc.), use smart defaults, and minimize friction for common actions like logging stitches.
- **Comprehensive statistics:** Track and calculate as many stats as possible — this is a key motivator for the user.

---

## 2. User Context

### Primary User Profile

- Dedicated cross stitcher with 500+ charts in various stages of readiness
- Typically stitches one project at a time, but may rotate; wants to support any workflow
- Works from a variety of pattern types: kits, digital charts, paper charts, SALs, series
- Uses Mac and iPhone; browser-based or iOS-compatible solutions are ideal
- Uses iPad cross stitch apps (Markup R-XP, Saga, etc.) for stitching, logging stitch counts there
- Comfortable with technology and wants a powerful, well-designed tool — not a dumbed-down version
- Has experience with Claude Code and has built a web database application previously
- Currently tracks everything in a comprehensive Notion system with multiple related databases

### Current Workflow Pain Points

- Notion is slow and gets "cranky" with large databases
- Formulas in Notion are hard to write and maintain
- Adding supplies (linking DMC colors, beads, etc.) is tedious and manual
- Can't customize appearance (colors, layout) meaningfully
- Constantly working "in spite of" Notion rather than feeling supported by it
- No easy way to share stats or progress on social media
- Notion is getting more expensive

### Current Stitching Session Flow

1. Finish a stitching session on iPad app
2. Check stitch count in the app's stats
3. Open Notion
4. Click "+ Track Stitches" button
5. Date auto-fills (can be changed for backfilling)
6. Select the project via relation
7. Enter stitch count
8. Optionally add progress photo and time spent

---

## 3. Domain Glossary

These terms have specific meanings in the cross stitch world and in this project. This glossary should be referenced during development to ensure the data model and UI use correct terminology.

| Term                     | Definition                                                                                                                                                                                                                                                                                                                                                                                          |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Chart / Pattern**      | The design/instructions for a cross stitch project. Can be digital (PDF), paper, or part of a kit. Used somewhat interchangeably with "project" in early stages, but a chart is the _design_ and a project is the _instance of working on it_.                                                                                                                                                      |
| **WIP**                  | Work In Progress — a project currently being stitched                                                                                                                                                                                                                                                                                                                                               |
| **FFO**                  | Fully Finished Object — a project that has been stitched AND finished (framed, made into a pillow, etc.). Distinct from "finished stitching."                                                                                                                                                                                                                                                       |
| **Kitted**               | A calculated state meaning ALL of the following are true: has digital working copy, is in a project bag, stash has been checked for existing supplies, all needed thread is acquired, fabric is assigned and in the bag, all beads (if needed) are in the bag, all specialty items (if needed) are in the bag, any onion skinning is complete, and the chart is loaded into an app or ready to load |
| **Onion Skinning**       | Re-charting a paper chart or non-enhanced PDF with heavy backstitch in charting software (e.g., MacStitch) so it can be properly loaded into iPad stitching apps                                                                                                                                                                                                                                    |
| **SAL**                  | Stitch-Along — a single design released in parts over time (e.g., monthly). One project, multiple chart parts that get added progressively. Stitch count and supply needs may evolve as new parts are released.                                                                                                                                                                                     |
| **Series**               | A collection of independent but related patterns (e.g., "Mini Bottles" series, "Celtic Santas"). Each chart is its own project, but they belong to a named group. Similar to a book series tracker.                                                                                                                                                                                                 |
| **DMC**                  | The most common brand of cross stitch embroidery floss/thread. Has a standardized catalog of ~500 numbered colors.                                                                                                                                                                                                                                                                                  |
| **Anchor**               | Another brand of embroidery thread, with its own color numbering system                                                                                                                                                                                                                                                                                                                             |
| **Kreinik**              | A brand of specialty metallic threads and braids used for decorative effects                                                                                                                                                                                                                                                                                                                        |
| **Mill Hill**            | A common brand of glass beads used in cross stitch                                                                                                                                                                                                                                                                                                                                                  |
| **Floss / Thread**       | The embroidery thread used for stitching. Tracked by brand, color code, and color family.                                                                                                                                                                                                                                                                                                           |
| **Fabric**               | The base material stitched onto. Key attributes: brand, count (holes per inch), type (Aida, linen, lugana, etc.), color, and dimensions                                                                                                                                                                                                                                                             |
| **Count**                | Fabric measurement — holes per inch (e.g., 14ct, 18ct, 28ct). Higher count = smaller stitches = more detail. Affects how large a finished piece will be.                                                                                                                                                                                                                                            |
| **Aida**                 | A type of cross stitch fabric with a clear grid pattern. Easiest to stitch on.                                                                                                                                                                                                                                                                                                                      |
| **Linen**                | A type of cross stitch fabric; more advanced, stitched over two threads                                                                                                                                                                                                                                                                                                                             |
| **Lugana**               | A type of evenweave fabric, popular for its drape and texture                                                                                                                                                                                                                                                                                                                                       |
| **Skein**                | A standard unit of embroidery thread. Projects specify how many skeins of each color are needed.                                                                                                                                                                                                                                                                                                    |
| **BAP**                  | Big Ass Project — community term for very large cross stitch designs (50,000+ stitches)                                                                                                                                                                                                                                                                                                             |
| **Stash**                | The stitcher's collection of supplies (thread, fabric, beads, charts, etc.)                                                                                                                                                                                                                                                                                                                         |
| **Project Bag**          | Physical bag/pouch containing all supplies for a single project                                                                                                                                                                                                                                                                                                                                     |
| **Project Bin**          | Physical storage container (accordion folder) holding multiple project bags. Currently ~4-5 bins stored in a bookcase. Essentially a location label.                                                                                                                                                                                                                                                |
| **Markup R-XP / Saga**   | iPad applications used for viewing charts and tracking stitch progress while stitching                                                                                                                                                                                                                                                                                                              |
| **MacStitch**            | Mac software used for charting and onion skinning patterns                                                                                                                                                                                                                                                                                                                                          |
| **Digital Working Copy** | A personal-use digital copy of a chart (PDF or image). Allowed as long as it's never shared. Stored within the app for reference.                                                                                                                                                                                                                                                                   |

---

## 4. Core Feature Areas

### 4.1 Chart / Project Management (Priority 1)

The central feature. Every chart/project is a rich record with extensive metadata.

**Project Metadata Fields:**

- Chart image / cover photo
- Digital working copy (PDF upload and storage)
- Project name
- Designer (relation)
- Stitch count — exact if known, approximate if not, with a flag for which type
- Stitches wide × stitches high (separate fields)
- Size category (auto-calculated from stitch count): BAP (50,000+), Large (25,000–49,999), Medium (5,000–24,999), Small (1,000–4,999), Mini (under 1,000). _Note: Medium/Large boundary is still being refined by user._
- Genre tags (Animals, People, Beach, Canada, etc. — user-addable over time)
- Collection / Series membership
- Status (customizable, see below)
- Pattern type indicators: is paper chart, is formal kit, is SAL
- If formal kit: number of colors in kit
- iPad app loaded to (which app, or not yet loaded)
- Needs onion skinning (boolean)
- Fabric assigned (relation to fabric record)
- Project bin location (simple label/dropdown, ~4-5 options)
- Start date, finish date, FFO date
- Finish photo
- Starting stitches (for projects begun before tracking started — preserves stat accuracy)
- Progress: stitches completed, stitches remaining, percentage complete
- Plans & Goals section: want to start next (flag), preferred start season/month/year, milestone goals (stitch to 10%, 20%, etc.), monthly stitching day goals, rotation schedule preferences
- Date added to tracker

**Status System:**

- Must be customizable / flexible
- Covers a wide range from "just added the chart" through various kitting stages to "actively stitching" to "finished" to "FFO"
- "Kitted" is a calculated/composite status (see glossary) — the app should be able to determine this automatically based on whether all kitting conditions are met, and show "80% kitted — still needs 3 DMC colors and fabric" style feedback
- Suggested statuses (to be refined): Unstarted, Kitting in Progress, Kitted/Ready to Start, In Progress/WIP, On Hold/Hibernating, Finished (stitching complete), FFO (fully finished object)
- Kitting sub-statuses or flags: needs digital copy, needs fabric, needs thread, needs beads, needs specialty items, needs onion skinning, needs to be loaded to app

**SAL Support:**

- A SAL is one project that receives additional chart parts over time
- Must support adding new chart PDFs (parts) to an existing project
- Stitch count may be updated as new parts are revealed
- Supply needs may grow as new parts introduce new colors
- Should track which parts have been released/received

**Series Support:**

- A named collection of independent projects
- Track series membership and completion (e.g., "4 of 12 Mini Bottles complete")
- Series-level statistics: percentage of series complete, patterns owned vs. total in series

### 4.2 Supply Tracking & Shopping (Priority 2)

Three parallel supply databases, all linkable to projects with per-project quantity tracking.

**Thread Database:**

- Pre-seeded with full DMC catalog (~500 colors) — this is a major UX win
- Additional brands supported: Anchor, and user-addable brands
- Per-thread fields: brand, color code, color name, color swatch (hex value or image), color family (blue, red, green, etc.)
- NOT currently tracking total skeins in personal stash (just per-project), but architecture should allow adding this later for multi-user flexibility

**Bead Database:**

- Brand (Mill Hill is most common, but user-addable)
- Color/product code
- Image/swatch
- Color family

**Specialty Item Database:**

- Brand (Kreinik is most common, but user-addable)
- Product code / type
- Image/swatch
- Description

**Project ↔ Supply Linking (Junction Data):**
For each supply item linked to a project, track:

- Stitch count for that color (if known)
- Quantity required (skeins, bead containers, etc.)
- Quantity acquired / in project
- Quantity still needed (calculated)
- Whether enough has been acquired (calculated boolean)

**Shopping List (Auto-Generated):**

- Shows all supplies across all projects where quantity needed > quantity acquired
- Grouped by project
- For each item: supply code, color swatch, quantity still needed, total required, quantity already acquired
- Should support filtering (e.g., "just show me what I need for Project X" or "show me all DMC I need across everything")

### 4.3 Stitching Session Logging & Statistics (Priority 3)

**Session Entry Fields:**

- Date (defaults to today, editable for backfilling)
- Project (relation — select from active projects)
- Stitch count for session
- Progress photo (optional)
- Time spent (optional — hours/minutes. User doesn't currently track this, but many stitchers do, so include for multi-user readiness)

**Statistics Engine:**
This is a key differentiator from Notion. The app should calculate and display a comprehensive range of statistics. Everything listed below was either explicitly requested or derived from the existing Notion system.

_Stitch Statistics:_

- Stitches today, yesterday, this week, this month, this year
- Stitches by year (2024, 2025, 2026, etc.)
- Total stitches since tracking began
- Average stitches per day (this week, this month, this year)
- Most stitches in a single day (this year, last year, all time)
- Monthly stitch totals (for bar charts)

_Project Statistics:_

- Total projects/charts in stash
- Count by status: unstarted, kitting, kitted, WIP, finished, FFO
- Count by completion bracket: ≤10%, 11–25%, 26–50%, 51–75%, 76–99%
- Projects added this month, this year
- Projects started this month, this year, last year
- Projects finished this month, this year, last year
- Project closest to completion
- Largest project (by stitch count)

_Supply Statistics:_

- Project using the most DMC colors
- Project using the most beads
- Project using the most specialty items
- Most-used DMC color (across all projects)
- Total unique DMC colors in use

_Calendar / Timeline:_

- Monthly stitching calendar showing which project was worked on each day and stitch count
- Monthly stitch bar graphs for the year

### 4.4 Fabric Tracking (Priority 4)

**Fabric Record Fields:**

- Fabric name (e.g., "Driftwood Princess" — designer-given names)
- Photo (optional)
- Brand (relation to fabric brand)
- Count (14ct, 18ct, 28ct, etc.)
- Type (Aida, Linen, Lugana, Evenweave, etc.)
- Color family (blue, green, etc.)
- Color type (white, neutrals, brights, black, etc.)
- Shortest edge (inches)
- Longest edge (inches)
- Associated project (relation)
- Need to buy (boolean/checkbox)

**Fabric Brand Database:**

- Brand name (Zweigart, etc.)
- Website
- Linked fabric records

**Fabric Size Calculations:**

- Given a project's stitch width × stitch height and a fabric count, calculate required fabric dimensions
- Display this in a view that helps the user match projects to available fabric

### 4.5 Designer Tracking

**Designer Record Fields:**

- Name
- Website
- Linked projects/charts

**Usage:**

- Primarily for filtering and statistics ("most patterns by designer")
- Browsing "all charts by Designer X" should be supported

### 4.6 Dashboard & Views (Priority spans all phases)

**General Dashboard Philosophy:**

- Customizable and rearrangeable — ideally drag-and-drop widgets
- Multiple specialized pages/views for different contexts
- Support gallery, list, and table view types
- Strong filtering and sorting capabilities

**Planned Dashboard Pages:**

_Main Dashboard:_

- Quick-action buttons: track stitches, add new chart, add fabric, add designer, add thread/bead/specialty
- Recently added charts (last 10) with image, name, designer, stitch count, size category, genre
- Navigation to all other pages

_Pattern Dive:_

- "Next to start" section
- Gallery/list views filterable by: ready to start (kitted), size category, kitting needs
- Table view for all projects
- Fabric requirements view (calculated sizes at different counts)
- Overall pattern stash gallery
- Storage bin view (which projects are where)

_Project Dashboard (Active Work):_

- Current WIPs with progress
- Finished projects
- Sorted views: by percent complete, by monthly goals, by least complete
- Extensible — user was still developing this in Notion

_Stitching Stats Page:_

- All statistics from section 4.3 displayed as widgets/cards
- Monthly stitch bar graphs
- Stitching calendar
- Stitch tracking table (raw session data)

_Shopping Cart:_

- Per-project tabs
- Thread/floss needs with: DMC code, color swatch, quantity needed, required, acquired
- Bead needs (same format)
- Specialty item needs (same format)

_Yearly Summary Pages (2024, 2025, 2026, etc.):_

- Projects stitched on, finished, progress made
- Year-specific statistics
- Designed to be shareable on social media (future phase)

_Monthly Summary Pages:_

- Same concept at monthly granularity
- Also designed for social media sharing (future phase)

---

## 5. Conceptual Data Model

### Entities and Relationships

```
┌─────────────┐       ┌──────────────┐       ┌─────────────┐
│   Designer   │──1:M──│   Project     │──M:1──│   Fabric    │
└─────────────┘       │              │       └─────────────┘
                      │              │              │
                      │              │           M:1│
                      │              │       ┌─────────────┐
                      │              │       │ Fabric Brand│
                      │              │       └─────────────┘
                      │              │
          ┌───────────┤              ├───────────┐
          │           │              │           │
       M:M│        M:M│           M:M│        1:M│
   (junction)   (junction)    (junction)         │
          │           │              │           │
   ┌──────┴──┐  ┌─────┴────┐  ┌─────┴─────┐  ┌──┴──────────┐
   │  Thread  │  │   Bead   │  │ Specialty │  │  Stitch     │
   │ (supply) │  │ (supply) │  │  (supply) │  │  Session    │
   └─────────┘  └──────────┘  └───────────┘  └─────────────┘

   ┌─────────────┐       ┌─────────────┐
   │   Genre     │──M:M──│   Project    │
   └─────────────┘       │             │──M:M──┌──────────────┐
                         │             │       │  Collection  │
                         └─────────────┘       │  / Series    │
                                               └──────────────┘
```

### Junction Table Detail: Project ↔ Supply

Each project-supply link carries its own data:

| Field             | Description                                     |
| ----------------- | ----------------------------------------------- |
| project_id        | FK to project                                   |
| supply_id         | FK to thread/bead/specialty item                |
| supply_type       | Discriminator: thread, bead, or specialty       |
| stitch_count      | Number of stitches using this supply (if known) |
| quantity_required | Skeins/containers/units needed                  |
| quantity_acquired | Skeins/containers/units currently in project    |
| quantity_needed   | Calculated: required - acquired                 |
| is_fulfilled      | Calculated: acquired >= required                |

> **Implementation Note:** Prisma does not natively support polymorphic relations (a single `supply_id` pointing to Thread, Bead, or Specialty). The recommended approach is **three separate junction tables** (`ProjectThread`, `ProjectBead`, `ProjectSpecialty`), each carrying the quantity/fulfillment fields above. This is idiomatic Prisma, preserves full type safety, and the shopping list query becomes a simple `UNION` across the three tables in PostgreSQL.

### SAL-Specific Modeling

A SAL project has additional structure:

- Multiple chart files (parts), each with: part number, file (PDF), date released/received
- Stitch count is cumulative and may be updated as parts are added
- Supply list grows over time as new parts introduce new colors

### Key Calculated Fields

| Field              | Derivation                                                                                                                                                                                      |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Size category      | Derived from total stitch count using defined brackets                                                                                                                                          |
| Progress %         | (starting_stitches + stitches_from_sessions) / total_stitch_count                                                                                                                               |
| Stitches remaining | total_stitch_count - (starting_stitches + stitches_from_sessions)                                                                                                                               |
| Kitted status      | Composite check: has_digital_copy AND has_fabric AND all_thread_fulfilled AND all_beads_fulfilled AND all_specialty_fulfilled AND onion_skinning_complete_or_not_needed AND app_loaded_or_ready |
| Kitting progress   | Percentage/count of kitting conditions met                                                                                                                                                      |
| Shopping list      | All project-supply links where is_fulfilled = false                                                                                                                                             |
| Fabric size needed | (stitch_width / fabric_count + margin) × (stitch_height / fabric_count + margin)                                                                                                                |
| Series completion  | Count of finished projects in series / total projects in series                                                                                                                                 |

---

## 6. Views & Dashboard Requirements

### View Types Needed

- **Gallery View:** Card-based layout showing image, key metadata. Card contents should vary by context (different fields shown for WIPs vs. unstarted vs. finished).
- **List View:** Compact rows with sortable columns
- **Table View:** Full spreadsheet-like view with all fields visible, sortable and filterable
- **Calendar View:** Monthly grid showing stitching sessions
- **Chart/Graph Views:** Bar charts (monthly stitches), potentially pie charts (projects by status), progress bars

### Filtering Requirements

Users need to filter projects by:

- Status (any combination)
- Size category
- Designer
- Genre
- Collection/Series
- Kitting status / kitting needs
- Completion bracket
- Year started/finished
- Storage bin location
- Has/doesn't have digital copy
- Has/doesn't have fabric assigned

### Dashboard Customization (Aspirational)

- Draggable widget-based layout
- User chooses which stats/views appear on each dashboard page
- Widgets can be resized and rearranged
- New widget types can be added over time

---

## 7. Phased Build Plan

### Phase 1: Foundation & Core Project Management

**Goal:** A working app where you can add, view, edit, and manage cross stitch projects with rich metadata. The minimum viable "better than nothing."

**Features:**

- Authentication (single user, but built with multi-user architecture in mind)
- Project CRUD with full metadata fields (all fields from section 4.1)
- Digital working copy upload and storage (PDF/image)
- Designer CRUD and project ↔ designer linking
- Genre management (add/edit genres, tag projects)
- Customizable status system
- Basic project list/gallery/table views with filtering and sorting
- Size category auto-calculation from stitch count
- SAL support: multi-part chart uploads, updateable stitch counts
- Basic responsive design (works on Mac browser and iPhone)

**What You Get:** A functional chart/project database that already beats Notion for speed and usability. You can start adding your 500+ charts immediately.

### Phase 2: Supply Ecosystem & Shopping

**Goal:** Full supply tracking with the auto-generated shopping list.

**Features:**

- Thread database (pre-seeded with full DMC catalog ~500 colors including color swatches)
- Bead database with brand management
- Specialty item database with brand management
- Project ↔ supply linking UI (add threads/beads/specialty to a project with quantities)
- Per-project supply tracking: required vs. acquired vs. still needed
- Auto-generated shopping list with project grouping and filtering
- "Kitted" status auto-calculation based on supply completeness + other conditions
- Kitting progress indicator ("80% kitted — needs 3 DMC colors and fabric")
- Supply statistics: most-used colors, projects using most colors, etc.

**What You Get:** The supply management system that was the #1 pain point in Notion. Adding "DMC 310" is now a search-and-select, not a manual data entry chore.

### Phase 3: Stitching Sessions & Statistics Engine

**Goal:** Quick session logging and comprehensive statistics.

**Features:**

- Stitch session logging: date (defaults today), project, stitch count, optional photo, optional time
- Quick-log flow optimized for speed (this happens every stitching session)
- Progress tracking: auto-update project completion based on logged sessions
- Statistics engine calculating all metrics from section 4.3
- Basic stats dashboard with cards/widgets displaying key numbers
- Monthly stitch bar charts
- Stitching calendar view
- Session history table

**What You Get:** The stats-rich tracking experience. Open the app after a session, log your stitches in seconds, watch your numbers update.

### Phase 4: Advanced Views, Dashboards & Fabric

**Goal:** The rich, customizable multi-view experience that makes this feel like a proper application.

**Features:**

- Fabric tracking (CRUD, brands, all fields from section 4.4)
- Fabric ↔ project linking
- Fabric size auto-calculation based on stitch count and fabric count
- Collections/Series management with completion tracking
- Full dashboard pages: Main, Pattern Dive, Project Dashboard, Stats, Shopping Cart
- Custom gallery cards per status (different card layouts for WIP vs. unstarted vs. finished)
- Dashboard widget system (draggable, rearrangeable)
- Advanced filtering across all views
- Storage bin / location tracking
- Plans & goals section on projects (start next, preferred timing, milestone goals)

**What You Get:** The full-featured dashboard experience that surpasses your Notion setup.

### Phase 5: Polish, Sharing & Multi-User Groundwork

**Goal:** Social features, summary pages, PWA enhancements, and preparing for potential multi-user support.

**Features:**

- Yearly and monthly summary pages with shareable layouts
- Social media share card generation (stats, progress, finishes)
- PWA offline support (especially for session logging)
- Performance optimization for large datasets (500+ projects)
- Multi-user groundwork: user accounts, data isolation, flexible preference system
- Import/export functionality
- Backup system

**What You Get:** A polished, share-friendly application ready to grow.

---

## 8. Tech Stack

> **STATUS: FINALIZED** (decided 2026-03-20)

### Stack Summary

| Layer              | Choice                            | Key Rationale                                                                                                                                        |
| ------------------ | --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Framework**      | Next.js 14+ (App Router)          | One language (TypeScript) across frontend and backend; React built-in for rich interactive UI; excellent Claude Code support                         |
| **Language**       | TypeScript                        | Type safety across the complex data model; catches errors at build time; types flow from Prisma schema through API to components                     |
| **Database**       | PostgreSQL (hosted on Neon)       | Superior aggregation, window functions, and CTEs for the statistics engine; natural fit for deeply relational data with junction tables              |
| **ORM**            | Prisma                            | Readable schema definition; auto-generated TypeScript types; intuitive relation queries; clean handling of junction tables with data                 |
| **File Storage**   | Cloudflare R2                     | S3-compatible API (no lock-in); 10 GB free tier covers current needs (~2.5 GB of PDFs + images); zero egress fees                                    |
| **Frontend UI**    | React + Tailwind CSS              | Core styling and layout via Tailwind; React ecosystem provides mature libraries for every view type needed                                           |
| **UI Libraries**   | TanStack Table, Recharts, dnd-kit | TanStack Table for sortable/filterable project tables; Recharts for stitch statistics charts and graphs; dnd-kit for drag-and-drop dashboard widgets |
| **Authentication** | Auth.js (NextAuth.js)             | Simple single-user setup now; scales to multi-user with OAuth providers without architectural changes                                                |
| **Hosting**        | Vercel (application)              | Push-to-deploy from GitHub; free tier covers single-user; serverless architecture scales automatically if multi-user is added                        |
| **App Type**       | Progressive Web App (PWA)         | Installable on iPhone home screen; app-like experience without Safari chrome; offline session logging capability in later phases                     |

### Decision Rationale

**Why Next.js + TypeScript over Laravel + PHP:**
The previous web application was built with Laravel/PHP/MySQL, but the developer does not have deep Laravel expertise — it was a one-project familiarity. Given that either stack requires similar learning investment, Next.js was chosen because: (1) TypeScript provides end-to-end type safety critical for a data model this complex, (2) React's component ecosystem is the deepest for the interactive UI features needed (drag-and-drop, rich tables, charts, calendar views), (3) one language across the entire stack reduces context-switching, and (4) Claude Code's training data and effectiveness is deepest with TypeScript/React.

**Why PostgreSQL over MySQL:**
The statistics engine (section 4.3) requires heavy aggregation queries — monthly/yearly stitch totals, running averages, time-series comparisons, multi-table rollups. PostgreSQL's window functions and Common Table Expressions (CTEs) handle these naturally and performantly. The shopping list generation (dynamic queries across three supply junction tables filtered by fulfillment status) and kitting status calculation (8 conditions spanning multiple relations) are also cleaner in PostgreSQL. MySQL could work, but the queries would be more verbose and harder to optimize.

**Why Prisma over Drizzle:**
Prisma's schema file is highly readable (almost English), which is critical for a non-professional developer maintaining the codebase. The auto-generated TypeScript client means the compiler catches field name typos, missing required fields, and type mismatches at build time rather than runtime. Drizzle offers marginally better performance and more SQL control, but the readability and safety advantages of Prisma outweigh this for a single-user application.

**Why Vercel + Neon + R2 over SiteGround:**
SiteGround offers PostgreSQL, but its hosting environment is optimized for PHP applications. Running Node.js/Next.js on shared hosting involves workarounds, limited process management, and poor support. Vercel is purpose-built for Next.js with zero-configuration deployment. The free tiers of Vercel + Neon + Cloudflare R2 cover a single-user application indefinitely, and the architecture scales cleanly to multi-user by upgrading to paid tiers without re-architecting. SiteGround hosting may be retained for other uses or cancelled to offset future costs.

**Why PWA:**
A PWA provides the "app-like on iPhone" requirement without maintaining a separate native codebase. Phase 1 implements basic PWA (installable, home screen icon, full-screen launch). Phase 5 adds offline support via service workers, particularly for stitch session logging without internet access. Next.js has well-supported PWA tooling through `serwist` or `next-pwa`.

### Development Environment

- **IDE/Workflow:** Claude Code on Mac
- **Local Development:** `next dev` (Node.js dev server — no Herd Pro or TablePlus needed, though TablePlus can still connect to the local PostgreSQL if desired for direct DB inspection)
- **Version Control:** Git + GitHub (enables Vercel auto-deploy on push)
- **Database Local Dev:** PostgreSQL via Docker, or direct connection to a Neon dev branch

### Cost Projection

| Service                 | Free Tier                               | Paid Tier (if needed)                              |
| ----------------------- | --------------------------------------- | -------------------------------------------------- |
| Vercel                  | Hobby plan — sufficient for single-user | Pro: $20/month (likely only needed for multi-user) |
| Neon                    | 0.5 GB storage, 190 compute hours/month | Launch: $19/month (if storage exceeds free tier)   |
| Cloudflare R2           | 10 GB storage, 1M requests/month        | $0.015/GB/month beyond free tier                   |
| **Total (single-user)** | **$0/month**                            | **$5–40/month if any tier is exceeded**            |

---

## 9. Future Considerations

These items came up during discovery but are explicitly out of scope for the initial build phases. They should inform architectural decisions (don't paint ourselves into a corner) but are not being built yet.

- **Multi-user support:** Other stitchers may want to use this. Architecture should support per-user data isolation and flexible tracking preferences.
- **Thread stash inventory:** Tracking total skeins owned (not just per-project). Some stitchers want "I own 5 skeins of DMC 310 total." The supply model should be extensible to support this.
- **Additional supply brand pre-seeding:** Mill Hill bead catalog, Kreinik catalog, Anchor thread catalog — pre-seeded like DMC if catalog data is available.
- **iPad app integration:** Currently manual (user notes which app a chart is loaded into). Future possibilities could include deeper integration if those apps have APIs.
- **Social media integrations:** Direct posting to Instagram, cross stitch communities, etc.
- **Pattern marketplace integration:** Links to where patterns can be purchased, re-downloaded, etc.
- **Rotation schedule generator:** Automated rotation planning based on user goals and preferences.
- **Size category refinement:** The boundaries between Medium and Large are still being adjusted. The system should make it easy to update these thresholds.

---

## 10. Open Questions

These need to be resolved during or before development:

1. ~~**Tech stack** — Full decision pending (see section 8)~~ **RESOLVED** — See section 8. Stack finalized: Next.js + TypeScript, PostgreSQL (Neon), Prisma, Cloudflare R2, Vercel.
2. **Size category boundaries** — User is still refining the stitch count ranges, especially Medium vs. Large. Build with configurable thresholds.
3. **Status workflow** — Exact list of statuses and allowed transitions to be defined. Consider whether statuses should be fully freeform/user-defined or a curated set with customization.
4. **Pre-seeded data sources** — Need to identify reliable sources for DMC color catalog data (color codes, names, hex values for swatches). Same for Mill Hill and Kreinik if feasible.
5. **Backup strategy** — How and where to back up the database and uploaded files. Neon provides point-in-time recovery for the database. R2 backup strategy TBD.
6. **Notion data** — User is starting fresh (not migrating), but may want to reference old Notion data. No import tooling needed in early phases.
7. ~~**File storage limits** — 500+ charts × ~2-5MB each = 1-2.5GB of PDFs alone, plus images. Storage solution must be cost-effective at this scale and growing.~~ **RESOLVED** — Cloudflare R2 selected. 10 GB free tier covers current needs with room to grow. Zero egress fees.
8. **Offline requirements** — How important is offline access? Session logging while traveling/without internet? This affects PWA architecture decisions. Basic PWA in Phase 1, offline support deferred to Phase 5.

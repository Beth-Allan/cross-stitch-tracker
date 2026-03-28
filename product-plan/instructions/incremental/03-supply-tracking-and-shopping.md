# Milestone 3: Supply Tracking & Shopping

**Provide alongside:** `product-overview.md`, `design-system/`, `data-shapes/supply-tracking-and-shopping/types.ts`

**Prerequisites:** Milestone 2 (Project Management) — chart and project records must exist to link supplies.

---

## About This Handoff

**What you're receiving:**
- Finished UI designs (React components with full styling)
- Product requirements and user flow specifications
- Design system tokens (colors, typography)
- Sample data showing the shape of data components expect
- Test specs focused on user-facing behavior

**Your job:**
- Integrate these components into your application
- Wire up callback props to your routing and business logic
- Replace sample data with real data from your backend
- Implement loading, error, and empty states

The components are props-based — they accept data and fire callbacks. How you architect the backend, data layer, and business logic is up to you.

---

## Goal

Build the supply catalog and project-supply linking system so users can manage their thread, bead, and specialty item inventory and track kitting status per project.

## Overview

The supply system has two faces: a standalone catalog (the Supplies page) where users browse and manage their full supply inventory, and a per-project view (the Chart Detail Supplies tab) where users link supplies to specific projects with quantities. A bulk supply editor provides a dedicated full-page experience for heavy data entry during kitting. Kitting status auto-calculates from fulfillment data.

## Key Functionality

- **Supply Catalog** with three tabs: Thread, Beads, Specialty
- **Two view modes per tab:** swatch grid (visual colour circles) and searchable table
- **Pre-seeded DMC catalog** (~500 thread colours) available for search-and-select
- **Supply brand management:** inline "Add new" within searchable selects (DMC, Mill Hill, Kreinik, etc.)
- **Project Supplies Tab:** kitting progress bar + summary, three collapsible sections (Thread, Beads, Specialty)
- **Per-supply quantities:** required, acquired, and per-colour stitch count with inline editing
- **Auto-calculated kitting status:** overall percentage, plain-language summary of needs
- **Search-to-add interface:** type to search the catalog, select a supply, set quantities
- **Bulk Supply Editor:** full-page dedicated editor for heavy kitting data entry
- **Cross-reference:** see which other projects use the same supply
- **Colour swatches** rendered as small circles using hex values from supply records

## Components Provided

| Component | File | Purpose |
|-----------|------|---------|
| `SupplyCatalog` | `sections/supply-tracking-and-shopping/components/SupplyCatalog.tsx` | Three-tab catalog with grid and table views |
| `SupplyDetailModal` | `sections/supply-tracking-and-shopping/components/SupplyDetailModal.tsx` | Supply detail with colour swatch and project usage |
| `ProjectSuppliesTab` | `sections/supply-tracking-and-shopping/components/ProjectSuppliesTab.tsx` | Chart Detail embed with kitting progress and supply lists |
| `BulkSupplyEditor` | `sections/supply-tracking-and-shopping/components/BulkSupplyEditor.tsx` | Full-page editor for bulk supply entry |

## Props Reference

### Key Types

```typescript
type SupplyType = 'thread' | 'bead' | 'specialty'
type ColorFamily = 'Black' | 'White' | 'Red' | 'Orange' | 'Yellow' | 'Green' | 'Blue' | 'Purple' | 'Brown' | 'Gray' | 'Neutral'
type CatalogViewMode = 'grid' | 'table'
```

### SupplyCatalog Callbacks

| Callback | Signature | When Fired |
|----------|-----------|------------|
| `onAddThread` | `(thread: Partial<Thread>) => void` | User adds a new thread to catalog |
| `onEditThread` | `(threadId: string, updates: Partial<Thread>) => void` | User edits a catalog thread |
| `onDeleteThread` | `(threadId: string) => void` | User deletes a catalog thread |
| `onAddBead` | `(bead: Partial<Bead>) => void` | User adds a new bead |
| `onAddSpecialtyItem` | `(item: Partial<SpecialtyItem>) => void` | User adds a specialty item |
| `onAddBrand` | `(brand: Partial<SupplyBrand>) => void` | User creates a new supply brand |
| `onFilterChange` | `(filters: CatalogFilterState) => void` | User changes filter/search |
| `onViewModeChange` | `(mode: CatalogViewMode) => void` | User toggles grid/table view |

### ProjectSuppliesTab Callbacks

| Callback | Signature | When Fired |
|----------|-----------|------------|
| `onAddProjectThread` | `(projectId, threadId, quantities) => void` | User links a thread to the project |
| `onUpdateProjectThread` | `(id, updates) => void` | User edits quantities |
| `onRemoveProjectThread` | `(id: string) => void` | User removes a thread from the project |
| `onOpenBulkEditor` | `(projectId: string) => void` | User opens the full-page bulk editor |
| `onNavigateToProject` | `(projectId: string) => void` | User clicks a project in cross-reference |

## Expected User Flows

### 1. Browse the Supply Catalog
1. User navigates to Supplies from the sidebar
2. Thread tab loads showing a swatch grid of colours grouped by colour family
3. User switches to table view and searches for "DMC 310"
4. User clicks a supply to see its detail: swatch, code, name, brand, projects using it
5. **Outcome:** Supply catalog browsable in both visual and tabular formats

### 2. Kit a Project (Supplies Tab)
1. User opens a chart detail and switches to the Supplies tab
2. Kitting progress bar shows "45% kitted — needs 12 DMC colours and fabric"
3. User clicks "Add supply," searches for "DMC 3713," selects it, sets quantity to 2 skeins
4. Supply appears in the thread list with inline quantity fields
5. User marks 1 of 2 acquired; fulfillment shows partial (amber indicator)
6. **Outcome:** Kitting percentage updates; supply linked with quantities

### 3. Bulk Supply Entry
1. From the Supplies tab, user clicks "Open Bulk Editor"
2. Full-page editor loads with search-add bar at top, supply list below
3. User rapidly searches and adds 20+ thread colours with quantities
4. User clicks "Back to project" when done
5. **Outcome:** All supplies linked in one efficient session; kitting status recalculated

## Empty States

- **Empty supply catalog:** "No supplies yet. Add your first thread, bead, or specialty item." with "Add Supply" button
- **Empty Supplies tab on Chart Detail:** "No supplies linked yet. Search the catalog to start kitting." with search field
- **All supplies fulfilled:** Kitting bar at 100% with emerald "Fully kitted!" message

## Files to Reference

- `sections/supply-tracking-and-shopping/components/` — All screen design components
- `data-shapes/supply-tracking-and-shopping/types.ts` — TypeScript interfaces for Thread, Bead, SpecialtyItem, ProjectThread, KittingSupplySummary
- `product/sections/supply-tracking-and-shopping/spec.md` — Full specification
- `product/sections/supply-tracking-and-shopping/data.json` — Sample data
- `product/sections/supply-tracking-and-shopping/*.png` — Screenshots (supply-catalog, supply-detail, project-supplies-tab, project-supplies-detail, bulk-supply-editor)

## Done When

- [ ] Supply catalog page renders with three tabs (Thread, Beads, Specialty)
- [ ] Each tab supports swatch grid and table view toggle
- [ ] Supplies are searchable by code, name, and brand
- [ ] Add/edit supply modals work for all three types
- [ ] Brand management works inline with "Add new" option
- [ ] Chart Detail Supplies tab shows kitting progress bar with percentage and summary
- [ ] Supplies are linked to projects with required/acquired quantities
- [ ] Inline quantity editing works on the Supplies tab
- [ ] Kitting status auto-calculates when quantities change
- [ ] Colour swatches render from hex values
- [ ] Bulk supply editor allows rapid add-and-configure workflow
- [ ] Cross-reference shows other projects using the same supply
- [ ] Fulfillment colours: emerald (fulfilled), amber (partial), stone (not started)
- [ ] Responsive: grid wraps on mobile, table scrolls horizontally
- [ ] Light and dark mode work correctly

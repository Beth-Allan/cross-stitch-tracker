# Phase 5: Foundation & Quick Wins - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md -- this log preserves the alternatives considered.

**Date:** 2026-04-11
**Phase:** 05-foundation-quick-wins
**Areas discussed:** Storage & App pages, Cover image display, Fabric selector UX, Data model scope

---

## Storage & App Pages

### Navigation placement

| Option | Description | Selected |
|--------|-------------|----------|
| Own sidebar item | Dedicated 'Storage' nav item between Fabric and Sessions, matching how Designers/Genres/Fabric each have their own entry | ✓ |
| Under Settings | Storage and Stitching Apps live as sub-pages of /settings | |
| Combined 'Reference' section | Group Storage, Stitching Apps, and Fabric under a collapsible nav section | |

**User's choice:** Own sidebar item (Recommended)
**Notes:** Consistent with the established pattern where every entity type gets its own sidebar entry.

### Stitching App management approach

| Option | Description | Selected |
|--------|-------------|----------|
| Mirror storage pattern | Own page at /apps with same list layout as Storage Locations. Gets own sidebar item. | ✓ |
| Combined page with Storage | Single /storage page with two tabs: 'Locations' and 'Apps' | |
| Minimal -- just the dropdown | No dedicated management page, create/rename/delete inline from project form only | |

**User's choice:** Mirror storage pattern (Recommended)
**Notes:** No design reference exists for Stitching Apps; will replicate StorageLocation design exactly.

### Stitching App icon

| Option | Description | Selected |
|--------|-------------|----------|
| Tablet | Lucide 'Tablet' icon -- represents iPad apps clearly | ✓ |
| Smartphone | Lucide 'Smartphone' icon | |
| AppWindow | Lucide 'AppWindow' icon | |

**User's choice:** Tablet (Recommended)

---

## Cover Image Display

### Aspect ratio approach

| Option | Description | Selected |
|--------|-------------|----------|
| Contain with background | object-contain inside fixed-height container with bg-muted background. Full image visible, letterboxed. | ✓ |
| Taller container + cover | Increase to h-48/h-56, still object-cover. Less cropping but some still. | |
| Aspect ratio container | Dynamic aspect ratio adapting to image shape. Most faithful but card heights vary. | |

**User's choice:** Contain with background (Recommended)
**Notes:** No cropping at all. Portrait and square images fully visible with clean letterboxing.

### Container height

| Option | Description | Selected |
|--------|-------------|----------|
| h-48 (192px) | Taller container gives portrait images more room inside contain box | ✓ |
| Keep h-32 (128px) | Same height, just switch to object-contain. Portrait images will be quite small. | |
| h-40 (160px) | Middle ground | |

**User's choice:** h-48 (192px) (Recommended)

---

## Fabric Selector UX

### Dropdown behavior

| Option | Description | Selected |
|--------|-------------|----------|
| SearchableSelect with fabric info | Reuse SearchableSelect. Show name, count, type, brand. Filter to unassigned fabrics. | ✓ |
| Simple dropdown | Plain select with just fabric name | |
| Modal picker | Button opens modal with full fabric table | |

**User's choice:** SearchableSelect with fabric info (Recommended)
**Notes:** Same component pattern as Designer/Genre pickers. Enough info to distinguish similar fabrics.

### Empty state

| Option | Description | Selected |
|--------|-------------|----------|
| Empty state + link to /fabric | Show 'No unassigned fabrics' with link to Fabric page to create one | ✓ |
| Inline 'Create Fabric' button | Add create option in dropdown that opens FabricFormModal | |
| Just show empty dropdown | No special messaging | |

**User's choice:** Empty state + link to /fabric (Recommended)
**Notes:** Keeps chart form simple. User creates fabric first, then assigns.

---

## Data Model Scope

### Delete behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Unlink (set null) | Project keeps existing, FK becomes null. Non-destructive. | |
| Block if projects assigned | Prevent deletion until all projects reassigned | |
| Cascade unlink + warn | Unlink + show warning count: 'This will unlink 3 projects. Continue?' | ✓ |

**User's choice:** Cascade unlink + warn
**Notes:** Matches design's confirmation dialog pattern but adds project count for informed decision.

### Model fields

| Option | Description | Selected |
|--------|-------------|----------|
| Name only | Just id + name + userId + timestamps | |
| Name + description | Optional description/notes field | ✓ |
| Name + sortOrder | Add sortOrder for user-controlled display order | |

**User's choice:** Name + description
**Notes:** Description useful for notes like "Bin A -- top shelf, living room bookcase"

### Data migration

| Option | Description | Selected |
|--------|-------------|----------|
| Auto-create from existing values | Migration creates entities from distinct text values, updates FKs | |
| Start fresh | New empty tables, drop old text fields. Users re-enter manually. | ✓ |
| Keep both temporarily | Add FK fields but keep old text fields for gradual transition | |

**User's choice:** Start fresh
**Notes:** Simpler migration. Users will re-create locations and apps as proper entities.

---

## Claude's Discretion

- DMC catalog completion approach
- Thread colour picker scrollIntoView implementation
- Prisma schema naming conventions
- Detail page layout for Stitching Apps (mirror Storage design)
- Empty states for management pages
- SearchableSelect option rendering for fabric
- Whether to update existing SearchableSelect or create fabric-specific picker

## Deferred Ideas

- Sort order / drag-and-drop for storage locations
- Inline fabric creation from chart form
- Storage location icons or color coding
- Stitching app platform metadata

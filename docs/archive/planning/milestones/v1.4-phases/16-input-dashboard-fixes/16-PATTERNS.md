# Phase 16: Input & Dashboard Fixes - Pattern Map

**Mapped:** 2026-05-16
**Files analyzed:** 8 (5 modified, 2 deleted, 1 reference-only)
**Analogs found:** 5 / 5 (all modified files have self-as-analog since this is refactoring)

## File Classification

| File | Role | Data Flow | Closest Analog | Match Quality |
|------|------|-----------|----------------|---------------|
| `src/components/features/supply-table/portal-autocomplete.tsx` | component | event-driven | Self (refactoring in-place) | exact |
| `src/components/features/supply-table/supply-table-add-row.tsx` | component | event-driven | Self (refactoring in-place) | exact |
| `src/components/features/supply-table/use-supply-table.ts` | hook | event-driven | Self (refactoring in-place) | exact |
| `src/components/features/charts/project-detail/supplies-tab.tsx` | component | request-response | Self (refactoring in-place) | exact |
| `src/components/features/dashboard/spotlight-card.tsx` | component | request-response | Self (refactoring in-place) | exact |
| `src/components/features/supplies/search-to-add.tsx` | component | DELETE | N/A | N/A |
| `src/components/features/supplies/search-to-add.test.tsx` | test | DELETE | N/A | N/A |

## Pattern Assignments

### `src/components/features/supply-table/portal-autocomplete.tsx` (component, event-driven)

**Analog:** Self -- refactoring from dual-input to results-only dropdown.

**Current imports pattern** (lines 1-7):
```typescript
"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { Plus } from "lucide-react";
import { ColorSwatch } from "@/components/features/supplies/color-swatch";
import type { SupplySearchResult } from "./types";
```

**Props interface to modify** (lines 9-20):
```typescript
interface PortalAutocompleteProps {
  isOpen: boolean;
  items: SupplySearchResult[];
  existingIds: Set<string>;
  searchText: string;
  onSearchChange: (text: string) => void;  // REMOVE: no longer needed
  onSelect: (item: SupplySearchResult) => void;
  onCreateRequest: (searchText: string) => void;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLInputElement | null>;
  isLoading?: boolean;
}
```

**Focus-steal to REMOVE** (lines 84-89):
```typescript
// Focus input when dropdown opens
useEffect(() => {
  if (isOpen) {
    inputRef.current?.focus();  // THIS causes keystroke drops
  }
}, [isOpen]);
```

**Keyboard navigation to MOVE to parent** (lines 111-139):
```typescript
function handleKeyDown(e: React.KeyboardEvent) {
  if (e.key === "ArrowDown") {
    e.preventDefault();
    setHighlightIndex((prev) => {
      if (prev < 0) {
        for (let i = 0; i < displayItems.length; i++) {
          if (!isDisabled(displayItems[i])) return i;
        }
        return prev;
      }
      return findNextAddableIndex(prev, 1);
    });
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    setHighlightIndex((prev) => {
      if (prev < 0) return prev;
      return findNextAddableIndex(prev, -1);
    });
  } else if (e.key === "Enter") {
    e.preventDefault();
    if (highlightIndex >= 0 && displayItems[highlightIndex]) {
      if (!isDisabled(displayItems[highlightIndex])) {
        onSelect(displayItems[highlightIndex]);
      }
    }
  } else if (e.key === "Escape") {
    onClose();
  }
}
```

**Portal input to REMOVE** (lines 164-179):
```typescript
{/* Search input -- TO BE REMOVED */}
<div className="p-2">
  <input
    ref={inputRef}
    type="text"
    value={searchText}
    onChange={(e) => onSearchChange(e.target.value)}
    onKeyDown={handleKeyDown}
    placeholder="Search by code or name..."
    className="border-border bg-card text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-ring/40 w-full rounded border px-3 py-1.5 text-sm transition-colors focus:ring-2 focus:outline-none"
    role="combobox"
    aria-expanded={true}
    aria-controls="portal-autocomplete-listbox"
    aria-activedescendant={highlightedId || undefined}
    aria-autocomplete="list"
  />
</div>
```

**ARIA pattern -- combobox attributes move to table row input:**
```typescript
// These attributes will move from portal input to supply-table-add-row.tsx search input:
role="combobox"
aria-expanded={true}
aria-controls="portal-autocomplete-listbox"
aria-activedescendant={highlightedId || undefined}
aria-autocomplete="list"
```

---

### `src/components/features/supply-table/supply-table-add-row.tsx` (component, event-driven)

**Analog:** Self -- absorbs keyboard handling from portal.

**Current table row search input** (lines 173-183):
```typescript
<div className="relative min-w-0">
  <input
    ref={searchInputRef}
    type="text"
    value={searchText}
    onChange={(e) => setSearchText(e.target.value)}
    onKeyDown={handleSearchKeyDown}
    placeholder="Search by code or name..."
    className={inputClassName}
    autoComplete="off"
  />
</div>
```

**Current search keydown handler** (lines 118-123 -- will expand to include ArrowDown/ArrowUp/Enter):
```typescript
function handleSearchKeyDown(e: React.KeyboardEvent) {
  if (e.key === "Escape") {
    e.preventDefault();
    handleEscape();
  }
}
```

**PortalAutocomplete integration** (lines 188-199 -- `onSearchChange` prop to remove):
```typescript
<PortalAutocomplete
  isOpen={isAutocompleteOpen}
  items={searchResults}
  existingIds={existingSupplyIds}
  searchText={searchText}
  onSearchChange={setSearchText}      // REMOVE this prop
  onSelect={selectItem}
  onCreateRequest={handleCreateRequest}
  onClose={() => setSearchText("")}
  anchorRef={searchInputRef}
  isLoading={isSearching}
/>
```

---

### `src/components/features/supply-table/use-supply-table.ts` (hook, event-driven)

**Analog:** Self -- adding `useTransition` wrapping.

**Current setIsSearching pattern** (lines 60-62):
```typescript
cancelledRef.current = false;
setIsSearching(true);

debounceRef.current = setTimeout(async () => {
```

**Pattern for `useTransition` integration -- from SpotlightCard** (spotlight-card.tsx lines 28, 35):
```typescript
const [isPending, startTransition] = useTransition();

function handleShuffle() {
  startTransition(async () => {
    // work here
  });
}
```

**Adapter dep in useEffect** (line 85 -- causes debounce restart when adapter identity changes):
```typescript
}, [searchText, supplyType, adapter]);
```

---

### `src/components/features/charts/project-detail/supplies-tab.tsx` (component, request-response)

**Analog:** Self -- stabilizing adapter memo deps.

**Current unstable adapter pattern** (lines 88-92):
```typescript
// Instantiate ServerActionAdapter with project.id and router.refresh
const adapter = useMemo(
  () => new ServerActionAdapter(project.id, () => router.refresh()),
  [project.id, router],  // BUG: `router` identity changes on navigation
);
```

**Fix pattern -- useCallback for refresh (established in project):**
```typescript
// Pattern from existing useCallback usage in supply-table-add-row.tsx
const stableRefresh = useCallback(() => router.refresh(), [router]);

const adapter = useMemo(
  () => new ServerActionAdapter(project.id, stableRefresh),
  [project.id, stableRefresh],  // stableRefresh is memoized
);
```

---

### `src/components/features/dashboard/spotlight-card.tsx` (component, request-response)

**Analog:** Self -- CSS-only changes to grid layout and button styling.

**Current grid container** (line 59):
```typescript
<div className="grid max-h-[360px] min-h-[260px] grid-cols-1 md:grid-cols-2">
```

**Current "Check It Out" button with hardcoded colors** (lines 131-136):
```typescript
<LinkButton
  href={`/charts/${project.chartId}`}
  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
>
  Check It Out
  <ArrowRight className="h-4 w-4" strokeWidth={2} />
</LinkButton>
```

**buttonVariants default variant** (button-variants.ts line 8):
```typescript
default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
```

**LinkButton usage pattern** (link-button.tsx lines 29-37):
```typescript
<Link
  href={href}
  className={buttonVariants({ variant, size, className })}
  target={target}
  rel={safeRel}
  {...props}
>
  {children}
</Link>
```

**Current "Shuffle" button** (lines 138-147):
```typescript
<button
  onClick={handleShuffle}
  disabled={isPending}
  type="button"
  className="border-border bg-card text-muted-foreground hover:bg-muted inline-flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
  aria-label="Shuffle spotlight project"
>
```

---

## Shared Patterns

### Testing Pattern (supply-table components)
**Source:** `src/components/features/supply-table/portal-autocomplete.test.tsx`
**Apply to:** Updated tests for portal-autocomplete and supply-table-add-row

```typescript
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@/__tests__/test-utils";

// Mock createPortal to render children inline
vi.mock("react-dom", async () => {
  const actual = await vi.importActual("react-dom");
  return {
    ...actual,
    createPortal: (node: React.ReactNode) => node,
  };
});

// Anchor ref helper for portal positioning
function createAnchorRef(): React.RefObject<HTMLInputElement | null> {
  const input = document.createElement("input");
  input.getBoundingClientRect = () => ({
    top: 100, left: 50, bottom: 130, right: 350,
    width: 300, height: 30, x: 50, y: 100,
    toJSON: () => ({}),
  });
  document.body.appendChild(input);
  return { current: input };
}
```

### Testing Pattern (dashboard components)
**Source:** `src/components/features/dashboard/spotlight-card.test.tsx`
**Apply to:** Updated tests for spotlight-card

```typescript
import { render, screen } from "@/__tests__/test-utils";
import { describe, expect, it, vi } from "vitest";

// Mock LinkButton for anchor assertions
vi.mock("@/components/ui/link-button", () => ({
  LinkButton: ({ href, children, className }: {
    href: string; children: React.ReactNode; className?: string;
  }) => (
    <a href={href} className={className}>{children}</a>
  ),
}));
```

### Hook Testing Pattern
**Source:** `src/components/features/supply-table/use-supply-table.test.ts`
**Apply to:** Updated tests for use-supply-table (useTransition addition)

```typescript
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { renderHook, act } from "@/__tests__/test-utils";

beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
});
```

### useCallback Stabilization Pattern
**Source:** Established React pattern used across project
**Apply to:** `supplies-tab.tsx` adapter memo fix

```typescript
import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";

const router = useRouter();
const stableRefresh = useCallback(() => router.refresh(), [router]);
const adapter = useMemo(
  () => new SomeAdapter(id, stableRefresh),
  [id, stableRefresh],
);
```

### Semantic Token Button Pattern
**Source:** `src/components/ui/button-variants.ts`
**Apply to:** spotlight-card.tsx "Check It Out" button migration

```typescript
// Replace hardcoded emerald with default variant:
<LinkButton
  href={href}
  className="rounded-xl px-5 py-2.5 font-semibold"
>
  ...
</LinkButton>
// buttonVariants({ variant: "default" }) automatically applies:
// bg-primary text-primary-foreground [a]:hover:bg-primary/80
// where --primary is emerald
```

---

## Files to Delete (no pattern needed)

| File | Reason |
|------|--------|
| `src/components/features/supplies/search-to-add.tsx` | Dead code -- replaced by PortalAutocomplete in v1.3, no imports |
| `src/components/features/supplies/search-to-add.test.tsx` | Tests for dead code above |

---

## No Analog Found

No files in this phase lack analogs -- all modifications are refactoring existing code in-place. The patterns are all self-referential (current code is the analog, decisions define what changes).

---

## Metadata

**Analog search scope:** `src/components/features/supply-table/`, `src/components/features/dashboard/`, `src/components/features/charts/project-detail/`, `src/components/ui/`
**Files scanned:** 14 source files + 14 test files
**Pattern extraction date:** 2026-05-16

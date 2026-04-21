# Phase 9 Critique — Remaining Fixes

> From `/impeccable:critique` session on 2026-04-17. Score: 31/40 (Nielsen's heuristics).
> Shopping cart redesign (Layout C) already completed and committed.

## Completed

- [x] Shopping cart 6-tab → 2-tab + toggle redesign (Layout C)
- [x] Accordions default to collapsed
- [x] Backlog items added: 999.11 (cart scaling), 999.12 (pill styling)

## Remaining Fixes (in priority order)

### 1. `/impeccable:harden` — Error Recovery [P2]

**Problem:** If a supply update or session action fails server-side, users see only a toast. No inline error states, no retry affordance, no automatic recovery. On flaky WiFi (couch stitching), this creates silent data loss anxiety.

**Files to focus on:**
- `src/components/features/shopping/shopping-cart.tsx` — `handleUpdateAcquired` only has toast feedback
- `src/components/features/shopping/quantity-control.tsx` — no visual rollback on failed optimistic update
- `src/components/features/dashboard/quick-add-menu.tsx` — server action error handling

**Fix:** Add inline error indicators on failed mutations with retry buttons. Show optimistic rollback visually (e.g., quantity snapping back with a subtle shake). Consider retry affordance beyond just re-clicking.

### 2. `/impeccable:colorize` — Violet → Emerald in Finished Tab [P2]

**Problem:** `finished-tab.tsx` uses `border-violet-100 bg-violet-50` for aggregate stat cards (line ~184). Violet is established as the "75-100% progress" color in progress breakdown. Using it for "finished" creates semantic confusion.

**Files to focus on:**
- `src/components/features/dashboard/finished-tab.tsx` — `AggregateCard` styling around line 184

**Fix:** Switch aggregate cards to `emerald-100/bg-emerald-50` (+ dark mode variants) to align with the primary brand accent and clearly signal "completion."

### 3. `/impeccable:clarify` — Quantity Control Affordance [P3]

**Problem:** The `acquired/required` display in quantity control looks like a static label. Users must discover it's clickable by accident. No hover hint, no visual cue.

**Files to focus on:**
- `src/components/features/shopping/quantity-control.tsx` — the button at line ~86 that shows `{acquired}/{required}`

**Fix:** Add subtle border or underline on hover to signal interactivity. Or show a pencil icon on hover. The existing `aria-label` helps screen readers but not sighted users.

### 4. `/impeccable:clarify` — Contextual Help for New Features [P3]

**Problem:** Dashboard introduces several new concepts (progress buckets, spotlight card, buried treasures, shopping cart workflow) with no guidance for first-time use. Nielsen score 2/4 on Help & Documentation.

**Files to focus on:**
- `src/components/features/dashboard/progress-breakdown-tab.tsx` — stacked bar chart has no explanation
- `src/components/features/dashboard/spotlight-card.tsx` — shuffle feature not explained
- `src/components/features/dashboard/buried-treasures-section.tsx` — concept may not be obvious

**Fix:** Add subtle first-use tooltips or a `?` icon with popover on complex features. Even one tooltip on the stacked progress bar explaining the buckets would help.

### 5. `/impeccable:polish` — Final Pass [P3]

**Issues to address:**
- Image loading: all images use `loading="lazy"` but no skeleton/placeholder — visible jump on slow connections
- `CollectionStatsSidebar`: "Collection Stats" label appears twice when mobile collapsible is expanded
- Scrollable row: `setTimeout(..., 350)` for scroll animation is aggressive — consider debouncing
- Shopping list: no sync indicator — users don't know if their list is saved to localStorage
- Progress breakdown "Show More" button (line ~255): plain text link with small tap target — use `<Button variant="link" size="sm">` or add padding

## Running the Fixes

Run each impeccable command in order, referencing the specific files and issues above:

```
/impeccable:harden    (focus: shopping cart error recovery)
/impeccable:colorize  (focus: finished-tab violet → emerald)
/impeccable:clarify   (focus: quantity control affordance + contextual help)
/impeccable:polish    (focus: image skeletons, duplicate labels, tap targets)
```

After all fixes: `/gsd-ship` to create PR for Phase 9.

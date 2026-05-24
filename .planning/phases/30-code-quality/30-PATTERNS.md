# Phase 30: Code Quality - Pattern Map

**Mapped:** 2026-05-24
**Files analyzed:** 14 (2 new, 12 modified)
**Analogs found:** 14 / 14

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/app/globals.css` | config | N/A | self (existing CSS custom properties) | exact |
| `src/lib/utils/status.ts` | utility | transform | self (already has STATUS_CONFIG) | exact |
| `src/components/features/charts/status-badge.tsx` | component | request-response | self (STATUS_CONFIG consumer) | exact |
| `src/components/features/gallery/gallery-card.tsx` | component | request-response | `status-badge.tsx` (STATUS_CONFIG consumer) | role-match |
| `src/components/features/dashboard/bucket-project-row.tsx` | component | request-response | `status-badge.tsx` (STATUS_CONFIG consumer) | role-match |
| `src/components/features/charts/whats-next-tab.tsx` | component | request-response | `status-badge.tsx` (STATUS_CONFIG consumer) | role-match |
| `src/components/features/sessions/log-session-modal.tsx` | component | request-response | self (bare catch blocks) | exact |
| `src/lib/actions/upload-actions.ts` | service | file-I/O | self (silent .catch at line 155) | exact |
| `src/app/(dashboard)/charts/[id]/page.tsx` | controller | request-response | self (.catch(() => null) at line 52) | exact |
| `src/lib/actions/session-actions.ts` | service | CRUD | self (R2 cleanup pattern at line 97-99) | exact |
| `src/lib/actions/chart-actions.ts` | service | CRUD | `session-actions.ts` (R2 cleanup pattern) | exact |
| `src/lib/constants.ts` | config | N/A | `src/lib/validations/upload.ts` (exported constants) | role-match |
| `src/components/hooks/use-rejection-flash.ts` | hook | event-driven | `src/components/features/charts/editable-number.tsx` (source of extraction) | exact |
| `src/lib/utils/status-groups.test.ts` | test | N/A | self (line 36 TS error) | exact |

## Pattern Assignments

### `src/app/globals.css` (config, CSS custom properties)

**Analog:** Self -- existing design token pattern

**Existing status variables** (lines 148-155, :root):
```css
/* Status Colors (project lifecycle) */
--status-unstarted: oklch(0.553 0.013 58.07); /* stone-500 */
--status-kitting: oklch(0.769 0.188 70.08); /* amber-500 */
--status-kitted: oklch(0.596 0.145 163.23); /* emerald-600 */
--status-in-progress: oklch(0.609 0.191 231.73); /* sky-500 */
--status-on-hold: oklch(0.646 0.222 41.12); /* orange-500 */
--status-finished: oklch(0.536 0.245 293.54); /* violet-600 */
--status-ffo: oklch(0.592 0.249 0.58); /* rose-600 */
```

**Naming pattern for new variables** -- follow existing semantic token convention (lines 102-106):
```css
/* Feedback -- Success (emerald) */
--success: oklch(0.596 0.145 163.23); /* emerald-600 */
--success-muted: oklch(0.979 0.021 166.11); /* emerald-50 */
--success-muted-foreground: oklch(0.508 0.118 165.61); /* emerald-700 */
--success-border: oklch(0.905 0.093 164.15); /* emerald-200 */
```

**New variables to add** per D-01: `--status-{name}-bg`, `--status-{name}-dot`, `--status-{name}-text` in both `:root` and `.dark`. Existing `--status-{name}` variables serve as dot/accent colors.

**@theme inline registration** (lines 7-64) -- new color vars need `--color-*` mappings to be usable as Tailwind classes via `bg-status-kitting-bg` etc. However, the `bg-[var(--status-kitting-bg)]` arbitrary value syntax from D-02 does NOT require @theme registration.

---

### `src/lib/utils/status.ts` (utility, transform)

**Analog:** Self

**Current STATUS_CONFIG structure** (lines 1-72):
```typescript
import type { ProjectStatus } from "@/generated/prisma/client";

export const STATUS_CONFIG: Record<
  ProjectStatus,
  {
    label: string;
    cssVar: string;
    bgClass: string;
    textClass: string;
    dotClass: string;
    darkBgClass: string;
  }
> = {
  UNSTARTED: {
    label: "Unstarted",
    cssVar: "--status-unstarted",
    bgClass: "bg-slate-50",
    textClass: "text-slate-700 dark:text-slate-300",
    dotClass: "bg-slate-500",
    darkBgClass: "dark:bg-slate-900/40",
  },
  // ... 6 more statuses
};
```

**Target:** Replace raw Tailwind classes with CSS variable references per D-02:
- `bgClass: "bg-[var(--status-unstarted-bg)]"` (single class, dark mode handled by CSS)
- `textClass: "text-[var(--status-unstarted-text)]"` (single class)
- `dotClass: "bg-[var(--status-unstarted-dot)]"` (single class)
- `darkBgClass` field becomes unnecessary if CSS handles light/dark

---

### `src/components/features/charts/status-badge.tsx` (component, STATUS_CONFIG consumer)

**Analog:** Self

**Current consumption pattern** (lines 10-31):
```typescript
export function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const sizeClasses = size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-2.5 py-1";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium transition-colors duration-200",
        sizeClasses,
        config.bgClass,
        config.textClass,
        config.darkBgClass,
      )}
    >
      <span
        aria-hidden="true"
        className={cn("h-1.5 w-1.5 rounded-full transition-colors duration-200", config.dotClass)}
      />
      {config.label}
    </span>
  );
}
```

After CSS variable migration, `config.darkBgClass` usage should be removable (CSS handles dark mode).

---

### `src/components/features/gallery/gallery-card.tsx` (component, hardcoded status colors)

**Analog:** `status-badge.tsx` for STATUS_CONFIG consumption

**Hardcoded colors to replace** (line 126, 132):
```typescript
isFFO ? "bg-rose-500 dark:bg-rose-400" : "bg-violet-500 dark:bg-violet-400"
// and
isFFO ? "text-rose-600 dark:text-rose-400" : "text-violet-600 dark:text-violet-400"
```

These are completion bar colors for FINISHED/FFO statuses. Replace with STATUS_CONFIG dot/text classes.

---

### `src/components/features/charts/whats-next-tab.tsx` (component, hardcoded status colors)

**Hardcoded colors** (line 130, 162):
```typescript
className="h-5 w-5 text-amber-500 drop-shadow-sm"  // kitting star icon
// and
project.kittingPercent === 100 ? "bg-progress" : "bg-amber-400"  // kitting bar
```

Replace amber references with `--status-kitting-*` CSS variables.

---

### `src/components/features/sessions/log-session-modal.tsx` (component, silent failures)

**Analog:** Self -- the catch blocks ARE the targets

**Catch block at line 166** (photo upload):
```typescript
} catch {
  toast.error("Photo upload failed. You can try again or save without a photo.");
}
```
Already has toast feedback. D-07 requires adding `console.error` for developer visibility.

**Catch block at line 234** (save handler):
```typescript
} catch {
  toast.error("Session could not be saved. Check your connection and try again.");
}
```
Same treatment: add `console.error`.

**Catch block at line 254** (delete handler):
```typescript
} catch {
  toast.error("Session could not be deleted. Check your connection and try again.");
}
```
Same treatment: add `console.error`.

**Reference pattern** -- how the codebase handles catch with both logging and user feedback (session-actions.ts line 129-134):
```typescript
} catch (error) {
  if (error instanceof z.ZodError) {
    return { success: false as const, error: error.errors[0].message };
  }
  console.error("createSession error:", error);
  return { success: false as const, error: "Failed to create session" };
}
```

For modal catch blocks, the pattern is simpler (console.error + toast, no return):
```typescript
} catch (error) {
  console.error("Session save failed:", error);
  toast.error("Session could not be saved. Check your connection and try again.");
}
```

---

### `src/lib/actions/upload-actions.ts` (service, silent .catch)

**Analog:** Self

**Silent catch at line 155:**
```typescript
// DB write succeeded -- safe to delete raw original
await deleteFile(input.key).catch(() => {});
```

**Reference pattern** -- fire-and-forget with logging (session-actions.ts lines 97-99):
```typescript
await deleteFile(session.photoKey).catch((err) =>
  console.warn("[R2] raw file cleanup failed:", session.photoKey, err),
);
```

Fix: replace `() => {}` with the established logging pattern.

---

### `src/app/(dashboard)/charts/[id]/page.tsx` (controller, graceful degradation)

**Analog:** Self

**Silent catch at line 52:**
```typescript
chart.project
  ? getProjectCompletionEstimate(user.id, chart.project.id).catch(() => null)
  : null,
```

**Fix per D-09:** Add console.error but keep returning null:
```typescript
chart.project
  ? getProjectCompletionEstimate(user.id, chart.project.id).catch((error) => {
      console.error("Completion estimate failed:", error);
      return null;
    })
  : null,
```

**Reference pattern** -- getUnassignedFabrics at line 55-58 already does this:
```typescript
chart.project
  ? getUnassignedFabrics(chart.project.id).catch((error) => {
      console.error("Failed to load unassigned fabrics:", error);
      return [];
    })
  : [],
```

---

### `src/lib/actions/session-actions.ts` (service, R2 photo orphan)

**Analog:** Self -- the cleanup pattern exists for raw files, needs extension for replaced photos

**Existing fire-and-forget R2 cleanup** (lines 97-99, createSession):
```typescript
await deleteFile(session.photoKey).catch((err) =>
  console.warn("[R2] raw file cleanup failed:", session.photoKey, err),
);
```

**Photo replacement in updateSession** (lines 192-209) -- new photo is optimized but OLD photo (`existing.photoKey`) is never deleted:
```typescript
if (session.photoKey && session.photoKey !== existing.photoKey) {
  try {
    const result = await processAndStoreImage(session.id, session.photoKey, "sessions");
    if (result.success) {
      await prisma.stitchSession.update({
        where: { id: session.id },
        data: { photoKey: result.optimizedKey },
      });
      returnSession = { ...session, photoKey: result.optimizedKey };
      await deleteFile(session.photoKey).catch((err) =>
        console.warn("[R2] raw file cleanup failed:", session.photoKey, err),
      );
      // D-10: ADD old photo cleanup here
      // await deleteFile(existing.photoKey).catch((err) =>
      //   console.warn("[R2] old photo cleanup failed:", existing.photoKey, err),
      // );
    }
  } catch (err) {
    console.warn("Session photo optimization failed:", err);
  }
}
```

Per D-10: After DB update succeeds and raw file is cleaned up, also delete old photo with same fire-and-forget pattern. Guard with `if (existing.photoKey)`.

---

### `src/lib/actions/chart-actions.ts` (service, R2 photo orphan)

**Analog:** `session-actions.ts` R2 cleanup pattern

**Cover image change detection** (lines 324-332):
```typescript
if (chart.coverImageUrl && chart.coverImageUrl !== existing.coverImageUrl) {
  try {
    await generateThumbnail(chartId, chart.coverImageUrl);
  } catch (err) {
    console.error("Thumbnail generation failed (chart saved without thumbnail):", err);
    thumbnailWarning = "Thumbnail could not be generated";
  }
}
```

Per D-11: After successful thumbnail generation, delete old cover image and old thumbnail with fire-and-forget. Need to also fetch `coverThumbnailUrl` in the existing query (line 234 currently only selects `coverImageUrl`).

**R2 cleanup pattern to apply** (from session-actions.ts):
```typescript
if (existing.coverImageUrl) {
  await deleteFile(existing.coverImageUrl).catch((err) =>
    console.warn("[R2] old cover cleanup failed:", existing.coverImageUrl, err),
  );
}
```

---

### `src/lib/constants.ts` (config, NEW file)

**Analog:** `src/lib/validations/upload.ts` -- exported constants pattern

**Reference imports pattern** (upload.ts lines 1-20):
```typescript
// Constants are exported as named exports, consumed via named import
export const ALLOWED_IMAGE_TYPES = [...] as const;
export const OPTIMIZED_MAX_WIDTH = 1600;
export const THUMBNAIL_SIZE = 200;
```

**New file structure:**
```typescript
/**
 * Shared constants used across multiple modules.
 * Single-source values to prevent drift from scattered literals.
 */

/** Default hex color for supplies without an explicit color assignment. */
export const DEFAULT_SUPPLY_HEX = "#79796e";
```

**Files to update** (16 occurrences across 7 files):
- `src/lib/validations/supply.ts:109` -- `.default("#79796e")` -> `.default(DEFAULT_SUPPLY_HEX)`
- `src/lib/actions/supply-actions.ts:778,830` -- `hexColor: "#79796e"` -> `hexColor: DEFAULT_SUPPLY_HEX`
- `src/components/features/charts/chart-merged-form.tsx:71,90,108` -- `data.hexColor ?? "#79796e"` -> `data.hexColor ?? DEFAULT_SUPPLY_HEX`
- `src/components/features/supply-table/inline-create-dialog.tsx:93` -- `hexColor: "#79796e"`
- `src/components/features/supply-table/local-state-adapter.ts:151` -- `data.hexColor ?? "#79796e"`
- Test files (supply-table.test, server-action-adapter.test, inline-create-dialog.test, chart-merged-form.test) -- can import constant too

---

### `src/components/hooks/use-rejection-flash.ts` (hook, NEW file)

**Analog:** `src/components/features/charts/editable-number.tsx` -- source of extraction

**Pattern to extract** (charts/editable-number.tsx lines 28-36, 60-63):
```typescript
// State + ref
const [showRejection, setShowRejection] = useState(false);
const rejectionTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

// Cleanup
useEffect(() => {
  return () => {
    if (rejectionTimerRef.current) clearTimeout(rejectionTimerRef.current);
  };
}, []);

// Trigger (inside onBlur handler)
setShowRejection(true);
if (rejectionTimerRef.current) clearTimeout(rejectionTimerRef.current);
rejectionTimerRef.current = setTimeout(() => setShowRejection(false), 600);
```

**Hook shape per D-14:**
```typescript
"use client";

import { useState, useEffect, useRef } from "react";

interface UseRejectionFlashOptions {
  duration?: number;
}

export function useRejectionFlash({ duration = 600 }: UseRejectionFlashOptions = {}) {
  const [showRejection, setShowRejection] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  function triggerRejection() {
    setShowRejection(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setShowRejection(false), duration);
  }

  return { showRejection, triggerRejection };
}
```

**Existing hook conventions** (from `use-gallery-filters.ts`, `use-draft-persistence.ts`):
- Hooks live colocated with features, but D-14 specifies `src/components/hooks/` (shared hooks directory)
- Hooks use `"use client"` directive when they use React hooks
- Named export, not default export
- Interface for options, destructured with defaults

**Both consumers** will replace ~8 lines each with:
```typescript
const { showRejection, triggerRejection } = useRejectionFlash();
```

---

### `src/lib/utils/status-groups.test.ts` (test, TS error fix)

**Analog:** Self

**Current error at line 36:**
```typescript
expect(resolveStatusFilter(["invalid"] as StatusGroup[])).toEqual([]);
```

**Fix per D-15:** Use `as unknown as` cast for intentionally-invalid test input:
```typescript
expect(resolveStatusFilter(["invalid"] as unknown as StatusGroup[])).toEqual([]);
```

Also line 40:
```typescript
expect(resolveStatusFilter(["invalid", "not-started", "bogus"] as StatusGroup[])).toEqual([
```
Same fix needed.

---

## Shared Patterns

### Fire-and-Forget R2 Cleanup
**Source:** `src/lib/actions/session-actions.ts` lines 97-99
**Apply to:** `upload-actions.ts` (line 155), `session-actions.ts` (updateSession old photo), `chart-actions.ts` (old cover image)
```typescript
await deleteFile(oldKey).catch((err) =>
  console.warn("[R2] old photo cleanup failed:", oldKey, err),
);
```

### Console Error in Catch Blocks
**Source:** `src/lib/actions/session-actions.ts` lines 129-134
**Apply to:** `log-session-modal.tsx` (3 catch blocks), `upload-actions.ts` (line 155), `charts/[id]/page.tsx` (line 52)
```typescript
// For server actions:
console.error("descriptive-label error:", error);

// For client components (modal catch blocks):
console.error("Session save failed:", error);
toast.error("User-facing message");
```

### STATUS_CONFIG Consumer Pattern
**Source:** `src/components/features/charts/status-badge.tsx` lines 10-31
**Apply to:** All components consuming `bgClass`, `textClass`, `dotClass`, `darkBgClass`
```typescript
const config = STATUS_CONFIG[status];
// After migration, darkBgClass usage is removed (CSS handles dark mode)
className={cn(config.bgClass, config.textClass)}
```

### Constant Import Pattern
**Source:** `src/lib/validations/upload.ts` lines 1-20
**Apply to:** All files importing `DEFAULT_SUPPLY_HEX`
```typescript
import { DEFAULT_SUPPLY_HEX } from "@/lib/constants";
```

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| (none) | | | All files have strong analogs -- this is a refactoring phase touching existing code |

## Metadata

**Analog search scope:** `src/` (actions, components, lib, app)
**Files scanned:** ~25 direct reads, ~15 grep searches
**Pattern extraction date:** 2026-05-24

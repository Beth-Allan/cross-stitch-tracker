import type { ChartFormValues } from "./use-chart-form";

export const DRAFT_KEY = "chart-draft";

/**
 * Serialize current form values to localStorage under the draft key.
 * Fails silently if localStorage is full or unavailable (D-06).
 */
export function saveDraft(values: ChartFormValues): void {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(values));
  } catch {
    // localStorage may be full or unavailable -- fail silently
  }
}

/**
 * Read draft from localStorage, parse JSON, merge with defaults for schema
 * evolution resilience, and null out stale reference IDs (D-07, D-08).
 *
 * Returns ChartFormValues if a valid draft exists, null otherwise.
 */
export function loadDraft(
  defaults: ChartFormValues,
  validDesignerIds: string[],
  validStorageIds: string[],
  validAppIds: string[],
  validFabricIds: string[] = [],
): ChartFormValues | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ChartFormValues>;

    // Merge with defaults so missing fields from old drafts get defaults
    // (per Research pitfall 6: future schema evolution)
    const merged: ChartFormValues = { ...defaults, ...parsed };

    // Stale ID detection: null out IDs that no longer exist (per D-08)
    if (merged.designerId && !validDesignerIds.includes(merged.designerId)) {
      merged.designerId = null;
    }
    if (merged.storageLocationId && !validStorageIds.includes(merged.storageLocationId)) {
      merged.storageLocationId = null;
    }
    if (merged.stitchingAppId && !validAppIds.includes(merged.stitchingAppId)) {
      merged.stitchingAppId = null;
    }
    if (merged.fabricId && !validFabricIds.includes(merged.fabricId)) {
      merged.fabricId = null;
    }

    return merged;
  } catch {
    // Invalid JSON or localStorage unavailable
    return null;
  }
}

/**
 * Remove the draft key from localStorage on successful Create (D-09).
 * Fails silently if localStorage is unavailable.
 */
export function clearDraft(): void {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    // localStorage may be unavailable -- fail silently
  }
}

import type { ChartFormValues } from "./use-chart-form";
import type { SupplyRow, CalcParams } from "@/components/features/supply-table/types";
import { DEFAULT_CALC_PARAMS } from "@/components/features/supply-table/types";

export const DRAFT_KEY = "chart-draft";

const SUPPLY_TYPES = new Set(["THREAD", "BEAD", "SPECIALTY"]);

/** Lightweight runtime guard — rejects malformed supply rows from localStorage. */
function isValidSupplyRow(s: unknown): s is SupplyRow {
  if (typeof s !== "object" || s === null) return false;
  const r = s as Record<string, unknown>;
  return (
    typeof r.id === "string" &&
    typeof r.supplyId === "string" &&
    typeof r.type === "string" &&
    SUPPLY_TYPES.has(r.type) &&
    typeof r.code === "string" &&
    typeof r.name === "string" &&
    typeof r.brandName === "string" &&
    typeof r.hexColor === "string" &&
    typeof r.stitchCount === "number" &&
    typeof r.need === "number" &&
    typeof r.have === "number" &&
    typeof r.isNeedOverridden === "boolean"
  );
}

/**
 * V2 draft format that includes supply rows and calc params
 * alongside the form values. Backward-compatible with V1 drafts.
 */
export interface DraftV2 {
  version: 2;
  form: ChartFormValues;
  supplies: SupplyRow[];
  calcParams: CalcParams;
}

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

/**
 * Serialize current form values, supply rows, and calc params to localStorage
 * as a versioned V2 draft. Supersedes saveDraft for the creation flow (D-05).
 */
export function saveDraftV2(
  form: ChartFormValues,
  supplies: SupplyRow[],
  calcParams: CalcParams,
): void {
  try {
    const draft: DraftV2 = { version: 2, form, supplies, calcParams };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // localStorage full or unavailable -- fail silently
  }
}

/**
 * Read draft from localStorage with V2 format support.
 *
 * - V2 format (has `version: 2`): returns form + supplies + calcParams
 * - V1 format (no version field): wraps in V2 shape with empty supplies
 * - Invalid/missing: returns null
 *
 * Applies stale ID detection same as loadDraft (D-08).
 */
export function loadDraftV2(
  defaults: ChartFormValues,
  validDesignerIds: string[],
  validStorageIds: string[],
  validAppIds: string[],
  validFabricIds: string[] = [],
): { form: ChartFormValues; supplies: SupplyRow[]; calcParams: CalcParams } | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);

    // V1 format (no version field) -- delegate to existing loadDraft, wrap result
    if (!parsed.version) {
      const form = loadDraft(
        defaults,
        validDesignerIds,
        validStorageIds,
        validAppIds,
        validFabricIds,
      );
      if (!form) return null;
      return { form, supplies: [], calcParams: DEFAULT_CALC_PARAMS };
    }

    // V2 format
    const draft = parsed as DraftV2;
    const merged: ChartFormValues = { ...defaults, ...draft.form };

    // Stale ID detection (same pattern as loadDraft)
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

    const validSupplies = (draft.supplies ?? []).filter(isValidSupplyRow);

    return {
      form: merged,
      supplies: validSupplies,
      calcParams: draft.calcParams ?? DEFAULT_CALC_PARAMS,
    };
  } catch {
    return null;
  }
}

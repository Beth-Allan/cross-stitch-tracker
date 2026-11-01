/**
 * Type contracts for the Unified Supply Table component system.
 *
 * This file defines the adapter interface, data types, and component props
 * used across all supply table implementations (local-state, server-action,
 * creation-flow adapters).
 */

import type { ColorFamily, SkeinLine, StrandCount } from "@/types/supply";

export type SupplyType = "THREAD" | "BEAD" | "SPECIALTY";

export interface CalcParams {
  fabricCount: number; // default 14
  strandCount: StrandCount; // default 2
  overCount: 1 | 2; // default 1
  wastePercent: number; // default 20
}

export interface FabricOption {
  value: string;
  label: string;
  count: number;
}

export const DEFAULT_CALC_PARAMS: CalcParams = {
  fabricCount: 14,
  strandCount: 2,
  overCount: 1,
  wastePercent: 20,
};

/**
 * Normalized supply row for table display (type-erased across Thread/Bead/Specialty).
 * Maps from the three junction tables into a single renderable format.
 */
export interface SupplyRow {
  id: string; // junction table ID
  supplyId: string; // supply catalog ID
  type: SupplyType;
  code: string; // colorCode or productCode
  name: string; // colorName
  brandName: string;
  hexColor: string;
  stitchCount: number; // only meaningful for threads
  /**
   * quantityRequired. Null only for a thread whose line has no known length, strand structure
   * or cut: the need is unknown, never a figure from a default (THR-011, Q-009).
   */
  need: number | null;
  have: number; // quantityAcquired
  isNeedOverridden: boolean; // only meaningful for threads
  /** The thread's line, which the skein calculator reads; null for beads and specialty. */
  line: SkeinLine | null;
}

/**
 * Search result from the autocomplete dropdown.
 * Represents a supply from the catalog (not yet linked to a project).
 */
export interface SupplySearchResult {
  id: string;
  type: SupplyType;
  code: string;
  name: string;
  brandName: string;
  brandId: string;
  hexColor: string;
  /** The thread's line, which the skein calculator reads; null for beads and specialty. */
  line: SkeinLine | null;
}

/**
 * Data required to create a new supply that doesn't exist in the catalog.
 * Used by the InlineCreateDialog.
 */
export interface CreateSupplyData {
  name: string;
  code?: string;
  brandId: string;
  hexColor?: string;
  /**
   * Chosen in the create dialog for threads and beads — quick-add must ask rather than
   * file silently under Neutral (Beth's ruling, 2026-08-17). Absent for specialty items,
   * which carry no colour family.
   */
  colorFamily?: ColorFamily;
}

export type Result = { success: true; id?: string } | { success: false; error: string };

/**
 * Adapter interface abstracting data operations for the supply table.
 *
 * LocalStateAdapter (in-memory, for tests/isolation)
 * ServerActionAdapter (wired to supply-actions.ts)
 * CreationFlowAdapter (buffers until two-phase save)
 */
export interface SupplyTableAdapter {
  /** `isNeedOverridden` says `need` was typed rather than worked out, so a rework leaves it. */
  addThread(
    threadId: string,
    stitchCount: number,
    need: number | null,
    isNeedOverridden?: boolean,
  ): Promise<Result>;
  addBead(beadId: string, need: number): Promise<Result>;
  addSpecialty(itemId: string, need: number): Promise<Result>;
  updateQuantity(
    type: SupplyType,
    junctionId: string,
    field: "stitchCount" | "need" | "have",
    value: number,
  ): Promise<Result>;
  /** Hands a thread's need back to the calculator: saves `need` and clears the typed mark. */
  backToCalculated(junctionId: string, need: number): Promise<Result>;
  remove(type: SupplyType, junctionId: string): Promise<Result>;
  searchSupplies(type: SupplyType, query: string): Promise<SupplySearchResult[]>;
  createSupply(type: SupplyType, data: CreateSupplyData): Promise<SupplySearchResult>;
}

export interface SupplyTableProps {
  threads: SupplyRow[];
  beads: SupplyRow[];
  specialty: SupplyRow[];
  adapter: SupplyTableAdapter;
  calcParams?: Partial<CalcParams>;
  existingSupplyIds?: Set<string>;
}

import type {
  SupplyTableAdapter,
  SupplyType,
  SupplyRow,
  SupplySearchResult,
  CreateSupplyData,
  CalcParams,
  Result,
} from "./types";
import { calculateSkeins } from "@/lib/utils/skein-calculator";

/**
 * Adapter for the chart creation flow that buffers supply rows in memory.
 *
 * Nothing is persisted until the final Create action calls createChartWithSupplies,
 * which wraps chart + supply creation in a single $transaction.
 *
 * Search and create operations delegate to injected functions (typically wrappers
 * around existing server actions) so the adapter stays testable without mocking
 * server modules directly.
 */
export class CreationFlowAdapter implements SupplyTableAdapter {
  private rows: Map<string, SupplyRow> = new Map();
  private supplyCache: Map<string, SupplySearchResult> = new Map();
  private calcParams: CalcParams | null = null;

  constructor(
    private onRowsChange: (rows: SupplyRow[]) => void,
    private searchFn: (type: SupplyType, query: string) => Promise<SupplySearchResult[]>,
    private createFn: (type: SupplyType, data: CreateSupplyData) => Promise<SupplySearchResult>,
  ) {}

  /**
   * Set calculation parameters for skein recalculation.
   * Called by SupplyTable when mergedCalcParams changes.
   */
  setCalcParams(params: CalcParams): void {
    this.calcParams = params;
  }

  async addThread(threadId: string, stitchCount: number, need: number): Promise<Result> {
    const duplicate = this.findDuplicate(threadId, "THREAD");
    if (duplicate) return { success: false, error: "Supply already added" };

    const meta = this.supplyCache.get(threadId);
    const id = crypto.randomUUID();
    const row: SupplyRow = {
      id,
      supplyId: threadId,
      type: "THREAD",
      code: meta?.code ?? "",
      name: meta?.name ?? "Unknown",
      brandName: meta?.brandName ?? "",
      hexColor: meta?.hexColor ?? "#000000",
      stitchCount,
      need,
      have: 0,
      isNeedOverridden: false,
    };
    this.rows.set(id, row);
    this.onRowsChange(this.getRows());
    return { success: true, id };
  }

  async addBead(beadId: string, _quantity: number, need: number): Promise<Result> {
    const duplicate = this.findDuplicate(beadId, "BEAD");
    if (duplicate) return { success: false, error: "Supply already added" };

    const meta = this.supplyCache.get(beadId);
    const id = crypto.randomUUID();
    const row: SupplyRow = {
      id,
      supplyId: beadId,
      type: "BEAD",
      code: meta?.code ?? "",
      name: meta?.name ?? "Unknown",
      brandName: meta?.brandName ?? "",
      hexColor: meta?.hexColor ?? "#000000",
      stitchCount: 0,
      need,
      have: 0,
      isNeedOverridden: false,
    };
    this.rows.set(id, row);
    this.onRowsChange(this.getRows());
    return { success: true, id };
  }

  async addSpecialty(itemId: string, need: number): Promise<Result> {
    const duplicate = this.findDuplicate(itemId, "SPECIALTY");
    if (duplicate) return { success: false, error: "Supply already added" };

    const meta = this.supplyCache.get(itemId);
    const id = crypto.randomUUID();
    const row: SupplyRow = {
      id,
      supplyId: itemId,
      type: "SPECIALTY",
      code: meta?.code ?? "",
      name: meta?.name ?? "Unknown",
      brandName: meta?.brandName ?? "",
      hexColor: meta?.hexColor ?? "#000000",
      stitchCount: 0,
      need,
      have: 0,
      isNeedOverridden: false,
    };
    this.rows.set(id, row);
    this.onRowsChange(this.getRows());
    return { success: true, id };
  }

  async updateQuantity(
    _type: SupplyType,
    junctionId: string,
    field: "stitchCount" | "need" | "have",
    value: number,
  ): Promise<Result> {
    const row = this.rows.get(junctionId);
    if (!row) {
      return { success: false, error: "Supply not found" };
    }

    let updated: SupplyRow;
    if (
      field === "stitchCount" &&
      row.type === "THREAD" &&
      !row.isNeedOverridden &&
      this.calcParams
    ) {
      const recalculated = calculateSkeins({
        stitchCount: value,
        strandCount: this.calcParams.strandCount,
        fabricCount: this.calcParams.fabricCount,
        overCount: this.calcParams.overCount,
        wastePercent: this.calcParams.wastePercent,
      });
      updated = { ...row, stitchCount: value, need: recalculated };
    } else {
      updated = { ...row, [field]: value };
    }

    this.rows.set(junctionId, updated);
    this.onRowsChange(this.getRows());
    return { success: true };
  }

  async remove(_type: SupplyType, junctionId: string): Promise<Result> {
    if (!this.rows.has(junctionId)) {
      return { success: false, error: "Supply not found" };
    }
    this.rows.delete(junctionId);
    this.onRowsChange(this.getRows());
    return { success: true };
  }

  async searchSupplies(type: SupplyType, query: string): Promise<SupplySearchResult[]> {
    const results = await this.searchFn(type, query);
    // Populate cache so add methods can resolve metadata
    for (const r of results) {
      this.supplyCache.set(r.id, r);
    }
    return results;
  }

  async createSupply(type: SupplyType, data: CreateSupplyData): Promise<SupplySearchResult> {
    const result = await this.createFn(type, data);
    // Populate cache so the subsequent add call can resolve metadata
    this.supplyCache.set(result.id, result);
    return result;
  }

  /**
   * Returns all buffered rows across all types.
   * Used by the form submission to build the batch supply payload.
   */
  getRows(): SupplyRow[] {
    return Array.from(this.rows.values());
  }

  /**
   * Populates the buffer from a serialized array.
   * Used for draft restore from localStorage.
   */
  loadRows(rows: SupplyRow[]): void {
    this.rows.clear();
    for (const row of rows) {
      this.rows.set(row.id, row);
    }
    this.onRowsChange(this.getRows());
  }

  /**
   * Check for duplicate supplyId within the same type.
   */
  private findDuplicate(supplyId: string, type: SupplyType): boolean {
    for (const row of this.rows.values()) {
      if (row.supplyId === supplyId && row.type === type) {
        return true;
      }
    }
    return false;
  }
}

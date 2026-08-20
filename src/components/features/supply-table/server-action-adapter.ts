"use client";

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
import {
  addThreadToProject,
  addBeadToProject,
  addSpecialtyToProject,
  updateProjectSupplyQuantity,
  removeProjectThread,
  removeProjectBead,
  removeProjectSpecialty,
  getThreads,
  getBeads,
  getSpecialtyItems,
  createAndAddThread,
  createAndAddBead,
  createAndAddSpecialty,
} from "@/lib/actions/supply-actions";

/**
 * Server-action adapter for the supply table on project detail.
 *
 * Bridges the SupplyTableAdapter interface to existing supply server actions.
 * Handles field name mapping (UI-friendly -> Prisma-style), type case mapping
 * (THREAD -> "thread"), and router.refresh() on success for data revalidation.
 *
 * Returns junction record IDs on add success for new-row animation wiring.
 */
export class ServerActionAdapter implements SupplyTableAdapter {
  private calcParams: CalcParams | null = null;
  private rows: SupplyRow[] = [];

  constructor(
    private projectId: string,
    private refreshFn: () => void,
  ) {}

  /**
   * Set calculation parameters for skein recalculation.
   * Called by SupplyTable when mergedCalcParams changes.
   */
  setCalcParams(params: CalcParams): void {
    this.calcParams = params;
  }

  /**
   * Keep adapter informed of current row state for isNeedOverridden lookup.
   * Called by SupplyTable when rows change.
   */
  setRows(rows: SupplyRow[]): void {
    this.rows = rows;
  }

  async addThread(threadId: string, stitchCount: number, need: number): Promise<Result> {
    const result = await addThreadToProject({
      projectId: this.projectId,
      threadId,
      stitchCount,
      quantityRequired: need,
      quantityAcquired: 0,
    });

    if (result.success) {
      this.refreshFn();
      return { success: true, id: result.record.id };
    }
    return { success: false, error: result.error };
  }

  async addBead(beadId: string, _quantity: number, need: number): Promise<Result> {
    const result = await addBeadToProject({
      projectId: this.projectId,
      beadId,
      quantityRequired: need,
      quantityAcquired: 0,
    });

    if (result.success) {
      this.refreshFn();
      return { success: true, id: result.record.id };
    }
    return { success: false, error: result.error };
  }

  async addSpecialty(itemId: string, need: number): Promise<Result> {
    const result = await addSpecialtyToProject({
      projectId: this.projectId,
      specialtyItemId: itemId,
      quantityRequired: need,
      quantityAcquired: 0,
    });

    if (result.success) {
      this.refreshFn();
      return { success: true, id: result.record.id };
    }
    return { success: false, error: result.error };
  }

  async updateQuantity(
    type: SupplyType,
    junctionId: string,
    field: "stitchCount" | "need" | "have",
    value: number,
  ): Promise<Result> {
    const lowercaseType = type.toLowerCase() as "thread" | "bead" | "specialty";

    let mappedData: Record<string, unknown>;
    switch (field) {
      case "stitchCount": {
        mappedData = { stitchCount: value };
        // Recalculate need if this is a non-overridden thread row with calcParams available
        const row = this.rows.find((r) => r.id === junctionId);
        if (row && row.type === "THREAD" && !row.isNeedOverridden && this.calcParams) {
          const recalculated = calculateSkeins({
            stitchCount: value,
            strandCount: this.calcParams.strandCount,
            fabricCount: this.calcParams.fabricCount,
            overCount: this.calcParams.overCount,
            wastePercent: this.calcParams.wastePercent,
          });
          mappedData.quantityRequired = recalculated;
        }
        break;
      }
      case "need":
        mappedData = { quantityRequired: value, isNeedOverridden: true };
        break;
      case "have":
        mappedData = { quantityAcquired: value };
        break;
    }

    const result = await updateProjectSupplyQuantity(junctionId, lowercaseType, mappedData);

    if (result.success) {
      this.refreshFn();
      return { success: true };
    }
    return { success: false, error: result.error };
  }

  async remove(type: SupplyType, junctionId: string): Promise<Result> {
    let result: { success: true } | { success: false; error: string };

    switch (type) {
      case "THREAD":
        result = await removeProjectThread(junctionId);
        break;
      case "BEAD":
        result = await removeProjectBead(junctionId);
        break;
      case "SPECIALTY":
        result = await removeProjectSpecialty(junctionId);
        break;
    }

    if (result.success) {
      this.refreshFn();
      return { success: true };
    }
    return { success: false, error: result.error };
  }

  async searchSupplies(type: SupplyType, query: string): Promise<SupplySearchResult[]> {
    switch (type) {
      case "THREAD": {
        const threads = await getThreads(undefined, undefined, query);
        return threads.map((t) => ({
          id: t.id,
          type: "THREAD" as const,
          code: t.colorCode,
          name: t.colorName,
          brandName: t.brand.name,
          brandId: t.brandId,
          hexColor: t.hexColor ?? "",
        }));
      }
      case "BEAD": {
        const beads = await getBeads(query);
        return beads.map((b) => ({
          id: b.id,
          type: "BEAD" as const,
          code: b.productCode,
          name: b.colorName,
          brandName: b.brand.name,
          brandId: b.brandId,
          hexColor: b.hexColor ?? "",
        }));
      }
      case "SPECIALTY": {
        const items = await getSpecialtyItems(query);
        return items.map((s) => ({
          id: s.id,
          type: "SPECIALTY" as const,
          code: s.productCode,
          name: s.colorName,
          brandName: s.brand.name,
          brandId: s.brandId,
          hexColor: s.hexColor ?? "",
        }));
      }
    }
  }

  async createSupply(type: SupplyType, data: CreateSupplyData): Promise<SupplySearchResult> {
    switch (type) {
      case "THREAD": {
        if (!data.colorFamily) throw new Error("Color family is required");
        const result = await createAndAddThread({
          projectId: this.projectId,
          name: data.name,
          colorCode: data.code,
          hexColor: data.hexColor,
          brandId: data.brandId,
          colorFamily: data.colorFamily,
        });
        if (!result.success) {
          throw new Error(result.error);
        }
        this.refreshFn();
        return {
          id: result.record.thread.id,
          type: "THREAD",
          code: result.record.thread.colorCode,
          name: result.record.thread.colorName,
          brandName: result.record.thread.brand.name,
          brandId: result.record.thread.brandId,
          hexColor: result.record.thread.hexColor ?? "",
        };
      }
      case "BEAD": {
        if (!data.colorFamily) throw new Error("Color family is required");
        const result = await createAndAddBead({
          projectId: this.projectId,
          name: data.name,
          code: data.code,
          brandId: data.brandId,
          colorFamily: data.colorFamily,
        });
        if (!result.success) {
          throw new Error(result.error);
        }
        this.refreshFn();
        return {
          id: result.record.bead.id,
          type: "BEAD",
          code: result.record.bead.productCode,
          name: result.record.bead.colorName,
          brandName: result.record.bead.brand.name,
          brandId: result.record.bead.brandId,
          hexColor: result.record.bead.hexColor ?? "",
        };
      }
      case "SPECIALTY": {
        const result = await createAndAddSpecialty({
          projectId: this.projectId,
          name: data.name,
          code: data.code,
          brandId: data.brandId,
        });
        if (!result.success) {
          throw new Error(result.error);
        }
        this.refreshFn();
        return {
          id: result.record.item.id,
          type: "SPECIALTY",
          code: result.record.item.productCode,
          name: result.record.item.colorName,
          brandName: result.record.item.brand.name,
          brandId: result.record.item.brandId,
          hexColor: result.record.item.hexColor ?? "",
        };
      }
    }
  }
}

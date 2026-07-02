import { DEFAULT_SUPPLY_HEX } from "@/lib/constants";
import type {
  SupplyTableAdapter,
  SupplyType,
  SupplyRow,
  SupplySearchResult,
  CreateSupplyData,
  Result,
} from "./types";

const MAX_SEARCH_RESULTS = 8;

/**
 * In-memory adapter for testing and isolated development.
 *
 * All methods are async to match the SupplyTableAdapter interface,
 * even though operations are synchronous. This ensures consuming
 * components handle the async adapter contract correctly.
 */
export class LocalStateAdapter implements SupplyTableAdapter {
  private searchPool: {
    threads: SupplySearchResult[];
    beads: SupplySearchResult[];
    specialty: SupplySearchResult[];
  };

  private rows: {
    threads: Map<string, SupplyRow>;
    beads: Map<string, SupplyRow>;
    specialty: Map<string, SupplyRow>;
  };

  constructor(
    initialThreads: SupplySearchResult[],
    initialBeads: SupplySearchResult[],
    initialSpecialty: SupplySearchResult[],
  ) {
    this.searchPool = {
      threads: [...initialThreads],
      beads: [...initialBeads],
      specialty: [...initialSpecialty],
    };
    this.rows = {
      threads: new Map(),
      beads: new Map(),
      specialty: new Map(),
    };
  }

  async searchSupplies(type: SupplyType, query: string): Promise<SupplySearchResult[]> {
    const pool = this.getPool(type);
    const q = query.toLowerCase();
    return pool
      .filter((s) => s.code.toLowerCase().includes(q) || s.name.toLowerCase().includes(q))
      .slice(0, MAX_SEARCH_RESULTS);
  }

  async addThread(threadId: string, stitchCount: number, need: number): Promise<Result> {
    const supply = this.searchPool.threads.find((t) => t.id === threadId);
    const id = crypto.randomUUID();
    const row: SupplyRow = {
      id,
      supplyId: threadId,
      type: "THREAD",
      code: supply?.code ?? "",
      name: supply?.name ?? "",
      brandName: supply?.brandName ?? "",
      hexColor: supply?.hexColor ?? "#000000",
      stitchCount,
      need,
      have: 0,
      isNeedOverridden: false,
    };
    this.rows.threads.set(id, row);
    return { success: true };
  }

  async addBead(beadId: string, quantity: number, need: number): Promise<Result> {
    const supply = this.searchPool.beads.find((b) => b.id === beadId);
    const id = crypto.randomUUID();
    const row: SupplyRow = {
      id,
      supplyId: beadId,
      type: "BEAD",
      code: supply?.code ?? "",
      name: supply?.name ?? "",
      brandName: supply?.brandName ?? "",
      hexColor: supply?.hexColor ?? "#000000",
      stitchCount: quantity,
      need,
      have: 0,
      isNeedOverridden: false,
    };
    this.rows.beads.set(id, row);
    return { success: true };
  }

  async addSpecialty(itemId: string, need: number): Promise<Result> {
    const supply = this.searchPool.specialty.find((s) => s.id === itemId);
    const id = crypto.randomUUID();
    const row: SupplyRow = {
      id,
      supplyId: itemId,
      type: "SPECIALTY",
      code: supply?.code ?? "",
      name: supply?.name ?? "",
      brandName: supply?.brandName ?? "",
      hexColor: supply?.hexColor ?? "#000000",
      stitchCount: 0,
      need,
      have: 0,
      isNeedOverridden: false,
    };
    this.rows.specialty.set(id, row);
    return { success: true };
  }

  async updateQuantity(
    type: SupplyType,
    junctionId: string,
    field: "stitchCount" | "need" | "have",
    value: number,
  ): Promise<Result> {
    const map = this.getMap(type);
    const row = map.get(junctionId);
    if (!row) {
      return { success: false, error: "Supply not found" };
    }
    row[field] = value;
    return { success: true };
  }

  async remove(type: SupplyType, junctionId: string): Promise<Result> {
    const map = this.getMap(type);
    if (!map.has(junctionId)) {
      return { success: false, error: "Supply not found" };
    }
    map.delete(junctionId);
    return { success: true };
  }

  async createSupply(type: SupplyType, data: CreateSupplyData): Promise<SupplySearchResult> {
    const result: SupplySearchResult = {
      id: crypto.randomUUID(),
      type,
      code: data.code ?? "",
      name: data.name,
      brandName: "Custom",
      brandId: data.brandId,
      hexColor: data.hexColor ?? DEFAULT_SUPPLY_HEX,
    };
    this.getPool(type).push(result);
    return result;
  }

  /**
   * Returns all rows across all types. Useful for testing assertions.
   */
  getRows(): SupplyRow[] {
    return [
      ...Array.from(this.rows.threads.values()),
      ...Array.from(this.rows.beads.values()),
      ...Array.from(this.rows.specialty.values()),
    ];
  }

  private getPool(type: SupplyType): SupplySearchResult[] {
    switch (type) {
      case "THREAD":
        return this.searchPool.threads;
      case "BEAD":
        return this.searchPool.beads;
      case "SPECIALTY":
        return this.searchPool.specialty;
    }
  }

  private getMap(type: SupplyType): Map<string, SupplyRow> {
    switch (type) {
      case "THREAD":
        return this.rows.threads;
      case "BEAD":
        return this.rows.beads;
      case "SPECIALTY":
        return this.rows.specialty;
    }
  }
}

import { describe, it, expect, beforeEach, vi } from "vitest";
import { ServerActionAdapter } from "./server-action-adapter";
import type { SupplySearchResult } from "./types";

vi.mock("@/lib/actions/supply-actions", () => ({
  addThreadToProject: vi.fn(),
  addBeadToProject: vi.fn(),
  addSpecialtyToProject: vi.fn(),
  updateProjectSupplyQuantity: vi.fn(),
  removeProjectThread: vi.fn(),
  removeProjectBead: vi.fn(),
  removeProjectSpecialty: vi.fn(),
  getThreads: vi.fn(),
  getBeads: vi.fn(),
  getSpecialtyItems: vi.fn(),
  createAndAddThread: vi.fn(),
  createAndAddBead: vi.fn(),
  createAndAddSpecialty: vi.fn(),
}));

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

const mockAddThread = vi.mocked(addThreadToProject);
const mockAddBead = vi.mocked(addBeadToProject);
const mockAddSpecialty = vi.mocked(addSpecialtyToProject);
const mockUpdateQuantity = vi.mocked(updateProjectSupplyQuantity);
const mockRemoveThread = vi.mocked(removeProjectThread);
const mockRemoveBead = vi.mocked(removeProjectBead);
const mockRemoveSpecialty = vi.mocked(removeProjectSpecialty);
const mockGetThreads = vi.mocked(getThreads);
const mockGetBeads = vi.mocked(getBeads);
const mockGetSpecialtyItems = vi.mocked(getSpecialtyItems);
const mockCreateAndAddThread = vi.mocked(createAndAddThread);
const mockCreateAndAddBead = vi.mocked(createAndAddBead);
const mockCreateAndAddSpecialty = vi.mocked(createAndAddSpecialty);

describe("ServerActionAdapter", () => {
  const projectId = "proj-1";
  let refreshFn: ReturnType<typeof vi.fn>;
  let adapter: ServerActionAdapter;

  beforeEach(() => {
    vi.clearAllMocks();
    refreshFn = vi.fn();
    adapter = new ServerActionAdapter(projectId, refreshFn);
  });

  describe("constructor", () => {
    it("accepts projectId and refreshFn", () => {
      expect(adapter).toBeInstanceOf(ServerActionAdapter);
    });
  });

  describe("addThread", () => {
    it("calls addThreadToProject with correct arguments", async () => {
      mockAddThread.mockResolvedValue({ success: true, record: { id: "pt-1" } } as never);

      await adapter.addThread("thread-1", 500, 2);

      expect(mockAddThread).toHaveBeenCalledWith({
        projectId: "proj-1",
        threadId: "thread-1",
        stitchCount: 500,
        quantityRequired: 2,
        quantityAcquired: 0,
      });
    });

    it("returns { success: true, id: record.id } on success", async () => {
      mockAddThread.mockResolvedValue({ success: true, record: { id: "pt-1" } } as never);

      const result = await adapter.addThread("thread-1", 500, 2);

      expect(result).toEqual({ success: true, id: "pt-1" });
    });

    it("calls refreshFn on success", async () => {
      mockAddThread.mockResolvedValue({ success: true, record: { id: "pt-1" } } as never);

      await adapter.addThread("thread-1", 500, 2);

      expect(refreshFn).toHaveBeenCalledTimes(1);
    });

    it("returns { success: false, error } on failure", async () => {
      mockAddThread.mockResolvedValue({ success: false, error: "Duplicate" });

      const result = await adapter.addThread("thread-1", 500, 2);

      expect(result).toEqual({ success: false, error: "Duplicate" });
    });

    it("does NOT call refreshFn on failure", async () => {
      mockAddThread.mockResolvedValue({ success: false, error: "Duplicate" });

      await adapter.addThread("thread-1", 500, 2);

      expect(refreshFn).not.toHaveBeenCalled();
    });
  });

  describe("addBead", () => {
    it("calls addBeadToProject with correct arguments", async () => {
      mockAddBead.mockResolvedValue({ success: true, record: { id: "pb-1" } } as never);

      await adapter.addBead("bead-1", 100, 3);

      expect(mockAddBead).toHaveBeenCalledWith({
        projectId: "proj-1",
        beadId: "bead-1",
        quantityRequired: 3,
        quantityAcquired: 0,
      });
    });

    it("returns { success: true, id: record.id } on success", async () => {
      mockAddBead.mockResolvedValue({ success: true, record: { id: "pb-1" } } as never);

      const result = await adapter.addBead("bead-1", 100, 3);

      expect(result).toEqual({ success: true, id: "pb-1" });
    });

    it("calls refreshFn on success", async () => {
      mockAddBead.mockResolvedValue({ success: true, record: { id: "pb-1" } } as never);

      await adapter.addBead("bead-1", 100, 3);

      expect(refreshFn).toHaveBeenCalledTimes(1);
    });
  });

  describe("addSpecialty", () => {
    it("calls addSpecialtyToProject with correct arguments", async () => {
      mockAddSpecialty.mockResolvedValue({ success: true, record: { id: "ps-1" } } as never);

      await adapter.addSpecialty("item-1", 1);

      expect(mockAddSpecialty).toHaveBeenCalledWith({
        projectId: "proj-1",
        specialtyItemId: "item-1",
        quantityRequired: 1,
        quantityAcquired: 0,
      });
    });

    it("returns { success: true, id: record.id } on success", async () => {
      mockAddSpecialty.mockResolvedValue({ success: true, record: { id: "ps-1" } } as never);

      const result = await adapter.addSpecialty("item-1", 1);

      expect(result).toEqual({ success: true, id: "ps-1" });
    });

    it("calls refreshFn on success", async () => {
      mockAddSpecialty.mockResolvedValue({ success: true, record: { id: "ps-1" } } as never);

      await adapter.addSpecialty("item-1", 1);

      expect(refreshFn).toHaveBeenCalledTimes(1);
    });
  });

  describe("updateQuantity", () => {
    it("maps THREAD to lowercase 'thread'", async () => {
      mockUpdateQuantity.mockResolvedValue({ success: true });

      await adapter.updateQuantity("THREAD", "jt-1", "stitchCount", 1000);

      expect(mockUpdateQuantity).toHaveBeenCalledWith("jt-1", "thread", { stitchCount: 1000 });
    });

    it("maps BEAD to lowercase 'bead'", async () => {
      mockUpdateQuantity.mockResolvedValue({ success: true });

      await adapter.updateQuantity("BEAD", "jb-1", "have", 5);

      expect(mockUpdateQuantity).toHaveBeenCalledWith("jb-1", "bead", { quantityAcquired: 5 });
    });

    it("maps SPECIALTY to lowercase 'specialty'", async () => {
      mockUpdateQuantity.mockResolvedValue({ success: true });

      await adapter.updateQuantity("SPECIALTY", "js-1", "need", 2);

      expect(mockUpdateQuantity).toHaveBeenCalledWith("js-1", "specialty", {
        quantityRequired: 2,
        isNeedOverridden: true,
      });
    });

    it("maps field 'stitchCount' to { stitchCount: value }", async () => {
      mockUpdateQuantity.mockResolvedValue({ success: true });

      await adapter.updateQuantity("THREAD", "jt-1", "stitchCount", 750);

      expect(mockUpdateQuantity).toHaveBeenCalledWith("jt-1", "thread", { stitchCount: 750 });
    });

    it("maps field 'need' to { quantityRequired: value, isNeedOverridden: true }", async () => {
      mockUpdateQuantity.mockResolvedValue({ success: true });

      await adapter.updateQuantity("THREAD", "jt-1", "need", 4);

      expect(mockUpdateQuantity).toHaveBeenCalledWith("jt-1", "thread", {
        quantityRequired: 4,
        isNeedOverridden: true,
      });
    });

    it("maps field 'have' to { quantityAcquired: value }", async () => {
      mockUpdateQuantity.mockResolvedValue({ success: true });

      await adapter.updateQuantity("THREAD", "jt-1", "have", 3);

      expect(mockUpdateQuantity).toHaveBeenCalledWith("jt-1", "thread", { quantityAcquired: 3 });
    });

    it("calls refreshFn on success", async () => {
      mockUpdateQuantity.mockResolvedValue({ success: true });

      await adapter.updateQuantity("THREAD", "jt-1", "stitchCount", 500);

      expect(refreshFn).toHaveBeenCalledTimes(1);
    });

    it("does NOT call refreshFn on failure", async () => {
      mockUpdateQuantity.mockResolvedValue({ success: false, error: "Not found" });

      await adapter.updateQuantity("THREAD", "jt-1", "stitchCount", 500);

      expect(refreshFn).not.toHaveBeenCalled();
    });
  });

  describe("updateQuantity recalculation", () => {
    it("sends both stitchCount AND recalculated quantityRequired when updating stitchCount on a non-overridden thread row", async () => {
      mockUpdateQuantity.mockResolvedValue({ success: true });

      // Set up rows so the adapter knows about isNeedOverridden
      adapter.setRows([{
        id: "jt-1",
        supplyId: "supply-1",
        type: "THREAD",
        code: "310",
        name: "Black",
        brandName: "DMC",
        hexColor: "#000000",
        stitchCount: 500,
        need: 2,
        have: 0,
        isNeedOverridden: false,
      }]);

      adapter.setCalcParams({ fabricCount: 14, strandCount: 2, overCount: 1, wastePercent: 20 });

      await adapter.updateQuantity("THREAD", "jt-1", "stitchCount", 1000);

      // calculateSkeins({ stitchCount: 1000, strandCount: 2, fabricCount: 14, overCount: 1, wastePercent: 20 })
      // = ceil(1000 * 2 * 1.2 / (14 * 255)) = ceil(2400 / 3570) = ceil(0.672) = 1
      expect(mockUpdateQuantity).toHaveBeenCalledWith("jt-1", "thread", {
        stitchCount: 1000,
        quantityRequired: 1,
      });
    });

    it("does NOT recalculate when updating stitchCount on an overridden thread row", async () => {
      mockUpdateQuantity.mockResolvedValue({ success: true });

      adapter.setRows([{
        id: "jt-1",
        supplyId: "supply-1",
        type: "THREAD",
        code: "310",
        name: "Black",
        brandName: "DMC",
        hexColor: "#000000",
        stitchCount: 500,
        need: 10,
        have: 0,
        isNeedOverridden: true,
      }]);

      adapter.setCalcParams({ fabricCount: 14, strandCount: 2, overCount: 1, wastePercent: 20 });

      await adapter.updateQuantity("THREAD", "jt-1", "stitchCount", 1000);

      // Should send just stitchCount, no quantityRequired
      expect(mockUpdateQuantity).toHaveBeenCalledWith("jt-1", "thread", {
        stitchCount: 1000,
      });
    });
  });

  describe("remove", () => {
    it("calls removeProjectThread for THREAD type", async () => {
      mockRemoveThread.mockResolvedValue({ success: true });

      await adapter.remove("THREAD", "jt-1");

      expect(mockRemoveThread).toHaveBeenCalledWith("jt-1");
    });

    it("calls removeProjectBead for BEAD type", async () => {
      mockRemoveBead.mockResolvedValue({ success: true });

      await adapter.remove("BEAD", "jb-1");

      expect(mockRemoveBead).toHaveBeenCalledWith("jb-1");
    });

    it("calls removeProjectSpecialty for SPECIALTY type", async () => {
      mockRemoveSpecialty.mockResolvedValue({ success: true });

      await adapter.remove("SPECIALTY", "js-1");

      expect(mockRemoveSpecialty).toHaveBeenCalledWith("js-1");
    });

    it("calls refreshFn on success", async () => {
      mockRemoveThread.mockResolvedValue({ success: true });

      await adapter.remove("THREAD", "jt-1");

      expect(refreshFn).toHaveBeenCalledTimes(1);
    });

    it("does NOT call refreshFn on failure", async () => {
      mockRemoveThread.mockResolvedValue({ success: false, error: "Not found" });

      await adapter.remove("THREAD", "jt-1");

      expect(refreshFn).not.toHaveBeenCalled();
    });
  });

  describe("searchSupplies", () => {
    it("calls getThreads for THREAD type", async () => {
      mockGetThreads.mockResolvedValue([]);

      await adapter.searchSupplies("THREAD", "310");

      expect(mockGetThreads).toHaveBeenCalledWith(undefined, undefined, "310");
    });

    it("calls getBeads for BEAD type", async () => {
      mockGetBeads.mockResolvedValue([]);

      await adapter.searchSupplies("BEAD", "Mill");

      expect(mockGetBeads).toHaveBeenCalledWith("Mill");
    });

    it("calls getSpecialtyItems for SPECIALTY type", async () => {
      mockGetSpecialtyItems.mockResolvedValue([]);

      await adapter.searchSupplies("SPECIALTY", "Gold");

      expect(mockGetSpecialtyItems).toHaveBeenCalledWith("Gold");
    });

    it("transforms ThreadWithBrand to SupplySearchResult", async () => {
      mockGetThreads.mockResolvedValue([
        {
          id: "t-1",
          colorCode: "310",
          colorName: "Black",
          hexColor: "#000000",
          brandId: "brand-1",
          brand: { id: "brand-1", name: "DMC" },
        },
      ] as never);

      const results = await adapter.searchSupplies("THREAD", "310");

      expect(results).toEqual<SupplySearchResult[]>([
        {
          id: "t-1",
          type: "THREAD",
          code: "310",
          name: "Black",
          brandName: "DMC",
          brandId: "brand-1",
          hexColor: "#000000",
        },
      ]);
    });

    it("transforms BeadWithBrand to SupplySearchResult", async () => {
      mockGetBeads.mockResolvedValue([
        {
          id: "b-1",
          productCode: "00123",
          colorName: "Red",
          hexColor: "#FF0000",
          brandId: "brand-2",
          brand: { id: "brand-2", name: "Mill Hill" },
        },
      ] as never);

      const results = await adapter.searchSupplies("BEAD", "Red");

      expect(results).toEqual<SupplySearchResult[]>([
        {
          id: "b-1",
          type: "BEAD",
          code: "00123",
          name: "Red",
          brandName: "Mill Hill",
          brandId: "brand-2",
          hexColor: "#FF0000",
        },
      ]);
    });

    it("transforms SpecialtyItemWithBrand to SupplySearchResult", async () => {
      mockGetSpecialtyItems.mockResolvedValue([
        {
          id: "s-1",
          productCode: "K001",
          colorName: "Gold Braid",
          hexColor: "#FFD700",
          brandId: "brand-3",
          brand: { id: "brand-3", name: "Kreinik" },
        },
      ] as never);

      const results = await adapter.searchSupplies("SPECIALTY", "Gold");

      expect(results).toEqual<SupplySearchResult[]>([
        {
          id: "s-1",
          type: "SPECIALTY",
          code: "K001",
          name: "Gold Braid",
          brandName: "Kreinik",
          brandId: "brand-3",
          hexColor: "#FFD700",
        },
      ]);
    });

    it("returns empty array when server action returns empty array", async () => {
      mockGetThreads.mockResolvedValue([]);

      const results = await adapter.searchSupplies("THREAD", "nonexistent");

      expect(results).toEqual([]);
    });
  });

  describe("createSupply", () => {
    it("calls createAndAddThread for THREAD type with correct arguments", async () => {
      mockCreateAndAddThread.mockResolvedValue({
        success: true,
        record: {
          thread: {
            id: "new-t-1",
            colorCode: "CT1",
            colorName: "Custom Thread",
            hexColor: "#FF00FF",
            brandId: "brand-1",
            brand: { id: "brand-1", name: "DMC" },
          },
          link: { id: "pt-new" },
        },
      } as never);

      await adapter.createSupply("THREAD", {
        name: "Custom Thread",
        code: "CT1",
        brandId: "brand-1",
        hexColor: "#FF00FF",
      });

      expect(mockCreateAndAddThread).toHaveBeenCalledWith({
        projectId: "proj-1",
        name: "Custom Thread",
        colorCode: "CT1",
        hexColor: "#FF00FF",
        brandId: "brand-1",
      });
    });

    it("calls createAndAddBead for BEAD type with correct arguments", async () => {
      mockCreateAndAddBead.mockResolvedValue({
        success: true,
        record: {
          bead: {
            id: "new-b-1",
            productCode: "B01",
            colorName: "Custom Bead",
            hexColor: "#808080",
            brandId: "brand-2",
            brand: { id: "brand-2", name: "Mill Hill" },
          },
          link: { id: "pb-new" },
        },
      } as never);

      await adapter.createSupply("BEAD", {
        name: "Custom Bead",
        code: "B01",
        brandId: "brand-2",
      });

      expect(mockCreateAndAddBead).toHaveBeenCalledWith({
        projectId: "proj-1",
        name: "Custom Bead",
        code: "B01",
        brandId: "brand-2",
      });
    });

    it("calls createAndAddSpecialty for SPECIALTY type with correct arguments", async () => {
      mockCreateAndAddSpecialty.mockResolvedValue({
        success: true,
        record: {
          item: {
            id: "new-s-1",
            productCode: "S01",
            colorName: "Custom Specialty",
            hexColor: "#808080",
            brandId: "brand-3",
            brand: { id: "brand-3", name: "Kreinik" },
          },
          link: { id: "ps-new" },
        },
      } as never);

      await adapter.createSupply("SPECIALTY", {
        name: "Custom Specialty",
        code: "S01",
        brandId: "brand-3",
      });

      expect(mockCreateAndAddSpecialty).toHaveBeenCalledWith({
        projectId: "proj-1",
        name: "Custom Specialty",
        code: "S01",
        brandId: "brand-3",
      });
    });

    it("transforms created thread record to SupplySearchResult", async () => {
      mockCreateAndAddThread.mockResolvedValue({
        success: true,
        record: {
          thread: {
            id: "new-t-1",
            colorCode: "CT1",
            colorName: "Custom Thread",
            hexColor: "#FF00FF",
            brandId: "brand-1",
            brand: { id: "brand-1", name: "DMC" },
          },
          link: { id: "pt-new" },
        },
      } as never);

      const result = await adapter.createSupply("THREAD", {
        name: "Custom Thread",
        code: "CT1",
        brandId: "brand-1",
        hexColor: "#FF00FF",
      });

      expect(result).toEqual<SupplySearchResult>({
        id: "new-t-1",
        type: "THREAD",
        code: "CT1",
        name: "Custom Thread",
        brandName: "DMC",
        brandId: "brand-1",
        hexColor: "#FF00FF",
      });
    });

    it("calls refreshFn on success", async () => {
      mockCreateAndAddThread.mockResolvedValue({
        success: true,
        record: {
          thread: {
            id: "new-t-1",
            colorCode: "CT1",
            colorName: "Custom Thread",
            hexColor: "#FF00FF",
            brandId: "brand-1",
            brand: { id: "brand-1", name: "DMC" },
          },
          link: { id: "pt-new" },
        },
      } as never);

      await adapter.createSupply("THREAD", {
        name: "Custom Thread",
        code: "CT1",
        brandId: "brand-1",
        hexColor: "#FF00FF",
      });

      expect(refreshFn).toHaveBeenCalledTimes(1);
    });

    it("throws on failure", async () => {
      mockCreateAndAddThread.mockResolvedValue({
        success: false,
        error: "Failed to create",
      });

      await expect(
        adapter.createSupply("THREAD", {
          name: "Fail Thread",
          code: "X",
          brandId: "brand-1",
        }),
      ).rejects.toThrow("Failed to create");
    });
  });
});

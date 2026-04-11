import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  createMockPrisma,
  createMockThread,
  createMockBead,
  createMockSpecialtyItem,
  createMockSupplyBrand,
  createMockProjectThread,
  createMockProjectBead,
  createMockProjectSpecialty,
} from "@/__tests__/mocks";

// Mock auth - default to authenticated
const mockAuth = vi.fn();
vi.mock("@/lib/auth", () => ({
  auth: mockAuth,
}));

const mockPrisma = createMockPrisma();
vi.mock("@/lib/db", () => ({
  prisma: mockPrisma,
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("shopping-actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue({
      user: { id: "user-1", name: "Test", email: "test@test.com" },
    });
  });

  // ─── Auth Guard ────────────────────────────────────────────────────────────

  describe("auth guard", () => {
    it("rejects unauthenticated calls to getShoppingList", async () => {
      mockAuth.mockResolvedValueOnce(null);
      const { getShoppingList } = await import("./shopping-actions");
      await expect(getShoppingList()).rejects.toThrow("Unauthorized");
    });

    it("rejects unauthenticated calls to markSupplyAcquired", async () => {
      mockAuth.mockResolvedValueOnce(null);
      const { markSupplyAcquired } = await import("./shopping-actions");
      await expect(
        markSupplyAcquired("thread", "pt-1"),
      ).rejects.toThrow("Unauthorized");
    });
  });

  // ─── getShoppingList ───────────────────────────────────────────────────────

  describe("getShoppingList", () => {
    const brand = createMockSupplyBrand();

    it("returns projects with unfulfilled threads", async () => {
      mockPrisma.project.findMany.mockResolvedValueOnce([
        {
          id: "proj-1",
          status: "IN_PROGRESS",
          chart: { name: "Test Chart", stitchesWide: 100, stitchesHigh: 50 },
          projectThreads: [
            {
              ...createMockProjectThread({
                id: "pt-1",
                quantityRequired: 3,
                quantityAcquired: 1,
              }),
              thread: { ...createMockThread(), brand },
            },
          ],
          projectBeads: [],
          projectSpecialty: [],
          fabric: null,
        },
      ]);

      const { getShoppingList } = await import("./shopping-actions");
      const result = await getShoppingList();

      expect(result).toHaveLength(1);
      expect(result[0].projectName).toBe("Test Chart");
      expect(result[0].unfulfilledThreads).toHaveLength(1);
      expect(result[0].unfulfilledThreads[0].quantityRequired).toBe(3);
      expect(result[0].unfulfilledThreads[0].quantityAcquired).toBe(1);
    });

    it("excludes fully fulfilled projects (per D-14)", async () => {
      mockPrisma.project.findMany.mockResolvedValueOnce([
        {
          id: "proj-1",
          status: "IN_PROGRESS",
          chart: { name: "Fulfilled Chart", stitchesWide: 100, stitchesHigh: 50 },
          projectThreads: [
            {
              ...createMockProjectThread({
                id: "pt-1",
                quantityRequired: 2,
                quantityAcquired: 2,
              }),
              thread: { ...createMockThread(), brand },
            },
          ],
          projectBeads: [],
          projectSpecialty: [],
          fabric: { id: "f1" },
        },
      ]);

      const { getShoppingList } = await import("./shopping-actions");
      const result = await getShoppingList();

      expect(result).toHaveLength(0);
    });

    it("includes fabric needs when project has dimensions but no linked fabric (per D-15)", async () => {
      mockPrisma.project.findMany.mockResolvedValueOnce([
        {
          id: "proj-1",
          status: "KITTING",
          chart: { name: "Needs Fabric", stitchesWide: 200, stitchesHigh: 150 },
          projectThreads: [
            {
              ...createMockProjectThread({
                id: "pt-1",
                quantityRequired: 1,
                quantityAcquired: 0,
              }),
              thread: { ...createMockThread(), brand },
            },
          ],
          projectBeads: [],
          projectSpecialty: [],
          fabric: null,
        },
      ]);

      const { getShoppingList } = await import("./shopping-actions");
      const result = await getShoppingList();

      expect(result).toHaveLength(1);
      expect(result[0].needsFabric).toBe(true);
      expect(result[0].fabricNeeds).not.toBeNull();
      expect(result[0].fabricNeeds!.widthInches).toBe(200);
      expect(result[0].fabricNeeds!.heightInches).toBe(150);
    });

    it("excludes projects with no supplies linked", async () => {
      mockPrisma.project.findMany.mockResolvedValueOnce([]);

      const { getShoppingList } = await import("./shopping-actions");
      const result = await getShoppingList();

      expect(result).toHaveLength(0);
    });

    it("includes unfulfilled beads and specialty items", async () => {
      mockPrisma.project.findMany.mockResolvedValueOnce([
        {
          id: "proj-1",
          status: "KITTING",
          chart: { name: "Mixed Supplies", stitchesWide: 0, stitchesHigh: 0 },
          projectThreads: [],
          projectBeads: [
            {
              ...createMockProjectBead({
                id: "pb-1",
                quantityRequired: 5,
                quantityAcquired: 2,
              }),
              bead: { ...createMockBead(), brand },
            },
          ],
          projectSpecialty: [
            {
              ...createMockProjectSpecialty({
                id: "ps-1",
                quantityRequired: 1,
                quantityAcquired: 0,
              }),
              specialtyItem: { ...createMockSpecialtyItem(), brand },
            },
          ],
          fabric: null,
        },
      ]);

      const { getShoppingList } = await import("./shopping-actions");
      const result = await getShoppingList();

      expect(result).toHaveLength(1);
      expect(result[0].unfulfilledBeads).toHaveLength(1);
      expect(result[0].unfulfilledSpecialty).toHaveLength(1);
    });

    it("does not flag fabric needs when project has no stitch dimensions", async () => {
      mockPrisma.project.findMany.mockResolvedValueOnce([
        {
          id: "proj-1",
          status: "IN_PROGRESS",
          chart: { name: "No Dims", stitchesWide: 0, stitchesHigh: 0 },
          projectThreads: [
            {
              ...createMockProjectThread({
                quantityRequired: 1,
                quantityAcquired: 0,
              }),
              thread: { ...createMockThread(), brand },
            },
          ],
          projectBeads: [],
          projectSpecialty: [],
          fabric: null,
        },
      ]);

      const { getShoppingList } = await import("./shopping-actions");
      const result = await getShoppingList();

      expect(result).toHaveLength(1);
      expect(result[0].needsFabric).toBe(false);
      expect(result[0].fabricNeeds).toBeNull();
    });
  });

  // ─── markSupplyAcquired ────────────────────────────────────────────────────

  describe("markSupplyAcquired", () => {
    it('updates quantityAcquired to match quantityRequired for thread', async () => {
      const record = createMockProjectThread({
        id: "pt-1",
        quantityRequired: 3,
        quantityAcquired: 0,
      });
      mockPrisma.projectThread.findUnique.mockResolvedValueOnce(record);
      mockPrisma.projectThread.update.mockResolvedValueOnce({
        ...record,
        quantityAcquired: 3,
      });

      const { markSupplyAcquired } = await import("./shopping-actions");
      const result = await markSupplyAcquired("thread", "pt-1");

      expect(result.success).toBe(true);
      expect(mockPrisma.projectThread.update).toHaveBeenCalledWith({
        where: { id: "pt-1" },
        data: { quantityAcquired: 3 },
      });
    });

    it('updates quantityAcquired for bead', async () => {
      const record = createMockProjectBead({
        id: "pb-1",
        quantityRequired: 5,
        quantityAcquired: 1,
      });
      mockPrisma.projectBead.findUnique.mockResolvedValueOnce(record);
      mockPrisma.projectBead.update.mockResolvedValueOnce({
        ...record,
        quantityAcquired: 5,
      });

      const { markSupplyAcquired } = await import("./shopping-actions");
      const result = await markSupplyAcquired("bead", "pb-1");

      expect(result.success).toBe(true);
      expect(mockPrisma.projectBead.update).toHaveBeenCalledWith({
        where: { id: "pb-1" },
        data: { quantityAcquired: 5 },
      });
    });

    it('updates quantityAcquired for specialty', async () => {
      const record = createMockProjectSpecialty({
        id: "ps-1",
        quantityRequired: 2,
        quantityAcquired: 0,
      });
      mockPrisma.projectSpecialty.findUnique.mockResolvedValueOnce(record);
      mockPrisma.projectSpecialty.update.mockResolvedValueOnce({
        ...record,
        quantityAcquired: 2,
      });

      const { markSupplyAcquired } = await import("./shopping-actions");
      const result = await markSupplyAcquired("specialty", "ps-1");

      expect(result.success).toBe(true);
      expect(mockPrisma.projectSpecialty.update).toHaveBeenCalledWith({
        where: { id: "ps-1" },
        data: { quantityAcquired: 2 },
      });
    });

    it("returns error when record not found", async () => {
      mockPrisma.projectThread.findUnique.mockResolvedValueOnce(null);

      const { markSupplyAcquired } = await import("./shopping-actions");
      const result = await markSupplyAcquired("thread", "nonexistent");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Record not found");
      }
    });
  });
});

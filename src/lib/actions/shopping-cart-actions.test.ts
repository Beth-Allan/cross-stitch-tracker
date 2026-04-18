import { describe, expect, it, vi, beforeEach } from "vitest";
import { createMockPrisma } from "@/__tests__/mocks";

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

describe("shopping-cart-actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue({
      user: { id: "user-1", name: "Test", email: "test@test.com" },
    });
  });

  // ─── getShoppingCartData ────────────────────────────────────────────────────

  describe("getShoppingCartData", () => {
    it("rejects unauthenticated calls", async () => {
      mockAuth.mockResolvedValueOnce(null);
      const { getShoppingCartData } = await import("./shopping-cart-actions");
      await expect(getShoppingCartData()).rejects.toThrow("Unauthorized");
    });

    it("returns projects with status NOT IN (FINISHED, FFO) that have supply entries", async () => {
      mockPrisma.project.findMany.mockResolvedValue([
        {
          id: "p1",
          chartId: "c1",
          userId: "user-1",
          status: "IN_PROGRESS",
          chart: {
            name: "Active Chart",
            stitchesWide: 200,
            stitchesHigh: 300,
            coverThumbnailUrl: null,
            designer: null,
          },
          projectThreads: [
            {
              id: "pt-1",
              threadId: "t1",
              quantityRequired: 3,
              quantityAcquired: 1,
              thread: {
                colorCode: "310",
                colorName: "Black",
                hexColor: "#000000",
                brand: { name: "DMC" },
              },
            },
          ],
          projectBeads: [],
          projectSpecialty: [],
          fabric: null,
        },
      ]);

      const { getShoppingCartData } = await import("./shopping-cart-actions");
      const result = await getShoppingCartData();

      expect(result.projects).toHaveLength(1);
      expect(result.projects[0].projectName).toBe("Active Chart");

      // Verify the prisma query excludes FINISHED and FFO
      expect(mockPrisma.project.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: "user-1",
            status: { notIn: ["FINISHED", "FFO"] },
          }),
        }),
      );
    });

    it("includes correct threadCount, beadCount, specialtyCount per project", async () => {
      mockPrisma.project.findMany.mockResolvedValue([
        {
          id: "p1",
          chartId: "c1",
          userId: "user-1",
          status: "KITTING",
          chart: {
            name: "Multi Supply Chart",
            stitchesWide: 100,
            stitchesHigh: 100,
            coverThumbnailUrl: null,
            designer: { name: "Designer A" },
          },
          projectThreads: [
            {
              id: "pt-1",
              threadId: "t1",
              quantityRequired: 2,
              quantityAcquired: 0,
              thread: {
                colorCode: "310",
                colorName: "Black",
                hexColor: "#000000",
                brand: { name: "DMC" },
              },
            },
            {
              id: "pt-2",
              threadId: "t2",
              quantityRequired: 1,
              quantityAcquired: 0,
              thread: {
                colorCode: "321",
                colorName: "Red",
                hexColor: "#FF0000",
                brand: { name: "DMC" },
              },
            },
          ],
          projectBeads: [
            {
              id: "pb-1",
              beadId: "b1",
              quantityRequired: 1,
              quantityAcquired: 0,
              bead: {
                productCode: "00123",
                colorName: "Red",
                hexColor: "#FF0000",
                brand: { name: "Mill Hill" },
              },
            },
          ],
          projectSpecialty: [
            {
              id: "ps-1",
              specialtyItemId: "s1",
              quantityRequired: 1,
              quantityAcquired: 0,
              specialtyItem: {
                productCode: "K001",
                colorName: "Gold Braid",
                hexColor: "#FFD700",
                brand: { name: "Kreinik" },
              },
            },
            {
              id: "ps-2",
              specialtyItemId: "s2",
              quantityRequired: 2,
              quantityAcquired: 1,
              specialtyItem: {
                productCode: "K002",
                colorName: "Silver Braid",
                hexColor: "#C0C0C0",
                brand: { name: "Kreinik" },
              },
            },
          ],
          fabric: null,
        },
      ]);

      const { getShoppingCartData } = await import("./shopping-cart-actions");
      const result = await getShoppingCartData();

      expect(result.projects[0].threadCount).toBe(2);
      expect(result.projects[0].beadCount).toBe(1);
      expect(result.projects[0].specialtyCount).toBe(2);
    });

    it("maps thread junction records to ShoppingSupplyNeed with correct fields", async () => {
      mockPrisma.project.findMany.mockResolvedValue([
        {
          id: "p1",
          chartId: "c1",
          userId: "user-1",
          status: "IN_PROGRESS",
          chart: {
            name: "Thread Chart",
            stitchesWide: 100,
            stitchesHigh: 100,
            coverThumbnailUrl: null,
            designer: null,
          },
          projectThreads: [
            {
              id: "pt-1",
              threadId: "t1",
              quantityRequired: 3,
              quantityAcquired: 1,
              thread: {
                colorCode: "310",
                colorName: "Black",
                hexColor: "#000000",
                brand: { name: "DMC" },
              },
            },
          ],
          projectBeads: [],
          projectSpecialty: [],
          fabric: null,
        },
      ]);

      const { getShoppingCartData } = await import("./shopping-cart-actions");
      const result = await getShoppingCartData();

      expect(result.threads).toHaveLength(1);
      expect(result.threads[0]).toEqual({
        junctionId: "pt-1",
        supplyId: "t1",
        brandName: "DMC",
        code: "310",
        colorName: "Black",
        hexColor: "#000000",
        quantityRequired: 3,
        quantityAcquired: 1,
        unit: "skeins",
        projectId: "p1",
        projectName: "Thread Chart",
      });
    });

    it("maps bead junction records to ShoppingSupplyNeed", async () => {
      mockPrisma.project.findMany.mockResolvedValue([
        {
          id: "p1",
          chartId: "c1",
          userId: "user-1",
          status: "UNSTARTED",
          chart: {
            name: "Bead Chart",
            stitchesWide: 0,
            stitchesHigh: 0,
            coverThumbnailUrl: null,
            designer: null,
          },
          projectThreads: [],
          projectBeads: [
            {
              id: "pb-1",
              beadId: "b1",
              quantityRequired: 2,
              quantityAcquired: 0,
              bead: {
                productCode: "00123",
                colorName: "Red",
                hexColor: "#FF0000",
                brand: { name: "Mill Hill" },
              },
            },
          ],
          projectSpecialty: [],
          fabric: { name: "White Aida" },
        },
      ]);

      const { getShoppingCartData } = await import("./shopping-cart-actions");
      const result = await getShoppingCartData();

      expect(result.beads).toHaveLength(1);
      expect(result.beads[0]).toEqual({
        junctionId: "pb-1",
        supplyId: "b1",
        brandName: "Mill Hill",
        code: "00123",
        colorName: "Red",
        hexColor: "#FF0000",
        quantityRequired: 2,
        quantityAcquired: 0,
        unit: "packs",
        projectId: "p1",
        projectName: "Bead Chart",
      });
    });

    it("maps specialty junction records to ShoppingSupplyNeed", async () => {
      mockPrisma.project.findMany.mockResolvedValue([
        {
          id: "p1",
          chartId: "c1",
          userId: "user-1",
          status: "KITTED",
          chart: {
            name: "Specialty Chart",
            stitchesWide: 50,
            stitchesHigh: 50,
            coverThumbnailUrl: null,
            designer: null,
          },
          projectThreads: [],
          projectBeads: [],
          projectSpecialty: [
            {
              id: "ps-1",
              specialtyItemId: "s1",
              quantityRequired: 1,
              quantityAcquired: 0,
              specialtyItem: {
                productCode: "K001",
                colorName: "Gold Braid",
                hexColor: "#FFD700",
                brand: { name: "Kreinik" },
              },
            },
          ],
          fabric: { name: "Evenweave" },
        },
      ]);

      const { getShoppingCartData } = await import("./shopping-cart-actions");
      const result = await getShoppingCartData();

      expect(result.specialty).toHaveLength(1);
      expect(result.specialty[0]).toEqual({
        junctionId: "ps-1",
        supplyId: "s1",
        brandName: "Kreinik",
        code: "K001",
        colorName: "Gold Braid",
        hexColor: "#FFD700",
        quantityRequired: 1,
        quantityAcquired: 0,
        unit: "packs",
        projectId: "p1",
        projectName: "Specialty Chart",
      });
    });

    it("includes projects where hasFabric=false and chart has dimensions in fabrics array", async () => {
      mockPrisma.project.findMany.mockResolvedValue([
        {
          id: "p1",
          chartId: "c1",
          userId: "user-1",
          status: "UNSTARTED",
          chart: {
            name: "Needs Fabric",
            stitchesWide: 200,
            stitchesHigh: 300,
            coverThumbnailUrl: null,
            designer: null,
          },
          projectThreads: [],
          projectBeads: [],
          projectSpecialty: [],
          fabric: null,
        },
        {
          id: "p2",
          chartId: "c2",
          userId: "user-1",
          status: "KITTING",
          chart: {
            name: "Has Fabric",
            stitchesWide: 100,
            stitchesHigh: 100,
            coverThumbnailUrl: null,
            designer: null,
          },
          projectThreads: [],
          projectBeads: [],
          projectSpecialty: [],
          fabric: { name: "White Aida" },
        },
        {
          id: "p3",
          chartId: "c3",
          userId: "user-1",
          status: "UNSTARTED",
          chart: {
            name: "No Dimensions",
            stitchesWide: 0,
            stitchesHigh: 0,
            coverThumbnailUrl: null,
            designer: null,
          },
          projectThreads: [],
          projectBeads: [],
          projectSpecialty: [],
          fabric: null,
        },
      ]);

      const { getShoppingCartData } = await import("./shopping-cart-actions");
      const result = await getShoppingCartData();

      // Only p1 needs fabric (no fabric, has dimensions)
      expect(result.fabrics).toHaveLength(1);
      expect(result.fabrics[0]).toEqual({
        projectId: "p1",
        projectName: "Needs Fabric",
        stitchesWide: 200,
        stitchesHigh: 300,
        hasFabric: false,
        fabricName: null,
      });
    });

    it("all queries filter by userId from requireAuth()", async () => {
      mockPrisma.project.findMany.mockResolvedValue([]);

      const { getShoppingCartData } = await import("./shopping-cart-actions");
      await getShoppingCartData();

      expect(mockPrisma.project.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: "user-1",
          }),
        }),
      );
    });
  });

  // ─── updateSupplyAcquired ─────────────────────────────────────────────────

  describe("updateSupplyAcquired", () => {
    it("rejects unauthenticated calls", async () => {
      mockAuth.mockResolvedValueOnce(null);
      const { updateSupplyAcquired } = await import("./shopping-cart-actions");
      await expect(updateSupplyAcquired("thread", "junction-1", 1)).rejects.toThrow("Unauthorized");
    });

    it("rejects when junction record not found", async () => {
      mockPrisma.projectThread.findUnique.mockResolvedValue(null);

      const { updateSupplyAcquired } = await import("./shopping-cart-actions");
      const result = await updateSupplyAcquired("thread", "nonexistent", 1);

      expect(result).toEqual({ success: false, error: "Record not found" });
    });

    it("rejects when project.userId does not match authenticated user (IDOR protection)", async () => {
      mockPrisma.projectThread.findUnique.mockResolvedValue({
        id: "junction-1",
        projectId: "project-1",
        quantityRequired: 3,
        quantityAcquired: 0,
        project: { userId: "other-user" },
      });

      const { updateSupplyAcquired } = await import("./shopping-cart-actions");
      const result = await updateSupplyAcquired("thread", "junction-1", 2);

      expect(result).toEqual({ success: false, error: "Unauthorized" });
      expect(mockPrisma.projectThread.update).not.toHaveBeenCalled();
    });

    it("rejects negative quantity (Zod validation error)", async () => {
      const { updateSupplyAcquired } = await import("./shopping-cart-actions");
      const result = await updateSupplyAcquired("thread", "junction-1", -1);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("rejects non-integer quantity (Zod validation error)", async () => {
      const { updateSupplyAcquired } = await import("./shopping-cart-actions");
      const result = await updateSupplyAcquired("thread", "junction-1", 1.5);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("updates quantityAcquired for thread type and revalidates /shopping path", async () => {
      mockPrisma.projectThread.findUnique.mockResolvedValue({
        id: "junction-1",
        projectId: "project-1",
        quantityRequired: 3,
        quantityAcquired: 0,
        project: { userId: "user-1" },
      });
      mockPrisma.projectThread.update.mockResolvedValue({});

      const { revalidatePath } = await import("next/cache");
      const { updateSupplyAcquired } = await import("./shopping-cart-actions");
      const result = await updateSupplyAcquired("thread", "junction-1", 2);

      expect(result).toEqual({ success: true });
      expect(mockPrisma.projectThread.update).toHaveBeenCalledWith({
        where: { id: "junction-1" },
        data: { quantityAcquired: 2 },
      });
      expect(revalidatePath).toHaveBeenCalledWith("/shopping");
    });

    it("updates quantityAcquired for bead type", async () => {
      mockPrisma.projectBead.findUnique.mockResolvedValue({
        id: "junction-2",
        projectId: "project-1",
        quantityRequired: 5,
        quantityAcquired: 0,
        project: { userId: "user-1" },
      });
      mockPrisma.projectBead.update.mockResolvedValue({});

      const { updateSupplyAcquired } = await import("./shopping-cart-actions");
      const result = await updateSupplyAcquired("bead", "junction-2", 3);

      expect(result).toEqual({ success: true });
      expect(mockPrisma.projectBead.update).toHaveBeenCalledWith({
        where: { id: "junction-2" },
        data: { quantityAcquired: 3 },
      });
    });

    it("updates quantityAcquired for specialty type", async () => {
      mockPrisma.projectSpecialty.findUnique.mockResolvedValue({
        id: "junction-3",
        projectId: "project-1",
        quantityRequired: 2,
        quantityAcquired: 0,
        project: { userId: "user-1" },
      });
      mockPrisma.projectSpecialty.update.mockResolvedValue({});

      const { updateSupplyAcquired } = await import("./shopping-cart-actions");
      const result = await updateSupplyAcquired("specialty", "junction-3", 1);

      expect(result).toEqual({ success: true });
      expect(mockPrisma.projectSpecialty.update).toHaveBeenCalledWith({
        where: { id: "junction-3" },
        data: { quantityAcquired: 1 },
      });
    });
  });
});

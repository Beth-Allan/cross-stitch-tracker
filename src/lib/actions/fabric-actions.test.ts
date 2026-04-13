import { describe, expect, it, vi, beforeEach } from "vitest";
import { createMockPrisma, createMockFabricBrand, createMockFabric } from "@/__tests__/mocks";

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

describe("fabric-actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default to authenticated user
    mockAuth.mockResolvedValue({ user: { id: "user-1", name: "Test", email: "test@test.com" } });
  });

  // ─── Fabric Brand Auth Guard ──────────────────────────────────────────────

  describe("fabric brand auth guard", () => {
    it("rejects unauthenticated calls to createFabricBrand", async () => {
      mockAuth.mockResolvedValueOnce(null);
      const { createFabricBrand } = await import("./fabric-actions");

      await expect(createFabricBrand({ name: "Test" })).rejects.toThrow("Unauthorized");
    });

    it("rejects unauthenticated calls to updateFabricBrand", async () => {
      mockAuth.mockResolvedValueOnce(null);
      const { updateFabricBrand } = await import("./fabric-actions");

      await expect(updateFabricBrand("fb-1", { name: "Test" })).rejects.toThrow("Unauthorized");
    });

    it("rejects unauthenticated calls to deleteFabricBrand", async () => {
      mockAuth.mockResolvedValueOnce(null);
      const { deleteFabricBrand } = await import("./fabric-actions");

      await expect(deleteFabricBrand("fb-1")).rejects.toThrow("Unauthorized");
    });

    it("rejects unauthenticated calls to getFabricBrands", async () => {
      mockAuth.mockResolvedValueOnce(null);
      const { getFabricBrands } = await import("./fabric-actions");

      await expect(getFabricBrands()).rejects.toThrow("Unauthorized");
    });
  });

  // ─── createFabricBrand ────────────────────────────────────────────────────

  describe("createFabricBrand", () => {
    it("creates a brand with valid data and returns success", async () => {
      const mockBrand = createMockFabricBrand({ name: "Zweigart" });
      mockPrisma.fabricBrand.create.mockResolvedValueOnce(mockBrand);
      const { createFabricBrand } = await import("./fabric-actions");

      const result = await createFabricBrand({ name: "Zweigart" });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.brand.name).toBe("Zweigart");
      }
      expect(mockPrisma.fabricBrand.create).toHaveBeenCalledWith({
        data: { name: "Zweigart", website: null },
      });
    });

    it("creates a brand with website", async () => {
      const mockBrand = createMockFabricBrand({
        name: "Charles Craft",
        website: "https://charlescraftinc.com",
      });
      mockPrisma.fabricBrand.create.mockResolvedValueOnce(mockBrand);
      const { createFabricBrand } = await import("./fabric-actions");

      const result = await createFabricBrand({
        name: "Charles Craft",
        website: "https://charlescraftinc.com",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.brand.website).toBe("https://charlescraftinc.com");
      }
    });

    it("returns error for duplicate name (P2002)", async () => {
      const p2002Error = Object.assign(new Error("Unique constraint"), { code: "P2002" });
      mockPrisma.fabricBrand.create.mockRejectedValueOnce(p2002Error);
      const { createFabricBrand } = await import("./fabric-actions");

      const result = await createFabricBrand({ name: "Zweigart" });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("A brand with that name already exists.");
      }
    });

    it("returns validation error for empty name", async () => {
      const { createFabricBrand } = await import("./fabric-actions");

      const result = await createFabricBrand({ name: "" });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Brand name is required");
      }
    });

    it("returns validation error for invalid website URL", async () => {
      const { createFabricBrand } = await import("./fabric-actions");

      const result = await createFabricBrand({ name: "Test", website: "not-a-url" });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Must be a valid URL");
      }
    });
  });

  // ─── updateFabricBrand ────────────────────────────────────────────────────

  describe("updateFabricBrand", () => {
    it("updates name and website", async () => {
      const updatedBrand = createMockFabricBrand({
        id: "fb-1",
        name: "Updated Brand",
        website: "https://updated.com",
      });
      mockPrisma.fabricBrand.update.mockResolvedValueOnce(updatedBrand);
      const { updateFabricBrand } = await import("./fabric-actions");

      const result = await updateFabricBrand("fb-1", {
        name: "Updated Brand",
        website: "https://updated.com",
      });

      expect(result.success).toBe(true);
      expect(mockPrisma.fabricBrand.update).toHaveBeenCalledWith({
        where: { id: "fb-1" },
        data: { name: "Updated Brand", website: "https://updated.com" },
      });
    });

    it("returns error for duplicate name (P2002)", async () => {
      const p2002Error = Object.assign(new Error("Unique constraint"), { code: "P2002" });
      mockPrisma.fabricBrand.update.mockRejectedValueOnce(p2002Error);
      const { updateFabricBrand } = await import("./fabric-actions");

      const result = await updateFabricBrand("fb-1", { name: "Existing Brand" });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("A brand with that name already exists.");
      }
    });

    it("returns validation error for invalid input", async () => {
      const { updateFabricBrand } = await import("./fabric-actions");

      const result = await updateFabricBrand("fb-1", { name: "" });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Brand name is required");
      }
    });
  });

  // ─── deleteFabricBrand ────────────────────────────────────────────────────

  describe("deleteFabricBrand", () => {
    it("deletes the brand and returns success", async () => {
      mockPrisma.fabricBrand.delete.mockResolvedValueOnce(createMockFabricBrand({ id: "fb-1" }));
      const { deleteFabricBrand } = await import("./fabric-actions");

      const result = await deleteFabricBrand("fb-1");

      expect(result.success).toBe(true);
      expect(mockPrisma.fabricBrand.delete).toHaveBeenCalledWith({ where: { id: "fb-1" } });
    });

    it("returns error on Prisma failure", async () => {
      mockPrisma.fabricBrand.delete.mockRejectedValueOnce(new Error("DB error"));
      const { deleteFabricBrand } = await import("./fabric-actions");
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const result = await deleteFabricBrand("fb-1");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Failed to delete brand");
      }
      consoleSpy.mockRestore();
    });
  });

  // ─── getFabricBrands ──────────────────────────────────────────────────────

  describe("getFabricBrands", () => {
    it("returns brands with fabric counts ordered by name", async () => {
      mockPrisma.fabricBrand.findMany.mockResolvedValueOnce([
        { ...createMockFabricBrand({ id: "fb-1", name: "Charles Craft" }), _count: { fabrics: 3 } },
        { ...createMockFabricBrand({ id: "fb-2", name: "Zweigart" }), _count: { fabrics: 7 } },
      ]);
      const { getFabricBrands } = await import("./fabric-actions");

      const result = await getFabricBrands();

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe("Charles Craft");
      expect(result[1].name).toBe("Zweigart");
      expect(mockPrisma.fabricBrand.findMany).toHaveBeenCalledWith({
        include: { _count: { select: { fabrics: true } } },
        orderBy: { name: "asc" },
      });
    });

    it("returns empty array on error", async () => {
      mockPrisma.fabricBrand.findMany.mockRejectedValueOnce(new Error("DB error"));
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const { getFabricBrands } = await import("./fabric-actions");

      const result = await getFabricBrands();

      expect(result).toEqual([]);
      consoleSpy.mockRestore();
    });
  });

  // ─── Fabric Auth Guard ────────────────────────────────────────────────────

  describe("fabric auth guard", () => {
    it("rejects unauthenticated calls to createFabric", async () => {
      mockAuth.mockResolvedValueOnce(null);
      const { createFabric } = await import("./fabric-actions");

      await expect(
        createFabric({
          name: "Test",
          brandId: "fb-1",
          count: 14,
          type: "Aida",
          colorFamily: "White",
          colorType: "White",
        }),
      ).rejects.toThrow("Unauthorized");
    });

    it("rejects unauthenticated calls to updateFabric", async () => {
      mockAuth.mockResolvedValueOnce(null);
      const { updateFabric } = await import("./fabric-actions");

      await expect(
        updateFabric("fabric-1", {
          name: "Test",
          brandId: "fb-1",
          count: 14,
          type: "Aida",
          colorFamily: "White",
          colorType: "White",
        }),
      ).rejects.toThrow("Unauthorized");
    });

    it("rejects unauthenticated calls to deleteFabric", async () => {
      mockAuth.mockResolvedValueOnce(null);
      const { deleteFabric } = await import("./fabric-actions");

      await expect(deleteFabric("fabric-1")).rejects.toThrow("Unauthorized");
    });

    it("rejects unauthenticated calls to getFabric", async () => {
      mockAuth.mockResolvedValueOnce(null);
      const { getFabric } = await import("./fabric-actions");

      await expect(getFabric("fabric-1")).rejects.toThrow("Unauthorized");
    });

    it("rejects unauthenticated calls to getFabrics", async () => {
      mockAuth.mockResolvedValueOnce(null);
      const { getFabrics } = await import("./fabric-actions");

      await expect(getFabrics()).rejects.toThrow("Unauthorized");
    });
  });

  // ─── createFabric ─────────────────────────────────────────────────────────

  describe("createFabric", () => {
    const validFabricData = {
      name: "White Aida 14ct",
      brandId: "fb-1",
      count: 14,
      type: "Aida" as const,
      colorFamily: "White" as const,
      colorType: "White" as const,
      shortestEdgeInches: 18,
      longestEdgeInches: 24,
      needToBuy: false,
      linkedProjectId: null,
    };

    it("creates a fabric with valid data and returns success", async () => {
      const mockFabricRecord = createMockFabric({ name: "White Aida 14ct" });
      mockPrisma.fabric.create.mockResolvedValueOnce(mockFabricRecord);
      const { createFabric } = await import("./fabric-actions");

      const result = await createFabric(validFabricData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.fabric.name).toBe("White Aida 14ct");
      }
      expect(mockPrisma.fabric.create).toHaveBeenCalledWith({
        data: validFabricData,
      });
    });

    it("revalidates shopping path on create", async () => {
      const { revalidatePath } = await import("next/cache");
      mockPrisma.fabric.create.mockResolvedValueOnce(createMockFabric());
      const { createFabric } = await import("./fabric-actions");

      await createFabric(validFabricData);

      expect(revalidatePath).toHaveBeenCalledWith("/fabric");
      expect(revalidatePath).toHaveBeenCalledWith("/shopping");
    });

    it("revalidates linked project path when linkedProjectId is set", async () => {
      const { revalidatePath } = await import("next/cache");
      const dataWithProject = { ...validFabricData, linkedProjectId: "proj-1" };
      mockPrisma.fabric.create.mockResolvedValueOnce(
        createMockFabric({ linkedProjectId: "proj-1" }),
      );
      const { createFabric } = await import("./fabric-actions");

      await createFabric(dataWithProject);

      expect(revalidatePath).toHaveBeenCalledWith("/charts/proj-1");
    });

    it("returns P2002 error for duplicate linkedProjectId", async () => {
      const p2002Error = Object.assign(new Error("Unique constraint"), { code: "P2002" });
      mockPrisma.fabric.create.mockRejectedValueOnce(p2002Error);
      const { createFabric } = await import("./fabric-actions");

      const dataWithProject = { ...validFabricData, linkedProjectId: "proj-1" };
      const result = await createFabric(dataWithProject);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe(
          "This project already has fabric linked. Edit the existing fabric instead.",
        );
      }
    });

    it("returns validation error for missing name", async () => {
      const { createFabric } = await import("./fabric-actions");

      const result = await createFabric({ ...validFabricData, name: "" });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Name is required");
      }
    });

    it("returns validation error for invalid count", async () => {
      const { createFabric } = await import("./fabric-actions");

      const result = await createFabric({ ...validFabricData, count: 0 });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Count is required");
      }
    });

    it("returns validation error for invalid type", async () => {
      const { createFabric } = await import("./fabric-actions");

      const result = await createFabric({ ...validFabricData, type: "InvalidType" });

      expect(result.success).toBe(false);
    });
  });

  // ─── updateFabric ─────────────────────────────────────────────────────────

  describe("updateFabric", () => {
    const validUpdateData = {
      name: "Updated Fabric",
      brandId: "fb-1",
      count: 16,
      type: "Linen" as const,
      colorFamily: "Cream" as const,
      colorType: "Cream" as const,
      shortestEdgeInches: 20,
      longestEdgeInches: 28,
      needToBuy: true,
      linkedProjectId: null,
    };

    it("updates all fields and returns success", async () => {
      const updatedFabric = createMockFabric({
        id: "fabric-1",
        name: "Updated Fabric",
        count: 16,
        type: "Linen",
      });
      mockPrisma.fabric.update.mockResolvedValueOnce(updatedFabric);
      const { updateFabric } = await import("./fabric-actions");

      const result = await updateFabric("fabric-1", validUpdateData);

      expect(result.success).toBe(true);
      expect(mockPrisma.fabric.update).toHaveBeenCalledWith({
        where: { id: "fabric-1" },
        data: validUpdateData,
      });
    });

    it("revalidates fabric detail and shopping paths", async () => {
      const { revalidatePath } = await import("next/cache");
      mockPrisma.fabric.update.mockResolvedValueOnce(createMockFabric({ id: "fabric-1" }));
      const { updateFabric } = await import("./fabric-actions");

      await updateFabric("fabric-1", validUpdateData);

      expect(revalidatePath).toHaveBeenCalledWith("/fabric");
      expect(revalidatePath).toHaveBeenCalledWith("/fabric/fabric-1");
      expect(revalidatePath).toHaveBeenCalledWith("/shopping");
    });

    it("returns P2002 error for duplicate linkedProjectId", async () => {
      const p2002Error = Object.assign(new Error("Unique constraint"), { code: "P2002" });
      mockPrisma.fabric.update.mockRejectedValueOnce(p2002Error);
      const { updateFabric } = await import("./fabric-actions");

      const result = await updateFabric("fabric-1", {
        ...validUpdateData,
        linkedProjectId: "proj-1",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe(
          "This project already has fabric linked. Edit the existing fabric instead.",
        );
      }
    });

    it("returns validation error for invalid input", async () => {
      const { updateFabric } = await import("./fabric-actions");

      const result = await updateFabric("fabric-1", { ...validUpdateData, name: "" });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Name is required");
      }
    });
  });

  // ─── deleteFabric ─────────────────────────────────────────────────────────

  describe("deleteFabric", () => {
    it("deletes the fabric and returns success", async () => {
      mockPrisma.fabric.delete.mockResolvedValueOnce(createMockFabric({ id: "fabric-1" }));
      const { deleteFabric } = await import("./fabric-actions");

      const result = await deleteFabric("fabric-1");

      expect(result.success).toBe(true);
      expect(mockPrisma.fabric.delete).toHaveBeenCalledWith({ where: { id: "fabric-1" } });
    });

    it("revalidates fabric and shopping paths", async () => {
      const { revalidatePath } = await import("next/cache");
      mockPrisma.fabric.delete.mockResolvedValueOnce(createMockFabric({ id: "fabric-1" }));
      const { deleteFabric } = await import("./fabric-actions");

      await deleteFabric("fabric-1");

      expect(revalidatePath).toHaveBeenCalledWith("/fabric");
      expect(revalidatePath).toHaveBeenCalledWith("/shopping");
    });

    it("returns error on Prisma failure", async () => {
      mockPrisma.fabric.delete.mockRejectedValueOnce(new Error("DB error"));
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const { deleteFabric } = await import("./fabric-actions");

      const result = await deleteFabric("fabric-1");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Failed to delete fabric");
      }
      consoleSpy.mockRestore();
    });
  });

  // ─── getFabric ────────────────────────────────────────────────────────────

  describe("getFabric", () => {
    it("returns fabric with brand and linked project details", async () => {
      const fabricWithRelations = {
        ...createMockFabric({ id: "fabric-1", linkedProjectId: "proj-1" }),
        brand: createMockFabricBrand({ id: "fb-1", name: "Zweigart" }),
        linkedProject: {
          id: "proj-1",
          userId: "user-1",
          chart: { name: "Test Chart", stitchesWide: 100, stitchesHigh: 50 },
        },
      };
      mockPrisma.fabric.findUnique.mockResolvedValueOnce(fabricWithRelations);
      const { getFabric } = await import("./fabric-actions");

      const result = await getFabric("fabric-1");

      expect(result).not.toBeNull();
      expect(result!.brand.name).toBe("Zweigart");
      expect(result!.linkedProject).not.toBeNull();
      expect(result!.linkedProject!.chart.name).toBe("Test Chart");
      expect(mockPrisma.fabric.findUnique).toHaveBeenCalledWith({
        where: { id: "fabric-1" },
        include: {
          brand: true,
          linkedProject: {
            include: {
              chart: { select: { id: true, name: true, stitchesWide: true, stitchesHigh: true } },
            },
          },
        },
      });
    });

    it("returns null when linked project belongs to another user", async () => {
      const fabricWithRelations = {
        ...createMockFabric({ id: "fabric-1", linkedProjectId: "proj-1" }),
        brand: createMockFabricBrand({ id: "fb-1", name: "Zweigart" }),
        linkedProject: {
          id: "proj-1",
          userId: "other-user",
          chart: { name: "Test Chart", stitchesWide: 100, stitchesHigh: 50 },
        },
      };
      mockPrisma.fabric.findUnique.mockResolvedValueOnce(fabricWithRelations);
      const { getFabric } = await import("./fabric-actions");

      const result = await getFabric("fabric-1");

      expect(result).toBeNull();
    });

    it("returns null for non-existent fabric", async () => {
      mockPrisma.fabric.findUnique.mockResolvedValueOnce(null);
      const { getFabric } = await import("./fabric-actions");

      const result = await getFabric("nonexistent");

      expect(result).toBeNull();
    });

    it("returns null on error", async () => {
      mockPrisma.fabric.findUnique.mockRejectedValueOnce(new Error("DB error"));
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const { getFabric } = await import("./fabric-actions");

      const result = await getFabric("fabric-1");

      expect(result).toBeNull();
      consoleSpy.mockRestore();
    });
  });

  // ─── getFabrics ───────────────────────────────────────────────────────────

  describe("getFabrics", () => {
    it("returns all fabrics with brand included, ordered by name", async () => {
      mockPrisma.fabric.findMany.mockResolvedValueOnce([
        {
          ...createMockFabric({ id: "fabric-1", name: "Cream Linen 28ct" }),
          brand: createMockFabricBrand({ name: "Zweigart" }),
          linkedProject: null,
        },
        {
          ...createMockFabric({ id: "fabric-2", name: "White Aida 14ct" }),
          brand: createMockFabricBrand({ name: "Charles Craft" }),
          linkedProject: { id: "proj-1", chart: { name: "Test Chart" } },
        },
      ]);
      const { getFabrics } = await import("./fabric-actions");

      const result = await getFabrics();

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe("Cream Linen 28ct");
      expect(mockPrisma.fabric.findMany).toHaveBeenCalledWith({
        where: {
          OR: [{ linkedProjectId: null }, { linkedProject: { userId: "user-1" } }],
        },
        include: {
          brand: true,
          linkedProject: { include: { chart: { select: { name: true } } } },
        },
        orderBy: { name: "asc" },
      });
    });

    it("returns empty array on error", async () => {
      mockPrisma.fabric.findMany.mockRejectedValueOnce(new Error("DB error"));
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const { getFabrics } = await import("./fabric-actions");

      const result = await getFabrics();

      expect(result).toEqual([]);
      consoleSpy.mockRestore();
    });
  });
});

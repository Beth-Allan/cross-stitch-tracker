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
});

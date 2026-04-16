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

describe("supply-actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue({
      user: { id: "user-1", name: "Test", email: "test@test.com" },
    });
  });

  // ─── Auth Guard ────────────────────────────────────────────────────────────

  describe("auth guard", () => {
    it("rejects unauthenticated calls to createThread", async () => {
      mockAuth.mockResolvedValueOnce(null);
      const { createThread } = await import("./supply-actions");
      await expect(
        createThread({
          brandId: "b1",
          colorCode: "310",
          colorName: "Black",
          hexColor: "#000000",
          colorFamily: "BLACK",
        }),
      ).rejects.toThrow("Unauthorized");
    });

    it("rejects unauthenticated calls to updateThread", async () => {
      mockAuth.mockResolvedValueOnce(null);
      const { updateThread } = await import("./supply-actions");
      await expect(
        updateThread("t1", {
          brandId: "b1",
          colorCode: "310",
          colorName: "Black",
          hexColor: "#000000",
          colorFamily: "BLACK",
        }),
      ).rejects.toThrow("Unauthorized");
    });

    it("rejects unauthenticated calls to deleteThread", async () => {
      mockAuth.mockResolvedValueOnce(null);
      const { deleteThread } = await import("./supply-actions");
      await expect(deleteThread("t1")).rejects.toThrow("Unauthorized");
    });

    it("rejects unauthenticated calls to getThreads", async () => {
      mockAuth.mockResolvedValueOnce(null);
      const { getThreads } = await import("./supply-actions");
      await expect(getThreads()).rejects.toThrow("Unauthorized");
    });

    it("rejects unauthenticated calls to createBead", async () => {
      mockAuth.mockResolvedValueOnce(null);
      const { createBead } = await import("./supply-actions");
      await expect(
        createBead({
          brandId: "b1",
          productCode: "00123",
          colorName: "Red",
          hexColor: "#FF0000",
          colorFamily: "RED",
        }),
      ).rejects.toThrow("Unauthorized");
    });

    it("rejects unauthenticated calls to createSpecialtyItem", async () => {
      mockAuth.mockResolvedValueOnce(null);
      const { createSpecialtyItem } = await import("./supply-actions");
      await expect(
        createSpecialtyItem({
          brandId: "b1",
          productCode: "K001",
          colorName: "Gold",
          hexColor: "#FFD700",
        }),
      ).rejects.toThrow("Unauthorized");
    });

    it("rejects unauthenticated calls to createSupplyBrand", async () => {
      mockAuth.mockResolvedValueOnce(null);
      const { createSupplyBrand } = await import("./supply-actions");
      await expect(createSupplyBrand({ name: "DMC", supplyType: "THREAD" })).rejects.toThrow(
        "Unauthorized",
      );
    });

    it("rejects unauthenticated calls to addThreadToProject", async () => {
      mockAuth.mockResolvedValueOnce(null);
      const { addThreadToProject } = await import("./supply-actions");
      await expect(addThreadToProject({ projectId: "p1", threadId: "t1" })).rejects.toThrow(
        "Unauthorized",
      );
    });

    it("rejects unauthenticated calls to getProjectSupplies", async () => {
      mockAuth.mockResolvedValueOnce(null);
      const { getProjectSupplies } = await import("./supply-actions");
      await expect(getProjectSupplies("p1")).rejects.toThrow("Unauthorized");
    });
  });

  // ─── Thread CRUD ───────────────────────────────────────────────────────────

  describe("createThread", () => {
    it("creates a thread with valid data and returns success", async () => {
      const mockThread = createMockThread({ colorCode: "310", colorName: "Black" });
      mockPrisma.thread.create.mockResolvedValueOnce(mockThread);
      const { createThread } = await import("./supply-actions");

      const result = await createThread({
        brandId: "brand-1",
        colorCode: "310",
        colorName: "Black",
        hexColor: "#000000",
        colorFamily: "BLACK",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.thread.colorCode).toBe("310");
      }
      expect(mockPrisma.thread.create).toHaveBeenCalledWith({
        data: {
          brandId: "brand-1",
          colorCode: "310",
          colorName: "Black",
          hexColor: "#000000",
          colorFamily: "BLACK",
        },
      });
    });

    it("returns error for duplicate brandId+colorCode (P2002)", async () => {
      const p2002Error = Object.assign(new Error("Unique constraint"), {
        code: "P2002",
      });
      mockPrisma.thread.create.mockRejectedValueOnce(p2002Error);
      const { createThread } = await import("./supply-actions");

      const result = await createThread({
        brandId: "brand-1",
        colorCode: "310",
        colorName: "Black",
        hexColor: "#000000",
        colorFamily: "BLACK",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("A thread with that code already exists for this brand");
      }
    });

    it("returns validation error for invalid hex color", async () => {
      const { createThread } = await import("./supply-actions");

      const result = await createThread({
        brandId: "brand-1",
        colorCode: "310",
        colorName: "Black",
        hexColor: "not-a-hex",
        colorFamily: "BLACK",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("hex color");
      }
    });
  });

  describe("updateThread", () => {
    it("validates input and updates the record", async () => {
      const updatedThread = createMockThread({
        id: "t1",
        colorName: "Updated Black",
      });
      mockPrisma.thread.update.mockResolvedValueOnce(updatedThread);
      const { updateThread } = await import("./supply-actions");

      const result = await updateThread("t1", {
        brandId: "brand-1",
        colorCode: "310",
        colorName: "Updated Black",
        hexColor: "#000000",
        colorFamily: "BLACK",
      });

      expect(result.success).toBe(true);
      expect(mockPrisma.thread.update).toHaveBeenCalledWith({
        where: { id: "t1" },
        data: {
          brandId: "brand-1",
          colorCode: "310",
          colorName: "Updated Black",
          hexColor: "#000000",
          colorFamily: "BLACK",
        },
      });
    });

    it("returns error for duplicate (P2002)", async () => {
      const p2002Error = Object.assign(new Error("Unique constraint"), {
        code: "P2002",
      });
      mockPrisma.thread.update.mockRejectedValueOnce(p2002Error);
      const { updateThread } = await import("./supply-actions");

      const result = await updateThread("t1", {
        brandId: "brand-1",
        colorCode: "310",
        colorName: "Black",
        hexColor: "#000000",
        colorFamily: "BLACK",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("A thread with that code already exists for this brand");
      }
    });
  });

  describe("deleteThread", () => {
    it("calls prisma.thread.delete and returns success", async () => {
      mockPrisma.thread.delete.mockResolvedValueOnce({});
      const { deleteThread } = await import("./supply-actions");

      const result = await deleteThread("t1");

      expect(result.success).toBe(true);
      expect(mockPrisma.thread.delete).toHaveBeenCalledWith({
        where: { id: "t1" },
      });
    });
  });

  describe("getThreads", () => {
    it("returns threads sorted by colorCode numerically", async () => {
      const brand = createMockSupplyBrand();
      // Mock returns alphabetical DB order: 3761 before 500
      const threads = [
        { ...createMockThread({ id: "t1", colorCode: "3761" }), brand },
        { ...createMockThread({ id: "t2", colorCode: "334" }), brand },
        { ...createMockThread({ id: "t3", colorCode: "500" }), brand },
      ];
      mockPrisma.thread.findMany.mockResolvedValueOnce(threads);
      const { getThreads } = await import("./supply-actions");

      const result = await getThreads();

      expect(result).toHaveLength(3);
      expect(result[0].colorCode).toBe("334");
      expect(result[1].colorCode).toBe("500");
      expect(result[2].colorCode).toBe("3761");
    });

    it("filters by brandId when provided", async () => {
      mockPrisma.thread.findMany.mockResolvedValueOnce([]);
      const { getThreads } = await import("./supply-actions");

      await getThreads("brand-1");

      expect(mockPrisma.thread.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ brandId: "brand-1" }),
        }),
      );
    });

    it("filters by colorFamily when provided", async () => {
      mockPrisma.thread.findMany.mockResolvedValueOnce([]);
      const { getThreads } = await import("./supply-actions");

      await getThreads(undefined, "RED");

      expect(mockPrisma.thread.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ colorFamily: "RED" }),
        }),
      );
    });

    it("filters by search term across colorCode and colorName", async () => {
      mockPrisma.thread.findMany.mockResolvedValueOnce([]);
      const { getThreads } = await import("./supply-actions");

      await getThreads(undefined, undefined, "310");

      expect(mockPrisma.thread.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { colorCode: { contains: "310", mode: "insensitive" } },
              { colorName: { contains: "310", mode: "insensitive" } },
            ],
          }),
        }),
      );
    });
  });

  // ─── Bead CRUD ─────────────────────────────────────────────────────────────

  describe("createBead", () => {
    it("creates a bead with valid data and returns success", async () => {
      const mockBead = createMockBead({ productCode: "00123" });
      mockPrisma.bead.create.mockResolvedValueOnce(mockBead);
      const { createBead } = await import("./supply-actions");

      const result = await createBead({
        brandId: "brand-1",
        productCode: "00123",
        colorName: "Red",
        hexColor: "#FF0000",
        colorFamily: "RED",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.bead.productCode).toBe("00123");
      }
    });

    it("returns error for duplicate (P2002)", async () => {
      const p2002Error = Object.assign(new Error("Unique constraint"), {
        code: "P2002",
      });
      mockPrisma.bead.create.mockRejectedValueOnce(p2002Error);
      const { createBead } = await import("./supply-actions");

      const result = await createBead({
        brandId: "brand-1",
        productCode: "00123",
        colorName: "Red",
        hexColor: "#FF0000",
        colorFamily: "RED",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("A bead with that code already exists for this brand");
      }
    });
  });

  describe("updateBead", () => {
    it("validates input and updates the record", async () => {
      const updatedBead = createMockBead({ id: "b1", colorName: "Updated Red" });
      mockPrisma.bead.update.mockResolvedValueOnce(updatedBead);
      const { updateBead } = await import("./supply-actions");

      const result = await updateBead("b1", {
        brandId: "brand-1",
        productCode: "00123",
        colorName: "Updated Red",
        hexColor: "#FF0000",
        colorFamily: "RED",
      });

      expect(result.success).toBe(true);
      expect(mockPrisma.bead.update).toHaveBeenCalledWith({
        where: { id: "b1" },
        data: expect.objectContaining({ colorName: "Updated Red" }),
      });
    });
  });

  describe("deleteBead", () => {
    it("calls prisma.bead.delete and returns success", async () => {
      mockPrisma.bead.delete.mockResolvedValueOnce({});
      const { deleteBead } = await import("./supply-actions");

      const result = await deleteBead("b1");

      expect(result.success).toBe(true);
      expect(mockPrisma.bead.delete).toHaveBeenCalledWith({
        where: { id: "b1" },
      });
    });
  });

  describe("getBeads", () => {
    it("returns array of beads with brand included", async () => {
      const brand = createMockSupplyBrand({ supplyType: "BEAD" });
      mockPrisma.bead.findMany.mockResolvedValueOnce([{ ...createMockBead(), brand }]);
      const { getBeads } = await import("./supply-actions");

      const result = await getBeads();

      expect(result).toHaveLength(1);
      expect(mockPrisma.bead.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: { brand: true },
          orderBy: { productCode: "asc" },
        }),
      );
    });
  });

  // ─── Specialty Item CRUD ───────────────────────────────────────────────────

  describe("createSpecialtyItem", () => {
    it("creates a specialty item with valid data and returns success", async () => {
      const mockItem = createMockSpecialtyItem({ productCode: "K001" });
      mockPrisma.specialtyItem.create.mockResolvedValueOnce(mockItem);
      const { createSpecialtyItem } = await import("./supply-actions");

      const result = await createSpecialtyItem({
        brandId: "brand-1",
        productCode: "K001",
        colorName: "Gold Braid",
        hexColor: "#FFD700",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.specialtyItem.productCode).toBe("K001");
      }
    });

    it("returns error for duplicate (P2002)", async () => {
      const p2002Error = Object.assign(new Error("Unique constraint"), {
        code: "P2002",
      });
      mockPrisma.specialtyItem.create.mockRejectedValueOnce(p2002Error);
      const { createSpecialtyItem } = await import("./supply-actions");

      const result = await createSpecialtyItem({
        brandId: "brand-1",
        productCode: "K001",
        colorName: "Gold Braid",
        hexColor: "#FFD700",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("A specialty item with that code already exists for this brand");
      }
    });
  });

  describe("updateSpecialtyItem", () => {
    it("validates input and updates the record", async () => {
      const updatedItem = createMockSpecialtyItem({
        id: "s1",
        colorName: "Silver Braid",
      });
      mockPrisma.specialtyItem.update.mockResolvedValueOnce(updatedItem);
      const { updateSpecialtyItem } = await import("./supply-actions");

      const result = await updateSpecialtyItem("s1", {
        brandId: "brand-1",
        productCode: "K001",
        colorName: "Silver Braid",
        hexColor: "#C0C0C0",
      });

      expect(result.success).toBe(true);
      expect(mockPrisma.specialtyItem.update).toHaveBeenCalledWith({
        where: { id: "s1" },
        data: expect.objectContaining({ colorName: "Silver Braid" }),
      });
    });
  });

  describe("deleteSpecialtyItem", () => {
    it("calls prisma.specialtyItem.delete and returns success", async () => {
      mockPrisma.specialtyItem.delete.mockResolvedValueOnce({});
      const { deleteSpecialtyItem } = await import("./supply-actions");

      const result = await deleteSpecialtyItem("s1");

      expect(result.success).toBe(true);
      expect(mockPrisma.specialtyItem.delete).toHaveBeenCalledWith({
        where: { id: "s1" },
      });
    });
  });

  describe("getSpecialtyItems", () => {
    it("returns array of specialty items with brand included", async () => {
      const brand = createMockSupplyBrand({ supplyType: "SPECIALTY" });
      mockPrisma.specialtyItem.findMany.mockResolvedValueOnce([
        { ...createMockSpecialtyItem(), brand },
      ]);
      const { getSpecialtyItems } = await import("./supply-actions");

      const result = await getSpecialtyItems();

      expect(result).toHaveLength(1);
      expect(mockPrisma.specialtyItem.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: { brand: true },
          orderBy: { productCode: "asc" },
        }),
      );
    });
  });

  // ─── Supply Brand CRUD ─────────────────────────────────────────────────────

  describe("createSupplyBrand", () => {
    it("creates a brand with valid data and returns success", async () => {
      const mockBrand = createMockSupplyBrand({ name: "DMC" });
      mockPrisma.supplyBrand.create.mockResolvedValueOnce(mockBrand);
      const { createSupplyBrand } = await import("./supply-actions");

      const result = await createSupplyBrand({
        name: "DMC",
        supplyType: "THREAD",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.brand.name).toBe("DMC");
      }
    });

    it("returns error for duplicate name (P2002)", async () => {
      const p2002Error = Object.assign(new Error("Unique constraint"), {
        code: "P2002",
      });
      mockPrisma.supplyBrand.create.mockRejectedValueOnce(p2002Error);
      const { createSupplyBrand } = await import("./supply-actions");

      const result = await createSupplyBrand({
        name: "DMC",
        supplyType: "THREAD",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("A brand with that name already exists");
      }
    });

    it("returns validation error for empty name", async () => {
      const { createSupplyBrand } = await import("./supply-actions");

      const result = await createSupplyBrand({
        name: "",
        supplyType: "THREAD",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Brand name is required");
      }
    });
  });

  describe("updateSupplyBrand", () => {
    it("validates input and updates the record", async () => {
      const updatedBrand = createMockSupplyBrand({
        id: "sb1",
        name: "Updated DMC",
      });
      mockPrisma.supplyBrand.update.mockResolvedValueOnce(updatedBrand);
      const { updateSupplyBrand } = await import("./supply-actions");

      const result = await updateSupplyBrand("sb1", {
        name: "Updated DMC",
        supplyType: "THREAD",
      });

      expect(result.success).toBe(true);
      expect(mockPrisma.supplyBrand.update).toHaveBeenCalledWith({
        where: { id: "sb1" },
        data: { name: "Updated DMC", website: null, supplyType: "THREAD" },
      });
    });

    it("returns error for duplicate name (P2002)", async () => {
      const p2002Error = Object.assign(new Error("Unique constraint"), {
        code: "P2002",
      });
      mockPrisma.supplyBrand.update.mockRejectedValueOnce(p2002Error);
      const { updateSupplyBrand } = await import("./supply-actions");

      const result = await updateSupplyBrand("sb1", {
        name: "Existing Brand",
        supplyType: "THREAD",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("A brand with that name already exists");
      }
    });
  });

  describe("deleteSupplyBrand", () => {
    it("calls prisma.supplyBrand.delete and returns success", async () => {
      mockPrisma.supplyBrand.delete.mockResolvedValueOnce({});
      const { deleteSupplyBrand } = await import("./supply-actions");

      const result = await deleteSupplyBrand("sb1");

      expect(result.success).toBe(true);
      expect(mockPrisma.supplyBrand.delete).toHaveBeenCalledWith({
        where: { id: "sb1" },
      });
    });
  });

  describe("getSupplyBrands", () => {
    it("returns brands with _count for threads, beads, specialtyItems", async () => {
      mockPrisma.supplyBrand.findMany.mockResolvedValueOnce([
        {
          ...createMockSupplyBrand({ id: "sb1", name: "DMC" }),
          _count: { threads: 500, beads: 0, specialtyItems: 0 },
        },
      ]);
      const { getSupplyBrands } = await import("./supply-actions");

      const result = await getSupplyBrands();

      expect(result).toHaveLength(1);
      expect(mockPrisma.supplyBrand.findMany).toHaveBeenCalledWith({
        include: {
          _count: { select: { threads: true, beads: true, specialtyItems: true } },
        },
        orderBy: { name: "asc" },
      });
    });
  });

  // ─── Junction Operations ───────────────────────────────────────────────────

  describe("addThreadToProject", () => {
    it("creates junction record with default quantity 1", async () => {
      mockPrisma.project.findUnique.mockResolvedValueOnce({ userId: "user-1" });
      const mockJunction = createMockProjectThread({
        projectId: "p1",
        threadId: "t1",
      });
      mockPrisma.projectThread.create.mockResolvedValueOnce(mockJunction);
      const { addThreadToProject } = await import("./supply-actions");

      const result = await addThreadToProject({
        projectId: "p1",
        threadId: "t1",
      });

      expect(result.success).toBe(true);
      expect(mockPrisma.projectThread.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          projectId: "p1",
          threadId: "t1",
          quantityRequired: 1,
          quantityAcquired: 0,
        }),
      });
    });

    it("returns error for duplicate project+thread (P2002)", async () => {
      mockPrisma.project.findUnique.mockResolvedValueOnce({ userId: "user-1" });
      const p2002Error = Object.assign(new Error("Unique constraint"), {
        code: "P2002",
      });
      mockPrisma.projectThread.create.mockRejectedValueOnce(p2002Error);
      const { addThreadToProject } = await import("./supply-actions");

      const result = await addThreadToProject({
        projectId: "p1",
        threadId: "t1",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("This thread is already linked to this project");
      }
    });
  });

  describe("addBeadToProject", () => {
    it("creates junction record", async () => {
      mockPrisma.project.findUnique.mockResolvedValueOnce({ userId: "user-1" });
      const mockJunction = createMockProjectBead({
        projectId: "p1",
        beadId: "b1",
      });
      mockPrisma.projectBead.create.mockResolvedValueOnce(mockJunction);
      const { addBeadToProject } = await import("./supply-actions");

      const result = await addBeadToProject({
        projectId: "p1",
        beadId: "b1",
      });

      expect(result.success).toBe(true);
    });

    it("returns error for duplicate (P2002)", async () => {
      mockPrisma.project.findUnique.mockResolvedValueOnce({ userId: "user-1" });
      const p2002Error = Object.assign(new Error("Unique constraint"), {
        code: "P2002",
      });
      mockPrisma.projectBead.create.mockRejectedValueOnce(p2002Error);
      const { addBeadToProject } = await import("./supply-actions");

      const result = await addBeadToProject({
        projectId: "p1",
        beadId: "b1",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("This bead is already linked to this project");
      }
    });
  });

  describe("addSpecialtyToProject", () => {
    it("creates junction record", async () => {
      mockPrisma.project.findUnique.mockResolvedValueOnce({ userId: "user-1" });
      const mockJunction = createMockProjectSpecialty({
        projectId: "p1",
        specialtyItemId: "s1",
      });
      mockPrisma.projectSpecialty.create.mockResolvedValueOnce(mockJunction);
      const { addSpecialtyToProject } = await import("./supply-actions");

      const result = await addSpecialtyToProject({
        projectId: "p1",
        specialtyItemId: "s1",
      });

      expect(result.success).toBe(true);
    });

    it("returns error for duplicate (P2002)", async () => {
      mockPrisma.project.findUnique.mockResolvedValueOnce({ userId: "user-1" });
      const p2002Error = Object.assign(new Error("Unique constraint"), {
        code: "P2002",
      });
      mockPrisma.projectSpecialty.create.mockRejectedValueOnce(p2002Error);
      const { addSpecialtyToProject } = await import("./supply-actions");

      const result = await addSpecialtyToProject({
        projectId: "p1",
        specialtyItemId: "s1",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("This item is already linked to this project");
      }
    });
  });

  describe("updateProjectSupplyQuantity", () => {
    it("updates thread junction record quantities", async () => {
      mockPrisma.projectThread.findUnique.mockResolvedValueOnce({ project: { userId: "user-1" } });
      const updated = createMockProjectThread({
        id: "pt1",
        quantityRequired: 3,
        quantityAcquired: 2,
      });
      mockPrisma.projectThread.update.mockResolvedValueOnce(updated);
      const { updateProjectSupplyQuantity } = await import("./supply-actions");

      const result = await updateProjectSupplyQuantity("pt1", "thread", {
        quantityRequired: 3,
        quantityAcquired: 2,
      });

      expect(result.success).toBe(true);
      expect(mockPrisma.projectThread.update).toHaveBeenCalledWith({
        where: { id: "pt1" },
        data: { quantityRequired: 3, quantityAcquired: 2 },
      });
    });

    it("updates bead junction record quantities", async () => {
      mockPrisma.projectBead.findUnique.mockResolvedValueOnce({ project: { userId: "user-1" } });
      const updated = createMockProjectBead({ id: "pb1", quantityRequired: 5 });
      mockPrisma.projectBead.update.mockResolvedValueOnce(updated);
      const { updateProjectSupplyQuantity } = await import("./supply-actions");

      const result = await updateProjectSupplyQuantity("pb1", "bead", {
        quantityRequired: 5,
      });

      expect(result.success).toBe(true);
      expect(mockPrisma.projectBead.update).toHaveBeenCalledWith({
        where: { id: "pb1" },
        data: { quantityRequired: 5 },
      });
    });

    it("updates specialty junction record quantities", async () => {
      mockPrisma.projectSpecialty.findUnique.mockResolvedValueOnce({
        project: { userId: "user-1" },
      });
      const updated = createMockProjectSpecialty({
        id: "ps1",
        quantityAcquired: 1,
      });
      mockPrisma.projectSpecialty.update.mockResolvedValueOnce(updated);
      const { updateProjectSupplyQuantity } = await import("./supply-actions");

      const result = await updateProjectSupplyQuantity("ps1", "specialty", {
        quantityAcquired: 1,
      });

      expect(result.success).toBe(true);
      expect(mockPrisma.projectSpecialty.update).toHaveBeenCalledWith({
        where: { id: "ps1" },
        data: { quantityAcquired: 1 },
      });
    });
  });

  describe("removeProjectThread", () => {
    it("deletes junction record and returns success", async () => {
      mockPrisma.projectThread.findUnique.mockResolvedValueOnce({ project: { userId: "user-1" } });
      mockPrisma.projectThread.delete.mockResolvedValueOnce({});
      const { removeProjectThread } = await import("./supply-actions");

      const result = await removeProjectThread("pt1");

      expect(result.success).toBe(true);
      expect(mockPrisma.projectThread.delete).toHaveBeenCalledWith({
        where: { id: "pt1" },
      });
    });
  });

  describe("removeProjectBead", () => {
    it("deletes junction record and returns success", async () => {
      mockPrisma.projectBead.findUnique.mockResolvedValueOnce({ project: { userId: "user-1" } });
      mockPrisma.projectBead.delete.mockResolvedValueOnce({});
      const { removeProjectBead } = await import("./supply-actions");

      const result = await removeProjectBead("pb1");

      expect(result.success).toBe(true);
      expect(mockPrisma.projectBead.delete).toHaveBeenCalledWith({
        where: { id: "pb1" },
      });
    });
  });

  describe("removeProjectSpecialty", () => {
    it("deletes junction record and returns success", async () => {
      mockPrisma.projectSpecialty.findUnique.mockResolvedValueOnce({
        project: { userId: "user-1" },
      });
      mockPrisma.projectSpecialty.delete.mockResolvedValueOnce({});
      const { removeProjectSpecialty } = await import("./supply-actions");

      const result = await removeProjectSpecialty("ps1");

      expect(result.success).toBe(true);
      expect(mockPrisma.projectSpecialty.delete).toHaveBeenCalledWith({
        where: { id: "ps1" },
      });
    });
  });

  describe("getProjectSupplies", () => {
    it("returns threads, beads, specialty grouped with brand details", async () => {
      const brand = createMockSupplyBrand();
      mockPrisma.projectThread.findMany.mockResolvedValueOnce([
        {
          ...createMockProjectThread(),
          thread: { ...createMockThread(), brand },
        },
      ]);
      mockPrisma.projectBead.findMany.mockResolvedValueOnce([
        {
          ...createMockProjectBead(),
          bead: { ...createMockBead(), brand },
        },
      ]);
      mockPrisma.projectSpecialty.findMany.mockResolvedValueOnce([
        {
          ...createMockProjectSpecialty(),
          specialtyItem: { ...createMockSpecialtyItem(), brand },
        },
      ]);

      const { getProjectSupplies } = await import("./supply-actions");

      const result = await getProjectSupplies("proj-1");

      expect(result.threads).toHaveLength(1);
      expect(result.beads).toHaveLength(1);
      expect(result.specialty).toHaveLength(1);
    });

    it("returns threads ordered by createdAt ascending (insertion order)", async () => {
      const brand = createMockSupplyBrand();
      // Threads returned in insertion order (createdAt ascending) from DB
      const thread1 = {
        ...createMockProjectThread({ id: "pt-1", createdAt: new Date("2026-01-01") }),
        thread: { ...createMockThread({ id: "t1", colorCode: "3761" }), brand },
      };
      const thread2 = {
        ...createMockProjectThread({ id: "pt-2", createdAt: new Date("2026-01-02") }),
        thread: { ...createMockThread({ id: "t2", colorCode: "334" }), brand },
      };
      const thread3 = {
        ...createMockProjectThread({ id: "pt-3", createdAt: new Date("2026-01-03") }),
        thread: { ...createMockThread({ id: "t3", colorCode: "500" }), brand },
      };
      mockPrisma.projectThread.findMany.mockResolvedValueOnce([thread1, thread2, thread3]);
      mockPrisma.projectBead.findMany.mockResolvedValueOnce([]);
      mockPrisma.projectSpecialty.findMany.mockResolvedValueOnce([]);

      const { getProjectSupplies } = await import("./supply-actions");

      const result = await getProjectSupplies("proj-1");

      expect(result.threads).toHaveLength(3);
      // Preserved insertion order (not re-sorted by colorCode)
      expect(result.threads[0].id).toBe("pt-1");
      expect(result.threads[1].id).toBe("pt-2");
      expect(result.threads[2].id).toBe("pt-3");

      // Verify DB query uses createdAt ascending ordering
      expect(mockPrisma.projectThread.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: "asc" },
        }),
      );
    });
  });

  // ─── createAndAddThread ─────────────────────────────────────────────────────

  describe("createAndAddThread", () => {
    it("requires auth", async () => {
      mockAuth.mockResolvedValueOnce(null);
      const { createAndAddThread } = await import("./supply-actions");
      await expect(
        createAndAddThread({ projectId: "p1", name: "Custom Red", brandId: "brand-1" }),
      ).rejects.toThrow("Unauthorized");
    });

    it("validates name with trim and min(1)", async () => {
      const { createAndAddThread } = await import("./supply-actions");

      const result = await createAndAddThread({
        projectId: "p1",
        name: "   ",
        brandId: "brand-1",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Name is required");
      }
    });

    it("checks project ownership before creating", async () => {
      mockPrisma.project.findUnique.mockResolvedValueOnce({ userId: "other-user" });
      const { createAndAddThread } = await import("./supply-actions");

      const result = await createAndAddThread({
        projectId: "p1",
        name: "Custom Red",
        brandId: "brand-1",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Project not found");
      }
    });

    it("creates thread and links to project in a transaction", async () => {
      mockPrisma.project.findUnique.mockResolvedValueOnce({ userId: "user-1" });
      const mockThread = createMockThread({ id: "new-thread" });
      const mockLink = createMockProjectThread({ id: "new-pt", threadId: "new-thread" });
      mockPrisma.$transaction.mockImplementationOnce(async (cb: (tx: unknown) => unknown) => {
        return cb({
          thread: { create: vi.fn().mockResolvedValue(mockThread) },
          projectThread: { create: vi.fn().mockResolvedValue(mockLink) },
        });
      });

      const { createAndAddThread } = await import("./supply-actions");

      const result = await createAndAddThread({
        projectId: "p1",
        name: "Custom Red",
        brandId: "brand-1",
        colorCode: "CUS1",
        hexColor: "#FF0000",
      });

      expect(result.success).toBe(true);
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it("returns success with the created record", async () => {
      mockPrisma.project.findUnique.mockResolvedValueOnce({ userId: "user-1" });
      const mockThread = createMockThread({ id: "new-thread", colorName: "Custom Red" });
      const mockLink = createMockProjectThread({ id: "new-pt", threadId: "new-thread" });
      mockPrisma.$transaction.mockImplementationOnce(async (cb: (tx: unknown) => unknown) => {
        return cb({
          thread: { create: vi.fn().mockResolvedValue(mockThread) },
          projectThread: { create: vi.fn().mockResolvedValue(mockLink) },
        });
      });

      const { createAndAddThread } = await import("./supply-actions");

      const result = await createAndAddThread({
        projectId: "p1",
        name: "Custom Red",
        brandId: "brand-1",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.record).toBeDefined();
      }
    });
  });

  // ─── createAndAddBead ──────────────────────────────────────────────────────

  describe("createAndAddBead", () => {
    it("requires auth", async () => {
      mockAuth.mockResolvedValueOnce(null);
      const { createAndAddBead } = await import("./supply-actions");
      await expect(
        createAndAddBead({ projectId: "p1", name: "Custom Bead", brandId: "brand-1" }),
      ).rejects.toThrow("Unauthorized");
    });

    it("validates name with trim and min(1)", async () => {
      const { createAndAddBead } = await import("./supply-actions");

      const result = await createAndAddBead({
        projectId: "p1",
        name: "   ",
        brandId: "brand-1",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Name is required");
      }
    });

    it("checks project ownership before creating", async () => {
      mockPrisma.project.findUnique.mockResolvedValueOnce({ userId: "other-user" });
      const { createAndAddBead } = await import("./supply-actions");

      const result = await createAndAddBead({
        projectId: "p1",
        name: "Custom Bead",
        brandId: "brand-1",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Project not found");
      }
    });

    it("creates bead and links to project in a transaction", async () => {
      mockPrisma.project.findUnique.mockResolvedValueOnce({ userId: "user-1" });
      const mockBead = createMockBead({ id: "new-bead" });
      const mockLink = createMockProjectBead({ id: "new-pb", beadId: "new-bead" });
      mockPrisma.$transaction.mockImplementationOnce(async (cb: (tx: unknown) => unknown) => {
        return cb({
          bead: { create: vi.fn().mockResolvedValue(mockBead) },
          projectBead: { create: vi.fn().mockResolvedValue(mockLink) },
        });
      });

      const { createAndAddBead } = await import("./supply-actions");

      const result = await createAndAddBead({
        projectId: "p1",
        name: "Custom Bead",
        brandId: "brand-1",
        code: "CB01",
      });

      expect(result.success).toBe(true);
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it("returns success with the created record", async () => {
      mockPrisma.project.findUnique.mockResolvedValueOnce({ userId: "user-1" });
      const mockBead = createMockBead({ id: "new-bead", colorName: "Custom Bead" });
      const mockLink = createMockProjectBead({ id: "new-pb", beadId: "new-bead" });
      mockPrisma.$transaction.mockImplementationOnce(async (cb: (tx: unknown) => unknown) => {
        return cb({
          bead: { create: vi.fn().mockResolvedValue(mockBead) },
          projectBead: { create: vi.fn().mockResolvedValue(mockLink) },
        });
      });

      const { createAndAddBead } = await import("./supply-actions");

      const result = await createAndAddBead({
        projectId: "p1",
        name: "Custom Bead",
        brandId: "brand-1",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.record).toBeDefined();
      }
    });
  });

  // ─── createAndAddSpecialty ─────────────────────────────────────────────────

  describe("createAndAddSpecialty", () => {
    it("requires auth", async () => {
      mockAuth.mockResolvedValueOnce(null);
      const { createAndAddSpecialty } = await import("./supply-actions");
      await expect(
        createAndAddSpecialty({ projectId: "p1", name: "Custom Item", brandId: "brand-1" }),
      ).rejects.toThrow("Unauthorized");
    });

    it("validates name with trim and min(1)", async () => {
      const { createAndAddSpecialty } = await import("./supply-actions");

      const result = await createAndAddSpecialty({
        projectId: "p1",
        name: "   ",
        brandId: "brand-1",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Name is required");
      }
    });

    it("checks project ownership before creating", async () => {
      mockPrisma.project.findUnique.mockResolvedValueOnce({ userId: "other-user" });
      const { createAndAddSpecialty } = await import("./supply-actions");

      const result = await createAndAddSpecialty({
        projectId: "p1",
        name: "Custom Item",
        brandId: "brand-1",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Project not found");
      }
    });

    it("creates specialty item and links to project in a transaction", async () => {
      mockPrisma.project.findUnique.mockResolvedValueOnce({ userId: "user-1" });
      const mockItem = createMockSpecialtyItem({ id: "new-item" });
      const mockLink = createMockProjectSpecialty({ id: "new-ps", specialtyItemId: "new-item" });
      mockPrisma.$transaction.mockImplementationOnce(async (cb: (tx: unknown) => unknown) => {
        return cb({
          specialtyItem: { create: vi.fn().mockResolvedValue(mockItem) },
          projectSpecialty: { create: vi.fn().mockResolvedValue(mockLink) },
        });
      });

      const { createAndAddSpecialty } = await import("./supply-actions");

      const result = await createAndAddSpecialty({
        projectId: "p1",
        name: "Custom Item",
        brandId: "brand-1",
        code: "CI01",
      });

      expect(result.success).toBe(true);
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it("returns success with the created record", async () => {
      mockPrisma.project.findUnique.mockResolvedValueOnce({ userId: "user-1" });
      const mockItem = createMockSpecialtyItem({ id: "new-item", colorName: "Custom Item" });
      const mockLink = createMockProjectSpecialty({ id: "new-ps", specialtyItemId: "new-item" });
      mockPrisma.$transaction.mockImplementationOnce(async (cb: (tx: unknown) => unknown) => {
        return cb({
          specialtyItem: { create: vi.fn().mockResolvedValue(mockItem) },
          projectSpecialty: { create: vi.fn().mockResolvedValue(mockLink) },
        });
      });

      const { createAndAddSpecialty } = await import("./supply-actions");

      const result = await createAndAddSpecialty({
        projectId: "p1",
        name: "Custom Item",
        brandId: "brand-1",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.record).toBeDefined();
      }
    });
  });
});

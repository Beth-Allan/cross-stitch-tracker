import { describe, expect, it, vi, beforeEach } from "vitest";
import { createMockPrisma, createMockStorageLocation } from "@/__tests__/mocks";

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

describe("storage-location-actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue({ user: { id: "user-1", name: "Test", email: "test@test.com" } });
  });

  describe("auth guard", () => {
    it("rejects unauthenticated calls to createStorageLocation", async () => {
      mockAuth.mockResolvedValueOnce(null);
      const { createStorageLocation } = await import("./storage-location-actions");

      await expect(createStorageLocation({ name: "Test" })).rejects.toThrow("Unauthorized");
    });

    it("rejects unauthenticated calls to deleteStorageLocation", async () => {
      mockAuth.mockResolvedValueOnce(null);
      const { deleteStorageLocation } = await import("./storage-location-actions");

      await expect(deleteStorageLocation("sl-1")).rejects.toThrow("Unauthorized");
    });

    it("rejects unauthenticated calls to getStorageLocationsWithStats", async () => {
      mockAuth.mockResolvedValueOnce(null);
      const { getStorageLocationsWithStats } = await import("./storage-location-actions");

      await expect(getStorageLocationsWithStats()).rejects.toThrow("Unauthorized");
    });
  });

  describe("createStorageLocation", () => {
    it("creates with userId from auth and returns success", async () => {
      const mockLocation = createMockStorageLocation({ name: "Bin A" });
      mockPrisma.storageLocation.create.mockResolvedValueOnce(mockLocation);
      const { createStorageLocation } = await import("./storage-location-actions");

      const result = await createStorageLocation({ name: "Bin A" });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.location.name).toBe("Bin A");
      }
      expect(mockPrisma.storageLocation.create).toHaveBeenCalledWith({
        data: { name: "Bin A", description: null, userId: "user-1" },
      });
    });

    it("returns validation error for empty name", async () => {
      const { createStorageLocation } = await import("./storage-location-actions");

      const result = await createStorageLocation({ name: "" });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Name is required");
      }
    });
  });

  describe("updateStorageLocation", () => {
    it("updates name on valid input", async () => {
      const updatedLocation = createMockStorageLocation({ id: "sl-1", name: "Updated Bin" });
      mockPrisma.storageLocation.update.mockResolvedValueOnce(updatedLocation);
      const { updateStorageLocation } = await import("./storage-location-actions");

      const result = await updateStorageLocation("sl-1", { name: "Updated Bin" });

      expect(result.success).toBe(true);
      expect(mockPrisma.storageLocation.update).toHaveBeenCalledWith({
        where: { id: "sl-1" },
        data: { name: "Updated Bin", description: null },
      });
    });

    it("returns validation error for invalid input", async () => {
      const { updateStorageLocation } = await import("./storage-location-actions");

      const result = await updateStorageLocation("sl-1", { name: "   " });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Name is required");
      }
    });
  });

  describe("deleteStorageLocation", () => {
    it("unlinks associated projects then deletes", async () => {
      mockPrisma.$transaction.mockResolvedValueOnce([{}, {}]);
      const { deleteStorageLocation } = await import("./storage-location-actions");

      const result = await deleteStorageLocation("sl-1");

      expect(result.success).toBe(true);
      expect(mockPrisma.$transaction).toHaveBeenCalledWith([
        mockPrisma.project.updateMany({
          where: { storageLocationId: "sl-1" },
          data: { storageLocationId: null },
        }),
        mockPrisma.storageLocation.delete({ where: { id: "sl-1" } }),
      ]);
    });
  });

  describe("getStorageLocationsWithStats", () => {
    it("returns list with project counts", async () => {
      mockPrisma.storageLocation.findMany.mockResolvedValueOnce([
        { id: "sl-1", name: "Bin A", description: null, _count: { projects: 3 } },
        { id: "sl-2", name: "Bin B", description: "Office shelf", _count: { projects: 0 } },
      ]);
      const { getStorageLocationsWithStats } = await import("./storage-location-actions");

      const result = await getStorageLocationsWithStats();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: "sl-1",
        name: "Bin A",
        description: null,
        _count: { projects: 3 },
      });
      expect(result[1]._count.projects).toBe(0);
    });
  });

  describe("getStorageLocationDetail", () => {
    it("returns location with project list", async () => {
      mockPrisma.storageLocation.findUnique.mockResolvedValueOnce({
        id: "sl-1",
        name: "Bin A",
        description: null,
        projects: [
          {
            id: "proj-1",
            status: "IN_PROGRESS",
            chart: { id: "c1", name: "Chart 1", coverThumbnailUrl: null },
            fabric: { name: "White Aida", count: 14, type: "Aida" },
          },
        ],
      });
      const { getStorageLocationDetail } = await import("./storage-location-actions");

      const result = await getStorageLocationDetail("sl-1");

      expect(result).not.toBeNull();
      expect(result!.name).toBe("Bin A");
      expect(result!.projects).toHaveLength(1);
      expect(result!.projects[0].chart.name).toBe("Chart 1");
    });

    it("returns null for non-existent ID", async () => {
      mockPrisma.storageLocation.findUnique.mockResolvedValueOnce(null);
      const { getStorageLocationDetail } = await import("./storage-location-actions");

      const result = await getStorageLocationDetail("nonexistent");

      expect(result).toBeNull();
    });
  });
});

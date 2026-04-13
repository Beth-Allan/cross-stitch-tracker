import { describe, expect, it, vi, beforeEach } from "vitest";
import { createMockPrisma, createMockStitchingApp } from "@/__tests__/mocks";

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

describe("stitching-app-actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue({ user: { id: "user-1", name: "Test", email: "test@test.com" } });
  });

  describe("auth guard", () => {
    it("rejects unauthenticated calls to createStitchingApp", async () => {
      mockAuth.mockResolvedValueOnce(null);
      const { createStitchingApp } = await import("./stitching-app-actions");

      await expect(createStitchingApp({ name: "Test" })).rejects.toThrow("Unauthorized");
    });

    it("rejects unauthenticated calls to deleteStitchingApp", async () => {
      mockAuth.mockResolvedValueOnce(null);
      const { deleteStitchingApp } = await import("./stitching-app-actions");

      await expect(deleteStitchingApp("sa-1")).rejects.toThrow("Unauthorized");
    });

    it("rejects unauthenticated calls to updateStitchingApp", async () => {
      mockAuth.mockResolvedValueOnce(null);
      const { updateStitchingApp } = await import("./stitching-app-actions");

      await expect(updateStitchingApp("sa-1", { name: "Test" })).rejects.toThrow("Unauthorized");
    });

    it("rejects unauthenticated calls to getStitchingAppDetail", async () => {
      mockAuth.mockResolvedValueOnce(null);
      const { getStitchingAppDetail } = await import("./stitching-app-actions");

      await expect(getStitchingAppDetail("sa-1")).rejects.toThrow("Unauthorized");
    });

    it("rejects unauthenticated calls to getStitchingAppsWithStats", async () => {
      mockAuth.mockResolvedValueOnce(null);
      const { getStitchingAppsWithStats } = await import("./stitching-app-actions");

      await expect(getStitchingAppsWithStats()).rejects.toThrow("Unauthorized");
    });
  });

  describe("createStitchingApp", () => {
    it("creates with userId from auth and returns success", async () => {
      const mockApp = createMockStitchingApp({ name: "Markup R-XP" });
      mockPrisma.stitchingApp.create.mockResolvedValueOnce(mockApp);
      const { createStitchingApp } = await import("./stitching-app-actions");

      const result = await createStitchingApp({ name: "Markup R-XP" });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.app.name).toBe("Markup R-XP");
      }
      expect(mockPrisma.stitchingApp.create).toHaveBeenCalledWith({
        data: { name: "Markup R-XP", description: null, userId: "user-1" },
      });
    });

    it("returns validation error for empty name", async () => {
      const { createStitchingApp } = await import("./stitching-app-actions");

      const result = await createStitchingApp({ name: "" });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Name is required");
      }
    });
  });

  describe("updateStitchingApp", () => {
    it("updates name on valid input", async () => {
      const updatedApp = createMockStitchingApp({ id: "sa-1", name: "Saga" });
      mockPrisma.stitchingApp.update.mockResolvedValueOnce(updatedApp);
      const { updateStitchingApp } = await import("./stitching-app-actions");

      const result = await updateStitchingApp("sa-1", { name: "Saga" });

      expect(result.success).toBe(true);
      expect(mockPrisma.stitchingApp.update).toHaveBeenCalledWith({
        where: { id: "sa-1", userId: "user-1" },
        data: { name: "Saga", description: null },
      });
    });
  });

  describe("deleteStitchingApp", () => {
    it("unlinks associated projects then deletes", async () => {
      mockPrisma.stitchingApp.findUnique.mockResolvedValueOnce({ userId: "user-1" });
      mockPrisma.$transaction.mockResolvedValueOnce([{}, {}]);
      const { deleteStitchingApp } = await import("./stitching-app-actions");

      const result = await deleteStitchingApp("sa-1");

      expect(result.success).toBe(true);
      expect(mockPrisma.stitchingApp.findUnique).toHaveBeenCalledWith({
        where: { id: "sa-1" },
        select: { userId: true },
      });
      expect(mockPrisma.$transaction).toHaveBeenCalledWith([
        mockPrisma.project.updateMany({
          where: { stitchingAppId: "sa-1" },
          data: { stitchingAppId: null },
        }),
        mockPrisma.stitchingApp.delete({ where: { id: "sa-1" } }),
      ]);
    });

    it("returns error when app belongs to another user", async () => {
      mockPrisma.stitchingApp.findUnique.mockResolvedValueOnce({ userId: "other-user" });
      const { deleteStitchingApp } = await import("./stitching-app-actions");

      const result = await deleteStitchingApp("sa-1");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("App not found");
      }
    });
  });

  describe("getStitchingAppsWithStats", () => {
    it("returns list with project counts", async () => {
      mockPrisma.stitchingApp.findMany.mockResolvedValueOnce([
        { id: "sa-1", name: "Markup R-XP", description: null, _count: { projects: 5 } },
        {
          id: "sa-2",
          name: "Saga",
          description: "iOS pattern app",
          _count: { projects: 2 },
        },
      ]);
      const { getStitchingAppsWithStats } = await import("./stitching-app-actions");

      const result = await getStitchingAppsWithStats();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: "sa-1",
        name: "Markup R-XP",
        description: null,
        projectCount: 5,
      });
      expect(result[1].projectCount).toBe(2);
    });
  });

  describe("getStitchingAppDetail", () => {
    it("returns app with project list", async () => {
      mockPrisma.stitchingApp.findUnique.mockResolvedValueOnce({
        id: "sa-1",
        name: "Markup R-XP",
        description: null,
        projects: [
          {
            id: "proj-1",
            status: "IN_PROGRESS",
            chart: { id: "c1", name: "Chart 1", coverThumbnailUrl: null },
            fabric: null,
          },
        ],
      });
      const { getStitchingAppDetail } = await import("./stitching-app-actions");

      const result = await getStitchingAppDetail("sa-1");

      expect(result).not.toBeNull();
      expect(result!.name).toBe("Markup R-XP");
      expect(result!.projects).toHaveLength(1);
    });

    it("returns null for non-existent ID", async () => {
      mockPrisma.stitchingApp.findUnique.mockResolvedValueOnce(null);
      const { getStitchingAppDetail } = await import("./stitching-app-actions");

      const result = await getStitchingAppDetail("nonexistent");

      expect(result).toBeNull();
    });
  });
});

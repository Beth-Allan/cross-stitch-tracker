import { describe, expect, it, vi, beforeEach } from "vitest";
import { createMockPrisma, createMockProject } from "@/__tests__/mocks";

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

describe("updateProjectSettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue({
      user: { id: "user-1", name: "Test", email: "test@test.com" },
    });
  });

  it("requires auth", async () => {
    mockAuth.mockResolvedValueOnce(null);
    const { updateProjectSettings } = await import("./chart-actions");
    await expect(updateProjectSettings("chart-1", { strandCount: 2 })).rejects.toThrow(
      "Unauthorized",
    );
  });

  it("rejects strandCount below 1", async () => {
    const { updateProjectSettings } = await import("./chart-actions");
    const result = await updateProjectSettings("chart-1", { strandCount: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects strandCount above 6", async () => {
    const { updateProjectSettings } = await import("./chart-actions");
    const result = await updateProjectSettings("chart-1", { strandCount: 7 });
    expect(result.success).toBe(false);
  });

  it("rejects overCount that is not 1 or 2", async () => {
    const { updateProjectSettings } = await import("./chart-actions");
    const result = await updateProjectSettings("chart-1", { overCount: 3 });
    expect(result.success).toBe(false);
  });

  it("rejects wastePercent below 0", async () => {
    const { updateProjectSettings } = await import("./chart-actions");
    const result = await updateProjectSettings("chart-1", { wastePercent: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects wastePercent above 50", async () => {
    const { updateProjectSettings } = await import("./chart-actions");
    const result = await updateProjectSettings("chart-1", { wastePercent: 51 });
    expect(result.success).toBe(false);
  });

  it("checks project ownership before updating", async () => {
    // Return a project owned by a different user
    mockPrisma.project.findUnique.mockResolvedValueOnce(
      createMockProject({ userId: "other-user" }),
    );
    const { updateProjectSettings } = await import("./chart-actions");
    const result = await updateProjectSettings("chart-1", { strandCount: 3 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Project not found");
    }
  });

  it("returns success on valid input with owned project", async () => {
    mockPrisma.project.findUnique.mockResolvedValueOnce(
      createMockProject({ userId: "user-1", chartId: "chart-1" }),
    );
    mockPrisma.project.update.mockResolvedValueOnce({});
    const { updateProjectSettings } = await import("./chart-actions");

    const result = await updateProjectSettings("chart-1", {
      strandCount: 3,
      overCount: 1,
      wastePercent: 25,
    });

    expect(result.success).toBe(true);
    expect(mockPrisma.project.update).toHaveBeenCalledWith({
      where: { chartId: "chart-1" },
      data: { strandCount: 3, overCount: 1, wastePercent: 25 },
    });
  });

  it("allows partial updates (only strandCount)", async () => {
    mockPrisma.project.findUnique.mockResolvedValueOnce(
      createMockProject({ userId: "user-1", chartId: "chart-1" }),
    );
    mockPrisma.project.update.mockResolvedValueOnce({});
    const { updateProjectSettings } = await import("./chart-actions");

    const result = await updateProjectSettings("chart-1", { strandCount: 4 });

    expect(result.success).toBe(true);
    expect(mockPrisma.project.update).toHaveBeenCalledWith({
      where: { chartId: "chart-1" },
      data: { strandCount: 4 },
    });
  });
});

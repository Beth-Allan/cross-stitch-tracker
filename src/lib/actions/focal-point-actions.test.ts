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

describe("updateFocalPoint", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue({
      user: { id: "user-1", name: "Test", email: "test@test.com" },
    });
  });

  it("requires auth", async () => {
    mockAuth.mockResolvedValueOnce(null);
    const { updateFocalPoint } = await import("./focal-point-actions");
    await expect(updateFocalPoint("chart-1", 0.5, 0.5)).rejects.toThrow("Unauthorized");
  });

  it("persists valid focal point coordinates", async () => {
    mockPrisma.chart.findUnique.mockResolvedValueOnce({
      id: "chart-1",
      project: { userId: "user-1" },
    });
    mockPrisma.chart.update.mockResolvedValueOnce({});

    const { updateFocalPoint } = await import("./focal-point-actions");
    const result = await updateFocalPoint("chart-1", 0.3, 0.7);

    expect(result.success).toBe(true);
    expect(mockPrisma.chart.update).toHaveBeenCalledWith({
      where: { id: "chart-1" },
      data: { focalPointX: 0.3, focalPointY: 0.7 },
    });
  });

  it("resets focal point to null when both coordinates are null", async () => {
    mockPrisma.chart.findUnique.mockResolvedValueOnce({
      id: "chart-1",
      project: { userId: "user-1" },
    });
    mockPrisma.chart.update.mockResolvedValueOnce({});

    const { updateFocalPoint } = await import("./focal-point-actions");
    const result = await updateFocalPoint("chart-1", null, null);

    expect(result.success).toBe(true);
    expect(mockPrisma.chart.update).toHaveBeenCalledWith({
      where: { id: "chart-1" },
      data: { focalPointX: null, focalPointY: null },
    });
  });

  it("rejects x > 1", async () => {
    const { updateFocalPoint } = await import("./focal-point-actions");
    const result = await updateFocalPoint("chart-1", 1.5, 0.5);
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it("rejects x < 0", async () => {
    const { updateFocalPoint } = await import("./focal-point-actions");
    const result = await updateFocalPoint("chart-1", -0.1, 0.5);
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it("rejects y > 1", async () => {
    const { updateFocalPoint } = await import("./focal-point-actions");
    const result = await updateFocalPoint("chart-1", 0.5, 2.0);
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it("rejects y < 0", async () => {
    const { updateFocalPoint } = await import("./focal-point-actions");
    const result = await updateFocalPoint("chart-1", 0.5, -0.5);
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it("rejects chart not found", async () => {
    mockPrisma.chart.findUnique.mockResolvedValueOnce(null);

    const { updateFocalPoint } = await import("./focal-point-actions");
    const result = await updateFocalPoint("nonexistent", 0.5, 0.5);

    expect(result.success).toBe(false);
    expect(result.error).toBe("Chart not found");
  });

  it("rejects chart owned by different user", async () => {
    mockPrisma.chart.findUnique.mockResolvedValueOnce({
      id: "chart-1",
      project: { userId: "other-user" },
    });

    const { updateFocalPoint } = await import("./focal-point-actions");
    const result = await updateFocalPoint("chart-1", 0.5, 0.5);

    expect(result.success).toBe(false);
    expect(result.error).toBe("Chart not found");
  });

  it("rejects chart without a project", async () => {
    mockPrisma.chart.findUnique.mockResolvedValueOnce({
      id: "chart-1",
      project: null,
    });

    const { updateFocalPoint } = await import("./focal-point-actions");
    const result = await updateFocalPoint("chart-1", 0.5, 0.5);

    expect(result.success).toBe(false);
    expect(result.error).toBe("Chart not found");
  });

  it("rejects x=null when y is provided (cross-field refinement)", async () => {
    const { updateFocalPoint } = await import("./focal-point-actions");
    const result = await updateFocalPoint("chart-1", null, 0.5);
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it("rejects y=null when x is provided (cross-field refinement)", async () => {
    const { updateFocalPoint } = await import("./focal-point-actions");
    const result = await updateFocalPoint("chart-1", 0.5, null);
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it("revalidates paths on success", async () => {
    const { revalidatePath } = await import("next/cache");
    mockPrisma.chart.findUnique.mockResolvedValueOnce({
      id: "chart-1",
      project: { userId: "user-1" },
    });
    mockPrisma.chart.update.mockResolvedValueOnce({});

    const { updateFocalPoint } = await import("./focal-point-actions");
    await updateFocalPoint("chart-1", 0.5, 0.5);

    expect(revalidatePath).toHaveBeenCalledWith("/charts");
    expect(revalidatePath).toHaveBeenCalledWith("/charts/chart-1");
    expect(revalidatePath).toHaveBeenCalledWith("/");
    expect(revalidatePath).toHaveBeenCalledWith("/designers");
    expect(revalidatePath).toHaveBeenCalledWith("/genres");
    expect(revalidatePath).toHaveBeenCalledWith("/shopping");
  });
});

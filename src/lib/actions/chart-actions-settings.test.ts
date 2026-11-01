import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  createMockPrisma,
  createMockProject,
  createMockProjectForNeeds,
  createNeedsReworkTx,
  expectReworkAfter,
  mockTransaction,
  assertFailure,
  unvalidatedPayload,
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
  revalidateTag: vi.fn(),
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
    const result = await updateProjectSettings("chart-1", unvalidatedPayload({ overCount: 3 }));
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
    assertFailure(result);
    expect(result.error).toBe("Project not found");
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

  it("saves the settings first, then reworks inside the same transaction", async () => {
    mockPrisma.project.findUnique.mockResolvedValueOnce(
      createMockProject({ id: "proj-1", userId: "user-1", chartId: "chart-1" }),
    );
    const tx = createNeedsReworkTx(createMockProjectForNeeds({ strandCount: 1 }));
    const update = vi.fn().mockResolvedValue({});
    mockTransaction(mockPrisma, { ...tx, project: { ...tx.project, update } });
    const { updateProjectSettings } = await import("./chart-actions");

    await updateProjectSettings("chart-1", { strandCount: 1 });

    expectReworkAfter(update, tx);
  });

  it("reworks the project's calculated needs from the saved settings", async () => {
    mockPrisma.project.findUnique
      .mockResolvedValueOnce(
        createMockProject({ id: "proj-1", userId: "user-1", chartId: "chart-1" }),
      )
      .mockResolvedValueOnce(createMockProjectForNeeds({ strandCount: 1 }));
    mockPrisma.project.update.mockResolvedValueOnce({});
    mockPrisma.projectThread.updateMany.mockResolvedValueOnce({ count: 1 });
    const { revalidatePath } = await import("next/cache");
    const { updateProjectSettings } = await import("./chart-actions");

    const result = await updateProjectSettings("chart-1", { strandCount: 1 });

    expect(result.success).toBe(true);
    expect(mockPrisma.project.findUnique).toHaveBeenLastCalledWith(
      expect.objectContaining({ where: { id: "proj-1" } }),
    );
    expect(mockPrisma.projectThread.updateMany).toHaveBeenCalledWith({
      where: { id: { in: ["pt-1"] } },
      data: { quantityRequired: 7 },
    });
    expect(revalidatePath).toHaveBeenCalledWith("/charts");
    expect(revalidatePath).toHaveBeenCalledWith("/shopping");
  });
});

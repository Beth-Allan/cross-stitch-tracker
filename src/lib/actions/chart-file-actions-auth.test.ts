/**
 * The unauthenticated paths through chart-file-actions: every action calls requireAuth(), and
 * this file is where that rejection is asserted — the sibling chart-file-actions.test.ts always
 * mocks an authenticated session.
 */
import { describe, expect, it, vi, beforeEach } from "vitest";
import { createMockPrisma } from "@/__tests__/mocks";

// Auth returns null (unauthenticated) for all tests in this file
vi.mock("@/lib/auth", () => ({
  auth: vi.fn().mockResolvedValue(null),
}));

const mockPrisma = createMockPrisma();
vi.mock("@/lib/db", () => ({
  prisma: mockPrisma,
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const mockGetR2Client = vi.fn();
vi.mock("@/lib/r2", () => ({
  getReadTarget: async () => ({ client: mockGetR2Client(), bucket: "test-bucket" }),
  getWriteTarget: () => ({ client: mockGetR2Client(), bucket: "test-bucket" }),
}));

vi.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: vi.fn(),
}));

describe("chart-file-actions unauthenticated rejection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("addChartFile throws Unauthorized when caller is not authenticated", async () => {
    const { addChartFile } = await import("./chart-file-actions");

    await expect(
      addChartFile({
        chartId: "chart-1",
        url: "files/chart-1/abc-test.pdf",
        filename: "test.pdf",
        label: null,
      }),
    ).rejects.toThrow("Unauthorized");

    // DB must not be touched
    expect(mockPrisma.chart.findUnique).not.toHaveBeenCalled();
    expect(mockPrisma.chartFile.create).not.toHaveBeenCalled();
  });

  it("deleteChartFile throws Unauthorized when caller is not authenticated", async () => {
    const { deleteChartFile } = await import("./chart-file-actions");

    await expect(deleteChartFile("file-1")).rejects.toThrow("Unauthorized");

    // DB must not be touched
    expect(mockPrisma.chartFile.findUnique).not.toHaveBeenCalled();
    expect(mockPrisma.chartFile.delete).not.toHaveBeenCalled();
  });

  it("getChartFileDownloadUrl throws Unauthorized when caller is not authenticated", async () => {
    const { getChartFileDownloadUrl } = await import("./chart-file-actions");

    await expect(getChartFileDownloadUrl("file-1")).rejects.toThrow("Unauthorized");

    // DB must not be touched and no presigned URL generated
    expect(mockPrisma.chartFile.findUnique).not.toHaveBeenCalled();
  });
});

/**
 * A failed R2 delete must not block the database delete: the file row goes even when
 * DeleteObjectCommand throws, and the orphaned object is accepted rather than leaving a row
 * pointing at nothing.
 */
import { describe, expect, it, vi, beforeEach } from "vitest";
import { createMockPrisma } from "@/__tests__/mocks";

vi.mock("@/lib/auth", () => ({
  auth: vi.fn().mockResolvedValue({ user: { id: "user-1", name: "Test", email: "test@test.com" } }),
}));

const mockPrisma = createMockPrisma();
vi.mock("@/lib/db", () => ({
  prisma: mockPrisma,
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const mockSend = vi.fn();
const mockGetR2Client = vi.fn();
vi.mock("@/lib/r2", () => ({
  getReadTarget: async () => ({ client: mockGetR2Client(), bucket: "test-bucket" }),
  getWriteTarget: () => ({ client: mockGetR2Client(), bucket: "test-bucket" }),
}));

vi.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: vi.fn(),
}));

describe("deleteChartFile — R2 failure is non-blocking", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetR2Client.mockReturnValue({ send: mockSend });
  });

  it("returns success and deletes DB record even when R2 DeleteObjectCommand throws", async () => {
    const { deleteChartFile } = await import("./chart-file-actions");

    mockPrisma.chartFile.findUnique.mockResolvedValue({
      id: "file-1",
      url: "files/chart-1/abc-test.pdf",
      chart: { id: "chart-1", project: { userId: "user-1" } },
    });
    mockPrisma.chartFile.delete.mockResolvedValue({ id: "file-1" });

    // R2 delete fails
    mockSend.mockRejectedValueOnce(new Error("R2 connection refused"));

    const result = await deleteChartFile("file-1");

    // Must succeed despite R2 failure
    expect(result.success).toBe(true);

    // DB record must still be deleted
    expect(mockPrisma.chartFile.delete).toHaveBeenCalledWith({
      where: { id: "file-1" },
    });
  });
});

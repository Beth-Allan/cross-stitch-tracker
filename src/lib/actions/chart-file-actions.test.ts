import { describe, expect, it, vi, beforeEach } from "vitest";
import { createMockPrisma, assertSuccess, assertFailure } from "@/__tests__/mocks";

// Mock auth to return authenticated session
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
  getR2Client: (...args: unknown[]) => mockGetR2Client(...args),
  R2_BUCKET_NAME: "test-bucket",
}));

vi.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: vi.fn().mockResolvedValue("https://presigned.example.com/download"),
}));

describe("chart-file-actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSend.mockReset();
    mockGetR2Client.mockReturnValue({ send: mockSend });
    mockSend.mockResolvedValue({});
  });

  describe("addChartFile", () => {
    it("creates record with correct fields when user owns the chart", async () => {
      const { addChartFile } = await import("./chart-file-actions");

      mockPrisma.chart.findUnique.mockResolvedValue({
        id: "chart-1",
        project: { userId: "user-1" },
      });

      const mockFile = {
        id: "file-1",
        chartId: "chart-1",
        url: "files/chart-1/abc-test.pdf",
        filename: "test.pdf",
        mimeType: "application/pdf",
        fileSize: 5000,
        label: null,
        notes: null,
        createdAt: new Date(),
      };
      mockPrisma.chartFile.create.mockResolvedValue(mockFile);

      const result = await addChartFile({
        chartId: "chart-1",
        url: "files/chart-1/abc-test.pdf",
        filename: "test.pdf",
        mimeType: "application/pdf",
        fileSize: 5000,
        label: null,
      });

      assertSuccess(result);
      expect(result.file).toEqual(mockFile);
      expect(mockPrisma.chartFile.create).toHaveBeenCalledWith({
        data: {
          chartId: "chart-1",
          url: "files/chart-1/abc-test.pdf",
          filename: "test.pdf",
          mimeType: "application/pdf",
          fileSize: 5000,
          label: null,
        },
      });
    });

    it("returns error 'Chart not found' when chart does not exist", async () => {
      const { addChartFile } = await import("./chart-file-actions");

      mockPrisma.chart.findUnique.mockResolvedValue(null);

      const result = await addChartFile({
        chartId: "nonexistent",
        url: "files/x/abc.pdf",
        filename: "test.pdf",
        mimeType: "application/pdf",
        fileSize: 1000,
        label: null,
      });

      assertFailure(result);
      expect(result.error).toBe("Chart not found");
    });

    it("returns error 'Chart not found' when user does not own the chart", async () => {
      const { addChartFile } = await import("./chart-file-actions");

      mockPrisma.chart.findUnique.mockResolvedValue({
        id: "chart-1",
        project: { userId: "other-user" },
      });

      const result = await addChartFile({
        chartId: "chart-1",
        url: "files/chart-1/abc.pdf",
        filename: "test.pdf",
        mimeType: "application/pdf",
        fileSize: 1000,
        label: null,
      });

      assertFailure(result);
      expect(result.error).toBe("Chart not found");
    });

    it("returns Zod error for invalid input (missing chartId)", async () => {
      const { addChartFile } = await import("./chart-file-actions");

      const result = await addChartFile({
        url: "files/x/abc.pdf",
        filename: "test.pdf",
        mimeType: "application/pdf",
        fileSize: 1000,
      });

      assertFailure(result);
      expect(result.error).toBeDefined();
    });

    it("rejects url that does not start with files/ prefix", async () => {
      const { addChartFile } = await import("./chart-file-actions");

      const result = await addChartFile({
        chartId: "chart-1",
        url: "covers/other-chart/image.png",
        filename: "image.png",
        mimeType: "image/png",
        fileSize: 1000,
        label: null,
      });

      assertFailure(result);
      expect(result.error).toBe("Invalid file path");
    });
  });

  describe("deleteChartFile", () => {
    it("deletes R2 object and DB record when user owns the chart", async () => {
      const { deleteChartFile } = await import("./chart-file-actions");

      mockPrisma.chartFile.findUnique.mockResolvedValue({
        id: "file-1",
        url: "files/chart-1/abc-test.pdf",
        chart: { id: "chart-1", project: { userId: "user-1" } },
      });
      mockPrisma.chartFile.delete.mockResolvedValue({ id: "file-1" });

      const result = await deleteChartFile("file-1");

      expect(result.success).toBe(true);
      expect(mockSend).toHaveBeenCalled();
      expect(mockPrisma.chartFile.delete).toHaveBeenCalledWith({
        where: { id: "file-1" },
      });
    });

    it("returns error when user does not own the chart", async () => {
      const { deleteChartFile } = await import("./chart-file-actions");

      mockPrisma.chartFile.findUnique.mockResolvedValue({
        id: "file-1",
        url: "files/chart-1/abc-test.pdf",
        chart: { id: "chart-1", project: { userId: "other-user" } },
      });

      const result = await deleteChartFile("file-1");

      assertFailure(result);
      expect(result.error).toBe("File not found");
    });

    it("returns error when file does not exist", async () => {
      const { deleteChartFile } = await import("./chart-file-actions");

      mockPrisma.chartFile.findUnique.mockResolvedValue(null);

      const result = await deleteChartFile("nonexistent");

      assertFailure(result);
      expect(result.error).toBe("File not found");
    });
  });

  describe("getChartFileDownloadUrl", () => {
    it("returns presigned URL for owned file", async () => {
      const { getChartFileDownloadUrl } = await import("./chart-file-actions");

      mockPrisma.chartFile.findUnique.mockResolvedValue({
        id: "file-1",
        url: "files/chart-1/abc-test.pdf",
        filename: "test.pdf",
        mimeType: "application/pdf",
        chart: { id: "chart-1", project: { userId: "user-1" } },
      });

      const result = await getChartFileDownloadUrl("file-1");

      assertSuccess(result);
      expect(result.url).toBe("https://presigned.example.com/download");
      expect(result.filename).toBe("test.pdf");
      expect(result.mimeType).toBe("application/pdf");
    });

    it("returns error for unauthorized access", async () => {
      const { getChartFileDownloadUrl } = await import("./chart-file-actions");

      mockPrisma.chartFile.findUnique.mockResolvedValue({
        id: "file-1",
        url: "files/chart-1/abc-test.pdf",
        filename: "test.pdf",
        mimeType: "application/pdf",
        chart: { id: "chart-1", project: { userId: "other-user" } },
      });

      const result = await getChartFileDownloadUrl("file-1");

      assertFailure(result);
      expect(result.error).toBe("File not found");
    });

    it("returns structured error when R2 is not configured", async () => {
      const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");
      const { getChartFileDownloadUrl } = await import("./chart-file-actions");

      mockPrisma.chartFile.findUnique.mockResolvedValue({
        id: "file-1",
        url: "files/chart-1/abc-test.pdf",
        filename: "test.pdf",
        mimeType: "application/pdf",
        chart: { id: "chart-1", project: { userId: "user-1" } },
      });

      vi.mocked(getSignedUrl).mockRejectedValueOnce(
        new Error("R2 environment variables not configured"),
      );

      const result = await getChartFileDownloadUrl("file-1");

      assertFailure(result);
      expect(result.error).toBe("File storage is not configured.");
    });
  });
});

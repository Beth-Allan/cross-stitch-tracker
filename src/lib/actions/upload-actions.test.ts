import { describe, expect, it, vi, beforeEach } from "vitest";
import { createMockPrisma } from "@/__tests__/mocks";

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
  getSignedUrl: vi.fn().mockResolvedValue("https://presigned.example.com/test"),
}));

vi.mock("sharp", () => ({ default: vi.fn() }));

vi.mock("nanoid", () => ({ nanoid: () => "test-nano-id" }));

describe("upload-actions failure modes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: R2 client available and working
    mockGetR2Client.mockReturnValue({ send: mockSend });
    mockSend.mockResolvedValue({});
  });

  describe("getPresignedUploadUrl", () => {
    it("returns error for invalid image type on covers category", async () => {
      const { getPresignedUploadUrl } = await import("./upload-actions");

      const result = await getPresignedUploadUrl({
        fileName: "test.exe",
        contentType: "application/x-msdownload",
        fileSize: 1024,
        category: "covers",
        projectId: "p1",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("Invalid image type");
      }
    });

    it("returns error for invalid file type on files category", async () => {
      const { getPresignedUploadUrl } = await import("./upload-actions");

      const result = await getPresignedUploadUrl({
        fileName: "test.exe",
        contentType: "application/x-msdownload",
        fileSize: 1024,
        category: "files",
        projectId: "p1",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("Invalid file type");
      }
    });

    it("returns error when R2 is not configured", async () => {
      const { getPresignedUploadUrl } = await import("./upload-actions");
      mockGetR2Client.mockImplementation(() => {
        throw new Error("R2 environment variables not configured");
      });

      const result = await getPresignedUploadUrl({
        fileName: "photo.png",
        contentType: "image/png",
        fileSize: 1024,
        category: "covers",
        projectId: "p1",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("not configured");
      }
    });

    it("returns validation-specific message on Zod validation failure (not 'storage not configured')", async () => {
      const { getPresignedUploadUrl } = await import("./upload-actions");

      const result = await getPresignedUploadUrl({});

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(typeof result.error).toBe("string");
        // Must NOT say "storage not configured" for a validation error
        expect(result.error).not.toContain("not configured");
      }
    });

    it("returns generic error and logs console.error on unexpected R2 error", async () => {
      const { getPresignedUploadUrl } = await import("./upload-actions");
      const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      vi.mocked(getSignedUrl).mockRejectedValueOnce(new Error("Unexpected S3 timeout"));

      const result = await getPresignedUploadUrl({
        fileName: "photo.png",
        contentType: "image/png",
        fileSize: 1024,
        category: "covers",
        projectId: "p1",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).not.toContain("not configured");
        expect(result.error).toBe("Failed to generate upload URL");
      }
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe("getPresignedDownloadUrl", () => {
    it("returns 'not configured' error when R2 is not configured", async () => {
      const { getPresignedDownloadUrl } = await import("./upload-actions");
      mockGetR2Client.mockImplementation(() => {
        throw new Error("R2 environment variables not configured");
      });

      const result = await getPresignedDownloadUrl("some-key");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("not configured");
      }
    });

    it("returns generic error and logs on unexpected R2 error", async () => {
      const { getPresignedDownloadUrl } = await import("./upload-actions");
      const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      vi.mocked(getSignedUrl).mockRejectedValueOnce(new Error("Unexpected timeout"));

      const result = await getPresignedDownloadUrl("some-key");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).not.toContain("not configured");
        expect(result.error).toBe("Failed to generate download URL");
      }
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe("confirmUpload", () => {
    it("returns error for invalid field name", async () => {
      const { confirmUpload } = await import("./upload-actions");

      const result = await confirmUpload({
        chartId: "c1",
        field: "hackerField",
        key: "k1",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("Invalid field");
      }
    });

    it("returns error on DB failure during update", async () => {
      const { confirmUpload } = await import("./upload-actions");
      mockPrisma.chart.update.mockRejectedValueOnce(new Error("DB error"));

      const result = await confirmUpload({
        chartId: "c1",
        field: "coverImageUrl",
        key: "k1",
      });

      expect(result).toEqual({ success: false, error: "Failed to confirm upload" });
    });
  });

  describe("deleteFile", () => {
    it("returns error when R2 send fails", async () => {
      const { deleteFile } = await import("./upload-actions");
      mockSend.mockRejectedValueOnce(new Error("R2 send failed"));

      const result = await deleteFile("some-key");

      expect(result).toEqual({ success: false, error: "Failed to delete file" });
    });
  });
});

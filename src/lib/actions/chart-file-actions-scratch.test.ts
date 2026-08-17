/**
 * The chart-file actions obey the same split as the upload actions — a
 * download is presigned against whichever bucket holds the key, and a delete can
 * only ever reach the write bucket, so a preview deployment cannot remove one of
 * Beth's real chart files.
 */
import { describe, expect, it, vi, beforeEach } from "vitest";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createMockPrisma, assertSuccess } from "@/__tests__/mocks";

vi.mock("@/lib/auth", () => ({
  auth: vi.fn().mockResolvedValue({ user: { id: "user-1", name: "Test", email: "test@test.com" } }),
}));

const mockPrisma = createMockPrisma();
vi.mock("@/lib/db", () => ({ prisma: mockPrisma }));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const readSend = vi.fn();
const writeSend = vi.fn();
const readClient = { send: readSend };
const writeClient = { send: writeSend };
const mockGetReadTarget = vi.fn();
const mockGetWriteTarget = vi.fn();
vi.mock("@/lib/r2", () => ({
  getReadTarget: (...args: unknown[]) => mockGetReadTarget(...args),
  getWriteTarget: (...args: unknown[]) => mockGetWriteTarget(...args),
}));

vi.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: vi.fn().mockResolvedValue("https://presigned.example.com/download"),
}));

const OWNED_FILE = {
  id: "file-1",
  url: "files/chart-1/abc-test.pdf",
  filename: "test.pdf",
  mimeType: "application/pdf",
  chart: { id: "chart-1", project: { userId: "user-1" } },
};

describe("chart-file-actions with a scratch write bucket", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    readSend.mockReset();
    writeSend.mockReset();
    readSend.mockResolvedValue({});
    writeSend.mockResolvedValue({});
    mockGetReadTarget.mockResolvedValue({ client: readClient, bucket: "real-bucket" });
    mockGetWriteTarget.mockReturnValue({ client: writeClient, bucket: "scratch-bucket" });
    vi.mocked(getSignedUrl).mockResolvedValue("https://presigned.example.com/download");
  });

  it("deletes only from the scratch bucket, leaving the real file untouched", async () => {
    const { deleteChartFile } = await import("./chart-file-actions");
    mockPrisma.chartFile.findUnique.mockResolvedValue(OWNED_FILE);
    mockPrisma.chartFile.delete.mockResolvedValue({ id: "file-1" });

    const result = await deleteChartFile("file-1");

    assertSuccess(result);
    expect(writeSend.mock.calls.map((call) => call[0].input.Bucket)).toEqual(["scratch-bucket"]);
    expect(readSend).not.toHaveBeenCalled();
  });

  it("presigns a download against the bucket the file actually lives in", async () => {
    const { getChartFileDownloadUrl } = await import("./chart-file-actions");
    mockPrisma.chartFile.findUnique.mockResolvedValue(OWNED_FILE);

    const result = await getChartFileDownloadUrl("file-1");

    assertSuccess(result);
    expect(mockGetReadTarget).toHaveBeenCalledWith("files/chart-1/abc-test.pdf");
    const [client, command] = vi.mocked(getSignedUrl).mock.calls[0];
    expect(client).toBe(readClient);
    expect((command as unknown as { input: { Bucket: string } }).input.Bucket).toBe("real-bucket");
  });
});

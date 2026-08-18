/**
 * On preview deployments, reads and writes land in different buckets — real
 * images are readable, every write goes to a scratch bucket. These tests pin the
 * direction of each R2 call in upload-actions, which is what makes a preview unable
 * to modify or delete one of Beth's real files.
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
  getSignedUrl: vi.fn().mockResolvedValue("https://presigned.example.com/test"),
}));

const mockToBuffer = vi.fn();
const mockWebp = vi.fn();
const mockResize = vi.fn();
const mockMetadata = vi.fn();
const mockSharp = vi.fn();
vi.mock("sharp", () => ({ default: mockSharp }));

vi.mock("nanoid", () => ({ nanoid: () => "test-nano-id" }));

function bucketsOf(sendMock: typeof readSend): string[] {
  return sendMock.mock.calls.map((call) => call[0].input.Bucket);
}

function presignedBuckets(): string[] {
  return vi.mocked(getSignedUrl).mock.calls.map((call) => {
    const command = call[1] as unknown as { input: { Bucket: string } };
    return command.input.Bucket;
  });
}

function presignedClients(): unknown[] {
  return vi.mocked(getSignedUrl).mock.calls.map((call) => call[0]);
}

describe("upload-actions with a scratch write bucket", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    readSend.mockReset();
    writeSend.mockReset();
    readSend.mockResolvedValue({});
    writeSend.mockResolvedValue({});
    mockGetReadTarget.mockResolvedValue({ client: readClient, bucket: "real-bucket" });
    mockGetWriteTarget.mockReturnValue({ client: writeClient, bucket: "scratch-bucket" });
    vi.mocked(getSignedUrl).mockResolvedValue("https://presigned.example.com/test");
    mockSharp.mockReturnValue({ resize: mockResize, metadata: mockMetadata });
    mockResize.mockReturnValue({ webp: mockWebp });
    mockWebp.mockReturnValue({ toBuffer: mockToBuffer });
    mockToBuffer.mockResolvedValue(Buffer.from("processed-image-data"));
    mockMetadata.mockResolvedValue({ format: "jpeg", width: 800, height: 600 });
    mockPrisma.chart.findUnique.mockResolvedValue({
      id: "chart-1",
      coverImageUrl: "covers/chart-1/opt-abc.webp",
      project: { userId: "user-1" },
    });
  });

  it("presigns an upload against the scratch bucket and its client", async () => {
    const { getPresignedUploadUrl } = await import("./upload-actions");

    const result = await getPresignedUploadUrl({
      fileName: "cover.jpg",
      contentType: "image/jpeg",
      category: "covers",
      projectId: "chart-1",
      fileSize: 1000,
    });

    assertSuccess(result);
    expect(presignedBuckets()).toEqual(["scratch-bucket"]);
    expect(presignedClients()).toEqual([writeClient]);
  });

  it("presigns a download against the bucket the key actually lives in", async () => {
    const { getPresignedDownloadUrl } = await import("./upload-actions");

    await getPresignedDownloadUrl("covers/chart-1/opt-abc.webp");

    expect(mockGetReadTarget).toHaveBeenCalledWith("covers/chart-1/opt-abc.webp");
    expect(presignedBuckets()).toEqual(["real-bucket"]);
    expect(presignedClients()).toEqual([readClient]);
  });

  it("resolves each image key separately, so preview uploads and real images both load", async () => {
    const { getPresignedImageUrls } = await import("./upload-actions");
    mockGetReadTarget.mockImplementation(async (key: string) =>
      key === "covers/chart-2/thumb-new.webp"
        ? { client: writeClient, bucket: "scratch-bucket" }
        : { client: readClient, bucket: "real-bucket" },
    );

    await getPresignedImageUrls(["covers/chart-1/thumb-old.webp", "covers/chart-2/thumb-new.webp"]);

    expect(presignedBuckets()).toEqual(["real-bucket", "scratch-bucket"]);
  });

  it("deletes only from the scratch bucket, so a real file cannot be removed", async () => {
    const { deleteFile } = await import("./upload-actions");

    const result = await deleteFile("covers/chart-1/opt-abc.webp");

    assertSuccess(result);
    expect(bucketsOf(writeSend)).toEqual(["scratch-bucket"]);
    expect(readSend).not.toHaveBeenCalled();
  });

  it("reads the raw image from its own bucket and stores both derivatives in scratch", async () => {
    const { processAndStoreImage } = await import("./upload-actions");
    readSend.mockResolvedValue({ Body: [new Uint8Array([1, 2, 3])] });

    const result = await processAndStoreImage("chart-1", "covers/chart-1/raw-abc.jpg", "covers");

    assertSuccess(result);
    expect(mockGetReadTarget).toHaveBeenCalledWith("covers/chart-1/raw-abc.jpg");
    expect(bucketsOf(readSend)).toEqual(["real-bucket"]);
    expect(bucketsOf(writeSend)).toEqual(["scratch-bucket", "scratch-bucket"]);
  });

  it("stores a regenerated thumbnail in the scratch bucket", async () => {
    const { generateThumbnail } = await import("./upload-actions");
    readSend.mockResolvedValue({ Body: [new Uint8Array([1, 2, 3])] });
    mockPrisma.chart.update.mockResolvedValue({ id: "chart-1" });

    const result = await generateThumbnail("chart-1", "covers/chart-1/opt-abc.webp");

    assertSuccess(result);
    expect(bucketsOf(writeSend)).toEqual(["scratch-bucket"]);
  });
});

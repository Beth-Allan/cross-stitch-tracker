import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

const mockSend = vi.fn();
const constructedClients: Array<{ config: Record<string, unknown> }> = [];

vi.mock("@aws-sdk/client-s3", () => ({
  S3Client: class {
    send = mockSend;
    constructor(public config: Record<string, unknown>) {
      constructedClients.push(this);
    }
  },
  HeadObjectCommand: class {
    constructor(public input: Record<string, unknown>) {}
  },
  DeleteObjectsCommand: class {
    constructor(public input: Record<string, unknown>) {}
  },
}));

function credentialsOf(client: unknown): { accessKeyId: string } {
  return (client as { config: { credentials: { accessKeyId: string } } }).config.credentials;
}

async function loadR2() {
  vi.resetModules();
  return import("./r2");
}

function configureCredentials() {
  vi.stubEnv("R2_ACCOUNT_ID", "account-1");
  vi.stubEnv("R2_ACCESS_KEY_ID", "read-key");
  vi.stubEnv("R2_SECRET_ACCESS_KEY", "read-secret");
  vi.stubEnv("R2_BUCKET_NAME", "real-bucket");
}

describe("r2 target resolution", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    constructedClients.length = 0;
    mockSend.mockResolvedValue({});
    vi.stubEnv("R2_SCRATCH_BUCKET_NAME", "");
    vi.stubEnv("R2_SCRATCH_ACCESS_KEY_ID", "");
    vi.stubEnv("R2_SCRATCH_SECRET_ACCESS_KEY", "");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("without a scratch bucket (production and local)", () => {
    beforeEach(configureCredentials);

    it("writes to the configured bucket", async () => {
      const { getWriteTarget } = await loadR2();

      expect(getWriteTarget().bucket).toBe("real-bucket");
    });

    it("reads from the configured bucket without probing storage first", async () => {
      const { getReadTarget } = await loadR2();

      const target = await getReadTarget("covers/chart-1/opt-abc.webp");

      expect(target.bucket).toBe("real-bucket");
      expect(mockSend).not.toHaveBeenCalled();
    });

    it("uses one client for reads and writes", async () => {
      const { getReadTarget, getWriteTarget } = await loadR2();

      const read = await getReadTarget("covers/chart-1/opt-abc.webp");

      expect(read.client).toBe(getWriteTarget().client);
      expect(constructedClients).toHaveLength(1);
    });

    it("builds the client against the account's R2 endpoint", async () => {
      const { getWriteTarget } = await loadR2();

      getWriteTarget();

      expect(constructedClients[0].config).toMatchObject({
        region: "auto",
        endpoint: "https://account-1.r2.cloudflarestorage.com",
        credentials: { accessKeyId: "read-key", secretAccessKey: "read-secret" },
      });
    });
  });

  describe("with a scratch bucket (preview deployments)", () => {
    beforeEach(() => {
      configureCredentials();
      vi.stubEnv("R2_SCRATCH_BUCKET_NAME", "scratch-bucket");
    });

    it("sends every write to the scratch bucket, never the real one", async () => {
      const { getWriteTarget } = await loadR2();

      expect(getWriteTarget().bucket).toBe("scratch-bucket");
    });

    it("reads an object the preview itself wrote from the scratch bucket", async () => {
      const { getReadTarget } = await loadR2();
      mockSend.mockResolvedValue({ ContentLength: 42 });

      const target = await getReadTarget("covers/chart-1/opt-abc.webp");

      expect(target.bucket).toBe("scratch-bucket");
      expect(mockSend).toHaveBeenCalledTimes(1);
      expect(mockSend.mock.calls[0][0].input).toEqual({
        Bucket: "scratch-bucket",
        Key: "covers/chart-1/opt-abc.webp",
      });
    });

    it("falls back to the real bucket, silently, when the object is simply not in scratch", async () => {
      const error = vi.spyOn(console, "error").mockImplementation(() => {});
      const { getReadTarget } = await loadR2();
      mockSend.mockRejectedValue(
        Object.assign(new Error("NotFound"), {
          name: "NotFound",
          $metadata: { httpStatusCode: 404 },
        }),
      );

      const target = await getReadTarget("covers/chart-1/opt-abc.webp");

      expect(target.bucket).toBe("real-bucket");
      expect(error).not.toHaveBeenCalled();
      error.mockRestore();
    });

    it("logs, rather than swallowing, a scratch probe that fails for any other reason", async () => {
      const error = vi.spyOn(console, "error").mockImplementation(() => {});
      const { getReadTarget } = await loadR2();
      mockSend.mockRejectedValue(new Error("AccessDenied"));

      const target = await getReadTarget("covers/chart-1/opt-abc.webp");

      expect(target.bucket).toBe("real-bucket");
      expect(error).toHaveBeenCalledOnce();
      expect(error.mock.calls[0].join(" ")).toContain("covers/chart-1/opt-abc.webp");
      error.mockRestore();
    });

    it("throws when only half of the scratch credential pair is set", async () => {
      vi.stubEnv("R2_SCRATCH_ACCESS_KEY_ID", "scratch-key");
      const { getWriteTarget } = await loadR2();

      expect(() => getWriteTarget()).toThrow(/R2 environment variables not configured/);
    });

    it("throws when only the scratch secret is set", async () => {
      vi.stubEnv("R2_SCRATCH_SECRET_ACCESS_KEY", "scratch-secret");
      const { getWriteTarget } = await loadR2();

      expect(() => getWriteTarget()).toThrow(/R2 environment variables not configured/);
    });

    it("uses the scratch credentials for writes when they are supplied", async () => {
      vi.stubEnv("R2_SCRATCH_ACCESS_KEY_ID", "scratch-key");
      vi.stubEnv("R2_SCRATCH_SECRET_ACCESS_KEY", "scratch-secret");
      const { getWriteTarget, getReadTarget } = await loadR2();
      mockSend.mockRejectedValue(new Error("NotFound"));

      const write = getWriteTarget();
      const read = await getReadTarget("covers/chart-1/opt-abc.webp");

      expect(write.client).not.toBe(read.client);
      expect(credentialsOf(write.client).accessKeyId).toBe("scratch-key");
      expect(credentialsOf(read.client).accessKeyId).toBe("read-key");
    });

    it("reuses the read credentials for writes when no scratch credentials are supplied", async () => {
      const { getWriteTarget } = await loadR2();

      expect(credentialsOf(getWriteTarget().client).accessKeyId).toBe("read-key");
    });

    it("throws rather than quietly writing to production when scratch names the real bucket", async () => {
      vi.stubEnv("R2_SCRATCH_BUCKET_NAME", "real-bucket");
      const { getWriteTarget } = await loadR2();

      expect(() => getWriteTarget()).toThrow(/R2 environment variables not configured/);
    });
  });

  describe("missing configuration", () => {
    it("throws on a missing bucket name instead of falling back to a default", async () => {
      vi.stubEnv("R2_ACCOUNT_ID", "account-1");
      vi.stubEnv("R2_ACCESS_KEY_ID", "read-key");
      vi.stubEnv("R2_SECRET_ACCESS_KEY", "read-secret");
      vi.stubEnv("R2_BUCKET_NAME", "");
      const { getWriteTarget } = await loadR2();

      expect(() => getWriteTarget()).toThrow(/R2 environment variables not configured/);
    });

    it("says nothing at import time, so the build log stays quiet", async () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      vi.stubEnv("R2_BUCKET_NAME", "");
      vi.stubEnv("R2_ACCOUNT_ID", "");

      await loadR2();

      expect(warn).not.toHaveBeenCalled();
      expect(constructedClients).toHaveLength(0);
      warn.mockRestore();
    });

    it("throws on missing credentials", async () => {
      vi.stubEnv("R2_BUCKET_NAME", "real-bucket");
      vi.stubEnv("R2_ACCOUNT_ID", "account-1");
      vi.stubEnv("R2_ACCESS_KEY_ID", "");
      vi.stubEnv("R2_SECRET_ACCESS_KEY", "");
      const { getWriteTarget } = await loadR2();

      expect(() => getWriteTarget()).toThrow(/R2 environment variables not configured/);
    });

    it("throws on a missing account id", async () => {
      vi.stubEnv("R2_BUCKET_NAME", "real-bucket");
      vi.stubEnv("R2_ACCOUNT_ID", "");
      vi.stubEnv("R2_ACCESS_KEY_ID", "read-key");
      vi.stubEnv("R2_SECRET_ACCESS_KEY", "read-secret");
      const { getWriteTarget } = await loadR2();

      expect(() => getWriteTarget()).toThrow(/R2 environment variables not configured/);
    });
  });
});

describe("discardStoredObjects", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    constructedClients.length = 0;
    mockSend.mockResolvedValue({});
    configureCredentials();
    vi.stubEnv("R2_SCRATCH_BUCKET_NAME", "");
    vi.stubEnv("R2_SCRATCH_ACCESS_KEY_ID", "");
    vi.stubEnv("R2_SCRATCH_SECRET_ACCESS_KEY", "");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  /** The batch-delete requests issued, as bucket, keys, and the quiet flag. */
  function deleteBatches(): { Bucket: string; Keys: string[]; Quiet: boolean }[] {
    return mockSend.mock.calls
      .map(([command]) => command.input as Record<string, never>)
      .filter((input) => "Delete" in input)
      .map((input) => {
        const typed = input as unknown as {
          Bucket: string;
          Delete: { Objects: { Key: string }[]; Quiet: boolean };
        };
        return {
          Bucket: typed.Bucket,
          Keys: typed.Delete.Objects.map((object) => object.Key),
          Quiet: typed.Delete.Quiet,
        };
      });
  }

  it("removes every key in one quiet request against the write bucket", async () => {
    const { discardStoredObjects } = await loadR2();

    await discardStoredObjects(
      ["covers/chart-1/opt-a.webp", "files/chart-1/pattern.pdf", "sessions/session-1/opt-b.webp"],
      "chart chart-1",
    );

    expect(deleteBatches()).toEqual([
      {
        Bucket: "real-bucket",
        Keys: [
          "covers/chart-1/opt-a.webp",
          "files/chart-1/pattern.pdf",
          "sessions/session-1/opt-b.webp",
        ],
        // Quiet mode is what makes `Errors` the whole reply; without it the
        // per-key failure list is buried in a full success manifest.
        Quiet: true,
      },
    ]);
  });

  it("deletes from the scratch bucket on a preview deployment", async () => {
    vi.stubEnv("R2_SCRATCH_BUCKET_NAME", "scratch-bucket");
    const { discardStoredObjects } = await loadR2();

    await discardStoredObjects(["covers/chart-1/opt-a.webp"], "chart chart-1");

    expect(deleteBatches()[0].Bucket).toBe("scratch-bucket");
  });

  it("sends nothing when every key is absent", async () => {
    const { discardStoredObjects } = await loadR2();

    await discardStoredObjects([null, undefined, ""], "chart chart-1");

    expect(mockSend).not.toHaveBeenCalled();
  });

  it("de-duplicates repeated keys", async () => {
    const { discardStoredObjects } = await loadR2();

    await discardStoredObjects(
      ["covers/chart-1/opt-a.webp", "covers/chart-1/opt-a.webp"],
      "chart chart-1",
    );

    expect(deleteBatches()[0].Keys).toEqual(["covers/chart-1/opt-a.webp"]);
  });

  it("skips a key outside the app's namespace, removes the rest, and says which was which", async () => {
    const { discardStoredObjects } = await loadR2();
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await discardStoredObjects(["../../etc/passwd", "covers/chart-1/opt-a.webp"], "chart chart-1");

    expect(deleteBatches()[0].Keys).toEqual(["covers/chart-1/opt-a.webp"]);
    // A malformed key names no object, so nothing was left behind by it — the two
    // are logged separately rather than pooled as "objects left behind".
    expect(errorSpy).toHaveBeenCalledWith(
      "[R2] keys outside this app's namespace, skipped for chart chart-1:",
      ["../../etc/passwd"],
    );
    errorSpy.mockRestore();
  });

  it("splits a batch that exceeds R2's 1000-key limit", async () => {
    const { discardStoredObjects } = await loadR2();
    const keys = Array.from({ length: 1001 }, (_, index) => `files/chart-1/file-${index}.pdf`);

    await discardStoredObjects(keys, "chart chart-1");

    const batches = deleteBatches();
    expect(batches).toHaveLength(2);
    expect(batches[0].Keys).toHaveLength(1000);
    expect(batches[1].Keys).toEqual(["files/chart-1/file-1000.pdf"]);
  });

  it("logs the keys R2 reports it could not remove", async () => {
    const { discardStoredObjects } = await loadR2();
    mockSend.mockResolvedValueOnce({ Errors: [{ Key: "files/chart-1/pattern.pdf" }] });
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await discardStoredObjects(
      ["covers/chart-1/opt-a.webp", "files/chart-1/pattern.pdf"],
      "chart chart-1",
    );

    expect(errorSpy).toHaveBeenCalledWith("[R2] objects left behind for chart chart-1:", [
      "files/chart-1/pattern.pdf",
    ]);
    errorSpy.mockRestore();
  });

  it("never throws when R2 is unreachable, so a completed delete is not reported as failed", async () => {
    const { discardStoredObjects } = await loadR2();
    mockSend.mockRejectedValueOnce(new Error("R2 unreachable"));
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(
      discardStoredObjects(["covers/chart-1/opt-a.webp"], "chart chart-1"),
    ).resolves.toBeUndefined();

    // Everything leaked, so this is an error line, not a warning.
    expect(errorSpy).toHaveBeenCalledWith(
      "[R2] cleanup failed for chart chart-1 — every object left behind:",
      expect.any(Error),
    );
    errorSpy.mockRestore();
  });
});

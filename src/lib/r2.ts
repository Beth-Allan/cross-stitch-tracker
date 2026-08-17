import { HeadObjectCommand, S3Client } from "@aws-sdk/client-s3";

/**
 * A bucket and a client authorised for it. Reads and writes can land in different
 * buckets (see `R2_SCRATCH_BUCKET_NAME`), so callers take both together rather than
 * pairing a client with a bucket name themselves.
 */
export type R2Target = { client: S3Client; bucket: string };

// The upload and download actions match on this phrase to turn a configuration
// problem into "File storage is not configured" instead of a generic failure, so
// every throw in this module carries it.
const CONFIG_ERROR = "R2 environment variables not configured.";

function readEnv(name: string): string | null {
  const value = process.env[name]?.trim();
  return value ? value : null;
}

function createClient(accessKeyId: string, secretAccessKey: string): S3Client {
  const accountId = readEnv("R2_ACCOUNT_ID");
  if (!accountId) throw new Error(`${CONFIG_ERROR} Set R2_ACCOUNT_ID.`);

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}

let _readClient: S3Client | null = null;
function getReadClient(): S3Client {
  if (!_readClient) {
    const accessKeyId = readEnv("R2_ACCESS_KEY_ID");
    const secretAccessKey = readEnv("R2_SECRET_ACCESS_KEY");
    if (!accessKeyId || !secretAccessKey) {
      throw new Error(`${CONFIG_ERROR} Set R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY.`);
    }
    _readClient = createClient(accessKeyId, secretAccessKey);
  }
  return _readClient;
}

let _scratchClient: S3Client | null = null;
function getScratchClient(): S3Client {
  const accessKeyId = readEnv("R2_SCRATCH_ACCESS_KEY_ID");
  const secretAccessKey = readEnv("R2_SCRATCH_SECRET_ACCESS_KEY");
  // Optional: one credential pair can cover both buckets. Supplying a separate
  // scratch pair lets the main pair be read-only, so Cloudflare — not this code —
  // is what stops a preview writing to production storage.
  if (!accessKeyId || !secretAccessKey) return getReadClient();

  if (!_scratchClient) _scratchClient = createClient(accessKeyId, secretAccessKey);
  return _scratchClient;
}

function getReadBucket(): string {
  const bucket = readEnv("R2_BUCKET_NAME");
  if (!bucket) throw new Error(`${CONFIG_ERROR} Set R2_BUCKET_NAME.`);
  return bucket;
}

/**
 * The scratch bucket, or null when this deployment reads and writes one bucket.
 * Set on Vercel Preview only: previews display the real bucket's images so design
 * review is honest, but every object they create or delete lands here instead
 * (Beth's ruling, 2026-08-17 — read real, write scratch).
 */
function getScratchBucket(): string | null {
  const scratch = readEnv("R2_SCRATCH_BUCKET_NAME");
  if (!scratch) return null;
  if (scratch === getReadBucket()) {
    // A deployment that names the real bucket as its scratch bucket believes it is
    // isolated and is not. Failing loudly beats writing to production quietly.
    throw new Error(`${CONFIG_ERROR} R2_SCRATCH_BUCKET_NAME must differ from R2_BUCKET_NAME.`);
  }
  return scratch;
}

/**
 * Where every `PutObject` and `DeleteObject` goes. In scratch mode this is the only
 * bucket the app can write to at all, which is what makes a preview unable to
 * modify or remove a real file: a delete aimed at a production key is issued
 * against the scratch bucket, where it is a harmless no-op.
 */
export function getWriteTarget(): R2Target {
  const scratch = getScratchBucket();
  if (!scratch) return { client: getReadClient(), bucket: getReadBucket() };
  return { client: getScratchClient(), bucket: scratch };
}

async function objectExists(target: R2Target, key: string): Promise<boolean> {
  try {
    await target.client.send(new HeadObjectCommand({ Bucket: target.bucket, Key: key }));
    return true;
  } catch {
    // Missing, or unreachable: either way the real bucket is the safe answer,
    // because reading it cannot change anything.
    return false;
  }
}

/**
 * Where a given key is read from. Outside scratch mode this is the configured
 * bucket and costs nothing. In scratch mode the preview's own uploads exist only in
 * the scratch bucket, so it is checked first and the real bucket answers everything
 * else — one extra `HeadObject` per key, on preview deployments only.
 */
export async function getReadTarget(key: string): Promise<R2Target> {
  const scratch = getScratchBucket();
  if (!scratch) return { client: getReadClient(), bucket: getReadBucket() };

  const scratchTarget: R2Target = { client: getScratchClient(), bucket: scratch };
  if (await objectExists(scratchTarget, key)) return scratchTarget;
  return { client: getReadClient(), bucket: getReadBucket() };
}

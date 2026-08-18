import { DeleteObjectsCommand, HeadObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { storageKeySchema } from "@/lib/validations/upload";

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

  // Both or neither. A separate scratch pair lets the main pair be read-only, so
  // Cloudflare rather than this code is what stops a preview writing to production
  // storage; omitting both means one pair covers both buckets. Half a pair is a
  // configuration mistake, and it fails the same way a wrong scratch bucket name
  // does — loudly, rather than by quietly writing with production credentials.
  if (!accessKeyId && !secretAccessKey) return getReadClient();
  if (!accessKeyId || !secretAccessKey) {
    throw new Error(
      `${CONFIG_ERROR} Set both R2_SCRATCH_ACCESS_KEY_ID and R2_SCRATCH_SECRET_ACCESS_KEY, or neither.`,
    );
  }

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
 * review is honest, but every object they create or delete lands here instead.
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

function getRealTarget(): R2Target {
  return { client: getReadClient(), bucket: getReadBucket() };
}

/**
 * Where every `PutObject` and `DeleteObject` goes. In scratch mode this is the only
 * bucket the app can write to at all, which is what makes a preview unable to
 * modify or remove a real file: a delete aimed at a production key is issued
 * against the scratch bucket, where it is a harmless no-op.
 */
export function getWriteTarget(): R2Target {
  const scratch = getScratchBucket();
  if (!scratch) return getRealTarget();
  return { client: getScratchClient(), bucket: scratch };
}

function isNotFound(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  const { name, $metadata } = error as { name?: string; $metadata?: { httpStatusCode?: number } };
  return name === "NotFound" || name === "NoSuchKey" || $metadata?.httpStatusCode === 404;
}

async function objectExists(target: R2Target, key: string): Promise<boolean> {
  try {
    await target.client.send(new HeadObjectCommand({ Bucket: target.bucket, Key: key }));
    return true;
  } catch (error) {
    // A miss is the normal answer for anything the preview did not upload itself.
    // Anything else — denied credentials, an unreachable bucket — reads identically
    // from here and would leave a preview showing broken images with no explanation,
    // so it is logged before taking the same safe fallback.
    if (!isNotFound(error)) {
      console.error("[R2] scratch probe failed, falling back to the read bucket:", key, error);
    }
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
  if (!scratch) return getRealTarget();

  const scratchTarget: R2Target = { client: getScratchClient(), bucket: scratch };
  if (await objectExists(scratchTarget, key)) return scratchTarget;
  return getRealTarget();
}

// R2 accepts at most this many keys in one batch delete, as S3 does.
const MAX_KEYS_PER_DELETE_REQUEST = 1000;

/**
 * Removes objects whose rows are already gone: a deleted chart's cover, files and
 * session photos, or the cover a replacement superseded. Nothing is returned and
 * nothing is thrown — by the time this runs the database is authoritative, so a
 * storage failure is an orphan to log, never a reason to tell Beth her delete
 * failed. `context` names the entity in that log, which is all anyone has left
 * once the keys themselves are unrecoverable.
 *
 * It lives here rather than beside `deleteFile` deliberately: every caller resolves
 * its keys from an ownership-checked row, and exporting a bulk delete from a
 * `"use server"` file would publish it as an endpoint taking an unbounded list of
 * keys. Deletes go to the write target, so a preview aims them at scratch.
 */
export async function discardStoredObjects(
  keys: (string | null | undefined)[],
  context: string,
): Promise<void> {
  const present = [...new Set(keys.filter((key): key is string => Boolean(key)))];
  if (present.length === 0) return;

  try {
    const { malformed, refused } = await removeObjects(present);
    if (malformed.length > 0) {
      // Not keys this app ever wrote, so they name no object and nothing leaked —
      // but a row holding one is corrupt data worth seeing.
      console.error(`[R2] keys outside this app's namespace, skipped for ${context}:`, malformed);
    }
    if (refused.length > 0) {
      console.error(`[R2] objects left behind for ${context}:`, refused);
    }
  } catch (error) {
    console.error(`[R2] cleanup failed for ${context} — every object left behind:`, error);
  }
}

async function removeObjects(keys: string[]): Promise<{ malformed: string[]; refused: string[] }> {
  const malformed: string[] = [];
  const valid: string[] = [];
  for (const key of keys) {
    if (storageKeySchema.safeParse(key).success) valid.push(key);
    else malformed.push(key);
  }

  const refused: string[] = [];
  const { client, bucket } = getWriteTarget();
  for (let index = 0; index < valid.length; index += MAX_KEYS_PER_DELETE_REQUEST) {
    const batch = valid.slice(index, index + MAX_KEYS_PER_DELETE_REQUEST);
    // Quiet mode reports only what failed. A partial failure comes back as a 200
    // carrying an error list, so the reply is read rather than assumed successful.
    const response = await client.send(
      new DeleteObjectsCommand({
        Bucket: bucket,
        Delete: { Objects: batch.map((Key) => ({ Key })), Quiet: true },
      }),
    );
    for (const failure of response.Errors ?? []) {
      if (failure.Key) refused.push(failure.Key);
    }
  }

  return { malformed, refused };
}

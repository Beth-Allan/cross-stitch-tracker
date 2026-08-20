"use server";

import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { nanoid } from "nanoid";
import sharp from "sharp";
import { z } from "zod";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";
import { getReadTarget, getWriteTarget } from "@/lib/r2";
import { firstValidationMessage } from "@/lib/utils/action-errors";
import {
  uploadRequestSchema,
  type UploadRequestInput,
  storageKeySchema,
  keyOwnerSchema,
  parseStorageKey,
  resolveChartFileContentType,
  sanitizeUploadFileName,
  ACCEPTED_CHART_FILE_LABEL,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_IMAGE_FORMATS,
  MAX_FILE_SIZE,
  OPTIMIZED_MAX_WIDTH,
  OPTIMIZED_QUALITY,
  THUMBNAIL_SIZE,
  THUMBNAIL_QUALITY,
} from "@/lib/validations/upload";

// A presigned PUT constrains method, bucket, key and expiry — and nothing else.
// `content-type` is unsignable and the payload hash is `UNSIGNED_PAYLOAD`, so the
// type and size a client declares when asking for the URL are claims, not limits:
// whatever bytes it then sends land under that key. Enforcement therefore happens
// where the object is consumed — in this file when an image is read, and in
// `chart-file-actions.addChartFile` when a chart file is recorded.

const INVALID_KEY_ERROR = "Invalid storage key";

function invalidKey() {
  return { success: false as const, error: INVALID_KEY_ERROR };
}

/**
 * Reads an object and returns it only if it is an image this app accepts: the
 * declared length is checked before the body is touched, the stream is bounded
 * again as it accumulates, and the bytes must decode as one of
 * `ALLOWED_IMAGE_FORMATS`. The decode is the only honest type check available.
 */
async function fetchImageBuffer(
  key: string,
): Promise<{ success: true; buffer: Buffer } | { success: false; error: string }> {
  const { client, bucket } = await getReadTarget(key);
  const getCommand = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });
  const response = await client.send(getCommand);

  if (!response.Body) {
    return { success: false, error: "Original image not found in storage" };
  }
  if (typeof response.ContentLength === "number" && response.ContentLength > MAX_FILE_SIZE) {
    // Nothing here consumes the body, so release the connection rather than
    // leaving it open until it times out. (Breaking out of the loop below does
    // this for us; returning before the loop does not.)
    (response.Body as { destroy?: () => void }).destroy?.();
    return { success: false, error: "Image is too large to process" };
  }

  const chunks: Uint8Array[] = [];
  let bytesRead = 0;
  const stream = response.Body as AsyncIterable<Uint8Array>;
  for await (const chunk of stream) {
    bytesRead += chunk.byteLength;
    // ContentLength is a header; the stream is the fact. Bound both.
    if (bytesRead > MAX_FILE_SIZE) {
      return { success: false, error: "Image is too large to process" };
    }
    chunks.push(chunk);
  }
  const buffer = Buffer.concat(chunks);

  const { format } = await sharp(buffer).metadata();
  if (!(ALLOWED_IMAGE_FORMATS as readonly string[]).includes(format)) {
    return { success: false, error: "That file is not a PNG, JPEG or WebP image" };
  }

  return { success: true, buffer };
}

export async function getPresignedUploadUrl(input: UploadRequestInput) {
  await requireAuth();

  let validated;
  try {
    validated = uploadRequestSchema.parse(input);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false as const, error: firstValidationMessage(error) };
    }
    return { success: false as const, error: "Invalid upload request" };
  }

  if (validated.category === "files") {
    // The shared rule, applied to what the caller declared: a chart file is signed
    // only under the exact type that rule would have produced for it, so the
    // browser cannot accept a file this step then refuses — and every object in
    // the namespace carries a type from `ALLOWED_CHART_FILE_TYPES`.
    if (
      resolveChartFileContentType(validated.fileName, validated.contentType) !==
      validated.contentType
    ) {
      return {
        success: false as const,
        error: `Unsupported file type. Accepted: ${ACCEPTED_CHART_FILE_LABEL}`,
      };
    }
  } else if (!(ALLOWED_IMAGE_TYPES as readonly string[]).includes(validated.contentType)) {
    return {
      success: false as const,
      error: `Invalid image type. Allowed: ${ALLOWED_IMAGE_TYPES.join(", ")}`,
    };
  }

  try {
    const key = `${validated.category}/${validated.projectId}/${nanoid()}-${sanitizeUploadFileName(validated.fileName)}`;

    const { client, bucket } = getWriteTarget();
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: validated.contentType,
    });

    const url = await getSignedUrl(client, command, {
      expiresIn: 600,
    });

    return { success: true as const, url, key };
  } catch (error) {
    console.error("getPresignedUploadUrl R2 error:", error);
    if (
      error instanceof Error &&
      error.message.includes("R2 environment variables not configured")
    ) {
      return {
        success: false as const,
        error: "File storage is not configured. Cover photo and file uploads are unavailable.",
      };
    }
    return { success: false as const, error: "Failed to generate upload URL" };
  }
}

/**
 * A short-lived read URL for one object. Grammar-checked but not row-resolved:
 * the cover editor asks for keys under `covers/unsaved/…`, which by definition
 * belong to no row yet. The ownership-scoped read path for objects that *do*
 * have a row is `chart-file-actions.getChartFileDownloadUrl`.
 */
export async function getPresignedDownloadUrl(key: string) {
  await requireAuth();

  if (!storageKeySchema.safeParse(key).success) return invalidKey();

  try {
    const { client, bucket } = await getReadTarget(key);
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const url = await getSignedUrl(client, command, {
      expiresIn: 3600,
    });

    return { success: true as const, url };
  } catch (error) {
    console.error("getPresignedDownloadUrl R2 error:", error);
    if (
      error instanceof Error &&
      error.message.includes("R2 environment variables not configured")
    ) {
      return {
        success: false as const,
        error: "File storage is not configured. Downloads are unavailable.",
      };
    }
    return { success: false as const, error: "Failed to generate download URL" };
  }
}

export async function getPresignedImageUrls(
  keys: (string | null | undefined)[],
): Promise<Record<string, string>> {
  await requireAuth();

  // Anything that is not one of this app's own object keys is dropped rather than
  // presigned: the caller renders the result as an image src, so a key it did not
  // get from the database is a key it has no business asking for.
  const validKeys = [...new Set(keys.filter((k): k is string => parseStorageKey(k) !== null))];
  if (validKeys.length === 0) return {};

  try {
    const results = await Promise.allSettled(
      validKeys.map(async (key) => {
        const { client, bucket } = await getReadTarget(key);
        const command = new GetObjectCommand({
          Bucket: bucket,
          Key: key,
        });
        const url = await getSignedUrl(client, command, { expiresIn: 3600 });
        return { key, url };
      }),
    );

    const urlMap: Record<string, string> = {};
    for (const result of results) {
      if (result.status === "fulfilled") {
        urlMap[result.value.key] = result.value.url;
      } else {
        console.warn("Failed to generate presigned URL:", result.reason);
      }
    }
    return urlMap;
  } catch (error) {
    // R2 not configured or other top-level error — graceful degradation
    console.warn("getPresignedImageUrls: R2 unavailable, returning empty map:", error);
    return {};
  }
}

/**
 * Removes one object. The key is grammar-checked here; *which* object may be
 * removed is the caller's responsibility, and every caller resolves the key from
 * an ownership-checked database row before calling — including the raw originals
 * this file's own optimizer replaces, which by then belong to no row at all.
 */
export async function deleteFile(key: string) {
  await requireAuth();

  if (!storageKeySchema.safeParse(key).success) return invalidKey();

  try {
    // Write target, not read: on a preview deployment this is the scratch bucket, so
    // a delete aimed at a real key is a no-op there instead of removing the file.
    const { client, bucket } = getWriteTarget();
    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    await client.send(command);
    return { success: true as const };
  } catch (error) {
    console.error("deleteFile error:", error);
    return { success: false as const, error: "Failed to delete file" };
  }
}

// On failure the raw original is preserved so the upload is still usable.
export async function processAndStoreImage(
  entityId: string,
  rawKey: string,
  category: "covers" | "sessions",
): Promise<
  | { success: true; optimizedKey: string; thumbnailKey: string | null }
  | { success: false; error: string }
> {
  const user = await requireAuth();

  if (!keyOwnerSchema.safeParse(entityId).success) return invalidKey();
  if (!z.enum(["covers", "sessions"]).safeParse(category).success) return invalidKey();
  const parsedKey = parseStorageKey(rawKey);
  if (!parsedKey || parsedKey.category !== category) return invalidKey();

  // Ownership comes from the row, and so does the key: the raw upload must be the
  // one the entity already records, so a caller cannot have an arbitrary object in
  // this namespace read, re-encoded and stored under something it happens to own.
  if (category === "covers") {
    const chart = await prisma.chart.findUnique({
      where: { id: entityId },
      select: { id: true, coverImageUrl: true, project: { select: { userId: true } } },
    });
    if (!chart || chart.project?.userId !== user.id) {
      return { success: false as const, error: "Chart not found" };
    }
    if (chart.coverImageUrl !== rawKey) {
      return { success: false as const, error: "Cover image not found for this chart" };
    }
  } else {
    const session = await prisma.stitchSession.findUnique({
      where: { id: entityId },
      select: { id: true, photoKey: true, project: { select: { userId: true } } },
    });
    if (!session || session.project?.userId !== user.id) {
      return { success: false as const, error: "Session not found" };
    }
    if (session.photoKey !== rawKey) {
      return { success: false as const, error: "Photo not found for this session" };
    }
  }

  try {
    const fetchResult = await fetchImageBuffer(rawKey);
    if (!fetchResult.success) {
      return { success: false as const, error: fetchResult.error };
    }
    const { buffer } = fetchResult;

    // A derivative nothing records is an orphan from the moment it is stored, and
    // nothing can ever name it again. A chart records two keys (`coverImageUrl`
    // and `coverThumbnailUrl`); a session records one, so one is all it gets.
    const wantsThumbnail = category === "covers";

    const optimizedKey = `${category}/${entityId}/opt-${nanoid()}.webp`;
    const thumbnailKey = wantsThumbnail ? `${category}/${entityId}/thumb-${nanoid()}.webp` : null;

    const encoded = await Promise.all([
      sharp(buffer)
        .resize(OPTIMIZED_MAX_WIDTH, null, { withoutEnlargement: true })
        .webp({ quality: OPTIMIZED_QUALITY })
        .toBuffer(),
      ...(thumbnailKey
        ? [
            sharp(buffer)
              .resize(THUMBNAIL_SIZE, THUMBNAIL_SIZE, { fit: "cover", withoutEnlargement: true })
              .webp({ quality: THUMBNAIL_QUALITY })
              .toBuffer(),
          ]
        : []),
    ]);
    const derivatives = [optimizedKey, ...(thumbnailKey ? [thumbnailKey] : [])].map(
      (key, index) => ({ key, body: encoded[index] }),
    );

    const { client, bucket } = getWriteTarget();
    await Promise.all(
      derivatives.map(({ key, body }) =>
        client.send(
          new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: body,
            ContentType: "image/webp",
          }),
        ),
      ),
    );

    // Caller is responsible for deleting rawKey after confirming the DB write
    return { success: true as const, optimizedKey, thumbnailKey };
  } catch (error) {
    console.error("processAndStoreImage error:", error);
    return {
      success: false as const,
      error: "Failed to process image",
    };
  }
}

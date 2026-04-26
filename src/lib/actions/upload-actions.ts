"use server";

import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { nanoid } from "nanoid";
import sharp from "sharp";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";
import { getR2Client, R2_BUCKET_NAME } from "@/lib/r2";
import {
  uploadRequestSchema,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_FILE_TYPES,
  OPTIMIZED_MAX_WIDTH,
  OPTIMIZED_QUALITY,
  THUMBNAIL_SIZE,
  THUMBNAIL_QUALITY,
} from "@/lib/validations/upload";

const VALID_CHART_FIELDS = ["coverImageUrl", "coverThumbnailUrl", "digitalWorkingCopyUrl"] as const;

/**
 * Fetch an image from R2 and return it as a Buffer.
 * Shared by processAndStoreImage and generateThumbnail.
 */
async function fetchImageBuffer(
  key: string,
): Promise<{ success: true; buffer: Buffer } | { success: false; error: string }> {
  const r2 = getR2Client();
  const getCommand = new GetObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
  });
  const response = await r2.send(getCommand);

  if (!response.Body) {
    return { success: false, error: "Original image not found in storage" };
  }

  const chunks: Uint8Array[] = [];
  const stream = response.Body as AsyncIterable<Uint8Array>;
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return { success: true, buffer: Buffer.concat(chunks) };
}

type ChartFileField = (typeof VALID_CHART_FIELDS)[number];

/**
 * Step 1: Generate a presigned PUT URL for client-side upload to R2.
 * Returns the URL and the storage key to use in confirmUpload.
 */
export async function getPresignedUploadUrl(input: unknown) {
  await requireAuth();

  // Validate input separately so Zod errors get their own message
  let validated;
  try {
    validated = uploadRequestSchema.parse(input);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false as const, error: error.errors[0].message };
    }
    return { success: false as const, error: "Invalid upload request" };
  }

  // Validate content type based on category
  if (
    validated.category === "covers" &&
    !ALLOWED_IMAGE_TYPES.includes(validated.contentType as (typeof ALLOWED_IMAGE_TYPES)[number])
  ) {
    return {
      success: false as const,
      error: `Invalid image type. Allowed: ${ALLOWED_IMAGE_TYPES.join(", ")}`,
    };
  }
  if (
    validated.category === "sessions" &&
    !ALLOWED_IMAGE_TYPES.includes(validated.contentType as (typeof ALLOWED_IMAGE_TYPES)[number])
  ) {
    return {
      success: false as const,
      error: `Invalid image type. Allowed: ${ALLOWED_IMAGE_TYPES.join(", ")}`,
    };
  }
  if (
    validated.category === "files" &&
    !ALLOWED_FILE_TYPES.includes(validated.contentType as (typeof ALLOWED_FILE_TYPES)[number])
  ) {
    return {
      success: false as const,
      error: `Invalid file type. Allowed: ${ALLOWED_FILE_TYPES.join(", ")}`,
    };
  }

  // R2 operations in separate try/catch
  try {
    const sanitizedName = validated.fileName.replace(/[/\\]/g, "-").slice(0, 100);
    const key = `${validated.category}/${validated.projectId}/${nanoid()}-${sanitizedName}`;

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      ContentType: validated.contentType,
    });

    const url = await getSignedUrl(getR2Client(), command, {
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
 * Step 3: After client uploads to R2, save the key reference in the database.
 */
export async function confirmUpload(input: { chartId: string; field: string; key: string }) {
  await requireAuth();

  try {
    // Validate field is one of the allowed chart file fields
    if (!VALID_CHART_FIELDS.includes(input.field as ChartFileField)) {
      return {
        success: false as const,
        error: `Invalid field. Allowed: ${VALID_CHART_FIELDS.join(", ")}`,
      };
    }

    await prisma.chart.update({
      where: { id: input.chartId },
      data: { [input.field]: input.key },
    });

    // Optimize cover image: produce 1200px WebP + 400x400 thumbnail, delete raw original
    if (input.field === "coverImageUrl") {
      try {
        const result = await processAndStoreImage(input.chartId, input.key, "covers");
        if (result.success) {
          // Update DB with optimized key and thumbnail key (replaces the raw key saved above)
          await prisma.chart.update({
            where: { id: input.chartId },
            data: {
              coverImageUrl: result.optimizedKey,
              coverThumbnailUrl: result.thumbnailKey,
            },
          });
        }
        // If processing failed, the raw key is already saved from the first update above
      } catch (err) {
        console.warn("Image optimization failed (upload confirmed with raw image):", err);
      }
    }

    revalidatePath(`/charts/${input.chartId}`);
    return { success: true as const };
  } catch (error) {
    console.error("confirmUpload error:", error);
    return { success: false as const, error: "Failed to confirm upload" };
  }
}

/**
 * Generate a presigned GET URL for viewing/downloading a file from R2.
 */
export async function getPresignedDownloadUrl(key: string) {
  await requireAuth();

  try {
    const command = new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    });

    const url = await getSignedUrl(getR2Client(), command, {
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

/**
 * Generate presigned GET URLs for multiple R2 keys in batch.
 * Used by server pages to resolve R2 keys to displayable URLs before passing to client components.
 * Returns a Record mapping each valid key to its presigned URL.
 * Gracefully handles partial failures and R2-not-configured scenarios.
 */
export async function getPresignedImageUrls(
  keys: (string | null | undefined)[],
): Promise<Record<string, string>> {
  await requireAuth();

  // Filter out null/undefined/empty and deduplicate
  const validKeys = [...new Set(keys.filter((k): k is string => !!k && k.length > 0))];
  if (validKeys.length === 0) return {};

  try {
    const results = await Promise.allSettled(
      validKeys.map(async (key) => {
        const command = new GetObjectCommand({
          Bucket: R2_BUCKET_NAME,
          Key: key,
        });
        const url = await getSignedUrl(getR2Client(), command, { expiresIn: 3600 });
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
 * Delete a file from R2 storage.
 */
export async function deleteFile(key: string) {
  await requireAuth();

  try {
    const command = new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    });

    await getR2Client().send(command);
    return { success: true as const };
  } catch (error) {
    console.error("deleteFile error:", error);
    return { success: false as const, error: "Failed to delete file" };
  }
}

/**
 * Process a raw uploaded image: produce an optimized 1200px WebP and a 400x400 thumbnail,
 * upload both to R2, then delete the raw original.
 *
 * Used by confirmUpload for cover images. Designed to be safe -- if processing fails,
 * the raw original is preserved (not deleted) so the upload is still usable.
 */
export async function processAndStoreImage(
  entityId: string,
  rawKey: string,
  category: "covers" | "sessions",
): Promise<
  | { success: true; optimizedKey: string; thumbnailKey: string }
  | { success: false; error: string }
> {
  await requireAuth();

  try {
    const r2 = getR2Client();

    // Fetch raw image from R2
    const fetchResult = await fetchImageBuffer(rawKey);
    if (!fetchResult.success) {
      return { success: false as const, error: fetchResult.error };
    }
    const { buffer } = fetchResult;

    // Process both optimized and thumbnail in parallel
    const [optimizedBuffer, thumbnailBuffer] = await Promise.all([
      sharp(buffer)
        .resize(OPTIMIZED_MAX_WIDTH, null, { withoutEnlargement: true })
        .webp({ quality: OPTIMIZED_QUALITY })
        .toBuffer(),
      sharp(buffer)
        .resize(THUMBNAIL_SIZE, THUMBNAIL_SIZE, { fit: "cover", withoutEnlargement: true })
        .webp({ quality: THUMBNAIL_QUALITY })
        .toBuffer(),
    ]);

    // Upload both processed images to R2
    const optimizedKey = `${category}/${entityId}/opt-${nanoid()}.webp`;
    const thumbnailKey = `${category}/${entityId}/thumb-${nanoid()}.webp`;

    await Promise.all([
      r2.send(
        new PutObjectCommand({
          Bucket: R2_BUCKET_NAME,
          Key: optimizedKey,
          Body: optimizedBuffer,
          ContentType: "image/webp",
        }),
      ),
      r2.send(
        new PutObjectCommand({
          Bucket: R2_BUCKET_NAME,
          Key: thumbnailKey,
          Body: thumbnailBuffer,
          ContentType: "image/webp",
        }),
      ),
    ]);

    // Delete the raw original now that processed versions are stored
    await r2.send(
      new DeleteObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: rawKey,
      }),
    );

    return { success: true as const, optimizedKey, thumbnailKey };
  } catch (error) {
    console.error("processAndStoreImage error:", error);
    return {
      success: false as const,
      error: "Failed to process image",
    };
  }
}

/**
 * Generate a 400x400 WebP thumbnail from a cover image stored in R2.
 * Fetches the original, processes with sharp, uploads thumbnail, updates DB.
 */
export async function generateThumbnail(chartId: string, coverKey: string) {
  await requireAuth();

  try {
    const r2 = getR2Client();

    // Fetch the original image from R2
    const fetchResult = await fetchImageBuffer(coverKey);
    if (!fetchResult.success) {
      return { success: false as const, error: fetchResult.error };
    }
    const { buffer } = fetchResult;

    // Generate thumbnail with sharp
    const thumbnailBuffer = await sharp(buffer)
      .resize(400, 400, { fit: "cover", withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    // Upload thumbnail to R2
    const thumbnailKey = `covers/${chartId}/thumb-${nanoid()}.webp`;
    const putCommand = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: thumbnailKey,
      Body: thumbnailBuffer,
      ContentType: "image/webp",
    });
    await r2.send(putCommand);

    // Update chart record with thumbnail key
    await prisma.chart.update({
      where: { id: chartId },
      data: { coverThumbnailUrl: thumbnailKey },
    });

    revalidatePath(`/charts/${chartId}`);
    return { success: true as const, thumbnailKey };
  } catch (error) {
    console.error("generateThumbnail error:", error);
    return {
      success: false as const,
      error: "Failed to generate thumbnail",
    };
  }
}

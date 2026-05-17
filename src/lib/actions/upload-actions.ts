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

const VALID_CHART_FIELDS = ["coverImageUrl", "coverThumbnailUrl"] as const;

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

export async function getPresignedUploadUrl(input: unknown) {
  await requireAuth();

  let validated;
  try {
    validated = uploadRequestSchema.parse(input);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false as const, error: error.errors[0].message };
    }
    return { success: false as const, error: "Invalid upload request" };
  }

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

export async function confirmUpload(input: { chartId: string; field: string; key: string }) {
  const user = await requireAuth();

  try {
    if (!VALID_CHART_FIELDS.includes(input.field as ChartFileField)) {
      return {
        success: false as const,
        error: `Invalid field. Allowed: ${VALID_CHART_FIELDS.join(", ")}`,
      };
    }

    const chart = await prisma.chart.findUnique({
      where: { id: input.chartId },
      select: { id: true, project: { select: { userId: true } } },
    });
    if (!chart || chart.project?.userId !== user.id) {
      return { success: false as const, error: "Chart not found" };
    }

    await prisma.chart.update({
      where: { id: input.chartId },
      data: { [input.field]: input.key },
    });

    if (input.field === "coverImageUrl") {
      try {
        const result = await processAndStoreImage(input.chartId, input.key, "covers");
        if (result.success) {
          await prisma.chart.update({
            where: { id: input.chartId },
            data: {
              coverImageUrl: result.optimizedKey,
              coverThumbnailUrl: result.thumbnailKey,
            },
          });
          // DB write succeeded — safe to delete raw original
          await deleteFile(input.key).catch(() => {});
        }
        // If processing failed, the raw key is already saved from the first update above
      } catch (err) {
        console.warn("Image optimization failed (raw image preserved):", err);
      }
    }

    revalidatePath(`/charts/${input.chartId}`);
    return { success: true as const };
  } catch (error) {
    console.error("confirmUpload error:", error);
    return { success: false as const, error: "Failed to confirm upload" };
  }
}

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

// On failure the raw original is preserved so the upload is still usable.
export async function processAndStoreImage(
  entityId: string,
  rawKey: string,
  category: "covers" | "sessions",
): Promise<
  { success: true; optimizedKey: string; thumbnailKey: string } | { success: false; error: string }
> {
  await requireAuth();
  const r2 = getR2Client();

  try {
    const fetchResult = await fetchImageBuffer(rawKey);
    if (!fetchResult.success) {
      return { success: false as const, error: fetchResult.error };
    }
    const { buffer } = fetchResult;

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

export async function generateThumbnail(chartId: string, coverKey: string) {
  await requireAuth();

  try {
    const r2 = getR2Client();

    const fetchResult = await fetchImageBuffer(coverKey);
    if (!fetchResult.success) {
      return { success: false as const, error: fetchResult.error };
    }
    const { buffer } = fetchResult;

    const thumbnailBuffer = await sharp(buffer)
      .resize(THUMBNAIL_SIZE, THUMBNAIL_SIZE, { fit: "cover", withoutEnlargement: true })
      .webp({ quality: THUMBNAIL_QUALITY })
      .toBuffer();

    const thumbnailKey = `covers/${chartId}/thumb-${nanoid()}.webp`;
    const putCommand = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: thumbnailKey,
      Body: thumbnailBuffer,
      ContentType: "image/webp",
    });
    await r2.send(putCommand);

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

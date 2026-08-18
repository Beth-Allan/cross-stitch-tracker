"use server";

import { DeleteObjectCommand, GetObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";
import { getReadTarget, getWriteTarget } from "@/lib/r2";
import {
  ALLOWED_CHART_FILE_EXTENSIONS,
  ALLOWED_CHART_FILE_TYPES,
  MAX_FILE_SIZE,
  parseStorageKey,
} from "@/lib/validations/upload";

const addChartFileSchema = z.object({
  chartId: z.string().min(1),
  url: z.string().refine((value) => {
    const parsed = parseStorageKey(value);
    return parsed !== null && parsed.category === "files";
  }, "Invalid file path"),
  filename: z.string().trim().min(1).max(255),
  label: z.string().trim().max(255).nullable().default(null),
});

const DEFAULT_MIME_TYPE = "application/octet-stream";

/**
 * The same rule the upload UI applies: a stitching-software file often arrives
 * with a browser-invented type (`.xsd` as `text/xml`), so a recognised extension
 * is accepted alongside the MIME allowlist. Neither is proof of content — the
 * point is that the value stored is the one R2 holds, not the one a caller sent.
 */
function isAcceptedChartFile(contentType: string, filename: string): boolean {
  if ((ALLOWED_CHART_FILE_TYPES as readonly string[]).includes(contentType)) return true;
  const extension = filename.slice(filename.lastIndexOf(".")).toLowerCase();
  return (ALLOWED_CHART_FILE_EXTENSIONS as readonly string[]).includes(extension);
}

/**
 * What R2 actually holds under a key. A presigned PUT signs neither the size nor
 * the type of the bytes that follow it, so this is the first point at which
 * either is a fact rather than a claim.
 */
async function describeStoredObject(
  key: string,
): Promise<{ contentLength: number; contentType: string } | null> {
  try {
    const { client, bucket } = await getReadTarget(key);
    const head = await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    if (typeof head.ContentLength !== "number") return null;
    return {
      contentLength: head.ContentLength,
      contentType: head.ContentType ?? DEFAULT_MIME_TYPE,
    };
  } catch (error) {
    console.error("Failed to inspect uploaded object:", key, error);
    return null;
  }
}

async function discardStoredObject(key: string): Promise<void> {
  try {
    const { client, bucket } = getWriteTarget();
    await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
  } catch (error) {
    console.error("Failed to remove rejected upload:", key, error);
  }
}

export async function addChartFile(input: unknown) {
  const user = await requireAuth();

  let validated;
  try {
    validated = addChartFileSchema.parse(input);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false as const, error: error.errors[0].message };
    }
    return { success: false as const, error: "Invalid input" };
  }

  // Verify ownership
  const chart = await prisma.chart.findUnique({
    where: { id: validated.chartId },
    select: { id: true, project: { select: { userId: true } } },
  });
  if (!chart || chart.project?.userId !== user.id) {
    return { success: false as const, error: "Chart not found" };
  }

  // A `files/` key is only this chart's if it sits in this chart's namespace.
  if (parseStorageKey(validated.url)?.owner !== validated.chartId) {
    return { success: false as const, error: "Invalid file path" };
  }

  const stored = await describeStoredObject(validated.url);
  if (!stored) {
    return { success: false as const, error: "That upload could not be found in storage." };
  }
  if (stored.contentLength > MAX_FILE_SIZE) {
    await discardStoredObject(validated.url);
    return { success: false as const, error: "That file is too large. Maximum size is 50MB." };
  }
  if (!isAcceptedChartFile(stored.contentType, validated.filename)) {
    await discardStoredObject(validated.url);
    return {
      success: false as const,
      error: "Unsupported file type. Accepted: PDF, images, .pat, .xsd, .css, .saga, .zip",
    };
  }

  const file = await prisma.chartFile.create({
    data: {
      chartId: validated.chartId,
      url: validated.url,
      filename: validated.filename,
      mimeType: stored.contentType,
      fileSize: stored.contentLength,
      label: validated.label,
    },
  });

  revalidatePath(`/charts/${validated.chartId}`);
  return { success: true as const, file };
}

export async function deleteChartFile(fileId: string) {
  const user = await requireAuth();

  if (!fileId || typeof fileId !== "string") {
    return { success: false as const, error: "Invalid file ID" };
  }

  const file = await prisma.chartFile.findUnique({
    where: { id: fileId },
    include: { chart: { select: { id: true, project: { select: { userId: true } } } } },
  });

  if (!file || file.chart.project?.userId !== user.id) {
    return { success: false as const, error: "File not found" };
  }

  await prisma.chartFile.delete({ where: { id: fileId } });

  // The record goes first: if the object removal then fails, what is left is an
  // orphan — the failure this app already tolerates and sweeps — rather than a
  // record pointing at a file that is gone. The write target is the scratch
  // bucket on a preview deployment, so a preview cannot remove the real file.
  await discardStoredObject(file.url);

  revalidatePath(`/charts/${file.chart.id}`);
  return { success: true as const };
}

export async function getChartFileDownloadUrl(fileId: string) {
  const user = await requireAuth();

  if (!fileId || typeof fileId !== "string") {
    return { success: false as const, error: "Invalid file ID" };
  }

  const file = await prisma.chartFile.findUnique({
    where: { id: fileId },
    include: { chart: { select: { id: true, project: { select: { userId: true } } } } },
  });

  if (!file || file.chart.project?.userId !== user.id) {
    return { success: false as const, error: "File not found" };
  }

  try {
    const { client, bucket } = await getReadTarget(file.url);
    const url = await getSignedUrl(
      client,
      new GetObjectCommand({
        Bucket: bucket,
        Key: file.url,
      }),
      { expiresIn: 3600 },
    );

    return {
      success: true as const,
      url,
      filename: file.filename,
      mimeType: file.mimeType,
    };
  } catch (error) {
    console.error("getChartFileDownloadUrl R2 error:", error);
    if (
      error instanceof Error &&
      error.message.includes("R2 environment variables not configured")
    ) {
      return { success: false as const, error: "File storage is not configured." };
    }
    return { success: false as const, error: "Failed to generate download URL" };
  }
}

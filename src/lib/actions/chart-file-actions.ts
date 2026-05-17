"use server";

import { DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";
import { getR2Client, R2_BUCKET_NAME } from "@/lib/r2";

const addChartFileSchema = z.object({
  chartId: z.string().min(1),
  url: z.string().min(1),
  filename: z.string().trim().min(1).max(255),
  mimeType: z.string().min(1),
  fileSize: z.number().int().positive(),
  label: z.string().trim().max(255).nullable().default(null),
});

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

  const file = await prisma.chartFile.create({
    data: {
      chartId: validated.chartId,
      url: validated.url,
      filename: validated.filename,
      mimeType: validated.mimeType,
      fileSize: validated.fileSize,
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

  // Delete R2 object — if it fails, log but proceed with DB deletion
  try {
    const r2 = getR2Client();
    await r2.send(
      new DeleteObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: file.url,
      }),
    );
  } catch (error) {
    console.error("Failed to delete R2 object:", error);
  }

  await prisma.chartFile.delete({ where: { id: fileId } });

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

  const url = await getSignedUrl(
    getR2Client(),
    new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
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
}

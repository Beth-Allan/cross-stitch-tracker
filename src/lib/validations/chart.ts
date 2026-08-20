import { z } from "zod";
import type { ProjectStatus } from "@/generated/prisma/client";
import { PROJECT_STATUSES } from "@/lib/utils/status";
import {
  optionalDateString,
  optionalChoice,
  optionalText,
  optionalUrl,
} from "@/lib/validations/fields";
import { parseStorageKey } from "@/lib/validations/upload";

/**
 * A stored key is only ever one of this app's own objects in one category. Kept
 * here rather than trusted downstream: whatever this schema accepts is what ends
 * up presigned for the browser and handed to the image pipeline.
 */
function storageKeyIn(category: "covers" | "files") {
  return z
    .string()
    .min(1)
    .refine((value) => parseStorageKey(value)?.category === category, "Invalid storage key");
}

export const chartFormSchema = z.object({
  chart: z
    .object({
      name: z.string().trim().min(1, "Chart name is required").max(200, "Chart name too long"),
      designerId: optionalChoice(),
      seriesId: optionalChoice(),
      coverImageUrl: storageKeyIn("covers").nullable().default(null),
      coverThumbnailUrl: storageKeyIn("covers").nullable().default(null),
      fileKeys: z
        .array(
          z.object({
            key: storageKeyIn("files"),
            filename: z.string().trim().min(1).max(255),
            mimeType: z.string().min(1),
            fileSize: z.number().int().positive(),
          }),
        )
        .default([]),
      stitchCount: z.number().int().min(0).default(0),
      stitchCountApproximate: z.boolean().default(false),
      stitchesWide: z.number().int().min(0).default(0),
      stitchesHigh: z.number().int().min(0).default(0),
      genreIds: z.array(z.string()).default([]),
      isPaperChart: z.boolean().default(false),
      isFormalKit: z.boolean().default(false),
      isSAL: z.boolean().default(false),
      kitColorCount: z.number().int().min(1).nullable().default(null),
      notes: optionalText(5000, "Notes too long"),
    })
    .refine((data) => data.stitchCount > 0 || (data.stitchesWide > 0 && data.stitchesHigh > 0), {
      message: "Provide stitch count or dimensions",
      path: ["stitchCount"],
    }),
  project: z.object({
    status: z
      .enum(PROJECT_STATUSES as unknown as [ProjectStatus, ...ProjectStatus[]])
      .default("UNSTARTED"),
    storageLocationId: optionalChoice(),
    stitchingAppId: optionalChoice(),
    fabricId: optionalChoice(),
    needsOnionSkinning: z.boolean().default(false),
    startDate: optionalDateString(),
    finishDate: optionalDateString(),
    ffoDate: optionalDateString(),
    wantToStartNext: z.boolean().default(false),
    preferredStartSeason: optionalChoice(),
    startingStitches: z.number().int().min(0).default(0),
  }),
});

export type ChartFormInput = z.input<typeof chartFormSchema>;

/** The parsed payload — what the action holds after `chartFormSchema.parse`. */
export type ChartFormValidated = z.output<typeof chartFormSchema>;

/**
 * Validates the batch supply payload for createChartWithSupplies.
 * Each array is capped at 500 items to prevent oversized payloads.
 * supplyId must be non-empty to prevent phantom junction records.
 */
export const batchSupplySchema = z.object({
  threads: z
    .array(
      z.object({
        supplyId: z.string().min(1, "Supply ID required"),
        stitchCount: z.number().int().min(0),
        need: z.number().int().min(1),
        isNeedOverridden: z.boolean(),
      }),
    )
    .max(500)
    .default([]),
  beads: z
    .array(
      z.object({
        supplyId: z.string().min(1, "Supply ID required"),
        need: z.number().int().min(1),
      }),
    )
    .max(500)
    .default([]),
  specialty: z
    .array(
      z.object({
        supplyId: z.string().min(1, "Supply ID required"),
        need: z.number().int().min(1),
      }),
    )
    .max(500)
    .default([]),
});

export type BatchSupplyInput = z.input<typeof batchSupplySchema>;

export const designerSchema = z.object({
  name: z.string().trim().min(1, "Designer name is required").max(200, "Designer name too long"),
  website: optionalUrl(),
  notes: optionalText(5000, "Notes too long"),
});

export type DesignerInput = z.input<typeof designerSchema>;

export const genreSchema = z.object({
  name: z.string().trim().min(1, "Genre name is required").max(100, "Genre name too long"),
});

export type GenreInput = z.input<typeof genreSchema>;

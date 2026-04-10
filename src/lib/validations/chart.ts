import { z } from "zod";
import type { ProjectStatus } from "@/generated/prisma/client";
import { PROJECT_STATUSES } from "@/lib/utils/status";

export const chartFormSchema = z.object({
  chart: z
    .object({
      name: z.string().trim().min(1, "Chart name is required").max(200, "Chart name too long"),
      designerId: z.string().nullable().default(null),
      coverImageUrl: z.string().min(1).nullable().default(null),
      coverThumbnailUrl: z.string().min(1).nullable().default(null),
      digitalFileUrl: z.string().min(1).nullable().default(null),
      stitchCount: z.number().int().min(0).default(0),
      stitchCountApproximate: z.boolean().default(false),
      stitchesWide: z.number().int().min(0).default(0),
      stitchesHigh: z.number().int().min(0).default(0),
      genreIds: z.array(z.string()).default([]),
      isPaperChart: z.boolean().default(false),
      isFormalKit: z.boolean().default(false),
      isSAL: z.boolean().default(false),
      kitColorCount: z.number().int().min(1).nullable().default(null),
      notes: z.string().max(5000).nullable().default(null),
    })
    .refine((data) => data.stitchCount > 0 || (data.stitchesWide > 0 && data.stitchesHigh > 0), {
      message: "Provide stitch count or dimensions",
      path: ["stitchCount"],
    }),
  project: z.object({
    status: z
      .enum(PROJECT_STATUSES as unknown as [ProjectStatus, ...ProjectStatus[]])
      .default("UNSTARTED"),
    projectBin: z.string().nullable().default(null),
    ipadApp: z.string().nullable().default(null),
    needsOnionSkinning: z.boolean().default(false),
    startDate: z
      .string()
      .nullable()
      .default(null)
      .refine((val) => val === null || !isNaN(Date.parse(val)), { message: "Invalid date" }),
    finishDate: z
      .string()
      .nullable()
      .default(null)
      .refine((val) => val === null || !isNaN(Date.parse(val)), { message: "Invalid date" }),
    ffoDate: z
      .string()
      .nullable()
      .default(null)
      .refine((val) => val === null || !isNaN(Date.parse(val)), { message: "Invalid date" }),
    wantToStartNext: z.boolean().default(false),
    preferredStartSeason: z.string().nullable().default(null),
    startingStitches: z.number().int().min(0).default(0),
  }),
});

export type ChartFormInput = z.infer<typeof chartFormSchema>;

export const designerSchema = z.object({
  name: z.string().trim().min(1, "Designer name is required").max(200, "Designer name too long"),
  website: z.string().url("Must be a valid URL").nullable().default(null),
  notes: z.string().max(5000, "Notes too long").nullable().default(null),
});

export type DesignerInput = z.infer<typeof designerSchema>;

export const genreSchema = z.object({
  name: z.string().trim().min(1, "Genre name is required").max(100, "Genre name too long"),
});

export type GenreInput = z.infer<typeof genreSchema>;

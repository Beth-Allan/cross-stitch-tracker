import { z } from "zod";

export const seriesSchema = z.object({
  name: z.string().trim().min(1, "Series name is required").max(200, "Series name too long"),
  totalCount: z.number().int().min(1, "Total count must be at least 1").nullable().default(null),
  designerId: z.string().nullable().default(null),
  notes: z.string().max(5000, "Notes too long").nullable().default(null),
});

export type SeriesInput = z.infer<typeof seriesSchema>;

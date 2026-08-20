import { z } from "zod";
import { optionalChoice, optionalText } from "@/lib/validations/fields";

export const seriesSchema = z.object({
  name: z.string().trim().min(1, "Series name is required").max(200, "Series name too long"),
  totalCount: z.number().int().min(1, "Total count must be at least 1").nullable().default(null),
  designerId: optionalChoice(),
  notes: optionalText(5000, "Notes too long"),
});

export type SeriesInput = z.input<typeof seriesSchema>;

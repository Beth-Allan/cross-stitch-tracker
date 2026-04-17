import { z } from "zod";

export const sessionFormSchema = z.object({
  projectId: z.string().trim().min(1, "Project is required"),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
  stitchCount: z
    .number()
    .int("Stitch count must be a whole number")
    .min(1, "Stitch count must be at least 1"),
  timeSpentMinutes: z.number().int().min(0, "Time cannot be negative").nullable().default(null),
  photoKey: z.string().nullable().default(null),
});

export type SessionFormInput = z.infer<typeof sessionFormSchema>;

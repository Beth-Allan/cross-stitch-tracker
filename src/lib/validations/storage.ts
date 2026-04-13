import { z } from "zod";

export const storageLocationSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200, "Name too long"),
  description: z.string().trim().max(500, "Description too long").nullable().default(null),
});

export type StorageLocationInput = z.infer<typeof storageLocationSchema>;

export const stitchingAppSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200, "Name too long"),
  description: z.string().trim().max(500, "Description too long").nullable().default(null),
});

export type StitchingAppInput = z.infer<typeof stitchingAppSchema>;

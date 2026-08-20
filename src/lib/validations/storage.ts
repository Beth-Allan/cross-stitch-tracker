import { z } from "zod";
import { optionalText } from "@/lib/validations/fields";

/**
 * A storage location and a stitching app are the same shape — a user-named
 * thing with an optional description — and were two byte-identical schemas
 * until they drifted. One definition, two names, so they cannot.
 */
const namedWithDescriptionSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200, "Name too long"),
  description: optionalText(500, "Description too long"),
});

export const storageLocationSchema = namedWithDescriptionSchema;

export type StorageLocationInput = z.input<typeof storageLocationSchema>;

export const stitchingAppSchema = namedWithDescriptionSchema;

export type StitchingAppInput = z.input<typeof stitchingAppSchema>;

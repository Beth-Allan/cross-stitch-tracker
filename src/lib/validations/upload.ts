import { z } from "zod";

export const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;

export const ALLOWED_FILE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/pdf",
] as const;

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const uploadRequestSchema = z.object({
  fileName: z.string().min(1),
  contentType: z.string().min(1),
  category: z.enum(["covers", "files"]),
  projectId: z.string().min(1),
});

export type UploadRequestInput = z.infer<typeof uploadRequestSchema>;

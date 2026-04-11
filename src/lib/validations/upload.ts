import { z } from "zod";

export const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;

export const ALLOWED_FILE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/pdf",
] as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const uploadRequestSchema = z.object({
  fileName: z.string().min(1),
  contentType: z.string().min(1),
  fileSize: z
    .number()
    .int()
    .positive()
    .max(MAX_FILE_SIZE, "File is too large. Maximum size is 10MB."),
  category: z.enum(["covers", "files"]),
  projectId: z.string().min(1),
});

export type UploadRequestInput = z.infer<typeof uploadRequestSchema>;

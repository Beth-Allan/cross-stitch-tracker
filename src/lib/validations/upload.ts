import { z } from "zod";

export const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;

export const ALLOWED_FILE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/pdf",
  "application/octet-stream", // .saga, .oxs, .xsd (cross-stitch software formats)
] as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Image optimization settings
export const OPTIMIZED_MAX_WIDTH = 1200;
export const OPTIMIZED_QUALITY = 80;
export const THUMBNAIL_SIZE = 400;
export const THUMBNAIL_QUALITY = 80;

// Categories that get image optimization on upload
export const OPTIMIZABLE_CATEGORIES = ["covers", "sessions"] as const;

export const uploadRequestSchema = z.object({
  fileName: z.string().trim().min(1),
  contentType: z.string().trim().min(1),
  fileSize: z
    .number()
    .int()
    .positive()
    .max(MAX_FILE_SIZE, "File is too large. Maximum size is 10MB."),
  category: z.enum(["covers", "files", "sessions"]),
  projectId: z.string().trim().min(1),
});

export type UploadRequestInput = z.infer<typeof uploadRequestSchema>;

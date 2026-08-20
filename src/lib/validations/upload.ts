import { z } from "zod";

export const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;

/**
 * The formats an image is allowed to *decode* as, which is the only honest type
 * check available: a presigned PUT signs neither the content-type header nor the
 * payload, so a stored object's declared MIME type is still a client claim.
 * `sharp` reading the bytes is not.
 */
export const ALLOWED_IMAGE_FORMATS = ["png", "jpeg", "webp"] as const;

export const ALLOWED_FILE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/pdf",
  "application/octet-stream", // .saga, .oxs, .xsd (cross-stitch software formats)
  "text/css", // .css CrossStitch pattern files report as text/css in browsers
  "application/zip",
  "application/x-zip-compressed",
] as const;

export const ALLOWED_CHART_FILE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/pdf",
  "application/octet-stream", // .pat, .xsd, .saga (binary pattern formats)
  "text/css", // .css CrossStitch files report as text/css in browsers
  "application/zip",
  "application/x-zip-compressed",
] as const;

export const ALLOWED_CHART_FILE_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".pdf",
  ".pat",
  ".xsd",
  ".css",
  ".saga",
  ".zip",
] as const;

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

/** The limit as users read it — derived, so a message can never quote a number the code does not enforce. */
export const MAX_FILE_SIZE_LABEL = `${MAX_FILE_SIZE / (1024 * 1024)}MB`;

// Image optimization settings
export const OPTIMIZED_MAX_WIDTH = 1200;
export const OPTIMIZED_QUALITY = 80;
export const THUMBNAIL_SIZE = 400;
export const THUMBNAIL_QUALITY = 80;

export const STORAGE_CATEGORIES = ["covers", "files", "sessions"] as const;

export type StorageCategory = (typeof STORAGE_CATEGORIES)[number];

export const MAX_STORAGE_KEY_LENGTH = 300;

const MAX_KEY_NAME_LENGTH = 200;
const KEY_OWNER_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;
const CONTROL_CHARACTERS = /[\u0000-\u001f\u007f]/;

/** The three parts of every object key this app writes. */
export type StorageKeyParts = {
  category: StorageCategory;
  owner: string;
  name: string;
};

/**
 * Object keys are flat `<category>/<owner>/<name>` strings, so a caller-supplied
 * key cannot traverse anywhere — but it can land in a namespace it has no business
 * in, and an unbounded one can be used to litter the bucket. This is the single
 * grammar every action validates against before a key reaches R2.
 *
 * The name segment is deliberately permissive about spaces and punctuation:
 * keys already in Beth's bucket were built from raw filenames, and a stricter
 * rule here would stop her existing images loading. New keys are tightened at
 * the producing end instead — see `sanitizeUploadFileName`.
 */
export function parseStorageKey(key: unknown): StorageKeyParts | null {
  if (typeof key !== "string") return null;
  if (key.length === 0 || key.length > MAX_STORAGE_KEY_LENGTH) return null;
  if (CONTROL_CHARACTERS.test(key)) return null;

  const segments = key.split("/");
  if (segments.length !== 3) return null;

  const [category, owner, name] = segments;
  if (!STORAGE_CATEGORIES.includes(category as StorageCategory)) return null;
  if (!KEY_OWNER_PATTERN.test(owner)) return null;
  if (name.length === 0 || name.length > MAX_KEY_NAME_LENGTH) return null;
  if (name === "." || name === "..") return null;

  return { category: category as StorageCategory, owner, name };
}

export const storageKeySchema = z
  .string()
  .refine((key) => parseStorageKey(key) !== null, "Invalid storage key");

/** The id segment of an object key — a database id, or `unsaved` before a chart exists. */
export const keyOwnerSchema = z
  .string()
  .trim()
  .regex(KEY_OWNER_PATTERN, "Invalid id")
  .describe("storage key owner segment");

/**
 * Reduce a user's filename to characters that are safe in an object key and in
 * the URL that addresses it. Applies to new uploads only — `parseStorageKey`
 * still accepts the looser keys written before this existed.
 */
export function sanitizeUploadFileName(fileName: string): string {
  const cleaned = fileName
    .trim()
    .replace(/[^A-Za-z0-9._-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^[.-]+/, "")
    .slice(0, 100);
  return cleaned.length > 0 ? cleaned : "file";
}

export const uploadRequestSchema = z.object({
  fileName: z.string().trim().min(1),
  contentType: z.string().trim().min(1),
  fileSize: z
    .number()
    .int()
    .positive()
    .max(MAX_FILE_SIZE, `File is too large. Maximum size is ${MAX_FILE_SIZE_LABEL}.`),
  category: z.enum(STORAGE_CATEGORIES),
  projectId: keyOwnerSchema,
});

export type UploadRequestInput = z.input<typeof uploadRequestSchema>;

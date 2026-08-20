import { z } from "zod";
import { optionalText } from "./fields";

export const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;

/**
 * The formats an image is allowed to *decode* as, which is the only honest type
 * check available: a presigned PUT signs neither the content-type header nor the
 * payload, so a stored object's declared MIME type is still a client claim.
 * `sharp` reading the bytes is not.
 */
export const ALLOWED_IMAGE_FORMATS = ["png", "jpeg", "webp"] as const;

/**
 * The content types a chart file may be **stored** as — the one list both the
 * browser and the server check, replacing the byte-identical pair that used to
 * let the two disagree. Nothing here renders in a browser tab: an object is
 * served back with its stored type, so a type that renders would make the
 * bucket a place to host a page.
 *
 * `application/octet-stream` is what a pattern file becomes
 * (`resolveChartFileContentType`), which is also why a file's *name* has to be
 * on the extension list before the generic type is accepted.
 */
export const ALLOWED_CHART_FILE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/pdf",
  "application/octet-stream",
] as const;

/**
 * The file endings this app accepts, per Beth (domain `chart-files.md`):
 * PDF charts and photos or scans (CHF-001), and the pattern-software formats
 * she keeps — Pattern Maker, PCStitch, plus `.saga` and `.oxs` (CHF-002).
 * **No `.zip`**: she does not keep chart packs zipped (CHF-003). `.css` traces
 * to nobody and stays accepted until she says otherwise (CHF-004, Q-007).
 */
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
  ".oxs",
] as const;

/** The accepted list as Beth reads it, so no message can quote a rule the code does not apply. */
export const ACCEPTED_CHART_FILE_LABEL = "PDF, images, .xsd, .pat, .saga, .oxs, .css";

/**
 * The types that identify themselves: a browser reporting one of these has read
 * the file's own signature, so the name adds nothing. The generic type is
 * excluded deliberately — it is a browser saying "no idea", which is exactly the
 * claim that must not stand on its own.
 */
const SELF_DESCRIBING_TYPES = ALLOWED_CHART_FILE_TYPES.filter(
  (type) => type !== "application/octet-stream",
);

function fileExtension(fileName: string): string {
  const dot = fileName.lastIndexOf(".");
  return dot === -1 ? "" : fileName.slice(dot).toLowerCase();
}

/**
 * The single rule for what a chart file may be, and what it is stored as.
 *
 * The browser calls it to decide whether to upload and what `Content-Type` to
 * send; `getPresignedUploadUrl` and `addChartFile` call it to check that what
 * they were handed is exactly what the rule would have produced. That is what
 * makes the two agree — before this, the browser accepted a file on its name
 * (`pattern.xsd` arrives as `text/xml`) and the server refused it on its type.
 *
 * Returns the content type to store, or `null` when the file is not accepted.
 *
 * Neither the declared type nor the extension is evidence about the bytes — a
 * presigned PUT signs neither — so this is not a security boundary and does not
 * pretend to be one. What it does guarantee is that **every stored type is one
 * of `ALLOWED_CHART_FILE_TYPES`**: an unidentified file is stored as the
 * generic type, which downloads instead of rendering.
 */
export function resolveChartFileContentType(fileName: string, declaredType: string): string | null {
  const type = declaredType.split(";")[0].trim().toLowerCase();
  if ((SELF_DESCRIBING_TYPES as readonly string[]).includes(type)) return type;

  const extension = fileExtension(fileName);
  if ((ALLOWED_CHART_FILE_EXTENSIONS as readonly string[]).includes(extension)) {
    return "application/octet-stream";
  }

  return null;
}

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

/**
 * Recording an upload that already happened. The size and type are deliberately
 * absent: `addChartFile` reads both back off the stored object, because what a
 * client says about its own upload is not evidence.
 */
export const addChartFileSchema = z.object({
  chartId: z.string().trim().min(1, "Chart is required"),
  url: z.string().refine((value) => {
    const parsed = parseStorageKey(value);
    return parsed !== null && parsed.category === "files";
  }, "Invalid file path"),
  filename: z.string().trim().min(1, "Filename is required").max(255, "Filename is too long"),
  label: optionalText(255, "Label is too long"),
});

export type AddChartFileInput = z.input<typeof addChartFileSchema>;

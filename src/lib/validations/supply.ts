import { z } from "zod";
import { DEFAULT_SUPPLY_HEX } from "@/lib/constants";
import { optionalUrl, wholeNumber, ZOD3_WORDING } from "@/lib/validations/fields";

const SUPPLY_TYPES = ["THREAD", "BEAD", "SPECIALTY"] as const;
const COLOR_FAMILIES = [
  "BLACK",
  "WHITE",
  "RED",
  "ORANGE",
  "YELLOW",
  "GREEN",
  "BLUE",
  "PURPLE",
  "BROWN",
  "GRAY",
  "NEUTRAL",
] as const;

/**
 * Required, not defaulted: quick-add asks rather than filing silently under NEUTRAL
 * (Beth's ruling, 2026-08-17). Only a missing or non-text value is "required" — a
 * value that was sent but is off the list keeps Zod's own message, as it did in Zod 3.
 */
const requiredColorFamily = z.enum(COLOR_FAMILIES, {
  error: (issue) => (typeof issue.input === "string" ? undefined : "Color family is required"),
});

export const supplyBrandSchema = z.object({
  name: z.string().trim().min(1, "Brand name is required").max(200, "Brand name too long"),
  website: optionalUrl(),
  supplyType: z.enum(SUPPLY_TYPES),
});

export type SupplyBrandInput = z.input<typeof supplyBrandSchema>;

export const threadSchema = z.object({
  brandId: z.string().min(1, "Brand is required"),
  colorCode: z.string().trim().min(1, "Color code is required").max(50, ZOD3_WORDING.tooLong(50)),
  colorName: z.string().trim().min(1, "Color name is required").max(200, ZOD3_WORDING.tooLong(200)),
  hexColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color (e.g., #FF5733)"),
  colorFamily: z.enum(COLOR_FAMILIES),
});

export type ThreadInput = z.input<typeof threadSchema>;

export const beadSchema = z.object({
  brandId: z.string().min(1, "Brand is required"),
  productCode: z
    .string()
    .trim()
    .min(1, "Product code is required")
    .max(50, ZOD3_WORDING.tooLong(50)),
  colorName: z.string().trim().min(1, "Color name is required").max(200, ZOD3_WORDING.tooLong(200)),
  hexColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color (e.g., #FF5733)"),
  colorFamily: z.enum(COLOR_FAMILIES),
});

export type BeadInput = z.input<typeof beadSchema>;

export const specialtyItemSchema = z.object({
  brandId: z.string().min(1, "Brand is required"),
  productCode: z
    .string()
    .trim()
    .min(1, "Product code is required")
    .max(50, ZOD3_WORDING.tooLong(50)),
  colorName: z.string().trim().min(1, "Name is required").max(200, ZOD3_WORDING.tooLong(200)),
  description: z.string().max(2000, ZOD3_WORDING.tooLong(2000)).default(""),
  hexColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color (e.g., #FF5733)"),
});

export type SpecialtyItemInput = z.input<typeof specialtyItemSchema>;

/**
 * A thread's need is null when its line has no known length, strand structure or cut (THR-011)
 * — unknown, still to buy. Beads and specialty items always need a number.
 */
export const projectThreadSchema = z.object({
  projectId: z.string().min(1),
  threadId: z.string().min(1),
  stitchCount: wholeNumber().min(0).default(0),
  quantityRequired: wholeNumber().min(1).nullable().default(1),
  quantityAcquired: z.number().int().min(0).default(0),
});

export type ProjectThreadInput = z.input<typeof projectThreadSchema>;

export const projectBeadSchema = z.object({
  projectId: z.string().min(1),
  beadId: z.string().min(1),
  quantityRequired: wholeNumber().min(1).default(1),
  quantityAcquired: z.number().int().min(0).default(0),
});

export type ProjectBeadInput = z.input<typeof projectBeadSchema>;

export const projectSpecialtySchema = z.object({
  projectId: z.string().min(1),
  specialtyItemId: z.string().min(1),
  quantityRequired: wholeNumber().min(1).default(1),
  quantityAcquired: z.number().int().min(0).default(0),
});

export type ProjectSpecialtyInput = z.input<typeof projectSpecialtySchema>;

/**
 * Shared by the three junction types. Only a thread line has a stitch count or a typed mark, and
 * only a thread may send a null (unknown) need; `updateProjectSupplyQuantity` refuses the rest.
 */
export const updateQuantitySchema = z.object({
  quantityRequired: z.number().int().min(1).nullable().optional(),
  quantityAcquired: z.number().int().min(0).optional(),
  stitchCount: z.number().int().min(0).optional(),
  isNeedOverridden: z.boolean().optional(),
});

export type UpdateQuantityInput = z.input<typeof updateQuantitySchema>;

export const updateProjectSettingsSchema = z.object({
  strandCount: z.number().int().min(1).max(6).optional(),
  overCount: z.union([z.literal(1), z.literal(2)]).optional(),
  wastePercent: z.number().int().min(0).max(50).optional(),
});

export type UpdateProjectSettingsInput = z.input<typeof updateProjectSettingsSchema>;

export const createAndAddThreadSchema = z.object({
  projectId: z.string().min(1),
  name: z.string().trim().min(1, "Name is required").max(200),
  colorCode: z.string().trim().max(20).optional().default(""),
  hexColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional()
    .default(DEFAULT_SUPPLY_HEX),
  brandId: z.string().min(1, "Brand is required"),
  colorFamily: requiredColorFamily,
});

export type CreateAndAddThreadInput = z.input<typeof createAndAddThreadSchema>;

export const createAndAddBeadSchema = z.object({
  projectId: z.string().min(1),
  name: z.string().trim().min(1, "Name is required").max(200),
  code: z.string().trim().max(20).optional().default(""),
  brandId: z.string().min(1, "Brand is required"),
  colorFamily: requiredColorFamily,
});

export type CreateAndAddBeadInput = z.input<typeof createAndAddBeadSchema>;

export const createAndAddSpecialtySchema = z.object({
  projectId: z.string().min(1),
  name: z.string().trim().min(1, "Name is required").max(200),
  code: z.string().trim().max(20).optional().default(""),
  brandId: z.string().min(1, "Brand is required"),
});

export type CreateAndAddSpecialtyInput = z.input<typeof createAndAddSpecialtySchema>;

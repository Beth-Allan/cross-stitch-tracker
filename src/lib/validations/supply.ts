import { z } from "zod";
import { DEFAULT_SUPPLY_HEX } from "@/lib/constants";
import { optionalUrl } from "@/lib/validations/fields";

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

export const supplyBrandSchema = z.object({
  name: z.string().trim().min(1, "Brand name is required").max(200, "Brand name too long"),
  website: optionalUrl(),
  supplyType: z.enum(SUPPLY_TYPES),
});

export type SupplyBrandInput = z.input<typeof supplyBrandSchema>;

export const threadSchema = z.object({
  brandId: z.string().min(1, "Brand is required"),
  colorCode: z.string().trim().min(1, "Color code is required").max(50),
  colorName: z.string().trim().min(1, "Color name is required").max(200),
  hexColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color (e.g., #FF5733)"),
  colorFamily: z.enum(COLOR_FAMILIES),
});

export type ThreadInput = z.input<typeof threadSchema>;

export const beadSchema = z.object({
  brandId: z.string().min(1, "Brand is required"),
  productCode: z.string().trim().min(1, "Product code is required").max(50),
  colorName: z.string().trim().min(1, "Color name is required").max(200),
  hexColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color (e.g., #FF5733)"),
  colorFamily: z.enum(COLOR_FAMILIES),
});

export type BeadInput = z.input<typeof beadSchema>;

export const specialtyItemSchema = z.object({
  brandId: z.string().min(1, "Brand is required"),
  productCode: z.string().trim().min(1, "Product code is required").max(50),
  colorName: z.string().trim().min(1, "Name is required").max(200),
  description: z.string().max(2000).default(""),
  hexColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color (e.g., #FF5733)"),
});

export type SpecialtyItemInput = z.input<typeof specialtyItemSchema>;

export const projectThreadSchema = z.object({
  projectId: z.string().min(1),
  threadId: z.string().min(1),
  stitchCount: z.number().int().min(0).default(0),
  quantityRequired: z.number().int().min(1).default(1),
  quantityAcquired: z.number().int().min(0).default(0),
});

export type ProjectThreadInput = z.input<typeof projectThreadSchema>;

export const projectBeadSchema = z.object({
  projectId: z.string().min(1),
  beadId: z.string().min(1),
  quantityRequired: z.number().int().min(1).default(1),
  quantityAcquired: z.number().int().min(0).default(0),
});

export type ProjectBeadInput = z.input<typeof projectBeadSchema>;

export const projectSpecialtySchema = z.object({
  projectId: z.string().min(1),
  specialtyItemId: z.string().min(1),
  quantityRequired: z.number().int().min(1).default(1),
  quantityAcquired: z.number().int().min(0).default(0),
});

export type ProjectSpecialtyInput = z.input<typeof projectSpecialtySchema>;

export const updateQuantitySchema = z.object({
  quantityRequired: z.number().int().min(1).optional(),
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
  // Required, not defaulted: quick-add asks rather than filing silently under NEUTRAL
  // (Beth's ruling, 2026-08-17)
  colorFamily: z.enum(COLOR_FAMILIES, {
    required_error: "Color family is required",
    invalid_type_error: "Color family is required",
  }),
});

export type CreateAndAddThreadInput = z.input<typeof createAndAddThreadSchema>;

export const createAndAddBeadSchema = z.object({
  projectId: z.string().min(1),
  name: z.string().trim().min(1, "Name is required").max(200),
  code: z.string().trim().max(20).optional().default(""),
  brandId: z.string().min(1, "Brand is required"),
  colorFamily: z.enum(COLOR_FAMILIES, {
    required_error: "Color family is required",
    invalid_type_error: "Color family is required",
  }),
});

export type CreateAndAddBeadInput = z.input<typeof createAndAddBeadSchema>;

export const createAndAddSpecialtySchema = z.object({
  projectId: z.string().min(1),
  name: z.string().trim().min(1, "Name is required").max(200),
  code: z.string().trim().max(20).optional().default(""),
  brandId: z.string().min(1, "Brand is required"),
});

export type CreateAndAddSpecialtyInput = z.input<typeof createAndAddSpecialtySchema>;

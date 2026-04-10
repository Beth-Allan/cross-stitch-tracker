import { z } from "zod";

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
  website: z.string().url("Must be a valid URL").nullable().default(null),
  supplyType: z.enum(SUPPLY_TYPES),
});

export type SupplyBrandInput = z.infer<typeof supplyBrandSchema>;

export const threadSchema = z.object({
  brandId: z.string().min(1, "Brand is required"),
  colorCode: z.string().trim().min(1, "Color code is required").max(50),
  colorName: z.string().trim().min(1, "Color name is required").max(200),
  hexColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color (e.g., #FF5733)"),
  colorFamily: z.enum(COLOR_FAMILIES),
});

export type ThreadInput = z.infer<typeof threadSchema>;

export const beadSchema = z.object({
  brandId: z.string().min(1, "Brand is required"),
  productCode: z.string().trim().min(1, "Product code is required").max(50),
  colorName: z.string().trim().min(1, "Color name is required").max(200),
  hexColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color (e.g., #FF5733)"),
  colorFamily: z.enum(COLOR_FAMILIES),
});

export type BeadInput = z.infer<typeof beadSchema>;

export const specialtyItemSchema = z.object({
  brandId: z.string().min(1, "Brand is required"),
  productCode: z.string().trim().min(1, "Product code is required").max(50),
  colorName: z.string().trim().min(1, "Name is required").max(200),
  description: z.string().max(2000).default(""),
  hexColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color (e.g., #FF5733)"),
});

export type SpecialtyItemInput = z.infer<typeof specialtyItemSchema>;

export const projectThreadSchema = z.object({
  projectId: z.string().min(1),
  threadId: z.string().min(1),
  stitchCount: z.number().int().min(0).default(0),
  quantityRequired: z.number().int().min(1).default(1),
  quantityAcquired: z.number().int().min(0).default(0),
});

export type ProjectThreadInput = z.infer<typeof projectThreadSchema>;

export const projectBeadSchema = z.object({
  projectId: z.string().min(1),
  beadId: z.string().min(1),
  quantityRequired: z.number().int().min(1).default(1),
  quantityAcquired: z.number().int().min(0).default(0),
});

export type ProjectBeadInput = z.infer<typeof projectBeadSchema>;

export const projectSpecialtySchema = z.object({
  projectId: z.string().min(1),
  specialtyItemId: z.string().min(1),
  quantityRequired: z.number().int().min(1).default(1),
  quantityAcquired: z.number().int().min(0).default(0),
});

export type ProjectSpecialtyInput = z.infer<typeof projectSpecialtySchema>;

export const updateQuantitySchema = z.object({
  quantityRequired: z.number().int().min(1).optional(),
  quantityAcquired: z.number().int().min(0).optional(),
  stitchCount: z.number().int().min(0).optional(),
});

export type UpdateQuantityInput = z.infer<typeof updateQuantitySchema>;

import { z } from "zod";

const FABRIC_TYPES = [
  "Aida",
  "Linen",
  "Lugana",
  "Evenweave",
  "Hardanger",
  "Congress Cloth",
  "Other",
] as const;

const FABRIC_COLOR_FAMILIES = [
  "White",
  "Cream",
  "Blue",
  "Green",
  "Pink",
  "Purple",
  "Red",
  "Yellow",
  "Brown",
  "Gray",
  "Black",
  "Multi",
] as const;

const FABRIC_COLOR_TYPES = [
  "White",
  "Cream",
  "Natural",
  "Neutrals",
  "Brights",
  "Pastels",
  "Dark",
  "Hand-dyed",
  "Overdyed",
] as const;

export const fabricBrandSchema = z.object({
  name: z.string().trim().min(1, "Brand name is required").max(200, "Brand name too long"),
  website: z.string().url("Must be a valid URL").nullable().default(null),
});

export type FabricBrandInput = z.infer<typeof fabricBrandSchema>;

export const fabricSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200, "Name too long"),
  brandId: z.string().min(1, "Brand is required"),
  count: z.number().int().min(1, "Count is required"),
  type: z.enum(FABRIC_TYPES),
  colorFamily: z.enum(FABRIC_COLOR_FAMILIES),
  colorType: z.enum(FABRIC_COLOR_TYPES),
  shortestEdgeInches: z.number().min(0).default(0),
  longestEdgeInches: z.number().min(0).default(0),
  needToBuy: z.boolean().default(false),
  linkedProjectId: z.string().nullable().default(null),
});

export type FabricInput = z.infer<typeof fabricSchema>;

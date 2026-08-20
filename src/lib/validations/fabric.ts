import { z } from "zod";
import { optionalChoice, optionalUrl } from "@/lib/validations/fields";
import { FABRIC_COLOR_FAMILIES, FABRIC_COLOR_TYPES, FABRIC_TYPES } from "@/types/fabric";

export const fabricBrandSchema = z.object({
  name: z.string().trim().min(1, "Brand name is required").max(200, "Brand name too long"),
  website: optionalUrl(),
});

export type FabricBrandInput = z.input<typeof fabricBrandSchema>;

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
  linkedProjectId: optionalChoice(),
});

export type FabricInput = z.input<typeof fabricSchema>;

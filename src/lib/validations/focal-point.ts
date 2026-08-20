import { z } from "zod";

export const updateFocalPointSchema = z
  .object({
    chartId: z.string().min(1, "Chart ID is required"),
    x: z.number().min(0).max(1).nullable(),
    y: z.number().min(0).max(1).nullable(),
  })
  .refine((data) => (data.x === null) === (data.y === null), {
    message: "Both x and y must be set or both must be null",
  });

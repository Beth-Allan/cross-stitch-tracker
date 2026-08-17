import { z } from "zod";
import { parseCalendarDate } from "@/lib/utils/calendar-date";

export const sessionFormSchema = z.object({
  projectId: z.string().trim().min(1, "Project is required"),
  // A session date is a calendar date, never an instant (docs/ARCHITECTURE.md).
  // "Not in the future" is a per-user judgement and lives in the action, which
  // knows whose timezone decides what "today" means.
  date: z.string().refine(
    (val) => {
      try {
        parseCalendarDate(val);
        return true;
      } catch {
        return false;
      }
    },
    { message: "Invalid date" },
  ),
  stitchCount: z
    .number()
    .int("Stitch count must be a whole number")
    .min(1, "Stitch count must be at least 1"),
  timeSpentMinutes: z.number().int().min(0, "Time cannot be negative").nullable().default(null),
  photoKey: z.string().nullable().default(null),
});

export type SessionFormInput = z.infer<typeof sessionFormSchema>;

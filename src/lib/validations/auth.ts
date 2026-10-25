import { z } from "zod";
import { ZOD3_WORDING } from "@/lib/validations/fields";

export const loginSchema = z.object({
  // Normalized here so both login entry paths — the form action and a direct
  // POST to the credentials callback — key the rate limiter and match the
  // configured address identically. The cap keeps an attacker-chosen key small.
  // `.email()` rather than Zod 4's standalone `z.email()`, which checks the format
  // before `.trim()` runs and so would refuse an address typed with a stray space.
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please enter a valid email address")
    .max(254, ZOD3_WORDING.tooLong(254)),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

import { z } from "zod";

export const loginSchema = z.object({
  // Normalized here so both login entry paths — the form action and a direct
  // POST to the credentials callback — key the rate limiter and match the
  // configured address identically. The cap keeps an attacker-chosen key small.
  email: z.string().trim().toLowerCase().email("Please enter a valid email address").max(254),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

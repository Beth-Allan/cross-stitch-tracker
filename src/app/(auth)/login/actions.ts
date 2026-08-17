"use server";

import { signIn } from "@/lib/auth";
import { peekRateLimit } from "@/lib/rate-limit";
import { loginSchema } from "@/lib/validations/auth";
import { AuthError } from "next-auth";

export async function loginAction(
  _prevState: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  // Read-only. The enforcing call is `recordAttempt` inside `authorizeCredentials`,
  // which is the one point both login entry paths pass through; this only lets the
  // form name the wait instead of returning the generic failure.
  const rateCheck = peekRateLimit(parsed.data.email);
  if (!rateCheck.allowed) {
    return {
      error: `Too many attempts. Try again in ${rateCheck.retryAfter} seconds.`,
    };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/",
    });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      console.error("Auth error:", error.type, error.message);
      if (error.type === "CredentialsSignin") {
        return { error: "Invalid credentials" };
      }
      // Everything `authorize()` throws arrives here — a missing or mangled
      // AUTH_USER_* value above all. Say so: a broken deploy must not read as a
      // mistyped password.
      if (error.type === "CallbackRouteError") {
        return {
          error: "Sign-in is unavailable — a server setting is wrong. This isn't your password.",
        };
      }
      return { error: "Something went wrong" };
    }
    // Re-throw NEXT_REDIRECT and other non-auth errors
    throw error;
  }
}

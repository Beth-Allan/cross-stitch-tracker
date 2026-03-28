"use server";

import { signIn } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
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

  // Rate limit check BEFORE signIn so the message reaches the user directly
  const rateCheck = checkRateLimit(parsed.data.email);
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
      return { error: "Something went wrong" };
    }
    // Re-throw NEXT_REDIRECT and other non-auth errors
    throw error;
  }
}

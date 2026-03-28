"use server"

import { signIn } from "@/lib/auth"
import { loginSchema } from "@/lib/validations/auth"
import { AuthError } from "next-auth"

export async function loginAction(
  _prevState: { error?: string } | undefined,
  formData: FormData
): Promise<{ error?: string }> {
  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
  }

  const parsed = loginSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/",
    })
    return {}
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid credentials" }
    }
    throw error
  }
}

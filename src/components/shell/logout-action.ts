"use server";

import { signOut } from "@/lib/auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";

export async function logoutAction(): Promise<{ success: boolean; error?: string }> {
  try {
    await signOut({ redirectTo: "/login" });
    return { success: true };
  } catch (error) {
    // signOut throws a redirect error internally — re-throw so Next.js handles it
    if (isRedirectError(error)) {
      throw error;
    }
    console.error("Logout failed:", error);
    return { success: false, error: "Failed to log out. Please try again." };
  }
}

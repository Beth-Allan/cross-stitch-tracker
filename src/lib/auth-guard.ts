import { auth } from "@/lib/auth";

/**
 * Verify the current user is authenticated and has a valid user ID.
 * Throws "Unauthorized" if not. Use in every server action before mutations.
 *
 * Auth.js v5 requires explicit JWT+session callbacks to pass user.id through.
 * See docs/conventions/auth-patterns.md.
 */
export async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user;
}

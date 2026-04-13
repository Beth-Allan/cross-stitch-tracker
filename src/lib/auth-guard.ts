import { auth } from "@/lib/auth";

/** Authenticated user with a guaranteed non-optional `id`. */
export type AuthUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

/**
 * Verify the current user is authenticated and has a valid user ID.
 * Throws "Unauthorized" if not. Use in every server action before mutations.
 *
 * Auth.js v5 requires explicit JWT+session callbacks to pass user.id through.
 * See .claude/rules/auth-patterns.md.
 */
export async function requireAuth(): Promise<AuthUser> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user as AuthUser;
}

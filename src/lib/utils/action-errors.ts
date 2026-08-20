import type { z } from "zod";

/**
 * The two error arms every write action needs, in one place.
 *
 * Both used to be copied per action: the Zod arm reached into
 * `error.errors[0].message` at each site, and the duplicate-key check was
 * hand-written in five files while a private helper of the same shape already
 * sat in `supply-actions.ts`. Copies are how one of them ends up subtly
 * different from the rest.
 */

/**
 * The message a form should show for a rejected payload — the first issue's,
 * because that is the field the user is looking at.
 */
export function firstValidationMessage(error: z.ZodError): string {
  return error.errors[0].message;
}

/**
 * Prisma's unique-constraint violation. Structural rather than an
 * `instanceof` check: the code travels on the error object, and the generated
 * client's error classes are not worth importing into every action for one
 * string comparison.
 */
export function isDuplicateKeyError(error: unknown): boolean {
  return (
    error !== null &&
    typeof error === "object" &&
    "code" in error &&
    (error as { code: unknown }).code === "P2002"
  );
}

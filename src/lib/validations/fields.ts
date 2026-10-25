import { z } from "zod";

/**
 * The shared field rules every boundary schema builds from.
 *
 * They exist because the same rule used to be written a different way in each
 * file: `seriesSchema` trimmed its notes and turned a blank one into `null`,
 * `designerSchema` and `chartFormSchema` did neither, and four client forms
 * compensated with `value.trim() || null` before calling the action — so what
 * "no notes" meant depended on which form you came through, and the forms were
 * enforcing a validation rule the validation layer should own.
 *
 * A schema built from these helpers is the whole rule. Server actions still
 * `.parse()` at runtime: action ids are global, so a caller's static type is a
 * convenience for the app's own code, never a guarantee about the payload.
 */

const URL_RULE = z.url();

/**
 * Zod 3's built-in wording, for checks that never had a message of their own.
 * Zod 4 rewords its defaults, and a library upgrade must not change what Beth
 * reads, so wherever a screen shows one of these the schema spells the old text
 * out. Checks whose text no screen shows — the UI replaces it, or no input can
 * produce the value — keep Zod's own wording.
 */
export const ZOD3_WORDING = {
  notWhole: "Expected integer, received float",
  tooLong: (max: number) => `String must contain at most ${max} character(s)`,
  atLeast: (min: number) => `Number must be greater than or equal to ${min}`,
  atMost: (max: number) => `Number must be less than or equal to ${max}`,
  aboveZero: "Number must be greater than 0",
} as const;

/**
 * A whole number from a box that can send a fraction. Only the fraction keeps
 * Zod 3's wording: Zod 4's `.int()` also refuses numbers past
 * `Number.MAX_SAFE_INTEGER`, which Zod 3 let through, and calling a 20-digit
 * number a fraction would be wrong — that case keeps Zod 4's own message.
 */
export function wholeNumber() {
  return z
    .number()
    .int({ error: (issue) => (issue.code === "invalid_type" ? ZOD3_WORDING.notWhole : undefined) });
}

const blankToNull = (value: string) => (value === "" ? null : value);

/**
 * Optional free text: trimmed, and blank means absent. The length limit is
 * measured against the trimmed value, so trailing whitespace can never push a
 * field over its cap.
 *
 * Only for columns that are actually nullable. `SpecialtyItem.description` is
 * `String @default("")`, so it keeps its own empty-string rule.
 */
export function optionalText(max: number, tooLongMessage: string) {
  return z.string().trim().max(max, tooLongMessage).transform(blankToNull).nullable().default(null);
}

/**
 * An optional link: same trim/blank-is-absent rule, then the URL check. Order
 * matters — checking the URL first would reject a field the user simply left
 * empty, which is why the client forms were pre-emptying it.
 */
export function optionalUrl(message = "Must be a valid URL") {
  return z
    .string()
    .trim()
    .transform(blankToNull)
    .nullable()
    .default(null)
    .refine((value) => value === null || URL_RULE.safeParse(value).success, message);
}

/**
 * An optional value chosen from a picker — a foreign-key id, or one of a fixed
 * set of option strings. A cleared picker sends `""`, which is not a choice:
 * reading it as "nothing selected" keeps an empty string from reaching Prisma
 * as a row to look up, or being stored as if the user had picked something.
 */
export function optionalChoice() {
  return z.string().trim().transform(blankToNull).nullable().default(null);
}

/**
 * An optional date the client sends as a string. Deliberately still the
 * permissive `Date.parse` check the three project date fields have always used:
 * tightening it to a calendar-date parse is a separate change, because the
 * write path stores these with `new Date(value)` and both halves have to move
 * together.
 */
export function optionalDateString(message = "Invalid date") {
  return z
    .string()
    .nullable()
    .default(null)
    .refine((value) => value === null || !Number.isNaN(Date.parse(value)), message);
}

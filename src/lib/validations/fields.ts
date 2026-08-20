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

const URL_RULE = z.string().url();

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
    .refine((value) => value === null || URL_RULE.safeParse(value).success, { message });
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
    .refine((value) => value === null || !Number.isNaN(Date.parse(value)), { message });
}

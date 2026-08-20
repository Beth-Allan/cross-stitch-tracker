/**
 * Narrow a `<select>`'s raw string value back to one of the options it was
 * rendered from.
 *
 * A native select hands back `string`, so a picker whose options are a fixed
 * list still widens the value on the way into state — and the usual fix, an
 * `as` cast, asserts what it cannot check. This checks it against the same list
 * the options came from, so an unknown value is simply not a choice.
 */
export function optionFrom<T extends string>(options: readonly T[], value: string): T | undefined {
  return options.find((option) => option === value);
}

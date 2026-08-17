/**
 * Unwraps one `Promise.allSettled` result, turning a rejection into a logged `null`
 * so a page can degrade panel by panel instead of taking the whole route down.
 *
 * @param scope prefixes the log line — pages outside the stats layer pass their own.
 */
export function settled<T>(
  result: PromiseSettledResult<T>,
  label?: string,
  scope = "stats",
): T | null {
  if (result.status === "fulfilled") return result.value;
  console.error(
    `[${scope}] ${label ?? "query"} failed:`,
    result.reason instanceof Error ? result.reason.message : result.reason,
  );
  return null;
}

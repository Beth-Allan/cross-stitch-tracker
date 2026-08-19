/**
 * Next's signal that a route read request state and therefore cannot be prerendered. It is not a
 * query failure: Next throws it during static generation and re-renders the route dynamically once
 * it propagates. Swallowing it prints an alarming line under a green build and lets the prerender
 * pass finish with a degraded shell, so `settled` rethrows it instead. The digest string is the
 * public shape of the check (verified against `next/dist/client/components/hooks-server-context`);
 * that module is internal, so the constant is asserted here rather than imported.
 */
function isDynamicServerBailout(reason: unknown): boolean {
  return (
    typeof reason === "object" &&
    reason !== null &&
    "digest" in reason &&
    (reason as { digest?: unknown }).digest === "DYNAMIC_SERVER_USAGE"
  );
}

/**
 * Unwraps one `Promise.allSettled` result, turning a rejection into a logged `null`
 * so a page can degrade panel by panel instead of taking the whole route down.
 *
 * @param scope prefixes the log line — pages outside the stats layer pass their own.
 * @throws the rejection unchanged when it is Next's dynamic-server bailout.
 */
export function settled<T>(
  result: PromiseSettledResult<T>,
  label?: string,
  scope = "stats",
): T | null {
  if (result.status === "fulfilled") return result.value;
  if (isDynamicServerBailout(result.reason)) throw result.reason;
  console.error(
    `[${scope}] ${label ?? "query"} failed:`,
    result.reason instanceof Error ? result.reason.message : result.reason,
  );
  return null;
}

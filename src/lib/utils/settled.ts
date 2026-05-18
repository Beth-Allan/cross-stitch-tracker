/**
 * Extracts the value from a PromiseSettledResult.
 * Returns null for rejected results, enabling graceful degradation.
 */
export function settled<T>(result: PromiseSettledResult<T>): T | null {
  return result.status === "fulfilled" ? result.value : null;
}

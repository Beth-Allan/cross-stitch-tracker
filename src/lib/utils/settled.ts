export function settled<T>(result: PromiseSettledResult<T>, label?: string): T | null {
  if (result.status === "fulfilled") return result.value;
  console.error(
    `[stats] ${label ?? "query"} failed:`,
    result.reason instanceof Error ? result.reason.message : result.reason,
  );
  return null;
}

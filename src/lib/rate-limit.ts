// NOTE: In-memory store — resets on serverless cold start.
// Acceptable for single-user app. For multi-user, replace with Redis or similar persistent store.

const attempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 5;
const COOLDOWN_MS = 30_000;

/**
 * Hard ceiling on tracked keys. The enforcing call sits on an unauthenticated
 * endpoint and keys on the submitted email, so without a bound a flood of fresh
 * addresses grows the warm function's heap without ever being throttled.
 */
export const MAX_TRACKED_KEYS = 10_000;

export type RateLimitResult = {
  allowed: boolean;
  retryAfter?: number;
};

/** How many keys the store currently holds. Exists so the bound above is observable. */
export function trackedKeyCount(): number {
  return attempts.size;
}

function secondsRemaining(lastAttempt: number, now: number): number {
  // Never quote a zero-second wait: at exactly COOLDOWN_MS the record still blocks.
  return Math.max(1, Math.ceil((COOLDOWN_MS - (now - lastAttempt)) / 1000));
}

function isExpired(lastAttempt: number, now: number): boolean {
  return now - lastAttempt > COOLDOWN_MS;
}

function enforceBound(now: number): void {
  if (attempts.size <= MAX_TRACKED_KEYS) return;

  for (const [key, record] of attempts) {
    if (isExpired(record.lastAttempt, now)) attempts.delete(key);
  }

  // Map iterates in insertion order, so this evicts the least recently created
  // keys first. Only reachable while more than MAX_TRACKED_KEYS keys are live
  // inside one cooldown window — an attack in progress, not ordinary use.
  for (const key of attempts.keys()) {
    if (attempts.size <= MAX_TRACKED_KEYS) break;
    attempts.delete(key);
  }
}

/**
 * Record a login attempt against `key` and report whether it may proceed.
 *
 * This is the enforcement call: it consumes one of the attempts in the window,
 * so it belongs at the single point every login path passes through
 * (`authorizeCredentials` in `src/lib/auth.ts`), never in a caller that only
 * wants to know the current state — use {@link peekRateLimit} for that.
 */
export function recordAttempt(key: string): RateLimitResult {
  const now = Date.now();
  const record = attempts.get(key);

  if (!record || isExpired(record.lastAttempt, now)) {
    attempts.set(key, { count: 1, lastAttempt: now });
    enforceBound(now);
    return { allowed: true };
  }

  if (record.count >= MAX_ATTEMPTS) {
    return { allowed: false, retryAfter: secondsRemaining(record.lastAttempt, now) };
  }

  record.count++;
  record.lastAttempt = now;
  return { allowed: true };
}

/**
 * Read the current state for `key` without consuming an attempt.
 *
 * Used by the login form action so a blocked attempt can say how long the wait
 * is, instead of the generic failure the enforcement path returns.
 */
export function peekRateLimit(key: string): RateLimitResult {
  const now = Date.now();
  const record = attempts.get(key);

  if (!record || isExpired(record.lastAttempt, now)) return { allowed: true };
  if (record.count >= MAX_ATTEMPTS) {
    return { allowed: false, retryAfter: secondsRemaining(record.lastAttempt, now) };
  }

  return { allowed: true };
}

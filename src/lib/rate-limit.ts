// NOTE: In-memory store — resets on serverless cold start.
// Acceptable for single-user app. For multi-user, replace with Redis or similar persistent store.

const attempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 5;
const COOLDOWN_MS = 30_000;

export type RateLimitResult = {
  allowed: boolean;
  retryAfter?: number;
};

function secondsRemaining(lastAttempt: number, now: number): number {
  return Math.ceil((COOLDOWN_MS - (now - lastAttempt)) / 1000);
}

/**
 * Record a login attempt against `key` and report whether it may proceed.
 *
 * This is the enforcement call: it consumes one of the attempts in the window,
 * so it belongs at the single point every login path passes through
 * (`authorize()` in `src/lib/auth.ts`), never in a caller that only wants to
 * know the current state — use {@link peekRateLimit} for that.
 */
export function recordAttempt(key: string): RateLimitResult {
  const now = Date.now();
  const record = attempts.get(key);

  if (!record || now - record.lastAttempt > COOLDOWN_MS) {
    attempts.set(key, { count: 1, lastAttempt: now });
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

  if (!record || now - record.lastAttempt > COOLDOWN_MS) return { allowed: true };
  if (record.count >= MAX_ATTEMPTS) {
    return { allowed: false, retryAfter: secondsRemaining(record.lastAttempt, now) };
  }

  return { allowed: true };
}

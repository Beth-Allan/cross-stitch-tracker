const attempts = new Map<string, { count: number; lastAttempt: number }>()
const MAX_ATTEMPTS = 5
const COOLDOWN_MS = 30_000

export function checkRateLimit(key: string): {
  allowed: boolean
  retryAfter?: number
} {
  const now = Date.now()
  const record = attempts.get(key)

  if (!record) {
    attempts.set(key, { count: 1, lastAttempt: now })
    return { allowed: true }
  }

  if (now - record.lastAttempt > COOLDOWN_MS) {
    attempts.set(key, { count: 1, lastAttempt: now })
    return { allowed: true }
  }

  if (record.count >= MAX_ATTEMPTS) {
    const retryAfter = Math.ceil(
      (COOLDOWN_MS - (now - record.lastAttempt)) / 1000
    )
    return { allowed: false, retryAfter }
  }

  record.count++
  record.lastAttempt = now
  return { allowed: true }
}

export function resetRateLimit(key: string): void {
  attempts.delete(key)
}

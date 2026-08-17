import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { recordAttempt, peekRateLimit, trackedKeyCount, MAX_TRACKED_KEYS } from "./rate-limit";

// The store is module-level and shared, so every test uses its own key.
let nextKey = 0;
const freshKey = () => `key-${nextKey++}@example.com`;

describe("recordAttempt", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows the first attempt", () => {
    expect(recordAttempt(freshKey())).toEqual({ allowed: true });
  });

  it("allows five attempts and blocks the sixth", () => {
    const key = freshKey();

    for (let i = 0; i < 5; i++) {
      expect(recordAttempt(key).allowed).toBe(true);
    }

    const blocked = recordAttempt(key);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfter).toBeGreaterThan(0);
  });

  it("keeps blocking while the cooldown runs, then allows again once it expires", () => {
    const key = freshKey();
    for (let i = 0; i < 5; i++) recordAttempt(key);

    vi.advanceTimersByTime(29_000);
    expect(recordAttempt(key).allowed).toBe(false);

    vi.advanceTimersByTime(1_001);
    expect(recordAttempt(key)).toEqual({ allowed: true });
  });

  it("reports the seconds remaining in the cooldown", () => {
    const key = freshKey();
    for (let i = 0; i < 5; i++) recordAttempt(key);

    vi.advanceTimersByTime(10_000);
    expect(recordAttempt(key).retryAfter).toBe(20);
  });

  it("never reports a zero-second wait", () => {
    const key = freshKey();
    for (let i = 0; i < 5; i++) recordAttempt(key);

    // Exactly on the boundary the record still blocks, so the wait it quotes
    // has to be a wait.
    vi.advanceTimersByTime(30_000);
    const blocked = recordAttempt(key);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfter).toBe(1);
  });

  it("tracks each key independently", () => {
    const blocked = freshKey();
    const other = freshKey();
    for (let i = 0; i < 6; i++) recordAttempt(blocked);

    expect(recordAttempt(blocked).allowed).toBe(false);
    expect(recordAttempt(other).allowed).toBe(true);
  });
});

describe("peekRateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows an unseen key", () => {
    expect(peekRateLimit(freshKey())).toEqual({ allowed: true });
  });

  it("does not consume an attempt", () => {
    const key = freshKey();

    for (let i = 0; i < 20; i++) {
      expect(peekRateLimit(key)).toEqual({ allowed: true });
    }

    for (let i = 0; i < 5; i++) {
      expect(recordAttempt(key).allowed).toBe(true);
    }
  });

  it("reports blocked with the seconds remaining once the limit is reached", () => {
    const key = freshKey();
    for (let i = 0; i < 5; i++) recordAttempt(key);

    vi.advanceTimersByTime(5_000);
    expect(peekRateLimit(key)).toEqual({ allowed: false, retryAfter: 25 });
  });

  it("allows again once the cooldown has expired", () => {
    const key = freshKey();
    for (let i = 0; i < 5; i++) recordAttempt(key);

    vi.advanceTimersByTime(30_001);
    expect(peekRateLimit(key)).toEqual({ allowed: true });
  });
});

describe("the attempt store", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("stays bounded when an attacker floods it with fresh keys", () => {
    // The enforcing call sits on an unauthenticated endpoint, so the key is
    // attacker-chosen and the store must not grow with the attack.
    for (let i = 0; i < MAX_TRACKED_KEYS + 500; i++) {
      recordAttempt(`flood-${i}@example.com`);
    }

    expect(trackedKeyCount()).toBeLessThanOrEqual(MAX_TRACKED_KEYS);
  });

  it("drops keys whose cooldown has expired rather than holding them forever", () => {
    const before = trackedKeyCount();
    for (let i = 0; i < MAX_TRACKED_KEYS; i++) {
      recordAttempt(`stale-${i}@example.com`);
    }

    vi.advanceTimersByTime(30_000 + 1);
    recordAttempt("one-more@example.com");

    expect(trackedKeyCount()).toBeLessThan(before + MAX_TRACKED_KEYS);
  });
});

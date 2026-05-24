import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@/__tests__/test-utils";
import { useRejectionFlash } from "./use-rejection-flash";

describe("useRejectionFlash", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns showRejection as false initially", () => {
    const { result } = renderHook(() => useRejectionFlash());
    expect(result.current.showRejection).toBe(false);
    expect(typeof result.current.triggerRejection).toBe("function");
  });

  it("sets showRejection to true after triggerRejection()", () => {
    const { result } = renderHook(() => useRejectionFlash());

    act(() => {
      result.current.triggerRejection();
    });

    expect(result.current.showRejection).toBe(true);
  });

  it("resets showRejection to false after default duration (600ms)", () => {
    const { result } = renderHook(() => useRejectionFlash());

    act(() => {
      result.current.triggerRejection();
    });

    expect(result.current.showRejection).toBe(true);

    act(() => {
      vi.advanceTimersByTime(600);
    });

    expect(result.current.showRejection).toBe(false);
  });

  it("resets timer when triggerRejection() called while active", () => {
    const { result } = renderHook(() => useRejectionFlash());

    act(() => {
      result.current.triggerRejection();
    });

    // Advance 400ms (not yet expired)
    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(result.current.showRejection).toBe(true);

    // Trigger again -- should reset the 600ms timer
    act(() => {
      result.current.triggerRejection();
    });

    // Advance 400ms more (800ms total from first trigger, but only 400ms from second)
    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(result.current.showRejection).toBe(true);

    // Advance remaining 200ms to complete second timer
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current.showRejection).toBe(false);
  });

  it("clears timeout on unmount (no act warnings)", () => {
    const { result, unmount } = renderHook(() => useRejectionFlash());

    act(() => {
      result.current.triggerRejection();
    });

    expect(result.current.showRejection).toBe(true);

    // Unmount while timer is active -- should not cause act() warnings
    unmount();

    // Advancing timers after unmount should not throw
    act(() => {
      vi.advanceTimersByTime(600);
    });
  });

  it("respects custom duration option", () => {
    const { result } = renderHook(() => useRejectionFlash({ duration: 1000 }));

    act(() => {
      result.current.triggerRejection();
    });

    act(() => {
      vi.advanceTimersByTime(600);
    });

    // Still true at 600ms because duration is 1000ms
    expect(result.current.showRejection).toBe(true);

    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(result.current.showRejection).toBe(false);
  });
});

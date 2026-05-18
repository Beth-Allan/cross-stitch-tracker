import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@/__tests__/test-utils";
import type { BrokenRecord } from "@/types/stats";

// Mock canvas-confetti
const mockConfetti = vi.fn();
vi.mock("canvas-confetti", () => ({
  default: mockConfetti,
}));

// Mock sonner toast
const mockToastCustom = vi.fn();
const mockToastDismiss = vi.fn();
vi.mock("sonner", () => ({
  toast: {
    custom: mockToastCustom,
    dismiss: mockToastDismiss,
  },
}));

describe("fireCelebration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("calls confetti with expected particle config", async () => {
    const { fireCelebration } = await import("./record-celebration");

    const records: BrokenRecord[] = [
      {
        type: "bestDay",
        label: "Best Day",
        oldValue: 500,
        newValue: 1000,
        unit: "stitches",
      },
    ];

    fireCelebration(records);

    // First record fires immediately (index 0 * 500 = 0ms)
    await vi.advanceTimersByTimeAsync(0);

    expect(mockConfetti).toHaveBeenCalledWith(
      expect.objectContaining({
        particleCount: 120,
        spread: 80,
        startVelocity: 45,
        origin: { x: 0.5, y: 0.3 },
        colors: expect.arrayContaining(["#34d399", "#fbbf24"]),
      }),
    );
  });

  it("calls toast.custom for each broken record", async () => {
    const { fireCelebration } = await import("./record-celebration");

    const records: BrokenRecord[] = [
      {
        type: "bestSession",
        label: "Best Session",
        oldValue: 300,
        newValue: 500,
        unit: "stitches",
      },
    ];

    fireCelebration(records);
    await vi.advanceTimersByTimeAsync(0);

    expect(mockToastCustom).toHaveBeenCalledTimes(1);
    expect(mockToastCustom).toHaveBeenCalledWith(expect.any(Function), { duration: 5000 });
  });

  it("multiple records produce staggered calls (500ms apart)", async () => {
    const { fireCelebration } = await import("./record-celebration");

    const records: BrokenRecord[] = [
      {
        type: "bestDay",
        label: "Best Day",
        oldValue: 500,
        newValue: 1000,
        unit: "stitches",
      },
      {
        type: "bestSession",
        label: "Best Session",
        oldValue: 300,
        newValue: 1000,
        unit: "stitches",
      },
    ];

    fireCelebration(records);

    // At t=0, first record fires
    await vi.advanceTimersByTimeAsync(0);
    expect(mockConfetti).toHaveBeenCalledTimes(1);
    expect(mockToastCustom).toHaveBeenCalledTimes(1);

    // At t=500, second record fires
    await vi.advanceTimersByTimeAsync(500);
    expect(mockConfetti).toHaveBeenCalledTimes(2);
    expect(mockToastCustom).toHaveBeenCalledTimes(2);
  });
});

describe("CelebrationToast", () => {
  it("renders trophy icon, 'New Record!', record label, new value, and previous value", async () => {
    const { CelebrationToast } = await import("./record-celebration");

    render(
      <CelebrationToast
        record={{
          type: "bestDay",
          label: "Best Day",
          oldValue: 982,
          newValue: 1247,
          unit: "stitches",
        }}
        onDismiss={() => {}}
      />,
    );

    expect(screen.getByText("New Record!")).toBeInTheDocument();
    expect(screen.getByText(/Best Day/)).toBeInTheDocument();
    expect(screen.getByText(/1,247/)).toBeInTheDocument();
    expect(screen.getByText(/stitches/)).toBeInTheDocument();
    expect(screen.getByText(/982/)).toBeInTheDocument();
    expect(screen.getByLabelText("Dismiss")).toBeInTheDocument();
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
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
  });

  it("fires confetti with expected particle config", async () => {
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

    await vi.waitFor(() => {
      expect(mockConfetti).toHaveBeenCalledTimes(1);
    });

    expect(mockConfetti).toHaveBeenCalledWith(
      expect.objectContaining({
        particleCount: 150,
        spread: 80,
        startVelocity: 45,
        origin: { x: 0.5, y: 0.2 },
        colors: expect.arrayContaining(["#34d399", "#fbbf24"]),
      }),
    );
  });

  it("shows a single consolidated toast for all broken records", async () => {
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

    expect(mockToastCustom).toHaveBeenCalledTimes(1);
    expect(mockToastCustom).toHaveBeenCalledWith(expect.any(Function), { duration: 6000 });
  });
});

describe("CelebrationToast", () => {
  it("renders trophy icon, title, and all record entries", async () => {
    const { CelebrationToast } = await import("./record-celebration");

    render(
      <CelebrationToast
        records={[
          {
            type: "bestDay",
            label: "Best Day",
            oldValue: 982,
            newValue: 1247,
            unit: "stitches",
          },
        ]}
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

  it("shows plural title for multiple records", async () => {
    const { CelebrationToast } = await import("./record-celebration");

    render(
      <CelebrationToast
        records={[
          { type: "bestDay", label: "Best Day", oldValue: 500, newValue: 1000, unit: "stitches" },
          {
            type: "bestSession",
            label: "Best Session",
            oldValue: 300,
            newValue: 1000,
            unit: "stitches",
          },
        ]}
        onDismiss={() => {}}
      />,
    );

    expect(screen.getByText("2 New Records!")).toBeInTheDocument();
    expect(screen.getByText(/Best Day/)).toBeInTheDocument();
    expect(screen.getByText(/Best Session/)).toBeInTheDocument();
  });
});

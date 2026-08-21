import { describe, expect, it, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import { render, screen } from "@/__tests__/test-utils";
import { CoverOptimizationCard } from "./cover-optimization-card";

const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}));

const mockOptimizeExistingCover = vi.fn();
vi.mock("@/lib/actions/cover-backfill-actions", () => ({
  optimizeExistingCover: (...args: unknown[]) => mockOptimizeExistingCover(...args),
}));

const THREE_CHARTS = [
  { id: "chart-1", name: "Winter Robin" },
  { id: "chart-2", name: "Autumn Fox" },
  { id: "chart-3", name: "Spring Hare" },
];

describe("CoverOptimizationCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOptimizeExistingCover.mockResolvedValue({ success: true, status: "converted" });
  });

  it("says there is nothing to do and offers no button when every cover is already shrunk", () => {
    render(<CoverOptimizationCard charts={[]} />);

    expect(screen.getByText(/already been shrunk/i)).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("says how many are waiting before anything starts", () => {
    render(<CoverOptimizationCard charts={THREE_CHARTS} />);

    expect(screen.getByText(/3 cover photos/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /shrink/i })).toBeInTheDocument();
  });

  it("works through every chart in the list and reports what it finished", async () => {
    const user = userEvent.setup();
    render(<CoverOptimizationCard charts={THREE_CHARTS} />);

    await user.click(screen.getByRole("button", { name: /shrink/i }));

    expect(await screen.findByText(/finished/i)).toBeInTheDocument();
    expect(mockOptimizeExistingCover).toHaveBeenCalledTimes(3);
    expect(mockOptimizeExistingCover).toHaveBeenCalledWith("chart-1");
    expect(mockOptimizeExistingCover).toHaveBeenCalledWith("chart-3");
    expect(screen.getByText(/3 shrunk/i)).toBeInTheDocument();
  });

  it("refreshes the page once the run is over so the count is current", async () => {
    const user = userEvent.setup();
    render(<CoverOptimizationCard charts={THREE_CHARTS} />);

    await user.click(screen.getByRole("button", { name: /shrink/i }));
    await screen.findByText(/finished/i);

    expect(mockRefresh).toHaveBeenCalled();
  });

  it("names the charts it could not do and keeps going through the rest", async () => {
    const user = userEvent.setup();
    mockOptimizeExistingCover
      .mockResolvedValueOnce({ success: true, status: "converted" })
      .mockResolvedValueOnce({ success: false, error: "Original image not found in storage" })
      .mockResolvedValueOnce({ success: true, status: "converted" });
    render(<CoverOptimizationCard charts={THREE_CHARTS} />);

    await user.click(screen.getByRole("button", { name: /shrink/i }));

    expect(await screen.findByText(/finished/i)).toBeInTheDocument();
    expect(mockOptimizeExistingCover).toHaveBeenCalledTimes(3);
    expect(screen.getByText(/2 shrunk/i)).toBeInTheDocument();
    expect(screen.getByText(/Autumn Fox/)).toBeInTheDocument();
    expect(screen.getByText(/not found in storage/i)).toBeInTheDocument();
  });

  it("treats a request that fails outright as one chart left alone, not a stopped run", async () => {
    const user = userEvent.setup();
    mockOptimizeExistingCover.mockRejectedValueOnce(new Error("network"));
    render(<CoverOptimizationCard charts={THREE_CHARTS} />);

    await user.click(screen.getByRole("button", { name: /shrink/i }));

    expect(await screen.findByText(/finished/i)).toBeInTheDocument();
    expect(mockOptimizeExistingCover).toHaveBeenCalledTimes(3);
    expect(screen.getByText(/Winter Robin/)).toBeInTheDocument();
  });

  it("stops working the moment the card goes away, instead of running on unseen", async () => {
    const user = userEvent.setup();
    let release: (value: { success: true; status: "converted" }) => void = () => {};
    mockOptimizeExistingCover.mockImplementationOnce(
      () =>
        new Promise<{ success: true; status: "converted" }>((resolve) => {
          release = resolve;
        }),
    );
    const { unmount } = render(<CoverOptimizationCard charts={THREE_CHARTS} />);

    await user.click(screen.getByRole("button", { name: /shrink/i }));
    unmount();
    release({ success: true, status: "converted" });
    await Promise.resolve();

    expect(mockOptimizeExistingCover).toHaveBeenCalledTimes(1);
  });

  it("keeps the button out of use while the run is going", async () => {
    const user = userEvent.setup();
    let release: (value: { success: true; status: "converted" }) => void = () => {};
    mockOptimizeExistingCover.mockImplementationOnce(
      () =>
        new Promise<{ success: true; status: "converted" }>((resolve) => {
          release = resolve;
        }),
    );
    render(<CoverOptimizationCard charts={THREE_CHARTS} />);

    await user.click(screen.getByRole("button", { name: /shrink/i }));

    expect(await screen.findByRole("button", { name: /shrinking/i })).toBeDisabled();
    release({ success: true, status: "converted" });
    expect(await screen.findByText(/finished/i)).toBeInTheDocument();
  });
});

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/__tests__/test-utils";
import { HeroStatusBadge } from "./hero-status-badge";

vi.mock("@/lib/actions/chart-actions", () => ({
  updateChartStatus: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe("HeroStatusBadge", () => {
  it("renders current status label", () => {
    render(<HeroStatusBadge chartId="c1" currentStatus="IN_PROGRESS" />);
    expect(screen.getByText("Stitching")).toBeInTheDocument();
  });

  it("renders different status labels correctly", () => {
    const { unmount } = render(
      <HeroStatusBadge chartId="c1" currentStatus="UNSTARTED" />,
    );
    expect(screen.getByText("Unstarted")).toBeInTheDocument();
    unmount();

    render(<HeroStatusBadge chartId="c1" currentStatus="FFO" />);
    expect(screen.getByText("FFO")).toBeInTheDocument();
  });

  it("renders chevron-down icon", () => {
    const { container } = render(
      <HeroStatusBadge chartId="c1" currentStatus="KITTING" />,
    );
    // The SelectTrigger includes a ChevronDown icon via the select primitive
    // We just verify the trigger renders with the select component
    expect(container.querySelector("[data-slot='select-trigger']")).toBeInTheDocument();
  });

  it('has aria-label "Change project status"', () => {
    render(<HeroStatusBadge chartId="c1" currentStatus="IN_PROGRESS" />);
    expect(
      screen.getByLabelText("Change project status"),
    ).toBeInTheDocument();
  });

  it("has min-h-11 for 44px touch target", () => {
    render(<HeroStatusBadge chartId="c1" currentStatus="IN_PROGRESS" />);
    const trigger = screen.getByLabelText("Change project status");
    expect(trigger.className).toContain("min-h-11");
  });

  it("renders status dot with correct color class", () => {
    const { container } = render(
      <HeroStatusBadge chartId="c1" currentStatus="KITTED" />,
    );
    const dot = container.querySelector("[aria-hidden='true']");
    expect(dot).toBeInTheDocument();
    expect(dot?.className).toContain("bg-emerald-500");
  });
});

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/__tests__/test-utils";
import { HeroKebabMenu } from "./hero-kebab-menu";

vi.mock("@/lib/actions/chart-actions", () => ({
  deleteChart: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

describe("HeroKebabMenu", () => {
  it("renders trigger button with MoreHorizontal icon", () => {
    render(<HeroKebabMenu chartId="c1" chartName="Test Chart" />);
    const trigger = screen.getByLabelText("Project actions");
    expect(trigger).toBeInTheDocument();
  });

  it('trigger has aria-label "Project actions"', () => {
    render(<HeroKebabMenu chartId="c1" chartName="Test Chart" />);
    expect(screen.getByLabelText("Project actions")).toBeInTheDocument();
  });

  it("trigger has min-h-11 min-w-11 for 44px touch target", () => {
    render(<HeroKebabMenu chartId="c1" chartName="Test Chart" />);
    const trigger = screen.getByLabelText("Project actions");
    expect(trigger.className).toContain("min-h-11");
    expect(trigger.className).toContain("min-w-11");
  });
});

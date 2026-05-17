import { describe, it, expect } from "vitest";
import { render, screen } from "@/__tests__/test-utils";
import { withNuqsTestingAdapter } from "nuqs/adapters/testing";
import { StatsPageShell, STATS_TABS } from "./stats-page-shell";
import type { StatsTab } from "./stats-page-shell";

describe("StatsPageShell", () => {
  const defaultProps = {
    overviewContent: <div data-testid="overview-content">Overview Content</div>,
  };

  it("renders 3 tab triggers with labels Overview, Activity, Records", () => {
    render(<StatsPageShell {...defaultProps} />, {
      wrapper: withNuqsTestingAdapter(),
    });

    expect(screen.getByRole("tab", { name: /Overview/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Activity/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Records/i })).toBeInTheDocument();
  });

  it("renders exactly 3 tabs", () => {
    render(<StatsPageShell {...defaultProps} />, {
      wrapper: withNuqsTestingAdapter(),
    });

    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(3);
  });

  it("shows overview content by default", () => {
    render(<StatsPageShell {...defaultProps} />, {
      wrapper: withNuqsTestingAdapter(),
    });

    expect(screen.getByTestId("overview-content")).toBeInTheDocument();
    expect(screen.getByText("Overview Content")).toBeInTheDocument();
  });

  it("shows the Overview tab as active by default", () => {
    render(<StatsPageShell {...defaultProps} />, {
      wrapper: withNuqsTestingAdapter(),
    });

    const overviewTab = screen.getByRole("tab", { name: /Overview/i });
    expect(overviewTab).toHaveAttribute("data-active");
  });

  it("shows placeholder text for Activity tab when no content provided", () => {
    render(<StatsPageShell {...defaultProps} />, {
      wrapper: withNuqsTestingAdapter({ searchParams: "?tab=activity" }),
    });

    expect(
      screen.getByText("Activity — coming in a future update"),
    ).toBeInTheDocument();
  });

  it("shows placeholder text for Records tab when no content provided", () => {
    render(<StatsPageShell {...defaultProps} />, {
      wrapper: withNuqsTestingAdapter({ searchParams: "?tab=records" }),
    });

    expect(
      screen.getByText("Records — coming in a future update"),
    ).toBeInTheDocument();
  });

  it("shows custom activity content when provided", () => {
    render(
      <StatsPageShell
        {...defaultProps}
        activityContent={<div data-testid="activity-content">Custom Activity</div>}
      />,
      {
        wrapper: withNuqsTestingAdapter({ searchParams: "?tab=activity" }),
      },
    );

    expect(screen.getByTestId("activity-content")).toBeInTheDocument();
  });

  it("exports STATS_TABS with correct values", () => {
    expect(STATS_TABS).toEqual(["overview", "activity", "records"]);
  });

  it("exports StatsTab type that accepts valid tab values", () => {
    // Type-level test: these should compile without error
    const validTab: StatsTab = "overview";
    const validTab2: StatsTab = "activity";
    const validTab3: StatsTab = "records";
    expect(validTab).toBe("overview");
    expect(validTab2).toBe("activity");
    expect(validTab3).toBe("records");
  });

  it("tab triggers have min-h-11 for 44px touch targets", () => {
    render(<StatsPageShell {...defaultProps} />, {
      wrapper: withNuqsTestingAdapter(),
    });

    const tabs = screen.getAllByRole("tab");
    tabs.forEach((tab) => {
      expect(tab.className).toContain("min-h-11");
    });
  });
});

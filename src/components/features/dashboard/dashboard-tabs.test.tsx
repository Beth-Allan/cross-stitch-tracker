import { describe, it, expect } from "vitest";
import { render, screen } from "@/__tests__/test-utils";
import { withNuqsTestingAdapter } from "nuqs/adapters/testing";
import { DashboardTabs, DASHBOARD_TABS } from "./dashboard-tabs";

describe("DashboardTabs", () => {
  const defaultProps = {
    libraryContent: <div data-testid="library-content">Library Content</div>,
    progressContent: <div data-testid="progress-content">Progress Content</div>,
  };

  it("renders 'Your Library' and 'Progress' tab triggers", () => {
    render(<DashboardTabs {...defaultProps} />, {
      wrapper: withNuqsTestingAdapter(),
    });

    expect(screen.getByRole("tab", { name: /Your Library/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Progress/i })).toBeInTheDocument();
  });

  it("has 2 tab values in DASHBOARD_TABS", () => {
    expect(DASHBOARD_TABS).toEqual(["library", "progress"]);
  });

  it("shows library content by default (library tab is default)", () => {
    render(<DashboardTabs {...defaultProps} />, {
      wrapper: withNuqsTestingAdapter(),
    });

    expect(screen.getByTestId("library-content")).toBeInTheDocument();
  });

  it("shows the 'Your Library' tab as active by default", () => {
    render(<DashboardTabs {...defaultProps} />, {
      wrapper: withNuqsTestingAdapter(),
    });

    const libraryTab = screen.getByRole("tab", { name: /Your Library/i });
    expect(libraryTab).toHaveAttribute("data-active");
  });

  it("shows progress content when progress tab is active via URL", () => {
    render(<DashboardTabs {...defaultProps} />, {
      wrapper: withNuqsTestingAdapter({ searchParams: "?tab=progress" }),
    });

    expect(screen.getByTestId("progress-content")).toBeInTheDocument();
  });

  it("tab triggers have min-h-11 for 44px touch targets", () => {
    render(<DashboardTabs {...defaultProps} />, {
      wrapper: withNuqsTestingAdapter(),
    });

    const tabs = screen.getAllByRole("tab");
    tabs.forEach((tab) => {
      expect(tab.className).toContain("min-h-11");
    });
  });

  it("renders exactly 2 tabs", () => {
    render(<DashboardTabs {...defaultProps} />, {
      wrapper: withNuqsTestingAdapter(),
    });

    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(2);
  });
});

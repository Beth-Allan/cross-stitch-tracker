import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@/__tests__/test-utils";
import { withNuqsTestingAdapter } from "nuqs/adapters/testing";
import { ProjectTabs } from "./project-tabs";

describe("ProjectTabs", () => {
  const defaultProps = {
    overviewContent: <div data-testid="overview-content">Overview Content</div>,
    suppliesContent: <div data-testid="supplies-content">Supplies Content</div>,
    sessionsContent: <div data-testid="sessions-content">Sessions Content</div>,
  };

  it("renders Overview and Supplies tab triggers", () => {
    render(<ProjectTabs {...defaultProps} />, {
      wrapper: withNuqsTestingAdapter(),
    });

    expect(screen.getByRole("tab", { name: "Overview" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Supplies" })).toBeInTheDocument();
  });

  it("shows Overview tab as active by default", () => {
    render(<ProjectTabs {...defaultProps} />, {
      wrapper: withNuqsTestingAdapter(),
    });

    const overviewTab = screen.getByRole("tab", { name: "Overview" });
    expect(overviewTab).toHaveAttribute("data-active");
  });

  it("renders overview content in the default tab panel", () => {
    render(<ProjectTabs {...defaultProps} />, {
      wrapper: withNuqsTestingAdapter(),
    });

    expect(screen.getByTestId("overview-content")).toBeInTheDocument();
  });

  it("opens Supplies tab when URL has ?tab=supplies", () => {
    render(<ProjectTabs {...defaultProps} />, {
      wrapper: withNuqsTestingAdapter({ searchParams: "?tab=supplies" }),
    });

    const suppliesTab = screen.getByRole("tab", { name: "Supplies" });
    expect(suppliesTab).toHaveAttribute("data-active");
  });

  it("renders supplies content when supplies tab is active", () => {
    render(<ProjectTabs {...defaultProps} />, {
      wrapper: withNuqsTestingAdapter({ searchParams: "?tab=supplies" }),
    });

    expect(screen.getByTestId("supplies-content")).toBeInTheDocument();
  });

  it("tab triggers have role='tab'", () => {
    render(<ProjectTabs {...defaultProps} />, {
      wrapper: withNuqsTestingAdapter(),
    });

    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(3);
  });

  it("renders Sessions tab trigger", () => {
    render(<ProjectTabs {...defaultProps} />, {
      wrapper: withNuqsTestingAdapter(),
    });

    expect(screen.getByRole("tab", { name: "Sessions" })).toBeInTheDocument();
  });

  it("opens Sessions tab when URL has ?tab=sessions", () => {
    render(<ProjectTabs {...defaultProps} />, {
      wrapper: withNuqsTestingAdapter({ searchParams: "?tab=sessions" }),
    });

    const sessionsTab = screen.getByRole("tab", { name: "Sessions" });
    expect(sessionsTab).toHaveAttribute("data-active");
  });

  it("renders sessions content when sessions tab is active", () => {
    render(<ProjectTabs {...defaultProps} />, {
      wrapper: withNuqsTestingAdapter({ searchParams: "?tab=sessions" }),
    });

    expect(screen.getByTestId("sessions-content")).toBeInTheDocument();
  });

  it("calls onUrlUpdate when tab is changed", async () => {
    const onUrlUpdate = vi.fn();
    render(<ProjectTabs {...defaultProps} />, {
      wrapper: withNuqsTestingAdapter({ onUrlUpdate }),
    });

    fireEvent.click(screen.getByRole("tab", { name: "Supplies" }));

    await waitFor(() => {
      expect(onUrlUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          queryString: expect.stringContaining("tab=supplies"),
        }),
      );
    });
  });

  it("falls back to overview for invalid tab param", () => {
    render(<ProjectTabs {...defaultProps} />, {
      wrapper: withNuqsTestingAdapter({ searchParams: "?tab=invalid" }),
    });

    const overviewTab = screen.getByRole("tab", { name: "Overview" });
    expect(overviewTab).toHaveAttribute("data-active");
  });
});

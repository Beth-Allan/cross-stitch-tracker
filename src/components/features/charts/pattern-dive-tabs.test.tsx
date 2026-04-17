import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@/__tests__/test-utils";
import { withNuqsTestingAdapter } from "nuqs/adapters/testing";
import { PatternDiveTabs, PATTERN_DIVE_TABS } from "./pattern-dive-tabs";

describe("PatternDiveTabs", () => {
  const defaultProps = {
    browseContent: <div data-testid="browse-content">Browse Content</div>,
    whatsNextContent: <div data-testid="whats-next-content">What's Next Content</div>,
    fabricContent: <div data-testid="fabric-content">Fabric Content</div>,
    storageContent: <div data-testid="storage-content">Storage Content</div>,
  };

  it("renders all 4 tab triggers with correct labels", () => {
    render(<PatternDiveTabs {...defaultProps} />, {
      wrapper: withNuqsTestingAdapter(),
    });

    expect(screen.getByRole("tab", { name: /Browse/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /What's Next/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Fabric Requirements/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Storage View/i })).toBeInTheDocument();
  });

  it("has 4 tab values in PATTERN_DIVE_TABS", () => {
    expect(PATTERN_DIVE_TABS).toEqual(["browse", "whats-next", "fabric", "storage"]);
  });

  it("shows Browse tab as active by default", () => {
    render(<PatternDiveTabs {...defaultProps} />, {
      wrapper: withNuqsTestingAdapter(),
    });

    const browseTab = screen.getByRole("tab", { name: /Browse/i });
    expect(browseTab).toHaveAttribute("data-active");
  });

  it("renders browse content in the default tab panel", () => {
    render(<PatternDiveTabs {...defaultProps} />, {
      wrapper: withNuqsTestingAdapter(),
    });

    expect(screen.getByTestId("browse-content")).toBeInTheDocument();
  });

  it("renders whats-next content when whats-next tab is active via URL", () => {
    render(<PatternDiveTabs {...defaultProps} />, {
      wrapper: withNuqsTestingAdapter({ searchParams: "?tab=whats-next" }),
    });

    const whatsNextTab = screen.getByRole("tab", { name: /What's Next/i });
    expect(whatsNextTab).toHaveAttribute("data-active");
    expect(screen.getByTestId("whats-next-content")).toBeInTheDocument();
  });

  it("renders fabric content when fabric tab is active via URL", () => {
    render(<PatternDiveTabs {...defaultProps} />, {
      wrapper: withNuqsTestingAdapter({ searchParams: "?tab=fabric" }),
    });

    const fabricTab = screen.getByRole("tab", { name: /Fabric Requirements/i });
    expect(fabricTab).toHaveAttribute("data-active");
    expect(screen.getByTestId("fabric-content")).toBeInTheDocument();
  });

  it("renders storage content when storage tab is active via URL", () => {
    render(<PatternDiveTabs {...defaultProps} />, {
      wrapper: withNuqsTestingAdapter({ searchParams: "?tab=storage" }),
    });

    const storageTab = screen.getByRole("tab", { name: /Storage View/i });
    expect(storageTab).toHaveAttribute("data-active");
    expect(screen.getByTestId("storage-content")).toBeInTheDocument();
  });

  it("calls onUrlUpdate when tab is changed", async () => {
    const onUrlUpdate = vi.fn();
    render(<PatternDiveTabs {...defaultProps} />, {
      wrapper: withNuqsTestingAdapter({ onUrlUpdate }),
    });

    fireEvent.click(screen.getByRole("tab", { name: /What's Next/i }));

    await waitFor(() => {
      expect(onUrlUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          queryString: expect.stringContaining("tab=whats-next"),
        }),
      );
    });
  });

  it("falls back to browse for invalid tab param", () => {
    render(<PatternDiveTabs {...defaultProps} />, {
      wrapper: withNuqsTestingAdapter({ searchParams: "?tab=invalid" }),
    });

    const browseTab = screen.getByRole("tab", { name: /Browse/i });
    expect(browseTab).toHaveAttribute("data-active");
  });

  it("tab triggers have min-h-11 for 44px touch targets", () => {
    render(<PatternDiveTabs {...defaultProps} />, {
      wrapper: withNuqsTestingAdapter(),
    });

    const tabs = screen.getAllByRole("tab");
    tabs.forEach((tab) => {
      expect(tab.className).toContain("min-h-11");
    });
  });

  it("tab labels are hidden on mobile via hidden sm:inline class", () => {
    render(<PatternDiveTabs {...defaultProps} />, {
      wrapper: withNuqsTestingAdapter(),
    });

    const browseTab = screen.getByRole("tab", { name: /Browse/i });
    const labelSpan = browseTab.querySelector("span");
    expect(labelSpan).toHaveClass("hidden", "sm:inline");
  });

  it("renders exactly 4 tabs", () => {
    render(<PatternDiveTabs {...defaultProps} />, {
      wrapper: withNuqsTestingAdapter(),
    });

    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(4);
  });
});

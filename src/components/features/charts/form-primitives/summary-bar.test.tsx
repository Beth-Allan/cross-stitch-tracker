import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@/__tests__/test-utils";
import userEvent from "@testing-library/user-event";
import { SummaryBar } from "./summary-bar";

// ─── Tests ──────────────────────────────────────────────────────────────────

describe("SummaryBar", () => {
  const defaultProps = {
    name: "Woodland Sampler",
    designerName: "Ink Circles" as string | null,
    statusLabel: "Kitting",
    stitchCount: 54800,
    onDetailsClick: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders chart name in tokens when provided", () => {
    render(<SummaryBar {...defaultProps} />);
    expect(screen.getByText(/Woodland Sampler/)).toBeInTheDocument();
  });

  it("renders designer name in tokens when provided", () => {
    render(<SummaryBar {...defaultProps} />);
    expect(screen.getByText(/Ink Circles/)).toBeInTheDocument();
  });

  it("renders status label in tokens", () => {
    render(<SummaryBar {...defaultProps} />);
    expect(screen.getByText(/Kitting/)).toBeInTheDocument();
  });

  it("renders formatted stitch count when > 0", () => {
    render(<SummaryBar {...defaultProps} />);
    expect(screen.getByText(/54,800 stitches/)).toBeInTheDocument();
  });

  it("omits stitch count token when stitchCount is 0", () => {
    render(<SummaryBar {...defaultProps} stitchCount={0} />);
    expect(screen.queryByText(/stitches/)).not.toBeInTheDocument();
  });

  it("omits designer name token when designerName is null", () => {
    render(<SummaryBar {...defaultProps} designerName={null} />);
    const tokenText = screen.getByRole("banner").textContent;
    expect(tokenText).not.toContain("Ink Circles");
  });

  it("tokens are joined with middle dot separator", () => {
    render(<SummaryBar {...defaultProps} />);
    const tokenText = screen.getByRole("banner").textContent;
    // Check the dot separator exists between tokens
    expect(tokenText).toContain(" · ");
  });

  it('renders "Details" link with ArrowLeft icon', () => {
    render(<SummaryBar {...defaultProps} />);
    const detailsButton = screen.getByRole("button", {
      name: /return to form details/i,
    });
    expect(detailsButton).toBeInTheDocument();
    expect(detailsButton).toHaveTextContent("Details");
  });

  it('clicking "Details" calls onDetailsClick callback', async () => {
    const user = userEvent.setup();
    const onDetailsClick = vi.fn();
    render(<SummaryBar {...defaultProps} onDetailsClick={onDetailsClick} />);

    await user.click(
      screen.getByRole("button", { name: /return to form details/i }),
    );
    expect(onDetailsClick).toHaveBeenCalledOnce();
  });

  it('has role="banner" and aria-label="Project summary"', () => {
    render(<SummaryBar {...defaultProps} />);
    const banner = screen.getByRole("banner", { name: /project summary/i });
    expect(banner).toBeInTheDocument();
  });

  it('"Details" link has aria-label="Return to form details"', () => {
    render(<SummaryBar {...defaultProps} />);
    const detailsButton = screen.getByLabelText("Return to form details");
    expect(detailsButton).toBeInTheDocument();
  });
});

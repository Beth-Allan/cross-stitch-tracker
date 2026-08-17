import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@/__tests__/test-utils";
import { StitchCountFields } from "./stitch-count-fields";

const defaultProps = {
  stitchesWide: 200,
  stitchesHigh: 300,
  stitchCount: 0,
  onWidthChange: vi.fn(),
  onHeightChange: vi.fn(),
  onCountChange: vi.fn(),
};

describe("StitchCountFields", () => {
  describe("basic rendering", () => {
    it("renders dimension inputs", () => {
      render(<StitchCountFields {...defaultProps} />);

      expect(screen.getByLabelText(/dimensions/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/height/i)).toBeInTheDocument();
    });

    it("renders stitch count input", () => {
      render(<StitchCountFields {...defaultProps} />);

      expect(screen.getByLabelText(/total stitch count/i)).toBeInTheDocument();
    });

    it("shows size category badge when effective count > 0", () => {
      render(<StitchCountFields {...defaultProps} stitchesWide={200} stitchesHigh={300} />);

      // 200 * 300 = 60000, which should be a BAP
      expect(screen.getByText(/bap/i)).toBeInTheDocument();
    });
  });

  describe("supply stitch total hint", () => {
    it("does not render supply hint when supplyStitchTotal is undefined", () => {
      render(<StitchCountFields {...defaultProps} />);

      expect(screen.queryByText(/supply total/i)).toBeNull();
    });

    it("does not render supply hint when supplyStitchTotal is 0", () => {
      render(<StitchCountFields {...defaultProps} supplyStitchTotal={0} />);

      expect(screen.queryByText(/supply total/i)).toBeNull();
    });

    it("renders supply total with formatted number", () => {
      render(<StitchCountFields {...defaultProps} supplyStitchTotal={1500} />);

      expect(screen.getByText("Supply total: 1,500 stitches")).toBeInTheDocument();
    });

    it("hint element has correct id for aria-describedby", () => {
      const { container } = render(<StitchCountFields {...defaultProps} supplyStitchTotal={500} />);

      const hintEl = container.querySelector("#stitch-count-supply-hint");
      expect(hintEl).toBeTruthy();
      expect(hintEl).toHaveTextContent("Supply total: 500 stitches");
    });

    it("stitch count input aria-describedby includes supply hint when total > 0", () => {
      render(<StitchCountFields {...defaultProps} supplyStitchTotal={1500} />);

      const input = screen.getByLabelText(/total stitch count/i);
      expect(input.getAttribute("aria-describedby")).toContain("stitch-count-supply-hint");
    });

    it("stitch count input aria-describedby does not include supply hint when total is 0", () => {
      render(<StitchCountFields {...defaultProps} supplyStitchTotal={0} />);

      const input = screen.getByLabelText(/total stitch count/i);
      const describedBy = input.getAttribute("aria-describedby") ?? "";
      expect(describedBy).not.toContain("stitch-count-supply-hint");
    });
  });
});

describe("StitchCountFields — supply total failed to load", () => {
  const props = {
    stitchesWide: 100,
    stitchesHigh: 100,
    stitchCount: 10000,
    onWidthChange: vi.fn(),
    onHeightChange: vi.fn(),
    onCountChange: vi.fn(),
  };

  it("says the supply total could not load rather than silently showing nothing", () => {
    render(<StitchCountFields {...props} supplyStitchTotal={null} />);

    expect(screen.getByText(/supply total couldn't load/i)).toBeInTheDocument();
  });

  it("stays silent when the project genuinely has no supplies", () => {
    render(<StitchCountFields {...props} supplyStitchTotal={0} />);

    expect(screen.queryByText(/supply total couldn't load/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/supply total:/i)).not.toBeInTheDocument();
  });
});

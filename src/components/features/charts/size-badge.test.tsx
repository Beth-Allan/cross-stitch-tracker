import { describe, expect, it } from "vitest";
import { render, screen } from "@/__tests__/test-utils";
import { SizeBadge } from "./size-badge";

describe("SizeBadge", () => {
  it('renders "Mini" for small stitch count', () => {
    render(<SizeBadge stitchCount={500} />);
    expect(screen.getByText("Mini")).toBeInTheDocument();
  });
  it('renders "BAP" for 50000+ stitches', () => {
    render(<SizeBadge stitchCount={50000} />);
    expect(screen.getByText("BAP")).toBeInTheDocument();
  });
  it('renders "Medium" for 10000 stitches', () => {
    render(<SizeBadge stitchCount={10000} />);
    expect(screen.getByText("Medium")).toBeInTheDocument();
  });
  it("renders nothing when stitch count is 0", () => {
    const { container } = render(<SizeBadge stitchCount={0} />);
    expect(container.textContent).toBe("");
  });
  it("calculates from dimensions when stitchCount is 0", () => {
    render(
      <SizeBadge stitchCount={0} stitchesWide={200} stitchesHigh={200} />,
    );
    expect(screen.getByText("Large")).toBeInTheDocument(); // 200*200 = 40000
  });
});

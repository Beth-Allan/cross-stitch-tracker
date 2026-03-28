import { describe, expect, it } from "vitest";
import { render, screen } from "@/__tests__/test-utils";
import { StatusBadge } from "./status-badge";

describe("StatusBadge", () => {
  it('renders "Unstarted" for UNSTARTED status', () => {
    render(<StatusBadge status="UNSTARTED" />);
    expect(screen.getByText("Unstarted")).toBeInTheDocument();
  });
  it('renders "Stitching" for IN_PROGRESS status', () => {
    render(<StatusBadge status="IN_PROGRESS" />);
    expect(screen.getByText("Stitching")).toBeInTheDocument();
  });
  it('renders "FFO" for FFO status', () => {
    render(<StatusBadge status="FFO" />);
    expect(screen.getByText("FFO")).toBeInTheDocument();
  });
  it("renders a colored dot with aria-hidden", () => {
    const { container } = render(<StatusBadge status="KITTING" />);
    const dot = container.querySelector("[aria-hidden]");
    expect(dot).toBeInTheDocument();
  });
});

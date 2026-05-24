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

  it("renders UNSTARTED with status CSS variable classes", () => {
    const { container } = render(<StatusBadge status="UNSTARTED" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain("bg-[var(--status-unstarted-bg)]");
    expect(badge.className).not.toContain("bg-muted");
  });

  it("renders UNSTARTED with status text CSS variable", () => {
    const { container } = render(<StatusBadge status="UNSTARTED" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain("text-[var(--status-unstarted-text)]");
  });

  it("renders KITTING with status CSS variable classes (no regression)", () => {
    const { container } = render(<StatusBadge status="KITTING" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain("bg-[var(--status-kitting-bg)]");
    expect(badge.className).toContain("text-[var(--status-kitting-text)]");
  });
});

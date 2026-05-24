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

  it("renders UNSTARTED with slate background instead of bg-muted", () => {
    const { container } = render(<StatusBadge status="UNSTARTED" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain("bg-slate-50");
    expect(badge.className).not.toContain("bg-muted");
  });

  it("renders UNSTARTED with slate text classes", () => {
    const { container } = render(<StatusBadge status="UNSTARTED" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain("text-slate-700");
    expect(badge.className).toContain("dark:bg-slate-900/40");
  });

  it("renders KITTING with amber background (no regression)", () => {
    const { container } = render(<StatusBadge status="KITTING" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain("bg-amber-50");
    expect(badge.className).toContain("text-amber-700");
  });
});

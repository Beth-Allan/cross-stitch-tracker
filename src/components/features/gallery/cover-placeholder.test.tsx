import { render, screen } from "@/__tests__/test-utils";
import { describe, expect, it } from "vitest";
import { CoverPlaceholder } from "./cover-placeholder";
import type { ProjectStatus } from "@/generated/prisma/client";

describe("CoverPlaceholder", () => {
  it("renders a Scissors icon", () => {
    const { container } = render(<CoverPlaceholder status="UNSTARTED" />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("renders gradient for UNSTARTED status", () => {
    const { container } = render(<CoverPlaceholder status="UNSTARTED" />);
    const div = container.firstChild as HTMLElement;
    expect(div.style.background).toContain("160deg");
    expect(div.style.background).toContain("linear-gradient");
  });

  it("renders gradient for IN_PROGRESS status", () => {
    const { container } = render(<CoverPlaceholder status="IN_PROGRESS" />);
    const div = container.firstChild as HTMLElement;
    expect(div.style.background).toContain("160deg");
    expect(div.style.background).toContain("linear-gradient");
  });

  it("renders gradient for FINISHED status", () => {
    const { container } = render(<CoverPlaceholder status="FINISHED" />);
    const div = container.firstChild as HTMLElement;
    expect(div.style.background).toContain("160deg");
    expect(div.style.background).toContain("linear-gradient");
  });

  it("renders gradient for FFO status", () => {
    const { container } = render(<CoverPlaceholder status="FFO" />);
    const div = container.firstChild as HTMLElement;
    expect(div.style.background).toContain("160deg");
    expect(div.style.background).toContain("linear-gradient");
  });

  it("renders different gradients per status", () => {
    const { container: c1 } = render(<CoverPlaceholder status="UNSTARTED" />);
    const { container: c2 } = render(<CoverPlaceholder status="FFO" />);
    const bg1 = (c1.firstChild as HTMLElement).style.background;
    const bg2 = (c2.firstChild as HTMLElement).style.background;
    expect(bg1).not.toEqual(bg2);
  });

  it("renders correct gradient for all 7 statuses", () => {
    const statuses: ProjectStatus[] = [
      "UNSTARTED",
      "KITTING",
      "KITTED",
      "IN_PROGRESS",
      "ON_HOLD",
      "FINISHED",
      "FFO",
    ];
    const backgrounds = new Set<string>();
    for (const status of statuses) {
      const { container } = render(<CoverPlaceholder status={status} />);
      const div = container.firstChild as HTMLElement;
      expect(div.style.background).toContain("160deg");
      backgrounds.add(div.style.background);
    }
    // All 7 statuses should produce different gradients
    expect(backgrounds.size).toBe(7);
  });

  it("contains flex centering classes", () => {
    const { container } = render(<CoverPlaceholder status="KITTING" />);
    const div = container.firstChild as HTMLElement;
    expect(div.className).toContain("flex");
    expect(div.className).toContain("items-center");
    expect(div.className).toContain("justify-center");
  });
});

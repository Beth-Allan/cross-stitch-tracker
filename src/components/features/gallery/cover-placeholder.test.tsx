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

  it("renders gradient classes for UNSTARTED status", () => {
    const { container } = render(<CoverPlaceholder status="UNSTARTED" />);
    const div = container.firstChild as HTMLElement;
    expect(div.className).toContain("bg-gradient-to-br");
    expect(div.className).toContain("from-stone-200");
  });

  it("renders gradient classes for IN_PROGRESS status", () => {
    const { container } = render(<CoverPlaceholder status="IN_PROGRESS" />);
    const div = container.firstChild as HTMLElement;
    expect(div.className).toContain("bg-gradient-to-br");
    expect(div.className).toContain("from-sky-100");
  });

  it("renders gradient classes for FINISHED status", () => {
    const { container } = render(<CoverPlaceholder status="FINISHED" />);
    const div = container.firstChild as HTMLElement;
    expect(div.className).toContain("bg-gradient-to-br");
    expect(div.className).toContain("from-violet-100");
  });

  it("renders gradient classes for FFO status", () => {
    const { container } = render(<CoverPlaceholder status="FFO" />);
    const div = container.firstChild as HTMLElement;
    expect(div.className).toContain("bg-gradient-to-br");
    expect(div.className).toContain("from-rose-100");
  });

  it("renders different gradient classes per status", () => {
    const { container: c1 } = render(<CoverPlaceholder status="UNSTARTED" />);
    const { container: c2 } = render(<CoverPlaceholder status="FFO" />);
    const cls1 = (c1.firstChild as HTMLElement).className;
    const cls2 = (c2.firstChild as HTMLElement).className;
    expect(cls1).not.toEqual(cls2);
  });

  it("renders gradient classes for all 7 statuses", () => {
    const statuses: ProjectStatus[] = [
      "UNSTARTED",
      "KITTING",
      "KITTED",
      "IN_PROGRESS",
      "ON_HOLD",
      "FINISHED",
      "FFO",
    ];
    const classNames = new Set<string>();
    for (const status of statuses) {
      const { container } = render(<CoverPlaceholder status={status} />);
      const div = container.firstChild as HTMLElement;
      expect(div.className).toContain("bg-gradient-to-br");
      classNames.add(div.className);
    }
    // All 7 statuses should produce different gradient classes
    expect(classNames.size).toBe(7);
  });

  it("contains flex centering classes", () => {
    const { container } = render(<CoverPlaceholder status="KITTING" />);
    const div = container.firstChild as HTMLElement;
    expect(div.className).toContain("flex");
    expect(div.className).toContain("items-center");
    expect(div.className).toContain("justify-center");
  });
});

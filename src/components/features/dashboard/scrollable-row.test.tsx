import { render, screen } from "@/__tests__/test-utils";
import { describe, expect, it } from "vitest";
import { ScrollableRow } from "./scrollable-row";

describe("ScrollableRow", () => {
  it("renders children", () => {
    render(
      <ScrollableRow>
        <div>Card 1</div>
        <div>Card 2</div>
      </ScrollableRow>,
    );
    expect(screen.getByText("Card 1")).toBeInTheDocument();
    expect(screen.getByText("Card 2")).toBeInTheDocument();
  });

  it("renders arrow buttons with correct aria-labels", () => {
    render(
      <ScrollableRow>
        <div>Card 1</div>
      </ScrollableRow>,
    );
    expect(screen.getByLabelText("Scroll left")).toBeInTheDocument();
    expect(screen.getByLabelText("Scroll right")).toBeInTheDocument();
  });

  it("scroll buttons have 44px minimum touch target (h-11 w-11)", () => {
    render(
      <ScrollableRow>
        <div>Card 1</div>
      </ScrollableRow>,
    );
    const leftBtn = screen.getByLabelText("Scroll left");
    expect(leftBtn.className).toContain("h-11");
    expect(leftBtn.className).toContain("w-11");
  });

  it("scroll buttons have focus-visible ring styles", () => {
    render(
      <ScrollableRow>
        <div>Card 1</div>
      </ScrollableRow>,
    );
    const leftBtn = screen.getByLabelText("Scroll left");
    expect(leftBtn.className).toContain("focus-visible:ring-ring");
    expect(leftBtn.className).toContain("focus-visible:ring-2");
  });
});

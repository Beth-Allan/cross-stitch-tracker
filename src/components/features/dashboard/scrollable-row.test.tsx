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
});

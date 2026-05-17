import { render, screen } from "@/__tests__/test-utils";
import { describe, it, expect } from "vitest";

import { RankedList } from "./ranked-list";
import type { RankedItem } from "./ranked-list";

const mockDesignerItems: RankedItem[] = [
  { id: "d1", name: "Shannon Christine", count: 12, href: "/designers/d1" },
  { id: "d2", name: "Tiny Modernist", count: 8, href: "/designers/d2" },
  { id: "d3", name: "Long Dog Samplers", count: 5, href: "/designers/d3" },
];

const mockPlainItems: RankedItem[] = [
  { id: "g1", name: "Fantasy", count: 15 },
  { id: "g2", name: "Sampler", count: 10 },
];

describe("RankedList", () => {
  it("renders numbered items with correct rank", () => {
    render(<RankedList items={mockDesignerItems} label="Top Designers" />);

    expect(screen.getByText("1.")).toBeInTheDocument();
    expect(screen.getByText("2.")).toBeInTheDocument();
    expect(screen.getByText("3.")).toBeInTheDocument();
  });

  it("renders item names as Link elements when href is provided", () => {
    render(<RankedList items={mockDesignerItems} label="Top Designers" />);

    const link1 = screen.getByRole("link", { name: "Shannon Christine" });
    expect(link1).toHaveAttribute("href", "/designers/d1");

    const link2 = screen.getByRole("link", { name: "Tiny Modernist" });
    expect(link2).toHaveAttribute("href", "/designers/d2");
  });

  it("renders item names as plain text when href is not provided", () => {
    render(<RankedList items={mockPlainItems} label="Genres" />);

    expect(screen.getByText("Fantasy")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Fantasy" })).not.toBeInTheDocument();
  });

  it("renders count values with font-mono tabular-nums", () => {
    const { container } = render(
      <RankedList items={mockDesignerItems} label="Top Designers" />,
    );

    // Find count elements - they contain the numeric values
    const countElements = container.querySelectorAll(".font-mono.tabular-nums");
    // Should include rank numbers + count values
    expect(countElements.length).toBeGreaterThanOrEqual(mockDesignerItems.length);
  });

  it("renders sr-only heading with provided label", () => {
    render(<RankedList items={mockDesignerItems} label="Top Designers by Chart Count" />);

    const heading = screen.getByRole("heading", { level: 4 });
    expect(heading).toHaveTextContent("Top Designers by Chart Count");
    expect(heading).toHaveClass("sr-only");
  });

  it("renders empty state gracefully with no items", () => {
    const { container } = render(<RankedList items={[]} label="Empty List" />);

    // Should render the container without errors
    expect(container.firstChild).toBeInTheDocument();
    // No rank numbers or links rendered
    expect(screen.queryByText("1.")).not.toBeInTheDocument();
  });
});

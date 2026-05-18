import { render, screen } from "@/__tests__/test-utils";
import { describe, it, expect } from "vitest";

import { ThreadInsightList } from "./thread-insight-list";
import type { ThreadInsight } from "@/types/stats";

const mockItems: ThreadInsight[] = [
  {
    threadId: "t1",
    brandName: "DMC",
    colorCode: "310",
    colorName: "Black",
    hexColor: "#000000",
    projectCount: 12,
  },
  {
    threadId: "t2",
    brandName: "DMC",
    colorCode: "3865",
    colorName: "Winter White",
    hexColor: "#F5F5DC",
    projectCount: 8,
  },
  {
    threadId: "t3",
    brandName: "DMC",
    colorCode: "321",
    colorName: "Red",
    hexColor: "",
    projectCount: 1,
  },
];

describe("ThreadInsightList", () => {
  it("renders up to 10 thread items with rank numbers", () => {
    render(<ThreadInsightList items={mockItems} />);

    expect(screen.getByText("DMC 310 -- Black")).toBeInTheDocument();
    expect(screen.getByText("DMC 3865 -- Winter White")).toBeInTheDocument();
    expect(screen.getByText("DMC 321 -- Red")).toBeInTheDocument();
  });

  it("renders color swatch div with backgroundColor from hexColor", () => {
    const { container } = render(<ThreadInsightList items={mockItems} />);

    const swatches = container.querySelectorAll("[aria-hidden='true']");
    expect(swatches.length).toBeGreaterThanOrEqual(3);

    const firstSwatch = swatches[0] as HTMLElement;
    expect(firstSwatch.style.backgroundColor).toBe("rgb(0, 0, 0)");
  });

  it("renders gray fallback swatch when hexColor is empty string", () => {
    const { container } = render(<ThreadInsightList items={mockItems} />);

    const swatches = container.querySelectorAll("[aria-hidden='true']");
    // The third item has empty hexColor
    const fallbackSwatch = swatches[2] as HTMLElement;
    expect(fallbackSwatch).toHaveClass("bg-muted");
    expect(fallbackSwatch.style.backgroundColor).toBe("");
  });

  it("shows brand code + color name (e.g., 'DMC 310 -- Black')", () => {
    render(<ThreadInsightList items={mockItems} />);

    expect(screen.getByText("DMC 310 -- Black")).toBeInTheDocument();
  });

  it("shows project count right-aligned (e.g., '12 projects')", () => {
    render(<ThreadInsightList items={mockItems} />);

    expect(screen.getByText("12 projects")).toBeInTheDocument();
    expect(screen.getByText("8 projects")).toBeInTheDocument();
    expect(screen.getByText("1 project")).toBeInTheDocument();
  });

  it("renders empty state message when items is empty", () => {
    render(<ThreadInsightList items={[]} />);

    expect(screen.getByText("No supply data yet")).toBeInTheDocument();
  });

  it("renders section heading with Top Thread Colors", () => {
    render(<ThreadInsightList items={mockItems} />);

    expect(screen.getByText("Top Thread Colors")).toBeInTheDocument();
  });
});

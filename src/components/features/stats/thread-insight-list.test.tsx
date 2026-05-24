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
    totalStitches: 4500,
  },
  {
    threadId: "t2",
    brandName: "DMC",
    colorCode: "3865",
    colorName: "Winter White",
    hexColor: "#F5F5DC",
    projectCount: 8,
    totalStitches: 2100,
  },
  {
    threadId: "t3",
    brandName: "DMC",
    colorCode: "321",
    colorName: "Red",
    hexColor: "",
    projectCount: 1,
    totalStitches: 0,
  },
];

describe("ThreadInsightList", () => {
  it("renders up to 10 thread items with rank numbers", () => {
    render(<ThreadInsightList items={mockItems} />);

    expect(screen.getByText("DMC 310")).toBeInTheDocument();
    expect(screen.getByText("DMC 3865")).toBeInTheDocument();
    expect(screen.getByText("DMC 321")).toBeInTheDocument();
  });

  it("renders color swatch div with backgroundColor from hexColor", () => {
    const singleItem: ThreadInsight[] = [
      {
        threadId: "t1",
        brandName: "DMC",
        colorCode: "310",
        colorName: "Black",
        hexColor: "#000000",
        projectCount: 12,
        totalStitches: 4500,
      },
    ];
    const { container } = render(<ThreadInsightList items={singleItem} />);

    // Swatch with hex gets inline style, no bg-muted class
    const swatches = container.querySelectorAll("div[aria-hidden]");
    expect(swatches).toHaveLength(1);
    const swatch = swatches[0] as HTMLElement;
    expect(swatch.className).not.toContain("bg-muted");
  });

  it("renders gray fallback swatch when hexColor is empty string", () => {
    const fallbackItem: ThreadInsight[] = [
      {
        threadId: "t3",
        brandName: "DMC",
        colorCode: "321",
        colorName: "Red",
        hexColor: "",
        projectCount: 1,
        totalStitches: 0,
      },
    ];
    const { container } = render(<ThreadInsightList items={fallbackItem} />);

    // Fallback swatch uses bg-muted class
    const swatches = container.querySelectorAll("div[aria-hidden]");
    expect(swatches).toHaveLength(1);
    const swatch = swatches[0] as HTMLElement;
    expect(swatch.className).toContain("bg-muted");
  });

  it("shows brand and code (e.g., 'DMC 310')", () => {
    render(<ThreadInsightList items={mockItems} />);

    expect(screen.getByText("DMC 310")).toBeInTheDocument();
  });

  it("shows project count and stitch estimate right-aligned", () => {
    render(<ThreadInsightList items={mockItems} />);

    expect(screen.getByText(/12 projects/)).toBeInTheDocument();
    expect(screen.getByText(/4,500 stitches/)).toBeInTheDocument();
    expect(screen.getByText(/8 projects/)).toBeInTheDocument();
    expect(screen.getByText(/1 project/)).toBeInTheDocument();
  });

  it("renders empty state message when items is empty", () => {
    render(<ThreadInsightList items={[]} />);

    expect(screen.getByText("No supply data yet")).toBeInTheDocument();
  });

  it("renders section heading with Top Thread Colors", () => {
    render(<ThreadInsightList items={mockItems} />);

    expect(screen.getByText("Top Thread Colors")).toBeInTheDocument();
  });

  describe("Rank numbers (UX-12)", () => {
    it("first thread insight item shows rank number '1.'", () => {
      render(<ThreadInsightList items={mockItems} />);
      expect(screen.getByText("1.")).toBeInTheDocument();
    });

    it("third thread insight item shows rank number '3.'", () => {
      render(<ThreadInsightList items={mockItems} />);
      expect(screen.getByText("3.")).toBeInTheDocument();
    });

    it("rank number has text-muted-foreground and font-mono classes", () => {
      render(<ThreadInsightList items={mockItems} />);
      const rank = screen.getByText("1.");
      expect(rank.className).toContain("text-muted-foreground");
      expect(rank.className).toContain("font-mono");
    });
  });
});

import { render, screen } from "@/__tests__/test-utils";
import { describe, it, expect } from "vitest";

import { DesignerInsightList } from "./designer-insight-list";
import type { DesignerInsight } from "@/types/stats";

const mockItems: DesignerInsight[] = [
  {
    designerId: "d1",
    name: "Shannon Christine",
    totalProjects: 17,
    completedProjects: 14,
    completionRate: 82.35,
  },
  {
    designerId: "d2",
    name: "Tiny Modernist",
    totalProjects: 10,
    completedProjects: 5,
    completionRate: 50,
  },
  {
    designerId: "d3",
    name: "Long Dog Samplers",
    totalProjects: 3,
    completedProjects: 0,
    completionRate: 0,
  },
];

describe("DesignerInsightList", () => {
  it("renders designers with rank numbers and completion rate", () => {
    render(<DesignerInsightList items={mockItems} />);

    expect(screen.getByText("1.")).toBeInTheDocument();
    expect(screen.getByText("2.")).toBeInTheDocument();
    expect(screen.getByText("3.")).toBeInTheDocument();
  });

  it("renders designer name as a Link to /designers/{designerId}", () => {
    render(<DesignerInsightList items={mockItems} />);

    const link1 = screen.getByRole("link", { name: "Shannon Christine" });
    expect(link1).toHaveAttribute("href", "/designers/d1");

    const link2 = screen.getByRole("link", { name: "Tiny Modernist" });
    expect(link2).toHaveAttribute("href", "/designers/d2");
  });

  it("shows percentage and fraction (e.g., '82%' and '(14/17)')", () => {
    render(<DesignerInsightList items={mockItems} />);

    expect(screen.getByText("82%")).toBeInTheDocument();
    expect(screen.getByText("(14/17)")).toBeInTheDocument();
  });

  it("renders empty state when items is empty", () => {
    render(<DesignerInsightList items={[]} />);

    expect(screen.getByText("No supply data yet")).toBeInTheDocument();
  });

  it("renders section heading with Designer Completion", () => {
    render(<DesignerInsightList items={mockItems} />);

    expect(screen.getByText("Designer Completion")).toBeInTheDocument();
  });
});

import { render, screen } from "@/__tests__/test-utils";
import { describe, it, expect } from "vitest";

import { GenreInsightList } from "./genre-insight-list";
import type { GenreInsight } from "@/types/stats";

const mockItems: GenreInsight[] = [
  {
    genreId: "g1",
    name: "Fantasy",
    totalStitches: 245000,
  },
  {
    genreId: "g2",
    name: "Sampler",
    totalStitches: 180500,
  },
  {
    genreId: "g3",
    name: "Nature",
    totalStitches: 95000,
  },
];

describe("GenreInsightList", () => {
  it("renders genres with rank numbers and stitch counts", () => {
    render(<GenreInsightList items={mockItems} />);

    expect(screen.getByText("1.")).toBeInTheDocument();
    expect(screen.getByText("2.")).toBeInTheDocument();
    expect(screen.getByText("3.")).toBeInTheDocument();
  });

  it("renders genre name as a Link to /genres/{genreId}", () => {
    render(<GenreInsightList items={mockItems} />);

    const link1 = screen.getByRole("link", { name: "Fantasy" });
    expect(link1).toHaveAttribute("href", "/genres/g1");

    const link2 = screen.getByRole("link", { name: "Sampler" });
    expect(link2).toHaveAttribute("href", "/genres/g2");
  });

  it("shows stitch count formatted with toLocaleString()", () => {
    render(<GenreInsightList items={mockItems} />);

    expect(screen.getByText("245,000 stitches")).toBeInTheDocument();
    expect(screen.getByText("180,500 stitches")).toBeInTheDocument();
    expect(screen.getByText("95,000 stitches")).toBeInTheDocument();
  });

  it("renders empty state when items is empty", () => {
    render(<GenreInsightList items={[]} />);

    expect(screen.getByText("No supply data yet")).toBeInTheDocument();
  });

  it("renders section heading with Most Stitched Genres", () => {
    render(<GenreInsightList items={mockItems} />);

    expect(screen.getByText("Most Stitched Genres")).toBeInTheDocument();
  });
});

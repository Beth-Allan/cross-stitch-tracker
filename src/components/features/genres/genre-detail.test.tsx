import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@/__tests__/test-utils";
import { GenreDetail } from "./genre-detail";
import { createMockGenreChart } from "@/__tests__/mocks";
import type { GenreDetail as GenreDetailType } from "@/types/genre";

const mockDeleteGenre = vi.fn();
const mockUpdateGenre = vi.fn();
vi.mock("@/lib/actions/genre-actions", () => ({
  deleteGenre: (...args: unknown[]) => mockDeleteGenre(...args),
  updateGenre: (...args: unknown[]) => mockUpdateGenre(...args),
  createGenre: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

function createGenreDetail(
  overrides?: Partial<GenreDetailType>,
): GenreDetailType {
  return {
    id: "g1",
    name: "Fantasy",
    chartCount: 3,
    charts: [
      createMockGenreChart({
        id: "c1",
        name: "Dragon's Lair",
        stitchCount: 25000,
        stitchesWide: 200,
        stitchesHigh: 150,
        status: "IN_PROGRESS",
        stitchesCompleted: 10000,
      }),
      createMockGenreChart({
        id: "c2",
        name: "Fairy Forest",
        stitchCount: 12000,
        stitchesWide: 150,
        stitchesHigh: 100,
        status: "FINISHED",
        stitchesCompleted: 12000,
      }),
      createMockGenreChart({
        id: "c3",
        name: "Unicorn Meadow",
        stitchCount: 5000,
        stitchesWide: 80,
        stitchesHigh: 60,
        status: null,
        stitchesCompleted: 0,
      }),
    ],
    ...overrides,
  };
}

describe("GenreDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders genre name as h1", () => {
    render(<GenreDetail genre={createGenreDetail()} />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("Fantasy");
  });

  it("renders chart count stat", () => {
    render(<GenreDetail genre={createGenreDetail()} />);
    expect(screen.getByText("Charts")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("renders chart list with chart names linking to /charts/[id]", () => {
    render(<GenreDetail genre={createGenreDetail()} />);

    const dragonLink = screen.getByRole("link", { name: /dragon's lair/i });
    expect(dragonLink).toHaveAttribute("href", "/charts/c1");

    const fairyLink = screen.getByRole("link", { name: /fairy forest/i });
    expect(fairyLink).toHaveAttribute("href", "/charts/c2");

    const unicornLink = screen.getByRole("link", {
      name: /unicorn meadow/i,
    });
    expect(unicornLink).toHaveAttribute("href", "/charts/c3");
  });

  it('shows "No charts tagged with this genre" when charts array is empty', () => {
    render(
      <GenreDetail
        genre={createGenreDetail({ charts: [], chartCount: 0 })}
      />,
    );
    expect(
      screen.getByText("No charts tagged with this genre"),
    ).toBeInTheDocument();
  });

  it("edit button is present with aria-label", () => {
    render(<GenreDetail genre={createGenreDetail()} />);
    expect(screen.getByLabelText("Edit Fantasy")).toBeInTheDocument();
  });

  it("delete button is present with aria-label", () => {
    render(<GenreDetail genre={createGenreDetail()} />);
    expect(screen.getByLabelText("Delete Fantasy")).toBeInTheDocument();
  });

  it("does NOT contain website or notes fields", () => {
    const { container } = render(
      <GenreDetail genre={createGenreDetail()} />,
    );
    expect(container.textContent).not.toMatch(/website/i);
    expect(container.textContent).not.toMatch(/notes/i);
  });

  it("renders Back to Genres link", () => {
    render(<GenreDetail genre={createGenreDetail()} />);
    const backLink = screen.getByRole("link", {
      name: /back to genres/i,
    });
    expect(backLink).toHaveAttribute("href", "/genres");
  });
});

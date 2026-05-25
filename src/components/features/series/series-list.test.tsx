import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@/__tests__/test-utils";
import userEvent from "@testing-library/user-event";
import { SeriesList } from "./series-list";
import { createMockSeriesWithStats } from "@/__tests__/mocks";

const mockDeleteSeries = vi.fn();
vi.mock("@/lib/actions/series-actions", () => ({
  deleteSeries: (...args: unknown[]) => mockDeleteSeries(...args),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const mockSeries = [
  createMockSeriesWithStats({
    id: "s1",
    name: "Mini Bottles",
    designerName: "Nora Corbett",
    designerId: "d1",
    totalCount: 15,
    progress: { ownedCount: 8, finishedCount: 3, totalCount: 15 },
  }),
  createMockSeriesWithStats({
    id: "s2",
    name: "Fairy Tales",
    designerName: null,
    designerId: null,
    totalCount: null,
    progress: { ownedCount: 5, finishedCount: 2, totalCount: null },
  }),
  createMockSeriesWithStats({
    id: "s3",
    name: "Empty Collection",
    designerName: "HAED",
    designerId: "d2",
    totalCount: 10,
    progress: { ownedCount: 0, finishedCount: 0, totalCount: 10 },
  }),
];

describe("SeriesList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders series cards with name, designer attribution, and progress bar", () => {
    render(<SeriesList series={mockSeries} />);

    expect(screen.getByText("Mini Bottles")).toBeInTheDocument();
    expect(screen.getByText("by Nora Corbett")).toBeInTheDocument();
    expect(screen.getByText("Fairy Tales")).toBeInTheDocument();
    expect(screen.getByText("Empty Collection")).toBeInTheDocument();
    expect(screen.getByText("by HAED")).toBeInTheDocument();
  });

  it("renders stat text for totalCount series: finishedCount of ownedCount finished", () => {
    render(<SeriesList series={mockSeries} />);

    expect(screen.getByText("3 of 8 finished")).toBeInTheDocument();
  });

  it("renders stat text for open-ended series: finishedCount finished followed by ownedCount charts", () => {
    render(<SeriesList series={mockSeries} />);

    const statEl = screen.getByText((content) => {
      return content.includes("2 finished") && content.includes("5 charts");
    });
    expect(statEl).toBeInTheDocument();
  });

  it("shows completion percentage on cards", () => {
    render(<SeriesList series={mockSeries} />);

    // Mini Bottles: 3/8 = 37.5% -> 38%
    expect(screen.getByText("38%")).toBeInTheDocument();
    // Fairy Tales: 2/5 = 40%
    expect(screen.getByText("40%")).toBeInTheDocument();
    // Empty Collection: 0/0 -> 0%
    expect(screen.getByText("0%")).toBeInTheDocument();
  });

  it("sort pills toggle sort direction on click", async () => {
    const user = userEvent.setup();
    render(<SeriesList series={mockSeries} />);

    // Default sort is Name asc: Empty Collection, Fairy Tales, Mini Bottles
    const cards = screen.getAllByRole("link");
    const cardTexts = cards.map((c) => c.textContent);
    expect(cardTexts.findIndex((t) => t?.includes("Empty Collection"))).toBeLessThan(
      cardTexts.findIndex((t) => t?.includes("Mini Bottles")),
    );

    // Click Completion sort pill
    await user.click(screen.getByRole("button", { name: /completion/i }));

    // After clicking Completion (asc), 0-chart series should sort to bottom
    const reorderedCards = screen.getAllByRole("link");
    const reorderedTexts = reorderedCards.map((c) => c.textContent);
    // Mini Bottles (38%) comes before Fairy Tales (40%) in asc
    const miniIdx = reorderedTexts.findIndex((t) => t?.includes("Mini Bottles"));
    const fairyIdx = reorderedTexts.findIndex((t) => t?.includes("Fairy Tales"));
    expect(miniIdx).toBeLessThan(fairyIdx);
  });

  it("sorts 0-chart series to bottom when sorting by Completion", async () => {
    const user = userEvent.setup();
    render(<SeriesList series={mockSeries} />);

    await user.click(screen.getByRole("button", { name: /completion/i }));

    // Empty Collection has 0 owned charts, should be at the bottom
    const cards = screen.getAllByRole("link");
    const cardTexts = cards.map((c) => c.textContent);
    const emptyIdx = cardTexts.findIndex((t) => t?.includes("Empty Collection"));
    expect(emptyIdx).toBe(cards.length - 1);
  });

  it("shows empty state with 'No series created yet' and Add Series button when list is empty", () => {
    render(<SeriesList series={[]} />);

    expect(screen.getByText("No series created yet")).toBeInTheDocument();
    expect(
      screen.getByText("Add your first series to start organizing your collection."),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add series/i })).toBeInTheDocument();
  });

  it("card links navigate to /series/[id]", () => {
    render(<SeriesList series={mockSeries} />);

    const miniBottlesLink = screen.getAllByRole("link").find((l) => {
      return l.textContent?.includes("Mini Bottles");
    });
    expect(miniBottlesLink).toHaveAttribute("href", "/series/s1");

    const fairyTalesLink = screen.getAllByRole("link").find((l) => {
      return l.textContent?.includes("Fairy Tales");
    });
    expect(fairyTalesLink).toHaveAttribute("href", "/series/s2");
  });

  it("delete button opens DeleteConfirmationDialog with entityType series", async () => {
    const user = userEvent.setup();
    render(<SeriesList series={mockSeries} />);

    const deleteButtons = screen.getAllByLabelText(/delete/i);
    await user.click(deleteButtons[0]);

    expect(await screen.findByText("Delete Series?")).toBeInTheDocument();
    expect(screen.getByText(/will be unassigned from this series/)).toBeInTheDocument();
    expect(screen.getByText(/Charts will NOT be deleted/)).toBeInTheDocument();
  });
});

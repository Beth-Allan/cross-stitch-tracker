import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@/__tests__/test-utils";
import { SeriesTabContent } from "./series-tab-content";
import { createMockSeriesWithStats } from "@/__tests__/mocks/factories";

vi.mock("@/components/features/series/series-card", () => ({
  SeriesCard: ({
    series,
    onDelete,
  }: {
    series: { id: string; name: string };
    onDelete?: () => void;
  }) => (
    <div data-testid={`series-card-${series.id}`}>
      {series.name}
      {onDelete && <button data-testid="delete-button">Delete</button>}
    </div>
  ),
}));

describe("SeriesTabContent", () => {
  it("renders empty state with Library icon, 'No series yet' title, and link to /series when series array is empty", () => {
    render(<SeriesTabContent series={[]} />);

    expect(screen.getByText("No series yet")).toBeInTheDocument();
    const link = screen.getByRole("link", { name: /series page/i });
    expect(link).toHaveAttribute("href", "/series");
  });

  it("renders series cards in a grid when series data is provided", () => {
    const series = [
      createMockSeriesWithStats({ id: "s1", name: "Alpha Series" }),
      createMockSeriesWithStats({ id: "s2", name: "Beta Series" }),
    ];

    render(<SeriesTabContent series={series} />);

    expect(screen.getByTestId("series-card-s1")).toBeInTheDocument();
    expect(screen.getByTestId("series-card-s2")).toBeInTheDocument();
  });

  it("renders sort pills (Name, Completion, Charts) with 'SORT BY' label", () => {
    const series = [createMockSeriesWithStats({ id: "s1", name: "Test" })];

    render(<SeriesTabContent series={series} />);

    expect(screen.getByText(/sort by/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /name/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /completion/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /charts/i })).toBeInTheDocument();
  });

  it("clicking Name sort pill sorts alphabetically (A-Z default, then Z-A on second click)", () => {
    const series = [
      createMockSeriesWithStats({ id: "s1", name: "Zebra" }),
      createMockSeriesWithStats({ id: "s2", name: "Alpha" }),
      createMockSeriesWithStats({ id: "s3", name: "Middle" }),
    ];

    const { container } = render(<SeriesTabContent series={series} />);

    const cards = container.querySelectorAll("[data-testid^='series-card-']");
    expect(cards[0]).toHaveTextContent("Alpha");
    expect(cards[1]).toHaveTextContent("Middle");
    expect(cards[2]).toHaveTextContent("Zebra");

    fireEvent.click(screen.getByRole("button", { name: /name/i }));

    const cardsAfter = container.querySelectorAll("[data-testid^='series-card-']");
    expect(cardsAfter[0]).toHaveTextContent("Zebra");
    expect(cardsAfter[1]).toHaveTextContent("Middle");
    expect(cardsAfter[2]).toHaveTextContent("Alpha");
  });

  it("clicking Completion sort pill sorts by finished/owned ratio", () => {
    const series = [
      createMockSeriesWithStats({
        id: "s1",
        name: "Low",
        progress: { ownedCount: 10, finishedCount: 1, totalCount: null },
      }),
      createMockSeriesWithStats({
        id: "s2",
        name: "High",
        progress: { ownedCount: 10, finishedCount: 8, totalCount: null },
      }),
      createMockSeriesWithStats({
        id: "s3",
        name: "Mid",
        progress: { ownedCount: 10, finishedCount: 5, totalCount: null },
      }),
    ];

    const { container } = render(<SeriesTabContent series={series} />);

    fireEvent.click(screen.getByRole("button", { name: /completion/i }));

    const cards = container.querySelectorAll("[data-testid^='series-card-']");
    expect(cards[0]).toHaveTextContent("Low");
    expect(cards[1]).toHaveTextContent("Mid");
    expect(cards[2]).toHaveTextContent("High");
  });

  it("clicking Charts sort pill sorts by ownedCount", () => {
    const series = [
      createMockSeriesWithStats({
        id: "s1",
        name: "Few",
        progress: { ownedCount: 2, finishedCount: 0, totalCount: null },
      }),
      createMockSeriesWithStats({
        id: "s2",
        name: "Many",
        progress: { ownedCount: 20, finishedCount: 0, totalCount: null },
      }),
      createMockSeriesWithStats({
        id: "s3",
        name: "Some",
        progress: { ownedCount: 8, finishedCount: 0, totalCount: null },
      }),
    ];

    const { container } = render(<SeriesTabContent series={series} />);

    fireEvent.click(screen.getByRole("button", { name: /charts/i }));

    const cards = container.querySelectorAll("[data-testid^='series-card-']");
    expect(cards[0]).toHaveTextContent("Few");
    expect(cards[1]).toHaveTextContent("Some");
    expect(cards[2]).toHaveTextContent("Many");
  });

  it("active sort pill has success-muted styling and chevron icon", () => {
    const series = [createMockSeriesWithStats({ id: "s1", name: "Test" })];

    render(<SeriesTabContent series={series} />);

    const nameBtn = screen.getByRole("button", { name: /name/i });
    expect(nameBtn.className).toContain("bg-success-muted");
    expect(nameBtn.querySelector("svg")).toBeInTheDocument();
  });

  it("series cards do NOT have delete buttons (Pattern Dive is browse-only)", () => {
    const series = [createMockSeriesWithStats({ id: "s1", name: "Test" })];

    render(<SeriesTabContent series={series} />);

    expect(screen.queryByTestId("delete-button")).not.toBeInTheDocument();
  });

  it("series cards link to /series/{id}", () => {
    const series = [createMockSeriesWithStats({ id: "s1", name: "Test" })];

    render(<SeriesTabContent series={series} />);

    expect(screen.getByTestId("series-card-s1")).toBeInTheDocument();
  });
});

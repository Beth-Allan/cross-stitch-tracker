import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@/__tests__/test-utils";
import { SeriesCard, getCompletionPercent } from "./series-card";
import { createMockSeriesWithStats } from "@/__tests__/mocks";

describe("SeriesCard", () => {
  it("renders series name and designer name", () => {
    const series = createMockSeriesWithStats({
      name: "Mini Bottles",
      designerName: "Nora Corbett",
    });
    render(<SeriesCard series={series} />);

    expect(screen.getByText("Mini Bottles")).toBeInTheDocument();
    expect(screen.getByText("by Nora Corbett")).toBeInTheDocument();
  });

  it("renders progress bar with correct width percentage", () => {
    const series = createMockSeriesWithStats({
      progress: { ownedCount: 8, finishedCount: 3, totalCount: 15 },
    });
    render(<SeriesCard series={series} />);

    const progressBar = document.querySelector("[style]");
    expect(progressBar).toHaveStyle({ width: "38%" });
  });

  it("renders stats row with 'X of Y finished' when totalCount is set", () => {
    const series = createMockSeriesWithStats({
      totalCount: 15,
      progress: { ownedCount: 8, finishedCount: 3, totalCount: 15 },
    });
    render(<SeriesCard series={series} />);

    expect(screen.getByText("3 of 8 finished")).toBeInTheDocument();
  });

  it("renders stats row with 'X finished . Y charts' when totalCount is null", () => {
    const series = createMockSeriesWithStats({
      totalCount: null,
      progress: { ownedCount: 5, finishedCount: 2, totalCount: null },
    });
    render(<SeriesCard series={series} />);

    const statEl = screen.getByText((content) => {
      return content.includes("2 finished") && content.includes("5 charts");
    });
    expect(statEl).toBeInTheDocument();
  });

  it("renders as a Link to /series/{id}", () => {
    const series = createMockSeriesWithStats({ id: "s1" });
    render(<SeriesCard series={series} />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/series/s1");
  });

  it("renders delete button when onDelete is provided", () => {
    const series = createMockSeriesWithStats({ name: "My Series" });
    render(<SeriesCard series={series} onDelete={vi.fn()} />);

    expect(screen.getByLabelText("Delete My Series")).toBeInTheDocument();
  });

  it("does NOT render delete button when onDelete is omitted", () => {
    const series = createMockSeriesWithStats({ name: "My Series" });
    render(<SeriesCard series={series} />);

    expect(screen.queryByLabelText("Delete My Series")).not.toBeInTheDocument();
  });

  it("delete button calls onDelete and stops event propagation", () => {
    const onDelete = vi.fn();
    const series = createMockSeriesWithStats({ name: "My Series" });
    render(<SeriesCard series={series} onDelete={onDelete} />);

    const deleteBtn = screen.getByLabelText("Delete My Series");
    fireEvent.click(deleteBtn);

    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});

describe("getCompletionPercent", () => {
  it("returns 0 when ownedCount is 0", () => {
    const series = createMockSeriesWithStats({
      progress: { ownedCount: 0, finishedCount: 0, totalCount: null },
    });
    expect(getCompletionPercent(series)).toBe(0);
  });

  it("returns correct rounded percentage", () => {
    const series = createMockSeriesWithStats({
      progress: { ownedCount: 8, finishedCount: 3, totalCount: 15 },
    });
    expect(getCompletionPercent(series)).toBe(38);
  });
});

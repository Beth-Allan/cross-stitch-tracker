import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, within } from "@/__tests__/test-utils";
import userEvent from "@testing-library/user-event";
import { SeriesDetail } from "./series-detail";
import { createMockSeriesWithStats, createMockSeriesChart } from "@/__tests__/mocks";
import type { SeriesDetail as SeriesDetailType } from "@/types/series";

const mockUpdateSeries = vi.fn();
const mockDeleteSeries = vi.fn();
vi.mock("@/lib/actions/series-actions", () => ({
  updateSeries: (...args: unknown[]) => mockUpdateSeries(...args),
  deleteSeries: (...args: unknown[]) => mockDeleteSeries(...args),
}));

const mockPush = vi.fn();
const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

function createSeriesDetail(overrides?: Partial<SeriesDetailType>): SeriesDetailType {
  return {
    ...createMockSeriesWithStats({
      id: "s1",
      name: "Mirabilia Fairies",
      designerId: "d1",
      designerName: "Nora Corbett",
      notes: "Beautiful fairy designs",
      totalCount: 15,
    }),
    charts: [
      createMockSeriesChart({
        id: "c1",
        name: "Autumn Fairy",
        stitchCount: 15000,
        stitchesWide: 150,
        stitchesHigh: 100,
        status: "IN_PROGRESS",
        stitchesCompleted: 5000,
      }),
      createMockSeriesChart({
        id: "c2",
        name: "Spring Garden",
        stitchCount: 8000,
        stitchesWide: 120,
        stitchesHigh: 80,
        status: "FINISHED",
        stitchesCompleted: 8000,
      }),
      createMockSeriesChart({
        id: "c3",
        name: "Winter Cottage",
        stitchCount: 45000,
        stitchesWide: 300,
        stitchesHigh: 150,
        status: null,
        stitchesCompleted: 0,
      }),
    ],
    progress: { ownedCount: 3, finishedCount: 1, totalCount: 15 },
    ...overrides,
  };
}

const defaultDesigners = [
  { id: "d1", name: "Nora Corbett" },
  { id: "d2", name: "Lavender & Lace" },
];

describe("SeriesDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders series name in heading", () => {
    render(<SeriesDetail series={createSeriesDetail()} designers={defaultDesigners} />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("Mirabilia Fairies");
  });

  it('renders "Back to Series" link pointing to /series', () => {
    render(<SeriesDetail series={createSeriesDetail()} designers={defaultDesigners} />);
    const backLink = screen.getByRole("link", { name: /back to series/i });
    expect(backLink).toHaveAttribute("href", "/series");
  });

  it("renders progress bar and completion text", () => {
    render(<SeriesDetail series={createSeriesDetail()} designers={defaultDesigners} />);
    expect(screen.getByText(/1 of 3 finished/)).toBeInTheDocument();
  });

  it("renders designer name as link to /designers/{id} when designerId is set", () => {
    render(<SeriesDetail series={createSeriesDetail()} designers={defaultDesigners} />);
    const designerLink = screen.getByRole("link", { name: /nora corbett/i });
    expect(designerLink).toHaveAttribute("href", "/designers/d1");
  });

  it("hides designer line when designerId is null", () => {
    render(
      <SeriesDetail
        series={createSeriesDetail({ designerId: null, designerName: null })}
        designers={defaultDesigners}
      />,
    );
    expect(screen.queryByText(/^by /)).not.toBeInTheDocument();
  });

  it("renders chart rows with chart name and stitch count", () => {
    render(<SeriesDetail series={createSeriesDetail()} designers={defaultDesigners} />);
    expect(screen.getByText("Autumn Fairy")).toBeInTheDocument();
    expect(screen.getByText("Spring Garden")).toBeInTheDocument();
    expect(screen.getByText("Winter Cottage")).toBeInTheDocument();
    expect(screen.getByText(/15,000 stitches/)).toBeInTheDocument();
  });

  it("chart rows link to /charts/{chartId}", () => {
    render(<SeriesDetail series={createSeriesDetail()} designers={defaultDesigners} />);
    const autumnLink = screen.getByRole("link", { name: /autumn fairy/i });
    expect(autumnLink).toHaveAttribute("href", "/charts/c1");
    const springLink = screen.getByRole("link", { name: /spring garden/i });
    expect(springLink).toHaveAttribute("href", "/charts/c2");
  });

  it("chart rows show StatusBadge for charts with status", () => {
    render(<SeriesDetail series={createSeriesDetail()} designers={defaultDesigners} />);
    expect(screen.getByText("In Progress")).toBeInTheDocument();
    const finishedElements = screen.getAllByText("Finished");
    expect(finishedElements.length).toBeGreaterThanOrEqual(1);
  });

  it("inline name edit: clicking pencil shows input, Enter saves with updateSeries call", async () => {
    const user = userEvent.setup();
    mockUpdateSeries.mockResolvedValue({ success: true, series: {} });

    render(<SeriesDetail series={createSeriesDetail()} designers={defaultDesigners} />);

    await user.click(screen.getByLabelText("Edit series name"));

    const input = screen.getByDisplayValue("Mirabilia Fairies");
    await user.clear(input);
    await user.type(input, "Mirabilia Mermaids{Enter}");

    expect(mockUpdateSeries).toHaveBeenCalledWith(
      "s1",
      expect.objectContaining({
        name: "Mirabilia Mermaids",
      }),
    );
  });

  it("inline name edit: Escape cancels without saving", async () => {
    const user = userEvent.setup();

    render(<SeriesDetail series={createSeriesDetail()} designers={defaultDesigners} />);

    await user.click(screen.getByLabelText("Edit series name"));

    const input = screen.getByDisplayValue("Mirabilia Fairies");
    await user.clear(input);
    await user.type(input, "Something Else{Escape}");

    expect(mockUpdateSeries).not.toHaveBeenCalled();
  });

  it("sort pills (Name, Stitches, Status) reorder chart list", async () => {
    const user = userEvent.setup();
    render(<SeriesDetail series={createSeriesDetail()} designers={defaultDesigners} />);

    await user.click(screen.getByRole("button", { name: /^stitches$/i }));

    const chartLinks = screen
      .getAllByRole("link")
      .filter((link) => link.getAttribute("href")?.startsWith("/charts/"));

    expect(chartLinks[0].textContent).toContain("Spring Garden");
    expect(chartLinks[1].textContent).toContain("Autumn Fairy");
    expect(chartLinks[2].textContent).toContain("Winter Cottage");
  });

  it("delete button triggers DeleteConfirmationDialog, confirm calls deleteSeries", async () => {
    const user = userEvent.setup();
    mockDeleteSeries.mockResolvedValue({ success: true });

    render(<SeriesDetail series={createSeriesDetail()} designers={defaultDesigners} />);

    await user.click(screen.getByLabelText("Delete series"));

    expect(screen.getByText("Delete Series?")).toBeInTheDocument();
    expect(screen.getByText(/will be unassigned from this series/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /^delete$/i }));

    expect(mockDeleteSeries).toHaveBeenCalledWith("s1");
  });

  it('empty chart list shows "No charts in this series yet"', () => {
    render(
      <SeriesDetail
        series={createSeriesDetail({
          charts: [],
          progress: { ownedCount: 0, finishedCount: 0, totalCount: 15 },
        })}
        designers={defaultDesigners}
      />,
    );
    expect(screen.getByText("No charts in this series yet")).toBeInTheDocument();
  });

  it('renders "owned" line when totalCount is set', () => {
    render(<SeriesDetail series={createSeriesDetail()} designers={defaultDesigners} />);
    expect(screen.getByText(/3 of 15 owned/)).toBeInTheDocument();
  });
});

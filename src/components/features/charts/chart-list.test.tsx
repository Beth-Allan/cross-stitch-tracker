import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@/__tests__/test-utils";
import { ChartList } from "./chart-list";
import {
  createMockChartWithRelations,
  createMockDesigner,
  createMockGenre,
} from "@/__tests__/mocks";

vi.mock("@/lib/actions/chart-actions", () => ({
  deleteChart: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

// Mock ListRowKebabMenu to avoid testing its internals here (tested in list-row-kebab-menu.test.tsx)
vi.mock("./list-row-kebab-menu", () => ({
  ListRowKebabMenu: ({
    chartId,
    chartName,
  }: {
    chartId: string;
    chartName: string;
  }) => (
    <button aria-label="Project actions" data-testid={`kebab-${chartId}`}>
      {chartName}
    </button>
  ),
}));

const mockDesigners = [
  createMockDesigner({ id: "d1", name: "Heaven and Earth Designs" }),
  createMockDesigner({ id: "d2", name: "Nora Corbett" }),
];

const mockGenres = [
  createMockGenre({ id: "g1", name: "Fantasy" }),
  createMockGenre({ id: "g2", name: "Animals" }),
];

const mockCharts = [
  createMockChartWithRelations({
    id: "c1",
    name: "Dragon Dreams",
    stitchCount: 50000,
    stitchesWide: 200,
    stitchesHigh: 250,
    dateAdded: new Date("2026-01-15"),
    designer: { id: "d1", name: "Heaven and Earth Designs" },
    project: { status: "IN_PROGRESS" },
    genres: [{ id: "g1", name: "Fantasy", createdAt: new Date(), updatedAt: new Date() }],
  }),
  createMockChartWithRelations({
    id: "c2",
    name: "Woodland Fox",
    stitchCount: 5000,
    stitchesWide: 100,
    stitchesHigh: 50,
    dateAdded: new Date("2026-02-20"),
    designer: { id: "d2", name: "Nora Corbett" },
    project: null,
    genres: [{ id: "g2", name: "Animals", createdAt: new Date(), updatedAt: new Date() }],
  }),
];

describe("ChartList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders chart names in a table when charts are provided", () => {
    render(<ChartList charts={mockCharts} designers={mockDesigners} genres={mockGenres} />);

    // Both desktop table and mobile cards render, so use getAllByText
    const dragonNames = screen.getAllByText("Dragon Dreams");
    expect(dragonNames.length).toBeGreaterThanOrEqual(1);

    const foxNames = screen.getAllByText("Woodland Fox");
    expect(foxNames.length).toBeGreaterThanOrEqual(1);
  });

  it("renders empty state when no charts provided (cross-stitch grid + 'Your collection awaits')", () => {
    render(<ChartList charts={[]} designers={mockDesigners} genres={mockGenres} />);

    expect(screen.getByText("Your collection awaits")).toBeInTheDocument();
    expect(screen.getByText(/every great stash starts with one chart/i)).toBeInTheDocument();
  });

  it("renders ListRowKebabMenu per row (not inline Pencil/Trash buttons)", () => {
    render(<ChartList charts={mockCharts} designers={mockDesigners} genres={mockGenres} />);

    // Desktop + mobile both render kebab triggers (mocked as buttons with "Project actions" label)
    const kebabTriggers = screen.getAllByLabelText("Project actions");
    // At least 2 per chart (desktop table row + mobile card) x 2 charts = 4
    expect(kebabTriggers.length).toBeGreaterThanOrEqual(2);
  });

  it("does NOT render ChartEditModal (no 'Edit Chart' dialog title)", () => {
    render(<ChartList charts={mockCharts} designers={mockDesigners} genres={mockGenres} />);

    expect(screen.queryByText("Edit Chart")).not.toBeInTheDocument();
  });

  it("does NOT have editingChart state (no inline edit/delete buttons)", () => {
    render(<ChartList charts={mockCharts} designers={mockDesigners} genres={mockGenres} />);

    // Old pattern had aria-labels like "Edit Dragon Dreams" and "Delete Dragon Dreams"
    // for inline buttons. Now those don't exist (kebab mock uses "Project actions").
    expect(screen.queryByLabelText("Edit Dragon Dreams")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Delete Dragon Dreams")).not.toBeInTheDocument();
  });

  it("mobile card layout renders chart names and kebab triggers", () => {
    render(<ChartList charts={mockCharts} designers={mockDesigners} genres={mockGenres} />);

    // Chart names appear at least twice (desktop table + mobile card)
    const dragonNames = screen.getAllByText("Dragon Dreams");
    expect(dragonNames.length).toBeGreaterThanOrEqual(2);

    // Kebab triggers appear for each chart (desktop + mobile)
    const kebabTriggers = screen.getAllByLabelText("Project actions");
    expect(kebabTriggers.length).toBeGreaterThanOrEqual(2);
  });
});

import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@/__tests__/test-utils";
import userEvent from "@testing-library/user-event";
import { ChartList } from "./chart-list";
import {
  createMockChartWithRelations,
  createMockDesigner,
  createMockGenre,
} from "@/__tests__/mocks";

const mockDeleteChart = vi.fn();
vi.mock("@/lib/actions/chart-actions", () => ({
  createChart: vi.fn(),
  updateChart: vi.fn(),
  deleteChart: (...args: unknown[]) => mockDeleteChart(...args),
}));

vi.mock("@/lib/actions/designer-actions", () => ({
  createDesigner: vi.fn(),
}));

vi.mock("@/lib/actions/genre-actions", () => ({
  createGenre: vi.fn(),
}));

vi.mock("@/lib/actions/storage-location-actions", () => ({
  createStorageLocation: vi.fn(),
}));

vi.mock("@/lib/actions/stitching-app-actions", () => ({
  createStitchingApp: vi.fn(),
}));

vi.mock("@/lib/actions/upload-actions", () => ({
  getPresignedUploadUrl: vi.fn(),
}));

const mockRouterRefresh = vi.fn();
const mockRouterPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mockRouterRefresh, push: mockRouterPush }),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
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

  it("each chart row has edit and delete buttons with proper aria-labels", () => {
    render(<ChartList charts={mockCharts} designers={mockDesigners} genres={mockGenres} />);

    // Desktop + mobile both render action buttons
    const editDragon = screen.getAllByLabelText("Edit Dragon Dreams");
    expect(editDragon.length).toBeGreaterThanOrEqual(1);

    const deleteDragon = screen.getAllByLabelText("Delete Dragon Dreams");
    expect(deleteDragon.length).toBeGreaterThanOrEqual(1);

    const editFox = screen.getAllByLabelText("Edit Woodland Fox");
    expect(editFox.length).toBeGreaterThanOrEqual(1);

    const deleteFox = screen.getAllByLabelText("Delete Woodland Fox");
    expect(deleteFox.length).toBeGreaterThanOrEqual(1);
  });

  it("clicking edit button opens the ChartEditModal (verify 'Edit Chart' title appears)", async () => {
    const user = userEvent.setup();
    render(<ChartList charts={mockCharts} designers={mockDesigners} genres={mockGenres} />);

    const editButtons = screen.getAllByLabelText("Edit Dragon Dreams");
    await user.click(editButtons[0]);

    expect(await screen.findByText("Edit Chart")).toBeInTheDocument();
  });

  it("clicking delete button opens delete confirmation dialog (verify 'Delete Chart' title appears)", async () => {
    const user = userEvent.setup();
    render(<ChartList charts={mockCharts} designers={mockDesigners} genres={mockGenres} />);

    const deleteButtons = screen.getAllByLabelText("Delete Dragon Dreams");
    await user.click(deleteButtons[0]);

    // Dialog title is a heading; the button also says "Delete Chart" so use role to disambiguate
    expect(await screen.findByRole("heading", { name: "Delete Chart" })).toBeInTheDocument();
    expect(screen.getByText(/permanently delete Dragon Dreams/)).toBeInTheDocument();
  });

  it("confirming delete calls deleteChart server action", async () => {
    const user = userEvent.setup();
    mockDeleteChart.mockResolvedValue({ success: true });
    render(<ChartList charts={mockCharts} designers={mockDesigners} genres={mockGenres} />);

    // Open delete dialog
    const deleteButtons = screen.getAllByLabelText("Delete Woodland Fox");
    await user.click(deleteButtons[0]);

    // Click the Delete Chart confirm button
    const confirmButton = await screen.findByRole("button", { name: /^delete chart$/i });
    await user.click(confirmButton);

    expect(mockDeleteChart).toHaveBeenCalledWith("c2");
  });

  it("mobile card layout renders chart names and action buttons", () => {
    render(<ChartList charts={mockCharts} designers={mockDesigners} genres={mockGenres} />);

    // Chart names appear at least twice (desktop table + mobile card)
    const dragonNames = screen.getAllByText("Dragon Dreams");
    expect(dragonNames.length).toBeGreaterThanOrEqual(2);

    // Edit/delete buttons appear at least twice each (desktop + mobile)
    const editDragon = screen.getAllByLabelText("Edit Dragon Dreams");
    expect(editDragon.length).toBeGreaterThanOrEqual(2);

    const deleteDragon = screen.getAllByLabelText("Delete Dragon Dreams");
    expect(deleteDragon.length).toBeGreaterThanOrEqual(2);
  });
});

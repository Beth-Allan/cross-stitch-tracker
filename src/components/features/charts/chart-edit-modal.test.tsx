import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@/__tests__/test-utils";
import userEvent from "@testing-library/user-event";
import { ChartEditModal } from "./chart-edit-modal";
import {
  createMockChartWithRelations,
  createMockDesigner,
  createMockGenre,
} from "@/__tests__/mocks";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const mockCreateChart = vi.fn();
const mockUpdateChart = vi.fn();
vi.mock("@/lib/actions/chart-actions", () => ({
  createChart: (...args: unknown[]) => mockCreateChart(...args),
  updateChart: (...args: unknown[]) => mockUpdateChart(...args),
}));

vi.mock("@/lib/actions/designer-actions", () => ({
  createDesigner: vi.fn(),
}));

vi.mock("@/lib/actions/genre-actions", () => ({
  createGenre: vi.fn(),
}));

vi.mock("@/lib/actions/upload-actions", () => ({
  getPresignedUploadUrl: vi.fn(),
}));

const mockChart = createMockChartWithRelations({
  id: "chart-1",
  name: "Test Chart",
  stitchCount: 5000,
  stitchesWide: 100,
  stitchesHigh: 50,
  project: {
    id: "proj-1",
    chartId: "chart-1",
    userId: "1",
    status: "IN_PROGRESS",
    startDate: new Date("2026-01-15"),
  },
});

const mockDesigners = [createMockDesigner({ id: "d1", name: "Designer One" })];

const mockGenres = [
  createMockGenre({ id: "g1", name: "Sampler" }),
  createMockGenre({ id: "g2", name: "Landscape" }),
];

function renderModal(overrides?: { open?: boolean; onOpenChange?: () => void }) {
  const onOpenChange = overrides?.onOpenChange ?? vi.fn();
  return render(
    <ChartEditModal
      chart={mockChart}
      designers={mockDesigners}
      genres={mockGenres}
      open={overrides?.open ?? true}
      onOpenChange={onOpenChange}
    />,
  );
}

describe("ChartEditModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with pre-populated chart name", () => {
    renderModal();

    const nameInput = screen.getByLabelText(/chart name/i);
    expect(nameInput).toHaveValue("Test Chart");
  });

  it("shows Basic Info and Details tabs", () => {
    renderModal();

    expect(screen.getByRole("tab", { name: "Basic Info" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Details" })).toBeInTheDocument();
  });

  it("shows Save Changes button", () => {
    renderModal();

    expect(screen.getByRole("button", { name: /save changes/i })).toBeInTheDocument();
  });

  it("calls updateChart with correct chartId on submit", async () => {
    mockUpdateChart.mockResolvedValue({ success: true });

    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(mockUpdateChart).toHaveBeenCalledTimes(1);
    });

    const [calledChartId] = mockUpdateChart.mock.calls[0];
    expect(calledChartId).toBe("chart-1");
  });

  it("switches tabs and preserves the chart name field value", async () => {
    const user = userEvent.setup();
    renderModal();

    // Verify name is pre-populated on Basic Info tab
    expect(screen.getByLabelText(/chart name/i)).toHaveValue("Test Chart");

    // Switch to Details tab
    await user.click(screen.getByRole("tab", { name: "Details" }));

    // Details tab content should appear (Genre section)
    expect(screen.getByText("Genre(s)")).toBeInTheDocument();

    // Switch back to Basic Info tab
    await user.click(screen.getByRole("tab", { name: "Basic Info" }));

    // Chart name should still be pre-populated
    expect(screen.getByLabelText(/chart name/i)).toHaveValue("Test Chart");
  });
});

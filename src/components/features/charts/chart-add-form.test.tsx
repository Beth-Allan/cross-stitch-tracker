import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@/__tests__/test-utils";
import userEvent from "@testing-library/user-event";
import { ChartAddForm } from "./chart-add-form";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
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

const mockDesigners = [
  {
    id: "d1",
    name: "Designer One",
    website: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockGenres = [
  { id: "g1", name: "Sampler", createdAt: new Date(), updatedAt: new Date() },
  { id: "g2", name: "Landscape", createdAt: new Date(), updatedAt: new Date() },
];

describe("ChartAddForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all 8 form sections", () => {
    render(<ChartAddForm designers={mockDesigners} genres={mockGenres} />);

    expect(screen.getByText("Basic Info")).toBeInTheDocument();
    expect(screen.getByText("Stitch Count & Dimensions")).toBeInTheDocument();
    expect(screen.getByText("Genre(s)")).toBeInTheDocument();
    expect(screen.getByText("Pattern Type")).toBeInTheDocument();
    expect(screen.getByText("Project Setup")).toBeInTheDocument();
    expect(screen.getByText("Dates")).toBeInTheDocument();
    expect(screen.getByText("Goals & Planning")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Notes" })).toBeInTheDocument();
  });

  it("shows Add Chart submit button", () => {
    render(<ChartAddForm designers={mockDesigners} genres={mockGenres} />);

    expect(screen.getByRole("button", { name: /add chart/i })).toBeInTheDocument();
  });

  it("shows validation error when submitting with empty name", async () => {
    const user = userEvent.setup();
    render(<ChartAddForm designers={mockDesigners} genres={mockGenres} />);

    // Fill in stitch count to avoid that error
    const countInput = screen.getByLabelText(/total stitch count/i);
    await user.type(countInput, "5000");

    await user.click(screen.getByRole("button", { name: /add chart/i }));

    await waitFor(() => {
      expect(screen.getByText("Chart name is required")).toBeInTheDocument();
    });
    expect(mockCreateChart).not.toHaveBeenCalled();
  });

  it("shows stitch count error when no count or dimensions provided", async () => {
    const user = userEvent.setup();
    render(<ChartAddForm designers={mockDesigners} genres={mockGenres} />);

    const nameInput = screen.getByLabelText(/chart name/i);
    await user.type(nameInput, "Test Chart");

    await user.click(screen.getByRole("button", { name: /add chart/i }));

    await waitFor(() => {
      expect(screen.getByText("Enter a stitch count or both width and height")).toBeInTheDocument();
    });
    expect(mockCreateChart).not.toHaveBeenCalled();
  });

  it("calls createChart with valid data and redirects on success", async () => {
    mockCreateChart.mockResolvedValue({
      success: true,
      chartId: "new-id",
    });

    const user = userEvent.setup();
    render(<ChartAddForm designers={mockDesigners} genres={mockGenres} />);

    await user.type(screen.getByLabelText(/chart name/i), "My Test Chart");
    await user.type(screen.getByLabelText(/total stitch count/i), "10000");

    await user.click(screen.getByRole("button", { name: /add chart/i }));

    await waitFor(() => {
      expect(mockCreateChart).toHaveBeenCalledTimes(1);
    });

    const callArg = mockCreateChart.mock.calls[0][0];
    expect(callArg.chart.name).toBe("My Test Chart");
    expect(callArg.chart.stitchCount).toBe(10000);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/charts");
    });
  });

  it("renders genre pills from provided genres", () => {
    render(<ChartAddForm designers={mockDesigners} genres={mockGenres} />);

    expect(screen.getByText("Sampler")).toBeInTheDocument();
    expect(screen.getByText("Landscape")).toBeInTheDocument();
  });
});

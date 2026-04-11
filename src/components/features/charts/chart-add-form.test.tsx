import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@/__tests__/test-utils";
import userEvent from "@testing-library/user-event";
import { ChartAddForm } from "./chart-add-form";
import { createMockDesigner, createMockGenre } from "@/__tests__/mocks";

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

const mockDesigners = [createMockDesigner({ id: "d1", name: "Designer One" })];

const mockGenres = [
  createMockGenre({ id: "g1", name: "Sampler" }),
  createMockGenre({ id: "g2", name: "Landscape" }),
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

  it("displays server-side error when action returns failure", async () => {
    mockCreateChart.mockResolvedValue({
      success: false,
      error: "Failed to create chart",
    });

    const user = userEvent.setup();
    render(<ChartAddForm designers={mockDesigners} genres={mockGenres} />);

    await user.type(screen.getByLabelText(/chart name/i), "Test Chart");
    await user.type(screen.getByLabelText(/total stitch count/i), "5000");
    await user.click(screen.getByRole("button", { name: /add chart/i }));

    await waitFor(() => {
      expect(screen.getByText("Failed to create chart")).toBeInTheDocument();
    });
  });

  it("displays generic error on unexpected throw", async () => {
    mockCreateChart.mockRejectedValue(new Error("Network failure"));

    const user = userEvent.setup();
    render(<ChartAddForm designers={mockDesigners} genres={mockGenres} />);

    await user.type(screen.getByLabelText(/chart name/i), "Test Chart");
    await user.type(screen.getByLabelText(/total stitch count/i), "5000");
    await user.click(screen.getByRole("button", { name: /add chart/i }));

    await waitFor(() => {
      expect(screen.getByText("An unexpected error occurred")).toBeInTheDocument();
    });
  });

  it("disables submit button during pending state", async () => {
    // Return a never-resolving promise to keep isPending true
    mockCreateChart.mockReturnValue(new Promise(() => {}));

    const user = userEvent.setup();
    render(<ChartAddForm designers={mockDesigners} genres={mockGenres} />);

    await user.type(screen.getByLabelText(/chart name/i), "Test Chart");
    await user.type(screen.getByLabelText(/total stitch count/i), "5000");
    await user.click(screen.getByRole("button", { name: /add chart/i }));

    await waitFor(() => {
      const button = screen.getByRole("button", { name: /adding/i });
      expect(button).toBeDisabled();
    });
  });

  it("keeps submit button disabled after successful save and shows Added!", async () => {
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
      const button = screen.getByRole("button", { name: /added!/i });
      expect(button).toBeDisabled();
    });
  });

  it("re-enables submit button after server error", async () => {
    mockCreateChart.mockResolvedValue({
      success: false,
      error: "Failed to create chart",
    });

    const user = userEvent.setup();
    render(<ChartAddForm designers={mockDesigners} genres={mockGenres} />);

    await user.type(screen.getByLabelText(/chart name/i), "Test Chart");
    await user.type(screen.getByLabelText(/total stitch count/i), "5000");
    await user.click(screen.getByRole("button", { name: /add chart/i }));

    await waitFor(() => {
      const button = screen.getByRole("button", { name: /add chart/i });
      expect(button).toBeEnabled();
    });
  });

  it("re-enables submit button after network error", async () => {
    mockCreateChart.mockRejectedValue(new Error("Network failure"));

    const user = userEvent.setup();
    render(<ChartAddForm designers={mockDesigners} genres={mockGenres} />);

    await user.type(screen.getByLabelText(/chart name/i), "Test Chart");
    await user.type(screen.getByLabelText(/total stitch count/i), "5000");
    await user.click(screen.getByRole("button", { name: /add chart/i }));

    await waitFor(() => {
      const button = screen.getByRole("button", { name: /add chart/i });
      expect(button).toBeEnabled();
    });
  });

  it("clears validation error when field is corrected", async () => {
    const user = userEvent.setup();
    render(<ChartAddForm designers={mockDesigners} genres={mockGenres} />);

    // Fill stitch count but leave name empty, then submit
    await user.type(screen.getByLabelText(/total stitch count/i), "5000");
    await user.click(screen.getByRole("button", { name: /add chart/i }));

    await waitFor(() => {
      expect(screen.getByText("Chart name is required")).toBeInTheDocument();
    });

    // Now type a name — error should clear
    await user.type(screen.getByLabelText(/chart name/i), "Fixed Name");

    await waitFor(() => {
      expect(screen.queryByText("Chart name is required")).not.toBeInTheDocument();
    });
  });
});

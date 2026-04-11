import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@/__tests__/test-utils";
import userEvent from "@testing-library/user-event";
import { GenreFormModal } from "./genre-form-modal";
import { createMockGenreWithStats } from "@/__tests__/mocks/factories";

// Mock server actions
vi.mock("@/lib/actions/genre-actions", () => ({
  createGenre: vi.fn(),
  updateGenre: vi.fn(),
}));

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: vi.fn(),
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
}));

const { createGenre, updateGenre } = await import("@/lib/actions/genre-actions");

describe("GenreFormModal", () => {
  const mockOnOpenChange = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders name field only (no website, no notes)", () => {
    render(<GenreFormModal open={true} onOpenChange={mockOnOpenChange} />);

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/website/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/notes/i)).not.toBeInTheDocument();
  });

  it("shows 'Add Genre' title and button in create mode", () => {
    render(<GenreFormModal open={true} onOpenChange={mockOnOpenChange} />);

    // Title and submit button both say "Add Genre"
    const addGenreElements = screen.getAllByText("Add Genre");
    expect(addGenreElements.length).toBeGreaterThanOrEqual(2); // title + button
    expect(screen.getByRole("button", { name: /add genre/i })).toBeInTheDocument();
  });

  it("shows 'Edit Genre' title and 'Save Changes' button in edit mode with pre-filled name", () => {
    const genre = createMockGenreWithStats({ id: "g1", name: "Fantasy" });
    render(<GenreFormModal open={true} onOpenChange={mockOnOpenChange} genre={genre} />);

    expect(screen.getByText("Edit Genre")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /save changes/i })).toBeInTheDocument();
    expect(screen.getByDisplayValue("Fantasy")).toBeInTheDocument();
  });

  it("shows validation error when name is empty and submit is clicked", async () => {
    const user = userEvent.setup();
    render(<GenreFormModal open={true} onOpenChange={mockOnOpenChange} />);

    const submitButton = screen.getByRole("button", { name: /add genre/i });
    await user.click(submitButton);

    expect(await screen.findByText(/genre name is required/i)).toBeInTheDocument();
    expect(createGenre).not.toHaveBeenCalled();
  });

  it("calls createGenre on submit in create mode", async () => {
    const user = userEvent.setup();
    vi.mocked(createGenre).mockResolvedValue({
      success: true,
      genre: { id: "g1", name: "Landscape", createdAt: new Date(), updatedAt: new Date() },
    });

    render(
      <GenreFormModal open={true} onOpenChange={mockOnOpenChange} onSuccess={mockOnSuccess} />,
    );

    const nameInput = screen.getByLabelText(/name/i);
    await user.type(nameInput, "Landscape");
    await user.click(screen.getByRole("button", { name: /add genre/i }));

    await waitFor(() => {
      expect(createGenre).toHaveBeenCalledWith({ name: "Landscape" });
    });
  });

  it("calls updateGenre on submit in edit mode", async () => {
    const user = userEvent.setup();
    const genre = createMockGenreWithStats({ id: "g1", name: "Fantasy" });
    vi.mocked(updateGenre).mockResolvedValue({
      success: true,
      genre: { id: "g1", name: "Sci-Fi", createdAt: new Date(), updatedAt: new Date() },
    });

    render(
      <GenreFormModal
        open={true}
        onOpenChange={mockOnOpenChange}
        genre={genre}
        onSuccess={mockOnSuccess}
      />,
    );

    const nameInput = screen.getByDisplayValue("Fantasy");
    await user.clear(nameInput);
    await user.type(nameInput, "Sci-Fi");
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(updateGenre).toHaveBeenCalledWith("g1", { name: "Sci-Fi" });
    });
  });

  it("shows server error below name field when action returns error", async () => {
    const user = userEvent.setup();
    vi.mocked(createGenre).mockResolvedValue({
      success: false,
      error: "A genre with that name already exists",
    });

    render(<GenreFormModal open={true} onOpenChange={mockOnOpenChange} />);

    const nameInput = screen.getByLabelText(/name/i);
    await user.type(nameInput, "Fantasy");
    await user.click(screen.getByRole("button", { name: /add genre/i }));

    expect(await screen.findByText("A genre with that name already exists")).toBeInTheDocument();
  });
});

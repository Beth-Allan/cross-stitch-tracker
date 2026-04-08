import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@/__tests__/test-utils";
import userEvent from "@testing-library/user-event";
import { GenreList } from "./genre-list";
import { createMockGenreWithStats } from "@/__tests__/mocks/factories";
import type { GenreWithStats } from "@/types/genre";

// Mock server actions
vi.mock("@/lib/actions/genre-actions", () => ({
  createGenre: vi.fn(),
  updateGenre: vi.fn(),
  deleteGenre: vi.fn(),
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

describe("GenreList", () => {
  const mockGenres: GenreWithStats[] = [
    createMockGenreWithStats({ id: "g1", name: "Fantasy", chartCount: 12 }),
    createMockGenreWithStats({ id: "g2", name: "Landscape", chartCount: 8 }),
    createMockGenreWithStats({ id: "g3", name: "Animals", chartCount: 5 }),
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders table headers GENRE and CHARTS (only 2 sortable columns)", () => {
    render(<GenreList genres={mockGenres} />);

    // Should have the two sortable column headers
    expect(screen.getByText("GENRE")).toBeInTheDocument();
    expect(screen.getByText("CHARTS")).toBeInTheDocument();

    // Should NOT have designer-specific columns
    expect(screen.queryByText("WEB")).not.toBeInTheDocument();
    expect(screen.queryByText("STARTED")).not.toBeInTheDocument();
    expect(screen.queryByText("FINISHED")).not.toBeInTheDocument();
    expect(screen.queryByText("TOP GENRE")).not.toBeInTheDocument();
  });

  it("renders genre rows with name and chart count", () => {
    render(<GenreList genres={mockGenres} />);

    // Both desktop table and mobile cards render in jsdom (no CSS media queries)
    // so genre names appear twice — use getAllByText
    expect(screen.getAllByText("Fantasy").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Landscape").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Animals").length).toBeGreaterThanOrEqual(1);
    // Chart counts appear in the desktop table
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("shows empty state 'No genres added yet' when list is empty", () => {
    render(<GenreList genres={[]} />);

    // Both desktop and mobile render the empty state
    const matches = screen.getAllByText("No genres added yet");
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it("shows filtered empty state 'No genres match your search' when search has no results", async () => {
    const user = userEvent.setup();
    render(<GenreList genres={mockGenres} />);

    const searchInput = screen.getByPlaceholderText("Search genres...");
    await user.type(searchInput, "xyznonexistent");

    // Both desktop and mobile render the empty state
    const matches = screen.getAllByText("No genres match your search");
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it("filters genres by name when searching (case-insensitive)", async () => {
    const user = userEvent.setup();
    render(<GenreList genres={mockGenres} />);

    const searchInput = screen.getByPlaceholderText("Search genres...");
    await user.type(searchInput, "fan");

    // Fantasy should still appear (in both desktop+mobile views)
    expect(screen.getAllByText("Fantasy").length).toBeGreaterThanOrEqual(1);
    // The other genres should not appear in either view
    expect(screen.queryByText("Landscape")).not.toBeInTheDocument();
    expect(screen.queryByText("Animals")).not.toBeInTheDocument();
  });

  it("opens form modal when 'Add Genre' button is clicked", async () => {
    const user = userEvent.setup();
    render(<GenreList genres={mockGenres} />);

    // With genres present, only the header "Add Genre" button renders (not empty state)
    const addButton = screen.getByRole("button", { name: /add genre/i });
    await user.click(addButton);

    // The modal should appear
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });

  it("has accessible edit buttons with aria-labels for each genre", () => {
    render(<GenreList genres={mockGenres} />);

    // Desktop + mobile both render edit buttons, so use getAllByLabelText
    expect(screen.getAllByLabelText("Edit Fantasy").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByLabelText("Edit Landscape").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByLabelText("Edit Animals").length).toBeGreaterThanOrEqual(1);
  });

  it("has accessible delete buttons with aria-labels for each genre", () => {
    render(<GenreList genres={mockGenres} />);

    // Desktop + mobile both render delete buttons, so use getAllByLabelText
    expect(screen.getAllByLabelText("Delete Fantasy").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByLabelText("Delete Landscape").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByLabelText("Delete Animals").length).toBeGreaterThanOrEqual(1);
  });
});

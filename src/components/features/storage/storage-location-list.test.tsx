import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@/__tests__/test-utils";
import userEvent from "@testing-library/user-event";
import { StorageLocationList } from "./storage-location-list";
import type { StorageLocationWithStats } from "@/types/storage";

// Mock Next.js router
const mockPush = vi.fn();
const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}));

// Mock server actions
vi.mock("@/lib/actions/storage-location-actions", () => ({
  createStorageLocation: vi
    .fn()
    .mockResolvedValue({ success: true, location: { id: "new-1", name: "New" } }),
  updateStorageLocation: vi.fn().mockResolvedValue({ success: true }),
  deleteStorageLocation: vi.fn().mockResolvedValue({ success: true }),
}));

// Mock sonner
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const mockLocations: StorageLocationWithStats[] = [
  { id: "loc-1", name: "Bin A", description: null, projectCount: 3 },
  { id: "loc-2", name: "Bin B", description: null, projectCount: 0 },
];

describe("StorageLocationList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders list of locations with names and project counts", () => {
    render(<StorageLocationList locations={mockLocations} />);

    expect(screen.getByText("Bin A")).toBeInTheDocument();
    expect(screen.getByText("3 projects")).toBeInTheDocument();
    expect(screen.getByText("Bin B")).toBeInTheDocument();
    expect(screen.getByText("No projects")).toBeInTheDocument();
  });

  it('clicking "Add Location" CTA shows inline add row with tinted background', async () => {
    const user = userEvent.setup();
    render(<StorageLocationList locations={mockLocations} />);

    const addButton = screen.getByRole("button", { name: /add location/i });
    await user.click(addButton);

    const input = screen.getByPlaceholderText(/location name/i);
    expect(input).toBeInTheDocument();
  });

  it("pressing Enter in inline add row calls createStorageLocation with name", async () => {
    const user = userEvent.setup();
    const { createStorageLocation } = await import("@/lib/actions/storage-location-actions");

    render(<StorageLocationList locations={mockLocations} />);

    await user.click(screen.getByRole("button", { name: /add location/i }));
    const input = screen.getByPlaceholderText(/location name/i);
    await user.type(input, "Shelf C");
    await user.keyboard("{Enter}");

    expect(createStorageLocation).toHaveBeenCalledWith({ name: "Shelf C" });
  });

  it("pressing Escape in inline add row closes the add row", async () => {
    const user = userEvent.setup();
    render(<StorageLocationList locations={mockLocations} />);

    await user.click(screen.getByRole("button", { name: /add location/i }));
    expect(screen.getByPlaceholderText(/location name/i)).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByPlaceholderText(/location name/i)).not.toBeInTheDocument();
  });

  it("clicking trash icon opens DeleteEntityDialog", async () => {
    const user = userEvent.setup();
    render(<StorageLocationList locations={mockLocations} />);

    const deleteButton = screen.getByRole("button", { name: /delete bin a/i });
    await user.click(deleteButton);

    expect(screen.getByText("Delete Storage Location")).toBeInTheDocument();
  });

  it("clicking a row navigates to /storage/[id]", () => {
    render(<StorageLocationList locations={mockLocations} />);

    const link = screen.getByRole("link", { name: /view bin a/i });
    expect(link).toHaveAttribute("href", "/storage/loc-1");
  });

  it("shows empty state when no locations exist", () => {
    render(<StorageLocationList locations={[]} />);

    expect(screen.getByText("No storage locations yet")).toBeInTheDocument();
    expect(
      screen.getByText("Add locations to organize where your projects and kits are stored"),
    ).toBeInTheDocument();
  });

  it("pencil click enters edit mode without navigating", async () => {
    const user = userEvent.setup();
    render(<StorageLocationList locations={mockLocations} />);

    const renameButton = screen.getByRole("button", { name: /rename bin a/i });
    await user.click(renameButton);

    expect(mockPush).not.toHaveBeenCalled();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  describe("ARIA compliance", () => {
    it("does not render role='button' on the card container", () => {
      render(<StorageLocationList locations={mockLocations} />);

      const buttonRoles = screen.queryAllByRole("button");
      const cardButtons = buttonRoles.filter((el) =>
        el.getAttribute("aria-label")?.startsWith("Navigate to"),
      );
      expect(cardButtons).toHaveLength(0);
    });

    it("contains a Link with href='/storage/{id}' and visually hidden 'View {name}' text", () => {
      render(<StorageLocationList locations={mockLocations} />);

      const link = screen.getByRole("link", { name: /view bin a/i });
      expect(link).toHaveAttribute("href", "/storage/loc-1");

      const srText = link.querySelector(".sr-only");
      expect(srText).toHaveTextContent("View Bin A");
    });

    it("contains no nested interactive elements (no button inside a link)", () => {
      render(<StorageLocationList locations={mockLocations} />);

      const links = screen.getAllByRole("link");
      const buttons = screen.getAllByRole("button");

      for (const link of links) {
        for (const button of buttons) {
          expect(link.contains(button)).toBe(false);
        }
      }
    });

    it("edit button click does not trigger navigation", async () => {
      const user = userEvent.setup();
      render(<StorageLocationList locations={mockLocations} />);

      const renameButton = screen.getByRole("button", { name: /rename bin a/i });
      await user.click(renameButton);

      expect(mockPush).not.toHaveBeenCalled();
    });

    it("delete button click opens dialog without navigation", async () => {
      const user = userEvent.setup();
      render(<StorageLocationList locations={mockLocations} />);

      const deleteButton = screen.getByRole("button", { name: /delete bin a/i });
      await user.click(deleteButton);

      expect(mockPush).not.toHaveBeenCalled();
      expect(screen.getByText("Delete Storage Location")).toBeInTheDocument();
    });
  });
});

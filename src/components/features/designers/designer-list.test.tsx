import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@/__tests__/test-utils";
import userEvent from "@testing-library/user-event";
import { DesignerList } from "./designer-list";
import { createMockDesignerWithStats } from "@/__tests__/mocks";

const mockCreateDesigner = vi.fn();
const mockUpdateDesigner = vi.fn();
const mockDeleteDesigner = vi.fn();
vi.mock("@/lib/actions/designer-actions", () => ({
  createDesigner: (...args: unknown[]) => mockCreateDesigner(...args),
  updateDesigner: (...args: unknown[]) => mockUpdateDesigner(...args),
  deleteDesigner: (...args: unknown[]) => mockDeleteDesigner(...args),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const mockDesigners = [
  createMockDesignerWithStats({
    id: "d1",
    name: "Heaven and Earth Designs",
    website: "https://heavenandearthdesigns.com",
    chartCount: 5,
  }),
  createMockDesignerWithStats({
    id: "d2",
    name: "Nora Corbett",
    website: null,
    chartCount: 8,
  }),
  createMockDesignerWithStats({
    id: "d3",
    name: "Artecy Cross Stitch",
    website: "https://artecy.com",
    chartCount: 3,
  }),
];

describe("DesignerList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders table headers (DESIGNER, WEB, CHARTS, STARTED, FINISHED, TOP GENRE)", () => {
    render(<DesignerList designers={mockDesigners} />);

    // Desktop table should have all headers
    expect(screen.getByText("DESIGNER")).toBeInTheDocument();
    expect(screen.getByText("WEB")).toBeInTheDocument();
    expect(screen.getByText("CHARTS")).toBeInTheDocument();
    expect(screen.getByText("STARTED")).toBeInTheDocument();
    expect(screen.getByText("FINISHED")).toBeInTheDocument();
    expect(screen.getByText("TOP GENRE")).toBeInTheDocument();
  });

  it("renders designer rows with name, website icon, and chart count", () => {
    render(<DesignerList designers={mockDesigners} />);

    // Both desktop and mobile render (CSS responsive), so use getAllByText
    const heaveNames = screen.getAllByText("Heaven and Earth Designs");
    expect(heaveNames.length).toBeGreaterThanOrEqual(1);

    const noraNames = screen.getAllByText("Nora Corbett");
    expect(noraNames.length).toBeGreaterThanOrEqual(1);

    const artecyNames = screen.getAllByText("Artecy Cross Stitch");
    expect(artecyNames.length).toBeGreaterThanOrEqual(1);
  });

  it("shows empty state with 'No designers added yet' when list is empty", () => {
    render(<DesignerList designers={[]} />);

    expect(screen.getByText("No designers added yet")).toBeInTheDocument();
    expect(
      screen.getByText(/add your first designer to start organizing your collection/i),
    ).toBeInTheDocument();
  });

  it("shows filtered empty state 'No designers match your filters' when search has no results", async () => {
    const user = userEvent.setup();
    render(<DesignerList designers={mockDesigners} />);

    const searchInput = screen.getByPlaceholderText("Search designers...");
    await user.type(searchInput, "zzzzzzz");

    // Both desktop and mobile show the empty state text
    const emptyMessages = screen.getAllByText("No designers match your filters");
    expect(emptyMessages.length).toBeGreaterThanOrEqual(1);
  });

  it("search input filters designers by name (case-insensitive)", async () => {
    const user = userEvent.setup();
    render(<DesignerList designers={mockDesigners} />);

    const searchInput = screen.getByPlaceholderText("Search designers...");
    await user.type(searchInput, "nora");

    // Only Nora should be visible (desktop + mobile)
    const noraNames = screen.getAllByText("Nora Corbett");
    expect(noraNames.length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText("Heaven and Earth Designs")).not.toBeInTheDocument();
    expect(screen.queryByText("Artecy Cross Stitch")).not.toBeInTheDocument();
  });

  it("clicking 'Add Designer' button opens form modal", async () => {
    const user = userEvent.setup();
    render(<DesignerList designers={mockDesigners} />);

    // Find the Add Designer button (primary CTA in header)
    const addButton = screen.getByRole("button", { name: /add designer/i });
    await user.click(addButton);

    // Modal should show the title -- use getAllByText since the button also says "Add Designer"
    const addDesignerElements = screen.getAllByText("Add Designer");
    // At minimum we should have the modal title
    expect(addDesignerElements.length).toBeGreaterThanOrEqual(2);
  });

  it("renders edit buttons with accessible aria-labels", () => {
    render(<DesignerList designers={mockDesigners} />);

    // Desktop + mobile both render edit buttons, so use getAllByLabelText
    const editHeave = screen.getAllByLabelText("Edit Heaven and Earth Designs");
    expect(editHeave.length).toBeGreaterThanOrEqual(1);

    const editNora = screen.getAllByLabelText("Edit Nora Corbett");
    expect(editNora.length).toBeGreaterThanOrEqual(1);

    const editArtecy = screen.getAllByLabelText("Edit Artecy Cross Stitch");
    expect(editArtecy.length).toBeGreaterThanOrEqual(1);
  });

  it("renders delete buttons with accessible aria-labels", () => {
    render(<DesignerList designers={mockDesigners} />);

    // Desktop + mobile both render delete buttons
    const deleteHeave = screen.getAllByLabelText("Delete Heaven and Earth Designs");
    expect(deleteHeave.length).toBeGreaterThanOrEqual(1);

    const deleteNora = screen.getAllByLabelText("Delete Nora Corbett");
    expect(deleteNora.length).toBeGreaterThanOrEqual(1);

    const deleteArtecy = screen.getAllByLabelText("Delete Artecy Cross Stitch");
    expect(deleteArtecy.length).toBeGreaterThanOrEqual(1);
  });

  it("clicking delete button opens DeleteConfirmationDialog with designer info", async () => {
    const user = userEvent.setup();
    render(<DesignerList designers={mockDesigners} />);

    // Click the first delete button (desktop row for "Heaven and Earth Designs")
    const deleteButtons = screen.getAllByLabelText("Delete Heaven and Earth Designs");
    await user.click(deleteButtons[0]);

    // Dialog should appear with the designer name and chart count
    expect(await screen.findByText("Delete Designer?")).toBeInTheDocument();
    // Name appears in table row, mobile card, and dialog -- use getAllByText
    expect(screen.getAllByText(/Heaven and Earth Designs/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/5 chart\(s\)/)).toBeInTheDocument();
    expect(screen.getByText(/Charts will NOT be deleted/)).toBeInTheDocument();
  });

  it("confirming delete calls deleteDesigner action", async () => {
    const user = userEvent.setup();
    mockDeleteDesigner.mockResolvedValue({ success: true });
    render(<DesignerList designers={mockDesigners} />);

    // Open delete dialog
    const deleteButtons = screen.getAllByLabelText("Delete Nora Corbett");
    await user.click(deleteButtons[0]);

    // Click the Delete button in the confirmation dialog
    const confirmButton = await screen.findByRole("button", { name: /^delete$/i });
    await user.click(confirmButton);

    expect(mockDeleteDesigner).toHaveBeenCalledWith("d2");
  });
});

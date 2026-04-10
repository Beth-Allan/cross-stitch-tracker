import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@/__tests__/test-utils";
import userEvent from "@testing-library/user-event";
import { DesignerDetail } from "./designer-detail";
import { createMockDesignerChart } from "@/__tests__/mocks";
import type { DesignerDetail as DesignerDetailType } from "@/types/designer";

const mockDeleteDesigner = vi.fn();
const mockUpdateDesigner = vi.fn();
vi.mock("@/lib/actions/designer-actions", () => ({
  deleteDesigner: (...args: unknown[]) => mockDeleteDesigner(...args),
  updateDesigner: (...args: unknown[]) => mockUpdateDesigner(...args),
  createDesigner: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

function createDesignerDetail(overrides?: Partial<DesignerDetailType>): DesignerDetailType {
  return {
    id: "d1",
    name: "Nora Corbett",
    website: "https://noracorbett.com",
    notes: "Specializes in fairy designs",
    chartCount: 3,
    projectsStarted: 2,
    projectsFinished: 1,
    topGenre: "Fantasy",
    charts: [
      createMockDesignerChart({
        id: "c1",
        name: "Autumn Fairy",
        stitchCount: 15000,
        stitchesWide: 150,
        stitchesHigh: 100,
        status: "IN_PROGRESS",
        stitchesCompleted: 5000,
        genres: [{ name: "Fantasy" }],
      }),
      createMockDesignerChart({
        id: "c2",
        name: "Spring Garden",
        stitchCount: 8000,
        stitchesWide: 120,
        stitchesHigh: 80,
        status: "FINISHED",
        stitchesCompleted: 8000,
        genres: [{ name: "Landscape" }],
      }),
      createMockDesignerChart({
        id: "c3",
        name: "Winter Cottage",
        stitchCount: 45000,
        stitchesWide: 300,
        stitchesHigh: 150,
        status: null,
        stitchesCompleted: 0,
        genres: [],
      }),
    ],
    ...overrides,
  };
}

describe("DesignerDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders designer name as h1", () => {
    render(<DesignerDetail designer={createDesignerDetail()} />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("Nora Corbett");
  });

  it("renders website with ExternalLink icon when website exists", () => {
    render(<DesignerDetail designer={createDesignerDetail()} />);
    const websiteLink = screen.getByRole("link", {
      name: /visit nora corbett website/i,
    });
    expect(websiteLink).toBeInTheDocument();
    expect(websiteLink).toHaveAttribute("href", "https://noracorbett.com");
  });

  it("does not render website line when no website", () => {
    render(<DesignerDetail designer={createDesignerDetail({ website: null })} />);
    expect(screen.queryByRole("link", { name: /visit.*website/i })).not.toBeInTheDocument();
  });

  it("renders notes when present", () => {
    render(<DesignerDetail designer={createDesignerDetail()} />);
    expect(screen.getByText(/Specializes in fairy designs/)).toBeInTheDocument();
  });

  it("renders stat items (Charts, Started, Finished, Top Genre)", () => {
    render(<DesignerDetail designer={createDesignerDetail()} />);

    // Stat labels
    expect(screen.getByText("Charts")).toBeInTheDocument();
    expect(screen.getByText("Started")).toBeInTheDocument();
    expect(screen.getByText("Top Genre")).toBeInTheDocument();

    // "Finished" appears in both the stat label and the StatusBadge for the chart
    const finishedElements = screen.getAllByText("Finished");
    expect(finishedElements.length).toBeGreaterThanOrEqual(2); // stat label + badge

    // Stat values -- check the stat row contains the numbers
    // projectsStarted=2, projectsFinished=1, chartCount=3
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();

    // Top Genre badge
    expect(screen.getByText("Fantasy")).toBeInTheDocument();
  });

  it("renders chart list with chart names", () => {
    render(<DesignerDetail designer={createDesignerDetail()} />);

    expect(screen.getByText("Autumn Fairy")).toBeInTheDocument();
    expect(screen.getByText("Spring Garden")).toBeInTheDocument();
    expect(screen.getByText("Winter Cottage")).toBeInTheDocument();
  });

  it("chart rows link to /charts/[id]", () => {
    render(<DesignerDetail designer={createDesignerDetail()} />);

    const autumnLink = screen.getByRole("link", { name: /autumn fairy/i });
    expect(autumnLink).toHaveAttribute("href", "/charts/c1");

    const springLink = screen.getByRole("link", { name: /spring garden/i });
    expect(springLink).toHaveAttribute("href", "/charts/c2");
  });

  it('shows "No charts found for this designer" when charts array is empty', () => {
    render(<DesignerDetail designer={createDesignerDetail({ charts: [], chartCount: 0 })} />);
    expect(screen.getByText("No charts found for this designer")).toBeInTheDocument();
  });

  it("edit button is present with aria-label", () => {
    render(<DesignerDetail designer={createDesignerDetail()} />);
    expect(screen.getByLabelText("Edit Nora Corbett")).toBeInTheDocument();
  });

  it("delete button is present with aria-label", () => {
    render(<DesignerDetail designer={createDesignerDetail()} />);
    expect(screen.getByLabelText("Delete Nora Corbett")).toBeInTheDocument();
  });

  it("clicking Stitches sort pill changes chart order by stitch count ascending", async () => {
    const user = userEvent.setup();
    // Charts: Autumn Fairy (15000), Spring Garden (8000), Winter Cottage (45000)
    // Default sort: name asc -> Autumn Fairy, Spring Garden, Winter Cottage
    // After clicking Stitches: Spring Garden(8000), Autumn Fairy(15000), Winter Cottage(45000)
    render(<DesignerDetail designer={createDesignerDetail()} />);

    await user.click(screen.getByRole("button", { name: /^stitches$/i }));

    // Get all chart links (links to /charts/...) in DOM order
    const chartLinks = screen
      .getAllByRole("link")
      .filter((link) => link.getAttribute("href")?.startsWith("/charts/"));

    expect(chartLinks[0].textContent).toContain("Spring Garden");
    expect(chartLinks[1].textContent).toContain("Autumn Fairy");
    expect(chartLinks[2].textContent).toContain("Winter Cottage");
  });

  it("clicking Stitches sort pill twice reverses chart order to descending stitch count", async () => {
    const user = userEvent.setup();
    render(<DesignerDetail designer={createDesignerDetail()} />);

    await user.click(screen.getByRole("button", { name: /^stitches$/i }));
    await user.click(screen.getByRole("button", { name: /^stitches$/i }));

    // Descending: Winter Cottage(45000), Autumn Fairy(15000), Spring Garden(8000)
    const chartLinks = screen
      .getAllByRole("link")
      .filter((link) => link.getAttribute("href")?.startsWith("/charts/"));

    expect(chartLinks[0].textContent).toContain("Winter Cottage");
    expect(chartLinks[1].textContent).toContain("Autumn Fairy");
    expect(chartLinks[2].textContent).toContain("Spring Garden");
  });
});

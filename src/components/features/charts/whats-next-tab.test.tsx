import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@/__tests__/test-utils";
import type { WhatsNextProject } from "@/types/session";
import { WhatsNextTab } from "./whats-next-tab";

// Mock next/link
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

function makeProject(overrides: Partial<WhatsNextProject> = {}): WhatsNextProject {
  return {
    chartId: "chart-1",
    chartName: "My Test Pattern",
    coverThumbnailUrl: null,
    designerName: "Test Designer",
    status: "UNSTARTED",
    wantToStartNext: false,
    kittingPercent: 50,
    dateAdded: new Date("2026-01-01"),
    totalStitches: 10000,
    ...overrides,
  };
}

describe("WhatsNextTab", () => {
  it("renders project cards with chart name and designer", () => {
    const projects = [makeProject()];
    render(<WhatsNextTab projects={projects} imageUrls={{}} />);

    expect(screen.getByText("My Test Pattern")).toBeInTheDocument();
    expect(screen.getByText("Test Designer")).toBeInTheDocument();
  });

  it("renders 'Fully kitted' label at 100%", () => {
    const projects = [makeProject({ kittingPercent: 100 })];
    render(<WhatsNextTab projects={projects} imageUrls={{}} />);
    expect(screen.getByText("Fully kitted")).toBeInTheDocument();
  });

  it("renders 'Kitting' label between 1-99%", () => {
    const projects = [makeProject({ kittingPercent: 50 })];
    render(<WhatsNextTab projects={projects} imageUrls={{}} />);
    expect(screen.getByText("Kitting")).toBeInTheDocument();
  });

  it("shows star icon for wantToStartNext projects", () => {
    const projects = [makeProject({ wantToStartNext: true })];
    const { container } = render(<WhatsNextTab projects={projects} imageUrls={{}} />);

    const starIcon = container.querySelector('[data-testid="star-icon-chart-1"]');
    expect(starIcon).toBeInTheDocument();
  });

  it("renders sort dropdown with 5 options", () => {
    const projects = [makeProject()];
    render(<WhatsNextTab projects={projects} imageUrls={{}} />);

    const select = screen.getByRole("combobox");
    expect(select).toBeInTheDocument();

    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(5);
    expect(options.map((o) => o.textContent)).toEqual([
      "Kitting Readiness",
      "Oldest First",
      "Newest First",
      "Largest First",
      "Smallest First",
    ]);
  });

  it("renders count text with correct pluralization", () => {
    const projects = [makeProject()];
    render(<WhatsNextTab projects={projects} imageUrls={{}} />);
    expect(screen.getByText("1 project ready or getting ready to stitch")).toBeInTheDocument();

    const { unmount } = render(
      <WhatsNextTab
        projects={[makeProject({ chartId: "c1" }), makeProject({ chartId: "c2" })]}
        imageUrls={{}}
      />,
    );
    expect(screen.getByText("2 projects ready or getting ready to stitch")).toBeInTheDocument();
    unmount();
  });

  it("renders empty state when no projects", () => {
    render(<WhatsNextTab projects={[]} imageUrls={{}} />);

    expect(screen.getByText(/No projects queued up/)).toBeInTheDocument();
  });

  it("card links to /charts/{chartId}", () => {
    const projects = [makeProject({ chartId: "chart-abc" })];
    render(<WhatsNextTab projects={projects} imageUrls={{}} />);

    const links = screen.getAllByRole("link");
    const chartLink = links.find((l) => l.getAttribute("href") === "/charts/chart-abc");
    expect(chartLink).toBeTruthy();
  });

  it("sorts by totalStitches when Largest First selected", () => {
    const projects = [
      makeProject({ chartId: "small", chartName: "Small", totalStitches: 100 }),
      makeProject({ chartId: "large", chartName: "Large", totalStitches: 50000 }),
    ];
    render(<WhatsNextTab projects={projects} imageUrls={{}} />);

    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "largest" },
    });

    const links = screen.getAllByRole("link");
    const linkHrefs = links.map((l) => l.getAttribute("href"));
    const largeIdx = linkHrefs.indexOf("/charts/large");
    const smallIdx = linkHrefs.indexOf("/charts/small");
    expect(largeIdx).toBeLessThan(smallIdx);
  });

  describe("Three-state kitting label (UX-05)", () => {
    it("shows 'Not kitted' at 0%", () => {
      const projects = [makeProject({ kittingPercent: 0 })];
      render(<WhatsNextTab projects={projects} imageUrls={{}} />);
      expect(screen.getByText("Not kitted")).toBeInTheDocument();
    });

    it("shows 'Kitting' at 50%", () => {
      const projects = [makeProject({ kittingPercent: 50 })];
      render(<WhatsNextTab projects={projects} imageUrls={{}} />);
      expect(screen.getByText("Kitting")).toBeInTheDocument();
    });

    it("shows 'Fully kitted' at 100%", () => {
      const projects = [makeProject({ kittingPercent: 100 })];
      render(<WhatsNextTab projects={projects} imageUrls={{}} />);
      expect(screen.getByText("Fully kitted")).toBeInTheDocument();
    });
  });

  describe("Gallery card layout (UX-14)", () => {
    it("card wrapper has bg-card, rounded-lg, border classes", () => {
      const projects = [makeProject()];
      const { container } = render(<WhatsNextTab projects={projects} imageUrls={{}} />);
      const card = container.querySelector(".bg-card.rounded-lg.border");
      expect(card).toBeInTheDocument();
    });

    it("image area has aspect-[4/3] class", () => {
      const projects = [makeProject()];
      const { container } = render(<WhatsNextTab projects={projects} imageUrls={{}} />);
      const imageArea = container.querySelector(".aspect-\\[4\\/3\\]");
      expect(imageArea).toBeInTheDocument();
    });

    it("cards render in a grid container", () => {
      const projects = [makeProject()];
      const { container } = render(<WhatsNextTab projects={projects} imageUrls={{}} />);
      const grid = container.querySelector(".grid");
      expect(grid).toBeInTheDocument();
    });

    it("project name is rendered as a Link inside the card body", () => {
      const projects = [makeProject({ chartName: "Gallery Style Card" })];
      render(<WhatsNextTab projects={projects} imageUrls={{}} />);
      const link = screen.getByRole("link", { name: "Gallery Style Card" });
      expect(link).toBeInTheDocument();
    });

    it("does not contain hardcoded emerald hover classes", () => {
      const projects = [makeProject()];
      const { container } = render(<WhatsNextTab projects={projects} imageUrls={{}} />);
      expect(container.innerHTML).not.toContain("text-emerald-700");
      expect(container.innerHTML).not.toContain("text-emerald-400");
    });
  });
});

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/__tests__/test-utils";
import { GalleryGrid } from "./gallery-grid";
import { createMockGalleryCard } from "@/__tests__/mocks/factories";
import type { GalleryCardData, SortField, SortDir } from "./gallery-types";

// Mock GalleryCard to avoid deep rendering
vi.mock("./gallery-card", () => ({
  GalleryCard: ({ card }: { card: GalleryCardData }) => (
    <div data-testid={`gallery-card-${card.chartId}`}>{card.name}</div>
  ),
}));

// Mock LinkButton for empty state CTA
vi.mock("@/components/ui/link-button", () => ({
  LinkButton: ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => <a href={href}>{children}</a>,
}));

const defaultProps = {
  cards: [
    createMockGalleryCard({ chartId: "c1", name: "Project Alpha" }),
    createMockGalleryCard({ chartId: "c2", name: "Project Beta" }),
  ],
  view: "gallery" as const,
  sort: "dateAdded" as SortField,
  dir: "desc" as SortDir,
  onSortChange: vi.fn(),
  hasProjects: true,
};

describe("GalleryGrid", () => {
  describe("Gallery view", () => {
    it("renders cards in a grid layout with role='list'", () => {
      render(<GalleryGrid {...defaultProps} />);
      const list = screen.getByRole("list");
      expect(list).toBeInTheDocument();
      expect(list.querySelectorAll("[role='listitem']")).toHaveLength(2);
    });

    it("renders each card via GalleryCard component", () => {
      render(<GalleryGrid {...defaultProps} />);
      expect(screen.getByTestId("gallery-card-c1")).toHaveTextContent(
        "Project Alpha",
      );
      expect(screen.getByTestId("gallery-card-c2")).toHaveTextContent(
        "Project Beta",
      );
    });
  });

  describe("List view", () => {
    it("renders compact rows with project names as links", () => {
      render(<GalleryGrid {...defaultProps} view="list" />);
      const links = screen.getAllByRole("link");
      expect(links.length).toBeGreaterThanOrEqual(2);
      expect(links[0]).toHaveTextContent("Project Alpha");
      expect(links[1]).toHaveTextContent("Project Beta");
    });

    it("shows designer name in list rows", () => {
      render(<GalleryGrid {...defaultProps} view="list" />);
      expect(screen.getAllByText("Test Designer")).toHaveLength(2);
    });
  });

  describe("Table view", () => {
    it("renders an HTML table with column headers", () => {
      render(<GalleryGrid {...defaultProps} view="table" />);
      const table = screen.getByRole("table");
      expect(table).toBeInTheDocument();

      // Check for key column headers
      expect(screen.getByText("Project")).toBeInTheDocument();
      expect(screen.getByText("Status")).toBeInTheDocument();
    });

    it("renders sortable column headers as buttons", () => {
      render(<GalleryGrid {...defaultProps} view="table" />);
      const projectButton = screen.getByRole("button", { name: /Project/i });
      expect(projectButton).toBeInTheDocument();
    });

    it("calls onSortChange when a column header is clicked", () => {
      const onSortChange = vi.fn();
      render(
        <GalleryGrid {...defaultProps} view="table" onSortChange={onSortChange} />,
      );
      const statusButton = screen.getByRole("button", { name: /Status/i });
      statusButton.click();
      expect(onSortChange).toHaveBeenCalledWith("status");
    });

    it("shows aria-sort on active sort column", () => {
      render(
        <GalleryGrid {...defaultProps} view="table" sort="name" dir="asc" />,
      );
      const projectHeader = screen
        .getByRole("button", { name: /Project/i })
        .closest("th");
      expect(projectHeader).toHaveAttribute("aria-sort", "ascending");
    });

    it("renders project name links in table rows", () => {
      render(<GalleryGrid {...defaultProps} view="table" />);
      const links = screen.getAllByRole("link");
      expect(links.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("Empty states", () => {
    it("shows 'No projects match your filters' when cards empty and hasProjects is true", () => {
      render(
        <GalleryGrid
          {...defaultProps}
          cards={[]}
          hasProjects={true}
        />,
      );
      expect(
        screen.getByText("No projects match your filters"),
      ).toBeInTheDocument();
    });

    it("shows 'No projects yet' with Add Project link when hasProjects is false", () => {
      render(
        <GalleryGrid
          {...defaultProps}
          cards={[]}
          hasProjects={false}
        />,
      );
      expect(screen.getByText("No projects yet")).toBeInTheDocument();
      const addLink = screen.getByRole("link", { name: /Add Project/i });
      expect(addLink).toHaveAttribute("href", "/charts/new");
    });
  });
});

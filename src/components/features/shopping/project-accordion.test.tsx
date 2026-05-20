import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/__tests__/test-utils";
import userEvent from "@testing-library/user-event";
import { ProjectAccordion } from "./project-accordion";
import type { ShoppingCartProject } from "@/types/dashboard";
import type { ProjectStatus } from "@/generated/prisma/client";

vi.mock("next/image", () => ({
  default: ({ unoptimized, ...props }: Record<string, unknown>) => (
    <img data-unoptimized={unoptimized ? "true" : undefined} {...props} />
  ),
}));

vi.mock("@/components/features/charts/status-badge", () => ({
  StatusBadge: ({ status }: { status: string }) => <span>{status}</span>,
}));

vi.mock("@/components/features/supplies/color-swatch", () => ({
  ColorSwatch: () => <span data-testid="swatch" />,
}));

function makeProject(overrides?: Partial<ShoppingCartProject>): ShoppingCartProject {
  return {
    projectId: "p1",
    chartId: "c1",
    projectName: "Test Project",
    designerName: "Test Designer",
    coverThumbnailUrl: null,
    focalPointX: null,
    focalPointY: null,
    status: "IN_PROGRESS",
    threadCount: 5,
    beadCount: 0,
    specialtyCount: 0,
    fabricNeeded: false,
    ...overrides,
  };
}

const defaultProps = {
  selectedIds: new Set<string>(),
  threads: [],
  beads: [],
  specialty: [],
  fabrics: [],
  onToggle: vi.fn(),
  onSelectAll: vi.fn(),
  selectAllLabel: "Select all",
  onSelectGroup: vi.fn(),
  collapsedGroups: new Set<ProjectStatus>(),
  onToggleGroup: vi.fn(),
  isSearchActive: false,
  selectedCount: 0,
  totalCount: 0,
  visibleCount: 0,
  visibleSelectedCount: 0,
  onUpdateAcquired: vi.fn(),
  pendingIds: new Set<string>(),
  failedIds: new Set<string>(),
};

describe("ProjectAccordion", () => {
  it("renders project thumbnail with unoptimized prop for presigned URLs", () => {
    const project = makeProject({ coverThumbnailUrl: "thumb-key" });
    render(
      <ProjectAccordion
        {...defaultProps}
        projects={[project]}
        imageUrls={{ "thumb-key": "https://r2.example.com/thumb.jpg" }}
      />,
    );

    const img = screen.getByRole("img", { name: "Test Project" });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "https://r2.example.com/thumb.jpg");
    expect(img).toHaveAttribute("data-unoptimized", "true");
  });

  it("renders placeholder when no thumbnail URL available", () => {
    render(<ProjectAccordion {...defaultProps} projects={[makeProject()]} imageUrls={{}} />);

    expect(screen.queryByRole("img", { name: "Test Project" })).not.toBeInTheDocument();
  });

  describe("Focal point", () => {
    it("applies objectPosition style to thumbnail when focal point is set", () => {
      const project = makeProject({
        coverThumbnailUrl: "thumb-key",
        focalPointX: 0.6,
        focalPointY: 0.2,
      });
      render(
        <ProjectAccordion
          {...defaultProps}
          projects={[project]}
          imageUrls={{ "thumb-key": "https://r2.example.com/thumb.jpg" }}
        />,
      );

      const img = screen.getByRole("img", { name: "Test Project" });
      expect(img).toHaveStyle({ objectPosition: "60% 20%" });
    });

    it("does not apply objectPosition when focal point is null", () => {
      const project = makeProject({
        coverThumbnailUrl: "thumb-key",
        focalPointX: null,
        focalPointY: null,
      });
      render(
        <ProjectAccordion
          {...defaultProps}
          projects={[project]}
          imageUrls={{ "thumb-key": "https://r2.example.com/thumb.jpg" }}
        />,
      );

      const img = screen.getByRole("img", { name: "Test Project" });
      expect(img.style.objectPosition).toBeFalsy();
    });
  });

  describe("Status grouping", () => {
    const kittingProject = makeProject({
      projectId: "pk1",
      projectName: "Kitting Project",
      status: "KITTING",
    });
    const stitchingProject = makeProject({
      projectId: "ps1",
      projectName: "Stitching Project",
      status: "IN_PROGRESS",
    });
    const unstartedProject = makeProject({
      projectId: "pu1",
      projectName: "Unstarted Project",
      status: "UNSTARTED",
    });

    it("projects render within StatusGroup wrappers, not as a flat list", () => {
      render(
        <ProjectAccordion
          {...defaultProps}
          projects={[kittingProject, stitchingProject]}
          imageUrls={{}}
          totalCount={2}
          visibleCount={2}
        />,
      );

      const groups = screen.getAllByRole("group");
      expect(groups.length).toBeGreaterThanOrEqual(2);
    });

    it("status groups appear in canonical order (Kitting, Stitching, On Hold, Unstarted, Ready)", () => {
      render(
        <ProjectAccordion
          {...defaultProps}
          projects={[unstartedProject, kittingProject, stitchingProject]}
          imageUrls={{}}
          totalCount={3}
          visibleCount={3}
        />,
      );

      const groups = screen.getAllByRole("group");
      const labels = groups.map((g) => g.getAttribute("aria-labelledby"));

      const kittingIdx = labels.indexOf("group-KITTING");
      const stitchingIdx = labels.indexOf("group-IN_PROGRESS");
      const unstartedIdx = labels.indexOf("group-UNSTARTED");

      expect(kittingIdx).toBeLessThan(stitchingIdx);
      expect(stitchingIdx).toBeLessThan(unstartedIdx);
    });

    it("status groups with zero projects are not rendered", () => {
      render(
        <ProjectAccordion
          {...defaultProps}
          projects={[kittingProject]}
          imageUrls={{}}
          totalCount={1}
          visibleCount={1}
        />,
      );

      expect(screen.queryByText("Stitching")).not.toBeInTheDocument();
      expect(screen.queryByText("Unstarted")).not.toBeInTheDocument();
    });

    it("clicking 'Select all' on a status group selects all projects in that group", async () => {
      const selectGroup = vi.fn();
      const user = userEvent.setup();
      render(
        <ProjectAccordion
          {...defaultProps}
          projects={[kittingProject, stitchingProject]}
          imageUrls={{}}
          onSelectGroup={selectGroup}
          totalCount={2}
          visibleCount={2}
        />,
      );

      const selectAllButtons = screen.getAllByRole("button", { name: /Select all.*projects/ });
      await user.click(selectAllButtons[0]);

      expect(selectGroup).toHaveBeenCalled();
    });

    it("all groups start expanded", () => {
      render(
        <ProjectAccordion
          {...defaultProps}
          projects={[kittingProject, stitchingProject]}
          imageUrls={{}}
          totalCount={2}
          visibleCount={2}
        />,
      );

      expect(screen.getByText("Kitting Project")).toBeInTheDocument();
      expect(screen.getByText("Stitching Project")).toBeInTheDocument();
    });

    it("clicking a group header toggles its collapsed state", async () => {
      const toggleGroup = vi.fn();
      const user = userEvent.setup();
      render(
        <ProjectAccordion
          {...defaultProps}
          projects={[kittingProject]}
          imageUrls={{}}
          onToggleGroup={toggleGroup}
          totalCount={1}
          visibleCount={1}
        />,
      );

      const toggleBtn = document.getElementById("group-KITTING");
      expect(toggleBtn).toBeInTheDocument();
      await user.click(toggleBtn!);

      expect(toggleGroup).toHaveBeenCalledWith("KITTING");
    });

    it('shows empty state "No projects match your search" when search filters all projects', () => {
      render(
        <ProjectAccordion
          {...defaultProps}
          projects={[]}
          imageUrls={{}}
          isSearchActive={true}
          totalCount={3}
          visibleCount={0}
        />,
      );

      expect(screen.getByText("No projects match your search")).toBeInTheDocument();
    });
  });
});

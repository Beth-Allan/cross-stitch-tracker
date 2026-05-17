import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/__tests__/test-utils";
import { ProjectAccordion } from "./project-accordion";
import type { ShoppingCartProject } from "@/types/dashboard";

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
});

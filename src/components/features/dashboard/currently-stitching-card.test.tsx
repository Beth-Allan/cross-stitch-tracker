import { render, screen } from "@/__tests__/test-utils";
import { describe, expect, it, vi } from "vitest";
import { CurrentlyStitchingCard } from "./currently-stitching-card";
import type { CurrentlyStitchingProject } from "@/types/dashboard";

// Mock next/link
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

// Mock CoverPlaceholder
vi.mock("@/components/features/gallery/cover-placeholder", () => ({
  CoverPlaceholder: ({ status }: { status: string }) => (
    <div data-testid="cover-placeholder">{status}</div>
  ),
}));

// Mock StatusBadge
vi.mock("@/components/features/charts/status-badge", () => ({
  StatusBadge: ({ status }: { status: string }) => <span data-testid="status-badge">{status}</span>,
}));

function createMockProject(
  overrides?: Partial<CurrentlyStitchingProject>,
): CurrentlyStitchingProject {
  return {
    projectId: "proj-1",
    chartId: "chart-1",
    projectName: "Enchanted Forest Sampler",
    designerName: "Heaven and Earth Designs",
    coverThumbnailUrl: null,
    focalPointX: null,
    focalPointY: null,
    status: "IN_PROGRESS",
    stitchesCompleted: 15000,
    totalStitches: 45200,
    progressPercent: 33,
    lastSessionDate: new Date("2026-04-15"),
    totalTimeMinutes: 120,
    stitchingDays: 5,
    ...overrides,
  };
}

describe("CurrentlyStitchingCard", () => {
  it("renders project name, designer name, and progress percent", () => {
    const project = createMockProject();
    render(<CurrentlyStitchingCard project={project} imageUrl={null} />);

    expect(screen.getByText("Enchanted Forest Sampler")).toBeInTheDocument();
    expect(screen.getByText("Heaven and Earth Designs")).toBeInTheDocument();
    expect(screen.getByText("33%")).toBeInTheDocument();
  });

  it("renders progress bar with correct width style", () => {
    const project = createMockProject({ progressPercent: 45 });
    const { container } = render(<CurrentlyStitchingCard project={project} imageUrl={null} />);

    const fills = container.querySelectorAll("[style]");
    const progressFill = Array.from(fills).find((el) =>
      (el as HTMLElement).style.width?.includes("45%"),
    );
    expect(progressFill).toBeTruthy();
  });

  it("renders link to /charts/{chartId}", () => {
    const project = createMockProject({ chartId: "chart-abc" });
    render(<CurrentlyStitchingCard project={project} imageUrl={null} />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/charts/chart-abc");
  });

  it("renders '0%' when progressPercent is 0", () => {
    const project = createMockProject({ progressPercent: 0 });
    render(<CurrentlyStitchingCard project={project} imageUrl={null} />);

    expect(screen.getByText("0%")).toBeInTheDocument();
  });

  describe("Focal point", () => {
    it("applies objectPosition style to cover image when focal point is set", () => {
      const project = createMockProject({ focalPointX: 0.1, focalPointY: 0.9 });
      render(<CurrentlyStitchingCard project={project} imageUrl="https://example.com/thumb.jpg" />);

      const img = screen.getByRole("img", { name: "Enchanted Forest Sampler" });
      expect(img).toHaveStyle({ objectPosition: "10% 90%" });
    });

    it("does not apply objectPosition when focal point is null", () => {
      const project = createMockProject({ focalPointX: null, focalPointY: null });
      render(<CurrentlyStitchingCard project={project} imageUrl="https://example.com/thumb.jpg" />);

      const img = screen.getByRole("img", { name: "Enchanted Forest Sampler" });
      expect(img.style.objectPosition).toBeFalsy();
    });
  });
});

import { render, screen } from "@/__tests__/test-utils";
import { describe, expect, it, vi } from "vitest";
import { SpotlightCard } from "./spotlight-card";
import type { SpotlightProject } from "@/types/dashboard";

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

// Mock LinkButton
vi.mock("@/components/ui/link-button", () => ({
  LinkButton: ({
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

// Mock server actions
vi.mock("@/lib/actions/dashboard-actions", () => ({
  getSpotlightProject: vi.fn(),
}));

vi.mock("@/lib/actions/upload-actions", () => ({
  getPresignedImageUrls: vi.fn().mockResolvedValue({}),
}));

function createMockSpotlight(overrides?: Partial<SpotlightProject>): SpotlightProject {
  return {
    projectId: "proj-spotlight",
    chartId: "chart-spotlight",
    projectName: "Maritime Mystery SAL",
    designerName: "Long Dog Samplers",
    coverThumbnailUrl: null,
    coverImageUrl: null,
    status: "IN_PROGRESS",
    genres: ["Animals", "Sampler"],
    totalStitches: 34000,
    progressPercent: 42,
    ...overrides,
  };
}

describe("SpotlightCard", () => {
  it("renders project name, designer name, and genre tags", () => {
    render(<SpotlightCard project={createMockSpotlight()} imageUrl={null} />);

    expect(screen.getByText("Maritime Mystery SAL")).toBeInTheDocument();
    expect(screen.getByText("Long Dog Samplers")).toBeInTheDocument();
    expect(screen.getByText("Animals")).toBeInTheDocument();
    expect(screen.getByText("Sampler")).toBeInTheDocument();
  });

  it("renders 'Check It Out' link button", () => {
    render(<SpotlightCard project={createMockSpotlight()} imageUrl={null} />);

    expect(screen.getByText("Check It Out")).toBeInTheDocument();
  });

  it("renders 'Shuffle Spotlight' button", () => {
    render(<SpotlightCard project={createMockSpotlight()} imageUrl={null} />);

    expect(screen.getByText("Shuffle Spotlight")).toBeInTheDocument();
  });

  it("returns null when project is null", () => {
    const { container } = render(<SpotlightCard project={null} imageUrl={null} />);

    expect(container.innerHTML).toBe("");
  });
});

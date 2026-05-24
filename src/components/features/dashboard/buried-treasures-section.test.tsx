import { render, screen } from "@/__tests__/test-utils";
import { describe, it, expect, vi } from "vitest";
import type { BuriedTreasure } from "@/types/dashboard";

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

// Mock cover placeholder
vi.mock("@/components/features/gallery/cover-placeholder", () => ({
  CoverPlaceholder: ({ status }: { status: string }) => (
    <div data-testid="cover-placeholder" data-status={status} />
  ),
}));

// Mock section heading
vi.mock("./section-heading", () => ({
  SectionHeading: ({ title }: { title: string }) => <h2>{title}</h2>,
}));

// Mock focal-point utility
vi.mock("@/lib/utils/focal-point", () => ({
  getObjectPositionStyle: () => ({}),
}));

// Mock lucide-react
vi.mock("lucide-react", () => ({
  ChevronRight: () => <div data-testid="chevron" />,
}));

function createTreasure(overrides: Partial<BuriedTreasure> = {}): BuriedTreasure {
  return {
    chartId: "chart-1",
    projectId: null,
    chartName: "Test Chart",
    designerName: "Test Designer",
    coverThumbnailUrl: null,
    dateAdded: new Date("2024-01-01"),
    daysInLibrary: 100,
    genres: ["Fantasy"],
    focalPointX: null,
    focalPointY: null,
    ...overrides,
  };
}

const { BuriedTreasuresSection } = await import("./buried-treasures-section");

describe("BuriedTreasuresSection", () => {
  it("returns null when treasures array is empty", () => {
    const { container } = render(<BuriedTreasuresSection treasures={[]} imageUrls={{}} />);
    expect(container.innerHTML).toBe("");
  });

  it("renders correct number of treasure items", () => {
    const treasures = [
      createTreasure({ chartId: "c1", chartName: "Chart A" }),
      createTreasure({ chartId: "c2", chartName: "Chart B" }),
      createTreasure({ chartId: "c3", chartName: "Chart C" }),
    ];

    render(<BuriedTreasuresSection treasures={treasures} imageUrls={{}} />);

    expect(screen.getByText("Chart A")).toBeInTheDocument();
    expect(screen.getByText("Chart B")).toBeInTheDocument();
    expect(screen.getByText("Chart C")).toBeInTheDocument();
  });

  it('displays "23" number and "days in library" for 23 days (no duplication)', () => {
    const treasures = [createTreasure({ daysInLibrary: 23 })];

    render(<BuriedTreasuresSection treasures={treasures} imageUrls={{}} />);

    expect(screen.getByText("23")).toBeInTheDocument();
    expect(screen.getByText("days in library")).toBeInTheDocument();
    // The number should NOT appear inside the unit label
    expect(screen.queryByText("23 days in library")).not.toBeInTheDocument();
  });

  it('displays "6" number and "months in library" for 200 days', () => {
    const treasures = [createTreasure({ daysInLibrary: 200 })];

    render(<BuriedTreasuresSection treasures={treasures} imageUrls={{}} />);

    expect(screen.getByText("6")).toBeInTheDocument();
    expect(screen.getByText("months in library")).toBeInTheDocument();
  });

  it('displays "1" number and "years in library" for 400 days', () => {
    const treasures = [createTreasure({ daysInLibrary: 400 })];

    render(<BuriedTreasuresSection treasures={treasures} imageUrls={{}} />);

    // Both the index (1) and age number (1) are "1", so use getAllByText
    const ones = screen.getAllByText("1");
    expect(ones.length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("years in library")).toBeInTheDocument();
  });
});

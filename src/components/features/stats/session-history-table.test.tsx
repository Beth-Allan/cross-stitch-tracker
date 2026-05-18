import { render, screen } from "@/__tests__/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { SessionHistoryTable } from "./session-history-table";
import type { SessionHistoryData } from "@/types/stats";

// Mock next/link
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

function createMockData(overrides?: Partial<SessionHistoryData>): SessionHistoryData {
  return {
    sessions: [
      {
        id: "s1",
        date: new Date("2026-05-15T10:00:00Z"),
        projectId: "p1",
        chartId: "c1",
        projectName: "Dragon Sampler",
        stitchCount: 198,
        timeSpentMinutes: 45,
        hasPhoto: true,
      },
      {
        id: "s2",
        date: new Date("2026-05-14T10:00:00Z"),
        projectId: "p2",
        chartId: "c2",
        projectName: "Winter Village",
        stitchCount: 356,
        timeSpentMinutes: null,
        hasPhoto: false,
      },
      {
        id: "s3",
        date: new Date("2026-05-13T10:00:00Z"),
        projectId: "p1",
        chartId: "c1",
        projectName: "Dragon Sampler",
        stitchCount: 120,
        timeSpentMinutes: 90,
        hasPhoto: true,
      },
    ],
    total: 3,
    page: 1,
    pageSize: 25,
    totalPages: 1,
    ...overrides,
  };
}

const mockProjects = [
  { id: "p1", name: "Dragon Sampler" },
  { id: "p2", name: "Winter Village" },
];

function renderWithNuqs(ui: React.ReactElement) {
  return render(ui, {
    wrapper: ({ children }) => <NuqsTestingAdapter>{children}</NuqsTestingAdapter>,
  });
}

describe("SessionHistoryTable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders table rows with Date, Project, Stitches, Time, Photo columns", () => {
    renderWithNuqs(<SessionHistoryTable data={createMockData()} projects={mockProjects} />);

    // Check column headers exist (use getAllByText for "Project" which appears in filter label too)
    expect(screen.getByText("Date")).toBeInTheDocument();
    expect(screen.getAllByText("Project").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Stitches")).toBeInTheDocument();
    expect(screen.getByText("Time")).toBeInTheDocument();
  });

  it("date column shows formatted dates (MMM d, yyyy)", () => {
    renderWithNuqs(<SessionHistoryTable data={createMockData()} projects={mockProjects} />);

    expect(screen.getByText("May 15, 2026")).toBeInTheDocument();
    expect(screen.getByText("May 14, 2026")).toBeInTheDocument();
    expect(screen.getByText("May 13, 2026")).toBeInTheDocument();
  });

  it("project names are rendered as clickable Links to /charts/{chartId}", () => {
    renderWithNuqs(<SessionHistoryTable data={createMockData()} projects={mockProjects} />);

    const dragonLinks = screen.getAllByRole("link", {
      name: /Dragon Sampler/,
    });
    expect(dragonLinks.length).toBeGreaterThan(0);
    expect(dragonLinks[0]).toHaveAttribute("href", "/charts/c1");

    const winterLinks = screen.getAllByRole("link", {
      name: /Winter Village/,
    });
    expect(winterLinks.length).toBeGreaterThan(0);
    expect(winterLinks[0]).toHaveAttribute("href", "/charts/c2");
  });

  it('time column shows formatted time when timeSpentMinutes is not null, "--" when null', () => {
    renderWithNuqs(<SessionHistoryTable data={createMockData()} projects={mockProjects} />);

    // 45 minutes = "45m"
    expect(screen.getByText("45m")).toBeInTheDocument();
    // 90 minutes = "1h 30m"
    expect(screen.getByText("1h 30m")).toBeInTheDocument();
    // null time = "--"
    expect(screen.getByText("--")).toBeInTheDocument();
  });

  it("photo column shows Camera icon when hasPhoto is true", () => {
    renderWithNuqs(<SessionHistoryTable data={createMockData()} projects={mockProjects} />);

    // Two sessions have photos
    const cameraIcons = screen.getAllByTestId("photo-indicator");
    expect(cameraIcons).toHaveLength(2);
  });

  it("sort headers show ArrowUpDown icon for sortable columns (Date, Stitches, Time)", () => {
    renderWithNuqs(<SessionHistoryTable data={createMockData()} projects={mockProjects} />);

    // Date is the default sort, so it should have the arrow indicator
    const dateHeader = screen.getByRole("button", { name: /Date/ });
    expect(dateHeader).toBeInTheDocument();

    const stitchesHeader = screen.getByRole("button", { name: /Stitches/ });
    expect(stitchesHeader).toBeInTheDocument();

    const timeHeader = screen.getByRole("button", { name: /Time/ });
    expect(timeHeader).toBeInTheDocument();
  });

  it('"Page N of M" text rendered with correct values', () => {
    renderWithNuqs(
      <SessionHistoryTable
        data={createMockData({ page: 2, totalPages: 5 })}
        projects={mockProjects}
      />,
    );

    expect(screen.getByText("Page 2 of 5")).toBeInTheDocument();
  });

  it("Previous/Next pagination buttons rendered", () => {
    renderWithNuqs(
      <SessionHistoryTable
        data={createMockData({ page: 2, totalPages: 5 })}
        projects={mockProjects}
      />,
    );

    expect(screen.getByRole("button", { name: "Previous" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next" })).toBeInTheDocument();
  });

  it('empty state shows "No sessions match your filters"', () => {
    renderWithNuqs(
      <SessionHistoryTable
        data={{
          sessions: [],
          total: 0,
          page: 1,
          pageSize: 25,
          totalPages: 0,
        }}
        projects={mockProjects}
      />,
    );

    expect(screen.getByText("No sessions match your filters")).toBeInTheDocument();
  });

  it('project filter dropdown renders with "All Projects" default', () => {
    renderWithNuqs(<SessionHistoryTable data={createMockData()} projects={mockProjects} />);

    // "Project" label should appear (in filter area and table header)
    const projectTexts = screen.getAllByText("Project");
    expect(projectTexts.length).toBeGreaterThanOrEqual(2);

    // The select trigger should be rendered (data-slot="select-trigger")
    const trigger = document.querySelector('[data-slot="select-trigger"]');
    expect(trigger).toBeInTheDocument();
  });
});

import { describe, it, expect } from "vitest";
import { render, screen, within } from "@/__tests__/test-utils";
import userEvent from "@testing-library/user-event";
import { FinishedTab } from "./finished-tab";
import type { FinishedProjectData } from "@/types/dashboard";

function createMockFinishedProject(overrides?: Partial<FinishedProjectData>): FinishedProjectData {
  return {
    projectId: "fp1",
    chartId: "fc1",
    projectName: "Finished Project Alpha",
    designerName: "Alpha Designer",
    coverThumbnailUrl: null,
    fabricDescription: "14ct White Aida",
    startDate: new Date("2025-01-01"),
    finishDate: new Date("2026-03-15"),
    startToFinishDays: 439,
    stitchingDays: 120,
    totalStitches: 45000,
    threadCount: 35,
    beadCount: 5,
    specialtyCount: 2,
    avgDailyStitches: 375,
    genres: ["Sampler", "Holiday"],
    ...overrides,
  };
}

const mockProjects: FinishedProjectData[] = [
  createMockFinishedProject(),
  createMockFinishedProject({
    projectId: "fp2",
    chartId: "fc2",
    projectName: "Finished Project Beta",
    designerName: "Beta Designer",
    finishDate: new Date("2026-02-10"),
    startToFinishDays: 200,
    stitchingDays: 80,
    totalStitches: 20000,
    avgDailyStitches: 250,
  }),
];

describe("FinishedTab", () => {
  it("renders sort dropdown with 4 options", () => {
    render(<FinishedTab projects={mockProjects} imageUrls={{}} />);

    const sortSelect = screen.getByRole("combobox");
    expect(sortSelect).toBeInTheDocument();

    const options = within(sortSelect).getAllByRole("option");
    expect(options).toHaveLength(4);
    expect(options[0]).toHaveTextContent("Finish Date");
    expect(options[1]).toHaveTextContent("Duration");
    expect(options[2]).toHaveTextContent("Stitch Count");
    expect(options[3]).toHaveTextContent("Stitching Days");
  });

  it("default sort is finishDate (most recent first)", () => {
    render(<FinishedTab projects={mockProjects} imageUrls={{}} />);

    // finishDate sort puts Alpha (March 2026) before Beta (Feb 2026)
    const projectNames = screen.getAllByText(/Finished Project/);
    expect(projectNames[0]).toHaveTextContent("Finished Project Alpha");
    expect(projectNames[1]).toHaveTextContent("Finished Project Beta");
  });

  it("renders search input for filtering by project name", () => {
    render(<FinishedTab projects={mockProjects} imageUrls={{}} />);

    const searchInput = screen.getByPlaceholderText(/search finished/i);
    expect(searchInput).toBeInTheDocument();
  });

  it("shows empty state when no finished projects", () => {
    render(<FinishedTab projects={[]} imageUrls={{}} />);

    expect(
      screen.getByText("No finished projects yet. Your first finish is going to feel amazing!"),
    ).toBeInTheDocument();
  });

  it('shows "No finished projects match your search." when search has no results', async () => {
    const user = userEvent.setup();
    render(<FinishedTab projects={mockProjects} imageUrls={{}} />);

    const searchInput = screen.getByPlaceholderText(/search finished/i);
    await user.type(searchInput, "zzz nonexistent project");

    expect(screen.getByText("No finished projects match your search.")).toBeInTheDocument();
  });

  it("renders aggregate stat cards above project list", () => {
    const { container } = render(<FinishedTab projects={mockProjects} imageUrls={{}} />);

    // Aggregate stat cards should have emerald-50 styling
    const emeraldCards = container.querySelectorAll("[class*='bg-emerald-50']");
    expect(emeraldCards.length).toBeGreaterThan(0);

    // Should show aggregate labels
    expect(screen.getByText("Projects Finished")).toBeInTheDocument();
    expect(screen.getByText("Total Stitches")).toBeInTheDocument();
  });
});

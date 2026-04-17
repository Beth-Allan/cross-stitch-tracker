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

  it("renders kitting bar emerald at 100%", () => {
    const projects = [makeProject({ kittingPercent: 100 })];
    render(<WhatsNextTab projects={projects} imageUrls={{}} />);

    expect(screen.getByText("Fully kitted")).toBeInTheDocument();
    const bar = screen.getByTestId("kitting-bar-chart-1");
    expect(bar.className).toContain("bg-emerald-500");
  });

  it("renders kitting bar amber below 100%", () => {
    const projects = [makeProject({ kittingPercent: 50 })];
    render(<WhatsNextTab projects={projects} imageUrls={{}} />);

    expect(screen.getByText("Kitting")).toBeInTheDocument();
    const bar = screen.getByTestId("kitting-bar-chart-1");
    expect(bar.className).toContain("bg-amber-400");
  });

  it("shows star icon for wantToStartNext projects", () => {
    const projects = [makeProject({ wantToStartNext: true })];
    render(<WhatsNextTab projects={projects} imageUrls={{}} />);

    expect(screen.getByTestId("star-icon-chart-1")).toBeInTheDocument();
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
    expect(
      screen.getByText("1 project ready or getting ready to stitch"),
    ).toBeInTheDocument();

    const { unmount } = render(
      <WhatsNextTab
        projects={[makeProject({ chartId: "c1" }), makeProject({ chartId: "c2" })]}
        imageUrls={{}}
      />,
    );
    expect(
      screen.getByText("2 projects ready or getting ready to stitch"),
    ).toBeInTheDocument();
    unmount();
  });

  it("renders empty state when no projects", () => {
    render(<WhatsNextTab projects={[]} imageUrls={{}} />);

    expect(
      screen.getByText(/No projects queued up/),
    ).toBeInTheDocument();
  });

  it("card links to /charts/{chartId}", () => {
    const projects = [makeProject({ chartId: "chart-abc" })];
    render(<WhatsNextTab projects={projects} imageUrls={{}} />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/charts/chart-abc");
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
    expect(links[0]).toHaveAttribute("href", "/charts/large");
    expect(links[1]).toHaveAttribute("href", "/charts/small");
  });
});

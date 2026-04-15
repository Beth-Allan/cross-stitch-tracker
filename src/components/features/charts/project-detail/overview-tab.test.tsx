import { describe, it, expect } from "vitest";
import { render, screen } from "@/__tests__/test-utils";
import { OverviewTab } from "./overview-tab";
import type { ProjectDetailProps } from "./types";

type ChartProp = ProjectDetailProps["chart"];
type SuppliesProp = ProjectDetailProps["supplies"];

function makeChart(
  overrides: {
    project?: Partial<NonNullable<ChartProp["project"]>>;
    chart?: Partial<ChartProp>;
  } = {},
): ChartProp {
  return {
    id: "chart-1",
    name: "Test Pattern",
    stitchCount: 45000,
    stitchesWide: 300,
    stitchesHigh: 150,
    coverImageUrl: null,
    coverThumbnailUrl: null,
    digitalWorkingCopyUrl: null,
    notes: null,
    dateAdded: new Date("2025-01-01"),
    designer: { id: "d-1", name: "Test Designer" },
    genres: [{ id: "g-1", name: "Sampler" }],
    ...overrides.chart,
    project: {
      id: "proj-1",
      userId: "user-1",
      status: "IN_PROGRESS",
      startDate: new Date("2025-01-15"),
      finishDate: null,
      ffoDate: null,
      startingStitches: 0,
      stitchesCompleted: 12000,
      strandCount: 2,
      overCount: 2,
      wastePercent: 20,
      storageLocation: { id: "sl-1", name: "Craft Room" },
      stitchingApp: { id: "sa-1", name: "Pattern Keeper" },
      fabric: { id: "f-1", name: "White Aida", count: 14, brand: { name: "Charles Craft" } },
      ...overrides.project,
    },
  };
}

function makeSupplies(overrides: Partial<NonNullable<SuppliesProp>> = {}): SuppliesProp {
  return {
    threads: [],
    beads: [],
    specialty: [],
    ...overrides,
  };
}

describe("OverviewTab", () => {
  describe("section ordering by status", () => {
    it("renders Progress section first for IN_PROGRESS", () => {
      const chart = makeChart({ project: { status: "IN_PROGRESS" } });
      render(<OverviewTab chart={chart} supplies={makeSupplies()} />);

      const headings = screen.getAllByRole("heading", { level: 3 });
      const headingTexts = headings.map((h) => h.textContent);

      expect(headingTexts.indexOf("Stitching Progress")).toBeLessThan(
        headingTexts.indexOf("Pattern Details"),
      );
    });

    it("renders Kitting Checklist first for UNSTARTED", () => {
      const chart = makeChart({ project: { status: "UNSTARTED", stitchesCompleted: 0 } });
      render(<OverviewTab chart={chart} supplies={makeSupplies()} />);

      const headings = screen.getAllByRole("heading", { level: 3 });
      const headingTexts = headings.map((h) => h.textContent);

      expect(headingTexts.indexOf("Kitting Checklist")).toBeLessThan(
        headingTexts.indexOf("Pattern Details"),
      );
    });

    it("renders Completion section first for FINISHED", () => {
      const chart = makeChart({
        project: {
          status: "FINISHED",
          finishDate: new Date("2025-06-01"),
          stitchesCompleted: 45000,
        },
      });
      render(<OverviewTab chart={chart} supplies={makeSupplies()} />);

      const headings = screen.getAllByRole("heading", { level: 3 });
      const headingTexts = headings.map((h) => h.textContent);

      expect(headingTexts.indexOf("Completion")).toBeLessThan(
        headingTexts.indexOf("Pattern Details"),
      );
    });

    it("does NOT render Progress or Kitting for KITTED", () => {
      const chart = makeChart({ project: { status: "KITTED", stitchesCompleted: 0 } });
      render(<OverviewTab chart={chart} supplies={makeSupplies()} />);

      expect(screen.queryByText("Stitching Progress")).not.toBeInTheDocument();
      expect(screen.queryByText("Kitting Checklist")).not.toBeInTheDocument();
    });
  });

  describe("Pattern Details section", () => {
    it("always renders Pattern Details", () => {
      const chart = makeChart();
      render(<OverviewTab chart={chart} supplies={makeSupplies()} />);

      expect(screen.getByText("Pattern Details")).toBeInTheDocument();
    });

    it("shows stitch count formatted with commas", () => {
      const chart = makeChart({ chart: { stitchCount: 45000 } });
      render(<OverviewTab chart={chart} supplies={makeSupplies()} />);

      expect(screen.getByText("45,000")).toBeInTheDocument();
    });

    it("shows dimensions when available", () => {
      const chart = makeChart({ chart: { stitchesWide: 300, stitchesHigh: 150 } });
      render(<OverviewTab chart={chart} supplies={makeSupplies()} />);

      expect(screen.getByText(/300w\s*[x\u00D7]\s*150h/)).toBeInTheDocument();
    });

    it("shows designer name", () => {
      const chart = makeChart();
      render(<OverviewTab chart={chart} supplies={makeSupplies()} />);

      expect(screen.getByText("Test Designer")).toBeInTheDocument();
    });

    it("shows genre names", () => {
      const chart = makeChart({
        chart: {
          genres: [
            { id: "g-1", name: "Sampler" },
            { id: "g-2", name: "Animals" },
          ],
        },
      });
      render(<OverviewTab chart={chart} supplies={makeSupplies()} />);

      expect(screen.getByText(/Sampler/)).toBeInTheDocument();
      expect(screen.getByText(/Animals/)).toBeInTheDocument();
    });
  });

  describe("Dates section", () => {
    it("shows formatted date added", () => {
      const chart = makeChart();
      render(<OverviewTab chart={chart} supplies={makeSupplies()} />);

      // formatDate produces "Jan 1, 2025" style
      expect(screen.getByText(/Jan/)).toBeInTheDocument();
    });

    it("shows formatted start date when present", () => {
      const chart = makeChart({ project: { startDate: new Date("2025-01-15") } });
      render(<OverviewTab chart={chart} supplies={makeSupplies()} />);

      expect(screen.getByText(/Jan 15, 2025/)).toBeInTheDocument();
    });

    it("shows finish date for completed projects", () => {
      const chart = makeChart({
        project: {
          status: "FINISHED",
          finishDate: new Date("2025-06-01"),
          stitchesCompleted: 45000,
        },
      });
      render(<OverviewTab chart={chart} supplies={makeSupplies()} />);

      // Date appears in both Completion and Dates sections
      const matches = screen.getAllByText(/Jun 1, 2025/);
      expect(matches.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Project Setup section", () => {
    it("shows storage location name", () => {
      const chart = makeChart();
      render(<OverviewTab chart={chart} supplies={makeSupplies()} />);

      expect(screen.getByText("Craft Room")).toBeInTheDocument();
    });

    it("shows stitching app name", () => {
      const chart = makeChart();
      render(<OverviewTab chart={chart} supplies={makeSupplies()} />);

      expect(screen.getByText("Pattern Keeper")).toBeInTheDocument();
    });

    it("shows fabric name and count", () => {
      const chart = makeChart();
      render(<OverviewTab chart={chart} supplies={makeSupplies()} />);

      expect(screen.getByText(/White Aida/)).toBeInTheDocument();
      expect(screen.getByText(/14/)).toBeInTheDocument();
    });
  });

  describe("Progress section", () => {
    it("shows ProgressBar for IN_PROGRESS status", () => {
      const chart = makeChart({ project: { status: "IN_PROGRESS", stitchesCompleted: 12000 } });
      render(<OverviewTab chart={chart} supplies={makeSupplies()} />);

      expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });

    it("shows completed stitch count", () => {
      const chart = makeChart({ project: { status: "IN_PROGRESS", stitchesCompleted: 12000 } });
      render(<OverviewTab chart={chart} supplies={makeSupplies()} />);

      expect(screen.getByText(/12,000/)).toBeInTheDocument();
    });
  });

  describe("Kitting Checklist", () => {
    it("shows fabric status for UNSTARTED", () => {
      const chart = makeChart({ project: { status: "UNSTARTED", stitchesCompleted: 0 } });
      render(<OverviewTab chart={chart} supplies={makeSupplies()} />);

      expect(screen.getByText("Kitting Checklist")).toBeInTheDocument();
      // Fabric text appears in both Kitting Checklist and Project Setup sections
      const fabricMatches = screen.getAllByText(/White Aida/);
      expect(fabricMatches.length).toBeGreaterThanOrEqual(1);
    });

    it("shows digital copy status", () => {
      const chart = makeChart({
        chart: { digitalWorkingCopyUrl: "https://example.com/file.pdf" },
        project: { status: "UNSTARTED", stitchesCompleted: 0 },
      });
      render(<OverviewTab chart={chart} supplies={makeSupplies()} />);

      expect(screen.getByText(/Digital Copy/i)).toBeInTheDocument();
    });
  });

  describe("Completion section", () => {
    it("shows finish date for FINISHED status", () => {
      const chart = makeChart({
        project: {
          status: "FINISHED",
          finishDate: new Date("2025-06-15"),
          stitchesCompleted: 45000,
        },
      });
      render(<OverviewTab chart={chart} supplies={makeSupplies()} />);

      expect(screen.getByText("Completion")).toBeInTheDocument();
      // Date appears in both Completion and Dates sections
      const dateMatches = screen.getAllByText(/Jun 15, 2025/);
      expect(dateMatches.length).toBeGreaterThanOrEqual(1);
    });

    it("shows FFO date for FFO status", () => {
      const chart = makeChart({
        project: {
          status: "FFO",
          finishDate: new Date("2025-06-15"),
          ffoDate: new Date("2025-07-01"),
          stitchesCompleted: 45000,
        },
      });
      render(<OverviewTab chart={chart} supplies={makeSupplies()} />);

      // FFO date appears in both Completion and Dates sections
      const ffoMatches = screen.getAllByText(/Jul 1, 2025/);
      expect(ffoMatches.length).toBeGreaterThanOrEqual(1);
    });
  });
});

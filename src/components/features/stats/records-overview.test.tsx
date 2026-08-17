import { render, screen } from "@/__tests__/test-utils";
import { describe, it, expect, vi } from "vitest";
import type { PersonalBestRecord, FastestCompletion, CompletionEstimate } from "@/types/stats";

vi.mock("./records-table", () => ({
  RecordsTable: () => <div data-testid="records-table" />,
}));

vi.mock("./completion-estimates-section", () => ({
  CompletionEstimatesSection: () => <div data-testid="completion-estimates-section" />,
}));

vi.mock("@/components/ui/data-unavailable", () => ({
  DataUnavailable: (props: Record<string, unknown>) => (
    <div data-testid="data-unavailable" data-label={props.label} />
  ),
}));

import { RecordsOverview } from "./records-overview";

const mockPersonalBests: PersonalBestRecord[] = [
  {
    type: "bestDay",
    label: "Best Day",
    value: 500,
    unit: "stitches",
    date: "2026-01-15",
    projectId: "p1",
    projectName: "Test Project",
  },
];

const mockFastestCompletions: FastestCompletion[] = [
  {
    sizeCategory: "Medium" as const,
    projectId: "p1",
    chartId: "c1",
    projectName: "Test Project",
    daysToComplete: 30,
    startDate: "2025-12-16",
    finishDate: "2026-01-15",
  },
];

const mockCompletionEstimates: CompletionEstimate[] = [
  {
    projectId: "p1",
    chartId: "c1",
    projectName: "Test Project",
    totalStitches: 50000,
    stitchesCompleted: 25000,
    percentComplete: 50,
    estimatedDate: "~2026-06-01",
    avgPerDay: 200,
  },
];

function renderRecords(overrides: Partial<Parameters<typeof RecordsOverview>[0]> = {}) {
  return render(
    <RecordsOverview
      personalBests={mockPersonalBests}
      fastestCompletions={mockFastestCompletions}
      completionEstimates={mockCompletionEstimates}
      totalSessionStitches={125000}
      hasNoSessions={false}
      {...overrides}
    />,
  );
}

describe("RecordsOverview", () => {
  it("renders empty state when hasNoSessions is true", () => {
    renderRecords({ hasNoSessions: true });

    expect(screen.getByText("No records yet")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Log your first stitching session to start tracking personal bests and records.",
      ),
    ).toBeInTheDocument();
  });

  it('renders session hero stat with formatted number and "STITCHES LOGGED" label', () => {
    renderRecords();

    expect(screen.getByText("STITCHES LOGGED")).toBeInTheDocument();
    expect(screen.getByText("125,000")).toBeInTheDocument();
  });

  it("renders RecordsTable when personalBests and fastestCompletions provided", () => {
    renderRecords();

    expect(screen.getByTestId("records-table")).toBeInTheDocument();
  });

  it("renders CompletionEstimatesSection", () => {
    renderRecords();

    expect(screen.getByTestId("completion-estimates-section")).toBeInTheDocument();
  });

  it("shows DataUnavailable when personalBests null", () => {
    renderRecords({ personalBests: null });

    const unavailable = screen.getAllByTestId("data-unavailable");
    expect(unavailable.some((el) => el.getAttribute("data-label") === "Personal records")).toBe(
      true,
    );
  });

  it("does NOT render a time-scope toggle", () => {
    renderRecords();

    expect(screen.queryByText("All-time")).not.toBeInTheDocument();
    expect(screen.queryByRole("group", { name: "Time scope" })).not.toBeInTheDocument();
  });

  it("does NOT render insight lists", () => {
    renderRecords();

    expect(screen.queryByTestId("thread-insight-list")).not.toBeInTheDocument();
    expect(screen.queryByTestId("designer-insight-list")).not.toBeInTheDocument();
    expect(screen.queryByTestId("genre-insight-list")).not.toBeInTheDocument();
  });

  it("shows DataUnavailable when totalSessionStitches is null", () => {
    renderRecords({ totalSessionStitches: null });

    expect(screen.queryByText("STITCHES LOGGED")).not.toBeInTheDocument();
    const unavailable = screen.getAllByTestId("data-unavailable");
    expect(unavailable.some((el) => el.getAttribute("data-label") === "Stitches logged")).toBe(
      true,
    );
  });
});

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/__tests__/test-utils";
import { ProjectSessionsTab } from "./project-sessions-tab";
import type {
  StitchSessionRow,
  ProjectSessionStats,
  ActiveProjectForPicker,
} from "@/types/session";

// ─── Mocks ──────────────────────────────────────────────────────────────────

vi.mock("@/lib/actions/session-actions", () => ({
  createSession: vi.fn(),
  updateSession: vi.fn(),
  deleteSession: vi.fn(),
}));

vi.mock("@/lib/actions/upload-actions", () => ({
  getPresignedUploadUrl: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn(),
  }),
}));

// ─── Test Data ──────────────────────────────────────────────────────────────

const mockStats: ProjectSessionStats = {
  totalStitches: 6801,
  sessionsLogged: 13,
  avgPerSession: 523,
  activeSince: new Date("2025-11-20"),
};

const mockSessions: StitchSessionRow[] = [
  {
    id: "s1",
    projectId: "proj-1",
    projectName: "Enchanted Forest",
    date: new Date("2026-03-19T12:00:00"),
    stitchCount: 423,
    timeSpentMinutes: 75,
    photoKey: null,
    createdAt: new Date("2026-03-19T10:00:00Z"),
  },
  {
    id: "s2",
    projectId: "proj-1",
    projectName: "Enchanted Forest",
    date: new Date("2026-03-18T12:00:00"),
    stitchCount: 512,
    timeSpentMinutes: 90,
    photoKey: "photos/s2.jpg",
    createdAt: new Date("2026-03-18T10:00:00Z"),
  },
];

const mockActiveProjects: ActiveProjectForPicker[] = [
  {
    projectId: "proj-1",
    chartId: "chart-1",
    chartName: "Enchanted Forest",
    coverThumbnailUrl: null,
    status: "IN_PROGRESS",
    stitchesCompleted: 6801,
    totalStitches: 45200,
  },
];

describe("ProjectSessionsTab", () => {
  const defaultProps = {
    sessions: mockSessions,
    stats: mockStats,
    imageUrls: {},
    activeProjects: mockActiveProjects,
    projectId: "proj-1",
  };

  it("renders 4 mini-stat cards with correct labels", () => {
    render(<ProjectSessionsTab {...defaultProps} />);

    expect(screen.getByText("TOTAL STITCHES")).toBeInTheDocument();
    expect(screen.getByText("SESSIONS LOGGED")).toBeInTheDocument();
    expect(screen.getByText("AVG PER SESSION")).toBeInTheDocument();
    expect(screen.getByText("ACTIVE SINCE")).toBeInTheDocument();
  });

  it("renders mini-stat card values correctly", () => {
    render(<ProjectSessionsTab {...defaultProps} />);

    expect(screen.getByText("6,801")).toBeInTheDocument();
    expect(screen.getByText("13")).toBeInTheDocument();
    expect(screen.getByText("523")).toBeInTheDocument();
    expect(screen.getByText("Nov 2025")).toBeInTheDocument();
  });

  it("renders SessionTable with sessions data", () => {
    render(<ProjectSessionsTab {...defaultProps} />);

    // Session dates appear in both desktop table and mobile cards
    expect(screen.getAllByText("Mar 19, 2026").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Mar 18, 2026").length).toBeGreaterThanOrEqual(1);
  });

  it("renders Log Session button", () => {
    render(<ProjectSessionsTab {...defaultProps} />);

    expect(screen.getByRole("button", { name: /log session/i })).toBeInTheDocument();
  });

  it("renders session count text", () => {
    render(<ProjectSessionsTab {...defaultProps} />);

    expect(screen.getByText("2 sessions logged")).toBeInTheDocument();
  });

  it("renders empty state when no sessions", () => {
    const emptyStats: ProjectSessionStats = {
      totalStitches: 0,
      sessionsLogged: 0,
      avgPerSession: 0,
      activeSince: null,
    };

    render(<ProjectSessionsTab {...defaultProps} sessions={[]} stats={emptyStats} />);

    expect(screen.getByText("No sessions logged for this project yet.")).toBeInTheDocument();

    // Should not render table or stat cards
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.queryByText("TOTAL STITCHES")).not.toBeInTheDocument();

    // Should still have Log Session button
    expect(screen.getByRole("button", { name: /log session/i })).toBeInTheDocument();
  });

  it("renders active since as em-dash when null", () => {
    const statsNoDate: ProjectSessionStats = {
      totalStitches: 100,
      sessionsLogged: 1,
      avgPerSession: 100,
      activeSince: null,
    };

    render(<ProjectSessionsTab {...defaultProps} stats={statsNoDate} />);

    expect(screen.getByText("ACTIVE SINCE")).toBeInTheDocument();
    expect(screen.getByText("\u2014")).toBeInTheDocument();
  });
});

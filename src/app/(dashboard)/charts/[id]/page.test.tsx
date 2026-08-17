import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ReactElement } from "react";
import type { FabricOption } from "@/components/features/supply-table";
import type { ProjectSessionStats, StitchSessionRow } from "@/types/session";

const mockRequireAuth = vi.fn();
const mockGetChart = vi.fn();
const mockGetPresignedImageUrls = vi.fn();
const mockGetProjectSupplies = vi.fn();
const mockGetUnassignedFabrics = vi.fn();
const mockGetSessionsForProject = vi.fn();
const mockGetProjectSessionStats = vi.fn();
const mockGetActiveProjectsForPicker = vi.fn();
const mockGetProjectCompletionEstimate = vi.fn();
const mockNotFound = vi.fn(() => {
  throw new Error("NEXT_NOT_FOUND");
});

vi.mock("@/lib/auth-guard", () => ({
  requireAuth: (...args: unknown[]) => mockRequireAuth(...args),
}));
vi.mock("next/navigation", () => ({
  notFound: () => mockNotFound(),
}));
vi.mock("@/lib/actions/chart-actions", () => ({
  getChart: (...args: unknown[]) => mockGetChart(...args),
}));
vi.mock("@/lib/actions/upload-actions", () => ({
  getPresignedImageUrls: (...args: unknown[]) => mockGetPresignedImageUrls(...args),
}));
vi.mock("@/lib/actions/supply-actions", () => ({
  getProjectSupplies: (...args: unknown[]) => mockGetProjectSupplies(...args),
}));
vi.mock("@/lib/actions/fabric-actions", () => ({
  getUnassignedFabrics: (...args: unknown[]) => mockGetUnassignedFabrics(...args),
}));
vi.mock("@/lib/actions/session-actions", () => ({
  getSessionsForProject: (...args: unknown[]) => mockGetSessionsForProject(...args),
  getProjectSessionStats: (...args: unknown[]) => mockGetProjectSessionStats(...args),
  getActiveProjectsForPicker: (...args: unknown[]) => mockGetActiveProjectsForPicker(...args),
}));
vi.mock("@/lib/queries/stats/completion-estimates", () => ({
  getProjectCompletionEstimate: (...args: unknown[]) => mockGetProjectCompletionEstimate(...args),
}));
vi.mock("@/components/features/charts/project-detail/project-detail-page", () => ({
  ProjectDetailPage: () => null,
}));

const session: StitchSessionRow = {
  id: "s-1",
  projectId: "proj-1",
  projectName: "Autumn Sampler",
  date: new Date("2026-08-17T00:00:00.000Z"),
  stitchCount: 250,
  timeSpentMinutes: 60,
  photoKey: null,
  createdAt: new Date("2026-08-17T00:00:00.000Z"),
};

const stats: ProjectSessionStats = {
  totalStitches: 250,
  sessionsLogged: 1,
  avgPerSession: 250,
  activeSince: new Date("2026-08-01T00:00:00.000Z"),
};

async function renderDetailProps(): Promise<{
  sessions: StitchSessionRow[] | null;
  sessionStats: ProjectSessionStats | null;
  fabricOptions: FabricOption[] | null;
}> {
  const { default: ChartDetailPage } = await import("./page");
  const tree = (await ChartDetailPage({
    params: Promise.resolve({ id: "chart-1" }),
  })) as ReactElement<{
    sessions: StitchSessionRow[] | null;
    sessionStats: ProjectSessionStats | null;
    fabricOptions: FabricOption[] | null;
  }>;
  return tree.props;
}

describe("ChartDetailPage — honest failure states", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuth.mockResolvedValue({ id: "user-1" });
    mockGetChart.mockResolvedValue({
      id: "chart-1",
      name: "Autumn Sampler",
      coverImageUrl: null,
      coverThumbnailUrl: null,
      project: { id: "proj-1" },
    });
    mockGetPresignedImageUrls.mockResolvedValue({});
    mockGetProjectSupplies.mockResolvedValue({ threads: [], beads: [], specialty: [] });
    mockGetUnassignedFabrics.mockResolvedValue([
      { id: "f-1", name: "Antique White", count: 28, brand: { name: "Zweigart" } },
    ]);
    mockGetSessionsForProject.mockResolvedValue({ success: true, sessions: [session] });
    mockGetProjectSessionStats.mockResolvedValue({ success: true, stats });
    mockGetActiveProjectsForPicker.mockResolvedValue({ success: true, projects: [] });
    mockGetProjectCompletionEstimate.mockResolvedValue(null);
  });

  it("passes the loaded sessions, stats and fabrics through when every query succeeds", async () => {
    const props = await renderDetailProps();

    expect(props.sessions).toEqual([session]);
    expect(props.sessionStats).toEqual(stats);
    expect(props.fabricOptions).toHaveLength(1);
  });

  it("sends null sessions — not an empty list — when the session query fails", async () => {
    mockGetSessionsForProject.mockResolvedValue({ success: false, error: "DB timeout" });

    const props = await renderDetailProps();

    expect(props.sessions).toBeNull();
  });

  it("sends null sessions when the session query throws", async () => {
    mockGetSessionsForProject.mockRejectedValue(new Error("DB timeout"));

    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const props = await renderDetailProps();
    spy.mockRestore();

    expect(props.sessions).toBeNull();
  });

  it("sends null stats — not zeros — when the stats query fails", async () => {
    mockGetProjectSessionStats.mockResolvedValue({ success: false, error: "DB timeout" });

    const props = await renderDetailProps();

    expect(props.sessionStats).toBeNull();
  });

  it("sends null fabric options — not an empty list — when the fabric query fails", async () => {
    mockGetUnassignedFabrics.mockRejectedValue(new Error("DB timeout"));

    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const props = await renderDetailProps();
    spy.mockRestore();

    expect(props.fabricOptions).toBeNull();
  });

  it("keeps a chart with no project on honest zeros rather than failure states", async () => {
    mockGetChart.mockResolvedValue({
      id: "chart-1",
      name: "Autumn Sampler",
      coverImageUrl: null,
      coverThumbnailUrl: null,
      project: null,
    });

    const props = await renderDetailProps();

    expect(props.sessions).toEqual([]);
    expect(props.sessionStats).toEqual({
      totalStitches: 0,
      sessionsLogged: 0,
      avgPerSession: 0,
      activeSince: null,
    });
  });
});

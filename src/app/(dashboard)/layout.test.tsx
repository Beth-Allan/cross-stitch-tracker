import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ReactElement } from "react";

const mockAuth = vi.fn();
const mockRedirect = vi.fn();
const mockGetActiveProjectsForPicker = vi.fn();
const mockGetPresignedImageUrls = vi.fn();

vi.mock("@/lib/auth", () => ({
  auth: (...args: unknown[]) => mockAuth(...args),
}));
vi.mock("next/navigation", () => ({
  redirect: (...args: unknown[]) => mockRedirect(...args),
}));
vi.mock("@/lib/actions/session-actions", () => ({
  getActiveProjectsForPicker: (...args: unknown[]) => mockGetActiveProjectsForPicker(...args),
}));
vi.mock("@/lib/actions/upload-actions", () => ({
  getPresignedImageUrls: (...args: unknown[]) => mockGetPresignedImageUrls(...args),
}));
vi.mock("@/components/shell/app-shell", () => ({
  AppShell: () => null,
}));

const project = {
  projectId: "p-1",
  chartId: "c-1",
  chartName: "Autumn Sampler",
  coverThumbnailUrl: null,
  status: "IN_PROGRESS",
  stitchesCompleted: 100,
  totalStitches: 1000,
};

async function renderShellProps(): Promise<{
  activeProjects: unknown[];
  projectsUnavailable: boolean;
}> {
  const { default: DashboardLayout } = await import("./layout");
  const tree = (await DashboardLayout({ children: null })) as ReactElement<{
    activeProjects: unknown[];
    projectsUnavailable: boolean;
  }>;
  return tree.props;
}

describe("DashboardLayout — project picker failure state", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue({ user: { id: "u-1", name: "Beth", email: "beth@example.com" } });
    mockGetPresignedImageUrls.mockResolvedValue({});
    mockGetActiveProjectsForPicker.mockResolvedValue({ success: true, projects: [project] });
  });

  it("passes the projects through when they load", async () => {
    const props = await renderShellProps();

    expect(props.activeProjects).toEqual([project]);
    expect(props.projectsUnavailable).toBe(false);
  });

  it("does not report a genuinely empty project list as unavailable", async () => {
    mockGetActiveProjectsForPicker.mockResolvedValue({ success: true, projects: [] });

    const props = await renderShellProps();

    expect(props.activeProjects).toEqual([]);
    expect(props.projectsUnavailable).toBe(false);
  });

  it("marks the picker unavailable when the project query fails", async () => {
    mockGetActiveProjectsForPicker.mockResolvedValue({ success: false, error: "DB timeout" });

    const props = await renderShellProps();

    expect(props.projectsUnavailable).toBe(true);
  });

  it("marks the picker unavailable when the project query throws", async () => {
    mockGetActiveProjectsForPicker.mockRejectedValue(new Error("DB timeout"));

    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const props = await renderShellProps();
    spy.mockRestore();

    expect(props.projectsUnavailable).toBe(true);
    expect(props.activeProjects).toEqual([]);
  });
});

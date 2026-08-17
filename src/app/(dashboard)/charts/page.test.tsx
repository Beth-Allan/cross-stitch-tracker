import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ReactElement } from "react";
import { DataUnavailable } from "@/components/ui/data-unavailable";

const mockGetChartsForGallery = vi.fn();
const mockGetWhatsNextProjects = vi.fn();
const mockGetFabricRequirements = vi.fn();
const mockGetStorageGroups = vi.fn();
const mockGetSeriesWithStats = vi.fn();
const mockGetPresignedImageUrls = vi.fn();

vi.mock("@/lib/actions/chart-actions", () => ({
  getChartsForGallery: (...args: unknown[]) => mockGetChartsForGallery(...args),
}));
vi.mock("@/lib/actions/pattern-dive-actions", () => ({
  getWhatsNextProjects: (...args: unknown[]) => mockGetWhatsNextProjects(...args),
  getFabricRequirements: (...args: unknown[]) => mockGetFabricRequirements(...args),
  getStorageGroups: (...args: unknown[]) => mockGetStorageGroups(...args),
}));
vi.mock("@/lib/actions/series-actions", () => ({
  getSeriesWithStats: (...args: unknown[]) => mockGetSeriesWithStats(...args),
}));
vi.mock("@/lib/actions/upload-actions", () => ({
  getPresignedImageUrls: (...args: unknown[]) => mockGetPresignedImageUrls(...args),
}));

vi.mock("@/components/ui/data-unavailable", () => ({
  DataUnavailable: () => null,
}));
vi.mock("@/components/features/gallery/project-gallery", () => ({
  ProjectGallery: () => null,
}));
vi.mock("@/components/features/charts/pattern-dive-tabs", () => ({
  PatternDiveTabs: () => null,
}));
vi.mock("@/components/features/charts/whats-next-tab", () => ({
  WhatsNextTab: () => null,
}));
vi.mock("@/components/features/charts/series-tab-content", () => ({
  SeriesTabContent: () => null,
}));
vi.mock("@/components/features/charts/fabric-requirements-tab", () => ({
  FabricRequirementsTab: () => null,
}));
vi.mock("@/components/features/charts/storage-view-tab", () => ({
  StorageViewTab: () => null,
}));

const TAB_PROPS = [
  "browseContent",
  "whatsNextContent",
  "seriesContent",
  "fabricContent",
  "storageContent",
] as const;

type TabProp = (typeof TAB_PROPS)[number];

async function renderTabs(): Promise<Record<TabProp, ReactElement>> {
  const { default: ChartsPage } = await import("./page");
  const tree = (await ChartsPage()) as ReactElement<{
    children: ReactElement<Record<string, unknown>>[];
  }>;
  const tabs = tree.props.children.find(
    (child) => child?.props && "browseContent" in child.props,
  ) as ReactElement<Record<TabProp, ReactElement>>;
  return tabs.props;
}

describe("ChartsPage — honest failure states", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetChartsForGallery.mockResolvedValue([]);
    mockGetWhatsNextProjects.mockResolvedValue([]);
    mockGetFabricRequirements.mockResolvedValue([]);
    mockGetStorageGroups.mockResolvedValue([]);
    mockGetSeriesWithStats.mockResolvedValue([]);
    mockGetPresignedImageUrls.mockResolvedValue({});
  });

  it("renders every tab's own content when all five fetches succeed", async () => {
    const tabs = await renderTabs();

    for (const prop of TAB_PROPS) {
      expect(tabs[prop].type).not.toBe(DataUnavailable);
    }
  });

  it.each([
    ["getChartsForGallery", () => mockGetChartsForGallery, "browseContent"],
    ["getWhatsNextProjects", () => mockGetWhatsNextProjects, "whatsNextContent"],
    ["getSeriesWithStats", () => mockGetSeriesWithStats, "seriesContent"],
    ["getFabricRequirements", () => mockGetFabricRequirements, "fabricContent"],
    ["getStorageGroups", () => mockGetStorageGroups, "storageContent"],
  ] as [string, () => ReturnType<typeof vi.fn>, TabProp][])(
    "says the tab could not load — never that it is empty — when %s fails",
    async (_name, getMock, tabProp) => {
      getMock().mockRejectedValue(new Error("DB timeout"));

      const spy = vi.spyOn(console, "error").mockImplementation(() => {});
      const tabs = await renderTabs();
      spy.mockRestore();

      expect(tabs[tabProp].type).toBe(DataUnavailable);
    },
  );

  it("keeps the other four tabs working when one fetch fails", async () => {
    mockGetStorageGroups.mockRejectedValue(new Error("DB timeout"));

    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const tabs = await renderTabs();
    spy.mockRestore();

    expect(tabs.storageContent.type).toBe(DataUnavailable);
    for (const prop of [
      "browseContent",
      "whatsNextContent",
      "seriesContent",
      "fabricContent",
    ] as const) {
      expect(tabs[prop].type).not.toBe(DataUnavailable);
    }
  });

  it("still resolves the page when all five fetches fail", async () => {
    mockGetChartsForGallery.mockRejectedValue(new Error("down"));
    mockGetWhatsNextProjects.mockRejectedValue(new Error("down"));
    mockGetFabricRequirements.mockRejectedValue(new Error("down"));
    mockGetStorageGroups.mockRejectedValue(new Error("down"));
    mockGetSeriesWithStats.mockRejectedValue(new Error("down"));

    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const tabs = await renderTabs();
    spy.mockRestore();

    for (const prop of TAB_PROPS) {
      expect(tabs[prop].type).toBe(DataUnavailable);
    }
    expect(mockGetPresignedImageUrls).toHaveBeenCalledWith([]);
  });
});

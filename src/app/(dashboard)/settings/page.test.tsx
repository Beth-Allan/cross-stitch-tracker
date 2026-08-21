import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@/__tests__/test-utils";
import SettingsPage from "./page";

const mockGetCoversNeedingOptimization = vi.fn();
vi.mock("@/lib/actions/cover-backfill-actions", () => ({
  getCoversNeedingOptimization: () => mockGetCoversNeedingOptimization(),
  optimizeExistingCover: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

describe("SettingsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("hands the covers still waiting to the card", async () => {
    mockGetCoversNeedingOptimization.mockResolvedValueOnce({
      success: true,
      charts: [
        { id: "chart-1", name: "Winter Robin" },
        { id: "chart-2", name: "Autumn Fox" },
      ],
    });

    render(await SettingsPage());

    expect(screen.getByText(/2 cover photos/i)).toBeInTheDocument();
  });

  it("fails loudly rather than reporting an empty library when the check cannot run", async () => {
    mockGetCoversNeedingOptimization.mockResolvedValueOnce({
      success: false,
      error: "Could not check which cover photos need shrinking",
    });

    await expect(SettingsPage()).rejects.toThrow(/could not check/i);
  });
});

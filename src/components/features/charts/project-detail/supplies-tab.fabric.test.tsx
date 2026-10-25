/**
 * The Supplies tab's fabric picker attaches the piece it shows — Beth's ruling D-30. Before it,
 * picking only changed the figures on screen and the choice was gone on reload, while the same
 * picker on the new-chart screen did attach.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, render, screen, within } from "@/__tests__/test-utils";
import userEvent from "@testing-library/user-event";
import { SuppliesTab } from "./supplies-tab";
import type { ProjectDetailProps } from "./types";

vi.mock("@/components/features/charts/form-primitives/searchable-select", () => ({
  SearchableSelect: ({
    options,
    value,
    onChange,
  }: {
    options: { value: string; label: string }[];
    value: string | null;
    onChange: (value: string | null) => void;
  }) => (
    <select
      data-testid="fabric-select"
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value || null)}
    >
      <option value="">none</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  ),
}));

vi.mock("@/lib/actions/pattern-dive-actions", () => ({
  assignFabricToProject: vi.fn(() => Promise.resolve({ success: true })),
  unassignFabricFromProject: vi.fn(() => Promise.resolve({ success: true })),
}));

vi.mock("@/lib/actions/chart-actions", () => ({
  updateProjectSettings: vi.fn(() => Promise.resolve({ success: true })),
}));

vi.mock("@/lib/actions/supply-actions", () => ({}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const fabricOptions = [
  { value: "fab-28", label: "28ct Cashel Linen", count: 28 },
  { value: "fab-18", label: "18ct Aida", count: 18 },
];

const baseProject: NonNullable<ProjectDetailProps["chart"]["project"]> = {
  id: "proj-1",
  userId: "user-1",
  status: "IN_PROGRESS",
  startDate: null,
  finishDate: null,
  ffoDate: null,
  startingStitches: 0,
  stitchesCompleted: 0,
  strandCount: 2,
  overCount: 2,
  wastePercent: 20,
  storageLocation: null,
  stitchingApp: null,
  fabric: null,
};

const linenOnProject = {
  ...baseProject,
  fabric: { id: "fab-28", name: "Cashel Linen", count: 28, brand: { name: "Zweigart" } },
};

function tab(project: typeof baseProject) {
  return (
    <SuppliesTab
      project={project}
      supplies={{ threads: [], beads: [], specialty: [] }}
      calculator={{ chartId: "chart-1", fabricOptions }}
    />
  );
}

function renderTab(project = baseProject) {
  const { rerender } = render(tab(project));
  return { rerenderWith: (saved: typeof baseProject) => rerender(tab(saved)) };
}

/**
 * A save the test settles itself. In the app the revalidated page reaches the tab before the
 * action's transition ends, so a test must hand over the saved project before resolving.
 */
function heldSave() {
  let settle: (value: { success: true }) => void = () => {};
  const promise = new Promise<{ success: true }>((resolve) => {
    settle = resolve;
  });
  return { promise, settle: () => settle({ success: true }) };
}

const fabricCount = () => within(screen.getByText("COUNT").parentElement!).getByRole("button");

describe("SuppliesTab — the calculator's fabric picker", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("picking a fabric attaches it to the project and works the figures at its count", async () => {
    const user = userEvent.setup();
    const { assignFabricToProject } = await import("@/lib/actions/pattern-dive-actions");
    const save = heldSave();
    vi.mocked(assignFabricToProject).mockReturnValueOnce(save.promise);
    const { rerenderWith } = renderTab();

    await user.selectOptions(screen.getByTestId("fabric-select"), "fab-28");

    expect(vi.mocked(assignFabricToProject)).toHaveBeenCalledWith("fab-28", "proj-1");
    expect(fabricCount()).toHaveTextContent("28");
    rerenderWith(linenOnProject);
    await act(save.settle);
    expect(screen.getByTestId("fabric-select")).toHaveValue("fab-28");
    expect(fabricCount()).toHaveTextContent("28");
  });

  it("clearing the fabric detaches it and puts the count back to the no-fabric default", async () => {
    const user = userEvent.setup();
    const { unassignFabricFromProject } = await import("@/lib/actions/pattern-dive-actions");
    const save = heldSave();
    vi.mocked(unassignFabricFromProject).mockReturnValueOnce(save.promise);
    const { rerenderWith } = renderTab(linenOnProject);
    expect(fabricCount()).toHaveTextContent("28");

    await user.selectOptions(screen.getByTestId("fabric-select"), "");

    expect(vi.mocked(unassignFabricFromProject)).toHaveBeenCalledWith("proj-1");
    expect(fabricCount()).toHaveTextContent("14");
    rerenderWith(baseProject);
    await act(save.settle);
    expect(screen.getByTestId("fabric-select")).toHaveValue("");
    expect(fabricCount()).toHaveTextContent("14");
  });

  it("when attaching is refused, says why and goes back to what was saved", async () => {
    const user = userEvent.setup();
    const { assignFabricToProject } = await import("@/lib/actions/pattern-dive-actions");
    const { toast } = await import("sonner");
    vi.mocked(assignFabricToProject).mockResolvedValueOnce({
      success: false as const,
      error: "Fabric is already assigned to another project",
    });
    renderTab();

    await user.selectOptions(screen.getByTestId("fabric-select"), "fab-28");

    await vi.waitFor(() => {
      expect(vi.mocked(toast.error)).toHaveBeenCalledWith(
        "Fabric is already assigned to another project",
      );
    });
    expect(screen.getByTestId("fabric-select")).toHaveValue("");
    expect(fabricCount()).toHaveTextContent("14");
  });

  it("when the save fails outright, says so and goes back to what was saved", async () => {
    const user = userEvent.setup();
    const { unassignFabricFromProject } = await import("@/lib/actions/pattern-dive-actions");
    const { toast } = await import("sonner");
    vi.mocked(unassignFabricFromProject).mockRejectedValueOnce(new Error("Network failure"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    renderTab(linenOnProject);

    await user.selectOptions(screen.getByTestId("fabric-select"), "");

    await vi.waitFor(() => {
      expect(vi.mocked(toast.error)).toHaveBeenCalledWith(
        "Couldn't save the fabric. Please try again.",
      );
    });
    expect(screen.getByTestId("fabric-select")).toHaveValue("fab-28");
    expect(fabricCount()).toHaveTextContent("28");
  });
});

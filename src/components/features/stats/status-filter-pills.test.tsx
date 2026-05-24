import { render, screen } from "@/__tests__/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSetStatusFilter = vi.fn();

vi.mock("nuqs", () => ({
  useQueryState: vi.fn(() => [[] as string[], mockSetStatusFilter]),
  parseAsArrayOf: vi.fn(() => ({
    withDefault: vi.fn(),
  })),
  parseAsStringLiteral: vi.fn(),
}));

vi.mock("@/lib/utils/status-groups", () => ({
  STATUS_GROUPS: ["not-started", "in-progress", "complete"] as const,
}));

import { useQueryState } from "nuqs";
import { StatusFilterPills } from "./status-filter-pills";

const mockedUseQueryState = vi.mocked(useQueryState);

describe("StatusFilterPills", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseQueryState.mockReturnValue([[] as string[], mockSetStatusFilter] as ReturnType<
      typeof useQueryState<string[]>
    >);
  });

  it("renders 4 pills: All, Not Started, In Progress, Complete", () => {
    render(<StatusFilterPills />);

    expect(screen.getByRole("button", { name: "All" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Not Started" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "In Progress" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Complete" })).toBeInTheDocument();
  });

  it('has role="group" with aria-label "Filter by status"', () => {
    render(<StatusFilterPills />);

    expect(screen.getByRole("group", { name: "Filter by status" })).toBeInTheDocument();
  });

  it("shows All as active (aria-pressed=true) when no filters selected", () => {
    render(<StatusFilterPills />);

    expect(screen.getByRole("button", { name: "All" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Not Started" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(screen.getByRole("button", { name: "In Progress" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(screen.getByRole("button", { name: "Complete" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("shows group pill as active when in statusFilter", () => {
    mockedUseQueryState.mockReturnValue([
      ["not-started"] as string[],
      mockSetStatusFilter,
    ] as ReturnType<typeof useQueryState<string[]>>);

    render(<StatusFilterPills />);

    expect(screen.getByRole("button", { name: "All" })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("button", { name: "Not Started" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("calls setStatusFilter when clicking a group pill", async () => {
    const { user } = render(<StatusFilterPills />);

    await user.click(screen.getByRole("button", { name: "Not Started" }));

    expect(mockSetStatusFilter).toHaveBeenCalled();
  });

  it("calls setStatusFilter(null) when clicking All", async () => {
    mockedUseQueryState.mockReturnValue([
      ["not-started"] as string[],
      mockSetStatusFilter,
    ] as ReturnType<typeof useQueryState<string[]>>);

    const { user } = render(<StatusFilterPills />);

    await user.click(screen.getByRole("button", { name: "All" }));

    expect(mockSetStatusFilter).toHaveBeenCalledWith(null);
  });

  it("all buttons have type=button", () => {
    render(<StatusFilterPills />);

    const buttons = screen.getAllByRole("button");
    buttons.forEach((btn) => {
      expect(btn).toHaveAttribute("type", "button");
    });
  });
});

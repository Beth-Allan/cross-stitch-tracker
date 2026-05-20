import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/__tests__/test-utils";
import userEvent from "@testing-library/user-event";
import { StatusGroup, STATUS_GROUP_ORDER } from "./status-group";

describe("StatusGroup", () => {
  const defaultProps = {
    status: "KITTING" as const,
    count: 12,
    isExpanded: true,
    onToggle: vi.fn(),
    onSelectAll: vi.fn(),
  };

  it("renders status label from STATUS_CONFIG", () => {
    render(
      <StatusGroup {...defaultProps}>
        <div>children</div>
      </StatusGroup>,
    );

    expect(screen.getByText("Kitting")).toBeInTheDocument();
  });

  it("renders count badge with the provided count number", () => {
    render(
      <StatusGroup {...defaultProps}>
        <div>children</div>
      </StatusGroup>,
    );

    expect(screen.getByText("12")).toBeInTheDocument();
  });

  it("renders status dot with correct dotClass from STATUS_CONFIG", () => {
    const { container } = render(
      <StatusGroup {...defaultProps}>
        <div>children</div>
      </StatusGroup>,
    );

    const dot = container.querySelector("span[aria-hidden='true']");
    expect(dot).toBeInTheDocument();
    expect(dot).toHaveClass("bg-amber-500");
  });

  it("renders children when expanded (isExpanded=true)", () => {
    render(
      <StatusGroup {...defaultProps} isExpanded={true}>
        <div>child content</div>
      </StatusGroup>,
    );

    expect(screen.getByText("child content")).toBeInTheDocument();
  });

  it("does not render children when collapsed (isExpanded=false)", () => {
    render(
      <StatusGroup {...defaultProps} isExpanded={false}>
        <div>child content</div>
      </StatusGroup>,
    );

    expect(screen.queryByText("child content")).not.toBeInTheDocument();
  });

  it("calls onToggle when header area is clicked", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(
      <StatusGroup {...defaultProps} onToggle={onToggle}>
        <div>children</div>
      </StatusGroup>,
    );

    const toggleButton = document.getElementById("group-KITTING")!;
    await user.click(toggleButton);

    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("renders 'Select all' button that calls onSelectAll when clicked", async () => {
    const user = userEvent.setup();
    const onSelectAll = vi.fn();
    render(
      <StatusGroup {...defaultProps} onSelectAll={onSelectAll}>
        <div>children</div>
      </StatusGroup>,
    );

    const selectAllButton = screen.getByRole("button", {
      name: "Select all Kitting projects",
    });
    await user.click(selectAllButton);

    expect(onSelectAll).toHaveBeenCalledTimes(1);
  });

  it("'Select all' button has aria-label 'Select all {StatusLabel} projects'", () => {
    render(
      <StatusGroup {...defaultProps} status="IN_PROGRESS">
        <div>children</div>
      </StatusGroup>,
    );

    expect(
      screen.getByRole("button", { name: "Select all Stitching projects" }),
    ).toBeInTheDocument();
  });

  it("toggle button has aria-expanded matching isExpanded prop", () => {
    const { rerender } = render(
      <StatusGroup {...defaultProps} isExpanded={true}>
        <div>children</div>
      </StatusGroup>,
    );

    const toggleButton = document.getElementById("group-KITTING")!;
    expect(toggleButton).toHaveAttribute("aria-expanded", "true");

    rerender(
      <StatusGroup {...defaultProps} isExpanded={false}>
        <div>children</div>
      </StatusGroup>,
    );

    expect(toggleButton).toHaveAttribute("aria-expanded", "false");
  });

  it("has role='group' with aria-labelledby pointing to header", () => {
    render(
      <StatusGroup {...defaultProps}>
        <div>children</div>
      </StatusGroup>,
    );

    const group = screen.getByRole("group");
    expect(group).toHaveAttribute("aria-labelledby", "group-KITTING");
  });
});

describe("STATUS_GROUP_ORDER", () => {
  it("matches expected workflow progression order", () => {
    expect(STATUS_GROUP_ORDER).toEqual([
      "KITTING",
      "IN_PROGRESS",
      "ON_HOLD",
      "UNSTARTED",
      "KITTED",
    ]);
  });
});

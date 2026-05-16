import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@/__tests__/test-utils";
import { SegmentedTypeToggle } from "./segmented-type-toggle";
import type { SupplyType } from "./types";

describe("SegmentedTypeToggle", () => {
  const defaultProps = {
    value: "THREAD" as SupplyType,
    onChange: vi.fn(),
  };

  it("renders three buttons for THREAD, BEAD, SPECIALTY", () => {
    render(<SegmentedTypeToggle {...defaultProps} />);
    expect(screen.getByText("Thread")).toBeInTheDocument();
    expect(screen.getByText("Beads")).toBeInTheDocument();
    expect(screen.getByText("Specialty")).toBeInTheDocument();
  });

  it("container has role='radiogroup' with aria-label", () => {
    render(<SegmentedTypeToggle {...defaultProps} />);
    const group = screen.getByRole("radiogroup");
    expect(group).toBeInTheDocument();
    expect(group).toHaveAttribute("aria-label", "Supply type");
  });

  it("each button has role='radio'", () => {
    render(<SegmentedTypeToggle {...defaultProps} />);
    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(3);
  });

  it("selected button has aria-checked='true', others have aria-checked='false'", () => {
    render(<SegmentedTypeToggle {...defaultProps} value="BEAD" />);
    const radios = screen.getAllByRole("radio");

    const threadRadio = radios.find((r) => r.textContent?.includes("Thread"))!;
    const beadRadio = radios.find((r) => r.textContent?.includes("Beads"))!;
    const specialtyRadio = radios.find((r) => r.textContent?.includes("Specialty"))!;

    expect(threadRadio).toHaveAttribute("aria-checked", "false");
    expect(beadRadio).toHaveAttribute("aria-checked", "true");
    expect(specialtyRadio).toHaveAttribute("aria-checked", "false");
  });

  it("clicking a button calls onChange with the new SupplyType", () => {
    const onChange = vi.fn();
    render(<SegmentedTypeToggle {...defaultProps} onChange={onChange} />);

    fireEvent.click(screen.getByText("Beads"));
    expect(onChange).toHaveBeenCalledWith("BEAD");

    fireEvent.click(screen.getByText("Specialty"));
    expect(onChange).toHaveBeenCalledWith("SPECIALTY");
  });

  it("active button has primary background styling", () => {
    const { container } = render(<SegmentedTypeToggle {...defaultProps} value="THREAD" />);
    const activeButton = container.querySelector("[aria-checked='true']");
    expect(activeButton).toBeInTheDocument();
    // Verify it has the active class (bg-primary text-primary-foreground)
    expect(activeButton?.className).toContain("bg-primary");
    expect(activeButton?.className).toContain("text-primary-foreground");
  });

  it("inactive buttons have card background", () => {
    const { container } = render(<SegmentedTypeToggle {...defaultProps} value="THREAD" />);
    const inactiveButtons = container.querySelectorAll("[aria-checked='false']");
    expect(inactiveButtons).toHaveLength(2);
    for (const button of inactiveButtons) {
      expect(button.className).toContain("bg-card");
      expect(button.className).toContain("text-muted-foreground");
    }
  });

  it("buttons display icon and text labels", () => {
    render(<SegmentedTypeToggle {...defaultProps} />);
    // Icons are rendered as SVG elements within the buttons
    const radios = screen.getAllByRole("radio");
    for (const radio of radios) {
      const svg = radio.querySelector("svg");
      expect(svg).toBeInTheDocument();
    }
  });
});

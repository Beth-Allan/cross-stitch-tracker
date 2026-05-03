import { describe, it, expect } from "vitest";
import { render, screen } from "@/__tests__/test-utils";
import { StatusDonut } from "./status-donut";

const CIRCUMFERENCE = 2 * Math.PI * 6; // 37.699...

describe("StatusDonut", () => {
  it("renders SVG with correct dimensions and viewBox", () => {
    const { container } = render(<StatusDonut have={0} need={2} />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg!.getAttribute("width")).toBe("16");
    expect(svg!.getAttribute("height")).toBe("16");
    expect(svg!.getAttribute("viewBox")).toBe("0 0 16 16");
  });

  it("renders accessible title with 'X of Y' text", () => {
    render(<StatusDonut have={1} need={3} />);
    expect(screen.getByTitle("1 of 3")).toBeInTheDocument();
  });

  it("renders only background ring when have=0 (empty state)", () => {
    const { container } = render(<StatusDonut have={0} need={2} />);
    const circles = container.querySelectorAll("circle");
    // Only the background ring
    expect(circles).toHaveLength(1);
    expect(circles[0].classList.contains("stroke-muted")).toBe(true);
  });

  it("renders foreground arc with warning color for partial state", () => {
    const { container } = render(<StatusDonut have={1} need={2} />);
    const circles = container.querySelectorAll("circle");
    expect(circles).toHaveLength(2);

    const foreground = circles[1];
    expect(foreground.classList.contains("stroke-warning")).toBe(true);

    // Verify dashoffset: circumference * (1 - 0.5) = ~18.85
    const dashoffset = parseFloat(foreground.getAttribute("stroke-dashoffset")!);
    expect(dashoffset).toBeCloseTo(CIRCUMFERENCE * 0.5, 1);
  });

  it("renders full foreground ring with primary color for complete state", () => {
    const { container } = render(<StatusDonut have={2} need={2} />);
    const circles = container.querySelectorAll("circle");
    expect(circles).toHaveLength(2);

    const foreground = circles[1];
    expect(foreground.classList.contains("stroke-primary")).toBe(true);

    const dashoffset = parseFloat(foreground.getAttribute("stroke-dashoffset")!);
    expect(dashoffset).toBe(0);
  });

  it("clamps ratio to 1.0 when have > need", () => {
    const { container } = render(<StatusDonut have={3} need={2} />);
    const circles = container.querySelectorAll("circle");
    expect(circles).toHaveLength(2);

    const foreground = circles[1];
    expect(foreground.classList.contains("stroke-primary")).toBe(true);
    const dashoffset = parseFloat(foreground.getAttribute("stroke-dashoffset")!);
    expect(dashoffset).toBe(0);
  });

  it("renders empty state when both have and need are 0", () => {
    const { container } = render(<StatusDonut have={0} need={0} />);
    const circles = container.querySelectorAll("circle");
    // Only background ring, no foreground
    expect(circles).toHaveLength(1);
  });

  it("foreground circle has correct transform and strokeLinecap", () => {
    const { container } = render(<StatusDonut have={1} need={2} />);
    const foreground = container.querySelectorAll("circle")[1];
    expect(foreground.getAttribute("transform")).toBe("rotate(-90 8 8)");
    expect(foreground.getAttribute("stroke-linecap")).toBe("round");
  });

  it("foreground circle has correct strokeDasharray", () => {
    const { container } = render(<StatusDonut have={1} need={4} />);
    const foreground = container.querySelectorAll("circle")[1];
    const dasharray = parseFloat(foreground.getAttribute("stroke-dasharray")!);
    expect(dasharray).toBeCloseTo(CIRCUMFERENCE, 1);
  });
});

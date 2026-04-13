import { render, screen } from "@/__tests__/test-utils";
import { describe, expect, it } from "vitest";
import { KittingDots } from "./kitting-dots";

describe("KittingDots", () => {
  it("renders 4 labels: Fabric, Thread, Beads, Specialty", () => {
    render(
      <KittingDots
        fabricStatus="needed"
        threadStatus="needed"
        beadsStatus="needed"
        specialtyStatus="needed"
      />,
    );
    expect(screen.getByText("Fabric")).toBeInTheDocument();
    expect(screen.getByText("Thread")).toBeInTheDocument();
    expect(screen.getByText("Beads")).toBeInTheDocument();
    expect(screen.getByText("Specialty")).toBeInTheDocument();
  });

  it("shows 'Ready' aria-label for fulfilled items", () => {
    render(
      <KittingDots
        fabricStatus="fulfilled"
        threadStatus="fulfilled"
        beadsStatus="fulfilled"
        specialtyStatus="fulfilled"
      />,
    );
    expect(screen.getByLabelText("Fabric: Ready")).toBeInTheDocument();
    expect(screen.getByLabelText("Thread: Ready")).toBeInTheDocument();
    expect(screen.getByLabelText("Beads: Ready")).toBeInTheDocument();
    expect(screen.getByLabelText("Specialty: Ready")).toBeInTheDocument();
  });

  it("shows 'Still needed' aria-label for needed items", () => {
    render(
      <KittingDots
        fabricStatus="needed"
        threadStatus="needed"
        beadsStatus="needed"
        specialtyStatus="needed"
      />,
    );
    expect(screen.getByLabelText("Fabric: Still needed")).toBeInTheDocument();
    expect(screen.getByLabelText("Thread: Still needed")).toBeInTheDocument();
  });

  it("shows 'In progress' aria-label for partial items", () => {
    render(
      <KittingDots
        fabricStatus="fulfilled"
        threadStatus="partial"
        beadsStatus="not-applicable"
        specialtyStatus="not-applicable"
      />,
    );
    expect(screen.getByLabelText("Thread: In progress")).toBeInTheDocument();
  });

  it("shows 'Not needed for this project' aria-label for not-applicable items", () => {
    render(
      <KittingDots
        fabricStatus="fulfilled"
        threadStatus="fulfilled"
        beadsStatus="not-applicable"
        specialtyStatus="not-applicable"
      />,
    );
    expect(screen.getByLabelText("Beads: Not needed for this project")).toBeInTheDocument();
    expect(screen.getByLabelText("Specialty: Not needed for this project")).toBeInTheDocument();
  });

  it("renders line-through class for not-applicable labels", () => {
    render(
      <KittingDots
        fabricStatus="fulfilled"
        threadStatus="fulfilled"
        beadsStatus="not-applicable"
        specialtyStatus="not-applicable"
      />,
    );
    const beadsLabel = screen.getByText("Beads");
    expect(beadsLabel.className).toContain("line-through");
    const specialtyLabel = screen.getByText("Specialty");
    expect(specialtyLabel.className).toContain("line-through");
  });

  it("does not render line-through for fulfilled, partial, or needed labels", () => {
    render(
      <KittingDots
        fabricStatus="fulfilled"
        threadStatus="partial"
        beadsStatus="needed"
        specialtyStatus="not-applicable"
      />,
    );
    const fabricLabel = screen.getByText("Fabric");
    expect(fabricLabel.className).not.toContain("line-through");
    const threadLabel = screen.getByText("Thread");
    expect(threadLabel.className).not.toContain("line-through");
    const beadsLabel = screen.getByText("Beads");
    expect(beadsLabel.className).not.toContain("line-through");
  });

  it("renders aria-labels on each dot item", () => {
    render(
      <KittingDots
        fabricStatus="fulfilled"
        threadStatus="needed"
        beadsStatus="not-applicable"
        specialtyStatus="fulfilled"
      />,
    );
    expect(screen.getByLabelText("Fabric: Ready")).toBeInTheDocument();
    expect(screen.getByLabelText("Thread: Still needed")).toBeInTheDocument();
    expect(screen.getByLabelText("Beads: Not needed for this project")).toBeInTheDocument();
    expect(screen.getByLabelText("Specialty: Ready")).toBeInTheDocument();
  });

  it("renders correct icons for all fulfilled (4 Check icons)", () => {
    const { container } = render(
      <KittingDots
        fabricStatus="fulfilled"
        threadStatus="fulfilled"
        beadsStatus="fulfilled"
        specialtyStatus="fulfilled"
      />,
    );
    const svgs = container.querySelectorAll("svg");
    expect(svgs).toHaveLength(4);
    // All should have emerald color classes (use getAttribute for SVG elements)
    svgs.forEach((svg) => {
      const cls = svg.getAttribute("class") ?? "";
      expect(cls).toContain("emerald");
    });
  });

  it("renders correct mixed icons", () => {
    const { container } = render(
      <KittingDots
        fabricStatus="fulfilled"
        threadStatus="partial"
        beadsStatus="not-applicable"
        specialtyStatus="fulfilled"
      />,
    );
    const svgs = container.querySelectorAll("svg");
    expect(svgs).toHaveLength(4);
    // First (fabric) should have emerald
    expect(svgs[0].getAttribute("class")).toContain("emerald");
    // Second (thread) should have amber (partial)
    expect(svgs[1].getAttribute("class")).toContain("amber");
    // Third (beads) should have muted-foreground (not-applicable)
    expect(svgs[2].getAttribute("class")).toContain("muted-foreground");
    // Fourth (specialty) should have emerald
    expect(svgs[3].getAttribute("class")).toContain("emerald");
  });
});

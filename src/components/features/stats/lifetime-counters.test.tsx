import { render, screen } from "@/__tests__/test-utils";
import { describe, it, expect } from "vitest";
import { LifetimeCounters } from "./lifetime-counters";

function createMockProps() {
  return {
    collectionTotalStitches: 54321,
    totalSessions: 128,
    totalTimeMinutes: 2535,
    projectsCompleted: 7,
  };
}

describe("LifetimeCounters", () => {
  it('renders 4 counter cards with labels "STITCHES IN COLLECTION", "SESSIONS", "TIME STITCHING", "COMPLETED"', () => {
    render(<LifetimeCounters {...createMockProps()} />);

    expect(screen.getByText("STITCHES IN COLLECTION")).toBeInTheDocument();
    expect(screen.getByText("SESSIONS")).toBeInTheDocument();
    expect(screen.getByText("TIME STITCHING")).toBeInTheDocument();
    expect(screen.getByText("COMPLETED")).toBeInTheDocument();
  });

  it("renders formatted values (toLocaleString for numbers, formatTime for minutes)", () => {
    render(<LifetimeCounters {...createMockProps()} />);

    expect(screen.getByText("54,321")).toBeInTheDocument();
    expect(screen.getByText("128")).toBeInTheDocument();
    expect(screen.getByText("42h 15m")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
  });

  it('shows "0" for counters and "0h" for time when all values are 0', () => {
    render(
      <LifetimeCounters
        collectionTotalStitches={0}
        totalSessions={0}
        totalTimeMinutes={0}
        projectsCompleted={0}
      />,
    );

    const zeros = screen.getAllByText("0");
    expect(zeros).toHaveLength(3);
    expect(screen.getByText("0h")).toBeInTheDocument();
  });

  it('renders section heading "Lifetime" with icon', () => {
    render(<LifetimeCounters {...createMockProps()} />);

    expect(screen.getByText("Lifetime")).toBeInTheDocument();
  });

  it("applies font-mono tabular-nums to all numeric values", () => {
    render(<LifetimeCounters {...createMockProps()} />);

    const value = screen.getByText("54,321");
    expect(value.className).toContain("font-mono");
    expect(value.className).toContain("tabular-nums");
  });

  it("applies uppercase tracking-wider to labels", () => {
    render(<LifetimeCounters {...createMockProps()} />);

    const label = screen.getByText("STITCHES IN COLLECTION");
    expect(label.className).toContain("uppercase");
    expect(label.className).toContain("tracking-wider");
  });

  it("applies ring-1 ring-foreground/10 and rounded-xl to cards", () => {
    render(<LifetimeCounters {...createMockProps()} />);

    const label = screen.getByText("STITCHES IN COLLECTION");
    const card = label.parentElement as HTMLElement;
    expect(card.className).toContain("ring-1");
    expect(card.className).toContain("ring-foreground/10");
    expect(card.className).toContain("rounded-xl");
  });
});

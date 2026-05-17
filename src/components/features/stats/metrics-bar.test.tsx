import { render, screen } from "@/__tests__/test-utils";
import { describe, it, expect } from "vitest";
import { MetricsBar } from "./metrics-bar";

function createMockProps() {
  return {
    stitchesToday: 1234,
    stitchesThisWeek: 5678,
    stitchesThisMonth: 12345,
    stitchesThisYear: 98765,
  };
}

describe("MetricsBar", () => {
  it("renders 4 stitch count values when given valid data", () => {
    render(<MetricsBar {...createMockProps()} />);

    expect(screen.getByText("1,234")).toBeInTheDocument();
    expect(screen.getByText("5,678")).toBeInTheDocument();
    expect(screen.getByText("12,345")).toBeInTheDocument();
    expect(screen.getByText("98,765")).toBeInTheDocument();
  });

  it('displays "TODAY", "THIS WEEK", "THIS MONTH", "THIS YEAR" labels (uppercase)', () => {
    render(<MetricsBar {...createMockProps()} />);

    expect(screen.getByText("TODAY")).toBeInTheDocument();
    expect(screen.getByText("THIS WEEK")).toBeInTheDocument();
    expect(screen.getByText("THIS MONTH")).toBeInTheDocument();
    expect(screen.getByText("THIS YEAR")).toBeInTheDocument();
  });

  it('renders "stitches" unit text for each metric cell', () => {
    render(<MetricsBar {...createMockProps()} />);

    const stitchesLabels = screen.getAllByText("stitches");
    expect(stitchesLabels).toHaveLength(4);
  });

  it('shows "0" for each counter when all values are 0 (not hidden)', () => {
    render(
      <MetricsBar
        stitchesToday={0}
        stitchesThisWeek={0}
        stitchesThisMonth={0}
        stitchesThisYear={0}
      />,
    );

    const zeros = screen.getAllByText("0");
    expect(zeros).toHaveLength(4);
  });

  it("applies bg-success-muted class to the container", () => {
    const { container } = render(<MetricsBar {...createMockProps()} />);

    const metricsBar = container.firstElementChild as HTMLElement;
    expect(metricsBar.className).toContain("bg-success-muted");
  });

  it("applies font-mono and tabular-nums classes to numeric values", () => {
    render(<MetricsBar {...createMockProps()} />);

    const value = screen.getByText("1,234");
    expect(value.className).toContain("font-mono");
    expect(value.className).toContain("tabular-nums");
  });
});

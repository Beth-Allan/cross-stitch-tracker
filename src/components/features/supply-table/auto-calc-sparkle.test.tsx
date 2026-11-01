import { describe, it, expect } from "vitest";
import userEvent from "@testing-library/user-event";
import { render, screen } from "@/__tests__/test-utils";
import { AutoCalcSparkle } from "./auto-calc-sparkle";

describe("AutoCalcSparkle", () => {
  it("says on hover that a need worked out from a stitch count is auto-calculated", async () => {
    const user = userEvent.setup();
    render(<AutoCalcSparkle stitchCount={1200} need={3} />);

    await user.hover(screen.getByTestId("auto-calc-indicator"));

    expect(await screen.findByText("Auto-calculated from the stitch count")).toBeInTheDocument();
  });

  it("never calls a line with no stitch count calculated: its 1 is only where it starts", () => {
    render(<AutoCalcSparkle stitchCount={0} need={1} />);

    expect(
      screen.getByRole("img", { name: "No stitch count yet, so this starts at 1" }),
    ).toBeInTheDocument();
  });

  it("never calls an Unknown need calculated, with or without a stitch count", () => {
    render(<AutoCalcSparkle stitchCount={500} need={null} />);

    expect(
      screen.getByRole("img", {
        name: "Can't be calculated: this thread's skein details aren't known yet",
      }),
    ).toBeInTheDocument();
  });

  it("is not a stop for Tab between the fields around it", async () => {
    const user = userEvent.setup();
    render(
      <>
        <input aria-label="Before" />
        <AutoCalcSparkle stitchCount={1200} need={3} />
        <input aria-label="After" />
      </>,
    );

    screen.getByRole("textbox", { name: "Before" }).focus();
    await user.tab();

    expect(screen.getByRole("textbox", { name: "After" })).toHaveFocus();
  });
});

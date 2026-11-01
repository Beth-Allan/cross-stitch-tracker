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

  it.each([
    { need: 1, why: "the 1 a line starts at" },
    { need: 14, why: "a figure left behind when the stitch count was cleared" },
    { need: 5, why: "a number typed into the add row with no stitches" },
  ])("never calls $why calculated", ({ need }) => {
    render(<AutoCalcSparkle stitchCount={0} need={need} />);

    expect(
      screen.getByRole("img", { name: "No stitch count to calculate from yet" }),
    ).toBeInTheDocument();
  });

  it.each([
    { stitchCount: 500, why: "with a stitch count" },
    { stitchCount: 0, why: "with no stitch count" },
  ])("never calls an Unknown need calculated, $why", ({ stitchCount }) => {
    render(<AutoCalcSparkle stitchCount={stitchCount} need={null} />);

    expect(screen.getByRole("img", { name: "Not calculated yet" })).toBeInTheDocument();
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

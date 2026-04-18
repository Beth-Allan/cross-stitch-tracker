import { describe, it, expect } from "vitest";
import { render, screen } from "@/__tests__/test-utils";
import { ErrorCard } from "./error-card";

describe("ErrorCard", () => {
  it("renders icon, title, and description", () => {
    render(
      <ErrorCard
        icon="!"
        title="Something went wrong"
        description="An unexpected error occurred."
      />,
    );

    expect(screen.getByText("!")).toBeInTheDocument();
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("An unexpected error occurred.")).toBeInTheDocument();
  });

  it("renders children (action slot)", () => {
    render(
      <ErrorCard icon="?" title="Not found" description="Page not found.">
        <button type="button">Go home</button>
      </ErrorCard>,
    );

    expect(screen.getByText("Go home")).toBeInTheDocument();
  });

  it("renders icon in a circle with aria-hidden", () => {
    const { container } = render(<ErrorCard icon="!" title="Error" description="Oops." />);

    const iconSpan = container.querySelector('[aria-hidden="true"]');
    expect(iconSpan).toBeInTheDocument();
    expect(iconSpan?.textContent).toBe("!");
  });

  it("uses h2 heading for title", () => {
    const { container } = render(<ErrorCard icon="!" title="Error title" description="Details." />);

    const heading = container.querySelector("h2");
    expect(heading).toBeInTheDocument();
    expect(heading?.textContent).toBe("Error title");
  });
});

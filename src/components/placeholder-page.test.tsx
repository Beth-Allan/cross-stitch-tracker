import { render, screen } from "@/__tests__/test-utils";
import { PlaceholderPage } from "./placeholder-page";
import { Scissors } from "lucide-react";

describe("PlaceholderPage", () => {
  it("renders the title and description", () => {
    render(
      <PlaceholderPage title="My Charts" description="Track your collection" icon={Scissors} />,
    );

    expect(screen.getByText("My Charts")).toBeInTheDocument();
    expect(screen.getByText("Track your collection")).toBeInTheDocument();
  });

  it("renders the coming soon badge", () => {
    render(
      <PlaceholderPage title="My Charts" description="Track your collection" icon={Scissors} />,
    );

    expect(screen.getByText("Coming soon")).toBeInTheDocument();
  });
});

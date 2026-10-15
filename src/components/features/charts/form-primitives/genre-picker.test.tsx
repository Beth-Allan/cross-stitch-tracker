import { describe, it, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { render, screen, fireEvent, waitFor } from "@/__tests__/test-utils";
import { GenrePicker } from "./genre-picker";

/**
 * Safari on macOS does not focus a button when it is clicked. On mousedown the
 * focused input blurs with `relatedTarget: null` — unless the button's mousedown
 * default was prevented, which keeps focus where it is. jsdom and userEvent model
 * the Chrome behaviour, so this replays Safari's sequence by hand.
 */
function safariClick(button: HTMLElement) {
  const focusKept = !fireEvent.mouseDown(button);
  if (!focusKept && document.activeElement instanceof HTMLElement) {
    fireEvent.focusOut(document.activeElement, { relatedTarget: null });
  }
  if (button.isConnected) {
    fireEvent.mouseUp(button);
    fireEvent.click(button);
  }
}

function renderPicker(onAddGenre = vi.fn().mockResolvedValue(undefined)) {
  render(
    <GenrePicker
      genres={[{ id: "g1", name: "Animal" }]}
      selectedIds={[]}
      onToggle={vi.fn()}
      onAddGenre={onAddGenre}
    />,
  );
  return { onAddGenre };
}

describe("GenrePicker", () => {
  it("adds a typed genre when Add is clicked in Safari", async () => {
    const { onAddGenre } = renderPicker();
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "+ Add" }));
    await user.type(screen.getByLabelText("New genre name"), "Dragons");
    safariClick(screen.getByRole("button", { name: "Add" }));

    await waitFor(() => expect(onAddGenre).toHaveBeenCalledWith("Dragons"));
  });

  it("adds a typed genre when Enter is pressed", async () => {
    const { onAddGenre } = renderPicker();
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "+ Add" }));
    await user.type(screen.getByLabelText("New genre name"), "Dragons{Enter}");

    expect(onAddGenre).toHaveBeenCalledWith("Dragons");
  });

  it("closes the input without adding when focus leaves the picker", async () => {
    const { onAddGenre } = renderPicker();
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "+ Add" }));
    await user.type(screen.getByLabelText("New genre name"), "Dragons");
    fireEvent.focusOut(screen.getByLabelText("New genre name"), { relatedTarget: null });

    expect(screen.queryByLabelText("New genre name")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "+ Add" })).toBeInTheDocument();
    expect(onAddGenre).not.toHaveBeenCalled();
  });

  it("keeps the input open with the typed name when adding fails", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    renderPicker(vi.fn().mockRejectedValue(new Error("A genre with that name already exists")));
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "+ Add" }));
    await user.type(screen.getByLabelText("New genre name"), "Animal{Enter}");

    await waitFor(() => expect(screen.getByLabelText("New genre name")).toHaveValue("Animal"));
    consoleError.mockRestore();
  });
});

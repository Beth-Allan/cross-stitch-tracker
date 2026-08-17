import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/__tests__/test-utils";
import { SessionsPageClient } from "./sessions-page-client";
import type { StitchSessionRow } from "@/types/session";

vi.mock("./log-session-modal", () => ({
  LogSessionModal: () => null,
}));

vi.mock("./session-table", () => ({
  SessionTable: () => <div data-testid="session-table" />,
}));

const session: StitchSessionRow = {
  id: "s-1",
  projectId: "p-1",
  projectName: "Autumn Sampler",
  date: new Date("2026-08-17T00:00:00.000Z"),
  stitchCount: 250,
  timeSpentMinutes: 60,
  photoKey: null,
  createdAt: new Date("2026-08-17T00:00:00.000Z"),
};

function renderClient(sessions: StitchSessionRow[] | null) {
  return render(
    <SessionsPageClient
      sessions={sessions}
      activeProjects={[]}
      projectsUnavailable={false}
      imageUrls={{}}
    />,
  );
}

describe("SessionsPageClient", () => {
  it("lists the sessions when they load", () => {
    renderClient([session]);

    expect(screen.getByTestId("session-table")).toBeInTheDocument();
    expect(screen.getByText("1 session logged")).toBeInTheDocument();
  });

  it("says none are logged yet when the account genuinely has none", () => {
    renderClient([]);

    expect(screen.getByText(/no stitching sessions logged yet/i)).toBeInTheDocument();
    expect(screen.queryByText(/temporarily unavailable/i)).not.toBeInTheDocument();
  });

  it("says the sessions could not load — never that there are none — when the query fails", () => {
    renderClient(null);

    expect(screen.getByText(/temporarily unavailable/i)).toBeInTheDocument();
    expect(screen.queryByText(/no stitching sessions logged yet/i)).not.toBeInTheDocument();
    expect(screen.queryByTestId("session-table")).not.toBeInTheDocument();
  });

  it("still offers the log-session button when the sessions could not load", () => {
    renderClient(null);

    expect(screen.getByRole("button", { name: /log session/i })).toBeInTheDocument();
  });
});

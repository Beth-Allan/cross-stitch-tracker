import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@/__tests__/test-utils";
import { SessionTable } from "./session-table";
import type { StitchSessionRow } from "@/types/session";

// ─── Test Data ──────────────────────────────────────────────────────────────

function createSession(overrides: Partial<StitchSessionRow> = {}): StitchSessionRow {
  return {
    id: "session-1",
    projectId: "proj-1",
    projectName: "Autumn Sampler",
    date: new Date("2026-03-19T12:00:00"),
    stitchCount: 423,
    timeSpentMinutes: 75,
    photoKey: null,
    createdAt: new Date("2026-03-19T10:00:00Z"),
    ...overrides,
  };
}

const baseSessions: StitchSessionRow[] = [
  createSession({
    id: "s1",
    date: new Date("2026-03-19T12:00:00"),
    stitchCount: 423,
    timeSpentMinutes: 75,
  }),
  createSession({
    id: "s2",
    date: new Date("2026-03-18T12:00:00"),
    stitchCount: 512,
    timeSpentMinutes: 90,
    photoKey: "photos/session-s2.jpg",
  }),
  createSession({
    id: "s3",
    date: new Date("2026-03-16T12:00:00"),
    stitchCount: 380,
    timeSpentMinutes: 65,
  }),
];

describe("SessionTable", () => {
  const defaultProps = {
    sessions: baseSessions,
    imageUrls: {},
    onEditSession: vi.fn(),
  };

  it("renders all session rows with date, stitch count, time, and photo columns", () => {
    render(<SessionTable {...defaultProps} />);

    // Each value appears twice: once in table, once in mobile cards
    expect(screen.getAllByText("Mar 19, 2026")).toHaveLength(2);
    expect(screen.getAllByText("Mar 18, 2026")).toHaveLength(2);
    expect(screen.getAllByText("Mar 16, 2026")).toHaveLength(2);

    expect(screen.getAllByText("423")).toHaveLength(1); // table only (mobile shows "423 stitches")
    expect(screen.getAllByText("512")).toHaveLength(1);
    expect(screen.getAllByText("380")).toHaveLength(1);

    expect(screen.getAllByText("1h 15m")).toHaveLength(2);
    expect(screen.getAllByText("1h 30m")).toHaveLength(2);
    expect(screen.getAllByText("1h 5m")).toHaveLength(2);
  });

  it("sorts by date desc by default", () => {
    render(<SessionTable {...defaultProps} />);

    const rows = screen.getAllByRole("row");
    // header + 3 data rows
    expect(rows).toHaveLength(4);

    // First data row should be most recent (Mar 19)
    const cells = rows[1].querySelectorAll("td");
    expect(cells[0].textContent).toContain("Mar 19, 2026");
  });

  it("clicking date header toggles sort direction", () => {
    render(<SessionTable {...defaultProps} />);

    const dateHeader = screen.getByRole("columnheader", { name: /date/i });
    fireEvent.click(dateHeader);

    // After clicking, sort should flip to asc — oldest first
    const rows = screen.getAllByRole("row");
    const cells = rows[1].querySelectorAll("td");
    expect(cells[0].textContent).toContain("Mar 16, 2026");
  });

  it("clicking stitches header sorts by stitch count", () => {
    render(<SessionTable {...defaultProps} />);

    const stitchesHeader = screen.getByRole("columnheader", { name: /stitches/i });
    fireEvent.click(stitchesHeader);

    // Default new sort is desc — highest first
    const rows = screen.getAllByRole("row");
    const cells = rows[1].querySelectorAll("td");
    expect(cells[1].textContent).toContain("512");
  });

  it("desktop table edit buttons have md:opacity-0 (hover reveals)", () => {
    render(<SessionTable {...defaultProps} />);

    const editButtons = screen.getAllByLabelText("Edit session");
    // 3 in desktop table + 3 in mobile cards = 6
    expect(editButtons).toHaveLength(6);
    const desktopButtons = editButtons.filter((btn) => btn.className.includes("md:opacity-0"));
    expect(desktopButtons).toHaveLength(3);
  });

  it("renders mobile card view with session data", () => {
    render(<SessionTable {...defaultProps} />);

    const mobileCards = document.querySelectorAll(".md\\:hidden > div");
    expect(mobileCards).toHaveLength(3);
  });

  it("shows camera icon for rows with photoKey", () => {
    render(<SessionTable {...defaultProps} />);

    // Only session s2 has photoKey — count emerald camera icons inside table body cells
    const dataRows = screen.getAllByRole("row").slice(1); // skip header
    let cameraCount = 0;
    for (const row of dataRows) {
      // Photo column is 4th cell (index 3) when showProjectName=false
      const photoCell = row.querySelectorAll("td")[3];
      if (photoCell?.querySelector(".text-emerald-500")) {
        cameraCount++;
      }
    }
    expect(cameraCount).toBe(1);
  });

  it("renders empty state message when no sessions", () => {
    render(<SessionTable sessions={[]} imageUrls={{}} />);

    expect(screen.getByText(/no sessions logged/i)).toBeInTheDocument();
  });

  it("renders project name column when showProjectName=true", () => {
    render(<SessionTable {...defaultProps} showProjectName={true} />);

    // Should show a "PROJECT" column header
    expect(screen.getByRole("columnheader", { name: /project/i })).toBeInTheDocument();
    // Should show project name in cells (3 table + 3 mobile cards)
    expect(screen.getAllByText("Autumn Sampler")).toHaveLength(6);
  });

  it("does not render project name column by default", () => {
    render(<SessionTable {...defaultProps} />);

    expect(screen.queryByRole("columnheader", { name: /project/i })).not.toBeInTheDocument();
  });

  it("displays time as dash when timeSpentMinutes is null", () => {
    const sessions = [createSession({ id: "s-null", timeSpentMinutes: null })];
    render(<SessionTable sessions={sessions} imageUrls={{}} />);

    // em-dash for null time — appears in both table and mobile card
    expect(screen.getAllByText("\u2014")).toHaveLength(2);
  });
});

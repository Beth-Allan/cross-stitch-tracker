"use client";

import { useState } from "react";
import { Plus, Activity, Hash, TrendingUp, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SessionTable } from "./session-table";
import { LogSessionModal } from "./log-session-modal";
import type {
  StitchSessionRow,
  ProjectSessionStats,
  ActiveProjectForPicker,
} from "@/types/session";

// ─── Types ──────────────────────────────────────────────────────────────────

interface ProjectSessionsTabProps {
  sessions: StitchSessionRow[];
  stats: ProjectSessionStats;
  imageUrls: Record<string, string>;
  activeProjects: ActiveProjectForPicker[];
  projectId: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatActiveSince(date: Date | null): string {
  if (!date) return "\u2014";
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

// ─── Mini-Stat Card ─────────────────────────────────────────────────────────

interface MiniStatCardProps {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  mono: boolean;
}

function MiniStatCard({ label, value, icon: Icon, mono }: MiniStatCardProps) {
  return (
    <div className="rounded-lg bg-stone-50 p-4 dark:bg-stone-800/50">
      <div className="mb-1.5 flex items-center gap-1.5">
        <Icon className="text-muted-foreground size-[13px]" strokeWidth={1.5} />
        <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
          {label}
        </span>
      </div>
      <p
        className={`text-foreground text-lg font-semibold ${mono ? "font-mono tabular-nums" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}

// ─── Component ──────────────────────────────────────────────────────────────

export function ProjectSessionsTab({
  sessions,
  stats,
  imageUrls,
  activeProjects,
  projectId,
}: ProjectSessionsTabProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editSession, setEditSession] = useState<{
    id: string;
    projectId: string;
    date: string;
    stitchCount: number;
    timeSpentMinutes: number | null;
    photoKey: string | null;
  } | null>(null);

  const handleEditSession = (session: StitchSessionRow) => {
    setEditSession({
      id: session.id,
      projectId: session.projectId,
      date: session.date.toISOString().split("T")[0],
      stitchCount: session.stitchCount,
      timeSpentMinutes: session.timeSpentMinutes,
      photoKey: session.photoKey,
    });
    setModalOpen(true);
  };

  const handleOpenLog = () => {
    setEditSession(null);
    setModalOpen(true);
  };

  const hasSessions = sessions.length > 0;

  // Empty state
  if (!hasSessions) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground text-sm">No sessions logged for this project yet.</p>
        <div className="mt-4">
          <Button onClick={handleOpenLog} className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="mr-1.5 size-4" />
            Log Session
          </Button>
        </div>
        <LogSessionModal
          isOpen={modalOpen}
          onOpenChange={setModalOpen}
          activeProjects={activeProjects}
          imageUrls={imageUrls}
          lockedProjectId={projectId}
        />
      </div>
    );
  }

  const summaryStats: MiniStatCardProps[] = [
    {
      label: "TOTAL STITCHES",
      value: stats.totalStitches.toLocaleString(),
      icon: Activity,
      mono: true,
    },
    {
      label: "SESSIONS LOGGED",
      value: String(stats.sessionsLogged),
      icon: Hash,
      mono: true,
    },
    {
      label: "AVG PER SESSION",
      value: stats.avgPerSession.toLocaleString(),
      icon: TrendingUp,
      mono: true,
    },
    {
      label: "ACTIVE SINCE",
      value: formatActiveSince(stats.activeSince),
      icon: Calendar,
      mono: false,
    },
  ];

  return (
    <div>
      {/* Mini-stat cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {summaryStats.map((stat) => (
          <MiniStatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* Session count + Log Session button */}
      <div className="mb-3 flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          {sessions.length} session{sessions.length !== 1 ? "s" : ""} logged
        </p>
        <Button onClick={handleOpenLog} className="bg-emerald-600 hover:bg-emerald-700" size="sm">
          <Plus className="mr-1.5 size-3.5" />
          Log Session
        </Button>
      </div>

      {/* Session table */}
      <SessionTable sessions={sessions} imageUrls={imageUrls} onEditSession={handleEditSession} />

      {/* Log session modal — locked to this project */}
      <LogSessionModal
        isOpen={modalOpen}
        onOpenChange={setModalOpen}
        activeProjects={activeProjects}
        imageUrls={imageUrls}
        editSession={editSession}
        lockedProjectId={projectId}
      />
    </div>
  );
}

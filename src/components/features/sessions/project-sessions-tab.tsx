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

import { ProjectCompletionEstimate } from "@/components/features/stats/project-completion-estimate";
import { formatCalendarDate } from "@/lib/utils/calendar-date";
import type { CompletionEstimate } from "@/types/stats";

interface ProjectSessionsTabProps {
  sessions: StitchSessionRow[];
  stats: ProjectSessionStats;
  imageUrls: Record<string, string>;
  activeProjects: ActiveProjectForPicker[];
  projectId: string;
  completionEstimate?: CompletionEstimate | null;
}

function formatActiveSince(date: Date | null): string {
  if (!date) return "\u2014";
  return formatCalendarDate(date, { month: "short", year: "numeric" });
}

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

export function ProjectSessionsTab({
  sessions,
  stats,
  imageUrls,
  activeProjects,
  projectId,
  completionEstimate,
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
          <Button onClick={handleOpenLog}>
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
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {summaryStats.map((stat) => (
          <MiniStatCard key={stat.label} {...stat} />
        ))}
      </div>

      {completionEstimate && (
        <div className="mb-6">
          <ProjectCompletionEstimate estimate={completionEstimate} />
        </div>
      )}

      <div className="mb-3 flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          {sessions.length} session{sessions.length !== 1 ? "s" : ""} logged
        </p>
        <Button onClick={handleOpenLog} size="sm" className="min-h-11 md:min-h-0">
          <Plus className="mr-1.5 size-3.5" />
          Log Session
        </Button>
      </div>

      <SessionTable sessions={sessions} onEditSession={handleEditSession} />

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

import { useState, useMemo } from 'react'
import type { StitchSession, ActiveProject } from '../types'
import { Camera, ArrowUpDown, Pencil } from 'lucide-react'

function formatNumber(n: number): string {
  return n.toLocaleString()
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

type SortField = 'date' | 'stitchCount' | 'timeSpentMinutes'
type SortDir = 'asc' | 'desc'

interface SessionHistoryProps {
  sessions: StitchSession[]
  activeProjects: ActiveProject[]
  onEditSession?: (session: StitchSession) => void
  onNavigateToProject?: (projectId: string) => void
}

export function SessionHistory({ sessions, activeProjects, onEditSession, onNavigateToProject }: SessionHistoryProps) {
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const projectById = useMemo(() => {
    const map = new Map<string, ActiveProject>()
    activeProjects.forEach(p => map.set(p.id, p))
    return map
  }, [activeProjects])

  const sortedSessions = useMemo(() => {
    return [...sessions].sort((a, b) => {
      let cmp = 0
      switch (sortField) {
        case 'date':
          cmp = a.date.localeCompare(b.date)
          break
        case 'stitchCount':
          cmp = a.stitchCount - b.stitchCount
          break
        case 'timeSpentMinutes':
          cmp = (a.timeSpentMinutes ?? 0) - (b.timeSpentMinutes ?? 0)
          break
      }
      return sortDir === 'desc' ? -cmp : cmp
    })
  }, [sessions, sortField, sortDir])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('desc')
    }
  }

  const SortHeader = ({ field, label, className }: { field: SortField; label: string; className?: string }) => (
    <th
      className={`text-left px-4 py-3 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider cursor-pointer hover:text-stone-700 dark:hover:text-stone-300 transition-colors select-none ${className ?? ''}`}
      onClick={() => handleSort(field)}
      style={{ fontFamily: "'Source Sans 3', sans-serif" }}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {sortField === field && (
          <ArrowUpDown className="w-3 h-3 text-emerald-500" />
        )}
      </span>
    </th>
  )

  return (
    <div>
      <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200/60 dark:border-stone-800 overflow-x-auto">
        <table className="w-full text-sm" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
          <thead>
            <tr className="border-b border-stone-200 dark:border-stone-800">
              <SortHeader field="date" label="Date" />
              <th
                className="text-left px-4 py-3 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider"
                style={{ fontFamily: "'Source Sans 3', sans-serif" }}
              >
                Project
              </th>
              <SortHeader field="stitchCount" label="Stitches" />
              <SortHeader field="timeSpentMinutes" label="Time" />
              <th
                className="text-left px-4 py-3 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider w-10"
                style={{ fontFamily: "'Source Sans 3', sans-serif" }}
              >
                <Camera className="w-3.5 h-3.5" />
              </th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
            {sortedSessions.map((session) => {
              const project = projectById.get(session.projectId)
              return (
                <tr
                  key={session.id}
                  className="hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors group"
                >
                  <td className="px-4 py-3 text-stone-600 dark:text-stone-400 tabular-nums whitespace-nowrap" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                    {formatDate(session.date)}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => onNavigateToProject?.(session.projectId)}
                      className="text-stone-900 dark:text-stone-100 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors truncate max-w-[200px] block text-left underline decoration-stone-300 dark:decoration-stone-600 underline-offset-2 hover:decoration-emerald-400"
                      style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                    >
                      {project?.chartName ?? session.projectId}
                    </button>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-stone-700 dark:text-stone-300 whitespace-nowrap" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                    {formatNumber(session.stitchCount)}
                  </td>
                  <td className="px-4 py-3 text-stone-500 dark:text-stone-400 whitespace-nowrap" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                    {session.timeSpentMinutes != null ? formatTime(session.timeSpentMinutes) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {session.photoUrl && (
                      <Camera className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" strokeWidth={1.5} />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => onEditSession?.(session)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors opacity-0 group-hover:opacity-100"
                      title="Edit session"
                    >
                      <Pencil className="w-3.5 h-3.5" strokeWidth={1.5} />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {sortedSessions.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-sm text-stone-400 dark:text-stone-500" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
              No sessions logged yet. Use the Log Stitches button above to record your first session.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

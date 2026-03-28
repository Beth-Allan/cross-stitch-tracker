import { useState, useMemo } from 'react'
import type { ProjectSessionsTabProps, StitchSession } from '../types'
import { LogSessionModal } from './LogSessionModal'
import { Camera, ArrowUpDown, Pencil, Plus, Activity, Hash, TrendingUp, Calendar } from 'lucide-react'

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

export function ProjectSessionsTab({
  projectId,
  projectName,
  sessions,
  summary,
  onSaveSession,
  onDeleteSession,
  onUploadPhoto,
}: ProjectSessionsTabProps) {
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [modalOpen, setModalOpen] = useState(false)
  const [editSession, setEditSession] = useState<StitchSession | null>(null)

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

  const handleOpenLog = () => {
    setEditSession(null)
    setModalOpen(true)
  }

  const handleEditSession = (session: StitchSession) => {
    setEditSession(session)
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setEditSession(null)
  }

  const summaryStats = [
    { label: 'Total Stitches', value: formatNumber(summary.totalStitches), icon: Activity, mono: true },
    { label: 'Sessions Logged', value: String(summary.sessionsLogged), icon: Hash, mono: true },
    { label: 'Avg per Session', value: formatNumber(summary.averagePerSession), icon: TrendingUp, mono: true },
    {
      label: 'Active Since',
      value: summary.firstSessionDate ? formatDate(summary.firstSessionDate) : '—',
      icon: Calendar,
      mono: false,
    },
  ]

  const SortHeader = ({ field, label }: { field: SortField; label: string }) => (
    <th
      onClick={() => handleSort(field)}
      style={{
        textAlign: 'left',
        padding: '12px 16px',
        fontSize: '11px',
        fontWeight: 600,
        color: '#78716c',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.05em',
        cursor: 'pointer',
        fontFamily: "'Source Sans 3', sans-serif",
        userSelect: 'none' as const,
      }}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
        {label}
        {sortField === field && (
          <ArrowUpDown style={{ width: 12, height: 12, color: '#10b981' }} />
        )}
      </span>
    </th>
  )

  return (
    <div>
      {/* Mini stats summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
        {summaryStats.map(({ label, value, icon: Icon, mono }) => (
          <div
            key={label}
            className="bg-stone-50 dark:bg-stone-800/50 rounded-lg"
            style={{ padding: '14px 16px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <Icon style={{ width: 13, height: 13, color: '#a8a29e' }} strokeWidth={1.5} />
              <span
                style={{
                  fontSize: '10px',
                  color: '#a8a29e',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontFamily: "'Source Sans 3', sans-serif",
                }}
              >
                {label}
              </span>
            </div>
            <p
              style={{
                fontSize: '18px',
                fontWeight: 600,
                color: '#1c1917',
                fontFamily: mono ? "'JetBrains Mono', monospace" : "'Source Sans 3', sans-serif",
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Session table header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <p
          style={{
            fontSize: '13px',
            color: '#78716c',
            fontFamily: "'Source Sans 3', sans-serif",
          }}
        >
          {sessions.length} session{sessions.length !== 1 ? 's' : ''} logged
        </p>
        <button
          onClick={handleOpenLog}
          className="hover:bg-emerald-700 transition-colors"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 500,
            backgroundColor: '#059669',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontFamily: "'Source Sans 3', sans-serif",
          }}
        >
          <Plus style={{ width: 14, height: 14 }} />
          Log Session
        </button>
      </div>

      {/* Session table */}
      <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200/60 dark:border-stone-800 overflow-x-auto">
        <table style={{ width: '100%', fontSize: '14px', fontFamily: "'Source Sans 3', sans-serif", borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e7e5e4' }}>
              <SortHeader field="date" label="Date" />
              <SortHeader field="stitchCount" label="Stitches" />
              <SortHeader field="timeSpentMinutes" label="Time" />
              <th
                style={{
                  textAlign: 'left',
                  padding: '12px 16px',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#78716c',
                  width: '40px',
                }}
              >
                <Camera style={{ width: 14, height: 14 }} />
              </th>
              <th style={{ width: '40px' }} />
            </tr>
          </thead>
          <tbody>
            {sortedSessions.map((session) => (
              <tr
                key={session.id}
                className="hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors group"
                style={{ borderBottom: '1px solid #f5f5f4' }}
              >
                <td
                  style={{
                    padding: '12px 16px',
                    color: '#57534e',
                    fontVariantNumeric: 'tabular-nums',
                    whiteSpace: 'nowrap',
                    fontFamily: "'Source Sans 3', sans-serif",
                  }}
                >
                  {formatDate(session.date)}
                </td>
                <td
                  style={{
                    padding: '12px 16px',
                    color: '#292524',
                    fontVariantNumeric: 'tabular-nums',
                    whiteSpace: 'nowrap',
                    fontFamily: "'Source Sans 3', sans-serif",
                  }}
                >
                  {formatNumber(session.stitchCount)}
                </td>
                <td
                  style={{
                    padding: '12px 16px',
                    color: '#78716c',
                    whiteSpace: 'nowrap',
                    fontFamily: "'Source Sans 3', sans-serif",
                  }}
                >
                  {session.timeSpentMinutes != null ? formatTime(session.timeSpentMinutes) : '—'}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  {session.photoUrl && (
                    <Camera style={{ width: 14, height: 14, color: '#10b981' }} strokeWidth={1.5} />
                  )}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <button
                    onClick={() => handleEditSession(session)}
                    className="opacity-0 group-hover:opacity-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-all"
                    style={{
                      padding: '6px',
                      borderRadius: '6px',
                      color: '#a8a29e',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                    title="Edit session"
                  >
                    <Pencil style={{ width: 14, height: 14 }} strokeWidth={1.5} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {sessions.length === 0 && (
          <div style={{ padding: '48px 0', textAlign: 'center' }}>
            <p
              style={{
                fontSize: '14px',
                color: '#a8a29e',
                fontFamily: "'Source Sans 3', sans-serif",
              }}
            >
              No sessions logged for this project yet.
            </p>
          </div>
        )}
      </div>

      {/* Log session modal — pre-filled with this project */}
      <LogSessionModal
        isOpen={modalOpen}
        editSession={editSession}
        activeProjects={[{
          id: projectId,
          chartName: projectName,
          coverImageUrl: null,
          status: 'In Progress',
          stitchCount: 0,
          stitchesCompleted: summary.totalStitches,
          progressPercent: 0,
        }]}
        onSave={onSaveSession}
        onDelete={onDeleteSession}
        onUploadPhoto={onUploadPhoto}
        onClose={handleCloseModal}
      />
    </div>
  )
}

import type { ProjectStat, SupplyStat } from '../types'
import { FolderOpen, Palette } from 'lucide-react'

interface StatCardsProps {
  projectStats: ProjectStat[]
  supplyStats: SupplyStat[]
  onNavigateToProject?: (projectId: string) => void
  onNavigateToSupply?: (supplyType: string, supplyId: string) => void
}

function LinkableValue({ value, onClick }: { value: string; onClick?: () => void }) {
  if (!onClick) {
    return <>{value}</>
  }
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick() }}
      className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-left underline decoration-stone-300 dark:decoration-stone-600 underline-offset-2 hover:decoration-emerald-400 dark:hover:decoration-emerald-500"
    >
      {value}
    </button>
  )
}

function StatCard({ label, value, detail, onValueClick, onDetailClick }: {
  label: string
  value: string | number
  detail?: string
  onValueClick?: () => void
  onDetailClick?: () => void
}) {
  return (
    <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200/60 dark:border-stone-800 p-4 hover:shadow-sm transition-shadow">
      <p
        className="text-xs text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1"
        style={{ fontFamily: "'Source Sans 3', sans-serif" }}
      >
        {label}
      </p>
      <p
        className="text-lg font-semibold text-stone-900 dark:text-stone-100"
        style={{ fontFamily: typeof value === 'number' ? "'JetBrains Mono', monospace" : "'Source Sans 3', sans-serif" }}
      >
        {typeof value === 'number'
          ? value.toLocaleString()
          : <LinkableValue value={value} onClick={onValueClick} />
        }
      </p>
      {detail && (
        <p
          className="text-xs text-stone-400 dark:text-stone-500 mt-1 leading-relaxed"
          style={{ fontFamily: "'Source Sans 3', sans-serif" }}
        >
          {onDetailClick ? (
            <LinkableValue value={detail} onClick={onDetailClick} />
          ) : detail}
        </p>
      )}
    </div>
  )
}

// Map stat labels to known project names for linking
function getProjectLink(stat: ProjectStat | SupplyStat, onNavigate?: (id: string) => void): (() => void) | undefined {
  if (!onNavigate) return undefined
  const val = String(stat.value)
  // These stat values contain project names that should be clickable
  const projectNameMap: Record<string, string> = {
    'Enchanted Forest Sampler': 'proj-1',
    'Autumn Retreat': 'proj-3',
    'Maritime Mystery SAL': 'proj-6',
    'Stargazer Lily': 'proj-5',
    'Vancouver Skyline': 'proj-7',
  }
  return projectNameMap[val] ? () => onNavigate(projectNameMap[val]) : undefined
}

export function StatCards({ projectStats, supplyStats, onNavigateToProject, onNavigateToSupply }: StatCardsProps) {
  return (
    <div>
      {/* Project stats */}
      <div style={{ paddingTop: 48 }}>
        <h3
          className="text-sm font-semibold text-stone-900 dark:text-stone-100 mb-4 flex items-center gap-2"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          <FolderOpen className="w-4 h-4 text-emerald-500" strokeWidth={1.5} />
          Project Statistics
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {projectStats.map((stat) => (
            <StatCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              detail={stat.detail}
              onValueClick={getProjectLink(stat, onNavigateToProject)}
            />
          ))}
        </div>
      </div>

      {/* Supply stats */}
      <div style={{ paddingTop: 48 }}>
        <h3
          className="text-sm font-semibold text-stone-900 dark:text-stone-100 mb-4 flex items-center gap-2"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          <Palette className="w-4 h-4 text-emerald-500" strokeWidth={1.5} />
          Supply Statistics
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {supplyStats.map((stat) => (
            <StatCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              detail={stat.detail}
              onValueClick={getProjectLink(stat, onNavigateToProject)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

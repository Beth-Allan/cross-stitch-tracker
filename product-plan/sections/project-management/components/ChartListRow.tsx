import { useState } from 'react'
import type { Chart, Project, Designer } from '../types'
import { StatusBadge } from './StatusBadge'

import { Scissors } from 'lucide-react'

function Thumbnail({ src }: { src: string | null; name: string }) {
  const [failed, setFailed] = useState(false)
  const showFallback = !src || failed

  return (
    <div className="w-12 h-12 rounded-lg bg-stone-100 dark:bg-stone-800 overflow-hidden shrink-0">
      {src && !failed && (
        <img src={src} alt="" className="w-full h-full object-cover" onError={() => setFailed(true)} />
      )}
      {showFallback && (
        <div className="w-full h-full flex items-center justify-center">
          <Scissors className="w-4 h-4 text-stone-300 dark:text-stone-600" strokeWidth={1.5} />
        </div>
      )}
    </div>
  )
}

interface ChartListRowProps {
  chart: Chart
  project: Project
  designer?: Designer
  onView?: () => void
}

function formatNumber(n: number): string {
  return n.toLocaleString()
}

export function ChartListRow({ chart, project, designer, onView }: ChartListRowProps) {
  return (
    <button
      onClick={onView}
      className="w-full flex items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-stone-50 dark:hover:bg-stone-800/50 border-b border-stone-100 dark:border-stone-800 last:border-b-0 focus:outline-none focus:bg-stone-50 dark:focus:bg-stone-800/50 group"
    >
      {/* Thumbnail */}
      <Thumbnail src={chart.coverImageUrl} name={chart.name} />

      {/* Name + designer */}
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          {chart.name}
        </p>
        <p className="text-xs text-stone-500 dark:text-stone-400 truncate" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
          {designer?.name ?? 'Unknown'}
        </p>
      </div>

      {/* Stitch count */}
      <div className="hidden sm:block text-right w-20 shrink-0">
        <span
          className="text-xs text-stone-600 dark:text-stone-300"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          {formatNumber(chart.stitchCount)}
          {chart.stitchCountApproximate && '~'}
        </span>
        <p className="text-[10px] text-stone-400 dark:text-stone-500 uppercase tracking-wider">
          {chart.sizeCategory}
        </p>
      </div>

      {/* Progress (for WIPs) */}
      <div className="hidden md:flex items-center gap-2 w-24 shrink-0">
        {project.progressPercent > 0 && project.progressPercent < 100 && (
          <>
            <div className="flex-1 h-1.5 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 dark:bg-emerald-400 rounded-full"
                style={{ width: `${project.progressPercent}%` }}
              />
            </div>
            <span
              className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {project.progressPercent}%
            </span>
          </>
        )}
      </div>

      {/* Status */}
      <div className="shrink-0">
        <StatusBadge status={project.status} />
      </div>
    </button>
  )
}

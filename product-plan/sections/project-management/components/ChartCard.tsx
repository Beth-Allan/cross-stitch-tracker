import { useState } from 'react'
import type { Chart, Project, ProjectStatus, Designer, Genre, Series } from '../types'
import { StatusBadge } from './StatusBadge'

interface ChartCardProps {
  chart: Chart
  project: Project
  designer?: Designer
  genres: Genre[]
  series: Series[]
  onView?: () => void
}

function formatNumber(n: number): string {
  return n.toLocaleString()
}

function formatDateFull(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

import { Scissors } from 'lucide-react'

// Status-driven placeholder — muted, sophisticated tints
const statusGradients: Record<ProjectStatus, [string, string]> = {
  'Unstarted':   ['#e7e5e4', '#d6d3d1'], // stone 200→300
  'Kitting':     ['#fef3c7', '#fde68a'], // amber 100→200
  'Kitted':      ['#d1fae5', '#a7f3d0'], // emerald 100→200
  'In Progress': ['#e0f2fe', '#bae6fd'], // sky 100→200
  'On Hold':     ['#ffedd5', '#fed7aa'], // orange 100→200
  'Finished':    ['#ede9fe', '#ddd6fe'], // violet 100→200
  'FFO':         ['#ffe4e6', '#fecdd3'], // rose 100→200
}

function CoverPlaceholder({ status }: { status: ProjectStatus }) {
  const [from, to] = statusGradients[status]

  return (
    <div
      className="w-full h-full flex items-center justify-center"
      style={{ background: `linear-gradient(160deg, ${from} 0%, ${to} 100%)` }}
    >
      <Scissors className="w-8 h-8 text-stone-400/25" strokeWidth={1} />
    </div>
  )
}

export function ChartCard({ chart, project, designer, genres, series, onView }: ChartCardProps) {
  const visibleGenres = genres.slice(0, 3)
  const extraGenres = genres.length - 3
  const [imgFailed, setImgFailed] = useState(false)
  const hasRealImage = !!chart.coverImageUrl && !imgFailed

  return (
    <button
      onClick={onView}
      className="group text-left w-full rounded-xl overflow-hidden transition-all duration-200 hover:shadow-lg hover:shadow-stone-900/8 dark:hover:shadow-black/30 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:ring-offset-2 focus:ring-offset-stone-50 dark:focus:ring-offset-stone-950 border border-stone-200/80 dark:border-stone-800 flex flex-col items-stretch"
    >
      {/* Cover image area — negative margin pulls image over the card's top padding/border gap */}
      <div className="aspect-[4/3] relative overflow-hidden">
        {hasRealImage ? (
          <img
            src={chart.coverImageUrl!}
            alt={chart.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <CoverPlaceholder status={project.status} />
        )}

        {/* Gradient overlay — only on real images, not placeholders */}
        {hasRealImage && (
          <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/20 to-transparent" />
        )}

        {/* Status badge — top left */}
        <div className="absolute top-3 left-3">
          <StatusBadge status={project.status} />
        </div>

        {/* Size category — top right */}
        <div className="absolute top-3 right-3">
          <span className="text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full bg-white/80 dark:bg-stone-900/80 text-stone-600 dark:text-stone-300 backdrop-blur-sm">
            {chart.sizeCategory}
          </span>
        </div>

        {/* "Up next" pill for kitted projects */}
        {project.status === 'Kitted' && project.wantToStartNext && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-emerald-600 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            Up next
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="p-4 bg-white dark:bg-stone-900 relative flex-1">
        {/* Chart name */}
        <h3 className="font-semibold text-stone-900 dark:text-stone-100 leading-snug line-clamp-2 mb-1 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors text-[15px]">
          {chart.name}
        </h3>

        {/* Designer + series */}
        <p className="text-[13px] text-stone-500 dark:text-stone-400 truncate mb-2">
          {designer?.name ?? 'Unknown'}
          {series.length > 0 && (
            <span className="text-stone-400 dark:text-stone-500">
              {' '}({series.map(s => s.name).join(', ')} series)
            </span>
          )}
        </p>

        {/* Stitch count */}
        <p className="text-[12px] text-stone-400 dark:text-stone-500 mb-3">
          {formatNumber(chart.stitchCount)} stitches{chart.stitchCountApproximate ? ' (approx.)' : ''}
        </p>

        {/* Genre tags — show up to 3 */}
        {visibleGenres.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap mb-3">
            {visibleGenres.map((genre) => (
              <span key={genre.id} className="text-[11px] px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
                {genre.name}
              </span>
            ))}
            {extraGenres > 0 && (
              <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-500">
                +{extraGenres}
              </span>
            )}
          </div>
        )}

        {/* Context-aware footer */}

        {/* Unstarted — no footer, card is clean */}

        {/* Kitting — text list of what's still needed */}
        {project.status === 'Kitting' && project.kittingNeeds.length > 0 && (
          <div>
            <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium mb-1">Needs:</p>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed">
              {project.kittingNeeds.join(', ')}
            </p>
          </div>
        )}

        {/* Kitted/Ready — ready indicator */}
        {project.status === 'Kitted' && !project.wantToStartNext && (
          <p className="text-[12px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
            Ready to stitch
          </p>
        )}

        {/* In Progress / On Hold — progress bar + last stitched */}
        {(project.status === 'In Progress' || project.status === 'On Hold') && (
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex-1 h-1.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-sky-500 dark:bg-sky-400 rounded-full"
                  style={{ width: `${project.progressPercent}%` }}
                />
              </div>
              <span className="text-xs font-medium text-sky-600 dark:text-sky-400 tabular-nums font-mono">
                {project.progressPercent}%
              </span>
            </div>
            {project.lastSessionDate && (
              <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-1.5">
                Last stitched {formatDateFull(project.lastSessionDate)}
              </p>
            )}
          </div>
        )}

        {/* Finished — full progress bar + finish date */}
        {project.status === 'Finished' && (
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex-1 h-1.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                <div className="h-full bg-violet-500 dark:bg-violet-400 rounded-full w-full" />
              </div>
              <span className="text-xs font-medium text-violet-600 dark:text-violet-400 tabular-nums font-mono">
                100%
              </span>
            </div>
            {project.finishDate && (
              <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-1.5">
                Finished {formatDateFull(project.finishDate)}
              </p>
            )}
          </div>
        )}

        {/* FFO — full progress bar + FFO date */}
        {project.status === 'FFO' && (
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex-1 h-1.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500 dark:bg-rose-400 rounded-full w-full" />
              </div>
              <span className="text-xs font-medium text-rose-600 dark:text-rose-400 tabular-nums font-mono">
                100%
              </span>
            </div>
            {project.ffoDate && (
              <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-1.5">
                Finished {formatDateFull(project.ffoDate)}
              </p>
            )}
          </div>
        )}
      </div>
    </button>
  )
}

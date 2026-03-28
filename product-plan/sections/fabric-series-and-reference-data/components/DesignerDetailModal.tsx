import { useState, useMemo } from 'react'
import type {
  Designer,
  DesignerChart,
  DesignerDetailModalProps,
} from '../types'
import {
  X, ExternalLink, ChevronUp, ChevronDown, Image as ImageIcon, Pencil, Trash2,
} from 'lucide-react'

/* ─── Types ─── */

type ChartSortKey = 'name' | 'stitchCount' | 'status'
type SortDir = 'asc' | 'desc'

const statusOrder: Record<string, number> = {
  'In Progress': 0,
  'Kitting': 1,
  'Unstarted': 2,
  'Finished': 3,
}

/* ─── Component ─── */

export function DesignerDetailModal({
  designer,
  charts,
  onNavigateToChart,
  onEditDesigner,
  onDeleteDesigner,
  onClose,
}: DesignerDetailModalProps) {
  const [chartSort, setChartSort] = useState<{ key: ChartSortKey; dir: SortDir }>({ key: 'name', dir: 'asc' })

  function handleSort(key: ChartSortKey) {
    setChartSort(prev =>
      prev.key === key
        ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: 'asc' }
    )
  }

  const sortedCharts = useMemo(() => {
    const result = [...charts]
    result.sort((a, b) => {
      const dir = chartSort.dir === 'asc' ? 1 : -1
      switch (chartSort.key) {
        case 'name':
          return dir * a.chartName.localeCompare(b.chartName)
        case 'stitchCount':
          return dir * (a.stitchCount - b.stitchCount)
        case 'status': {
          const aOrd = statusOrder[a.projectStatus || ''] ?? 99
          const bOrd = statusOrder[b.projectStatus || ''] ?? 99
          return dir * (aOrd - bOrd)
        }
        default:
          return 0
      }
    })
    return result
  }, [charts, chartSort])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-2xl max-h-[85vh] flex flex-col">

        {/* Header */}
        <div className="px-8 py-6 border-b border-stone-200 dark:border-stone-800 shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <h2
                className="text-lg font-semibold text-stone-900 dark:text-stone-100"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                {designer.name}
              </h2>
              {designer.website && (
                <a
                  href={designer.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 mt-1 transition-colors"
                  style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                >
                  {designer.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => onEditDesigner?.(designer.id)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDeleteDesigner?.(designer.id)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-6 mt-4">
            <StatItem label="Charts" value={designer.chartCount} />
            <StatItem label="Started" value={designer.projectsStarted} />
            <StatItem label="Finished" value={designer.projectsFinished} accent />
            {designer.topGenre && (
              <div>
                <p className="text-xs text-stone-400 dark:text-stone-500 uppercase tracking-wider" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                  Top Genre
                </p>
                <span className="inline-flex text-xs font-medium px-2 py-0.5 mt-0.5 rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                  {designer.topGenre}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Charts list */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-8 py-4">
            {/* Sort controls */}
            <div className="flex items-center gap-4 mb-3">
              <span className="text-xs text-stone-400 dark:text-stone-500 uppercase tracking-widest font-semibold" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                Charts ({charts.length})
              </span>
              <div className="flex items-center gap-1 ml-auto">
                {([
                  { key: 'name' as ChartSortKey, label: 'Name' },
                  { key: 'stitchCount' as ChartSortKey, label: 'Stitches' },
                  { key: 'status' as ChartSortKey, label: 'Status' },
                ]).map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => handleSort(opt.key)}
                    className={`px-2 py-1 text-xs rounded transition-colors ${
                      chartSort.key === opt.key
                        ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 font-medium'
                        : 'text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300'
                    }`}
                    style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                  >
                    {opt.label}
                    {chartSort.key === opt.key && (
                      chartSort.dir === 'asc'
                        ? <ChevronUp className="w-2.5 h-2.5 inline ml-0.5" />
                        : <ChevronDown className="w-2.5 h-2.5 inline ml-0.5" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Chart cards */}
            <div className="space-y-2">
              {sortedCharts.map(chart => (
                <ChartCard
                  key={chart.id}
                  chart={chart}
                  onNavigate={() => onNavigateToChart?.(chart.id)}
                />
              ))}
              {charts.length === 0 && (
                <p className="text-sm text-stone-400 dark:text-stone-500 text-center py-8" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                  No charts found for this designer
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Stat Item ─── */

function StatItem({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div>
      <p className="text-xs text-stone-400 dark:text-stone-500 uppercase tracking-wider" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
        {label}
      </p>
      <p
        className={`text-lg font-semibold ${
          accent ? 'text-emerald-600 dark:text-emerald-400' : 'text-stone-900 dark:text-stone-100'
        }`}
        style={{ fontFamily: "'Source Sans 3', sans-serif" }}
      >
        {value}
      </p>
    </div>
  )
}

/* ─── Chart Card ─── */

function ChartCard({ chart, onNavigate }: {
  chart: DesignerChart
  onNavigate?: () => void
}) {
  return (
    <div
      className="flex items-center gap-3 p-3 rounded-lg border border-stone-200 dark:border-stone-800 hover:bg-stone-50/50 dark:hover:bg-stone-800/30 transition-colors cursor-pointer"
      onClick={onNavigate}
    >
      {/* Thumbnail */}
      {chart.coverImageUrl ? (
        <div className="w-10 h-10 rounded-lg overflow-hidden bg-stone-100 dark:bg-stone-800 shrink-0">
          <img src={chart.coverImageUrl} alt={chart.chartName} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="w-10 h-10 rounded-lg bg-stone-100 dark:bg-stone-800 flex items-center justify-center shrink-0">
          <ImageIcon className="w-4 h-4 text-stone-300 dark:text-stone-600" />
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate"
          style={{ fontFamily: "'Source Sans 3', sans-serif" }}
        >
          {chart.chartName}
        </p>
        <div className="flex items-center gap-3 text-xs text-stone-500 dark:text-stone-400" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
          <span>{chart.stitchCount.toLocaleString()} stitches</span>
          <span>{chart.sizeCategory}</span>
        </div>
      </div>

      {/* Status + progress */}
      <div className="shrink-0 text-right">
        {chart.projectStatus ? (
          <StatusBadge status={chart.projectStatus} />
        ) : (
          <span className="text-xs text-stone-400 dark:text-stone-500" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
            Not started
          </span>
        )}
        {chart.progressPercent != null && chart.projectStatus === 'In Progress' && (
          <div className="flex items-center gap-1.5 mt-1">
            <div className="w-16 h-1.5 rounded-full bg-stone-200 dark:bg-stone-700 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500 dark:bg-emerald-400"
                style={{ width: `${chart.progressPercent}%` }}
              />
            </div>
            <span className="text-xs text-stone-500 dark:text-stone-400" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
              {chart.progressPercent}%
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Status Badge ─── */

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    'In Progress': 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    'Finished': 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-700',
    'Kitting': 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    'Unstarted': 'bg-stone-50 dark:bg-stone-800/50 text-stone-500 dark:text-stone-400 border-stone-200 dark:border-stone-700',
  }

  return (
    <span
      className={`inline-flex text-xs font-medium px-2 py-0.5 rounded-full border ${styles[status] || styles['Unstarted']}`}
      style={{ fontFamily: "'Source Sans 3', sans-serif" }}
    >
      {status}
    </span>
  )
}

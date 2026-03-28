import { useState, useMemo } from 'react'
import type {
  Series,
  SeriesListProps,
} from '../types'
import {
  Plus, X, ChevronUp, ChevronDown, Library,
} from 'lucide-react'

/* ─── Types ─── */

type SortKey = 'name' | 'completionPercent' | 'memberCount'
type SortDir = 'asc' | 'desc'

/* ─── Component ─── */

export function SeriesList({
  series,
  onCreateSeries,
  onViewSeries,
}: SeriesListProps) {
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: 'name', dir: 'asc' })
  const [showAddModal, setShowAddModal] = useState(false)
  const [newSeriesName, setNewSeriesName] = useState('')

  function handleSort(key: SortKey) {
    setSort(prev =>
      prev.key === key
        ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: 'asc' }
    )
  }

  const sortedSeries = useMemo(() => {
    const result = [...series]
    result.sort((a, b) => {
      const dir = sort.dir === 'asc' ? 1 : -1
      switch (sort.key) {
        case 'name':
          return dir * a.name.localeCompare(b.name)
        case 'completionPercent':
          return dir * (a.completionPercent - b.completionPercent)
        case 'memberCount':
          return dir * (a.memberCount - b.memberCount)
        default:
          return 0
      }
    })
    return result
  }, [series, sort])

  const inputClass =
    'w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-colors'

  return (
    <div>
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-5">
          <h1
            className="text-2xl font-bold text-stone-900 dark:text-stone-100"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Series
          </h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-lg transition-colors shadow-sm"
            style={{ fontFamily: "'Source Sans 3', sans-serif" }}
          >
            <Plus className="w-4 h-4" />
            Add Series
          </button>
        </div>

        {/* Sort controls */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-400 dark:text-stone-500 uppercase tracking-widest font-semibold mr-2" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
            Sort by
          </span>
          {([
            { key: 'name' as SortKey, label: 'Name' },
            { key: 'completionPercent' as SortKey, label: 'Completion' },
            { key: 'memberCount' as SortKey, label: 'Members' },
          ]).map(opt => (
            <button
              key={opt.key}
              onClick={() => handleSort(opt.key)}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                sort.key === opt.key
                  ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 font-medium'
                  : 'text-stone-500 dark:text-stone-400 border-stone-200 dark:border-stone-700 hover:text-stone-700 dark:hover:text-stone-300 hover:border-stone-300 dark:hover:border-stone-600'
              }`}
              style={{ fontFamily: "'Source Sans 3', sans-serif" }}
            >
              {opt.label}
              {sort.key === opt.key && (
                sort.dir === 'asc'
                  ? <ChevronUp className="w-3 h-3 inline ml-1" />
                  : <ChevronDown className="w-3 h-3 inline ml-1" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Series cards */}
      <div className="px-6 pb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedSeries.map(s => (
          <SeriesCard
            key={s.id}
            series={s}
            onView={() => onViewSeries?.(s.id)}
          />
        ))}
        {series.length === 0 && (
          <div className="col-span-full py-12 text-center">
            <Library className="w-8 h-8 text-stone-300 dark:text-stone-600 mx-auto mb-2" />
            <p className="text-sm text-stone-400 dark:text-stone-500" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
              No series created yet
            </p>
          </div>
        )}
      </div>

      {/* Add Series Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 dark:bg-black/60" onClick={() => setShowAddModal(false)} />
          <div className="relative w-full max-w-sm bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-stone-800">
              <h3
                className="text-base font-semibold text-stone-900 dark:text-stone-100"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                Add Series
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-6 py-5">
              <label className="block text-xs text-stone-500 dark:text-stone-400 uppercase tracking-wider font-semibold mb-1.5" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                Series Name
              </label>
              <input
                type="text"
                value={newSeriesName}
                onChange={e => setNewSeriesName(e.target.value)}
                placeholder="e.g. Mini Bottles"
                className={inputClass}
                autoFocus
              />
            </div>
            <div className="px-6 py-4 border-t border-stone-200 dark:border-stone-800 flex justify-end gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-sm font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
                style={{ fontFamily: "'Source Sans 3', sans-serif" }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (newSeriesName.trim()) {
                    onCreateSeries?.(newSeriesName.trim())
                    setNewSeriesName('')
                    setShowAddModal(false)
                  }
                }}
                className="px-5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-lg transition-colors shadow-sm"
                style={{ fontFamily: "'Source Sans 3', sans-serif" }}
              >
                Create Series
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── Series Card ─── */

function SeriesCard({ series, onView }: {
  series: Series
  onView?: () => void
}) {
  return (
    <div
      className="p-5 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm hover:shadow-md hover:border-stone-300 dark:hover:border-stone-700 transition-all cursor-pointer"
      onClick={onView}
    >
      <h3
        className="text-sm font-semibold text-stone-900 dark:text-stone-100 mb-3"
        style={{ fontFamily: "'Fraunces', serif" }}
      >
        {series.name}
      </h3>

      {/* Progress bar */}
      <div className="mb-2">
        <div className="w-full h-2 rounded-full bg-stone-200 dark:bg-stone-700 overflow-hidden">
          <div
            className="h-full rounded-full bg-emerald-500 dark:bg-emerald-400 transition-all"
            style={{ width: `${series.completionPercent}%` }}
          />
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-stone-500 dark:text-stone-400" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
          {series.finishedCount} of {series.memberCount} finished
        </span>
        <span
          className="text-sm font-semibold text-emerald-600 dark:text-emerald-400"
          style={{ fontFamily: "'Source Sans 3', sans-serif" }}
        >
          {series.completionPercent}%
        </span>
      </div>
    </div>
  )
}

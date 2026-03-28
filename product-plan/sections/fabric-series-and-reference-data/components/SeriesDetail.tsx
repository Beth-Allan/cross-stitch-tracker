import { useState, useRef, useEffect } from 'react'
import type {
  Series,
  SeriesMember,
  SeriesDetailProps,
} from '../types'
import {
  ArrowLeft, Plus, Trash2, Pencil, Check, X,
  Image as ImageIcon,
} from 'lucide-react'

/* ─── Component ─── */

export function SeriesDetail({
  series,
  members,
  onRenameSeries,
  onDeleteSeries,
  onAddChart,
  onRemoveChart,
  onNavigateToChart,
  onBack,
}: SeriesDetailProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(series.name)
  const [showAddChart, setShowAddChart] = useState(false)
  const editInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus()
      editInputRef.current.select()
    }
  }, [isEditing])

  function handleSaveName() {
    if (editName.trim() && editName.trim() !== series.name) {
      onRenameSeries?.(series.id, editName.trim())
    }
    setIsEditing(false)
  }

  function handleRemoveChart(chartId: string, chartName: string) {
    if (window.confirm(`Remove "${chartName}" from this series? The chart itself won't be deleted.`)) {
      onRemoveChart?.(series.id, chartId)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="px-6 pt-5 pb-4 border-b border-stone-200 dark:border-stone-800">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <input
                  ref={editInputRef}
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleSaveName()
                    if (e.key === 'Escape') { setEditName(series.name); setIsEditing(false) }
                  }}
                  className="text-xl font-bold text-stone-900 dark:text-stone-100 bg-transparent border-b-2 border-emerald-500 focus:outline-none px-0 py-0"
                  style={{ fontFamily: "'Fraunces', serif" }}
                />
                <button
                  onClick={handleSaveName}
                  className="p-1 rounded text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => { setEditName(series.name); setIsEditing(false) }}
                  className="p-1 rounded text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1
                  className="text-xl font-bold text-stone-900 dark:text-stone-100 truncate"
                  style={{ fontFamily: "'Fraunces', serif" }}
                >
                  {series.name}
                </h1>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1 rounded text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors shrink-0"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
          <button
            onClick={() => {
              if (window.confirm(`Delete series "${series.name}"? The charts in this series won't be deleted.`)) {
                onDeleteSeries?.(series.id)
              }
            }}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors shrink-0"
            style={{ fontFamily: "'Source Sans 3', sans-serif" }}
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>

        {/* Completion bar */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-2.5 rounded-full bg-stone-200 dark:bg-stone-700 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500 dark:bg-emerald-400 transition-all"
              style={{ width: `${series.completionPercent}%` }}
            />
          </div>
          <span className="text-sm font-medium text-stone-600 dark:text-stone-400 shrink-0" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
            {series.finishedCount} of {series.memberCount} finished
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-5">
        {/* Add chart button */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-stone-400 dark:text-stone-500 uppercase tracking-widest font-semibold" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
            Member Charts
          </span>
          <button
            onClick={() => setShowAddChart(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-lg transition-colors"
            style={{ fontFamily: "'Source Sans 3', sans-serif" }}
          >
            <Plus className="w-4 h-4" />
            Add Chart
          </button>
        </div>

        {/* Member cards */}
        <div className="space-y-3">
          {members.map(member => (
            <MemberCard
              key={member.chartId}
              member={member}
              onNavigate={() => onNavigateToChart?.(member.chartId)}
              onRemove={() => handleRemoveChart(member.chartId, member.chartName)}
            />
          ))}
          {members.length === 0 && (
            <div className="py-12 text-center border-2 border-dashed border-stone-200 dark:border-stone-700 rounded-xl">
              <p className="text-sm text-stone-400 dark:text-stone-500" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                No charts in this series yet
              </p>
              <button
                onClick={() => setShowAddChart(true)}
                className="mt-2 text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                style={{ fontFamily: "'Source Sans 3', sans-serif" }}
              >
                Add your first chart
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add Chart Modal */}
      {showAddChart && (
        <AddChartModal
          seriesId={series.id}
          onAdd={(chartId) => {
            onAddChart?.(series.id, chartId)
            setShowAddChart(false)
          }}
          onClose={() => setShowAddChart(false)}
        />
      )}
    </div>
  )
}

/* ─── Member Card ─── */

function MemberCard({ member, onNavigate, onRemove }: {
  member: SeriesMember
  onNavigate?: () => void
  onRemove?: () => void
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="flex items-center gap-4 p-4 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm hover:shadow-md hover:border-stone-300 dark:hover:border-stone-700 transition-all cursor-pointer"
      onClick={onNavigate}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Thumbnail */}
      {member.coverImageUrl ? (
        <div className="w-12 h-12 rounded-lg overflow-hidden bg-stone-100 dark:bg-stone-800 shrink-0">
          <img src={member.coverImageUrl} alt={member.chartName} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="w-12 h-12 rounded-lg bg-stone-100 dark:bg-stone-800 flex items-center justify-center shrink-0">
          <ImageIcon className="w-5 h-5 text-stone-300 dark:text-stone-600" />
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate"
          style={{ fontFamily: "'Source Sans 3', sans-serif" }}
        >
          {member.chartName}
        </p>
        <div className="flex items-center gap-3 text-xs text-stone-500 dark:text-stone-400 mt-0.5" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
          <span>{member.designerName}</span>
          <span>{member.stitchCount.toLocaleString()} stitches</span>
        </div>
      </div>

      {/* Status + progress */}
      <div className="shrink-0 flex items-center gap-3">
        <div className="text-right">
          {member.projectStatus ? (
            <StatusBadge status={member.projectStatus} />
          ) : (
            <span className="text-xs text-stone-400 dark:text-stone-500" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
              Not started
            </span>
          )}
          {member.progressPercent != null && member.projectStatus === 'In Progress' && (
            <div className="flex items-center gap-1.5 mt-1">
              <div className="w-16 h-1.5 rounded-full bg-stone-200 dark:bg-stone-700 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500 dark:bg-emerald-400"
                  style={{ width: `${member.progressPercent}%` }}
                />
              </div>
              <span className="text-xs text-stone-500 dark:text-stone-400" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                {member.progressPercent}%
              </span>
            </div>
          )}
        </div>

        {/* Remove button */}
        <button
          onClick={e => { e.stopPropagation(); onRemove?.() }}
          className={`p-1.5 rounded-md text-stone-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all ${hovered ? 'opacity-100' : 'opacity-0'}`}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
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

/* ─── Add Chart Modal ─── */

function AddChartModal({ seriesId, onAdd, onClose }: {
  seriesId: string
  onAdd: (chartId: string) => void
  onClose: () => void
}) {
  const [search, setSearch] = useState('')
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    ref.current?.focus()
  }, [])

  // In a real app, this would be a list of charts not already in the series
  // For the design preview, we show a placeholder
  const placeholderCharts = [
    { id: 'chart-new-1', name: 'Celtic Dragon Mandala' },
    { id: 'chart-new-2', name: 'Winter Wonderland BAP' },
    { id: 'chart-new-3', name: 'Enchanted Forest Sampler' },
  ].filter(c => c.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-stone-800">
          <h3
            className="text-base font-semibold text-stone-900 dark:text-stone-100"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Add Chart to Series
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-6 py-4">
          <input
            ref={ref}
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search charts..."
            className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-colors"
            style={{ fontFamily: "'Source Sans 3', sans-serif" }}
          />
          <div className="mt-3 max-h-48 overflow-y-auto space-y-1">
            {placeholderCharts.map(chart => (
              <button
                key={chart.id}
                onClick={() => onAdd(chart.id)}
                className="w-full text-left px-3 py-2.5 text-sm text-stone-700 dark:text-stone-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-emerald-700 dark:hover:text-emerald-400 rounded-lg transition-colors"
                style={{ fontFamily: "'Source Sans 3', sans-serif" }}
              >
                {chart.name}
              </button>
            ))}
            {placeholderCharts.length === 0 && (
              <p className="text-sm text-stone-400 dark:text-stone-500 text-center py-4" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                No matching charts found
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

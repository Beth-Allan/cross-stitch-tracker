import { useState, useMemo, useRef, useEffect } from 'react'
import type {
  Designer,
  DesignerPageProps,
} from '../types'
import {
  Search, ChevronUp, ChevronDown, ExternalLink, Pencil, Trash2, Users, Plus,
} from 'lucide-react'

/* ─── Types ─── */

type SortKey = 'name' | 'chartCount' | 'projectsFinished'
type SortDir = 'asc' | 'desc'

/* ─── Shared Sub-Components ─── */

function SortableHeader({ label, sortKey, currentSort, onSort }: {
  label: string
  sortKey: SortKey
  currentSort: { key: SortKey; dir: SortDir }
  onSort: (key: SortKey) => void
}) {
  const isActive = currentSort.key === sortKey
  return (
    <th
      className="py-2.5 px-4 text-left cursor-pointer select-none group"
      onClick={() => onSort(sortKey)}
    >
      <span
        className={`text-xs uppercase tracking-wider font-semibold transition-colors inline-flex items-center gap-1 ${
          isActive
            ? 'text-emerald-600 dark:text-emerald-400'
            : 'text-stone-400 dark:text-stone-500 group-hover:text-stone-600 dark:group-hover:text-stone-300'
        }`}
        style={{ fontFamily: "'Source Sans 3', sans-serif" }}
      >
        {label}
        {isActive && (
          currentSort.dir === 'asc'
            ? <ChevronUp className="w-3 h-3" />
            : <ChevronDown className="w-3 h-3" />
        )}
      </span>
    </th>
  )
}

function FilterDropdown({ label, options, value, onChange }: {
  label: string
  options: { value: string; label: string }[]
  value: string | null
  onChange: (value: string | null) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const selectedLabel = value ? options.find(o => o.value === value)?.label : null

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
          value
            ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
            : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:border-stone-300 dark:hover:border-stone-600'
        }`}
        style={{ fontFamily: "'Source Sans 3', sans-serif" }}
      >
        {selectedLabel || label}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg shadow-lg z-20 py-1 max-h-60 overflow-y-auto">
          {value && (
            <button
              onClick={() => { onChange(null); setIsOpen(false) }}
              className="w-full text-left px-3 py-2 text-sm text-stone-400 dark:text-stone-500 hover:bg-stone-50 dark:hover:bg-stone-800"
              style={{ fontFamily: "'Source Sans 3', sans-serif" }}
            >
              Clear filter
            </button>
          )}
          {options.map(opt => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setIsOpen(false) }}
              className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                opt.value === value
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
                  : 'text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
              }`}
              style={{ fontFamily: "'Source Sans 3', sans-serif" }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── Designer Row ─── */

function DesignerRow({ designer, onView, onEdit, onDelete }: {
  designer: Designer
  onView?: () => void
  onEdit?: () => void
  onDelete?: () => void
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <tr
      className="border-b border-stone-100 dark:border-stone-800/60 transition-colors hover:bg-stone-50/50 dark:hover:bg-stone-800/30"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <td className="py-3 px-4">
        <button
          onClick={onView}
          className="text-sm font-medium text-stone-900 dark:text-stone-100 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors text-left"
          style={{ fontFamily: "'Source Sans 3', sans-serif" }}
        >
          {designer.name}
        </button>
      </td>
      <td className="py-3 px-4">
        {designer.website ? (
          <a
            href={designer.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 inline-flex items-center gap-1 transition-colors"
            style={{ fontFamily: "'Source Sans 3', sans-serif" }}
          >
            <ExternalLink className="w-3 h-3" />
          </a>
        ) : (
          <span className="text-sm text-stone-400 dark:text-stone-500">—</span>
        )}
      </td>
      <td className="py-3 px-4">
        <span className="text-sm text-stone-600 dark:text-stone-400" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
          {designer.chartCount}
        </span>
      </td>
      <td className="py-3 px-4">
        <span className="text-sm text-stone-600 dark:text-stone-400" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
          {designer.projectsStarted}
        </span>
      </td>
      <td className="py-3 px-4">
        <span className="text-sm font-medium text-stone-700 dark:text-stone-300" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
          {designer.projectsFinished}
        </span>
      </td>
      <td className="py-3 px-4">
        {designer.topGenre ? (
          <span className="inline-flex text-xs font-medium px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
            {designer.topGenre}
          </span>
        ) : (
          <span className="text-sm text-stone-400 dark:text-stone-500">—</span>
        )}
      </td>
      <td className="py-3 px-4">
        <div className={`flex items-center gap-1 justify-end transition-opacity ${hovered ? 'opacity-100' : 'opacity-0'}`}>
          <button
            onClick={onEdit}
            className="p-1.5 rounded-md text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-md text-stone-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  )
}

/* ─── Mobile Card ─── */

function DesignerCard({ designer, onView, onEdit, onDelete }: {
  designer: Designer
  onView?: () => void
  onEdit?: () => void
  onDelete?: () => void
}) {
  return (
    <div
      className="p-4 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm"
      onClick={onView}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="min-w-0 flex-1">
          <h3
            className="text-sm font-semibold text-stone-900 dark:text-stone-100 truncate"
            style={{ fontFamily: "'Source Sans 3', sans-serif" }}
          >
            {designer.name}
          </h3>
          {designer.topGenre && (
            <span className="inline-flex text-xs font-medium px-2 py-0.5 mt-1 rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
              {designer.topGenre}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0 ml-2">
          {designer.website && (
            <a
              href={designer.website}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="p-1.5 rounded-md text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
          <button
            onClick={e => { e.stopPropagation(); onEdit?.() }}
            className="p-1.5 rounded-md text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={e => { e.stopPropagation(); onDelete?.() }}
            className="p-1.5 rounded-md text-stone-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <div className="flex items-center gap-4 text-xs text-stone-500 dark:text-stone-400" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
        <span>{designer.chartCount} charts</span>
        <span>{designer.projectsStarted} started</span>
        <span className="font-medium text-stone-700 dark:text-stone-300">{designer.projectsFinished} finished</span>
      </div>
    </div>
  )
}

/* ─── Main Component ─── */

export function DesignerPage({
  designers,
  onAddDesigner,
  onEditDesigner,
  onDeleteDesigner,
  onViewDesigner,
}: DesignerPageProps) {
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: 'name', dir: 'asc' })
  const [search, setSearch] = useState('')
  const [genreFilter, setGenreFilter] = useState<string | null>(null)

  function handleSort(key: SortKey) {
    setSort(prev =>
      prev.key === key
        ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: 'asc' }
    )
  }

  // Unique genres from designers
  const genres = useMemo(() => {
    const set = new Set<string>()
    for (const d of designers) {
      if (d.topGenre) set.add(d.topGenre)
    }
    return Array.from(set).sort()
  }, [designers])

  // Filter + sort
  const filteredDesigners = useMemo(() => {
    let result = designers.filter(d => {
      if (genreFilter && d.topGenre !== genreFilter) return false
      if (search) {
        const q = search.toLowerCase()
        if (!d.name.toLowerCase().includes(q)) return false
      }
      return true
    })

    result.sort((a, b) => {
      const dir = sort.dir === 'asc' ? 1 : -1
      switch (sort.key) {
        case 'name':
          return dir * a.name.localeCompare(b.name)
        case 'chartCount':
          return dir * (a.chartCount - b.chartCount)
        case 'projectsFinished':
          return dir * (a.projectsFinished - b.projectsFinished)
        default:
          return 0
      }
    })

    return result
  }, [designers, search, genreFilter, sort])

  const hasActiveFilters = genreFilter || search

  return (
    <div>
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-5">
          <h1
            className="text-2xl font-bold text-stone-900 dark:text-stone-100"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Designers
          </h1>
          <button
            onClick={onAddDesigner}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white text-sm font-medium transition-colors shadow-sm"
            style={{ fontFamily: "'Source Sans 3', sans-serif" }}
          >
            <Plus className="w-4 h-4" />
            Add Designer
          </button>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-stone-500" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search designers..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-colors"
              style={{ fontFamily: "'Source Sans 3', sans-serif" }}
            />
          </div>

          <FilterDropdown
            label="Genre"
            options={genres.map(g => ({ value: g, label: g }))}
            value={genreFilter}
            onChange={setGenreFilter}
          />

          {hasActiveFilters && (
            <button
              onClick={() => { setSearch(''); setGenreFilter(null) }}
              className="text-xs text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 transition-colors"
              style={{ fontFamily: "'Source Sans 3', sans-serif" }}
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Desktop table */}
      <div className="max-md:hidden overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-stone-200 dark:border-stone-800">
              <SortableHeader label="Designer" sortKey="name" currentSort={sort} onSort={handleSort} />
              <th className="py-2.5 px-4 text-left">
                <span className="text-xs uppercase tracking-wider font-semibold text-stone-400 dark:text-stone-500" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                  Web
                </span>
              </th>
              <SortableHeader label="Charts" sortKey="chartCount" currentSort={sort} onSort={handleSort} />
              <th className="py-2.5 px-4 text-left">
                <span className="text-xs uppercase tracking-wider font-semibold text-stone-400 dark:text-stone-500" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                  Started
                </span>
              </th>
              <SortableHeader label="Finished" sortKey="projectsFinished" currentSort={sort} onSort={handleSort} />
              <th className="py-2.5 px-4 text-left">
                <span className="text-xs uppercase tracking-wider font-semibold text-stone-400 dark:text-stone-500" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                  Top Genre
                </span>
              </th>
              <th className="w-20" />
            </tr>
          </thead>
          <tbody>
            {filteredDesigners.map(designer => (
              <DesignerRow
                key={designer.id}
                designer={designer}
                onView={() => onViewDesigner?.(designer.id)}
                onEdit={() => onEditDesigner?.(designer.id, designer)}
                onDelete={() => onDeleteDesigner?.(designer.id)}
              />
            ))}
            {filteredDesigners.length === 0 && (
              <tr>
                <td colSpan={7} className="py-12 text-center">
                  <Users className="w-8 h-8 text-stone-300 dark:text-stone-600 mx-auto mb-2" />
                  <p className="text-sm text-stone-400 dark:text-stone-500" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                    {hasActiveFilters ? 'No designers match your filters' : 'No designers added yet'}
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden px-4 py-3 space-y-3">
        {filteredDesigners.map(designer => (
          <DesignerCard
            key={designer.id}
            designer={designer}
            onView={() => onViewDesigner?.(designer.id)}
            onEdit={() => onEditDesigner?.(designer.id, designer)}
            onDelete={() => onDeleteDesigner?.(designer.id)}
          />
        ))}
        {filteredDesigners.length === 0 && (
          <div className="py-12 text-center">
            <Users className="w-8 h-8 text-stone-300 dark:text-stone-600 mx-auto mb-2" />
            <p className="text-sm text-stone-400 dark:text-stone-500" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
              {hasActiveFilters ? 'No designers match your filters' : 'No designers added yet'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

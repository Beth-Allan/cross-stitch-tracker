import { useState, useRef, useEffect } from 'react'
import { ChevronDown, X, LayoutGrid, List, Table2 } from 'lucide-react'
import type { ProjectStatus, SizeCategory, Designer, Genre, FilterState, ViewMode } from '../types'

interface FilterBarProps {
  designers: Designer[]
  genres: Genre[]
  filters: FilterState
  viewMode: ViewMode
  totalCount: number
  filteredCount: number
  onFilterChange?: (filters: FilterState) => void
  onViewModeChange?: (mode: ViewMode) => void
}

// Dropdown component
function FilterDropdown<T extends string>({
  label,
  options,
  selected,
  onSelect,
  multi = false,
}: {
  label: string
  options: { value: T; label: string }[]
  selected: T[]
  onSelect: (values: T[]) => void
  multi?: boolean
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) {
      document.addEventListener('mousedown', handleClick)
      return () => document.removeEventListener('mousedown', handleClick)
    }
  }, [open])

  const hasSelection = selected.length > 0

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border transition-colors ${
          hasSelection
            ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
            : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'
        }`}
      >
        <span style={{ fontFamily: "'Source Sans 3', sans-serif" }}>{label}</span>
        {hasSelection && (
          <span className="text-[10px] bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-full w-4 h-4 flex items-center justify-center font-medium">
            {selected.length}
          </span>
        )}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} strokeWidth={1.5} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg shadow-lg z-30 py-1 max-h-64 overflow-y-auto">
          {options.map((opt) => {
            const isSelected = selected.includes(opt.value)
            return (
              <button
                key={opt.value}
                onClick={() => {
                  if (multi) {
                    onSelect(isSelected ? selected.filter((s) => s !== opt.value) : [...selected, opt.value])
                  } else {
                    onSelect(isSelected ? [] : [opt.value])
                    setOpen(false)
                  }
                }}
                className={`w-full text-left px-3 py-1.5 text-sm transition-colors ${
                  isSelected
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
                    : 'text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
                }`}
              >
                {multi && (
                  <span className={`inline-block w-3.5 h-3.5 mr-2 rounded border align-middle ${
                    isSelected
                      ? 'bg-emerald-500 border-emerald-500 dark:bg-emerald-400 dark:border-emerald-400'
                      : 'border-stone-300 dark:border-stone-600'
                  }`}>
                    {isSelected && (
                      <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 14 14" fill="none">
                        <path d="M3 7l3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                )}
                {opt.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

const statusOptions: { value: ProjectStatus; label: string }[] = [
  { value: 'Unstarted', label: 'Unstarted' },
  { value: 'Kitting', label: 'Kitting' },
  { value: 'Kitted', label: 'Ready' },
  { value: 'In Progress', label: 'Stitching' },
  { value: 'On Hold', label: 'On Hold' },
  { value: 'Finished', label: 'Finished' },
  { value: 'FFO', label: 'FFO' },
]

const sizeOptions: { value: SizeCategory; label: string }[] = [
  { value: 'Mini', label: 'Mini (<1,000)' },
  { value: 'Small', label: 'Small (1–4,999)' },
  { value: 'Medium', label: 'Medium (5–24,999)' },
  { value: 'Large', label: 'Large (25–49,999)' },
  { value: 'BAP', label: 'BAP (50,000+)' },
]

const viewIcons: Record<ViewMode, typeof LayoutGrid> = {
  gallery: LayoutGrid,
  list: List,
  table: Table2,
}

export function FilterBar({
  designers,
  genres,
  filters,
  viewMode,
  totalCount,
  filteredCount,
  onFilterChange,
  onViewModeChange,
}: FilterBarProps) {
  const designerOptions = designers.map((d) => ({ value: d.id, label: d.name }))
  const genreOptions = genres.map((g) => ({ value: g.id, label: g.name }))

  const hasAnyFilter = filters.status.length > 0 || filters.sizeCategory.length > 0 || filters.designerId !== null || filters.genreId !== null

  // Active filter chips
  const chips: { label: string; onRemove: () => void }[] = []
  filters.status.forEach((s) => {
    chips.push({
      label: s,
      onRemove: () => onFilterChange?.({ ...filters, status: filters.status.filter((x) => x !== s) }),
    })
  })
  filters.sizeCategory.forEach((s) => {
    chips.push({
      label: s,
      onRemove: () => onFilterChange?.({ ...filters, sizeCategory: filters.sizeCategory.filter((x) => x !== s) }),
    })
  })
  if (filters.designerId) {
    const des = designers.find((d) => d.id === filters.designerId)
    chips.push({
      label: des?.name ?? 'Designer',
      onRemove: () => onFilterChange?.({ ...filters, designerId: null }),
    })
  }
  if (filters.genreId) {
    const gen = genres.find((g) => g.id === filters.genreId)
    chips.push({
      label: gen?.name ?? 'Genre',
      onRemove: () => onFilterChange?.({ ...filters, genreId: null }),
    })
  }

  return (
    <div className="space-y-3">
      {/* Main filter row */}
      <div className="flex items-center gap-2 flex-wrap">
        <FilterDropdown
          label="Status"
          options={statusOptions}
          selected={filters.status}
          onSelect={(values) => onFilterChange?.({ ...filters, status: values })}
          multi
        />
        <FilterDropdown
          label="Size"
          options={sizeOptions}
          selected={filters.sizeCategory}
          onSelect={(values) => onFilterChange?.({ ...filters, sizeCategory: values })}
          multi
        />
        <FilterDropdown
          label="Designer"
          options={designerOptions}
          selected={filters.designerId ? [filters.designerId] : []}
          onSelect={(values) => onFilterChange?.({ ...filters, designerId: values[0] ?? null })}
        />
        <FilterDropdown
          label="Genre"
          options={genreOptions}
          selected={filters.genreId ? [filters.genreId] : []}
          onSelect={(values) => onFilterChange?.({ ...filters, genreId: values[0] ?? null })}
        />

        {hasAnyFilter && (
          <button
            onClick={() => onFilterChange?.({ status: [], sizeCategory: [], designerId: null, genreId: null, seriesId: null })}
            className="text-xs text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
          >
            Clear all
          </button>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Count */}
        <span className="text-xs text-stone-400 dark:text-stone-500 hidden sm:block" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
          {filteredCount === totalCount
            ? `${totalCount} charts`
            : `${filteredCount} of ${totalCount}`}
        </span>

        {/* View toggle */}
        <div className="flex items-center bg-stone-100 dark:bg-stone-800 rounded-lg p-0.5">
          {(Object.keys(viewIcons) as ViewMode[]).map((mode) => {
            const Icon = viewIcons[mode]
            const isActive = viewMode === mode
            return (
              <button
                key={mode}
                onClick={() => onViewModeChange?.(mode)}
                className={`p-1.5 rounded-md transition-colors ${
                  isActive
                    ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-sm'
                    : 'text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300'
                }`}
                title={mode.charAt(0).toUpperCase() + mode.slice(1)}
              >
                <Icon className="w-4 h-4" strokeWidth={1.5} />
              </button>
            )
          })}
        </div>
      </div>

      {/* Active filter chips */}
      {chips.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          {chips.map((chip, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
            >
              {chip.label}
              <button
                onClick={chip.onRemove}
                className="hover:text-emerald-900 dark:hover:text-emerald-200 transition-colors"
              >
                <X className="w-3 h-3" strokeWidth={2} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

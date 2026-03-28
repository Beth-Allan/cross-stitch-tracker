import { useState, useRef, useEffect } from 'react'
import { ChevronDown, X, Search, LayoutGrid, List, Table2, SlidersHorizontal } from 'lucide-react'
import type {
  ProjectStatus,
  SizeCategory,
  ViewMode,
  KittingFilterOption,
  CompletionBracket,
  FilterDimension,
  AdvancedFilterBarProps,
  FilterOption,
  AdvancedFilterState,
} from '../types'

/* ── Dropdown primitives ───────────────────────────────── */

function useClickOutside(ref: React.RefObject<HTMLElement | null>, onClose: () => void) {
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [ref, onClose])
}

function MultiSelectDropdown({
  label,
  options,
  selected,
  onSelect,
}: {
  label: string
  options: { value: string; label: string }[]
  selected: string[]
  onSelect: (values: string[]) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useClickOutside(ref, () => setOpen(false))

  const hasSelection = selected.length > 0

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border transition-colors whitespace-nowrap ${
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
        <div className="absolute top-full left-0 mt-1 w-52 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg shadow-lg z-30 py-1 max-h-64 overflow-y-auto">
          {options.map((opt) => {
            const isSelected = selected.includes(opt.value)
            return (
              <button
                key={opt.value}
                onClick={() => {
                  onSelect(isSelected ? selected.filter((s) => s !== opt.value) : [...selected, opt.value])
                }}
                className={`w-full text-left px-3 py-1.5 text-sm transition-colors flex items-center gap-2 ${
                  isSelected
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
                    : 'text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
                }`}
              >
                <span className={`inline-flex items-center justify-center w-3.5 h-3.5 rounded border flex-shrink-0 ${
                  isSelected
                    ? 'bg-emerald-500 border-emerald-500 dark:bg-emerald-400 dark:border-emerald-400'
                    : 'border-stone-300 dark:border-stone-600'
                }`}>
                  {isSelected && (
                    <svg className="w-3 h-3 text-white" viewBox="0 0 14 14" fill="none">
                      <path d="M3 7l3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                <span style={{ fontFamily: "'Source Sans 3', sans-serif" }}>{opt.label}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function SearchableSelectDropdown({
  label,
  options,
  selectedId,
  onSelect,
}: {
  label: string
  options: FilterOption[]
  selectedId: string | null
  onSelect: (id: string | null) => void
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  useClickOutside(ref, () => { setOpen(false); setQuery('') })

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus()
  }, [open])

  const filtered = query
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options

  const selectedLabel = selectedId ? options.find((o) => o.id === selectedId)?.label : null

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border transition-colors whitespace-nowrap ${
          selectedId
            ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
            : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'
        }`}
      >
        <span style={{ fontFamily: "'Source Sans 3', sans-serif" }}>{selectedLabel ?? label}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} strokeWidth={1.5} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg shadow-lg z-30 py-1">
          <div className="px-2 pb-1 pt-1">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${label.toLowerCase()}...`}
              className="w-full px-2 py-1 text-sm border border-stone-200 dark:border-stone-700 rounded bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 outline-none focus:border-emerald-400 dark:focus:border-emerald-600"
              style={{ fontFamily: "'Source Sans 3', sans-serif" }}
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {selectedId && (
              <button
                onClick={() => { onSelect(null); setOpen(false); setQuery('') }}
                className="w-full text-left px-3 py-1.5 text-sm text-stone-400 dark:text-stone-500 hover:bg-stone-50 dark:hover:bg-stone-800 italic"
              >
                Clear selection
              </button>
            )}
            {filtered.map((opt) => (
              <button
                key={opt.id}
                onClick={() => { onSelect(opt.id); setOpen(false); setQuery('') }}
                className={`w-full text-left px-3 py-1.5 text-sm transition-colors flex items-center justify-between ${
                  opt.id === selectedId
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
                    : 'text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
                }`}
              >
                <span style={{ fontFamily: "'Source Sans 3', sans-serif" }}>{opt.label}</span>
                {opt.count != null && (
                  <span className="text-[11px] text-stone-400 dark:text-stone-500" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                    {opt.count}
                  </span>
                )}
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="px-3 py-2 text-sm text-stone-400 dark:text-stone-500 italic">No results</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function SimpleSelectDropdown({
  label,
  options,
  selected,
  onSelect,
}: {
  label: string
  options: { value: string; label: string }[]
  selected: string | null
  onSelect: (value: string | null) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useClickOutside(ref, () => setOpen(false))

  const selectedLabel = selected ? options.find((o) => o.value === selected)?.label : null

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border transition-colors whitespace-nowrap ${
          selected
            ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
            : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'
        }`}
      >
        <span style={{ fontFamily: "'Source Sans 3', sans-serif" }}>{selectedLabel ?? label}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} strokeWidth={1.5} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg shadow-lg z-30 py-1 max-h-64 overflow-y-auto">
          {selected && (
            <button
              onClick={() => { onSelect(null); setOpen(false) }}
              className="w-full text-left px-3 py-1.5 text-sm text-stone-400 dark:text-stone-500 hover:bg-stone-50 dark:hover:bg-stone-800 italic"
            >
              Clear
            </button>
          )}
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { onSelect(opt.value); setOpen(false) }}
              className={`w-full text-left px-3 py-1.5 text-sm transition-colors ${
                opt.value === selected
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
                  : 'text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
              }`}
            >
              <span style={{ fontFamily: "'Source Sans 3', sans-serif" }}>{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function ToggleDropdown({
  label,
  value,
  onSelect,
}: {
  label: string
  value: boolean | null
  onSelect: (v: boolean | null) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useClickOutside(ref, () => setOpen(false))

  const displayLabel = value === true ? `${label}: Yes` : value === false ? `${label}: No` : label

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border transition-colors whitespace-nowrap ${
          value !== null
            ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
            : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'
        }`}
      >
        <span style={{ fontFamily: "'Source Sans 3', sans-serif" }}>{displayLabel}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} strokeWidth={1.5} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-36 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg shadow-lg z-30 py-1">
          {value !== null && (
            <button
              onClick={() => { onSelect(null); setOpen(false) }}
              className="w-full text-left px-3 py-1.5 text-sm text-stone-400 dark:text-stone-500 hover:bg-stone-50 dark:hover:bg-stone-800 italic"
            >
              Clear
            </button>
          )}
          <button
            onClick={() => { onSelect(true); setOpen(false) }}
            className={`w-full text-left px-3 py-1.5 text-sm transition-colors ${
              value === true ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400' : 'text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
            }`}
          >
            Yes
          </button>
          <button
            onClick={() => { onSelect(false); setOpen(false) }}
            className={`w-full text-left px-3 py-1.5 text-sm transition-colors ${
              value === false ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400' : 'text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
            }`}
          >
            No
          </button>
        </div>
      )}
    </div>
  )
}

/* ── Static options ────────────────────────────────────── */

const statusOptions: { value: string; label: string }[] = [
  { value: 'Unstarted', label: 'Unstarted' },
  { value: 'Kitting', label: 'Kitting' },
  { value: 'Kitted', label: 'Ready' },
  { value: 'In Progress', label: 'Stitching' },
  { value: 'On Hold', label: 'On Hold' },
  { value: 'Finished', label: 'Finished' },
  { value: 'FFO', label: 'FFO' },
]

const sizeOptions: { value: string; label: string }[] = [
  { value: 'Mini', label: 'Mini (<1,000)' },
  { value: 'Small', label: 'Small (1-4,999)' },
  { value: 'Medium', label: 'Medium (5-24,999)' },
  { value: 'Large', label: 'Large (25-49,999)' },
  { value: 'BAP', label: 'BAP (50,000+)' },
]

const kittingOptions: { value: string; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'fully-kitted', label: 'Fully Kitted' },
  { value: 'partially-kitted', label: 'Partially Kitted' },
  { value: 'not-started', label: 'Not Started' },
]

const completionOptions: { value: string; label: string }[] = [
  { value: '0-25', label: '0 - 25%' },
  { value: '25-50', label: '25 - 50%' },
  { value: '50-75', label: '50 - 75%' },
  { value: '75-100', label: '75 - 100%' },
]

const yearOptions: { value: string; label: string }[] = Array.from({ length: 10 }, (_, i) => {
  const y = new Date().getFullYear() - i
  return { value: String(y), label: String(y) }
})

const viewModes: { mode: ViewMode; icon: typeof LayoutGrid; label: string; description: string }[] = [
  { mode: 'gallery', icon: LayoutGrid, label: 'Cards', description: 'Visual cards with cover images and status details' },
  { mode: 'list', icon: List, label: 'List', description: 'Compact rows with key project info' },
  { mode: 'table', icon: Table2, label: 'Table', description: 'Full data table with sortable columns' },
]

/* ── Main AdvancedFilterBar ────────────────────────────── */

export function AdvancedFilterBar({
  config,
  filters,
  activeFilters,
  designerOptions,
  genreOptions,
  seriesOptions,
  storageLocationOptions,
  onFilterChange,
  onRemoveFilter,
  onClearAllFilters,
}: AdvancedFilterBarProps & {
  viewMode?: ViewMode
  onViewModeChange?: (mode: ViewMode) => void
  totalCount?: number
  filteredCount?: number
}) {
  const [showMore, setShowMore] = useState(false)
  const available = new Set(config.availableFilters)

  // Primary filters (always visible): status, size, search
  // Secondary filters (behind "More" toggle): everything else
  const hasSecondaryFilters = [
    'designer', 'genre', 'series', 'kittingStatus', 'completionBracket',
    'yearStarted', 'yearFinished', 'storageLocation', 'hasFabric', 'hasDigitalCopy',
  ].some((d) => available.has(d as FilterDimension))

  function updateFilter(patch: Partial<AdvancedFilterState>) {
    onFilterChange?.({ ...filters, ...patch })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Search + primary filters row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        {/* Search */}
        <div className="relative" style={{ minWidth: '200px', flex: '0 1 280px' }}>
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-stone-500" strokeWidth={1.5} />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => updateFilter({ search: e.target.value })}
            placeholder="Search projects, designers, codes..."
            className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 outline-none focus:border-emerald-400 dark:focus:border-emerald-600 transition-colors"
            style={{ fontFamily: "'Source Sans 3', sans-serif" }}
          />
        </div>

        {/* Status multi-select */}
        {available.has('status') && (
          <MultiSelectDropdown
            label="Status"
            options={statusOptions}
            selected={filters.status}
            onSelect={(values) => updateFilter({ status: values as ProjectStatus[] })}
          />
        )}

        {/* Size multi-select */}
        {available.has('sizeCategory') && (
          <MultiSelectDropdown
            label="Size"
            options={sizeOptions}
            selected={filters.sizeCategory}
            onSelect={(values) => updateFilter({ sizeCategory: values as SizeCategory[] })}
          />
        )}

        {/* More filters toggle */}
        {hasSecondaryFilters && (
          <button
            onClick={() => setShowMore(!showMore)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border transition-colors whitespace-nowrap ${
              showMore
                ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
                : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span style={{ fontFamily: "'Source Sans 3', sans-serif" }}>More</span>
          </button>
        )}
      </div>

      {/* Secondary filters row (expandable) */}
      {showMore && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {available.has('designer') && (
            <SearchableSelectDropdown
              label="Designer"
              options={designerOptions}
              selectedId={filters.designerId}
              onSelect={(id) => updateFilter({ designerId: id })}
            />
          )}
          {available.has('genre') && (
            <SearchableSelectDropdown
              label="Genre"
              options={genreOptions}
              selectedId={filters.genreId}
              onSelect={(id) => updateFilter({ genreId: id })}
            />
          )}
          {available.has('series') && (
            <SearchableSelectDropdown
              label="Series"
              options={seriesOptions}
              selectedId={filters.seriesId}
              onSelect={(id) => updateFilter({ seriesId: id })}
            />
          )}
          {available.has('kittingStatus') && (
            <SimpleSelectDropdown
              label="Kitting"
              options={kittingOptions}
              selected={filters.kittingStatus === 'all' ? null : filters.kittingStatus}
              onSelect={(v) => updateFilter({ kittingStatus: (v ?? 'all') as KittingFilterOption })}
            />
          )}
          {available.has('completionBracket') && (
            <SimpleSelectDropdown
              label="Completion"
              options={completionOptions}
              selected={filters.completionBracket}
              onSelect={(v) => updateFilter({ completionBracket: v as CompletionBracket | null })}
            />
          )}
          {available.has('yearStarted') && (
            <SimpleSelectDropdown
              label="Year Started"
              options={yearOptions}
              selected={filters.yearStarted ? String(filters.yearStarted) : null}
              onSelect={(v) => updateFilter({ yearStarted: v ? Number(v) : null })}
            />
          )}
          {available.has('yearFinished') && (
            <SimpleSelectDropdown
              label="Year Finished"
              options={yearOptions}
              selected={filters.yearFinished ? String(filters.yearFinished) : null}
              onSelect={(v) => updateFilter({ yearFinished: v ? Number(v) : null })}
            />
          )}
          {available.has('storageLocation') && (
            <SearchableSelectDropdown
              label="Location"
              options={storageLocationOptions}
              selectedId={filters.storageLocationId}
              onSelect={(id) => updateFilter({ storageLocationId: id })}
            />
          )}
          {available.has('hasFabric') && (
            <ToggleDropdown
              label="Has Fabric"
              value={filters.hasFabric}
              onSelect={(v) => updateFilter({ hasFabric: v })}
            />
          )}
          {available.has('hasDigitalCopy') && (
            <ToggleDropdown
              label="Digital Copy"
              value={filters.hasDigitalCopy}
              onSelect={(v) => updateFilter({ hasDigitalCopy: v })}
            />
          )}
        </div>
      )}

      {/* Active filter chips */}
      {activeFilters.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {activeFilters.map((af, i) => (
            <span
              key={`${af.dimension}-${i}`}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700"
              style={{ fontFamily: "'Source Sans 3', sans-serif" }}
            >
              {af.label}
              <button
                onClick={() => onRemoveFilter?.(af.dimension)}
                className="hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
              >
                <X className="w-3 h-3" strokeWidth={2} />
              </button>
            </span>
          ))}
          <button
            onClick={() => onClearAllFilters?.()}
            className="text-xs text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors ml-1"
            style={{ fontFamily: "'Source Sans 3', sans-serif" }}
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  )
}

/* ── View mode toggle + count bar (composed separately) ── */

export function ViewToggleBar({
  viewMode,
  totalCount,
  filteredCount,
  onViewModeChange,
}: {
  viewMode: ViewMode
  totalCount: number
  filteredCount: number
  onViewModeChange?: (mode: ViewMode) => void
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      {/* Count */}
      <span className="text-xs text-stone-400 dark:text-stone-500" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
        {filteredCount === totalCount
          ? `${totalCount} projects`
          : `${filteredCount} of ${totalCount} projects`}
      </span>

      {/* View toggle */}
      <div className="flex items-center bg-stone-100 dark:bg-stone-800 rounded-lg p-0.5 relative group/toggle">
        {viewModes.map(({ mode, icon: Icon, label, description }) => {
          const isActive = viewMode === mode
          return (
            <button
              key={mode}
              onClick={() => onViewModeChange?.(mode)}
              className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-colors text-xs font-medium group/btn ${
                isActive
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-sm'
                  : 'text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300'
              }`}
            >
              <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span style={{ fontFamily: "'Source Sans 3', sans-serif" }}>{label}</span>
              {/* Tooltip */}
              <span
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 text-[11px] text-stone-100 bg-stone-800 dark:bg-stone-700 rounded-md shadow-lg whitespace-nowrap opacity-0 pointer-events-none group-hover/btn:opacity-100 transition-opacity duration-150 z-40"
                style={{ fontFamily: "'Source Sans 3', sans-serif" }}
              >
                {description}
                <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-stone-800 dark:border-t-stone-700" />
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

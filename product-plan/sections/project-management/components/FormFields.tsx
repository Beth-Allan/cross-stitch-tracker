import { useState, useEffect, useRef } from 'react'
import type { ProjectStatus, SizeCategory, Genre } from '../types'
import { ChevronDown, Plus, ImagePlus } from 'lucide-react'

/* ─── Constants ─── */

export const inputClass =
  'w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 dark:focus:border-emerald-500 transition-colors'

export const selectClass = inputClass

export const allStatuses: ProjectStatus[] = [
  'Unstarted', 'Kitting', 'Kitted', 'In Progress', 'On Hold', 'Finished', 'FFO',
]

export const binOptions = ['Bin A', 'Bin B', 'Bin C', 'Bin D']
export const appOptions = ['Markup R-XP', 'Saga', 'MacStitch']

const startPeriods = [
  { group: 'Season', items: ['Spring', 'Summer', 'Fall', 'Winter'] },
  { group: 'Month', items: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'] },
]
const startYears = [2026, 2027, 2028, 2029, 2030]

/* ─── Helpers ─── */

export function calculateSizeCategory(stitchCount: number): SizeCategory {
  if (stitchCount >= 50000) return 'BAP'
  if (stitchCount >= 25000) return 'Large'
  if (stitchCount >= 5000) return 'Medium'
  if (stitchCount >= 1000) return 'Small'
  return 'Mini'
}

/* ─── Layout Components ─── */

export function FormField({ label, hint, children }: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label
        className="block text-xs text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1.5"
        style={{ fontFamily: "'Source Sans 3', sans-serif" }}
      >
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">{hint}</p>}
    </div>
  )
}

export function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h4
      className="text-xs font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-widest pt-5 pb-3 border-t border-stone-200/60 dark:border-stone-800 first:border-t-0 first:pt-0"
      style={{ fontFamily: "'Source Sans 3', sans-serif" }}
    >
      {children}
    </h4>
  )
}

export function Checkbox({ checked, onChange, label }: {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
}) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group">
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        className="w-4 h-4 rounded border-stone-300 dark:border-stone-600 text-emerald-600 focus:ring-emerald-500/40 accent-emerald-600"
      />
      <span
        className="text-sm text-stone-700 dark:text-stone-300 group-hover:text-stone-900 dark:group-hover:text-stone-100 transition-colors"
        style={{ fontFamily: "'Source Sans 3', sans-serif" }}
      >
        {label}
      </span>
    </label>
  )
}

/* ─── Searchable Select ─── */

export function SearchableSelect({ value, options, placeholder, onSelect, onAddNew, addNewLabel = 'Add' }: {
  value: string
  options: { value: string; label: string }[]
  placeholder?: string
  onSelect: (value: string) => void
  onAddNew?: (name: string) => void
  addNewLabel?: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  const selectedOption = options.find(o => o.value === value)
  const displayValue = isOpen ? search : (selectedOption?.label ?? '')

  const filtered = search
    ? options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()))
    : options

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      <input
        value={displayValue}
        onChange={e => { setSearch(e.target.value); setIsOpen(true) }}
        onFocus={() => { setIsOpen(true); setSearch('') }}
        placeholder={placeholder}
        className={inputClass + ' pr-9'}
      />
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-stone-800 rounded-lg shadow-lg dark:shadow-black/30 border border-stone-200 dark:border-stone-700 max-h-48 overflow-y-auto z-10">
          {filtered.map(option => (
            <button
              key={option.value}
              type="button"
              onClick={() => { onSelect(option.value); setIsOpen(false); setSearch('') }}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors ${
                option.value === value
                  ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20'
                  : 'text-stone-700 dark:text-stone-300'
              }`}
            >
              {option.label}
            </button>
          ))}
          {filtered.length === 0 && !onAddNew && (
            <div className="px-3 py-2 text-sm text-stone-400">No matches</div>
          )}
          {onAddNew && (
            <button
              type="button"
              onClick={() => { onAddNew(search.trim()); setIsOpen(false); setSearch('') }}
              className="w-full text-left px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border-t border-stone-100 dark:border-stone-700 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
              {addNewLabel}{search.trim() ? <> &ldquo;{search.trim()}&rdquo;</> : '...'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

/* ─── Genre Picker ─── */

export function GenrePicker({ genres, selectedIds, onToggle, onAddGenre }: {
  genres: Genre[]
  selectedIds: string[]
  onToggle: (genreId: string) => void
  onAddGenre?: (name: string) => void
}) {
  const [isAdding, setIsAdding] = useState(false)
  const [newName, setNewName] = useState('')

  return (
    <div className="flex flex-wrap gap-2">
      {genres.map(genre => {
        const isSelected = selectedIds.includes(genre.id)
        return (
          <button
            key={genre.id}
            type="button"
            onClick={() => onToggle(genre.id)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              isSelected
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400'
                : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:border-stone-300 dark:hover:border-stone-600'
            }`}
          >
            {genre.name}
          </button>
        )
      })}
      {onAddGenre && !isAdding && (
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="text-xs px-3 py-1.5 rounded-full border border-dashed border-stone-300 dark:border-stone-600 text-stone-400 dark:text-stone-500 hover:border-emerald-400 hover:text-emerald-600 dark:hover:border-emerald-600 dark:hover:text-emerald-400 transition-colors"
        >
          + Add
        </button>
      )}
      {isAdding && (
        <input
          autoFocus
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && newName.trim()) {
              onAddGenre?.(newName.trim())
              setNewName('')
              setIsAdding(false)
            }
            if (e.key === 'Escape') {
              setNewName('')
              setIsAdding(false)
            }
          }}
          onBlur={() => { setNewName(''); setIsAdding(false) }}
          placeholder="Genre name, then Enter"
          className="text-xs px-3 py-1.5 rounded-full border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 w-40 focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
        />
      )}
    </div>
  )
}

/* ─── Cover Image Upload ─── */

export function CoverImageUpload() {
  return (
    <div className="border-2 border-dashed border-stone-200 dark:border-stone-700 rounded-lg p-6 text-center hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors cursor-pointer group">
      <ImagePlus className="w-8 h-8 text-stone-300 dark:text-stone-600 mx-auto mb-2 group-hover:text-emerald-400 transition-colors" strokeWidth={1.5} />
      <p className="text-sm text-stone-500 dark:text-stone-400" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
        Drop an image here or click to upload
      </p>
      <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">PNG, JPG up to 5MB</p>
    </div>
  )
}

/* ─── Stitch Count with Auto-calculation ─── */

export function StitchCountFields({ stitchCount, stitchCountApproximate, stitchesWide, stitchesHigh, onStitchCountChange, onApproximateChange, onWidthChange, onHeightChange }: {
  stitchCount: number
  stitchCountApproximate: boolean
  stitchesWide: number
  stitchesHigh: number
  onStitchCountChange: (v: number) => void
  onApproximateChange: (v: boolean) => void
  onWidthChange: (v: number) => void
  onHeightChange: (v: number) => void
}) {
  const calculatedCount = stitchesWide > 0 && stitchesHigh > 0 ? stitchesWide * stitchesHigh : 0
  const effectiveCount = stitchCount > 0 ? stitchCount : calculatedCount
  const isAutoCalculated = stitchCount === 0 && calculatedCount > 0

  return (
    <div className="space-y-4">
      <FormField label="Dimensions (stitches)">
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={stitchesWide || ''}
            onChange={e => onWidthChange(parseInt(e.target.value) || 0)}
            placeholder="Width"
            className={inputClass + ' flex-1'}
          />
          <span className="text-sm text-stone-400 dark:text-stone-500 shrink-0">w &times;</span>
          <input
            type="number"
            value={stitchesHigh || ''}
            onChange={e => onHeightChange(parseInt(e.target.value) || 0)}
            placeholder="Height"
            className={inputClass + ' flex-1'}
          />
          <span className="text-sm text-stone-400 dark:text-stone-500 shrink-0">h</span>
        </div>
      </FormField>

      <FormField
        label="Total Stitch Count"
        hint={isAutoCalculated
          ? `Auto-calculated from ${stitchesWide.toLocaleString()} \u00d7 ${stitchesHigh.toLocaleString()}. Clear to enter an exact count.`
          : 'Leave empty to auto-calculate from dimensions'
        }
      >
        <input
          type="number"
          value={stitchCount || ''}
          onChange={e => onStitchCountChange(parseInt(e.target.value) || 0)}
          placeholder={calculatedCount > 0 ? calculatedCount.toLocaleString() : '0'}
          className={inputClass}
        />
        {effectiveCount > 0 && (
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-stone-400 dark:text-stone-500">Size category:</span>
            <span className="text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
              {calculateSizeCategory(effectiveCount)}
            </span>
            {isAutoCalculated && (
              <span className="text-[10px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded-full">
                Auto-calculated
              </span>
            )}
          </div>
        )}
      </FormField>
    </div>
  )
}

/* ─── Pattern Type Select ─── */

export function PatternTypeFields({ isPaperChart, isFormalKit, isSAL, kitColorCount, onFormatChange, onFormalKitChange, onSALChange, onKitColorCountChange }: {
  isPaperChart: boolean
  isFormalKit: boolean
  isSAL: boolean
  kitColorCount: number | null
  onFormatChange: (isPaper: boolean) => void
  onFormalKitChange: (v: boolean) => void
  onSALChange: (v: boolean) => void
  onKitColorCountChange: (v: number | null) => void
}) {
  return (
    <div className="space-y-3">
      <div className="flex gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="chartFormat"
            checked={!isPaperChart}
            onChange={() => onFormatChange(false)}
            className="w-4 h-4 accent-emerald-600"
          />
          <span className="text-sm text-stone-700 dark:text-stone-300">Digital Chart</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="chartFormat"
            checked={isPaperChart}
            onChange={() => onFormatChange(true)}
            className="w-4 h-4 accent-emerald-600"
          />
          <span className="text-sm text-stone-700 dark:text-stone-300">Paper Chart</span>
        </label>
      </div>

      <div className="space-y-2">
        <Checkbox
          checked={isFormalKit}
          onChange={v => { onFormalKitChange(v); if (!v) onKitColorCountChange(null) }}
          label="Formal Kit"
        />
        {isFormalKit && (
          <div className="ml-6">
            <FormField label="Kit Colours">
              <input
                type="number"
                value={kitColorCount ?? ''}
                onChange={e => onKitColorCountChange(parseInt(e.target.value) || null)}
                placeholder="Number of colours"
                className={inputClass + ' max-w-[200px]'}
              />
            </FormField>
          </div>
        )}
      </div>

      <Checkbox checked={isSAL} onChange={onSALChange} label="Stitch-Along (SAL)" />
    </div>
  )
}

/* ─── Start Preference Select ─── */

export function StartPreferenceFields({ value, onChange }: {
  value: string | null
  onChange: (v: string | null) => void
}) {
  const parts = value?.split(' ') ?? []
  const period = parts[0] ?? ''
  const year = parts[1] ?? ''

  function update(newPeriod: string, newYear: string) {
    if (newPeriod && newYear) onChange(`${newPeriod} ${newYear}`)
    else if (newYear) onChange(newYear)
    else onChange(null)
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <select
        value={period}
        onChange={e => update(e.target.value, year)}
        className={selectClass}
      >
        <option value="">Any time</option>
        {startPeriods.map(group => (
          <optgroup key={group.group} label={group.group}>
            {group.items.map(item => (
              <option key={item} value={item}>{item}</option>
            ))}
          </optgroup>
        ))}
      </select>
      <select
        value={year}
        onChange={e => update(period, e.target.value)}
        className={selectClass}
      >
        <option value="">Year</option>
        {startYears.map(y => (
          <option key={y} value={y.toString()}>{y}</option>
        ))}
      </select>
    </div>
  )
}

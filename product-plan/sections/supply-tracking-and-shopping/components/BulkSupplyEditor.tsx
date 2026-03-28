import { useState, useMemo, useRef, useEffect } from 'react'
import type {
  BulkSupplyEditorProps,
  ProjectThread,
  ProjectBead,
  ProjectSpecialty,
  Thread,
  Bead,
  SpecialtyItem,
  SupplyBrand,
} from '../types'
import {
  ArrowLeft, Check, AlertTriangle, Plus, Search, X,
  Trash2, CircleDot, Gem, Sparkles,
} from 'lucide-react'

/* ─── Helpers ─── */

function needsBorder(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.85
}

function formatNumber(n: number): string {
  return n.toLocaleString()
}

function numericCodeCompare(a: string, b: string): number {
  const aNum = parseFloat(a.replace(/[^0-9.]/g, ''))
  const bNum = parseFloat(b.replace(/[^0-9.]/g, ''))
  if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum
  return a.localeCompare(b)
}

/* ─── Inline Editable Number ─── */

function EditableNumber({ value, onChange, className }: {
  value: number
  onChange?: (value: number) => void
  className?: string
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(String(value))
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus()
  }, [editing])

  if (!onChange) return <span className={className}>{value}</span>

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="number"
        min={0}
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={() => {
          const num = parseInt(draft)
          if (!isNaN(num) && num >= 0) onChange(num)
          setEditing(false)
        }}
        onKeyDown={e => {
          if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
          if (e.key === 'Escape') { setDraft(String(value)); setEditing(false) }
        }}
        className="w-14 px-1.5 py-0.5 text-center rounded border border-emerald-300 dark:border-emerald-600 bg-white dark:bg-stone-800 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
        style={{ fontFamily: "'Source Sans 3', sans-serif" }}
      />
    )
  }

  return (
    <button
      onClick={() => { setDraft(String(value)); setEditing(true) }}
      className={`px-1.5 py-0.5 rounded hover:bg-stone-100 dark:hover:bg-stone-700 cursor-text transition-colors ${className || ''}`}
      style={{ fontFamily: "'Source Sans 3', sans-serif" }}
      title="Click to edit"
    >
      {value}
    </button>
  )
}

/* ─── Search Bar ─── */

function SupplySearchBar<T extends { id: string }>({
  items,
  renderItem,
  placeholder,
  onSelect,
}: {
  items: T[]
  renderItem: (item: T) => React.ReactNode
  placeholder: string
  onSelect: (item: T) => void
}) {
  const [search, setSearch] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsFocused(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const filtered = search
    ? items.filter(item => {
        const s = search.toLowerCase()
        // Search across code, name, brand, and description fields
        const searchable = [
          (item as Record<string, unknown>).code,
          (item as Record<string, unknown>).name,
          (item as Record<string, unknown>).brand,
          (item as Record<string, unknown>).description,
        ].filter(Boolean).map(v => String(v).toLowerCase())
        return searchable.some(v => v.includes(s))
      }).slice(0, 8)
    : []

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-stone-500" />
        <input
          type="text"
          value={search}
          onChange={e => { setSearch(e.target.value); setIsFocused(true) }}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-colors"
          style={{ fontFamily: "'Source Sans 3', sans-serif" }}
        />
        {search && (
          <button
            onClick={() => { setSearch(''); setIsFocused(false) }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      {isFocused && search && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg shadow-lg z-20 max-h-64 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="px-4 py-6 text-sm text-stone-400 dark:text-stone-500 text-center" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
              No matching supplies found
            </p>
          ) : (
            filtered.map(item => (
              <button
                key={item.id}
                onClick={() => { onSelect(item); setSearch(''); setIsFocused(false) }}
                className="w-full text-left px-4 py-2.5 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
              >
                {renderItem(item)}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}

/* ─── Supply Table Row ─── */

function BulkRow({ hex, code, name, brand, stitchCount, quantityRequired, quantityAcquired, quantityNeeded, isFulfilled, onUpdateRequired, onUpdateAcquired, onUpdateStitchCount, onRemove }: {
  hex: string
  code: string
  name: string
  brand: string
  stitchCount?: number
  quantityRequired: number
  quantityAcquired: number
  quantityNeeded: number
  isFulfilled: boolean
  onUpdateRequired?: (value: number) => void
  onUpdateAcquired?: (value: number) => void
  onUpdateStitchCount?: (value: number) => void
  onRemove?: () => void
}) {
  const isLight = needsBorder(hex)

  return (
    <tr className="border-b border-stone-100 dark:border-stone-800/60 group hover:bg-stone-50/30 dark:hover:bg-stone-800/20 transition-colors">
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-6 h-6 rounded-full shadow-sm shrink-0 ${isLight ? 'ring-1 ring-stone-200 dark:ring-stone-600' : ''}`}
            style={{ backgroundColor: hex }}
          />
          <div className="min-w-0">
            <p className="text-sm text-stone-900 dark:text-stone-100 truncate" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
              <span className="font-medium">{brand} {code}</span>
              <span className="text-stone-400 dark:text-stone-500"> — {name}</span>
            </p>
          </div>
        </div>
      </td>
      <td className="py-3 px-4 text-center">
        {onUpdateStitchCount ? (
          <EditableNumber
            value={stitchCount || 0}
            onChange={onUpdateStitchCount}
            className="text-sm text-stone-600 dark:text-stone-400 tabular-nums"
          />
        ) : (
          <span className="text-sm text-stone-400 dark:text-stone-500">—</span>
        )}
      </td>
      <td className="py-3 px-4 text-center">
        <EditableNumber
          value={quantityRequired}
          onChange={onUpdateRequired}
          className="text-sm font-medium text-stone-700 dark:text-stone-300 tabular-nums"
        />
      </td>
      <td className="py-3 px-4 text-center">
        <EditableNumber
          value={quantityAcquired}
          onChange={onUpdateAcquired}
          className={`text-sm font-medium tabular-nums ${isFulfilled ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}
        />
      </td>
      <td className="py-3 px-4 text-center">
        {quantityNeeded > 0 ? (
          <span className="text-sm font-medium text-amber-600 dark:text-amber-400 tabular-nums" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>{quantityNeeded}</span>
        ) : (
          <Check className="w-4 h-4 text-emerald-500 dark:text-emerald-400 mx-auto" strokeWidth={2} />
        )}
      </td>
      <td className="py-3 px-2 w-8">
        {onRemove && (
          <button
            onClick={onRemove}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1"
            title="Remove"
          >
            <Trash2 className="w-3.5 h-3.5 text-stone-400 hover:text-red-500 dark:hover:text-red-400 transition-colors" strokeWidth={1.5} />
          </button>
        )}
      </td>
    </tr>
  )
}

/* ─── Section Table ─── */

function SectionTable({ title, icon: Icon, count, fulfilledCount, children, emptyMessage, addSearch, filterValue, onFilterChange }: {
  title: string
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  count: number
  fulfilledCount: number
  children: React.ReactNode
  emptyMessage: string
  addSearch?: React.ReactNode
  filterValue?: string
  onFilterChange?: (value: string) => void
}) {
  const allFulfilled = count > 0 && fulfilledCount === count
  const showFilter = count > 8 && onFilterChange

  return (
    <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200/60 dark:border-stone-800">
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-stone-100 dark:border-stone-800">
        <Icon className="w-4 h-4 text-stone-400 dark:text-stone-500" strokeWidth={1.5} />
        <h3
          className="text-sm font-semibold text-stone-900 dark:text-stone-100 flex-1"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          {title}
        </h3>
        <span className="text-xs" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
          {count === 0 ? (
            <span className="text-stone-400 dark:text-stone-500">None</span>
          ) : allFulfilled ? (
            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" strokeWidth={2} />
              {count}/{count}
            </span>
          ) : (
            <span className="text-amber-600 dark:text-amber-400">{fulfilledCount}/{count}</span>
          )}
        </span>
      </div>

      {count === 0 ? (
        <div className="px-5 py-6">
          <p className="text-sm text-stone-400 dark:text-stone-500 text-center mb-4" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
            {emptyMessage}
          </p>
          {addSearch && <div className="relative">{addSearch}</div>}
        </div>
      ) : (
        <>
          {/* Filter existing items — only shows when there are many */}
          {showFilter && (
            <div className="px-4 py-2.5 border-b border-stone-100 dark:border-stone-800 bg-stone-50/30 dark:bg-stone-800/20">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400 dark:text-stone-500" />
                <input
                  type="text"
                  value={filterValue || ''}
                  onChange={e => onFilterChange(e.target.value)}
                  placeholder={`Filter ${count} items...`}
                  className="w-full pl-8 pr-3 py-1.5 rounded border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-colors"
                  style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                />
                {filterValue && (
                  <button
                    onClick={() => onFilterChange('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/30">
                  <th className="py-2 px-4 text-left text-xs font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>Supply</th>
                  <th className="py-2 px-4 text-center text-xs font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider w-24" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>Stitches</th>
                  <th className="py-2 px-4 text-center text-xs font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider w-20" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>Req</th>
                  <th className="py-2 px-4 text-center text-xs font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider w-20" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>Got</th>
                  <th className="py-2 px-4 text-center text-xs font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider w-20" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>Need</th>
                  <th className="py-2 px-2 w-8" />
                </tr>
              </thead>
              <tbody>{children}</tbody>
            </table>
          </div>
          {addSearch && (
            <div className="px-5 py-3 border-t border-stone-100 dark:border-stone-800 relative z-10">
              {addSearch}
            </div>
          )}
        </>
      )}
    </div>
  )
}

/* ─── Main Component ─── */

export function BulkSupplyEditor({
  projectId,
  projectName,
  projectThreads,
  projectBeads,
  projectSpecialty,
  threads,
  beads,
  specialtyItems,
  supplyBrands,
  onAddProjectThread,
  onAddProjectBead,
  onAddProjectSpecialty,
  onUpdateProjectThread,
  onUpdateProjectBead,
  onUpdateProjectSpecialty,
  onRemoveProjectThread,
  onRemoveProjectBead,
  onRemoveProjectSpecialty,
  onBack,
}: BulkSupplyEditorProps) {
  // Lookups
  const threadById = useMemo(() => {
    const map = new Map<string, Thread>()
    threads.forEach(t => map.set(t.id, t))
    return map
  }, [threads])

  const beadById = useMemo(() => {
    const map = new Map<string, Bead>()
    beads.forEach(b => map.set(b.id, b))
    return map
  }, [beads])

  const specialtyById = useMemo(() => {
    const map = new Map<string, SpecialtyItem>()
    specialtyItems.forEach(s => map.set(s.id, s))
    return map
  }, [specialtyItems])

  const brandById = useMemo(() => {
    const map = new Map<string, SupplyBrand>()
    supplyBrands.forEach(b => map.set(b.id, b))
    return map
  }, [supplyBrands])

  // Available supplies (not yet linked)
  const linkedThreadIds = useMemo(() => new Set(projectThreads.map(pt => pt.threadId)), [projectThreads])
  const linkedBeadIds = useMemo(() => new Set(projectBeads.map(pb => pb.beadId)), [projectBeads])
  const linkedSpecialtyIds = useMemo(() => new Set(projectSpecialty.map(ps => ps.specialtyItemId)), [projectSpecialty])

  const availableSupplies = useMemo(() => {
    const items: { id: string; type: 'thread' | 'bead' | 'specialty'; hex: string; code: string; name: string; brand: string; description?: string }[] = []
    threads.filter(t => !linkedThreadIds.has(t.id)).forEach(t => {
      const brand = brandById.get(t.brandId)
      items.push({ id: t.id, type: 'thread', hex: t.hexColor, code: t.colorCode, name: t.colorName, brand: brand?.name || '' })
    })
    beads.filter(b => !linkedBeadIds.has(b.id)).forEach(b => {
      const brand = brandById.get(b.brandId)
      items.push({ id: b.id, type: 'bead', hex: b.hexColor, code: b.productCode, name: b.colorName, brand: brand?.name || '' })
    })
    specialtyItems.filter(s => !linkedSpecialtyIds.has(s.id)).forEach(s => {
      const brand = brandById.get(s.brandId)
      items.push({ id: s.id, type: 'specialty', hex: s.hexColor, code: s.productCode, name: s.colorName, brand: brand?.name || '', description: s.description })
    })
    return items
  }, [threads, beads, specialtyItems, linkedThreadIds, linkedBeadIds, linkedSpecialtyIds, brandById])

  // Per-type available items for section-level search
  const availableThreadItems = useMemo(() =>
    availableSupplies.filter(s => s.type === 'thread'), [availableSupplies])
  const availableBeadItems = useMemo(() =>
    availableSupplies.filter(s => s.type === 'bead'), [availableSupplies])
  const availableSpecialtyItems = useMemo(() =>
    availableSupplies.filter(s => s.type === 'specialty'), [availableSupplies])

  // Summary stats
  const totalItems = projectThreads.length + projectBeads.length + projectSpecialty.length
  const fulfilledItems = projectThreads.filter(pt => pt.isFulfilled).length
    + projectBeads.filter(pb => pb.isFulfilled).length
    + projectSpecialty.filter(ps => ps.isFulfilled).length

  const fulfilledThreads = projectThreads.filter(pt => pt.isFulfilled).length
  const fulfilledBeads = projectBeads.filter(pb => pb.isFulfilled).length
  const fulfilledSpecialty = projectSpecialty.filter(ps => ps.isFulfilled).length

  // Filter state for existing items (shown when sections have many items)
  const [threadFilter, setThreadFilter] = useState('')
  const [beadFilter, setBeadFilter] = useState('')
  const [specialtyFilter, setSpecialtyFilter] = useState('')

  // Sort and filter project supplies by code
  const sortedThreads = useMemo(() => {
    const sorted = [...projectThreads].sort((a, b) => {
      const tA = threadById.get(a.threadId)
      const tB = threadById.get(b.threadId)
      return numericCodeCompare(tA?.colorCode || '', tB?.colorCode || '')
    })
    if (!threadFilter) return sorted
    const f = threadFilter.toLowerCase()
    return sorted.filter(pt => {
      const t = threadById.get(pt.threadId)
      const brand = t ? brandById.get(t.brandId) : null
      return t && (t.colorCode.toLowerCase().includes(f) || t.colorName.toLowerCase().includes(f) || (brand?.name || '').toLowerCase().includes(f))
    })
  }, [projectThreads, threadById, brandById, threadFilter])

  const sortedBeads = useMemo(() => {
    const sorted = [...projectBeads].sort((a, b) => {
      const bA = beadById.get(a.beadId)
      const bB = beadById.get(b.beadId)
      return numericCodeCompare(bA?.productCode || '', bB?.productCode || '')
    })
    if (!beadFilter) return sorted
    const f = beadFilter.toLowerCase()
    return sorted.filter(pb => {
      const b = beadById.get(pb.beadId)
      const brand = b ? brandById.get(b.brandId) : null
      return b && (b.productCode.toLowerCase().includes(f) || b.colorName.toLowerCase().includes(f) || (brand?.name || '').toLowerCase().includes(f))
    })
  }, [projectBeads, beadById, brandById, beadFilter])

  const sortedSpecialty = useMemo(() => {
    const sorted = [...projectSpecialty].sort((a, b) => {
      const sA = specialtyById.get(a.specialtyItemId)
      const sB = specialtyById.get(b.specialtyItemId)
      return numericCodeCompare(sA?.productCode || '', sB?.productCode || '')
    })
    if (!specialtyFilter) return sorted
    const f = specialtyFilter.toLowerCase()
    return sorted.filter(ps => {
      const s = specialtyById.get(ps.specialtyItemId)
      const brand = s ? brandById.get(s.brandId) : null
      return s && (s.productCode.toLowerCase().includes(f) || s.colorName.toLowerCase().includes(f) || (brand?.name || '').toLowerCase().includes(f))
    })
  }, [projectSpecialty, specialtyById, brandById, specialtyFilter])

  function renderSearchItem(item: typeof availableSupplies[0]) {
    return (
      <div className="flex items-center gap-3">
        <div
          className={`w-5 h-5 rounded-full shrink-0 ${needsBorder(item.hex) ? 'ring-1 ring-stone-200 dark:ring-stone-600' : ''}`}
          style={{ backgroundColor: item.hex }}
        />
        <span className="text-sm text-stone-700 dark:text-stone-300 flex-1" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
          <span className="font-medium">{item.brand} {item.code}</span> — {item.name}
          {item.description && <span className="text-stone-400 dark:text-stone-500"> ({item.description})</span>}
        </span>
      </div>
    )
  }

  function handleAddSupply(item: typeof availableSupplies[0]) {
    if (item.type === 'thread') {
      onAddProjectThread?.(projectId, item.id, { quantityRequired: 1 })
    } else if (item.type === 'bead') {
      onAddProjectBead?.(projectId, item.id, { quantityRequired: 1 })
    } else {
      onAddProjectSpecialty?.(projectId, item.id, { quantityRequired: 1 })
    }
  }

  return (
    <div className="p-5 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300 transition-colors mb-3"
          style={{ fontFamily: "'Source Sans 3', sans-serif" }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to project
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1
              className="text-2xl font-semibold text-stone-900 dark:text-stone-100"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Manage Supplies
            </h1>
            <p
              className="text-sm text-stone-500 dark:text-stone-400 mt-0.5"
              style={{ fontFamily: "'Source Sans 3', sans-serif" }}
            >
              {projectName}
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
            <span className="text-stone-500 dark:text-stone-400">
              {totalItems} {totalItems === 1 ? 'supply' : 'supplies'}
            </span>
            <span className={fulfilledItems === totalItems && totalItems > 0 ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-amber-600 dark:text-amber-400 font-medium'}>
              {fulfilledItems}/{totalItems} fulfilled
            </span>
          </div>
        </div>
      </div>

      {/* Search to add */}
      <div className="mb-6">
        <SupplySearchBar
          items={availableSupplies}
          placeholder="Search all supplies to add by code or name..."
          onSelect={handleAddSupply}
          renderItem={item => (
            <div className="flex items-center gap-3">
              <div
                className={`w-5 h-5 rounded-full shrink-0 ${needsBorder(item.hex) ? 'ring-1 ring-stone-200 dark:ring-stone-600' : ''}`}
                style={{ backgroundColor: item.hex }}
              />
              <span className="text-sm text-stone-700 dark:text-stone-300 flex-1" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                <span className="font-medium">{item.brand} {item.code}</span> — {item.name}
                {item.description && <span className="text-stone-400 dark:text-stone-500"> ({item.description})</span>}
              </span>
              <span className="text-[10px] text-stone-400 dark:text-stone-500 uppercase tracking-wider shrink-0 px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800">{item.type}</span>
            </div>
          )}
        />
      </div>

      {/* Supply sections */}
      <div className="space-y-6">
        {/* Thread */}
        <SectionTable
          title="Thread"
          icon={CircleDot}
          count={projectThreads.length}
          fulfilledCount={fulfilledThreads}
          emptyMessage="No threads linked yet"
          filterValue={threadFilter}
          onFilterChange={setThreadFilter}
          addSearch={
            <SupplySearchBar
              items={availableThreadItems}
              placeholder="Search threads to add by code or name..."
              onSelect={handleAddSupply}
              renderItem={renderSearchItem}
            />
          }
        >
          {sortedThreads.map(pt => {
            const thread = threadById.get(pt.threadId)
            const brand = thread ? brandById.get(thread.brandId) : null
            if (!thread) return null
            return (
              <BulkRow
                key={pt.id}
                hex={thread.hexColor}
                code={thread.colorCode}
                name={thread.colorName}
                brand={brand?.name || ''}
                stitchCount={pt.stitchCount}
                quantityRequired={pt.quantityRequired}
                quantityAcquired={pt.quantityAcquired}
                quantityNeeded={pt.quantityNeeded}
                isFulfilled={pt.isFulfilled}
                onUpdateRequired={v => onUpdateProjectThread?.(pt.id, { quantityRequired: v })}
                onUpdateAcquired={v => onUpdateProjectThread?.(pt.id, { quantityAcquired: v })}
                onUpdateStitchCount={v => onUpdateProjectThread?.(pt.id, { stitchCount: v })}
                onRemove={() => onRemoveProjectThread?.(pt.id)}
              />
            )
          })}
        </SectionTable>

        {/* Beads */}
        <SectionTable
          title="Beads"
          icon={Gem}
          count={projectBeads.length}
          fulfilledCount={fulfilledBeads}
          emptyMessage="No beads linked yet"
          filterValue={beadFilter}
          onFilterChange={setBeadFilter}
          addSearch={
            <SupplySearchBar
              items={availableBeadItems}
              placeholder="Search beads to add by code or name..."
              onSelect={handleAddSupply}
              renderItem={renderSearchItem}
            />
          }
        >
          {sortedBeads.map(pb => {
            const bead = beadById.get(pb.beadId)
            const brand = bead ? brandById.get(bead.brandId) : null
            if (!bead) return null
            return (
              <BulkRow
                key={pb.id}
                hex={bead.hexColor}
                code={bead.productCode}
                name={bead.colorName}
                brand={brand?.name || ''}
                quantityRequired={pb.quantityRequired}
                quantityAcquired={pb.quantityAcquired}
                quantityNeeded={pb.quantityNeeded}
                isFulfilled={pb.isFulfilled}
                onUpdateRequired={v => onUpdateProjectBead?.(pb.id, { quantityRequired: v })}
                onUpdateAcquired={v => onUpdateProjectBead?.(pb.id, { quantityAcquired: v })}
                onRemove={() => onRemoveProjectBead?.(pb.id)}
              />
            )
          })}
        </SectionTable>

        {/* Specialty */}
        <SectionTable
          title="Specialty"
          icon={Sparkles}
          count={projectSpecialty.length}
          fulfilledCount={fulfilledSpecialty}
          emptyMessage="No specialty items linked yet"
          filterValue={specialtyFilter}
          onFilterChange={setSpecialtyFilter}
          addSearch={
            <SupplySearchBar
              items={availableSpecialtyItems}
              placeholder="Search specialty items to add by code or name..."
              onSelect={handleAddSupply}
              renderItem={renderSearchItem}
            />
          }
        >
          {sortedSpecialty.map(ps => {
            const item = specialtyById.get(ps.specialtyItemId)
            const brand = item ? brandById.get(item.brandId) : null
            if (!item) return null
            return (
              <BulkRow
                key={ps.id}
                hex={item.hexColor}
                code={item.productCode}
                name={`${item.colorName} — ${item.description}`}
                brand={brand?.name || ''}
                quantityRequired={ps.quantityRequired}
                quantityAcquired={ps.quantityAcquired}
                quantityNeeded={ps.quantityNeeded}
                isFulfilled={ps.isFulfilled}
                onUpdateRequired={v => onUpdateProjectSpecialty?.(ps.id, { quantityRequired: v })}
                onUpdateAcquired={v => onUpdateProjectSpecialty?.(ps.id, { quantityAcquired: v })}
                onRemove={() => onRemoveProjectSpecialty?.(ps.id)}
              />
            )
          })}
        </SectionTable>
      </div>
    </div>
  )
}

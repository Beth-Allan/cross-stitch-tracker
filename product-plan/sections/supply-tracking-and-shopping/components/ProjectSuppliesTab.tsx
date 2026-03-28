import { useState, useMemo, useRef, useEffect } from 'react'
import type {
  ProjectSuppliesTabProps,
  ProjectThread,
  ProjectBead,
  ProjectSpecialty,
  Thread,
  Bead,
  SpecialtyItem,
  SupplyBrand,
  ProjectReference,
} from '../types'
import {
  Check, AlertTriangle, ChevronDown, ChevronRight,
  Plus, Search, X, Trash2, CircleDot, Gem, Sparkles,
  ExternalLink,
} from 'lucide-react'
import { SupplyDetailModal } from './SupplyDetailModal'
import type { SupplyDetailInfo } from './SupplyDetailModal'

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

  if (!onChange) {
    return <span className={className}>{value}</span>
  }

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
        className="w-12 px-1.5 py-0.5 text-center rounded border border-emerald-300 dark:border-emerald-600 bg-white dark:bg-stone-800 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
        style={{ fontFamily: "'Source Sans 3', sans-serif" }}
      />
    )
  }

  return (
    <button
      onClick={() => { setDraft(String(value)); setEditing(true) }}
      className={`px-1.5 py-0.5 rounded hover:bg-stone-100 dark:hover:bg-stone-800 cursor-text transition-colors ${className || ''}`}
      title="Click to edit"
    >
      {value}
    </button>
  )
}

/* ─── Supply Row ─── */

function SupplyRow({ hex, code, name, brand, stitchCount, quantityRequired, quantityAcquired, quantityNeeded, isFulfilled, onUpdateRequired, onUpdateAcquired, onRemove, onClickDetail }: {
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
  onRemove?: () => void
  onClickDetail?: () => void
}) {
  const isLight = needsBorder(hex)

  return (
    <div className="flex items-center gap-3 py-3 border-b border-stone-100 dark:border-stone-800/60 last:border-b-0 group">
      {/* Swatch — clickable to see cross-project usage */}
      <button
        onClick={onClickDetail}
        className={`w-7 h-7 rounded-full shadow-sm shrink-0 transition-transform hover:scale-110 cursor-pointer ${isLight ? 'ring-1 ring-stone-200 dark:ring-stone-600' : ''}`}
        style={{ backgroundColor: hex }}
        title="View colour details and other projects"
      />

      {/* Code + Name — also clickable */}
      <button onClick={onClickDetail} className="min-w-0 flex-1 text-left cursor-pointer">
        <p
          className="text-sm text-stone-900 dark:text-stone-100 truncate hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
          style={{ fontFamily: "'Source Sans 3', sans-serif" }}
        >
          <span className="font-medium">{brand} {code}</span>
          <span className="text-stone-400 dark:text-stone-500"> — {name}</span>
        </p>
        {stitchCount != null && stitchCount > 0 && (
          <p className="text-xs text-stone-400 dark:text-stone-500" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
            {formatNumber(stitchCount)} stitches
          </p>
        )}
      </button>

      {/* Quantities */}
      <div className="flex items-center gap-3 text-sm shrink-0" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
        <div className="flex items-center gap-1 text-stone-500 dark:text-stone-400">
          <span className="text-xs">Req:</span>
          <EditableNumber
            value={quantityRequired}
            onChange={onUpdateRequired}
            className="font-medium text-stone-700 dark:text-stone-300"
          />
        </div>
        <div className="flex items-center gap-1 text-stone-500 dark:text-stone-400">
          <span className="text-xs">Got:</span>
          <EditableNumber
            value={quantityAcquired}
            onChange={onUpdateAcquired}
            className={`font-medium ${isFulfilled ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}
          />
        </div>
        {quantityNeeded > 0 && (
          <span className="text-xs font-medium text-amber-600 dark:text-amber-400 whitespace-nowrap">
            Need {quantityNeeded}
          </span>
        )}
      </div>

      {/* Fulfillment indicator */}
      <div className="w-5 shrink-0 flex justify-center">
        {isFulfilled ? (
          <Check className="w-4 h-4 text-emerald-500 dark:text-emerald-400" strokeWidth={2} />
        ) : (
          <AlertTriangle className="w-4 h-4 text-amber-500 dark:text-amber-400" strokeWidth={1.5} />
        )}
      </div>

      {/* Remove */}
      {onRemove && (
        <button
          onClick={onRemove}
          className="w-5 shrink-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          title="Remove from project"
        >
          <Trash2 className="w-3.5 h-3.5 text-stone-400 hover:text-red-500 dark:hover:text-red-400 transition-colors" strokeWidth={1.5} />
        </button>
      )}
    </div>
  )
}

/* ─── Collapsible Section ─── */

function SupplySection({ title, icon: Icon, count, fulfilledCount, defaultOpen, children, onAddClick }: {
  title: string
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  count: number
  fulfilledCount: number
  defaultOpen?: boolean
  children: React.ReactNode
  onAddClick?: () => void
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen ?? count > 0)
  const allFulfilled = count > 0 && fulfilledCount === count

  return (
    <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200/60 dark:border-stone-800 overflow-hidden">
      {/* Section header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-stone-50/50 dark:hover:bg-stone-800/30 transition-colors"
      >
        {isOpen
          ? <ChevronDown className="w-4 h-4 text-stone-400 dark:text-stone-500 shrink-0" strokeWidth={1.5} />
          : <ChevronRight className="w-4 h-4 text-stone-400 dark:text-stone-500 shrink-0" strokeWidth={1.5} />
        }
        <Icon className="w-4 h-4 text-stone-400 dark:text-stone-500 shrink-0" strokeWidth={1.5} />
        <h3
          className="text-sm font-semibold text-stone-900 dark:text-stone-100 flex-1 text-left"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          {title}
        </h3>
        <span className="flex items-center gap-2 text-xs" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
          {count === 0 ? (
            <span className="text-stone-400 dark:text-stone-500">None</span>
          ) : allFulfilled ? (
            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" strokeWidth={2} />
              {count}/{count}
            </span>
          ) : (
            <span className="text-amber-600 dark:text-amber-400">
              {fulfilledCount}/{count}
            </span>
          )}
        </span>
      </button>

      {/* Section content */}
      {isOpen && (
        <div className="px-5 pb-4 border-t border-stone-100 dark:border-stone-800">
          {count === 0 ? (
            <div className="py-6 text-center">
              <p className="text-sm text-stone-400 dark:text-stone-500 mb-2" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                No {title.toLowerCase()} linked to this project
              </p>
              {onAddClick && (
                <button
                  onClick={onAddClick}
                  className="text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium flex items-center gap-1.5 mx-auto transition-colors"
                  style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add {title.toLowerCase()}
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="pt-1">{children}</div>
              {onAddClick && (
                <button
                  onClick={onAddClick}
                  className="mt-3 text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium flex items-center gap-1.5 transition-colors"
                  style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add more
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

/* ─── Search-to-Add Popover ─── */

function SearchToAdd<T extends { id: string }>({ items, renderItem, placeholder, onSelect, onClose }: {
  items: T[]
  renderItem: (item: T) => React.ReactNode
  placeholder: string
  onSelect: (item: T) => void
  onClose: () => void
}) {
  const [search, setSearch] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose])

  const filtered = items.filter(item => {
    const s = search.toLowerCase()
    const str = JSON.stringify(item).toLowerCase()
    return str.includes(s)
  }).slice(0, 8)

  return (
    <div ref={ref} className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg shadow-lg z-20">
      <div className="p-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={placeholder}
            autoFocus
            className="w-full pl-8 pr-3 py-1.5 rounded border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-colors"
            style={{ fontFamily: "'Source Sans 3', sans-serif" }}
          />
        </div>
      </div>
      <div className="max-h-48 overflow-y-auto border-t border-stone-100 dark:border-stone-800">
        {filtered.length === 0 ? (
          <p className="px-3 py-4 text-sm text-stone-400 dark:text-stone-500 text-center" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
            No matches
          </p>
        ) : (
          filtered.map(item => (
            <button
              key={item.id}
              onClick={() => onSelect(item)}
              className="w-full text-left px-3 py-2 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
            >
              {renderItem(item)}
            </button>
          ))
        )}
      </div>
    </div>
  )
}

/* ─── Main Component ─── */

export function ProjectSuppliesTab({
  projectId,
  projectThreads,
  projectBeads,
  projectSpecialty,
  threads,
  beads,
  specialtyItems,
  supplyBrands,
  kittingSummary,
  onAddProjectThread,
  onAddProjectBead,
  onAddProjectSpecialty,
  onUpdateProjectThread,
  onUpdateProjectBead,
  onUpdateProjectSpecialty,
  onRemoveProjectThread,
  onRemoveProjectBead,
  onRemoveProjectSpecialty,
  onOpenBulkEditor,
  allProjectThreads,
  allProjectBeads,
  allProjectSpecialty,
  projects,
  onNavigateToProject,
}: ProjectSuppliesTabProps) {
  const [addingType, setAddingType] = useState<'thread' | 'bead' | 'specialty' | null>(null)
  const [detailSupply, setDetailSupply] = useState<SupplyDetailInfo | null>(null)

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

  // Already-linked supply IDs for filtering the search
  const linkedThreadIds = useMemo(() => new Set(projectThreads.map(pt => pt.threadId)), [projectThreads])
  const linkedBeadIds = useMemo(() => new Set(projectBeads.map(pb => pb.beadId)), [projectBeads])
  const linkedSpecialtyIds = useMemo(() => new Set(projectSpecialty.map(ps => ps.specialtyItemId)), [projectSpecialty])

  const availableThreads = useMemo(() => threads.filter(t => !linkedThreadIds.has(t.id)), [threads, linkedThreadIds])
  const availableBeads = useMemo(() => beads.filter(b => !linkedBeadIds.has(b.id)), [beads, linkedBeadIds])
  const availableSpecialty = useMemo(() => specialtyItems.filter(s => !linkedSpecialtyIds.has(s.id)), [specialtyItems, linkedSpecialtyIds])

  const fulfilledThreads = projectThreads.filter(pt => pt.isFulfilled).length
  const fulfilledBeads = projectBeads.filter(pb => pb.isFulfilled).length
  const fulfilledSpecialty = projectSpecialty.filter(ps => ps.isFulfilled).length

  // Project lookup for cross-reference modal
  const projectById = useMemo(() => {
    const map = new Map<string, ProjectReference>()
    projects?.forEach(p => map.set(p.id, p))
    return map
  }, [projects])

  // Build detail info for a thread/bead/specialty
  function openThreadDetail(thread: Thread) {
    const brand = brandById.get(thread.brandId)
    const usage = (allProjectThreads || [])
      .filter(pt => pt.threadId === thread.id)
      .map(pt => {
        const proj = projectById.get(pt.projectId)
        return {
          projectId: pt.projectId,
          projectName: proj?.name || 'Unknown project',
          projectBin: proj?.bin ?? null,
          quantityRequired: pt.quantityRequired,
          quantityAcquired: pt.quantityAcquired,
          quantityNeeded: pt.quantityNeeded,
          stitchCount: pt.stitchCount,
        }
      })
    setDetailSupply({
      hex: thread.hexColor, code: thread.colorCode, name: thread.colorName,
      brand: brand?.name || '', colorFamily: thread.colorFamily,
      projectUsage: usage,
    })
  }

  function openBeadDetail(bead: Bead) {
    const brand = brandById.get(bead.brandId)
    const usage = (allProjectBeads || [])
      .filter(pb => pb.beadId === bead.id)
      .map(pb => {
        const proj = projectById.get(pb.projectId)
        return {
          projectId: pb.projectId,
          projectName: proj?.name || 'Unknown project',
          projectBin: proj?.bin ?? null,
          quantityRequired: pb.quantityRequired,
          quantityAcquired: pb.quantityAcquired,
          quantityNeeded: pb.quantityNeeded,
        }
      })
    setDetailSupply({
      hex: bead.hexColor, code: bead.productCode, name: bead.colorName,
      brand: brand?.name || '', colorFamily: bead.colorFamily,
      projectUsage: usage,
    })
  }

  function openSpecialtyDetail(item: SpecialtyItem) {
    const brand = brandById.get(item.brandId)
    const usage = (allProjectSpecialty || [])
      .filter(ps => ps.specialtyItemId === item.id)
      .map(ps => {
        const proj = projectById.get(ps.projectId)
        return {
          projectId: ps.projectId,
          projectName: proj?.name || 'Unknown project',
          projectBin: proj?.bin ?? null,
          quantityRequired: ps.quantityRequired,
          quantityAcquired: ps.quantityAcquired,
          quantityNeeded: ps.quantityNeeded,
        }
      })
    setDetailSupply({
      hex: item.hexColor, code: item.productCode, name: item.colorName,
      brand: brand?.name || '', description: item.description,
      projectUsage: usage,
    })
  }

  return (
    <div className="space-y-5">
      {/* Kitting Progress Summary */}
      <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200/60 dark:border-stone-800 overflow-hidden">
        <div className="px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <h3
              className="text-sm font-semibold text-stone-900 dark:text-stone-100"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Supply Kitting
            </h3>
            {onOpenBulkEditor && (
              <button
                onClick={() => onOpenBulkEditor(projectId)}
                className="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium flex items-center gap-1 transition-colors"
                style={{ fontFamily: "'Source Sans 3', sans-serif" }}
              >
                <ExternalLink className="w-3 h-3" />
                Bulk editor
              </button>
            )}
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 h-2 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 dark:bg-emerald-400 rounded-full transition-all"
                style={{ width: `${kittingSummary.overallPercent}%` }}
              />
            </div>
            <span
              className={`text-sm font-medium tabular-nums ${
                kittingSummary.overallPercent === 100
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-stone-700 dark:text-stone-300'
              }`}
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {kittingSummary.overallPercent}%
            </span>
          </div>

          {/* Summary */}
          {kittingSummary.overallPercent === 100 ? (
            <div className="bg-emerald-50/50 dark:bg-emerald-950/20 rounded-lg px-4 py-2.5 border border-emerald-200/40 dark:border-emerald-900/30">
              <p className="text-sm text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-2" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                <Check className="w-4 h-4" />
                All supplies acquired
              </p>
            </div>
          ) : kittingSummary.needsSummary.length > 0 ? (
            <div className="bg-amber-50/50 dark:bg-amber-950/20 rounded-lg px-4 py-2.5 border border-amber-200/40 dark:border-amber-900/30">
              <p className="text-sm text-amber-700 dark:text-amber-400" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                <span className="font-medium">Still needs:</span>{' '}
                {kittingSummary.needsSummary.join(', ')}
              </p>
            </div>
          ) : null}
        </div>
      </div>

      {/* Thread Section */}
      <div className="relative">
        <SupplySection
          title="Thread"
          icon={CircleDot}
          count={projectThreads.length}
          fulfilledCount={fulfilledThreads}
          defaultOpen
          onAddClick={() => setAddingType('thread')}
        >
          {projectThreads.map(pt => {
            const thread = threadById.get(pt.threadId)
            const brand = thread ? brandById.get(thread.brandId) : null
            if (!thread) return null
            return (
              <SupplyRow
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
                onRemove={() => onRemoveProjectThread?.(pt.id)}
                onClickDetail={() => thread && openThreadDetail(thread)}
              />
            )
          })}
        </SupplySection>
        {addingType === 'thread' && (
          <SearchToAdd
            items={availableThreads}
            placeholder="Search threads by code or name..."
            onClose={() => setAddingType(null)}
            onSelect={t => {
              onAddProjectThread?.(projectId, t.id, { quantityRequired: 1 })
              setAddingType(null)
            }}
            renderItem={t => {
              const brand = brandById.get(t.brandId)
              return (
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full shrink-0 ${needsBorder(t.hexColor) ? 'ring-1 ring-stone-200 dark:ring-stone-600' : ''}`}
                    style={{ backgroundColor: t.hexColor }}
                  />
                  <span className="text-sm text-stone-700 dark:text-stone-300" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                    <span className="font-medium">{brand?.name} {t.colorCode}</span> — {t.colorName}
                  </span>
                </div>
              )
            }}
          />
        )}
      </div>

      {/* Beads Section */}
      <div className="relative">
        <SupplySection
          title="Beads"
          icon={Gem}
          count={projectBeads.length}
          fulfilledCount={fulfilledBeads}
          onAddClick={() => setAddingType('bead')}
        >
          {projectBeads.map(pb => {
            const bead = beadById.get(pb.beadId)
            const brand = bead ? brandById.get(bead.brandId) : null
            if (!bead) return null
            return (
              <SupplyRow
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
                onClickDetail={() => bead && openBeadDetail(bead)}
              />
            )
          })}
        </SupplySection>
        {addingType === 'bead' && (
          <SearchToAdd
            items={availableBeads}
            placeholder="Search beads by code or name..."
            onClose={() => setAddingType(null)}
            onSelect={b => {
              onAddProjectBead?.(projectId, b.id, { quantityRequired: 1 })
              setAddingType(null)
            }}
            renderItem={b => {
              const brand = brandById.get(b.brandId)
              return (
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full shrink-0 ${needsBorder(b.hexColor) ? 'ring-1 ring-stone-200 dark:ring-stone-600' : ''}`}
                    style={{ backgroundColor: b.hexColor }}
                  />
                  <span className="text-sm text-stone-700 dark:text-stone-300" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                    <span className="font-medium">{brand?.name} {b.productCode}</span> — {b.colorName}
                  </span>
                </div>
              )
            }}
          />
        )}
      </div>

      {/* Specialty Section */}
      <div className="relative">
        <SupplySection
          title="Specialty"
          icon={Sparkles}
          count={projectSpecialty.length}
          fulfilledCount={fulfilledSpecialty}
          onAddClick={() => setAddingType('specialty')}
        >
          {projectSpecialty.map(ps => {
            const item = specialtyById.get(ps.specialtyItemId)
            const brand = item ? brandById.get(item.brandId) : null
            if (!item) return null
            return (
              <SupplyRow
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
                onClickDetail={() => item && openSpecialtyDetail(item)}
              />
            )
          })}
        </SupplySection>
        {addingType === 'specialty' && (
          <SearchToAdd
            items={availableSpecialty}
            placeholder="Search specialty items..."
            onClose={() => setAddingType(null)}
            onSelect={s => {
              onAddProjectSpecialty?.(projectId, s.id, { quantityRequired: 1 })
              setAddingType(null)
            }}
            renderItem={s => {
              const brand = brandById.get(s.brandId)
              return (
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full shrink-0 ${needsBorder(s.hexColor) ? 'ring-1 ring-stone-200 dark:ring-stone-600' : ''}`}
                    style={{ backgroundColor: s.hexColor }}
                  />
                  <span className="text-sm text-stone-700 dark:text-stone-300" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                    <span className="font-medium">{brand?.name} {s.productCode}</span> — {s.colorName}
                  </span>
                </div>
              )
            }}
          />
        )}
      </div>

      {/* Cross-reference detail modal */}
      {detailSupply && (
        <SupplyDetailModal
          supply={detailSupply}
          onClose={() => setDetailSupply(null)}
          onNavigateToProject={onNavigateToProject}
        />
      )}
    </div>
  )
}

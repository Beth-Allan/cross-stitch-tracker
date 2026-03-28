import { useState, useMemo } from 'react'
import {
  ShoppingBag,
  Scissors,
  Check,
  ChevronDown,
  ChevronRight,
  Plus,
  Minus,
  X,
  Search,
  Printer,
  Trash2,
  Package,
  Gem,
  Sparkles,
  LayoutGrid,
  ClipboardList,
  Square,
  CheckSquare,
  MinusSquare,
} from 'lucide-react'
import type {
  ShoppingCartProps,
  ShoppingProject,
  ShoppingThreadNeed,
  ShoppingBeadNeed,
  ShoppingSpecialtyNeed,
  ShoppingFabricNeed,
  FabricMatchingStash,
} from '../types'

/* ── Status colour map ─────────────────────────────────── */

type ProjectStatus = 'Unstarted' | 'Kitting' | 'Kitted' | 'In Progress' | 'On Hold' | 'Finished' | 'FFO'

const statusGradients: Record<ProjectStatus, [string, string]> = {
  'Unstarted':   ['#e7e5e4', '#d6d3d1'],
  'Kitting':     ['#fef3c7', '#fde68a'],
  'Kitted':      ['#d1fae5', '#a7f3d0'],
  'In Progress': ['#e0f2fe', '#bae6fd'],
  'On Hold':     ['#ffedd5', '#fed7aa'],
  'Finished':    ['#ede9fe', '#ddd6fe'],
  'FFO':         ['#ffe4e6', '#fecdd3'],
}

const statusBadgeStyles: Record<string, { bg: string; text: string; dot: string }> = {
  'Unstarted':   { bg: 'bg-stone-100 dark:bg-stone-800',        text: 'text-stone-600 dark:text-stone-400',   dot: 'bg-stone-400 dark:bg-stone-500' },
  'Kitting':     { bg: 'bg-amber-50 dark:bg-amber-950/40',      text: 'text-amber-700 dark:text-amber-400',   dot: 'bg-amber-500 dark:bg-amber-400' },
  'Kitted':      { bg: 'bg-emerald-50 dark:bg-emerald-950/40',  text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500 dark:bg-emerald-400' },
  'In Progress': { bg: 'bg-sky-50 dark:bg-sky-950/40',          text: 'text-sky-700 dark:text-sky-400',       dot: 'bg-sky-500 dark:bg-sky-400' },
  'On Hold':     { bg: 'bg-orange-50 dark:bg-orange-950/40',    text: 'text-orange-700 dark:text-orange-400', dot: 'bg-orange-400 dark:bg-orange-400' },
  'Finished':    { bg: 'bg-violet-50 dark:bg-violet-950/40',    text: 'text-violet-700 dark:text-violet-400', dot: 'bg-violet-500 dark:bg-violet-400' },
  'FFO':         { bg: 'bg-rose-50 dark:bg-rose-950/40',        text: 'text-rose-700 dark:text-rose-400',     dot: 'bg-rose-500 dark:bg-rose-400' },
}

const statusLabels: Record<string, string> = {
  'Unstarted': 'Unstarted', 'Kitting': 'Kitting', 'Kitted': 'Ready',
  'In Progress': 'Stitching', 'On Hold': 'On Hold', 'Finished': 'Finished', 'FFO': 'FFO',
}

/* ── Helpers ───────────────────────────────────────────── */

function fmt(n: number): string {
  return Number.isInteger(n) ? n.toLocaleString() : n.toFixed(1)
}

function calcFabricSize(stitches: number, count: number): number {
  return Math.ceil((stitches / count + 6) * 10) / 10
}

/* ── Shared sub-components ─────────────────────────────── */

function StatusBadge({ status }: { status: string }) {
  const s = statusBadgeStyles[status] ?? statusBadgeStyles['Unstarted']
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full text-xs font-medium px-2 py-0.5 ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {statusLabels[status] ?? status}
    </span>
  )
}

function CoverPlaceholder({ status, size = 36 }: { status: string; size?: number }) {
  const [from, to] = statusGradients[status as ProjectStatus] ?? statusGradients['Unstarted']
  return (
    <div
      className="flex items-center justify-center rounded-md"
      style={{ width: size, height: size, minWidth: size, background: `linear-gradient(160deg, ${from} 0%, ${to} 100%)` }}
    >
      <Scissors style={{ width: size * 0.4, height: size * 0.4 }} className="text-stone-400/25" strokeWidth={1} />
    </div>
  )
}

function CoverImage({ src, alt, status, size = 36 }: { src: string | null; alt: string; status: string; size?: number }) {
  const [failed, setFailed] = useState(false)
  if (src && !failed) {
    return (
      <img
        src={src} alt={alt}
        className="rounded-md object-cover"
        style={{ width: size, height: size, minWidth: size }}
        onError={() => setFailed(true)}
      />
    )
  }
  return <CoverPlaceholder status={status} size={size} />
}

function ColorSwatch({ hex, size = 16 }: { hex: string; size?: number }) {
  const isWhite = hex.toLowerCase() === '#ffffff' || hex.toLowerCase() === '#fff'
  return (
    <span
      className="rounded-full inline-block shrink-0"
      style={{
        width: size,
        height: size,
        backgroundColor: hex,
        border: isWhite ? '1px solid #d6d3d1' : 'none',
      }}
    />
  )
}

function QuantityControl({
  acquired,
  total,
  unit,
  onUpdate,
}: {
  acquired: number
  total: number
  unit: string
  onUpdate: (val: number) => void
}) {
  const remaining = total - acquired
  const isFull = remaining <= 0
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <button
          onClick={() => onUpdate(Math.max(0, acquired - 1))}
          className="text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300 transition-colors"
          style={{ width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4 }}
          disabled={acquired <= 0}
        >
          <Minus className="w-3 h-3" />
        </button>
        <button
          onClick={() => {
            const val = prompt(`Acquired quantity (of ${total} ${unit}):`, String(acquired))
            if (val !== null) {
              const n = parseFloat(val)
              if (!isNaN(n) && n >= 0) onUpdate(Math.min(total, n))
            }
          }}
          className={`text-xs font-medium px-1.5 py-0.5 rounded transition-colors ${
            isFull
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
              : 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
          }`}
          style={{ fontFamily: "'JetBrains Mono', monospace", minWidth: 48, textAlign: 'center' }}
        >
          {fmt(acquired)}/{fmt(total)}
        </button>
        <button
          onClick={() => onUpdate(Math.min(total, acquired + 1))}
          className="text-stone-400 hover:text-emerald-600 dark:text-stone-500 dark:hover:text-emerald-400 transition-colors"
          style={{ width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4 }}
          disabled={isFull}
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>
      <span className="text-xs text-stone-400 dark:text-stone-500">{unit}</span>
      {isFull && <Check className="w-3.5 h-3.5 text-emerald-500" />}
    </div>
  )
}

/* ── Tab types ─────────────────────────────────────────── */

type TabId = 'projects' | 'threads' | 'beads' | 'specialty' | 'fabric' | 'list'

interface TabDef {
  id: TabId
  label: string
  icon: typeof ShoppingBag
  getBadge: () => number
}

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════ */

export function ShoppingCart({
  projects,
  threads,
  beads,
  specialty,
  fabrics,
  onMarkAcquired,
  onMarkFabricAcquired,
  onAssignFabric,
  onUpdateFabricCountPreference,
  onNavigateToProject,
  onClearCompleted,
}: ShoppingCartProps) {
  const [activeTab, setActiveTab] = useState<TabId>('projects')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null)
  const [expandedSupplyId, setExpandedSupplyId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [acquiredOverrides, setAcquiredOverrides] = useState<Record<string, number>>({})
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set())
  const [fabricCountPrefs, setFabricCountPrefs] = useState<Record<string, number[]>>(() => {
    const prefs: Record<string, number[]> = {}
    fabrics.forEach(f => {
      if (f.linkedProjectId && f.preferredCounts.length > 0) {
        prefs[f.linkedProjectId] = [...f.preferredCounts]
      }
    })
    return prefs
  })

  /* ── Selection helpers ─────────────────────────────────── */

  function toggleProject(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function removeProject(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  function selectAll() {
    setSelectedIds(new Set(projects.map(p => p.projectId)))
  }

  /* ── Filtered data ─────────────────────────────────────── */

  const filteredThreads = useMemo(() => {
    if (selectedIds.size === 0) return []
    return threads.filter(t =>
      t.totalRemaining > 0 &&
      t.projects.some(p => selectedIds.has(p.projectId) && p.quantityNeeded > 0)
    )
  }, [threads, selectedIds])

  const filteredBeads = useMemo(() => {
    if (selectedIds.size === 0) return []
    return beads.filter(b =>
      b.totalRemaining > 0 &&
      b.projects.some(p => selectedIds.has(p.projectId) && p.quantityNeeded > 0)
    )
  }, [beads, selectedIds])

  const filteredSpecialty = useMemo(() => {
    if (selectedIds.size === 0) return []
    return specialty.filter(s =>
      s.totalRemaining > 0 &&
      s.projects.some(p => selectedIds.has(p.projectId) && p.quantityNeeded > 0)
    )
  }, [specialty, selectedIds])

  const filteredFabrics = useMemo(() => {
    if (selectedIds.size === 0) return []
    return fabrics.filter(f =>
      f.linkedProjectId ? selectedIds.has(f.linkedProjectId) : true
    )
  }, [fabrics, selectedIds])

  /* ── Acquired state ────────────────────────────────────── */

  function getAcquired(key: string, defaultVal: number): number {
    return acquiredOverrides[key] ?? defaultVal
  }

  function setAcquired(key: string, val: number, type: 'thread' | 'bead' | 'specialty', itemId: string) {
    setAcquiredOverrides(prev => ({ ...prev, [key]: val }))
    onMarkAcquired?.(type, itemId, val)
  }

  /* ── Shopping list items ────────────────────────────────── */

  interface ListItem {
    key: string
    type: 'thread' | 'bead' | 'specialty' | 'fabric'
    label: string
    detail: string
    quantity: string
    hexColor?: string
    acquired: number
    total: number
  }

  const shoppingListItems = useMemo((): ListItem[] => {
    const items: ListItem[] = []

    filteredThreads.forEach(t => {
      const acq = getAcquired(`thread-${t.threadId}`, t.totalAcquired)
      const rem = t.totalRequired - acq
      if (rem <= 0) return
      const projNames = t.projects.filter(p => selectedIds.has(p.projectId)).map(p => p.projectName).join(', ')
      items.push({
        key: `thread-${t.threadId}`,
        type: 'thread',
        label: `${t.brandName} ${t.colorCode} ${t.colorName}`,
        detail: projNames,
        quantity: `${fmt(rem)} ${t.unit}`,
        hexColor: t.hexColor,
        acquired: acq,
        total: t.totalRequired,
      })
    })

    filteredBeads.forEach(b => {
      const acq = getAcquired(`bead-${b.beadId}`, b.totalAcquired)
      const rem = b.totalRequired - acq
      if (rem <= 0) return
      const projNames = b.projects.filter(p => selectedIds.has(p.projectId)).map(p => p.projectName).join(', ')
      items.push({
        key: `bead-${b.beadId}`,
        type: 'bead',
        label: `${b.brandName} ${b.productCode} ${b.colorName}`,
        detail: projNames,
        quantity: `${fmt(rem)} ${b.unit}`,
        hexColor: b.hexColor,
        acquired: acq,
        total: b.totalRequired,
      })
    })

    filteredSpecialty.forEach(s => {
      const acq = getAcquired(`specialty-${s.specialtyItemId}`, s.totalAcquired)
      const rem = s.totalRequired - acq
      if (rem <= 0) return
      const projNames = s.projects.filter(p => selectedIds.has(p.projectId)).map(p => p.projectName).join(', ')
      items.push({
        key: `specialty-${s.specialtyItemId}`,
        type: 'specialty',
        label: `${s.brandName} ${s.productCode}`,
        detail: `${s.description} — ${projNames}`,
        quantity: `${fmt(rem)} ${s.unit}`,
        hexColor: s.hexColor,
        acquired: acq,
        total: s.totalRequired,
      })
    })

    filteredFabrics.forEach(f => {
      if (!f.linkedProjectId && !f.fabricId) return
      const key = `fabric-${f.fabricId ?? f.linkedProjectId}`
      const prefs = f.linkedProjectId ? (fabricCountPrefs[f.linkedProjectId] ?? f.preferredCounts) : f.preferredCounts
      let sizeInfo = ''
      if (f.stitchesWide && f.stitchesHigh && prefs.length > 0) {
        sizeInfo = prefs.map(ct => {
          const w = calcFabricSize(f.stitchesWide!, ct)
          const h = calcFabricSize(f.stitchesHigh!, ct)
          return `${w}" × ${h}" ${ct}ct`
        }).join(' OR ')
      }
      items.push({
        key,
        type: 'fabric',
        label: f.description,
        detail: sizeInfo || (f.colorPreference ?? ''),
        quantity: '1 piece',
        acquired: 0,
        total: 1,
      })
    })

    return items
  }, [filteredThreads, filteredBeads, filteredSpecialty, filteredFabrics, acquiredOverrides, selectedIds, fabricCountPrefs])

  /* ── Tab badge counts ──────────────────────────────────── */

  const tabs: TabDef[] = [
    { id: 'projects', label: 'Projects', icon: LayoutGrid, getBadge: () => projects.length },
    { id: 'threads', label: 'Threads', icon: Package, getBadge: () => filteredThreads.length },
    { id: 'beads', label: 'Beads', icon: Gem, getBadge: () => filteredBeads.length },
    { id: 'specialty', label: 'Specialty', icon: Sparkles, getBadge: () => filteredSpecialty.length },
    { id: 'fabric', label: 'Fabric', icon: LayoutGrid, getBadge: () => filteredFabrics.length },
    { id: 'list', label: 'Shopping List', icon: ClipboardList, getBadge: () => shoppingListItems.length },
  ]

  /* ── Per-project supply helpers ─────────────────────────── */

  function getProjectThreads(projectId: string) {
    return threads.filter(t => t.totalRemaining > 0 && t.projects.some(p => p.projectId === projectId && p.quantityNeeded > 0))
  }
  function getProjectBeads(projectId: string) {
    return beads.filter(b => b.totalRemaining > 0 && b.projects.some(p => p.projectId === projectId && p.quantityNeeded > 0))
  }
  function getProjectSpecialty(projectId: string) {
    return specialty.filter(s => s.totalRemaining > 0 && s.projects.some(p => p.projectId === projectId && p.quantityNeeded > 0))
  }
  function getProjectFabrics(projectId: string) {
    return fabrics.filter(f => f.linkedProjectId === projectId)
  }

  /* ══════════════════════════════════════════════════════════
     RENDER
     ══════════════════════════════════════════════════════════ */

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', fontFamily: "'Source Sans 3', sans-serif" }}>

      {/* ── Page header ─────────────────────────────── */}
      <div style={{ padding: '32px 0 0' }}>
        <h1
          style={{ fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 600, margin: 0, lineHeight: 1.2 }}
          className="text-stone-900 dark:text-stone-100"
        >
          Shopping Cart
        </h1>
        <p className="text-stone-500 dark:text-stone-400" style={{ fontSize: 14, margin: '4px 0 0' }}>
          Select projects to build your shopping list
        </p>
      </div>

      {/* ── Shopping-for bar (always visible) ────────── */}
      <div
        className="bg-stone-50/80 dark:bg-stone-800/50 border-b border-stone-200 dark:border-stone-700"
        style={{ position: 'sticky', top: 0, zIndex: 20, padding: '10px 16px', margin: '16px -16px 0', backdropFilter: 'blur(8px)' }}
      >
        {selectedIds.size === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShoppingBag className="w-4 h-4 text-stone-400 dark:text-stone-500" />
            <span className="text-sm text-stone-500 dark:text-stone-400">
              No projects selected — choose projects below to start your shopping trip
            </span>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', rowGap: 8 }}>
            <span className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide" style={{ marginRight: 2 }}>
              Shopping for:
            </span>
            {projects.filter(p => selectedIds.has(p.projectId)).map(p => (
              <span
                key={p.projectId}
                className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 8px 4px 10px', borderRadius: 999, fontSize: 13, fontWeight: 500 }}
              >
                {p.projectName}
                <button
                  onClick={() => removeProject(p.projectId)}
                  className="text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-200 transition-colors"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 16, height: 16, borderRadius: 999 }}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <button
              onClick={() => setSelectedIds(new Set())}
              className="text-xs text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300 transition-colors"
              style={{ marginLeft: 4 }}
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* ── Tab bar ──────────────────────────────────── */}
      <div
        className="border-b border-stone-200 dark:border-stone-700"
        style={{ display: 'flex', gap: 0, margin: '0 -16px', padding: '0 16px', overflowX: 'auto' }}
      >
        {tabs.map(tab => {
          const isActive = activeTab === tab.id
          const badge = tab.getBadge()
          const needsSelection = tab.id !== 'projects' && selectedIds.size === 0
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`transition-colors whitespace-nowrap ${
                isActive
                  ? 'text-emerald-700 dark:text-emerald-400 border-b-2 border-emerald-600 dark:border-emerald-400'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300 border-b-2 border-transparent'
              }`}
              style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, opacity: needsSelection ? 0.5 : 1 }}
            >
              {tab.label}
              {badge > 0 && (
                <span
                  className={isActive
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                    : 'bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400'
                  }
                  style={{ fontSize: 11, fontWeight: 700, padding: '1px 6px', borderRadius: 999, fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {badge}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* ── Tab content ──────────────────────────────── */}
      <div style={{ padding: '24px 0 48px' }}>

        {/* ════ PROJECTS TAB ════ */}
        {activeTab === 'projects' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <p className="text-sm text-stone-500 dark:text-stone-400">
                {projects.length} project{projects.length !== 1 ? 's' : ''} with unfulfilled supply needs
              </p>
              <button
                onClick={selectAll}
                className="text-xs font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors"
              >
                Select all
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {projects.map(proj => {
                const isSelected = selectedIds.has(proj.projectId)
                const isExpanded = expandedProjectId === proj.projectId
                const totalNeeds = proj.threadCount + proj.beadCount + proj.specialtyCount + (proj.fabricNeeded ? 1 : 0)

                return (
                  <div
                    key={proj.projectId}
                    className={`rounded-lg border transition-colors ${
                      isSelected
                        ? 'border-emerald-300 bg-emerald-50/30 dark:border-emerald-800 dark:bg-emerald-950/20'
                        : 'border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-900'
                    }`}
                  >
                    {/* Project row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px' }}>
                      {/* Checkbox */}
                      <button
                        onClick={() => toggleProject(proj.projectId)}
                        className={`transition-colors ${
                          isSelected
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-stone-300 hover:text-stone-400 dark:text-stone-600 dark:hover:text-stone-500'
                        }`}
                      >
                        {isSelected
                          ? <CheckSquare className="w-5 h-5" />
                          : <Square className="w-5 h-5" />
                        }
                      </button>

                      {/* Cover */}
                      <CoverImage src={proj.coverImageUrl} alt={proj.projectName} status={proj.status} size={40} />

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <button
                            onClick={() => onNavigateToProject?.(proj.projectId)}
                            className="text-sm font-semibold text-stone-900 dark:text-stone-100 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors underline decoration-stone-300 dark:decoration-stone-600 underline-offset-2"
                            style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                          >
                            {proj.projectName}
                          </button>
                          <StatusBadge status={proj.status} />
                        </div>
                        <p className="text-xs text-stone-500 dark:text-stone-400" style={{ margin: '2px 0 0' }}>
                          {proj.designerName} · {totalNeeds} item{totalNeeds !== 1 ? 's' : ''} needed
                        </p>
                      </div>

                      {/* Expand toggle */}
                      <button
                        onClick={() => setExpandedProjectId(isExpanded ? null : proj.projectId)}
                        className="text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300 transition-colors"
                        style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}
                      >
                        <span className="text-xs text-stone-400 dark:text-stone-500 max-md:hidden">Details</span>
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Expanded supply breakdown */}
                    {isExpanded && (
                      <div
                        className="border-t border-stone-100 dark:border-stone-800"
                        style={{ padding: '0 16px 16px 60px' }}
                      >
                        <ProjectSupplyBreakdown
                          projectId={proj.projectId}
                          threads={getProjectThreads(proj.projectId)}
                          beads={getProjectBeads(proj.projectId)}
                          specialty={getProjectSpecialty(proj.projectId)}
                          fabrics={getProjectFabrics(proj.projectId)}
                          acquiredOverrides={acquiredOverrides}
                          onSetAcquired={setAcquired}
                          onNavigateToProject={onNavigateToProject}
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ════ THREADS TAB ════ */}
        {activeTab === 'threads' && (
          <SupplyTab
            type="thread"
            items={filteredThreads.map(t => ({
              id: t.threadId,
              label: `${t.brandName} ${t.colorCode}`,
              sublabel: t.colorName,
              hexColor: t.hexColor,
              totalRequired: t.totalRequired,
              totalAcquired: getAcquired(`thread-${t.threadId}`, t.totalAcquired),
              totalRemaining: t.totalRequired - getAcquired(`thread-${t.threadId}`, t.totalAcquired),
              unit: t.unit,
              projects: t.projects.filter(p => selectedIds.has(p.projectId) && p.quantityNeeded > 0),
            }))}
            emptyMessage="No thread needs for selected projects"
            noSelectionMessage="Select projects on the Projects tab to see thread needs"
            hasSelection={selectedIds.size > 0}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            expandedId={expandedSupplyId}
            onToggleExpand={(id) => setExpandedSupplyId(expandedSupplyId === id ? null : id)}
            onUpdateAcquired={(id, val) => {
              const t = threads.find(x => x.threadId === id)
              if (t) setAcquired(`thread-${id}`, val, 'thread', id)
            }}
            onNavigateToProject={onNavigateToProject}
          />
        )}

        {/* ════ BEADS TAB ════ */}
        {activeTab === 'beads' && (
          <SupplyTab
            type="bead"
            items={filteredBeads.map(b => ({
              id: b.beadId,
              label: `${b.brandName} ${b.productCode}`,
              sublabel: b.colorName,
              hexColor: b.hexColor,
              totalRequired: b.totalRequired,
              totalAcquired: getAcquired(`bead-${b.beadId}`, b.totalAcquired),
              totalRemaining: b.totalRequired - getAcquired(`bead-${b.beadId}`, b.totalAcquired),
              unit: b.unit,
              projects: b.projects.filter(p => selectedIds.has(p.projectId) && p.quantityNeeded > 0),
            }))}
            emptyMessage="No bead needs for selected projects"
            noSelectionMessage="Select projects on the Projects tab to see bead needs"
            hasSelection={selectedIds.size > 0}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            expandedId={expandedSupplyId}
            onToggleExpand={(id) => setExpandedSupplyId(expandedSupplyId === id ? null : id)}
            onUpdateAcquired={(id, val) => {
              setAcquired(`bead-${id}`, val, 'bead', id)
            }}
            onNavigateToProject={onNavigateToProject}
          />
        )}

        {/* ════ SPECIALTY TAB ════ */}
        {activeTab === 'specialty' && (
          <SupplyTab
            type="specialty"
            items={filteredSpecialty.map(s => ({
              id: s.specialtyItemId,
              label: `${s.brandName} ${s.productCode}`,
              sublabel: s.description,
              hexColor: s.hexColor,
              totalRequired: s.totalRequired,
              totalAcquired: getAcquired(`specialty-${s.specialtyItemId}`, s.totalAcquired),
              totalRemaining: s.totalRequired - getAcquired(`specialty-${s.specialtyItemId}`, s.totalAcquired),
              unit: s.unit,
              projects: s.projects.filter(p => selectedIds.has(p.projectId) && p.quantityNeeded > 0),
            }))}
            emptyMessage="No specialty item needs for selected projects"
            noSelectionMessage="Select projects on the Projects tab to see specialty item needs"
            hasSelection={selectedIds.size > 0}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            expandedId={expandedSupplyId}
            onToggleExpand={(id) => setExpandedSupplyId(expandedSupplyId === id ? null : id)}
            onUpdateAcquired={(id, val) => {
              setAcquired(`specialty-${id}`, val, 'specialty', id)
            }}
            onNavigateToProject={onNavigateToProject}
          />
        )}

        {/* ════ FABRIC TAB ════ */}
        {activeTab === 'fabric' && (
          <FabricTab
            fabrics={filteredFabrics}
            hasSelection={selectedIds.size > 0}
            fabricCountPrefs={fabricCountPrefs}
            onUpdateCountPrefs={(projectId, counts) => {
              setFabricCountPrefs(prev => ({ ...prev, [projectId]: counts }))
              onUpdateFabricCountPreference?.(projectId, counts)
            }}
            onAssignFabric={onAssignFabric}
            onMarkFabricAcquired={onMarkFabricAcquired}
          />
        )}

        {/* ════ SHOPPING LIST TAB ════ */}
        {activeTab === 'list' && (
          <ShoppingListTab
            items={shoppingListItems}
            checkedItems={checkedItems}
            hasSelection={selectedIds.size > 0}
            onToggleCheck={(key) => {
              setCheckedItems(prev => {
                const next = new Set(prev)
                if (next.has(key)) next.delete(key)
                else next.add(key)
                return next
              })
            }}
            onClearCompleted={() => {
              setCheckedItems(new Set())
              onClearCompleted?.()
            }}
          />
        )}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   PROJECT SUPPLY BREAKDOWN (expanded view on Projects tab)
   ══════════════════════════════════════════════════════════ */

function ProjectSupplyBreakdown({
  projectId,
  threads,
  beads,
  specialty,
  fabrics,
  acquiredOverrides,
  onSetAcquired,
  onNavigateToProject,
}: {
  projectId: string
  threads: ShoppingThreadNeed[]
  beads: ShoppingBeadNeed[]
  specialty: ShoppingSpecialtyNeed[]
  fabrics: ShoppingFabricNeed[]
  acquiredOverrides: Record<string, number>
  onSetAcquired: (key: string, val: number, type: 'thread' | 'bead' | 'specialty', itemId: string) => void
  onNavigateToProject?: (projectId: string) => void
}) {
  const sections = [
    { label: 'Threads', items: threads, type: 'thread' as const },
    { label: 'Beads', items: beads, type: 'bead' as const },
    { label: 'Specialty', items: specialty, type: 'specialty' as const },
  ].filter(s => s.items.length > 0)

  return (
    <div style={{ paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {sections.map(section => (
        <div key={section.label}>
          <h4
            className="text-xs font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wide"
            style={{ marginBottom: 8 }}
          >
            {section.label} — {section.items.length} needed
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {section.type === 'thread' && (threads as ShoppingThreadNeed[]).map(t => {
              const projNeed = t.projects.find(p => p.projectId === projectId)
              return (
                <div key={t.threadId} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ColorSwatch hex={t.hexColor} />
                  <span className="text-sm text-stone-700 dark:text-stone-300" style={{ flex: 1 }}>
                    {t.brandName} {t.colorCode} <span className="text-stone-400 dark:text-stone-500">{t.colorName}</span>
                  </span>
                  <span className="text-xs text-stone-500 dark:text-stone-400" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {fmt(projNeed?.quantityNeeded ?? 0)} {t.unit}
                  </span>
                </div>
              )
            })}
            {section.type === 'bead' && (beads as ShoppingBeadNeed[]).map(b => {
              const projNeed = b.projects.find(p => p.projectId === projectId)
              return (
                <div key={b.beadId} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ColorSwatch hex={b.hexColor} />
                  <span className="text-sm text-stone-700 dark:text-stone-300" style={{ flex: 1 }}>
                    {b.brandName} {b.productCode} <span className="text-stone-400 dark:text-stone-500">{b.colorName}</span>
                  </span>
                  <span className="text-xs text-stone-500 dark:text-stone-400" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {fmt(projNeed?.quantityNeeded ?? 0)} {b.unit}
                  </span>
                </div>
              )
            })}
            {section.type === 'specialty' && (specialty as ShoppingSpecialtyNeed[]).map(s => {
              const projNeed = s.projects.find(p => p.projectId === projectId)
              return (
                <div key={s.specialtyItemId} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ColorSwatch hex={s.hexColor} />
                  <span className="text-sm text-stone-700 dark:text-stone-300" style={{ flex: 1 }}>
                    {s.brandName} {s.productCode} <span className="text-stone-400 dark:text-stone-500">{s.description}</span>
                  </span>
                  <span className="text-xs text-stone-500 dark:text-stone-400" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {fmt(projNeed?.quantityNeeded ?? 0)} {s.unit}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {/* Fabric section — only if needed */}
      {fabrics.length > 0 && (
        <div>
          <h4
            className="text-xs font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wide"
            style={{ marginBottom: 8 }}
          >
            Fabric — {fabrics.length} needed
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {fabrics.map((f, i) => (
              <div key={i} className="text-sm text-stone-700 dark:text-stone-300">
                {f.description}
                {f.colorPreference && (
                  <span className="text-stone-400 dark:text-stone-500"> · {f.colorPreference}</span>
                )}
                {f.brandPreference && (
                  <span className="text-stone-400 dark:text-stone-500"> · Prefer {f.brandPreference}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   SUPPLY TAB (reusable for Threads / Beads / Specialty)
   ══════════════════════════════════════════════════════════ */

interface SupplyTabItem {
  id: string
  label: string
  sublabel: string
  hexColor: string
  totalRequired: number
  totalAcquired: number
  totalRemaining: number
  unit: string
  projects: { projectId: string; projectName: string; quantityNeeded: number }[]
}

function SupplyTab({
  type,
  items,
  emptyMessage,
  noSelectionMessage,
  hasSelection,
  searchQuery,
  onSearchChange,
  expandedId,
  onToggleExpand,
  onUpdateAcquired,
  onNavigateToProject,
}: {
  type: 'thread' | 'bead' | 'specialty'
  items: SupplyTabItem[]
  emptyMessage: string
  noSelectionMessage: string
  hasSelection: boolean
  searchQuery: string
  onSearchChange: (q: string) => void
  expandedId: string | null
  onToggleExpand: (id: string) => void
  onUpdateAcquired: (id: string, val: number) => void
  onNavigateToProject?: (projectId: string) => void
}) {
  if (!hasSelection) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 0' }}>
        <ShoppingBag className="w-8 h-8 text-stone-300 dark:text-stone-600 mx-auto" style={{ marginBottom: 12 }} />
        <p className="text-sm text-stone-400 dark:text-stone-500">{noSelectionMessage}</p>
      </div>
    )
  }

  const filtered = searchQuery
    ? items.filter(i =>
        i.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.sublabel.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : items

  return (
    <div>
      {/* Search */}
      {items.length > 5 && (
        <div
          className="bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 rounded-lg"
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', marginBottom: 16 }}
        >
          <Search className="w-4 h-4 text-stone-400 dark:text-stone-500 shrink-0" />
          <input
            type="text"
            placeholder={`Search ${type}s…`}
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            className="flex-1 bg-transparent text-sm text-stone-700 dark:text-stone-300 placeholder:text-stone-400 dark:placeholder:text-stone-500 outline-none"
          />
          {searchQuery && (
            <button onClick={() => onSearchChange('')} className="text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <p className="text-sm text-stone-400 dark:text-stone-500">
            {searchQuery ? 'No matches found' : emptyMessage}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {filtered.map(item => {
            const isExpanded = expandedId === item.id
            const hasMultipleProjects = item.projects.length > 1
            return (
              <div
                key={item.id}
                className="rounded-lg border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-900"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px' }}>
                  <ColorSwatch hex={item.hexColor} size={18} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span className="text-sm font-semibold text-stone-800 dark:text-stone-200">{item.label}</span>
                      {hasMultipleProjects && (
                        <button
                          onClick={() => onToggleExpand(item.id)}
                          className="text-xs text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300 transition-colors"
                          style={{ display: 'flex', alignItems: 'center', gap: 2 }}
                        >
                          {item.projects.length} projects
                          {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-stone-500 dark:text-stone-400" style={{ margin: '1px 0 0' }}>
                      {item.sublabel}
                      {!hasMultipleProjects && item.projects[0] && (
                        <span> · {item.projects[0].projectName}</span>
                      )}
                    </p>
                  </div>
                  <QuantityControl
                    acquired={item.totalAcquired}
                    total={item.totalRequired}
                    unit={item.unit}
                    onUpdate={(val) => onUpdateAcquired(item.id, val)}
                  />
                </div>

                {/* Per-project breakdown */}
                {isExpanded && hasMultipleProjects && (
                  <div
                    className="border-t border-stone-100 dark:border-stone-800"
                    style={{ padding: '8px 14px 10px 44px' }}
                  >
                    {item.projects.map(p => (
                      <div key={p.projectId} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '3px 0' }}>
                        <button
                          onClick={() => onNavigateToProject?.(p.projectId)}
                          className="text-xs text-stone-600 dark:text-stone-400 hover:text-emerald-600 dark:hover:text-emerald-400 underline underline-offset-2 transition-colors"
                          style={{ flex: 1, textAlign: 'left' }}
                        >
                          {p.projectName}
                        </button>
                        <span className="text-xs text-stone-400 dark:text-stone-500" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                          {fmt(p.quantityNeeded)} {item.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   FABRIC TAB
   ══════════════════════════════════════════════════════════ */

const AVAILABLE_COUNTS = [14, 16, 18, 22, 25, 28, 32, 36, 40]

function FabricTab({
  fabrics,
  hasSelection,
  fabricCountPrefs,
  onUpdateCountPrefs,
  onAssignFabric,
  onMarkFabricAcquired,
}: {
  fabrics: ShoppingFabricNeed[]
  hasSelection: boolean
  fabricCountPrefs: Record<string, number[]>
  onUpdateCountPrefs: (projectId: string, counts: number[]) => void
  onAssignFabric?: (projectId: string, fabricId: string) => void
  onMarkFabricAcquired?: (fabricId: string) => void
}) {
  if (!hasSelection) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 0' }}>
        <ShoppingBag className="w-8 h-8 text-stone-300 dark:text-stone-600 mx-auto" style={{ marginBottom: 12 }} />
        <p className="text-sm text-stone-400 dark:text-stone-500">Select projects on the Projects tab to see fabric needs</p>
      </div>
    )
  }

  if (fabrics.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 0' }}>
        <p className="text-sm text-stone-400 dark:text-stone-500">No fabric needs for selected projects</p>
      </div>
    )
  }

  const projectFabrics = fabrics.filter(f => f.linkedProjectId)
  const standaloneFabrics = fabrics.filter(f => !f.linkedProjectId)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Project-linked fabric needs */}
      {projectFabrics.length > 0 && (
        <div>
          <h3
            className="text-xs font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wide"
            style={{ marginBottom: 12 }}
          >
            Project Fabric Needs
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {projectFabrics.map((f, i) => {
              const prefs = f.linkedProjectId ? (fabricCountPrefs[f.linkedProjectId] ?? f.preferredCounts) : f.preferredCounts
              return (
                <div
                  key={i}
                  className="rounded-lg border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-900"
                  style={{ padding: 16 }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div>
                      <h4 className="text-sm font-semibold text-stone-800 dark:text-stone-200">{f.linkedProjectName}</h4>
                      <p className="text-xs text-stone-500 dark:text-stone-400" style={{ marginTop: 2 }}>
                        {f.stitchesWide && f.stitchesHigh
                          ? `${fmt(f.stitchesWide)} × ${fmt(f.stitchesHigh)} stitches`
                          : f.description
                        }
                        {f.colorPreference && ` · ${f.colorPreference}`}
                        {f.type && ` · ${f.type}`}
                      </p>
                    </div>
                  </div>

                  {/* Count preference selector */}
                  {f.stitchesWide && f.stitchesHigh && (
                    <div style={{ marginBottom: 12 }}>
                      <p className="text-xs font-medium text-stone-500 dark:text-stone-400" style={{ marginBottom: 6 }}>
                        Interested in fabric counts:
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {AVAILABLE_COUNTS.map(ct => {
                          const isSelected = prefs.includes(ct)
                          return (
                            <button
                              key={ct}
                              onClick={() => {
                                if (!f.linkedProjectId) return
                                const next = isSelected ? prefs.filter(c => c !== ct) : [...prefs, ct].sort((a, b) => a - b)
                                onUpdateCountPrefs(f.linkedProjectId, next)
                              }}
                              className={`transition-colors rounded-md text-xs font-medium ${
                                isSelected
                                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-400 dark:border-emerald-700'
                                  : 'bg-stone-50 text-stone-500 border border-stone-200 hover:border-stone-300 dark:bg-stone-800 dark:text-stone-400 dark:border-stone-700 dark:hover:border-stone-600'
                              }`}
                              style={{ padding: '4px 10px' }}
                            >
                              {ct}ct
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Calculated sizes */}
                  {f.stitchesWide && f.stitchesHigh && prefs.length > 0 && (
                    <div
                      className="bg-stone-50 dark:bg-stone-800/50 rounded-md"
                      style={{ padding: '10px 12px', marginBottom: 12 }}
                    >
                      <p className="text-xs font-medium text-stone-500 dark:text-stone-400" style={{ marginBottom: 6 }}>
                        Calculated sizes (incl. 3″ margins):
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {prefs.map(ct => {
                          const w = calcFabricSize(f.stitchesWide!, ct)
                          const h = calcFabricSize(f.stitchesHigh!, ct)
                          return (
                            <div key={ct} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span
                                className="text-xs font-medium text-emerald-700 dark:text-emerald-400"
                                style={{ fontFamily: "'JetBrains Mono', monospace", minWidth: 36 }}
                              >
                                {ct}ct
                              </span>
                              <span className="text-xs text-stone-600 dark:text-stone-300" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                                {w}″ × {h}″
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Matching stash fabrics */}
                  {f.matchingFabrics.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400" style={{ marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Check className="w-3 h-3" />
                        Fabrics That Fit ({f.matchingFabrics.length})
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {f.matchingFabrics.map(mf => (
                          <div
                            key={mf.fabricId}
                            className="bg-emerald-50/50 dark:bg-emerald-950/20 rounded-md"
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px' }}
                          >
                            <div>
                              <p className="text-xs font-medium text-stone-700 dark:text-stone-300">{mf.fabricName}</p>
                              <p className="text-xs text-stone-500 dark:text-stone-400">
                                {mf.brandName} · {mf.count}ct · {mf.colour} · {mf.widthInches}″ × {mf.heightInches}″
                              </p>
                            </div>
                            <button
                              onClick={() => f.linkedProjectId && onAssignFabric?.(f.linkedProjectId, mf.fabricId)}
                              className="text-xs font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/40 dark:hover:bg-emerald-900/60 rounded-md transition-colors"
                              style={{ padding: '4px 10px' }}
                            >
                              Assign
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {f.matchingFabrics.length === 0 && (
                    <p className="text-xs text-stone-400 dark:text-stone-500 italic">
                      No fabrics in your stash fit this project. Check the calculated sizes above to know what to buy.
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Standalone fabric needs (not linked to projects) */}
      {standaloneFabrics.length > 0 && (
        <div>
          <h3
            className="text-xs font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wide"
            style={{ marginBottom: 12 }}
          >
            General Fabric Needs
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {standaloneFabrics.map((f, i) => (
              <div
                key={i}
                className="rounded-lg border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-900"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px' }}
              >
                <div>
                  <p className="text-sm font-medium text-stone-800 dark:text-stone-200">{f.description}</p>
                  <p className="text-xs text-stone-500 dark:text-stone-400" style={{ marginTop: 2 }}>
                    {[f.type, f.colorPreference, f.brandPreference ? `Prefer ${f.brandPreference}` : null].filter(Boolean).join(' · ')}
                  </p>
                </div>
                {f.fabricId && (
                  <button
                    onClick={() => onMarkFabricAcquired?.(f.fabricId!)}
                    className="text-xs font-medium text-stone-500 hover:text-emerald-600 dark:text-stone-400 dark:hover:text-emerald-400 transition-colors"
                  >
                    Mark acquired
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   SHOPPING LIST TAB
   ══════════════════════════════════════════════════════════ */

function ShoppingListTab({
  items,
  checkedItems,
  hasSelection,
  onToggleCheck,
  onClearCompleted,
}: {
  items: { key: string; type: string; label: string; detail: string; quantity: string; hexColor?: string }[]
  checkedItems: Set<string>
  hasSelection: boolean
  onToggleCheck: (key: string) => void
  onClearCompleted: () => void
}) {
  if (!hasSelection) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 0' }}>
        <ShoppingBag className="w-8 h-8 text-stone-300 dark:text-stone-600 mx-auto" style={{ marginBottom: 12 }} />
        <p className="text-sm text-stone-400 dark:text-stone-500">Select projects on the Projects tab to build your shopping list</p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 0' }}>
        <Check className="w-8 h-8 text-emerald-400 dark:text-emerald-500 mx-auto" style={{ marginBottom: 12 }} />
        <p className="text-sm text-stone-500 dark:text-stone-400">All supplies acquired for selected projects!</p>
      </div>
    )
  }

  const grouped: Record<string, typeof items> = {}
  items.forEach(item => {
    const group = item.type === 'thread' ? 'Threads' : item.type === 'bead' ? 'Beads' : item.type === 'specialty' ? 'Specialty Items' : 'Fabric'
    if (!grouped[group]) grouped[group] = []
    grouped[group].push(item)
  })

  const checkedCount = items.filter(i => checkedItems.has(i.key)).length

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            {items.length} item{items.length !== 1 ? 's' : ''} to buy
            {checkedCount > 0 && (
              <span className="text-emerald-600 dark:text-emerald-400"> · {checkedCount} checked off</span>
            )}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {checkedCount > 0 && (
            <button
              onClick={onClearCompleted}
              className="text-xs font-medium text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200 transition-colors"
              style={{ display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <Trash2 className="w-3 h-3" />
              Clear checked
            </button>
          )}
          <button
            onClick={() => window.print()}
            className="text-xs font-medium text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200 transition-colors"
            style={{ display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <Printer className="w-3 h-3" />
            Print
          </button>
        </div>
      </div>

      {/* Grouped list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {Object.entries(grouped).map(([groupLabel, groupItems]) => (
          <div key={groupLabel}>
            <h3
              style={{ fontFamily: "'Fraunces', serif", fontSize: 16, fontWeight: 600, marginBottom: 10 }}
              className="text-stone-800 dark:text-stone-200"
            >
              {groupLabel}
              <span className="text-stone-400 dark:text-stone-500" style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 13, fontWeight: 400, marginLeft: 8 }}>
                ({groupItems.length})
              </span>
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {groupItems.map(item => {
                const isChecked = checkedItems.has(item.key)
                return (
                  <button
                    key={item.key}
                    onClick={() => onToggleCheck(item.key)}
                    className={`text-left rounded-lg border transition-colors ${
                      isChecked
                        ? 'border-emerald-200 bg-emerald-50/40 dark:border-emerald-800/50 dark:bg-emerald-950/20'
                        : 'border-stone-200 bg-white hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-900 dark:hover:bg-stone-800/50'
                    }`}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', width: '100%' }}
                  >
                    {/* Checkbox */}
                    <span className={isChecked ? 'text-emerald-500 dark:text-emerald-400' : 'text-stone-300 dark:text-stone-600'}>
                      {isChecked ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                    </span>

                    {/* Color swatch */}
                    {item.hexColor && <ColorSwatch hex={item.hexColor} />}

                    {/* Label + detail */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span
                        className={`text-sm font-medium ${
                          isChecked
                            ? 'text-stone-400 dark:text-stone-500 line-through'
                            : 'text-stone-800 dark:text-stone-200'
                        }`}
                      >
                        {item.label}
                      </span>
                      {item.detail && (
                        <span className={`text-xs ${isChecked ? 'text-stone-300 dark:text-stone-600' : 'text-stone-400 dark:text-stone-500'}`}>
                          {' '}— {item.detail}
                        </span>
                      )}
                    </div>

                    {/* Quantity */}
                    <span
                      className={`text-xs font-medium whitespace-nowrap ${
                        isChecked
                          ? 'text-stone-300 dark:text-stone-600'
                          : 'text-stone-500 dark:text-stone-400'
                      }`}
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      {item.quantity}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

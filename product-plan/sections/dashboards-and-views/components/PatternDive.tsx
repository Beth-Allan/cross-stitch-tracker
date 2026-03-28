import { useState } from 'react'
import {
  Search,
  Layers,
  ArrowUpDown,
  ChevronDown,
  ChevronRight,
  Package,
  Scissors,
  MapPin,
  Star,
  Check,
  AlertTriangle,
  Info,
} from 'lucide-react'
import type {
  PatternDiveProps,
  WhatsNextProject,
  FabricRequirementRow,
  MatchingFabric,
  StorageGroup,
  StorageGroupItem,
} from '../types'
import type {
  GalleryCardData,
  AdvancedFilterState,
  ViewMode,
  FilterDimension,
  ActiveFilter,
  FilterConfig,
  FilterOption,
  ProjectStatus,
} from '../../gallery-cards-and-advanced-filtering/types'
import { AdvancedFilterBar, ViewToggleBar } from '@/sections/gallery-cards-and-advanced-filtering/components/AdvancedFilterBar'
import { GalleryGrid } from '@/sections/gallery-cards-and-advanced-filtering/components/GalleryGrid'

/* ── Status colour map ─────────────────────────────────── */

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

function formatNumber(n: number): string { return n.toLocaleString() }

function StatusBadge({ status }: { status: string }) {
  const s = statusBadgeStyles[status] ?? statusBadgeStyles['Unstarted']
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full text-xs font-medium px-2 py-0.5 ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {statusLabels[status] ?? status}
    </span>
  )
}

function CoverPlaceholder({ status }: { status: string }) {
  const [from, to] = statusGradients[status as ProjectStatus] ?? statusGradients['Unstarted']
  return (
    <div
      className="w-full h-full flex items-center justify-center"
      style={{ background: `linear-gradient(160deg, ${from} 0%, ${to} 100%)` }}
    >
      <Scissors className="w-5 h-5 text-stone-400/25" strokeWidth={1} />
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   TAB 1: BROWSE
   Reuses GalleryGrid + AdvancedFilterBar from Section 5
   ══════════════════════════════════════════════════════════ */

function BrowseTab({
  allCards,
  filteredCards,
  filterConfig,
  filters,
  activeFilters,
  viewMode,
  designerOptions,
  genreOptions,
  seriesOptions,
  storageLocationOptions,
  onFilterChange,
  onRemoveFilter,
  onClearAllFilters,
  onViewModeChange,
  onNavigateToProject,
}: {
  allCards: GalleryCardData[]
  filteredCards: GalleryCardData[]
  filterConfig: FilterConfig
  filters: AdvancedFilterState
  activeFilters: ActiveFilter[]
  viewMode: ViewMode
  designerOptions: FilterOption[]
  genreOptions: FilterOption[]
  seriesOptions: FilterOption[]
  storageLocationOptions: FilterOption[]
  onFilterChange?: (filters: AdvancedFilterState) => void
  onRemoveFilter?: (dimension: FilterDimension) => void
  onClearAllFilters?: () => void
  onViewModeChange?: (mode: ViewMode) => void
  onNavigateToProject?: (projectId: string) => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <AdvancedFilterBar
        config={filterConfig}
        filters={filters}
        activeFilters={activeFilters}
        designerOptions={designerOptions}
        genreOptions={genreOptions}
        seriesOptions={seriesOptions}
        storageLocationOptions={storageLocationOptions}
        onFilterChange={(f) => onFilterChange?.(f)}
        onRemoveFilter={(d) => onRemoveFilter?.(d)}
        onClearAllFilters={() => onClearAllFilters?.()}
      />
      <ViewToggleBar
        viewMode={viewMode}
        totalCount={allCards.length}
        filteredCount={filteredCards.length}
        onViewModeChange={(m) => onViewModeChange?.(m)}
      />
      <GalleryGrid
        cards={filteredCards}
        viewMode={viewMode}
        onNavigateToProject={onNavigateToProject}
        onViewModeChange={(m) => onViewModeChange?.(m)}
      />
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   TAB 2: WHAT'S NEXT
   Pre-filtered, pre-sorted gallery cards
   ══════════════════════════════════════════════════════════ */

type WhatsNextSort = 'priority' | 'oldest' | 'newest' | 'largest' | 'smallest'

function WhatsNextTab({
  projects,
  onNavigateToProject,
}: {
  projects: WhatsNextProject[]
  onNavigateToProject?: (projectId: string) => void
}) {
  const [sort, setSort] = useState<WhatsNextSort>('priority')

  const sorted = [...projects].sort((a, b) => {
    switch (sort) {
      case 'priority': {
        const ap = a.priorityRanking ?? 999
        const bp = b.priorityRanking ?? 999
        return ap - bp
      }
      case 'oldest': return a.chartId.localeCompare(b.chartId)
      case 'newest': return b.chartId.localeCompare(a.chartId)
      case 'largest': return b.stitchCount - a.stitchCount
      case 'smallest': return a.stitchCount - b.stitchCount
    }
  })

  const sortOptions: { value: WhatsNextSort; label: string }[] = [
    { value: 'priority', label: 'Priority' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'newest', label: 'Newest First' },
    { value: 'largest', label: 'Largest First' },
    { value: 'smallest', label: 'Smallest First' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Sort bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-sm text-stone-500 dark:text-stone-400" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
          {projects.length} project{projects.length !== 1 ? 's' : ''} ready or getting ready to stitch
        </p>
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-stone-400" strokeWidth={1.5} />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as WhatsNextSort)}
            className="text-sm bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-1.5 text-stone-700 dark:text-stone-300 cursor-pointer"
            style={{ fontFamily: "'Source Sans 3', sans-serif" }}
          >
            {sortOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Project cards */}
      {sorted.length === 0 ? (
        <div className="text-center py-16 text-stone-400 dark:text-stone-500" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
          No projects queued up. Flag a project as "Start Next" or start kitting to see it here.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {sorted.map((project) => (
            <div
              key={project.projectId}
              className="group flex items-center gap-4 rounded-xl border border-stone-200 dark:border-stone-700/60 bg-white dark:bg-stone-900 transition-all duration-200 hover:shadow-sm hover:border-stone-300 dark:hover:border-stone-600 cursor-pointer"
              style={{ padding: '16px 20px' }}
              onClick={() => onNavigateToProject?.(project.projectId)}
            >
              {/* Priority badge */}
              <div className="shrink-0" style={{ width: '32px', textAlign: 'center' }}>
                {project.priorityRanking != null ? (
                  <div className="inline-flex items-center gap-0.5">
                    <Star className="w-4 h-4 text-amber-500 dark:text-amber-400" fill="currentColor" strokeWidth={0} />
                    <span
                      className="text-sm font-bold text-amber-600 dark:text-amber-400 tabular-nums"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      {project.priorityRanking}
                    </span>
                  </div>
                ) : (
                  <span className="text-stone-300 dark:text-stone-600 text-lg">—</span>
                )}
              </div>

              {/* Cover thumbnail */}
              <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0">
                <CoverPlaceholder status={project.status} />
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <p
                  className="text-sm font-semibold text-stone-900 dark:text-stone-100 truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors"
                  style={{ fontFamily: "'Fraunces', serif" }}
                >
                  {project.name}
                </p>
                <p className="text-xs text-stone-500 dark:text-stone-400 truncate" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                  {project.designerName}
                </p>
                <p className="text-[11px] text-stone-400 dark:text-stone-500" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                  {formatNumber(project.stitchCount)} stitches · {project.sizeCategory}
                </p>
              </div>

              {/* Kitting progress */}
              <div className="shrink-0 max-md:hidden" style={{ width: '120px' }}>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        project.kittingPercent === 100 ? 'bg-emerald-500 dark:bg-emerald-400' : 'bg-amber-400 dark:bg-amber-500'
                      }`}
                      style={{ width: `${project.kittingPercent}%` }}
                    />
                  </div>
                  <span
                    className="text-[11px] font-medium tabular-nums text-stone-500 dark:text-stone-400"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {project.kittingPercent}%
                  </span>
                </div>
                <p className="text-[10px] text-stone-400 dark:text-stone-500 mt-0.5" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                  {project.kittingPercent === 100 ? 'Fully kitted' : 'Kitting'}
                </p>
              </div>

              {/* Status + timing */}
              <div className="shrink-0 max-sm:hidden" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                <StatusBadge status={project.status} />
                {project.preferredStartTiming && (
                  <span className="text-[11px] text-stone-400 dark:text-stone-500" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                    Start: {project.preferredStartTiming}
                  </span>
                )}
              </div>

              <ChevronRight className="w-4 h-4 text-stone-300 dark:text-stone-600 shrink-0 group-hover:text-stone-500 dark:group-hover:text-stone-400 transition-colors" strokeWidth={1.5} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   TAB 3: FABRIC REQUIREMENTS
   Project-first view: shows what fabric each project needs
   Calculates sizes with 3" margins per side (+6" total)
   ══════════════════════════════════════════════════════════ */

const MARGIN_PER_SIDE = 3 // inches
const MARGIN_TOTAL = MARGIN_PER_SIDE * 2

const fabricCounts = [14, 16, 18, 20, 22, 25, 28] as const

function calcFabricSize(stitches: number, count: number): number {
  return stitches / count + MARGIN_TOTAL
}

type FabricFilter = 'needs-fabric' | 'all'

function FabricRequirementsTab({
  requirements,
  onNavigateToProject,
  onAssignFabric,
}: {
  requirements: FabricRequirementRow[]
  onNavigateToProject?: (projectId: string) => void
  onAssignFabric?: (projectId: string, fabricId: string) => void
}) {
  const [filter, setFilter] = useState<FabricFilter>('needs-fabric')
  const [expandedProject, setExpandedProject] = useState<string | null>(null)
  const [showSizeRef, setShowSizeRef] = useState<Set<string>>(new Set())

  const filtered = filter === 'needs-fabric'
    ? requirements.filter((r) => !r.assignedFabricId)
    : requirements

  function toggleSizeRef(projectId: string) {
    setShowSizeRef((prev) => {
      const next = new Set(prev)
      next.has(projectId) ? next.delete(projectId) : next.add(projectId)
      return next
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Info banner */}
      <div
        className="flex items-start gap-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40"
        style={{ padding: '14px 18px' }}
      >
        <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" strokeWidth={2} />
        <div>
          <p className="text-sm text-emerald-800 dark:text-emerald-300" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
            All sizes include <strong>3" margins</strong> on each side for framing allowance.
          </p>
          <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-1" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
            Formula: (stitch count ÷ fabric count) + 6" per dimension
          </p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          {(['needs-fabric', 'all'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-sm px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                filter === f
                  ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                  : 'text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
              style={{ fontFamily: "'Source Sans 3', sans-serif" }}
            >
              {f === 'needs-fabric' ? 'Needs Fabric' : 'All Projects'}
            </button>
          ))}
        </div>
        <p className="text-sm text-stone-400 dark:text-stone-500" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
          {filtered.length} project{filtered.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Project cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-stone-400 dark:text-stone-500" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
          All projects have fabric assigned. Nice work!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map((req) => {
            const isExpanded = expandedProject === req.projectId
            const hasFabric = !!req.assignedFabricId
            const sizeRefOpen = showSizeRef.has(req.projectId)

            return (
              <div
                key={req.projectId}
                className="rounded-xl border border-stone-200 dark:border-stone-700/60 bg-white dark:bg-stone-900 overflow-hidden"
              >
                {/* Header row — always visible */}
                <button
                  onClick={() => setExpandedProject(isExpanded ? null : req.projectId)}
                  className="w-full flex items-center gap-4 transition-colors hover:bg-stone-50 dark:hover:bg-stone-800/50 cursor-pointer"
                  style={{ padding: '16px 20px' }}
                >
                  {/* Fabric status icon */}
                  <div className="shrink-0">
                    {hasFabric ? (
                      req.assignedFabricFits ? (
                        <Check className="w-5 h-5 text-emerald-500 dark:text-emerald-400" strokeWidth={2} />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-amber-500 dark:text-amber-400" strokeWidth={2} />
                      )
                    ) : (
                      <Package className="w-5 h-5 text-stone-400 dark:text-stone-500" strokeWidth={1.5} />
                    )}
                  </div>

                  {/* Project info */}
                  <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                    <p
                      className="text-sm font-semibold text-stone-900 dark:text-stone-100 truncate"
                      style={{ fontFamily: "'Fraunces', serif" }}
                    >
                      {req.projectName}
                    </p>
                    <p className="text-xs text-stone-500 dark:text-stone-400" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                      {req.stitchesWide} × {req.stitchesHigh} stitches
                    </p>
                  </div>

                  {/* Quick size preview at popular counts */}
                  <div className="shrink-0 max-md:hidden" style={{ display: 'flex', gap: '16px' }}>
                    {([14, 18, 25] as const).map((ct) => {
                      const w = calcFabricSize(req.stitchesWide, ct)
                      const h = calcFabricSize(req.stitchesHigh, ct)
                      return (
                        <div key={ct} style={{ textAlign: 'center', minWidth: '70px' }}>
                          <span className="text-[10px] uppercase tracking-wider text-stone-400 dark:text-stone-500 font-semibold" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                            {ct}ct
                          </span>
                          <p className="text-xs text-stone-600 dark:text-stone-300 tabular-nums" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                            {w.toFixed(1)}" × {h.toFixed(1)}"
                          </p>
                        </div>
                      )
                    })}
                  </div>

                  {/* Fabric assignment status */}
                  <div className="shrink-0 max-sm:hidden">
                    {hasFabric ? (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        req.assignedFabricFits
                          ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
                          : 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400'
                      }`} style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                        {req.assignedFabricFits ? 'Fabric fits' : 'Fabric too small'}
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                        Needs fabric
                      </span>
                    )}
                  </div>

                  <ChevronDown className={`w-4 h-4 text-stone-400 dark:text-stone-500 shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} strokeWidth={1.5} />
                </button>

                {/* Expanded content */}
                {isExpanded && (
                  <div
                    className="border-t border-stone-100 dark:border-stone-800"
                    style={{ padding: '20px' }}
                  >
                    {/* ── Fabrics That Fit ── */}
                    {req.matchingFabrics.length > 0 ? (
                      <div>
                        <h4
                          className="text-xs uppercase tracking-wider text-stone-400 dark:text-stone-500 font-semibold"
                          style={{ fontFamily: "'Source Sans 3', sans-serif", marginBottom: '12px' }}
                        >
                          Fabrics That Fit
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {req.matchingFabrics.map((fabric) => {
                            const neededW = calcFabricSize(req.stitchesWide, fabric.count)
                            const neededH = calcFabricSize(req.stitchesHigh, fabric.count)
                            const fits = fabric.widthInches >= neededW && fabric.heightInches >= neededH
                            const isAssigned = fabric.fabricId === req.assignedFabricId

                            return (
                              <div
                                key={fabric.fabricId}
                                className={`flex items-center gap-3 rounded-lg border transition-colors ${
                                  isAssigned
                                    ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/20'
                                    : 'border-stone-150 dark:border-stone-700/40 bg-stone-50/50 dark:bg-stone-800/30'
                                }`}
                                style={{ padding: '12px 16px' }}
                              >
                                {/* Fit indicator */}
                                {fits ? (
                                  <Check className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" strokeWidth={2} />
                                ) : (
                                  <AlertTriangle className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0" strokeWidth={2} />
                                )}

                                {/* Fabric details */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <p className="text-sm font-medium text-stone-800 dark:text-stone-200 truncate" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                                    {fabric.fabricName}
                                  </p>
                                  <p className="text-xs text-stone-500 dark:text-stone-400" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                                    {fabric.brandName} · {fabric.count}ct · {fabric.colour} · {fabric.widthInches}" × {fabric.heightInches}"
                                  </p>
                                </div>

                                {/* Assign / Assigned */}
                                {isAssigned ? (
                                  <span className="text-xs font-medium px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 shrink-0" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                                    Assigned
                                  </span>
                                ) : (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); onAssignFabric?.(req.projectId, fabric.fabricId) }}
                                    className="text-xs font-medium px-3 py-1 rounded-full border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors cursor-pointer shrink-0"
                                    style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                                  >
                                    Assign
                                  </button>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ) : (
                      <div
                        className="flex items-center gap-2 rounded-lg bg-stone-50 dark:bg-stone-800/40 text-stone-500 dark:text-stone-400"
                        style={{ padding: '12px 16px', fontFamily: "'Source Sans 3', sans-serif" }}
                      >
                        <Package className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                        <span className="text-sm">No fabrics in your stash fit this project. Check the size reference below to know what to buy.</span>
                      </div>
                    )}

                    {/* ── Size Reference (collapsible) ── */}
                    <div style={{ marginTop: '16px' }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleSizeRef(req.projectId) }}
                        className="flex items-center gap-2 text-xs text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 transition-colors cursor-pointer"
                        style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                      >
                        <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${sizeRefOpen ? 'rotate-90' : ''}`} strokeWidth={1.5} />
                        <span className="uppercase tracking-wider font-semibold">Size Reference — All Counts</span>
                      </button>

                      {sizeRefOpen && (
                        <div style={{ marginTop: '12px', overflowX: 'auto' }}>
                          <table className="w-full text-sm" style={{ fontFamily: "'Source Sans 3', sans-serif", minWidth: '500px' }}>
                            <thead>
                              <tr className="border-b border-stone-100 dark:border-stone-800">
                                <th className="text-left text-[11px] uppercase tracking-wider text-stone-400 dark:text-stone-500 font-semibold pb-2">Count</th>
                                <th className="text-right text-[11px] uppercase tracking-wider text-stone-400 dark:text-stone-500 font-semibold pb-2">Design Size</th>
                                <th className="text-right text-[11px] uppercase tracking-wider text-stone-400 dark:text-stone-500 font-semibold pb-2">With Margins</th>
                              </tr>
                            </thead>
                            <tbody>
                              {fabricCounts.map((ct) => {
                                const designW = (req.stitchesWide / ct)
                                const designH = (req.stitchesHigh / ct)
                                const totalW = designW + MARGIN_TOTAL
                                const totalH = designH + MARGIN_TOTAL
                                return (
                                  <tr key={ct} className="border-b border-stone-50 dark:border-stone-800/50 last:border-0">
                                    <td className="py-2 text-stone-700 dark:text-stone-300 font-medium" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                                      {ct} count
                                    </td>
                                    <td className="py-2 text-right text-stone-500 dark:text-stone-400 tabular-nums" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                                      {designW.toFixed(1)}" × {designH.toFixed(1)}"
                                    </td>
                                    <td className="py-2 text-right font-medium tabular-nums" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                                      <span className="text-emerald-700 dark:text-emerald-400">
                                        {totalW.toFixed(1)}" × {totalH.toFixed(1)}"
                                      </span>
                                    </td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    {/* Link to project */}
                    <button
                      onClick={() => onNavigateToProject?.(req.projectId)}
                      className="mt-4 text-sm text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 underline underline-offset-2 decoration-emerald-300 dark:decoration-emerald-700 transition-colors cursor-pointer"
                      style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                    >
                      View project details →
                    </button>
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
   TAB 4: STORAGE VIEW
   Collapsible groups by storage location
   ══════════════════════════════════════════════════════════ */

function StorageViewTab({
  storageGroups,
  onNavigateToProject,
  onNavigateToFabric,
}: {
  storageGroups: StorageGroup[]
  onNavigateToProject?: (projectId: string) => void
  onNavigateToFabric?: (fabricId: string) => void
}) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())

  function toggleGroup(locationId: string) {
    setCollapsed((prev) => {
      const next = new Set(prev)
      next.has(locationId) ? next.delete(locationId) : next.add(locationId)
      return next
    })
  }

  const totalItems = storageGroups.reduce((sum, g) => sum + g.items.length, 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <p className="text-sm text-stone-500 dark:text-stone-400" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
        {storageGroups.length} location{storageGroups.length !== 1 ? 's' : ''} · {totalItems} item{totalItems !== 1 ? 's' : ''}
      </p>

      {storageGroups.map((group) => {
        const isCollapsed = collapsed.has(group.locationId)
        const projectCount = group.items.filter((i) => i.type === 'project').length
        const fabricCount = group.items.filter((i) => i.type === 'fabric').length

        return (
          <div
            key={group.locationId}
            className="rounded-xl border border-stone-200 dark:border-stone-700/60 overflow-hidden"
          >
            {/* Group header */}
            <button
              onClick={() => toggleGroup(group.locationId)}
              className="w-full flex items-center gap-3 bg-stone-50 dark:bg-stone-800/50 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              style={{ padding: '14px 20px' }}
            >
              <MapPin className="w-4 h-4 text-stone-400 dark:text-stone-500 shrink-0" strokeWidth={1.5} />
              <span
                className="text-sm font-bold text-stone-900 dark:text-stone-100"
                style={{ fontFamily: "'Fraunces', serif", flex: 1, textAlign: 'left' }}
              >
                {group.locationName}
              </span>
              <div className="flex items-center gap-3 shrink-0">
                {projectCount > 0 && (
                  <span className="text-[11px] text-stone-400 dark:text-stone-500" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                    {projectCount} project{projectCount !== 1 ? 's' : ''}
                  </span>
                )}
                {fabricCount > 0 && (
                  <span className="text-[11px] text-stone-400 dark:text-stone-500" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                    {fabricCount} fabric{fabricCount !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <ChevronDown className={`w-4 h-4 text-stone-400 shrink-0 transition-transform duration-200 ${isCollapsed ? '-rotate-90' : ''}`} strokeWidth={1.5} />
            </button>

            {/* Items */}
            {!isCollapsed && (
              <div className="bg-white dark:bg-stone-900">
                {group.items.map((item) => (
                  <StorageItem
                    key={`${item.type}-${item.id}`}
                    item={item}
                    onNavigateToProject={onNavigateToProject}
                    onNavigateToFabric={onNavigateToFabric}
                  />
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function StorageThumbnail({ item }: { item: StorageGroupItem }) {
  const [imgFailed, setImgFailed] = useState(false)
  const isProject = item.type === 'project'

  if (isProject && item.coverImageUrl && !imgFailed) {
    return (
      <div className="w-9 h-9 rounded-md overflow-hidden shrink-0">
        <img
          src={item.coverImageUrl}
          alt={item.name}
          className="w-full h-full object-cover"
          onError={() => setImgFailed(true)}
        />
      </div>
    )
  }

  if (isProject) {
    return (
      <div className="w-9 h-9 rounded-md overflow-hidden shrink-0">
        <CoverPlaceholder status={item.status ?? 'Unstarted'} />
      </div>
    )
  }

  return (
    <div className="w-9 h-9 rounded-md overflow-hidden shrink-0 flex items-center justify-center bg-stone-100 dark:bg-stone-800">
      <Layers className="w-4 h-4 text-stone-400 dark:text-stone-500" strokeWidth={1.5} />
    </div>
  )
}

function StorageItem({
  item,
  onNavigateToProject,
  onNavigateToFabric,
}: {
  item: StorageGroupItem
  onNavigateToProject?: (projectId: string) => void
  onNavigateToFabric?: (fabricId: string) => void
}) {
  const isProject = item.type === 'project'

  return (
    <div
      className="flex items-center gap-3 border-t border-stone-100 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/30 transition-colors"
      style={{ padding: '12px 20px', paddingLeft: '44px' }}
    >
      <StorageThumbnail item={item} />

      {/* Name */}
      <button
        onClick={() => isProject ? onNavigateToProject?.(item.id) : onNavigateToFabric?.(item.id)}
        className="text-sm text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 underline underline-offset-2 decoration-emerald-300 dark:decoration-emerald-700 transition-colors cursor-pointer truncate text-left"
        style={{ fontFamily: "'Source Sans 3', sans-serif", flex: 1, minWidth: 0 }}
      >
        {item.name}
      </button>

      {/* Status / extra info */}
      {isProject && item.status && (
        <StatusBadge status={item.status} />
      )}
      {isProject && item.fabricName && (
        <span className="text-[11px] text-stone-400 dark:text-stone-500 shrink-0 max-md:hidden" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
          on {item.fabricName}
        </span>
      )}
      {!isProject && (
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-500 shrink-0" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
          Fabric
        </span>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   MAIN PATTERN DIVE COMPONENT
   ══════════════════════════════════════════════════════════ */

type PatternDiveTab = 'browse' | 'whats-next' | 'fabric' | 'storage'

const tabs: { id: PatternDiveTab; label: string; icon: typeof Search }[] = [
  { id: 'browse', label: 'Browse', icon: Search },
  { id: 'whats-next', label: "What's Next", icon: Star },
  { id: 'fabric', label: 'Fabric Requirements', icon: Layers },
  { id: 'storage', label: 'Storage View', icon: MapPin },
]

export function PatternDive({
  allCards,
  filterConfig,
  filters,
  activeFilters,
  viewMode,
  designerOptions,
  genreOptions,
  seriesOptions,
  storageLocationOptions,
  whatsNextProjects,
  fabricRequirements,
  storageGroups,
  onNavigateToProject,
  onFilterChange,
  onRemoveFilter,
  onClearAllFilters,
  onViewModeChange,
  onNavigateToFabric,
  onAssignFabric,
}: PatternDiveProps) {
  const [activeTab, setActiveTab] = useState<PatternDiveTab>('browse')

  // Simple client-side filtering for the Browse tab
  const filteredCards = allCards // In the real app, filtering would be applied here

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: '0px' }}>
      {/* Page header */}
      <div style={{ marginBottom: '24px' }}>
        <h1
          className="text-2xl font-bold text-stone-900 dark:text-stone-100"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          Pattern Dive
        </h1>
        <p className="text-sm text-stone-500 dark:text-stone-400 mt-1" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
          Explore your collection, plan what's next, and find the right fabric
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-8 border-b border-stone-200 dark:border-stone-800">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap cursor-pointer ${
              activeTab === id
                ? 'border-emerald-500 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300 hover:border-stone-300 dark:hover:border-stone-600'
            }`}
            style={{ fontFamily: "'Source Sans 3', sans-serif" }}
          >
            <Icon className="w-4 h-4" strokeWidth={1.5} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'browse' && (
        <BrowseTab
          allCards={allCards}
          filteredCards={filteredCards}
          filterConfig={filterConfig}
          filters={filters}
          activeFilters={activeFilters}
          viewMode={viewMode}
          designerOptions={designerOptions}
          genreOptions={genreOptions}
          seriesOptions={seriesOptions}
          storageLocationOptions={storageLocationOptions}
          onFilterChange={onFilterChange}
          onRemoveFilter={onRemoveFilter}
          onClearAllFilters={onClearAllFilters}
          onViewModeChange={onViewModeChange}
          onNavigateToProject={onNavigateToProject}
        />
      )}

      {activeTab === 'whats-next' && (
        <WhatsNextTab
          projects={whatsNextProjects}
          onNavigateToProject={onNavigateToProject}
        />
      )}

      {activeTab === 'fabric' && (
        <FabricRequirementsTab
          requirements={fabricRequirements}
          onNavigateToProject={onNavigateToProject}
          onAssignFabric={onAssignFabric}
        />
      )}

      {activeTab === 'storage' && (
        <StorageViewTab
          storageGroups={storageGroups}
          onNavigateToProject={onNavigateToProject}
          onNavigateToFabric={onNavigateToFabric}
        />
      )}
    </div>
  )
}

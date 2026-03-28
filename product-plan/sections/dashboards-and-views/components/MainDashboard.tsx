import { useState, useRef } from 'react'
import {
  Scissors,
  Clock,
  Calendar,
  Plus,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Sparkles,
  Target,
  CalendarClock,
  BarChart3,
  Trophy,
  Pause,
  Package,
  Hash,
  Gem,
  Star,
  Palette,
  PenTool,
  BookOpen,
  ChevronDown,
} from 'lucide-react'
import type {
  MainDashboardProps,
  RecentChart,
  BuriedTreasure,
  SpotlightProject,
  CollectionStats,
  GoalsSummary,
  QuickAddAction,
} from '../types'
import type {
  GalleryCardData,
  WIPCardData,
  ProjectStatus,
} from '../../gallery-cards-and-advanced-filtering/types'
import { GalleryCard } from '@/sections/gallery-cards-and-advanced-filtering/components/GalleryCard'

/* ── Status colour map (consistent with gallery cards) ──── */

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

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function daysAgo(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24))
}

function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
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

function CoverPlaceholder({ status, size = 'md' }: { status: string; size?: 'sm' | 'md' | 'lg' }) {
  const [from, to] = statusGradients[status as ProjectStatus] ?? statusGradients['Unstarted']
  const iconSize = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-16 h-16' : 'w-6 h-6'
  return (
    <div
      className="w-full h-full flex items-center justify-center"
      style={{ background: `linear-gradient(160deg, ${from} 0%, ${to} 100%)` }}
    >
      <Scissors className={`${iconSize} text-stone-400/25`} strokeWidth={1} />
    </div>
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <h2
        className="text-xl font-bold text-stone-900 dark:text-stone-100"
        style={{ fontFamily: "'Fraunces', serif" }}
      >
        {children}
      </h2>
      <div className="w-10 h-0.5 bg-emerald-400 dark:bg-emerald-500 rounded-full" />
    </div>
  )
}

/* ── Scrollable Row with Arrow Buttons ─────────────────── */

function ScrollableRow({ children }: { children: React.ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  function updateScrollState() {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4)
  }

  function scroll(direction: 'left' | 'right') {
    const el = scrollRef.current
    if (!el) return
    const amount = direction === 'left' ? -300 : 300
    el.scrollBy({ left: amount, behavior: 'smooth' })
    setTimeout(updateScrollState, 350)
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Left arrow */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-md flex items-center justify-center hover:bg-stone-50 dark:hover:bg-stone-750 transition-colors cursor-pointer"
          style={{ marginLeft: '-12px' }}
        >
          <ChevronLeft className="w-5 h-5 text-stone-600 dark:text-stone-400" strokeWidth={2} />
        </button>
      )}

      {/* Scrollable content */}
      <div
        ref={scrollRef}
        onScroll={updateScrollState}
        style={{ display: 'flex', gap: '16px', overflowX: 'auto', scrollSnapType: 'x mandatory', scrollbarWidth: 'none', msOverflowStyle: 'none', paddingBottom: '4px' }}
      >
        <style>{`.scroll-hide::-webkit-scrollbar { display: none; }`}</style>
        <div className="scroll-hide" style={{ display: 'contents' }}>
          {children}
        </div>
      </div>

      {/* Right arrow */}
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-md flex items-center justify-center hover:bg-stone-50 dark:hover:bg-stone-750 transition-colors cursor-pointer"
          style={{ marginRight: '-12px' }}
        >
          <ChevronRight className="w-5 h-5 text-stone-600 dark:text-stone-400" strokeWidth={2} />
        </button>
      )}
    </div>
  )
}

/* ── Quick Add Menu ────────────────────────────────────── */

const quickAddItems: { action: QuickAddAction; label: string; icon: typeof Plus }[] = [
  { action: 'logStitches', label: 'Log Stitches', icon: Clock },
  { action: 'chart', label: 'Add Chart', icon: BookOpen },
  { action: 'fabric', label: 'Add Fabric', icon: Package },
  { action: 'floss', label: 'Add Floss', icon: Palette },
  { action: 'beads', label: 'Add Beads', icon: Gem },
  { action: 'specialty', label: 'Add Specialty', icon: Star },
  { action: 'fabricBrand', label: 'Add Fabric Brand', icon: Hash },
  { action: 'designer', label: 'Add Designer', icon: PenTool },
]

function QuickAddMenu({ onQuickAdd }: { onQuickAdd?: (action: QuickAddAction) => void }) {
  const [open, setOpen] = useState(false)

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200 cursor-pointer ${
          open
            ? 'bg-emerald-600 border-emerald-600 text-white dark:bg-emerald-500 dark:border-emerald-500'
            : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-950/50'
        }`}
        style={{ fontFamily: "'Source Sans 3', sans-serif" }}
      >
        <Plus className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-45' : ''}`} strokeWidth={2.5} />
        Quick Add
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} strokeWidth={2} />
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-20"
            onClick={() => setOpen(false)}
          />
          {/* Dropdown */}
          <div
            className="absolute left-0 top-full mt-2 z-30 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl shadow-xl overflow-hidden"
            style={{ minWidth: '200px' }}
          >
            {quickAddItems.map((item, i) => (
              <button
                key={item.action}
                onClick={() => { onQuickAdd?.(item.action); setOpen(false) }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors cursor-pointer ${
                  i === 0 ? 'border-b border-stone-100 dark:border-stone-800' : ''
                }`}
                style={{ fontFamily: "'Source Sans 3', sans-serif" }}
              >
                <item.icon className={`w-4 h-4 ${i === 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-stone-400 dark:text-stone-500'}`} strokeWidth={1.5} />
                {item.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

/* ── Collection Stats Sidebar ──────────────────────────── */

function CollectionStatsSidebar({
  stats,
  onNavigateToProject,
}: {
  stats: CollectionStats
  onNavigateToProject?: (projectId: string) => void
}) {
  const [expanded, setExpanded] = useState(false)

  const statRows: { label: string; value: string | number; icon: typeof BarChart3; color: string }[] = [
    { label: 'Total Projects', value: stats.totalProjects, icon: BarChart3, color: 'text-stone-600 dark:text-stone-400' },
    { label: 'Currently Stitching', value: stats.totalWIP, icon: Target, color: 'text-sky-600 dark:text-sky-400' },
    { label: 'On Hold', value: stats.totalOnHold, icon: Pause, color: 'text-orange-600 dark:text-orange-400' },
    { label: 'Unstarted', value: stats.totalUnstarted, icon: Package, color: 'text-stone-500 dark:text-stone-400' },
    { label: 'Finished', value: stats.totalFinished, icon: Trophy, color: 'text-violet-600 dark:text-violet-400' },
  ]

  return (
    <div
      className="rounded-xl border border-stone-200 dark:border-stone-700/60 bg-white dark:bg-stone-900"
      style={{ padding: '20px' }}
    >
      {/* Mobile: collapsible header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between md:hidden cursor-pointer"
      >
        <h3
          className="text-sm font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider"
          style={{ fontFamily: "'Source Sans 3', sans-serif" }}
        >
          Collection Stats
        </h3>
        <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {/* Desktop: always-visible heading */}
      <h3
        className="text-sm font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider max-md:hidden"
        style={{ fontFamily: "'Source Sans 3', sans-serif", marginBottom: '16px' }}
      >
        Collection Stats
      </h3>

      {/* Stats content — hidden on mobile unless expanded */}
      <div className={`max-md:${expanded ? '' : 'hidden'}`} style={!expanded ? { display: undefined } : undefined}>
        {/* On mobile, override display via inline style */}
        <div
          className="max-md:hidden"
          id="stats-desktop"
          style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
        >
          {statRows.map((row) => (
            <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <row.icon className={`w-4 h-4 ${row.color} shrink-0`} strokeWidth={1.5} />
              <span className="text-sm text-stone-600 dark:text-stone-400" style={{ fontFamily: "'Source Sans 3', sans-serif", flex: 1 }}>
                {row.label}
              </span>
              <span
                className="text-sm font-bold text-stone-900 dark:text-stone-100 tabular-nums"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {row.value}
              </span>
            </div>
          ))}

          {/* Divider */}
          <div className="h-px bg-stone-100 dark:bg-stone-800" style={{ margin: '4px 0' }} />

          {/* Total stitches */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span className="text-[11px] uppercase tracking-wider text-stone-400 dark:text-stone-500" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
              Total Stitches
            </span>
            <span
              className="text-lg font-bold text-emerald-600 dark:text-emerald-400 tabular-nums"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {formatNumber(stats.totalStitchesCompleted)}
            </span>
          </div>

          {/* Most recent finish */}
          {stats.mostRecentFinish && (
            <>
              <div className="h-px bg-stone-100 dark:bg-stone-800" style={{ margin: '4px 0' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span className="text-[11px] uppercase tracking-wider text-stone-400 dark:text-stone-500" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                  Most Recent Finish
                </span>
                <button
                  onClick={() => onNavigateToProject?.(stats.mostRecentFinish!.projectId)}
                  className="text-sm text-left text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 underline underline-offset-2 decoration-emerald-300 dark:decoration-emerald-700 transition-colors cursor-pointer truncate"
                  style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                >
                  {stats.mostRecentFinish.name}
                </button>
                <span className="text-[11px] text-stone-400 dark:text-stone-500" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                  Finished {formatDate(stats.mostRecentFinish.finishDate)} ({daysAgo(stats.mostRecentFinish.finishDate)}d ago)
                </span>
              </div>
            </>
          )}

          {/* Largest project */}
          {stats.largestProject && (
            <>
              <div className="h-px bg-stone-100 dark:bg-stone-800" style={{ margin: '4px 0' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span className="text-[11px] uppercase tracking-wider text-stone-400 dark:text-stone-500" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                  Largest Project
                </span>
                <button
                  onClick={() => onNavigateToProject?.(stats.largestProject!.projectId)}
                  className="text-sm text-left text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 underline underline-offset-2 decoration-emerald-300 dark:decoration-emerald-700 transition-colors cursor-pointer truncate"
                  style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                >
                  {stats.largestProject.name}
                </button>
                <span className="text-[11px] text-stone-400 dark:text-stone-500" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                  {formatNumber(stats.largestProject.stitchCount)} stitches
                </span>
              </div>
            </>
          )}
        </div>

        {/* Mobile: horizontal compact stat chips */}
        {expanded && (
          <div className="md:hidden" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
            {statRows.map((row) => (
              <div
                key={row.label}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-50 dark:bg-stone-800 text-sm"
                style={{ fontFamily: "'Source Sans 3', sans-serif" }}
              >
                <row.icon className={`w-3.5 h-3.5 ${row.color}`} strokeWidth={1.5} />
                <span className="text-stone-500 dark:text-stone-400">{row.label}:</span>
                <span className="font-bold text-stone-900 dark:text-stone-100 tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {row.value}
                </span>
              </div>
            ))}
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-sm"
              style={{ fontFamily: "'Source Sans 3', sans-serif" }}
            >
              <span className="text-emerald-600 dark:text-emerald-400">Stitches:</span>
              <span className="font-bold text-emerald-700 dark:text-emerald-300 tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {formatNumber(stats.totalStitchesCompleted)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Currently Stitching Card ──────────────────────────── */

function CurrentlyStitchingCard({
  card,
  onNavigateToProject,
}: {
  card: GalleryCardData
  onNavigateToProject?: (projectId: string) => void
}) {
  const wip = card as WIPCardData
  const tracksTime = wip.totalTimeMinutes > 0

  return (
    <div
      className="group rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700/60 transition-all duration-200 hover:shadow-md hover:shadow-stone-900/8 dark:hover:shadow-black/30 hover:-translate-y-0.5 cursor-pointer"
      style={{ minWidth: '280px', maxWidth: '280px', scrollSnapAlign: 'start', flex: '0 0 auto' }}
      onClick={() => onNavigateToProject?.(card.projectId)}
    >
      {/* Cover — always use placeholder */}
      <div style={{ height: '160px', position: 'relative', overflow: 'hidden' }}>
        <CoverPlaceholder status={card.status} />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/30 to-transparent" />

        {/* Progress overlay at bottom */}
        <div className="absolute bottom-3 left-3 right-3">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-white/30 rounded-full overflow-hidden backdrop-blur-sm">
              <div
                className="h-full bg-emerald-400 rounded-full"
                style={{ width: `${wip.progressPercent}%` }}
              />
            </div>
            <span
              className="text-xs font-bold text-white tabular-nums drop-shadow-sm"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {wip.progressPercent}%
            </span>
          </div>
        </div>
      </div>

      {/* Card body */}
      <div className="bg-white dark:bg-stone-900" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <p
          className="text-sm font-semibold text-stone-900 dark:text-stone-100 line-clamp-1 leading-snug group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          {card.projectName}
        </p>
        <p className="text-xs text-stone-500 dark:text-stone-400" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
          {card.designerName}
        </p>
        <p className="text-[11px] text-stone-500 dark:text-stone-400" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
          {formatNumber(wip.stitchesCompleted)} / {formatNumber(card.stitchCount)} stitches
        </p>
        <div
          className="flex items-center gap-3 text-[11px] text-stone-400 dark:text-stone-500 flex-wrap"
          style={{ fontFamily: "'Source Sans 3', sans-serif" }}
        >
          <span className="inline-flex items-center gap-1">
            <Clock className="w-3 h-3" strokeWidth={1.5} />
            {tracksTime ? formatTime(wip.totalTimeMinutes) : `${wip.stitchingDays} stitching days`}
          </span>
          {wip.lastSessionDate && (
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3 h-3" strokeWidth={1.5} />
              Last stitched {daysAgo(wip.lastSessionDate)}d ago
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Recently Added Card ───────────────────────────────── */

function RecentlyAddedCard({
  chart,
  onNavigateToProject,
}: {
  chart: RecentChart
  onNavigateToProject?: (projectId: string) => void
}) {
  return (
    <div
      className="group rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700/60 transition-all duration-200 hover:shadow-md hover:shadow-stone-900/8 dark:hover:shadow-black/30 hover:-translate-y-0.5 cursor-pointer"
      style={{ minWidth: '200px', maxWidth: '200px', scrollSnapAlign: 'start', flex: '0 0 auto' }}
      onClick={() => onNavigateToProject?.(chart.projectId)}
    >
      <div style={{ height: '140px', position: 'relative', overflow: 'hidden' }}>
        <CoverPlaceholder status={chart.status} />
        <div className="absolute top-2 left-2">
          <StatusBadge status={chart.status} />
        </div>
      </div>
      <div className="bg-white dark:bg-stone-900" style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <p
          className="text-sm font-semibold text-stone-900 dark:text-stone-100 line-clamp-2 leading-snug group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          {chart.name}
        </p>
        <p className="text-xs text-stone-500 dark:text-stone-400 truncate" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
          {chart.designerName}
        </p>
        <p className="text-[11px] text-stone-400 dark:text-stone-500" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
          {formatNumber(chart.stitchCount)} stitches · {chart.sizeCategory}
        </p>
        <p className="text-[10px] text-stone-400 dark:text-stone-500" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
          Added {formatDate(chart.dateAdded)} ({daysAgo(chart.dateAdded)}d ago)
        </p>
      </div>
    </div>
  )
}

/* ── Buried Treasures Section ──────────────────────────── */

function BuriedTreasuresSection({
  treasures,
  onNavigateToProject,
}: {
  treasures: BuriedTreasure[]
  onNavigateToProject?: (projectId: string) => void
}) {
  if (treasures.length === 0) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {treasures.map((t, i) => (
        <div
          key={t.chartId}
          className="group flex items-center gap-4 rounded-xl border border-stone-200 dark:border-stone-700/60 bg-white dark:bg-stone-900 transition-all duration-200 hover:shadow-sm hover:border-stone-300 dark:hover:border-stone-600 cursor-pointer"
          style={{ padding: '14px 16px' }}
          onClick={() => onNavigateToProject?.(t.projectId)}
        >
          <div
            className="text-stone-300 dark:text-stone-600 font-bold tabular-nums shrink-0"
            style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '20px', width: '28px', textAlign: 'center' }}
          >
            {i + 1}
          </div>
          <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
            <CoverPlaceholder status="Unstarted" size="sm" />
          </div>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <p
              className="text-sm font-semibold text-stone-900 dark:text-stone-100 truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              {t.name}
            </p>
            <p className="text-xs text-stone-500 dark:text-stone-400 truncate" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
              {t.designerName}
            </p>
          </div>
          <div className="shrink-0 text-right max-md:hidden" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
            <span
              className="text-sm font-bold text-stone-500 dark:text-stone-400 tabular-nums"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {formatNumber(t.daysInLibrary)}
            </span>
            <span className="text-[10px] text-stone-400 dark:text-stone-500" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
              days in library
            </span>
          </div>
          <div className="shrink-0 max-lg:hidden" style={{ display: 'flex', gap: '4px' }}>
            {t.genres.slice(0, 2).map((g) => (
              <span key={g} className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400">
                {g}
              </span>
            ))}
          </div>
          <span className="shrink-0 text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 max-md:hidden">
            {t.sizeCategory}
          </span>
          <ChevronRight className="w-4 h-4 text-stone-300 dark:text-stone-600 shrink-0 group-hover:text-stone-500 dark:group-hover:text-stone-400 transition-colors" strokeWidth={1.5} />
        </div>
      ))}
    </div>
  )
}

/* ── Rediscover This One (Spotlight) ───────────────────── */

function SpotlightCard({
  project,
  onViewSpotlight,
  onRefreshSpotlight,
}: {
  project: SpotlightProject
  onViewSpotlight?: (projectId: string) => void
  onRefreshSpotlight?: () => void
}) {
  const isInProgress = project.status === 'In Progress' || project.status === 'On Hold'

  return (
    <div
      className="relative rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-700/60 bg-white dark:bg-stone-900"
      style={{ boxShadow: '0 0 0 1px rgb(214 211 209 / 0.3), 0 4px 24px rgb(0 0 0 / 0.04)' }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '260px' }}>
        {/* Image half — always placeholder */}
        <div className="relative overflow-hidden max-md:hidden">
          <CoverPlaceholder status={project.status} size="lg" />
        </div>

        {/* Content half */}
        <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'center' }}>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400" strokeWidth={2} />
            <span className="text-xs font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-400" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
              Rediscover This One
            </span>
          </div>

          <h3
            className="text-2xl font-bold text-stone-900 dark:text-stone-100 leading-tight"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            {project.name}
          </h3>

          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm text-stone-500 dark:text-stone-400" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
              {project.designerName}
            </span>
            <StatusBadge status={project.status} />
          </div>

          <div className="flex items-center gap-4 text-sm text-stone-500 dark:text-stone-400 flex-wrap" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
            <span>{formatNumber(project.stitchCount)} stitches</span>
            <span className="text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400">
              {project.sizeCategory}
            </span>
          </div>

          {project.genres.length > 0 && (
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {project.genres.slice(0, 4).map((g) => (
                <span key={g} className="text-[11px] px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
                  {g}
                </span>
              ))}
            </div>
          )}

          {isInProgress && project.progressPercent != null && (
            <div className="flex items-center gap-2.5">
              <div className="flex-1 h-2 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 dark:bg-emerald-400 rounded-full"
                  style={{ width: `${project.progressPercent}%` }}
                />
              </div>
              <span
                className="text-sm font-medium text-emerald-600 dark:text-emerald-400 tabular-nums"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {project.progressPercent}%
              </span>
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', marginTop: '4px', flexWrap: 'wrap' }}>
            <button
              onClick={() => onViewSpotlight?.(project.projectId)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white text-sm font-semibold transition-colors cursor-pointer"
              style={{ fontFamily: "'Source Sans 3', sans-serif" }}
            >
              Check It Out
              <ArrowRight className="w-4 h-4" strokeWidth={2} />
            </button>
            <button
              onClick={() => onRefreshSpotlight?.()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-750 text-stone-600 dark:text-stone-400 text-sm font-medium transition-colors cursor-pointer"
              style={{ fontFamily: "'Source Sans 3', sans-serif" }}
              title="Show a different project"
            >
              <RefreshCw className="w-4 h-4" strokeWidth={2} />
              Shuffle
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Goals Teaser ──────────────────────────────────────── */

function GoalsTeaser({
  goalsSummary,
  onNavigateToProject,
  onNavigateToGoals,
}: {
  goalsSummary: GoalsSummary
  onNavigateToProject?: (projectId: string) => void
  onNavigateToGoals?: () => void
}) {
  const { upcomingMilestones, plannedStarts } = goalsSummary
  const hasContent = upcomingMilestones.length > 0 || plannedStarts.length > 0
  if (!hasContent) return null

  return (
    <div
      className="rounded-xl border border-stone-200 dark:border-stone-700/60 bg-white dark:bg-stone-900 overflow-hidden"
    >
      <div style={{ padding: '20px' }}>
        {/* Upcoming milestones */}
        {upcomingMilestones.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
              <span className="text-sm font-semibold text-stone-900 dark:text-stone-100" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                Upcoming Milestones
              </span>
            </div>
            {upcomingMilestones.slice(0, 3).map((m, i) => {
              const remaining = m.targetDate ? daysUntil(m.targetDate) : null
              const isOverdue = remaining != null && remaining < 0
              return (
                <div
                  key={`${m.projectId}-${i}`}
                  className="flex items-start gap-3"
                  style={{ paddingLeft: '26px' }}
                >
                  {/* Timeline dot */}
                  <div className="w-2 h-2 rounded-full bg-emerald-400 dark:bg-emerald-500 shrink-0 mt-1.5" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="text-sm text-stone-700 dark:text-stone-300" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                      {m.milestoneLabel}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => onNavigateToProject?.(m.projectId)}
                        className="text-xs text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 underline underline-offset-2 decoration-emerald-300 dark:decoration-emerald-700 transition-colors cursor-pointer"
                        style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                      >
                        {m.projectName}
                      </button>
                      {m.targetPercent != null && (
                        <span className="text-[11px] text-stone-400 dark:text-stone-500" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                          {m.currentPercent}% → {m.targetPercent}%
                        </span>
                      )}
                    </div>
                    {m.targetDate && (
                      <span className={`text-[11px] ${isOverdue ? 'text-red-500 dark:text-red-400' : 'text-stone-400 dark:text-stone-500'}`} style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                        {isOverdue ? `Overdue by ${Math.abs(remaining!)}d` : `${remaining}d remaining`} · Due {formatDate(m.targetDate)}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Planned starts */}
        {plannedStarts.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: upcomingMilestones.length > 0 ? '20px' : '0' }}>
            <div className="flex items-center gap-2">
              <CalendarClock className="w-4 h-4 text-amber-600 dark:text-amber-400" strokeWidth={2} />
              <span className="text-sm font-semibold text-stone-900 dark:text-stone-100" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                Planned Starts
              </span>
            </div>
            {plannedStarts.map((ps, i) => (
              <div
                key={`${ps.projectId}-${i}`}
                className="flex items-center gap-3"
                style={{ paddingLeft: '26px' }}
              >
                <div className="w-2 h-2 rounded-full bg-amber-400 dark:bg-amber-500 shrink-0" />
                <button
                  onClick={() => onNavigateToProject?.(ps.projectId)}
                  className="text-sm text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 underline underline-offset-2 decoration-emerald-300 dark:decoration-emerald-700 transition-colors cursor-pointer"
                  style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                >
                  {ps.projectName}
                </button>
                <span className="text-xs text-stone-400 dark:text-stone-500" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                  {ps.plannedTiming}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* View all goals link */}
      <button
        onClick={() => onNavigateToGoals?.()}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 border-t border-stone-100 dark:border-stone-800 text-sm font-medium text-emerald-700 dark:text-emerald-400 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors cursor-pointer"
        style={{ fontFamily: "'Source Sans 3', sans-serif" }}
      >
        View All Goals & Plans
        <ArrowRight className="w-4 h-4" strokeWidth={2} />
      </button>
    </div>
  )
}

/* ── Start Next Section ────────────────────────────────── */

function StartNextSection({
  projects,
  onNavigateToProject,
}: {
  projects: GalleryCardData[]
  onNavigateToProject?: (projectId: string) => void
}) {
  if (projects.length === 0) {
    return (
      <p className="text-sm text-stone-400 dark:text-stone-500 italic" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
        Flag a project as "Start Next" to see it here.
      </p>
    )
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: projects.length === 1 ? '1fr' : '1fr 1fr', gap: '16px', maxWidth: projects.length === 1 ? '340px' : undefined }}>
      {projects.slice(0, 2).map((card) => (
        <GalleryCard
          key={card.projectId}
          card={card}
          onNavigateToProject={onNavigateToProject}
        />
      ))}
    </div>
  )
}

/* ── Main Dashboard ────────────────────────────────────── */

export function MainDashboard({
  recentCharts,
  currentlyStitching,
  startNextProjects,
  buriedTreasures,
  spotlight,
  collectionStats,
  goalsSummary,
  onQuickAdd,
  onNavigateToProject,
  onViewSpotlight,
  onRefreshSpotlight,
  onNavigateToGoals,
}: MainDashboardProps) {
  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: '0px' }}>
      {/* Page header with Quick Add */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '48px', flexWrap: 'wrap' }}>
        <div>
          <h1
            className="text-3xl font-bold text-stone-900 dark:text-stone-100"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Your Library
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
            Welcome back to your cross stitch collection
          </p>
        </div>
        <QuickAddMenu onQuickAdd={onQuickAdd} />
      </div>

      {/* ── Top zone: two-column (main + sidebar) ──────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: '32px', marginBottom: '56px' }} className="max-lg:!block">
        {/* Left column: Currently Stitching + Start Next */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '48px', minWidth: 0 }}>
          {/* Currently Stitching */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <SectionHeading>Currently Stitching</SectionHeading>
            {currentlyStitching.length === 0 ? (
              <p className="text-sm text-stone-400 dark:text-stone-500 py-8 text-center" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                No active projects. Start stitching to see your work here!
              </p>
            ) : (
              <ScrollableRow>
                {currentlyStitching.map((card) => (
                  <CurrentlyStitchingCard
                    key={card.projectId}
                    card={card}
                    onNavigateToProject={onNavigateToProject}
                  />
                ))}
              </ScrollableRow>
            )}
          </div>

          {/* Start Next */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <SectionHeading>Start Next</SectionHeading>
            <StartNextSection
              projects={startNextProjects}
              onNavigateToProject={onNavigateToProject}
            />
          </div>
        </div>

        {/* Right column: Stats sidebar + Goals teaser */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="max-lg:mt-12">
          <CollectionStatsSidebar
            stats={collectionStats}
            onNavigateToProject={onNavigateToProject}
          />
          <GoalsTeaser
            goalsSummary={goalsSummary}
            onNavigateToProject={onNavigateToProject}
            onNavigateToGoals={onNavigateToGoals}
          />
        </div>
      </div>

      {/* ── Full-width sections below ──────────────────────── */}

      {/* Recently Added */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '56px' }}>
        <SectionHeading>Recently Added</SectionHeading>
        <ScrollableRow>
          {recentCharts.map((chart) => (
            <RecentlyAddedCard
              key={chart.chartId}
              chart={chart}
              onNavigateToProject={onNavigateToProject}
            />
          ))}
        </ScrollableRow>
      </div>

      {/* Rediscover This One */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '56px' }}>
        <SectionHeading>Rediscover This One</SectionHeading>
        <SpotlightCard
          project={spotlight}
          onViewSpotlight={onViewSpotlight}
          onRefreshSpotlight={onRefreshSpotlight}
        />
      </div>

      {/* Buried Treasures */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <SectionHeading>Buried Treasures</SectionHeading>
        <p className="text-sm text-stone-500 dark:text-stone-400 -mt-1" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
          Your longest-waiting unstarted projects — give them some love!
        </p>
        <BuriedTreasuresSection
          treasures={buriedTreasures}
          onNavigateToProject={onNavigateToProject}
        />
      </div>
    </div>
  )
}

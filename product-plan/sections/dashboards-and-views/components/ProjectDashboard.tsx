import { useState } from 'react'
import {
  BarChart3,
  Trophy,
  ChevronDown,
  ChevronRight,
  Search,
  ArrowUpDown,
  Scissors,
  Calendar,
  Clock,
  Flame,
  Star,
  Sparkles,
} from 'lucide-react'
import type {
  ProjectDashboardProps,
  ProjectDashboardHeroStats,
  ProgressBucket,
  ProgressBucketProject,
  ProgressSortOption,
  FinishedProject,
  FinishedSortOption,
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

function fmt(n: number): string { return n.toLocaleString() }

function daysAgo(dateStr: string): number {
  const d = new Date(dateStr)
  const now = new Date()
  return Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' })
}

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

function CoverImage({ src, alt, status }: { src: string | null; alt: string; status: string }) {
  const [failed, setFailed] = useState(false)
  if (src && !failed) {
    return <img src={src} alt={alt} className="w-full h-full object-cover" onError={() => setFailed(true)} />
  }
  return <CoverPlaceholder status={status} />
}

/* ── Bucket accent colours ─────────────────────────────── */

const bucketAccents: Record<string, { bar: string; bg: string; text: string; count: string }> = {
  'unstarted': { bar: 'bg-stone-300 dark:bg-stone-600', bg: 'bg-stone-50 dark:bg-stone-800/50', text: 'text-stone-600 dark:text-stone-400', count: 'text-stone-500 dark:text-stone-400' },
  '0-25':      { bar: 'bg-amber-400 dark:bg-amber-500',  bg: 'bg-amber-50/50 dark:bg-amber-950/20', text: 'text-amber-700 dark:text-amber-400', count: 'text-amber-600 dark:text-amber-400' },
  '25-50':     { bar: 'bg-emerald-400 dark:bg-emerald-500', bg: 'bg-emerald-50/50 dark:bg-emerald-950/20', text: 'text-emerald-700 dark:text-emerald-400', count: 'text-emerald-600 dark:text-emerald-400' },
  '50-75':     { bar: 'bg-sky-400 dark:bg-sky-500',     bg: 'bg-sky-50/50 dark:bg-sky-950/20', text: 'text-sky-700 dark:text-sky-400', count: 'text-sky-600 dark:text-sky-400' },
  '75-100':    { bar: 'bg-violet-400 dark:bg-violet-500', bg: 'bg-violet-50/50 dark:bg-violet-950/20', text: 'text-violet-700 dark:text-violet-400', count: 'text-violet-600 dark:text-violet-400' },
  'finished':  { bar: 'bg-rose-400 dark:bg-rose-500',   bg: 'bg-rose-50/50 dark:bg-rose-950/20', text: 'text-rose-700 dark:text-rose-400', count: 'text-rose-600 dark:text-rose-400' },
}

/* ══════════════════════════════════════════════════════════
   HERO STATS
   ══════════════════════════════════════════════════════════ */

function HeroStats({ stats, onNavigateToProject }: { stats: ProjectDashboardHeroStats; onNavigateToProject?: (id: string) => void }) {
  const statItems = [
    { label: 'In Progress', value: stats.totalWIPs, icon: Flame },
    { label: 'Avg Progress', value: `${stats.averageProgress}%`, icon: BarChart3 },
    { label: 'Finished This Year', value: stats.finishedThisYear, icon: Trophy },
    { label: 'Finished All Time', value: stats.finishedAllTime, icon: Star },
    { label: 'Total Stitches', value: fmt(stats.totalStitchesAllProjects), icon: Sparkles },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
      {statItems.map(({ label, value, icon: Icon }) => (
        <div
          key={label}
          className="rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30"
          style={{ padding: '16px' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
            <span className="text-[11px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-semibold" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
              {label}
            </span>
          </div>
          <p
            className="text-xl font-bold text-emerald-800 dark:text-emerald-300 tabular-nums"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            {value}
          </p>
        </div>
      ))}
      {stats.closestToCompletion && (
        <div
          className="rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30"
          style={{ padding: '16px' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
            <span className="text-[11px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-semibold" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
              Closest to Done
            </span>
          </div>
          <button
            onClick={() => onNavigateToProject?.(stats.closestToCompletion!.projectId)}
            className="text-sm font-semibold text-emerald-800 dark:text-emerald-300 hover:text-emerald-600 dark:hover:text-emerald-200 underline underline-offset-2 decoration-emerald-300 dark:decoration-emerald-700 transition-colors cursor-pointer truncate block w-full text-left"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            {stats.closestToCompletion.name}
          </button>
          <span className="text-lg font-bold text-emerald-800 dark:text-emerald-300 tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {stats.closestToCompletion.percent}%
          </span>
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   TAB 1: PROGRESS BREAKDOWN
   ══════════════════════════════════════════════════════════ */

const ITEMS_PER_PAGE = 10

const progressSortOptions: { value: ProgressSortOption; label: string }[] = [
  { value: 'closestToDone', label: 'Closest to Done' },
  { value: 'furthestFromDone', label: 'Furthest from Done' },
  { value: 'mostStitchingDays', label: 'Most Stitching Days' },
  { value: 'fewestStitchingDays', label: 'Fewest Stitching Days' },
  { value: 'recentlyStitched', label: 'Recently Stitched' },
]

function sortBucketProjects(projects: ProgressBucketProject[], sort: ProgressSortOption): ProgressBucketProject[] {
  return [...projects].sort((a, b) => {
    switch (sort) {
      case 'closestToDone': return b.progressPercent - a.progressPercent
      case 'furthestFromDone': return a.progressPercent - b.progressPercent
      case 'mostStitchingDays': return b.stitchingDays - a.stitchingDays
      case 'fewestStitchingDays': return a.stitchingDays - b.stitchingDays
      case 'recentlyStitched': {
        if (!a.lastStitchedDate && !b.lastStitchedDate) return 0
        if (!a.lastStitchedDate) return 1
        if (!b.lastStitchedDate) return -1
        return b.lastStitchedDate.localeCompare(a.lastStitchedDate)
      }
    }
  })
}

function ProgressBreakdownTab({
  buckets,
  onNavigateToProject,
}: {
  buckets: ProgressBucket[]
  onNavigateToProject?: (projectId: string) => void
}) {
  const [expandedBuckets, setExpandedBuckets] = useState<Set<string>>(new Set())
  const [sort, setSort] = useState<ProgressSortOption>('closestToDone')
  const [visibleCounts, setVisibleCounts] = useState<Record<string, number>>({})

  const totalProjects = buckets.reduce((sum, b) => sum + b.projects.length, 0)

  function toggleBucket(id: string) {
    setExpandedBuckets((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function showMore(bucketId: string) {
    setVisibleCounts((prev) => ({
      ...prev,
      [bucketId]: (prev[bucketId] ?? ITEMS_PER_PAGE) + ITEMS_PER_PAGE,
    }))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Sort bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-sm text-stone-500 dark:text-stone-400" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
          {totalProjects} project{totalProjects !== 1 ? 's' : ''} across {buckets.filter(b => b.projects.length > 0).length} stages
        </p>
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-stone-400" strokeWidth={1.5} />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as ProgressSortOption)}
            className="text-sm bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-1.5 text-stone-700 dark:text-stone-300 cursor-pointer"
            style={{ fontFamily: "'Source Sans 3', sans-serif" }}
          >
            {progressSortOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Visual bar breakdown */}
      <div className="rounded-xl border border-stone-200 dark:border-stone-700/60 bg-white dark:bg-stone-900 overflow-hidden" style={{ padding: '20px' }}>
        <div className="flex rounded-full overflow-hidden h-6 bg-stone-100 dark:bg-stone-800">
          {buckets.map((bucket) => {
            if (bucket.projects.length === 0) return null
            const pct = (bucket.projects.length / totalProjects) * 100
            const accent = bucketAccents[bucket.id] ?? bucketAccents['unstarted']
            return (
              <div
                key={bucket.id}
                className={`${accent.bar} flex items-center justify-center transition-all duration-300 relative group`}
                style={{ width: `${Math.max(pct, 3)}%`, minWidth: pct > 0 ? '24px' : 0 }}
                title={`${bucket.label}: ${bucket.projects.length} projects (${pct.toFixed(0)}%)`}
              >
                {pct >= 8 && (
                  <span className="text-[10px] font-bold text-white tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {bucket.projects.length}
                  </span>
                )}
              </div>
            )
          })}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
          {buckets.map((bucket) => {
            const accent = bucketAccents[bucket.id] ?? bucketAccents['unstarted']
            return (
              <div key={bucket.id} className="flex items-center gap-1.5">
                <div className={`w-2.5 h-2.5 rounded-full ${accent.bar}`} />
                <span className="text-[11px] text-stone-500 dark:text-stone-400" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                  {bucket.label} ({bucket.projects.length})
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Bucket sections */}
      {buckets.map((bucket) => {
        const isExpanded = expandedBuckets.has(bucket.id)
        const accent = bucketAccents[bucket.id] ?? bucketAccents['unstarted']
        const sorted = sortBucketProjects(bucket.projects, sort)
        const visibleCount = visibleCounts[bucket.id] ?? ITEMS_PER_PAGE
        const visible = sorted.slice(0, visibleCount)
        const hasMore = sorted.length > visibleCount

        return (
          <div
            key={bucket.id}
            className="rounded-xl border border-stone-200 dark:border-stone-700/60 overflow-hidden"
          >
            {/* Bucket header */}
            <button
              onClick={() => toggleBucket(bucket.id)}
              className={`w-full flex items-center gap-3 ${accent.bg} hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer`}
              style={{ padding: '14px 20px' }}
            >
              <ChevronDown className={`w-4 h-4 text-stone-400 shrink-0 transition-transform duration-200 ${isExpanded ? '' : '-rotate-90'}`} strokeWidth={1.5} />
              <span
                className="text-sm font-bold text-stone-900 dark:text-stone-100"
                style={{ fontFamily: "'Fraunces', serif", flex: 1, textAlign: 'left' }}
              >
                {bucket.label}
              </span>
              <span className="text-xs text-stone-400 dark:text-stone-500" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                {bucket.range}
              </span>
              <span
                className={`text-sm font-bold tabular-nums ${accent.count}`}
                style={{ fontFamily: "'JetBrains Mono', monospace", minWidth: '28px', textAlign: 'right' }}
              >
                {bucket.projects.length}
              </span>
            </button>

            {/* Expanded project list */}
            {isExpanded && (
              <div className="bg-white dark:bg-stone-900">
                {bucket.projects.length === 0 ? (
                  <div className="text-center py-10 text-stone-400 dark:text-stone-500" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                    No projects in this range yet
                  </div>
                ) : (
                  <>
                    {visible.map((project) => (
                      <BucketProjectRow
                        key={project.projectId}
                        project={project}
                        bucketId={bucket.id}
                        onNavigateToProject={onNavigateToProject}
                      />
                    ))}
                    {hasMore && (
                      <div style={{ padding: '12px 20px', textAlign: 'center' }}>
                        <button
                          onClick={() => showMore(bucket.id)}
                          className="text-sm text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 font-medium transition-colors cursor-pointer"
                          style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                        >
                          Show more ({sorted.length - visibleCount} remaining)
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function BucketProjectRow({
  project,
  bucketId,
  onNavigateToProject,
}: {
  project: ProgressBucketProject
  bucketId: string
  onNavigateToProject?: (projectId: string) => void
}) {
  const accent = bucketAccents[bucketId] ?? bucketAccents['unstarted']

  return (
    <div
      className="flex items-center gap-3 border-t border-stone-100 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/30 transition-colors"
      style={{ padding: '12px 20px' }}
    >
      {/* Thumbnail */}
      <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
        <CoverImage src={project.coverImageUrl} alt={project.name} status={project.status} />
      </div>

      {/* Name + designer */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <button
          onClick={() => onNavigateToProject?.(project.projectId)}
          className="text-sm font-semibold text-stone-900 dark:text-stone-100 hover:text-emerald-700 dark:hover:text-emerald-400 truncate transition-colors cursor-pointer block w-full text-left"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          {project.name}
        </button>
        <p className="text-xs text-stone-500 dark:text-stone-400 truncate" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
          {project.designerName}
        </p>
      </div>

      {/* Progress bar (only for non-unstarted, non-finished) */}
      {bucketId !== 'unstarted' && bucketId !== 'finished' && (
        <div className="shrink-0 max-md:hidden" style={{ width: '100px' }}>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${accent.bar}`}
                style={{ width: `${project.progressPercent}%` }}
              />
            </div>
            <span
              className="text-[11px] font-medium tabular-nums text-stone-500 dark:text-stone-400"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {project.progressPercent}%
            </span>
          </div>
        </div>
      )}

      {/* Stitch count */}
      <div className="shrink-0 max-sm:hidden text-right" style={{ minWidth: '80px' }}>
        <p className="text-xs text-stone-600 dark:text-stone-300 tabular-nums" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
          {fmt(project.completedStitches)}/{fmt(project.totalStitches)}
        </p>
        <p className="text-[10px] text-stone-400 dark:text-stone-500" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
          stitches
        </p>
      </div>

      {/* Last stitched / stitching days */}
      <div className="shrink-0 max-md:hidden text-right" style={{ minWidth: '90px' }}>
        {project.lastStitchedDate ? (
          <>
            <p className="text-xs text-stone-500 dark:text-stone-400" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
              Last stitched
            </p>
            <p className="text-xs text-stone-600 dark:text-stone-300" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
              {formatDate(project.lastStitchedDate)} ({daysAgo(project.lastStitchedDate)}d ago)
            </p>
          </>
        ) : (
          <p className="text-xs text-stone-400 dark:text-stone-500" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
            Not started
          </p>
        )}
      </div>

      {/* Status */}
      <div className="shrink-0 max-sm:hidden">
        <StatusBadge status={project.status} />
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   TAB 2: FINISHED
   ══════════════════════════════════════════════════════════ */

const finishedSortOptions: { value: FinishedSortOption; label: string }[] = [
  { value: 'finishDate', label: 'Finish Date (Newest)' },
  { value: 'startToFinish', label: 'Start to Finish (Longest)' },
  { value: 'stitchCount', label: 'Stitch Count (Largest)' },
  { value: 'stitchingDays', label: 'Stitching Days (Most)' },
]

function sortFinished(projects: FinishedProject[], sort: FinishedSortOption): FinishedProject[] {
  return [...projects].sort((a, b) => {
    switch (sort) {
      case 'finishDate': return b.finishDate.localeCompare(a.finishDate)
      case 'startToFinish': return b.startToFinishDays - a.startToFinishDays
      case 'stitchCount': return b.totalStitches - a.totalStitches
      case 'stitchingDays': return b.stitchingDays - a.stitchingDays
    }
  })
}

function FinishedTab({
  projects,
  onNavigateToProject,
}: {
  projects: FinishedProject[]
  onNavigateToProject?: (projectId: string) => void
}) {
  const [sort, setSort] = useState<FinishedSortOption>('finishDate')
  const [search, setSearch] = useState('')
  const [expandedProject, setExpandedProject] = useState<string | null>(null)
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE)

  const filtered = projects.filter((p) => {
    if (!search) return true
    const q = search.toLowerCase()
    return p.name.toLowerCase().includes(q) || p.designerName.toLowerCase().includes(q)
  })

  const sorted = sortFinished(filtered, sort)
  const visible = sorted.slice(0, visibleCount)
  const hasMore = sorted.length > visibleCount

  // Aggregate stats
  const totalStitches = projects.reduce((sum, p) => sum + p.totalStitches, 0)
  const totalDays = projects.reduce((sum, p) => sum + p.stitchingDays, 0)
  const totalHours = projects.reduce((sum, p) => sum + (p.stitchingHours ?? 0), 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Finished summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
        {[
          { label: 'Projects Finished', value: `${projects.length}`, icon: Trophy },
          { label: 'Total Stitches', value: fmt(totalStitches), icon: Sparkles },
          { label: 'Stitching Days', value: fmt(totalDays), icon: Calendar },
          ...(totalHours > 0 ? [{ label: 'Stitching Hours', value: fmt(totalHours), icon: Clock }] : []),
        ].map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="rounded-lg bg-violet-50/60 dark:bg-violet-950/20 border border-violet-100 dark:border-violet-900/30"
            style={{ padding: '12px' }}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <Icon className="w-3.5 h-3.5 text-violet-500 dark:text-violet-400" strokeWidth={1.5} />
              <span className="text-[10px] uppercase tracking-wider text-violet-600 dark:text-violet-400 font-semibold" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                {label}
              </span>
            </div>
            <p className="text-lg font-bold text-violet-800 dark:text-violet-300 tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Search + sort */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="relative" style={{ minWidth: '200px', flex: '1', maxWidth: '320px' }}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" strokeWidth={1.5} />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setVisibleCount(ITEMS_PER_PAGE) }}
            placeholder="Search finished projects..."
            className="w-full pl-9 pr-3 py-1.5 text-sm bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-700 dark:text-stone-300 placeholder:text-stone-400"
            style={{ fontFamily: "'Source Sans 3', sans-serif" }}
          />
        </div>
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-stone-400" strokeWidth={1.5} />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as FinishedSortOption)}
            className="text-sm bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-1.5 text-stone-700 dark:text-stone-300 cursor-pointer"
            style={{ fontFamily: "'Source Sans 3', sans-serif" }}
          >
            {finishedSortOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      <p className="text-sm text-stone-400 dark:text-stone-500" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
        {filtered.length} project{filtered.length !== 1 ? 's' : ''}
      </p>

      {/* Project list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-stone-400 dark:text-stone-500" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
          {search ? 'No finished projects match your search.' : 'No finished projects yet. Your first finish is going to feel amazing!'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {visible.map((project) => (
            <FinishedProjectCard
              key={project.projectId}
              project={project}
              isExpanded={expandedProject === project.projectId}
              onToggle={() => setExpandedProject(expandedProject === project.projectId ? null : project.projectId)}
              onNavigateToProject={onNavigateToProject}
            />
          ))}
          {hasMore && (
            <div style={{ textAlign: 'center', padding: '8px' }}>
              <button
                onClick={() => setVisibleCount((v) => v + ITEMS_PER_PAGE)}
                className="text-sm text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 font-medium transition-colors cursor-pointer"
                style={{ fontFamily: "'Source Sans 3', sans-serif" }}
              >
                Show more ({sorted.length - visibleCount} remaining)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function FinishedProjectCard({
  project,
  isExpanded,
  onToggle,
  onNavigateToProject,
}: {
  project: FinishedProject
  isExpanded: boolean
  onToggle: () => void
  onNavigateToProject?: (projectId: string) => void
}) {
  return (
    <div className="rounded-xl border border-stone-200 dark:border-stone-700/60 bg-white dark:bg-stone-900 overflow-hidden">
      {/* Compact header row */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 transition-colors hover:bg-stone-50 dark:hover:bg-stone-800/50 cursor-pointer"
        style={{ padding: '14px 20px' }}
      >
        {/* Thumbnail */}
        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
          <CoverImage src={project.coverImageUrl} alt={project.name} status="Finished" />
        </div>

        {/* Name + designer */}
        <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
          <p
            className="text-sm font-semibold text-stone-900 dark:text-stone-100 truncate"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            {project.name}
          </p>
          <p className="text-xs text-stone-500 dark:text-stone-400 truncate" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
            {project.designerName}
          </p>
        </div>

        {/* Key inline stats */}
        <div className="shrink-0 max-md:hidden text-right" style={{ minWidth: '80px' }}>
          <p className="text-xs font-medium text-stone-600 dark:text-stone-300 tabular-nums" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
            {fmt(project.totalStitches)} stitches
          </p>
          <p className="text-[10px] text-stone-400 dark:text-stone-500" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
            {project.stitchingDays} stitching days
          </p>
        </div>

        {/* Finish date */}
        <div className="shrink-0 max-sm:hidden text-right" style={{ minWidth: '90px' }}>
          <p className="text-xs text-stone-500 dark:text-stone-400" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
            Finished
          </p>
          <p className="text-xs text-stone-600 dark:text-stone-300" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
            {formatDate(project.finishDate)}
          </p>
        </div>

        <ChevronDown className={`w-4 h-4 text-stone-400 dark:text-stone-500 shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} strokeWidth={1.5} />
      </button>

      {/* Expanded stats panel */}
      {isExpanded && (
        <div className="border-t border-stone-100 dark:border-stone-800" style={{ padding: '20px' }}>
          {/* Project info row */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 mb-5">
            <StatLabel label="Designer" value={project.designerName} />
            <StatLabel label="Fabric" value={project.fabricDescription} />
            <StatLabel label="Size" value={project.sizeCategory} />
            <StatLabel label="Started" value={formatDate(project.startDate)} />
            <StatLabel label="Finished" value={`${formatDate(project.finishDate)} (${daysAgo(project.finishDate)}d ago)`} />
          </div>

          {/* Genre tags */}
          {project.genres.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-5">
              {project.genres.map((g) => (
                <span key={g} className="text-[11px] px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                  {g}
                </span>
              ))}
            </div>
          )}

          {/* Stats grid */}
          <div
            className="rounded-lg bg-stone-50 dark:bg-stone-800/40 border border-stone-100 dark:border-stone-700/40"
            style={{ padding: '16px' }}
          >
            <h4
              className="text-xs uppercase tracking-wider text-stone-400 dark:text-stone-500 font-semibold mb-3"
              style={{ fontFamily: "'Source Sans 3', sans-serif" }}
            >
              Stitching Statistics
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
              <StatCell label="Stitches Completed" value={fmt(project.totalStitches)} />
              <StatCell label="Project Colours" value={`${project.projectColours}`} />
              {project.beadCount > 0 && <StatCell label="Bead Types" value={`${project.beadCount}`} />}
              {project.specialtyCount > 0 && <StatCell label="Specialty Items" value={`${project.specialtyCount}`} />}
              <StatCell label="Start to Finish" value={`${fmt(project.startToFinishDays)} days`} />
              <StatCell label="Stitching Days" value={`${fmt(project.stitchingDays)} days`} />
              {project.stitchingHours != null && <StatCell label="Stitching Hours" value={`${fmt(project.stitchingHours)} hrs`} />}
              {project.avgDailyStitches === project.avgSessionStitches ? (
                <StatCell label="Avg Stitches/Day" value={fmt(project.avgDailyStitches)} highlight />
              ) : (
                <>
                  <StatCell label="Avg Daily Stitches" value={fmt(project.avgDailyStitches)} highlight />
                  <StatCell label="Avg Session Stitches" value={fmt(project.avgSessionStitches)} />
                </>
              )}
              {project.mostDailyStitches === project.mostSessionStitches ? (
                <StatCell label="Most Stitches/Day" value={fmt(project.mostDailyStitches)} highlight />
              ) : (
                <>
                  <StatCell label="Most Daily Stitches" value={fmt(project.mostDailyStitches)} highlight />
                  <StatCell label="Most Session Stitches" value={fmt(project.mostSessionStitches)} />
                </>
              )}
            </div>
          </div>

          {/* Link to project */}
          <button
            onClick={() => onNavigateToProject?.(project.projectId)}
            className="mt-4 text-sm text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 underline underline-offset-2 decoration-emerald-300 dark:decoration-emerald-700 transition-colors cursor-pointer"
            style={{ fontFamily: "'Source Sans 3', sans-serif" }}
          >
            View project details →
          </button>
        </div>
      )}
    </div>
  )
}

function StatLabel({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-[11px] text-stone-400 dark:text-stone-500" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
        {label}:{' '}
      </span>
      <span className="text-sm text-stone-700 dark:text-stone-300" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
        {value}
      </span>
    </div>
  )
}

function StatCell({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-stone-400 dark:text-stone-500 font-semibold mb-0.5" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
        {label}
      </p>
      <p
        className={`text-sm font-bold tabular-nums ${highlight ? 'text-emerald-700 dark:text-emerald-400' : 'text-stone-800 dark:text-stone-200'}`}
        style={{ fontFamily: "'Source Sans 3', sans-serif" }}
      >
        {value}
      </p>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   MAIN PROJECT DASHBOARD COMPONENT
   ══════════════════════════════════════════════════════════ */

type DashboardTab = 'progress' | 'finished'

const dashboardTabs: { id: DashboardTab; label: string; icon: typeof BarChart3 }[] = [
  { id: 'progress', label: 'Progress Breakdown', icon: BarChart3 },
  { id: 'finished', label: 'Finished', icon: Trophy },
]

export function ProjectDashboard({
  heroStats,
  progressBuckets,
  finishedProjects,
  onNavigateToProject,
}: ProjectDashboardProps) {
  const [activeTab, setActiveTab] = useState<DashboardTab>('progress')

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: '0px' }}>
      {/* Page header */}
      <div style={{ marginBottom: '24px' }}>
        <h1
          className="text-2xl font-bold text-stone-900 dark:text-stone-100"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          Project Dashboard
        </h1>
        <p className="text-sm text-stone-500 dark:text-stone-400 mt-1" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
          Track your progress across every project in your collection
        </p>
      </div>

      {/* Hero stats */}
      <div style={{ marginBottom: '32px' }}>
        <HeroStats stats={heroStats} onNavigateToProject={onNavigateToProject} />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-8 border-b border-stone-200 dark:border-stone-800">
        {dashboardTabs.map(({ id, label, icon: Icon }) => {
          const count = id === 'finished' ? finishedProjects.length : undefined
          return (
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
              {count != null && (
                <span className={`text-[11px] font-bold tabular-nums px-1.5 py-0.5 rounded-full ${
                  activeTab === id
                    ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400'
                }`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      {activeTab === 'progress' && (
        <ProgressBreakdownTab
          buckets={progressBuckets}
          onNavigateToProject={onNavigateToProject}
        />
      )}

      {activeTab === 'finished' && (
        <FinishedTab
          projects={finishedProjects}
          onNavigateToProject={onNavigateToProject}
        />
      )}
    </div>
  )
}

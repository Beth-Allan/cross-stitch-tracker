import { useState } from 'react'
import type {
  YearInReviewProps,
  MonthlyStitchTotal,
  MonthlyPace,
  ProjectTimelineEntry,
  YearHighlight,
  TopProject,
  FavouriteSupply,
  NewThisYear,
  YearlyHeroStats,
} from '../types'
import {
  Scissors,
  CalendarCheck,
  CalendarDays,
  Clock,
  ChevronDown,
  TrendingUp,
  BarChart3,
  Layers,
  Heart,
  Sparkles,
  PlusCircle,
  Palette,
  Package,
  Gem,
  Star,
} from 'lucide-react'

function formatNumber(n: number): string {
  return n.toLocaleString()
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

// --- Sub-components ---

function YearSelector({
  year,
  availableYears,
  onYearChange,
}: {
  year: number
  availableYears: number[]
  onYearChange?: (year: number) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
        style={{ fontFamily: "'Source Sans 3', sans-serif" }}
      >
        {year}
        <ChevronDown className="w-3.5 h-3.5" strokeWidth={2} />
      </button>
      {open && (
        <div
          className="absolute right-0 mt-1 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg shadow-lg z-20 overflow-hidden"
          style={{ minWidth: '100px' }}
        >
          {availableYears.map((y) => (
            <button
              key={y}
              onClick={() => {
                onYearChange?.(y)
                setOpen(false)
              }}
              className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                y === year
                  ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-medium'
                  : 'text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700'
              }`}
              style={{ fontFamily: "'Source Sans 3', sans-serif" }}
            >
              {y}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function HeroStatsRow({ stats }: { stats: YearlyHeroStats }) {
  const items = [
    { key: 'totalStitches', label: 'Total Stitches', icon: Scissors, value: formatNumber(stats.totalStitches), unit: 'stitches' },
    { key: 'sessionsLogged', label: 'Sessions', icon: CalendarCheck, value: formatNumber(stats.sessionsLogged), unit: 'logged' },
    { key: 'stitchingDays', label: 'Stitching Days', icon: CalendarDays, value: formatNumber(stats.stitchingDays), unit: 'days' },
    ...(stats.hoursStitched != null
      ? [{ key: 'hoursStitched', label: 'Hours Stitched', icon: Clock, value: stats.hoursStitched.toFixed(1), unit: 'hours' }]
      : []),
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${items.length}, 1fr)`, gap: '16px' }}>
      {items.map(({ key, label, icon: Icon, value, unit }) => (
        <div
          key={key}
          style={{
            backgroundColor: '#ecfdf5',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #a7f3d0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Icon style={{ width: 16, height: 16, color: '#10b981' }} strokeWidth={1.5} />
            <span
              style={{
                fontSize: '11px',
                color: '#78716c',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontFamily: "'Source Sans 3', sans-serif",
              }}
            >
              {label}
            </span>
          </div>
          <p
            style={{
              fontSize: '30px',
              fontWeight: 600,
              color: '#1c1917',
              fontFamily: "'JetBrains Mono', monospace",
              fontVariantNumeric: 'tabular-nums',
              margin: 0,
            }}
          >
            {value}
          </p>
          <p
            style={{
              fontSize: '12px',
              color: '#a8a29e',
              marginTop: '4px',
              fontFamily: "'Source Sans 3', sans-serif",
            }}
          >
            {unit}
          </p>
        </div>
      ))}
    </div>
  )
}

function MonthlyBreakdownChart({ totals }: { totals: MonthlyStitchTotal[] }) {
  const maxStitches = Math.max(...totals.map((t) => t.totalStitches), 1)

  return (
    <div style={{ paddingTop: 48 }}>
      <h3
        className="text-sm font-semibold text-stone-900 dark:text-stone-100 mb-4 flex items-center gap-2"
        style={{ fontFamily: "'Fraunces', serif" }}
      >
        <BarChart3 className="w-4 h-4 text-emerald-500" strokeWidth={1.5} />
        Monthly Breakdown
      </h3>
      <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200/60 dark:border-stone-800 p-5">
        <div style={{ display: 'flex', gap: '12px' }}>
          {/* Y-axis */}
          <div style={{ width: '48px', height: '180px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flexShrink: 0 }}>
            <span style={{ fontSize: '10px', color: '#a8a29e', textAlign: 'right', fontFamily: "'Source Sans 3', sans-serif", fontVariantNumeric: 'tabular-nums' }}>
              {formatNumber(maxStitches)}
            </span>
            <span style={{ fontSize: '10px', color: '#a8a29e', textAlign: 'right', fontFamily: "'Source Sans 3', sans-serif", fontVariantNumeric: 'tabular-nums' }}>
              {formatNumber(Math.round(maxStitches / 2))}
            </span>
            <span style={{ fontSize: '10px', color: '#a8a29e', textAlign: 'right', fontFamily: "'Source Sans 3', sans-serif" }}>
              0
            </span>
          </div>
          {/* Bars */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: '6px', height: '180px' }}>
            {totals.map((total) => {
              const pct = total.totalStitches / maxStitches
              const barPx = Math.round(pct * 174)
              const hasData = total.totalStitches > 0
              return (
                <div key={total.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', alignSelf: 'flex-end' }}>
                  {hasData && (
                    <span style={{ fontSize: '10px', color: '#78716c', fontFamily: "'Source Sans 3', sans-serif", fontVariantNumeric: 'tabular-nums' }}>
                      {formatNumber(total.totalStitches)}
                    </span>
                  )}
                  <div
                    style={{
                      width: '100%',
                      height: Math.max(barPx, hasData ? 6 : 2),
                      borderRadius: '4px 4px 0 0',
                      backgroundColor: hasData ? '#a7f3d0' : '#f5f5f4',
                      transition: 'background-color 150ms',
                    }}
                    onMouseEnter={(e) => { if (hasData) e.currentTarget.style.backgroundColor = '#6ee7b7' }}
                    onMouseLeave={(e) => { if (hasData) e.currentTarget.style.backgroundColor = '#a7f3d0' }}
                  />
                </div>
              )
            })}
          </div>
        </div>
        {/* Month labels */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          <div style={{ width: '48px', flexShrink: 0 }} />
          <div style={{ flex: 1, display: 'flex', gap: '6px' }}>
            {totals.map((total) => (
              <div key={total.month} style={{ flex: 1, textAlign: 'center' }}>
                <span
                  className="text-stone-400 dark:text-stone-500"
                  style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                >
                  {total.month}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function StitchingPace({ pace }: { pace: MonthlyPace[] }) {
  if (pace.length === 0) return null
  const maxPace = Math.max(...pace.map((p) => p.avgStitchesPerDay), 1)

  return (
    <div style={{ paddingTop: 48 }}>
      <h3
        className="text-sm font-semibold text-stone-900 dark:text-stone-100 mb-4 flex items-center gap-2"
        style={{ fontFamily: "'Fraunces', serif" }}
      >
        <TrendingUp className="w-4 h-4 text-emerald-500" strokeWidth={1.5} />
        Stitching Pace
      </h3>
      <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200/60 dark:border-stone-800 p-5">
        <p
          className="text-xs text-stone-500 dark:text-stone-400 mb-4"
          style={{ fontFamily: "'Source Sans 3', sans-serif" }}
        >
          Average stitches per day, by month
        </p>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '80px' }}>
          {pace.map((p, i) => {
            const pct = p.avgStitchesPerDay / maxPace
            const barH = Math.round(pct * 64)
            return (
              <div key={p.month} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flex: 1 }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#1c1917', fontFamily: "'JetBrains Mono', monospace", fontVariantNumeric: 'tabular-nums' }}>
                  {p.avgStitchesPerDay}
                </span>
                <div
                  style={{
                    width: '100%',
                    maxWidth: '48px',
                    height: Math.max(barH, 4),
                    borderRadius: '4px 4px 0 0',
                    backgroundColor: '#a7f3d0',
                    transition: 'background-color 150ms',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#6ee7b7' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#a7f3d0' }}
                />
                <span style={{ fontSize: '10px', color: '#a8a29e', fontFamily: "'Source Sans 3', sans-serif", textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {p.month}
                </span>
              </div>
            )
          })}
          {/* Trend arrow */}
          {pace.length >= 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', paddingBottom: '18px' }}>
              {pace[pace.length - 1].avgStitchesPerDay >= pace[pace.length - 2].avgStitchesPerDay ? (
                <span style={{ fontSize: '11px', color: '#10b981', fontFamily: "'Source Sans 3', sans-serif", fontWeight: 600 }}>
                  ↑ Trending up
                </span>
              ) : (
                <span style={{ fontSize: '11px', color: '#f59e0b', fontFamily: "'Source Sans 3', sans-serif", fontWeight: 600 }}>
                  ↓ Slowing down
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ProjectTimeline({
  entries,
  year,
  onNavigateToProject,
}: {
  entries: ProjectTimelineEntry[]
  year: number
  onNavigateToProject?: (projectId: string) => void
}) {
  if (entries.length === 0) return null

  const yearStart = new Date(year, 0, 1).getTime()
  const yearEnd = new Date(year, 11, 31).getTime()
  const yearRange = yearEnd - yearStart

  return (
    <div style={{ paddingTop: 48 }}>
      <h3
        className="text-sm font-semibold text-stone-900 dark:text-stone-100 mb-4 flex items-center gap-2"
        style={{ fontFamily: "'Fraunces', serif" }}
      >
        <Layers className="w-4 h-4 text-emerald-500" strokeWidth={1.5} />
        Projects Timeline
      </h3>
      <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200/60 dark:border-stone-800 p-5">
        {/* Month labels across top */}
        <div style={{ display: 'flex', marginBottom: '16px', paddingLeft: '180px' }}>
          {['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'].map((m, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center' }}>
              <span style={{ fontSize: '10px', color: '#a8a29e', fontFamily: "'Source Sans 3', sans-serif", textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {m}
              </span>
            </div>
          ))}
        </div>
        {/* Project bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {entries.map((entry) => {
            const start = new Date(entry.firstSession + 'T00:00:00').getTime()
            const end = new Date(entry.lastSession + 'T00:00:00').getTime()
            const leftPct = ((start - yearStart) / yearRange) * 100
            const widthPct = Math.max(((end - start) / yearRange) * 100, 1.5)

            return (
              <div key={entry.projectId} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {/* Project name */}
                <div style={{ width: '168px', flexShrink: 0 }}>
                  <button
                    onClick={() => onNavigateToProject?.(entry.projectId)}
                    className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-left"
                    style={{
                      fontSize: '12px',
                      fontFamily: "'Source Sans 3', sans-serif",
                      color: '#57534e',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      textDecoration: 'underline',
                      textUnderlineOffset: '2px',
                      textDecorationColor: '#d6d3d1',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '168px',
                      display: 'block',
                    }}
                  >
                    {entry.projectName}
                  </button>
                </div>
                {/* Timeline bar */}
                <div style={{ flex: 1, position: 'relative', height: '24px', backgroundColor: '#fafaf9', borderRadius: '4px' }}>
                  <div
                    style={{
                      position: 'absolute',
                      left: `${leftPct}%`,
                      width: `${widthPct}%`,
                      height: '100%',
                      backgroundColor: entry.statusColour,
                      borderRadius: '4px',
                      opacity: 0.7,
                      transition: 'opacity 150ms',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = '1' }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.7' }}
                    title={`${formatDate(entry.firstSession)} – ${formatDate(entry.lastSession)} · ${formatNumber(entry.totalStitches)} stitches · ${entry.sessions} sessions`}
                  />
                </div>
                {/* Stitch count */}
                <div style={{ width: '72px', flexShrink: 0, textAlign: 'right' }}>
                  <span style={{ fontSize: '12px', color: '#78716c', fontFamily: "'Source Sans 3', sans-serif", fontVariantNumeric: 'tabular-nums' }}>
                    {formatNumber(entry.totalStitches)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function YearHighlights({ highlights }: { highlights: YearHighlight[] }) {
  if (highlights.length === 0) return null

  const iconMap: Record<string, typeof Star> = {
    'Busiest Month': BarChart3,
    'Busiest Day': Sparkles,
    'Longest Gap': Clock,
    'Projects Worked On': Layers,
    'Projects Started': PlusCircle,
    'Projects Finished': CalendarCheck,
  }

  return (
    <div style={{ paddingTop: 48 }}>
      <h3
        className="text-sm font-semibold text-stone-900 dark:text-stone-100 mb-4 flex items-center gap-2"
        style={{ fontFamily: "'Fraunces', serif" }}
      >
        <Star className="w-4 h-4 text-emerald-500" strokeWidth={1.5} />
        Year Highlights
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
        {highlights.map((h) => {
          const Icon = iconMap[h.label] || Star
          return (
            <div
              key={h.label}
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                border: '1px solid #e7e5e4',
                padding: '16px 20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Icon style={{ width: 14, height: 14, color: '#10b981' }} strokeWidth={1.5} />
                <span
                  style={{
                    fontSize: '11px',
                    color: '#78716c',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontFamily: "'Source Sans 3', sans-serif",
                  }}
                >
                  {h.label}
                </span>
              </div>
              <p
                style={{
                  fontSize: '20px',
                  fontWeight: 600,
                  color: '#1c1917',
                  fontFamily: "'JetBrains Mono', monospace",
                  margin: 0,
                }}
              >
                {h.value}
              </p>
              {h.detail && (
                <p
                  style={{
                    fontSize: '12px',
                    color: '#a8a29e',
                    marginTop: '4px',
                    fontFamily: "'Source Sans 3', sans-serif",
                    lineHeight: 1.4,
                  }}
                >
                  {h.detail}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function TopProjectsRanking({
  projects,
  onNavigateToProject,
}: {
  projects: TopProject[]
  onNavigateToProject?: (projectId: string) => void
}) {
  if (projects.length === 0) return null

  return (
    <div style={{ paddingTop: 48 }}>
      <h3
        className="text-sm font-semibold text-stone-900 dark:text-stone-100 mb-4 flex items-center gap-2"
        style={{ fontFamily: "'Fraunces', serif" }}
      >
        <Heart className="w-4 h-4 text-emerald-500" strokeWidth={1.5} />
        Top Projects
      </h3>
      <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200/60 dark:border-stone-800 overflow-hidden">
        {projects.map((proj, i) => (
          <div
            key={proj.projectId}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '16px 20px',
              borderBottom: i < projects.length - 1 ? '1px solid #f5f5f4' : 'none',
            }}
          >
            {/* Rank */}
            <span
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                backgroundColor: i === 0 ? '#ecfdf5' : '#fafaf9',
                border: `1px solid ${i === 0 ? '#a7f3d0' : '#e7e5e4'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 600,
                color: i === 0 ? '#10b981' : '#78716c',
                fontFamily: "'JetBrains Mono', monospace",
                flexShrink: 0,
              }}
            >
              {i + 1}
            </span>
            {/* Name + sessions */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <button
                onClick={() => onNavigateToProject?.(proj.projectId)}
                className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  fontFamily: "'Source Sans 3', sans-serif",
                  color: '#1c1917',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  textDecoration: 'underline',
                  textUnderlineOffset: '2px',
                  textDecorationColor: '#d6d3d1',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: 'block',
                  maxWidth: '100%',
                  textAlign: 'left',
                }}
              >
                {proj.projectName}
              </button>
              <span style={{ fontSize: '12px', color: '#a8a29e', fontFamily: "'Source Sans 3', sans-serif" }}>
                {proj.sessions} sessions
              </span>
            </div>
            {/* Progress bar + percent */}
            <div style={{ width: '140px', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ flex: 1, height: '6px', backgroundColor: '#f5f5f4', borderRadius: '3px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${proj.percentOfYearTotal}%`,
                      height: '100%',
                      backgroundColor: '#a7f3d0',
                      borderRadius: '3px',
                      transition: 'width 300ms ease',
                    }}
                  />
                </div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#78716c', fontFamily: "'JetBrains Mono', monospace", fontVariantNumeric: 'tabular-nums', width: '32px', textAlign: 'right' }}>
                  {proj.percentOfYearTotal}%
                </span>
              </div>
            </div>
            {/* Stitch count */}
            <div style={{ width: '80px', flexShrink: 0, textAlign: 'right' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#1c1917', fontFamily: "'JetBrains Mono', monospace", fontVariantNumeric: 'tabular-nums' }}>
                {formatNumber(proj.totalStitches)}
              </span>
              <span style={{ fontSize: '12px', color: '#a8a29e', fontFamily: "'Source Sans 3', sans-serif", display: 'block' }}>
                stitches
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function FavouriteSupplies({ supplies }: { supplies: FavouriteSupply[] }) {
  const threads = supplies.filter((s) => s.category === 'thread')
  const beads = supplies.filter((s) => s.category === 'bead')
  const specialty = supplies.filter((s) => s.category === 'specialty')

  if (supplies.length === 0) return null

  const categoryIcon: Record<string, typeof Palette> = {
    thread: Palette,
    bead: Gem,
    specialty: Sparkles,
  }

  const renderGroup = (title: string, items: FavouriteSupply[], icon: typeof Palette) => {
    if (items.length === 0) return null
    const Icon = icon
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
          <Icon style={{ width: 13, height: 13, color: '#a8a29e' }} strokeWidth={1.5} />
          <span style={{ fontSize: '11px', color: '#78716c', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: "'Source Sans 3', sans-serif", fontWeight: 600 }}>
            {title}
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {items.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {item.colourHex && (
                <div
                  style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '4px',
                    backgroundColor: item.colourHex,
                    border: '1px solid #e7e5e4',
                    flexShrink: 0,
                  }}
                />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: '13px', color: '#1c1917', fontFamily: "'Source Sans 3', sans-serif" }}>
                  {item.name}
                </span>
                {item.detail && (
                  <span style={{ fontSize: '11px', color: '#a8a29e', fontFamily: "'Source Sans 3', sans-serif", display: 'block' }}>
                    {item.detail}
                  </span>
                )}
              </div>
              <span style={{ fontSize: '12px', color: '#78716c', fontFamily: "'Source Sans 3', sans-serif", flexShrink: 0 }}>
                {item.projectCount} {item.projectCount === 1 ? 'project' : 'projects'}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div style={{ paddingTop: 48 }}>
      <h3
        className="text-sm font-semibold text-stone-900 dark:text-stone-100 mb-4 flex items-center gap-2"
        style={{ fontFamily: "'Fraunces', serif" }}
      >
        <Palette className="w-4 h-4 text-emerald-500" strokeWidth={1.5} />
        Favourite Supplies
      </h3>
      <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200/60 dark:border-stone-800 p-5">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {renderGroup('Top Threads', threads, categoryIcon.thread)}
          {renderGroup('Beads', beads, categoryIcon.bead)}
          {renderGroup('Specialty', specialty, categoryIcon.specialty)}
        </div>
      </div>
    </div>
  )
}

function NewThisYearSection({ data, year }: { data: NewThisYear; year: number }) {
  const items = [
    { label: 'Charts Added', value: data.chartsAdded, icon: PlusCircle },
    { label: 'Supplies Added', value: data.suppliesAdded, icon: Package },
    { label: 'Fabrics Added', value: data.fabricsAdded, icon: Layers },
  ]

  // Hide if all zeros
  if (items.every((i) => i.value === 0)) return null

  return (
    <div style={{ paddingTop: 48 }}>
      <h3
        className="text-sm font-semibold text-stone-900 dark:text-stone-100 mb-4 flex items-center gap-2"
        style={{ fontFamily: "'Fraunces', serif" }}
      >
        <PlusCircle className="w-4 h-4 text-emerald-500" strokeWidth={1.5} />
        New in {year}
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
        {items.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              border: '1px solid #e7e5e4',
              padding: '16px 20px',
              textAlign: 'center',
            }}
          >
            <Icon style={{ width: 18, height: 18, color: '#10b981', margin: '0 auto 8px' }} strokeWidth={1.5} />
            <p
              style={{
                fontSize: '24px',
                fontWeight: 600,
                color: '#1c1917',
                fontFamily: "'JetBrains Mono', monospace",
                margin: 0,
              }}
            >
              {value}
            </p>
            <p style={{ fontSize: '12px', color: '#a8a29e', marginTop: '4px', fontFamily: "'Source Sans 3', sans-serif" }}>
              {label.toLowerCase()}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

// --- Main component ---

export function YearInReview({ data, onYearChange, onNavigateToProject }: YearInReviewProps) {
  return (
    <div>
      {/* Year selector */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
        <YearSelector year={data.year} availableYears={data.availableYears} onYearChange={onYearChange} />
      </div>

      <HeroStatsRow stats={data.heroStats} />
      <MonthlyBreakdownChart totals={data.monthlyTotals} />
      <StitchingPace pace={data.monthlyPace} />
      <ProjectTimeline entries={data.projectTimeline} year={data.year} onNavigateToProject={onNavigateToProject} />
      <YearHighlights highlights={data.highlights} />
      <TopProjectsRanking projects={data.topProjects} onNavigateToProject={onNavigateToProject} />
      <FavouriteSupplies supplies={data.favouriteSupplies} />
      <NewThisYearSection data={data.newThisYear} year={data.year} />
    </div>
  )
}

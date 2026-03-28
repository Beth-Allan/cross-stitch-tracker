import { useState } from 'react'
import { ChevronUp, ChevronDown, Clock, Calendar, Check, Circle, Minus, Scissors, Sparkles } from 'lucide-react'
import type {
  GalleryCardData,
  WIPCardData,
  UnstartedCardData,
  FinishedCardData,
  GalleryGridProps,
  ProjectStatus,
} from '../types'
import { GalleryCard } from './GalleryCard'

/* ── Helpers ───────────────────────────────────────────── */

function formatNumber(n: number): string {
  return n.toLocaleString()
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

function daysAgo(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24))
}

function timeOrDays(card: { totalTimeMinutes: number; stitchingDays: number }): string {
  return card.totalTimeMinutes > 0 ? formatTime(card.totalTimeMinutes) : `${card.stitchingDays} days`
}

const statusLabels: Record<ProjectStatus, string> = {
  'Unstarted': 'Unstarted',
  'Kitting': 'Kitting',
  'Kitted': 'Ready',
  'In Progress': 'Stitching',
  'On Hold': 'On Hold',
  'Finished': 'Finished',
  'FFO': 'FFO',
}

const statusDotColors: Record<ProjectStatus, string> = {
  'Unstarted': 'bg-stone-400',
  'Kitting': 'bg-amber-500',
  'Kitted': 'bg-emerald-500',
  'In Progress': 'bg-sky-500',
  'On Hold': 'bg-orange-400',
  'Finished': 'bg-violet-500',
  'FFO': 'bg-rose-500',
}

/* ── Gallery (card grid) ───────────────────────────────── */

function GalleryView({ cards, onNavigateToProject }: { cards: GalleryCardData[]; onNavigateToProject?: (id: string) => void }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 340px))',
        gap: '20px',
      }}
    >
      {cards.map((card) => (
        <GalleryCard key={card.projectId} card={card} onNavigateToProject={onNavigateToProject} />
      ))}
    </div>
  )
}

/* ── List (compact rows with two lines) ────────────────── */

function ListContextLine({ card }: { card: GalleryCardData }) {
  if (card.statusGroup === 'wip') {
    const wip = card as WIPCardData
    return (
      <div className="text-[11px] text-stone-400 dark:text-stone-500" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
        <p>{formatNumber(wip.stitchesCompleted)} / {formatNumber(wip.stitchCount)}</p>
        <p>{timeOrDays(wip)}{wip.lastSessionDate ? ` · ${daysAgo(wip.lastSessionDate)}d ago` : ''}</p>
      </div>
    )
  }

  if (card.statusGroup === 'unstarted') {
    const u = card as UnstartedCardData
    return (
      <div className="text-[11px] text-stone-400 dark:text-stone-500" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
        <p>{formatNumber(card.stitchCount)} stitches</p>
        <p>{card.threadColourCount} colours{u.dateAdded ? ` · ${daysAgo(u.dateAdded)}d ago` : ''}</p>
      </div>
    )
  }

  const f = card as FinishedCardData
  return (
    <div className="text-[11px] text-stone-400 dark:text-stone-500" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
      <p>{formatNumber(card.stitchCount)} · {card.threadColourCount} colours</p>
      <p>{timeOrDays(f)}{f.startToFinishDays != null ? ` · ${f.startToFinishDays}d total` : ''}</p>
    </div>
  )
}

function ListRow({ card, onNavigateToProject }: { card: GalleryCardData; onNavigateToProject?: (id: string) => void }) {
  return (
    <div
      className="bg-white dark:bg-stone-900 border-b border-stone-100 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors"
      style={{
        display: 'grid',
        gridTemplateColumns: '8px minmax(180px, 2fr) minmax(120px, 1fr) minmax(100px, 120px) 64px 56px',
        gap: '0 16px',
        padding: '10px 16px',
        alignItems: 'center',
      }}
    >
      {/* 1. Status dot */}
      <span className={`w-2 h-2 rounded-full ${statusDotColors[card.status]}`} />

      {/* 2. Name + designer */}
      <div style={{ minWidth: 0 }}>
        <button
          onClick={() => onNavigateToProject?.(card.projectId)}
          className="text-sm font-medium text-stone-900 dark:text-stone-100 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors underline decoration-stone-300 dark:decoration-stone-600 underline-offset-2 hover:decoration-emerald-500 truncate block"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          {card.projectName}
        </button>
        <p className="text-[12px] text-stone-400 dark:text-stone-500 truncate" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
          {card.designerName}
        </p>
      </div>

      {/* 3. Context stats */}
      <div style={{ minWidth: 0 }}>
        <ListContextLine card={card} />
      </div>

      {/* 4. Progress / kitting / finish date */}
      <div>
        {card.statusGroup === 'wip' && (
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 dark:bg-emerald-400 rounded-full"
                style={{ width: `${(card as WIPCardData).progressPercent}%` }}
              />
            </div>
            <span
              className="text-xs text-emerald-600 dark:text-emerald-400 tabular-nums"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {(card as WIPCardData).progressPercent}%
            </span>
          </div>
        )}
        {card.statusGroup === 'unstarted' && (() => {
          const u = card as UnstartedCardData
          const items = [
            { label: 'Fabric', status: u.fabricStatus },
            { label: 'Thread', status: u.threadStatus },
            { label: 'Beads', status: u.beadsStatus },
            { label: 'Specialty', status: u.specialtyStatus },
          ]
          return (
            <div className="flex items-center gap-1">
              {items.map((item) => {
                const tooltip = item.status === 'fulfilled'
                  ? `${item.label}: Ready`
                  : item.status === 'not-applicable'
                    ? `${item.label}: N/A`
                    : `${item.label}: Needed`
                return (
                  <span key={item.label} title={tooltip} className="cursor-help">
                    {item.status === 'fulfilled'
                      ? <Check className="w-3 h-3 text-emerald-500 dark:text-emerald-400" strokeWidth={2.5} />
                      : item.status === 'not-applicable'
                        ? <Minus className="w-3 h-3 text-stone-300 dark:text-stone-600" strokeWidth={2} />
                        : <Circle className="w-3 h-3 text-stone-400 dark:text-stone-500" strokeWidth={2} />
                    }
                  </span>
                )
              })}
            </div>
          )
        })()}
        {card.statusGroup === 'finished' && (
          <div style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
            <span className="text-[11px] text-stone-500 dark:text-stone-400">
              {(card as FinishedCardData).finishDate ? formatDate((card as FinishedCardData).finishDate!) : '—'}
            </span>
            <p className="text-[10px] text-stone-400 dark:text-stone-500">Finished</p>
          </div>
        )}
      </div>

      {/* 5. Status label */}
      <span className="text-xs text-stone-500 dark:text-stone-400 whitespace-nowrap" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
        {statusLabels[card.status]}
      </span>

      {/* 6. Size badge */}
      <span
        className="text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 text-center"
      >
        {card.sizeCategory}
      </span>
    </div>
  )
}

function ListView({ cards, onNavigateToProject }: { cards: GalleryCardData[]; onNavigateToProject?: (id: string) => void }) {
  return (
    <div className="rounded-xl border border-stone-200 dark:border-stone-800 overflow-hidden">
      {cards.map((card) => (
        <ListRow key={card.projectId} card={card} onNavigateToProject={onNavigateToProject} />
      ))}
    </div>
  )
}

/* ── Table (full data table with sorting) ──────────────── */

type SortField = 'name' | 'designer' | 'status' | 'size' | 'progress' | 'stitches' | 'colours'
type SortDir = 'asc' | 'desc'

const sizeOrder = { 'Mini': 0, 'Small': 1, 'Medium': 2, 'Large': 3, 'BAP': 4 }

function getProgress(card: GalleryCardData): number {
  if (card.statusGroup === 'wip') return (card as WIPCardData).progressPercent
  if (card.statusGroup === 'finished') return 100
  return 0
}

function sortCards(cards: GalleryCardData[], field: SortField, dir: SortDir): GalleryCardData[] {
  const sorted = [...cards].sort((a, b) => {
    let cmp = 0
    switch (field) {
      case 'name': cmp = a.projectName.localeCompare(b.projectName); break
      case 'designer': cmp = a.designerName.localeCompare(b.designerName); break
      case 'status': cmp = a.status.localeCompare(b.status); break
      case 'size': cmp = sizeOrder[a.sizeCategory] - sizeOrder[b.sizeCategory]; break
      case 'progress': cmp = getProgress(a) - getProgress(b); break
      case 'stitches': cmp = a.stitchCount - b.stitchCount; break
      case 'colours': cmp = a.threadColourCount - b.threadColourCount; break
    }
    return dir === 'desc' ? -cmp : cmp
  })
  return sorted
}

function SortHeader({ label, field, current, dir, onSort }: {
  label: string; field: SortField; current: SortField; dir: SortDir; onSort: (f: SortField) => void
}) {
  const isActive = current === field
  return (
    <button
      onClick={() => onSort(field)}
      className="inline-flex items-center gap-1 text-xs font-medium text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors whitespace-nowrap"
      style={{ fontFamily: "'Source Sans 3', sans-serif" }}
    >
      {label}
      {isActive && (dir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
    </button>
  )
}

function getTimeOrDaysDisplay(card: GalleryCardData): string {
  if (card.statusGroup === 'wip') {
    const wip = card as WIPCardData
    return wip.totalTimeMinutes > 0 ? formatTime(wip.totalTimeMinutes) : `${wip.stitchingDays}d`
  }
  if (card.statusGroup === 'finished') {
    const fin = card as FinishedCardData
    return fin.totalTimeMinutes > 0 ? formatTime(fin.totalTimeMinutes) : `${fin.stitchingDays}d`
  }
  return '—'
}

function getLastActivityDisplay(card: GalleryCardData): string {
  if (card.statusGroup === 'wip') {
    const wip = card as WIPCardData
    return wip.lastSessionDate ? `${daysAgo(wip.lastSessionDate)}d ago` : '—'
  }
  if (card.statusGroup === 'unstarted') {
    const u = card as UnstartedCardData
    return u.dateAdded ? `${daysAgo(u.dateAdded)}d ago` : '—'
  }
  if (card.statusGroup === 'finished') {
    const f = card as FinishedCardData
    return f.finishDate ? formatDate(f.finishDate) : '—'
  }
  return '—'
}

function getLastActivityLabel(card: GalleryCardData): string {
  if (card.statusGroup === 'wip') return 'Last stitched'
  if (card.statusGroup === 'unstarted') return 'Added'
  return 'Finished'
}

function TableView({ cards, onNavigateToProject }: { cards: GalleryCardData[]; onNavigateToProject?: (id: string) => void }) {
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  const sorted = sortCards(cards, sortField, sortDir)

  return (
    <div className="rounded-xl border border-stone-200 dark:border-stone-800 overflow-x-auto">
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr className="border-b border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50">
            <th style={{ padding: '10px 16px', textAlign: 'left' }}>
              <SortHeader label="Project" field="name" current={sortField} dir={sortDir} onSort={handleSort} />
            </th>
            <th style={{ padding: '10px 16px', textAlign: 'left' }} className="max-md:hidden">
              <SortHeader label="Designer" field="designer" current={sortField} dir={sortDir} onSort={handleSort} />
            </th>
            <th style={{ padding: '10px 16px', textAlign: 'left' }}>
              <SortHeader label="Status" field="status" current={sortField} dir={sortDir} onSort={handleSort} />
            </th>
            <th style={{ padding: '10px 16px', textAlign: 'left' }} className="max-sm:hidden">
              <SortHeader label="Size" field="size" current={sortField} dir={sortDir} onSort={handleSort} />
            </th>
            <th style={{ padding: '10px 16px', textAlign: 'left' }} className="max-sm:hidden">
              <SortHeader label="Progress" field="progress" current={sortField} dir={sortDir} onSort={handleSort} />
            </th>
            <th style={{ padding: '10px 16px', textAlign: 'right' }} className="max-lg:hidden">
              <SortHeader label="Stitches" field="stitches" current={sortField} dir={sortDir} onSort={handleSort} />
            </th>
            <th style={{ padding: '10px 16px', textAlign: 'right' }} className="max-lg:hidden">
              <SortHeader label="Colours" field="colours" current={sortField} dir={sortDir} onSort={handleSort} />
            </th>
            <th style={{ padding: '10px 16px', textAlign: 'right' }} className="max-lg:hidden">
              <span className="text-xs font-medium text-stone-500 dark:text-stone-400" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                Time / Days
              </span>
            </th>
            <th style={{ padding: '10px 16px', textAlign: 'right' }} className="max-xl:hidden">
              <span className="text-xs font-medium text-stone-500 dark:text-stone-400" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                Activity
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((card) => {
            const progress = getProgress(card)

            return (
              <tr
                key={card.projectId}
                className="border-b border-stone-100 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors"
              >
                <td style={{ padding: '10px 16px' }}>
                  <button
                    onClick={() => onNavigateToProject?.(card.projectId)}
                    className="text-sm font-medium text-stone-900 dark:text-stone-100 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors underline decoration-stone-300 dark:decoration-stone-600 underline-offset-2 hover:decoration-emerald-500"
                    style={{ fontFamily: "'Fraunces', serif" }}
                  >
                    {card.projectName}
                  </button>
                  <p className="text-[11px] text-stone-400 dark:text-stone-500 md:hidden" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                    {card.designerName}
                  </p>
                </td>
                <td style={{ padding: '10px 16px' }} className="max-md:hidden">
                  <span className="text-sm text-stone-600 dark:text-stone-400" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                    {card.designerName}
                  </span>
                </td>
                <td style={{ padding: '10px 16px' }}>
                  <span className="inline-flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-400" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusDotColors[card.status]}`} />
                    {statusLabels[card.status]}
                  </span>
                </td>
                <td style={{ padding: '10px 16px' }} className="max-sm:hidden">
                  <span className="text-xs text-stone-500 dark:text-stone-400" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                    {card.sizeCategory}
                  </span>
                </td>
                <td style={{ padding: '10px 16px' }} className="max-sm:hidden">
                  {card.statusGroup === 'wip' ? (
                    <div className="flex items-center gap-2" style={{ width: '100px' }}>
                      <div className="flex-1 h-1.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 dark:bg-emerald-400 rounded-full"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span
                        className="text-xs text-emerald-600 dark:text-emerald-400 tabular-nums"
                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                      >
                        {progress}%
                      </span>
                    </div>
                  ) : card.statusGroup === 'finished' ? (
                    <span className="text-xs text-violet-600 dark:text-violet-400" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      100%
                    </span>
                  ) : (
                    <span className="text-xs text-stone-400 dark:text-stone-500">—</span>
                  )}
                </td>
                <td style={{ padding: '10px 16px', textAlign: 'right' }} className="max-lg:hidden">
                  <span className="text-xs text-stone-500 dark:text-stone-400 tabular-nums" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                    {card.statusGroup === 'wip'
                      ? `${formatNumber((card as WIPCardData).stitchesCompleted)} / ${formatNumber(card.stitchCount)}`
                      : formatNumber(card.stitchCount)
                    }
                  </span>
                </td>
                <td style={{ padding: '10px 16px', textAlign: 'right' }} className="max-lg:hidden">
                  <span className="text-xs text-stone-500 dark:text-stone-400 tabular-nums" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                    {card.threadColourCount}
                  </span>
                </td>
                <td style={{ padding: '10px 16px', textAlign: 'right' }} className="max-lg:hidden">
                  <span className="text-xs text-stone-500 dark:text-stone-400 tabular-nums" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                    {getTimeOrDaysDisplay(card)}
                  </span>
                </td>
                <td style={{ padding: '10px 16px', textAlign: 'right' }} className="max-xl:hidden">
                  <div>
                    <span className="text-xs text-stone-500 dark:text-stone-400" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                      {getLastActivityDisplay(card)}
                    </span>
                    <p className="text-[10px] text-stone-400 dark:text-stone-500" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                      {getLastActivityLabel(card)}
                    </p>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

/* ── Main GalleryGrid ──────────────────────────────────── */

export function GalleryGrid({ cards, viewMode, onNavigateToProject, onViewModeChange }: GalleryGridProps) {
  if (cards.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 16px', gap: '12px' }}>
        <Scissors className="w-10 h-10 text-stone-300 dark:text-stone-600" strokeWidth={1} />
        <p className="text-sm text-stone-400 dark:text-stone-500" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
          No projects match your filters
        </p>
      </div>
    )
  }

  switch (viewMode) {
    case 'gallery':
      return <GalleryView cards={cards} onNavigateToProject={onNavigateToProject} />
    case 'list':
      return <ListView cards={cards} onNavigateToProject={onNavigateToProject} />
    case 'table':
      return <TableView cards={cards} onNavigateToProject={onNavigateToProject} />
  }
}

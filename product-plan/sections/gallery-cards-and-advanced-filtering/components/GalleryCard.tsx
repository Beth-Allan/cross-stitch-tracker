import { useState } from 'react'
import { Scissors, Clock, Calendar, Check, Circle, Minus, Sparkles } from 'lucide-react'
import type {
  GalleryCardData,
  WIPCardData,
  UnstartedCardData,
  FinishedCardData,
  ProjectStatus,
  KittingItemStatus,
  PrepStep,
  GalleryCardProps,
} from '../types'

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

const statusBadgeStyles: Record<ProjectStatus, { bg: string; text: string; dot: string }> = {
  'Unstarted':   { bg: 'bg-stone-100 dark:bg-stone-800',        text: 'text-stone-600 dark:text-stone-400',   dot: 'bg-stone-400 dark:bg-stone-500' },
  'Kitting':     { bg: 'bg-amber-50 dark:bg-amber-950/40',      text: 'text-amber-700 dark:text-amber-400',   dot: 'bg-amber-500 dark:bg-amber-400' },
  'Kitted':      { bg: 'bg-emerald-50 dark:bg-emerald-950/40',  text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500 dark:bg-emerald-400' },
  'In Progress': { bg: 'bg-sky-50 dark:bg-sky-950/40',          text: 'text-sky-700 dark:text-sky-400',       dot: 'bg-sky-500 dark:bg-sky-400' },
  'On Hold':     { bg: 'bg-orange-50 dark:bg-orange-950/40',    text: 'text-orange-700 dark:text-orange-400', dot: 'bg-orange-400 dark:bg-orange-400' },
  'Finished':    { bg: 'bg-violet-50 dark:bg-violet-950/40',    text: 'text-violet-700 dark:text-violet-400', dot: 'bg-violet-500 dark:bg-violet-400' },
  'FFO':         { bg: 'bg-rose-50 dark:bg-rose-950/40',        text: 'text-rose-700 dark:text-rose-400',     dot: 'bg-rose-500 dark:bg-rose-400' },
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

/* ── Prep pipeline ─────────────────────────────────────── */

const allPrepSteps: PrepStep[] = [
  'Added',
  'Want To Buy',
  'Hard Copy In Stash',
  'In Project Bag',
  'Digital Working Copy Ready',
  'Kitting Up',
  'App Loading Queue',
  'Loaded Into App',
  'Onion Skin Queue',
  'Ready To Start',
]

function getPrepStepsForProject(needsOnionSkinning: boolean): PrepStep[] {
  if (needsOnionSkinning) return allPrepSteps
  return allPrepSteps.filter((s) => s !== 'Onion Skin Queue')
}

function getPrepProgress(prepStep: PrepStep, needsOnionSkinning: boolean): { current: number; total: number } {
  const steps = getPrepStepsForProject(needsOnionSkinning)
  const idx = steps.indexOf(prepStep)
  return { current: idx + 1, total: steps.length }
}

const prepStepShortLabels: Record<PrepStep, string> = {
  'Added': 'Added',
  'Want To Buy': 'Want to Buy',
  'Hard Copy In Stash': 'Hard Copy in Stash',
  'In Project Bag': 'In Project Bag',
  'Digital Working Copy Ready': 'Digital Copy Ready',
  'Kitting Up': 'Kitting Up',
  'App Loading Queue': 'App Loading Queue',
  'Loaded Into App': 'Loaded into App',
  'Onion Skin Queue': 'Needs Onion Skinning',
  'Ready To Start': 'Ready to Start',
}

/* ── Helpers ───────────────────────────────────────────── */

function formatNumber(n: number): string {
  return n.toLocaleString()
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

/* ── Shared sub-components ─────────────────────────────── */

function CoverPlaceholder({ status }: { status: ProjectStatus }) {
  const [from, to] = statusGradients[status]
  return (
    <div
      className="w-full h-full flex items-center justify-center"
      style={{ background: `linear-gradient(160deg, ${from} 0%, ${to} 100%)` }}
    >
      <Scissors className="w-8 h-8 text-stone-400/25" strokeWidth={1} />
    </div>
  )
}

function StatusBadge({ status }: { status: ProjectStatus }) {
  const s = statusBadgeStyles[status]
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full text-xs font-medium px-2 py-0.5 ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {statusLabels[status]}
    </span>
  )
}

function GenreTags({ genres }: { genres: string[] }) {
  const visible = genres.slice(0, 3)
  const extra = genres.length - 3
  if (visible.length === 0) return null
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {visible.map((g) => (
        <span key={g} className="text-[11px] px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
          {g}
        </span>
      ))}
      {extra > 0 && (
        <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-500">
          +{extra}
        </span>
      )}
    </div>
  )
}

function StitchCount({ count, completed, approximate }: { count: number; completed?: number; approximate?: boolean }) {
  return (
    <p className="text-[12px] text-stone-400 dark:text-stone-500" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
      {completed != null
        ? <>{formatNumber(completed)} / {formatNumber(count)} stitches</>
        : <>{formatNumber(count)} stitches{approximate ? ' (approx.)' : ''}</>
      }
    </p>
  )
}

function SupplySummary({ threadColourCount, beadTypeCount, specialtyItemCount }: { threadColourCount: number; beadTypeCount: number; specialtyItemCount: number }) {
  const parts: string[] = []
  parts.push(`${threadColourCount} colours`)
  if (beadTypeCount > 0) parts.push(`${beadTypeCount} bead types`)
  if (specialtyItemCount > 0) parts.push(`${specialtyItemCount} specialty`)
  return (
    <p className="text-[11px] text-stone-400 dark:text-stone-500" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
      {parts.join(' · ')}
    </p>
  )
}

function daysAgo(dateStr: string): number {
  const d = new Date(dateStr)
  const now = new Date()
  return Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
}

/* ── Celebration border for Finished / FFO ─────────────── */

function celebrationBorder(status: ProjectStatus): string {
  if (status === 'Finished') return '2px solid rgb(139 92 246)'
  if (status === 'FFO') return '2px solid rgb(244 63 94)'
  return '1px solid transparent'
}

function celebrationRing(status: ProjectStatus): string {
  if (status === 'Finished') return '0 0 0 1px rgb(139 92 246 / 0.15), 0 0 12px rgb(139 92 246 / 0.08)'
  if (status === 'FFO') return '0 0 0 1px rgb(244 63 94 / 0.15), 0 0 12px rgb(244 63 94 / 0.08)'
  return 'none'
}

/* ── WIP Card Footer ───────────────────────────────────── */

function WIPFooter({ card }: { card: WIPCardData }) {
  const tracksTime = card.totalTimeMinutes > 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* Progress bar */}
      <div className="flex items-center gap-2.5">
        <div className="flex-1 h-1.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 dark:bg-emerald-400 rounded-full transition-all duration-300"
            style={{ width: `${card.progressPercent}%` }}
          />
        </div>
        <span
          className="text-xs font-medium text-emerald-600 dark:text-emerald-400 tabular-nums"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          {card.progressPercent}%
        </span>
      </div>

      {/* Stitch progress */}
      <p className="text-[11px] text-stone-500 dark:text-stone-400" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
        {formatNumber(card.stitchesCompleted)} / {formatNumber(card.stitchCount)} stitches
      </p>

      {/* Stats row */}
      <div className="flex items-center gap-3 text-[11px] text-stone-500 dark:text-stone-400" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
        {/* Time or stitching days */}
        <span className="inline-flex items-center gap-1">
          <Clock className="w-3 h-3" strokeWidth={1.5} />
          {tracksTime ? formatTime(card.totalTimeMinutes) : `${card.stitchingDays} stitching days`}
        </span>
        {/* Last stitched date (labeled, with days ago) */}
        {card.lastSessionDate && (
          <span className="inline-flex items-center gap-1">
            <Calendar className="w-3 h-3" strokeWidth={1.5} />
            Last stitched {formatDate(card.lastSessionDate)} ({daysAgo(card.lastSessionDate)}d ago)
          </span>
        )}
      </div>
    </div>
  )
}

/* ── Three-state kitting dots ──────────────────────────── */

function KittingDotIcon({ status }: { status: KittingItemStatus }) {
  switch (status) {
    case 'fulfilled':
      return <Check className="w-3 h-3 text-emerald-500 dark:text-emerald-400" strokeWidth={2.5} />
    case 'needed':
      return <Circle className="w-3 h-3 text-stone-400 dark:text-stone-500" strokeWidth={2} />
    case 'not-applicable':
      return <Minus className="w-3 h-3 text-stone-300 dark:text-stone-600" strokeWidth={2} />
  }
}

function KittingDots({ card }: { card: UnstartedCardData }) {
  const items: { label: string; status: KittingItemStatus }[] = [
    { label: 'Fabric', status: card.fabricStatus },
    { label: 'Thread', status: card.threadStatus },
    { label: 'Beads', status: card.beadsStatus },
    { label: 'Specialty', status: card.specialtyStatus },
  ]
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      {items.map((item) => {
        const tooltip = item.status === 'fulfilled'
          ? `${item.label}: Ready`
          : item.status === 'not-applicable'
            ? `${item.label}: Not needed for this project`
            : `${item.label}: Still needed`
        return (
          <div key={item.label} className="flex items-center gap-1 cursor-help" title={tooltip}>
            <KittingDotIcon status={item.status} />
            <span
              className={`text-[10px] ${
                item.status === 'not-applicable'
                  ? 'text-stone-300 dark:text-stone-600 line-through'
                  : 'text-stone-500 dark:text-stone-400'
              }`}
              style={{ fontFamily: "'Source Sans 3', sans-serif" }}
            >
              {item.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

/* ── Prep step indicator ───────────────────────────────── */

function PrepStepIndicator({ card }: { card: UnstartedCardData }) {
  const { current, total } = getPrepProgress(card.prepStep, card.needsOnionSkinning)
  const isReady = card.prepStep === 'Ready To Start'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {/* Step label + fraction */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span
          className={`text-[11px] font-medium ${
            isReady
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-stone-600 dark:text-stone-300'
          }`}
          style={{ fontFamily: "'Source Sans 3', sans-serif" }}
        >
          {prepStepShortLabels[card.prepStep]}
        </span>
        <span
          className="text-[10px] text-stone-400 dark:text-stone-500 tabular-nums"
          style={{ fontFamily: "'Source Sans 3', sans-serif" }}
        >
          {current}/{total}
        </span>
      </div>

      {/* Mini track */}
      <div style={{ display: 'flex', gap: '2px' }}>
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            className={`h-1 rounded-full ${
              i < current
                ? isReady
                  ? 'bg-emerald-400 dark:bg-emerald-500'
                  : 'bg-amber-400 dark:bg-amber-500'
                : 'bg-stone-200 dark:bg-stone-700'
            }`}
            style={{ flex: 1 }}
          />
        ))}
      </div>
    </div>
  )
}

/* ── Unstarted Card Footer ─────────────────────────────── */

function UnstartedFooter({ card }: { card: UnstartedCardData }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* Supply summary */}
      <SupplySummary
        threadColourCount={card.threadColourCount}
        beadTypeCount={card.beadTypeCount}
        specialtyItemCount={card.specialtyItemCount}
      />

      {/* Kitting supply dots */}
      <KittingDots card={card} />

      {/* Prep pipeline indicator */}
      <PrepStepIndicator card={card} />

      {/* Fabric needs callout */}
      {card.fabricNeeds && (
        <p className="text-[11px] text-amber-700 dark:text-amber-400" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
          {card.fabricNeeds}
        </p>
      )}

      {/* Added date */}
      {card.dateAdded && (
        <p className="text-[10px] text-stone-400 dark:text-stone-500" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
          Added {formatDate(card.dateAdded)} ({daysAgo(card.dateAdded)} days ago)
        </p>
      )}
    </div>
  )
}

/* ── Finished Card Footer ──────────────────────────────── */

function FinishedFooter({ card }: { card: FinishedCardData }) {
  const dateLabel = card.ffoDate
    ? `FFO ${formatDate(card.ffoDate)}`
    : card.finishDate
      ? `Finished ${formatDate(card.finishDate)}`
      : null

  const tracksTime = card.totalTimeMinutes > 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* Complete progress bar */}
      <div className="flex items-center gap-2.5">
        <div className="flex-1 h-1.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full w-full ${
              card.status === 'FFO'
                ? 'bg-rose-500 dark:bg-rose-400'
                : 'bg-violet-500 dark:bg-violet-400'
            }`}
          />
        </div>
        <span
          className={`text-xs font-medium tabular-nums ${
            card.status === 'FFO'
              ? 'text-rose-600 dark:text-rose-400'
              : 'text-violet-600 dark:text-violet-400'
          }`}
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          100%
        </span>
      </div>

      {/* Completion date */}
      {dateLabel && (
        <div className="flex items-center gap-1 text-[11px] text-stone-500 dark:text-stone-400" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
          <Sparkles className="w-3 h-3" strokeWidth={1.5} />
          {dateLabel}
        </div>
      )}

      {/* Stitching stats grid */}
      <div
        className="text-[11px] text-stone-500 dark:text-stone-400"
        style={{ fontFamily: "'Source Sans 3', sans-serif", display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 12px' }}
      >
        {card.startToFinishDays != null && (
          <>
            <span className="text-stone-400 dark:text-stone-500">Start to finish</span>
            <span>{card.startToFinishDays} days</span>
          </>
        )}
        <span className="text-stone-400 dark:text-stone-500">Stitching days</span>
        <span>{card.stitchingDays}</span>
        {tracksTime && (
          <>
            <span className="text-stone-400 dark:text-stone-500">Total time</span>
            <span>{formatTime(card.totalTimeMinutes)}</span>
          </>
        )}
        {card.avgDailyStitches != null && (
          <>
            <span className="text-stone-400 dark:text-stone-500">Avg daily</span>
            <span>{formatNumber(card.avgDailyStitches)} stitches</span>
          </>
        )}
        <span className="text-stone-400 dark:text-stone-500">Colours</span>
        <span>{card.threadColourCount} DMC</span>
      </div>
    </div>
  )
}

/* ── Main GalleryCard ──────────────────────────────────── */

export function GalleryCard({ card, onNavigateToProject }: GalleryCardProps) {
  const [imgFailed, setImgFailed] = useState(false)

  // Determine which image to show
  let imageUrl: string | null = null
  if (card.statusGroup === 'wip' && card.latestPhotoUrl) {
    imageUrl = card.latestPhotoUrl
  } else if (card.statusGroup === 'finished' && card.finalPhotoUrl) {
    imageUrl = card.finalPhotoUrl
  } else if (card.coverImageUrl) {
    imageUrl = card.coverImageUrl
  }
  const hasRealImage = !!imageUrl && !imgFailed

  const isFinishedGroup = card.statusGroup === 'finished'

  return (
    <div
      className="group rounded-xl overflow-hidden transition-all duration-200 hover:shadow-lg hover:shadow-stone-900/8 dark:hover:shadow-black/30 hover:-translate-y-1"
      style={{
        display: 'flex',
        flexDirection: 'column',
        border: isFinishedGroup ? celebrationBorder(card.status) : '1px solid rgb(214 211 209 / 0.8)',
        boxShadow: isFinishedGroup ? celebrationRing(card.status) : undefined,
      }}
    >
      {/* Cover image area */}
      <div className="aspect-[4/3] relative overflow-hidden">
        {hasRealImage ? (
          <img
            src={imageUrl!}
            alt={card.projectName}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <CoverPlaceholder status={card.status} />
        )}

        {/* Gradient overlay on real images */}
        {hasRealImage && (
          <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/20 to-transparent" />
        )}

        {/* Status badge — top left */}
        <div className="absolute top-3 left-3">
          <StatusBadge status={card.status} />
        </div>

        {/* Size category — top right */}
        <div className="absolute top-3 right-3">
          <span className="text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full bg-white/80 dark:bg-stone-900/80 text-stone-600 dark:text-stone-300 backdrop-blur-sm">
            {card.sizeCategory}
          </span>
        </div>

        {/* "Up next" pill for kitted projects */}
        {card.statusGroup === 'unstarted' && card.status === 'Kitted' && (card as UnstartedCardData).wantToStartNext && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-emerald-600 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            Up next
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="bg-white dark:bg-stone-900 relative" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
        {/* Project name (clickable link) */}
        <button
          onClick={() => onNavigateToProject?.(card.projectId)}
          className="text-left font-semibold text-stone-900 dark:text-stone-100 leading-snug line-clamp-2 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors text-[15px] underline decoration-stone-300 dark:decoration-stone-600 underline-offset-2 hover:decoration-emerald-500 dark:hover:decoration-emerald-400"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          {card.projectName}
        </button>

        {/* Designer */}
        <p className="text-[13px] text-stone-500 dark:text-stone-400 truncate" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
          {card.designerName}
        </p>

        {/* Stitch count — on all cards (WIP shows completed/total in footer instead) */}
        {card.statusGroup !== 'wip' && (
          <StitchCount count={card.stitchCount} approximate={card.stitchCountApproximate} />
        )}

        {/* Genre tags */}
        <GenreTags genres={card.genres} />

        {/* Spacer to push footer down */}
        <div style={{ flex: 1, minHeight: '4px' }} />

        {/* Status-specific footer */}
        {card.statusGroup === 'wip' && <WIPFooter card={card as WIPCardData} />}
        {card.statusGroup === 'unstarted' && <UnstartedFooter card={card as UnstartedCardData} />}
        {card.statusGroup === 'finished' && <FinishedFooter card={card as FinishedCardData} />}
      </div>
    </div>
  )
}

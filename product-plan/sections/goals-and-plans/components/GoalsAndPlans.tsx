import { useState, useMemo } from 'react'
import {
  Target,
  CalendarDays,
  RotateCcw,
  Trophy,
  Plus,
  ChevronDown,
  ChevronRight,
  Check,
  Pause,
  Play,
  SkipForward,
  Scissors,
  Clock,
  Flame,
  Sparkles,
  Zap,
  CheckCircle2,
  Crown,
  Rocket,
  Gem,
  Palette,
  Medal,
  Star,
  CalendarCheck,
  Lock,
  Search,
  Filter,
  RefreshCw,
  ArrowRight,
  GripVertical,
  Shuffle,
  Sun,
  Repeat,
  Circle,
  AlertCircle,
  X,
  Pencil,
  Trash2,
} from 'lucide-react'
import type {
  GoalsAndPlansProps,
  Goal,
  Plan,
  Rotation,
  RotationProject,
  Achievement,
  GoalStatus,
  GoalPeriod,
  GoalType,
  PlanType,
  PlanStatus,
  RotationStyle,
  RotationStatus,
  TurnTriggerType,
  AchievementCategory,
  ProjectSummary,
} from '../types'

/* ── Status colour map ─────────────────────────────────── */

type ProjectStatusKey = 'Unstarted' | 'Kitting' | 'Kitted' | 'In Progress' | 'On Hold' | 'Finished' | 'FFO'

const statusGradients: Record<ProjectStatusKey, [string, string]> = {
  'Unstarted':   ['#e7e5e4', '#d6d3d1'],
  'Kitting':     ['#fef3c7', '#fde68a'],
  'Kitted':      ['#d1fae5', '#a7f3d0'],
  'In Progress': ['#e0f2fe', '#bae6fd'],
  'On Hold':     ['#ffedd5', '#fed7aa'],
  'Finished':    ['#ede9fe', '#ddd6fe'],
  'FFO':         ['#ffe4e6', '#fecdd3'],
}

/* ── Helpers ───────────────────────────────────────────── */

function fmt(n: number): string { return n.toLocaleString() }

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' })
}

function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
}

function daysAgo(dateStr: string): number {
  return Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24))
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

function CoverPlaceholder({ status, size = 36 }: { status: string; size?: number }) {
  const [from, to] = statusGradients[status as ProjectStatusKey] ?? statusGradients['Unstarted']
  return (
    <div
      className="flex items-center justify-center rounded-md shrink-0"
      style={{ width: size, height: size, minWidth: size, background: `linear-gradient(160deg, ${from} 0%, ${to} 100%)` }}
    >
      <Scissors style={{ width: size * 0.4, height: size * 0.4 }} className="text-stone-400/25" strokeWidth={1} />
    </div>
  )
}

/* ── Period badges ─────────────────────────────────────── */

const periodStyles: Record<GoalPeriod, { bg: string; text: string }> = {
  oneTime:   { bg: 'bg-stone-100 dark:bg-stone-800',           text: 'text-stone-600 dark:text-stone-400' },
  daily:     { bg: 'bg-sky-50 dark:bg-sky-950/40',             text: 'text-sky-700 dark:text-sky-400' },
  weekly:    { bg: 'bg-emerald-50 dark:bg-emerald-950/40',     text: 'text-emerald-700 dark:text-emerald-400' },
  monthly:   { bg: 'bg-amber-50 dark:bg-amber-950/40',         text: 'text-amber-700 dark:text-amber-400' },
  quarterly: { bg: 'bg-violet-50 dark:bg-violet-950/40',       text: 'text-violet-700 dark:text-violet-400' },
  yearly:    { bg: 'bg-rose-50 dark:bg-rose-950/40',           text: 'text-rose-700 dark:text-rose-400' },
}

const periodLabels: Record<GoalPeriod, string> = {
  oneTime: 'One-time', daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly', quarterly: 'Quarterly', yearly: 'Yearly',
}

/* ── Status badges ─────────────────────────────────────── */

const goalStatusStyles: Record<GoalStatus, { bg: string; text: string; dot: string }> = {
  active:    { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
  completed: { bg: 'bg-violet-50 dark:bg-violet-950/40',   text: 'text-violet-700 dark:text-violet-400',   dot: 'bg-violet-500' },
  expired:   { bg: 'bg-stone-100 dark:bg-stone-800',       text: 'text-stone-500 dark:text-stone-400',     dot: 'bg-stone-400' },
  paused:    { bg: 'bg-amber-50 dark:bg-amber-950/40',     text: 'text-amber-700 dark:text-amber-400',     dot: 'bg-amber-500' },
}

const goalStatusLabels: Record<GoalStatus, string> = {
  active: 'Active', completed: 'Completed', expired: 'Expired', paused: 'Paused',
}

/* ── Goal type labels ──────────────────────────────────── */

const goalTypeLabels: Record<GoalType, string> = {
  milestone: 'Milestone',
  frequency: 'Frequency',
  deadline: 'Deadline',
  sessionCount: 'Sessions',
  volume: 'Volume',
  consistency: 'Consistency',
  projectCompletion: 'Completion',
  projectStart: 'Start',
  manual: 'Manual',
}

const goalTypeDescriptions: Record<GoalType, string> = {
  milestone: 'Reach a percentage or stitch count on a project',
  frequency: 'Stitch on a project X times per period',
  deadline: 'Finish or reach a milestone by a date',
  sessionCount: 'Complete X sessions on a project',
  volume: 'Stitch X stitches per period (all projects)',
  consistency: 'Stitch X days per period',
  projectCompletion: 'Finish X projects per period',
  projectStart: 'Start X new projects per period',
  manual: 'Custom goal you check off manually',
}

const goalTypeUnits: Record<GoalType, string> = {
  milestone: 'percent',
  frequency: 'sessions',
  deadline: 'percent',
  sessionCount: 'sessions',
  volume: 'stitches',
  consistency: 'days',
  projectCompletion: 'projects',
  projectStart: 'projects',
  manual: 'completed',
}

/* ── Plan type labels ──────────────────────────────────── */

const planTypeStyles: Record<PlanType, { bg: string; text: string; label: string }> = {
  startDate:         { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-400', label: 'Start Date' },
  recurringSchedule: { bg: 'bg-sky-50 dark:bg-sky-950/40',        text: 'text-sky-700 dark:text-sky-400',         label: 'Recurring' },
  deadline:          { bg: 'bg-amber-50 dark:bg-amber-950/40',    text: 'text-amber-700 dark:text-amber-400',     label: 'Deadline' },
  seasonalFocus:     { bg: 'bg-violet-50 dark:bg-violet-950/40',  text: 'text-violet-700 dark:text-violet-400',   label: 'Seasonal' },
}

const planStatusLabels: Record<string, string> = {
  upcoming: 'Upcoming', active: 'Active', completed: 'Completed', skipped: 'Skipped',
}

/* ── Rotation style labels ─────────────────────────────── */

const rotationStyleLabels: Record<RotationStyle, { label: string; description: string }> = {
  roundRobin:        { label: 'Round Robin',       description: 'Cycle through projects in order' },
  focusRotate:       { label: 'Focus + Rotate',    description: 'One focus project, others rotate around it' },
  dailyAssignment:   { label: 'Daily Assignment',  description: 'Assign projects to specific days' },
  milestoneRotation: { label: 'Milestone',         description: 'Stitch to a target, then rotate' },
  randomShuffle:     { label: 'Random Shuffle',    description: 'App picks your next project' },
  seasonalFocus:     { label: 'Seasonal Focus',    description: 'One primary project per season' },
}

const rotationStyleIcons: Record<RotationStyle, typeof RotateCcw> = {
  roundRobin: RotateCcw,
  focusRotate: Target,
  dailyAssignment: CalendarDays,
  milestoneRotation: Flame,
  randomShuffle: Shuffle,
  seasonalFocus: Sun,
}

/* ── Achievement icons ─────────────────────────────────── */

const achievementIcons: Record<string, typeof Trophy> = {
  'needle-thread': Scissors, 'star': Star, 'star-half': Star, 'trophy': Trophy,
  'flame': Flame, 'fire': Flame, 'medal': Medal, 'palette': Palette,
  'zap': Zap, 'bolt': Zap, 'check-circle': CheckCircle2, 'hand': Star,
  'crown': Crown, 'calendar-check': CalendarCheck, 'rocket': Rocket, 'gem': Gem,
}

const achievementCategoryLabels: Record<AchievementCategory, string> = {
  milestones: 'Milestones', streaks: 'Streaks', variety: 'Variety',
  records: 'Records', completion: 'Completion', dedication: 'Dedication',
}

const achievementCategoryIcons: Record<AchievementCategory, typeof Trophy> = {
  milestones: Sparkles, streaks: Flame, variety: Palette,
  records: Zap, completion: CheckCircle2, dedication: CalendarCheck,
}

const dayOfWeekLabels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const seasonLabels = ['Spring', 'Summer', 'Autumn', 'Winter']

/* ── Shared sub-components ─────────────────────────────── */

function GoalStatusBadge({ status }: { status: GoalStatus }) {
  const s = goalStatusStyles[status]
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full text-xs font-medium px-2 py-0.5 ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {goalStatusLabels[status]}
    </span>
  )
}

function PeriodBadge({ period }: { period: GoalPeriod }) {
  const s = periodStyles[period]
  return (
    <span className={`inline-flex items-center rounded-full text-xs font-medium px-2 py-0.5 ${s.bg} ${s.text}`}>
      {periodLabels[period]}
    </span>
  )
}

function PlanTypeBadge({ planType }: { planType: PlanType }) {
  const s = planTypeStyles[planType]
  return (
    <span className={`inline-flex items-center rounded-full text-xs font-medium px-2 py-0.5 ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  )
}

function ProgressBar({ current, target, colorClass = 'bg-emerald-500 dark:bg-emerald-400' }: { current: number; target: number; colorClass?: string }) {
  const pct = Math.min(100, Math.round((current / target) * 100))
  return (
    <div className="w-full bg-stone-100 dark:bg-stone-800 rounded-full" style={{ height: 6 }}>
      <div className={`rounded-full transition-all duration-500 ${colorClass}`} style={{ width: `${pct}%`, height: '100%' }} />
    </div>
  )
}

function ProgressRing({ current, target, size = 56, strokeWidth = 5 }: { current: number; target: number; size?: number; strokeWidth?: number }) {
  const pct = Math.min(100, Math.round((current / target) * 100))
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (pct / 100) * circumference
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={strokeWidth} className="stroke-stone-100 dark:stroke-stone-800" />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={strokeWidth} strokeLinecap="round"
          className="stroke-emerald-500 dark:stroke-emerald-400"
          style={{ strokeDasharray: circumference, strokeDashoffset, transition: 'stroke-dashoffset 0.5s ease' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span className="text-xs font-bold text-stone-700 dark:text-stone-300" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{pct}%</span>
      </div>
    </div>
  )
}

function DueDate({ dateStr }: { dateStr: string }) {
  const d = daysUntil(dateStr)
  const isOverdue = d < 0
  const isSoon = d >= 0 && d <= 7
  return (
    <span className={`text-xs ${isOverdue ? 'text-red-600 dark:text-red-400 font-medium' : isSoon ? 'text-amber-600 dark:text-amber-400' : 'text-stone-500 dark:text-stone-400'}`}>
      {isOverdue ? `Overdue (${Math.abs(d)}d)` : d === 0 ? 'Due today' : `Due ${formatDate(dateStr)} (${d}d)`}
    </span>
  )
}

function EmptyState({ icon: Icon, title, description }: { icon: typeof Target; title: string; description: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 24px', textAlign: 'center' }}>
      <div className="bg-stone-100 dark:bg-stone-800 rounded-full" style={{ width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
        <Icon className="w-7 h-7 text-stone-400 dark:text-stone-500" strokeWidth={1.5} />
      </div>
      <p className="text-stone-700 dark:text-stone-300 font-semibold text-sm" style={{ fontFamily: "'Fraunces', serif", marginBottom: 4 }}>{title}</p>
      <p className="text-stone-500 dark:text-stone-400 text-xs" style={{ maxWidth: 280 }}>{description}</p>
    </div>
  )
}

/* ── Modal backdrop ───────────────────────────────────── */

function ModalBackdrop({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-black/40 dark:bg-black/60" style={{ position: 'absolute', inset: 0 }} />
      <div
        className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl shadow-xl"
        style={{ position: 'relative', width: '100%', maxWidth: 520, maxHeight: '85vh', overflow: 'auto' }}
      >
        {children}
      </div>
    </div>
  )
}

function FormField({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block" style={{ marginBottom: 4 }}>
        {label}
      </label>
      {hint && <p className="text-xs text-stone-400 dark:text-stone-500" style={{ marginBottom: 4 }}>{hint}</p>}
      {children}
    </div>
  )
}

const inputClasses = 'w-full text-sm text-stone-900 dark:text-stone-100 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-colors'
const selectClasses = inputClasses

/* ══════════════════════════════════════════════════════════
   GOAL FORM MODAL
   ══════════════════════════════════════════════════════════ */

function GoalFormModal({
  mode,
  goal,
  projects,
  onSave,
  onDelete,
  onClose,
}: {
  mode: 'create' | 'edit'
  goal?: Goal
  projects: ProjectSummary[]
  onSave: (goal: Goal) => void
  onDelete?: (id: string) => void
  onClose: () => void
}) {
  const [title, setTitle] = useState(goal?.title ?? '')
  const [description, setDescription] = useState(goal?.description ?? '')
  const [type, setType] = useState<GoalType>(goal?.type ?? 'milestone')
  const [period, setPeriod] = useState<GoalPeriod>(goal?.period ?? 'oneTime')
  const [targetValue, setTargetValue] = useState(goal?.targetValue ?? 100)
  const [projectId, setProjectId] = useState<string>(goal?.project?.id ?? '')
  const [dueDate, setDueDate] = useState(goal?.dueDate ?? '')
  const [isRecurring, setIsRecurring] = useState(goal?.isRecurring ?? false)
  const [autoRenew, setAutoRenew] = useState(goal?.autoRenew ?? false)
  const [milestoneUnit, setMilestoneUnit] = useState<'percent' | 'stitches'>(goal?.unit === 'stitches' ? 'stitches' : 'percent')

  const isProjectGoal = ['milestone', 'frequency', 'deadline', 'sessionCount', 'manual'].includes(type)
  const unit = (type === 'milestone' || type === 'deadline') ? milestoneUnit : goalTypeUnits[type]

  function handleSave() {
    const selectedProject = projects.find(p => p.id === projectId)
    const newGoal: Goal = {
      id: goal?.id ?? `goal-new-${Date.now()}`,
      title: title || `New ${goalTypeLabels[type]} Goal`,
      description,
      type,
      period,
      status: goal?.status ?? 'active',
      project: isProjectGoal && selectedProject ? { id: selectedProject.id, name: selectedProject.name } as any : null,
      targetValue,
      currentValue: goal?.currentValue ?? 0,
      unit,
      startDate: goal?.startDate ?? todayStr(),
      endDate: goal?.endDate ?? null,
      dueDate: dueDate || null,
      isRecurring,
      autoRenew,
      completedAt: goal?.completedAt ?? null,
      showRenewalNudge: goal?.showRenewalNudge ?? false,
      createdAt: goal?.createdAt ?? todayStr(),
    }
    onSave(newGoal)
    onClose()
  }

  return (
    <ModalBackdrop onClose={onClose}>
      {/* Header */}
      <div className="border-b border-stone-200 dark:border-stone-700" style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 className="text-base font-bold text-stone-900 dark:text-stone-100" style={{ fontFamily: "'Fraunces', serif" }}>
          {mode === 'create' ? 'New Goal' : 'Edit Goal'}
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {mode === 'edit' && onDelete && goal && (
            <button onClick={() => { onDelete(goal.id); onClose() }}
              className="text-stone-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
              style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6 }}
              title="Delete goal"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button onClick={onClose}
            className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors"
            style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6 }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '20px 24px' }}>
        <FormField label="Title" hint="What are you working toward?">
          <input type="text" className={inputClasses} value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Finish Woodland Sampler by Holidays" />
        </FormField>

        <FormField label="Description" hint="Optional context or motivation">
          <textarea className={inputClasses} rows={2} value={description} onChange={e => setDescription(e.target.value)} placeholder="e.g. Push to complete before the gifting deadline" />
        </FormField>

        <FormField label="Goal Type" hint="What kind of target is this?">
          <select className={selectClasses} value={type} onChange={e => setType(e.target.value as GoalType)}>
            <optgroup label="Project Goals">
              {(['milestone', 'frequency', 'deadline', 'sessionCount', 'manual'] as GoalType[]).map(t => (
                <option key={t} value={t}>{goalTypeLabels[t]} — {goalTypeDescriptions[t]}</option>
              ))}
            </optgroup>
            <optgroup label="Global Goals">
              {(['volume', 'consistency', 'projectCompletion', 'projectStart'] as GoalType[]).map(t => (
                <option key={t} value={t}>{goalTypeLabels[t]} — {goalTypeDescriptions[t]}</option>
              ))}
            </optgroup>
          </select>
        </FormField>

        {isProjectGoal && (
          <FormField label="Project" hint="Which project is this goal for?">
            <select className={selectClasses} value={projectId} onChange={e => setProjectId(e.target.value)}>
              <option value="">Select a project...</option>
              {projects.filter(p => p.status === 'In Progress' || p.status === 'Kitted' || p.status === 'Kitting').map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.percentComplete}%)</option>
              ))}
            </select>
          </FormField>
        )}

        {(type === 'milestone' || type === 'deadline') && (
          <FormField label="Target Type" hint="Are you targeting a percentage or a stitch count?">
            <div style={{ display: 'flex', gap: 8 }}>
              {([['percent', 'Percentage (e.g. reach 50%)'], ['stitches', 'Stitch Count (e.g. stitch 10,000)']] as const).map(([val, label]) => (
                <button key={val} onClick={() => { setMilestoneUnit(val); if (val === 'percent' && targetValue > 100) setTargetValue(100) }}
                  className={`flex-1 rounded-md text-xs font-medium transition-colors border ${milestoneUnit === val
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-400 dark:bg-emerald-950/30 dark:text-emerald-400'
                    : 'border-stone-200 bg-white text-stone-600 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-400 hover:border-stone-300'
                  }`} style={{ padding: '8px 12px' }}>
                  {label}
                </button>
              ))}
            </div>
          </FormField>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <FormField label="Target" hint={milestoneUnit === 'percent' && (type === 'milestone' || type === 'deadline') ? 'What percentage?' : `How many ${unit}?`}>
            <input type="number" className={inputClasses} value={targetValue} onChange={e => setTargetValue(Number(e.target.value))}
              min={1} max={unit === 'percent' ? 100 : undefined} />
          </FormField>

          <FormField label="Period" hint="How often?">
            <select className={selectClasses} value={period} onChange={e => setPeriod(e.target.value as GoalPeriod)}>
              {Object.entries(periodLabels).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </FormField>
        </div>

        <FormField label="Due Date" hint="Optional deadline for this goal">
          <input type="date" className={inputClasses} value={dueDate} onChange={e => setDueDate(e.target.value)} />
        </FormField>

        {/* Recurrence toggles */}
        {period !== 'oneTime' && (
          <div className="bg-stone-50 dark:bg-stone-800/50 rounded-md" style={{ padding: '12px 16px', marginBottom: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 8 }}>
              <input type="checkbox" checked={isRecurring} onChange={e => { setIsRecurring(e.target.checked); if (!e.target.checked) setAutoRenew(false) }}
                className="w-4 h-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500" />
              <span className="text-xs font-medium text-stone-700 dark:text-stone-300">Recurring goal</span>
            </label>
            {isRecurring && (
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginLeft: 24 }}>
                <input type="checkbox" checked={autoRenew} onChange={e => setAutoRenew(e.target.checked)}
                  className="w-4 h-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500" />
                <span className="text-xs text-stone-600 dark:text-stone-400">Auto-renew each period</span>
              </label>
            )}
            {isRecurring && !autoRenew && (
              <p className="text-xs text-stone-400 dark:text-stone-500" style={{ marginTop: 4, marginLeft: 24 }}>
                You'll get a gentle nudge to continue when the period ends.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-stone-200 dark:border-stone-700" style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
        <button onClick={onClose}
          className="text-stone-600 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 text-sm font-medium transition-colors"
          style={{ padding: '8px 16px' }}
        >
          Cancel
        </button>
        <button onClick={handleSave}
          className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white text-sm font-semibold rounded-md transition-colors"
          style={{ padding: '8px 20px' }}
        >
          {mode === 'create' ? 'Create Goal' : 'Save Changes'}
        </button>
      </div>
    </ModalBackdrop>
  )
}

/* ══════════════════════════════════════════════════════════
   PLAN FORM MODAL
   ══════════════════════════════════════════════════════════ */

function PlanFormModal({
  mode,
  plan,
  projects,
  onSave,
  onDelete,
  onClose,
}: {
  mode: 'create' | 'edit'
  plan?: Plan
  projects: ProjectSummary[]
  onSave: (plan: Plan) => void
  onDelete?: (id: string) => void
  onClose: () => void
}) {
  const [title, setTitle] = useState(plan?.title ?? '')
  const [description, setDescription] = useState(plan?.description ?? '')
  const [planType, setPlanType] = useState<PlanType>(plan?.planType ?? 'startDate')
  const [projectId, setProjectId] = useState<string>(plan?.project?.id ?? '')
  const [scheduledDate, setScheduledDate] = useState(plan?.scheduledDate ?? '')
  const [endDate, setEndDate] = useState(plan?.endDate ?? '')
  const [dayOfWeek, setDayOfWeek] = useState<number>(plan?.recurrenceDayOfWeek ?? 5)
  const [season, setSeason] = useState(plan?.season ?? 'Spring')
  const [recurrenceLabel, setRecurrenceLabel] = useState(plan?.recurrenceLabel ?? '')

  function handleSave() {
    const selectedProject = projects.find(p => p.id === projectId)
    if (!selectedProject) return

    const newPlan: Plan = {
      id: plan?.id ?? `plan-new-${Date.now()}`,
      title: title || `New ${planTypeStyles[planType].label}`,
      description,
      project: selectedProject as any,
      planType,
      status: plan?.status ?? (scheduledDate && daysUntil(scheduledDate) > 0 ? 'upcoming' : 'active') as PlanStatus,
      scheduledDate: planType !== 'recurringSchedule' ? (scheduledDate || null) : null,
      endDate: endDate || null,
      recurrenceLabel: planType === 'recurringSchedule' ? (recurrenceLabel || `Every ${dayOfWeekLabels[dayOfWeek]}`) : null,
      recurrenceDayOfWeek: planType === 'recurringSchedule' ? dayOfWeek : null,
      season: planType === 'seasonalFocus' ? season : null,
      createdAt: plan?.createdAt ?? todayStr(),
    }
    onSave(newPlan)
    onClose()
  }

  return (
    <ModalBackdrop onClose={onClose}>
      <div className="border-b border-stone-200 dark:border-stone-700" style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 className="text-base font-bold text-stone-900 dark:text-stone-100" style={{ fontFamily: "'Fraunces', serif" }}>
          {mode === 'create' ? 'New Plan' : 'Edit Plan'}
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {mode === 'edit' && onDelete && plan && (
            <button onClick={() => { onDelete(plan.id); onClose() }}
              className="text-stone-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
              style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6 }}
              title="Delete plan"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors"
            style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6 }}>
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div style={{ padding: '20px 24px' }}>
        <FormField label="Project" hint="Which project is this plan for?">
          <select className={selectClasses} value={projectId} onChange={e => setProjectId(e.target.value)}>
            <option value="">Select a project...</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </FormField>

        <FormField label="Plan Type" hint="What kind of schedule is this?">
          <select className={selectClasses} value={planType} onChange={e => setPlanType(e.target.value as PlanType)}>
            <option value="startDate">Start Date — Plan to start a project on a specific date</option>
            <option value="recurringSchedule">Recurring — Stitch on a regular schedule</option>
            <option value="deadline">Deadline — Finish by a specific date</option>
            <option value="seasonalFocus">Seasonal Focus — Focus on a project during a season</option>
          </select>
        </FormField>

        <FormField label="Title" hint="Describe the plan">
          <input type="text" className={inputClasses} value={title} onChange={e => setTitle(e.target.value)}
            placeholder={planType === 'startDate' ? 'e.g. Start Garden of Eden in April' : planType === 'recurringSchedule' ? 'e.g. Stitch every Friday evening' : planType === 'deadline' ? 'e.g. Finish by end of 2026' : 'e.g. Focus on this during Summer'} />
        </FormField>

        <FormField label="Description" hint="Optional notes or motivation">
          <textarea className={inputClasses} rows={2} value={description} onChange={e => setDescription(e.target.value)} />
        </FormField>

        {/* Dynamic fields based on plan type */}
        {planType === 'startDate' && (
          <FormField label="Start Date" hint="When do you plan to start?">
            <input type="date" className={inputClasses} value={scheduledDate} onChange={e => setScheduledDate(e.target.value)} />
          </FormField>
        )}

        {planType === 'recurringSchedule' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormField label="Day of Week" hint="Which day?">
              <select className={selectClasses} value={dayOfWeek} onChange={e => setDayOfWeek(Number(e.target.value))}>
                {dayOfWeekLabels.map((day, i) => (
                  <option key={i} value={i}>{day}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Label" hint="How to describe the recurrence">
              <input type="text" className={inputClasses} value={recurrenceLabel} onChange={e => setRecurrenceLabel(e.target.value)}
                placeholder={`Every ${dayOfWeekLabels[dayOfWeek]}`} />
            </FormField>
          </div>
        )}

        {planType === 'deadline' && (
          <FormField label="Deadline" hint="When should this be done by?">
            <input type="date" className={inputClasses} value={endDate} onChange={e => setEndDate(e.target.value)} />
          </FormField>
        )}

        {planType === 'seasonalFocus' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <FormField label="Season" hint="Which season?">
              <select className={selectClasses} value={season} onChange={e => setSeason(e.target.value)}>
                {seasonLabels.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </FormField>
            <FormField label="Start" hint="Season start">
              <input type="date" className={inputClasses} value={scheduledDate} onChange={e => setScheduledDate(e.target.value)} />
            </FormField>
            <FormField label="End" hint="Season end">
              <input type="date" className={inputClasses} value={endDate} onChange={e => setEndDate(e.target.value)} />
            </FormField>
          </div>
        )}
      </div>

      <div className="border-t border-stone-200 dark:border-stone-700" style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
        <button onClick={onClose} className="text-stone-600 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 text-sm font-medium transition-colors" style={{ padding: '8px 16px' }}>
          Cancel
        </button>
        <button onClick={handleSave} disabled={!projectId}
          className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white text-sm font-semibold rounded-md transition-colors disabled:opacity-50"
          style={{ padding: '8px 20px' }}
        >
          {mode === 'create' ? 'Create Plan' : 'Save Changes'}
        </button>
      </div>
    </ModalBackdrop>
  )
}

/* ══════════════════════════════════════════════════════════
   ROTATION FORM MODAL
   ══════════════════════════════════════════════════════════ */

function RotationFormModal({
  mode,
  rotation,
  projects,
  onSave,
  onDelete,
  onClose,
}: {
  mode: 'create' | 'edit'
  rotation?: Rotation
  projects: ProjectSummary[]
  onSave: (rotation: Rotation) => void
  onDelete?: (id: string) => void
  onClose: () => void
}) {
  const [name, setName] = useState(rotation?.name ?? '')
  const [description, setDescription] = useState(rotation?.description ?? '')
  const [style, setStyle] = useState<RotationStyle>(rotation?.style ?? 'focusRotate')
  const [selectedProjects, setSelectedProjects] = useState<Array<{
    projectId: string; triggerType: TurnTriggerType; triggerValue: number; isFocus: boolean
  }>>(
    rotation?.projects.map(rp => ({
      projectId: rp.project.id,
      triggerType: rp.turnTrigger.type,
      triggerValue: rp.turnTrigger.value,
      isFocus: rp.isFocus,
    })) ?? []
  )

  const wipProjects = projects.filter(p => p.status === 'In Progress' || p.status === 'Kitted')
  const triggerUnits: Record<TurnTriggerType, string> = { time: 'days', stitches: 'stitches', percentage: 'percent', sessions: 'sessions' }

  function addProject(projectId: string) {
    if (selectedProjects.find(sp => sp.projectId === projectId)) return
    setSelectedProjects(prev => [...prev, { projectId, triggerType: 'stitches', triggerValue: 1000, isFocus: false }])
  }

  function removeProject(projectId: string) {
    setSelectedProjects(prev => prev.filter(sp => sp.projectId !== projectId))
  }

  function updateProject(projectId: string, updates: Partial<typeof selectedProjects[0]>) {
    setSelectedProjects(prev => prev.map(sp => sp.projectId === projectId ? { ...sp, ...updates } : sp))
  }

  function setFocusProject(projectId: string) {
    setSelectedProjects(prev => prev.map(sp => ({ ...sp, isFocus: sp.projectId === projectId })))
  }

  function handleSave() {
    const newRotation: Rotation = {
      id: rotation?.id ?? `rot-new-${Date.now()}`,
      name: name || 'New Rotation',
      description,
      style,
      status: rotation?.status ?? 'active',
      projects: selectedProjects.map((sp, i) => {
        const proj = projects.find(p => p.id === sp.projectId)!
        return {
          project: proj as any,
          order: i + 1,
          turnTrigger: { type: sp.triggerType, value: sp.triggerValue, unit: triggerUnits[sp.triggerType] },
          isFocus: sp.isFocus,
          isCurrent: i === 0,
          turnProgress: 0,
          turnTarget: sp.triggerValue,
          turnUnit: triggerUnits[sp.triggerType],
        }
      }),
      currentTurnStartedAt: rotation?.currentTurnStartedAt ?? todayStr(),
      createdAt: rotation?.createdAt ?? todayStr(),
    }
    onSave(newRotation)
    onClose()
  }

  return (
    <ModalBackdrop onClose={onClose}>
      <div className="border-b border-stone-200 dark:border-stone-700" style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 className="text-base font-bold text-stone-900 dark:text-stone-100" style={{ fontFamily: "'Fraunces', serif" }}>
          {mode === 'create' ? 'New Rotation' : 'Edit Rotation'}
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {mode === 'edit' && onDelete && rotation && (
            <button onClick={() => { onDelete(rotation.id); onClose() }}
              className="text-stone-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
              style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6 }}
              title="Delete rotation">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors"
            style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6 }}>
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div style={{ padding: '20px 24px' }}>
        <FormField label="Name" hint="Give your rotation a name">
          <input type="text" className={inputClasses} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Main WIP Rotation" />
        </FormField>

        <FormField label="Description" hint="Optional notes about this rotation">
          <textarea className={inputClasses} rows={2} value={description} onChange={e => setDescription(e.target.value)} />
        </FormField>

        <FormField label="Rotation Style" hint="How should projects be cycled?">
          <select className={selectClasses} value={style} onChange={e => setStyle(e.target.value as RotationStyle)}>
            {(Object.entries(rotationStyleLabels) as [RotationStyle, { label: string; description: string }][]).map(([s, info]) => (
              <option key={s} value={s}>{info.label} — {info.description}</option>
            ))}
          </select>
        </FormField>

        {/* Project selection */}
        <FormField label="Projects" hint="Add WIPs to this rotation and set per-project turn triggers">
          <select className={selectClasses} value="" onChange={e => { if (e.target.value) addProject(e.target.value); e.target.value = '' }}>
            <option value="">Add a project...</option>
            {wipProjects.filter(p => !selectedProjects.find(sp => sp.projectId === p.id)).map(p => (
              <option key={p.id} value={p.id}>{p.name} ({p.percentComplete}%)</option>
            ))}
          </select>
        </FormField>

        {/* Selected projects with triggers */}
        {selectedProjects.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            {selectedProjects.map(sp => {
              const proj = projects.find(p => p.id === sp.projectId)
              if (!proj) return null
              return (
                <div key={sp.projectId} className="bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-800 rounded-md" style={{ padding: '10px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <CoverPlaceholder status={proj.status} size={24} />
                    <span className="text-xs font-medium text-stone-700 dark:text-stone-300" style={{ flex: 1 }}>{proj.name}</span>
                    {style === 'focusRotate' && (
                      <button onClick={() => setFocusProject(sp.projectId)}
                        className={`text-xs font-medium px-2 py-0.5 rounded-full transition-colors ${sp.isFocus ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' : 'bg-stone-100 text-stone-500 dark:bg-stone-700 dark:text-stone-400 hover:bg-amber-50'}`}>
                        {sp.isFocus ? 'Focus' : 'Set Focus'}
                      </button>
                    )}
                    <button onClick={() => removeProject(sp.projectId)}
                      className="text-stone-400 hover:text-red-500 transition-colors" style={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <select className={`${selectClasses} text-xs`} style={{ padding: '4px 8px' }} value={sp.triggerType}
                      onChange={e => updateProject(sp.projectId, { triggerType: e.target.value as TurnTriggerType })}>
                      <option value="stitches">Stitches</option>
                      <option value="time">Days</option>
                      <option value="percentage">Percentage</option>
                      <option value="sessions">Sessions</option>
                    </select>
                    <input type="number" className={`${inputClasses} text-xs`} style={{ padding: '4px 8px' }} value={sp.triggerValue}
                      onChange={e => updateProject(sp.projectId, { triggerValue: Number(e.target.value) })} min={1} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="border-t border-stone-200 dark:border-stone-700" style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
        <button onClick={onClose} className="text-stone-600 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 text-sm font-medium transition-colors" style={{ padding: '8px 16px' }}>
          Cancel
        </button>
        <button onClick={handleSave} disabled={selectedProjects.length === 0}
          className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white text-sm font-semibold rounded-md transition-colors disabled:opacity-50"
          style={{ padding: '8px 20px' }}>
          {mode === 'create' ? 'Create Rotation' : 'Save Changes'}
        </button>
      </div>
    </ModalBackdrop>
  )
}

/* ══════════════════════════════════════════════════════════
   GOAL CARD
   ══════════════════════════════════════════════════════════ */

function GoalCard({
  goal,
  onEdit,
  onTogglePause,
  onRenew,
  onDismissNudge,
  onCheckOff,
}: {
  goal: Goal
  onEdit?: () => void
  onTogglePause?: () => void
  onRenew?: () => void
  onDismissNudge?: () => void
  onCheckOff?: () => void
}) {
  const pct = goal.targetValue > 0 ? Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100)) : 0
  const isManual = goal.type === 'manual'
  const isComplete = goal.status === 'completed'

  return (
    <div
      className={`border rounded-lg transition-all ${
        isComplete
          ? 'border-violet-200 dark:border-violet-800/50 bg-violet-50/30 dark:bg-violet-950/10'
          : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 hover:border-stone-300 dark:hover:border-stone-600'
      }`}
      style={{ padding: '16px 20px' }}
    >
      {/* Renewal nudge */}
      {goal.showRenewalNudge && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-md"
          style={{ padding: '8px 12px', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <RefreshCw className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span className="text-xs text-amber-700 dark:text-amber-400 font-medium">Continue this goal for next period?</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button onClick={onRenew} className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 transition-colors">Yes</button>
            <span className="text-stone-300 dark:text-stone-600">|</span>
            <button onClick={onDismissNudge} className="text-xs text-stone-500 dark:text-stone-400 hover:text-stone-700 transition-colors">Dismiss</button>
          </div>
        </div>
      )}

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
            <button onClick={onEdit}
              className="text-sm font-semibold text-stone-900 dark:text-stone-100 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
              style={{ fontFamily: "'Source Sans 3', sans-serif", textAlign: 'left' }}>
              {goal.title}
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <GoalStatusBadge status={goal.status} />
            <PeriodBadge period={goal.period} />
            {goal.isRecurring && (
              <span className="inline-flex items-center gap-1 text-xs text-stone-400 dark:text-stone-500">
                <Repeat className="w-3 h-3" />
                {goal.autoRenew ? 'Auto-renew' : 'Recurring'}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2, shrink: 0 }}>
          <button onClick={onEdit}
            className="text-stone-400 hover:text-emerald-600 dark:text-stone-500 dark:hover:text-emerald-400 transition-colors"
            style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6 }}
            title="Edit goal">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          {goal.status === 'active' && !isManual && (
            <button onClick={onTogglePause}
              className="text-stone-400 hover:text-amber-600 dark:text-stone-500 dark:hover:text-amber-400 transition-colors"
              style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6 }}
              title="Pause goal">
              <Pause className="w-3.5 h-3.5" />
            </button>
          )}
          {goal.status === 'paused' && (
            <button onClick={onTogglePause}
              className="text-stone-400 hover:text-emerald-600 dark:text-stone-500 dark:hover:text-emerald-400 transition-colors"
              style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6 }}
              title="Resume goal">
              <Play className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Description */}
      {goal.description && (
        <p className="text-xs text-stone-500 dark:text-stone-400" style={{ marginBottom: 10, lineHeight: 1.5 }}>{goal.description}</p>
      )}

      {/* Project link */}
      {goal.project && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <CoverPlaceholder status="In Progress" size={24} />
          <span className="text-xs text-stone-600 dark:text-stone-400 font-medium">{goal.project.name}</span>
        </div>
      )}

      {/* Progress */}
      {isManual ? (
        <button onClick={isComplete ? undefined : onCheckOff}
          style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: isComplete ? 'default' : 'pointer' }}>
          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
            isComplete ? 'bg-emerald-500 border-emerald-500 dark:bg-emerald-400 dark:border-emerald-400' : 'border-stone-300 dark:border-stone-600 hover:border-emerald-400'}`}>
            {isComplete && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
          </div>
          <span className={`text-xs ${isComplete ? 'text-stone-400 dark:text-stone-500 line-through' : 'text-stone-600 dark:text-stone-400'}`}>
            {isComplete ? 'Done' : 'Mark as complete'}
          </span>
        </button>
      ) : (
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
            <span className="text-xs text-stone-500 dark:text-stone-400">
              <span className="font-semibold text-stone-700 dark:text-stone-300" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{fmt(goal.currentValue)}</span>
              {' / '}<span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{fmt(goal.targetValue)}</span>
              {' '}{goal.unit}
            </span>
            <span className="text-xs font-bold text-stone-600 dark:text-stone-400" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{pct}%</span>
          </div>
          <ProgressBar current={goal.currentValue} target={goal.targetValue}
            colorClass={isComplete ? 'bg-violet-500 dark:bg-violet-400' : 'bg-emerald-500 dark:bg-emerald-400'} />
        </div>
      )}

      {/* Due date */}
      {goal.dueDate && !isComplete && (
        <div style={{ marginTop: 8 }}><DueDate dateStr={goal.dueDate} /></div>
      )}

      {/* Completed date */}
      {isComplete && goal.completedAt && (
        <div style={{ marginTop: 8 }}>
          <span className="text-xs text-violet-600 dark:text-violet-400">
            Completed {formatDate(goal.completedAt)} ({daysAgo(goal.completedAt)}d ago)
          </span>
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   PLAN CARD
   ══════════════════════════════════════════════════════════ */

function PlanCard({
  plan,
  onEdit,
  onUpdateStatus,
}: {
  plan: Plan
  onEdit?: () => void
  onUpdateStatus?: (status: 'completed' | 'skipped') => void
}) {
  const isActive = plan.status === 'active'
  const isUpcoming = plan.status === 'upcoming'
  const isCompleted = plan.status === 'completed'
  const isSkipped = plan.status === 'skipped'

  return (
    <div
      className={`border rounded-lg transition-all ${
        isCompleted ? 'border-violet-200 dark:border-violet-800/50 bg-violet-50/30 dark:bg-violet-950/10'
        : isSkipped ? 'border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/30 opacity-60'
        : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 hover:border-stone-300 dark:hover:border-stone-600'
      }`}
      style={{ padding: '16px 20px' }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <button onClick={onEdit}
            className="text-sm font-semibold text-stone-900 dark:text-stone-100 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
            style={{ fontFamily: "'Source Sans 3', sans-serif", textAlign: 'left', marginBottom: 4, display: 'block' }}>
            {plan.title}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <PlanTypeBadge planType={plan.planType} />
            <span className={`inline-flex items-center rounded-full text-xs font-medium px-2 py-0.5 ${
              isActive ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
              : isUpcoming ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400'
              : isCompleted ? 'bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-400'
              : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400'
            }`}>{planStatusLabels[plan.status]}</span>
          </div>
        </div>

        {/* Actions — with text labels */}
        {(isActive || isUpcoming) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, shrink: 0 }}>
            <button onClick={() => onUpdateStatus?.('completed')}
              className="text-stone-400 hover:text-emerald-600 dark:text-stone-500 dark:hover:text-emerald-400 transition-colors text-xs font-medium"
              style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '4px 8px', borderRadius: 6 }}>
              <Check className="w-3.5 h-3.5" />
              Complete
            </button>
            <button onClick={() => onUpdateStatus?.('skipped')}
              className="text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-400 transition-colors text-xs font-medium"
              style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '4px 8px', borderRadius: 6 }}>
              <SkipForward className="w-3.5 h-3.5" />
              Skip
            </button>
          </div>
        )}
      </div>

      {/* Description */}
      {plan.description && (
        <p className="text-xs text-stone-500 dark:text-stone-400" style={{ marginBottom: 10, lineHeight: 1.5 }}>{plan.description}</p>
      )}

      {/* Project */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <CoverPlaceholder status={plan.project.status} size={24} />
        <span className="text-xs text-stone-600 dark:text-stone-400 font-medium">{plan.project.name}</span>
      </div>

      {/* Schedule info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        {plan.scheduledDate && (
          <span className="text-xs text-stone-500 dark:text-stone-400" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <CalendarDays className="w-3 h-3" />
            {formatDate(plan.scheduledDate)}
            {isUpcoming && ` (${daysUntil(plan.scheduledDate)}d away)`}
          </span>
        )}
        {plan.endDate && (
          <span className="text-xs text-stone-500 dark:text-stone-400" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <ArrowRight className="w-3 h-3" />
            {formatDate(plan.endDate)}
          </span>
        )}
        {plan.recurrenceLabel && (
          <span className="text-xs text-sky-600 dark:text-sky-400 font-medium" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Repeat className="w-3 h-3" />
            {plan.recurrenceLabel}
          </span>
        )}
        {plan.season && (
          <span className="text-xs text-violet-600 dark:text-violet-400 font-medium" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Sun className="w-3 h-3" />
            {plan.season}
          </span>
        )}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   ROTATION CARD
   ══════════════════════════════════════════════════════════ */

function RotationCard({
  rotation,
  onEdit,
  onTogglePause,
  onSkipTurn,
  onCompleteTurn,
}: {
  rotation: Rotation
  onEdit?: () => void
  onTogglePause?: () => void
  onSkipTurn?: () => void
  onCompleteTurn?: () => void
}) {
  const [expanded, setExpanded] = useState(rotation.status === 'active')
  const StyleIcon = rotationStyleIcons[rotation.style]
  const styleInfo = rotationStyleLabels[rotation.style]
  const currentProject = rotation.projects.find(p => p.isCurrent)
  const isActive = rotation.status === 'active'
  const isPaused = rotation.status === 'paused'

  return (
    <div className={`border rounded-lg transition-all ${
      isActive ? 'border-emerald-200 dark:border-emerald-800/50 bg-white dark:bg-stone-900'
      : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900'}`}>
      {/* Header */}
      <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
        onClick={() => setExpanded(!expanded)}>
        <div className={`rounded-lg flex items-center justify-center shrink-0 ${
          isActive ? 'bg-emerald-100 dark:bg-emerald-900/40' : 'bg-stone-100 dark:bg-stone-800'}`}
          style={{ width: 40, height: 40 }}>
          <StyleIcon className={`w-5 h-5 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-stone-500 dark:text-stone-400'}`} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            <span className="text-sm font-semibold text-stone-900 dark:text-stone-100" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>{rotation.name}</span>
            <span className={`inline-flex items-center rounded-full text-xs font-medium px-2 py-0.5 ${
              isActive ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
              : isPaused ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'
              : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400'
            }`}>{rotation.status.charAt(0).toUpperCase() + rotation.status.slice(1)}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="text-xs text-stone-500 dark:text-stone-400">{styleInfo.label}</span>
            <span className="text-xs text-stone-400 dark:text-stone-600">&middot;</span>
            <span className="text-xs text-stone-500 dark:text-stone-400">{rotation.projects.length} project{rotation.projects.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
        {expanded ? <ChevronDown className="w-4 h-4 text-stone-400 shrink-0" /> : <ChevronRight className="w-4 h-4 text-stone-400 shrink-0" />}
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-stone-100 dark:border-stone-800" style={{ padding: '16px 20px' }}>
          {/* Current turn */}
          {currentProject && isActive && (
            <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/30 rounded-lg"
              style={{ padding: '16px', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 10 }}>
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Current Turn</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <ProgressRing current={currentProject.turnProgress} target={currentProject.turnTarget} size={56} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <CoverPlaceholder status={currentProject.project.status} size={28} />
                    <div>
                      <p className="text-sm font-semibold text-stone-900 dark:text-stone-100" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>{currentProject.project.name}</p>
                      <p className="text-xs text-stone-500 dark:text-stone-400">{currentProject.project.designerName}</p>
                    </div>
                    {currentProject.isFocus && (
                      <span className="bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 text-xs font-medium px-2 py-0.5 rounded-full">Focus</span>
                    )}
                  </div>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    <span className="font-semibold text-stone-700 dark:text-stone-300" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{fmt(currentProject.turnProgress)}</span>
                    {' / '}<span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{fmt(currentProject.turnTarget)}</span>
                    {' '}{currentProject.turnUnit}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
                <button onClick={(e) => { e.stopPropagation(); onCompleteTurn?.() }}
                  className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white text-xs font-semibold rounded-md transition-colors"
                  style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Check className="w-3 h-3" /> Complete Turn
                </button>
                <button onClick={(e) => { e.stopPropagation(); onSkipTurn?.() }}
                  className="text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-300 text-xs font-medium transition-colors"
                  style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <SkipForward className="w-3 h-3" /> Skip
                </button>
              </div>
            </div>
          )}

          {/* Project queue */}
          <div style={{ marginBottom: 16 }}>
            <p className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider" style={{ marginBottom: 8 }}>
              {isActive ? 'Up Next' : 'Projects'}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {rotation.projects
                .filter(p => isActive ? !p.isCurrent : true)
                .sort((a, b) => a.order - b.order)
                .map((rp, i) => (
                  <div key={rp.project.id} className="bg-stone-50 dark:bg-stone-800/50 rounded-md"
                    style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className="text-xs text-stone-400 dark:text-stone-500 font-medium" style={{ width: 16, textAlign: 'center', fontFamily: "'JetBrains Mono', monospace" }}>
                      {isActive ? i + 1 : rp.order}
                    </span>
                    <GripVertical className="w-3 h-3 text-stone-300 dark:text-stone-600 shrink-0" />
                    <CoverPlaceholder status={rp.project.status} size={24} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p className="text-xs font-medium text-stone-700 dark:text-stone-300">{rp.project.name}</p>
                    </div>
                    {rp.isFocus && <span className="bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 text-xs font-medium px-1.5 py-0.5 rounded-full">Focus</span>}
                    <span className="text-xs text-stone-400 dark:text-stone-500">{fmt(rp.turnTrigger.value)} {rp.turnTrigger.unit}</span>
                  </div>
                ))}
            </div>
          </div>

          {/* Rotation actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
            <button onClick={(e) => { e.stopPropagation(); onTogglePause?.() }}
              className="text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-300 text-xs font-medium transition-colors"
              style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 4 }}>
              {isActive ? <><Pause className="w-3 h-3" /> Pause</> : <><Play className="w-3 h-3" /> Resume</>}
            </button>
            <button onClick={(e) => { e.stopPropagation(); onEdit?.() }}
              className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 text-xs font-medium transition-colors"
              style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Pencil className="w-3 h-3" /> Edit Rotation
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   ACHIEVEMENT CARD
   ══════════════════════════════════════════════════════════ */

function AchievementCard({ achievement }: { achievement: Achievement }) {
  const Icon = achievementIcons[achievement.icon] ?? Trophy
  const isUnlocked = achievement.isUnlocked

  return (
    <div
      className={`border rounded-lg text-center transition-all ${
        isUnlocked
          ? 'border-emerald-200 dark:border-emerald-800/50 bg-gradient-to-b from-emerald-50/80 to-white dark:from-emerald-950/20 dark:to-stone-900'
          : 'border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/30 opacity-60'
      }`}
      style={{ padding: '20px 16px' }}
    >
      <div className={`rounded-full mx-auto flex items-center justify-center ${
        isUnlocked ? 'bg-emerald-100 dark:bg-emerald-900/40' : 'bg-stone-100 dark:bg-stone-800'}`}
        style={{ width: 48, height: 48, marginBottom: 10, position: 'relative' }}>
        <Icon className={`w-5 h-5 ${isUnlocked ? 'text-emerald-600 dark:text-emerald-400' : 'text-stone-400 dark:text-stone-500'}`} />
        {!isUnlocked && (
          <div className="bg-stone-200 dark:bg-stone-700 rounded-full flex items-center justify-center"
            style={{ position: 'absolute', bottom: -2, right: -2, width: 18, height: 18 }}>
            <Lock className="w-2.5 h-2.5 text-stone-500 dark:text-stone-400" />
          </div>
        )}
      </div>
      <p className={`text-sm font-semibold ${isUnlocked ? 'text-stone-900 dark:text-stone-100' : 'text-stone-500 dark:text-stone-400'}`}
        style={{ fontFamily: "'Fraunces', serif", marginBottom: 4 }}>{achievement.name}</p>
      <p className="text-xs text-stone-500 dark:text-stone-400" style={{ marginBottom: 10, lineHeight: 1.4, minHeight: 32 }}>{achievement.description}</p>

      {isUnlocked ? (
        <div>
          <div className="bg-emerald-100 dark:bg-emerald-900/30 rounded-full inline-flex items-center gap-1.5 px-2.5 py-1">
            <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Unlocked</span>
          </div>
          {achievement.unlockedAt && (
            <p className="text-xs text-stone-400 dark:text-stone-500" style={{ marginTop: 4 }}>{formatDate(achievement.unlockedAt)}</p>
          )}
        </div>
      ) : (
        <div>
          <div style={{ marginBottom: 4 }}>
            <ProgressBar current={achievement.currentValue} target={achievement.targetValue} colorClass="bg-stone-300 dark:bg-stone-600" />
          </div>
          <p className="text-xs text-stone-400 dark:text-stone-500" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {fmt(achievement.currentValue)} / {fmt(achievement.targetValue)} {achievement.unit}
          </p>
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   TAB TYPES
   ══════════════════════════════════════════════════════════ */

type TabId = 'goals' | 'plans' | 'rotations' | 'achievements'

interface TabDef {
  id: TabId
  label: string
  icon: typeof Target
  getBadge: () => number
}

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════ */

export function GoalsAndPlans({
  goals: initialGoals,
  plans: initialPlans,
  rotations: initialRotations,
  achievements,
  projects,
}: GoalsAndPlansProps) {
  const [activeTab, setActiveTab] = useState<TabId>('goals')
  const [goalFilter, setGoalFilter] = useState<'all' | 'active' | 'completed' | 'project' | 'global'>('all')
  const [planFilter, setPlanFilter] = useState<'all' | 'active' | 'upcoming' | 'completed'>('all')
  const [achievementFilter, setAchievementFilter] = useState<'all' | AchievementCategory>('all')
  const [goalsShown, setGoalsShown] = useState(10)
  const [plansShown, setPlansShown] = useState(10)

  /* ── Local state for live updates ──────────────────── */
  const [goals, setGoals] = useState<Goal[]>(initialGoals)
  const [plans, setPlans] = useState<Plan[]>(initialPlans)
  const [rotations, setRotations] = useState<Rotation[]>(initialRotations)

  /* ── Modal state ───────────────────────────────────── */
  const [goalModal, setGoalModal] = useState<{ mode: 'create' | 'edit'; goal?: Goal } | null>(null)
  const [planModal, setPlanModal] = useState<{ mode: 'create' | 'edit'; plan?: Plan } | null>(null)
  const [rotationModal, setRotationModal] = useState<{ mode: 'create' | 'edit'; rotation?: Rotation } | null>(null)

  /* ── Goal actions ──────────────────────────────────── */

  function toggleGoalPause(goalId: string) {
    setGoals(prev => prev.map(g => g.id === goalId
      ? { ...g, status: (g.status === 'active' ? 'paused' : 'active') as GoalStatus }
      : g
    ))
  }

  function checkOffGoal(goalId: string) {
    setGoals(prev => prev.map(g => g.id === goalId
      ? { ...g, status: 'completed' as GoalStatus, currentValue: g.targetValue, completedAt: todayStr() }
      : g
    ))
  }

  function renewGoal(goalId: string) {
    setGoals(prev => prev.map(g => g.id === goalId
      ? { ...g, showRenewalNudge: false, status: 'active' as GoalStatus, currentValue: 0, startDate: todayStr() }
      : g
    ))
  }

  function dismissNudge(goalId: string) {
    setGoals(prev => prev.map(g => g.id === goalId ? { ...g, showRenewalNudge: false } : g))
  }

  function saveGoal(goal: Goal) {
    setGoals(prev => {
      const exists = prev.find(g => g.id === goal.id)
      if (exists) return prev.map(g => g.id === goal.id ? goal : g)
      return [goal, ...prev]
    })
  }

  function deleteGoal(goalId: string) {
    setGoals(prev => prev.filter(g => g.id !== goalId))
  }

  /* ── Plan actions ──────────────────────────────────── */

  function updatePlanStatus(planId: string, status: PlanStatus) {
    setPlans(prev => prev.map(p => p.id === planId ? { ...p, status } : p))
  }

  function savePlan(plan: Plan) {
    setPlans(prev => {
      const exists = prev.find(p => p.id === plan.id)
      if (exists) return prev.map(p => p.id === plan.id ? plan : p)
      return [plan, ...prev]
    })
  }

  function deletePlan(planId: string) {
    setPlans(prev => prev.filter(p => p.id !== planId))
  }

  /* ── Rotation actions ──────────────────────────────── */

  function toggleRotationPause(rotationId: string) {
    setRotations(prev => prev.map(r => r.id === rotationId
      ? { ...r, status: (r.status === 'active' ? 'paused' : 'active') as RotationStatus }
      : r
    ))
  }

  function advanceTurn(rotationId: string) {
    setRotations(prev => prev.map(r => {
      if (r.id !== rotationId) return r
      const currentIdx = r.projects.findIndex(p => p.isCurrent)
      const nextIdx = (currentIdx + 1) % r.projects.length
      return {
        ...r,
        currentTurnStartedAt: todayStr(),
        projects: r.projects.map((p, i) => ({
          ...p,
          isCurrent: i === nextIdx,
          turnProgress: i === nextIdx ? 0 : p.turnProgress,
        })),
      }
    }))
  }

  function saveRotation(rotation: Rotation) {
    setRotations(prev => {
      const exists = prev.find(r => r.id === rotation.id)
      if (exists) return prev.map(r => r.id === rotation.id ? rotation : r)
      return [rotation, ...prev]
    })
  }

  function deleteRotation(rotationId: string) {
    setRotations(prev => prev.filter(r => r.id !== rotationId))
  }

  /* ── Filtered data ─────────────────────────────────── */

  const filteredGoals = useMemo(() => {
    return goals.filter(g => {
      if (goalFilter === 'active') return g.status === 'active'
      if (goalFilter === 'completed') return g.status === 'completed'
      if (goalFilter === 'project') return g.project !== null
      if (goalFilter === 'global') return g.project === null
      return true
    })
  }, [goals, goalFilter])

  const filteredPlans = useMemo(() => {
    return plans.filter(p => {
      if (planFilter === 'active') return p.status === 'active'
      if (planFilter === 'upcoming') return p.status === 'upcoming'
      if (planFilter === 'completed') return p.status === 'completed' || p.status === 'skipped'
      return true
    })
  }, [plans, planFilter])

  const filteredAchievements = useMemo(() => {
    if (achievementFilter === 'all') return achievements
    return achievements.filter(a => a.category === achievementFilter)
  }, [achievements, achievementFilter])

  const activeGoals = goals.filter(g => g.status === 'active')
  const activeRotations = rotations.filter(r => r.status === 'active')
  const unlockedCount = achievements.filter(a => a.isUnlocked).length

  /* ── Tab badge counts ──────────────────────────────── */

  const tabs: TabDef[] = [
    { id: 'goals', label: 'Goals', icon: Target, getBadge: () => activeGoals.length },
    { id: 'plans', label: 'Plans', icon: CalendarDays, getBadge: () => plans.filter(p => p.status === 'active' || p.status === 'upcoming').length },
    { id: 'rotations', label: 'Rotations', icon: RotateCcw, getBadge: () => activeRotations.length },
    { id: 'achievements', label: 'Achievements', icon: Trophy, getBadge: () => unlockedCount },
  ]

  const heroStats = [
    { label: 'Active Goals', value: activeGoals.length, icon: Target },
    { label: 'Active Rotations', value: activeRotations.length, icon: RotateCcw },
    { label: 'Achievements', value: `${unlockedCount}/${achievements.length}`, icon: Trophy },
    { label: 'Upcoming Plans', value: plans.filter(p => p.status === 'upcoming').length, icon: CalendarDays },
  ]

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 16px' }}>
      {/* ── Modals ───────────────────────────────────── */}
      {goalModal && (
        <GoalFormModal
          mode={goalModal.mode}
          goal={goalModal.goal}
          projects={projects}
          onSave={saveGoal}
          onDelete={deleteGoal}
          onClose={() => setGoalModal(null)}
        />
      )}
      {planModal && (
        <PlanFormModal
          mode={planModal.mode}
          plan={planModal.plan}
          projects={projects}
          onSave={savePlan}
          onDelete={deletePlan}
          onClose={() => setPlanModal(null)}
        />
      )}
      {rotationModal && (
        <RotationFormModal
          mode={rotationModal.mode}
          rotation={rotationModal.rotation}
          projects={projects}
          onSave={saveRotation}
          onDelete={deleteRotation}
          onClose={() => setRotationModal(null)}
        />
      )}

      {/* ── Page header ──────────────────────────────── */}
      <div style={{ paddingTop: 32, marginBottom: 24 }}>
        <h1 className="text-stone-900 dark:text-stone-100"
          style={{ fontFamily: "'Fraunces', serif", fontSize: 24, fontWeight: 700, marginBottom: 4 }}>
          Goals &amp; Plans
        </h1>
        <p className="text-stone-500 dark:text-stone-400 text-sm">
          Track your stitching goals, schedule plans, manage rotations, and celebrate achievements.
        </p>
      </div>

      {/* ── Hero stat cards ──────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
        {heroStats.map(stat => (
          <div key={stat.label} className="bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/30 rounded-lg"
            style={{ padding: '14px 16px', textAlign: 'center' }}>
            <stat.icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mx-auto" style={{ marginBottom: 6 }} />
            <p className="text-lg font-bold text-stone-900 dark:text-stone-100" style={{ fontFamily: "'JetBrains Mono', monospace", marginBottom: 2 }}>{stat.value}</p>
            <p className="text-xs text-stone-500 dark:text-stone-400">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* ── Tabs ─────────────────────────────────────── */}
      <div className="border-b border-stone-200 dark:border-stone-700"
        style={{ display: 'flex', gap: 0, margin: '0 -16px', padding: '0 16px', overflowX: 'auto' }}>
        {tabs.map(tab => {
          const isActive = activeTab === tab.id
          const badge = tab.getBadge()
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`transition-colors whitespace-nowrap ${isActive
                ? 'text-emerald-700 dark:text-emerald-400 border-b-2 border-emerald-600 dark:border-emerald-400'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300 border-b-2 border-transparent'
              }`}
              style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
              {badge > 0 && (
                <span className={isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400'}
                  style={{ fontSize: 11, fontWeight: 700, padding: '1px 6px', borderRadius: 999, fontFamily: "'JetBrains Mono', monospace" }}>{badge}</span>
              )}
            </button>
          )
        })}
      </div>

      {/* ── Tab content ──────────────────────────────── */}
      <div style={{ padding: '24px 0 48px' }}>

        {/* ════ GOALS TAB ════ */}
        {activeTab === 'goals' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 8 }}>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {([['all', 'All'], ['active', 'Active'], ['completed', 'Completed'], ['project', 'Project'], ['global', 'Global']] as const).map(([key, label]) => (
                  <button key={key} onClick={() => { setGoalFilter(key); setGoalsShown(10) }}
                    className={`rounded-full text-xs font-medium transition-colors ${goalFilter === key
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                      : 'bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
                    }`} style={{ padding: '5px 12px' }}>{label}</button>
                ))}
              </div>
              <button onClick={() => setGoalModal({ mode: 'create' })}
                className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white text-xs font-semibold rounded-md transition-colors"
                style={{ padding: '7px 14px', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Plus className="w-3.5 h-3.5" /> New Goal
              </button>
            </div>

            {filteredGoals.length === 0 ? (
              <EmptyState icon={Target} title="No goals yet" description="Set your first stitching goal to start tracking progress toward your targets." />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {filteredGoals.slice(0, goalsShown).map(goal => (
                  <GoalCard key={goal.id} goal={goal}
                    onEdit={() => setGoalModal({ mode: 'edit', goal })}
                    onTogglePause={() => toggleGoalPause(goal.id)}
                    onRenew={() => renewGoal(goal.id)}
                    onDismissNudge={() => dismissNudge(goal.id)}
                    onCheckOff={() => checkOffGoal(goal.id)}
                  />
                ))}
                {filteredGoals.length > goalsShown && (
                  <button onClick={() => setGoalsShown(prev => prev + 10)}
                    className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 text-xs font-medium transition-colors"
                    style={{ padding: '12px 0', textAlign: 'center' }}>
                    Show more ({filteredGoals.length - goalsShown} remaining)
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* ════ PLANS TAB ════ */}
        {activeTab === 'plans' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 8 }}>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {([['all', 'All'], ['active', 'Active'], ['upcoming', 'Upcoming'], ['completed', 'Completed']] as const).map(([key, label]) => (
                  <button key={key} onClick={() => { setPlanFilter(key); setPlansShown(10) }}
                    className={`rounded-full text-xs font-medium transition-colors ${planFilter === key
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                      : 'bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
                    }`} style={{ padding: '5px 12px' }}>{label}</button>
                ))}
              </div>
              <button onClick={() => setPlanModal({ mode: 'create' })}
                className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white text-xs font-semibold rounded-md transition-colors"
                style={{ padding: '7px 14px', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Plus className="w-3.5 h-3.5" /> New Plan
              </button>
            </div>

            {/* Timeline */}
            <div className="bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 rounded-lg"
              style={{ padding: '16px 20px', marginBottom: 20 }}>
              <p className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider" style={{ marginBottom: 12 }}>Timeline</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0, position: 'relative' }}>
                <div className="bg-stone-200 dark:bg-stone-700" style={{ position: 'absolute', left: 5, top: 8, bottom: 8, width: 2 }} />
                {plans
                  .filter(p => p.status === 'active' || p.status === 'upcoming')
                  .sort((a, b) => (a.scheduledDate || a.endDate || '9999').localeCompare(b.scheduledDate || b.endDate || '9999'))
                  .map(plan => {
                    const dateStr = plan.scheduledDate || plan.endDate
                    const isPlanActive = plan.status === 'active'
                    return (
                      <div key={plan.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 0', position: 'relative' }}>
                        <div className={`rounded-full shrink-0 ${isPlanActive ? 'bg-emerald-500 dark:bg-emerald-400' : 'bg-stone-300 dark:bg-stone-600'}`}
                          style={{ width: 12, height: 12, zIndex: 1 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <span className="text-xs font-medium text-stone-700 dark:text-stone-300">{plan.project.name}</span>
                          <span className="text-xs text-stone-400 dark:text-stone-500"> &mdash; {plan.title}</span>
                        </div>
                        {dateStr && <span className="text-xs text-stone-400 dark:text-stone-500 shrink-0">{formatDate(dateStr)}</span>}
                        {plan.recurrenceLabel && !dateStr && <span className="text-xs text-sky-500 dark:text-sky-400 shrink-0">{plan.recurrenceLabel}</span>}
                      </div>
                    )
                  })}
              </div>
            </div>

            {filteredPlans.length === 0 ? (
              <EmptyState icon={CalendarDays} title="No plans yet" description="Create a plan to schedule when you'd like to start or focus on your projects." />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {filteredPlans.slice(0, plansShown).map(plan => (
                  <PlanCard key={plan.id} plan={plan}
                    onEdit={() => setPlanModal({ mode: 'edit', plan })}
                    onUpdateStatus={(status) => updatePlanStatus(plan.id, status)}
                  />
                ))}
                {filteredPlans.length > plansShown && (
                  <button onClick={() => setPlansShown(prev => prev + 10)}
                    className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 text-xs font-medium transition-colors"
                    style={{ padding: '12px 0', textAlign: 'center' }}>
                    Show more ({filteredPlans.length - plansShown} remaining)
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* ════ ROTATIONS TAB ════ */}
        {activeTab === 'rotations' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <p className="text-sm text-stone-500 dark:text-stone-400">
                {rotations.length} rotation{rotations.length !== 1 ? 's' : ''}
                {activeRotations.length > 0 && ` (${activeRotations.length} active)`}
              </p>
              <button onClick={() => setRotationModal({ mode: 'create' })}
                className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white text-xs font-semibold rounded-md transition-colors"
                style={{ padding: '7px 14px', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Plus className="w-3.5 h-3.5" /> New Rotation
              </button>
            </div>

            {rotations.length === 0 ? (
              <EmptyState icon={RotateCcw} title="No rotations yet" description="Create a rotation to manage how you divide stitching time across your WIPs." />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {rotations
                  .sort((a, b) => (a.status === 'active' ? -1 : 1))
                  .map(rotation => (
                    <RotationCard key={rotation.id} rotation={rotation}
                      onEdit={() => setRotationModal({ mode: 'edit', rotation })}
                      onTogglePause={() => toggleRotationPause(rotation.id)}
                      onSkipTurn={() => advanceTurn(rotation.id)}
                      onCompleteTurn={() => advanceTurn(rotation.id)}
                    />
                  ))}
              </div>
            )}

            {/* Rotation styles reference */}
            <div style={{ marginTop: 32 }}>
              <p className="text-xs font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider" style={{ marginBottom: 12 }}>Rotation Styles</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                {(Object.entries(rotationStyleLabels) as [RotationStyle, { label: string; description: string }][]).map(([style, info]) => {
                  const Icon = rotationStyleIcons[style]
                  return (
                    <div key={style} className="bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-800 rounded-md"
                      style={{ padding: '10px 12px', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                      <Icon className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500 shrink-0" style={{ marginTop: 1 }} />
                      <div>
                        <p className="text-xs font-semibold text-stone-700 dark:text-stone-300">{info.label}</p>
                        <p className="text-xs text-stone-400 dark:text-stone-500">{info.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* ════ ACHIEVEMENTS TAB ════ */}
        {activeTab === 'achievements' && (
          <div>
            <div className="bg-gradient-to-r from-emerald-50 to-emerald-50/30 dark:from-emerald-950/30 dark:to-transparent border border-emerald-200/60 dark:border-emerald-800/30 rounded-lg"
              style={{ padding: '20px 24px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 20 }}>
              <div className="bg-emerald-100 dark:bg-emerald-900/40 rounded-full flex items-center justify-center shrink-0" style={{ width: 56, height: 56 }}>
                <Trophy className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-lg font-bold text-stone-900 dark:text-stone-100" style={{ fontFamily: "'Fraunces', serif", marginBottom: 2 }}>
                  {unlockedCount} of {achievements.length} Achievements Unlocked
                </p>
                <div style={{ marginTop: 6, width: 200 }}>
                  <ProgressBar current={unlockedCount} target={achievements.length} colorClass="bg-emerald-500 dark:bg-emerald-400" />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 20 }}>
              <button onClick={() => setAchievementFilter('all')}
                className={`rounded-full text-xs font-medium transition-colors ${achievementFilter === 'all'
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                  : 'bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
                }`} style={{ padding: '5px 12px' }}>All</button>
              {(Object.entries(achievementCategoryLabels) as [AchievementCategory, string][]).map(([cat, label]) => {
                const CatIcon = achievementCategoryIcons[cat]
                return (
                  <button key={cat} onClick={() => setAchievementFilter(cat)}
                    className={`rounded-full text-xs font-medium transition-colors ${achievementFilter === cat
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                      : 'bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
                    }`} style={{ padding: '5px 12px', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <CatIcon className="w-3 h-3" /> {label}
                  </button>
                )
              })}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
              {filteredAchievements
                .sort((a, b) => {
                  if (a.isUnlocked && !b.isUnlocked) return -1
                  if (!a.isUnlocked && b.isUnlocked) return 1
                  return (b.currentValue / b.targetValue) - (a.currentValue / a.targetValue)
                })
                .map(achievement => (
                  <AchievementCard key={achievement.id} achievement={achievement} />
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

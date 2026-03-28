import { useState, useMemo } from 'react'
import {
  Target,
  CalendarDays,
  RotateCcw,
  Plus,
  Check,
  Pause,
  Play,
  SkipForward,
  Scissors,
  Clock,
  Flame,
  Repeat,
  ArrowRight,
  Sun,
  Shuffle,
  X,
  Pencil,
  Trash2,
  RefreshCw,
  GripVertical,
  AlertCircle,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import type {
  ProjectGoalsPanelProps,
  Goal,
  Plan,
  Rotation,
  RotationProject,
  GoalStatus,
  GoalPeriod,
  GoalType,
  PlanType,
  PlanStatus,
  RotationStyle,
  TurnTriggerType,
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
  milestone: 'Milestone', frequency: 'Frequency', deadline: 'Deadline', sessionCount: 'Sessions',
  volume: 'Volume', consistency: 'Consistency', projectCompletion: 'Completion', projectStart: 'Start', manual: 'Manual',
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
  milestone: 'percent', frequency: 'sessions', deadline: 'percent', sessionCount: 'sessions',
  volume: 'stitches', consistency: 'days', projectCompletion: 'projects', projectStart: 'projects', manual: 'completed',
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
  roundRobin: RotateCcw, focusRotate: Target, dailyAssignment: CalendarDays,
  milestoneRotation: Flame, randomShuffle: Shuffle, seasonalFocus: Sun,
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

function ProgressRing({ current, target, size = 48, strokeWidth = 4 }: { current: number; target: number; size?: number; strokeWidth?: number }) {
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

function EmptyState({ icon: Icon, title, description, action, onAction }: {
  icon: typeof Target; title: string; description: string; action?: string; onAction?: () => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', textAlign: 'center' }}>
      <div className="bg-stone-100 dark:bg-stone-800 rounded-full" style={{ width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
        <Icon className="w-5 h-5 text-stone-400 dark:text-stone-500" strokeWidth={1.5} />
      </div>
      <p className="text-stone-700 dark:text-stone-300 font-semibold text-sm" style={{ fontFamily: "'Fraunces', serif", marginBottom: 4 }}>{title}</p>
      <p className="text-stone-500 dark:text-stone-400 text-xs" style={{ maxWidth: 260, marginBottom: action ? 12 : 0 }}>{description}</p>
      {action && onAction && (
        <button onClick={onAction}
          className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white text-xs font-semibold rounded-md transition-colors"
          style={{ padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Plus className="w-3 h-3" /> {action}
        </button>
      )}
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
   GOAL FORM MODAL (project pre-selected)
   ══════════════════════════════════════════════════════════ */

function GoalFormModal({
  mode,
  goal,
  project,
  onSave,
  onDelete,
  onClose,
}: {
  mode: 'create' | 'edit'
  goal?: Goal
  project: ProjectSummary
  onSave: (goal: Goal) => void
  onDelete?: (id: string) => void
  onClose: () => void
}) {
  const [title, setTitle] = useState(goal?.title ?? '')
  const [description, setDescription] = useState(goal?.description ?? '')
  const [type, setType] = useState<GoalType>(goal?.type ?? 'milestone')
  const [period, setPeriod] = useState<GoalPeriod>(goal?.period ?? 'oneTime')
  const [targetValue, setTargetValue] = useState(goal?.targetValue ?? 100)
  const [dueDate, setDueDate] = useState(goal?.dueDate ?? '')
  const [isRecurring, setIsRecurring] = useState(goal?.isRecurring ?? false)
  const [autoRenew, setAutoRenew] = useState(goal?.autoRenew ?? false)
  const [milestoneUnit, setMilestoneUnit] = useState<'percent' | 'stitches'>(goal?.unit === 'stitches' ? 'stitches' : 'percent')

  // Only project goal types since project is pre-selected
  const projectGoalTypes: GoalType[] = ['milestone', 'frequency', 'deadline', 'sessionCount', 'manual']
  const unit = (type === 'milestone' || type === 'deadline') ? milestoneUnit : goalTypeUnits[type]

  function handleSave() {
    const newGoal: Goal = {
      id: goal?.id ?? `goal-new-${Date.now()}`,
      title: title || `New ${goalTypeLabels[type]} Goal`,
      description,
      type,
      period,
      status: goal?.status ?? 'active',
      project: { id: project.id, name: project.name } as any,
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
      <div className="border-b border-stone-200 dark:border-stone-700" style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 className="text-base font-bold text-stone-900 dark:text-stone-100" style={{ fontFamily: "'Fraunces', serif" }}>
          {mode === 'create' ? 'New Goal' : 'Edit Goal'}
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {mode === 'edit' && onDelete && goal && (
            <button onClick={() => { onDelete(goal.id); onClose() }}
              className="text-stone-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
              style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6 }}
              title="Delete goal">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button onClick={onClose}
            className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors"
            style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6 }}>
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div style={{ padding: '20px 24px' }}>
        {/* Project context banner */}
        <div className="bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-800 rounded-md"
          style={{ padding: '10px 12px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
          <CoverPlaceholder status={project.status} size={28} />
          <div>
            <p className="text-xs font-semibold text-stone-700 dark:text-stone-300">{project.name}</p>
            <p className="text-xs text-stone-500 dark:text-stone-400">{project.percentComplete}% complete</p>
          </div>
        </div>

        <FormField label="Title" hint="What are you working toward?">
          <input type="text" className={inputClasses} value={title} onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Finish Woodland Sampler by Holidays" />
        </FormField>

        <FormField label="Description" hint="Optional context or motivation">
          <textarea className={inputClasses} rows={2} value={description} onChange={e => setDescription(e.target.value)}
            placeholder="e.g. Push to complete before the gifting deadline" />
        </FormField>

        <FormField label="Goal Type" hint="What kind of target is this?">
          <select className={selectClasses} value={type} onChange={e => setType(e.target.value as GoalType)}>
            {projectGoalTypes.map(t => (
              <option key={t} value={t}>{goalTypeLabels[t]} — {goalTypeDescriptions[t]}</option>
            ))}
          </select>
        </FormField>

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

      <div className="border-t border-stone-200 dark:border-stone-700" style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
        <button onClick={onClose}
          className="text-stone-600 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 text-sm font-medium transition-colors"
          style={{ padding: '8px 16px' }}>
          Cancel
        </button>
        <button onClick={handleSave}
          className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white text-sm font-semibold rounded-md transition-colors"
          style={{ padding: '8px 20px' }}>
          {mode === 'create' ? 'Create Goal' : 'Save Changes'}
        </button>
      </div>
    </ModalBackdrop>
  )
}

/* ══════════════════════════════════════════════════════════
   PLAN FORM MODAL (project pre-selected)
   ══════════════════════════════════════════════════════════ */

function PlanFormModal({
  mode,
  plan,
  project,
  onSave,
  onDelete,
  onClose,
}: {
  mode: 'create' | 'edit'
  plan?: Plan
  project: ProjectSummary
  onSave: (plan: Plan) => void
  onDelete?: (id: string) => void
  onClose: () => void
}) {
  const [title, setTitle] = useState(plan?.title ?? '')
  const [description, setDescription] = useState(plan?.description ?? '')
  const [planType, setPlanType] = useState<PlanType>(plan?.planType ?? 'startDate')
  const [scheduledDate, setScheduledDate] = useState(plan?.scheduledDate ?? '')
  const [endDate, setEndDate] = useState(plan?.endDate ?? '')
  const [dayOfWeek, setDayOfWeek] = useState<number>(plan?.recurrenceDayOfWeek ?? 5)
  const [season, setSeason] = useState(plan?.season ?? 'Spring')
  const [recurrenceLabel, setRecurrenceLabel] = useState(plan?.recurrenceLabel ?? '')

  function handleSave() {
    const newPlan: Plan = {
      id: plan?.id ?? `plan-new-${Date.now()}`,
      title: title || `New ${planTypeStyles[planType].label}`,
      description,
      project: project as any,
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
              title="Delete plan">
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
        {/* Project context banner */}
        <div className="bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-800 rounded-md"
          style={{ padding: '10px 12px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
          <CoverPlaceholder status={project.status} size={28} />
          <div>
            <p className="text-xs font-semibold text-stone-700 dark:text-stone-300">{project.name}</p>
            <p className="text-xs text-stone-500 dark:text-stone-400">{project.percentComplete}% complete</p>
          </div>
        </div>

        <FormField label="Plan Type" hint="What kind of schedule is this?">
          <select className={selectClasses} value={planType} onChange={e => setPlanType(e.target.value as PlanType)}>
            <option value="startDate">Start Date — Plan to start on a specific date</option>
            <option value="recurringSchedule">Recurring — Stitch on a regular schedule</option>
            <option value="deadline">Deadline — Finish by a specific date</option>
            <option value="seasonalFocus">Seasonal Focus — Focus during a season</option>
          </select>
        </FormField>

        <FormField label="Title" hint="Describe the plan">
          <input type="text" className={inputClasses} value={title} onChange={e => setTitle(e.target.value)}
            placeholder={planType === 'startDate' ? 'e.g. Start in April' : planType === 'recurringSchedule' ? 'e.g. Stitch every Friday evening' : planType === 'deadline' ? 'e.g. Finish by end of 2026' : 'e.g. Focus on this during Summer'} />
        </FormField>

        <FormField label="Description" hint="Optional notes or motivation">
          <textarea className={inputClasses} rows={2} value={description} onChange={e => setDescription(e.target.value)} />
        </FormField>

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
        <button onClick={handleSave}
          className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white text-sm font-semibold rounded-md transition-colors"
          style={{ padding: '8px 20px' }}>
          {mode === 'create' ? 'Create Plan' : 'Save Changes'}
        </button>
      </div>
    </ModalBackdrop>
  )
}

/* ══════════════════════════════════════════════════════════
   SECTION HEADER
   ══════════════════════════════════════════════════════════ */

function SectionHeader({ icon: Icon, title, count, actionLabel, onAction }: {
  icon: typeof Target; title: string; count: number; actionLabel: string; onAction: () => void
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
        <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100" style={{ fontFamily: "'Fraunces', serif" }}>
          {title}
        </h3>
        {count > 0 && (
          <span className="bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 text-xs font-medium rounded-full"
            style={{ padding: '1px 8px' }}>
            {count}
          </span>
        )}
      </div>
      <button onClick={onAction}
        className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 text-xs font-semibold transition-colors"
        style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
        <Plus className="w-3 h-3" /> {actionLabel}
      </button>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT: ProjectGoalsPanel
   ══════════════════════════════════════════════════════════ */

export function ProjectGoalsPanel({
  project,
  goals: initialGoals,
  plans: initialPlans,
  rotationMemberships: initialRotations,
  onCreateGoal,
  onCreatePlan,
  onEditGoal,
  onEditPlan,
  onDeleteGoal,
  onDeletePlan,
}: ProjectGoalsPanelProps) {
  /* ── Local state for live updates ──────────────────── */
  const [goals, setGoals] = useState<Goal[]>(initialGoals)
  const [plans, setPlans] = useState<Plan[]>(initialPlans)

  /* ── Modal state ───────────────────────────────────── */
  const [goalModal, setGoalModal] = useState<{ mode: 'create' | 'edit'; goal?: Goal } | null>(null)
  const [planModal, setPlanModal] = useState<{ mode: 'create' | 'edit'; plan?: Plan } | null>(null)

  /* ── Derived data ──────────────────────────────────── */
  const activeGoals = useMemo(() => goals.filter(g => g.status === 'active' || g.status === 'paused'), [goals])
  const completedGoals = useMemo(() => goals.filter(g => g.status === 'completed'), [goals])
  const activePlans = useMemo(() => plans.filter(p => p.status === 'active' || p.status === 'upcoming'), [plans])
  const completedPlans = useMemo(() => plans.filter(p => p.status === 'completed' || p.status === 'skipped'), [plans])

  // Find this project's membership in rotations
  const rotationMemberships = useMemo(() => {
    return initialRotations.map(rot => {
      const membership = rot.projects.find(rp => rp.project.id === project.id)
      return membership ? { rotation: rot, membership } : null
    }).filter(Boolean) as { rotation: Rotation; membership: RotationProject }[]
  }, [initialRotations, project.id])

  /* ── Goal actions ──────────────────────────────────── */

  function handleGoalSave(goal: Goal) {
    if (goalModal?.mode === 'create') {
      setGoals(prev => [goal, ...prev])
      onCreateGoal?.(goal)
    } else {
      setGoals(prev => prev.map(g => g.id === goal.id ? goal : g))
      onEditGoal?.(goal.id, goal)
    }
  }

  function handleGoalDelete(goalId: string) {
    setGoals(prev => prev.filter(g => g.id !== goalId))
    onDeleteGoal?.(goalId)
  }

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

  /* ── Plan actions ──────────────────────────────────── */

  function handlePlanSave(plan: Plan) {
    if (planModal?.mode === 'create') {
      setPlans(prev => [plan, ...prev])
      onCreatePlan?.(plan)
    } else {
      setPlans(prev => prev.map(p => p.id === plan.id ? plan : p))
      onEditPlan?.(plan.id, plan)
    }
  }

  function handlePlanDelete(planId: string) {
    setPlans(prev => prev.filter(p => p.id !== planId))
    onDeletePlan?.(planId)
  }

  function updatePlanStatus(planId: string, status: PlanStatus) {
    setPlans(prev => prev.map(p => p.id === planId ? { ...p, status } : p))
  }

  /* ── Has any content at all? ───────────────────────── */
  const hasGoals = goals.length > 0
  const hasPlans = plans.length > 0
  const hasRotations = rotationMemberships.length > 0
  const hasAnything = hasGoals || hasPlans || hasRotations

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      {/* If completely empty, show a welcoming empty state */}
      {!hasAnything && (
        <div className="border border-dashed border-stone-200 dark:border-stone-700 rounded-xl"
          style={{ padding: '48px 24px', textAlign: 'center' }}>
          <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-full mx-auto"
            style={{ width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <Target className="w-6 h-6 text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
          </div>
          <h3 className="text-base font-bold text-stone-900 dark:text-stone-100" style={{ fontFamily: "'Fraunces', serif", marginBottom: 4 }}>
            No goals or plans yet
          </h3>
          <p className="text-sm text-stone-500 dark:text-stone-400" style={{ maxWidth: 320, margin: '0 auto 20px' }}>
            Set goals, schedule plans, or add this project to a rotation to stay on track.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
            <button onClick={() => setGoalModal({ mode: 'create' })}
              className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white text-xs font-semibold rounded-md transition-colors"
              style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Plus className="w-3 h-3" /> Add Goal
            </button>
            <button onClick={() => setPlanModal({ mode: 'create' })}
              className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-stone-300 dark:hover:border-stone-600 text-xs font-semibold rounded-md transition-colors"
              style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Plus className="w-3 h-3" /> Add Plan
            </button>
          </div>
        </div>
      )}

      {/* ── Goals Section ─────────────────────────────── */}
      {hasAnything && (
        <div style={{ marginBottom: 32 }}>
          <SectionHeader
            icon={Target}
            title="Goals"
            count={activeGoals.length}
            actionLabel="Add Goal"
            onAction={() => setGoalModal({ mode: 'create' })}
          />

          {!hasGoals ? (
            <EmptyState
              icon={Target}
              title="No goals set"
              description="Track progress with milestone targets, frequency goals, or custom check-offs."
              action="Add Goal"
              onAction={() => setGoalModal({ mode: 'create' })}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {/* Active/paused goals */}
              {activeGoals.map(goal => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onEdit={() => setGoalModal({ mode: 'edit', goal })}
                  onTogglePause={() => toggleGoalPause(goal.id)}
                  onCheckOff={() => checkOffGoal(goal.id)}
                />
              ))}

              {/* Completed goals (collapsed) */}
              {completedGoals.length > 0 && (
                <CompletedSection label={`${completedGoals.length} completed`}>
                  {completedGoals.map(goal => (
                    <GoalCard
                      key={goal.id}
                      goal={goal}
                      onEdit={() => setGoalModal({ mode: 'edit', goal })}
                    />
                  ))}
                </CompletedSection>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Plans Section ─────────────────────────────── */}
      {hasAnything && (
        <div style={{ marginBottom: 32 }}>
          <SectionHeader
            icon={CalendarDays}
            title="Plans"
            count={activePlans.length}
            actionLabel="Add Plan"
            onAction={() => setPlanModal({ mode: 'create' })}
          />

          {!hasPlans ? (
            <EmptyState
              icon={CalendarDays}
              title="No plans scheduled"
              description="Set start dates, recurring stitching schedules, deadlines, or seasonal focus periods."
              action="Add Plan"
              onAction={() => setPlanModal({ mode: 'create' })}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {activePlans.map(plan => (
                <PlanCardCompact
                  key={plan.id}
                  plan={plan}
                  onEdit={() => setPlanModal({ mode: 'edit', plan })}
                  onUpdateStatus={(status) => updatePlanStatus(plan.id, status)}
                />
              ))}

              {completedPlans.length > 0 && (
                <CompletedSection label={`${completedPlans.length} completed/skipped`}>
                  {completedPlans.map(plan => (
                    <PlanCardCompact
                      key={plan.id}
                      plan={plan}
                      onEdit={() => setPlanModal({ mode: 'edit', plan })}
                    />
                  ))}
                </CompletedSection>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Rotation Membership Section ───────────────── */}
      {hasRotations && (
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <RotateCcw className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100" style={{ fontFamily: "'Fraunces', serif" }}>
              Rotations
            </h3>
            <span className="bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 text-xs font-medium rounded-full"
              style={{ padding: '1px 8px' }}>
              {rotationMemberships.length}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {rotationMemberships.map(({ rotation, membership }) => (
              <RotationMembershipCard
                key={rotation.id}
                rotation={rotation}
                membership={membership}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Modals ────────────────────────────────────── */}
      {goalModal && (
        <GoalFormModal
          mode={goalModal.mode}
          goal={goalModal.goal}
          project={project}
          onSave={handleGoalSave}
          onDelete={goalModal.mode === 'edit' ? handleGoalDelete : undefined}
          onClose={() => setGoalModal(null)}
        />
      )}

      {planModal && (
        <PlanFormModal
          mode={planModal.mode}
          plan={planModal.plan}
          project={project}
          onSave={handlePlanSave}
          onDelete={planModal.mode === 'edit' ? handlePlanDelete : undefined}
          onClose={() => setPlanModal(null)}
        />
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   GOAL CARD (compact variant for panel)
   ══════════════════════════════════════════════════════════ */

function GoalCard({
  goal,
  onEdit,
  onTogglePause,
  onCheckOff,
}: {
  goal: Goal
  onEdit?: () => void
  onTogglePause?: () => void
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
      style={{ padding: '14px 16px' }}
    >
      {/* Renewal nudge */}
      {goal.showRenewalNudge && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-md"
          style={{ padding: '6px 10px', marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <RefreshCw className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            <span className="text-xs text-amber-700 dark:text-amber-400 font-medium">Continue this goal?</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 transition-colors">Yes</button>
            <span className="text-stone-300 dark:text-stone-600">|</span>
            <button className="text-xs text-stone-500 dark:text-stone-400 hover:text-stone-700 transition-colors">Dismiss</button>
          </div>
        </div>
      )}

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 6 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <button onClick={onEdit}
            className="text-sm font-semibold text-stone-900 dark:text-stone-100 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
            style={{ fontFamily: "'Source Sans 3', sans-serif", textAlign: 'left', marginBottom: 4, display: 'block' }}>
            {goal.title}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
          <button onClick={onEdit}
            className="text-stone-400 hover:text-emerald-600 dark:text-stone-500 dark:hover:text-emerald-400 transition-colors"
            style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6 }}
            title="Edit goal">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          {goal.status === 'active' && !isManual && onTogglePause && (
            <button onClick={onTogglePause}
              className="text-stone-400 hover:text-amber-600 dark:text-stone-500 dark:hover:text-amber-400 transition-colors"
              style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6 }}
              title="Pause goal">
              <Pause className="w-3.5 h-3.5" />
            </button>
          )}
          {goal.status === 'paused' && onTogglePause && (
            <button onClick={onTogglePause}
              className="text-stone-400 hover:text-emerald-600 dark:text-stone-500 dark:hover:text-emerald-400 transition-colors"
              style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6 }}
              title="Resume goal">
              <Play className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

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
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 4 }}>
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
        <div style={{ marginTop: 6 }}><DueDate dateStr={goal.dueDate} /></div>
      )}

      {/* Completed date */}
      {isComplete && goal.completedAt && (
        <div style={{ marginTop: 6 }}>
          <span className="text-xs text-violet-600 dark:text-violet-400">
            Completed {formatDate(goal.completedAt)} ({daysAgo(goal.completedAt)}d ago)
          </span>
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   PLAN CARD (compact variant — no project thumbnail since
   we're already on the project detail page)
   ══════════════════════════════════════════════════════════ */

function PlanCardCompact({
  plan,
  onEdit,
  onUpdateStatus,
}: {
  plan: Plan
  onEdit?: () => void
  onUpdateStatus?: (status: PlanStatus) => void
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
      style={{ padding: '14px 16px' }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 6 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <button onClick={onEdit}
            className="text-sm font-semibold text-stone-900 dark:text-stone-100 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
            style={{ fontFamily: "'Source Sans 3', sans-serif", textAlign: 'left', marginBottom: 4, display: 'block' }}>
            {plan.title}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
            <PlanTypeBadge planType={plan.planType} />
            <span className={`inline-flex items-center rounded-full text-xs font-medium px-2 py-0.5 ${
              isActive ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
              : isUpcoming ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400'
              : isCompleted ? 'bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-400'
              : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400'
            }`}>{planStatusLabels[plan.status]}</span>
          </div>
        </div>

        {/* Actions with text labels */}
        {(isActive || isUpcoming) && onUpdateStatus && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
            <button onClick={() => onUpdateStatus('completed')}
              className="text-stone-400 hover:text-emerald-600 dark:text-stone-500 dark:hover:text-emerald-400 transition-colors text-xs font-medium"
              style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '4px 8px', borderRadius: 6 }}>
              <Check className="w-3.5 h-3.5" />
              Complete
            </button>
            <button onClick={() => onUpdateStatus('skipped')}
              className="text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-400 transition-colors text-xs font-medium"
              style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '4px 8px', borderRadius: 6 }}>
              <SkipForward className="w-3.5 h-3.5" />
              Skip
            </button>
          </div>
        )}
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
   ROTATION MEMBERSHIP CARD
   Shows this project's role in a rotation
   ══════════════════════════════════════════════════════════ */

function RotationMembershipCard({ rotation, membership }: {
  rotation: Rotation
  membership: RotationProject
}) {
  const StyleIcon = rotationStyleIcons[rotation.style]
  const styleInfo = rotationStyleLabels[rotation.style]
  const isActive = rotation.status === 'active'
  const isPaused = rotation.status === 'paused'
  const isCurrent = membership.isCurrent && isActive

  return (
    <div className={`border rounded-lg transition-all ${
      isCurrent
        ? 'border-emerald-200 dark:border-emerald-800/50 bg-white dark:bg-stone-900'
        : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900'
    }`}
      style={{ padding: '14px 16px' }}
    >
      {/* Rotation info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div className={`rounded-lg flex items-center justify-center shrink-0 ${
          isActive ? 'bg-emerald-100 dark:bg-emerald-900/40' : 'bg-stone-100 dark:bg-stone-800'}`}
          style={{ width: 36, height: 36 }}>
          <StyleIcon className={`w-4 h-4 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-stone-500 dark:text-stone-400'}`} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            <span className="text-sm font-semibold text-stone-900 dark:text-stone-100" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
              {rotation.name}
            </span>
            <span className={`inline-flex items-center rounded-full text-xs font-medium px-2 py-0.5 ${
              isActive ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
              : isPaused ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'
              : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400'
            }`}>{rotation.status.charAt(0).toUpperCase() + rotation.status.slice(1)}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="text-xs text-stone-500 dark:text-stone-400">{styleInfo.label}</span>
            <span className="text-xs text-stone-400 dark:text-stone-600">&middot;</span>
            <span className="text-xs text-stone-500 dark:text-stone-400">{rotation.projects.length} projects</span>
          </div>
        </div>
      </div>

      {/* This project's role */}
      <div className={`rounded-md ${
        isCurrent
          ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/30'
          : 'bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-800'
      }`}
        style={{ padding: '10px 12px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {isCurrent && (
              <ProgressRing current={membership.turnProgress} target={membership.turnTarget} size={40} strokeWidth={3.5} />
            )}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                {isCurrent && (
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                    Your Turn
                  </span>
                )}
                {!isCurrent && isActive && (
                  <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
                    Position #{membership.order} in queue
                  </span>
                )}
                {!isActive && (
                  <span className="text-xs font-medium text-stone-400 dark:text-stone-500">
                    Position #{membership.order}
                  </span>
                )}
                {membership.isFocus && (
                  <span className="bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 text-xs font-medium px-1.5 py-0.5 rounded-full">
                    Focus
                  </span>
                )}
              </div>
              <span className="text-xs text-stone-500 dark:text-stone-400">
                Turn trigger: <span className="font-medium text-stone-600 dark:text-stone-300">{fmt(membership.turnTrigger.value)} {membership.turnTrigger.unit}</span>
              </span>
            </div>
          </div>

          {isCurrent && (
            <div style={{ textAlign: 'right' }}>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                <span className="font-semibold text-stone-700 dark:text-stone-300" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{fmt(membership.turnProgress)}</span>
                {' / '}<span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{fmt(membership.turnTarget)}</span>
                {' '}{membership.turnUnit}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   COMPLETED SECTION (collapsible)
   ══════════════════════════════════════════════════════════ */

function CompletedSection({ label, children }: { label: string; children: React.ReactNode }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div>
      <button onClick={() => setExpanded(!expanded)}
        className="text-xs text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-400 transition-colors font-medium"
        style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 0' }}>
        {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        {label}
      </button>
      {expanded && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 4 }}>
          {children}
        </div>
      )}
    </div>
  )
}


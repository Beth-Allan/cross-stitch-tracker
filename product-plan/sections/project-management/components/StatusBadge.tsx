import type { ProjectStatus } from '../types'

const statusConfig: Record<ProjectStatus, { label: string; bg: string; text: string; dot: string }> = {
  'Unstarted': {
    label: 'Unstarted',
    bg: 'bg-stone-100 dark:bg-stone-800',
    text: 'text-stone-600 dark:text-stone-400',
    dot: 'bg-stone-400 dark:bg-stone-500',
  },
  'Kitting': {
    label: 'Kitting',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    text: 'text-amber-700 dark:text-amber-400',
    dot: 'bg-amber-500 dark:bg-amber-400',
  },
  'Kitted': {
    label: 'Ready',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    text: 'text-emerald-700 dark:text-emerald-400',
    dot: 'bg-emerald-500 dark:bg-emerald-400',
  },
  'In Progress': {
    label: 'Stitching',
    bg: 'bg-sky-50 dark:bg-sky-950/40',
    text: 'text-sky-700 dark:text-sky-400',
    dot: 'bg-sky-500 dark:bg-sky-400',
  },
  'On Hold': {
    label: 'On Hold',
    bg: 'bg-orange-50 dark:bg-orange-950/40',
    text: 'text-orange-700 dark:text-orange-400',
    dot: 'bg-orange-400 dark:bg-orange-400',
  },
  'Finished': {
    label: 'Finished',
    bg: 'bg-violet-50 dark:bg-violet-950/40',
    text: 'text-violet-700 dark:text-violet-400',
    dot: 'bg-violet-500 dark:bg-violet-400',
  },
  'FFO': {
    label: 'FFO',
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    text: 'text-rose-700 dark:text-rose-400',
    dot: 'bg-rose-500 dark:bg-rose-400',
  },
}

interface StatusBadgeProps {
  status: ProjectStatus
  size?: 'sm' | 'md'
}

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const config = statusConfig[status]
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1'

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizeClasses} ${config.bg} ${config.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  )
}

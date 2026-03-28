import type { SizeCategory } from '../types'

const sizeLabels: Record<SizeCategory, string> = {
  Mini: 'Mini',
  Small: 'Small',
  Medium: 'Med',
  Large: 'Large',
  BAP: 'BAP',
}

interface SizeBadgeProps {
  size: SizeCategory
}

export function SizeBadge({ size }: SizeBadgeProps) {
  return (
    <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-400 dark:text-stone-500">
      {sizeLabels[size]}
    </span>
  )
}

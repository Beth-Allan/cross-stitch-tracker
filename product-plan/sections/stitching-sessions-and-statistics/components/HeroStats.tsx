import type { HeroStats as HeroStatsType } from '../types'
import { Zap, CalendarDays, CalendarRange, TrendingUp } from 'lucide-react'

function formatNumber(n: number): string {
  return n.toLocaleString()
}

interface HeroStatsProps {
  stats: HeroStatsType
}

const statConfig = [
  { key: 'stitchesToday' as const, label: 'Today', icon: Zap },
  { key: 'stitchesThisWeek' as const, label: 'This Week', icon: CalendarDays },
  { key: 'stitchesThisMonth' as const, label: 'This Month', icon: CalendarRange },
  { key: 'stitchesThisYear' as const, label: 'This Year', icon: TrendingUp },
]

export function HeroStats({ stats }: HeroStatsProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
      {statConfig.map(({ key, label, icon: Icon }) => (
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
            {formatNumber(stats[key])}
          </p>
          <p
            style={{
              fontSize: '12px',
              color: '#a8a29e',
              marginTop: '4px',
              fontFamily: "'Source Sans 3', sans-serif",
            }}
          >
            stitches
          </p>
        </div>
      ))}
    </div>
  )
}

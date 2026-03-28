import type { PersonalBest } from '../types'
import { Trophy, Flame, Star } from 'lucide-react'

function formatNumber(n: number): string {
  return n.toLocaleString()
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

interface PersonalBestsProps {
  bests: PersonalBest[]
  onNavigateToProject?: (projectId: string) => void
}

// Map known project names to IDs for linking
const projectNameMap: Record<string, string> = {
  'Enchanted Forest Sampler': 'proj-1',
  'Gold Collection: Autumn Retreat': 'proj-3',
  'Autumn Retreat': 'proj-3',
  'Maritime Mystery SAL': 'proj-6',
  'Stargazer Lily': 'proj-5',
  'Vancouver Skyline': 'proj-7',
}

const icons = [Trophy, Flame, Star]

export function PersonalBests({ bests, onNavigateToProject }: PersonalBestsProps) {
  if (bests.length === 0) return null

  return (
    <div style={{ paddingTop: 48 }}>
      <h3
        className="text-sm font-semibold text-stone-900 dark:text-stone-100 mb-4 flex items-center gap-2"
        style={{ fontFamily: "'Fraunces', serif" }}
      >
        <Trophy className="w-4 h-4 text-amber-500" strokeWidth={1.5} />
        Personal Bests
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {bests.map((best, i) => {
          const Icon = icons[i % icons.length]
          return (
            <div
              key={best.label}
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                border: '1px solid #e7e5e4',
                padding: '20px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div style={{ position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '8px',
                      backgroundColor: '#fef3c7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon style={{ width: 14, height: 14, color: '#d97706' }} strokeWidth={2} />
                  </div>
                  <span
                    style={{
                      fontSize: '11px',
                      color: '#78716c',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      fontFamily: "'Source Sans 3', sans-serif",
                    }}
                  >
                    {best.label}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: '24px',
                    fontWeight: 600,
                    color: '#1c1917',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontVariantNumeric: 'tabular-nums',
                    marginBottom: '4px',
                  }}
                >
                  {typeof best.value === 'number' ? formatNumber(best.value) : best.value}
                  {best.label.toLowerCase().includes('streak') ? (
                    <span style={{ fontSize: '14px', marginLeft: '4px', color: '#a8a29e', fontFamily: "'Source Sans 3', sans-serif" }}>days</span>
                  ) : (
                    <span style={{ fontSize: '14px', marginLeft: '4px', color: '#a8a29e', fontFamily: "'Source Sans 3', sans-serif" }}>stitches</span>
                  )}
                </p>
                <p
                  style={{
                    fontSize: '12px',
                    color: '#a8a29e',
                    fontFamily: "'Source Sans 3', sans-serif",
                  }}
                >
                  {best.endDate
                    ? `${formatDate(best.date)} – ${formatDate(best.endDate)}`
                    : formatDate(best.date)
                  } &middot;{' '}
                  {projectNameMap[best.projectName] && onNavigateToProject ? (
                    <button
                      onClick={() => onNavigateToProject(projectNameMap[best.projectName])}
                      className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                      style={{
                        textDecoration: 'underline',
                        textUnderlineOffset: '2px',
                        textDecorationColor: '#d6d3d1',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#a8a29e',
                        fontSize: '12px',
                        fontFamily: "'Source Sans 3', sans-serif",
                        padding: 0,
                      }}
                    >
                      {best.projectName}
                    </button>
                  ) : best.projectName}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

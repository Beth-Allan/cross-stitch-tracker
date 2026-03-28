import { useState, useRef, useEffect } from 'react'
import type { MonthlyStitchTotal, DailyBreakdown } from '../types'
import { BarChart3 } from 'lucide-react'

function formatNumber(n: number): string {
  return n.toLocaleString()
}

interface MonthlyChartProps {
  totals: MonthlyStitchTotal[]
  onRequestDailyBreakdown?: (month: string, year: number) => DailyBreakdown[]
  onNavigateToProject?: (projectId: string) => void
}

export function MonthlyChart({ totals, onRequestDailyBreakdown, onNavigateToProject }: MonthlyChartProps) {
  const [activeMonth, setActiveMonth] = useState<string | null>(null)
  const [popoverPos, setPopoverPos] = useState<{ x: number; y: number } | null>(null)
  const [dailyData, setDailyData] = useState<DailyBreakdown[]>([])
  const chartRef = useRef<HTMLDivElement>(null)

  const maxStitches = Math.max(...totals.map(t => t.totalStitches), 1)

  const handleBarClick = (total: MonthlyStitchTotal, barEl: HTMLDivElement) => {
    if (total.totalStitches === 0) return

    if (activeMonth === total.month) {
      setActiveMonth(null)
      setPopoverPos(null)
      return
    }

    const rect = barEl.getBoundingClientRect()
    const chartRect = chartRef.current?.getBoundingClientRect()
    if (chartRect) {
      setPopoverPos({
        x: rect.left - chartRect.left + rect.width / 2,
        y: rect.top - chartRect.top,
      })
    }

    setActiveMonth(total.month)
    const breakdown = onRequestDailyBreakdown?.(total.month, total.year) ?? []
    setDailyData(breakdown)
  }

  // Close popover on click outside the popover itself
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // Only close if clicking outside the entire chart container
      if (chartRef.current && !chartRef.current.contains(e.target as Node)) {
        setActiveMonth(null)
        setPopoverPos(null)
      }
    }
    if (activeMonth) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [activeMonth])

  // Clicking empty chart area (not a bar) dismisses popover
  const handleChartAreaClick = (e: React.MouseEvent) => {
    // Only dismiss if the click target is the chart background, not a bar
    if (e.target === e.currentTarget && activeMonth) {
      setActiveMonth(null)
      setPopoverPos(null)
    }
  }

  return (
    <div style={{ paddingTop: 48 }}>
      <h3
        className="text-sm font-semibold text-stone-900 dark:text-stone-100 mb-4 flex items-center gap-2"
        style={{ fontFamily: "'Fraunces', serif" }}
      >
        <BarChart3 className="w-4 h-4 text-emerald-500" strokeWidth={1.5} />
        Monthly Stitches — {totals[0]?.year ?? new Date().getFullYear()}
      </h3>

      <div
        ref={chartRef}
        className="relative bg-white dark:bg-stone-900 rounded-xl border border-stone-200/60 dark:border-stone-800 p-5"
      >
        {/* Chart area with y-axis */}
        <div style={{ display: 'flex', gap: '12px' }} onClick={handleChartAreaClick}>
          {/* Y-axis */}
          <div style={{ width: '40px', height: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flexShrink: 0 }}>
            <span className="text-[10px] text-stone-400 dark:text-stone-500 text-right tabular-nums leading-none" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
              {formatNumber(maxStitches)}
            </span>
            <span className="text-[10px] text-stone-400 dark:text-stone-500 text-right tabular-nums leading-none" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
              {formatNumber(Math.round(maxStitches / 2))}
            </span>
            <span className="text-[10px] text-stone-400 dark:text-stone-500 text-right tabular-nums leading-none" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
              0
            </span>
          </div>

          {/* Bars */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: '6px', height: '200px' }}>
            {totals.map((total) => {
              const pct = maxStitches > 0 ? total.totalStitches / maxStitches : 0
              const barPx = Math.round(pct * 196) // 196 to leave a little room
              const isActive = activeMonth === total.month
              const hasData = total.totalStitches > 0

              return (
                <div
                  key={total.month}
                  style={{
                    flex: 1,
                    height: Math.max(barPx, hasData ? 6 : 2),
                    borderRadius: '4px 4px 0 0',
                    cursor: hasData ? 'pointer' : 'default',
                    transition: 'background-color 150ms, box-shadow 150ms',
                    backgroundColor: hasData
                      ? isActive ? '#6ee7b7' : '#a7f3d0'
                      : '#f5f5f4',
                    boxShadow: isActive ? '0 4px 12px rgba(167, 243, 208, 0.4)' : 'none',
                  }}
                  onClick={(e) => handleBarClick(total, e.currentTarget)}
                  onMouseEnter={(e) => {
                    if (hasData && !isActive) e.currentTarget.style.backgroundColor = '#6ee7b7'
                  }}
                  onMouseLeave={(e) => {
                    if (hasData && !isActive) e.currentTarget.style.backgroundColor = '#a7f3d0'
                  }}
                />
              )
            })}
          </div>
        </div>

        {/* Month labels */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          <div style={{ width: '40px', flexShrink: 0 }} />
          <div style={{ flex: 1, display: 'flex', gap: '6px' }}>
            {totals.map((total) => {
              const isActive = activeMonth === total.month
              return (
                <div key={total.month} style={{ flex: 1, textAlign: 'center' }}>
                  <span
                    className={isActive ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-stone-400 dark:text-stone-500'}
                    style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                  >
                    {total.month}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Popover */}
        {activeMonth && popoverPos && (
          <div
            className="absolute z-20 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg shadow-xl min-w-[220px] max-w-[280px]"
            style={{
              padding: '16px',
              left: `${Math.min(Math.max(popoverPos.x - 110, 8), (chartRef.current?.offsetWidth ?? 300) - 240)}px`,
              bottom: `${(chartRef.current?.offsetHeight ?? 0) - popoverPos.y + 12}px`,
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className="text-xs font-semibold text-stone-900 dark:text-stone-100"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                {activeMonth} {totals.find(t => t.month === activeMonth)?.year}
              </span>
              <span
                className="text-xs text-emerald-600 dark:text-emerald-400 tabular-nums font-medium"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {formatNumber(totals.find(t => t.month === activeMonth)?.totalStitches ?? 0)}
              </span>
            </div>
            {dailyData.length > 0 ? (
              <div className="max-h-40 overflow-y-auto" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {dailyData.map((day, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-xs border-b border-stone-100 dark:border-stone-700 last:border-b-0"
                    style={{ fontFamily: "'Source Sans 3', sans-serif", padding: '4px 0' }}
                  >
                    <span className="text-stone-500 dark:text-stone-400" style={{ flexShrink: 0 }}>
                      {new Date(day.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <span className="text-stone-600 dark:text-stone-300 truncate" style={{ margin: '0 8px' }}>{day.projectName}</span>
                    <span className="text-stone-900 dark:text-stone-100 tabular-nums font-medium" style={{ flexShrink: 0 }}>{formatNumber(day.stitchCount)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-stone-400 dark:text-stone-500 text-center" style={{ padding: '8px 0' }}>
                Click to load daily breakdown
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

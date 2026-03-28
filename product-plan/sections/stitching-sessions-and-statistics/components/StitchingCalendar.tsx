import { useState, useMemo } from 'react'
import type { CalendarDay } from '../types'
import { ChevronLeft, ChevronRight } from 'lucide-react'

function formatNumber(n: number): string {
  return n.toLocaleString()
}

interface StitchingCalendarProps {
  days: CalendarDay[]
  onMonthChange?: (month: number, year: number) => void
  onNavigateToProject?: (projectId: string) => void
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const projectColorStyles = [
  { bg: '#d1fae5', text: '#047857', border: '#a7f3d0' },
  { bg: '#e0f2fe', text: '#0369a1', border: '#bae6fd' },
  { bg: '#fef3c7', text: '#b45309', border: '#fde68a' },
  { bg: '#ede9fe', text: '#6d28d9', border: '#ddd6fe' },
  { bg: '#ffe4e6', text: '#be123c', border: '#fecdd3' },
]

export function StitchingCalendar({ days, onMonthChange, onNavigateToProject }: StitchingCalendarProps) {
  const now = new Date()
  const [viewMonth, setViewMonth] = useState(now.getMonth())
  const [viewYear, setViewYear] = useState(now.getFullYear())

  const monthName = new Date(viewYear, viewMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const dayLookup = useMemo(() => {
    const map = new Map<string, CalendarDay>()
    days.forEach(d => map.set(d.date, d))
    return map
  }, [days])

  const projectColorMap = useMemo(() => {
    const uniqueProjectIds = new Set<string>()
    days.forEach(d => d.sessions.forEach(s => uniqueProjectIds.add(s.projectId)))
    const map = new Map<string, typeof projectColorStyles[0]>()
    let i = 0
    uniqueProjectIds.forEach(id => {
      map.set(id, projectColorStyles[i % projectColorStyles.length])
      i++
    })
    return map
  }, [days])

  const calendarCells = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1)
    const lastDay = new Date(viewYear, viewMonth + 1, 0)
    const startPad = firstDay.getDay()
    const totalDays = lastDay.getDate()

    const cells: (number | null)[] = []
    for (let i = 0; i < startPad; i++) cells.push(null)
    for (let d = 1; d <= totalDays; d++) cells.push(d)
    while (cells.length % 7 !== 0) cells.push(null)

    return cells
  }, [viewMonth, viewYear])

  const navigateMonth = (delta: number) => {
    let newMonth = viewMonth + delta
    let newYear = viewYear
    if (newMonth < 0) { newMonth = 11; newYear-- }
    if (newMonth > 11) { newMonth = 0; newYear++ }
    setViewMonth(newMonth)
    setViewYear(newYear)
    onMonthChange?.(newMonth + 1, newYear)
  }

  const today = now.getDate()
  const isCurrentMonth = viewMonth === now.getMonth() && viewYear === now.getFullYear()

  return (
    <div
      style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        border: '1px solid #e7e5e4',
        overflow: 'hidden',
      }}
    >
      {/* Month navigation */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 20px',
          borderBottom: '1px solid #f5f5f4',
        }}
      >
        <button
          onClick={() => navigateMonth(-1)}
          style={{
            padding: '6px',
            borderRadius: '8px',
            color: '#a8a29e',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <ChevronLeft style={{ width: 16, height: 16 }} />
        </button>
        <span
          style={{
            fontFamily: "'Fraunces', serif",
            fontSize: '14px',
            fontWeight: 500,
            color: '#1c1917',
          }}
        >
          {monthName}
        </span>
        <button
          onClick={() => navigateMonth(1)}
          style={{
            padding: '6px',
            borderRadius: '8px',
            color: '#a8a29e',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <ChevronRight style={{ width: 16, height: 16 }} />
        </button>
      </div>

      {/* Weekday headers */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          borderBottom: '1px solid #f5f5f4',
        }}
      >
        {WEEKDAYS.map(day => (
          <div
            key={day}
            style={{
              padding: '8px 0',
              textAlign: 'center',
              fontSize: '10px',
              color: '#a8a29e',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontFamily: "'Source Sans 3', sans-serif",
            }}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
        }}
      >
        {calendarCells.map((dayNum, i) => {
          if (dayNum === null) {
            return (
              <div
                key={`pad-${i}`}
                style={{
                  minHeight: '80px',
                  backgroundColor: '#fafaf9',
                  borderBottom: '1px solid #f5f5f4',
                  borderRight: '1px solid #f5f5f4',
                }}
              />
            )
          }

          const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
          const dayData = dayLookup.get(dateStr)
          const isToday = isCurrentMonth && dayNum === today

          return (
            <div
              key={dateStr}
              style={{
                minHeight: '80px',
                padding: '6px',
                borderBottom: '1px solid #f5f5f4',
                borderRight: '1px solid #f5f5f4',
                backgroundColor: isToday ? '#ecfdf5' : 'transparent',
              }}
            >
              {/* Day number */}
              <div style={{ marginBottom: '4px' }}>
                {isToday ? (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: '#059669',
                      color: 'white',
                      fontSize: '10px',
                      fontWeight: 500,
                      fontFamily: "'Source Sans 3', sans-serif",
                    }}
                  >
                    {dayNum}
                  </span>
                ) : (
                  <span
                    style={{
                      fontSize: '12px',
                      color: '#a8a29e',
                      fontFamily: "'Source Sans 3', sans-serif",
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {dayNum}
                  </span>
                )}
              </div>

              {/* Sessions */}
              {dayData?.sessions.map((session, si) => {
                const color = projectColorMap.get(session.projectId) ?? projectColorStyles[0]
                return (
                  <button
                    key={si}
                    onClick={() => onNavigateToProject?.(session.projectId)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      borderRadius: '4px',
                      padding: '2px 6px',
                      marginBottom: '2px',
                      backgroundColor: color.bg,
                      border: `1px solid ${color.border}`,
                      cursor: 'pointer',
                      display: 'block',
                    }}
                  >
                    <p
                      style={{
                        fontSize: '10px',
                        color: color.text,
                        fontFamily: "'Source Sans 3', sans-serif",
                        fontWeight: 500,
                        lineHeight: '1.2',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {session.projectName}
                    </p>
                    <p
                      style={{
                        fontSize: '9px',
                        color: color.text,
                        opacity: 0.7,
                        fontFamily: "'Source Sans 3', sans-serif",
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {formatNumber(session.stitchCount)}
                    </p>
                  </button>
                )
              })}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div
        style={{
          padding: '12px 20px',
          borderTop: '1px solid #f5f5f4',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        {Array.from(projectColorMap.entries()).map(([projectId, color]) => {
          const projectName = days.flatMap(d => d.sessions).find(s => s.projectId === projectId)?.projectName ?? projectId
          return (
            <div key={projectId} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '2px',
                  backgroundColor: color.bg,
                  border: `1px solid ${color.border}`,
                }}
              />
              <span
                style={{
                  fontSize: '10px',
                  color: '#78716c',
                  fontFamily: "'Source Sans 3', sans-serif",
                }}
              >
                {projectName}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

import { useState } from 'react'
import type { StitchingSessionsProps, StitchSession, YearInReviewData } from '../types'
import { HeroStats } from './HeroStats'
import { PersonalBests } from './PersonalBests'
import { MonthlyChart } from './MonthlyChart'
import { StitchingCalendar } from './StitchingCalendar'
import { StatCards } from './StatCards'
import { SessionHistory } from './SessionHistory'
import { LogSessionModal } from './LogSessionModal'
import { YearInReview } from './YearInReview'
import { Plus, BarChart3, Calendar, History, Gift } from 'lucide-react'

type Tab = 'overview' | 'calendar' | 'history' | 'year-in-review'

const tabs: { id: Tab; label: string; icon: typeof BarChart3 }[] = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'history', label: 'Sessions', icon: History },
  { id: 'year-in-review', label: 'Year in Review', icon: Gift },
]

export function StitchingDashboard({
  sessions,
  activeProjects,
  heroStats,
  personalBests,
  monthlyTotals,
  calendarDays,
  projectStats,
  supplyStats,
  yearInReview,
  onSaveSession,
  onDeleteSession,
  onUploadPhoto,
  onRequestDailyBreakdown,
  onCalendarMonthChange,
  onNavigateToProject,
  onYearChange,
}: StitchingSessionsProps & { yearInReview?: YearInReviewData; onYearChange?: (year: number) => void }) {
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [modalOpen, setModalOpen] = useState(false)
  const [editSession, setEditSession] = useState<StitchSession | null>(null)

  const handleOpenLog = () => {
    setEditSession(null)
    setModalOpen(true)
  }

  const handleEditSession = (session: StitchSession) => {
    setEditSession(session)
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setEditSession(null)
  }

  return (
    <div className="p-5 lg:p-8 max-w-7xl mx-auto">
      {/* Page header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1
            className="text-2xl font-semibold text-stone-900 dark:text-stone-100 mb-1"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Stitching Stats
          </h1>
          <p
            className="text-sm text-stone-500 dark:text-stone-400"
            style={{ fontFamily: "'Source Sans 3', sans-serif" }}
          >
            Track your sessions and watch your progress grow
          </p>
        </div>
        <button
          onClick={handleOpenLog}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-sm"
          style={{ fontFamily: "'Source Sans 3', sans-serif" }}
        >
          <Plus className="w-4 h-4" />
          Log Stitches
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-8 border-b border-stone-200 dark:border-stone-800">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === id
                ? 'border-emerald-500 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300 hover:border-stone-300 dark:hover:border-stone-600'
            }`}
            style={{ fontFamily: "'Source Sans 3', sans-serif" }}
          >
            <Icon className="w-4 h-4" strokeWidth={1.5} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && (
        <div>
          <HeroStats stats={heroStats} />
          <PersonalBests bests={personalBests} onNavigateToProject={onNavigateToProject} />
          <MonthlyChart
            totals={monthlyTotals}
            onRequestDailyBreakdown={onRequestDailyBreakdown}
            onNavigateToProject={onNavigateToProject}
          />
          <StatCards
            projectStats={projectStats}
            supplyStats={supplyStats}
            onNavigateToProject={onNavigateToProject}
          />
        </div>
      )}

      {activeTab === 'calendar' && (
        <StitchingCalendar
          days={calendarDays}
          onMonthChange={onCalendarMonthChange}
          onNavigateToProject={onNavigateToProject}
        />
      )}

      {activeTab === 'history' && (
        <SessionHistory
          sessions={sessions}
          activeProjects={activeProjects}
          onEditSession={handleEditSession}
          onNavigateToProject={onNavigateToProject}
        />
      )}

      {activeTab === 'year-in-review' && yearInReview && (
        <YearInReview
          data={yearInReview}
          onYearChange={onYearChange}
          onNavigateToProject={onNavigateToProject}
        />
      )}

      {/* Log session modal */}
      <LogSessionModal
        isOpen={modalOpen}
        editSession={editSession}
        activeProjects={activeProjects}
        onSave={onSaveSession}
        onDelete={onDeleteSession}
        onUploadPhoto={onUploadPhoto}
        onClose={handleCloseModal}
      />
    </div>
  )
}

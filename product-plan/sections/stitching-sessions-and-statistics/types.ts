// Stitching Sessions & Statistics — TypeScript interfaces

export interface StitchSession {
  id: string
  projectId: string
  date: string
  stitchCount: number
  photoUrl: string | null
  timeSpentMinutes: number | null
}

export interface ActiveProject {
  id: string
  chartName: string
  coverImageUrl: string | null
  status: 'In Progress' | 'On Hold'
  stitchCount: number
  stitchesCompleted: number
  progressPercent: number
}

export interface HeroStats {
  stitchesToday: number
  stitchesThisWeek: number
  stitchesThisMonth: number
  stitchesThisYear: number
}

export interface PersonalBest {
  label: string
  value: number
  date: string
  endDate?: string
  projectName: string
}

export interface MonthlyStitchTotal {
  month: string
  year: number
  totalStitches: number
}

export interface DailyBreakdown {
  date: string
  stitchCount: number
  projectName: string
}

export interface CalendarDay {
  date: string
  sessions: {
    projectId: string
    projectName: string
    stitchCount: number
  }[]
}

export interface ProjectStat {
  label: string
  value: number | string
  detail?: string
}

export interface SupplyStat {
  label: string
  value: string
  detail?: string
}

export interface ProjectSessionSummary {
  totalStitches: number
  sessionsLogged: number
  averagePerSession: number
  firstSessionDate: string | null
  lastSessionDate: string | null
}

export interface StitchingSessionsProps {
  sessions: StitchSession[]
  activeProjects: ActiveProject[]
  heroStats: HeroStats
  personalBests: PersonalBest[]
  monthlyTotals: MonthlyStitchTotal[]
  calendarDays: CalendarDay[]
  projectStats: ProjectStat[]
  supplyStats: SupplyStat[]

  /** Called when the user submits the log session modal (create or edit) */
  onSaveSession?: (session: Partial<StitchSession>) => void
  /** Called when the user deletes a session */
  onDeleteSession?: (sessionId: string) => void
  /** Called when the user uploads a progress photo */
  onUploadPhoto?: (sessionId: string, file: File) => void
  /** Called when the user clicks a month bar to get daily breakdown */
  onRequestDailyBreakdown?: (month: string, year: number) => DailyBreakdown[]
  /** Called when the user navigates to a different calendar month */
  onCalendarMonthChange?: (month: number, year: number) => void
  /** Called when the user clicks a project name to navigate to its detail */
  onNavigateToProject?: (projectId: string) => void
}

// --- Year in Review types ---

export interface YearlyHeroStats {
  totalStitches: number
  sessionsLogged: number
  stitchingDays: number
  hoursStitched: number | null
}

export interface MonthlyPace {
  month: string
  avgStitchesPerDay: number
}

export interface ProjectTimelineEntry {
  projectId: string
  projectName: string
  firstSession: string
  lastSession: string
  totalStitches: number
  sessions: number
  statusColour: string
}

export interface YearHighlight {
  label: string
  value: string
  detail?: string
}

export interface TopProject {
  projectId: string
  projectName: string
  totalStitches: number
  sessions: number
  percentOfYearTotal: number
}

export interface FavouriteSupply {
  category: 'thread' | 'bead' | 'specialty'
  name: string
  code?: string
  colourHex?: string
  projectCount: number
  detail?: string
}

export interface NewThisYear {
  chartsAdded: number
  suppliesAdded: number
  fabricsAdded: number
}

export interface YearInReviewData {
  year: number
  availableYears: number[]
  heroStats: YearlyHeroStats
  monthlyTotals: MonthlyStitchTotal[]
  monthlyPace: MonthlyPace[]
  projectTimeline: ProjectTimelineEntry[]
  highlights: YearHighlight[]
  topProjects: TopProject[]
  favouriteSupplies: FavouriteSupply[]
  newThisYear: NewThisYear
}

export interface YearInReviewProps {
  data: YearInReviewData
  onYearChange?: (year: number) => void
  onNavigateToProject?: (projectId: string) => void
}

export interface ProjectSessionsTabProps {
  projectId: string
  projectName: string
  sessions: StitchSession[]
  summary: ProjectSessionSummary

  /** Called when the user logs a session from the project detail view */
  onSaveSession?: (session: Partial<StitchSession>) => void
  /** Called when the user deletes a session */
  onDeleteSession?: (sessionId: string) => void
  /** Called when the user uploads a progress photo */
  onUploadPhoto?: (sessionId: string, file: File) => void
}

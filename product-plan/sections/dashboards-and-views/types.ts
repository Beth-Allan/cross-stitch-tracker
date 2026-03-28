// Dashboards & Views — TypeScript interfaces

import type { GalleryCardData, AdvancedFilterState, FilterConfig, FilterOption, ViewMode, ActiveFilter, FilterDimension } from '../gallery-cards-and-advanced-filtering/types'
import type { FabricCount } from '../fabric-series-and-reference-data/types'

// --- Main Dashboard ---

export interface RecentChart {
  chartId: string
  projectId: string
  name: string
  designerName: string
  coverImageUrl: string | null
  status: string
  dateAdded: string
  stitchCount: number
  sizeCategory: string
}

export interface BuriedTreasure {
  chartId: string
  projectId: string
  name: string
  designerName: string
  coverImageUrl: string | null
  dateAdded: string
  daysInLibrary: number
  sizeCategory: string
  genres: string[]
}

export interface SpotlightProject {
  projectId: string
  chartId: string
  name: string
  designerName: string
  coverImageUrl: string | null
  status: string
  genres: string[]
  sizeCategory: string
  stitchCount: number
  progressPercent: number | null
}

export interface CollectionStats {
  totalProjects: number
  totalWIP: number
  totalOnHold: number
  totalUnstarted: number
  totalFinished: number
  totalStitchesCompleted: number
  mostRecentFinish: { projectId: string; name: string; finishDate: string } | null
  largestProject: { projectId: string; name: string; stitchCount: number } | null
}

export interface GoalsSummary {
  upcomingMilestones: {
    projectId: string
    projectName: string
    milestoneLabel: string
    targetDate: string | null
    currentPercent: number
    targetPercent: number | null
  }[]
  plannedStarts: {
    projectId: string
    projectName: string
    plannedTiming: string
  }[]
}

export type QuickAddAction =
  | 'chart'
  | 'fabric'
  | 'floss'
  | 'beads'
  | 'specialty'
  | 'fabricBrand'
  | 'designer'
  | 'logStitches'

export interface MainDashboardProps {
  recentCharts: RecentChart[]
  currentlyStitching: GalleryCardData[]
  startNextProjects: GalleryCardData[]
  buriedTreasures: BuriedTreasure[]
  spotlight: SpotlightProject
  collectionStats: CollectionStats
  goalsSummary: GoalsSummary

  /** Called when user selects a quick-add action from the menu */
  onQuickAdd?: (action: QuickAddAction) => void
  /** Called when user clicks a project name to navigate to Chart Detail */
  onNavigateToProject?: (projectId: string) => void
  /** Called when user clicks "Check it out" on the spotlight card */
  onViewSpotlight?: (projectId: string) => void
  /** Called to refresh the random spotlight project */
  onRefreshSpotlight?: () => void
  /** Called when user clicks "View all goals" */
  onNavigateToGoals?: () => void
}

// --- Pattern Dive ---

export interface MatchingFabric {
  fabricId: string
  fabricName: string
  brandName: string
  count: number
  colour: string
  widthInches: number
  heightInches: number
}

export interface FabricRequirementRow {
  projectId: string
  projectName: string
  stitchesWide: number
  stitchesHigh: number
  assignedFabricId: string | null
  assignedFabricName: string | null
  assignedFabricFits: boolean | null
  matchingFabrics: MatchingFabric[]
}

export interface StorageGroup {
  locationId: string
  locationName: string
  items: StorageGroupItem[]
}

export interface StorageGroupItem {
  type: 'project' | 'fabric'
  id: string
  name: string
  status?: string
  fabricName?: string
  coverImageUrl?: string | null
}

export interface WhatsNextProject {
  projectId: string
  chartId: string
  name: string
  designerName: string
  coverImageUrl: string | null
  status: string
  kittingPercent: number
  sizeCategory: string
  stitchCount: number
  priorityRanking: number | null
  preferredStartTiming: string | null
}

export interface PatternDiveProps {
  /** Browse tab data */
  allCards: GalleryCardData[]
  filterConfig: FilterConfig
  filters: AdvancedFilterState
  activeFilters: ActiveFilter[]
  viewMode: ViewMode
  designerOptions: FilterOption[]
  genreOptions: FilterOption[]
  seriesOptions: FilterOption[]
  storageLocationOptions: FilterOption[]
  /** What's Next tab data */
  whatsNextProjects: WhatsNextProject[]
  /** Fabric Requirements tab data */
  fabricRequirements: FabricRequirementRow[]
  /** Storage View tab data */
  storageGroups: StorageGroup[]

  /** Called when user clicks a project name */
  onNavigateToProject?: (projectId: string) => void
  /** Called when filters change on the Browse tab */
  onFilterChange?: (filters: AdvancedFilterState) => void
  /** Called when a filter chip is dismissed */
  onRemoveFilter?: (dimension: FilterDimension) => void
  /** Called when "Clear all" is clicked */
  onClearAllFilters?: () => void
  /** Called when view mode changes */
  onViewModeChange?: (mode: ViewMode) => void
  /** Called when user clicks a fabric name in Storage View */
  onNavigateToFabric?: (fabricId: string) => void
  /** Called when user assigns a fabric to a project in Fabric Requirements */
  onAssignFabric?: (projectId: string, fabricId: string) => void
}

// --- Project Dashboard ---

export interface ProjectDashboardHeroStats {
  totalWIPs: number
  averageProgress: number
  closestToCompletion: { projectId: string; name: string; percent: number } | null
  finishedThisYear: number
  finishedAllTime: number
  totalStitchesAllProjects: number
}

export type ProgressBucketId = 'unstarted' | '0-25' | '25-50' | '50-75' | '75-100' | 'finished'

export interface ProgressBucketProject {
  projectId: string
  name: string
  designerName: string
  coverImageUrl: string | null
  status: string
  progressPercent: number
  totalStitches: number
  completedStitches: number
  lastStitchedDate: string | null
  stitchingDays: number
}

export interface ProgressBucket {
  id: ProgressBucketId
  label: string
  range: string
  projects: ProgressBucketProject[]
}

export type ProgressSortOption = 'closestToDone' | 'furthestFromDone' | 'mostStitchingDays' | 'fewestStitchingDays' | 'recentlyStitched'

export interface FinishedProject {
  projectId: string
  name: string
  designerName: string
  coverImageUrl: string | null
  fabricDescription: string
  startDate: string
  finishDate: string
  startToFinishDays: number
  stitchingDays: number
  stitchingHours: number | null
  totalStitches: number
  projectColours: number
  beadCount: number
  specialtyCount: number
  avgDailyStitches: number
  avgSessionStitches: number
  mostDailyStitches: number
  mostSessionStitches: number
  sizeCategory: string
  genres: string[]
}

export type FinishedSortOption = 'finishDate' | 'startToFinish' | 'stitchCount' | 'stitchingDays'

export interface ProjectDashboardProps {
  heroStats: ProjectDashboardHeroStats
  progressBuckets: ProgressBucket[]
  finishedProjects: FinishedProject[]

  /** Called when user clicks a project name */
  onNavigateToProject?: (projectId: string) => void
}

// Keep for Plans Tab and Goals section
export interface ProjectMilestone {
  id: string
  label: string
  targetPercent: number | null
  targetDate: string | null
  completed: boolean
}

export interface ProjectGoals {
  projectId: string
  projectName: string
  coverImageUrl: string | null
  currentProgress: number
  priorityRanking: number | null
  preferredStartTiming: string | null
  rotationPreference: 'Daily' | 'Weekly' | 'Monthly' | 'No rotation' | null
  milestones: ProjectMilestone[]
  planningNotes: string | null
}

// --- Shopping Cart ---

export interface ShoppingProject {
  projectId: string
  projectName: string
  designerName: string
  coverImageUrl: string | null
  status: string
  threadCount: number
  beadCount: number
  specialtyCount: number
  fabricNeeded: boolean
}

export interface ShoppingThreadNeed {
  threadId: string
  brandName: string
  colorCode: string
  colorName: string
  hexColor: string
  totalRequired: number
  totalAcquired: number
  totalRemaining: number
  unit: string
  projects: { projectId: string; projectName: string; quantityNeeded: number }[]
}

export interface ShoppingBeadNeed {
  beadId: string
  brandName: string
  productCode: string
  colorName: string
  hexColor: string
  totalRequired: number
  totalAcquired: number
  totalRemaining: number
  unit: string
  projects: { projectId: string; projectName: string; quantityNeeded: number }[]
}

export interface ShoppingSpecialtyNeed {
  specialtyItemId: string
  brandName: string
  productCode: string
  description: string
  hexColor: string
  totalRequired: number
  totalAcquired: number
  totalRemaining: number
  unit: string
  projects: { projectId: string; projectName: string; quantityNeeded: number }[]
}

export interface FabricMatchingStash {
  fabricId: string
  fabricName: string
  brandName: string
  count: number
  colour: string
  widthInches: number
  heightInches: number
}

export interface ShoppingFabricNeed {
  fabricId: string | null
  description: string
  count: FabricCount | null
  type: string | null
  colorPreference: string | null
  stitchesWide: number | null
  stitchesHigh: number | null
  preferredCounts: number[]
  brandPreference: string | null
  linkedProjectId: string | null
  linkedProjectName: string | null
  matchingFabrics: FabricMatchingStash[]
}

export interface ShoppingCartProps {
  projects: ShoppingProject[]
  threads: ShoppingThreadNeed[]
  beads: ShoppingBeadNeed[]
  specialty: ShoppingSpecialtyNeed[]
  fabrics: ShoppingFabricNeed[]

  /** Called when user marks a supply quantity as acquired */
  onMarkAcquired?: (type: 'thread' | 'bead' | 'specialty', itemId: string, quantity: number) => void
  /** Called when user marks a fabric as acquired */
  onMarkFabricAcquired?: (fabricId: string) => void
  /** Called when user assigns a stash fabric to a project */
  onAssignFabric?: (projectId: string, fabricId: string) => void
  /** Called when user updates fabric count preferences for a project */
  onUpdateFabricCountPreference?: (projectId: string, counts: number[]) => void
  /** Called when user clicks a project name */
  onNavigateToProject?: (projectId: string) => void
  /** Called when user clears all completed items from shopping list */
  onClearCompleted?: () => void
}

// --- Plans Tab (Chart Detail embed) ---

export interface PlansTabProps {
  projectId: string
  goals: ProjectGoals | null

  /** Called when user saves goals for this project */
  onSaveGoals?: (goals: Partial<ProjectGoals>) => void
  /** Called when user adds a milestone */
  onAddMilestone?: (milestone: Partial<ProjectMilestone>) => void
  /** Called when user marks a milestone as completed */
  onCompleteMilestone?: (milestoneId: string) => void
  /** Called when user deletes a milestone */
  onDeleteMilestone?: (milestoneId: string) => void
}

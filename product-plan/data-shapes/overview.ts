// =============================================================================
// UI Data Shapes — Combined Reference
//
// Aggregated entity interfaces from all 7 sections of the Cross Stitch Tracker.
// This file is a READ-ONLY reference for implementation. It includes only data
// shape interfaces (entities, enums, union types) — component Props interfaces
// are intentionally excluded.
//
// Generated from: product/sections/*/types.ts
// =============================================================================

// -----------------------------------------------------------------------------
// From: sections/project-management
// -----------------------------------------------------------------------------

export type ProjectStatus =
  | 'Unstarted'
  | 'Kitting'
  | 'Kitted'
  | 'In Progress'
  | 'On Hold'
  | 'Finished'
  | 'FFO'

export type SizeCategory = 'Mini' | 'Small' | 'Medium' | 'Large' | 'BAP'

export type ViewMode = 'gallery' | 'list' | 'table'

export interface Designer {
  id: string
  name: string
  website: string | null
}

export interface Genre {
  id: string
  name: string
}

export interface Series {
  id: string
  name: string
  totalInSeries: number
}

export interface SALPart {
  id: string
  partNumber: number
  fileUrl: string | null
  dateReleased: string
}

export interface Chart {
  id: string
  name: string
  designerId: string
  coverImageUrl: string | null
  stitchCount: number
  stitchCountApproximate: boolean
  stitchesWide: number
  stitchesHigh: number
  sizeCategory: SizeCategory
  genres: string[]
  seriesIds: string[]
  isPaperChart: boolean
  isFormalKit: boolean
  isSAL: boolean
  kitColorCount: number | null
  salParts: SALPart[]
  digitalWorkingCopyUrl: string | null
  dateAdded: string
}

export interface Project {
  id: string
  chartId: string
  status: ProjectStatus
  startDate: string | null
  finishDate: string | null
  ffoDate: string | null
  finishPhotoUrl: string | null
  startingStitches: number
  stitchesCompleted: number
  progressPercent: number
  stitchesRemaining: number
  fabricId: string | null
  projectBin: string | null
  ipadApp: string | null
  needsOnionSkinning: boolean
  hasDigitalCopy: boolean
  hasFabric: boolean
  allThreadFulfilled: boolean
  allBeadsFulfilled: boolean
  allSpecialtyFulfilled: boolean
  kittingComplete: boolean
  kittingPercent: number
  kittingNeeds: string[]
  wantToStartNext: boolean
  preferredStartSeason: string | null
  lastSessionDate: string | null
  lastSessionStitches: number | null
}

export interface FilterState {
  status: ProjectStatus[]
  sizeCategory: SizeCategory[]
  designerId: string | null
  genreId: string | null
  seriesId: string | null
}

export interface Fabric_ProjectManagement {
  id: string
  name: string
  brand: string
  count: number
  type: string
}

// -----------------------------------------------------------------------------
// From: sections/supply-tracking-and-shopping
// -----------------------------------------------------------------------------

export type SupplyType = 'thread' | 'bead' | 'specialty'

export type ColorFamily =
  | 'Black'
  | 'White'
  | 'Red'
  | 'Orange'
  | 'Yellow'
  | 'Green'
  | 'Blue'
  | 'Purple'
  | 'Brown'
  | 'Gray'
  | 'Neutral'

export type CatalogViewMode = 'grid' | 'table'

export interface SupplyBrand {
  id: string
  name: string
  website: string | null
  supplyType: SupplyType
}

export interface Thread {
  id: string
  brandId: string
  colorCode: string
  colorName: string
  hexColor: string
  colorFamily: ColorFamily
}

export interface Bead {
  id: string
  brandId: string
  productCode: string
  colorName: string
  hexColor: string
  colorFamily: ColorFamily
}

export interface SpecialtyItem {
  id: string
  brandId: string
  productCode: string
  colorName: string
  description: string
  hexColor: string
}

export interface ProjectThread {
  id: string
  projectId: string
  threadId: string
  stitchCount: number
  quantityRequired: number
  quantityAcquired: number
  quantityNeeded: number
  isFulfilled: boolean
}

export interface ProjectBead {
  id: string
  projectId: string
  beadId: string
  quantityRequired: number
  quantityAcquired: number
  quantityNeeded: number
  isFulfilled: boolean
}

export interface ProjectSpecialty {
  id: string
  projectId: string
  specialtyItemId: string
  quantityRequired: number
  quantityAcquired: number
  quantityNeeded: number
  isFulfilled: boolean
}

export interface KittingSupplySummary {
  totalThreads: number
  fulfilledThreads: number
  totalBeads: number
  fulfilledBeads: number
  totalSpecialty: number
  fulfilledSpecialty: number
  overallPercent: number
  needsSummary: string[]
}

export interface CatalogFilterState {
  brandId: string | null
  colorFamily: ColorFamily | null
  search: string
}

export interface ProjectReference {
  id: string
  name: string
  bin: string | null
}

// -----------------------------------------------------------------------------
// From: sections/stitching-sessions-and-statistics
// -----------------------------------------------------------------------------

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

// -----------------------------------------------------------------------------
// From: sections/fabric-series-and-reference-data
// -----------------------------------------------------------------------------

export type FabricCount = 14 | 16 | 18 | 20 | 22 | 25 | 28 | 32 | 36 | 40

export type FabricType =
  | 'Aida'
  | 'Linen'
  | 'Lugana'
  | 'Evenweave'
  | 'Hardanger'
  | 'Congress Cloth'
  | 'Other'

export type FabricColorFamily =
  | 'White'
  | 'Cream'
  | 'Blue'
  | 'Green'
  | 'Pink'
  | 'Purple'
  | 'Red'
  | 'Yellow'
  | 'Brown'
  | 'Gray'
  | 'Black'
  | 'Multi'

export type FabricColorType =
  | 'White'
  | 'Cream'
  | 'Natural'
  | 'Neutrals'
  | 'Brights'
  | 'Pastels'
  | 'Dark'
  | 'Hand-dyed'
  | 'Overdyed'

export interface FabricBrand {
  id: string
  name: string
  website: string | null
}

export interface Fabric {
  id: string
  name: string
  brandId: string
  photoUrl: string | null
  count: FabricCount
  type: FabricType
  colorFamily: FabricColorFamily
  colorType: FabricColorType
  shortestEdgeInches: number
  longestEdgeInches: number
  linkedProjectId: string | null
  needToBuy: boolean
}

export interface FabricSizeCalculation {
  projectId: string
  projectName: string
  stitchesWide: number
  stitchesHigh: number
  requiredWidthInches: number
  requiredHeightInches: number
  fits: boolean
}

export interface Designer_Extended {
  id: string
  name: string
  website: string | null
  chartCount: number
  projectsStarted: number
  projectsFinished: number
  topGenre: string | null
}

export interface DesignerChart {
  id: string
  chartName: string
  stitchCount: number
  sizeCategory: string
  projectStatus: string | null
  progressPercent: number | null
  coverImageUrl: string | null
}

export interface Series_Extended {
  id: string
  name: string
  memberCount: number
  finishedCount: number
  completionPercent: number
}

export interface SeriesMember {
  chartId: string
  chartName: string
  designerName: string
  stitchCount: number
  coverImageUrl: string | null
  projectStatus: string | null
  progressPercent: number | null
}

export interface StorageLocation {
  id: string
  name: string
  projectCount: number
}

export interface StorageLocationProject {
  id: string
  name: string
  status: string
  fabric?: { id: string; name: string; count: FabricCount; type: FabricType } | null
}

export interface StorageLocationDetail {
  location: StorageLocation
  projects: StorageLocationProject[]
}

export interface FabricFilterState {
  brandId: string | null
  count: FabricCount | null
  type: FabricType | null
  colorFamily: FabricColorFamily | null
  needToBuy: boolean | null
  search: string
}

// -----------------------------------------------------------------------------
// From: sections/gallery-cards-and-advanced-filtering
// -----------------------------------------------------------------------------

export type StatusGroup = 'wip' | 'unstarted' | 'finished'

export type KittingFilterOption = 'all' | 'fully-kitted' | 'partially-kitted' | 'not-started'

export type KittingItemStatus = 'fulfilled' | 'needed' | 'not-applicable'

export type PrepStep =
  | 'Added'
  | 'Want To Buy'
  | 'Hard Copy In Stash'
  | 'In Project Bag'
  | 'Digital Working Copy Ready'
  | 'Kitting Up'
  | 'App Loading Queue'
  | 'Loaded Into App'
  | 'Onion Skin Queue'
  | 'Ready To Start'

export type CompletionBracket = '0-25' | '25-50' | '50-75' | '75-100'

export interface GalleryCardBase {
  projectId: string
  chartId: string
  projectName: string
  designerName: string
  coverImageUrl: string | null
  status: ProjectStatus
  statusGroup: StatusGroup
  genres: string[]
  sizeCategory: SizeCategory
  stitchCount: number
  stitchCountApproximate?: boolean
  /** Number of DMC thread colours used */
  threadColourCount: number
  /** Number of bead types (0 if none) */
  beadTypeCount: number
  /** Number of specialty items like metallics, overdyes, etc. (0 if none) */
  specialtyItemCount: number
}

export interface WIPCardData extends GalleryCardBase {
  statusGroup: 'wip'
  progressPercent: number
  stitchesCompleted: number
  lastSessionDate: string | null
  startDate: string | null
  /** Total tracked time in minutes. 0 if user doesn't track time. */
  totalTimeMinutes: number
  /** Number of distinct days with at least one stitching session */
  stitchingDays: number
  latestPhotoUrl: string | null
}

export interface UnstartedCardData extends GalleryCardBase {
  statusGroup: 'unstarted'
  fabricStatus: KittingItemStatus
  threadStatus: KittingItemStatus
  beadsStatus: KittingItemStatus
  specialtyStatus: KittingItemStatus
  kittingPercent: number
  fabricNeeds: string | null
  wantToStartNext: boolean
  prepStep: PrepStep
  needsOnionSkinning: boolean
  /** When the project was added to the tracker */
  dateAdded: string | null
}

export interface FinishedCardData extends GalleryCardBase {
  statusGroup: 'finished'
  startDate: string | null
  finishDate: string | null
  ffoDate: string | null
  /** Total tracked time in minutes. 0 if user doesn't track time. */
  totalTimeMinutes: number
  /** Number of distinct days with stitching sessions */
  stitchingDays: number
  /** Calendar days from start to finish */
  startToFinishDays: number | null
  /** Average stitches per stitching day */
  avgDailyStitches: number | null
  finalPhotoUrl: string | null
}

export type GalleryCardData = WIPCardData | UnstartedCardData | FinishedCardData

export type FilterDimension =
  | 'status'
  | 'sizeCategory'
  | 'designer'
  | 'genre'
  | 'series'
  | 'kittingStatus'
  | 'completionBracket'
  | 'yearStarted'
  | 'yearFinished'
  | 'storageLocation'
  | 'hasFabric'
  | 'hasDigitalCopy'

export interface FilterConfig {
  /** Which filter dimensions are available in this context */
  availableFilters: FilterDimension[]
}

export interface ActiveFilter {
  dimension: FilterDimension
  label: string
  value: string | string[] | boolean
}

export interface AdvancedFilterState {
  status: ProjectStatus[]
  sizeCategory: SizeCategory[]
  designerId: string | null
  genreId: string | null
  seriesId: string | null
  kittingStatus: KittingFilterOption
  completionBracket: CompletionBracket | null
  yearStarted: number | null
  yearFinished: number | null
  storageLocationId: string | null
  hasFabric: boolean | null
  hasDigitalCopy: boolean | null
  search: string
}

export interface FilterOption {
  id: string
  label: string
  count?: number
}

// -----------------------------------------------------------------------------
// From: sections/dashboards-and-views
// -----------------------------------------------------------------------------

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

// -----------------------------------------------------------------------------
// From: sections/goals-and-plans
// -----------------------------------------------------------------------------

export type GoalType =
  | 'milestone'
  | 'frequency'
  | 'deadline'
  | 'sessionCount'
  | 'volume'
  | 'consistency'
  | 'projectCompletion'
  | 'projectStart'
  | 'manual'

export type GoalPeriod = 'oneTime' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'

export type GoalStatus = 'active' | 'completed' | 'expired' | 'paused'

export type PlanType = 'startDate' | 'recurringSchedule' | 'deadline' | 'seasonalFocus'

export type PlanStatus = 'upcoming' | 'active' | 'completed' | 'skipped'

export type RotationStyle =
  | 'roundRobin'
  | 'focusRotate'
  | 'dailyAssignment'
  | 'milestoneRotation'
  | 'randomShuffle'
  | 'seasonalFocus'

export type RotationStatus = 'active' | 'paused' | 'completed'

export type TurnTriggerType = 'time' | 'stitches' | 'percentage' | 'sessions'

export type AchievementCategory = 'milestones' | 'streaks' | 'variety' | 'records' | 'completion' | 'dedication'

export interface ProjectSummary {
  id: string
  name: string
  designerName: string
  coverImageUrl: string | null
  statusGradient: string
  totalStitches: number
  completedStitches: number
  percentComplete: number
  status: string
}

export interface Goal {
  id: string
  title: string
  description: string
  type: GoalType
  period: GoalPeriod
  status: GoalStatus
  /** Linked project (null for global goals) */
  project: ProjectSummary | null
  targetValue: number
  currentValue: number
  unit: string
  startDate: string
  endDate: string | null
  dueDate: string | null
  isRecurring: boolean
  autoRenew: boolean
  completedAt: string | null
  /** Show "Continue this goal?" nudge */
  showRenewalNudge: boolean
  createdAt: string
}

export interface Plan {
  id: string
  title: string
  description: string
  project: ProjectSummary
  planType: PlanType
  status: PlanStatus
  scheduledDate: string | null
  endDate: string | null
  /** Human-readable recurrence description, e.g. "Every Friday" */
  recurrenceLabel: string | null
  /** Day of week (0=Sun-6=Sat) for recurring schedules */
  recurrenceDayOfWeek: number | null
  /** For seasonal plans: season name */
  season: string | null
  createdAt: string
}

export interface TurnTrigger {
  type: TurnTriggerType
  value: number
  unit: string
}

export interface RotationProject {
  project: ProjectSummary
  order: number
  turnTrigger: TurnTrigger
  isFocus: boolean
  isCurrent: boolean
  turnProgress: number
  turnTarget: number
  turnUnit: string
}

export interface Rotation {
  id: string
  name: string
  description: string
  style: RotationStyle
  status: RotationStatus
  projects: RotationProject[]
  currentTurnStartedAt: string
  createdAt: string
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  category: AchievementCategory
  /** Current progress toward unlocking */
  currentValue: number
  /** Threshold to unlock */
  targetValue: number
  unit: string
  isUnlocked: boolean
  unlockedAt: string | null
}

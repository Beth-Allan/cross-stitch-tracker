// Gallery Cards & Advanced Filtering — TypeScript interfaces

export type ProjectStatus =
  | 'Unstarted'
  | 'Kitting'
  | 'Kitted'
  | 'In Progress'
  | 'On Hold'
  | 'Finished'
  | 'FFO'

export type StatusGroup = 'wip' | 'unstarted' | 'finished'

export type SizeCategory = 'Mini' | 'Small' | 'Medium' | 'Large' | 'BAP'

export type ViewMode = 'gallery' | 'list' | 'table'

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

// --- Gallery Card Types ---

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

// --- Filter Types ---

export interface FilterConfig {
  /** Which filter dimensions are available in this context */
  availableFilters: FilterDimension[]
}

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

// --- Component Props ---

export interface GalleryCardProps {
  card: GalleryCardData

  /** Called when the user clicks the project name link */
  onNavigateToProject?: (projectId: string) => void
}

export interface GalleryGridProps {
  cards: GalleryCardData[]
  viewMode: ViewMode

  /** Called when the user clicks a project name */
  onNavigateToProject?: (projectId: string) => void
  /** Called when view mode changes */
  onViewModeChange?: (mode: ViewMode) => void
}

export interface AdvancedFilterBarProps {
  config: FilterConfig
  filters: AdvancedFilterState
  activeFilters: ActiveFilter[]
  /** Dropdown options for searchable selects */
  designerOptions: FilterOption[]
  genreOptions: FilterOption[]
  seriesOptions: FilterOption[]
  storageLocationOptions: FilterOption[]

  /** Called when any filter changes */
  onFilterChange?: (filters: AdvancedFilterState) => void
  /** Called when a single active filter chip is dismissed */
  onRemoveFilter?: (dimension: FilterDimension) => void
  /** Called when the user clicks "Clear all" */
  onClearAllFilters?: () => void
}

export interface GalleryCardsAndFilteringProps {
  cards: GalleryCardData[]
  filterConfig: FilterConfig
  filters: AdvancedFilterState
  activeFilters: ActiveFilter[]
  viewMode: ViewMode
  designerOptions: FilterOption[]
  genreOptions: FilterOption[]
  seriesOptions: FilterOption[]
  storageLocationOptions: FilterOption[]

  /** Called when the user clicks a project name */
  onNavigateToProject?: (projectId: string) => void
  /** Called when any filter changes */
  onFilterChange?: (filters: AdvancedFilterState) => void
  /** Called when a filter chip is dismissed */
  onRemoveFilter?: (dimension: FilterDimension) => void
  /** Called when the user clicks "Clear all" */
  onClearAllFilters?: () => void
  /** Called when view mode changes */
  onViewModeChange?: (mode: ViewMode) => void
}

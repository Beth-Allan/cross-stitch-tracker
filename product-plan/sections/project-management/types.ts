// Project Management — TypeScript interfaces

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

export interface Fabric {
  id: string
  name: string
  brand: string
  count: number
  type: string
}

export interface ChartDetailProps {
  chart: Chart
  project: Project
  designer?: Designer
  genres: Genre[]
  series: Series[]
  fabric?: Fabric
  onBack?: () => void
  onEdit?: (chartId: string) => void
  onDelete?: (chartId: string) => void
  onUpdateStatus?: (projectId: string, status: ProjectStatus) => void
  onUploadFile?: (chartId: string, file: File) => void
  onAddSALPart?: (chartId: string, part: Partial<SALPart>) => void
}

export interface ChartFormProps {
  isOpen: boolean
  chart?: Chart
  project?: Project
  designers: Designer[]
  genres: Genre[]
  series: Series[]
  fabrics: Fabric[]
  onSave?: (chartData: Partial<Chart>, projectData: Partial<Project>) => void
  onClose?: () => void
  onAddDesigner?: (name: string) => void
  onAddGenre?: (name: string) => void
  onAddSeries?: (name: string) => void
  onAddFabric?: () => void
}

export interface ChartAddFormProps {
  designers: Designer[]
  genres: Genre[]
  series: Series[]
  fabrics: Fabric[]
  onSave?: (chartData: Partial<Chart>, projectData: Partial<Project>) => void
  onCancel?: () => void
  onAddDesigner?: (name: string) => void
  onAddGenre?: (name: string) => void
  onAddSeries?: (name: string) => void
  onAddFabric?: () => void
}

export interface ProjectManagementProps {
  charts: Chart[]
  projects: Project[]
  designers: Designer[]
  genres: Genre[]
  series: Series[]

  /** Called when the user submits the add/edit chart form */
  onSaveChart?: (chart: Partial<Chart>) => void
  /** Called when the user confirms chart deletion */
  onDeleteChart?: (chartId: string) => void
  /** Called when the user updates a project's status */
  onUpdateProjectStatus?: (projectId: string, status: ProjectStatus) => void
  /** Called when the user saves a new or edited designer */
  onSaveDesigner?: (designer: Partial<Designer>) => void
  /** Called when the user saves a new or edited genre */
  onSaveGenre?: (genre: Partial<Genre>) => void
  /** Called when the user saves a new or edited series */
  onSaveSeries?: (series: Partial<Series>) => void
  /** Called when the user uploads a digital working copy */
  onUploadFile?: (chartId: string, file: File) => void
  /** Called when the user adds a SAL part */
  onAddSALPart?: (chartId: string, part: Partial<SALPart>) => void
  /** Called when the user navigates to a chart detail page */
  onViewChart?: (chartId: string) => void
  /** Called when filter state changes */
  onFilterChange?: (filters: FilterState) => void
  /** Called when view mode changes */
  onViewModeChange?: (mode: ViewMode) => void
}

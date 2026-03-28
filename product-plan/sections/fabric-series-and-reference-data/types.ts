// Fabric, Series & Reference Data — TypeScript interfaces

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

export interface Designer {
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

export interface Series {
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

export interface FabricSeriesProps {
  fabrics: Fabric[]
  fabricBrands: FabricBrand[]
  designers: Designer[]
  series: Series[]
  storageLocations: StorageLocation[]

  /** Called when the user adds or edits a fabric record */
  onSaveFabric?: (fabric: Partial<Fabric>) => void
  /** Called when the user deletes a fabric record */
  onDeleteFabric?: (fabricId: string) => void
  /** Called when the user adds or edits a fabric brand */
  onSaveFabricBrand?: (brand: Partial<FabricBrand>) => void
  /** Called when the user deletes a fabric brand */
  onDeleteFabricBrand?: (brandId: string) => void
  /** Called when the user uploads a fabric photo */
  onUploadFabricPhoto?: (fabricId: string, file: File) => void
  /** Called to calculate fabric size fits for a given fabric */
  onCalculateSizeFits?: (fabricId: string) => FabricSizeCalculation[]
  /** Called when the user clicks a project name to navigate to Chart Detail */
  onNavigateToProject?: (projectId: string) => void
  /** Called when fabric filter state changes */
  onFabricFilterChange?: (filters: FabricFilterState) => void
}

export interface FabricDetailProps {
  fabric: Fabric
  brand: FabricBrand
  linkedProject?: { id: string; name: string; status: string; stitchesWide: number; stitchesHigh: number }
  sizeFits: FabricSizeCalculation[]

  /** Called when the user edits the fabric */
  onEdit?: (fabricId: string) => void
  /** Called when the user deletes the fabric */
  onDelete?: (fabricId: string) => void
  /** Called when the user clicks a project name */
  onNavigateToProject?: (projectId: string) => void
  /** Called when the user navigates back to the fabric list */
  onBack?: () => void
}

export interface DesignerPageProps {
  designers: Designer[]

  /** Called when the user clicks "Add Designer" */
  onAddDesigner?: () => void
  /** Called when the user edits a designer */
  onEditDesigner?: (designerId: string, updates: Partial<Designer>) => void
  /** Called when the user deletes a designer */
  onDeleteDesigner?: (designerId: string) => void
  /** Called when the user opens a designer's detail modal */
  onViewDesigner?: (designerId: string) => void
}

export interface DesignerDetailModalProps {
  designer: Designer
  charts: DesignerChart[]

  /** Called when the user clicks a chart name to navigate to Chart Detail */
  onNavigateToChart?: (chartId: string) => void
  /** Called when the user clicks Edit on the designer */
  onEditDesigner?: (designerId: string) => void
  /** Called when the user clicks Delete on the designer */
  onDeleteDesigner?: (designerId: string) => void
  /** Called when the modal is closed */
  onClose?: () => void
}

export interface SeriesListProps {
  series: Series[]

  /** Called when the user creates a new series */
  onCreateSeries?: (name: string) => void
  /** Called when the user clicks a series to view its detail */
  onViewSeries?: (seriesId: string) => void
}

export interface SeriesDetailProps {
  series: Series
  members: SeriesMember[]

  /** Called when the user renames the series */
  onRenameSeries?: (seriesId: string, newName: string) => void
  /** Called when the user deletes the series */
  onDeleteSeries?: (seriesId: string) => void
  /** Called when the user adds a chart to the series */
  onAddChart?: (seriesId: string, chartId: string) => void
  /** Called when the user removes a chart from the series */
  onRemoveChart?: (seriesId: string, chartId: string) => void
  /** Called when the user clicks a chart name to navigate to Chart Detail */
  onNavigateToChart?: (chartId: string) => void
  /** Called when the user navigates back to the series list */
  onBack?: () => void
}

export interface StorageLocationListProps {
  locations: StorageLocation[]

  /** Called when the user creates a new storage location */
  onAddLocation?: (name: string) => void
  /** Called when the user renames a storage location */
  onRenameLocation?: (locationId: string, newName: string) => void
  /** Called when the user deletes a storage location */
  onDeleteLocation?: (locationId: string) => void
  /** Called when the user clicks a location to see assigned items */
  onViewLocation?: (locationId: string) => void
}

export interface StorageLocationDetailProps {
  detail: StorageLocationDetail

  /** Called when the user renames the location */
  onRenameLocation?: (locationId: string, newName: string) => void
  /** Called when the user deletes the location */
  onDeleteLocation?: (locationId: string) => void
  /** Called when the user clicks a project name */
  onNavigateToProject?: (projectId: string) => void
  /** Called when the user navigates back */
  onBack?: () => void
}

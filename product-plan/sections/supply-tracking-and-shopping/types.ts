// Supply Tracking — TypeScript interfaces

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

export interface SupplyTrackingProps {
  threads: Thread[]
  beads: Bead[]
  specialtyItems: SpecialtyItem[]
  supplyBrands: SupplyBrand[]
  projectThreads: ProjectThread[]
  projectBeads: ProjectBead[]
  projectSpecialty: ProjectSpecialty[]
  projects: ProjectReference[]

  /** Called when the user adds a new thread to the catalog */
  onAddThread?: (thread: Partial<Thread>) => void
  /** Called when the user edits a catalog thread */
  onEditThread?: (threadId: string, updates: Partial<Thread>) => void
  /** Called when the user deletes a catalog thread */
  onDeleteThread?: (threadId: string) => void
  /** Called when the user adds a new bead to the catalog */
  onAddBead?: (bead: Partial<Bead>) => void
  /** Called when the user edits a catalog bead */
  onEditBead?: (beadId: string, updates: Partial<Bead>) => void
  /** Called when the user deletes a catalog bead */
  onDeleteBead?: (beadId: string) => void
  /** Called when the user adds a new specialty item to the catalog */
  onAddSpecialtyItem?: (item: Partial<SpecialtyItem>) => void
  /** Called when the user edits a catalog specialty item */
  onEditSpecialtyItem?: (itemId: string, updates: Partial<SpecialtyItem>) => void
  /** Called when the user deletes a catalog specialty item */
  onDeleteSpecialtyItem?: (itemId: string) => void
  /** Called when the user adds a new supply brand */
  onAddBrand?: (brand: Partial<SupplyBrand>) => void
  /** Called when the user edits a supply brand */
  onEditBrand?: (brandId: string, updates: Partial<SupplyBrand>) => void
  /** Called when catalog filter state changes */
  onFilterChange?: (filters: CatalogFilterState) => void
  /** Called when catalog view mode changes */
  onViewModeChange?: (mode: CatalogViewMode) => void
  /** Called when the user clicks a project name to navigate to it */
  onNavigateToProject?: (projectId: string) => void
}

export interface ProjectSuppliesTabProps {
  projectId: string
  projectThreads: ProjectThread[]
  projectBeads: ProjectBead[]
  projectSpecialty: ProjectSpecialty[]
  threads: Thread[]
  beads: Bead[]
  specialtyItems: SpecialtyItem[]
  supplyBrands: SupplyBrand[]
  kittingSummary: KittingSupplySummary
  /** All project-supply junction records across all projects, for cross-referencing which other projects use a colour */
  allProjectThreads?: ProjectThread[]
  allProjectBeads?: ProjectBead[]
  allProjectSpecialty?: ProjectSpecialty[]
  /** Project references for name/bin lookup in the cross-reference modal */
  projects?: ProjectReference[]

  /** Called when the user adds a supply to the project */
  onAddProjectThread?: (projectId: string, threadId: string, quantities: { stitchCount?: number; quantityRequired: number; quantityAcquired?: number }) => void
  /** Called when the user adds a bead to the project */
  onAddProjectBead?: (projectId: string, beadId: string, quantities: { quantityRequired: number; quantityAcquired?: number }) => void
  /** Called when the user adds a specialty item to the project */
  onAddProjectSpecialty?: (projectId: string, specialtyItemId: string, quantities: { quantityRequired: number; quantityAcquired?: number }) => void
  /** Called when the user updates quantities on a project supply */
  onUpdateProjectThread?: (id: string, updates: Partial<ProjectThread>) => void
  /** Called when the user updates quantities on a project bead */
  onUpdateProjectBead?: (id: string, updates: Partial<ProjectBead>) => void
  /** Called when the user updates quantities on a project specialty item */
  onUpdateProjectSpecialty?: (id: string, updates: Partial<ProjectSpecialty>) => void
  /** Called when the user removes a supply from the project */
  onRemoveProjectThread?: (id: string) => void
  /** Called when the user removes a bead from the project */
  onRemoveProjectBead?: (id: string) => void
  /** Called when the user removes a specialty item from the project */
  onRemoveProjectSpecialty?: (id: string) => void
  /** Called when the user opens the full-page bulk supply editor */
  onOpenBulkEditor?: (projectId: string) => void
  /** Called when the user clicks a project name in the cross-reference modal */
  onNavigateToProject?: (projectId: string) => void
}

export interface BulkSupplyEditorProps {
  projectId: string
  projectName: string
  projectThreads: ProjectThread[]
  projectBeads: ProjectBead[]
  projectSpecialty: ProjectSpecialty[]
  threads: Thread[]
  beads: Bead[]
  specialtyItems: SpecialtyItem[]
  supplyBrands: SupplyBrand[]

  /** Called when the user adds a supply to the project */
  onAddProjectThread?: (projectId: string, threadId: string, quantities: { stitchCount?: number; quantityRequired: number; quantityAcquired?: number }) => void
  /** Called when the user adds a bead to the project */
  onAddProjectBead?: (projectId: string, beadId: string, quantities: { quantityRequired: number; quantityAcquired?: number }) => void
  /** Called when the user adds a specialty item to the project */
  onAddProjectSpecialty?: (projectId: string, specialtyItemId: string, quantities: { quantityRequired: number; quantityAcquired?: number }) => void
  /** Called when the user updates quantities on a project supply */
  onUpdateProjectThread?: (id: string, updates: Partial<ProjectThread>) => void
  /** Called when the user updates quantities on a project bead */
  onUpdateProjectBead?: (id: string, updates: Partial<ProjectBead>) => void
  /** Called when the user updates quantities on a project specialty item */
  onUpdateProjectSpecialty?: (id: string, updates: Partial<ProjectSpecialty>) => void
  /** Called when the user removes a supply from the project */
  onRemoveProjectThread?: (id: string) => void
  /** Called when the user removes a bead from the project */
  onRemoveProjectBead?: (id: string) => void
  /** Called when the user removes a specialty item from the project */
  onRemoveProjectSpecialty?: (id: string) => void
  /** Called when the user navigates back to the project detail */
  onBack?: () => void
}

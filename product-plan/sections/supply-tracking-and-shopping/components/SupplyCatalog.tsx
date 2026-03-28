import { useState, useMemo, useRef, useEffect } from 'react'
import type {
  SupplyTrackingProps,
  Thread,
  Bead,
  SpecialtyItem,
  SupplyBrand,
  ColorFamily,
  CatalogViewMode,
  CatalogFilterState,
  SupplyType,
  ProjectThread,
  ProjectBead,
  ProjectSpecialty,
  ProjectReference,
} from '../types'
import {
  Search, Grid3X3, List, Plus, X,
  ChevronDown, Sparkles, CircleDot, Gem,
} from 'lucide-react'
import { SupplyDetailModal } from './SupplyDetailModal'
import type { SupplyDetailInfo } from './SupplyDetailModal'

/* ─── Constants ─── */

type SupplyTab = 'thread' | 'bead' | 'specialty'

const allColorFamilies: ColorFamily[] = [
  'Black', 'White', 'Red', 'Orange', 'Yellow',
  'Green', 'Blue', 'Purple', 'Brown', 'Gray', 'Neutral',
]

/* ─── Helpers ─── */

function needsBorder(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.85
}

function numericCodeCompare(a: string, b: string): number {
  const aNum = parseFloat(a.replace(/[^0-9.]/g, ''))
  const bNum = parseFloat(b.replace(/[^0-9.]/g, ''))
  if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum
  return a.localeCompare(b)
}

const colorFamilySwatches: Record<string, string> = {
  Red: '#C72B3B', Orange: '#C47458', Yellow: '#E5C050',
  Green: '#4B7A6A', Blue: '#97B2C9', Purple: '#8B5CF6',
  Brown: '#4B3327', Gray: '#3C3C3C', Black: '#000000',
  White: '#F5F5F4', Neutral: '#D6D3D1',
}

/* ─── Shared UI Components ─── */

function SortableHeader({ label, sortKey, currentSort, onSort }: {
  label: string
  sortKey: string
  currentSort: { key: string; dir: 'asc' | 'desc' }
  onSort: (key: string) => void
}) {
  const isActive = currentSort.key === sortKey
  return (
    <th
      className="py-2.5 px-4 text-left cursor-pointer select-none group"
      onClick={() => onSort(sortKey)}
    >
      <span
        className={`text-xs uppercase tracking-wider font-semibold transition-colors ${
          isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-stone-400 dark:text-stone-500 group-hover:text-stone-600 dark:group-hover:text-stone-300'
        }`}
        style={{ fontFamily: "'Source Sans 3', sans-serif" }}
      >
        {label}
        {isActive && (
          <span className="ml-1">{currentSort.dir === 'asc' ? '↑' : '↓'}</span>
        )}
      </span>
    </th>
  )
}

function FilterDropdown({ label, options, value, onChange }: {
  label: string
  options: { value: string; label: string }[]
  value: string | null
  onChange: (value: string | null) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const selectedLabel = value ? options.find(o => o.value === value)?.label : null

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
          value
            ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
            : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:border-stone-300 dark:hover:border-stone-600'
        }`}
        style={{ fontFamily: "'Source Sans 3', sans-serif" }}
      >
        {selectedLabel || label}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg shadow-lg z-20 py-1 max-h-60 overflow-y-auto">
          {value && (
            <button
              onClick={() => { onChange(null); setIsOpen(false) }}
              className="w-full text-left px-3 py-2 text-sm text-stone-400 dark:text-stone-500 hover:bg-stone-50 dark:hover:bg-stone-800"
              style={{ fontFamily: "'Source Sans 3', sans-serif" }}
            >
              Clear filter
            </button>
          )}
          {options.map(opt => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setIsOpen(false) }}
              className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                opt.value === value
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
                  : 'text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
              }`}
              style={{ fontFamily: "'Source Sans 3', sans-serif" }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── Add Supply Modal ─── */

function AddSupplyModal({ tab, brands, onClose, onSave, onAddBrand }: {
  tab: SupplyTab
  brands: SupplyBrand[]
  onClose: () => void
  onSave: (data: Record<string, string>) => void
  onAddBrand?: (name: string) => void
}) {
  const [formData, setFormData] = useState<Record<string, string>>({
    code: '',
    name: '',
    brandId: brands[0]?.id || '',
    hexColor: '#666666',
    colorFamily: 'Gray',
    description: '',
  })
  const [brandSearch, setBrandSearch] = useState('')
  const [showBrandDropdown, setShowBrandDropdown] = useState(false)
  const brandRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (brandRef.current && !brandRef.current.contains(e.target as Node)) setShowBrandDropdown(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const tabLabel = tab === 'thread' ? 'Thread' : tab === 'bead' ? 'Bead' : 'Specialty Item'
  const filteredBrands = brands.filter(b =>
    b.name.toLowerCase().includes(brandSearch.toLowerCase())
  )
  const selectedBrand = brands.find(b => b.id === formData.brandId)

  const inputClass =
    'w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 dark:focus:border-emerald-500 transition-colors'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 dark:border-stone-800">
          <h2
            className="text-lg font-semibold text-stone-900 dark:text-stone-100"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Add {tabLabel}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <div className="px-5 py-4 space-y-4">
          {/* Color preview */}
          <div className="flex items-center gap-4 p-3 rounded-lg bg-stone-50 dark:bg-stone-800/50">
            <div
              className={`w-12 h-12 rounded-full shadow-sm shrink-0 ${needsBorder(formData.hexColor) ? 'ring-1 ring-stone-200 dark:ring-stone-600' : ''}`}
              style={{ backgroundColor: formData.hexColor }}
            />
            <div>
              <p className="text-sm font-medium text-stone-900 dark:text-stone-100" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                {formData.code || 'Code'} — {formData.name || 'Color Name'}
              </p>
              <p className="text-xs text-stone-400 dark:text-stone-500" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                {selectedBrand?.name || 'Brand'} · {formData.colorFamily}
              </p>
            </div>
          </div>

          {/* Code */}
          <div>
            <label className="block text-xs text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1.5" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
              {tab === 'thread' ? 'Color Code' : 'Product Code'}
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={e => setFormData({ ...formData, code: e.target.value })}
              placeholder={tab === 'thread' ? 'e.g., 310' : 'e.g., 00123'}
              className={inputClass}
            />
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1.5" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
              Color Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Black"
              className={inputClass}
            />
          </div>

          {/* Brand — searchable select */}
          <div ref={brandRef}>
            <label className="block text-xs text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1.5" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
              Brand
            </label>
            <div className="relative">
              <input
                type="text"
                value={showBrandDropdown ? brandSearch : (selectedBrand?.name || '')}
                onChange={e => { setBrandSearch(e.target.value); setShowBrandDropdown(true) }}
                onFocus={() => { setShowBrandDropdown(true); setBrandSearch('') }}
                placeholder="Search brands..."
                className={inputClass}
              />
              {showBrandDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg shadow-lg z-30 max-h-40 overflow-y-auto py-1">
                  {filteredBrands.map(b => (
                    <button
                      key={b.id}
                      onClick={() => { setFormData({ ...formData, brandId: b.id }); setShowBrandDropdown(false) }}
                      className="w-full text-left px-3 py-2 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800"
                      style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                    >
                      {b.name}
                    </button>
                  ))}
                  {brandSearch && !filteredBrands.some(b => b.name.toLowerCase() === brandSearch.toLowerCase()) && (
                    <button
                      onClick={() => {
                        onAddBrand?.(brandSearch)
                        setShowBrandDropdown(false)
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 flex items-center gap-2"
                      style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add "{brandSearch}"
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Hex Color + Color Family row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1.5" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                Hex Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.hexColor}
                  onChange={e => setFormData({ ...formData, hexColor: e.target.value })}
                  className="w-8 h-8 rounded border border-stone-200 dark:border-stone-700 cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.hexColor}
                  onChange={e => setFormData({ ...formData, hexColor: e.target.value })}
                  className={inputClass}
                  style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8125rem' }}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1.5" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                Color Family
              </label>
              <select
                value={formData.colorFamily}
                onChange={e => setFormData({ ...formData, colorFamily: e.target.value })}
                className={inputClass}
              >
                {allColorFamilies.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description — specialty only */}
          {tab === 'specialty' && (
            <div>
              <label className="block text-xs text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1.5" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                Description
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g., #4 Very Fine Braid"
                className={inputClass}
              />
              <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">Product type, size, or other details</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-stone-200 dark:border-stone-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            style={{ fontFamily: "'Source Sans 3', sans-serif" }}
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(formData)}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-sm"
            style={{ fontFamily: "'Source Sans 3', sans-serif" }}
          >
            Add {tabLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Main Component ─── */

export function SupplyCatalog({
  threads,
  beads,
  specialtyItems,
  supplyBrands,
  projectThreads,
  projectBeads,
  projectSpecialty,
  projects,
  onAddThread,
  onEditThread,
  onAddBead,
  onEditBead,
  onAddSpecialtyItem,
  onEditSpecialtyItem,
  onAddBrand,
  onFilterChange,
  onViewModeChange,
  onNavigateToProject,
}: SupplyTrackingProps) {
  const [activeTab, setActiveTab] = useState<SupplyTab>('thread')
  const [viewMode, setViewMode] = useState<CatalogViewMode>('table')
  const [filters, setFilters] = useState<CatalogFilterState>({ brandId: null, colorFamily: null, search: '' })
  const [showAddModal, setShowAddModal] = useState(false)
  const [detailSupply, setDetailSupply] = useState<SupplyDetailInfo | null>(null)
  const [tableSort, setTableSort] = useState<{ key: string; dir: 'asc' | 'desc' }>({ key: 'code', dir: 'asc' })

  // Lookups
  const brandById = useMemo(() => {
    const map = new Map<string, SupplyBrand>()
    supplyBrands.forEach(b => map.set(b.id, b))
    return map
  }, [supplyBrands])

  const projectById = useMemo(() => {
    const map = new Map<string, ProjectReference>()
    projects.forEach(p => map.set(p.id, p))
    return map
  }, [projects])

  // Build per-supply project usage lookups
  const threadProjectCount = useMemo(() => {
    const map = new Map<string, number>()
    projectThreads.forEach(pt => map.set(pt.threadId, (map.get(pt.threadId) || 0) + 1))
    return map
  }, [projectThreads])

  const beadProjectCount = useMemo(() => {
    const map = new Map<string, number>()
    projectBeads.forEach(pb => map.set(pb.beadId, (map.get(pb.beadId) || 0) + 1))
    return map
  }, [projectBeads])

  const specialtyProjectCount = useMemo(() => {
    const map = new Map<string, number>()
    projectSpecialty.forEach(ps => map.set(ps.specialtyItemId, (map.get(ps.specialtyItemId) || 0) + 1))
    return map
  }, [projectSpecialty])

  const brandsForTab = useMemo(() => {
    const typeMap: Record<SupplyTab, SupplyType> = { thread: 'thread', bead: 'bead', specialty: 'specialty' }
    return supplyBrands.filter(b => b.supplyType === typeMap[activeTab])
  }, [supplyBrands, activeTab])

  // Filter
  const filteredThreads = useMemo(() => {
    return threads.filter(t => {
      if (filters.brandId && t.brandId !== filters.brandId) return false
      if (filters.colorFamily && t.colorFamily !== filters.colorFamily) return false
      if (filters.search) {
        const s = filters.search.toLowerCase()
        return t.colorCode.toLowerCase().includes(s) || t.colorName.toLowerCase().includes(s)
      }
      return true
    })
  }, [threads, filters])

  const filteredBeads = useMemo(() => {
    return beads.filter(b => {
      if (filters.brandId && b.brandId !== filters.brandId) return false
      if (filters.colorFamily && b.colorFamily !== filters.colorFamily) return false
      if (filters.search) {
        const s = filters.search.toLowerCase()
        return b.productCode.toLowerCase().includes(s) || b.colorName.toLowerCase().includes(s)
      }
      return true
    })
  }, [beads, filters])

  const filteredSpecialty = useMemo(() => {
    return specialtyItems.filter(item => {
      if (filters.brandId && item.brandId !== filters.brandId) return false
      if (filters.search) {
        const s = filters.search.toLowerCase()
        return item.productCode.toLowerCase().includes(s) || item.colorName.toLowerCase().includes(s) || item.description.toLowerCase().includes(s)
      }
      return true
    })
  }, [specialtyItems, filters])

  // Build detail info for a supply
  function openThreadDetail(t: Thread) {
    const brand = brandById.get(t.brandId)
    const usage = projectThreads
      .filter(pt => pt.threadId === t.id)
      .map(pt => {
        const proj = projectById.get(pt.projectId)
        return {
          projectId: pt.projectId,
          projectName: proj?.name || 'Unknown project',
          projectBin: proj?.bin ?? null,
          quantityRequired: pt.quantityRequired,
          quantityAcquired: pt.quantityAcquired,
          quantityNeeded: pt.quantityNeeded,
          stitchCount: pt.stitchCount,
        }
      })
    setDetailSupply({
      hex: t.hexColor, code: t.colorCode, name: t.colorName,
      brand: brand?.name || '', colorFamily: t.colorFamily,
      projectUsage: usage,
    })
  }

  function openBeadDetail(b: Bead) {
    const brand = brandById.get(b.brandId)
    const usage = projectBeads
      .filter(pb => pb.beadId === b.id)
      .map(pb => {
        const proj = projectById.get(pb.projectId)
        return {
          projectId: pb.projectId,
          projectName: proj?.name || 'Unknown project',
          projectBin: proj?.bin ?? null,
          quantityRequired: pb.quantityRequired,
          quantityAcquired: pb.quantityAcquired,
          quantityNeeded: pb.quantityNeeded,
        }
      })
    setDetailSupply({
      hex: b.hexColor, code: b.productCode, name: b.colorName,
      brand: brand?.name || '', colorFamily: b.colorFamily,
      projectUsage: usage,
    })
  }

  function openSpecialtyDetail(item: SpecialtyItem) {
    const brand = brandById.get(item.brandId)
    const usage = projectSpecialty
      .filter(ps => ps.specialtyItemId === item.id)
      .map(ps => {
        const proj = projectById.get(ps.projectId)
        return {
          projectId: ps.projectId,
          projectName: proj?.name || 'Unknown project',
          projectBin: proj?.bin ?? null,
          quantityRequired: ps.quantityRequired,
          quantityAcquired: ps.quantityAcquired,
          quantityNeeded: ps.quantityNeeded,
        }
      })
    setDetailSupply({
      hex: item.hexColor, code: item.productCode, name: item.colorName,
      brand: brand?.name || '', description: item.description,
      projectUsage: usage,
    })
  }

  // Event handlers
  const handleFilterUpdate = (update: Partial<CatalogFilterState>) => {
    const next = { ...filters, ...update }
    setFilters(next)
    onFilterChange?.(next)
  }

  const handleViewToggle = (mode: CatalogViewMode) => {
    setViewMode(mode)
    onViewModeChange?.(mode)
  }

  const handleSort = (key: string) => {
    setTableSort(prev =>
      prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }
    )
  }

  const handleTabChange = (tab: SupplyTab) => {
    setActiveTab(tab)
    setFilters({ brandId: null, colorFamily: null, search: '' })
    setTableSort({ key: 'code', dir: 'asc' })
  }

  // Tab config
  const tabs: { id: SupplyTab; label: string; count: number; icon: React.ComponentType<{ className?: string; strokeWidth?: number }> }[] = [
    { id: 'thread', label: 'Thread', count: threads.length, icon: CircleDot },
    { id: 'bead', label: 'Beads', count: beads.length, icon: Gem },
    { id: 'specialty', label: 'Specialty', count: specialtyItems.length, icon: Sparkles },
  ]

  const activeCount = activeTab === 'thread' ? filteredThreads.length
    : activeTab === 'bead' ? filteredBeads.length
    : filteredSpecialty.length

  const totalCount = activeTab === 'thread' ? threads.length
    : activeTab === 'bead' ? beads.length
    : specialtyItems.length

  // Project count helper for display
  function projectCountLabel(count: number): string {
    if (count === 0) return 'No projects'
    if (count === 1) return '1 project'
    return `${count} projects`
  }

  return (
    <div className="p-5 lg:p-8 max-w-7xl mx-auto">
      {/* Page header */}
      <div className="mb-6">
        <h1
          className="text-2xl font-semibold text-stone-900 dark:text-stone-100 mb-1"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          Supply Catalog
        </h1>
        <p
          className="text-sm text-stone-500 dark:text-stone-400"
          style={{ fontFamily: "'Source Sans 3', sans-serif" }}
        >
          Browse and manage your thread, bead, and specialty item collections
        </p>
      </div>

      {/* Tab bar */}
      <div className="border-b border-stone-200 dark:border-stone-800 mb-5">
        <nav className="flex gap-0.5 -mb-px">
          {tabs.map(tab => {
            const isActive = activeTab === tab.id
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`inline-flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'text-emerald-700 dark:text-emerald-400 border-emerald-600 dark:border-emerald-400'
                    : 'text-stone-500 dark:text-stone-400 border-transparent hover:text-stone-700 dark:hover:text-stone-300 hover:border-stone-300 dark:hover:border-stone-600'
                }`}
                style={{ fontFamily: "'Source Sans 3', sans-serif" }}
              >
                <Icon className="w-4 h-4" strokeWidth={1.5} />
                {tab.label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  isActive
                    ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400'
                }`}>
                  {tab.count}
                </span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Toolbar: filters + view toggle + add button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap flex-1">
          <FilterDropdown
            label="Brand"
            options={brandsForTab.map(b => ({ value: b.id, label: b.name }))}
            value={filters.brandId}
            onChange={v => handleFilterUpdate({ brandId: v })}
          />
          {activeTab !== 'specialty' && (
            <FilterDropdown
              label="Color Family"
              options={allColorFamilies.map(f => ({ value: f, label: f }))}
              value={filters.colorFamily}
              onChange={v => handleFilterUpdate({ colorFamily: v as ColorFamily | null })}
            />
          )}
          {/* Search */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-stone-500" />
            <input
              type="text"
              value={filters.search}
              onChange={e => handleFilterUpdate({ search: e.target.value })}
              placeholder={`Search ${activeTab === 'thread' ? 'threads' : activeTab === 'bead' ? 'beads' : 'items'}...`}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-colors"
              style={{ fontFamily: "'Source Sans 3', sans-serif" }}
            />
            {filters.search && (
              <button
                onClick={() => handleFilterUpdate({ search: '' })}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* View toggle + add */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center rounded-lg border border-stone-200 dark:border-stone-700 overflow-hidden">
            <button
              onClick={() => handleViewToggle('table')}
              className={`p-2 transition-colors ${
                viewMode === 'table'
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
                  : 'bg-white dark:bg-stone-800 text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300'
              }`}
              title="Table view"
            >
              <List className="w-4 h-4" strokeWidth={1.5} />
            </button>
            <button
              onClick={() => handleViewToggle('grid')}
              className={`p-2 transition-colors ${
                viewMode === 'grid'
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
                  : 'bg-white dark:bg-stone-800 text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300'
              }`}
              title="Card view"
            >
              <Grid3X3 className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors shadow-sm"
            style={{ fontFamily: "'Source Sans 3', sans-serif" }}
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>

      {/* Result count */}
      {(filters.brandId || filters.colorFamily || filters.search) && (
        <p
          className="text-xs text-stone-400 dark:text-stone-500 mb-4"
          style={{ fontFamily: "'Source Sans 3', sans-serif" }}
        >
          Showing {activeCount} of {totalCount} {activeTab === 'thread' ? 'threads' : activeTab === 'bead' ? 'beads' : 'items'}
        </p>
      )}

      {/* ── Table View ── */}
      {viewMode === 'table' && activeTab === 'thread' && (() => {
        const sorted = [...filteredThreads].sort((a, b) => {
          switch (tableSort.key) {
            case 'code': return tableSort.dir === 'asc' ? numericCodeCompare(a.colorCode, b.colorCode) : numericCodeCompare(b.colorCode, a.colorCode)
            case 'name': return tableSort.dir === 'asc' ? a.colorName.localeCompare(b.colorName) : b.colorName.localeCompare(a.colorName)
            case 'brand': {
              const aB = brandById.get(a.brandId)?.name || ''; const bB = brandById.get(b.brandId)?.name || ''
              return tableSort.dir === 'asc' ? aB.localeCompare(bB) : bB.localeCompare(aB)
            }
            case 'family': return tableSort.dir === 'asc' ? a.colorFamily.localeCompare(b.colorFamily) : b.colorFamily.localeCompare(a.colorFamily)
            case 'projects': {
              const aC = threadProjectCount.get(a.id) || 0; const bC = threadProjectCount.get(b.id) || 0
              return tableSort.dir === 'asc' ? aC - bC : bC - aC
            }
            default: return 0
          }
        })
        return (
          <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200/60 dark:border-stone-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/30">
                    <th className="py-2.5 px-4 w-12" />
                    <SortableHeader label="Code" sortKey="code" currentSort={tableSort} onSort={handleSort} />
                    <SortableHeader label="Name" sortKey="name" currentSort={tableSort} onSort={handleSort} />
                    <SortableHeader label="Brand" sortKey="brand" currentSort={tableSort} onSort={handleSort} />
                    <SortableHeader label="Color Family" sortKey="family" currentSort={tableSort} onSort={handleSort} />
                    <SortableHeader label="Projects" sortKey="projects" currentSort={tableSort} onSort={handleSort} />
                  </tr>
                </thead>
                <tbody>
                  {sorted.map(t => {
                    const count = threadProjectCount.get(t.id) || 0
                    return (
                      <tr
                        key={t.id}
                        className="border-b border-stone-100 dark:border-stone-800/60 hover:bg-stone-50/50 dark:hover:bg-stone-800/30 cursor-pointer transition-colors"
                        onClick={() => openThreadDetail(t)}
                      >
                        <td className="py-2.5 px-4">
                          <div
                            className={`w-6 h-6 rounded-full shadow-sm ${needsBorder(t.hexColor) ? 'ring-1 ring-stone-200 dark:ring-stone-600' : ''}`}
                            style={{ backgroundColor: t.hexColor }}
                          />
                        </td>
                        <td className="py-2.5 px-4 text-sm font-medium text-stone-700 dark:text-stone-300 tabular-nums" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>{t.colorCode}</td>
                        <td className="py-2.5 px-4 text-sm text-stone-700 dark:text-stone-300" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>{t.colorName}</td>
                        <td className="py-2.5 px-4 text-sm text-stone-700 dark:text-stone-300" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>{brandById.get(t.brandId)?.name || '—'}</td>
                        <td className="py-2.5 px-4 text-sm text-stone-700 dark:text-stone-300" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                          <span className="flex items-center gap-2">
                            <span
                              className={`w-2.5 h-2.5 rounded-full shrink-0 ${t.colorFamily === 'White' || t.colorFamily === 'Neutral' ? 'ring-1 ring-stone-300 dark:ring-stone-600' : ''}`}
                              style={{ backgroundColor: colorFamilySwatches[t.colorFamily] }}
                            />
                            {t.colorFamily}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-sm" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                          <span className={count > 0 ? 'text-stone-700 dark:text-stone-300' : 'text-stone-400 dark:text-stone-500'}>
                            {projectCountLabel(count)}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      })()}

      {viewMode === 'table' && activeTab === 'bead' && (() => {
        const sorted = [...filteredBeads].sort((a, b) => {
          switch (tableSort.key) {
            case 'code': return tableSort.dir === 'asc' ? numericCodeCompare(a.productCode, b.productCode) : numericCodeCompare(b.productCode, a.productCode)
            case 'name': return tableSort.dir === 'asc' ? a.colorName.localeCompare(b.colorName) : b.colorName.localeCompare(a.colorName)
            case 'brand': {
              const aB = brandById.get(a.brandId)?.name || ''; const bB = brandById.get(b.brandId)?.name || ''
              return tableSort.dir === 'asc' ? aB.localeCompare(bB) : bB.localeCompare(aB)
            }
            case 'family': return tableSort.dir === 'asc' ? a.colorFamily.localeCompare(b.colorFamily) : b.colorFamily.localeCompare(a.colorFamily)
            case 'projects': {
              const aC = beadProjectCount.get(a.id) || 0; const bC = beadProjectCount.get(b.id) || 0
              return tableSort.dir === 'asc' ? aC - bC : bC - aC
            }
            default: return 0
          }
        })
        return (
          <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200/60 dark:border-stone-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/30">
                    <th className="py-2.5 px-4 w-12" />
                    <SortableHeader label="Code" sortKey="code" currentSort={tableSort} onSort={handleSort} />
                    <SortableHeader label="Name" sortKey="name" currentSort={tableSort} onSort={handleSort} />
                    <SortableHeader label="Brand" sortKey="brand" currentSort={tableSort} onSort={handleSort} />
                    <SortableHeader label="Color Family" sortKey="family" currentSort={tableSort} onSort={handleSort} />
                    <SortableHeader label="Projects" sortKey="projects" currentSort={tableSort} onSort={handleSort} />
                  </tr>
                </thead>
                <tbody>
                  {sorted.map(b => {
                    const count = beadProjectCount.get(b.id) || 0
                    return (
                      <tr
                        key={b.id}
                        className="border-b border-stone-100 dark:border-stone-800/60 hover:bg-stone-50/50 dark:hover:bg-stone-800/30 cursor-pointer transition-colors"
                        onClick={() => openBeadDetail(b)}
                      >
                        <td className="py-2.5 px-4">
                          <div
                            className={`w-6 h-6 rounded-full shadow-sm ${needsBorder(b.hexColor) ? 'ring-1 ring-stone-200 dark:ring-stone-600' : ''}`}
                            style={{ backgroundColor: b.hexColor }}
                          />
                        </td>
                        <td className="py-2.5 px-4 text-sm font-medium text-stone-700 dark:text-stone-300 tabular-nums" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>{b.productCode}</td>
                        <td className="py-2.5 px-4 text-sm text-stone-700 dark:text-stone-300" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>{b.colorName}</td>
                        <td className="py-2.5 px-4 text-sm text-stone-700 dark:text-stone-300" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>{brandById.get(b.brandId)?.name || '—'}</td>
                        <td className="py-2.5 px-4 text-sm text-stone-700 dark:text-stone-300" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                          <span className="flex items-center gap-2">
                            <span
                              className={`w-2.5 h-2.5 rounded-full shrink-0 ${b.colorFamily === 'White' || b.colorFamily === 'Neutral' ? 'ring-1 ring-stone-300 dark:ring-stone-600' : ''}`}
                              style={{ backgroundColor: colorFamilySwatches[b.colorFamily] }}
                            />
                            {b.colorFamily}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-sm" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                          <span className={count > 0 ? 'text-stone-700 dark:text-stone-300' : 'text-stone-400 dark:text-stone-500'}>
                            {projectCountLabel(count)}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      })()}

      {viewMode === 'table' && activeTab === 'specialty' && (() => {
        const sorted = [...filteredSpecialty].sort((a, b) => {
          switch (tableSort.key) {
            case 'code': return tableSort.dir === 'asc' ? numericCodeCompare(a.productCode, b.productCode) : numericCodeCompare(b.productCode, a.productCode)
            case 'name': return tableSort.dir === 'asc' ? a.colorName.localeCompare(b.colorName) : b.colorName.localeCompare(a.colorName)
            case 'brand': {
              const aB = brandById.get(a.brandId)?.name || ''; const bB = brandById.get(b.brandId)?.name || ''
              return tableSort.dir === 'asc' ? aB.localeCompare(bB) : bB.localeCompare(aB)
            }
            case 'projects': {
              const aC = specialtyProjectCount.get(a.id) || 0; const bC = specialtyProjectCount.get(b.id) || 0
              return tableSort.dir === 'asc' ? aC - bC : bC - aC
            }
            default: return 0
          }
        })
        return (
          <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200/60 dark:border-stone-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/30">
                    <th className="py-2.5 px-4 w-12" />
                    <SortableHeader label="Code" sortKey="code" currentSort={tableSort} onSort={handleSort} />
                    <SortableHeader label="Name" sortKey="name" currentSort={tableSort} onSort={handleSort} />
                    <SortableHeader label="Brand" sortKey="brand" currentSort={tableSort} onSort={handleSort} />
                    <th className="py-2.5 px-4 text-left">
                      <span className="text-xs uppercase tracking-wider font-semibold text-stone-400 dark:text-stone-500" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                        Description
                      </span>
                    </th>
                    <SortableHeader label="Projects" sortKey="projects" currentSort={tableSort} onSort={handleSort} />
                  </tr>
                </thead>
                <tbody>
                  {sorted.map(item => {
                    const count = specialtyProjectCount.get(item.id) || 0
                    return (
                      <tr
                        key={item.id}
                        className="border-b border-stone-100 dark:border-stone-800/60 hover:bg-stone-50/50 dark:hover:bg-stone-800/30 cursor-pointer transition-colors"
                        onClick={() => openSpecialtyDetail(item)}
                      >
                        <td className="py-2.5 px-4">
                          <div
                            className={`w-6 h-6 rounded-full shadow-sm ${needsBorder(item.hexColor) ? 'ring-1 ring-stone-200 dark:ring-stone-600' : ''}`}
                            style={{ backgroundColor: item.hexColor }}
                          />
                        </td>
                        <td className="py-2.5 px-4 text-sm font-medium text-stone-700 dark:text-stone-300 tabular-nums" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>{item.productCode}</td>
                        <td className="py-2.5 px-4 text-sm text-stone-700 dark:text-stone-300" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>{item.colorName}</td>
                        <td className="py-2.5 px-4 text-sm text-stone-700 dark:text-stone-300" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>{brandById.get(item.brandId)?.name || '—'}</td>
                        <td className="py-2.5 px-4 text-sm text-stone-500 dark:text-stone-400" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>{item.description}</td>
                        <td className="py-2.5 px-4 text-sm" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                          <span className={count > 0 ? 'text-stone-700 dark:text-stone-300' : 'text-stone-400 dark:text-stone-500'}>
                            {projectCountLabel(count)}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      })()}

      {/* ── Card View ── */}
      {viewMode === 'grid' && activeTab === 'thread' && (() => {
        const sorted = [...filteredThreads].sort((a, b) => numericCodeCompare(a.colorCode, b.colorCode))
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {sorted.map(t => {
              const brand = brandById.get(t.brandId)
              const isLight = needsBorder(t.hexColor)
              const count = threadProjectCount.get(t.id) || 0
              return (
                <button
                  key={t.id}
                  onClick={() => openThreadDetail(t)}
                  className="flex items-center gap-4 p-4 rounded-xl border border-stone-200/60 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-stone-300 dark:hover:border-stone-700 hover:shadow-sm transition-all text-left group"
                >
                  <div
                    className={`w-10 h-10 rounded-full shadow-sm shrink-0 transition-transform group-hover:scale-110 ${isLight ? 'ring-1 ring-stone-200 dark:ring-stone-600' : ''}`}
                    style={{ backgroundColor: t.hexColor }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                      {brand?.name} {t.colorCode} — {t.colorName}
                    </p>
                    <p className="text-xs text-stone-400 dark:text-stone-500 truncate" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                      {t.colorFamily}
                      {count > 0 && <span> · {projectCountLabel(count)}</span>}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        )
      })()}

      {viewMode === 'grid' && activeTab === 'bead' && (() => {
        const sorted = [...filteredBeads].sort((a, b) => numericCodeCompare(a.productCode, b.productCode))
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {sorted.map(b => {
              const brand = brandById.get(b.brandId)
              const isLight = needsBorder(b.hexColor)
              const count = beadProjectCount.get(b.id) || 0
              return (
                <button
                  key={b.id}
                  onClick={() => openBeadDetail(b)}
                  className="flex items-center gap-4 p-4 rounded-xl border border-stone-200/60 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-stone-300 dark:hover:border-stone-700 hover:shadow-sm transition-all text-left group"
                >
                  <div
                    className={`w-10 h-10 rounded-full shadow-sm shrink-0 transition-transform group-hover:scale-110 ${isLight ? 'ring-1 ring-stone-200 dark:ring-stone-600' : ''}`}
                    style={{ backgroundColor: b.hexColor }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                      {brand?.name} {b.productCode} — {b.colorName}
                    </p>
                    <p className="text-xs text-stone-400 dark:text-stone-500 truncate" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                      {b.colorFamily}
                      {count > 0 && <span> · {projectCountLabel(count)}</span>}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        )
      })()}

      {viewMode === 'grid' && activeTab === 'specialty' && (() => {
        const sorted = [...filteredSpecialty].sort((a, b) => numericCodeCompare(a.productCode, b.productCode))
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {sorted.map(item => {
              const brand = brandById.get(item.brandId)
              const isLight = needsBorder(item.hexColor)
              const count = specialtyProjectCount.get(item.id) || 0
              return (
                <button
                  key={item.id}
                  onClick={() => openSpecialtyDetail(item)}
                  className="flex items-center gap-4 p-4 rounded-xl border border-stone-200/60 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-stone-300 dark:hover:border-stone-700 hover:shadow-sm transition-all text-left group"
                >
                  <div
                    className={`w-10 h-10 rounded-full shadow-sm shrink-0 transition-transform group-hover:scale-110 ${isLight ? 'ring-1 ring-stone-200 dark:ring-stone-600' : ''}`}
                    style={{ backgroundColor: item.hexColor }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                      {brand?.name} {item.productCode} — {item.colorName}
                    </p>
                    <p className="text-xs text-stone-400 dark:text-stone-500 truncate" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                      {item.description}
                      {count > 0 && <span> · {projectCountLabel(count)}</span>}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        )
      })()}

      {/* Empty state */}
      {activeCount === 0 && (
        <div className="py-16 text-center">
          <div className="w-12 h-12 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center mx-auto mb-3">
            <Search className="w-5 h-5 text-stone-400 dark:text-stone-500" />
          </div>
          <p className="text-sm text-stone-500 dark:text-stone-400 mb-1" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
            No {activeTab === 'thread' ? 'threads' : activeTab === 'bead' ? 'beads' : 'specialty items'} found
          </p>
          <p className="text-xs text-stone-400 dark:text-stone-500" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
            {filters.search || filters.brandId || filters.colorFamily
              ? 'Try adjusting your filters'
              : 'Add your first item to get started'}
          </p>
        </div>
      )}

      {/* Add modal */}
      {showAddModal && (
        <AddSupplyModal
          tab={activeTab}
          brands={brandsForTab}
          onClose={() => setShowAddModal(false)}
          onAddBrand={(name) => onAddBrand?.({ name, supplyType: activeTab })}
          onSave={(data) => {
            if (activeTab === 'thread') {
              onAddThread?.({ colorCode: data.code, colorName: data.name, brandId: data.brandId, hexColor: data.hexColor, colorFamily: data.colorFamily as ColorFamily })
            } else if (activeTab === 'bead') {
              onAddBead?.({ productCode: data.code, colorName: data.name, brandId: data.brandId, hexColor: data.hexColor, colorFamily: data.colorFamily as ColorFamily })
            } else {
              onAddSpecialtyItem?.({ productCode: data.code, colorName: data.name, brandId: data.brandId, hexColor: data.hexColor, description: data.description })
            }
            setShowAddModal(false)
          }}
        />
      )}

      {/* Detail modal */}
      {detailSupply && (
        <SupplyDetailModal
          supply={detailSupply}
          onClose={() => setDetailSupply(null)}
          onNavigateToProject={onNavigateToProject}
        />
      )}
    </div>
  )
}

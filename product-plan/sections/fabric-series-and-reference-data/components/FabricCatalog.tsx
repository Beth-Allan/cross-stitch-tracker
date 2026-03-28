import { useState, useMemo, useRef, useEffect } from 'react'
import type {
  Fabric,
  FabricBrand,
  FabricCount,
  FabricType,
  FabricColorFamily,
  FabricFilterState,
  FabricSeriesProps,
} from '../types'
import {
  Search, Plus, X, ChevronDown, ChevronUp,
  Pencil, Trash2, ExternalLink, ShoppingCart, Ruler,
} from 'lucide-react'

/* ─── Constants ─── */

type FabricTab = 'fabrics' | 'brands'

const fabricCounts: FabricCount[] = [14, 16, 18, 20, 22, 25, 28, 32, 36, 40]

const fabricTypes: FabricType[] = [
  'Aida', 'Linen', 'Lugana', 'Evenweave', 'Hardanger', 'Congress Cloth', 'Other',
]

const colorFamilies: FabricColorFamily[] = [
  'White', 'Cream', 'Blue', 'Green', 'Pink', 'Purple',
  'Red', 'Yellow', 'Brown', 'Gray', 'Black', 'Multi',
]

const colorFamilySwatches: Record<string, string> = {
  White: '#FAFAF9', Cream: '#FEF3C7', Blue: '#97B2C9',
  Green: '#4B7A6A', Pink: '#F9A8D4', Purple: '#8B5CF6',
  Red: '#C72B3B', Yellow: '#E5C050', Brown: '#4B3327',
  Gray: '#3C3C3C', Black: '#000000', Multi: 'linear-gradient(135deg, #C72B3B 0%, #E5C050 25%, #4B7A6A 50%, #97B2C9 75%, #8B5CF6 100%)',
}

type SortKey = 'name' | 'brand' | 'count' | 'type' | 'colorFamily' | 'dimensions'
type SortDir = 'asc' | 'desc'

/* ─── Shared Sub-Components ─── */

function SortableHeader({ label, sortKey, currentSort, onSort }: {
  label: string
  sortKey: SortKey
  currentSort: { key: SortKey; dir: SortDir }
  onSort: (key: SortKey) => void
}) {
  const isActive = currentSort.key === sortKey
  return (
    <th
      className="py-2.5 px-4 text-left cursor-pointer select-none group"
      onClick={() => onSort(sortKey)}
    >
      <span
        className={`text-xs uppercase tracking-wider font-semibold transition-colors inline-flex items-center gap-1 ${
          isActive
            ? 'text-emerald-600 dark:text-emerald-400'
            : 'text-stone-400 dark:text-stone-500 group-hover:text-stone-600 dark:group-hover:text-stone-300'
        }`}
        style={{ fontFamily: "'Source Sans 3', sans-serif" }}
      >
        {label}
        {isActive && (
          currentSort.dir === 'asc'
            ? <ChevronUp className="w-3 h-3" />
            : <ChevronDown className="w-3 h-3" />
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

/* ─── Brand Table ─── */

function BrandTable({ brands, onSaveBrand, onDeleteBrand, onFilterByBrand }: {
  brands: FabricBrand[]
  onSaveBrand?: (brand: Partial<FabricBrand>) => void
  onDeleteBrand?: (brandId: string) => void
  onFilterByBrand?: (brandId: string) => void
}) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [newBrandName, setNewBrandName] = useState('')
  const [newBrandWebsite, setNewBrandWebsite] = useState('')

  const inputClass =
    'w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-colors'

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-stone-200 dark:border-stone-800">
              <th className="py-2.5 px-4 text-left">
                <span className="text-xs uppercase tracking-wider font-semibold text-stone-400 dark:text-stone-500" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                  Brand Name
                </span>
              </th>
              <th className="py-2.5 px-4 text-left">
                <span className="text-xs uppercase tracking-wider font-semibold text-stone-400 dark:text-stone-500" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                  Website
                </span>
              </th>
              <th className="py-2.5 px-4 text-right">
                <span className="text-xs uppercase tracking-wider font-semibold text-stone-400 dark:text-stone-500" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                  Fabrics
                </span>
              </th>
              <th className="w-20" />
            </tr>
          </thead>
          <tbody>
            {brands.map(brand => (
              <BrandRow
                key={brand.id}
                brand={brand}
                onDelete={() => onDeleteBrand?.(brand.id)}
                onEdit={() => onSaveBrand?.(brand)}
                onFilterByBrand={() => onFilterByBrand?.(brand.id)}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Brand Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 dark:bg-black/60" onClick={() => setShowAddModal(false)} />
          <div className="relative w-full max-w-sm bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-stone-800">
              <h3
                className="text-base font-semibold text-stone-900 dark:text-stone-100"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                Add Brand
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1.5" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                  Name
                </label>
                <input
                  type="text"
                  value={newBrandName}
                  onChange={e => setNewBrandName(e.target.value)}
                  placeholder="e.g. Zweigart"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1.5" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                  Website
                </label>
                <input
                  type="url"
                  value={newBrandWebsite}
                  onChange={e => setNewBrandWebsite(e.target.value)}
                  placeholder="https://..."
                  className={inputClass}
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-stone-200 dark:border-stone-800 flex justify-end gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-sm font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
                style={{ fontFamily: "'Source Sans 3', sans-serif" }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onSaveBrand?.({ name: newBrandName, website: newBrandWebsite || null })
                  setNewBrandName('')
                  setNewBrandWebsite('')
                  setShowAddModal(false)
                }}
                className="px-5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-lg transition-colors shadow-sm"
                style={{ fontFamily: "'Source Sans 3', sans-serif" }}
              >
                Add Brand
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Brand button — placed outside table for layout */}
      <div className="mt-4 flex justify-end px-4">
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-lg transition-colors"
          style={{ fontFamily: "'Source Sans 3', sans-serif" }}
        >
          <Plus className="w-4 h-4" />
          Add Brand
        </button>
      </div>
    </>
  )
}

function BrandRow({ brand, onDelete, onEdit, onFilterByBrand }: {
  brand: FabricBrand & { fabricCount?: number }
  onDelete?: () => void
  onEdit?: () => void
  onFilterByBrand?: () => void
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <tr
      className="border-b border-stone-100 dark:border-stone-800/60 transition-colors hover:bg-stone-50/50 dark:hover:bg-stone-800/30"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <td className="py-3 px-4">
        <button
          onClick={onFilterByBrand}
          className="text-sm font-medium text-stone-900 dark:text-stone-100 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
          style={{ fontFamily: "'Source Sans 3', sans-serif" }}
        >
          {brand.name}
        </button>
      </td>
      <td className="py-3 px-4">
        {brand.website ? (
          <a
            href={brand.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 inline-flex items-center gap-1 transition-colors"
            style={{ fontFamily: "'Source Sans 3', sans-serif" }}
          >
            {brand.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
            <ExternalLink className="w-3 h-3" />
          </a>
        ) : (
          <span className="text-sm text-stone-400 dark:text-stone-500" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
            —
          </span>
        )}
      </td>
      <td className="py-3 px-4 text-right">
        <span className="text-sm text-stone-600 dark:text-stone-400" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
          {(brand as FabricBrand & { fabricCount?: number }).fabricCount ?? 0}
        </span>
      </td>
      <td className="py-3 px-4">
        <div className={`flex items-center gap-1 justify-end transition-opacity ${hovered ? 'opacity-100' : 'opacity-0'}`}>
          <button
            onClick={onEdit}
            className="p-1.5 rounded-md text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-md text-stone-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  )
}

/* ─── Main Fabric Catalog ─── */

export function FabricCatalog({
  fabrics,
  fabricBrands,
  onSaveFabric,
  onDeleteFabric,
  onSaveFabricBrand,
  onDeleteFabricBrand,
  onFabricFilterChange,
  onNavigateToProject,
}: Pick<
  FabricSeriesProps,
  'fabrics' | 'fabricBrands' | 'onSaveFabric' | 'onDeleteFabric' | 'onSaveFabricBrand' | 'onDeleteFabricBrand' | 'onFabricFilterChange' | 'onNavigateToProject'
> & {
  onViewFabric?: (fabricId: string) => void
  onAddFabric?: () => void
}) {
  const [activeTab, setActiveTab] = useState<FabricTab>('fabrics')
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: 'name', dir: 'asc' })
  const [filters, setFilters] = useState<FabricFilterState>({
    brandId: null,
    count: null,
    type: null,
    colorFamily: null,
    needToBuy: null,
    search: '',
  })
  const [showAddModal, setShowAddModal] = useState(false)

  // Pull these from outer props for the catalog
  const { onViewFabric, onAddFabric } = arguments[0] as {
    onViewFabric?: (fabricId: string) => void
    onAddFabric?: () => void
  }

  function handleSort(key: SortKey) {
    setSort(prev =>
      prev.key === key
        ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: 'asc' }
    )
  }

  function updateFilter<K extends keyof FabricFilterState>(key: K, value: FabricFilterState[K]) {
    const next = { ...filters, [key]: value }
    setFilters(next)
    onFabricFilterChange?.(next)
  }

  // Brand lookup
  const brandMap = useMemo(() => {
    const m = new Map<string, FabricBrand>()
    for (const b of fabricBrands) m.set(b.id, b)
    return m
  }, [fabricBrands])

  // Brand fabric counts
  const brandFabricCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const f of fabrics) {
      counts.set(f.brandId, (counts.get(f.brandId) || 0) + 1)
    }
    return counts
  }, [fabrics])

  // Filter + sort fabrics
  const filteredFabrics = useMemo(() => {
    let result = fabrics.filter(f => {
      if (filters.brandId && f.brandId !== filters.brandId) return false
      if (filters.count && f.count !== filters.count) return false
      if (filters.type && f.type !== filters.type) return false
      if (filters.colorFamily && f.colorFamily !== filters.colorFamily) return false
      if (filters.needToBuy !== null && f.needToBuy !== filters.needToBuy) return false
      if (filters.search) {
        const q = filters.search.toLowerCase()
        const brand = brandMap.get(f.brandId)
        if (
          !f.name.toLowerCase().includes(q) &&
          !(brand?.name.toLowerCase().includes(q))
        ) return false
      }
      return true
    })

    result.sort((a, b) => {
      const dir = sort.dir === 'asc' ? 1 : -1
      switch (sort.key) {
        case 'name':
          return dir * a.name.localeCompare(b.name)
        case 'brand': {
          const aBrand = brandMap.get(a.brandId)?.name || ''
          const bBrand = brandMap.get(b.brandId)?.name || ''
          return dir * aBrand.localeCompare(bBrand)
        }
        case 'count':
          return dir * (a.count - b.count)
        case 'type':
          return dir * a.type.localeCompare(b.type)
        case 'colorFamily':
          return dir * a.colorFamily.localeCompare(b.colorFamily)
        case 'dimensions': {
          const aArea = a.shortestEdgeInches * a.longestEdgeInches
          const bArea = b.shortestEdgeInches * b.longestEdgeInches
          return dir * (aArea - bArea)
        }
        default:
          return 0
      }
    })

    return result
  }, [fabrics, filters, sort, brandMap])

  const hasActiveFilters = filters.brandId || filters.count || filters.type || filters.colorFamily || filters.needToBuy !== null || filters.search

  return (
    <div>
      {/* Header */}
      <div className="px-6 pt-6 pb-0">
        <div className="flex items-center justify-between mb-5">
          <h1
            className="text-2xl font-bold text-stone-900 dark:text-stone-100"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Fabric
          </h1>
          <button
            onClick={() => onAddFabric?.()}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-lg transition-colors shadow-sm"
            style={{ fontFamily: "'Source Sans 3', sans-serif" }}
          >
            <Plus className="w-4 h-4" />
            Add Fabric
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-stone-200 dark:border-stone-800">
          <nav className="flex gap-0.5 -mb-px">
            {([
              { id: 'fabrics' as const, label: 'Fabrics', count: fabrics.length },
              { id: 'brands' as const, label: 'Brands', count: fabricBrands.length },
            ]).map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'text-emerald-700 dark:text-emerald-400 border-emerald-600 dark:border-emerald-400'
                    : 'text-stone-500 dark:text-stone-400 border-transparent hover:text-stone-700 dark:hover:text-stone-300'
                }`}
                style={{ fontFamily: "'Source Sans 3', sans-serif" }}
              >
                {tab.label}
                <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.id
                    ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div>
        {activeTab === 'fabrics' ? (
          <>
            {/* Filter bar */}
            <div className="px-6 py-4 flex flex-wrap items-center gap-3 border-b border-stone-100 dark:border-stone-800/60">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px] max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-stone-500" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={e => updateFilter('search', e.target.value)}
                  placeholder="Search fabrics..."
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-colors"
                  style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                />
              </div>

              <FilterDropdown
                label="Brand"
                options={fabricBrands.map(b => ({ value: b.id, label: b.name }))}
                value={filters.brandId}
                onChange={v => updateFilter('brandId', v)}
              />
              <FilterDropdown
                label="Count"
                options={fabricCounts.map(c => ({ value: String(c), label: `${c}ct` }))}
                value={filters.count ? String(filters.count) : null}
                onChange={v => updateFilter('count', v ? (Number(v) as FabricCount) : null)}
              />
              <FilterDropdown
                label="Type"
                options={fabricTypes.map(t => ({ value: t, label: t }))}
                value={filters.type}
                onChange={v => updateFilter('type', v as FabricType | null)}
              />
              <FilterDropdown
                label="Colour"
                options={colorFamilies.map(c => ({ value: c, label: c }))}
                value={filters.colorFamily}
                onChange={v => updateFilter('colorFamily', v as FabricColorFamily | null)}
              />

              {/* Need to buy toggle */}
              <button
                onClick={() => updateFilter('needToBuy', filters.needToBuy === true ? null : true)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
                  filters.needToBuy === true
                    ? 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400'
                    : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:border-stone-300 dark:hover:border-stone-600'
                }`}
                style={{ fontFamily: "'Source Sans 3', sans-serif" }}
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                Need to Buy
              </button>

              {hasActiveFilters && (
                <button
                  onClick={() => {
                    const cleared: FabricFilterState = { brandId: null, count: null, type: null, colorFamily: null, needToBuy: null, search: '' }
                    setFilters(cleared)
                    onFabricFilterChange?.(cleared)
                  }}
                  className="text-xs text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 transition-colors"
                  style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Desktop table */}
            <div className="max-md:hidden overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-stone-200 dark:border-stone-800">
                    <SortableHeader label="Name" sortKey="name" currentSort={sort} onSort={handleSort} />
                    <SortableHeader label="Brand" sortKey="brand" currentSort={sort} onSort={handleSort} />
                    <SortableHeader label="Count" sortKey="count" currentSort={sort} onSort={handleSort} />
                    <SortableHeader label="Type" sortKey="type" currentSort={sort} onSort={handleSort} />
                    <SortableHeader label="Colour" sortKey="colorFamily" currentSort={sort} onSort={handleSort} />
                    <SortableHeader label="Dimensions" sortKey="dimensions" currentSort={sort} onSort={handleSort} />
                    <th className="py-2.5 px-4 text-left">
                      <span className="text-xs uppercase tracking-wider font-semibold text-stone-400 dark:text-stone-500" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                        Status
                      </span>
                    </th>
                    <th className="w-20" />
                  </tr>
                </thead>
                <tbody>
                  {filteredFabrics.map(fabric => (
                    <FabricRow
                      key={fabric.id}
                      fabric={fabric}
                      brandName={brandMap.get(fabric.brandId)?.name || '—'}
                      onView={() => onViewFabric?.(fabric.id)}
                      onEdit={() => onSaveFabric?.(fabric)}
                      onDelete={() => onDeleteFabric?.(fabric.id)}
                    />
                  ))}
                  {filteredFabrics.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-12 text-center">
                        <Ruler className="w-8 h-8 text-stone-300 dark:text-stone-600 mx-auto mb-2" />
                        <p className="text-sm text-stone-400 dark:text-stone-500" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                          {hasActiveFilters ? 'No fabrics match your filters' : 'No fabrics added yet'}
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden px-4 py-3 space-y-3">
              {filteredFabrics.map(fabric => (
                <FabricCard
                  key={fabric.id}
                  fabric={fabric}
                  brandName={brandMap.get(fabric.brandId)?.name || '—'}
                  onView={() => onViewFabric?.(fabric.id)}
                  onEdit={() => onSaveFabric?.(fabric)}
                  onDelete={() => onDeleteFabric?.(fabric.id)}
                />
              ))}
              {filteredFabrics.length === 0 && (
                <div className="py-12 text-center">
                  <Ruler className="w-8 h-8 text-stone-300 dark:text-stone-600 mx-auto mb-2" />
                  <p className="text-sm text-stone-400 dark:text-stone-500" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                    {hasActiveFilters ? 'No fabrics match your filters' : 'No fabrics added yet'}
                  </p>
                </div>
              )}
            </div>
          </>
        ) : (
          <BrandTable
            brands={fabricBrands.map(b => ({
              ...b,
              fabricCount: brandFabricCounts.get(b.id) || 0,
            }))}
            onSaveBrand={onSaveFabricBrand}
            onDeleteBrand={onDeleteFabricBrand}
            onFilterByBrand={(brandId) => {
              setActiveTab('fabrics')
              updateFilter('brandId', brandId)
            }}
          />
        )}
      </div>
    </div>
  )
}

/* ─── Fabric Table Row ─── */

function FabricRow({ fabric, brandName, onView, onEdit, onDelete }: {
  fabric: Fabric
  brandName: string
  onView?: () => void
  onEdit?: () => void
  onDelete?: () => void
}) {
  const [hovered, setHovered] = useState(false)
  const isMulti = fabric.colorFamily === 'Multi'
  const swatch = colorFamilySwatches[fabric.colorFamily]

  return (
    <tr
      className="border-b border-stone-100 dark:border-stone-800/60 transition-colors hover:bg-stone-50/50 dark:hover:bg-stone-800/30"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <td className="py-3 px-4">
        <button
          onClick={onView}
          className="text-sm font-medium text-stone-900 dark:text-stone-100 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors text-left"
          style={{ fontFamily: "'Source Sans 3', sans-serif" }}
        >
          {fabric.name}
        </button>
      </td>
      <td className="py-3 px-4">
        <span className="text-sm text-stone-600 dark:text-stone-400" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
          {brandName}
        </span>
      </td>
      <td className="py-3 px-4">
        <span className="text-sm font-medium text-stone-700 dark:text-stone-300" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
          {fabric.count}ct
        </span>
      </td>
      <td className="py-3 px-4">
        <span className="text-sm text-stone-600 dark:text-stone-400" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
          {fabric.type}
        </span>
      </td>
      <td className="py-3 px-4">
        <span className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
          <span
            className={`w-3 h-3 rounded-full shrink-0 ${fabric.colorFamily === 'White' || fabric.colorFamily === 'Cream' ? 'ring-1 ring-stone-200 dark:ring-stone-600' : ''}`}
            style={{ background: isMulti ? swatch : swatch }}
          />
          {fabric.colorFamily}
        </span>
      </td>
      <td className="py-3 px-4">
        {fabric.shortestEdgeInches > 0 ? (
          <span className="text-sm text-stone-600 dark:text-stone-400" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
            {fabric.shortestEdgeInches}" x {fabric.longestEdgeInches}"
          </span>
        ) : (
          <span className="text-sm text-stone-400 dark:text-stone-500 italic" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
            TBD
          </span>
        )}
      </td>
      <td className="py-3 px-4">
        {fabric.needToBuy ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
            <ShoppingCart className="w-3 h-3" />
            Need to buy
          </span>
        ) : fabric.linkedProjectId ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            In use
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-stone-50 dark:bg-stone-800 text-stone-500 dark:text-stone-400 border border-stone-200 dark:border-stone-700">
            Available
          </span>
        )}
      </td>
      <td className="py-3 px-4">
        <div className={`flex items-center gap-1 justify-end transition-opacity ${hovered ? 'opacity-100' : 'opacity-0'}`}>
          <button
            onClick={onEdit}
            className="p-1.5 rounded-md text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-md text-stone-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  )
}

/* ─── Fabric Mobile Card ─── */

function FabricCard({ fabric, brandName, onView, onEdit, onDelete }: {
  fabric: Fabric
  brandName: string
  onView?: () => void
  onEdit?: () => void
  onDelete?: () => void
}) {
  const swatch = colorFamilySwatches[fabric.colorFamily]
  const isMulti = fabric.colorFamily === 'Multi'

  return (
    <div
      className="p-4 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm"
      onClick={onView}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="min-w-0 flex-1">
          <h3
            className="text-sm font-semibold text-stone-900 dark:text-stone-100 truncate"
            style={{ fontFamily: "'Source Sans 3', sans-serif" }}
          >
            {fabric.name}
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
            {brandName}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0 ml-2">
          <button
            onClick={e => { e.stopPropagation(); onEdit?.() }}
            className="p-1.5 rounded-md text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={e => { e.stopPropagation(); onDelete?.() }}
            className="p-1.5 rounded-md text-stone-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-xs font-medium px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
          {fabric.count}ct {fabric.type}
        </span>
        <span className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
          <span
            className={`w-2.5 h-2.5 rounded-full ${fabric.colorFamily === 'White' || fabric.colorFamily === 'Cream' ? 'ring-1 ring-stone-200 dark:ring-stone-600' : ''}`}
            style={{ background: isMulti ? swatch : swatch }}
          />
          {fabric.colorFamily}
        </span>
        {fabric.shortestEdgeInches > 0 && (
          <span className="text-xs text-stone-500 dark:text-stone-400" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
            {fabric.shortestEdgeInches}" x {fabric.longestEdgeInches}"
          </span>
        )}
        {fabric.needToBuy && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
            <ShoppingCart className="w-3 h-3" />
            Need to buy
          </span>
        )}
      </div>
    </div>
  )
}

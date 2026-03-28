import { useState, useEffect, useRef } from 'react'
import type {
  Fabric,
  FabricBrand,
  FabricCount,
  FabricType,
  FabricColorFamily,
  FabricColorType,
} from '../types'
import { X, Plus, Upload } from 'lucide-react'

/* ─── Constants ─── */

const fabricCounts: FabricCount[] = [14, 16, 18, 20, 22, 25, 28, 32, 36, 40]

const fabricTypes: FabricType[] = [
  'Aida', 'Linen', 'Lugana', 'Evenweave', 'Hardanger', 'Congress Cloth', 'Other',
]

const colorFamilies: FabricColorFamily[] = [
  'White', 'Cream', 'Blue', 'Green', 'Pink', 'Purple',
  'Red', 'Yellow', 'Brown', 'Gray', 'Black', 'Multi',
]

const colorTypes: FabricColorType[] = [
  'White', 'Cream', 'Natural', 'Neutrals', 'Brights', 'Pastels', 'Dark', 'Hand-dyed', 'Overdyed',
]

const inputClass =
  'w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 dark:focus:border-emerald-500 transition-colors'

const selectClass =
  'w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 dark:focus:border-emerald-500 transition-colors appearance-none'

/* ─── Types ─── */

export interface FabricFormModalProps {
  isOpen: boolean
  fabric?: Fabric | null
  brands: FabricBrand[]
  projects?: { id: string; name: string }[]
  onSave?: (fabric: Partial<Fabric>) => void
  onClose: () => void
  onAddBrand?: (name: string) => void
  onUploadPhoto?: (file: File) => void
}

/* ─── Component ─── */

export function FabricFormModal({
  isOpen,
  fabric,
  brands,
  projects = [],
  onSave,
  onClose,
  onAddBrand,
  onUploadPhoto,
}: FabricFormModalProps) {
  const isEditing = !!fabric

  const [name, setName] = useState('')
  const [brandId, setBrandId] = useState('')
  const [count, setCount] = useState<FabricCount>(14)
  const [type, setType] = useState<FabricType>('Aida')
  const [colorFamily, setColorFamily] = useState<FabricColorFamily>('White')
  const [colorType, setColorType] = useState<FabricColorType>('White')
  const [shortestEdge, setShortestEdge] = useState('')
  const [longestEdge, setLongestEdge] = useState('')
  const [linkedProjectId, setLinkedProjectId] = useState<string | null>(null)
  const [needToBuy, setNeedToBuy] = useState(false)

  // Brand search
  const [brandSearch, setBrandSearch] = useState('')
  const [showBrandDropdown, setShowBrandDropdown] = useState(false)
  const brandRef = useRef<HTMLDivElement>(null)

  // Project search
  const [projectSearch, setProjectSearch] = useState('')
  const [showProjectDropdown, setShowProjectDropdown] = useState(false)
  const projectRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (fabric) {
      setName(fabric.name)
      setBrandId(fabric.brandId)
      setCount(fabric.count)
      setType(fabric.type)
      setColorFamily(fabric.colorFamily)
      setColorType(fabric.colorType)
      setShortestEdge(fabric.shortestEdgeInches > 0 ? String(fabric.shortestEdgeInches) : '')
      setLongestEdge(fabric.longestEdgeInches > 0 ? String(fabric.longestEdgeInches) : '')
      setLinkedProjectId(fabric.linkedProjectId)
      setNeedToBuy(fabric.needToBuy)
    } else {
      setName('')
      setBrandId(brands[0]?.id || '')
      setCount(14)
      setType('Aida')
      setColorFamily('White')
      setColorType('White')
      setShortestEdge('')
      setLongestEdge('')
      setLinkedProjectId(null)
      setNeedToBuy(false)
    }
  }, [fabric, brands])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (brandRef.current && !brandRef.current.contains(e.target as Node)) setShowBrandDropdown(false)
      if (projectRef.current && !projectRef.current.contains(e.target as Node)) setShowProjectDropdown(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleSave() {
    onSave?.({
      ...(fabric ? { id: fabric.id } : {}),
      name,
      brandId,
      count,
      type,
      colorFamily,
      colorType,
      shortestEdgeInches: shortestEdge ? Number(shortestEdge) : 0,
      longestEdgeInches: longestEdge ? Number(longestEdge) : 0,
      linkedProjectId,
      needToBuy,
    })
    onClose()
  }

  if (!isOpen) return null

  const selectedBrand = brands.find(b => b.id === brandId)
  const filteredBrands = brands.filter(b =>
    b.name.toLowerCase().includes(brandSearch.toLowerCase())
  )
  const selectedProject = projects.find(p => p.id === linkedProjectId)
  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(projectSearch.toLowerCase())
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white dark:bg-stone-900 rounded-2xl shadow-2xl dark:shadow-black/40 max-w-lg w-full max-h-[90vh] flex flex-col border border-stone-200/60 dark:border-stone-800">
        {/* Header */}
        <div className="px-8 pt-6 pb-0 flex items-center justify-between">
          <h2
            className="text-lg font-semibold text-stone-900 dark:text-stone-100"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            {isEditing ? 'Edit Fabric' : 'Add Fabric'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <div className="space-y-5">

            {/* Name */}
            <FormField label="Fabric Name">
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Driftwood Princess"
                className={inputClass}
              />
            </FormField>

            {/* Photo Upload */}
            <FormField label="Photo (optional)">
              <div
                className="border-2 border-dashed border-stone-200 dark:border-stone-700 rounded-lg p-4 text-center cursor-pointer hover:border-emerald-400 dark:hover:border-emerald-600 transition-colors"
                onClick={() => {
                  const input = document.createElement('input')
                  input.type = 'file'
                  input.accept = 'image/*'
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0]
                    if (file) onUploadPhoto?.(file)
                  }
                  input.click()
                }}
              >
                <Upload className="w-5 h-5 text-stone-400 dark:text-stone-500 mx-auto mb-1.5" />
                <p className="text-xs text-stone-500 dark:text-stone-400" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                  Click to upload a photo
                </p>
              </div>
            </FormField>

            {/* Brand — searchable select */}
            <FormField label="Brand">
              <div ref={brandRef} className="relative">
                <input
                  type="text"
                  value={showBrandDropdown ? brandSearch : (selectedBrand?.name || '')}
                  onChange={e => { setBrandSearch(e.target.value); setShowBrandDropdown(true) }}
                  onFocus={() => { setShowBrandDropdown(true); setBrandSearch('') }}
                  placeholder="Search or add a brand..."
                  className={inputClass}
                />
                {showBrandDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg shadow-lg z-30 max-h-40 overflow-y-auto py-1">
                    {filteredBrands.map(b => (
                      <button
                        key={b.id}
                        onClick={() => { setBrandId(b.id); setShowBrandDropdown(false) }}
                        className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                          b.id === brandId
                            ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
                            : 'text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
                        }`}
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
            </FormField>

            {/* Count + Type row */}
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Count">
                <select
                  value={count}
                  onChange={e => setCount(Number(e.target.value) as FabricCount)}
                  className={selectClass}
                >
                  {fabricCounts.map(c => (
                    <option key={c} value={c}>{c}ct</option>
                  ))}
                </select>
              </FormField>
              <FormField label="Type">
                <select
                  value={type}
                  onChange={e => setType(e.target.value as FabricType)}
                  className={selectClass}
                >
                  {fabricTypes.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </FormField>
            </div>

            {/* Color Family + Color Type row */}
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Colour Family">
                <select
                  value={colorFamily}
                  onChange={e => setColorFamily(e.target.value as FabricColorFamily)}
                  className={selectClass}
                >
                  {colorFamilies.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </FormField>
              <FormField label="Colour Type">
                <select
                  value={colorType}
                  onChange={e => setColorType(e.target.value as FabricColorType)}
                  className={selectClass}
                >
                  {colorTypes.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </FormField>
            </div>

            {/* Dimensions */}
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Shortest Edge (inches)">
                <input
                  type="number"
                  value={shortestEdge}
                  onChange={e => setShortestEdge(e.target.value)}
                  placeholder="e.g. 18"
                  min={0}
                  className={inputClass}
                />
              </FormField>
              <FormField label="Longest Edge (inches)">
                <input
                  type="number"
                  value={longestEdge}
                  onChange={e => setLongestEdge(e.target.value)}
                  placeholder="e.g. 24"
                  min={0}
                  className={inputClass}
                />
              </FormField>
            </div>

            {/* Linked Project — searchable select */}
            <FormField label="Linked Project (optional)">
              <div ref={projectRef} className="relative">
                <input
                  type="text"
                  value={showProjectDropdown ? projectSearch : (selectedProject?.name || '')}
                  onChange={e => { setProjectSearch(e.target.value); setShowProjectDropdown(true) }}
                  onFocus={() => { setShowProjectDropdown(true); setProjectSearch('') }}
                  placeholder="Search projects..."
                  className={inputClass}
                />
                {showProjectDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg shadow-lg z-30 max-h-40 overflow-y-auto py-1">
                    <button
                      onClick={() => { setLinkedProjectId(null); setShowProjectDropdown(false) }}
                      className="w-full text-left px-3 py-2 text-sm text-stone-400 dark:text-stone-500 hover:bg-stone-50 dark:hover:bg-stone-800"
                      style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                    >
                      None
                    </button>
                    {filteredProjects.map(p => (
                      <button
                        key={p.id}
                        onClick={() => { setLinkedProjectId(p.id); setShowProjectDropdown(false) }}
                        className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                          p.id === linkedProjectId
                            ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
                            : 'text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
                        }`}
                        style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </FormField>

            {/* Need to Buy */}
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={needToBuy}
                  onChange={e => setNeedToBuy(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded border-2 transition-colors flex items-center justify-center ${
                  needToBuy
                    ? 'bg-emerald-600 border-emerald-600 dark:bg-emerald-500 dark:border-emerald-500'
                    : 'border-stone-300 dark:border-stone-600 group-hover:border-stone-400 dark:group-hover:border-stone-500'
                }`}>
                  {needToBuy && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                </div>
              </div>
              <span className="text-sm text-stone-700 dark:text-stone-300" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                Need to buy this fabric
              </span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
            style={{ fontFamily: "'Source Sans 3', sans-serif" }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-lg transition-colors shadow-sm"
            style={{ fontFamily: "'Source Sans 3', sans-serif" }}
          >
            {isEditing ? 'Save Changes' : 'Add Fabric'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Form Field ─── */

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label
        className="block text-xs text-stone-500 dark:text-stone-400 uppercase tracking-wider font-semibold mb-1.5"
        style={{ fontFamily: "'Source Sans 3', sans-serif" }}
      >
        {label}
      </label>
      {children}
    </div>
  )
}

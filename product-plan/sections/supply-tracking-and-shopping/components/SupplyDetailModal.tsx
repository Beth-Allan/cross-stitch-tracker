import { X, MapPin, ArrowRight, Package } from 'lucide-react'

/* ─── Helpers ─── */

function needsBorder(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.85
}

const colorFamilySwatches: Record<string, string> = {
  Red: '#C72B3B', Orange: '#C47458', Yellow: '#E5C050',
  Green: '#4B7A6A', Blue: '#97B2C9', Purple: '#8B5CF6',
  Brown: '#4B3327', Gray: '#3C3C3C', Black: '#000000',
  White: '#F5F5F4', Neutral: '#D6D3D1',
}

/* ─── Types ─── */

export interface SupplyDetailInfo {
  hex: string
  code: string
  name: string
  brand: string
  colorFamily?: string
  description?: string
  projectUsage: {
    projectId: string
    projectName: string
    projectBin: string | null
    quantityRequired: number
    quantityAcquired: number
    quantityNeeded: number
    stitchCount?: number
  }[]
}

/* ─── Component ─── */

export function SupplyDetailModal({ supply, onClose, onNavigateToProject }: {
  supply: SupplyDetailInfo
  onClose: () => void
  onNavigateToProject?: (projectId: string) => void
}) {
  const isLight = needsBorder(supply.hex)
  const totalStitches = supply.projectUsage.reduce((sum, pu) => sum + (pu.stitchCount || 0), 0)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start gap-4 px-8 py-6 border-b border-stone-200 dark:border-stone-800 shrink-0">
          <div
            className={`w-14 h-14 rounded-full shadow-sm shrink-0 ${isLight ? 'ring-1 ring-stone-200 dark:ring-stone-600' : ''}`}
            style={{ backgroundColor: supply.hex }}
          />
          <div className="min-w-0 flex-1">
            <h2
              className="text-lg font-semibold text-stone-900 dark:text-stone-100"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              {supply.brand} {supply.code}
            </h2>
            <p
              className="text-sm text-stone-500 dark:text-stone-400"
              style={{ fontFamily: "'Source Sans 3', sans-serif" }}
            >
              {supply.name}
            </p>
            <div className="flex items-center gap-3 mt-1.5">
              {supply.colorFamily && (
                <span className="flex items-center gap-1.5 text-xs text-stone-400 dark:text-stone-500" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${supply.colorFamily === 'White' || supply.colorFamily === 'Neutral' ? 'ring-1 ring-stone-300 dark:ring-stone-600' : ''}`}
                    style={{ backgroundColor: colorFamilySwatches[supply.colorFamily] }}
                  />
                  {supply.colorFamily}
                </span>
              )}
              {supply.description && (
                <span className="text-xs text-stone-400 dark:text-stone-500" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                  {supply.description}
                </span>
              )}
              {totalStitches > 0 && (
                <span className="text-xs text-stone-400 dark:text-stone-500" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                  {totalStitches.toLocaleString()} total stitches
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Project usage */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-8 py-6">
            <h3
              className="text-xs font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-widest mb-4"
              style={{ fontFamily: "'Source Sans 3', sans-serif" }}
            >
              Used in {supply.projectUsage.length} {supply.projectUsage.length === 1 ? 'project' : 'projects'}
            </h3>
            {supply.projectUsage.length === 0 ? (
              <div className="py-8 text-center">
                <Package className="w-8 h-8 text-stone-300 dark:text-stone-600 mx-auto mb-2" />
                <p className="text-sm text-stone-400 dark:text-stone-500" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                  Not linked to any projects yet
                </p>
              </div>
            ) : (
              <div>
                {supply.projectUsage.map((pu, i) => (
                  <div
                    key={pu.projectId}
                    className={`py-3.5 ${i < supply.projectUsage.length - 1 ? 'border-b border-stone-200/60 dark:border-stone-800/60' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <button
                        onClick={() => onNavigateToProject?.(pu.projectId)}
                        className="text-sm font-medium text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 hover:underline transition-colors flex items-center gap-1.5 group"
                        style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                      >
                        {pu.projectName}
                        <ArrowRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                      </button>
                      {pu.projectBin && (
                        <span className="flex items-center gap-1 text-xs text-stone-400 dark:text-stone-500" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                          <MapPin className="w-3 h-3" />
                          {pu.projectBin}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-stone-500 dark:text-stone-400" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                      <span>
                        Required: <strong className="text-stone-700 dark:text-stone-300">{pu.quantityRequired}</strong>
                      </span>
                      <span>
                        Acquired: <strong className={pu.quantityAcquired >= pu.quantityRequired ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>{pu.quantityAcquired}</strong>
                      </span>
                      {pu.quantityNeeded > 0 && (
                        <span className="text-amber-600 dark:text-amber-400 font-medium">
                          Need {pu.quantityNeeded} more
                        </span>
                      )}
                      {pu.stitchCount != null && pu.stitchCount > 0 && (
                        <span className="text-stone-400 dark:text-stone-500">
                          {pu.stitchCount.toLocaleString()} stitches
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

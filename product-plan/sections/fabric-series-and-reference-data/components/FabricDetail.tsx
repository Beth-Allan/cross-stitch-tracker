import type {
  Fabric,
  FabricBrand,
  FabricSizeCalculation,
  FabricDetailProps,
} from '../types'
import {
  ArrowLeft, Pencil, Trash2, ExternalLink, ShoppingCart,
  Ruler, Image as ImageIcon,
} from 'lucide-react'

/* ─── Color Swatches ─── */

const colorFamilySwatches: Record<string, string> = {
  White: '#FAFAF9', Cream: '#FEF3C7', Blue: '#97B2C9',
  Green: '#4B7A6A', Pink: '#F9A8D4', Purple: '#8B5CF6',
  Red: '#C72B3B', Yellow: '#E5C050', Brown: '#4B3327',
  Gray: '#3C3C3C', Black: '#000000', Multi: 'linear-gradient(135deg, #C72B3B 0%, #E5C050 25%, #4B7A6A 50%, #97B2C9 75%, #8B5CF6 100%)',
}

/* ─── Component ─── */

export function FabricDetail({
  fabric,
  brand,
  linkedProject,
  sizeFits,
  onEdit,
  onDelete,
  onNavigateToProject,
  onBack,
}: FabricDetailProps) {
  const hasDimensions = fabric.shortestEdgeInches > 0 && fabric.longestEdgeInches > 0
  const swatch = colorFamilySwatches[fabric.colorFamily]

  // Usable stitching area: 3" margin on each edge = 6" subtracted per dimension
  const usableWidth = hasDimensions ? fabric.shortestEdgeInches - 6 : 0
  const usableHeight = hasDimensions ? fabric.longestEdgeInches - 6 : 0
  const maxStitchesWide = hasDimensions ? Math.floor(usableWidth * fabric.count) : 0
  const maxStitchesHigh = hasDimensions ? Math.floor(usableHeight * fabric.count) : 0

  // Only projects that fit
  const fittingProjects = sizeFits.filter(s => s.fits)

  return (
    <div>
      {/* Header */}
      <div className="px-6 pt-5 pb-4 border-b border-stone-200 dark:border-stone-800">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex-1 min-w-0">
            <h1
              className="text-xl font-bold text-stone-900 dark:text-stone-100 truncate"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              {fabric.name}
            </h1>
            <p className="text-sm text-stone-500 dark:text-stone-400 mt-0.5" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
              {brand.name} &middot; {fabric.count}ct {fabric.type}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onEdit?.(fabric.id)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
              style={{ fontFamily: "'Source Sans 3', sans-serif" }}
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </button>
            <button
              onClick={() => onDelete?.(fabric.id)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
              style={{ fontFamily: "'Source Sans 3', sans-serif" }}
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6">
        <div className="max-w-3xl mx-auto space-y-8">

          {/* Top row: Photo + Metadata */}
          <div className="flex flex-col md:flex-row gap-6">
            {/* Photo */}
            <div className="shrink-0">
              {fabric.photoUrl ? (
                <div className="w-full md:w-48 h-48 rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                  <img
                    src={fabric.photoUrl}
                    alt={fabric.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-full md:w-48 h-48 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-center">
                  <ImageIcon className="w-10 h-10 text-stone-300 dark:text-stone-600" />
                </div>
              )}
            </div>

            {/* Metadata grid */}
            <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-4">
              <MetadataField label="Brand">
                <span className="flex items-center gap-1.5 text-sm text-stone-900 dark:text-stone-100" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                  {brand.name}
                  {brand.website && (
                    <a
                      href={brand.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </span>
              </MetadataField>

              <MetadataField label="Count">
                <span className="text-sm font-medium text-stone-900 dark:text-stone-100" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                  {fabric.count}ct
                </span>
              </MetadataField>

              <MetadataField label="Type">
                <span className="text-sm text-stone-900 dark:text-stone-100" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                  {fabric.type}
                </span>
              </MetadataField>

              <MetadataField label="Colour Family">
                <span className="flex items-center gap-2 text-sm text-stone-900 dark:text-stone-100" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                  <span
                    className={`w-3.5 h-3.5 rounded-full ${fabric.colorFamily === 'White' || fabric.colorFamily === 'Cream' ? 'ring-1 ring-stone-200 dark:ring-stone-600' : ''}`}
                    style={{ background: swatch }}
                  />
                  {fabric.colorFamily}
                </span>
              </MetadataField>

              <MetadataField label="Colour Type">
                <span className="text-sm text-stone-900 dark:text-stone-100" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                  {fabric.colorType}
                </span>
              </MetadataField>

              <MetadataField label="Dimensions">
                {hasDimensions ? (
                  <span className="text-sm font-medium text-stone-900 dark:text-stone-100" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                    {fabric.shortestEdgeInches}" x {fabric.longestEdgeInches}"
                  </span>
                ) : (
                  <span className="text-sm text-stone-400 dark:text-stone-500 italic" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                    Not measured
                  </span>
                )}
              </MetadataField>

              {fabric.needToBuy && (
                <MetadataField label="Status">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                    <ShoppingCart className="w-3 h-3" />
                    Need to buy
                  </span>
                </MetadataField>
              )}
            </div>
          </div>

          {/* Linked Project */}
          {linkedProject && (
            <div className="p-5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900">
              <h2
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-3"
                style={{ fontFamily: "'Source Sans 3', sans-serif" }}
              >
                Linked Project
              </h2>
              <div className="flex items-center justify-between">
                <div>
                  <button
                    onClick={() => onNavigateToProject?.(linkedProject.id)}
                    className="text-sm font-medium text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 hover:underline transition-colors"
                    style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                  >
                    {linkedProject.name}
                  </button>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                    {linkedProject.status} &middot; {linkedProject.stitchesWide} x {linkedProject.stitchesHigh} stitches
                  </p>
                </div>
                {hasDimensions && (
                  <div className="text-right">
                    <p className="text-xs text-stone-500 dark:text-stone-400" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                      Required at {fabric.count}ct
                    </p>
                    <p className="text-sm font-medium text-stone-700 dark:text-stone-300" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                      {((linkedProject.stitchesWide / fabric.count) + 6).toFixed(1)}" x {((linkedProject.stitchesHigh / fabric.count) + 6).toFixed(1)}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Size Calculator */}
          {hasDimensions && (
            <div className="mt-4 pt-8 border-t border-stone-200 dark:border-stone-800">
              <h2
                className="text-base font-bold text-stone-900 dark:text-stone-100 mb-4"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                Size Calculator
              </h2>

              {/* Usable stitching area */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="p-3 rounded-lg bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700">
                  <p className="text-xs text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-1" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                    Fabric Size
                  </p>
                  <p className="text-sm font-medium text-stone-900 dark:text-stone-100" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                    {fabric.shortestEdgeInches}" x {fabric.longestEdgeInches}"
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700">
                  <p className="text-xs text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-1" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                    Usable Area
                  </p>
                  <p className="text-sm font-medium text-stone-900 dark:text-stone-100" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                    {usableWidth > 0 ? `${usableWidth}" x ${usableHeight}"` : 'Too small'}
                  </p>
                  <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                    3" margin per edge
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700">
                  <p className="text-xs text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-1" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                    Max Stitches
                  </p>
                  <p className="text-sm font-medium text-stone-900 dark:text-stone-100" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                    {maxStitchesWide > 0 ? `${maxStitchesWide} x ${maxStitchesHigh}` : '—'}
                  </p>
                  <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                    at {fabric.count}ct
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900">
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                    Projects Fit
                  </p>
                  <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                    {fittingProjects.length} of {sizeFits.length}
                  </p>
                </div>
              </div>

              {/* Fitting projects table */}
              {fittingProjects.length > 0 ? (
                <>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mb-3" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                    Unassigned projects that fit on this fabric:
                  </p>
                  <div className="rounded-xl border border-stone-200 dark:border-stone-800 overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-stone-50 dark:bg-stone-800/50 border-b border-stone-200 dark:border-stone-800">
                          <th className="py-2 px-4 text-left text-xs uppercase tracking-wider font-semibold text-stone-400 dark:text-stone-500" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                            Project
                          </th>
                          <th className="py-2 px-4 text-left text-xs uppercase tracking-wider font-semibold text-stone-400 dark:text-stone-500" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                            Stitch Size
                          </th>
                          <th className="py-2 px-4 text-left text-xs uppercase tracking-wider font-semibold text-stone-400 dark:text-stone-500" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                            Required Fabric
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {fittingProjects.map(calc => (
                          <tr
                            key={calc.projectId}
                            className="border-b border-stone-100 dark:border-stone-800/60 last:border-0"
                          >
                            <td className="py-2.5 px-4">
                              <button
                                onClick={() => onNavigateToProject?.(calc.projectId)}
                                className="text-sm font-medium text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 hover:underline transition-colors"
                                style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                              >
                                {calc.projectName}
                              </button>
                            </td>
                            <td className="py-2.5 px-4">
                              <span className="text-sm text-stone-600 dark:text-stone-400" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                                {calc.stitchesWide} x {calc.stitchesHigh}
                              </span>
                            </td>
                            <td className="py-2.5 px-4">
                              <span className="text-sm text-stone-600 dark:text-stone-400" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                                {calc.requiredWidthInches.toFixed(1)}" x {calc.requiredHeightInches.toFixed(1)}"
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <p className="text-sm text-stone-400 dark:text-stone-500 italic" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                  No unassigned projects fit on this fabric at {fabric.count}ct.
                </p>
              )}
            </div>
          )}

          {/* Empty state for size calculator when no dimensions */}
          {!hasDimensions && (
            <div className="p-6 rounded-xl border border-dashed border-stone-300 dark:border-stone-700 text-center">
              <Ruler className="w-8 h-8 text-stone-300 dark:text-stone-600 mx-auto mb-2" />
              <p className="text-sm text-stone-500 dark:text-stone-400" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                Add dimensions to see which projects fit on this fabric
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── Metadata Field ─── */

function MetadataField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p
        className="text-xs text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-1"
        style={{ fontFamily: "'Source Sans 3', sans-serif" }}
      >
        {label}
      </p>
      <div>{children}</div>
    </div>
  )
}

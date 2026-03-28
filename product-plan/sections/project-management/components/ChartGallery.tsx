import { useState, useMemo } from 'react'
import type { ProjectManagementProps, FilterState, ViewMode, Project } from '../types'
import { FilterBar } from './FilterBar'
import { ChartCard } from './ChartCard'
import { ChartListRow } from './ChartListRow'
import { StatusBadge } from './StatusBadge'
import { Scissors } from 'lucide-react'

function formatNumber(n: number): string {
  return n.toLocaleString()
}

const emptyFilters: FilterState = {
  status: [],
  sizeCategory: [],
  designerId: null,
  genreId: null,
  seriesId: null,
}

export function ChartGallery({
  charts,
  projects,
  designers,
  genres,
  series,
  onViewChart,
  onFilterChange,
  onViewModeChange,
}: ProjectManagementProps) {
  const [filters, setFilters] = useState<FilterState>(emptyFilters)
  const [viewMode, setViewMode] = useState<ViewMode>('gallery')

  // Build lookup maps
  const projectByChartId = useMemo(() => {
    const map = new Map<string, Project>()
    projects.forEach((p) => map.set(p.chartId, p))
    return map
  }, [projects])

  const designerById = useMemo(() => {
    const map = new Map<string, (typeof designers)[0]>()
    designers.forEach((d) => map.set(d.id, d))
    return map
  }, [designers])

  const genreById = useMemo(() => {
    const map = new Map<string, (typeof genres)[0]>()
    genres.forEach((g) => map.set(g.id, g))
    return map
  }, [genres])

  const seriesById = useMemo(() => {
    const map = new Map<string, (typeof series)[0]>()
    series.forEach((s) => map.set(s.id, s))
    return map
  }, [series])

  // Filter charts
  const filteredCharts = useMemo(() => {
    return charts.filter((chart) => {
      const project = projectByChartId.get(chart.id)
      if (!project) return false

      if (filters.status.length > 0 && !filters.status.includes(project.status)) return false
      if (filters.sizeCategory.length > 0 && !filters.sizeCategory.includes(chart.sizeCategory)) return false
      if (filters.designerId && chart.designerId !== filters.designerId) return false
      if (filters.genreId && !chart.genres.includes(filters.genreId)) return false
      if (filters.seriesId && !chart.seriesIds.includes(filters.seriesId)) return false

      return true
    })
  }, [charts, filters, projectByChartId])

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters)
    onFilterChange?.(newFilters)
  }

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode)
    onViewModeChange?.(mode)
  }

  return (
    <div className="p-5 lg:p-8 max-w-7xl mx-auto">
      {/* Page header */}
      <div className="mb-6">
        <h1
          className="text-2xl font-semibold text-stone-900 dark:text-stone-100 mb-1"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          Charts
        </h1>
        <p
          className="text-sm text-stone-500 dark:text-stone-400"
          style={{ fontFamily: "'Source Sans 3', sans-serif" }}
        >
          Your pattern collection and project stash
        </p>
      </div>

      {/* Filter bar */}
      <div className="mb-6">
        <FilterBar
          designers={designers}
          genres={genres}
          filters={filters}
          viewMode={viewMode}
          totalCount={charts.length}
          filteredCount={filteredCharts.length}
          onFilterChange={handleFilterChange}
          onViewModeChange={handleViewModeChange}
        />
      </div>

      {/* Content */}
      {filteredCharts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center mb-4">
            <Scissors className="w-7 h-7 text-stone-300 dark:text-stone-600" strokeWidth={1.5} />
          </div>
          <p className="text-stone-500 dark:text-stone-400 text-sm mb-1" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
            No charts match your filters
          </p>
          <button
            onClick={() => handleFilterChange(emptyFilters)}
            className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline mt-1"
          >
            Clear all filters
          </button>
        </div>
      ) : viewMode === 'gallery' ? (
        /* Gallery view */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredCharts.map((chart) => {
            const project = projectByChartId.get(chart.id)!
            const designer = designerById.get(chart.designerId)
            const chartGenres = chart.genres.map((gId) => genreById.get(gId)).filter(Boolean) as (typeof genres)[number][]
            const chartSeries = chart.seriesIds.map((sId) => seriesById.get(sId)).filter(Boolean) as (typeof series)[number][]

            return (
              <ChartCard
                key={chart.id}
                chart={chart}
                project={project}
                designer={designer}
                genres={chartGenres}
                series={chartSeries}
                onView={() => onViewChart?.(chart.id)}
              />
            )
          })}
        </div>
      ) : viewMode === 'list' ? (
        /* List view */
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden">
          {filteredCharts.map((chart) => {
            const project = projectByChartId.get(chart.id)!
            const designer = designerById.get(chart.designerId)

            return (
              <ChartListRow
                key={chart.id}
                chart={chart}
                project={project}
                designer={designer}
                onView={() => onViewChart?.(chart.id)}
              />
            )
          })}
        </div>
      ) : (
        /* Table view */
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl overflow-x-auto">
          <table className="w-full text-sm" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
            <thead>
              <tr className="border-b border-stone-200 dark:border-stone-800">
                {['Chart', 'Designer', 'Stitches', 'Size', 'Status', 'Progress', 'Kitting'].map((header) => (
                  <th
                    key={header}
                    className="text-left px-4 py-3 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {filteredCharts.map((chart) => {
                const project = projectByChartId.get(chart.id)!
                const designer = designerById.get(chart.designerId)

                return (
                  <tr
                    key={chart.id}
                    onClick={() => onViewChart?.(chart.id)}
                    className="cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors group"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-stone-100 dark:bg-stone-800 overflow-hidden shrink-0">
                          {chart.coverImageUrl ? (
                            <img src={chart.coverImageUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Scissors className="w-3 h-3 text-stone-300 dark:text-stone-600" strokeWidth={1.5} />
                            </div>
                          )}
                        </div>
                        <span
                          className="font-medium text-stone-900 dark:text-stone-100 truncate max-w-[200px] group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors"
                          style={{ fontFamily: "'Fraunces', serif" }}
                        >
                          {chart.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-stone-600 dark:text-stone-400 truncate max-w-[150px]">
                      {designer?.name ?? '—'}
                    </td>
                    <td className="px-4 py-3" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      <span className="text-stone-700 dark:text-stone-300">
                        {formatNumber(chart.stitchCount)}
                        {chart.stitchCountApproximate && '~'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-400 dark:text-stone-500">
                        {chart.sizeCategory}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={project.status} />
                    </td>
                    <td className="px-4 py-3">
                      {project.progressPercent > 0 ? (
                        <div className="flex items-center gap-2 w-24">
                          <div className="flex-1 h-1.5 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 dark:bg-emerald-400 rounded-full"
                              style={{ width: `${project.progressPercent}%` }}
                            />
                          </div>
                          <span
                            className="text-[11px] text-stone-500 dark:text-stone-400"
                            style={{ fontFamily: "'JetBrains Mono', monospace" }}
                          >
                            {project.progressPercent}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-stone-300 dark:text-stone-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {project.kittingComplete ? (
                        <span className="text-emerald-600 dark:text-emerald-400 text-xs">Complete</span>
                      ) : (
                        <span className="text-amber-600 dark:text-amber-400 text-xs">
                          {project.kittingPercent}%
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

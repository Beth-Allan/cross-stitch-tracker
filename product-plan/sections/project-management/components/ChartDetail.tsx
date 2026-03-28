import { useState } from 'react'
import type {
  Chart, Project, ProjectStatus, Designer, Genre, Series, SALPart, Fabric, ChartDetailProps,
} from '../types'
import { StatusBadge } from './StatusBadge'
import {
  ArrowLeft, Pencil, Trash2, Check, Circle,
  FileText, Download, Upload, Plus, Package,
  Clock, LayoutDashboard, Scissors, Calendar,
  MapPin, Star, AlertTriangle, Image,
} from 'lucide-react'

/* ─── Helpers ─── */

function formatNumber(n: number): string {
  return n.toLocaleString()
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })
}

function formatDateShort(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

function formatFabric(fabric: Fabric): string {
  return `${fabric.name} / ${fabric.brand} / ${fabric.count}ct ${fabric.type}`
}

const statusGradients: Record<ProjectStatus, [string, string]> = {
  'Unstarted':   ['#e7e5e4', '#d6d3d1'],
  'Kitting':     ['#fef3c7', '#fde68a'],
  'Kitted':      ['#d1fae5', '#a7f3d0'],
  'In Progress': ['#e0f2fe', '#bae6fd'],
  'On Hold':     ['#ffedd5', '#fed7aa'],
  'Finished':    ['#ede9fe', '#ddd6fe'],
  'FFO':         ['#ffe4e6', '#fecdd3'],
}

/* ─── Internal Components ─── */

function InfoCard({ title, icon: Icon, children }: {
  title: string
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>
  children: React.ReactNode
}) {
  return (
    <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200/60 dark:border-stone-800 overflow-hidden">
      <div className="px-5 py-3.5 border-b border-stone-100 dark:border-stone-800 flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-stone-400 dark:text-stone-500" strokeWidth={1.5} />}
        <h3
          className="text-sm font-semibold text-stone-900 dark:text-stone-100"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          {title}
        </h3>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  )
}

function DetailRow({ label, value }: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between py-2.5 border-b border-stone-100 dark:border-stone-800/60 last:border-b-0 gap-4">
      <span
        className="text-xs text-stone-500 dark:text-stone-400 uppercase tracking-wider shrink-0"
        style={{ fontFamily: "'Source Sans 3', sans-serif" }}
      >
        {label}
      </span>
      <span
        className="text-sm text-stone-900 dark:text-stone-100 text-right"
        style={{ fontFamily: "'Source Sans 3', sans-serif" }}
      >
        {value}
      </span>
    </div>
  )
}

function FinishPhoto({ url, chartName }: { url: string | null; chartName: string }) {
  const [imgFailed, setImgFailed] = useState(false)
  const hasImage = !!url && !imgFailed

  return (
    <div className="mt-4 pt-4 border-t border-stone-100 dark:border-stone-800">
      <p
        className="text-xs text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2"
        style={{ fontFamily: "'Source Sans 3', sans-serif" }}
      >
        Finish Photo
      </p>
      <div className="rounded-lg overflow-hidden border border-stone-200/60 dark:border-stone-800">
        {hasImage ? (
          <img
            src={url!}
            alt={`Finished: ${chartName}`}
            className="w-full object-cover max-h-48"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div
            className="w-full h-32 flex flex-col items-center justify-center gap-2"
            style={{ background: 'linear-gradient(160deg, #ede9fe 0%, #ddd6fe 100%)' }}
          >
            <Image className="w-6 h-6 text-violet-300" strokeWidth={1.5} />
            <p className="text-xs text-violet-400">
              {url ? 'Photo unavailable' : 'No photo added yet'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Tab: Overview ─── */

function OverviewTab({ chart, project, designer, genres, series, fabric }: {
  chart: Chart
  project: Project
  designer?: Designer
  genres: Genre[]
  series: Series[]
  fabric?: Fabric
}) {
  const kittingItems = [
    { label: 'Digital working copy', complete: project.hasDigitalCopy },
    { label: 'Fabric assigned', complete: project.hasFabric },
    { label: 'All thread acquired', complete: project.allThreadFulfilled },
    { label: 'All beads acquired', complete: project.allBeadsFulfilled },
    { label: 'Specialty items', complete: project.allSpecialtyFulfilled },
    {
      label: project.needsOnionSkinning ? 'Onion skinning complete' : 'No onion skinning needed',
      complete: !project.needsOnionSkinning,
    },
  ]

  const patternFlags: string[] = []
  if (chart.isPaperChart) patternFlags.push('Paper chart')
  if (chart.isFormalKit) patternFlags.push('Formal kit')
  if (chart.isSAL) patternFlags.push(`SAL (${chart.salParts.length} parts)`)
  if (!chart.isPaperChart && !chart.isFormalKit && !chart.isSAL) patternFlags.push('Digital chart')

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Progress & Stitching — only for started projects */}
      {(project.status === 'In Progress' || project.status === 'On Hold' ||
        project.status === 'Finished' || project.status === 'FFO') && (
        <InfoCard title="Stitching Progress">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-2 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    project.status === 'Finished' ? 'bg-violet-500 dark:bg-violet-400' :
                    project.status === 'FFO' ? 'bg-rose-500 dark:bg-rose-400' :
                    'bg-sky-500 dark:bg-sky-400'
                  }`}
                  style={{ width: `${project.progressPercent}%` }}
                />
              </div>
              <span
                className="text-sm font-medium tabular-nums text-stone-700 dark:text-stone-300"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {project.progressPercent}%
              </span>
            </div>
            <DetailRow label="Completed" value={`${formatNumber(project.stitchesCompleted)} stitches`} />
            <DetailRow label="Remaining" value={`${formatNumber(project.stitchesRemaining)} stitches`} />
            {project.startingStitches > 0 && (
              <DetailRow label="Starting stitches" value={formatNumber(project.startingStitches)} />
            )}
            {project.lastSessionDate && (
              <DetailRow
                label="Last session"
                value={
                  <span>
                    {formatDate(project.lastSessionDate)}
                    {project.lastSessionStitches != null && (
                      <span className="text-stone-400 dark:text-stone-500">
                        {' '}&middot; {formatNumber(project.lastSessionStitches)} stitches
                      </span>
                    )}
                  </span>
                }
              />
            )}

            {/* Finish photo for completed projects */}
            {(project.status === 'Finished' || project.status === 'FFO') && (
              <FinishPhoto url={project.finishPhotoUrl} chartName={chart.name} />
            )}
          </div>
        </InfoCard>
      )}

      {/* Kitting Status */}
      <InfoCard title="Kitting Status">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-2 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 dark:bg-emerald-400 rounded-full transition-all"
                style={{ width: `${project.kittingPercent}%` }}
              />
            </div>
            <span
              className={`text-sm font-medium tabular-nums ${
                project.kittingComplete
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-amber-600 dark:text-amber-400'
              }`}
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {project.kittingPercent}%
            </span>
          </div>

          <div className="space-y-0.5">
            {kittingItems.map((item, i) => (
              <div key={i} className="flex items-center gap-2.5 py-1.5">
                {item.complete ? (
                  <div className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" strokeWidth={2.5} />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center shrink-0">
                    <Circle className="w-3 h-3 text-amber-500 dark:text-amber-400" strokeWidth={2} />
                  </div>
                )}
                <span
                  className={`text-sm ${
                    item.complete
                      ? 'text-stone-600 dark:text-stone-400'
                      : 'text-amber-700 dark:text-amber-400 font-medium'
                  }`}
                  style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          {project.kittingNeeds.length > 0 && (
            <div className="mt-3 pt-3 border-t border-stone-100 dark:border-stone-800">
              <p className="text-xs text-amber-700 dark:text-amber-400 font-medium mb-1">Still needs:</p>
              <p className="text-sm text-stone-600 dark:text-stone-400">{project.kittingNeeds.join(', ')}</p>
            </div>
          )}
        </div>
      </InfoCard>

      {/* Chart Details */}
      <InfoCard title="Chart Details" icon={Scissors}>
        <div>
          <DetailRow
            label="Stitch Count"
            value={
              <span>
                {formatNumber(chart.stitchCount)}
                {chart.stitchCountApproximate && (
                  <span className="text-stone-400 dark:text-stone-500"> (approx.)</span>
                )}
              </span>
            }
          />
          <DetailRow
            label="Dimensions"
            value={`${formatNumber(chart.stitchesWide)}w \u00d7 ${formatNumber(chart.stitchesHigh)}h`}
          />
          <DetailRow label="Size Category" value={chart.sizeCategory} />
          <DetailRow label="Pattern Type" value={patternFlags.join(', ')} />
          {chart.isFormalKit && chart.kitColorCount != null && (
            <DetailRow label="Kit Colours" value={chart.kitColorCount.toString()} />
          )}
          <DetailRow label="Designer" value={designer?.name ?? 'Unknown'} />
          {designer?.website && (
            <DetailRow
              label="Website"
              value={
                <a
                  href={designer.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  {designer.website.replace(/^https?:\/\//, '')}
                </a>
              }
            />
          )}
        </div>
      </InfoCard>

      {/* Project Setup */}
      <InfoCard title="Project Setup" icon={MapPin}>
        <div>
          <DetailRow label="Status" value={<StatusBadge status={project.status} />} />
          <DetailRow
            label="Fabric"
            value={
              fabric
                ? formatFabric(fabric)
                : project.fabricId
                  ? 'Assigned'
                  : <span className="text-amber-600 dark:text-amber-400">Not assigned</span>
            }
          />
          <DetailRow label="Storage Bin" value={project.projectBin ?? '\u2014'} />
          <DetailRow label="iPad App" value={project.ipadApp ?? '\u2014'} />
          <DetailRow
            label="Onion Skinning"
            value={project.needsOnionSkinning ? 'Needed' : 'Not needed'}
          />
        </div>
      </InfoCard>

      {/* Timeline */}
      <InfoCard title="Timeline" icon={Calendar}>
        <div>
          <DetailRow label="Added" value={formatDate(chart.dateAdded)} />
          <DetailRow label="Started" value={project.startDate ? formatDate(project.startDate) : '\u2014'} />
          <DetailRow label="Finished" value={project.finishDate ? formatDate(project.finishDate) : '\u2014'} />
          <DetailRow label="FFO" value={project.ffoDate ? formatDate(project.ffoDate) : '\u2014'} />
        </div>
      </InfoCard>

      {/* Goals — only show if there's something to display */}
      {(project.wantToStartNext || project.preferredStartSeason) && (
        <InfoCard title="Goals & Planning" icon={Star}>
          <div>
            {project.wantToStartNext && (
              <DetailRow
                label="Priority"
                value={
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium inline-flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Start next
                  </span>
                }
              />
            )}
            {project.preferredStartSeason && (
              <DetailRow label="Preferred Start" value={project.preferredStartSeason} />
            )}
          </div>
        </InfoCard>
      )}

      {/* Series — only show if chart belongs to a series */}
      {series.length > 0 && (
        <InfoCard title="Series" icon={Package}>
          <div>
            {series.map(s => (
              <div key={s.id} className="flex items-center justify-between py-2.5 border-b border-stone-100 dark:border-stone-800/60 last:border-b-0">
                <span
                  className="text-sm text-stone-900 dark:text-stone-100"
                  style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                >
                  {s.name}
                </span>
                <span className="text-xs text-stone-500 dark:text-stone-400">
                  {s.totalInSeries} in series
                </span>
              </div>
            ))}
          </div>
        </InfoCard>
      )}
    </div>
  )
}

/* ─── Tab: Supplies (placeholder) ─── */

function SuppliesTab() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-2xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center mb-4">
        <Package className="w-6 h-6 text-stone-300 dark:text-stone-600" strokeWidth={1.5} />
      </div>
      <p
        className="text-stone-500 dark:text-stone-400 text-sm mb-1"
        style={{ fontFamily: "'Source Sans 3', sans-serif" }}
      >
        Supply tracking coming in Section 2
      </p>
      <p className="text-xs text-stone-400 dark:text-stone-500">
        Thread, beads, and specialty items with per-project quantities
      </p>
    </div>
  )
}

/* ─── Tab: Sessions (placeholder) ─── */

function SessionsTab() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-2xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center mb-4">
        <Clock className="w-6 h-6 text-stone-300 dark:text-stone-600" strokeWidth={1.5} />
      </div>
      <p
        className="text-stone-500 dark:text-stone-400 text-sm mb-1"
        style={{ fontFamily: "'Source Sans 3', sans-serif" }}
      >
        Stitch session logging coming in Section 3
      </p>
      <p className="text-xs text-stone-400 dark:text-stone-500">
        Quick session logging with statistics and progress tracking
      </p>
    </div>
  )
}

/* ─── Tab: Files ─── */

function FilesTab({ chart, onAddSALPart }: {
  chart: Chart
  onAddSALPart?: (chartId: string, part: Partial<SALPart>) => void
}) {
  return (
    <div className="space-y-6">
      {/* Digital Working Copy */}
      <InfoCard title="Digital Working Copy" icon={FileText}>
        {chart.digitalWorkingCopyUrl ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center">
                <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
              </div>
              <div>
                <p
                  className="text-sm font-medium text-stone-900 dark:text-stone-100"
                  style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                >
                  {chart.name}.pdf
                </p>
                <p className="text-xs text-stone-400 dark:text-stone-500">Digital working copy</p>
              </div>
            </div>
            <button className="p-2 rounded-lg text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:text-emerald-400 dark:hover:bg-emerald-950/30 transition-colors">
              <Download className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center py-6 text-center">
            <p
              className="text-sm text-stone-500 dark:text-stone-400 mb-3"
              style={{ fontFamily: "'Source Sans 3', sans-serif" }}
            >
              No digital working copy uploaded
            </p>
            <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-950/50 transition-colors">
              <Upload className="w-4 h-4" />
              Upload file
            </button>
          </div>
        )}
      </InfoCard>

      {/* SAL Parts */}
      {chart.isSAL && (
        <InfoCard title={`SAL Parts (${chart.salParts.length})`} icon={Package}>
          {chart.salParts.length > 0 ? (
            <div>
              {chart.salParts.map(part => (
                <div
                  key={part.id}
                  className="flex items-center justify-between py-3 border-b border-stone-100 dark:border-stone-800/60 last:border-b-0"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                        part.fileUrl
                          ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
                          : 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400'
                      }`}
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      {part.partNumber}
                    </div>
                    <div>
                      <p
                        className="text-sm text-stone-900 dark:text-stone-100"
                        style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                      >
                        Part {part.partNumber}
                      </p>
                      <p className="text-xs text-stone-400 dark:text-stone-500">
                        Released {formatDateShort(part.dateReleased)}
                      </p>
                    </div>
                  </div>
                  {part.fileUrl ? (
                    <button className="p-2 rounded-lg text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:text-emerald-400 dark:hover:bg-emerald-950/30 transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                  ) : (
                    <span className="text-xs text-amber-600 dark:text-amber-400 font-medium px-2 py-1 bg-amber-50 dark:bg-amber-950/30 rounded">
                      Awaiting file
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-stone-500 dark:text-stone-400 py-4 text-center">
              No parts added yet
            </p>
          )}
          <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800">
            <button
              onClick={() => onAddSALPart?.(chart.id, {})}
              className="inline-flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add part
            </button>
          </div>
        </InfoCard>
      )}
    </div>
  )
}

/* ─── Main Component ─── */

const tabs = [
  { id: 'overview' as const, label: 'Overview', icon: LayoutDashboard },
  { id: 'supplies' as const, label: 'Supplies', icon: Package },
  { id: 'sessions' as const, label: 'Sessions', icon: Clock },
  { id: 'files' as const, label: 'Files', icon: FileText },
]

type TabId = (typeof tabs)[number]['id']

export function ChartDetail({
  chart,
  project,
  designer,
  genres,
  series,
  fabric,
  onBack,
  onEdit,
  onDelete,
  onUpdateStatus,
  onUploadFile,
  onAddSALPart,
}: ChartDetailProps) {
  const [activeTab, setActiveTab] = useState<TabId>('overview')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [imgFailed, setImgFailed] = useState(false)

  const hasRealImage = !!chart.coverImageUrl && !imgFailed
  const [gradFrom, gradTo] = statusGradients[project.status]

  const visibleGenres = genres.slice(0, 4)
  const extraGenres = genres.length - 4

  return (
    <div className="p-5 lg:p-8 max-w-5xl mx-auto">
      {/* ── Top bar: back + actions ── */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          <span style={{ fontFamily: "'Source Sans 3', sans-serif" }}>Charts</span>
        </button>

        <div className="flex items-center gap-2">
          {showDeleteConfirm ? (
            <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950/30 px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900">
              <span className="text-xs text-red-700 dark:text-red-400 font-medium">Delete this chart?</span>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="text-xs text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200 px-2 py-0.5 rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => { onDelete?.(chart.id); setShowDeleteConfirm(false) }}
                className="text-xs text-white bg-red-600 hover:bg-red-700 px-2 py-0.5 rounded font-medium"
              >
                Delete
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => onEdit?.(chart.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" />
                Edit
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-1.5 text-stone-400 hover:text-red-600 dark:text-stone-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Hero: cover image + key info ── */}
      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        {/* Cover image */}
        <div className="w-full lg:w-72 lg:shrink-0 aspect-[16/10] lg:aspect-[3/4] rounded-xl overflow-hidden relative border border-stone-200/60 dark:border-stone-800">
          {hasRealImage ? (
            <img
              src={chart.coverImageUrl!}
              alt={chart.name}
              className="w-full h-full object-cover"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ background: `linear-gradient(160deg, ${gradFrom} 0%, ${gradTo} 100%)` }}
            >
              <Scissors className="w-12 h-12 text-stone-400/20" strokeWidth={1} />
            </div>
          )}

          <div className="absolute top-3 left-3">
            <StatusBadge status={project.status} size="md" />
          </div>
          <div className="absolute top-3 right-3">
            <span className="text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full bg-white/85 dark:bg-stone-900/85 text-stone-600 dark:text-stone-300 backdrop-blur-sm">
              {chart.sizeCategory}
            </span>
          </div>

          {project.status === 'Kitted' && project.wantToStartNext && (
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-emerald-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              Up next
            </div>
          )}
        </div>

        {/* Key info */}
        <div className="flex-1 min-w-0">
          <h1
            className="text-2xl lg:text-3xl font-semibold text-stone-900 dark:text-stone-100 mb-2 leading-tight"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            {chart.name}
          </h1>

          <p
            className="text-base text-emerald-700 dark:text-emerald-400 mb-3"
            style={{ fontFamily: "'Source Sans 3', sans-serif" }}
          >
            {designer?.name ?? 'Unknown'}
            {series.length > 0 && (
              <span className="text-stone-400 dark:text-stone-500">
                {' '}&middot; {series.map(s => s.name).join(', ')} series
              </span>
            )}
          </p>

          <p
            className="text-sm text-stone-500 dark:text-stone-400 mb-4"
            style={{ fontFamily: "'Source Sans 3', sans-serif" }}
          >
            <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {formatNumber(chart.stitchCount)}
            </span>
            {' '}stitches{chart.stitchCountApproximate ? ' (approx.)' : ''}
            <span className="text-stone-300 dark:text-stone-600 mx-2">&middot;</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {formatNumber(chart.stitchesWide)}
            </span>
            w &times;{' '}
            <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {formatNumber(chart.stitchesHigh)}
            </span>
            h
          </p>

          {/* Genre tags */}
          {visibleGenres.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap mb-5">
              {visibleGenres.map(genre => (
                <span
                  key={genre.id}
                  className="text-xs px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400"
                >
                  {genre.name}
                </span>
              ))}
              {extraGenres > 0 && (
                <span className="text-xs px-2 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-500">
                  +{extraGenres}
                </span>
              )}
            </div>
          )}

          {/* Context-aware hero footer */}

          {/* WIP / On Hold — progress bar + stats */}
          {(project.status === 'In Progress' || project.status === 'On Hold') && (
            <div className="bg-stone-50 dark:bg-stone-800/50 rounded-lg px-4 py-3">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex-1 h-2 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sky-500 dark:bg-sky-400 rounded-full"
                    style={{ width: `${project.progressPercent}%` }}
                  />
                </div>
                <span
                  className="text-sm font-medium text-sky-600 dark:text-sky-400 tabular-nums"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {project.progressPercent}%
                </span>
              </div>
              <p
                className="text-xs text-stone-500 dark:text-stone-400"
                style={{ fontFamily: "'Source Sans 3', sans-serif" }}
              >
                {formatNumber(project.stitchesCompleted)} completed &middot; {formatNumber(project.stitchesRemaining)} remaining
                {project.lastSessionDate && (
                  <span className="text-stone-400 dark:text-stone-500">
                    {' '}&middot; Last stitched {formatDate(project.lastSessionDate)}
                  </span>
                )}
              </p>
            </div>
          )}

          {/* Finished / FFO */}
          {(project.status === 'Finished' || project.status === 'FFO') && (
            <div className="bg-stone-50 dark:bg-stone-800/50 rounded-lg px-4 py-3">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex-1 h-2 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full w-full ${
                    project.status === 'FFO' ? 'bg-rose-500 dark:bg-rose-400' : 'bg-violet-500 dark:bg-violet-400'
                  }`} />
                </div>
                <span
                  className={`text-sm font-medium tabular-nums ${
                    project.status === 'FFO'
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-violet-600 dark:text-violet-400'
                  }`}
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  100%
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {formatNumber(chart.stitchCount)} stitches
                {project.finishDate && ` \u00b7 Finished ${formatDate(project.finishDate)}`}
                {project.ffoDate && ` \u00b7 FFO ${formatDate(project.ffoDate)}`}
              </p>
            </div>
          )}

          {/* Kitting / Unstarted — kitting summary */}
          {(project.status === 'Kitting' || project.status === 'Unstarted') && project.kittingNeeds.length > 0 && (
            <div className="bg-amber-50/50 dark:bg-amber-950/20 rounded-lg px-4 py-3 border border-amber-200/40 dark:border-amber-900/30">
              <div className="flex items-center gap-2 mb-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                  Kitting {project.kittingPercent}%
                </span>
              </div>
              <p
                className="text-sm text-stone-600 dark:text-stone-400"
                style={{ fontFamily: "'Source Sans 3', sans-serif" }}
              >
                Needs: {project.kittingNeeds.join(', ')}
              </p>
            </div>
          )}

          {/* Kitted — ready indicator */}
          {project.status === 'Kitted' && !project.wantToStartNext && (
            <div className="bg-emerald-50/50 dark:bg-emerald-950/20 rounded-lg px-4 py-3 border border-emerald-200/40 dark:border-emerald-900/30">
              <p className="text-sm text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-2">
                <Check className="w-4 h-4" />
                Fully kitted and ready to stitch
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Tab bar ── */}
      <div className="border-b border-stone-200 dark:border-stone-800 mb-6">
        <nav className="flex gap-0.5 -mb-px overflow-x-auto">
          {tabs.map(tab => {
            const isActive = activeTab === tab.id
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'text-emerald-700 dark:text-emerald-400 border-emerald-600 dark:border-emerald-400'
                    : 'text-stone-500 dark:text-stone-400 border-transparent hover:text-stone-700 dark:hover:text-stone-300 hover:border-stone-300 dark:hover:border-stone-600'
                }`}
                style={{ fontFamily: "'Source Sans 3', sans-serif" }}
              >
                <Icon className="w-4 h-4" strokeWidth={1.5} />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* ── Tab content ── */}
      {activeTab === 'overview' && (
        <OverviewTab
          chart={chart}
          project={project}
          designer={designer}
          genres={genres}
          series={series}
          fabric={fabric}
        />
      )}
      {activeTab === 'supplies' && <SuppliesTab />}
      {activeTab === 'sessions' && <SessionsTab />}
      {activeTab === 'files' && (
        <FilesTab
          chart={chart}
          onAddSALPart={onAddSALPart}
        />
      )}
    </div>
  )
}

import { useState, useEffect } from 'react'
import type {
  Chart, Project, ProjectStatus, ChartFormProps,
} from '../types'
import {
  FormField, SectionHeading, Checkbox, SearchableSelect, GenrePicker,
  CoverImageUpload, StitchCountFields, PatternTypeFields, StartPreferenceFields,
  inputClass, selectClass, allStatuses, binOptions, appOptions, calculateSizeCategory,
} from './FormFields'
import { X } from 'lucide-react'

export function ChartFormModal({
  isOpen,
  chart,
  project,
  designers,
  genres,
  series,
  fabrics,
  onSave,
  onClose,
  onAddDesigner,
  onAddGenre,
  onAddSeries,
  onAddFabric,
}: ChartFormProps) {
  const isEditing = !!chart
  const [activeTab, setActiveTab] = useState<'basic' | 'details'>('basic')

  // Chart fields
  const [name, setName] = useState('')
  const [designerId, setDesignerId] = useState('')
  const [stitchCount, setStitchCount] = useState(0)
  const [stitchCountApproximate, setStitchCountApproximate] = useState(false)
  const [stitchesWide, setStitchesWide] = useState(0)
  const [stitchesHigh, setStitchesHigh] = useState(0)
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [selectedSeries, setSelectedSeries] = useState<string[]>([])
  const [isPaperChart, setIsPaperChart] = useState(false)
  const [isFormalKit, setIsFormalKit] = useState(false)
  const [kitColorCount, setKitColorCount] = useState<number | null>(null)
  const [isSAL, setIsSAL] = useState(false)

  // Project fields
  const [status, setStatus] = useState<ProjectStatus>('Unstarted')
  const [fabricId, setFabricId] = useState<string | null>(null)
  const [projectBin, setProjectBin] = useState<string | null>(null)
  const [ipadApp, setIpadApp] = useState<string | null>(null)
  const [needsOnionSkinning, setNeedsOnionSkinning] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [finishDate, setFinishDate] = useState('')
  const [ffoDate, setFfoDate] = useState('')
  const [wantToStartNext, setWantToStartNext] = useState(false)
  const [preferredStart, setPreferredStart] = useState<string | null>(null)

  useEffect(() => {
    if (chart) {
      setName(chart.name)
      setDesignerId(chart.designerId)
      setStitchCount(chart.stitchCount)
      setStitchCountApproximate(chart.stitchCountApproximate)
      setStitchesWide(chart.stitchesWide)
      setStitchesHigh(chart.stitchesHigh)
      setSelectedGenres(chart.genres)
      setSelectedSeries(chart.seriesIds)
      setIsPaperChart(chart.isPaperChart)
      setIsFormalKit(chart.isFormalKit)
      setKitColorCount(chart.kitColorCount)
      setIsSAL(chart.isSAL)
    }
    if (project) {
      setStatus(project.status)
      setFabricId(project.fabricId)
      setProjectBin(project.projectBin)
      setIpadApp(project.ipadApp)
      setNeedsOnionSkinning(project.needsOnionSkinning)
      setStartDate(project.startDate ?? '')
      setFinishDate(project.finishDate ?? '')
      setFfoDate(project.ffoDate ?? '')
      setWantToStartNext(project.wantToStartNext)
      setPreferredStart(project.preferredStartSeason)
    }
  }, [chart, project])

  function toggleGenre(genreId: string) {
    setSelectedGenres(prev =>
      prev.includes(genreId) ? prev.filter(id => id !== genreId) : [...prev, genreId]
    )
  }

  function handleSave() {
    const calculatedCount = stitchesWide > 0 && stitchesHigh > 0 ? stitchesWide * stitchesHigh : 0
    const effectiveCount = stitchCount > 0 ? stitchCount : calculatedCount
    const isAutoApprox = stitchCount === 0 && calculatedCount > 0

    onSave?.(
      {
        ...(chart ? { id: chart.id } : {}),
        name,
        designerId,
        stitchCount: effectiveCount,
        stitchCountApproximate: isAutoApprox || stitchCountApproximate,
        stitchesWide,
        stitchesHigh,
        sizeCategory: calculateSizeCategory(effectiveCount),
        genres: selectedGenres,
        seriesIds: selectedSeries,
        isPaperChart,
        isFormalKit,
        kitColorCount: isFormalKit ? kitColorCount : null,
        isSAL,
      },
      {
        ...(project ? { id: project.id } : {}),
        status,
        fabricId,
        projectBin,
        ipadApp,
        needsOnionSkinning,
        startDate: startDate || null,
        finishDate: finishDate || null,
        ffoDate: ffoDate || null,
        wantToStartNext,
        preferredStartSeason: preferredStart,
      }
    )
  }

  if (!isOpen) return null

  const designerOptions = designers.map(d => ({ value: d.id, label: d.name }))
  const fabricOptions = fabrics.map(f => ({
    value: f.id,
    label: `${f.name} / ${f.brand} / ${f.count}ct ${f.type}`,
  }))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white dark:bg-stone-900 rounded-2xl shadow-2xl dark:shadow-black/40 max-w-2xl w-full max-h-[90vh] flex flex-col border border-stone-200/60 dark:border-stone-800">
        {/* Header */}
        <div className="px-6 pt-5 pb-0 flex items-center justify-between">
          <h2
            className="text-lg font-semibold text-stone-900 dark:text-stone-100"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Edit Chart
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 mt-4 border-b border-stone-200 dark:border-stone-800">
          <nav className="flex gap-0.5 -mb-px">
            {[
              { id: 'basic' as const, label: 'Basic Info' },
              { id: 'details' as const, label: 'Details' },
            ].map(tab => (
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
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {activeTab === 'basic' ? (
            <div className="space-y-5">
              <FormField label="Chart Name">
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Enchanted Forest Sampler" className={inputClass} />
              </FormField>

              <FormField label="Designer">
                <SearchableSelect value={designerId} options={designerOptions} placeholder="Search or add a designer..." onSelect={setDesignerId} onAddNew={onAddDesigner} addNewLabel="Add designer" />
              </FormField>

              <FormField label="Cover Image">
                <CoverImageUpload />
              </FormField>

              <StitchCountFields
                stitchCount={stitchCount} stitchCountApproximate={stitchCountApproximate}
                stitchesWide={stitchesWide} stitchesHigh={stitchesHigh}
                onStitchCountChange={setStitchCount} onApproximateChange={setStitchCountApproximate}
                onWidthChange={setStitchesWide} onHeightChange={setStitchesHigh}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <FormField label="Status">
                <select value={status} onChange={e => setStatus(e.target.value as ProjectStatus)} className={selectClass}>
                  {allStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </FormField>

              <SectionHeading>Genre(s)</SectionHeading>
              <GenrePicker genres={genres} selectedIds={selectedGenres} onToggle={toggleGenre} onAddGenre={onAddGenre} />

              <FormField label="Series">
                <SearchableSelect
                  value={selectedSeries[0] ?? ''}
                  options={[
                    { value: '', label: 'None' },
                    ...series.map(s => ({ value: s.id, label: `${s.name} (${s.totalInSeries} in series)` })),
                  ]}
                  placeholder="Search or add a series..."
                  onSelect={v => setSelectedSeries(v ? [v] : [])}
                  onAddNew={onAddSeries}
                  addNewLabel="Add series"
                />
              </FormField>

              <SectionHeading>Pattern Type</SectionHeading>
              <PatternTypeFields isPaperChart={isPaperChart} isFormalKit={isFormalKit} isSAL={isSAL} kitColorCount={kitColorCount}
                onFormatChange={setIsPaperChart} onFormalKitChange={setIsFormalKit} onSALChange={setIsSAL} onKitColorCountChange={setKitColorCount} />

              <SectionHeading>Project Setup</SectionHeading>
              <FormField label="Fabric">
                <SearchableSelect value={fabricId ?? ''} options={[{ value: '', label: 'Not assigned' }, ...fabricOptions]} placeholder="Search fabrics..." onSelect={v => setFabricId(v || null)} onAddNew={onAddFabric ? () => onAddFabric() : undefined} addNewLabel="Add new fabric" />
              </FormField>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Project Bin">
                  <select value={projectBin ?? ''} onChange={e => setProjectBin(e.target.value || null)} className={selectClass}>
                    <option value="">None</option>
                    {binOptions.map(bin => <option key={bin} value={bin}>{bin}</option>)}
                  </select>
                </FormField>
                <FormField label="iPad App">
                  <select value={ipadApp ?? ''} onChange={e => setIpadApp(e.target.value || null)} className={selectClass}>
                    <option value="">None</option>
                    {appOptions.map(app => <option key={app} value={app}>{app}</option>)}
                  </select>
                </FormField>
              </div>

              <Checkbox checked={needsOnionSkinning} onChange={setNeedsOnionSkinning} label="Needs onion skinning" />

              <SectionHeading>Dates</SectionHeading>
              <div className="grid grid-cols-3 gap-4">
                <FormField label="Start Date"><input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={inputClass} /></FormField>
                <FormField label="Finish Date"><input type="date" value={finishDate} onChange={e => setFinishDate(e.target.value)} className={inputClass} /></FormField>
                <FormField label="FFO Date"><input type="date" value={ffoDate} onChange={e => setFfoDate(e.target.value)} className={inputClass} /></FormField>
              </div>

              <SectionHeading>Goals &amp; Planning</SectionHeading>
              <Checkbox checked={wantToStartNext} onChange={setWantToStartNext} label="Want to start next" />
              <FormField label="Preferred Start">
                <StartPreferenceFields value={preferredStart} onChange={setPreferredStart} />
              </FormField>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
            Cancel
          </button>
          <button onClick={handleSave} className="px-5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-lg transition-colors shadow-sm" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}

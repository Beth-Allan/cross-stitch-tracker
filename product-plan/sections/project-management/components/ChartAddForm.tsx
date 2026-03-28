import { useState } from 'react'
import type {
  Chart, Project, ProjectStatus, Designer, Genre, Series, Fabric, ChartAddFormProps,
} from '../types'
import {
  FormField, SectionHeading, Checkbox, SearchableSelect, GenrePicker,
  CoverImageUpload, StitchCountFields, PatternTypeFields, StartPreferenceFields,
  inputClass, selectClass, allStatuses, binOptions, appOptions, calculateSizeCategory,
} from './FormFields'
import { ArrowLeft } from 'lucide-react'

export function ChartAddForm({
  designers,
  genres,
  series,
  fabrics,
  onSave,
  onCancel,
  onAddDesigner,
  onAddGenre,
  onAddSeries,
  onAddFabric,
}: ChartAddFormProps) {
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

  const designerOptions = designers.map(d => ({ value: d.id, label: d.name }))
  const fabricOptions = fabrics.map(f => ({
    value: f.id,
    label: `${f.name} / ${f.brand} / ${f.count}ct ${f.type}`,
  }))

  return (
    <div className="p-5 lg:p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <button
            onClick={onCancel}
            className="inline-flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors group mb-2"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            <span style={{ fontFamily: "'Source Sans 3', sans-serif" }}>Charts</span>
          </button>
          <h1
            className="text-2xl font-semibold text-stone-900 dark:text-stone-100"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Add New Chart
          </h1>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-5">
        {/* ── Basic Info ── */}
        <SectionHeading>Basic Info</SectionHeading>

        <FormField label="Chart Name">
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Enchanted Forest Sampler"
            className={inputClass}
          />
        </FormField>

        <FormField label="Designer">
          <SearchableSelect
            value={designerId}
            options={designerOptions}
            placeholder="Search or add a designer..."
            onSelect={setDesignerId}
            onAddNew={onAddDesigner}
            addNewLabel="Add designer"
          />
        </FormField>

        <FormField label="Cover Image">
          <CoverImageUpload />
        </FormField>

        {/* ── Stitch Count & Dimensions ── */}
        <SectionHeading>Stitch Count &amp; Dimensions</SectionHeading>

        <StitchCountFields
          stitchCount={stitchCount}
          stitchCountApproximate={stitchCountApproximate}
          stitchesWide={stitchesWide}
          stitchesHigh={stitchesHigh}
          onStitchCountChange={setStitchCount}
          onApproximateChange={setStitchCountApproximate}
          onWidthChange={setStitchesWide}
          onHeightChange={setStitchesHigh}
        />

        {/* ── Genres ── */}
        <SectionHeading>Genre(s)</SectionHeading>

        <GenrePicker
          genres={genres}
          selectedIds={selectedGenres}
          onToggle={toggleGenre}
          onAddGenre={onAddGenre}
        />

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

        {/* ── Pattern Type ── */}
        <SectionHeading>Pattern Type</SectionHeading>

        <PatternTypeFields
          isPaperChart={isPaperChart}
          isFormalKit={isFormalKit}
          isSAL={isSAL}
          kitColorCount={kitColorCount}
          onFormatChange={setIsPaperChart}
          onFormalKitChange={setIsFormalKit}
          onSALChange={setIsSAL}
          onKitColorCountChange={setKitColorCount}
        />

        {/* ── Project Setup ── */}
        <SectionHeading>Project Setup</SectionHeading>

        <FormField label="Status">
          <select
            value={status}
            onChange={e => setStatus(e.target.value as ProjectStatus)}
            className={selectClass}
          >
            {allStatuses.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </FormField>

        <FormField label="Fabric">
          <SearchableSelect
            value={fabricId ?? ''}
            options={[{ value: '', label: 'Not assigned' }, ...fabricOptions]}
            placeholder="Search fabrics..."
            onSelect={v => setFabricId(v || null)}
            onAddNew={onAddFabric ? () => onAddFabric() : undefined}
            addNewLabel="Add new fabric"
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Project Bin">
            <select
              value={projectBin ?? ''}
              onChange={e => setProjectBin(e.target.value || null)}
              className={selectClass}
            >
              <option value="">None</option>
              {binOptions.map(bin => (
                <option key={bin} value={bin}>{bin}</option>
              ))}
            </select>
          </FormField>

          <FormField label="iPad App">
            <select
              value={ipadApp ?? ''}
              onChange={e => setIpadApp(e.target.value || null)}
              className={selectClass}
            >
              <option value="">None</option>
              {appOptions.map(app => (
                <option key={app} value={app}>{app}</option>
              ))}
            </select>
          </FormField>
        </div>

        <Checkbox
          checked={needsOnionSkinning}
          onChange={setNeedsOnionSkinning}
          label="Needs onion skinning"
        />

        {/* ── Dates ── */}
        <SectionHeading>Dates</SectionHeading>

        <div className="grid grid-cols-3 gap-4">
          <FormField label="Start Date">
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={inputClass} />
          </FormField>
          <FormField label="Finish Date">
            <input type="date" value={finishDate} onChange={e => setFinishDate(e.target.value)} className={inputClass} />
          </FormField>
          <FormField label="FFO Date">
            <input type="date" value={ffoDate} onChange={e => setFfoDate(e.target.value)} className={inputClass} />
          </FormField>
        </div>

        {/* ── Goals & Planning ── */}
        <SectionHeading>Goals &amp; Planning</SectionHeading>

        <Checkbox
          checked={wantToStartNext}
          onChange={setWantToStartNext}
          label="Want to start next"
        />

        <FormField label="Preferred Start">
          <StartPreferenceFields value={preferredStart} onChange={setPreferredStart} />
        </FormField>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-5 border-t border-stone-200 dark:border-stone-800 flex items-center justify-end gap-3">
        <button
          onClick={onCancel}
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
          Add Chart
        </button>
      </div>
    </div>
  )
}

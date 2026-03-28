import { useState, useEffect } from 'react'
import type { StitchSession, ActiveProject } from '../types'
import { X, Camera, ChevronDown, Plus, Search } from 'lucide-react'

const inputClass =
  'w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 dark:focus:border-emerald-500 transition-colors'

function todayString(): string {
  return new Date().toISOString().split('T')[0]
}

interface LogSessionModalProps {
  isOpen: boolean
  editSession?: StitchSession | null
  activeProjects: ActiveProject[]
  onSave?: (session: Partial<StitchSession>) => void
  onDelete?: (sessionId: string) => void
  onUploadPhoto?: (sessionId: string, file: File) => void
  onClose?: () => void
}

export function LogSessionModal({
  isOpen,
  editSession,
  activeProjects,
  onSave,
  onDelete,
  onUploadPhoto,
  onClose,
}: LogSessionModalProps) {
  const [date, setDate] = useState(todayString())
  const [projectId, setProjectId] = useState('')
  const [stitchCount, setStitchCount] = useState('')
  const [hours, setHours] = useState('')
  const [minutes, setMinutes] = useState('')
  const [projectSearch, setProjectSearch] = useState('')
  const [showProjectDropdown, setShowProjectDropdown] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const isEditing = !!editSession

  useEffect(() => {
    if (editSession) {
      setDate(editSession.date)
      setProjectId(editSession.projectId)
      setStitchCount(String(editSession.stitchCount))
      if (editSession.timeSpentMinutes != null) {
        setHours(String(Math.floor(editSession.timeSpentMinutes / 60)))
        setMinutes(String(editSession.timeSpentMinutes % 60))
      } else {
        setHours('')
        setMinutes('')
      }
    } else {
      setDate(todayString())
      setProjectId('')
      setStitchCount('')
      setHours('')
      setMinutes('')
    }
    setProjectSearch('')
    setShowDeleteConfirm(false)
  }, [editSession, isOpen])

  if (!isOpen) return null

  const selectedProject = activeProjects.find(p => p.id === projectId)
  const filteredProjects = activeProjects.filter(p =>
    p.chartName.toLowerCase().includes(projectSearch.toLowerCase())
  )

  const totalMinutes = (parseInt(hours) || 0) * 60 + (parseInt(minutes) || 0)

  const handleSave = () => {
    if (!projectId || !stitchCount) return
    onSave?.({
      ...(editSession ? { id: editSession.id } : {}),
      projectId,
      date,
      stitchCount: parseInt(stitchCount),
      timeSpentMinutes: totalMinutes > 0 ? totalMinutes : null,
    })
    onClose?.()
  }

  const handleDelete = () => {
    if (editSession) {
      onDelete?.(editSession.id)
      onClose?.()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-stone-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 border border-stone-200/60 dark:border-stone-800 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-stone-100 dark:border-stone-800">
          <h2
            className="text-lg font-semibold text-stone-900 dark:text-stone-100"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            {isEditing ? 'Edit Session' : 'Log Stitches'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-8 py-6 space-y-5">
          {/* Date */}
          <div>
            <label
              className="block text-xs text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1.5"
              style={{ fontFamily: "'Source Sans 3', sans-serif" }}
            >
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className={inputClass}
            />
            <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">Defaults to today. Change to backfill older sessions.</p>
          </div>

          {/* Project select */}
          <div className="relative">
            <label
              className="block text-xs text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1.5"
              style={{ fontFamily: "'Source Sans 3', sans-serif" }}
            >
              Project
            </label>
            <button
              type="button"
              onClick={() => setShowProjectDropdown(!showProjectDropdown)}
              className={`${inputClass} flex items-center justify-between text-left`}
            >
              <span className={selectedProject ? 'text-stone-900 dark:text-stone-100' : 'text-stone-400 dark:text-stone-500'}>
                {selectedProject?.chartName ?? 'Select a project...'}
              </span>
              <ChevronDown className="w-4 h-4 text-stone-400 shrink-0" />
            </button>

            {showProjectDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg shadow-xl z-10 max-h-56 overflow-hidden">
                <div className="p-2 border-b border-stone-100 dark:border-stone-700">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
                    <input
                      type="text"
                      placeholder="Search projects..."
                      value={projectSearch}
                      onChange={e => setProjectSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-sm bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-md text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
                      autoFocus
                    />
                  </div>
                </div>
                <div className="overflow-y-auto max-h-44">
                  {filteredProjects.map(project => (
                    <button
                      key={project.id}
                      onClick={() => {
                        setProjectId(project.id)
                        setShowProjectDropdown(false)
                        setProjectSearch('')
                      }}
                      className={`w-full text-left px-3 py-2.5 text-sm hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors flex items-center gap-3 ${
                        project.id === projectId ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : 'text-stone-700 dark:text-stone-300'
                      }`}
                      style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                    >
                      {/* Mini cover image */}
                      <div className="w-7 h-7 rounded bg-stone-100 dark:bg-stone-700 overflow-hidden shrink-0">
                        {project.coverImageUrl ? (
                          <img src={project.coverImageUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-stone-300 dark:text-stone-600 text-[9px]">?</div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{project.chartName}</p>
                        <p className="text-[11px] text-stone-400 dark:text-stone-500">
                          {project.progressPercent}% complete
                        </p>
                      </div>
                    </button>
                  ))}
                  {filteredProjects.length === 0 && (
                    <p className="px-3 py-4 text-sm text-stone-400 text-center">No matching projects</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Stitch count */}
          <div>
            <label
              className="block text-xs text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1.5"
              style={{ fontFamily: "'Source Sans 3', sans-serif" }}
            >
              Stitch Count
            </label>
            <input
              type="number"
              min="1"
              value={stitchCount}
              onChange={e => setStitchCount(e.target.value)}
              placeholder="e.g. 423"
              className={inputClass}
            />
            <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">Number of stitches completed this session</p>
          </div>

          {/* Time spent (optional) */}
          <div>
            <label
              className="block text-xs text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1.5"
              style={{ fontFamily: "'Source Sans 3', sans-serif" }}
            >
              Time Spent <span className="normal-case tracking-normal text-stone-300 dark:text-stone-600">(optional)</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                value={hours}
                onChange={e => setHours(e.target.value)}
                placeholder="0"
                className={`${inputClass} w-20 text-center`}
              />
              <span className="text-xs text-stone-400 dark:text-stone-500" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>hrs</span>
              <input
                type="number"
                min="0"
                max="59"
                value={minutes}
                onChange={e => setMinutes(e.target.value)}
                placeholder="0"
                className={`${inputClass} w-20 text-center`}
              />
              <span className="text-xs text-stone-400 dark:text-stone-500" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>min</span>
            </div>
          </div>

          {/* Photo upload (optional) */}
          <div>
            <label
              className="block text-xs text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1.5"
              style={{ fontFamily: "'Source Sans 3', sans-serif" }}
            >
              Progress Photo <span className="normal-case tracking-normal text-stone-300 dark:text-stone-600">(optional)</span>
            </label>
            {editSession?.photoUrl ? (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg overflow-hidden border border-stone-200 dark:border-stone-700">
                  <img src={editSession.photoUrl} alt="Session photo" className="w-full h-full object-cover" />
                </div>
                <button
                  className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
                  onClick={() => {
                    const input = document.createElement('input')
                    input.type = 'file'
                    input.accept = 'image/*'
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0]
                      if (file && editSession) onUploadPhoto?.(editSession.id, file)
                    }
                    input.click()
                  }}
                >
                  Replace photo
                </button>
              </div>
            ) : (
              <button
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-stone-300 dark:border-stone-600 text-sm text-stone-500 dark:text-stone-400 hover:border-emerald-400 dark:hover:border-emerald-600 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors w-full justify-center"
                onClick={() => {
                  const input = document.createElement('input')
                  input.type = 'file'
                  input.accept = 'image/*'
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0]
                    if (file && editSession) onUploadPhoto?.(editSession.id, file)
                  }
                  input.click()
                }}
              >
                <Camera className="w-4 h-4" />
                Add progress photo
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-8 py-5 border-t border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50 rounded-b-2xl">
          <div>
            {isEditing && !showDeleteConfirm && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="text-xs text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                style={{ fontFamily: "'Source Sans 3', sans-serif" }}
              >
                Delete session
              </button>
            )}
            {isEditing && showDeleteConfirm && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-red-500" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>Delete?</span>
                <button
                  onClick={handleDelete}
                  className="text-xs px-2 py-1 rounded bg-red-500 text-white hover:bg-red-600 transition-colors"
                >
                  Yes
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="text-xs px-2 py-1 rounded bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-300 dark:hover:bg-stone-600 transition-colors"
                >
                  No
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              style={{ fontFamily: "'Source Sans 3', sans-serif" }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!projectId || !stitchCount}
              className="px-5 py-2 rounded-lg text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
              style={{ fontFamily: "'Source Sans 3', sans-serif" }}
            >
              {isEditing ? 'Save Changes' : 'Log Stitches'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

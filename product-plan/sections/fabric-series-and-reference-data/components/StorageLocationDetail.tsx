import { useState, useRef, useEffect } from 'react'
import type {
  StorageLocationDetail as StorageLocationDetailType,
  StorageLocationProject,
  StorageLocationDetailProps,
} from '../types'
import {
  ArrowLeft, MapPin, Pencil, Trash2, Check, X, ChevronRight,
} from 'lucide-react'

/* ─── Status Badge ─── */

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    'In Progress': 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    'Finished': 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-700',
    'Kitting': 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    'Unstarted': 'bg-stone-50 dark:bg-stone-800/50 text-stone-500 dark:text-stone-400 border-stone-200 dark:border-stone-700',
  }

  return (
    <span
      className={`inline-flex text-xs font-medium px-2 py-0.5 rounded-full border ${styles[status] || styles['Unstarted']}`}
      style={{ fontFamily: "'Source Sans 3', sans-serif" }}
    >
      {status}
    </span>
  )
}

/* ─── Inline Name Editor ─── */

function InlineNameEdit({
  value,
  onSave,
  onCancel,
}: {
  value: string
  onSave: (name: string) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && name.trim()) {
      onSave(name.trim())
    } else if (e.key === 'Escape') {
      onCancel()
    }
  }

  return (
    <div className="flex items-center gap-2">
      <input
        ref={inputRef}
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={onCancel}
        className="text-2xl font-bold px-2 py-1 rounded-lg border border-emerald-400 dark:border-emerald-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
        style={{ fontFamily: "'Fraunces', serif" }}
      />
      <button
        onMouseDown={e => { e.preventDefault(); name.trim() && onSave(name.trim()) }}
        className="p-1.5 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors"
      >
        <Check className="w-4 h-4" />
      </button>
      <button
        onMouseDown={e => { e.preventDefault(); onCancel() }}
        className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

/* ─── Project Row ─── */

function ProjectRow({
  project,
  onNavigate,
}: {
  project: StorageLocationProject
  onNavigate?: () => void
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="flex items-center gap-4 px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm hover:shadow-md hover:border-stone-300 dark:hover:border-stone-700 transition-all cursor-pointer"
      onClick={onNavigate}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate"
          style={{ fontFamily: "'Source Sans 3', sans-serif" }}
        >
          {project.name}
        </p>
        {project.fabric && (
          <p
            className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 truncate"
            style={{ fontFamily: "'Source Sans 3', sans-serif" }}
          >
            {project.fabric.name} · {project.fabric.count}ct {project.fabric.type}
          </p>
        )}
        {!project.fabric && (
          <p
            className="text-xs text-stone-400 dark:text-stone-500 mt-0.5 italic"
            style={{ fontFamily: "'Source Sans 3', sans-serif" }}
          >
            No fabric assigned
          </p>
        )}
      </div>

      <StatusBadge status={project.status} />

      <ChevronRight className={`w-4 h-4 text-stone-300 dark:text-stone-600 shrink-0 transition-opacity ${hovered ? 'opacity-100' : 'opacity-0'}`} />
    </div>
  )
}

/* ─── Main Component ─── */

export function StorageLocationDetail({
  detail,
  onRenameLocation,
  onDeleteLocation,
  onNavigateToProject,
  onBack,
}: StorageLocationDetailProps) {
  const [editingName, setEditingName] = useState(false)
  const { location, projects } = detail

  return (
    <div>
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        {/* Back button */}
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors mb-4"
          style={{ fontFamily: "'Source Sans 3', sans-serif" }}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          All Locations
        </button>

        {/* Title row */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5 text-stone-400 dark:text-stone-500" />
            </div>
            {editingName ? (
              <InlineNameEdit
                value={location.name}
                onSave={(name) => { onRenameLocation?.(location.id, name); setEditingName(false) }}
                onCancel={() => setEditingName(false)}
              />
            ) : (
              <div>
                <h1
                  className="text-2xl font-bold text-stone-900 dark:text-stone-100"
                  style={{ fontFamily: "'Fraunces', serif" }}
                >
                  {location.name}
                </h1>
                <p
                  className="text-sm text-stone-500 dark:text-stone-400"
                  style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                >
                  {projects.length} {projects.length === 1 ? 'project' : 'projects'}
                </p>
              </div>
            )}
          </div>

          {!editingName && (
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => setEditingName(true)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  if (window.confirm(`Delete "${location.name}"? Projects in this location won't be deleted.`)) {
                    onDeleteLocation?.(location.id)
                  }
                }}
                className="p-1.5 rounded-lg text-stone-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Projects */}
      <div className="px-6 space-y-2">
        {projects.map(project => (
          <ProjectRow
            key={project.id}
            project={project}
            onNavigate={() => onNavigateToProject?.(project.id)}
          />
        ))}

        {projects.length === 0 && (
          <div className="py-16 text-center">
            <p
              className="text-sm text-stone-500 dark:text-stone-400 mb-1"
              style={{ fontFamily: "'Source Sans 3', sans-serif" }}
            >
              No projects in this location
            </p>
            <p
              className="text-xs text-stone-400 dark:text-stone-500"
              style={{ fontFamily: "'Source Sans 3', sans-serif" }}
            >
              Assign projects to this location from the project detail page
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

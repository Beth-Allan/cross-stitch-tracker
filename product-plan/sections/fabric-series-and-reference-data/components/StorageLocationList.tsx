import { useState, useRef, useEffect } from 'react'
import type {
  StorageLocation,
  StorageLocationListProps,
} from '../types'
import {
  Plus, Pencil, Trash2, MapPin, Check, X, ChevronRight,
} from 'lucide-react'

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
        className="px-2 py-1 rounded-md border border-emerald-400 dark:border-emerald-600 bg-white dark:bg-stone-800 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
        style={{ fontFamily: "'Source Sans 3', sans-serif" }}
      />
      <button
        onMouseDown={e => { e.preventDefault(); name.trim() && onSave(name.trim()) }}
        className="p-1 rounded text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors"
      >
        <Check className="w-3.5 h-3.5" />
      </button>
      <button
        onMouseDown={e => { e.preventDefault(); onCancel() }}
        className="p-1 rounded text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

/* ─── Add Location Inline ─── */

function AddLocationInline({ onAdd, onCancel }: { onAdd: (name: string) => void; onCancel: () => void }) {
  const [name, setName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && name.trim()) {
      onAdd(name.trim())
    } else if (e.key === 'Escape') {
      onCancel()
    }
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
      <MapPin className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
      <input
        ref={inputRef}
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={onCancel}
        placeholder="Location name, e.g. Bin A, Bookshelf 2..."
        className="flex-1 bg-transparent text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none"
        style={{ fontFamily: "'Source Sans 3', sans-serif" }}
      />
      <button
        onMouseDown={e => { e.preventDefault(); name.trim() && onAdd(name.trim()) }}
        disabled={!name.trim()}
        className="px-3 py-1 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ fontFamily: "'Source Sans 3', sans-serif" }}
      >
        Add
      </button>
    </div>
  )
}

/* ─── Location Row ─── */

function LocationRow({
  location,
  onView,
  onRename,
  onDelete,
}: {
  location: StorageLocation
  onView?: () => void
  onRename?: (name: string) => void
  onDelete?: () => void
}) {
  const [hovered, setHovered] = useState(false)
  const [editing, setEditing] = useState(false)

  if (editing) {
    return (
      <div className="px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
        <InlineNameEdit
          value={location.name}
          onSave={(name) => { onRename?.(name); setEditing(false) }}
          onCancel={() => setEditing(false)}
        />
      </div>
    )
  }

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm hover:shadow-md hover:border-stone-300 dark:hover:border-stone-700 transition-all cursor-pointer"
      onClick={onView}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-stone-800 flex items-center justify-center shrink-0">
        <MapPin className="w-4 h-4 text-stone-400 dark:text-stone-500" />
      </div>

      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate"
          style={{ fontFamily: "'Source Sans 3', sans-serif" }}
        >
          {location.name}
        </p>
        <p
          className="text-xs text-stone-500 dark:text-stone-400"
          style={{ fontFamily: "'Source Sans 3', sans-serif" }}
        >
          {location.projectCount} {location.projectCount === 1 ? 'project' : 'projects'}
        </p>
      </div>

      <div className={`flex items-center gap-1 shrink-0 transition-opacity ${hovered ? 'opacity-100' : 'opacity-0'}`}>
        <button
          onClick={e => { e.stopPropagation(); setEditing(true) }}
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

      <ChevronRight className={`w-4 h-4 text-stone-300 dark:text-stone-600 shrink-0 transition-opacity ${hovered ? 'opacity-100' : 'opacity-0'}`} />
    </div>
  )
}

/* ─── Main Component ─── */

export function StorageLocationList({
  locations,
  onAddLocation,
  onRenameLocation,
  onDeleteLocation,
  onViewLocation,
}: StorageLocationListProps) {
  const [adding, setAdding] = useState(false)

  return (
    <div>
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-5">
          <h1
            className="text-2xl font-bold text-stone-900 dark:text-stone-100"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Storage Locations
          </h1>
          <button
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white text-sm font-medium transition-colors shadow-sm"
            style={{ fontFamily: "'Source Sans 3', sans-serif" }}
          >
            <Plus className="w-4 h-4" />
            Add Location
          </button>
        </div>
      </div>

      {/* List */}
      <div className="px-6 space-y-2">
        {adding && (
          <AddLocationInline
            onAdd={(name) => { onAddLocation?.(name); setAdding(false) }}
            onCancel={() => setAdding(false)}
          />
        )}

        {locations.map(loc => (
          <LocationRow
            key={loc.id}
            location={loc}
            onView={() => onViewLocation?.(loc.id)}
            onRename={(name) => onRenameLocation?.(loc.id, name)}
            onDelete={() => {
              if (window.confirm(`Delete "${loc.name}"? Projects in this location won't be deleted.`)) {
                onDeleteLocation?.(loc.id)
              }
            }}
          />
        ))}

        {locations.length === 0 && !adding && (
          <div className="py-16 text-center">
            <MapPin className="w-8 h-8 text-stone-300 dark:text-stone-600 mx-auto mb-3" />
            <p
              className="text-sm text-stone-500 dark:text-stone-400 mb-1"
              style={{ fontFamily: "'Source Sans 3', sans-serif" }}
            >
              No storage locations yet
            </p>
            <p
              className="text-xs text-stone-400 dark:text-stone-500"
              style={{ fontFamily: "'Source Sans 3', sans-serif" }}
            >
              Add locations to organize where your projects and kits are stored
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import type { Designer } from '../types'
import { X } from 'lucide-react'

/* ─── Shared Styles ─── */

const inputClass =
  'w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 dark:focus:border-emerald-500 transition-colors'

const labelClass =
  'block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5'

/* ─── Types ─── */

export interface DesignerFormModalProps {
  isOpen: boolean
  designer?: Designer | null
  onSave?: (data: { name: string; website: string | null }) => void
  onClose: () => void
}

/* ─── Component ─── */

export function DesignerFormModal({
  isOpen,
  designer,
  onSave,
  onClose,
}: DesignerFormModalProps) {
  const isEditing = !!designer

  const [name, setName] = useState('')
  const [website, setWebsite] = useState('')

  useEffect(() => {
    if (designer) {
      setName(designer.name)
      setWebsite(designer.website || '')
    } else {
      setName('')
      setWebsite('')
    }
  }, [designer])

  if (!isOpen) return null

  function handleSave() {
    if (!name.trim()) return
    onSave?.({
      name: name.trim(),
      website: website.trim() || null,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-stone-200 dark:border-stone-800">
          <h2
            className="text-lg font-semibold text-stone-900 dark:text-stone-100"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            {isEditing ? 'Edit Designer' : 'Add Designer'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <div className="px-8 py-6 space-y-5">
          {/* Name */}
          <div>
            <label className={labelClass} style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Heaven and Earth Designs"
              className={inputClass}
              style={{ fontFamily: "'Source Sans 3', sans-serif" }}
              autoFocus
            />
          </div>

          {/* Website */}
          <div>
            <label className={labelClass} style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
              Website
            </label>
            <input
              type="url"
              value={website}
              onChange={e => setWebsite(e.target.value)}
              placeholder="https://example.com"
              className={inputClass}
              style={{ fontFamily: "'Source Sans 3', sans-serif" }}
            />
          </div>

          {/* Info note about computed fields */}
          <p
            className="text-xs text-stone-400 dark:text-stone-500"
            style={{ fontFamily: "'Source Sans 3', sans-serif" }}
          >
            Chart count, genre, and project stats are calculated automatically from your projects.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-8 py-5 border-t border-stone-200 dark:border-stone-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-stone-600 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 transition-colors rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800"
            style={{ fontFamily: "'Source Sans 3', sans-serif" }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 rounded-lg transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ fontFamily: "'Source Sans 3', sans-serif" }}
          >
            {isEditing ? 'Save Changes' : 'Add Designer'}
          </button>
        </div>
      </div>
    </div>
  )
}

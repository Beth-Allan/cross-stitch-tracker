"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface Genre {
  id: string;
  name: string;
}

interface GenrePickerProps {
  genres: Genre[];
  selectedIds: string[];
  onToggle: (genreId: string) => void;
  onAddGenre: (name: string) => Promise<void>;
}

export function GenrePicker({ genres, selectedIds, onToggle, onAddGenre }: GenrePickerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async () => {
    const trimmed = newName.trim();
    if (!trimmed || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAddGenre(trimmed);
      setNewName("");
      setIsAdding(false);
    } catch {
      // Keep input open on error so user can retry
      inputRef.current?.focus();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBlur = (e: React.FocusEvent) => {
    // Only cancel if focus moves outside the GenrePicker container
    if (containerRef.current && !containerRef.current.contains(e.relatedTarget as Node)) {
      setIsAdding(false);
      setNewName("");
    }
  };

  return (
    <div ref={containerRef} className="flex flex-wrap gap-2">
      {genres.map((genre) => {
        const selected = selectedIds.includes(genre.id);
        return (
          <button
            key={genre.id}
            type="button"
            onClick={() => onToggle(genre.id)}
            aria-pressed={selected}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs transition-colors",
              selected
                ? "border-primary/30 bg-primary/10 text-primary"
                : "border-border bg-muted text-muted-foreground hover:border-border/80",
            )}
          >
            {genre.name}
          </button>
        );
      })}
      {isAdding ? (
        <div className="flex items-center gap-1.5" onBlur={handleBlur}>
          <label htmlFor="new-genre" className="sr-only">
            New genre name
          </label>
          <input
            id="new-genre"
            ref={inputRef}
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void handleSubmit();
              }
              if (e.key === "Escape") {
                setIsAdding(false);
                setNewName("");
              }
            }}
            autoFocus
            placeholder="Genre name"
            disabled={isSubmitting}
            className="border-primary/30 bg-background focus:ring-ring w-40 rounded-full border px-3 py-1.5 text-xs focus:ring-2 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={isSubmitting || !newName.trim()}
            className="border-primary/30 text-primary hover:bg-primary/10 disabled:text-muted-foreground rounded-full border px-2.5 py-1.5 text-xs transition-colors disabled:opacity-50"
          >
            Add
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="border-border text-muted-foreground hover:border-primary/30 hover:text-primary rounded-full border border-dashed px-3 py-1.5 text-xs transition-colors"
        >
          + Add
        </button>
      )}
    </div>
  );
}

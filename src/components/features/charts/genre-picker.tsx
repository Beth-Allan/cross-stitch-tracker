"use client";

import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface GenrePickerProps {
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  genres: { id: string; name: string }[];
  onAddNew: () => void;
}

export function GenrePicker({
  selectedIds,
  onSelectionChange,
  genres,
  onAddNew,
}: GenrePickerProps) {
  function toggleGenre(genreId: string) {
    if (selectedIds.includes(genreId)) {
      onSelectionChange(selectedIds.filter((id) => id !== genreId));
    } else {
      onSelectionChange([...selectedIds, genreId]);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {genres.map((genre) => {
        const isSelected = selectedIds.includes(genre.id);
        return (
          <button
            key={genre.id}
            type="button"
            onClick={() => toggleGenre(genre.id)}
            className={cn(
              "cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition-colors",
              isSelected
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-stone-700",
            )}
            aria-pressed={isSelected}
          >
            {genre.name}
          </button>
        );
      })}
      <button
        type="button"
        onClick={onAddNew}
        className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-dashed border-stone-300 px-3 py-1 text-xs font-medium text-stone-500 transition-colors hover:border-emerald-400 hover:text-emerald-600 dark:border-stone-600 dark:text-stone-400 dark:hover:border-emerald-500 dark:hover:text-emerald-400"
      >
        <Plus className="size-3" />
        Add genre
      </button>
    </div>
  );
}

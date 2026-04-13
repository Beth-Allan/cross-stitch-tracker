import { SectionHeading } from "../form-primitives/section-heading";
import { GenrePicker } from "../form-primitives/genre-picker";
import { SearchableSelect } from "../form-primitives/searchable-select";
import { FormField } from "../form-primitives/form-field";
import type { Genre } from "@/generated/prisma/client";

interface GenreSectionProps {
  genres: Genre[];
  selectedIds: string[];
  onToggle: (genreId: string) => void;
  onAddGenre: (name: string) => Promise<void>;
}

export function GenreSection({ genres, selectedIds, onToggle, onAddGenre }: GenreSectionProps) {
  return (
    <div>
      <SectionHeading title="Genre(s)" />
      <div className="space-y-4">
        <GenrePicker
          genres={genres}
          selectedIds={selectedIds}
          onToggle={onToggle}
          onAddGenre={onAddGenre}
        />
        <FormField label="Series" hint="Coming soon">
          <SearchableSelect
            options={[]}
            value={null}
            onChange={() => {}}
            placeholder="Not available yet"
            disabled
          />
        </FormField>
      </div>
    </div>
  );
}
